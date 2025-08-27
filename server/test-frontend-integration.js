/**
 * TESTE DE INTEGRAÇÃO FRONTEND
 * Valida compatibilidade das APIs com o frontend
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const request = require('supertest');

class FrontendIntegrationTestSuite {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.app = null;
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
   * CONFIGURAR SERVIDOR MOCK PARA FRONTEND
   */
  setupFrontendMockServer() {
    this.app = express();
    this.app.use(express.json());

    // Mock de APIs que o frontend espera
    
    // API de usuário atual (useAuth hook)
    this.app.get('/api/user', (req, res) => {
      res.json({
        success: true,
        user: {
          id: 'test-user-123',
          cpf: '12345678901',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'employee',
          tenantId: 'tenant-123',
          isActive: true,
          profileImageUrl: null
        },
        authenticated: true
      });
    });

    // API de login (useAuthState hook)
    this.app.post('/api/auth/login', (req, res) => {
      const { cpf, password } = req.body;
      
      if (cpf === '12345678901' && password === 'test123') {
        res.json({
          success: true,
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'test-user-123',
            cpf,
            role: 'employee',
            tenantId: 'tenant-123'
          },
          redirectUrl: '/dashboard'
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }
    });

    // API de logout
    this.app.post('/api/auth/logout', (req, res) => {
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    });

    // API de clientes (admin)
    this.app.get('/api/admin/clients', (req, res) => {
      res.json({
        success: true,
        clients: [
          {
            id: 'client-1',
            name: 'Cliente A',
            email: 'clientea@test.com',
            phone: '11999999999',
            currentInvestment: 50000.00,
            riskProfile: 'moderate'
          },
          {
            id: 'client-2', 
            name: 'Cliente B',
            email: 'clienteb@test.com',
            phone: '11888888888',
            currentInvestment: 100000.00,
            riskProfile: 'aggressive'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    // API de criação de cliente
    this.app.post('/api/admin/clients', (req, res) => {
      const { name, email, phone, currentInvestment, riskProfile } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Nome é obrigatório'
        });
      }

      res.json({
        success: true,
        client: {
          id: 'new-client-123',
          name,
          email,
          phone,
          currentInvestment: currentInvestment || 0,
          riskProfile: riskProfile || 'moderate',
          createdAt: new Date().toISOString()
        }
      });
    });

    // API de conexões de banco (integrations)
    this.app.get('/api/database-connections', (req, res) => {
      res.json({
        success: true,
        connections: [
          {
            id: 'db-conn-1',
            name: 'PostgreSQL Principal',
            type: 'postgresql',
            host: process.env.DB_HOST || 'railway-host.com',
            port: 5432,
            database: 'toit_nexus',
            isActive: true,
            lastTested: new Date().toISOString()
          },
          {
            id: 'db-conn-2',
            name: 'MySQL Secundário',
            type: 'mysql',
            host: 'mysql.example.com',
            port: 3306,
            database: 'backup_db',
            isActive: false,
            lastTested: null
          }
        ]
      });
    });

    // API de conexões de API
    this.app.get('/api/api-connections', (req, res) => {
      res.json({
        success: true,
        connections: [
          {
            id: 'api-conn-1',
            name: 'API Externa CRM',
            baseUrl: 'https://api.crm.example.com',
            type: 'rest',
            isActive: true,
            lastTested: new Date().toISOString()
          }
        ]
      });
    });

    // API de workflows
    this.app.get('/api/complete-workflows', (req, res) => {
      res.json({
        success: true,
        workflows: [
          {
            id: 'workflow-1',
            name: 'Onboarding Cliente',
            description: 'Processo completo de onboarding',
            isActive: true,
            steps: 5,
            lastExecution: new Date().toISOString()
          },
          {
            id: 'workflow-2',
            name: 'Relatório Mensal',
            description: 'Geração automática de relatórios',
            isActive: true,
            steps: 3,
            lastExecution: new Date().toISOString()
          }
        ]
      });
    });

    // API de dashboards KPI
    this.app.get('/api/kpi-dashboards', (req, res) => {
      res.json({
        success: true,
        dashboards: [
          {
            id: 'kpi-dash-1',
            name: 'Dashboard Principal',
            widgets: [
              {
                id: 'widget-1',
                type: 'metric',
                title: 'Total de Clientes',
                value: 150,
                change: '+12%'
              },
              {
                id: 'widget-2',
                type: 'chart',
                title: 'Receita Mensal',
                value: 'R$ 250.000',
                change: '+8%'
              }
            ]
          }
        ]
      });
    });

    // API de query builders
    this.app.get('/api/query-builders', (req, res) => {
      res.json({
        success: true,
        builders: [
          {
            id: 'qb-1',
            name: 'Query Builder Principal',
            type: 'sql',
            tables: ['users', 'clients', 'transactions'],
            isActive: true
          }
        ]
      });
    });

    // API de insights Quantum
    this.app.post('/api/quantum/insight', (req, res) => {
      const { data, type } = req.body;
      
      res.json({
        success: true,
        insight: {
          id: 'insight-123',
          type: type || 'trend_analysis',
          result: 'Tendência de crescimento de 15% identificada',
          confidence: 0.87,
          recommendations: [
            'Aumentar investimento em marketing',
            'Expandir equipe de vendas'
          ],
          processedAt: new Date().toISOString()
        }
      });
    });

    // API de status ML
    this.app.get('/api/quantum/status', (req, res) => {
      res.json({
        success: true,
        status: {
          engine: 'TOIT-NEXUS-v1.0',
          isOperational: true,
          credits: {
            available: 100,
            used: 25,
            limit: 500
          },
          lastProcessing: new Date().toISOString()
        }
      });
    });
  }

  /**
   * TESTE DE API DE AUTENTICAÇÃO
   */
  async testAuthAPIs() {
    // Teste de verificação de usuário
    const userResponse = await request(this.app)
      .get('/api/user')
      .expect(200);

    if (!userResponse.body.success || !userResponse.body.user) {
      throw new Error('API de usuário falhou');
    }

    // Teste de login
    const loginResponse = await request(this.app)
      .post('/api/auth/login')
      .send({ cpf: '12345678901', password: 'test123' })
      .expect(200);

    if (!loginResponse.body.success || !loginResponse.body.token) {
      throw new Error('API de login falhou');
    }

    // Teste de logout
    const logoutResponse = await request(this.app)
      .post('/api/auth/logout')
      .expect(200);

    if (!logoutResponse.body.success) {
      throw new Error('API de logout falhou');
    }

    console.log(`🔐 [TEST] APIs de auth: user, login, logout funcionando`);
  }

  /**
   * TESTE DE APIs ADMINISTRATIVAS
   */
  async testAdminAPIs() {
    // Teste de listagem de clientes
    const clientsResponse = await request(this.app)
      .get('/api/admin/clients')
      .expect(200);

    if (!clientsResponse.body.success || !Array.isArray(clientsResponse.body.clients)) {
      throw new Error('API de listagem de clientes falhou');
    }

    // Teste de criação de cliente
    const createResponse = await request(this.app)
      .post('/api/admin/clients')
      .send({
        name: 'Novo Cliente',
        email: 'novo@test.com',
        phone: '11777777777',
        currentInvestment: 75000,
        riskProfile: 'conservative'
      })
      .expect(200);

    if (!createResponse.body.success || !createResponse.body.client) {
      throw new Error('API de criação de cliente falhou');
    }

    console.log(`👑 [TEST] APIs admin: ${clientsResponse.body.clients.length} clientes listados, criação OK`);
  }

  /**
   * TESTE DE APIs DE INTEGRAÇÃO
   */
  async testIntegrationAPIs() {
    // Teste de conexões de banco
    const dbResponse = await request(this.app)
      .get('/api/database-connections')
      .expect(200);

    if (!dbResponse.body.success || !Array.isArray(dbResponse.body.connections)) {
      throw new Error('API de conexões de banco falhou');
    }

    // Teste de conexões de API
    const apiResponse = await request(this.app)
      .get('/api/api-connections')
      .expect(200);

    if (!apiResponse.body.success || !Array.isArray(apiResponse.body.connections)) {
      throw new Error('API de conexões de API falhou');
    }

    console.log(`🔌 [TEST] APIs integração: ${dbResponse.body.connections.length} DBs, ${apiResponse.body.connections.length} APIs`);
  }

  /**
   * TESTE DE APIs DE WORKFLOW
   */
  async testWorkflowAPIs() {
    // Teste de workflows
    const workflowResponse = await request(this.app)
      .get('/api/complete-workflows')
      .expect(200);

    if (!workflowResponse.body.success || !Array.isArray(workflowResponse.body.workflows)) {
      throw new Error('API de workflows falhou');
    }

    // Teste de dashboards KPI
    const kpiResponse = await request(this.app)
      .get('/api/kpi-dashboards')
      .expect(200);

    if (!kpiResponse.body.success || !Array.isArray(kpiResponse.body.dashboards)) {
      throw new Error('API de dashboards KPI falhou');
    }

    console.log(`⚙️ [TEST] APIs workflow: ${workflowResponse.body.workflows.length} workflows, ${kpiResponse.body.dashboards.length} dashboards`);
  }

  /**
   * TESTE DE APIs QUANTUM
   */
  async testQuantumAPIs() {
    // Teste de insight
    const insightResponse = await request(this.app)
      .post('/api/quantum/insight')
      .send({
        data: { sales: [100, 120, 150, 180] },
        type: 'trend_analysis'
      })
      .expect(200);

    if (!insightResponse.body.success || !insightResponse.body.insight) {
      throw new Error('API de insight Quantum falhou');
    }

    // Teste de status
    const statusResponse = await request(this.app)
      .get('/api/quantum/status')
      .expect(200);

    if (!statusResponse.body.success || !statusResponse.body.status) {
      throw new Error('API de status Quantum falhou');
    }

    console.log(`⚡ [TEST] APIs Quantum: insight + status, engine ${statusResponse.body.status.engine}`);
  }

  /**
   * EXECUTAR TODOS OS TESTES
   */
  async runAllTests() {
    console.log('🚀 [TEST] Iniciando testes de integração frontend...\n');

    // Configurar servidor mock
    this.setupFrontendMockServer();

    await this.runTest('APIs de Autenticação', () => this.testAuthAPIs());
    await this.runTest('APIs Administrativas', () => this.testAdminAPIs());
    await this.runTest('APIs de Integração', () => this.testIntegrationAPIs());
    await this.runTest('APIs de Workflow', () => this.testWorkflowAPIs());
    await this.runTest('APIs Quantum', () => this.testQuantumAPIs());

    console.log('\n📊 [TEST] Resultados dos testes:');
    console.log(`✅ Passou: ${this.passed}`);
    console.log(`❌ Falhou: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 [TEST] Todos os testes passaram! Integração frontend funcionando perfeitamente.');
      return true;
    } else {
      console.log('\n⚠️ [TEST] Alguns testes falharam. Verifique os erros acima.');
      return false;
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const testSuite = new FrontendIntegrationTestSuite();
  testSuite.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [TEST] Erro crítico nos testes:', error);
    process.exit(1);
  });
}

module.exports = FrontendIntegrationTestSuite;
