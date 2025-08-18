const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
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

    const { q: query, type = 'users', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Termo de busca deve ter pelo menos 2 caracteres' 
      });
    }

    const db = await getDatabase();

    if (type === 'users') {
      // Buscar usuários
      const searchTerm = `%${query}%`;
      
      const users = await db.all(`
        SELECT 
          u.id, u.name, u.username, u.email,
          p.photo_url, p.status, p.location, p.age,
          (SELECT COUNT(*) FROM friendships WHERE 
            ((requester_id = u.id OR addressee_id = u.id) AND status = 'accepted')
          ) as friends_count,
          (SELECT f.status FROM friendships f WHERE 
            ((f.requester_id = ? AND f.addressee_id = u.id) OR 
             (f.requester_id = u.id AND f.addressee_id = ?))
          ) as friendship_status,
          (SELECT f.id FROM friendships f WHERE 
            ((f.requester_id = ? AND f.addressee_id = u.id) OR 
             (f.requester_id = u.id AND f.addressee_id = ?))
          ) as friendship_id
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id != ? 
        AND (u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)
        ORDER BY 
          CASE 
            WHEN u.name LIKE ? THEN 1
            WHEN u.username LIKE ? THEN 2
            ELSE 3
          END,
          u.name
        LIMIT ? OFFSET ?
      `, [
        decoded.userId, decoded.userId, decoded.userId, decoded.userId, // friendship checks
        decoded.userId, // exclude self
        searchTerm, searchTerm, searchTerm, // search conditions
        `${query}%`, `${query}%`, // priority ordering
        limit, offset
      ]);

      // Contar total de resultados
      const totalResult = await db.get(`
        SELECT COUNT(*) as total
        FROM users u
        WHERE u.id != ? 
        AND (u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)
      `, [decoded.userId, searchTerm, searchTerm, searchTerm]);

      res.status(200).json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            photo: user.photo_url,
            status: user.status,
            location: user.location,
            age: user.age,
            friendsCount: user.friends_count || 0,
            friendshipStatus: user.friendship_status || null,
            friendshipId: user.friendship_id || null,
            canAddFriend: !user.friendship_status
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult.total,
            pages: Math.ceil(totalResult.total / limit)
          }
        }
      });

    } else if (type === 'communities') {
      // Buscar comunidades
      const searchTerm = `%${query}%`;
      
      const communities = await db.all(`
        SELECT 
          c.id, c.name, c.description, c.category, c.members_count, c.image_url,
          c.created_at,
          u.name as creator_name,
          (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = ?) as is_member
        FROM communities c
        JOIN users u ON c.creator_id = u.id
        WHERE c.name LIKE ? OR c.description LIKE ? OR c.category LIKE ?
        ORDER BY 
          CASE 
            WHEN c.name LIKE ? THEN 1
            WHEN c.description LIKE ? THEN 2
            ELSE 3
          END,
          c.members_count DESC
        LIMIT ? OFFSET ?
      `, [
        decoded.userId,
        searchTerm, searchTerm, searchTerm,
        `${query}%`, `${query}%`,
        limit, offset
      ]);

      // Contar total de comunidades
      const totalResult = await db.get(`
        SELECT COUNT(*) as total
        FROM communities c
        WHERE c.name LIKE ? OR c.description LIKE ? OR c.category LIKE ?
      `, [searchTerm, searchTerm, searchTerm]);

      res.status(200).json({
        success: true,
        data: {
          communities: communities.map(community => ({
            id: community.id,
            name: community.name,
            description: community.description,
            category: community.category,
            membersCount: community.members_count || 0,
            imageUrl: community.image_url,
            createdAt: community.created_at,
            creatorName: community.creator_name,
            isMember: community.is_member > 0
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult.total,
            pages: Math.ceil(totalResult.total / limit)
          }
        }
      });

    } else {
      return res.status(400).json({ 
        error: 'Tipo de busca inválido. Use "users" ou "communities"' 
      });
    }

  } catch (error) {
    console.error('Erro na API de busca:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
