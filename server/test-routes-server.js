/**
 * SERVIDOR DE TESTE PARA SISTEMA DE ROTAS UNIFICADO
 * Testa especificamente o routes-unified.js para identificar o erro
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor de teste de rotas...');

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middlewares básicos configurados');

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor de teste funcionando',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Rota de health check configurada');

try {
  console.log('🔄 Tentando carregar sistema de rotas unificado...');
  
  // Tentar carregar o sistema de rotas
  const { routesSystem } = require('./routes-unified');
  
  console.log('✅ Sistema de rotas carregado com sucesso');
  
  // Configurar rotas
  app.use('/api', routesSystem.getRouter());
  
  console.log('✅ Rotas configuradas');
  
} catch (error) {
  console.error('❌ ERRO ao carregar sistema de rotas:');
  console.error('Tipo do erro:', error.constructor.name);
  console.error('Mensagem:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Continuar sem as rotas unificadas
  app.get('/api/error-info', (req, res) => {
    res.status(500).json({
      error: 'Erro no sistema de rotas',
      type: error.constructor.name,
      message: error.message,
      stack: error.stack
    });
  });
}

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
    stack: err.stack
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`❌ Error Info: http://localhost:${PORT}/api/error-info`);
});

module.exports = app;