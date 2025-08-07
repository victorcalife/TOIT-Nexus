console.log('=== Detailed Environment Variables Test ===');

// List all environment variables that might be relevant
const relevantVars = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'DB_URL',
  'NODE_ENV',
  'PORT',
  'SESSION_SECRET'
];

console.log('Environment variables:');
relevantVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`  ${varName}: NOT SET`);
  }
});

// List ALL environment variables (just the keys)
console.log('\nAll environment variable keys:');
console.log(Object.keys(process.env).sort().join(', '));

console.log('\n=== Test Complete ===');