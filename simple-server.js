const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Serve the landing page for all routes
app.get('*', (req, res) => {
  const host = req.get('host') || 'localhost';
  console.log(`Request to ${req.url} from host ${host}`);
  
  // For API routes, return a simple JSON response
  if (req.url.startsWith('/api/')) {
    return res.json({ 
      message: 'API endpoint', 
      url: req.url,
      host: host
    });
  }
  
  // For all other routes, serve the landing page
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
      <p>Directory contents:</p>
      <pre>${fs.readdirSync(__dirname).join('\n')}</pre>
    `);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Simple server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
  
  // Check if landing page exists
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  if (fs.existsSync(landingPath)) {
    console.log('✅ Landing page found');
  } else {
    console.log('❌ Landing page NOT found');
  }
});