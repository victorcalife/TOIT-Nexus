const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Simple route to test if server is running
app.get('/', (req, res) => {
  res.send(`
    <h1>TOIT NEXUS - Test Server</h1>
    <p>Server is running successfully!</p>
    <p>Port: ${port}</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
    <p>Directory: ${__dirname}</p>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TOIT NEXUS Test Server',
    timestamp: new Date().toISOString(),
    port: port,
    directory: __dirname
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'TOIT NEXUS API Test Endpoint',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 TOIT NEXUS Test Server running on port ${port}`);
  console.log(`   URL: http://localhost:${port}`);
  console.log(`   Health: http://localhost:${port}/api/health`);
  console.log(`   Test API: http://localhost:${port}/api/test`);
  
  // Verify we can access the landing page file
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  console.log(`   Landing page path: ${landingPath}`);
  console.log(`   Landing page exists: ${fs.existsSync(landingPath)}`);
});