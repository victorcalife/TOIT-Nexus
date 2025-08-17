#!/usr/bin/env node

/**
 * 🔑 CONFIGURAÇÃO DO USUÁRIO VICTOR - ADMIN FULL
 * 
 * Este script garante que o usuário Victor esteja configurado
 * corretamente no sistema com todas as permissões necessárias.
 * 
 * CPF: 33656299803
 * SENHA: 241286
 * ROLE: super_admin
 */

const DatabaseService = require('../server/services/DatabaseService');
const bcrypt = require('bcryptjs');

class VictorAdminSetup {
  constructor() {
    this.db = new DatabaseService();
    this.victorData = {
      name: 'Victor Calife',
      email: 'victor@toit.com.br',
      cpf: '33656299803',
      password: '241286',
      role: 'super_admin',
      phone: '+55 11 99999-9999',
      department: 'Desenvolvimento',
      position: 'CTO'
    };
  }

  /**
   * Configurar usuário Victor completo
   */
  async setupVictorAdmin() {
    console.log('🔑 CONFIGURANDO USUÁRIO VICTOR - ADMIN FULL');
    console.log('=' .repeat(50));
    
    try {
      // 1. Conectar ao banco
      await this.connectDatabase();
      
      // 2. Criar/atualizar usuário Victor
      await this.createOrUpdateVictor();
      
      // 3. Configurar permissões completas
      await this.setupFullPermissions();
      
      // 4. Configurar acesso a todos os tenants
      await this.setupTenantAccess();
      
      // 5. Configurar dados de perfil
      await this.setupProfileData();
      
      // 6. Validar configuração
      await this.validateSetup();
      
      console.log('\n✅ USUÁRIO VICTOR CONFIGURADO COM SUCESSO!');
      console.log('🎉 Sistema pronto para testes com admin full!');
      
      return true;
      
    } catch (error) {
      console.error('\n❌ ERRO na configuração do Victor:', error);
      throw error;
    }
  }

  /**
   * Conectar ao banco de dados
   */
  async connectDatabase() {
    console.log('🔌 Conectando ao banco de dados...');
    
    try {
      const result = await this.db.query('SELECT 1 as test');
      if (result && result.length > 0) {
        console.log('✅ Conexão com banco estabelecida');
      } else {
        throw new Error('Falha na conexão com banco');
      }
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      throw error;
    }
  }

