const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verificar token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const db = await getDatabase();

    if (req.method === 'GET') {
      // Listar scraps de um usuário
      const { userId, page = 1, limit = 10 } = req.query;
      const targetUserId = userId || decoded.userId;
      const offset = (page - 1) * limit;

      const scraps = await db.all(`
        SELECT 
          s.id, s.content, s.created_at, s.is_public,
          u.id as author_id, u.name as author_name, u.username as author_username,
          p.photo_url as author_photo
        FROM scraps s
        JOIN users u ON s.from_user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE s.to_user_id = ? AND s.is_public = 1
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
      `, [targetUserId, limit, offset]);

      // Contar total de scraps
      const totalResult = await db.get(
        'SELECT COUNT(*) as total FROM scraps WHERE to_user_id = ? AND is_public = 1',
        [targetUserId]
      );

      res.status(200).json({
        success: true,
        data: {
          scraps: scraps.map(scrap => ({
            id: scrap.id,
            content: scrap.content,
            createdAt: scrap.created_at,
            isPublic: scrap.is_public,
            author: {
              id: scrap.author_id,
              name: scrap.author_name,
              username: scrap.author_username,
              photo: scrap.author_photo
            }
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult.total,
            pages: Math.ceil(totalResult.total / limit)
          }
        }
      });

    } else if (req.method === 'POST') {
      // Enviar novo scrap
      const { toUserId, content, isPublic = true } = req.body;

      if (!toUserId || !content) {
        return res.status(400).json({ error: 'Destinatário e conteúdo são obrigatórios' });
      }

      if (content.length > 1000) {
        return res.status(400).json({ error: 'Conteúdo muito longo (máximo 1000 caracteres)' });
      }

      // Verificar se o destinatário existe
      const targetUser = await db.get('SELECT id FROM users WHERE id = ?', [toUserId]);
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário destinatário não encontrado' });
      }

      // Inserir scrap
      const scrapId = db.generateId();
      await db.run(`
        INSERT INTO scraps (id, from_user_id, to_user_id, content, is_public)
        VALUES (?, ?, ?, ?, ?)
      `, [scrapId, decoded.userId, toUserId, content.trim(), isPublic ? 1 : 0]);

      // Buscar dados do scrap criado
      const newScrap = await db.get(`
        SELECT 
          s.id, s.content, s.created_at, s.is_public,
          u.id as author_id, u.name as author_name, u.username as author_username,
          p.photo_url as author_photo
        FROM scraps s
        JOIN users u ON s.from_user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE s.id = ?
      `, [scrapId]);

      res.status(201).json({
        success: true,
        message: 'Scrap enviado com sucesso!',
        data: {
          id: newScrap.id,
          content: newScrap.content,
          createdAt: newScrap.created_at,
          isPublic: newScrap.is_public,
          author: {
            id: newScrap.author_id,
            name: newScrap.author_name,
            username: newScrap.author_username,
            photo: newScrap.author_photo
          }
        }
      });

    } else if (req.method === 'DELETE') {
      // Excluir scrap
      const { scrapId } = req.query;

      if (!scrapId) {
        return res.status(400).json({ error: 'ID do scrap é obrigatório' });
      }

      // Verificar se o scrap existe e pertence ao usuário (autor ou destinatário)
      const scrap = await db.get(`
        SELECT * FROM scraps 
        WHERE id = ? AND (from_user_id = ? OR to_user_id = ?)
      `, [scrapId, decoded.userId, decoded.userId]);

      if (!scrap) {
        return res.status(404).json({ 
          error: 'Scrap não encontrado ou você não tem permissão para excluí-lo' 
        });
      }

      // Excluir scrap
      await db.run('DELETE FROM scraps WHERE id = ?', [scrapId]);

      res.status(200).json({
        success: true,
        message: 'Scrap excluído com sucesso!'
      });

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro na API de scraps:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
