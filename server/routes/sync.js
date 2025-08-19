const { Router } = require('express');
const { Pool } = require('pg');

const router = Router();

const connectionString = process.env.DATABASE_URL;
if(!connectionString){
  console.warn('DATABASE_URL não definida. Operando em modo somente localStorage.');
}

// Configuração SSL inteligente para Supabase
function getSSLConfig() {
  if (!connectionString) return null;
  
  const fs = require('fs');
  const path = require('path');
  
  // Tenta usar certificado personalizado se existir
  const certPath = path.join(__dirname, '..', '..', 'certs', 'prod-ca-2021.crt');
  if (fs.existsSync(certPath)) {
    console.log('Usando certificado SSL personalizado:', certPath);
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString()
    };
  }
  
  // Fallback para configuração padrão Supabase
  console.log('Usando SSL padrão (rejectUnauthorized: false)');
  return { rejectUnauthorized: false };
}

const pool = connectionString ? new Pool({
  connectionString,
  ssl: getSSLConfig()
}) : null;

// Schema mínimo (executar manualmente no banco):
// CREATE TABLE IF NOT EXISTS users (id text primary key);
// CREATE TABLE IF NOT EXISTS profiles (user_id text primary key references users(id), name text, bio text, updated_at timestamptz default now());
// CREATE TABLE IF NOT EXISTS statuses (id bigserial primary key, user_id text references users(id), text text, created_at timestamptz default now());

router.post('/sync', async (req, res)=>{
  const { userId, type, payload } = req.body || {};
  if(!userId || !type) return res.status(400).send('userId e type são obrigatórios');

  if(!pool){
    return res.json({ ok:true, mode:'local-only' });
  }

  try{
    const client = await pool.connect();
    try{
      await client.query('BEGIN');
      
      // Primeiro, tenta encontrar o usuário pelo username ou email
      let userUuid = null;
      if(userId.includes('@')){
        // É um email
        const userResult = await client.query('SELECT id FROM users WHERE email = $1', [userId]);
        userUuid = userResult.rows[0]?.id;
      } else if(userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)){
        // Já é um UUID
        userUuid = userId;
      } else {
        // É um username
        const userResult = await client.query('SELECT id FROM users WHERE username = $1', [userId]);
        userUuid = userResult.rows[0]?.id;
      }
      
      if(!userUuid){
        // Cria usuário simples para teste (apenas para desenvolvimento)
        const newUserResult = await client.query(
          'INSERT INTO users(name, email, username, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
          [userId, `${userId}@test.com`, userId, 'test_hash']
        );
        userUuid = newUserResult.rows[0].id;
      }

      if(type === 'profile'){
        const { name, bio, location, age } = payload || {};
        await client.query(`
          INSERT INTO profiles(user_id, bio, location, age) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (user_id) DO UPDATE SET 
            bio = EXCLUDED.bio, 
            location = EXCLUDED.location, 
            age = EXCLUDED.age,
            last_active = CURRENT_TIMESTAMP
        `, [userUuid, bio||'', location||'', age||null]);
        
        // Atualiza nome do usuário se fornecido
        if(name) {
          await client.query('UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, userUuid]);
        }
        
      } else if(type === 'status'){
        const text = (payload && payload.text) || '';
        await client.query(
          'INSERT INTO posts(user_id, content, post_type) VALUES ($1, $2, $3)', 
          [userUuid, text, 'status']
        );
        
      } else if(type === 'message'){
        const { to, subject, content } = payload || {};
        if(to && content) {
          // Busca destinatário
          const toResult = await client.query('SELECT id FROM users WHERE username = $1 OR email = $1', [to]);
          const toUuid = toResult.rows[0]?.id;
          if(toUuid) {
            await client.query(
              'INSERT INTO messages(from_user_id, to_user_id, subject, content) VALUES ($1, $2, $3, $4)',
              [userUuid, toUuid, subject || 'Sem assunto', content]
            );
          }
        }
        
      } else if(type === 'community'){
        const { name, category, description } = payload || {};
        if(name) {
          await client.query(
            'INSERT INTO communities(name, description, category, creator_id) VALUES ($1, $2, $3, $4)',
            [name, description || '', category || 'Geral', userUuid]
          );
        }
        
      } else if(type === 'scrap'){
        const { to, content } = payload || {};
        if(to && content) {
          const toResult = await client.query('SELECT id FROM users WHERE username = $1 OR email = $1', [to]);
          const toUuid = toResult.rows[0]?.id;
          if(toUuid) {
            await client.query(
              'INSERT INTO scraps(from_user_id, to_user_id, content) VALUES ($1, $2, $3)',
              [userUuid, toUuid, content]
            );
          }
        }
      }

      await client.query('COMMIT');
      res.json({ ok:true, userUuid });
    } catch (e){
      await client.query('ROLLBACK');
      console.error('Sync error:', e);
      res.status(500).json({ ok:false, error: e.message });
    } finally {
      client.release();
    }
  } catch(e){
    console.error('Conexão pool erro:', e);
    res.status(500).json({ ok:false, error: 'Erro de conexão com banco' });
  }
});

module.exports = router;
