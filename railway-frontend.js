const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Middleware para servir APENAS nexus-quantum-landing.html para QUALQUER requisição
app.use('*', (req, res) => {
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

app.listen(port, () => {
  console.log(`🚀 Railway Frontend rodando na porta ${port}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`📄 Arquivo alvo: nexus-quantum-landing.html`);
});