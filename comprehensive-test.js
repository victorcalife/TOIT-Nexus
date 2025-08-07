const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Test endpoint to verify deployment
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TOIT NEXUS Test Endpoint Working',
    timestamp: new Date().toISOString(),
    directory: __dirname,
    env: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TOIT NEXUS',
    timestamp: new Date().toISOString()
  });
});

// Serve landing page for root route
app.get('/', (req, res) => {
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPath)) {
    return res.sendFile(landingPath);
  } else {
    return res.status(404).send('Landing page not found');
  }
});

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  // API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  } else {
    return res.status(404).send('React app not found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 TOIT NEXUS COMPREHENSIVE TEST SERVER');
  console.log('='.repeat(60));
  console.log(`🌐 Server running on port ${port}`);
  console.log(`📁 Working directory: ${__dirname}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`   🏠 http://localhost:${port}/ - Landing page`);
  console.log(`   💚 http://localhost:${port}/api/health - Health check`);
  console.log(`   🧪 http://localhost:${port}/api/test - Test endpoint`);
  console.log('');
  
  // Check file existence
  const filesToCheck = [
    'nexus-quantum-landing.html',
    path.join('client', 'dist', 'index.html'),
    path.join('client', 'dist')
  ];
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${file} ${exists ? 'FOUND' : 'NOT FOUND'}`);
  });
  
  console.log('='.repeat(60));
});