const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Simple middleware for logging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url} | Host: ${req.get('host')}`);
  next();
});

// JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mock API endpoints for development
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TOIT NEXUS Dev Server',
    version: '2.0.0',
    environment: 'development'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { cpf, password } = req.body;
  
  // Mock authentication
  if (cpf === '00000000000' && password === 'admin123') {
    res.json({
      success: true,
      user: {
        id: 'user_1',
        name: 'Super Admin TOIT',
        role: 'super_admin',
        cpf: '00000000000'
      },
      token: 'mock-jwt-token-' + Date.now(),
      message: 'Login realizado com sucesso'
    });
  } else if (cpf === '11111111111' && password === 'admin123') {
    res.json({
      success: true,
      user: {
        id: 'user_2', 
        name: 'Tenant Admin',
        role: 'tenant_admin',
        cpf: '11111111111'
      },
      token: 'mock-jwt-token-' + Date.now(),
      message: 'Login realizado com sucesso'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas',
      message: 'CPF ou senha incorretos'
    });
  }
});

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Domain-based routing
app.get('/', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  console.log(`🌐 Host: ${realHost} | Path: ${req.originalUrl}`);
  
  // SUPNEXUS (equipe TOIT) → React app always
  if (realHost === 'supnexus.toit.com.br' || realHost === 'localhost:8080') {
    console.log(`👥 Serving React app for TOIT team`);
    
    const distIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    
    if (fs.existsSync(distIndexPath)) {
      console.log(`✅ Serving built React app: ${distIndexPath}`);
      return res.sendFile(distIndexPath);
    } else {
      console.error(`❌ React app not found`);
      return res.status(404).send(`
        <h1>TOIT NEXUS System Unavailable</h1>
        <p>TOIT team portal temporarily unavailable</p>
        <p>React app not built correctly</p>
        <p>Run: npm run build</p>
      `);
    }
  }
  
  // NEXUS (clientes) → Landing page always  
  console.log(`🎯 Serving landing page for: ${realHost}`);
  
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    res.status(404).send(`
      <h1>File not found</h1>
      <p>nexus-quantum-landing.html does not exist in directory</p>
      <p>Directory: ${__dirname}</p>
    `);
  }
});

// SPA fallback for React Router (supnexus only)
app.get('*', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  // If it's an API request, return 404
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      availableEndpoints: ['/api/health', '/api/auth/login']
    });
  }
  
  // If it's supnexus, serve the React app for any route (SPA)
  if (realHost === 'supnexus.toit.com.br' || realHost === 'localhost:8080') {
    console.log(`🎯 [SUPNEXUS SPA] Fallback to React Router: ${req.originalUrl}`);
    
    const distIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    
    if (fs.existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    } else {
      return res.status(404).send('React app not found - run npm run build');
    }
  }
  
  // For other hosts, 404
  res.status(404).send('Page not found');
});

app.listen(port, () => {
  console.log('=' .repeat(80));
  console.log('🚀 TOIT NEXUS DEV SERVER - STARTED SUCCESSFULLY');
  console.log('=' .repeat(80));
  console.log(`🌐 Server running on port: ${port}`);
  console.log(`📁 Root directory: ${__dirname}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📡 ACTIVE SERVICES:');
  console.log('   ✅ Frontend Proxy (nexus.toit.com.br → Landing)');
  console.log('   ✅ React SPA (supnexus.toit.com.br → Admin)');
  console.log('   ✅ Mock APIs for development');
  console.log('');
  console.log('🔗 MAIN ENDPOINTS:');
  console.log('   🌐 http://localhost:8080/ → Landing Page');
  console.log('   👥 http://localhost:8080/ → Portal Equipe TOIT (when host header is set)');
  console.log('   💚 /api/health → Health Check');
  console.log('   🔐 /api/auth/login → Mock Authentication');
  console.log('');
  console.log('🎯 STATUS: DEV SERVER OPERATIONAL');
  console.log('=' .repeat(80));
});