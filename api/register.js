const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';
const SALT_ROUNDS = 12;

// Cliente Supabase
const supabaseUrl = 'https://ksskokjrdzqghhuahjpl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4';
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Verificar se o email já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        details: 'Este email já está sendo usado por outro usuário'
      });
    }

    // Gerar username único
    const username = await generateUniqueUsername(name);

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Criar usuário
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        username: username
      })
      .select()
      .single();

    if (userError) {
      console.error('Erro ao criar usuário:', userError);
      
      if (userError.message.includes('duplicate key value')) {
        return res.status(409).json({
          error: 'Email ou username já existe',
          details: 'Tente com outros dados'
        });
      }
      
      throw userError;
    }

    // Criar perfil
    const defaultPhotoUrl = generateDefaultAvatar(name);
    
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.id,
        photo_url: photo || defaultPhotoUrl,
        status: 'Novo no Orkut Retrô! 🎉',
        profile_views: 0
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se falhou ao criar perfil, remove o usuário criado
      await supabase.from('users').delete().eq('id', newUser.id);
      throw profileError;
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        username: newUser.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Buscar dados completos do usuário criado
    const userData = await getUserCompleteData(newUser.id);

    // Log da criação
    console.log(`Novo usuário criado: ${email} (${username}) - ID: ${newUser.id}`);

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
    
    let errorMessage = 'Não foi possível criar o usuário. Tente novamente.';
    let statusCode = 500;
    
    if (error?.message?.includes('duplicate key value')) {
      errorMessage = 'Email ou username já existem';
      statusCode = 409;
    } else if (error?.message?.includes('invalid input syntax')) {
      errorMessage = 'Dados fornecidos são inválidos';
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: 'Erro interno do servidor',
      details: errorMessage
    });
  }
}

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para gerar username único
async function generateUniqueUsername(name) {
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
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

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
async function getUserCompleteData(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      profiles(*)
    `)
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('Usuário não encontrado após criação');
  }

  // Buscar estatísticas
  const { count: friendsCount } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');

  const { count: scrapsCount } = await supabase
    .from('scraps')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId);

  const profile = user.profiles || {};

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    photo: profile.photo_url,
    status: profile.status,
    age: profile.age,
    location: profile.location || '',
    relationship: profile.relationship_status || '',
    birthday: profile.birthday || '',
    bio: profile.bio || '',
    profileViews: profile.profile_views || 0,
    friendsCount: friendsCount || 0,
    scrapsCount: scrapsCount || 0,
    joinDate: profile.join_date || user.created_at,
    lastActive: profile.last_active || user.created_at,
    createdAt: user.created_at
  };
}
