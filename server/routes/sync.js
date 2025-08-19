const { Router } = require('express');
const { Pool } = require('pg');

const router = Router();

const connectionString = process.env.DATABASE_URL;
if(!connectionString){
  console.warn('DATABASE_URL não definida. Operando em modo somente localStorage.');
}

const pool = connectionString ? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
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
      await client.query('INSERT INTO users(id) VALUES($1) ON CONFLICT (id) DO NOTHING', [userId]);

      if(type === 'profile'){
        const { name, bio } = payload || {};
        await client.query(
          'INSERT INTO profiles(user_id, name, bio, updated_at) VALUES ($1,$2,$3, now()) ON CONFLICT (user_id) DO UPDATE SET name=EXCLUDED.name, bio=EXCLUDED.bio, updated_at=now()',
          [userId, name||'', bio||'']
        );
      } else if(type === 'status'){
        const text = (payload && payload.text) || '';
        await client.query('INSERT INTO statuses(user_id, text, created_at) VALUES ($1,$2, now())', [userId, text]);
      }

      await client.query('COMMIT');
      res.json({ ok:true });
    } catch (e){
      await client.query('ROLLBACK');
      console.error(e);
      res.status(500).send('Erro ao salvar no banco');
    } finally {
      client.release();
    }
  } catch(e){
    console.error('Conexão pool erro:', e);
    res.status(500).send('Erro de conexão com banco');
  }
});

module.exports = router;
