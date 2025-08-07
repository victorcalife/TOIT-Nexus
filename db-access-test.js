import { writeFileSync } from 'fs';
import { Pool } from 'pg';

// Test database access and write results to file
const testDbAccess = async () => {
  const results = [];
  results.push('=== Database Access Test ===');
  
  try {
    // Check environment variables
    results.push(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);
    if (process.env.DATABASE_URL) {
      results.push(`DATABASE_URL length: ${process.env.DATABASE_URL.length}`);
      results.push(`DATABASE_URL preview: ${process.env.DATABASE_URL.substring(0, 50)}`);
    }
    
    // Try to create a pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/toitnexus',
    });
    results.push('Pool created successfully');
    
    // Try to connect
    const client = await pool.connect();
    results.push('Connected to database successfully');
    
    // Try a simple query
    const result = await client.query('SELECT version()');
    results.push(`Database version: ${result.rows[0].version}`);
    
    // Close connection
    client.release();
    await pool.end();
    results.push('Connection closed successfully');
    
  } catch (error) {
    results.push(`Error: ${error.message}`);
    results.push(`Error code: ${error.code}`);
  }
  
  results.push('=== Test Complete ===');
  
  // Write results to file
  writeFileSync('db-test-results.txt', results.join('\n'));
  console.log('Results written to db-test-results.txt');
};

testDbAccess();