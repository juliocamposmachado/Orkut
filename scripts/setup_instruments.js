require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function setupInstruments() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Creating instruments table...');
    const sql = fs.readFileSync('./scripts/create_instruments_table.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Instruments table created successfully');
    
    // Test query
    const result = await pool.query('SELECT * FROM instruments');
    console.log('📊 Sample data:', result.rows);
    
  } catch (error) {
    console.error('❌ Error creating instruments table:', error.message);
  } finally {
    await pool.end();
  }
}

setupInstruments();
