/*
 Script de teste do Orkut2025
 - Verifica páginas públicas
 - Executa sync de perfil e status com usuário aleatório
 - Chama healthcheck do Orky (registra log no banco com jitter)
 Uso: node scripts/test_all.js [baseURL]
*/
const http = require('http');
const https = require('https');
const { URL } = require('url');

function fetchText(url){
  return new Promise((resolve, reject)=>{
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({ method:'GET', hostname:u.hostname, port:u.port, path:u.pathname+u.search }, (res)=>{
      let data='';
      res.on('data', d=> data += d);
      res.on('end', ()=> resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject); req.end();
  });
}

function postJSON(url, body){
  return new Promise((resolve, reject)=>{
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const payload = Buffer.from(JSON.stringify(body));
    const req = lib.request({ method:'POST', hostname:u.hostname, port:u.port, path:u.pathname+u.search, headers:{ 'Content-Type':'application/json', 'Content-Length': payload.length } }, (res)=>{
      let data='';
      res.on('data', d=> data += d);
      res.on('end', ()=>{
        try{ resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }); }
        catch{ resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject); req.write(payload); req.end();
  });
}

(async function main(){
  const base = process.argv[2] || 'http://localhost:3000';
  const userId = `test_${Date.now()}`;
  console.log('Base URL:', base);
  console.log('User ID:', userId);

  // 1) Páginas públicas
  for (const p of ['/','/index.html','/feed.html','/profile.html','/settings.html']){
    const { status } = await fetchText(base + p).catch(()=>({ status:0 }));
    console.log('GET', p, '=>', status);
  }

  // 2) Sync perfil
  let r = await postJSON(base + '/api/sync', { userId, type:'profile', payload:{ name:'Tester', bio:'Bio de teste' }, ts: Date.now() }).catch(e=>({ status:0, body: String(e) }));
  console.log('POST /api/sync profile =>', r.status, r.body && r.body.ok);

  // 3) Sync status
  r = await postJSON(base + '/api/sync', { userId, type:'status', payload:{ text:'Status de teste via script' }, ts: Date.now() }).catch(e=>({ status:0, body: String(e) }));
  console.log('POST /api/sync status =>', r.status, r.body && r.body.ok);

  // 4) Healthcheck Orky (gera log com jitter/limite)
  r = await postJSON(base + '/api/orky/healthcheck', {}).catch(e=>({ status:0, body: String(e) }));
  console.log('POST /api/orky/healthcheck =>', r.status, r.body);

  console.log('Teste concluído');
})();

