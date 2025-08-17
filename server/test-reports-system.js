/**
 * TESTE COMPLETO DO SISTEMA DE RELATÓRIOS
 * Validar todas as funcionalidades críticas
 */

const ReportService = require('./services/ReportService');

class ReportsTester {
  constructor() {
    this.reportService = new ReportService();
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
   * Testar inicialização do serviço
   */
  async testServiceInitialization() {
    await this.test('Inicialização do Serviço', async () => {
      if (!this.reportService.isInitialized) {
        throw new Error('Serviço de relatórios não foi inicializado');
      }

      console.log(`   📝 Serviço inicializado com sucesso`);
    });
  }

  /**
   * Testar geração de relatório PDF
   */
  async testGeneratePDFReport() {
    await this.test('Geração de Relatório PDF', async () => {
      const reportOptions = {
        report: {
          name: 'Relatório de Teste',
          description: 'Relatório de teste do sistema TOIT NEXUS',
          type: 'sales'
        },
        runtimeParameters: {
          recordLimit: 50,
          dateRange: '30days'
        },
        outputFormat: 'pdf',
        quantumSpeedup: 2.5
      };

      const result = await this.reportService.generateReport(reportOptions);
      
      if (!result.success) {
        throw new Error(`Falha na geração: ${result.error}`);
      }

      if (!result.filePath) {
        throw new Error('Caminho do arquivo não foi retornado');
      }

      if (!result.fileSize || result.fileSize <= 0) {
        throw new Error('Tamanho do arquivo inválido');
      }

      if (result.quantumSpeedup !== 2.5) {
        throw new Error('Speedup quântico não foi aplicado corretamente');
      }

      console.log(`   📝 PDF gerado: ${result.filePath} (${result.fileSize} bytes)`);
    });
  }

  /**
   * Testar geração de relatório Excel
   */
  async testGenerateExcelReport() {
    await this.test('Geração de Relatório Excel', async () => {
      const reportOptions = {
        report: {
          name: 'Relatório Excel',
          description: 'Relatório em formato Excel',
          type: 'analytics'
        },
        runtimeParameters: {
          recordLimit: 100
        },
        outputFormat: 'excel',
        quantumSpeedup: 1.8
      };

      const result = await this.reportService.generateReport(reportOptions);
      
      if (!result.success) {
        throw new Error(`Falha na geração: ${result.error}`);
      }

      if (!result.filePath.includes('.xlsx')) {
        throw new Error('Arquivo Excel não foi gerado com extensão correta');
      }

      console.log(`   📝 Excel gerado: ${result.filePath}`);
    });
  }

  /**
   * Testar geração de relatório CSV
   */
  async testGenerateCSVReport() {
    await this.test('Geração de Relatório CSV', async () => {
      const reportOptions = {
        report: {
          name: 'Relatório CSV',
          description: 'Relatório em formato CSV',
          type: 'financial'
        },
        runtimeParameters: {
          recordLimit: 200
        },
        outputFormat: 'csv',
        quantumSpeedup: 3.0
      };

      const result = await this.reportService.generateReport(reportOptions);
      
      if (!result.success) {
        throw new Error(`Falha na geração: ${result.error}`);
      }

      if (!result.filePath.includes('.csv')) {
        throw new Error('Arquivo CSV não foi gerado com extensão correta');
      }

      console.log(`   📝 CSV gerado: ${result.filePath}`);
    });
  }

  /**
   * Testar geração de dados mock
   */
  async testMockDataGeneration() {
    await this.test('Geração de Dados Mock', async () => {
      const mockData = this.reportService.generateMockData('sales', {
        recordLimit: 10,
        dateRange: '7days'
      });
      
      if (!Array.isArray(mockData)) {
        throw new Error('Dados mock devem ser um array');
      }

      if (mockData.length !== 10) {
        throw new Error(`Esperado 10 registros, encontrado ${mockData.length}`);
      }

      const firstRecord = mockData[0];
      if (!firstRecord.id || !firstRecord.date || !firstRecord.value) {
        throw new Error('Registro mock não possui campos obrigatórios');
      }

      console.log(`   📝 ${mockData.length} registros mock gerados`);
    });
  }

  /**
   * Testar agendamento de relatório
   */
  async testReportScheduling() {
    await this.test('Agendamento de Relatório', async () => {
      const reportId = 'test-report-123';
      const schedule = {
        frequency: 'daily',
        time: '09:00',
        isActive: true
      };

      const result = await this.reportService.scheduleReport(reportId, schedule);
      
      if (!result.success) {
        throw new Error(`Falha no agendamento: ${result.error}`);
      }

      if (!result.nextRun) {
        throw new Error('Próxima execução não foi calculada');
      }

      console.log(`   📝 Relatório agendado para: ${result.nextRun}`);
    });
  }

  /**
   * Testar cancelamento de agendamento
   */
  async testCancelSchedule() {
    await this.test('Cancelamento de Agendamento', async () => {
      const reportId = 'test-report-123';
      
      const result = await this.reportService.cancelSchedule(reportId);
      
      if (!result.success) {
        throw new Error(`Falha no cancelamento: ${result.error}`);
      }

      console.log(`   📝 Agendamento cancelado para relatório ${reportId}`);
    });
  }

  /**
   * Testar validação de parâmetros
   */
  async testParameterValidation() {
    await this.test('Validação de Parâmetros', async () => {
      // Testar parâmetros válidos
      const validOptions = {
        report: {
          name: 'Relatório Válido',
          type: 'sales'
        },
        runtimeParameters: {},
        outputFormat: 'pdf'
      };

      const validResult = await this.reportService.generateReport(validOptions);
      if (!validResult.success) {
        throw new Error('Parâmetros válidos foram rejeitados');
      }

      // Testar formato inválido
      const invalidOptions = {
        report: {
          name: 'Relatório Inválido',
          type: 'sales'
        },
        runtimeParameters: {},
        outputFormat: 'invalid_format'
      };

      const invalidResult = await this.reportService.generateReport(invalidOptions);
      if (invalidResult.success) {
        throw new Error('Formato inválido deveria ser rejeitado');
      }

      console.log(`   📝 Validação funcionando corretamente`);
    });
  }

  /**
   * Testar performance com speedup quântico
   */
  async testQuantumSpeedup() {
    await this.test('Performance Quântica', async () => {
      const startTime = Date.now();
      
      const reportOptions = {
        report: {
          name: 'Teste Performance',
          type: 'analytics'
        },
        runtimeParameters: {},
        outputFormat: 'pdf',
        quantumSpeedup: 4.0
      };

      const result = await this.reportService.generateReport(reportOptions);
      
      const endTime = Date.now();
      const actualTime = endTime - startTime;
      
      if (!result.success) {
        throw new Error(`Falha na geração: ${result.error}`);
      }

      // Verificar se o speedup foi aplicado (tempo deve ser menor que o base)
      const expectedMaxTime = 2000 / 4.0; // 500ms com speedup 4x
      if (actualTime > expectedMaxTime + 100) { // +100ms de tolerância
        throw new Error(`Speedup não foi aplicado corretamente: ${actualTime}ms > ${expectedMaxTime}ms`);
      }

      console.log(`   📝 Speedup 4x aplicado: ${actualTime}ms (esperado ~${expectedMaxTime}ms)`);
    });
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE RELATÓRIOS\n');

    await this.testServiceInitialization();
    await this.testGeneratePDFReport();
    await this.testGenerateExcelReport();
    await this.testGenerateCSVReport();
    await this.testMockDataGeneration();
    await this.testReportScheduling();
    await this.testCancelSchedule();
    await this.testParameterValidation();
    await this.testQuantumSpeedup();

    console.log('\n📊 RELATÓRIO DE TESTES:');
    console.log(`✅ Testes passaram: ${this.passed}`);
    console.log(`❌ Testes falharam: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM - SISTEMA DE RELATÓRIOS FUNCIONANDO!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new ReportsTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ReportsTester;
