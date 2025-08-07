const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/health`);
  res.json({ 
    status: 'ok', 
    service: 'TOIT Nexus Backend Test Server',
    timestamp: new Date().toISOString(),
    port: port,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/debug`);
  res.json({
    message: 'Backend test server is running',
    timestamp: new Date().toISOString(),
    port: port,
    environment: process.env.NODE_ENV || 'development',
    host: req.get('host'),
    xForwardedHost: req.get('x-forwarded-host')
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/auth/login`, req.body);
  res.json({
    success: true,
    message: 'Login endpoint is working',
    data: req.body
  });
});

// Tenants endpoint
app.get('/api/tenants', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/tenants`);
  res.json({
    success: true,
    message: 'Tenants endpoint is working',
    data: [
      { id: 'toit', name: 'TOIT Enterprise', slug: 'toit' },
      { id: 'demo', name: 'Demo Company', slug: 'demo' }
    ]
  });
});

// Catch-all for API routes
app.get('/api/*', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint not specifically implemented in test server',
    requested: req.originalUrl,
    available: ['/api/health', '/api/debug', '/api/auth/login', '/api/tenants']
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 TOIT Nexus Backend Test Server running on port ${port}`);
  console.log(`   Health check: http://localhost:${port}/api/health`);
  console.log(`   Debug endpoint: http://localhost:${port}/api/debug`);
});