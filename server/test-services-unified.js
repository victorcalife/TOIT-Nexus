/**
 * TESTE DOS SERVIÇOS UNIFICADOS
 * Valida camada de serviços e interfaces públicas
 * 100% JavaScript - SEM TYPESCRIPT
 */

class ServicesTestSuite {
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
   * TESTE DE IMPORTAÇÃO DOS SERVIÇOS
   */
  async testServicesImport() {
    try {
      const services = require('./services-unified');
      
      if (!services) {
        throw new Error('Serviços não puderam ser importados');
      }

      // Verificar se as classes principais existem
      const requiredClasses = [
        'BaseService',
        'UserService', 
        'TenantService',
        'ClientService',
        'WorkflowService'
      ];

      for (const className of requiredClasses) {
        if (!services[className]) {
          throw new Error(`Classe ${className} não encontrada`);
        }
      }

      // Verificar se as instâncias existem
      const requiredInstances = [
        'userService',
        'tenantService', 
        'clientService',
        'workflowService'
      ];

      for (const instanceName of requiredInstances) {
        if (!services[instanceName]) {
          throw new Error(`Instância ${instanceName} não encontrada`);
        }
      }

      console.log(`📦 [TEST] Serviços importados: ${Object.keys(services).length} exports`);
    } catch (error) {
      throw new Error(`Erro na importação: ${error.message}`);
    }
  }

  /**
   * TESTE DA CLASSE BASE
   */
  async testBaseService() {
    try {
      const { BaseService } = require('./services-unified');
      
      // Criar instância mock
      const mockService = new BaseService('test_table');
      
      if (!mockService.tableName || mockService.tableName !== 'test_table') {
        throw new Error('BaseService não inicializou corretamente');
      }

      // Verificar se métodos básicos existem
      const requiredMethods = [
        'findById',
        'list', 
        'create',
        'update',
        'delete'
      ];

      for (const method of requiredMethods) {
        if (typeof mockService[method] !== 'function') {
          throw new Error(`Método ${method} não encontrado na BaseService`);
        }
      }

      console.log(`🏗️ [TEST] BaseService com ${requiredMethods.length} métodos`);
    } catch (error) {
      throw new Error(`Erro na BaseService: ${error.message}`);
    }
  }

  /**
   * TESTE DO USER SERVICE
   */
  async testUserService() {
    try {
      const { UserService, userService } = require('./services-unified');
      
      // Verificar se é instância da classe correta
      if (!(userService instanceof UserService)) {
        throw new Error('userService não é instância de UserService');
      }

      // Verificar métodos específicos do UserService
      const specificMethods = [
        'findByCPF',
        'findByEmail',
        'createUser',
        'updateLastLogin',
        'getUsersByTenant'
      ];

      for (const method of specificMethods) {
        if (typeof userService[method] !== 'function') {
          throw new Error(`Método ${method} não encontrado no UserService`);
        }
      }

      // Verificar se herda da BaseService
      const baseMethods = ['findById', 'list', 'create', 'update', 'delete'];
      for (const method of baseMethods) {
        if (typeof userService[method] !== 'function') {
          throw new Error(`Método herdado ${method} não encontrado`);
        }
      }

      console.log(`👤 [TEST] UserService com ${specificMethods.length} métodos específicos`);
    } catch (error) {
      throw new Error(`Erro no UserService: ${error.message}`);
    }
  }

  /**
   * TESTE DO TENANT SERVICE
   */
  async testTenantService() {
    try {
      const { TenantService, tenantService } = require('./services-unified');
      
      if (!(tenantService instanceof TenantService)) {
        throw new Error('tenantService não é instância de TenantService');
      }

      const specificMethods = [
        'findBySlug',
        'findByDomain',
        'getActiveTenants'
      ];

      for (const method of specificMethods) {
        if (typeof tenantService[method] !== 'function') {
          throw new Error(`Método ${method} não encontrado no TenantService`);
        }
      }

      console.log(`🏢 [TEST] TenantService com ${specificMethods.length} métodos específicos`);
    } catch (error) {
      throw new Error(`Erro no TenantService: ${error.message}`);
    }
  }

  /**
   * TESTE DO CLIENT SERVICE
   */
  async testClientService() {
    try {
      const { ClientService, clientService } = require('./services-unified');
      
      if (!(clientService instanceof ClientService)) {
        throw new Error('clientService não é instância de ClientService');
      }

      const specificMethods = [
        'getClientsByTenant',
        'searchClients'
      ];

      for (const method of specificMethods) {
        if (typeof clientService[method] !== 'function') {
          throw new Error(`Método ${method} não encontrado no ClientService`);
        }
      }

      console.log(`👥 [TEST] ClientService com ${specificMethods.length} métodos específicos`);
    } catch (error) {
      throw new Error(`Erro no ClientService: ${error.message}`);
    }
  }

  /**
   * TESTE DO WORKFLOW SERVICE
   */
  async testWorkflowService() {
    try {
      const { WorkflowService, workflowService } = require('./services-unified');
      
      if (!(workflowService instanceof WorkflowService)) {
        throw new Error('workflowService não é instância de WorkflowService');
      }

      const specificMethods = [
        'getWorkflowsByTenant',
        'executeWorkflow'
      ];

      for (const method of specificMethods) {
        if (typeof workflowService[method] !== 'function') {
          throw new Error(`Método ${method} não encontrado no WorkflowService`);
        }
      }

      console.log(`⚙️ [TEST] WorkflowService com ${specificMethods.length} métodos específicos`);
    } catch (error) {
      throw new Error(`Erro no WorkflowService: ${error.message}`);
    }
  }

