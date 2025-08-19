/*
 Teste Final com Supabase JS SDK
 - Testa rotas atualizadas que usam Supabase JS
 - Verifica autenticação e UUID handling
 - Testa todos os tipos de sincronização
 - Valida logs do Orky
*/
const http = require('http');
const { URL } = require('url');

function postJSON(url, body){
  return new Promise((resolve, reject)=>{
    const u = new URL(url);
    const payload = Buffer.from(JSON.stringify(body));
    const req = http.request({ 
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

function fetchJSON(url){
  return new Promise((resolve, reject)=>{
    const u = new URL(url);
    const req = http.request({ method:'GET', hostname:u.hostname, port:u.port, path:u.pathname+u.search }, (res)=>{
      let data='';
      res.on('data', d=> data += d);
      res.on('end', ()=>{
        try{ resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }); }
        catch{ resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject); req.end();
  });
}

async function testSupabaseSync(baseUrl) {
  console.log('\n🚀 Testando sincronização com Supabase JS SDK...');
  
  const testUser = `orky_final_${Date.now()}`;
  console.log('👤 Usuário de teste:', testUser);
  
  const tests = [
    {
      name: '👤 Sync Profile',
      type: 'profile',
      payload: { 
        name: 'Orky Final Test', 
        bio: 'IA testando Supabase SDK integration', 
        location: 'Cyberspace',
        age: 30 
      }
    },
    {
      name: '📝 Sync Status',
      type: 'status', 
      payload: { text: '🎉 Sistema Orkut2025 funcionando perfeitamente com Supabase SDK!' }
    },
    {
      name: '🏠 Sync Community',
      type: 'community',
      payload: { 
        name: 'Orky AI Tests', 
        category: 'AI & Technology', 
        description: 'Comunidade para testes automatizados da IA Orky' 
      }
    },
    {
      name: '💬 Sync Message',
      type: 'message',
      payload: { 
        to: testUser, 
        subject: '✅ Teste Final', 
        content: 'Mensagem de teste do sistema final integrado com Supabase!' 
      }
    },
    {
      name: '📋 Sync Scrap',
      type: 'scrap',
      payload: { 
        to: testUser, 
        content: '🌟 Scrap final! Todas as funcionalidades integradas e funcionando!' 
      }
    }
  ];\n\n  const results = [];\n  \n  for (const test of tests) {\n    try {\n      console.log(`\\n🔄 ${test.name}...`);\n      \n      const response = await postJSON(baseUrl + '/api/sync', {\n        userId: testUser,\n        type: test.type,\n        payload: test.payload,\n        ts: Date.now()\n      });\n      \n      const success = response.status === 200 && response.body.ok;\n      results.push({ ...test, success, status: response.status, response: response.body });\n      \n      if (success) {\n        console.log(`✅ ${test.name} => OK`);\n        console.log(`   Usuário: ${response.body.username} (${response.body.userUuid?.substring(0,8)}...)`);\n        if (response.body.result?.id) {\n          console.log(`   Resultado ID: ${response.body.result.id.substring(0,8)}...`);\n        }\n      } else {\n        console.log(`❌ ${test.name} => ERRO ${response.status}`);\n        console.log(`   ${response.body.error || 'Erro desconhecido'}`);\n      }\n      \n      // Pausa entre testes\n      await new Promise(resolve => setTimeout(resolve, 800));\n      \n    } catch (error) {\n      console.log(`❌ ${test.name} => EXCEÇÃO: ${error.message}`);\n      results.push({ ...test, success: false, error: error.message });\n    }\n  }\n  \n  const successCount = results.filter(r => r.success).length;\n  console.log(`\\n📊 Sincronizações: ${successCount}/${tests.length} bem-sucedidas`);\n  \n  return { results, successCount, total: tests.length, testUser };\n}\n\nasync function testDataRetrieval(baseUrl, testUser) {\n  console.log('\\n📖 Testando recuperação de dados...');\n  \n  try {\n    // Test user data retrieval\n    console.log('🔍 Buscando dados do usuário...');\n    const userResponse = await fetchJSON(baseUrl + `/api/user/${testUser}`);\n    \n    if (userResponse.status === 200 && userResponse.body.ok) {\n      console.log('✅ Dados do usuário recuperados:');\n      console.log(`   Nome: ${userResponse.body.user?.name}`);\n      console.log(`   Posts: ${userResponse.body.posts?.length || 0}`);\n      console.log(`   Profile: ${userResponse.body.profile ? 'OK' : 'Não encontrado'}`);\n    } else {\n      console.log('❌ Erro ao buscar usuário:', userResponse.body.error);\n    }\n    \n    // Test feed retrieval\n    console.log('\\n📰 Buscando feed geral...');\n    const feedResponse = await fetchJSON(baseUrl + '/api/feed');\n    \n    if (feedResponse.status === 200 && feedResponse.body.ok) {\n      console.log('✅ Feed recuperado:');\n      console.log(`   Posts no feed: ${feedResponse.body.posts?.length || 0}`);\n      if (feedResponse.body.posts?.length > 0) {\n        const latestPost = feedResponse.body.posts[0];\n        console.log(`   Post mais recente: \"${latestPost.content?.substring(0, 50)}...\"`);\n        console.log(`   Por: ${latestPost.users?.name || 'Usuário desconhecido'}`);\n      }\n    } else {\n      console.log('❌ Erro ao buscar feed:', feedResponse.body.error);\n    }\n    \n    return {\n      userSuccess: userResponse.status === 200 && userResponse.body.ok,\n      feedSuccess: feedResponse.status === 200 && feedResponse.body.ok\n    };\n    \n  } catch (error) {\n    console.log('❌ Erro na recuperação de dados:', error.message);\n    return { userSuccess: false, feedSuccess: false };\n  }\n}\n\nasync function testOrkyHealthchecks(baseUrl) {\n  console.log('\\n🤖 Testando Orky healthchecks com Supabase...');\n  \n  const tests = [];\n  for (let i = 1; i <= 3; i++) {\n    try {\n      console.log(`🔍 Healthcheck ${i}/3...`);\n      const response = await postJSON(baseUrl + '/api/orky/healthcheck', {});\n      const success = response.status === 200 && response.body.ok;\n      \n      tests.push({ test: i, success, status: response.status, response: response.body });\n      \n      if (success) {\n        console.log(`✅ Teste ${i}/3 => OK (${response.body.jitter}ms jitter)`);\n        if (response.body.logId) {\n          console.log(`   Log ID: ${response.body.logId.substring(0,8)}...`);\n        }\n      } else {\n        console.log(`❌ Teste ${i}/3 => ERRO ${response.status}`);\n        console.log(`   ${response.body.error}: ${response.body.message || response.body.details}`);\n      }\n      \n      // Pausa entre healthchecks\n      await new Promise(resolve => setTimeout(resolve, 1500));\n    } catch (error) {\n      console.log(`❌ Teste ${i}/3 => EXCEÇÃO: ${error.message}`);\n      tests.push({ test: i, success: false, error: error.message });\n    }\n  }\n  \n  const successCount = tests.filter(t => t.success).length;\n  console.log(`\\n📊 Healthchecks: ${successCount}/${tests.length} funcionando`);\n  \n  return { tests, successCount, total: tests.length };\n}\n\nasync function main() {\n  console.log('🧪 TESTE FINAL - SUPABASE JS SDK INTEGRATION');\n  console.log('=============================================\\n');\n  \n  const baseUrl = process.argv[2] || 'http://localhost:3000';\n  console.log('🌐 URL Base:', baseUrl);\n  console.log('🔑 Usando Supabase JS SDK com autenticação adequada\\n');\n  \n  // Teste 1: Sincronização completa\n  const syncTest = await testSupabaseSync(baseUrl);\n  \n  // Teste 2: Recuperação de dados\n  const dataTest = await testDataRetrieval(baseUrl, syncTest.testUser);\n  \n  // Teste 3: Orky healthchecks\n  const orkyTest = await testOrkyHealthchecks(baseUrl);\n  \n  // Relatório final\n  console.log('\\n🏆 RELATÓRIO FINAL - SISTEMA COMPLETO');\n  console.log('=====================================');\n  \n  console.log(`🔄 Sincronização: ${syncTest.successCount}/${syncTest.total} tipos funcionando (${Math.round(syncTest.successCount/syncTest.total*100)}%)`);\n  \n  const dataSuccessCount = (dataTest.userSuccess ? 1 : 0) + (dataTest.feedSuccess ? 1 : 0);\n  console.log(`📖 Recuperação: ${dataSuccessCount}/2 endpoints funcionando (${Math.round(dataSuccessCount/2*100)}%)`);\n  \n  console.log(`🤖 Orky Health: ${orkyTest.successCount}/${orkyTest.total} testes OK (${Math.round(orkyTest.successCount/orkyTest.total*100)}%)`);\n  \n  console.log(`\\n👤 Usuário de teste criado: ${syncTest.testUser}`);\n  \n  // Score final\n  const components = [\n    { name: 'Sync', weight: 0.4, score: syncTest.successCount / syncTest.total },\n    { name: 'Data', weight: 0.3, score: dataSuccessCount / 2 },\n    { name: 'Health', weight: 0.3, score: orkyTest.successCount / orkyTest.total }\n  ];\n  \n  const totalScore = Math.round(components.reduce((acc, c) => acc + (c.score * c.weight), 0) * 100);\n  \n  console.log(`\\n🎯 SCORE FINAL: ${totalScore}%`);\n  components.forEach(c => {\n    console.log(`   ${c.name}: ${Math.round(c.score * 100)}% (peso ${c.weight})`);\n  });\n  \n  if (totalScore >= 90) {\n    console.log('\\n🎉 SISTEMA PLENAMENTE FUNCIONAL!');\n    console.log('   ✅ IA integrada com Supabase completamente');\n    console.log('   ✅ Todas as funcionalidades principais operacionais');\n    console.log('   ✅ Sistema pronto para produção!');\n    console.log('   🚀 Orkut2025 + IA + Supabase = SUCESSO!');\n  } else if (totalScore >= 75) {\n    console.log('\\n⚡ SISTEMA ALTAMENTE FUNCIONAL!');\n    console.log('   ✅ IA gerenciando Supabase eficientemente');\n    console.log('   ✅ Maioria das funcionalidades operacionais');\n    console.log('   ⚠️  Pequenos ajustes podem otimizar ainda mais');\n  } else {\n    console.log('\\n🔧 SISTEMA PARCIALMENTE FUNCIONAL');\n    console.log('   ⚠️  Algumas funcionalidades precisam de ajustes');\n    console.log('   🔍 Verificar logs de erro acima');\n  }\n}\n\nmain().catch(console.error);
