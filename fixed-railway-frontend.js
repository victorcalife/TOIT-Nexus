const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// CONFIGURAÇÕES PARA RAILWAY
app.set('trust proxy', true);

// DEBUG E LOGGING DETALHADO
app.use((req, res, next) => {
  console.log(`🔍 [INTEGRATED] ${req.method} ${req.url} | Host: ${req.get('host')} | User-Agent: ${req.get('user-agent')?.substring(0, 50)}...`);
  next();
});

// JSON middleware para APIs
app.use(express.json());
app.use(express.urlencoded({ false }));

// SERVIR ASSETS ESTÁTICOS DO REACT BUILDADO
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// ROTEAMENTO POR DOMÍNIO NA ROTA RAIZ
app.get('/', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host || 'localhost';
  
  console.log(`🌐 Frontend Root - Host: ${realHost} | Path: ${req.originalUrl}`);
  
  // SUPNEXUS (equipe TOIT) → React app sempre
  if (realHost.includes('supnexus.toit.com.br') || realHost.includes('supnexus')) {
    console.log(`👥 [SUPNEXUS] Servindo React app para equipe TOIT`);
    
    const distIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    
    if (fs.existsSync(distIndexPath)) {
      console.log(`✅ [SUPNEXUS] Servindo React app buildado: ${distIndexPath}`);
      return res.sendFile(distIndexPath);
    } else {
      console.error(`❌ [SUPNEXUS] React app não encontrado`);
      return res.status(404).send(`
        <h1>Sistema TOIT Indisponível</h1>
        <p>Portal da equipe TOIT temporariamente indisponível</p>
        <p>React app não foi buildado corretamente</p>
      `);
    }
  }
  
  // NEXUS (clientes) → Landing page sempre  
  console.log(`🎯 [NEXUS] Servindo landing page para: ${realHost}`);
  
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPath)) {
    return res.sendFile(landingPath);
  } else {
    return res.status(404).send(`
      <h1>Arquivo não encontrado</h1>
      <p>nexus-quantum-landing.html não existe no diretório</p>
      <p>Diretório: ${__dirname}</p>
    `);
  }
});

// HEALTH CHECK API
app.get('/api/health', (req, res) => {
  console.log('💚 Health check requisitado via servidor integrado');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TOIT NEXUS Integrated Server - WORKING',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    host: req.get('host')
  });
});

// SPA FALLBACK para React Router
app.get('*', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host || 'localhost';
  
  // Se é API, deve ter sido tratado anteriormente
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint não encontrado'
    });
  }
  
  // Se é supnexus, serve o React app para qualquer rota (SPA)
  if (realHost.includes('supnexus.toit.com.br') || realHost.includes('supnexus')) {
    console.log(`🎯 [SUPNEXUS SPA] Fallback para React Router: ${req.originalUrl}`);
    
    const distIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    
    if (fs.existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    } else {
      return res.status(404).send('React app não encontrado');
    }
  }
  
  // Para nexus.toit.com.br e localhost, serve a landing page
  console.log(`🎯 [NEXUS] Servindo landing page para rota: ${req.originalUrl}`);
  
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPath)) {
    return res.sendFile(landingPath);
  } else {
    return res.status(404).send('Landing page não encontrada');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(80));
  console.log('🚀 TOIT NEXUS INTEGRATED SERVER - INICIADO COM SUCESSO');
  console.log('='.repeat(80));
  console.log(`🌐 Servidor rodando na porta: ${port}`);
  console.log(`📁 Diretório raiz: ${__dirname}`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('🔗 ENDPOINTS PRINCIPAIS:');
  console.log('   🌐 https://nexus.toit.com.br → Landing Page');
  console.log('   👥 https://supnexus.toit.com.br → Portal Equipe TOIT');
  console.log('   💚 /api/health → Health Check');
  console.log('');
  console.log('🎯 STATUS: SISTEMA INTEGRADO 100% OPERACIONAL - V2.0');
  console.log('='.repeat(80));
});