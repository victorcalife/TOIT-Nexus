/**
 * TESTE COMPLETO DO SISTEMA DE WORKFLOWS
 * Validar todas as funcionalidades críticas
 */

const WorkflowService = require('./services/WorkflowService');

class WorkflowsTester {
  constructor() {
    this.workflowService = new WorkflowService();
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
   * Testar validação de workflow
   */
  async testWorkflowValidation() {
    await this.test('Validação de Workflow', async () => {
      // Workflow válido
      const validWorkflow = {
        nodes: [
          { id: 'start1', type: 'start', data: {} },
          { id: 'action1', type: 'action', data: { action: 'send_notification' } },
          { id: 'end1', type: 'end', data: {} }
        ],
        edges: [
          { source: 'start1', target: 'action1' },
          { source: 'action1', target: 'end1' }
        ],
        config: {}
      };

      const validResult = await this.workflowService.validateWorkflow(validWorkflow);
      
      if (!validResult.valid) {
        throw new Error(`Workflow válido foi rejeitado: ${validResult.errors.join(', ')}`);
      }

      // Workflow inválido (sem nó de início)
      const invalidWorkflow = {
        nodes: [
          { id: 'action1', type: 'action', data: {} },
          { id: 'end1', type: 'end', data: {} }
        ],
        edges: [
          { source: 'action1', target: 'end1' }
        ],
        config: {}
      };

      const invalidResult = await this.workflowService.validateWorkflow(invalidWorkflow);
      
      if (invalidResult.valid) {
        throw new Error('Workflow inválido foi aceito');
      }

      console.log(`   📝 Validação funcionando: válido aceito, inválido rejeitado`);
    });
  }

  /**
   * Testar execução de workflow simples
   */
  async testSimpleWorkflowExecution() {
    await this.test('Execução de Workflow Simples', async () => {
      const workflow = {
        id: 'test-workflow-1',
        name: 'Workflow de Teste',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: { 
              variables: { testVar: 'valor inicial' } 
            } 
          },
          { 
            id: 'action1', 
            type: 'action', 
            data: { 
              action: 'send_notification',
              parameters: { message: 'Teste de notificação' }
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'action1' },
          { source: 'action1', target: 'end1' }
        ]
      };

      const result = await this.workflowService.executeWorkflow({
        workflow,
        parameters: { userId: 'test-user' },
        dryRun: true,
        executionId: 'test-exec-1',
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error(`Execução falhou: ${result.error}`);
      }

      if (!result.context.variables.testVar) {
        throw new Error('Variáveis do contexto não foram preservadas');
      }

      if (!result.context.results.start1) {
        throw new Error('Resultado do nó de início não foi salvo');
      }

      console.log(`   📝 Workflow executado em ${result.context.executionTime}s`);
    });
  }

  /**
   * Testar workflow com condição
   */
  async testConditionalWorkflow() {
    await this.test('Workflow com Condição', async () => {
      const workflow = {
        id: 'test-workflow-conditional',
        name: 'Workflow Condicional',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: {} 
          },
          { 
            id: 'condition1', 
            type: 'condition', 
            data: { 
              condition: 'parameters.value > 10',
              trueAction: 'continue',
              falseAction: 'skip'
            } 
          },
          { 
            id: 'action1', 
            type: 'action', 
            data: { 
              action: 'send_notification',
              parameters: { message: 'Valor é maior que 10' }
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'condition1' },
          { source: 'condition1', target: 'action1' },
          { source: 'action1', target: 'end1' }
        ]
      };

      // Testar com valor que satisfaz a condição
      const result = await this.workflowService.executeWorkflow({
        workflow,
        parameters: { value: 15 },
        dryRun: true,
        executionId: 'test-exec-conditional',
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error(`Execução condicional falhou: ${result.error}`);
      }

      console.log(`   📝 Workflow condicional executado com sucesso`);
    });
  }

  /**
   * Testar workflow com processamento quântico
   */
  async testQuantumWorkflow() {
    await this.test('Workflow com Processamento Quântico', async () => {
      const workflow = {
        id: 'test-workflow-quantum',
        name: 'Workflow Quântico',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: {} 
          },
          { 
            id: 'quantum1', 
            type: 'quantum_process', 
            data: { 
              operation: 'optimization',
              parameters: { 
                data: [1, 2, 3, 4, 5],
                algorithm: 'grover'
              }
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'quantum1' },
          { source: 'quantum1', target: 'end1' }
        ]
      };

      const result = await this.workflowService.executeWorkflow({
        workflow,
        parameters: {},
        dryRun: true,
        executionId: 'test-exec-quantum',
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error(`Execução quântica falhou: ${result.error}`);
      }

      const quantumResult = result.context.results.quantum1;
      if (!quantumResult || !quantumResult.quantumSpeedup) {
        throw new Error('Resultado quântico não foi gerado');
      }

      console.log(`   📝 Processamento quântico com speedup: ${quantumResult.quantumSpeedup}x`);
    });
  }

  /**
   * Testar workflow com análise MILA
   */
  async testMilaWorkflow() {
    await this.test('Workflow com Análise MILA', async () => {
      const workflow = {
        id: 'test-workflow-mila',
        name: 'Workflow MILA',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: {} 
          },
          { 
            id: 'mila1', 
            type: 'mila_analyze', 
            data: { 
              analysisType: 'sentiment',
              data: 'Este é um texto para análise de sentimento'
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'mila1' },
          { source: 'mila1', target: 'end1' }
        ]
      };

      const result = await this.workflowService.executeWorkflow({
        workflow,
        parameters: {},
        dryRun: true,
        executionId: 'test-exec-mila',
        userId: 'test-user'
      });
      
      if (!result.success) {
        throw new Error(`Execução MILA falhou: ${result.error}`);
      }

      const milaResult = result.context.results.mila1;
      if (!milaResult || !milaResult.analysis) {
        throw new Error('Resultado MILA não foi gerado');
      }

      console.log(`   📝 Análise MILA: ${milaResult.analysis.sentiment} (${milaResult.analysis.confidence})`);
    });
  }

