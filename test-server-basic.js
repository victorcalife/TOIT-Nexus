const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('<h1>TOIT NEXUS - Basic Test Server</h1><p>Working!</p>');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Basic test server working' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Basic test server running on port ${port}`);
});