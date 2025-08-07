// Database connection string checker
console.log('=== Database Connection String Check ===');

const databaseUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL present:', !!databaseUrl);

if (databaseUrl) {
  console.log('DATABASE_URL length:', databaseUrl.length);
  console.log('DATABASE_URL preview:', databaseUrl.substring(0, Math.min(100, databaseUrl.length)));
  
  try {
    const url = new URL(databaseUrl);
    console.log('Parsed URL successfully');
    console.log('- Protocol:', url.protocol);
    console.log('- Host:', url.hostname);
    console.log('- Port:', url.port);
    console.log('- Database:', url.pathname);
    console.log('- Username present:', !!url.username);
    console.log('- Password present:', !!url.password);
  } catch (error) {
    console.log('Error parsing DATABASE_URL:', error.message);
  }
} else {
  console.log('DATABASE_URL is not set');
}

console.log('=== Connection String Check Complete ===');