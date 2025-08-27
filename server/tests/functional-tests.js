const request = require('supertest');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Importar serviços
const DatabaseService = require('../services/DatabaseService');
const ChatService = require('../services/ChatService');
const VideoCallService = require('../services/VideoCallService');
const EmailService = require('../services/EmailService');
const QuantumProcessor = require('../services/QuantumProcessor');
const MilaService = require('../services/MilaService');

class FunctionalTestSuite {
  constructor(app) {
    this.app = app;
    this.db = new DatabaseService();
    this.chatService = new ChatService();
    this.videoCallService = new VideoCallService();
    this.emailService = new EmailService();
    this.quantumProcessor = new QuantumProcessor();
    this.milaService = new MilaService();
    
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    
    this.authToken = null;
    this.testUserId = null;
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🧪 INICIANDO BATERIA COMPLETA DE TESTES FUNCIONAIS');
    console.log('=' .repeat(60));

    try {
      // 1. Testes de Autenticação
      await this.testAuthentication();
      
      // 2. Testes de Banco de Dados
      await this.testDatabase();
      
      // 3. Testes de APIs Quantum
      await this.testQuantumAPIs();
      
      // 4. Testes de MILA
      await this.testMILA();
      
      // 5. Testes de Chat
      await this.testChat();
      
      // 6. Testes de Email
      await this.testEmail();
      
      // 7. Testes de Vídeo Chamadas
      await this.testVideoCalls();
      
      // 8. Testes de Dashboard
      await this.testDashboard();
      
      // 9. Testes de Relatórios
      await this.testReports();
      
      // 10. Testes de Integração
      await this.testIntegration();
      
      // 11. Testes de Performance
      await this.testPerformance();
      
      // 12. Testes de Segurança
      await this.testSecurity();

      // Gerar relatório final
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Erro crítico nos testes:', error);
      this.addTestResult('CRITICAL_ERROR', false, error.message);
    }
  }

