/*
 Teste com Schema Real do Supabase
 - Usa a estrutura UUID correta
 - Testa todas as funcionalidades com dados reais
 - Verifica compatibilidade com banco existente
*/
require('dotenv').config();
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { Pool } = require('pg');

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

async function testRealDatabase() {
  console.log('\n🏛️  Testando schema real do Supabase...');
  const pool = new Pool({
    connectionString: testConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conexão bem-sucedida!');
    
    // Verifica estrutura existente
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log('📋 Tabelas existentes:', tables.join(', '));
    
    // Executa nosso schema adicional (test_logs)
    console.log('🔧 Adicionando tabelas de teste...');
    const fs = require('fs');
    const schema = fs.readFileSync('./server/schema.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Schema atualizado!');
    
    // Consulta estatísticas
    const statsResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM posts) as posts_count,
        (SELECT COUNT(*) FROM communities) as communities_count,
        (SELECT COUNT(*) FROM messages) as messages_count
    `);
    
    const stats = statsResult.rows[0];
    console.log('📊 Estatísticas do banco:');
    console.log(`   Usuários: ${stats.users_count}`);
    console.log(`   Posts: ${stats.posts_count}`);
    console.log(`   Comunidades: ${stats.communities_count}`);
    console.log(`   Mensagens: ${stats.messages_count}`);
    
    client.release();
    return { success: true, stats };
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

async function testAllPages(baseUrl) {
  console.log('\n📄 Testando todas as páginas...');
  
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/index.html', name: 'Início' },
    { path: '/feed.html', name: 'Feed' },
    { path: '/profile.html', name: 'Perfil' },
    { path: '/amigos.html', name: 'Amigos' },
    { path: '/mensagens.html', name: 'Mensagens' },
    { path: '/comunidades.html', name: 'Comunidades' },
    { path: '/settings.html', name: 'Configurações' }
  ];

  const results = [];
  for (const page of pages) {
    const { status, body } = await fetchText(baseUrl + page.path).catch(()=>({ status: 0, body: '' }));
    const success = status === 200;
    const hasContent = body.includes('Orkut2025');
    results.push({ ...page, status, success, hasContent });
    console.log(`${success ? '✅' : '❌'} ${page.name} => ${status} ${hasContent ? '(conteúdo OK)' : '(conteúdo vazio)'}`);
  }

  const successCount = results.filter(r => r.success && r.hasContent).length;
  console.log(`📊 Páginas funcionais: ${successCount}/${pages.length}`);
  
  return { results, successCount, total: pages.length };
}

async function testSyncWithRealSchema(baseUrl) {
  console.log('\n🔄 Testando sincronização com schema real...');
  
  const testUser = `orkytest_${Date.now()}`;
  console.log('👤 Usuário de teste:', testUser);
  
  const operations = [
    {
      name: 'Sync Profile',
      type: 'profile',
      payload: { 
        name: 'Orky Testador', 
        bio: 'Bot de teste do Orkut2025', 
        location: 'Digital World',
        age: 25 
      }
    },
    {
      name: 'Sync Status/Post',
      type: 'status', 
      payload: { text: '🤖 Post automatizado via Orky! Sistema funcionando perfeitamente.' }
    },
    {
      name: 'Sync Community',
      type: 'community',
      payload: { 
        name: 'Testes Automatizados', 
        category: 'Tecnologia', 
        description: 'Comunidade para testes do sistema Orkut2025' 
      }
    },
    {
      name: 'Sync Message',
      type: 'message',
      payload: { 
        to: testUser, 
        subject: 'Teste de Mensagem', 
        content: 'Esta é uma mensagem de teste enviada automaticamente pelo sistema Orky.' 
      }
    },
    {
      name: 'Sync Scrap',
      type: 'scrap',
      payload: { 
        to: testUser, 
        content: '✨ Scrap de teste! O sistema está funcionando corretamente.' 
      }
    }
  ];

  const results = [];
  for (const op of operations) {
    try {
      const response = await postJSON(baseUrl + '/api/sync', {
        userId: testUser,
        type: op.type,
        payload: op.payload,
        ts: Date.now()
      });
      
      const success = response.status === 200 && response.body.ok;
      results.push({ ...op, success, status: response.status, response: response.body });
      console.log(`${success ? '✅' : '❌'} ${op.name} => ${response.status} ${response.body.userUuid ? `(UUID: ${response.body.userUuid.substring(0,8)}...)` : ''}`);
      
      // Pausa entre operações para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push({ ...op, success: false, error: error.message });
      console.log(`❌ ${op.name} => ERROR: ${error.message}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Operações de sync: ${successCount}/${operations.length} bem-sucedidas`);
  
  return { results, successCount, total: operations.length, testUser };
}

async function testOrkyHealthcheck(baseUrl) {
  console.log('\n🤖 Testando Orky healthcheck com logs...');
  
  const tests = [];
  for (let i = 1; i <= 3; i++) {
    try {
      const response = await postJSON(baseUrl + '/api/orky/healthcheck', {});
      const success = response.status === 200;
      
      tests.push({ test: i, success, status: response.status, response: response.body });
      console.log(`${success ? '✅' : '❌'} Teste ${i}/3 => ${response.status} ${success && response.body.jitter ? `(${response.body.jitter}ms jitter)` : ''}`);
      
      // Pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (error) {
      tests.push({ test: i, success: false, error: error.message });
      console.log(`❌ Teste ${i}/3 => ERROR: ${error.message}`);
    }
  }
  
  const successCount = tests.filter(t => t.success).length;
  console.log(`📊 Healthchecks: ${successCount}/${tests.length} funcionando`);
  
  return { tests, successCount, total: tests.length };
}

async function main() {
  console.log('🧪 TESTE COMPLETO - SCHEMA REAL SUPABASE');
  console.log('=========================================\n');
  
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  console.log('🌐 URL Base:', baseUrl);
  
  // Teste 1: Schema real do banco
  const dbTest = await testRealDatabase();
  
  // Teste 2: Páginas estáticas
  const pagesTest = await testAllPages(baseUrl);
  
  // Teste 3: Sincronização com schema real
  let syncTest = { successCount: 0, total: 0, skipped: true };
  if (dbTest.success) {
    syncTest = await testSyncWithRealSchema(baseUrl);
    syncTest.skipped = false;
  } else {
    console.log('\n⚠️  Pulando testes de sync - banco não conectado');
  }
  
  // Teste 4: Orky com logs no banco
  const orkyTest = await testOrkyHealthcheck(baseUrl);
  
  // Relatório final detalhado
  console.log('\n📋 RELATÓRIO FINAL DETALHADO');
  console.log('============================');
  console.log(`🏛️  Banco Supabase: ${dbTest.success ? '✅ Conectado' : '❌ Desconectado'}`);
  if(dbTest.success && dbTest.stats) {
    console.log(`   📊 ${dbTest.stats.users_count} usuários, ${dbTest.stats.posts_count} posts, ${dbTest.stats.communities_count} comunidades`);
  }
  
  console.log(`📄 Páginas Web: ${pagesTest.successCount}/${pagesTest.total} funcionando (${Math.round(pagesTest.successCount/pagesTest.total*100)}%)`);
  
  if(!syncTest.skipped) {
    console.log(`🔄 Sincronização: ${syncTest.successCount}/${syncTest.total} tipos funcionando (${Math.round(syncTest.successCount/syncTest.total*100)}%)`);
    console.log(`👤 Usuário de teste criado: ${syncTest.testUser}`);
  }
  
  console.log(`🤖 Orky Health: ${orkyTest.successCount}/${orkyTest.total} testes OK (${Math.round(orkyTest.successCount/orkyTest.total*100)}%)`);
  
  // Score final
  const components = [
    { name: 'Banco', weight: 0.3, score: dbTest.success ? 1 : 0 },
    { name: 'Frontend', weight: 0.2, score: pagesTest.successCount / pagesTest.total },
    { name: 'Sync', weight: 0.3, score: syncTest.skipped ? 0.5 : (syncTest.successCount / syncTest.total) },
    { name: 'Health', weight: 0.2, score: orkyTest.successCount / orkyTest.total }
  ];
  
  const totalScore = Math.round(components.reduce((acc, c) => acc + (c.score * c.weight), 0) * 100);
  console.log(`\n🎯 SCORE TOTAL: ${totalScore}%`);
  
  components.forEach(c => {
    console.log(`   ${c.name}: ${Math.round(c.score * 100)}% (peso ${c.weight})`);
  });
  
  if (totalScore >= 85) {
    console.log('\n🎉 SISTEMA PLENAMENTE FUNCIONAL!');
    console.log('   ✅ IA pode gerenciar o banco de dados');
    console.log('   ✅ Todas as funcionalidades principais OK');
    console.log('   ✅ Pronto para uso em produção');
  } else if (totalScore >= 70) {
    console.log('\n⚡ SISTEMA MAJORITARIAMENTE FUNCIONAL');
    console.log('   ✅ IA pode gerenciar a maioria das operações');
    console.log('   ⚠️  Algumas funcionalidades precisam de ajustes');
  } else {
    console.log('\n🔧 SISTEMA PRECISA DE AJUSTES');
    console.log('   ❌ Problemas significativos detectados');
    console.log('   🔍 Verificar logs de erro acima');
  }
}

main().catch(console.error);