  /**
   * TESTE DE INTERFACES PÚBLICAS
   */
  async testPublicInterfaces() {
    try {
      const services = require('./services-unified');
      
      // Testar se todas as interfaces públicas estão disponíveis
      const publicInterfaces = [
        // Classes
        'BaseService',
        'UserService',
        'TenantService', 
        'ClientService',
        'WorkflowService',
        
        // Instâncias
        'userService',
        'tenantService',
        'clientService', 
        'workflowService'
      ];

      for (const interfaceName of publicInterfaces) {
        if (!services[interfaceName]) {
          throw new Error(`Interface pública ${interfaceName} não disponível`);
        }
      }

      console.log(`🔌 [TEST] Interfaces públicas: ${publicInterfaces.length} disponíveis`);
    } catch (error) {
      throw new Error(`Erro nas interfaces: ${error.message}`);
    }
  }

  /**
   * TESTE DE HERANÇA
   */
  async testInheritance() {
    try {
      const { BaseService, UserService, userService } = require('./services-unified');
      
      // Verificar se UserService herda de BaseService
      if (!(UserService.prototype instanceof BaseService)) {
        throw new Error('UserService não herda de BaseService');
      }

      // Verificar se instância tem métodos da classe pai
      const baseMethods = ['findById', 'list', 'create', 'update', 'delete'];
      for (const method of baseMethods) {
        if (typeof userService[method] !== 'function') {
          throw new Error(`Método herdado ${method} não disponível`);
        }
      }

      console.log(`🧬 [TEST] Herança funcionando: ${baseMethods.length} métodos herdados`);
    } catch (error) {
      throw new Error(`Erro na herança: ${error.message}`);
    }
  }

  /**
   * TESTE DE CONFIGURAÇÃO DE TABELAS
   */
  async testTableConfiguration() {
    try {
      const { userService, tenantService, clientService } = require('./services-unified');
      
      // Verificar se cada serviço tem sua tabela configurada
      const serviceTableMap = {
        userService: 'users',
        tenantService: 'tenants', 
        clientService: 'clients'
      };

      for (const [serviceName, expectedTable] of Object.entries(serviceTableMap)) {
        const service = eval(serviceName);
        if (service.tableName !== expectedTable) {
          throw new Error(`${serviceName} não configurado para tabela ${expectedTable}`);
        }
      }

      console.log(`🗄️ [TEST] Configuração de tabelas: ${Object.keys(serviceTableMap).length} serviços`);
    } catch (error) {
      throw new Error(`Erro na configuração: ${error.message}`);
    }
  }

  /**
   * TESTE DE MOCK DE OPERAÇÕES
   */
  async testMockOperations() {
    try {
      const { userService } = require('./services-unified');
      
      // Mock do banco de dados para teste
      const originalDb = userService.db;
      userService.db = {
        select: () => ({
          from: () => ({
            where: () => ({ limit: () => [{ id: 'test-user', cpf: '12345678901' }] })
          })
        })
      };

      // Testar operação mock
      try {
        // Esta operação deveria funcionar com o mock
        const mockResult = await userService.findByCPF('12345678901');
        // Restaurar DB original
        userService.db = originalDb;
        
        console.log(`🎭 [TEST] Operações mock funcionando`);
      } catch (mockError) {
        // Restaurar DB original mesmo em caso de erro
        userService.db = originalDb;
        throw mockError;
      }
    } catch (error) {
      throw new Error(`Erro nas operações mock: ${error.message}`);
    }
  }

  /**
   * EXECUTAR TODOS OS TESTES
   */
  async runAllTests() {
    console.log('🚀 [TEST] Iniciando testes dos serviços unificados...\n');

    await this.runTest('Importação dos Serviços', () => this.testServicesImport());
    await this.runTest('Classe Base', () => this.testBaseService());
    await this.runTest('User Service', () => this.testUserService());
    await this.runTest('Tenant Service', () => this.testTenantService());
    await this.runTest('Client Service', () => this.testClientService());
    await this.runTest('Workflow Service', () => this.testWorkflowService());
    await this.runTest('Interfaces Públicas', () => this.testPublicInterfaces());
    await this.runTest('Sistema de Herança', () => this.testInheritance());
    await this.runTest('Configuração de Tabelas', () => this.testTableConfiguration());
    await this.runTest('Operações Mock', () => this.testMockOperations());

    console.log('\n📊 [TEST] Resultados dos testes:');
    console.log(`✅ Passou: ${this.passed}`);
    console.log(`❌ Falhou: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 [TEST] Todos os testes passaram! Serviços unificados funcionando perfeitamente.');
      return true;
    } else {
      console.log('\n⚠️ [TEST] Alguns testes falharam. Verifique os erros acima.');
      return false;
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const testSuite = new ServicesTestSuite();
  testSuite.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [TEST] Erro crítico nos testes:', error);
    process.exit(1);
  });
}

module.exports = ServicesTestSuite;
