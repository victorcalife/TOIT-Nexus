const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Domain-based routing
app.get('/', (req, res) => {
  const host = req.get('host');
  console.log(`Request received for host: ${host}`);
  
  if (host === 'nexus.toit.com.br' || host === 'localhost') {
    console.log('Serving landing page');
    res.sendFile(path.join(__dirname, 'nexus-quantum-landing.html'));
  } else if (host === 'supnexus.toit.com.br') {
    console.log('Serving React app');
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  } else {
    console.log('Serving default page');
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  }
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TOIT NEXUS Test Server' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log('Available routes:');
  console.log('- http://localhost:8080/ (landing page)');
  console.log('- http://localhost:8080/api/health (API test)');
});