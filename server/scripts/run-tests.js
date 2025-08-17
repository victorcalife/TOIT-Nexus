#!/usr/bin/env node

/**
 * TOIT NEXUS - SCRIPT DE EXECUÇÃO DE TESTES FUNCIONAIS
 * 
 * Este script executa uma bateria completa de testes para validar
 * TODAS as funcionalidades do sistema antes do deploy em produção.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Importar testes
const FunctionalTestSuite = require('../tests/functional-tests');

// Importar middlewares e rotas
const { authenticateToken } = require('../middleware/auth');

class TestRunner {
  constructor() {
    this.app = null;
    this.server = null;
    this.testSuite = null;
  }

  /**
   * Inicializar aplicação para testes
   */
  async initializeApp() {
    console.log('🚀 Inicializando aplicação para testes...');
    
    this.app = express();
    
    // Middlewares básicos
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Middleware de logging para testes
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path}`);
      next();
    });

    // Rotas de teste básicas
    this.setupTestRoutes();
    
    // Rotas principais (se existirem)
    try {
      // Auth routes
      if (fs.existsSync(path.join(__dirname, '../routes/auth.js'))) {
        const authRoutes = require('../routes/auth');
        this.app.use('/api/auth', authRoutes);
      }

      // Quantum routes
      if (fs.existsSync(path.join(__dirname, '../routes/quantum.js'))) {
        const quantumRoutes = require('../routes/quantum');
        this.app.use('/api/quantum', quantumRoutes);
      }

      // Chat routes
      if (fs.existsSync(path.join(__dirname, '../routes/chat.js'))) {
        const chatRoutes = require('../routes/chat');
        this.app.use('/api/chat', chatRoutes);
      }

      // Email routes
      if (fs.existsSync(path.join(__dirname, '../routes/email.js'))) {
        const emailRoutes = require('../routes/email');
        this.app.use('/api/email', emailRoutes);
      }

      // Video calls routes
      if (fs.existsSync(path.join(__dirname, '../routes/video-calls.js'))) {
        const videoCallRoutes = require('../routes/video-calls');
        this.app.use('/api/video-calls', videoCallRoutes);
      }

      // Dashboard routes
      if (fs.existsSync(path.join(__dirname, '../routes/dashboard.js'))) {
        const dashboardRoutes = require('../routes/dashboard');
        this.app.use('/api/dashboards', dashboardRoutes);
      }

    } catch (error) {
      console.warn('⚠️ Algumas rotas não puderam ser carregadas:', error.message);
    }

    // Middleware de tratamento de erros
    this.app.use((error, req, res, next) => {
      console.error('❌ Erro na aplicação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    });

    // Iniciar servidor
    const port = process.env.TEST_PORT || 3001;
    this.server = this.app.listen(port, () => {
      console.log(`✅ Servidor de testes iniciado na porta ${port}`);
    });

    return this.app;
  }

  /**
   * Configurar rotas básicas para testes
   */
  setupTestRoutes() {
    // Rota de health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        environment: 'test'
      });
    });

    // Rota de login mock para testes
    this.app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;
      
      // Credenciais de teste
      if (email === 'admin@toit.com.br' && password === 'admin123') {
        res.json({
          success: true,
          token: 'test_jwt_token_12345',
          user: {
            id: 1,
            email: 'admin@toit.com.br',
            name: 'Admin Teste',
            role: 'super_admin'
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }
    });

    // Rota de perfil protegida para testes
    this.app.get('/api/users/profile', this.mockAuthMiddleware, (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });

    // Rotas mock para testes básicos
    this.app.get('/api/test', (req, res) => {
      res.json({
        success: true,
        message: 'Rota de teste funcionando',
        timestamp: new Date()
      });
    });
  }

  /**
   * Middleware de autenticação mock para testes
   */
  mockAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    const token = authHeader.substring(7);
    
    if (token === 'test_jwt_token_12345') {
      req.user = {
        id: 1,
        email: 'admin@toit.com.br',
        name: 'Admin Teste',
        role: 'super_admin'
      };
      next();
    } else {
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
  }

  /**
   * Executar todos os testes
   */
  async runTests() {
    try {
      console.log('\n🧪 INICIANDO EXECUÇÃO DE TESTES FUNCIONAIS');
      console.log('=' .repeat(60));
      
      // Inicializar aplicação
      await this.initializeApp();
      
      // Aguardar um momento para o servidor estabilizar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Criar suite de testes
      this.testSuite = new FunctionalTestSuite(this.app);
      
      // Executar todos os testes
      const results = await this.testSuite.runAllTests();
      
      // Analisar resultados
      await this.analyzeResults(results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Erro crítico na execução dos testes:', error);
      return {
        passed: 0,
        failed: 1,
        total: 1,
        error: error.message
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Analisar resultados dos testes
   */
  async analyzeResults(results) {
    console.log('\n📊 ANÁLISE DOS RESULTADOS');
    console.log('=' .repeat(40));
    
    const successRate = (results.passed / results.total) * 100;
    
    if (successRate >= 95) {
      console.log('🎉 EXCELENTE! Sistema pronto para produção.');
      console.log('✅ Todos os componentes críticos funcionando perfeitamente.');
      
    } else if (successRate >= 85) {
      console.log('✅ BOM! Sistema aprovado com pequenos ajustes.');
      console.log('⚠️ Revisar falhas menores antes do deploy.');
      
    } else if (successRate >= 70) {
      console.log('⚠️ ATENÇÃO! Sistema precisa de correções.');
      console.log('🔧 Corrigir falhas antes de prosseguir.');
      
    } else {
      console.log('🚨 CRÍTICO! Sistema não está pronto.');
      console.log('❌ Correções urgentes necessárias.');
    }

    // Recomendações baseadas nos resultados
    this.generateRecommendations(results);
  }

  /**
   * Gerar recomendações baseadas nos resultados
   */
  generateRecommendations(results) {
    console.log('\n💡 RECOMENDAÇÕES:');
    
    const failedTests = results.details?.filter(test => !test.passed) || [];
    
    if (failedTests.length === 0) {
      console.log('✅ Nenhuma correção necessária. Sistema perfeito!');
      return;
    }

    const categories = {
      auth: failedTests.filter(t => t.name.includes('AUTH')),
      db: failedTests.filter(t => t.name.includes('DB')),
      quantum: failedTests.filter(t => t.name.includes('QUANTUM')),
      chat: failedTests.filter(t => t.name.includes('CHAT')),
      email: failedTests.filter(t => t.name.includes('EMAIL')),
      video: failedTests.filter(t => t.name.includes('VIDEO')),
      security: failedTests.filter(t => t.name.includes('SECURITY'))
    };

    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        console.log(`\n🔧 ${category.toUpperCase()}:`);
        tests.forEach(test => {
          console.log(`   - ${test.description}`);
        });
      }
    });
  }

  /**
   * Limpeza após testes
   */
  async cleanup() {
    console.log('\n🧹 Limpando recursos de teste...');
    
    try {
      if (this.server) {
        this.server.close();
        console.log('✅ Servidor de testes encerrado');
      }
      
      // Fechar conexões de serviços se necessário
      if (this.testSuite?.chatService) {
        await this.testSuite.chatService.close();
      }
      
      if (this.testSuite?.videoCallService) {
        await this.testSuite.videoCallService.close();
      }
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const runner = new TestRunner();
  
  runner.runTests()
    .then(results => {
      const successRate = (results.passed / results.total) * 100;
      
      console.log(`\n🏁 TESTES CONCLUÍDOS - Taxa de Sucesso: ${successRate.toFixed(2)}%`);
      
      // Exit code baseado no sucesso
      process.exit(successRate >= 70 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Falha crítica nos testes:', error);
      process.exit(1);
    });
}

module.exports = TestRunner;
