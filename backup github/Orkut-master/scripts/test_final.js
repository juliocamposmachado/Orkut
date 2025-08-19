/*
 Teste Final - Supabase JS SDK Integration
 - Testa todas as rotas atualizadas
 - Verifica autenticação e funcionalidades
*/
const http = require('http');
const { URL } = require('url');

function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = Buffer.from(JSON.stringify(body));
    const req = http.request({
      method: 'POST',
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🧪 TESTE FINAL - SUPABASE INTEGRATION');
  console.log('======================================\n');
  
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const testUser = `orky_final_${Date.now()}`;
  
  console.log('🌐 URL Base:', baseUrl);
  console.log('👤 Usuário:', testUser);
  console.log('🔑 Usando Supabase JS SDK\n');
  
  const tests = [
    {
      name: 'Profile Sync',
      type: 'profile',
      payload: { name: 'Orky Final', bio: 'IA + Supabase integration test', location: 'Digital World', age: 25 }
    },
    {
      name: 'Status Sync', 
      type: 'status',
      payload: { text: '🎉 Sistema Orkut2025 + Supabase funcionando!' }
    },
    {
      name: 'Community Sync',
      type: 'community', 
      payload: { name: 'Orky Tests', category: 'Technology', description: 'Automated AI tests' }
    }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔄 Testando ${test.name}...`);
      
      const response = await postJSON(baseUrl + '/api/sync', {
        userId: testUser,
        type: test.type,
        payload: test.payload,
        ts: Date.now()
      });
      
      const success = response.status === 200 && response.body.ok;
      
      if (success) {
        console.log(`✅ ${test.name} => SUCESSO`);
        console.log(`   User UUID: ${response.body.userUuid?.substring(0,8)}...`);
        successCount++;
      } else {
        console.log(`❌ ${test.name} => ERRO ${response.status}`);
        console.log(`   ${response.body.error || 'Erro desconhecido'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ ${test.name} => EXCEÇÃO: ${error.message}`);
    }
  }
  
  // Test Orky healthcheck
  console.log('\n🤖 Testando Orky healthcheck...');
  try {
    const response = await postJSON(baseUrl + '/api/orky/healthcheck', {});
    if (response.status === 200 && response.body.ok) {
      console.log(`✅ Orky Healthcheck => OK (${response.body.jitter}ms)`);
      successCount++;
    } else {
      console.log(`❌ Orky Healthcheck => ERRO ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Orky Healthcheck => EXCEÇÃO: ${error.message}`);
  }
  
  const totalTests = tests.length + 1;
  const scorePercent = Math.round((successCount / totalTests) * 100);
  
  console.log(`\n📊 RESULTADO: ${successCount}/${totalTests} testes passaram`);
  console.log(`🎯 SCORE: ${scorePercent}%`);
  
  if (scorePercent >= 90) {
    console.log('\n🎉 SISTEMA PLENAMENTE FUNCIONAL!');
    console.log('   ✅ IA integrada com Supabase');
    console.log('   ✅ Todas as funcionalidades OK');
    console.log('   🚀 Pronto para produção!');
  } else if (scorePercent >= 70) {
    console.log('\n⚡ SISTEMA ALTAMENTE FUNCIONAL');
    console.log('   ✅ Maioria das funcionalidades OK');
  } else {
    console.log('\n🔧 SISTEMA PRECISA DE AJUSTES');
    console.log('   ⚠️ Verificar logs de erro');
  }
}

main().catch(console.error);
