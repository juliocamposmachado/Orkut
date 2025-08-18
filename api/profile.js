const { getDatabase } = require('./database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

// Função principal do endpoint
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();

    // GET - Buscar perfil por username
    if (req.method === 'GET') {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({
          error: 'Username não fornecido',
          details: 'É necessário fornecer um username para buscar o perfil'
        });
      }

      // Buscar perfil completo
      const profileData = await db.get(`
        SELECT 
          u.id,
          u.name,
          u.username,
          u.created_at,
          p.photo_url,
          p.status,
          p.age,
          p.location,
          p.relationship_status,
          p.birthday,
          p.bio,
          p.profile_views,
          p.join_date,
          p.last_active,
          (SELECT COUNT(*) FROM friendships 
           WHERE (requester_id = u.id OR addressee_id = u.id) 
           AND status = 'accepted') as friends_count,
          (SELECT COUNT(*) FROM scraps WHERE to_user_id = u.id) as scraps_count,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.username = $1
      `, [username.toLowerCase()]);

      if (!profileData) {
        return res.status(404).json({
          error: 'Perfil não encontrado',
          details: 'Nenhum usuário encontrado com este username'
        });
      }

      // Incrementar visualizações do perfil
      await db.run(
        'UPDATE profiles SET profile_views = profile_views + 1 WHERE user_id = $1',
        [profileData.id]
      );

      // Buscar posts recentes do usuário (últimos 10)
      const recentPosts = await db.all(`
        SELECT 
          id,
          content,
          post_type,
          likes_count,
          comments_count,
          created_at
        FROM posts 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10
      `, [profileData.id]);

      // Buscar scraps recentes (últimos 5)
      const recentScraps = await db.all(`
        SELECT 
          s.id,
          s.content,
          s.created_at,
          u.name as from_name,
          u.username as from_username,
          p.photo_url as from_photo
        FROM scraps s
        JOIN users u ON s.from_user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE s.to_user_id = $1 AND s.is_public = true
        ORDER BY s.created_at DESC 
        LIMIT 5
      `, [profileData.id]);

      // Formatar resposta
      const profile = {
        id: profileData.id,
        name: profileData.name,
        username: profileData.username,
        photo: profileData.photo_url || generateDefaultAvatar(profileData.name),
        status: profileData.status || '',
        age: profileData.age || null,
        location: profileData.location || '',
        relationship: profileData.relationship_status || '',
        birthday: profileData.birthday || '',
        bio: profileData.bio || '',
        profileViews: (profileData.profile_views || 0) + 1,
        friendsCount: profileData.friends_count || 0,
        scrapsCount: profileData.scraps_count || 0,
        postsCount: profileData.posts_count || 0,
        joinDate: profileData.join_date,
        lastActive: profileData.last_active,
        createdAt: profileData.created_at,
        recentPosts,
        recentScraps
      };

      return res.status(200).json({
        success: true,
        profile
      });
    }

    // POST - Criar/Atualizar perfil (requer autenticação)
    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          details: 'É necessário estar logado para atualizar o perfil'
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

      const {
        photo_url,
        status,
        age,
        location,
        relationship_status,
        birthday,
        bio
      } = req.body;

      // Validações
      if (age && (age < 13 || age > 120)) {
        return res.status(400).json({
          error: 'Idade inválida',
          details: 'A idade deve estar entre 13 e 120 anos'
        });
      }

      if (bio && bio.length > 1000) {
        return res.status(400).json({
          error: 'Bio muito longa',
          details: 'A biografia deve ter no máximo 1000 caracteres'
        });
      }

      // Atualizar perfil
      await db.run(`
        UPDATE profiles SET 
          photo_url = COALESCE($1, photo_url),
          status = COALESCE($2, status),
          age = $3,
          location = COALESCE($4, location),
          relationship_status = COALESCE($5, relationship_status),
          birthday = $6,
          bio = COALESCE($7, bio),
          last_active = CURRENT_TIMESTAMP
        WHERE user_id = $8
      `, [
        photo_url,
        status,
        age,
        location,
        relationship_status,
        birthday,
        bio,
        decoded.userId
      ]);

      // Buscar perfil atualizado
      const updatedProfile = await db.get(`
        SELECT 
          u.name,
          u.username,
          p.photo_url,
          p.status,
          p.age,
          p.location,
          p.relationship_status,
          p.birthday,
          p.bio,
          p.profile_views,
          p.join_date,
          p.last_active
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `, [decoded.userId]);

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        profile: updatedProfile
      });
    }

    return res.status(405).json({
      error: 'Método não permitido',
      details: 'Este endpoint aceita apenas GET e POST'
    });

  } catch (error) {
    console.error('Erro no endpoint de perfil:', error);
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