  /**
   * Testar detecção de ciclos
   */
  async testCycleDetection() {
    await this.test('Detecção de Ciclos', async () => {
      const nodes = [
        { id: 'node1', type: 'start' },
        { id: 'node2', type: 'action' },
        { id: 'node3', type: 'action' }
      ];

      const edges = [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' },
        { source: 'node3', target: 'node2' } // Ciclo!
      ];

      const hasCycles = this.workflowService.detectCycles(nodes, edges);
      
      if (!hasCycles) {
        throw new Error('Ciclo não foi detectado');
      }

      console.log(`   📝 Ciclo detectado corretamente`);
    });
  }

  /**
   * Testar obtenção de próximos nós
   */
  async testGetNextNodes() {
    await this.test('Obtenção de Próximos Nós', async () => {
      const nodes = [
        { id: 'node1', type: 'start' },
        { id: 'node2', type: 'action' },
        { id: 'node3', type: 'action' },
        { id: 'node4', type: 'end' }
      ];

      const edges = [
        { source: 'node1', target: 'node2' },
        { source: 'node1', target: 'node3' },
        { source: 'node2', target: 'node4' },
        { source: 'node3', target: 'node4' }
      ];

      const nextNodes = this.workflowService.getNextNodes('node1', edges, nodes);
      
      if (nextNodes.length !== 2) {
        throw new Error(`Esperado 2 próximos nós, encontrado ${nextNodes.length}`);
      }

      const nodeIds = nextNodes.map(n => n.id);
      if (!nodeIds.includes('node2') || !nodeIds.includes('node3')) {
        throw new Error('Próximos nós incorretos');
      }

      console.log(`   📝 Próximos nós encontrados: ${nodeIds.join(', ')}`);
    });
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE WORKFLOWS\n');

    await this.testWorkflowValidation();
    await this.testSimpleWorkflowExecution();
    await this.testConditionalWorkflow();
    await this.testQuantumWorkflow();
    await this.testMilaWorkflow();
    await this.testCycleDetection();
    await this.testGetNextNodes();

    console.log('\n📊 RELATÓRIO DE TESTES:');
    console.log(`✅ Testes passaram: ${this.passed}`);
    console.log(`❌ Testes falharam: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM - SISTEMA DE WORKFLOWS FUNCIONANDO!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new WorkflowsTester();
  tester.runAllTests().catch(console.error);
}

module.exports = WorkflowsTester;
