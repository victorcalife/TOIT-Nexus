const express = require('express');
const app = express();
const port = 8080;

console.log('Starting simple Express server...');

app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.send('Hello TOIT Nexus!');
});

app.get('/api/health', (req, res) => {
  console.log('Health API accessed');
  res.json({ status: 'ok', message: 'Simple Express server is running' });
});

app.listen(port, () => {
  console.log(`Simple Express server running at http://localhost:${port}`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log(`  http://localhost:${port}/ - Root page`);
  console.log(`  http://localhost:${port}/api/health - Health check`);
  console.log('='.repeat(50));
});