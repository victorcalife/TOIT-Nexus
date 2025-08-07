#!/usr/bin/env node

console.log('=== Simple Database Connection Test ===');

// Try to connect directly with pg
import { Pool } from 'pg';

// Try to get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

console.log('DATABASE_URL present:', !!databaseUrl);
if (databaseUrl) {
  console.log('DATABASE_URL length:', databaseUrl.length);
}

// Create a simple pool
const pool = new Pool({
  connectionString: databaseUrl || 'postgresql://localhost:5432/toitnexus',
});

console.log('Pool created successfully');

// Try to connect
pool.connect()
  .then(client => {
    console.log('✅ Connected to database successfully');
    // Run a simple query
    return client.query('SELECT NOW() as current_time')
      .then(result => {
        console.log('✅ Query executed successfully');
        console.log('Current time from DB:', result.rows[0].current_time);
        client.release();
      })
      .catch(error => {
        console.log('❌ Error executing query:', error.message);
        client.release();
      });
  })
  .catch(error => {
    console.log('❌ Error connecting to database:', error.message);
  })
  .finally(() => {
    pool.end();
    console.log('=== Test Complete ===');
  });