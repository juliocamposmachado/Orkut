const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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
      // Buscar perfil do usuário ou de outro usuário
      const { userId } = req.query;
      const targetUserId = userId || decoded.userId;

      const profile = await db.get(`
        SELECT 
          u.id, u.name, u.username, u.email, u.created_at,
          p.photo_url, p.status, p.age, p.location, p.relationship_status,
          p.birthday, p.bio, p.profile_views, p.join_date, p.last_active,
          (SELECT COUNT(*) FROM friendships WHERE (requester_id = u.id OR addressee_id = u.id) AND status = 'accepted') as friends_count,
          (SELECT COUNT(*) FROM scraps WHERE to_user_id = u.id) as scraps_count
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ?
      `, [targetUserId]);

      if (!profile) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Incrementar visualizações se não for o próprio perfil
      if (targetUserId !== decoded.userId) {
        await db.run(
          'UPDATE profiles SET profile_views = profile_views + 1 WHERE user_id = ?',
          [targetUserId]
        );
        profile.profile_views = (profile.profile_views || 0) + 1;
      }

      res.status(200).json({
        success: true,
        data: {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          photo: profile.photo_url,
          status: profile.status,
          age: profile.age,
          location: profile.location || '',
          relationship: profile.relationship_status || '',
          birthday: profile.birthday || '',
          bio: profile.bio || '',
          profileViews: profile.profile_views || 0,
          friendsCount: profile.friends_count || 0,
          scrapsCount: profile.scraps_count || 0,
          joinDate: profile.join_date,
          lastActive: profile.last_active,
          createdAt: profile.created_at
        }
      });

    } else if (req.method === 'PUT') {
      // Atualizar perfil
      const { name, status, age, location, relationship, birthday, bio } = req.body;

      // Atualizar dados básicos do usuário
      if (name) {
        await db.run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), decoded.userId]);
      }

      // Atualizar dados do perfil
      await db.run(`
        UPDATE profiles SET 
          status = COALESCE(?, status),
          age = ?,
          location = COALESCE(?, location),
          relationship_status = COALESCE(?, relationship_status),
          birthday = COALESCE(?, birthday),
          bio = COALESCE(?, bio),
          last_active = datetime('now')
        WHERE user_id = ?
      `, [status, age, location, relationship, birthday, bio, decoded.userId]);

      // Buscar dados atualizados
      const updatedProfile = await db.get(`
        SELECT 
          u.id, u.name, u.username, u.email,
          p.photo_url, p.status, p.age, p.location, p.relationship_status,
          p.birthday, p.bio, p.profile_views, p.last_active
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ?
      `, [decoded.userId]);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: {
          id: updatedProfile.id,
          name: updatedProfile.name,
          username: updatedProfile.username,
          photo: updatedProfile.photo_url,
          status: updatedProfile.status,
          age: updatedProfile.age,
          location: updatedProfile.location || '',
          relationship: updatedProfile.relationship_status || '',
          birthday: updatedProfile.birthday || '',
          bio: updatedProfile.bio || '',
          profileViews: updatedProfile.profile_views || 0,
          lastActive: updatedProfile.last_active
        }
      });

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro na API de perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
