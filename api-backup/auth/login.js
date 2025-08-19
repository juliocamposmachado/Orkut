// API de Login Real - Supabase Integration
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Secret para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'orkut2025_super_secret_key';

export default async function handler(req, res) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    });
  }

  try {
    const { email, password, username } = req.body;
    
    // Validação básica
    if (!password || (!email && !username)) {
      return res.status(400).json({
        success: false,
        error: 'Email/username e senha são obrigatórios'
      });
    }

    // Log da tentativa
    console.log('🔐 Tentativa de login:', { 
      email: email || 'N/A', 
      username: username || 'N/A',
      timestamp: new Date().toISOString()
    });

    // Buscar usuário no banco
    let userQuery;
    let queryParams;
    
    if (email) {
      userQuery = 'SELECT * FROM users WHERE email = $1';
      queryParams = [email];
    } else {
      userQuery = 'SELECT * FROM users WHERE username = $1';
      queryParams = [username];
    }

    const userResult = await pool.query(userQuery, queryParams);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = userResult.rows[0];
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Senha incorreta'
      });
    }

    // Atualizar último login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Buscar dados do perfil
    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [user.id]
    );

    const profile = profileResult.rows[0] || {};

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Dados do usuário para retornar (sem senha)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      last_login: user.last_login,
      profile: {
        bio: profile.bio || '',
        status: profile.status || 'Novo no Orkut 2025!',
        location: profile.location || '',
        photo_url: profile.photo_url || '/images/orkutblack.png',
        birth_date: profile.birth_date,
        website: profile.website || ''
      }
    };

    // Log de sucesso
    console.log('✅ Login bem-sucedido:', {
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    });

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      token: token,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Função auxiliar para validar JWT (exportar para uso em outras APIs)
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware para verificar autenticação
export function requireAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação necessário'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Adicionar dados do usuário ao request
    req.user = decoded;
    return handler(req, res);
  };
}