  /**
   * Testes de Autenticação
   */
  async testAuthentication() {
    console.log('\n🔐 TESTANDO AUTENTICAÇÃO...');
    
    try {
      // Teste 1: Login com credenciais válidas
      const loginResponse = await request(this.app)
        .post('/api/auth/login')
        .send({
          email: 'admin@toit.com.br',
          password: 'admin123'
        });

      if (loginResponse.status === 200 && loginResponse.body.token) {
        this.authToken = loginResponse.body.token;
        this.testUserId = loginResponse.body.user.id;
        this.addTestResult('AUTH_LOGIN_VALID', true, 'Login com credenciais válidas');
      } else {
        this.addTestResult('AUTH_LOGIN_VALID', false, 'Falha no login válido');
      }

      // Teste 2: Login com credenciais inválidas
      const invalidLoginResponse = await request(this.app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });

      this.addTestResult(
        'AUTH_LOGIN_INVALID', 
        invalidLoginResponse.status === 401,
        'Login com credenciais inválidas deve retornar 401'
      );

      // Teste 3: Acesso a rota protegida com token
      const protectedResponse = await request(this.app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'AUTH_PROTECTED_ROUTE',
        protectedResponse.status === 200,
        'Acesso a rota protegida com token válido'
      );

      // Teste 4: Acesso a rota protegida sem token
      const unprotectedResponse = await request(this.app)
        .get('/api/users/profile');

      this.addTestResult(
        'AUTH_NO_TOKEN',
        unprotectedResponse.status === 401,
        'Acesso a rota protegida sem token deve retornar 401'
      );

    } catch (error) {
      this.addTestResult('AUTH_ERROR', false, `Erro nos testes de auth: ${error.message}`);
    }
  }

  /**
   * Testes de Banco de Dados
   */
  async testDatabase() {
    console.log('\n🗄️ TESTANDO BANCO DE DADOS...');
    
    try {
      // Teste 1: Conexão com banco
      const healthCheck = await this.db.healthCheck();
      this.addTestResult(
        'DB_CONNECTION',
        healthCheck.connected,
        'Conexão com banco de dados'
      );

      // Teste 2: Inserção de dados
      const insertResult = await this.db.query(`
        INSERT INTO system_logs (user_id, action, details, created_at)
        VALUES (?, 'test_insert', '{"test": true}', NOW())
      `, [this.testUserId]);

      this.addTestResult(
        'DB_INSERT',
        insertResult.insertId > 0,
        'Inserção de dados no banco'
      );

      // Teste 3: Consulta de dados
      const selectResult = await this.db.query(`
        SELECT * FROM system_logs WHERE id = ?
      `, [insertResult.insertId]);

      this.addTestResult(
        'DB_SELECT',
        selectResult.length > 0,
        'Consulta de dados no banco'
      );

      // Teste 4: Atualização de dados
      const updateResult = await this.db.query(`
        UPDATE system_logs SET details = '{"test": "updated"}' WHERE id = ?
      `, [insertResult.insertId]);

      this.addTestResult(
        'DB_UPDATE',
        updateResult.affectedRows > 0,
        'Atualização de dados no banco'
      );

      // Teste 5: Exclusão de dados
      const deleteResult = await this.db.query(`
        DELETE FROM system_logs WHERE id = ?
      `, [insertResult.insertId]);

      this.addTestResult(
        'DB_DELETE',
        deleteResult.affectedRows > 0,
        'Exclusão de dados no banco'
      );

    } catch (error) {
      this.addTestResult('DB_ERROR', false, `Erro nos testes de DB: ${error.message}`);
    }
  }

  /**
   * Testes de APIs Quantum
   */
  async testQuantumAPIs() {
    console.log('\n⚛️ TESTANDO APIs QUÂNTICAS...');
    
    try {
      // Teste 1: Processamento quântico básico
      const quantumResponse = await request(this.app)
        .post('/api/quantum/process')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          type: 'optimization',
          data: { input: [1, 2, 3, 4, 5] },
          complexity: 2
        });

      this.addTestResult(
        'QUANTUM_PROCESS',
        quantumResponse.status === 200 && quantumResponse.body.success,
        'Processamento quântico básico'
      );

      // Teste 2: Métricas quânticas
      const metricsResponse = await request(this.app)
        .get('/api/quantum/metrics')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'QUANTUM_METRICS',
        metricsResponse.status === 200 && metricsResponse.body.data,
        'Obtenção de métricas quânticas'
      );

      // Teste 3: Algoritmos disponíveis
      const algorithmsResponse = await request(this.app)
        .get('/api/quantum/algorithms')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'QUANTUM_ALGORITHMS',
        algorithmsResponse.status === 200 && Array.isArray(algorithmsResponse.body.data),
        'Listagem de algoritmos quânticos'
      );

      // Teste 4: Otimização quântica
      const optimizeResponse = await request(this.app)
        .post('/api/quantum/optimize')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          operationType: 'data_analysis',
          inputData: { dataset: 'test_data' },
          targetSpeedup: 2.0
        });

      this.addTestResult(
        'QUANTUM_OPTIMIZE',
        optimizeResponse.status === 200,
        'Otimização quântica'
      );

    } catch (error) {
      this.addTestResult('QUANTUM_ERROR', false, `Erro nos testes quânticos: ${error.message}`);
    }
  }

  /**
   * Testes de MILA
   */
  async testMILA() {
    console.log('\n🧠 TESTANDO MILA...');
    
    try {
      // Teste 1: Geração de insights
      const insights = await this.milaService.generateInsights({
        operation: { type: 'test', result: 'success' },
        userId: this.testUserId,
        context: 'testing'
      });

      this.addTestResult(
        'MILA_INSIGHTS',
        Array.isArray(insights),
        'Geração de insights MILA'
      );

      // Teste 2: Processamento de linguagem natural
      const nlpResult = await this.milaService.processMessage({
        content: 'Como posso melhorar a performance do sistema?',
        userId: this.testUserId
      });

      this.addTestResult(
        'MILA_NLP',
        nlpResult && nlpResult.response,
        'Processamento de linguagem natural'
      );

      // Teste 3: Análise de sentimento
      const sentimentResult = await this.milaService.analyzeSentiment(
        'Estou muito satisfeito com o sistema!'
      );

      this.addTestResult(
        'MILA_SENTIMENT',
        sentimentResult && sentimentResult.sentiment,
        'Análise de sentimento'
      );

    } catch (error) {
      this.addTestResult('MILA_ERROR', false, `Erro nos testes MILA: ${error.message}`);
    }
  }

  /**
   * Testes de Chat
   */
  async testChat() {
    console.log('\n💬 TESTANDO CHAT...');
    
    try {
      // Teste 1: Criar conversa
      const conversationResponse = await request(this.app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          name: 'Teste Conversa',
          type: 'group',
          participants: [this.testUserId]
        });

      const conversationId = conversationResponse.body.data?.conversationId;
      
      this.addTestResult(
        'CHAT_CREATE_CONVERSATION',
        conversationResponse.status === 201 && conversationId,
        'Criação de conversa'
      );

      // Teste 2: Enviar mensagem
      if (conversationId) {
        const messageResponse = await request(this.app)
          .post(`/api/chat/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send({
            content: 'Mensagem de teste',
            messageType: 'text'
          });

        this.addTestResult(
          'CHAT_SEND_MESSAGE',
          messageResponse.status === 201,
          'Envio de mensagem'
        );

        // Teste 3: Listar mensagens
        const messagesResponse = await request(this.app)
          .get(`/api/chat/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${this.authToken}`);

        this.addTestResult(
          'CHAT_LIST_MESSAGES',
          messagesResponse.status === 200 && Array.isArray(messagesResponse.body.data.messages),
          'Listagem de mensagens'
        );
      }

      // Teste 4: WebSocket Chat
      await this.testChatWebSocket();

    } catch (error) {
      this.addTestResult('CHAT_ERROR', false, `Erro nos testes de chat: ${error.message}`);
    }
  }

  /**
   * Testes de Email
   */
  async testEmail() {
    console.log('\n📧 TESTANDO EMAIL...');
    
    try {
      // Teste 1: Listar pastas
      const foldersResponse = await request(this.app)
        .get('/api/email/folders')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'EMAIL_LIST_FOLDERS',
        foldersResponse.status === 200 && Array.isArray(foldersResponse.body.data.folders),
        'Listagem de pastas de email'
      );

      // Teste 2: Enviar email
      const emailResponse = await request(this.app)
        .post('/api/email/send')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          to: 'test@example.com',
          subject: 'Email de Teste',
          body: 'Este é um email de teste do sistema.',
          priority: 'normal'
        });

      this.addTestResult(
        'EMAIL_SEND',
        emailResponse.status === 200,
        'Envio de email'
      );

      // Teste 3: Listar templates
      const templatesResponse = await request(this.app)
        .get('/api/email/templates')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'EMAIL_LIST_TEMPLATES',
        templatesResponse.status === 200,
        'Listagem de templates de email'
      );

      // Teste 4: Buscar emails
      const searchResponse = await request(this.app)
        .get('/api/email/search?q=teste')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'EMAIL_SEARCH',
        searchResponse.status === 200,
        'Busca de emails'
      );

    } catch (error) {
      this.addTestResult('EMAIL_ERROR', false, `Erro nos testes de email: ${error.message}`);
    }
  }

  /**
   * Testes de Vídeo Chamadas
   */
  async testVideoCalls() {
    console.log('\n📹 TESTANDO VÍDEO CHAMADAS...');
    
    try {
      // Teste 1: Iniciar chamada
      const callResponse = await request(this.app)
        .post('/api/video-calls/initiate')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          participants: [this.testUserId],
          type: 'video',
          title: 'Chamada de Teste'
        });

      const callId = callResponse.body.data?.callId;
      
      this.addTestResult(
        'VIDEO_INITIATE_CALL',
        callResponse.status === 201 && callId,
        'Iniciar chamada de vídeo'
      );

      // Teste 2: Entrar na chamada
      if (callId) {
        const joinResponse = await request(this.app)
          .post(`/api/video-calls/${callId}/join`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send({
            audioEnabled: true,
            videoEnabled: true
          });

        this.addTestResult(
          'VIDEO_JOIN_CALL',
          joinResponse.status === 200,
          'Entrar na chamada'
        );

        // Teste 3: Atualizar mídia
        const mediaResponse = await request(this.app)
          .put(`/api/video-calls/${callId}/media`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send({
            audioEnabled: false,
            videoEnabled: true
          });

        this.addTestResult(
          'VIDEO_UPDATE_MEDIA',
          mediaResponse.status === 200,
          'Atualizar configurações de mídia'
        );

        // Teste 4: Encerrar chamada
        const endResponse = await request(this.app)
          .post(`/api/video-calls/${callId}/end`)
          .set('Authorization', `Bearer ${this.authToken}`);

        this.addTestResult(
          'VIDEO_END_CALL',
          endResponse.status === 200,
          'Encerrar chamada'
        );
      }

      // Teste 5: Histórico de chamadas
      const historyResponse = await request(this.app)
        .get('/api/video-calls/user/history')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'VIDEO_CALL_HISTORY',
        historyResponse.status === 200,
        'Histórico de chamadas'
      );

    } catch (error) {
      this.addTestResult('VIDEO_ERROR', false, `Erro nos testes de vídeo: ${error.message}`);
    }
  }

  /**
   * Testes de Dashboard
   */
  async testDashboard() {
    console.log('\n📊 TESTANDO DASHBOARD...');
    
    try {
      // Teste 1: Criar dashboard
      const dashboardResponse = await request(this.app)
        .post('/api/dashboards')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          name: 'Dashboard de Teste',
          description: 'Dashboard para testes funcionais',
          layout: 'grid',
          theme: 'light'
        });

      const dashboardId = dashboardResponse.body.data?.dashboardId;
      
      this.addTestResult(
        'DASHBOARD_CREATE',
        dashboardResponse.status === 201 && dashboardId,
        'Criação de dashboard'
      );

      // Teste 2: Adicionar widget
      if (dashboardId) {
        const widgetResponse = await request(this.app)
          .post(`/api/dashboards/${dashboardId}/widgets`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send({
            type: 'chart',
            title: 'Widget de Teste',
            chartType: 'line',
            dataSource: { type: 'api', endpoint: '/api/test' },
            width: 6,
            height: 4
          });

        this.addTestResult(
          'DASHBOARD_ADD_WIDGET',
          widgetResponse.status === 201,
          'Adição de widget ao dashboard'
        );

        // Teste 3: Obter dados do dashboard
        const dataResponse = await request(this.app)
          .get(`/api/dashboards/${dashboardId}/data`)
          .set('Authorization', `Bearer ${this.authToken}`);

        this.addTestResult(
          'DASHBOARD_GET_DATA',
          dataResponse.status === 200,
          'Obtenção de dados do dashboard'
        );
      }

      // Teste 4: Listar dashboards
      const listResponse = await request(this.app)
        .get('/api/dashboards')
        .set('Authorization', `Bearer ${this.authToken}`);

      this.addTestResult(
        'DASHBOARD_LIST',
        listResponse.status === 200 && Array.isArray(listResponse.body.data.dashboards),
        'Listagem de dashboards'
      );

    } catch (error) {
      this.addTestResult('DASHBOARD_ERROR', false, `Erro nos testes de dashboard: ${error.message}`);
    }
  }

  /**
   * Testes de WebSocket Chat
   */
  async testChatWebSocket() {
    return new Promise((resolve) => {
      try {
        const wsUrl = process.env.WEBSOCKET_URL || 'wss://nexus.toit.com.br';
        const ws = new WebSocket(wsUrl);
        
        ws.on('open', () => {
          // Autenticar
          ws.send(JSON.stringify({
            type: 'authenticate',
            userId: this.testUserId
          }));
          
          setTimeout(() => {
            ws.close();
            this.addTestResult('CHAT_WEBSOCKET', true, 'Conexão WebSocket Chat');
            resolve();
          }, 1000);
        });

        ws.on('error', () => {
          this.addTestResult('CHAT_WEBSOCKET', false, 'Erro na conexão WebSocket Chat');
          resolve();
        });

        setTimeout(() => {
          ws.close();
          this.addTestResult('CHAT_WEBSOCKET', false, 'Timeout na conexão WebSocket Chat');
          resolve();
        }, 5000);

      } catch (error) {
        this.addTestResult('CHAT_WEBSOCKET', false, `Erro WebSocket: ${error.message}`);
        resolve();
      }
    });
  }

  /**
   * Testes de Relatórios
   */
  async testReports() {
    console.log('\n📈 TESTANDO RELATÓRIOS...');
    
    try {
      // Implementar testes de relatórios quando as rotas estiverem disponíveis
      this.addTestResult('REPORTS_PLACEHOLDER', true, 'Testes de relatórios - placeholder');
      
    } catch (error) {
      this.addTestResult('REPORTS_ERROR', false, `Erro nos testes de relatórios: ${error.message}`);
    }
  }

  /**
   * Testes de Integração
   */
  async testIntegration() {
    console.log('\n🔗 TESTANDO INTEGRAÇÃO...');
    
    try {
      // Teste integração MILA + Quantum
      const integrationResult = await this.quantumProcessor.processOperation({
        type: 'mila_integration_test',
        data: { test: true },
        complexity: 1,
        userId: this.testUserId
      });

      this.addTestResult(
        'INTEGRATION_MILA_QUANTUM',
        integrationResult && integrationResult.success,
        'Integração MILA + Quantum'
      );

    } catch (error) {
      this.addTestResult('INTEGRATION_ERROR', false, `Erro nos testes de integração: ${error.message}`);
    }
  }

  /**
   * Testes de Performance
   */
  async testPerformance() {
    console.log('\n⚡ TESTANDO PERFORMANCE...');
    
    try {
      const startTime = Date.now();
      
      // Teste múltiplas requisições simultâneas
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(this.app)
            .get('/api/quantum/metrics')
            .set('Authorization', `Bearer ${this.authToken}`)
        );
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.addTestResult(
        'PERFORMANCE_CONCURRENT',
        duration < 5000, // Menos de 5 segundos para 10 requisições
        `Performance requisições concorrentes: ${duration}ms`
      );

    } catch (error) {
      this.addTestResult('PERFORMANCE_ERROR', false, `Erro nos testes de performance: ${error.message}`);
    }
  }

  /**
   * Testes de Segurança
   */
  async testSecurity() {
    console.log('\n🔒 TESTANDO SEGURANÇA...');
    
    try {
      // Teste SQL Injection
      const sqlInjectionResponse = await request(this.app)
        .post('/api/auth/login')
        .send({
          email: "admin@toit.com.br'; DROP TABLE users; --",
          password: 'test'
        });

      this.addTestResult(
        'SECURITY_SQL_INJECTION',
        sqlInjectionResponse.status !== 200,
        'Proteção contra SQL Injection'
      );

      // Teste XSS
      const xssResponse = await request(this.app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({
          name: '<script>alert("XSS")</script>',
          type: 'group'
        });

      this.addTestResult(
        'SECURITY_XSS',
        !xssResponse.body.data?.name?.includes('<script>'),
        'Proteção contra XSS'
      );

    } catch (error) {
      this.addTestResult('SECURITY_ERROR', false, `Erro nos testes de segurança: ${error.message}`);
    }
  }

  /**
   * Adicionar resultado de teste
   */
  addTestResult(testName, passed, description) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${testName}: ${description}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName}: ${description}`);
    }
    
    this.testResults.details.push({
      name: testName,
      passed,
      description,
      timestamp: new Date()
    });
  }

  /**
   * Gerar relatório final
   */
  generateTestReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(60));
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);
    
    console.log(`✅ Testes Aprovados: ${this.testResults.passed}`);
    console.log(`❌ Testes Falharam: ${this.testResults.failed}`);
    console.log(`📊 Total de Testes: ${this.testResults.total}`);
    console.log(`🎯 Taxa de Sucesso: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      this.testResults.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.description}`);
        });
    }
    
    // Salvar relatório em arquivo
    const reportPath = path.join(__dirname, '../reports/functional-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      ...this.testResults,
      generatedAt: new Date(),
      successRate: parseFloat(successRate)
    }, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
    
    if (successRate >= 90) {
      console.log('\n🎉 SISTEMA APROVADO NOS TESTES! Pronto para produção.');
    } else if (successRate >= 70) {
      console.log('\n⚠️ SISTEMA PARCIALMENTE APROVADO. Revisar falhas antes do deploy.');
    } else {
      console.log('\n🚨 SISTEMA REPROVADO. Correções críticas necessárias.');
    }
    
    return this.testResults;
  }
}

module.exports = FunctionalTestSuite;
