import { Pool } from 'pg';

console.log('=== Direct Database Connection Test ===');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');
console.log('Database URL length:', process.env.DATABASE_URL.length);

// Create pool with explicit configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('✅ Pool created successfully');

// Test connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to database successfully');
    
    // Test a simple query
    return client.query('SELECT NOW() as current_time')
      .then(result => {
        console.log('✅ Query executed successfully');
        console.log('Current time:', result.rows[0].current_time);
        client.release();
      })
      .catch(error => {
        console.log('❌ Error executing query:', error.message);
        client.release();
      });
  })
  .then(() => {
    console.log('✅ Test completed successfully');
    return pool.end();
  })
  .catch(error => {
    console.log('❌ Error connecting to database:', error.message);
    console.log('Error code:', error.code);
  })
  .finally(() => {
    console.log('=== Direct Database Connection Test Complete ===');
  });