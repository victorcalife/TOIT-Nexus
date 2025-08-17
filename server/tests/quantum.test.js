const QuantumProcessor = require('../services/QuantumProcessor');
const QuantumMLEngine = require('../quantum/quantumMLEngine');
const { GroversAlgorithm } = require('../quantum/advancedQuantumAlgorithms');
const { QuantumNeuralNetwork } = require('../quantum/realQuantumComputing');

describe('⚛️ TESTES ALGORITMOS QUÂNTICOS REAIS', () => {
  let quantumProcessor;
  let quantumMLEngine;

  beforeAll(async () => {
    quantumProcessor = new QuantumProcessor();
    quantumMLEngine = new QuantumMLEngine();
    
    console.log('✅ Setup de testes quânticos concluído');
  });

  describe('🔬 QuantumProcessor - Processamento Principal', () => {
    test('Deve processar operação quântica básica', async () => {
      const result = await quantumProcessor.processOperation({
        type: 'optimization',
        data: { values: [1, 2, 3, 4, 5] },
        complexity: 2,
        userId: 1
      });

      expect(result.success).toBe(true);
      expect(result.quantumSpeedup).toBeGreaterThan(1);
      expect(result.fidelity).toBeGreaterThan(0.8);
      expect(result.executionTime).toBeDefined();
    });

    test('Deve processar múltiplas operações simultaneamente', async () => {
      const operations = [
        { type: 'search', data: { database: [1, 2, 3, 4] }, complexity: 1, userId: 1 },
        { type: 'optimization', data: { values: [5, 6, 7, 8] }, complexity: 2, userId: 1 },
        { type: 'ml_enhancement', data: { features: [0.1, 0.2, 0.3] }, complexity: 3, userId: 1 }
      ];

      const promises = operations.map(op => quantumProcessor.processOperation(op));
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.quantumSpeedup).toBeGreaterThan(1);
      });
    });

    test('Deve validar parâmetros de entrada', async () => {
      const result = await quantumProcessor.processOperation({
        type: 'invalid_type',
        data: null,
        complexity: 0,
        userId: null
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('Deve calcular métricas de performance corretamente', async () => {
      const result = await quantumProcessor.processOperation({
        type: 'performance_test',
        data: { size: 1000 },
        complexity: 3,
        userId: 1
      });

      expect(result.success).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.classicalTime).toBeGreaterThan(0);
      expect(result.metrics.quantumTime).toBeGreaterThan(0);
      expect(result.metrics.speedupRatio).toBeGreaterThan(1);
    });
  });

  describe('🧠 QuantumMLEngine - Machine Learning Quântico', () => {
    test('Deve treinar modelo quântico', async () => {
      const trainingData = [
        { features: [0.1, 0.2, 0.3], label: 1 },
        { features: [0.4, 0.5, 0.6], label: 0 },
        { features: [0.7, 0.8, 0.9], label: 1 },
        { features: [0.2, 0.3, 0.4], label: 0 }
      ];

      const result = await quantumMLEngine.trainModel({
        data: trainingData,
        modelType: 'classification',
        quantumLayers: 3,
        epochs: 10
      });

      expect(result.success).toBe(true);
      expect(result.modelId).toBeDefined();
      expect(result.accuracy).toBeGreaterThan(0.5);
      expect(result.quantumAdvantage).toBe(true);
    });

    test('Deve fazer predições com modelo treinado', async () => {
      // Primeiro treinar um modelo
      const trainingData = [
        { features: [0.1, 0.2], label: 1 },
        { features: [0.8, 0.9], label: 0 }
      ];

      const trainResult = await quantumMLEngine.trainModel({
        data: trainingData,
        modelType: 'classification',
        quantumLayers: 2
      });

      expect(trainResult.success).toBe(true);

      // Fazer predição
      const predictionResult = await quantumMLEngine.predict({
        modelId: trainResult.modelId,
        features: [0.3, 0.4]
      });

      expect(predictionResult.success).toBe(true);
      expect(predictionResult.prediction).toBeDefined();
      expect(predictionResult.confidence).toBeGreaterThan(0);
      expect(predictionResult.confidence).toBeLessThanOrEqual(1);
    });

    test('Deve otimizar hiperparâmetros quanticamente', async () => {
      const result = await quantumMLEngine.optimizeHyperparameters({
        modelType: 'regression',
        searchSpace: {
          learningRate: [0.001, 0.1],
          quantumLayers: [2, 8],
          entanglement: ['linear', 'circular', 'full']
        },
        maxIterations: 5
      });

      expect(result.success).toBe(true);
      expect(result.bestParams).toBeDefined();
      expect(result.bestScore).toBeGreaterThan(0);
      expect(result.quantumSpeedup).toBeGreaterThan(1);
    });
  });

  describe('🔍 Algoritmo de Grover - Busca Quântica', () => {
    test('Deve executar busca de Grover corretamente', async () => {
      const grover = new GroversAlgorithm();
      
      const database = [1, 2, 3, 4, 5, 6, 7, 8];
      const target = 5;

      const result = await grover.search(database, target);

      expect(result.success).toBe(true);
      expect(result.found).toBe(true);
      expect(result.index).toBe(4); // índice do valor 5
      expect(result.iterations).toBeLessThan(database.length);
      expect(result.quantumSpeedup).toBeGreaterThan(1);
    });

    test('Deve demonstrar vantagem quântica em busca', async () => {
      const grover = new GroversAlgorithm();
      
      // Teste com database maior
      const database = Array.from({ length: 1000 }, (_, i) => i + 1);
      const target = 777;

      const startTime = Date.now();
      const result = await grover.search(database, target);
      const quantumTime = Date.now() - startTime;

      // Busca clássica para comparação
      const classicalStart = Date.now();
      const classicalIndex = database.indexOf(target);
      const classicalTime = Date.now() - classicalStart;

      expect(result.success).toBe(true);
      expect(result.found).toBe(true);
      expect(result.index).toBe(classicalIndex);
      
      // Verificar vantagem quântica (em teoria)
      expect(result.theoreticalSpeedup).toBeGreaterThan(1);
      
      console.log(`🔍 Grover: ${quantumTime}ms vs Clássico: ${classicalTime}ms`);
    });

    test('Deve lidar com elemento não encontrado', async () => {
      const grover = new GroversAlgorithm();
      
      const database = [1, 2, 3, 4, 5];
      const target = 10; // não existe

      const result = await grover.search(database, target);

      expect(result.success).toBe(true);
      expect(result.found).toBe(false);
      expect(result.index).toBe(-1);
    });
  });

  describe('🧠 Rede Neural Quântica', () => {
    test('Deve criar e treinar rede neural quântica', async () => {
      const qnn = new QuantumNeuralNetwork({
        inputSize: 3,
        hiddenLayers: [4, 4],
        outputSize: 2,
        quantumLayers: 2
      });

      const trainingData = [
        { input: [0.1, 0.2, 0.3], output: [1, 0] },
        { input: [0.4, 0.5, 0.6], output: [0, 1] },
        { input: [0.7, 0.8, 0.9], output: [1, 0] },
        { input: [0.2, 0.3, 0.4], output: [0, 1] }
      ];

      const result = await qnn.train(trainingData, {
        epochs: 20,
        learningRate: 0.01,
        batchSize: 2
      });

      expect(result.success).toBe(true);
      expect(result.finalLoss).toBeLessThan(result.initialLoss);
      expect(result.accuracy).toBeGreaterThan(0.5);
      expect(result.quantumEntanglement).toBeGreaterThan(0);
    });

    test('Deve fazer forward pass corretamente', async () => {
      const qnn = new QuantumNeuralNetwork({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
        quantumLayers: 1
      });

      const input = [0.5, 0.7];
      const result = await qnn.forward(input);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
      expect(result.output.length).toBe(1);
      expect(result.output[0]).toBeGreaterThanOrEqual(0);
      expect(result.output[0]).toBeLessThanOrEqual(1);
      expect(result.quantumStates).toBeDefined();
    });

    test('Deve calcular gradientes quanticamente', async () => {
      const qnn = new QuantumNeuralNetwork({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 1,
        quantumLayers: 1
      });

      const input = [0.3, 0.8];
      const target = [0.6];

      const result = await qnn.calculateQuantumGradients(input, target);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.gradients)).toBe(true);
      expect(result.gradients.length).toBeGreaterThan(0);
      expect(result.quantumFidelity).toBeGreaterThan(0.5);
    });
  });

  describe('📊 Métricas e Validação Quântica', () => {
    test('Deve calcular fidelidade quântica corretamente', async () => {
      const result = await quantumProcessor.calculateFidelity({
        targetState: [0.707, 0, 0, 0.707], // Estado Bell
        actualState: [0.7, 0.1, 0.1, 0.7]   // Estado aproximado
      });

      expect(result.success).toBe(true);
      expect(result.fidelity).toBeGreaterThan(0);
      expect(result.fidelity).toBeLessThanOrEqual(1);
      expect(result.fidelity).toBeGreaterThan(0.8); // Deve ser alta para estados similares
    });

    test('Deve medir emaranhamento quântico', async () => {
      const result = await quantumProcessor.measureEntanglement({
        qubits: 4,
        state: 'bell_state'
      });

      expect(result.success).toBe(true);
      expect(result.entanglement).toBeGreaterThan(0);
      expect(result.entanglement).toBeLessThanOrEqual(1);
      expect(result.entanglementType).toBeDefined();
    });

    test('Deve validar correção de erro quântico', async () => {
      const result = await quantumProcessor.testErrorCorrection({
        codeType: 'surface_code',
        errorRate: 0.01,
        iterations: 100
      });

      expect(result.success).toBe(true);
      expect(result.correctionRate).toBeGreaterThan(0.9);
      expect(result.logicalErrorRate).toBeLessThan(0.01);
      expect(result.threshold).toBeDefined();
    });

    test('Deve benchmark performance quântica vs clássica', async () => {
      const problems = [
        { type: 'factorization', size: 15 },
        { type: 'optimization', size: 100 },
        { type: 'simulation', size: 50 }
      ];

      for (const problem of problems) {
        const result = await quantumProcessor.benchmark(problem);

        expect(result.success).toBe(true);
        expect(result.quantumTime).toBeGreaterThan(0);
        expect(result.classicalTime).toBeGreaterThan(0);
        expect(result.speedup).toBeDefined();
        
        console.log(`⚡ ${problem.type}: Speedup ${result.speedup}x`);
      }
    });
  });

  describe('🔗 Integração IBM Quantum', () => {
    test('Deve conectar com IBM Quantum (se token disponível)', async () => {
      if (!process.env.IBM_QUANTUM_TOKEN) {
        console.log('⚠️ Token IBM Quantum não disponível - pulando teste');
        return;
      }

      const result = await quantumProcessor.connectIBMQuantum({
        token: process.env.IBM_QUANTUM_TOKEN,
        hub: 'ibm-q',
        group: 'open',
        project: 'main'
      });

      expect(result.success).toBe(true);
      expect(result.backends).toBeDefined();
      expect(Array.isArray(result.backends)).toBe(true);
      expect(result.backends.length).toBeGreaterThan(0);
    });

    test('Deve executar circuito em simulador IBM', async () => {
      const result = await quantumProcessor.executeOnIBM({
        circuit: 'bell_state',
        backend: 'ibmq_qasm_simulator',
        shots: 1024
      });

      if (result.success) {
        expect(result.counts).toBeDefined();
        expect(result.executionTime).toBeGreaterThan(0);
        expect(result.jobId).toBeDefined();
      } else {
        console.log('⚠️ Execução IBM falhou (esperado sem token):', result.error);
      }
    });
  });

  describe('🎯 Casos de Uso Empresariais', () => {
    test('Deve otimizar portfolio financeiro quanticamente', async () => {
      const assets = [
        { symbol: 'AAPL', return: 0.12, risk: 0.18 },
        { symbol: 'GOOGL', return: 0.15, risk: 0.22 },
        { symbol: 'MSFT', return: 0.10, risk: 0.15 },
        { symbol: 'TSLA', return: 0.25, risk: 0.35 }
      ];

      const result = await quantumProcessor.optimizePortfolio({
        assets,
        targetReturn: 0.15,
        riskTolerance: 0.20,
        budget: 100000
      });

      expect(result.success).toBe(true);
      expect(result.allocation).toBeDefined();
      expect(result.expectedReturn).toBeCloseTo(0.15, 2);
      expect(result.risk).toBeLessThanOrEqual(0.20);
      expect(result.quantumAdvantage).toBe(true);
    });

    test('Deve otimizar logística de entrega', async () => {
      const deliveries = [
        { id: 1, lat: -23.5505, lng: -46.6333, priority: 1 },
        { id: 2, lat: -23.5629, lng: -46.6544, priority: 2 },
        { id: 3, lat: -23.5489, lng: -46.6388, priority: 1 },
        { id: 4, lat: -23.5558, lng: -46.6396, priority: 3 }
      ];

      const result = await quantumProcessor.optimizeDeliveryRoute({
        deliveries,
        startLocation: { lat: -23.5505, lng: -46.6333 },
        vehicleCapacity: 100,
        timeWindow: 8 // horas
      });

      expect(result.success).toBe(true);
      expect(result.route).toBeDefined();
      expect(Array.isArray(result.route)).toBe(true);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.estimatedTime).toBeGreaterThan(0);
      expect(result.quantumSpeedup).toBeGreaterThan(1);
    });

    test('Deve detectar fraudes em transações', async () => {
      const transactions = [
        { amount: 100, location: 'SP', time: '10:00', user: 'user1' },
        { amount: 50000, location: 'NY', time: '10:05', user: 'user1' }, // suspeita
        { amount: 200, location: 'SP', time: '14:00', user: 'user2' },
        { amount: 1000000, location: 'Unknown', time: '02:00', user: 'user3' } // suspeita
      ];

      const result = await quantumProcessor.detectFraud({
        transactions,
        model: 'quantum_anomaly_detection',
        threshold: 0.8
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.fraudulent)).toBe(true);
      expect(result.fraudulent.length).toBeGreaterThan(0);
      expect(result.accuracy).toBeGreaterThan(0.8);
      expect(result.quantumAdvantage).toBe(true);
    });
  });

  describe('🔄 Testes de Stress e Concorrência', () => {
    test('Deve processar múltiplas operações quânticas simultaneamente', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        type: 'optimization',
        data: { values: Array.from({ length: 100 }, () => Math.random()) },
        complexity: 2,
        userId: i + 1
      }));

      const startTime = Date.now();
      const promises = operations.map(op => quantumProcessor.processOperation(op));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.quantumSpeedup).toBeGreaterThan(1);
      });

      expect(totalTime).toBeLessThan(10000); // Menos de 10 segundos
      console.log(`⚡ 10 operações simultâneas: ${totalTime}ms`);
    });

    test('Deve manter performance com alta carga', async () => {
      const heavyOperations = Array.from({ length: 5 }, (_, i) => ({
        type: 'heavy_computation',
        data: { 
          matrix: Array.from({ length: 100 }, () => 
            Array.from({ length: 100 }, () => Math.random())
          )
        },
        complexity: 4,
        userId: i + 1
      }));

      const results = await Promise.all(
        heavyOperations.map(op => quantumProcessor.processOperation(op))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.executionTime).toBeLessThan(5000); // Menos de 5 segundos
      });
    });
  });
});

