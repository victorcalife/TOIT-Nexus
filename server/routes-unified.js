/**
 * SISTEMA DE ROTAS UNIFICADO E MODULAR
 * Substitui o arquivo gigante routes.ts de 2300+ linhas
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * ARQUITETURA MODULAR:
 * - /routes/auth.js - Autenticação e autorização
 * - /routes/admin.js - Funcionalidades administrativas
 * - /routes/users.js - Gestão de usuários
 * - /routes/tenants.js - Gestão de tenants
 * - /routes/clients.js - Gestão de clientes
 * - /routes/workflows.js - Workflows e automações
 * - /routes/dashboards.js - Dashboards e relatórios
 * - /routes/quantum.js - Sistema Quantum ML
 * - /routes/integrations.js - Integrações externas
 * - /routes/files.js - Upload e gestão de arquivos
 */

const express = require('express');
const path = require('path');
const { authSystem } = require('./auth-unified');

class UnifiedRoutesSystem {
  constructor() {
    this.router = express.Router();
    this.routes = new Map();
    this.middlewares = new Map();
    this.setupRouteModules();
  }

  /**
   * CONFIGURAÇÃO DOS MÓDULOS DE ROTAS
   */
  setupRouteModules() {
    // Definir estrutura modular
    this.routeModules = {
      // CORE SYSTEM
      auth: {
        path: '/auth',
        file: './routes/auth.js',
        description: 'Autenticação, login, logout, sessões',
        middlewares: []
      },
      
      // ADMINISTRATION
      admin: {
        path: '/admin',
        file: './routes/admin.js', 
        description: 'Funcionalidades administrativas',
        middlewares: ['requireAuth', 'requireAdmin']
      },
      
      superAdmin: {
        path: '/super-admin',
        file: './routes/super-admin.js',
        description: 'Funcionalidades de super administrador',
        middlewares: ['requireAuth', 'requireSuperAdmin']
      },

      // USER MANAGEMENT
      users: {
        path: '/users',
        file: './routes/users.js',
        description: 'Gestão de usuários',
        middlewares: ['requireAuth']
      },

      tenants: {
        path: '/tenants',
        file: './routes/tenants.js',
        description: 'Gestão de tenants/empresas',
        middlewares: ['requireAuth', 'requireAdmin']
      },

      clients: {
        path: '/clients',
        file: './routes/clients.js',
        description: 'Gestão de clientes',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      // BUSINESS LOGIC
      workflows: {
        path: '/workflows',
        file: './routes/workflows.js',
        description: 'Workflows e automações',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      tasks: {
        path: '/tasks',
        file: './routes/tasks.js',
        description: 'Gestão de tarefas',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      // ANALYTICS & REPORTING
      dashboards: {
        path: '/dashboards',
        file: './routes/dashboards.js',
        description: 'Dashboards e KPIs',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      reports: {
        path: '/reports',
        file: './routes/reports.js',
        description: 'Relatórios e analytics',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      // QUANTUM & ML SYSTEM
      quantum: {
        path: '/quantum',
        file: './routes/quantum.js',
        description: 'Sistema Quantum ML',
        middlewares: ['requireAuth', 'checkMLCredits']
      },

      quantumML: {
        path: '/quantum-ml',
        file: './routes/quantum-ml.js',
        description: 'Machine Learning avançado',
        middlewares: ['requireAuth', 'checkMLCredits']
      },

      // INTEGRATIONS
      integrations: {
        path: '/integrations',
        file: './routes/integrations.js',
        description: 'Integrações externas (APIs, DBs, Webhooks)',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      databases: {
        path: '/database-connections',
        file: './routes/database-connections.js',
        description: 'Conexões de banco de dados',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      apis: {
        path: '/api-connections',
        file: './routes/api-connections.js',
        description: 'Conexões de APIs externas',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      webhooks: {
        path: '/webhooks',
        file: './routes/webhooks.js',
        description: 'Webhooks e triggers',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      // FILE MANAGEMENT
      files: {
        path: '/files',
        file: './routes/files.js',
        description: 'Upload e gestão de arquivos',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      storage: {
        path: '/storage',
        file: './routes/storage.js',
        description: 'Gestão de storage e quotas',
        middlewares: ['requireAuth']
      },

      // COMMUNICATION
      notifications: {
        path: '/notifications',
        file: './routes/notifications.js',
        description: 'Notificações e alertas',
        middlewares: ['requireAuth']
      },

      calendar: {
        path: '/calendar',
        file: './routes/calendar.js',
        description: 'Integração de calendário',
        middlewares: ['requireAuth', 'requireTenantAccess']
      },

      // BILLING & SUBSCRIPTIONS
      billing: {
        path: '/billing',
        file: './routes/billing.js',
        description: 'Faturamento e assinaturas',
        middlewares: ['requireAuth', 'requireAdmin']
      },

      subscriptions: {
        path: '/subscriptions',
        file: './routes/subscriptions.js',
        description: 'Gestão de planos e assinaturas',
        middlewares: ['requireAuth']
      },

      // SYSTEM UTILITIES
      health: {
        path: '/health',
        file: './routes/health.js',
        description: 'Health checks e status do sistema',
        middlewares: []
      },

      monitoring: {
        path: '/monitoring',
        file: './routes/monitoring.js',
        description: 'Monitoramento e métricas',
        middlewares: ['requireAuth', 'requireAdmin']
      }
    };
  }

  /**
   * APLICAR MIDDLEWARES POR MÓDULO
   */
  applyMiddlewares(moduleConfig) {
    const middlewares = [];

    moduleConfig.middlewares.forEach(middlewareName => {
      switch (middlewareName) {
        case 'requireAuth':
          middlewares.push(authSystem.requireAuth());
          break;
        case 'requireAdmin':
          middlewares.push(authSystem.requireAdmin());
          break;
        case 'requireSuperAdmin':
          middlewares.push(authSystem.requireSuperAdmin());
          break;
        case 'requireTenantAccess':
          middlewares.push(authSystem.requireTenantAccess());
          break;
        case 'checkMLCredits':
          // Implementar middleware de créditos ML
          middlewares.push((req, res, next) => {
            // TODO: Implementar verificação de créditos ML
            next();
          });
          break;
        default:
          console.warn(`⚠️ [ROUTES] Middleware desconhecido: ${middlewareName}`);
      }
    });

    return middlewares;
  }

  /**
   * REGISTRAR MÓDULO DE ROTA
   */
  registerModule(moduleName, moduleConfig) {
    try {
      console.log(`📝 [ROUTES] Registrando módulo: ${moduleName} -> ${moduleConfig.path}`);

      // Aplicar middlewares
      const middlewares = this.applyMiddlewares(moduleConfig);

      // Tentar carregar o arquivo de rota
      try {
        const routeHandler = require(moduleConfig.file);
        
        // Registrar rota com middlewares
        if (middlewares.length > 0) {
          this.router.use(moduleConfig.path, ...middlewares, routeHandler);
        } else {
          this.router.use(moduleConfig.path, routeHandler);
        }

        this.routes.set(moduleName, {
          ...moduleConfig,
          status: 'loaded',
          middlewares: middlewares.length
        });

        console.log(`✅ [ROUTES] Módulo ${moduleName} carregado com sucesso`);

      } catch (fileError) {
        // Se arquivo não existe, criar placeholder
        console.log(`⚠️ [ROUTES] Arquivo ${moduleConfig.file} não encontrado, criando placeholder`);
        
        const placeholderRouter = express.Router();
        placeholderRouter.get('/', (req, res) => {
          res.json({
            module: moduleName,
            status: 'placeholder',
            description: moduleConfig.description,
            message: 'Módulo em desenvolvimento'
          });
        });

        if (middlewares.length > 0) {
          this.router.use(moduleConfig.path, ...middlewares, placeholderRouter);
        } else {
          this.router.use(moduleConfig.path, placeholderRouter);
        }

        this.routes.set(moduleName, {
          ...moduleConfig,
          status: 'placeholder',
          middlewares: middlewares.length
        });
      }

    } catch (error) {
      console.error(`❌ [ROUTES] Erro ao registrar módulo ${moduleName}:`, error);
      this.routes.set(moduleName, {
        ...moduleConfig,
        status: 'error',
        error: error.message
      });
    }
  }

  /**
   * INICIALIZAR TODOS OS MÓDULOS
   */
  initializeAllModules() {
    console.log(`🚀 [ROUTES] Inicializando ${Object.keys(this.routeModules).length} módulos de rotas...`);

    Object.entries(this.routeModules).forEach(([moduleName, moduleConfig]) => {
      this.registerModule(moduleName, moduleConfig);
    });

    // Rota de status dos módulos
    this.router.get('/modules/status', authSystem.requireAdmin(), (req, res) => {
      const moduleStatus = {};
      this.routes.forEach((config, name) => {
        moduleStatus[name] = {
          path: config.path,
          status: config.status,
          description: config.description,
          middlewares: config.middlewares || 0,
          error: config.error || null
        };
      });

      res.json({
        totalModules: this.routes.size,
        loaded: Array.from(this.routes.values()).filter(r => r.status === 'loaded').length,
        placeholders: Array.from(this.routes.values()).filter(r => r.status === 'placeholder').length,
        errors: Array.from(this.routes.values()).filter(r => r.status === 'error').length,
        modules: moduleStatus
      });
    });

    console.log(`✅ [ROUTES] Inicialização concluída!`);
  }

  /**
   * OBTER ROUTER PRINCIPAL
   */
  getRouter() {
    return this.router;
  }

  /**
   * LISTAR ROTAS REGISTRADAS
   */
  listRoutes() {
    return Array.from(this.routes.entries()).map(([name, config]) => ({
      name,
      path: config.path,
      status: config.status,
      description: config.description
    }));
  }
}

// Instância singleton
const routesSystem = new UnifiedRoutesSystem();

module.exports = {
  UnifiedRoutesSystem,
  routesSystem,
  
  // Função para configurar rotas em uma aplicação Express
  setupRoutes: (app) => {
    routesSystem.initializeAllModules();
    app.use('/api', routesSystem.getRouter());
    
    console.log(`🎯 [ROUTES] Sistema de rotas configurado em /api`);
    return routesSystem;
  },
  
  // Utilitários
  listRoutes: () => routesSystem.listRoutes(),
  getRouteStatus: () => routesSystem.routes
};
