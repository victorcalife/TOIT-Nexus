const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting TOIT Nexus server with verbose logging...');

const app = express();
const port = process.env.PORT || 8080;

console.log(`🔧 Configured port: ${port}`);

// CONFIGURAÇÕES PARA RAILWAY
app.set('trust proxy', true);
console.log('✅ Trust proxy configured');

// DEBUG E LOGGING DETALHADO
app.use((req, res, next) => {
  console.log(`🔍 [INTEGRATED] ${req.method} ${req.url} | Host: ${req.get('host')} | User-Agent: ${req.get('user-agent')?.substring(0, 50)}...`);
  next();
});

console.log('✅ Debug logging middleware configured');

// CORS middleware para permitir requisições
app.use((req, res, next) => {
  const origin = req.get('origin');
  const allowedOrigins = [
    'https://nexus.toit.com.br',
    'https://supnexus.toit.com.br',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  console.log(`🔒 [CORS] Origin: ${origin} | Allowed: ${allowedOrigins.includes(origin || '')}`);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

console.log('✅ CORS middleware configured');

// JSON middleware para APIs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('✅ Express JSON middleware configured');

// =========================
// SEÇÃO: BACKEND APIs
// =========================

console.log('🚀 Initializing integrated backend APIs...');

// IMPORTAR E CONFIGURAR BACKEND APIs
let backendInitialized = false;

async function initializeBackend() {
  try {
    console.log('📡 Loading integrated backend APIs...');
    
    // DEBUG ROUTE - CONFIRMAR SE SERVIDOR INTEGRADO ESTÁ ATIVO
    app.get('/api/debug-integrated', (req, res) => {
      console.log('🐛 DEBUG: Integrated server is WORKING!');
      res.json({
        success: true,
        message: 'INTEGRATED SERVER IS ACTIVE!',
        timestamp: new Date().toISOString(),
        service: 'TOIT NEXUS Integrated Server',
        version: '2.0-DEBUG',
        environment: process.env.NODE_ENV || 'development',
        host: req.get('host'),
        originalUrl: req.originalUrl,
        method: req.method
      });
    });

    // HEALTH CHECK API
    app.get('/api/health', (req, res) => {
      console.log('💚 Health check requested via integrated server');
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'TOIT NEXUS Integrated Server - WORKING',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        integrated: true,
        host: req.get('host')
      });
    });

    backendInitialized = true;
    console.log('✅ Backend APIs integrated successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing backend:', error);
  }
}

// Inicializar backend
initializeBackend();

// =========================
// SEÇÃO: FRONTEND PROXY
// =========================

console.log('🌐 Configuring frontend proxy...');

// ROTEAMENTO POR DOMÍNIO NA ROTA RAIZ
app.get('/', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  console.log(`🌐 Frontend Root - Host: ${realHost} | Path: ${req.originalUrl}`);
  
  // SUPNEXUS (equipe TOIT) → React app sempre
  if (realHost === 'supnexus.toit.com.br') {
    console.log(`👥 [SUPNEXUS] Serving React app for TOIT team`);
    
    const distIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    const devIndexPath = path.join(__dirname, 'client', 'index.html');
    
    if (fs.existsSync(distIndexPath)) {
      console.log(`✅ [SUPNEXUS] Serving built React app: ${distIndexPath}`);
      return res.sendFile(distIndexPath);
    } else if (fs.existsSync(devIndexPath)) {
      console.log(`⚠️ [SUPNEXUS] Serving React dev app: ${devIndexPath}`);
      return res.sendFile(devIndexPath);
    } else {
      console.error(`❌ [SUPNEXUS] React app not found`);
      return res.status(404).send(`
        <h1>TOIT NEXUS System Unavailable</h1>
        <p>TOIT team portal temporarily unavailable</p>
        <p>React app not built correctly</p>
        <p>Run: npm run build</p>
      `);
    }
  }
  
  // NEXUS (clientes) → Landing page sempre  
  console.log(`🎯 [NEXUS] Serving landing page for: ${realHost}`);
  
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

// SERVIR ASSETS ESTÁTICOS DO REACT BUILDADO
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// FALLBACK PARA DEV (se dist/ não existir)
app.use('/src', express.static(path.join(__dirname, 'client', 'src')));
app.use('/public', express.static(path.join(__dirname, 'client', 'public')));
app.use('/assets', express.static(path.join(__dirname, 'client', 'assets')));

// SERVIR ASSETS GERAIS
app.use('/favicon.svg', express.static(path.join(__dirname, 'client', 'public', 'favicon.svg')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'client', 'public', 'favicon.ico')));

// SPA FALLBACK para React Router (supnexus apenas)
app.get('*', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  // Se é API, deve ter sido tratado anteriormente
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      availableEndpoints: ['/api/health', '/api/debug-integrated']
    });
  }
  
  // Se é supnexus, serve o React app para qualquer rota (SPA)
  if (realHost === 'supnexus.toit.com.br') {
    console.log(`🎯 [SUPNEXUS SPA] Fallback to React Router: ${req.originalUrl}`);
    
    const distIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    const devIndexPath = path.join(__dirname, 'client', 'index.html');
    
    if (fs.existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    } else if (fs.existsSync(devIndexPath)) {
      return res.sendFile(devIndexPath);
    } else {
      return res.status(404).send('React app not found - run npm run build');
    }
  }
  
  // Para outros hosts, 404
  res.status(404).send('Page not found');
});

console.log('✅ Frontend proxy configured');

// Start server
console.log('🚀 Starting server...');
app.listen(port, () => {
  console.log('='.repeat(80));
  console.log('🚀 TOIT NEXUS INTEGRATED SERVER - SUCCESSFULLY STARTED');
  console.log('='.repeat(80));
  console.log(`🌐 Server running on port: ${port}`);
  console.log(`📁 Root directory: ${__dirname}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📡 ACTIVE SERVICES:');
  console.log('   ✅ Frontend Proxy (nexus.toit.com.br → Landing)');
  console.log('   ✅ React SPA (supnexus.toit.com.br → Admin)');
  console.log(`   ✅ Backend APIs (${backendInitialized ? 'WORKING' : 'INITIALIZING...'})`);
  console.log('');
  console.log('🔗 MAIN ENDPOINTS:');
  console.log('   🌐 https://nexus.toit.com.br → Landing Page');
  console.log('   👥 https://supnexus.toit.com.br → TOIT Team Portal');
  console.log('   💚 /api/health → Health Check');
  console.log('   🐛 /api/debug-integrated → Debug Endpoint');
  console.log('');
  console.log('🎯 STATUS: INTEGRATED SYSTEM 100% OPERATIONAL - V2.0');
  console.log('='.repeat(80));
});

console.log('✅ Server start command issued');