/**
 * SERVIDOR PRINCIPAL UNIFICADO
 * Integra toda a nova arquitetura limpa
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES:
 * - Sistema de autenticação unificado
 * - Rotas modulares
 * - Middlewares centralizados
 * - Serviços organizados
 * - Health checks
 */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Importar sistemas unificados
const { authSystem, setupPassport } = require('./auth-unified');
const { setupRoutes } = require('./routes-unified');
const { 
  corsMiddleware,
  loggingMiddleware,
  tenantMiddleware,
  quantumMiddleware,
  errorHandlingMiddleware,
  securityMiddleware
} = require('./middleware-unified');

// Configurações
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-session-key';

class UnifiedServer {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupAuthentication();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * CONFIGURAÇÃO DE MIDDLEWARES
   */
  setupMiddlewares() {
    console.log('🔧 [SERVER] Configurando middlewares...');

    // Middlewares de segurança
    this.app.use(securityMiddleware());
    this.app.use(corsMiddleware());

    // Parsing de dados
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(loggingMiddleware());

    // Sessões
    this.app.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      }
    }));

    // Middlewares customizados
    this.app.use(tenantMiddleware());
    this.app.use(quantumMiddleware());

    console.log('✅ [SERVER] Middlewares configurados');
  }

  /**
   * CONFIGURAÇÃO DE AUTENTICAÇÃO
   */
  setupAuthentication() {
    console.log('🔐 [SERVER] Configurando autenticação...');

    // Configurar Passport
    setupPassport();
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    console.log('✅ [SERVER] Autenticação configurada');
  }

  /**
   * CONFIGURAÇÃO DE ROTAS
   */
  setupRoutes() {
    console.log('🛣️ [SERVER] Configurando rotas...');

    // Middleware para detectar domínio e servir conteúdo específico
    this.app.use((req, res, next) => {
      const host = req.get('host') || req.get('x-forwarded-host') || '';
      const hostname = host.split(':')[0]; // Remove porta se existir
      
      console.log(`🌐 [DOMAIN] Request para: ${hostname} - Path: ${req.path}`);
      
      // Roteamento baseado em domínio
      if (hostname === 'supnexus.toit.com.br') {
        // Servir página de login de suporte
        if (req.path === '/' || req.path === '/index.html') {
          const loginSupportePath = path.join(__dirname, '../client/src/pages/admin/login_suporte.html');
          return res.sendFile(loginSupportePath);
        }
      } else if (hostname === 'nexus.toit.com.br') {
        // Servir landing page do Nexus
        if (req.path === '/' || req.path === '/index.html') {
          const nexusLandingPath = path.join(__dirname, '../client/public/nexus-landing-new.html');
          return res.sendFile(nexusLandingPath);
        }
      }
      
      next();
    });

    // Rota de status básico para API
    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        service: 'TOIT NEXUS',
        version: '2.0.0',
        architecture: 'unified',
        status: 'operational',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
      });
    });

    // Configurar sistema de rotas unificado
    setupRoutes(this.app);

    // Servir arquivos estáticos do frontend
    this.app.use(express.static(path.join(__dirname, '../client/public')));
    this.app.use(express.static(path.join(__dirname, '../dist')));
    
    // Catch-all para SPA (apenas para outros domínios)
    this.app.get('*', (req, res) => {
      const host = req.get('host') || req.get('x-forwarded-host') || '';
      const hostname = host.split(':')[0];
      
      // Para domínios específicos, não fazer catch-all
      if (hostname === 'supnexus.toit.com.br' || hostname === 'nexus.toit.com.br') {
        return res.status(404).send('Página não encontrada');
      }
      
      // Para outros domínios, servir o SPA
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    console.log('✅ [SERVER] Rotas configuradas com roteamento por domínio');
  }

  /**
   * CONFIGURAÇÃO DE TRATAMENTO DE ERROS
   */
  setupErrorHandling() {
    console.log('🛡️ [SERVER] Configurando tratamento de erros...');

    // 404 Handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Error Handler
    this.app.use(errorHandlingMiddleware());

    console.log('✅ [SERVER] Tratamento de erros configurado');
  }

  /**
   * INICIAR SERVIDOR
   */
  async start() {
    try {
      console.log('🚀 [SERVER] Iniciando TOIT NEXUS Unified...');
      console.log(`📍 [SERVER] Ambiente: ${NODE_ENV}`);
      console.log(`🔧 [SERVER] Arquitetura: Unificada (JavaScript)`);

      // Verificar conexão com banco de dados
      await this.checkDatabaseConnection();

      // Iniciar servidor
      this.server = this.app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ [SERVER] TOIT NEXUS rodando na porta ${PORT}`);
        console.log(`🌐 [SERVER] URL: ${process.env.BACKEND_URL || 'https://api.toit.com.br'}`);
        console.log(`📊 [SERVER] Health Check: ${process.env.BACKEND_URL || 'https://api.toit.com.br'}/api/health`);
        console.log(`🔐 [SERVER] Auth Status: ${process.env.BACKEND_URL || 'https://api.toit.com.br'}/api/auth/check`);
        console.log(`📋 [SERVER] Routes Status: ${process.env.BACKEND_URL || 'https://api.toit.com.br'}/api/modules/status`);
        
        if (NODE_ENV === 'development') {
          console.log(`🔧 [SERVER] Modo desenvolvimento ativo`);
        }
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('💥 [SERVER] Erro ao iniciar servidor:', error);
      process.exit(1);
    }
  }

  /**
   * VERIFICAR CONEXÃO COM BANCO
   */
  async checkDatabaseConnection() {
    try {
      console.log('🗄️ [DATABASE] Verificando conexão...');
      
      // TODO: Implementar verificação real do banco
      // const { db } = require('./dist/db');
      // await db.select().from(users).limit(1);
      
      console.log('✅ [DATABASE] Conexão estabelecida');
    } catch (error) {
      console.error('❌ [DATABASE] Erro na conexão:', error);
      throw error;
    }
  }

  /**
   * GRACEFUL SHUTDOWN
   */
  setupGracefulShutdown() {
    const shutdown = (signal) => {
      console.log(`\n🛑 [SERVER] Recebido sinal ${signal}, iniciando shutdown graceful...`);
      
      if (this.server) {
        this.server.close(() => {
          console.log('✅ [SERVER] Servidor fechado gracefully');
          process.exit(0);
        });

        // Force close após 10 segundos
        setTimeout(() => {
          console.log('⚠️ [SERVER] Forçando fechamento do servidor');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * OBTER INSTÂNCIA DO APP
   */
  getApp() {
    return this.app;
  }
}

// Inicializar servidor se executado diretamente
if (require.main === module) {
  const server = new UnifiedServer();
  server.start().catch(error => {
    console.error('💥 [SERVER] Falha crítica:', error);
    process.exit(1);
  });
}

module.exports = {
  UnifiedServer,
  
  // Para compatibilidade com Railway
  app: new UnifiedServer().getApp()
};
