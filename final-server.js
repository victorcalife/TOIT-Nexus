const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TOIT Nexus server is running',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Domain-based routing for root path
app.get('/', (req, res) => {
  const host = req.get('host') || 'localhost';
  
  // For supnexus domain, serve React app
  if (host === 'supnexus.toit.com.br' || host === 'localhost') {
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      return res.status(404).send('React app not found');
    }
  }
  
  // For other domains, serve landing page
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  if (fs.existsSync(landingPath)) {
    return res.sendFile(landingPath);
  } else {
    return res.status(404).send('Landing page not found');
  }
});

// SPA fallback for React Router
app.get('*', (req, res) => {
  const host = req.get('host') || 'localhost';
  
  // If it's an API request, return 404
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For supnexus domain, serve React app for any route
  if (host === 'supnexus.toit.com.br' || host === 'localhost') {
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      return res.status(404).send('React app not found');
    }
  }
  
  // For other domains, 404
  return res.status(404).send('Page not found');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(80));
  console.log('🚀 TOIT NEXUS SERVER - SUCCESSFULLY STARTED');
  console.log('='.repeat(80));
  console.log(`🌐 Server running on port: ${port}`);
  console.log(`🔗 Access URLs:`);
  console.log(`   http://localhost:${port}/ - Landing Page`);
  console.log(`   http://localhost:${port}/ - Admin Portal`);
  console.log(`   http://localhost:${port}/api/health - Health Check`);
  console.log('='.repeat(80));
});