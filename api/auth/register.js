// API de Registro Real - Supabase Integration
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
    const { 
      username, 
      email, 
      password, 
      name,
      bio,
      location,
      birth_date
    } = req.body;
    
    // Validação básica
    if (!username || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, senha e nome são obrigatórios'
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Validar username (apenas letras, números, underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        error: 'Username deve ter 3-20 caracteres (letras, números, underscore)'
      });
    }

    // Validar senha forte
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Log da tentativa
    console.log('📝 Tentativa de registro:', { 
      username, 
      email, 
      name,
      timestamp: new Date().toISOString()
    });

    // Verificar se email ou username já existem
    const existingUserResult = await pool.query(
      'SELECT email, username FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUserResult.rows.length > 0) {
      const existing = existingUserResult.rows[0];
      if (existing.email === email) {
        return res.status(409).json({
          success: false,
          error: 'Este email já está cadastrado'
        });
      }
      if (existing.username === username) {
        return res.status(409).json({
          success: false,
          error: 'Este username já está sendo usado'
        });
      }
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Gerar ID único
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Iniciar transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Inserir usuário
      const userInsertResult = await client.query(`
        INSERT INTO users (
          id, username, email, password_hash, name, 
          created_at, updated_at, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, 
          NOW(), NOW(), true
        ) RETURNING *
      `, [userId, username, email, passwordHash, name]);

      const newUser = userInsertResult.rows[0];

      // Inserir perfil
      await client.query(`
        INSERT INTO profiles (
          user_id, bio, status, location, birth_date,
          photo_url, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, 
          '/images/orkutblack.png', NOW(), NOW()
        )
      `, [
        userId, 
        bio || 'Novo usuário do Orkut 2025! 💜',
        'Acabei de chegar no novo Orkut!', 
        location || '', 
        birth_date || null
      ]);

      // Commit da transação
      await client.query('COMMIT');

      // Gerar JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Dados do usuário para retornar
      const userData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.created_at,
        profile: {
          bio: bio || 'Novo usuário do Orkut 2025! 💜',
          status: 'Acabei de chegar no novo Orkut!',
          location: location || '',
          photo_url: '/images/orkutblack.png',
          birth_date: birth_date || null
        }
      };

      // Log de sucesso
      console.log('✅ Registro bem-sucedido:', {
        userId: newUser.id,
        username: newUser.username,
        timestamp: new Date().toISOString()
      });

      return res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso! Bem-vindo ao Orkut 2025!',
        user: userData,
        token: token,
        expiresIn: '7d'
      });

    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    
    // Tratar erros específicos do PostgreSQL
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({
        success: false,
        error: 'Email ou username já cadastrado'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Função para gerar username sugerido caso o escolhido já exista
export async function generateSuggestedUsername(baseUsername) {
  try {
    const suggestions = [];
    for (let i = 1; i <= 5; i++) {
      const suggestion = `${baseUsername}${i}`;
      const result = await pool.query(
        'SELECT username FROM users WHERE username = $1',
        [suggestion]
      );
      
      if (result.rows.length === 0) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return [];
  }
}
