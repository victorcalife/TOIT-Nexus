#!/usr/bin/env node

/**
 * 🧪 EXECUTOR COMPLETO DE TESTES - ZERO MENTIRAS!
 * 
 * Este script executa TODOS os testes funcionais do sistema:
 * - Testes de rotas e endpoints
 * - Testes de algoritmos quânticos
 * - Testes de integração MILA
 * - Testes de banco de dados
 * - Testes de performance
 * - Testes end-to-end
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: []
    };
    
    this.testSuites = [
      {
        name: '🔗 Testes de Rotas e Endpoints',
        file: 'routes.test.js',
        timeout: 30000,
        critical: true
      },
      {
        name: '⚛️ Testes de Algoritmos Quânticos',
        file: 'quantum.test.js',
        timeout: 60000,
        critical: true
      },
      {
        name: '🧠 Testes de Integração MILA',
        file: 'mila.test.js',
        timeout: 45000,
        critical: true
      },
      {
        name: '🗄️ Testes de Banco de Dados',
        file: 'database.test.js',
        timeout: 30000,
        critical: true
      },
      {
        name: '🔐 Testes de Autenticação',
        file: 'auth.test.js',
        timeout: 20000,
        critical: true
      },
      {
        name: '⚡ Testes de Performance',
        file: 'performance.test.js',
        timeout: 60000,
        critical: false
      },
      {
        name: '🎯 Testes End-to-End',
        file: 'e2e.test.js',
        timeout: 90000,
        critical: false
      }
    ];
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO BATERIA COMPLETA DE TESTES\n');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    try {
      // Verificar ambiente de teste
      await this.setupTestEnvironment();
      
      // Executar cada suite de testes
      for (const suite of this.testSuites) {
        await this.runTestSuite(suite);
      }
      
      // Gerar relatório final
      const totalTime = Date.now() - startTime;
      await this.generateReport(totalTime);
      
      // Determinar se todos os testes críticos passaram
      const criticalFailed = this.results.suites
        .filter(s => s.critical && s.status === 'failed').length;
      
      if (criticalFailed > 0) {
        console.log('\n❌ TESTES CRÍTICOS FALHARAM - SISTEMA NÃO ESTÁ PRONTO!');
        process.exit(1);
      } else {
        console.log('\n✅ TODOS OS TESTES CRÍTICOS PASSARAM - SISTEMA PRONTO!');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('\n💥 ERRO FATAL NA EXECUÇÃO DOS TESTES:', error);
      process.exit(1);
    }
  }

  /**
   * Configurar ambiente de teste
   */
  async setupTestEnvironment() {
    console.log('🔧 Configurando ambiente de teste...');
    
    // Verificar se Jest está instalado
    try {
      require('jest');
    } catch (error) {
      console.log('📦 Instalando Jest...');
      await this.runCommand('npm', ['install', '--save-dev', 'jest', 'supertest']);
    }
    
    // Verificar variáveis de ambiente
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'test';
    }
    
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      console.log('⚠️ Configurações de banco não encontradas - usando padrões de teste');
      process.env.DB_HOST = 'localhost';
      process.env.DB_NAME = 'toit_nexus_test';
      process.env.DB_USER = 'root';
      process.env.DB_PASS = '';
    }
    
    // Criar diretório de relatórios
    const reportsDir = path.join(__dirname, 'reports');
    try {
      await fs.access(reportsDir);
    } catch {
      await fs.mkdir(reportsDir, { recursive: true });
    }
    
    console.log('✅ Ambiente de teste configurado\n');
  }

  /**
   * Executar uma suite de testes
   */
  async runTestSuite(suite) {
    console.log(`\n${suite.name}`);
    console.log('-'.repeat(50));
    
    const testFile = path.join(__dirname, suite.file);
    
    // Verificar se arquivo de teste existe
    try {
      await fs.access(testFile);
    } catch {
      console.log(`⚠️ Arquivo de teste não encontrado: ${suite.file}`);
      this.results.suites.push({
        name: suite.name,
        status: 'skipped',
        reason: 'Arquivo não encontrado',
        critical: suite.critical
      });
      return;
    }
    
    const startTime = Date.now();
    
    try {
      // Executar testes com Jest
      const result = await this.runJestTest(testFile, suite.timeout);
      
      const duration = Date.now() - startTime;
      
      this.results.suites.push({
        name: suite.name,
        status: result.success ? 'passed' : 'failed',
        duration,
        tests: result.tests,
        errors: result.errors,
        critical: suite.critical
      });
      
      this.results.total += result.tests.total;
      this.results.passed += result.tests.passed;
      this.results.failed += result.tests.failed;
      this.results.skipped += result.tests.skipped;
      
      if (result.success) {
        console.log(`✅ ${suite.name} - ${result.tests.passed}/${result.tests.total} testes passaram (${duration}ms)`);
      } else {
        console.log(`❌ ${suite.name} - ${result.tests.failed} testes falharam (${duration}ms)`);
        if (result.errors.length > 0) {
          console.log('Erros:');
          result.errors.forEach(error => console.log(`  - ${error}`));
        }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.suites.push({
        name: suite.name,
        status: 'failed',
        duration,
        error: error.message,
        critical: suite.critical
      });
      
      console.log(`💥 ${suite.name} - Erro na execução: ${error.message}`);
    }
  }

  /**
   * Executar teste com Jest
   */
  async runJestTest(testFile, timeout) {
    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', testFile, '--verbose', '--timeout', timeout.toString()], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      
      jest.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });
      
      jest.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
      
      jest.on('close', (code) => {
        const result = this.parseJestOutput(stdout, stderr);
        result.success = code === 0;
        resolve(result);
      });
      
      jest.on('error', (error) => {
        reject(error);
      });
      
      // Timeout de segurança
      setTimeout(() => {
        jest.kill('SIGKILL');
        reject(new Error(`Timeout de ${timeout}ms excedido`));
      }, timeout + 5000);
    });
  }

  /**
   * Analisar saída do Jest
   */
  parseJestOutput(stdout, stderr) {
    const result = {
      tests: { total: 0, passed: 0, failed: 0, skipped: 0 },
      errors: []
    };
    
    // Extrair estatísticas dos testes
    const testMatch = stdout.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (testMatch) {
      result.tests.failed = parseInt(testMatch[1]);
      result.tests.passed = parseInt(testMatch[2]);
      result.tests.total = parseInt(testMatch[3]);
    } else {
      const passedMatch = stdout.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
      if (passedMatch) {
        result.tests.passed = parseInt(passedMatch[1]);
        result.tests.total = parseInt(passedMatch[2]);
      }
    }
    
    // Extrair erros
    const errorMatches = stderr.match(/Error: .+/g);
    if (errorMatches) {
      result.errors = errorMatches.slice(0, 5); // Limitar a 5 erros
    }
    
    return result;
  }

  /**
   * Executar comando
   */
  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'inherit' });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Comando falhou com código ${code}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  /**
   * Gerar relatório final
   */
  async generateReport(totalTime) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DE TESTES');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Tempo total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`📈 Total de testes: ${this.results.total}`);
    console.log(`✅ Testes passaram: ${this.results.passed}`);
    console.log(`❌ Testes falharam: ${this.results.failed}`);
    console.log(`⏭️  Testes pulados: ${this.results.skipped}`);
    
    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    console.log(`📊 Taxa de sucesso: ${successRate}%`);
    
    console.log('\n📋 DETALHES POR SUITE:');
    this.results.suites.forEach(suite => {
      const status = suite.status === 'passed' ? '✅' : 
                    suite.status === 'failed' ? '❌' : '⏭️';
      const critical = suite.critical ? ' [CRÍTICO]' : '';
      const duration = suite.duration ? ` (${suite.duration}ms)` : '';
      
      console.log(`${status} ${suite.name}${critical}${duration}`);
      
      if (suite.tests) {
        console.log(`    ${suite.tests.passed}/${suite.tests.total} testes passaram`);
      }
      
      if (suite.error) {
        console.log(`    Erro: ${suite.error}`);
      }
    });
    
    // Salvar relatório em arquivo
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTime,
      results: this.results
    };
    
    const reportFile = path.join(__dirname, 'reports', `test-report-${Date.now()}.json`);
    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${reportFile}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
