const { getDatabase } = require('./database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

// Função principal do endpoint
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();

    // GET - Listar posts (feed público ou do usuário)
    if (req.method === 'GET') {
      const { username, limit = 20, offset = 0 } = req.query;
      const limitNum = Math.min(parseInt(limit), 50); // Máximo 50 posts por vez
      const offsetNum = parseInt(offset) || 0;

      let query;
      let params;

      if (username) {
        // Posts de um usuário específico
        query = `
          SELECT 
            p.id,
            p.content,
            p.post_type,
            p.likes_count,
            p.comments_count,
            p.created_at,
            u.name as author_name,
            u.username as author_username,
            pr.photo_url as author_photo
          FROM posts p
          JOIN users u ON p.user_id = u.id
          LEFT JOIN profiles pr ON u.id = pr.user_id
          WHERE u.username = $1
          ORDER BY p.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        params = [username.toLowerCase(), limitNum, offsetNum];
      } else {
        // Feed geral (posts de todos os usuários)
        query = `
          SELECT 
            p.id,
            p.content,
            p.post_type,
            p.likes_count,
            p.comments_count,
            p.created_at,
            u.name as author_name,
            u.username as author_username,
            pr.photo_url as author_photo
          FROM posts p
          JOIN users u ON p.user_id = u.id
          LEFT JOIN profiles pr ON u.id = pr.user_id
          ORDER BY p.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        params = [limitNum, offsetNum];
      }

      const posts = await db.all(query, params);

      // Formatar posts
      const formattedPosts = posts.map(post => ({
        id: post.id,
        content: post.content,
        type: post.post_type,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        createdAt: post.created_at,
        author: {
          name: post.author_name,
          username: post.author_username,
          photo: post.author_photo || generateDefaultAvatar(post.author_name)
        }
      }));

      return res.status(200).json({
        success: true,
        posts: formattedPosts,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          hasMore: posts.length === limitNum
        }
      });
    }

    // POST - Criar novo post (requer autenticação)
    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          details: 'É necessário estar logado para criar posts'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Faça login novamente'
        });
      }

      const { content, post_type = 'status', community_id = null } = req.body;

      // Validações
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          error: 'Conteúdo obrigatório',
          details: 'O post deve ter algum conteúdo'
        });
      }

      if (content.length > 2000) {
        return res.status(400).json({
          error: 'Post muito longo',
          details: 'O post deve ter no máximo 2000 caracteres'
        });
      }

      if (!['status', 'photo', 'community_post'].includes(post_type)) {
        return res.status(400).json({
          error: 'Tipo de post inválido',
          details: 'Tipo deve ser: status, photo ou community_post'
        });
      }

      // Criar post
      const postId = await db.generateId();
      await db.run(`
        INSERT INTO posts (id, user_id, content, post_type, community_id, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [postId, decoded.userId, content.trim(), post_type, community_id]);

      // Buscar post criado com dados do autor
      const newPost = await db.get(`
        SELECT 
          p.id,
          p.content,
          p.post_type,
          p.likes_count,
          p.comments_count,
          p.created_at,
          u.name as author_name,
          u.username as author_username,
          pr.photo_url as author_photo
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN profiles pr ON u.id = pr.user_id
        WHERE p.id = $1
      `, [postId]);

      return res.status(201).json({
        success: true,
        message: 'Post criado com sucesso!',
        post: {
          id: newPost.id,
          content: newPost.content,
          type: newPost.post_type,
          likes: newPost.likes_count || 0,
          comments: newPost.comments_count || 0,
          createdAt: newPost.created_at,
          author: {
            name: newPost.author_name,
            username: newPost.author_username,
            photo: newPost.author_photo || generateDefaultAvatar(newPost.author_name)
          }
        }
      });
    }

    // PUT - Atualizar post (requer autenticação)
    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { postId } = req.query;
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          details: 'É necessário estar logado para editar posts'
        });
      }

      if (!postId) {
        return res.status(400).json({
          error: 'ID do post não fornecido',
          details: 'É necessário especificar qual post editar'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Faça login novamente'
        });
      }

      // Verificar se o post existe e pertence ao usuário
      const existingPost = await db.get(
        'SELECT user_id FROM posts WHERE id = $1',
        [postId]
      );

      if (!existingPost) {
        return res.status(404).json({
          error: 'Post não encontrado',
          details: 'O post especificado não existe'
        });
      }

      if (existingPost.user_id !== decoded.userId) {
        return res.status(403).json({
          error: 'Sem permissão',
          details: 'Você só pode editar seus próprios posts'
        });
      }

      const { content } = req.body;

      // Validações
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          error: 'Conteúdo obrigatório',
          details: 'O post deve ter algum conteúdo'
        });
      }

      if (content.length > 2000) {
        return res.status(400).json({
          error: 'Post muito longo',
          details: 'O post deve ter no máximo 2000 caracteres'
        });
      }

      // Atualizar post
      await db.run(
        'UPDATE posts SET content = $1 WHERE id = $2',
        [content.trim(), postId]
      );

      return res.status(200).json({
        success: true,
        message: 'Post atualizado com sucesso!'
      });
    }

    // DELETE - Excluir post (requer autenticação)
    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { postId } = req.query;
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          details: 'É necessário estar logado para excluir posts'
        });
      }

      if (!postId) {
        return res.status(400).json({
          error: 'ID do post não fornecido',
          details: 'É necessário especificar qual post excluir'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Faça login novamente'
        });
      }

      // Verificar se o post existe e pertence ao usuário
      const existingPost = await db.get(
        'SELECT user_id FROM posts WHERE id = $1',
        [postId]
      );

      if (!existingPost) {
        return res.status(404).json({
          error: 'Post não encontrado',
          details: 'O post especificado não existe'
        });
      }

      if (existingPost.user_id !== decoded.userId) {
        return res.status(403).json({
          error: 'Sem permissão',
          details: 'Você só pode excluir seus próprios posts'
        });
      }

      // Excluir post (cascata excluirá likes e comentários)
      await db.run('DELETE FROM posts WHERE id = $1', [postId]);

      return res.status(200).json({
        success: true,
        message: 'Post excluído com sucesso!'
      });
    }

    return res.status(405).json({
      error: 'Método não permitido',
      details: 'Este endpoint aceita GET, POST, PUT e DELETE'
    });

  } catch (error) {
    console.error('Erro no endpoint de posts:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: 'Não foi possível processar a solicitação'
    });
  }
}

// Função para gerar avatar padrão
function generateDefaultAvatar(name) {
  const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['a855c7', '28a745', 'ff6bb3', '5bc0de', 'ffc107', 'dc3545', '6f42c1', 'fd7e14', 'e83e8c', '20c997'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://via.placeholder.com/150x150/${randomColor}/ffffff?text=${firstLetter}`;
}
