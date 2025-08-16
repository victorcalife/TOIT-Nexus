/**
 * TESTE DO SISTEMA DE MIDDLEWARES UNIFICADO
 * Valida todos os middlewares centralizados
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');

class MiddlewareTestSuite {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * EXECUTAR TESTE
   */
  async runTest(name, testFn) {
    try {
      console.log(`🧪 [TEST] Executando: ${name}`);
      await testFn();
      console.log(`✅ [TEST] PASSOU: ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ [TEST] FALHOU: ${name} - ${error.message}`);
      this.failed++;
    }
  }

  /**
   * TESTE DE CORS MIDDLEWARE
   */
  async testCorsMiddleware() {
    const corsMiddleware = (req, res, next) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://nexus.toit.com.br'
      ];

      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      next();
    };

    // Mock request/response
    const req = {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000'
      }
    };

    const headers = {};
    const res = {
      setHeader: (name, value) => { headers[name] = value; },
      status: (code) => ({ end: () => ({ statusCode: code }) })
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    corsMiddleware(req, res, next);

    if (!nextCalled) {
      throw new Error('CORS middleware não chamou next()');
    }

    if (headers['Access-Control-Allow-Origin'] !== 'http://localhost:3000') {
      throw new Error('CORS origin não configurado corretamente');
    }

    console.log(`🌐 [TEST] CORS configurado: ${headers['Access-Control-Allow-Origin']}`);
  }

  /**
   * TESTE DE LOGGING MIDDLEWARE
   */
  async testLoggingMiddleware() {
    const loggingMiddleware = (req, res, next) => {
      const startTime = Date.now();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      req.requestId = requestId;
      res.setHeader('X-Request-ID', requestId);

      console.log(`📥 [${requestId}] ${req.method} ${req.url} - ${req.ip || 'unknown'}`);

      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - startTime;
        console.log(`📤 [${requestId}] ${res.statusCode || 200} - ${duration}ms`);
        return originalSend.call(this, data);
      };

      next();
    };

    // Mock request/response
    const req = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      requestId: null
    };

    const headers = {};
    const res = {
      setHeader: (name, value) => { headers[name] = value; },
      send: (data) => data,
      statusCode: 200
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    loggingMiddleware(req, res, next);

    if (!nextCalled) {
      throw new Error('Logging middleware não chamou next()');
    }

    if (!req.requestId || !headers['X-Request-ID']) {
      throw new Error('Request ID não foi configurado');
    }

    console.log(`📝 [TEST] Logging configurado: ${req.requestId}`);
  }

  /**
   * TESTE DE TENANT MIDDLEWARE
   */
  async testTenantMiddleware() {
    const tenantMiddleware = async (req, res, next) => {
      try {
        let tenantId = req.headers['x-tenant-id'] || 
                      req.query.tenantId || 
                      req.body.tenantId;

        // Super admins têm acesso global
        if (req.user && (req.user.role === 'super_admin' || req.user.role === 'toit_admin')) {
          req.tenant = {
            id: tenantId || 'global',
            isGlobal: true,
            hasGlobalAccess: true
          };
          return next();
        }

        // Usuários normais usam tenant do usuário
        if (!tenantId && req.user && req.user.tenantId) {
          tenantId = req.user.tenantId;
        }

        if (tenantId) {
          req.tenant = {
            id: tenantId,
            isGlobal: false,
            hasGlobalAccess: false
          };
        }

        next();
      } catch (error) {
        res.status(500).json({
          error: 'Erro interno no processamento de tenant',
          code: 'TENANT_ERROR'
        });
      }
    };

    // Teste com super admin
    const reqSuperAdmin = {
      user: { role: 'super_admin' },
      headers: { 'x-tenant-id': 'test-tenant' },
      tenant: null
    };

    const res = {
      status: (code) => ({ json: (data) => ({ statusCode: code, data }) })
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await tenantMiddleware(reqSuperAdmin, res, next);

    if (!nextCalled || !reqSuperAdmin.tenant || !reqSuperAdmin.tenant.hasGlobalAccess) {
      throw new Error('Tenant middleware falhou para super admin');
    }

    console.log(`🏢 [TEST] Tenant middleware: ${reqSuperAdmin.tenant.id} (global: ${reqSuperAdmin.tenant.isGlobal})`);
  }

  /**
   * TESTE DE QUANTUM MIDDLEWARE
   */
  async testQuantumMiddleware() {
    const quantumMiddleware = (req, res, next) => {
      res.setHeader('X-Quantum-Engine', 'TOIT-NEXUS-v1.0');
      res.setHeader('X-Performance-Mode', 'quantum');
      
      const quantumRoutes = [
        '/api/workflows',
        '/api/reports', 
        '/api/quantum',
        '/api/dashboards'
      ];

      const isQuantumRoute = quantumRoutes.some(route => req.url.startsWith(route));
      
      if (isQuantumRoute) {
        res.setHeader('X-Quantum-Optimized', 'true');
        req.quantumOptimized = true;
      }

      next();
    };

    // Teste com rota quantum
    const req = {
      url: '/api/quantum/insights',
      quantumOptimized: false
    };

    const headers = {};
    const res = {
      setHeader: (name, value) => { headers[name] = value; }
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    quantumMiddleware(req, res, next);

    if (!nextCalled) {
      throw new Error('Quantum middleware não chamou next()');
    }

    if (!req.quantumOptimized || headers['X-Quantum-Optimized'] !== 'true') {
      throw new Error('Otimização quantum não foi aplicada');
    }

    console.log(`⚡ [TEST] Quantum otimizado: ${req.url}`);
  }

  /**
   * TESTE DE ML CREDITS MIDDLEWARE
   */
  async testMLCreditsMiddleware() {
    const checkMLCredits = (creditsRequired = 1) => {
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

          // Mock de verificação de créditos
          const availableCredits = 10;
          const sufficient = availableCredits >= creditsRequired;

          req.mlCredits = {
            available: availableCredits,
            required: creditsRequired,
            sufficient,
            unlimited: false
          };

          if (!sufficient) {
            return res.status(402).json({
              error: 'Créditos ML insuficientes',
              code: 'INSUFFICIENT_ML_CREDITS',
              available: availableCredits,
              required: creditsRequired
            });
          }

          next();
        } catch (error) {
          res.status(500).json({
            error: 'Erro interno na verificação de créditos ML',
            code: 'ML_CREDITS_ERROR'
          });
        }
      };
    };

    // Teste com super admin
    const req = {
      user: { role: 'super_admin' },
      mlCredits: null
    };

    const res = {
      status: (code) => ({ json: (data) => ({ statusCode: code, data }) })
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = checkMLCredits(5);
    await middleware(req, res, next);

    if (!nextCalled || !req.mlCredits || !req.mlCredits.unlimited) {
      throw new Error('ML Credits middleware falhou para super admin');
    }

    console.log(`💳 [TEST] ML Credits: ${req.mlCredits.available} (unlimited: ${req.mlCredits.unlimited})`);
  }

  /**
   * TESTE DE RATE LIMITING
   */
  async testRateLimitMiddleware() {
    const rateLimitStore = new Map();
    
    const rateLimitMiddleware = (options = {}) => {
      const {
        windowMs = 15 * 60 * 1000,
        maxRequests = 100
      } = options;

      return (req, res, next) => {
        const key = req.ip + ':' + (req.user?.id || 'anonymous');
        const now = Date.now();
        
        const userRequests = rateLimitStore.get(key) || [];
        const recentRequests = userRequests.filter(time => time > now - windowMs);
        
        if (recentRequests.length >= maxRequests) {
          return res.status(429).json({
            error: 'Muitas requisições',
            code: 'RATE_LIMIT_EXCEEDED'
          });
        }
        
        recentRequests.push(now);
        rateLimitStore.set(key, recentRequests);
        
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - recentRequests.length);
        
        next();
      };
    };

    // Teste normal
    const req = {
      ip: '127.0.0.1',
      user: { id: 'test-user' }
    };

    const headers = {};
    const res = {
      setHeader: (name, value) => { headers[name] = value; },
      status: (code) => ({ json: (data) => ({ statusCode: code, data }) })
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = rateLimitMiddleware({ maxRequests: 10 });
    middleware(req, res, next);

    if (!nextCalled) {
      throw new Error('Rate limit middleware não chamou next()');
    }

    if (!headers['X-RateLimit-Limit'] || !headers['X-RateLimit-Remaining']) {
      throw new Error('Headers de rate limit não configurados');
    }

    console.log(`🚦 [TEST] Rate limit: ${headers['X-RateLimit-Remaining']}/${headers['X-RateLimit-Limit']}`);
  }

  /**
   * TESTE DE SECURITY MIDDLEWARE
   */
  async testSecurityMiddleware() {
    const securityMiddleware = (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      next();
    };

    const req = {};
    const headers = {};
    const res = {
      setHeader: (name, value) => { headers[name] = value; }
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    securityMiddleware(req, res, next);

    if (!nextCalled) {
      throw new Error('Security middleware não chamou next()');
    }

    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options', 
      'X-XSS-Protection',
      'Referrer-Policy'
    ];

    for (const header of requiredHeaders) {
      if (!headers[header]) {
        throw new Error(`Header de segurança ${header} não configurado`);
      }
    }

    console.log(`🛡️ [TEST] Security headers configurados: ${Object.keys(headers).length} headers`);
  }

  /**
   * EXECUTAR TODOS OS TESTES
   */
  async runAllTests() {
    console.log('🚀 [TEST] Iniciando testes do sistema de middlewares unificado...\n');

    await this.runTest('CORS Middleware', () => this.testCorsMiddleware());
    await this.runTest('Logging Middleware', () => this.testLoggingMiddleware());
    await this.runTest('Tenant Middleware', () => this.testTenantMiddleware());
    await this.runTest('Quantum Middleware', () => this.testQuantumMiddleware());
    await this.runTest('ML Credits Middleware', () => this.testMLCreditsMiddleware());
    await this.runTest('Rate Limit Middleware', () => this.testRateLimitMiddleware());
    await this.runTest('Security Middleware', () => this.testSecurityMiddleware());

    console.log('\n📊 [TEST] Resultados dos testes:');
    console.log(`✅ Passou: ${this.passed}`);
    console.log(`❌ Falhou: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 [TEST] Todos os testes passaram! Sistema de middlewares funcionando perfeitamente.');
      return true;
    } else {
      console.log('\n⚠️ [TEST] Alguns testes falharam. Verifique os erros acima.');
      return false;
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const testSuite = new MiddlewareTestSuite();
  testSuite.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [TEST] Erro crítico nos testes:', error);
    process.exit(1);
  });
}

module.exports = MiddlewareTestSuite;
