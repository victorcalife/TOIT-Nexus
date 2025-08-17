#!/usr/bin/env node

/**
 * 🔑 TESTE CRÍTICO - LOGIN DO VICTOR (ADMIN FULL)
 * 
 * Este script testa e garante o funcionamento completo do login
 * do usuário Victor (ADMIN FULL) em todos os tenants e sistemas:
 * 
 * CPF: 33656299803
 * SENHA: 241286
 * 
 * CRÍTICO: Com esse usuário todos os testes serão realizados!
 */

const request = require('supertest');
const DatabaseService = require('../services/DatabaseService');
const bcrypt = require('bcryptjs');

class VictorAdminTester {
  constructor() {
    this.db = new DatabaseService();
    this.victorCredentials = {
      cpf: '33656299803',
      email: 'victor@toit.com.br',
      password: '241286',
      name: 'Victor Calife',
      role: 'super_admin'
    };
    
    this.testResults = {
      userCreation: false,
      clientSystemLogin: false,
      toitTeamLogin: false,
      allTenantsAccess: false,
      permissionsValidation: false,
      apiAccess: false,
      quantumAccess: false,
      milaAccess: false
    };
  }

  /**
   * Executar todos os testes do Victor
   */
  async runAllTests() {
    console.log('🔑 INICIANDO TESTES CRÍTICOS - LOGIN DO VICTOR');
    console.log('=' .repeat(60));
    console.log(`👤 Usuário: ${this.victorCredentials.name}`);
    console.log(`📧 Email: ${this.victorCredentials.email}`);
    console.log(`🆔 CPF: ${this.victorCredentials.cpf}`);
    console.log(`🔐 Role: ${this.victorCredentials.role}`);
    console.log('=' .repeat(60));

    try {
      // 1. Garantir que usuário Victor existe
      await this.ensureVictorUserExists();
      
      // 2. Testar login no sistema de clientes
      await this.testClientSystemLogin();
      
      // 3. Testar login no sistema da equipe TOIT
      await this.testToitTeamLogin();
      
      // 4. Testar acesso a todos os tenants
      await this.testAllTenantsAccess();
      
      // 5. Validar permissões completas
      await this.validateFullPermissions();
      
      // 6. Testar acesso às APIs
      await this.testApiAccess();
      
      // 7. Testar acesso ao sistema quântico
      await this.testQuantumAccess();
      
      // 8. Testar acesso à MILA
      await this.testMilaAccess();
      
      // Gerar relatório final
      await this.generateTestReport();
      
      const allTestsPassed = Object.values(this.testResults).every(result => result === true);
      
      if (allTestsPassed) {
        console.log('\n✅ TODOS OS TESTES DO VICTOR PASSARAM!');
        console.log('🎉 Sistema pronto para validação completa!');
        return true;
      } else {
        console.log('\n❌ ALGUNS TESTES FALHARAM!');
        console.log('⚠️ Sistema NÃO está pronto para produção!');
        return false;
      }
      
    } catch (error) {
      console.error('\n💥 ERRO CRÍTICO nos testes do Victor:', error);
      throw error;
    }
  }

  /**
   * Garantir que usuário Victor existe no sistema
   */
  async ensureVictorUserExists() {
    console.log('\n👤 Verificando/criando usuário Victor...');
    
    try {
      // Verificar se usuário já existe
      const existingUsers = await this.db.query(`
        SELECT * FROM users 
        WHERE email = ? OR cpf = ?
      `, [this.victorCredentials.email, this.victorCredentials.cpf]);

      if (existingUsers.length > 0) {
        console.log('✅ Usuário Victor já existe');
        
        // Atualizar senha se necessário
        const hashedPassword = await bcrypt.hash(this.victorCredentials.password, 12);
        await this.db.query(`
          UPDATE users 
          SET password = ?, role = 'super_admin', is_active = 1, updated_at = NOW()
          WHERE email = ? OR cpf = ?
        `, [hashedPassword, this.victorCredentials.email, this.victorCredentials.cpf]);
        
        console.log('🔄 Credenciais do Victor atualizadas');
      } else {
        // Criar usuário Victor
        const hashedPassword = await bcrypt.hash(this.victorCredentials.password, 12);
        
        const result = await this.db.query(`
          INSERT INTO users (
            name, email, cpf, password, role, is_active, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'super_admin', 1, NOW(), NOW())
        `, [
          this.victorCredentials.name,
          this.victorCredentials.email,
          this.victorCredentials.cpf,
          hashedPassword
        ]);
        
        console.log(`✅ Usuário Victor criado com ID: ${result.insertId}`);
      }
      
      // Garantir permissões de super_admin
      await this.grantSuperAdminPermissions();
      
      this.testResults.userCreation = true;
      console.log('✅ Usuário Victor configurado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao configurar usuário Victor:', error);
      throw error;
    }
  }