  /**
   * Criar ou atualizar usuário Victor
   */
  async createOrUpdateVictor() {
    console.log('\n👤 Configurando usuário Victor...');
    
    try {
      // Verificar se usuário já existe
      const existingUsers = await this.db.query(`
        SELECT id, email, cpf, role FROM users 
        WHERE email = ? OR cpf = ?
      `, [this.victorData.email, this.victorData.cpf]);

      const hashedPassword = await bcrypt.hash(this.victorData.password, 12);

      if (existingUsers.length > 0) {
        const userId = existingUsers[0].id;
        
        // Atualizar usuário existente
        await this.db.query(`
          UPDATE users SET 
            name = ?,
            email = ?,
            cpf = ?,
            password = ?,
            role = 'super_admin',
            is_active = 1,
            phone = ?,
            department = ?,
            position = ?,
            updated_at = NOW()
          WHERE id = ?
        `, [
          this.victorData.name,
          this.victorData.email,
          this.victorData.cpf,
          hashedPassword,
          this.victorData.phone,
          this.victorData.department,
          this.victorData.position,
          userId
        ]);
        
        console.log(`✅ Usuário Victor atualizado (ID: ${userId})`);
        this.victorUserId = userId;
        
      } else {
        // Criar novo usuário
        const result = await this.db.query(`
          INSERT INTO users (
            name, email, cpf, password, role, is_active,
            phone, department, position, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'super_admin', 1, ?, ?, ?, NOW(), NOW())
        `, [
          this.victorData.name,
          this.victorData.email,
          this.victorData.cpf,
          hashedPassword,
          this.victorData.phone,
          this.victorData.department,
          this.victorData.position
        ]);
        
        this.victorUserId = result.insertId;
        console.log(`✅ Usuário Victor criado (ID: ${this.victorUserId})`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao configurar usuário:', error);
      throw error;
    }
  }

  /**
   * Configurar permissões completas
   */
  async setupFullPermissions() {
    console.log('\n🔐 Configurando permissões completas...');
    
    try {
      // Remover permissões existentes
      await this.db.query(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [this.victorUserId]);

      // Lista completa de permissões de super_admin
      const allPermissions = [
        // Usuários
        'users.view', 'users.create', 'users.edit', 'users.delete',
        'users.permissions', 'users.roles', 'users.impersonate',
        
        // Tenants
        'tenants.view', 'tenants.create', 'tenants.edit', 'tenants.delete',
        'tenants.config', 'tenants.billing', 'tenants.analytics',
        
        // Relatórios
        'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
        'reports.execute', 'reports.export', 'reports.schedule',
        
        // Workflows
        'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.delete',
        'workflows.execute', 'workflows.debug', 'workflows.monitor',
        
        // Chat e MILA
        'chat.view', 'chat.create', 'chat.delete', 'chat.moderate',
        'mila.access', 'mila.admin', 'mila.config', 'mila.analytics',
        
        // Sistema Quântico
        'quantum.access', 'quantum.execute', 'quantum.admin',
        'quantum.algorithms', 'quantum.metrics', 'quantum.config',
        
        // Sistema
        'system.admin', 'system.logs', 'system.config', 'system.backup',
        'system.monitoring', 'system.maintenance', 'system.security',
        
        // APIs
        'api.access', 'api.admin', 'api.keys', 'api.monitoring',
        
        // Financeiro
        'billing.view', 'billing.edit', 'billing.reports',
        
        // Suporte
        'support.access', 'support.admin', 'support.tickets'
      ];

      // Inserir todas as permissões
      for (const permission of allPermissions) {
        await this.db.query(`
          INSERT INTO user_permissions (user_id, permission, granted_by, created_at)
          VALUES (?, ?, ?, NOW())
        `, [this.victorUserId, permission, this.victorUserId]);
      }

      console.log(`✅ ${allPermissions.length} permissões concedidas ao Victor`);
      
    } catch (error) {
      console.error('❌ Erro ao configurar permissões:', error);
      throw error;
    }
  }

  /**
   * Configurar acesso a todos os tenants
   */
  async setupTenantAccess() {
    console.log('\n🏢 Configurando acesso a todos os tenants...');
    
    try {
      // Buscar todos os tenants
      const tenants = await this.db.query(`
        SELECT id, name FROM tenants WHERE is_active = 1
      `);

      console.log(`📋 Encontrados ${tenants.length} tenants ativos`);

      // Remover acessos existentes
      await this.db.query(`
        DELETE FROM user_tenant_access WHERE user_id = ?
      `, [this.victorUserId]);

      // Conceder acesso a todos os tenants
      for (const tenant of tenants) {
        await this.db.query(`
          INSERT INTO user_tenant_access (user_id, tenant_id, role, created_at)
          VALUES (?, ?, 'super_admin', NOW())
        `, [this.victorUserId, tenant.id]);
      }

      console.log(`✅ Acesso concedido a todos os ${tenants.length} tenants`);
      
    } catch (error) {
      // Se tabela não existir, criar
      if (error.message.includes('user_tenant_access')) {
        console.log('📋 Criando tabela user_tenant_access...');
        
        await this.db.query(`
          CREATE TABLE IF NOT EXISTS user_tenant_access (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            tenant_id INT NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_tenant (user_id, tenant_id)
          )
        `);
        
        console.log('✅ Tabela user_tenant_access criada');
        
        // Tentar novamente
        await this.setupTenantAccess();
      } else {
        console.error('❌ Erro ao configurar acesso aos tenants:', error);
      }
    }
  }

  /**
   * Configurar dados de perfil
   */
  async setupProfileData() {
    console.log('\n📋 Configurando dados de perfil...');
    
    try {
      // Verificar se tabela user_profiles existe
      const profileData = {
        bio: 'CTO da TOIT - Especialista em Computação Quântica e IA',
        avatar_url: '/images/avatars/victor.jpg',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        theme: 'dark',
        notifications: JSON.stringify({
          email: true,
          push: true,
          sms: false,
          quantum_alerts: true,
          mila_updates: true
        }),
        preferences: JSON.stringify({
          dashboard_layout: 'advanced',
          quantum_mode: 'expert',
          mila_personality: 'professional',
          auto_save: true,
          debug_mode: true
        })
      };

      // Tentar inserir/atualizar perfil
      try {
        await this.db.query(`
          INSERT INTO user_profiles (user_id, bio, avatar_url, timezone, language, theme, notifications, preferences, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          bio = VALUES(bio),
          avatar_url = VALUES(avatar_url),
          timezone = VALUES(timezone),
          language = VALUES(language),
          theme = VALUES(theme),
          notifications = VALUES(notifications),
          preferences = VALUES(preferences),
          updated_at = NOW()
        `, [
          this.victorUserId,
          profileData.bio,
          profileData.avatar_url,
          profileData.timezone,
          profileData.language,
          profileData.theme,
          profileData.notifications,
          profileData.preferences
        ]);
        
        console.log('✅ Perfil do Victor configurado');
        
      } catch (error) {
        if (error.message.includes('user_profiles')) {
          console.log('📋 Tabela user_profiles não existe - criando...');
          
          await this.db.query(`
            CREATE TABLE IF NOT EXISTS user_profiles (
              id INT PRIMARY KEY AUTO_INCREMENT,
              user_id INT NOT NULL UNIQUE,
              bio TEXT,
              avatar_url VARCHAR(255),
              timezone VARCHAR(50) DEFAULT 'UTC',
              language VARCHAR(10) DEFAULT 'en',
              theme VARCHAR(20) DEFAULT 'light',
              notifications JSON,
              preferences JSON,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `);
          
          console.log('✅ Tabela user_profiles criada');
          
          // Tentar novamente
          await this.setupProfileData();
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao configurar perfil:', error);
    }
  }

  /**
   * Validar configuração completa
   */
  async validateSetup() {
    console.log('\n🔍 Validando configuração...');
    
    try {
      // Verificar usuário
      const user = await this.db.query(`
        SELECT id, name, email, cpf, role, is_active FROM users 
        WHERE id = ?
      `, [this.victorUserId]);

      if (user.length === 0) {
        throw new Error('Usuário Victor não encontrado');
      }

      console.log('✅ Usuário Victor encontrado');
      console.log(`   Nome: ${user[0].name}`);
      console.log(`   Email: ${user[0].email}`);
      console.log(`   CPF: ${user[0].cpf}`);
      console.log(`   Role: ${user[0].role}`);
      console.log(`   Ativo: ${user[0].is_active ? 'Sim' : 'Não'}`);

      // Verificar permissões
      const permissions = await this.db.query(`
        SELECT COUNT(*) as count FROM user_permissions 
        WHERE user_id = ?
      `, [this.victorUserId]);

      console.log(`✅ ${permissions[0].count} permissões configuradas`);

      // Verificar acesso aos tenants
      const tenantAccess = await this.db.query(`
        SELECT COUNT(*) as count FROM user_tenant_access 
        WHERE user_id = ?
      `).catch(() => [{ count: 0 }]);

      console.log(`✅ Acesso a ${tenantAccess[0].count} tenants configurado`);

      // Testar login
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(
        this.victorData.password, 
        user[0].password || ''
      );

      if (isPasswordValid) {
        console.log('✅ Senha validada com sucesso');
      } else {
        console.log('⚠️ Senha pode precisar ser reconfigurada');
      }

      console.log('\n🎉 CONFIGURAÇÃO DO VICTOR VALIDADA!');
      
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      throw error;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new VictorAdminSetup();
  setup.setupVictorAdmin()
    .then(() => {
      console.log('\n🚀 VICTOR ESTÁ PRONTO PARA TESTES!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 FALHA na configuração:', error);
      process.exit(1);
    });
}

module.exports = VictorAdminSetup;
