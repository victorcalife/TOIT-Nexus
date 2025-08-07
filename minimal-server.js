const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send(`
    <h1>TOIT NEXUS - Minimal Server</h1>
    <p>Server is running successfully!</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TOIT NEXUS Minimal Server',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${port}`);
  console.log(`   URL: http://localhost:${port}`);
  console.log(`   Health: http://localhost:${port}/api/health`);
});