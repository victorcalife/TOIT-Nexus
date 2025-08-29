/**
 * SERVIDOR DE TESTE UNIFICADO - CARREGAMENTO INCREMENTAL
 * Testa cada componente do sistema unificado separadamente
 */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-session-key';

console.log('🚀 Iniciando servidor de teste unificado...');

// PASSO 1: Middlewares básicos
try {
  console.log('🔧 [PASSO 1] Configurando middlewares básicos...');
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  console.log('✅ [PASSO 1] Middlewares básicos OK');
} catch (error) {
  console.error('❌ [PASSO 1] Erro nos middlewares básicos:', error.message);
  process.exit(1);
}

// PASSO 2: Sistema de autenticação
try {
  console.log('🔐 [PASSO 2] Carregando sistema de autenticação...');
  
  const { authSystem, setupPassport } = require('./auth-unified');
  
  console.log('✅ [PASSO 2] Sistema de autenticação carregado');
} catch (error) {
  console.error('❌ [PASSO 2] Erro no sistema de autenticação:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// PASSO 3: Sistema de middlewares
try {
  console.log('🔧 [PASSO 3] Carregando sistema de middlewares...');
  
  const { 
    corsMiddleware,
    loggingMiddleware,
    tenantMiddleware,
    quantumMiddleware,
    errorHandlingMiddleware,
    securityMiddleware
  } = require('./middleware-unified');
  
  console.log('✅ [PASSO 3] Sistema de middlewares carregado');
} catch (error) {
  console.error('❌ [PASSO 3] Erro no sistema de middlewares:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// PASSO 4: Sistema de rotas
try {
  console.log('🛣️ [PASSO 4] Carregando sistema de rotas...');
  
  const { setupRoutes } = require('./routes-unified');
  
  console.log('✅ [PASSO 4] Sistema de rotas carregado');
} catch (error) {
  console.error('❌ [PASSO 4] Erro no sistema de rotas:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// PASSO 5: Configurar sessões
try {
  console.log('🔑 [PASSO 5] Configurando sessões...');
  
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  }));
  
  console.log('✅ [PASSO 5] Sessões configuradas');
} catch (error) {
  console.error('❌ [PASSO 5] Erro nas sessões:', error.message);
  process.exit(1);
}

// PASSO 6: Configurar Passport
try {
  console.log('🛂 [PASSO 6] Configurando Passport...');
  
  const { setupPassport } = require('./auth-unified');
  setupPassport();
  app.use(passport.initialize());
  app.use(passport.session());
  
  console.log('✅ [PASSO 6] Passport configurado');
} catch (error) {
  console.error('❌ [PASSO 6] Erro no Passport:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// PASSO 7: Configurar rotas
try {
  console.log('🛣️ [PASSO 7] Configurando rotas...');
  
  const { setupRoutes } = require('./routes-unified');
  setupRoutes(app);
  
  console.log('✅ [PASSO 7] Rotas configuradas');
} catch (error) {
  console.error('❌ [PASSO 7] Erro ao configurar rotas:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor unificado funcionando',
    timestamp: new Date().toISOString(),
    port: PORT
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
  console.log(`✅ Servidor unificado rodando na porta ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;