#!/usr/bin/env node

console.log('=== Database URL Test ===');

// Try to get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

console.log('DATABASE_URL present:', !!databaseUrl);

if (databaseUrl) {
  console.log('DATABASE_URL length:', databaseUrl.length);
  console.log('DATABASE_URL preview:', databaseUrl.substring(0, 100));
  
  // Check if it's a Railway database URL
  const isRailwayDb = databaseUrl.includes('railway');
  console.log('Is Railway database:', isRailwayDb);
  
  // Parse the URL to check its components
  try {
    const url = new URL(databaseUrl);
    console.log('Database host:', url.hostname);
    console.log('Database port:', url.port);
    console.log('Database name:', url.pathname);
    console.log('Database username:', url.username ? 'SET' : 'NOT SET');
    console.log('Database password:', url.password ? 'SET' : 'NOT SET');
  } catch (error) {
    console.log('Error parsing DATABASE_URL:', error.message);
  }
} else {
  console.log('DATABASE_URL is not set');
}

console.log('=== Database URL Test Complete ===');