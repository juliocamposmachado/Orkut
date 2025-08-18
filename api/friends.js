const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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
      const { type = 'friends', userId, page = 1, limit = 20 } = req.query;
      const targetUserId = userId || decoded.userId;
      const offset = (page - 1) * limit;

      let query, params;

      switch (type) {
        case 'friends':
          // Listar amigos aceitos
          query = `
            SELECT 
              u.id, u.name, u.username,
              p.photo_url, p.status, p.location, p.last_active,
              f.created_at as friendship_date,
              CASE WHEN p.last_active > datetime('now', '-5 minutes') THEN 1 ELSE 0 END as is_online
            FROM friendships f
            JOIN users u ON (
              CASE 
                WHEN f.requester_id = ? THEN u.id = f.addressee_id
                ELSE u.id = f.requester_id
              END
            )
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE (f.requester_id = ? OR f.addressee_id = ?) 
            AND f.status = 'accepted'
            ORDER BY p.last_active DESC, u.name
            LIMIT ? OFFSET ?
          `;
          params = [targetUserId, targetUserId, targetUserId, limit, offset];
          break;

        case 'requests_received':
          // Solicitações recebidas
          query = `
            SELECT 
              u.id, u.name, u.username,
              p.photo_url, p.status, p.location,
              f.id as request_id, f.created_at as request_date
            FROM friendships f
            JOIN users u ON f.requester_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE f.addressee_id = ? AND f.status = 'pending'
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
          `;
          params = [decoded.userId, limit, offset];
          break;

        case 'requests_sent':
          // Solicitações enviadas
          query = `
            SELECT 
              u.id, u.name, u.username,
              p.photo_url, p.status, p.location,
              f.id as request_id, f.created_at as request_date
            FROM friendships f
            JOIN users u ON f.addressee_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE f.requester_id = ? AND f.status = 'pending'
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
          `;
          params = [decoded.userId, limit, offset];
          break;

        case 'suggestions':
          // Sugestões de amizade
          query = `
            SELECT 
              u.id, u.name, u.username,
              p.photo_url, p.status, p.location,
              (SELECT COUNT(*) FROM friendships WHERE 
                ((requester_id = u.id OR addressee_id = u.id) AND status = 'accepted')
              ) as mutual_friends_count
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id != ? 
            AND u.id NOT IN (
              SELECT CASE 
                WHEN requester_id = ? THEN addressee_id 
                ELSE requester_id 
              END
              FROM friendships 
              WHERE (requester_id = ? OR addressee_id = ?)
            )
            ORDER BY mutual_friends_count DESC, RANDOM()
            LIMIT ?
          `;
          params = [decoded.userId, decoded.userId, decoded.userId, decoded.userId, limit];
          break;

        default:
          return res.status(400).json({ error: 'Tipo inválido' });
      }

      const results = await db.all(query, params);

      // Contar total para paginação (exceto sugestões)
      let total = 0;
      if (type !== 'suggestions') {
        let countQuery;
        let countParams;

        switch (type) {
          case 'friends':
            countQuery = 'SELECT COUNT(*) as total FROM friendships WHERE (requester_id = ? OR addressee_id = ?) AND status = "accepted"';
            countParams = [targetUserId, targetUserId];
            break;
          case 'requests_received':
            countQuery = 'SELECT COUNT(*) as total FROM friendships WHERE addressee_id = ? AND status = "pending"';
            countParams = [decoded.userId];
            break;
          case 'requests_sent':
            countQuery = 'SELECT COUNT(*) as total FROM friendships WHERE requester_id = ? AND status = "pending"';
            countParams = [decoded.userId];
            break;
        }

        const countResult = await db.get(countQuery, countParams);
        total = countResult.total;
      }

      res.status(200).json({
        success: true,
        data: {
          [type]: results.map(item => ({
            id: item.id,
            name: item.name,
            username: item.username,
            photo: item.photo_url,
            status: item.status,
            location: item.location,
            lastActive: item.last_active,
            isOnline: item.is_online || false,
            friendshipDate: item.friendship_date,
            requestId: item.request_id,
            requestDate: item.request_date,
            mutualFriendsCount: item.mutual_friends_count || 0
          })),
          pagination: type !== 'suggestions' ? {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          } : undefined
        }
      });

    } else if (req.method === 'POST') {
      // Enviar solicitação de amizade
      const { userId: targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      if (targetUserId === decoded.userId) {
        return res.status(400).json({ error: 'Você não pode adicionar a si mesmo' });
      }

      // Verificar se o usuário existe
      const targetUser = await db.get('SELECT id, name FROM users WHERE id = ?', [targetUserId]);
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se já existe uma solicitação ou amizade
      const existingFriendship = await db.get(`
        SELECT * FROM friendships 
        WHERE (requester_id = ? AND addressee_id = ?) 
           OR (requester_id = ? AND addressee_id = ?)
      `, [decoded.userId, targetUserId, targetUserId, decoded.userId]);

      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          return res.status(400).json({ error: 'Vocês já são amigos' });
        } else {
          return res.status(400).json({ error: 'Solicitação já enviada' });
        }
      }

      // Criar solicitação de amizade
      const friendshipId = db.generateId();
      await db.run(`
        INSERT INTO friendships (id, requester_id, addressee_id, status)
        VALUES (?, ?, ?, 'pending')
      `, [friendshipId, decoded.userId, targetUserId]);

      res.status(201).json({
        success: true,
        message: `Solicitação de amizade enviada para ${targetUser.name}!`
      });

    } else if (req.method === 'PUT') {
      // Aceitar ou rejeitar solicitação de amizade
      const { requestId, action } = req.body;

      if (!requestId || !action) {
        return res.status(400).json({ error: 'ID da solicitação e ação são obrigatórios' });
      }

      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Ação deve ser "accept" ou "reject"' });
      }

      // Verificar se a solicitação existe e é para o usuário atual
      const friendship = await db.get(`
        SELECT f.*, u.name as requester_name
        FROM friendships f
        JOIN users u ON f.requester_id = u.id
        WHERE f.id = ? AND f.addressee_id = ? AND f.status = 'pending'
      `, [requestId, decoded.userId]);

      if (!friendship) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      if (action === 'accept') {
        await db.run('UPDATE friendships SET status = "accepted", updated_at = datetime("now") WHERE id = ?', [requestId]);
        res.status(200).json({
          success: true,
          message: `Você e ${friendship.requester_name} agora são amigos!`
        });
      } else {
        await db.run('DELETE FROM friendships WHERE id = ?', [requestId]);
        res.status(200).json({
          success: true,
          message: 'Solicitação rejeitada'
        });
      }

    } else if (req.method === 'DELETE') {
      // Remover amizade ou cancelar solicitação
      const { userId: targetUserId } = req.query;

      if (!targetUserId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      const friendship = await db.get(`
        SELECT f.*, 
               CASE WHEN f.requester_id = ? THEN u2.name ELSE u1.name END as friend_name
        FROM friendships f
        JOIN users u1 ON f.requester_id = u1.id
        JOIN users u2 ON f.addressee_id = u2.id
        WHERE (f.requester_id = ? AND f.addressee_id = ?) 
           OR (f.requester_id = ? AND f.addressee_id = ?)
      `, [decoded.userId, decoded.userId, targetUserId, targetUserId, decoded.userId]);

      if (!friendship) {
        return res.status(404).json({ error: 'Amizade não encontrada' });
      }

      await db.run('DELETE FROM friendships WHERE id = ?', [friendship.id]);

      const action = friendship.status === 'accepted' ? 'removida' : 'cancelada';
      res.status(200).json({
        success: true,
        message: `Amizade com ${friendship.friend_name} foi ${action}`
      });

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro na API de amigos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
