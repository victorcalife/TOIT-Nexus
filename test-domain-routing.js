const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Simple domain routing test
app.get('/', (req, res) => {
  const host = req.get('host') || 'localhost';
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  console.log(`Host requested: ${realHost}`);
  
  // Always serve the landing page for any host
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  console.log(`Landing page path: ${landingPath}`);
  
  if (fs.existsSync(landingPath)) {
    console.log('Serving landing page');
    return res.sendFile(landingPath);
  } else {
    console.log('Landing page not found');
    return res.status(404).send('Landing page not found');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TOIT NEXUS Domain Routing Test',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Domain routing test server listening on port ${port}`);
  console.log('Available endpoints:');
  console.log(`- http://localhost:${port}/ (landing page)`);
  console.log(`- http://localhost:${port}/api/health (health check)`);
});