const express = require('express');
const path = require('path');
const fs = require('fs');

// Always log startup
process.stdout.write('Starting TOIT Nexus Server with Error Handling...\n');

const app = express();
const port = process.env.PORT || 8080;

// Error handling middleware
app.use((err, req, res, next) => {
  process.stdout.write(`Error occurred: ${err.message}\n`);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

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
  process.stdout.write('Health check endpoint accessed\n');
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
  process.stdout.write(`Root endpoint accessed with host: ${host}\n`);
  
  // For supnexus domain, serve React app
  if (host === 'supnexus.toit.com.br' || host === 'localhost') {
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      process.stdout.write('Serving React app\n');
      return res.sendFile(indexPath);
    } else {
      process.stdout.write('React app not found\n');
      return res.status(404).send('React app not found');
    }
  }
  
  // For other domains, serve landing page
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  if (fs.existsSync(landingPath)) {
    process.stdout.write('Serving landing page\n');
    return res.sendFile(landingPath);
  } else {
    process.stdout.write('Landing page not found\n');
    return res.status(404).send('Landing page not found');
  }
});

// SPA fallback for React Router
app.get('*', (req, res) => {
  process.stdout.write(`Fallback route accessed: ${req.url}\n`);
  const host = req.get('host') || 'localhost';
  
  // If it's an API request, return 404
  if (req.url.startsWith('/api/')) {
    process.stdout.write('API endpoint not found\n');
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For supnexus domain, serve React app for any route
  if (host === 'supnexus.toit.com.br' || host === 'localhost') {
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      process.stdout.write('Serving React app for SPA route\n');
      return res.sendFile(indexPath);
    } else {
      process.stdout.write('React app not found for SPA route\n');
      return res.status(404).send('React app not found');
    }
  }
  
  // For other domains, 404
  process.stdout.write('Page not found for host\n');
  return res.status(404).send('Page not found');
});

// Start server with error handling
const server = app.listen(port, '0.0.0.0', () => {
  process.stdout.write('='.repeat(80) + '\n');
  process.stdout.write('🚀 TOIT NEXUS SERVER - SUCCESSFULLY STARTED\n');
  process.stdout.write('='.repeat(80) + '\n');
  process.stdout.write(`🌐 Server running on port: ${port}\n`);
  process.stdout.write(`🔗 Access URLs:\n`);
  process.stdout.write(`   http://localhost:${port}/ - Landing Page or Admin Portal\n`);
  process.stdout.write(`   http://localhost:${port}/api/health - Health Check\n`);
  process.stdout.write('='.repeat(80) + '\n');
});

server.on('error', (error) => {
  process.stdout.write(`Server error: ${error.message}\n`);
});