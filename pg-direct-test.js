#!/usr/bin/env node

console.log('=== Direct PostgreSQL Connection Test ===');

import pg from 'pg';

console.log('pg package imported successfully');

// Try to create a client directly
const { Client } = pg;

console.log('Client class extracted successfully');

// Try to get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

console.log('DATABASE_URL present:', !!databaseUrl);

if (databaseUrl) {
  console.log('DATABASE_URL length:', databaseUrl.length);
  
  // Create a client
  const client = new Client({
    connectionString: databaseUrl,
  });
  
  console.log('Client created successfully');
  
  // Try to connect
  client.connect()
    .then(() => {
      console.log('✅ Connected to PostgreSQL database successfully');
      
      // Run a simple query
      return client.query('SELECT NOW() as current_time');
    })
    .then(result => {
      console.log('✅ Query executed successfully');
      console.log('Current time:', result.rows[0].current_time);
      
      // Close the connection
      return client.end();
    })
    .then(() => {
      console.log('✅ Connection closed successfully');
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
      console.log('Error code:', error.code);
      
      // Try to close the connection if it was opened
      try {
        client.end();
      } catch (endError) {
        console.log('Error closing connection:', endError.message);
      }
    });
} else {
  console.log('DATABASE_URL is not set, cannot test connection');
}

console.log('=== Direct PostgreSQL Connection Test Complete ===');