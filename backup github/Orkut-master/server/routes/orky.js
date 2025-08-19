const { Router } = require('express');
const { supabase } = require('../config/supabase');

const router = Router();

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

  // Token bucket simples
  if(!takeToken()){
    return res.status(429).json({ ok:false, error:'rate_limited', retry_after_ms: 1000 });
  }

  try {
    // Insert test log using Supabase
    const { data, error } = await supabase
      .from('test_logs')
      .insert({
        test_type: 'db_health',
        status: 'ok',
        details: { jitter, timestamp: Date.now() }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Orky healthcheck error:', error);
      return res.status(500).json({ ok:false, error: 'supabase_error', details: error.message });
    }
    
    console.log('✅ Orky healthcheck logged:', data.id);
    res.json({ ok:true, jitter, logId: data.id });
    
  } catch (e) {
    console.error('Orky healthcheck error:', e);
    res.status(500).json({ ok:false, error:'db_error', message: e.message });
  }
});

module.exports = router;

