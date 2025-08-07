const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Serve the landing page for all routes
app.get('*', (req, res) => {
  console.log(`Request received: ${req.url} from ${req.get('host')}`);
  
  // API routes
  if (req.url.startsWith('/api/')) {
    return res.json({ 
      status: 'ok', 
      message: 'TOIT NEXUS API Endpoint',
      url: req.url,
      timestamp: new Date().toISOString()
    });
  }
  
  // Serve landing page for all other routes
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPath)) {
    console.log('Serving landing page');
    return res.sendFile(landingPath);
  } else {
    console.log('Landing page not found');
    return res.status(404).send(`
      <h1>TOIT NEXUS - Landing Page Not Found</h1>
      <p>The landing page file could not be located.</p>
      <p>Expected path: ${landingPath}</p>
      <p>Current directory: ${__dirname}</p>
    `);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Simple test server running on port ${port}`);
  console.log(`URL: http://localhost:${port}`);
  
  // Verify landing page exists
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  if (fs.existsSync(landingPath)) {
    console.log('✅ Landing page found');
  } else {
    console.log('❌ Landing page NOT found');
  }
});