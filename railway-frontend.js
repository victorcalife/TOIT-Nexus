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


// ROTA ESPECÍFICA PARA EQUIPE TOIT - SERVIR REACT APP DIRETAMENTE
app.get('/team', (req, res) => {
  console.log(`👥 [TEAM] Servindo React app diretamente do frontend`);
  
  const clientIndexPath = path.join(__dirname, 'client', 'index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    console.log(`✅ [TEAM] Servindo React app: ${clientIndexPath}`);
    res.sendFile(clientIndexPath);
  } else {
    console.error(`❌ [TEAM] Client index.html não encontrado: ${clientIndexPath}`);
    res.status(404).send(`
      <h1>Sistema TOIT Indisponível</h1>
      <p>React app não encontrado</p>
      <p>Tentando: ${clientIndexPath}</p>
      <p>Contate o administrador do sistema</p>
    `);
  }
});

// Para outras rotas (EXCETO /team), redirecionar para o backend  
app.use('*', (req, res) => {
  // Evitar loops - não interceptar rotas que já foram processadas
  if (req.originalUrl === '/team') {
    return res.status(404).send('<h1>Rota /team deveria ter sido processada acima</h1>');
  }
  
  console.log(`🔄 Redirecionando ${req.originalUrl} para backend`);
  res.redirect(`https://toit-nexus-backend-main.up.railway.app${req.originalUrl}`);
});

app.listen(port, () => {
  console.log(`🚀 Railway Frontend rodando na porta ${port}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`📄 Arquivo alvo: nexus-quantum-landing.html`);
});