  /**
   * Garantir permissões de super_admin
   */
  async grantSuperAdminPermissions() {
    const superAdminPermissions = [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'tenants.view', 'tenants.create', 'tenants.edit', 'tenants.delete',
      'reports.view', 'reports.create', 'reports.edit', 'reports.delete', 'reports.execute',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.delete', 'workflows.execute',
      'quantum.access', 'quantum.execute', 'quantum.admin',
      'mila.access', 'mila.admin',
      'system.admin', 'system.logs', 'system.config'
    ];

    // Remover permissões existentes
    await this.db.query(`
      DELETE FROM user_permissions 
      WHERE user_id = (SELECT id FROM users WHERE email = ?)
    `, [this.victorCredentials.email]);

    // Adicionar todas as permissões
    for (const permission of superAdminPermissions) {
      await this.db.query(`
        INSERT INTO user_permissions (user_id, permission, created_at)
        SELECT id, ?, NOW() FROM users WHERE email = ?
      `, [permission, this.victorCredentials.email]);
    }

    console.log(`🔐 ${superAdminPermissions.length} permissões concedidas ao Victor`);
  }

  /**
   * Testar login no sistema de clientes (nexus.toit.com.br)
   */
  async testClientSystemLogin() {
    console.log('\n🌐 Testando login no sistema de clientes...');
    
    try {
      const app = require('../index'); // Assumindo que o app está exportado
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: this.victorCredentials.email,
          password: this.victorCredentials.password
        });

