require('dotenv').config();
const { Pool } = require('pg');

const testConnections = [
  // Opção 1: Conexão direta com formato padrão
  'postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres?sslmode=require',
  
  // Opção 2: Pooler com username completo
  'postgresql://postgres.ksskokjrdzqghhuahjpl:julio78451200@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require',
  
  // Opção 3: Pooler porta 6543
  'postgresql://postgres.ksskokjrdzqghhuahjpl:julio78451200@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
  
  // Opção 4: Sem SSL obrigatório (teste)
  'postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres',
];

async function testConnection(connectionString, index) {
  console.log(`\n--- Teste ${index + 1} ---`);
  console.log('Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexão bem-sucedida!');
    
    // Teste simples de query
    const result = await client.query('SELECT version()');
    console.log('✅ Query executada:', result.rows[0].version.substring(0, 50) + '...');
    
    // Se é a primeira conexão bem-sucedida, tentar criar schema
    if (index === 3) { // Teste 4 que funcionou
      console.log('🔧 Tentando criar schema...');
      const fs = require('fs');
      const schema = fs.readFileSync('./server/schema.sql', 'utf8');
      await client.query(schema);
      console.log('✅ Schema criado com sucesso!');
    }
    
    client.release();
    return { success: true, connectionString };
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('🔍 Testando diferentes strings de conexão Supabase...\n');
  
  const results = [];
  
  for (let i = 0; i < testConnections.length; i++) {
    const result = await testConnection(testConnections[i], i);
    results.push(result);
    
    // Pausa entre testes para evitar rate limiting
    if (i < testConnections.length - 1) {
      console.log('⏱️ Aguardando 2s antes do próximo teste...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 Resumo dos testes:');
  results.forEach((result, index) => {
    console.log(`Teste ${index + 1}: ${result.success ? '✅ SUCESSO' : '❌ FALHOU'}`);
  });
  
  const successful = results.find(r => r.success);
  if (successful) {
    console.log('\n🎉 String de conexão recomendada:');
    console.log(successful.connectionString.replace(/:[^:@]+@/, ':****@'));
  } else {
    console.log('\n😞 Nenhuma conexão funcionou. Verifique:');
    console.log('- Senha correta');
    console.log('- IP na whitelist do Supabase');
    console.log('- Projeto Supabase ativo');
  }
}

main().catch(console.error);
