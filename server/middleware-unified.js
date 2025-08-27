/**
 * SISTEMA DE MIDDLEWARES UNIFICADO
 * Consolida TODOS os middlewares em um sistema centralizado
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * MIDDLEWARES CONSOLIDADOS:
 * - Auth Middlewares (authMiddleware.js/ts)
 * - Tenant Middleware (tenantMiddleware.ts)
 * - Quantum Middleware (quantumMiddleware.js)
 * - ML Credits Middleware (checkMLCredits.js)
 * - Performance Monitoring
 * - Rate Limiting
 * - Error Handling
 * - Logging
 */

const { authSystem } = require('./auth-unified');

class UnifiedMiddlewareSystem {
  constructor() {
    this.performanceMetrics = new Map();
    this.rateLimitStore = new Map();
    this.setupMiddlewares();
  }

  /**
   * CONFIGURAÇÃO INICIAL DOS MIDDLEWARES
   */
  setupMiddlewares() {
    console.log('🔧 [MIDDLEWARE] Inicializando sistema de middlewares unificado...');
  }

  /**
   * MIDDLEWARE DE CORS UNIFICADO
   */
  corsMiddleware() {
    return (req, res, next) => {
      // Configuração CORS baseada no ambiente
      const allowedOrigins = [
        'https://nexus.toit.com.br',
        'https://supnexus.toit.com.br',
        'https://admin.toit.com.br'
      ];

      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, X-API-Key');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

      // Responder a preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      next();
    };
  }

  /**
   * MIDDLEWARE DE LOGGING UNIFICADO
   */
  loggingMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Adicionar ID da requisição
      req.requestId = requestId;
      res.setHeader('X-Request-ID', requestId);

      // Log da requisição
      console.log(`📥 [${requestId}] ${req.method} ${req.url} - ${req.ip} - ${req.headers['user-agent']?.substring(0, 50) || 'Unknown'}`);

      // Interceptar resposta para log
      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - startTime;
        console.log(`📤 [${requestId}] ${res.statusCode} - ${duration}ms`);
        
        // Registrar métricas de performance
        this.recordPerformanceMetric(req.url, duration, res.statusCode);
        
