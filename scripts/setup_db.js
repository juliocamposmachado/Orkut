require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function setupDB() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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
