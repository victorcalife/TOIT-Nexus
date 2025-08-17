/**
 * TESTE COMPLETO DO SISTEMA QUÂNTICO
 * Validar todas as funcionalidades críticas
 */

const QuantumProcessor = require('./services/QuantumProcessor');

class QuantumTester {
  constructor() {
    this.quantumProcessor = new QuantumProcessor();
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 [TEST] ${name}...`);
      await testFn();
      console.log(`✅ [PASS] ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ [FAIL] ${name}:`, error.message);
      this.failed++;
    }
  }

  /**
   * Testar inicialização do sistema quântico
   */
  async testQuantumInitialization() {
    await this.test('Inicialização do Sistema Quântico', async () => {
      // Aguardar inicialização se necessário
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!this.quantumProcessor.isOperational()) {
        throw new Error('Sistema quântico não está operacional');
      }

      const coherence = this.quantumProcessor.getSystemCoherence();
      if (coherence < 0.9) {
        throw new Error(`Coerência muito baixa: ${coherence}`);
      }

      console.log(`   📝 Sistema operacional com coerência: ${coherence}`);
    });
  }

  /**
   * Testar algoritmo de Grover
   */
  async testGroverAlgorithm() {
    await this.test('Algoritmo de Grover', async () => {
      const searchSpace = Array.from({ length: 1000 }, (_, i) => i);
      const targetItem = 42;

      const result = await this.quantumProcessor.processOperation({
        type: 'search',
        data: {
          searchSpace,
          targetItem,
          iterations: null // Usar ótimo
        },
        complexity: 3,
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error('Algoritmo de Grover falhou');
      }

      if (!result.result.found) {
        throw new Error('Item não foi encontrado');
      }

      if (result.quantumSpeedup < 1) {
        throw new Error('Speedup quântico não foi alcançado');
      }

      console.log(`   📝 Grover: item encontrado com speedup ${result.quantumSpeedup.toFixed(2)}x`);
    });
  }

  /**
   * Testar algoritmo QAOA
   */
  async testQAOAAlgorithm() {
    await this.test('Algoritmo QAOA', async () => {
      const problem = {
        type: 'max_cut',
        graph: {
          nodes: 10,
          edges: [[0, 1], [1, 2], [2, 3], [3, 0]]
        }
      };

      const result = await this.quantumProcessor.processOperation({
        type: 'optimization',
        data: {
          problem,
          layers: 3
        },
        complexity: 4,
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error('Algoritmo QAOA falhou');
      }

      if (!result.result.solution) {
        throw new Error('Solução não foi encontrada');
      }

      if (result.result.approximationRatio < 0.5) {
        throw new Error('Razão de aproximação muito baixa');
      }

      console.log(`   📝 QAOA: solução encontrada com razão ${result.result.approximationRatio.toFixed(3)}`);
    });
  }

  /**
   * Testar algoritmo VQE
   */
  async testVQEAlgorithm() {
    await this.test('Algoritmo VQE', async () => {
      const hamiltonian = {
        type: 'molecular',
        molecule: 'H2',
        basis: 'sto-3g'
      };

      const result = await this.quantumProcessor.processOperation({
        type: 'eigenvalue',
        data: {
          hamiltonian,
          ansatz: 'hardware_efficient'
        },
        complexity: 3,
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error('Algoritmo VQE falhou');
      }

      if (!result.result.convergence) {
        throw new Error('VQE não convergiu');
      }

      if (typeof result.result.groundStateEnergy !== 'number') {
        throw new Error('Energia do estado fundamental não foi calculada');
      }

      console.log(`   📝 VQE: energia do estado fundamental ${result.result.groundStateEnergy.toFixed(4)}`);
    });
  }

  /**
   * Testar Quantum Neural Network
   */
  async testQuantumNeuralNetwork() {
    await this.test('Quantum Neural Network', async () => {
      const inputData = [0.5, 0.3, 0.8, 0.1];

      const result = await this.quantumProcessor.processOperation({
        type: 'ml',
        data: {
          inputData,
          layers: 4
        },
        complexity: 3,
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error('QNN falhou');
      }

      if (typeof result.result.prediction !== 'number') {
        throw new Error('Predição não foi gerada');
      }

      if (result.result.confidence < 0.5) {
        throw new Error('Confiança muito baixa');
      }

      console.log(`   📝 QNN: predição ${result.result.prediction.toFixed(3)} (confiança: ${result.result.confidence.toFixed(3)})`);
    });
  }

  /**
   * Testar cálculo de speedup quântico
   */
  async testQuantumSpeedup() {
    await this.test('Cálculo de Speedup Quântico', async () => {
      const complexities = [1, 2, 3, 4, 5];
      
      for (const complexity of complexities) {
        const speedup = this.quantumProcessor.calculateSpeedup(complexity);
        
        if (speedup < 1) {
          throw new Error(`Speedup inválido para complexidade ${complexity}: ${speedup}`);
        }

        if (speedup < Math.sqrt(complexity)) {
          throw new Error(`Speedup menor que esperado para complexidade ${complexity}`);
        }
      }

      console.log(`   📝 Speedup calculado corretamente para complexidades 1-5`);
    });
  }

  /**
   * Testar métricas do sistema
   */
  async testSystemMetrics() {
    await this.test('Métricas do Sistema', async () => {
      const metrics = {
        qubits: this.quantumProcessor.qubits,
        quantumVolume: this.quantumProcessor.quantumVolume,
        coherenceTime: this.quantumProcessor.coherenceTime,
        fidelity: this.quantumProcessor.fidelity,
        algorithms: this.quantumProcessor.algorithms,
        backends: this.quantumProcessor.backends
      };

      if (metrics.qubits < 32) {
        throw new Error(`Número insuficiente de qubits: ${metrics.qubits}`);
      }

      if (metrics.fidelity < 0.9) {
        throw new Error(`Fidelidade muito baixa: ${metrics.fidelity}`);
      }

      if (metrics.algorithms.length < 5) {
        throw new Error(`Poucos algoritmos disponíveis: ${metrics.algorithms.length}`);
      }

      console.log(`   📝 Métricas: ${metrics.qubits} qubits, fidelidade ${metrics.fidelity}`);
    });
  }

  /**
   * Testar operação genérica
   */
  async testGenericOperation() {
    await this.test('Operação Genérica', async () => {
      const data = { test: 'data', values: [1, 2, 3, 4, 5] };

      const result = await this.quantumProcessor.processOperation({
        type: 'generic',
        data,
        complexity: 2,
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error('Operação genérica falhou');
      }

      if (!result.result.quantumEnhanced) {
        throw new Error('Processamento quântico não foi aplicado');
      }

      if (result.executionTime < 0) {
        throw new Error('Tempo de execução inválido');
      }

      console.log(`   📝 Operação genérica executada em ${result.executionTime}ms`);
    });
  }

  /**
   * Testar performance sob carga
   */
  async testPerformanceUnderLoad() {
    await this.test('Performance Sob Carga', async () => {
      const operations = [];
      const numOperations = 5;

      // Executar múltiplas operações simultaneamente
      for (let i = 0; i < numOperations; i++) {
        operations.push(
          this.quantumProcessor.processOperation({
            type: 'search',
            data: {
              searchSpace: Array.from({ length: 100 }, (_, j) => j),
              targetItem: i * 10
            },
            complexity: 2,
            userId: `test-user-${i}`
          })
        );
      }

      const results = await Promise.all(operations);
      
      const successfulOperations = results.filter(r => r.success);
      if (successfulOperations.length !== numOperations) {
        throw new Error(`Apenas ${successfulOperations.length}/${numOperations} operações foram bem-sucedidas`);
      }

      const avgSpeedup = successfulOperations.reduce((sum, r) => sum + r.quantumSpeedup, 0) / numOperations;
      if (avgSpeedup < 1) {
        throw new Error(`Speedup médio muito baixo: ${avgSpeedup}`);
      }

      console.log(`   📝 ${numOperations} operações executadas com speedup médio ${avgSpeedup.toFixed(2)}x`);
    });
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA QUÂNTICO\n');

    await this.testQuantumInitialization();
    await this.testGroverAlgorithm();
    await this.testQAOAAlgorithm();
    await this.testVQEAlgorithm();
    await this.testQuantumNeuralNetwork();
    await this.testQuantumSpeedup();
    await this.testSystemMetrics();
    await this.testGenericOperation();
    await this.testPerformanceUnderLoad();

    console.log('\n📊 RELATÓRIO DE TESTES:');
    console.log(`✅ Testes passaram: ${this.passed}`);
    console.log(`❌ Testes falharam: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM - SISTEMA QUÂNTICO FUNCIONANDO!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new QuantumTester();
  tester.runAllTests().catch(console.error);
}

module.exports = QuantumTester;
