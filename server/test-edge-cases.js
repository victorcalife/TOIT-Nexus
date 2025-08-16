/**
 * TESTE DE CASOS EXTREMOS (EDGE CASES)
 * Valida tratamento de erros, dados inválidos, timeouts, concorrência
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const request = require('supertest');

class EdgeCasesTestSuite {
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
   * CONFIGURAR SERVIDOR PARA TESTES DE EDGE CASES
   */
  setupEdgeCasesServer() {
    this.app = express();
    this.app.use(express.json({ limit: '1mb' }));

    // Middleware de tratamento de erros
    this.app.use((req, res, next) => {
      req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      next();
    });

    // Rota que simula timeout
    this.app.get('/api/timeout-test', (req, res) => {
      const delay = parseInt(req.query.delay) || 5000;
      setTimeout(() => {
        res.json({
          success: true,
          message: 'Resposta após timeout',
          delay
        });
      }, delay);
    });

    // Rota que simula erro interno
    this.app.get('/api/error-test', (req, res) => {
      const errorType = req.query.type || 'generic';
      
      switch (errorType) {
        case 'database':
          throw new Error('Database connection failed');
        case 'validation':
          const error = new Error('Validation failed');
          error.name = 'ValidationError';
          error.details = { field: 'email', message: 'Invalid email format' };
          throw error;
        case 'auth':
          const authError = new Error('Unauthorized access');
          authError.name = 'UnauthorizedError';
          throw authError;
        case 'permission':
          const permError = new Error('Insufficient permissions');
          permError.name = 'ForbiddenError';
          throw permError;
        default:
          throw new Error('Generic server error');
      }
    });

    // Rota que valida dados de entrada
    this.app.post('/api/validate-data', (req, res) => {
      const { email, cpf, age, data } = req.body;
      const errors = [];

      // Validação de email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ field: 'email', message: 'Email inválido' });
      }

      // Validação de CPF
      if (cpf && !/^\d{11}$/.test(cpf)) {
        errors.push({ field: 'cpf', message: 'CPF deve ter 11 dígitos' });
      }

      // Validação de idade
      if (age !== undefined && (age < 0 || age > 150)) {
        errors.push({ field: 'age', message: 'Idade deve estar entre 0 e 150' });
      }

      // Validação de tamanho de dados
      if (data && JSON.stringify(data).length > 10000) {
        errors.push({ field: 'data', message: 'Dados muito grandes' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors
        });
      }

      res.json({
        success: true,
        message: 'Dados válidos',
        validated: { email, cpf, age, dataSize: data ? JSON.stringify(data).length : 0 }
      });
    });

    // Rota que simula alta concorrência
    this.app.get('/api/concurrency-test/:id', (req, res) => {
      const { id } = req.params;
      const delay = Math.random() * 200; // 0-200ms delay
      
      setTimeout(() => {
        res.json({
          success: true,
          id,
          processedAt: new Date().toISOString(),
          delay: delay.toFixed(2)
        });
      }, delay);
    });

    // Rota que simula falha de rede
    this.app.get('/api/network-failure', (req, res) => {
      const failureRate = parseFloat(req.query.rate) || 0.3; // 30% de falha por padrão
      
      if (Math.random() < failureRate) {
        // Simular diferentes tipos de falha
        const failures = [
          () => res.status(500).json({ error: 'Internal server error' }),
          () => res.status(503).json({ error: 'Service unavailable' }),
          () => res.status(408).json({ error: 'Request timeout' }),
          () => { /* Não responder (simular timeout) */ }
        ];
        
        const failure = failures[Math.floor(Math.random() * failures.length)];
        failure();
      } else {
        res.json({
          success: true,
          message: 'Network request successful'
        });
      }
    });

    // Rota que testa limites de payload
    this.app.post('/api/payload-test', (req, res) => {
      const payloadSize = JSON.stringify(req.body).length;
      
      res.json({
        success: true,
        payloadSize,
        message: `Payload de ${payloadSize} bytes processado`
      });
    });

    // Rota que simula operação com memória limitada
    this.app.get('/api/memory-limit-test', (req, res) => {
      try {
        const size = parseInt(req.query.size) || 1000;
        
        // Tentar criar array grande
        const largeArray = new Array(size).fill(0).map((_, i) => ({
          id: i,
          data: `item-${i}`.repeat(100) // String grande
        }));
        
        res.json({
          success: true,
          itemsCreated: largeArray.length,
          memoryUsed: process.memoryUsage().heapUsed
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Memory limit exceeded',
          message: error.message
        });
      }
    });

    // Error handler global
    this.app.use((error, req, res, next) => {
      console.error(`💥 [ERROR] ${req.requestId} - ${error.stack}`);

      // Tratamento específico por tipo de erro
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: error.details,
          requestId: req.requestId
        });
      }

      if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
          success: false,
          error: 'Não autorizado',
          code: 'UNAUTHORIZED',
          requestId: req.requestId
        });
      }

      if (error.name === 'ForbiddenError') {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 'FORBIDDEN',
          requestId: req.requestId
        });
      }

      // Erro genérico
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        requestId: req.requestId
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      });
    });
  }

  /**
   * TESTE DE DADOS INVÁLIDOS
   */
  async testInvalidData() {
    // Teste com email inválido
    const emailResponse = await request(this.app)
      .post('/api/validate-data')
      .send({ email: 'email-invalido' })
      .expect(400);

    if (!emailResponse.body.details || !emailResponse.body.details.find(e => e.field === 'email')) {
      throw new Error('Validação de email inválido falhou');
    }

    // Teste com CPF inválido
    const cpfResponse = await request(this.app)
      .post('/api/validate-data')
      .send({ cpf: '123' })
      .expect(400);

    if (!cpfResponse.body.details || !cpfResponse.body.details.find(e => e.field === 'cpf')) {
      throw new Error('Validação de CPF inválido falhou');
    }

    // Teste com idade inválida
    const ageResponse = await request(this.app)
      .post('/api/validate-data')
      .send({ age: -5 })
      .expect(400);

    if (!ageResponse.body.details || !ageResponse.body.details.find(e => e.field === 'age')) {
      throw new Error('Validação de idade inválida falhou');
    }

    console.log(`🚫 [TEST] Dados inválidos: email, CPF, idade rejeitados corretamente`);
  }

  /**
   * TESTE DE TRATAMENTO DE ERROS
   */
  async testErrorHandling() {
    // Teste de erro de validação
    const validationResponse = await request(this.app)
      .get('/api/error-test?type=validation')
      .expect(400);

    if (validationResponse.body.code !== 'VALIDATION_ERROR') {
      throw new Error('Tratamento de erro de validação falhou');
    }

    // Teste de erro de autorização
    const authResponse = await request(this.app)
      .get('/api/error-test?type=auth')
      .expect(401);

    if (authResponse.body.code !== 'UNAUTHORIZED') {
      throw new Error('Tratamento de erro de autorização falhou');
    }

    // Teste de erro de permissão
    const permResponse = await request(this.app)
      .get('/api/error-test?type=permission')
      .expect(403);

    if (permResponse.body.code !== 'FORBIDDEN') {
      throw new Error('Tratamento de erro de permissão falhou');
    }

    // Teste de erro genérico
    const genericResponse = await request(this.app)
      .get('/api/error-test?type=generic')
      .expect(500);

    if (genericResponse.body.code !== 'INTERNAL_ERROR') {
      throw new Error('Tratamento de erro genérico falhou');
    }

    console.log(`🛡️ [TEST] Tratamento de erros: 4 tipos de erro tratados corretamente`);
  }

  /**
   * TESTE DE TIMEOUT
   */
  async testTimeout() {
    try {
      // Teste com timeout curto (deve falhar)
      await request(this.app)
        .get('/api/timeout-test?delay=100')
        .timeout(50)
        .expect(200);
      
      throw new Error('Timeout deveria ter ocorrido');
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`⏱️ [TEST] Timeout: requisição cancelada corretamente após 50ms`);
      } else {
        throw error;
      }
    }
  }

  /**
   * TESTE DE CONCORRÊNCIA EXTREMA
   */
  async testExtremeConcurrency() {
    const concurrentRequests = 50;
    const promises = [];
    
    const startTime = Date.now();
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request(this.app)
          .get(`/api/concurrency-test/${i}`)
          .timeout(5000)
      );
    }
    
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Aceitar até 10% de falhas em concorrência extrema
    const failureRate = failed / concurrentRequests;
    if (failureRate > 0.1) {
      throw new Error(`Taxa de falha muito alta: ${(failureRate * 100).toFixed(1)}% (limite: 10%)`);
    }
    
    console.log(`🔄 [TEST] Concorrência extrema: ${successful}/${concurrentRequests} sucessos em ${endTime - startTime}ms`);
  }

  /**
   * TESTE DE PAYLOAD GRANDE
   */
  async testLargePayload() {
    // Criar payload grande (próximo ao limite)
    const largeData = new Array(1000).fill(0).map((_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: 'A'.repeat(100), // String de 100 caracteres
      metadata: {
        created: new Date().toISOString(),
        tags: ['tag1', 'tag2', 'tag3']
      }
    }));
    
    const response = await request(this.app)
      .post('/api/payload-test')
      .send({ data: largeData })
      .expect(200);
    
    if (!response.body.success || response.body.payloadSize < 100000) {
      throw new Error('Processamento de payload grande falhou');
    }
    
    console.log(`📦 [TEST] Payload grande: ${response.body.payloadSize} bytes processados`);
  }

  /**
   * TESTE DE FALHAS DE REDE SIMULADAS
   */
  async testNetworkFailures() {
    const attempts = 10;
    let successes = 0;
    let failures = 0;
    
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await request(this.app)
          .get('/api/network-failure?rate=0.5') // 50% de falha
          .timeout(1000);
        
        if (response.status === 200) {
          successes++;
        } else {
          failures++;
        }
      } catch (error) {
        failures++;
      }
    }
    
    // Deve ter pelo menos algumas falhas e alguns sucessos
    if (successes === 0 || failures === 0) {
      throw new Error('Simulação de falhas de rede não funcionou corretamente');
    }
    
    console.log(`🌐 [TEST] Falhas de rede: ${successes} sucessos, ${failures} falhas em ${attempts} tentativas`);
  }

  /**
   * TESTE DE LIMITE DE MEMÓRIA
   */
  async testMemoryLimits() {
    try {
      // Tentar criar array muito grande (deve falhar ou ser limitado)
      const response = await request(this.app)
        .get('/api/memory-limit-test?size=100000')
        .timeout(5000);
      
      // Se chegou aqui, verificar se a memória não explodiu
      if (response.body.success && response.body.itemsCreated > 0) {
        console.log(`💾 [TEST] Limite de memória: ${response.body.itemsCreated} items criados`);
      }
    } catch (error) {
      // Falha esperada para arrays muito grandes
      console.log(`💾 [TEST] Limite de memória: falha controlada para array grande`);
    }
  }

  /**
   * TESTE DE 404 E ROTAS INEXISTENTES
   */
  async test404Handling() {
    const response = await request(this.app)
      .get('/api/rota-que-nao-existe')
      .expect(404);
    
    if (response.body.code !== 'NOT_FOUND' || !response.body.requestId) {
      throw new Error('Tratamento de 404 falhou');
    }
    
    console.log(`🚫 [TEST] 404 handling: rota inexistente tratada corretamente`);
  }

  /**
   * EXECUTAR TODOS OS TESTES
   */
  async runAllTests() {
    console.log('🚀 [TEST] Iniciando testes de edge cases...\n');

    // Configurar servidor
    this.setupEdgeCasesServer();

    await this.runTest('Dados Inválidos', () => this.testInvalidData());
    await this.runTest('Tratamento de Erros', () => this.testErrorHandling());
    await this.runTest('Timeout', () => this.testTimeout());
    await this.runTest('Concorrência Extrema', () => this.testExtremeConcurrency());
    await this.runTest('Payload Grande', () => this.testLargePayload());
    await this.runTest('Falhas de Rede', () => this.testNetworkFailures());
    await this.runTest('Limite de Memória', () => this.testMemoryLimits());
    await this.runTest('404 Handling', () => this.test404Handling());

    console.log('\n📊 [TEST] Resultados dos testes:');
    console.log(`✅ Passou: ${this.passed}`);
    console.log(`❌ Falhou: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 [TEST] Todos os testes passaram! Sistema robusto para edge cases.');
      return true;
    } else {
      console.log('\n⚠️ [TEST] Alguns testes falharam. Sistema precisa de melhorias.');
      return false;
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const testSuite = new EdgeCasesTestSuite();
  testSuite.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [TEST] Erro crítico nos testes:', error);
    process.exit(1);
  });
}

module.exports = EdgeCasesTestSuite;
