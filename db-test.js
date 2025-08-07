// Test database connection
const { Pool } = require('pg');

// Try to connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/toitnexus',
  ssl: false
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();