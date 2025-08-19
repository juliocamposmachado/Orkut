/*
 Teste Completo do Orkut2025
 - Testa todas as páginas
 - Testa sincronização com banco corrigido
 - Verifica funcionalidades de amigos, mensagens, comunidades
 - Executa healthcheck do Orky
 - Relata erros e sucessos detalhadamente
*/
require('dotenv').config();
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { Pool } = require('pg');

// Configuração de conexão que sabemos funcionar
const testConnectionString = 'postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres';

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
    const req = lib.request({ 
      method:'POST', 
      hostname:u.hostname, 
      port:u.port, 
      path:u.pathname+u.search, 
      headers:{ 'Content-Type':'application/json', 'Content-Length': payload.length } 
    }, (res)=>{
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

async function testDatabaseConnection() {
  console.log('\n🔍 Testando conexão direta com banco...');
  const pool = new Pool({
    connectionString: testConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conexão com banco bem-sucedida!');
    
    // Teste de criação do schema
    console.log('🔧 Testando criação do schema...');
    const fs = require('fs');
    const schema = fs.readFileSync('./server/schema.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Schema criado/atualizado com sucesso!');
    
    // Teste de inserção básica
    console.log('📝 Testando inserções básicas...');
    const testUserId = `test_complete_${Date.now()}`;
    
    await client.query('BEGIN');
    await client.query('INSERT INTO users(id, email) VALUES($1, $2) ON CONFLICT(id) DO NOTHING', [testUserId, `${testUserId}@test.com`]);
    await client.query('INSERT INTO profiles(user_id, name, bio) VALUES($1, $2, $3) ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name, bio=EXCLUDED.bio', [testUserId, 'Usuário Teste', 'Bio de teste']);
    await client.query('INSERT INTO statuses(user_id, text) VALUES($1, $2)', [testUserId, 'Status de teste']);
    await client.query('COMMIT');
    
    console.log('✅ Inserções no banco funcionando!');
    
    client.release();
    return { success: true, testUserId };
  } catch (error) {
    console.log('❌ Erro no banco:', error.message);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

async function testAllPages(baseUrl) {
  console.log('\n📄 Testando todas as páginas...');
  
  const pages = [
    '/',
    '/index.html',
    '/feed.html', 
    '/profile.html',
    '/amigos.html',
    '/mensagens.html', 
    '/comunidades.html',
    '/settings.html'
  ];

  const results = [];
  for (const page of pages) {
    const { status } = await fetchText(baseUrl + page).catch(()=>({ status: 0 }));
    const success = status === 200;
    results.push({ page, status, success });
    console.log(`${success ? '✅' : '❌'} ${page} => ${status}`);
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Páginas: ${successCount}/${pages.length} funcionando`);
  
  return { results, successCount, total: pages.length };
}

async function testSyncOperations(baseUrl, testUserId) {
  console.log('\n🔄 Testando operações de sincronização...');
  
  const operations = [
    {
      name: 'Sync Profile',
      type: 'profile',
      payload: { name: 'Teste Completo', bio: 'Bio atualizada via teste' }
    },
    {
      name: 'Sync Status',
      type: 'status', 
      payload: { text: 'Status postado via teste completo' }
    },
    {
      name: 'Sync Friend Add',
      type: 'friend_add',
      payload: { id: 'amigo_teste', name: 'Amigo de Teste', since: Date.now() }
    },
    {
      name: 'Sync Message',
      type: 'message',
      payload: { to: 'usuario_teste', subject: 'Teste', content: 'Mensagem de teste', from: 'Sistema' }
    },
    {
      name: 'Sync Community',
      type: 'community',
      payload: { name: 'Comunidade de Teste', category: 'Teste', description: 'Criada via script de teste' }
    }
  ];

  const results = [];
  for (const op of operations) {
    try {
      const response = await postJSON(baseUrl + '/api/sync', {
        userId: testUserId,
        type: op.type,
        payload: op.payload,
        ts: Date.now()
      });
      
      const success = response.status === 200 && response.body.ok;
      results.push({ ...op, success, status: response.status, response: response.body });
      console.log(`${success ? '✅' : '❌'} ${op.name} => ${response.status}`);
    } catch (error) {
      results.push({ ...op, success: false, error: error.message });
      console.log(`❌ ${op.name} => ERROR: ${error.message}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Sincronizações: ${successCount}/${operations.length} funcionando`);
  
  return { results, successCount, total: operations.length };
}

async function testOrkyHealthcheck(baseUrl) {
  console.log('\n🤖 Testando Orky healthcheck...');
  
  try {
    const response = await postJSON(baseUrl + '/api/orky/healthcheck', {});
    const success = response.status === 200;
    
    console.log(`${success ? '✅' : '❌'} Orky healthcheck => ${response.status}`);
    if (success && response.body.jitter) {
      console.log(`   Jitter aplicado: ${response.body.jitter}ms`);
    }
    
    return { success, status: response.status, response: response.body };
  } catch (error) {
    console.log(`❌ Orky healthcheck => ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 TESTE COMPLETO DO ORKUT2025');
  console.log('================================\n');
  
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  console.log('🌐 URL Base:', baseUrl);
  
  // Teste 1: Conexão com banco de dados
  const dbTest = await testDatabaseConnection();
  
  // Teste 2: Todas as páginas
  const pagesTest = await testAllPages(baseUrl);
  
  // Teste 3: Operações de sincronização (se banco estiver funcionando)
  let syncTest = { successCount: 0, total: 0, skipped: true };
  if (dbTest.success) {
    syncTest = await testSyncOperations(baseUrl, dbTest.testUserId);
    syncTest.skipped = false;
  } else {
    console.log('\n⚠️  Pulando testes de sync - banco não conectado');
  }
  
  // Teste 4: Orky healthcheck
  const orkyTest = await testOrkyHealthcheck(baseUrl);
  
  // Relatório final
  console.log('\n📋 RELATÓRIO FINAL');
  console.log('==================');
  console.log(`🔍 Conexão DB: ${dbTest.success ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📄 Páginas: ${pagesTest.successCount}/${pagesTest.total} (${Math.round(pagesTest.successCount/pagesTest.total*100)}%)`);
  console.log(`🔄 Sincronizações: ${syncTest.skipped ? 'PULADO' : `${syncTest.successCount}/${syncTest.total} (${Math.round(syncTest.successCount/syncTest.total*100)}%)`}`);
  console.log(`🤖 Orky: ${orkyTest.success ? '✅ OK' : '❌ FALHOU'}`);
  
  const overallScore = [
    dbTest.success ? 1 : 0,
    pagesTest.successCount / pagesTest.total,
    syncTest.skipped ? 0.5 : (syncTest.successCount / syncTest.total),
    orkyTest.success ? 1 : 0
  ];
  
  const totalScore = Math.round(overallScore.reduce((a,b)=>a+b, 0) / overallScore.length * 100);
  console.log(`\n🎯 Score Total: ${totalScore}%`);
  
  if (totalScore >= 80) {
    console.log('🎉 Site funcionando bem!');
  } else if (totalScore >= 60) {
    console.log('⚠️  Site parcialmente funcional');
  } else {
    console.log('🚨 Site com problemas significativos');
  }
  
  if (!dbTest.success) {
    console.log('\n💡 Para resolver problemas do banco:');
    console.log('   1. Verifique se DATABASE_URL está definida');
    console.log('   2. Confirme credenciais do Supabase');
    console.log('   3. Verifique se IP está na whitelist');
  }
}

main().catch(console.error);
