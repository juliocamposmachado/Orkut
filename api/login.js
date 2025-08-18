const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

// Função principal do endpoint
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, password, rememberMe } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        details: 'Email e senha são obrigatórios'
      });
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        details: 'Por favor, forneça um email válido'
      });
    }

    // Conectar ao banco de dados
    const db = await getDatabase();

    // Buscar usuário pelo email
    const user = await db.get(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.username,
        u.password_hash,
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
        p.last_active
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.email = ?`,
      [email.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        details: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Em um sistema real, você implementaria aqui o controle de tentativas de login
      return res.status(401).json({
        error: 'Credenciais inválidas',
        details: 'Email ou senha incorretos'
      });
    }

    // Atualizar última atividade
    await db.run(
      'UPDATE profiles SET last_active = datetime("now") WHERE user_id = ?',
      [user.id]
    );

    // Buscar estatísticas do usuário
    const [friendsCount, scrapsCount, fansCount] = await Promise.all([
      db.get(
        'SELECT COUNT(*) as count FROM friendships WHERE (requester_id = ? OR addressee_id = ?) AND status = "accepted"',
        [user.id, user.id]
      ),
      db.get(
        'SELECT COUNT(*) as count FROM scraps WHERE to_user_id = ?',
        [user.id]
      ),
      db.get(
        'SELECT COUNT(*) as count FROM friendships WHERE addressee_id = ? AND status = "pending"',
        [user.id]
      )
    ]);

    // Gerar token JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    // Preparar dados do usuário para retorno
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      photo: user.photo_url,
      status: user.status,
      age: user.age,
      location: user.location || '',
      relationship: user.relationship_status || '',
      birthday: user.birthday || '',
      bio: user.bio || '',
      profileViews: user.profile_views || 0,
      friendsCount: friendsCount.count || 0,
      fansCount: fansCount.count || 0,
      scrapsCount: scrapsCount.count || 0,
      joinDate: user.join_date,
      lastActive: user.last_active,
      createdAt: user.created_at
    };

    // Log do login (para desenvolvimento)
    console.log(`Login realizado: ${user.email} (${user.username})`);

    // Retornar sucesso
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: 'Não foi possível realizar o login. Tente novamente.'
    });
  }
}

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
