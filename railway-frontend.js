const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Servir landing page apenas para rota raiz
app.get('/', (req, res) => {
  console.log(`🎯 Railway Frontend - Serving landing page for: ${req.originalUrl}`);
  
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

// Servir página de login usando aplicação React
app.get('/login', (req, res) => {
  console.log(`🔐 Railway Frontend - Serving login page for: ${req.originalUrl}`);
  
  const clientIndexPath = path.join(__dirname, 'client', 'index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.status(404).send(`
      <h1>Página de login não encontrada</h1>
      <p>client/index.html não existe</p>
      <p>Tentativa de acesso: ${clientIndexPath}</p>
    `);
  }
});

// Servir arquivos estáticos do React
app.use('/src', express.static(path.join(__dirname, 'client/src')));
app.use('/assets', express.static(path.join(__dirname, 'client/src/assets')));

// Para outras rotas, redirecionar para o backend
app.use('*', (req, res) => {
  console.log(`🔄 Redirecionando ${req.originalUrl} para backend`);
  res.redirect(`https://toit-nexus-backend-main.up.railway.app${req.originalUrl}`);
});

app.listen(port, () => {
  console.log(`🚀 Railway Frontend rodando na porta ${port}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`📄 Arquivo alvo: nexus-quantum-landing.html`);
});