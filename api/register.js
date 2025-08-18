const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('./database');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';
const SALT_ROUNDS = 12;

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
    const { name, email, password, photo } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        details: 'Nome, email e senha são obrigatórios'
      });
    }

    // Validar email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        details: 'Por favor, forneça um email válido'
      });
    }

    // Validar senha
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha muito fraca',
        details: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Validar nome
    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'Nome inválido',
        details: 'O nome deve ter pelo menos 2 caracteres'
      });
    }

    // Conectar ao banco de dados
    const db = await getDatabase();

    // Verificar se o email já existe
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        details: 'Este email já está sendo usado por outro usuário'
      });
    }

    // Gerar username único
    const username = await generateUniqueUsername(db, name);

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Criar usuário
    const userId = db.generateId();
    await db.run(
      'INSERT INTO users (id, name, email, password_hash, username) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), email.toLowerCase(), passwordHash, username]
    );

    // Criar perfil
    const profileId = db.generateId();
    const defaultPhotoUrl = generateDefaultAvatar(name);
    
    await db.run(
      `INSERT INTO profiles (
        id, user_id, photo_url, status, profile_views, join_date, last_active
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        profileId, 
        userId, 
        photo || defaultPhotoUrl,
        'Novo no Orkut Retrô! 🎉',
        0
      ]
    );

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId, 
        email: email.toLowerCase(),
        username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Buscar dados completos do usuário criado
    const userData = await getUserCompleteData(db, userId);

    // Log da criação (para desenvolvimento)
    console.log(`Novo usuário criado: ${email} (${username})`);

    // Retornar sucesso
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: 'Não foi possível criar o usuário. Tente novamente.'
    });
  }
}

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para gerar username único
async function generateUniqueUsername(db, name) {
  // Limpar nome e criar base do username
  let baseUsername = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais por _
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, '') // Remove underscores do início e fim
    .substring(0, 15); // Limita a 15 caracteres

  if (!baseUsername) {
    baseUsername = 'user';
  }

  // Verificar se o username base está disponível
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingUsername = await db.get(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (!existingUsername) {
      break; // Username disponível
    }

    // Tentar próximo número
    username = baseUsername + counter;
    counter++;

    // Evitar loop infinito
    if (counter > 9999) {
      username = baseUsername + '_' + Date.now().toString(36);
      break;
    }
  }

  return username;
}

// Função para gerar avatar padrão
function generateDefaultAvatar(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = ['a855c7', '28a745', 'ff6bb3', '5bc0de', 'ffc107', 'dc3545', '6f42c1', 'fd7e14', 'e83e8c', '20c997'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://via.placeholder.com/150x150/${randomColor}/ffffff?text=${firstLetter}`;
}

// Função para buscar dados completos do usuário
async function getUserCompleteData(db, userId) {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
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
      (SELECT COUNT(*) FROM friendships WHERE (requester_id = u.id OR addressee_id = u.id) AND status = 'accepted') as friends_count,
      (SELECT COUNT(*) FROM scraps WHERE to_user_id = u.id) as scraps_count
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `;

  const user = await db.get(query, [userId]);
  
  if (!user) {
    throw new Error('Usuário não encontrado após criação');
  }

  return {
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
    friendsCount: user.friends_count || 0,
    scrapsCount: user.scraps_count || 0,
    joinDate: user.join_date,
    lastActive: user.last_active,
    createdAt: user.created_at
  };
}
