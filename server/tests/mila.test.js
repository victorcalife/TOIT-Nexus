const MilaService = require('../services/MilaService');
const QuantumProcessor = require('../services/QuantumProcessor');

describe('🧠 TESTES MILA - INTELIGÊNCIA ARTIFICIAL REAL', () => {
  let milaService;
  let quantumProcessor;

  beforeAll(async () => {
    milaService = new MilaService();
    quantumProcessor = new QuantumProcessor();
    
    // Inicializar MILA
    await milaService.initialize();
    
    console.log('✅ Setup de testes MILA concluído');
  });

  describe('💬 Processamento de Linguagem Natural', () => {
    test('Deve processar mensagem simples', async () => {
      const result = await milaService.processMessage({
        message: 'Olá MILA, como você está?',
        userId: 1,
        sessionId: 'test-session-1'
      });

      expect(result.success).toBe(true);
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.response.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.processingTime).toBeLessThan(2000);
    });

    test('Deve analisar sentimento da mensagem', async () => {
      const messages = [
        { text: 'Estou muito feliz com os resultados!', expected: 'positive' },
        { text: 'Que situação terrível, estou muito triste', expected: 'negative' },
        { text: 'O relatório está pronto para análise', expected: 'neutral' }
      ];

      for (const msg of messages) {
        const result = await milaService.analyzeSentiment({
          text: msg.text,
          language: 'pt-BR'
        });

        expect(result.success).toBe(true);
        expect(result.sentiment).toBeDefined();
        expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
        expect(result.confidence).toBeGreaterThan(0.6);
        
        console.log(`😊 "${msg.text}" -> ${result.sentiment} (${result.confidence})`);
      }
    });

    test('Deve extrair entidades nomeadas', async () => {
      const text = 'João Silva trabalha na empresa TOIT em São Paulo desde janeiro de 2024';
      
      const result = await milaService.extractEntities({
        text,
        language: 'pt-BR'
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.entities)).toBe(true);
      expect(result.entities.length).toBeGreaterThan(0);
      
      const entityTypes = result.entities.map(e => e.type);
      expect(entityTypes).toContain('PERSON');
      expect(entityTypes).toContain('ORGANIZATION');
      expect(entityTypes).toContain('LOCATION');
      expect(entityTypes).toContain('DATE');
    });

    test('Deve classificar intenção da mensagem', async () => {
      const messages = [
        { text: 'Gostaria de criar um novo relatório', expected: 'create_report' },
        { text: 'Preciso agendar uma reunião para amanhã', expected: 'schedule_meeting' },
        { text: 'Qual é o status do projeto X?', expected: 'get_status' },
        { text: 'Envie um email para o cliente', expected: 'send_email' }
      ];

      for (const msg of messages) {
        const result = await milaService.classifyIntent({
          text: msg.text,
          language: 'pt-BR'
        });

        expect(result.success).toBe(true);
        expect(result.intent).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0.7);
        expect(result.parameters).toBeDefined();
        
        console.log(`🎯 "${msg.text}" -> ${result.intent} (${result.confidence})`);
      }
    });
  });

  describe('📊 Análise de Dados Empresariais', () => {
    test('Deve analisar dados de vendas', async () => {
      const salesData = [
        { month: 'Jan', sales: 10000, costs: 6000 },
        { month: 'Feb', sales: 12000, costs: 7000 },
        { month: 'Mar', sales: 15000, costs: 8000 },
        { month: 'Apr', sales: 11000, costs: 6500 },
        { month: 'May', sales: 18000, costs: 9000 }
      ];

      const result = await milaService.analyzeBusinessData({
        data: salesData,
        type: 'sales_analysis',
        metrics: ['revenue', 'profit', 'growth']
      });

      expect(result.success).toBe(true);
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.predictions).toBeDefined();
    });

    test('Deve detectar anomalias em dados', async () => {
      const data = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 105 },
        { date: '2024-01-03', value: 98 },
        { date: '2024-01-04', value: 500 }, // anomalia
        { date: '2024-01-05', value: 102 },
        { date: '2024-01-06', value: 99 }
      ];

      const result = await milaService.detectAnomalies({
        data,
        threshold: 0.95,
        algorithm: 'isolation_forest'
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.anomalies)).toBe(true);
      expect(result.anomalies.length).toBeGreaterThan(0);
      expect(result.anomalies[0].date).toBe('2024-01-04');
      expect(result.anomalies[0].score).toBeGreaterThan(0.95);
    });

    test('Deve gerar predições baseadas em histórico', async () => {
      const historicalData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: 100 + Math.sin(i * 0.2) * 20 + Math.random() * 10
      }));

      const result = await milaService.generatePredictions({
        data: historicalData,
        horizon: 7, // 7 dias
        confidence: 0.95
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.predictions)).toBe(true);
      expect(result.predictions.length).toBe(7);
      expect(result.accuracy).toBeGreaterThan(0.7);
      expect(result.confidenceInterval).toBeDefined();
    });
  });

  describe('⚛️ Integração Quântica', () => {
    test('Deve processar com enhancement quântico', async () => {
      const result = await milaService.processWithQuantum({
        message: 'Otimize a alocação de recursos para maximizar eficiência',
        data: {
          resources: [
            { id: 'A', capacity: 100, cost: 50 },
            { id: 'B', capacity: 150, cost: 80 },
            { id: 'C', capacity: 200, cost: 120 }
          ],
          demand: 300
        },
        quantumEnhanced: true
      });

      expect(result.success).toBe(true);
      expect(result.quantumProcessed).toBe(true);
      expect(result.quantumSpeedup).toBeGreaterThan(1);
      expect(result.optimization).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('Deve usar algoritmos quânticos para ML', async () => {
      const trainingData = Array.from({ length: 100 }, (_, i) => ({
        features: [Math.random(), Math.random(), Math.random()],
        label: Math.random() > 0.5 ? 1 : 0
      }));

      const result = await milaService.trainQuantumModel({
        data: trainingData,
        modelType: 'quantum_neural_network',
        quantumLayers: 3,
        epochs: 20
      });

      expect(result.success).toBe(true);
      expect(result.modelId).toBeDefined();
      expect(result.quantumAdvantage).toBe(true);
      expect(result.accuracy).toBeGreaterThan(0.6);
      expect(result.quantumFidelity).toBeGreaterThan(0.8);
    });

    test('Deve otimizar hiperparâmetros quanticamente', async () => {
      const result = await milaService.quantumHyperparameterOptimization({
        modelType: 'classification',
        searchSpace: {
          learningRate: [0.001, 0.1],
          batchSize: [16, 128],
          hiddenLayers: [1, 5]
        },
        maxIterations: 10,
        quantumOptimizer: 'QAOA'
      });

      expect(result.success).toBe(true);
      expect(result.bestParams).toBeDefined();
      expect(result.bestScore).toBeGreaterThan(0);
      expect(result.quantumSpeedup).toBeGreaterThan(1);
      expect(result.convergenceTime).toBeLessThan(30000); // 30 segundos
    });
  });

  describe('🎯 Casos de Uso Específicos', () => {
    test('Deve analisar feedback de clientes', async () => {
      const feedbacks = [
        'Produto excelente, muito satisfeito com a compra!',
        'Entrega demorou muito, mas o produto é bom',
        'Atendimento péssimo, não recomendo',
        'Qualidade surpreendente pelo preço',
        'Interface confusa, difícil de usar'
      ];

      const result = await milaService.analyzeCustomerFeedback({
        feedbacks,
        categories: ['product', 'delivery', 'service', 'price', 'usability']
      });

      expect(result.success).toBe(true);
      expect(result.overallSentiment).toBeDefined();
      expect(result.categoryAnalysis).toBeDefined();
      expect(result.actionableInsights).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.priorityIssues).toBeDefined();
    });

    test('Deve otimizar cronograma de projetos', async () => {
      const tasks = [
        { id: 'A', duration: 5, dependencies: [], resources: ['dev1'] },
        { id: 'B', duration: 3, dependencies: ['A'], resources: ['dev2'] },
        { id: 'C', duration: 4, dependencies: ['A'], resources: ['dev1'] },
        { id: 'D', duration: 2, dependencies: ['B', 'C'], resources: ['dev3'] }
      ];

      const result = await milaService.optimizeProjectSchedule({
        tasks,
        resources: ['dev1', 'dev2', 'dev3'],
        deadline: 15,
        quantumOptimized: true
      });

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      expect(result.totalDuration).toBeLessThanOrEqual(15);
      expect(result.resourceUtilization).toBeGreaterThan(0.7);
      expect(result.quantumAdvantage).toBe(true);
    });

    test('Deve recomendar ações baseadas em contexto', async () => {
      const context = {
        user: { role: 'manager', department: 'sales' },
        currentTime: '2024-01-15T14:30:00Z',
        recentActivity: ['viewed_report', 'sent_email', 'scheduled_meeting'],
        businessMetrics: { sales: 'declining', satisfaction: 'high' }
      };

      const result = await milaService.recommendActions({
        context,
        maxRecommendations: 5,
        priority: 'high'
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeLessThanOrEqual(5);
      
      result.recommendations.forEach(rec => {
        expect(rec.action).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.confidence).toBeGreaterThan(0.5);
        expect(rec.reasoning).toBeDefined();
      });
    });
  });

  describe('🧠 Aprendizado e Memória', () => {
    test('Deve aprender com interações do usuário', async () => {
      const interactions = [
        { user: 1, query: 'relatório vendas', action: 'create_report', success: true },
        { user: 1, query: 'agendar reunião', action: 'schedule_meeting', success: true },
        { user: 1, query: 'enviar email', action: 'send_email', success: false }
      ];

      const result = await milaService.learnFromInteractions({
        interactions,
        userId: 1,
        updateModel: true
      });

      expect(result.success).toBe(true);
      expect(result.learningMetrics).toBeDefined();
      expect(result.modelUpdated).toBe(true);
      expect(result.accuracyImprovement).toBeGreaterThan(0);
    });

    test('Deve manter contexto de conversação', async () => {
      const sessionId = 'test-session-context';
      
      // Primeira mensagem
      const result1 = await milaService.processMessage({
        message: 'Preciso criar um relatório de vendas',
        userId: 1,
        sessionId
      });

      expect(result1.success).toBe(true);

      // Segunda mensagem com contexto
      const result2 = await milaService.processMessage({
        message: 'Para o mês passado',
        userId: 1,
        sessionId
      });

      expect(result2.success).toBe(true);
      expect(result2.contextUnderstood).toBe(true);
      expect(result2.response).toContain('relatório');
    });

    test('Deve personalizar respostas por usuário', async () => {
      const user1Result = await milaService.processMessage({
        message: 'Como está o desempenho?',
        userId: 1,
        userProfile: { role: 'manager', preferences: ['detailed'] }
      });

      const user2Result = await milaService.processMessage({
        message: 'Como está o desempenho?',
        userId: 2,
        userProfile: { role: 'executive', preferences: ['summary'] }
      });

      expect(user1Result.success).toBe(true);
      expect(user2Result.success).toBe(true);
      expect(user1Result.response).not.toBe(user2Result.response);
      expect(user1Result.responseStyle).toBe('detailed');
      expect(user2Result.responseStyle).toBe('summary');
    });
  });

  describe('📈 Métricas e Performance', () => {
    test('Deve medir acurácia das predições', async () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({
        input: [Math.random(), Math.random()],
        expected: Math.random() > 0.5 ? 1 : 0
      }));

      const result = await milaService.evaluateAccuracy({
        testData,
        modelType: 'classification',
        metrics: ['accuracy', 'precision', 'recall', 'f1']
      });

      expect(result.success).toBe(true);
      expect(result.accuracy).toBeGreaterThan(0.5);
      expect(result.precision).toBeGreaterThan(0.5);
      expect(result.recall).toBeGreaterThan(0.5);
      expect(result.f1Score).toBeGreaterThan(0.5);
      expect(result.confusionMatrix).toBeDefined();
    });

    test('Deve monitorar performance em tempo real', async () => {
      const result = await milaService.getPerformanceMetrics({
        timeRange: '1h',
        metrics: ['responseTime', 'accuracy', 'throughput', 'errorRate']
      });

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(2000);
      expect(result.accuracy).toBeGreaterThan(0.8);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.errorRate).toBeLessThan(0.1);
    });

    test('Deve otimizar performance automaticamente', async () => {
      const result = await milaService.autoOptimizePerformance({
        targetMetrics: {
          responseTime: 1000,
          accuracy: 0.9,
          throughput: 100
        },
        optimizationBudget: 60000 // 1 minuto
      });

      expect(result.success).toBe(true);
      expect(result.optimizationsApplied).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
      expect(result.optimizationTime).toBeLessThan(60000);
    });
  });

  describe('🔄 Testes de Stress', () => {
    test('Deve processar múltiplas mensagens simultaneamente', async () => {
      const messages = Array.from({ length: 20 }, (_, i) => ({
        message: `Mensagem de teste número ${i + 1}`,
        userId: i + 1,
        sessionId: `session-${i + 1}`
      }));

      const startTime = Date.now();
      const promises = messages.map(msg => milaService.processMessage(msg));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.response).toBeDefined();
      });

      expect(totalTime).toBeLessThan(10000); // Menos de 10 segundos
      console.log(`⚡ 20 mensagens simultâneas: ${totalTime}ms`);
    });

    test('Deve manter qualidade com alta carga', async () => {
      const heavyTasks = Array.from({ length: 5 }, (_, i) => ({
        type: 'complex_analysis',
        data: Array.from({ length: 1000 }, () => Math.random()),
        userId: i + 1
      }));

      const results = await Promise.all(
        heavyTasks.map(task => milaService.processComplexAnalysis(task))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.accuracy).toBeGreaterThan(0.7);
        expect(result.processingTime).toBeLessThan(5000);
      });
    });
  });
});