        return originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }

  /**
   * MIDDLEWARE DE TENANT UNIFICADO
   * Consolida tenantMiddleware.ts
   */
  tenantMiddleware() {
    return async (req, res, next) => {
      try {
        // Extrair tenant ID de diferentes fontes
        let tenantId = req.headers['x-tenant-id'] || 
                      req.query.tenantId || 
                      req.body.tenantId ||
                      req.params.tenantId;

        // Para super admins, permitir acesso sem tenant específico
        if (req.user && (req.user.role === 'super_admin' || req.user.role === 'toit_admin')) {
          req.tenant = {
            id: tenantId || 'global',
            isGlobal: true,
            hasGlobalAccess: true
          };
          return next();
        }

        // Para usuários normais, usar tenant do usuário se não especificado
        if (!tenantId && req.user && req.user.tenantId) {
          tenantId = req.user.tenantId;
        }

        if (tenantId) {
          // TODO: Buscar dados do tenant no banco
          req.tenant = {
            id: tenantId,
            isGlobal: false,
            hasGlobalAccess: false
          };
        }

        next();
      } catch (error) {
        console.error(`💥 [TENANT] Erro no middleware de tenant:`, error);
        res.status(500).json({
          error: 'Erro interno no processamento de tenant',
          code: 'TENANT_ERROR'
        });
      }
    };
  }

  /**
   * MIDDLEWARE DE QUANTUM PERFORMANCE
   * Consolida quantumMiddleware.js
   */
  quantumMiddleware() {
    return (req, res, next) => {
      // Headers quânticos para otimização
      res.setHeader('X-Quantum-Engine', 'TOIT-NEXUS-v1.0');
      res.setHeader('X-Performance-Mode', 'quantum');
      
      // Rotas que se beneficiam de otimização quântica
      const quantumRoutes = [
        '/api/workflows',
        '/api/reports', 
        '/api/quantum',
        '/api/quantum-ml',
        '/api/dashboards'
      ];

      const isQuantumRoute = quantumRoutes.some(route => req.url.startsWith(route));
      
      if (isQuantumRoute) {
        // Aplicar otimizações quânticas
        res.setHeader('X-Quantum-Optimized', 'true');
        req.quantumOptimized = true;
        
        console.log(`⚡ [QUANTUM] Otimização aplicada para: ${req.url}`);
      }

      next();
    };
  }

  /**
   * MIDDLEWARE DE CRÉDITOS ML
   * Consolida checkMLCredits.js
   */
  checkMLCredits(creditsRequired = 1, options = {}) {
    return async (req, res, next) => {
      try {
        // Super admins têm créditos ilimitados
        if (req.user && (req.user.role === 'super_admin' || req.user.role === 'toit_admin')) {
          req.mlCredits = {
            available: Infinity,
            required: creditsRequired,
            sufficient: true,
            unlimited: true
          };
          return next();
        }

        const tenantId = req.tenant?.id || req.user?.tenantId;
        
        if (!tenantId) {
          return res.status(400).json({
            error: 'Tenant ID requerido para verificação de créditos ML',
            code: 'TENANT_REQUIRED'
          });
        }

        // TODO: Implementar verificação real de créditos ML
        const availableCredits = 10; // Placeholder
        const sufficient = availableCredits >= creditsRequired;

        req.mlCredits = {
          available: availableCredits,
          required: creditsRequired,
          sufficient,
          unlimited: false
        };

        if (!sufficient && !options.allowViewOnly) {
          return res.status(402).json({
            error: 'Créditos ML insuficientes',
            code: 'INSUFFICIENT_ML_CREDITS',
            available: availableCredits,
            required: creditsRequired
          });
        }

        next();
      } catch (error) {
        console.error(`💥 [ML-CREDITS] Erro na verificação:`, error);
        res.status(500).json({
          error: 'Erro interno na verificação de créditos ML',
          code: 'ML_CREDITS_ERROR'
        });
      }
    };
  }

  /**
   * MIDDLEWARE DE RATE LIMITING
   */
  rateLimitMiddleware(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutos
      maxRequests = 100,
      message = 'Muitas requisições, tente novamente mais tarde'
    } = options;

    return (req, res, next) => {
      const key = req.ip + ':' + (req.user?.id || 'anonymous');
      const now = Date.now();
      
      // Limpar entradas antigas
      this.cleanupRateLimit(now - windowMs);
      
      // Verificar limite atual
      const userRequests = this.rateLimitStore.get(key) || [];
      const recentRequests = userRequests.filter(time => time > now - windowMs);
      
      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      // Registrar nova requisição
      recentRequests.push(now);
      this.rateLimitStore.set(key, recentRequests);
      
      // Headers informativos
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - recentRequests.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      next();
    };
  }

  /**
   * MIDDLEWARE DE TRATAMENTO DE ERROS
   */
  errorHandlingMiddleware() {
    return (error, req, res, next) => {
      console.error(`💥 [ERROR] ${req.requestId || 'unknown'} - ${error.stack}`);

      // Erro de validação
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: error.details
        });
      }

      // Erro de autenticação
      if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
          error: 'Não autorizado',
          code: 'UNAUTHORIZED'
        });
      }

      // Erro de permissão
      if (error.name === 'ForbiddenError') {
        return res.status(403).json({
          error: 'Acesso negado',
          code: 'FORBIDDEN'
        });
      }

      // Erro genérico
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        requestId: req.requestId
      });
    };
  }

  /**
   * MIDDLEWARE DE SEGURANÇA
   */
  securityMiddleware() {
    return (req, res, next) => {
      // Headers de segurança
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // CSP básico
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
      
      next();
    };
  }

  /**
   * UTILITÁRIOS
   */
  recordPerformanceMetric(url, duration, statusCode) {
    const key = `${url}:${statusCode}`;
    const metrics = this.performanceMetrics.get(key) || { count: 0, totalDuration: 0, avgDuration: 0 };
    
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.avgDuration = Math.round(metrics.totalDuration / metrics.count);
    
    this.performanceMetrics.set(key, metrics);
  }

  cleanupRateLimit(cutoffTime) {
    for (const [key, requests] of this.rateLimitStore.entries()) {
      const recentRequests = requests.filter(time => time > cutoffTime);
      if (recentRequests.length === 0) {
        this.rateLimitStore.delete(key);
      } else {
        this.rateLimitStore.set(key, recentRequests);
      }
    }
  }

  getPerformanceMetrics() {
    return Object.fromEntries(this.performanceMetrics);
  }
}

// Instância singleton
const middlewareSystem = new UnifiedMiddlewareSystem();

module.exports = {
  UnifiedMiddlewareSystem,
  middlewareSystem,
  
  // Middlewares exportados
  corsMiddleware: () => middlewareSystem.corsMiddleware(),
  loggingMiddleware: () => middlewareSystem.loggingMiddleware(),
  tenantMiddleware: () => middlewareSystem.tenantMiddleware(),
  quantumMiddleware: () => middlewareSystem.quantumMiddleware(),
  checkMLCredits: (credits, options) => middlewareSystem.checkMLCredits(credits, options),
  rateLimitMiddleware: (options) => middlewareSystem.rateLimitMiddleware(options),
  errorHandlingMiddleware: () => middlewareSystem.errorHandlingMiddleware(),
  securityMiddleware: () => middlewareSystem.securityMiddleware(),
  
  // Utilitários
  getPerformanceMetrics: () => middlewareSystem.getPerformanceMetrics()
};
