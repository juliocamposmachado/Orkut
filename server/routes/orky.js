const { Router } = require('express');
const { Pool } = require('pg');

const router = Router();

const connectionString = process.env.DATABASE_URL;
const pool = connectionString ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } }) : null;

// Controle simples de taxa e jitter para evitar bursts
let tokens = 5; // capacidade
const refillRate = 1; // 1 token por segundo
let lastRefill = Date.now();

function takeToken(){
  const now = Date.now();
  const elapsed = (now - lastRefill) / 1000;
  const refill = Math.floor(elapsed * refillRate);
  if(refill > 0){ tokens = Math.min(5, tokens + refill); lastRefill = now; }
  if(tokens > 0){ tokens--; return true; }
  return false;
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

router.post('/healthcheck', async (req, res) => {
  // Aplica jitter aleatório de 100-700ms
  const jitter = 100 + Math.floor(Math.random()*600);
  await sleep(jitter);

  if(!pool){
    return res.json({ ok:true, mode:'local-only', jitter });
  }

  // Token bucket simples
  if(!takeToken()){
    return res.status(429).json({ ok:false, error:'rate_limited', retry_after_ms: 1000 });
  }

  const client = await pool.connect();
  try{
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO test_logs(test_type, status, details) VALUES ($1,$2,$3)',
      ['db_health', 'ok', { jitter }]
    );
    await client.query('COMMIT');
    res.json({ ok:true, jitter });
  } catch (e){
    try{ await client.query('ROLLBACK'); }catch(_){}
    console.error('Orky healthcheck error:', e);
    res.status(500).json({ ok:false, error:'db_error' });
  } finally {
    client.release();
  }
});

module.exports = router;

