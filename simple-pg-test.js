import pkg from 'pg';
const { Client } = pkg;

console.log('PostgreSQL client test:');
console.log('- Client object:', !!Client);

// Try to create a client instance
try {
  const client = new Client({
    connectionString: 'postgresql://test:test@localhost:5432/test'
  });
  console.log('- Client instance created successfully');
  console.log('- Client config:', client.connectionParameters);
} catch (error) {
  console.log('- Error creating client instance:', error.message);
}