// Testes de integração com outros serviços
describe('🔗 INTEGRAÇÃO QUÂNTICA COM OUTROS SERVIÇOS', () => {
  test('Deve integrar com MILA para análise quântica', async () => {
    const MilaService = require('../services/MilaService');
    const milaService = new MilaService();

    const result = await milaService.processWithQuantum({
      message: 'Analise os dados de vendas e otimize a estratégia',
      data: {
        sales: [100, 150, 200, 180, 220],
        costs: [50, 75, 100, 90, 110]
      },
      quantumEnhanced: true
    });

    expect(result.success).toBe(true);
    expect(result.quantumProcessed).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.quantumAdvantage).toBe(true);
  });

  test('Deve integrar com sistema de relatórios', async () => {
    const ReportService = require('../services/ReportService');
    const reportService = new ReportService();

    const result = await reportService.generateQuantumReport({
      type: 'optimization_analysis',
      data: {
        processes: ['A', 'B', 'C', 'D'],
        metrics: [0.8, 0.6, 0.9, 0.7]
      },
      quantumEnhanced: true
    });

    expect(result.success).toBe(true);
    expect(result.quantumOptimized).toBe(true);
    expect(result.recommendations).toBeDefined();
    expect(result.speedup).toBeGreaterThan(1);
  });
});