      if (response.status === 200 && response.body.success) {
        console.log('✅ Login no sistema de clientes: SUCESSO');
        console.log(`🎫 Token recebido: ${response.body.data.token.substring(0, 20)}...`);
        
        this.clientToken = response.body.data.token;
        this.testResults.clientSystemLogin = true;
      } else {
        console.log('❌ Login no sistema de clientes: FALHOU');
        console.log(`Status: ${response.status}`);
        console.log(`Resposta: ${JSON.stringify(response.body)}`);
      }
      
    } catch (error) {
      console.error('❌ Erro no login do sistema de clientes:', error);
    }
  }

  /**
   * Testar login no sistema da equipe TOIT (supnexus.toit.com.br)
   */
  async testToitTeamLogin() {
    console.log('\n🏢 Testando login no sistema da equipe TOIT...');
    
    try {
      const app = require('../index');
      
      // Testar rota específica da equipe TOIT
      const response = await request(app)
        .post('/api/auth/team-login')
        .send({
          email: this.victorCredentials.email,
          password: this.victorCredentials.password
        });

      if (response.status === 200 && response.body.success) {
        console.log('✅ Login no sistema da equipe TOIT: SUCESSO');
        
        this.teamToken = response.body.data.token;
        this.testResults.toitTeamLogin = true;
      } else {
        // Tentar rota padrão se rota específica não existir
        const fallbackResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: this.victorCredentials.email,
            password: this.victorCredentials.password
          });

        if (fallbackResponse.status === 200 && fallbackResponse.body.success) {
          console.log('✅ Login no sistema da equipe TOIT (fallback): SUCESSO');
          this.teamToken = fallbackResponse.body.data.token;
          this.testResults.toitTeamLogin = true;
        } else {
          console.log('❌ Login no sistema da equipe TOIT: FALHOU');
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no login do sistema da equipe TOIT:', error);
    }
  }

  /**
   * Testar acesso a todos os tenants
   */
  async testAllTenantsAccess() {
    console.log('\n🏢 Testando acesso a todos os tenants...');
    
    try {
      // Buscar todos os tenants
      const tenants = await this.db.query(`
        SELECT id, name, domain FROM tenants WHERE is_active = 1
      `);

      console.log(`📋 Encontrados ${tenants.length} tenants ativos`);

      let accessCount = 0;
      const app = require('../index');

      for (const tenant of tenants) {
        try {
          // Testar acesso aos dados do tenant
          const response = await request(app)
            .get(`/api/tenants/${tenant.id}`)
            .set('Authorization', `Bearer ${this.clientToken}`);

          if (response.status === 200) {
            console.log(`✅ Acesso ao tenant "${tenant.name}": SUCESSO`);
            accessCount++;
          } else {
            console.log(`⚠️ Acesso ao tenant "${tenant.name}": Limitado (${response.status})`);
          }
        } catch (error) {
          console.log(`❌ Erro no acesso ao tenant "${tenant.name}": ${error.message}`);
        }
      }

      if (accessCount === tenants.length) {
        console.log(`✅ Acesso completo a todos os ${tenants.length} tenants`);
        this.testResults.allTenantsAccess = true;
      } else {
        console.log(`⚠️ Acesso a ${accessCount}/${tenants.length} tenants`);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de acesso aos tenants:', error);
    }
  }

  /**
   * Validar permissões completas
   */
  async validateFullPermissions() {
    console.log('\n🔐 Validando permissões completas...');
    
    try {
      const app = require('../index');
      
      const criticalEndpoints = [
        { method: 'GET', path: '/api/users', description: 'Listar usuários' },
        { method: 'GET', path: '/api/tenants', description: 'Listar tenants' },
        { method: 'GET', path: '/api/reports', description: 'Listar relatórios' },
        { method: 'GET', path: '/api/workflows', description: 'Listar workflows' },
        { method: 'GET', path: '/api/permissions', description: 'Listar permissões' }
      ];

      let permissionCount = 0;

      for (const endpoint of criticalEndpoints) {
        try {
          const response = await request(app)
            [endpoint.method.toLowerCase()](endpoint.path)
            .set('Authorization', `Bearer ${this.clientToken}`);

          if (response.status === 200) {
            console.log(`✅ ${endpoint.description}: AUTORIZADO`);
            permissionCount++;
          } else {
            console.log(`❌ ${endpoint.description}: NEGADO (${response.status})`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint.description}: ERRO (${error.message})`);
        }
      }

      if (permissionCount === criticalEndpoints.length) {
        console.log(`✅ Todas as ${criticalEndpoints.length} permissões validadas`);
        this.testResults.permissionsValidation = true;
      } else {
        console.log(`⚠️ ${permissionCount}/${criticalEndpoints.length} permissões validadas`);
      }
      
    } catch (error) {
      console.error('❌ Erro na validação de permissões:', error);
    }
  }

  /**
   * Testar acesso às APIs
   */
  async testApiAccess() {
    console.log('\n🔌 Testando acesso às APIs...');
    
    try {
      const app = require('../index');
      
      const apiEndpoints = [
        '/api/auth/me',
        '/api/users',
        '/api/reports',
        '/api/workflows',
        '/api/chat/sessions'
      ];

      let apiCount = 0;

      for (const endpoint of apiEndpoints) {
        try {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${this.clientToken}`);

          if (response.status < 400) {
            console.log(`✅ API ${endpoint}: FUNCIONANDO`);
            apiCount++;
          } else {
            console.log(`❌ API ${endpoint}: ERRO (${response.status})`);
          }
        } catch (error) {
          console.log(`❌ API ${endpoint}: FALHA (${error.message})`);
        }
      }

      if (apiCount === apiEndpoints.length) {
        console.log(`✅ Todas as ${apiEndpoints.length} APIs funcionando`);
        this.testResults.apiAccess = true;
      } else {
        console.log(`⚠️ ${apiCount}/${apiEndpoints.length} APIs funcionando`);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de APIs:', error);
    }
  }

  /**
   * Testar acesso ao sistema quântico
   */
  async testQuantumAccess() {
    console.log('\n⚛️ Testando acesso ao sistema quântico...');
    
    try {
      const app = require('../index');
      
      // Testar endpoint quântico
      const response = await request(app)
        .post('/api/quantum/process')
        .set('Authorization', `Bearer ${this.clientToken}`)
        .send({
          type: 'test_operation',
          data: { test: true },
          complexity: 1
        });

      if (response.status === 200 && response.body.success) {
        console.log('✅ Acesso ao sistema quântico: FUNCIONANDO');
        console.log(`⚡ Speedup quântico: ${response.body.data.quantumSpeedup || 'N/A'}`);
        this.testResults.quantumAccess = true;
      } else {
        console.log('❌ Acesso ao sistema quântico: FALHOU');
        console.log(`Status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste quântico:', error);
    }
  }

  /**
   * Testar acesso à MILA
   */
  async testMilaAccess() {
    console.log('\n🧠 Testando acesso à MILA...');
    
    try {
      const app = require('../index');
      
      // Testar chat com MILA
      const response = await request(app)
        .post('/api/mila/chat')
        .set('Authorization', `Bearer ${this.clientToken}`)
        .send({
          message: 'Olá MILA, este é um teste do usuário Victor',
          sessionId: 'victor-test-session'
        });

      if (response.status === 200 && response.body.success) {
        console.log('✅ Acesso à MILA: FUNCIONANDO');
        console.log(`🤖 Resposta da MILA: ${response.body.data.response?.substring(0, 50) || 'N/A'}...`);
        this.testResults.milaAccess = true;
      } else {
        console.log('❌ Acesso à MILA: FALHOU');
        console.log(`Status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste da MILA:', error);
    }
  }

  /**
   * Gerar relatório final dos testes
   */
  async generateTestReport() {
    console.log('\n📊 RELATÓRIO FINAL DOS TESTES DO VICTOR');
    console.log('=' .repeat(60));
    
    const tests = [
      { name: 'Criação/Configuração do Usuário', result: this.testResults.userCreation },
      { name: 'Login no Sistema de Clientes', result: this.testResults.clientSystemLogin },
      { name: 'Login no Sistema da Equipe TOIT', result: this.testResults.toitTeamLogin },
      { name: 'Acesso a Todos os Tenants', result: this.testResults.allTenantsAccess },
      { name: 'Validação de Permissões', result: this.testResults.permissionsValidation },
      { name: 'Acesso às APIs', result: this.testResults.apiAccess },
      { name: 'Acesso ao Sistema Quântico', result: this.testResults.quantumAccess },
      { name: 'Acesso à MILA', result: this.testResults.milaAccess }
    ];

    tests.forEach(test => {
      const status = test.result ? '✅ PASSOU' : '❌ FALHOU';
      console.log(`${status} - ${test.name}`);
    });

    const passedTests = tests.filter(t => t.result).length;
    const totalTests = tests.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('\n📈 ESTATÍSTICAS:');
    console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
    console.log(`📊 Taxa de sucesso: ${successRate}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 VICTOR TEM ACESSO COMPLETO AO SISTEMA!');
      console.log('✅ Todos os testes podem ser executados com segurança');
    } else {
      console.log('\n⚠️ ALGUNS ACESSOS DO VICTOR ESTÃO LIMITADOS!');
      console.log('❌ Sistema precisa de ajustes antes dos testes finais');
    }

    // Salvar relatório em arquivo
    const reportData = {
      timestamp: new Date().toISOString(),
      user: this.victorCredentials,
      results: this.testResults,
      summary: {
        passed: passedTests,
        total: totalTests,
        successRate: parseFloat(successRate)
      }
    };

    const fs = require('fs').promises;
    const reportFile = `victor-test-report-${Date.now()}.json`;
    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2));
    
    console.log(`\n💾 Relatório salvo: ${reportFile}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new VictorAdminTester();
  tester.runAllTests()
    .then(success => {
      if (success) {
        console.log('\n🚀 SISTEMA PRONTO PARA TESTES FINAIS!');
        process.exit(0);
      } else {
        console.log('\n🔧 SISTEMA PRECISA DE AJUSTES!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 ERRO CRÍTICO:', error);
      process.exit(1);
    });
}

module.exports = VictorAdminTester;
