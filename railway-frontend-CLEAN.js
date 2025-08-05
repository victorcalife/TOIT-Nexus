const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// SIMPLES: Servir arquivos estáticos primeiro
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// ROTA ÚNICA: Tudo vai para index.html (SPA)
app.get('*', (req, res) => {
  const host = req.get('host');
  const xForwardedHost = req.get('x-forwarded-host');
  const realHost = xForwardedHost || host;
  
  console.log(`🌐 Request: ${realHost}${req.originalUrl}`);
  
  // SUPNEXUS = React App
  if (realHost === 'supnexus.toit.com.br') {
    const reactApp = path.join(__dirname, 'client', 'dist', 'index.html');
    
    if (fs.existsSync(reactApp)) {
      console.log(`✅ Servindo React App: ${reactApp}`);
      return res.sendFile(reactApp);
    } else {
      return res.status(404).send('React app não encontrado');
    }
  }
  
  // NEXUS = Landing Page
  const landingPage = path.join(__dirname, 'nexus-quantum-landing.html');
  
  if (fs.existsSync(landingPage)) {
    console.log(`✅ Servindo Landing Page: ${landingPage}`);
    return res.sendFile(landingPage);
  } else {
    return res.status(404).send('Landing page não encontrada');
  }
});

app.listen(port, () => {
  console.log(`🚀 Railway Frontend CLEAN rodando na porta ${port}`);
  console.log(`📁 Diretório: ${__dirname}`);
});