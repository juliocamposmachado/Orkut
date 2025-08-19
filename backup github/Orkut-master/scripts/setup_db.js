require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function setupDB() {
  // Para teste direto - usar a string que funcionou
  const testConnectionString = 'postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres';
  
  if (!process.env.DATABASE_URL && !testConnectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  
  const connectionString = process.env.DATABASE_URL || testConnectionString;

  // Configuração SSL inteligente para Supabase
  function getSSLConfig() {
    const fs = require('fs');
    const path = require('path');
    
    // Tenta usar certificado personalizado se existir
    const certPath = path.join(__dirname, '..', 'certs', 'prod-ca-2021.crt');
    if (fs.existsSync(certPath)) {
      console.log('Setup: Usando certificado SSL personalizado:', certPath);
      return {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certPath).toString()
      };
    }
    
    // Fallback para configuração padrão Supabase
    console.log('Setup: Usando SSL padrão (rejectUnauthorized: false)');
    return { rejectUnauthorized: false };
  }

  const pool = new Pool({
    connectionString,
    ssl: getSSLConfig()
  });

  try {
    console.log('Creating database schema...');
    const schema = fs.readFileSync('./server/schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Schema created successfully');
  } catch (error) {
    console.error('❌ Schema error:', error.message);
  } finally {
    await pool.end();
  }
}

setupDB();
