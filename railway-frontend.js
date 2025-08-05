const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// ROTEAMENTO POR DOMÍNIO NA ROTA RAIZ
app.get('/', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  console.log(`🌐 Railway Frontend - Host: ${realHost} | Path: ${req.originalUrl}`);
  
  // SUPNEXUS (equipe TOIT) → React app sempre
  if (realHost === 'supnexus.toit.com.br') {
    console.log(`👥 [SUPNEXUS] Servindo React app para equipe TOIT`);
    
    const clientIndexPath = path.join(__dirname, 'client', 'index.html');
    
    if (fs.existsSync(clientIndexPath)) {
      console.log(`✅ [SUPNEXUS] Servindo React app: ${clientIndexPath}`);
      return res.sendFile(clientIndexPath);
    } else {
      console.error(`❌ [SUPNEXUS] Client index.html não encontrado: ${clientIndexPath}`);
      return res.status(404).send(`
        <h1>Sistema TOIT Indisponível</h1>
        <p>Portal da equipe TOIT temporariamente indisponível</p>
        <p>Contate o administrador do sistema</p>
      `);
    }
  }
  
  // NEXUS (clientes) → Landing page sempre  
  console.log(`🎯 [NEXUS] Servindo landing page para: ${realHost}`);
  
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    res.status(404).send(`
      <h1>Arquivo não encontrado</h1>
      <p>nexus-quantum-landing.html não existe no diretório</p>
      <p>Diretório: ${__dirname}</p>
      <p>Arquivos: ${fs.readdirSync(__dirname).join(', ')}</p>
    `);
  }
});

// SERVIR ASSETS ESTÁTICOS DO REACT (ANTES DE REDIRECIONAR)
app.use('/src', express.static(path.join(__dirname, 'client', 'src')));
app.use('/public', express.static(path.join(__dirname, 'client', 'public')));
app.use('/assets', express.static(path.join(__dirname, 'client', 'assets')));
app.use('/node_modules', express.static(path.join(__dirname, 'client', 'node_modules')));

// SERVIR ASSETS GERAIS (favicon, etc)
app.use('/favicon.svg', express.static(path.join(__dirname, 'client', 'public', 'favicon.svg')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'client', 'public', 'favicon.ico')));

// Para rotas de API, redirecionar para o backend  
app.use('/api/*', (req, res) => {
  console.log(`🔄 Redirecionando API ${req.originalUrl} para backend`);
  res.redirect(`https://toit-nexus-backend-main.up.railway.app${req.originalUrl}`);
});

// SPA FALLBACK para React Router (supnexus apenas)
app.get('*', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  // Se é supnexus, serve o React app para qualquer rota (SPA)
  if (realHost === 'supnexus.toit.com.br') {
    console.log(`🎯 [SUPNEXUS SPA] Fallback para React Router: ${req.originalUrl}`);
    const clientIndexPath = path.join(__dirname, 'client', 'index.html');
    
    if (fs.existsSync(clientIndexPath)) {
      return res.sendFile(clientIndexPath);
    } else {
      return res.status(404).send('React app não encontrado');
    }
  }
  
  // Para outros hosts, 404
  res.status(404).send('Página não encontrada');
});

app.listen(port, () => {
  console.log(`🚀 Railway Frontend rodando na porta ${port}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`📄 Arquivo alvo: nexus-quantum-landing.html`);
});