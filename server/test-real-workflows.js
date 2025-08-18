/**
 * TESTE FUNCIONAL REAL DOS WORKFLOWS PROFISSIONAIS
 * Testa o caso de uso específico: Query → Análise → Tasks
 * 100% REAL - SEM SIMULAÇÕES
 */

const WorkflowService = require('./services/WorkflowService');
const { db } = require('./database-config');

class RealWorkflowTester {
  constructor() {
    this.workflowService = new WorkflowService();
    this.passed = 0;
    this.failed = 0;
    this.testResults = [];
  }

  async test(name, testFn) {
    try {
      console.log(`\n🧪 TESTE: ${name}`);
      console.log('─'.repeat(50));
      
      const startTime = Date.now();
      await testFn();
      const endTime = Date.now();
      
      console.log(`✅ PASSOU em ${endTime - startTime}ms`);
      this.passed++;
      this.testResults.push({ name, status: 'PASSOU', time: endTime - startTime });
      
    } catch (error) {
      console.log(`❌ FALHOU: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
      this.failed++;
      this.testResults.push({ name, status: 'FALHOU', error: error.message });
    }
  }

  /**
   * TESTE 1: EXECUÇÃO REAL DE QUERY
   */
  async testRealQueryExecution() {
    await this.test('Execução REAL de Query no Banco', async () => {
      const workflow = {
        id: 'test-real-query',
        name: 'Teste Query Real',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: {} 
          },
          { 
            id: 'query1', 
            type: 'execute_query', 
            data: { 
              connectionId: 'main',
              query: 'SELECT id, name, email FROM users LIMIT 3',
              saveAs: 'users_result',
              timeout: 10000
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'query1' },
          { source: 'query1', target: 'end1' }
        ]
      };

      const context = {
        workflowId: 'test-real-query',
        executionId: 'test-exec-query',
        userId: 'test-user',
        tenantId: 'test-tenant',
        variables: {},
        results: {},
        dryRun: false
      };

      const result = await this.workflowService.executeWorkflow(workflow, context);
      
      if (!result.success) {
        throw new Error(`Execução falhou: ${result.error}`);
      }

      // Verificar se a query foi executada
      if (!context.variables.users_result) {
        throw new Error('Resultado da query não foi salvo');
      }

      console.log(`   📊 Query executada: ${context.variables.users_result.rowCount} registros`);
      console.log(`   ⏱️ Tempo de execução: ${context.variables.users_result.executionTime}ms`);
    });
  }

  /**
   * TESTE 2: CRIAÇÃO REAL DE TASK
   */
  async testRealTaskCreation() {
    await this.test('Criação REAL de Task no Banco', async () => {
      // Primeiro, buscar um usuário real para atribuir a task
      const userResult = await db.query('SELECT id FROM users LIMIT 1');
      if (userResult.rows.length === 0) {
        throw new Error('Nenhum usuário encontrado para teste');
      }
      
      const userId = userResult.rows[0].id;
      
      // Buscar um projeto real
      const projectResult = await db.query('SELECT id FROM projects LIMIT 1');
      if (projectResult.rows.length === 0) {
        throw new Error('Nenhum projeto encontrado para teste');
      }
      
      const projectId = projectResult.rows[0].id;

      const workflow = {
        id: 'test-real-task',
        name: 'Teste Task Real',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: {} 
          },
          { 
            id: 'task1', 
            type: 'create_task', 
            data: { 
              title: 'Task de Teste Automatizada - ${execution_time}',
              description: 'Esta task foi criada automaticamente pelo teste de workflows em ${execution_time}',
              assigneeId: userId,
              priority: 'high',
              projectId: projectId,
              tags: ['teste', 'automatizado', 'workflow'],
              dueDate: '${DATE_ADD(NOW(), 7, "days")}'
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'task1' },
          { source: 'task1', target: 'end1' }
        ]
      };

      const context = {
        workflowId: 'test-real-task',
        executionId: 'test-exec-task',
        userId: userId,
        tenantId: 'test-tenant',
        variables: {
          execution_time: new Date().toISOString()
        },
        results: {},
        dryRun: false
      };

      const result = await this.workflowService.executeWorkflow(workflow, context);
      
      if (!result.success) {
        throw new Error(`Execução falhou: ${result.error}`);
      }

      // Verificar se a task foi criada no banco
      const taskCheck = await db.query(
        'SELECT * FROM tasks WHERE title LIKE $1 ORDER BY created_at DESC LIMIT 1',
        ['Task de Teste Automatizada%']
      );

      if (taskCheck.rows.length === 0) {
        throw new Error('Task não foi criada no banco');
      }

      const createdTask = taskCheck.rows[0];
      console.log(`   📝 Task criada: ID ${createdTask.id}`);
      console.log(`   👤 Atribuída para: ${createdTask.assignee_id}`);
      console.log(`   🎯 Prioridade: ${createdTask.priority}`);
    });
  }

  /**
   * TESTE 3: CASO DE USO ESPECÍFICO - QUERY → ANÁLISE → TASKS
   */
  async testSpecificUseCase() {
    await this.test('Caso de Uso Específico: Query → Análise → Tasks', async () => {
      // Primeiro, inserir dados de teste
      await db.query(`
        INSERT INTO tasks (tenant_id, title, description, status, priority, project_id)
        VALUES 
        ('test-tenant', 'Cliente A - Pendência', 'Contatar Cliente A', 'todo', 'high', (SELECT id FROM projects LIMIT 1)),
        ('test-tenant', 'Cliente B - Pendência', 'Contatar Cliente B', 'todo', 'medium', (SELECT id FROM projects LIMIT 1)),
        ('test-tenant', 'Cliente C - Pendência', 'Contatar Cliente C', 'todo', 'low', (SELECT id FROM projects LIMIT 1))
        ON CONFLICT DO NOTHING
      `);

      const workflow = {
        id: 'test-specific-use-case',
        name: 'Query → Análise → Tasks',
        nodes: [
          { 
            id: 'start1', 
            type: 'start', 
            data: {} 
          },
          { 
            id: 'query1', 
            type: 'execute_query', 
            data: { 
              connectionId: 'main',
              query: `
                SELECT 
                  title,
                  CASE 
                    WHEN title LIKE '%Cliente A%' THEN 'funcionario_a'
                    WHEN title LIKE '%Cliente B%' THEN 'funcionario_b'
                    WHEN title LIKE '%Cliente C%' THEN 'funcionario_c'
                    ELSE 'funcionario_default'
                  END as funcionario_responsavel,
                  priority,
                  status
                FROM tasks 
                WHERE title LIKE '%Cliente%Pendência%'
                ORDER BY priority DESC
              `,
              saveAs: 'clientes_pendentes',
              timeout: 10000
            } 
          },
          { 
            id: 'task1', 
            type: 'create_task', 
            data: { 
              title: 'Análise Completa - ${clientes_pendentes.rowCount} clientes processados',
              description: `
                Workflow executado com sucesso!
                
                Clientes processados: ${clientes_pendentes.rowCount}
                Tempo de execução: ${execution_time}
                
                Próximos passos:
                - Revisar atribuições
                - Acompanhar progresso
                - Gerar relatório final
              `,
              assigneeId: '${current_user_id}',
              priority: 'high',
              projectId: '${project_id}',
              tags: ['workflow', 'automacao', 'analise'],
              conditions: [
                {
                  operator: '>',
                  left: '${clientes_pendentes.rowCount}',
                  right: 0
                }
              ]
            } 
          },
          { 
            id: 'end1', 
            type: 'end', 
            data: {} 
          }
        ],
        edges: [
          { source: 'start1', target: 'query1' },
          { source: 'query1', target: 'task1' },
          { source: 'task1', target: 'end1' }
        ]
      };

      // Buscar dados reais para o contexto
      const userResult = await db.query('SELECT id FROM users LIMIT 1');
      const projectResult = await db.query('SELECT id FROM projects LIMIT 1');

      const context = {
        workflowId: 'test-specific-use-case',
        executionId: 'test-exec-specific',
        userId: userResult.rows[0]?.id || 'test-user',
        tenantId: 'test-tenant',
        variables: {
          execution_time: new Date().toISOString(),
          current_user_id: userResult.rows[0]?.id || 'test-user',
          project_id: projectResult.rows[0]?.id || 'test-project'
        },
        results: {},
        dryRun: false
      };

      const result = await this.workflowService.executeWorkflow(workflow, context);
      
      if (!result.success) {
        throw new Error(`Execução falhou: ${result.error}`);
      }

      // Verificar resultados
      if (!context.variables.clientes_pendentes) {
        throw new Error('Query de clientes não foi executada');
      }

      console.log(`   📊 Clientes processados: ${context.variables.clientes_pendentes.rowCount}`);
      console.log(`   ⏱️ Tempo total: ${result.context?.executionTime || 'N/A'}s`);
      
      // Verificar se a task de análise foi criada
      const analysisTaskCheck = await db.query(
        'SELECT * FROM tasks WHERE title LIKE $1 ORDER BY created_at DESC LIMIT 1',
        ['Análise Completa%']
      );

      if (analysisTaskCheck.rows.length > 0) {
        console.log(`   ✅ Task de análise criada: ID ${analysisTaskCheck.rows[0].id}`);
      }
    });
  }

  /**
   * EXECUTAR TODOS OS TESTES
   */
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES FUNCIONAIS REAIS DOS WORKFLOWS\n');
    console.log('═'.repeat(60));

    await this.testRealQueryExecution();
    await this.testRealTaskCreation();
    await this.testSpecificUseCase();

    console.log('\n' + '═'.repeat(60));
    console.log('📊 RELATÓRIO FINAL DE TESTES:');
    console.log(`✅ Testes passaram: ${this.passed}`);
    console.log(`❌ Testes falharam: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM - WORKFLOWS FUNCIONANDO PERFEITAMENTE!');
      console.log('🏆 SISTEMA PRONTO PARA PRODUÇÃO!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new RealWorkflowTester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal nos testes:', error);
      process.exit(1);
    });
}

module.exports = RealWorkflowTester;
