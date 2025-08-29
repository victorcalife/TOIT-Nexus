/**
 * SERVIDOR SIMPLES PARA TESTE
 * Verifica se o problema está na configuração básica do Express
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste simples
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Rota de teste de autenticação
app.get('/api/auth/me', (req, res) => {
  res.json({
    message: 'Endpoint de autenticação funcionando',
    user: null
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Test: http://localhost:${PORT}/api/auth/me`);
});

module.exports = app;