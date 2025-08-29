const request = require('supertest');
const { app } = require('../index-unified');
const DatabaseService = require('../services/DatabaseService');

const db = new DatabaseService();

describe('🔥 TESTES FUNCIONAIS COMPLETOS - TODAS AS ROTAS', () => {
  let authToken;
  let testUserId;
  let testTenantId;

  beforeAll(async () => {
    // Configurar banco de dados de teste
    await setupTestDatabase();
    
    // Criar usuário de teste
    const testUser = await createTestUser();
    testUserId = testUser.id;
    testTenantId = testUser.tenantId;
    
    // Fazer login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });
    
    authToken = loginResponse.body.data.token;
    
    console.log('✅ Setup de testes concluído');
  });

  afterAll(async () => {
    // Limpar dados de teste
    await cleanupTestData();
    console.log('✅ Cleanup de testes concluído');
  });

  describe('🔐 AUTENTICAÇÃO - Rotas Auth', () => {
    test('POST /api/auth/register - Deve registrar novo usuário', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Novo Usuário',
          email: 'novo@example.com',
          password: 'senha123456',
          confirmPassword: 'senha123456'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('novo@example.com');
    });

    test('POST /api/auth/login - Deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('POST /api/auth/login - Deve rejeitar credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'senhaerrada'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    test('GET /api/auth/me - Deve retornar dados do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('POST /api/auth/logout - Deve fazer logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('👥 USUÁRIOS - Rotas Users', () => {
    test('GET /api/users - Deve listar usuários', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    test('GET /api/users/:id - Deve obter usuário específico', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUserId);
    });

    test('PUT /api/users/:id - Deve atualizar usuário', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Nome Atualizado'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('PUT /api/users/:id/password - Deve alterar senha', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'testpassword123',
          newPassword: 'novasenha123',
          confirmPassword: 'novasenha123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('🏢 TENANTS - Rotas Tenants', () => {
    test('GET /api/tenants - Deve listar tenants (super_admin)', async () => {
      // Criar token de super_admin para teste
      const superAdminToken = await createSuperAdminToken();
      
      const response = await request(app)
        .get('/api/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tenants)).toBe(true);
    });

    test('POST /api/tenants - Deve criar novo tenant', async () => {
      const superAdminToken = await createSuperAdminToken();
      
      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Tenant Teste',
          domain: 'teste.com',
          email: 'admin@teste.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Tenant Teste');
    });

    test('GET /api/tenants/:id - Deve obter tenant específico', async () => {
      const response = await request(app)
        .get(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tenant.id).toBe(testTenantId);
    });
  });

  describe('📊 RELATÓRIOS - Rotas Reports', () => {
    let testReportId;

    test('POST /api/reports - Deve criar novo relatório', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Relatório Teste',
          description: 'Relatório para testes',
          type: 'table',
          category: 'test',
          config: {
            columns: ['id', 'name', 'email']
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Relatório Teste');
      
      testReportId = response.body.data.reportId;
    });

    test('GET /api/reports - Deve listar relatórios', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.reports)).toBe(true);
    });

    test('GET /api/reports/:id - Deve obter relatório específico', async () => {
      const response = await request(app)
        .get(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report.id).toBe(testReportId);
    });

    test('PUT /api/reports/:id - Deve atualizar relatório', async () => {
      const response = await request(app)
        .put(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Relatório Atualizado',
          description: 'Descrição atualizada'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('DELETE /api/reports/:id - Deve deletar relatório', async () => {
      const response = await request(app)
        .delete(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('🔄 WORKFLOWS - Rotas Workflows', () => {
    let testWorkflowId;

    test('POST /api/workflows - Deve criar novo workflow', async () => {
      const response = await request(app)
        .post('/api/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Workflow Teste',
          description: 'Workflow para testes',
          category: 'test',
          nodes: [
            { id: '1', type: 'start', position: { x: 0, y: 0 } },
            { id: '2', type: 'end', position: { x: 200, y: 0 } }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Workflow Teste');
      
      testWorkflowId = response.body.data.workflowId;
    });

    test('GET /api/workflows - Deve listar workflows', async () => {
      const response = await request(app)
        .get('/api/workflows')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.workflows)).toBe(true);
    });

    test('POST /api/workflows/:id/execute - Deve executar workflow', async () => {
      const response = await request(app)
        .post(`/api/workflows/${testWorkflowId}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parameters: {},
          dryRun: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });
  });

  describe('💬 CHAT - Rotas Chat', () => {
    let testSessionId;

    test('POST /api/chat/sessions - Deve criar nova sessão', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Sessão Teste'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Sessão Teste');
      
      testSessionId = response.body.data.sessionId;
    });

    test('GET /api/chat/sessions - Deve listar sessões', async () => {
      const response = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.sessions)).toBe(true);
    });

    test('POST /api/chat/sessions/:id/messages - Deve enviar mensagem', async () => {
      const response = await request(app)
        .post(`/api/chat/sessions/${testSessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Mensagem de teste'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/chat/sessions/:id/messages - Deve obter mensagens', async () => {
      const response = await request(app)
        .get(`/api/chat/sessions/${testSessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });
  });

  describe('🔑 PERMISSÕES - Rotas Permissions', () => {
    test('GET /api/permissions - Deve listar permissões disponíveis', async () => {
      const response = await request(app)
        .get('/api/permissions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permissions).toBeDefined();
      expect(response.body.data.roles).toBeDefined();
    });

    test('GET /api/permissions/user/:userId - Deve obter permissões do usuário', async () => {
      const response = await request(app)
        .get(`/api/permissions/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permissions).toBeDefined();
    });

    test('POST /api/permissions/check - Deve verificar permissão específica', async () => {
      const response = await request(app)
        .post('/api/permissions/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          permission: 'users.view'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.hasPermission).toBe('boolean');
    });
  });

  describe('📥 EXPORTS - Rotas Exports', () => {
    test('GET /api/exports/download/:filename - Deve retornar erro para arquivo inexistente', async () => {
      const response = await request(app)
        .get('/api/exports/download/arquivo-inexistente.pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('🔍 MIDDLEWARE - Testes de Middleware', () => {
    test('Deve rejeitar requisições sem token', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Deve rejeitar token inválido', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Deve aplicar filtro de tenant corretamente', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Verificar se apenas usuários do tenant correto são retornados
      const users = response.body.data.users;
      users.forEach(user => {
        expect(user.tenant_id).toBe(testTenantId);
      });
    });
  });

  describe('⚡ PERFORMANCE - Testes de Performance', () => {
    test('Endpoints devem responder em menos de 1 segundo', async () => {
      const endpoints = [
        '/api/auth/me',
        '/api/users',
        '/api/reports',
        '/api/workflows',
        '/api/chat/sessions'
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);
        
        const responseTime = Date.now() - startTime;
        
        expect(response.status).toBeLessThan(500);
        expect(responseTime).toBeLessThan(1000);
        
        console.log(`⚡ ${endpoint}: ${responseTime}ms`);
      }
    });

    test('Deve suportar múltiplas requisições simultâneas', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});

// Funções auxiliares
async function setupTestDatabase() {
  try {
    // Criar tabelas de teste se não existirem
    await db.query(`
      CREATE TABLE IF NOT EXISTS test_cleanup (
        id INT PRIMARY KEY AUTO_INCREMENT,
        table_name VARCHAR(255),
        record_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Banco de dados de teste configurado');
  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error);
    throw error;
  }
}

async function createTestUser() {
  try {
    // Criar tenant de teste
    const tenantResult = await db.query(`
      INSERT INTO tenants (name, domain, email, is_active, created_at, updated_at)
      VALUES ('Tenant Teste', 'teste.local', 'admin@teste.local', 1, NOW(), NOW())
    `);
    
    const tenantId = tenantResult.insertId;
    
    // Criar usuário de teste
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const userResult = await db.query(`
      INSERT INTO users (tenant_id, name, email, password, role, is_active, created_at, updated_at)
      VALUES (?, 'Usuário Teste', 'test@example.com', ?, 'admin', 1, NOW(), NOW())
    `, [tenantId, hashedPassword]);
    
    const userId = userResult.insertId;
    
    // Registrar para limpeza
    await db.query(`
      INSERT INTO test_cleanup (table_name, record_id) VALUES 
      ('users', ?), ('tenants', ?)
    `, [userId, tenantId]);
    
    console.log(`✅ Usuário de teste criado: ID ${userId}, Tenant ${tenantId}`);
    
    return { id: userId, tenantId };
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    throw error;
  }
}

async function createSuperAdminToken() {
  try {
    // Criar super admin temporário
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    const result = await db.query(`
      INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
      VALUES ('Super Admin Teste', 'superadmin@test.com', ?, 'super_admin', 1, NOW(), NOW())
    `, [hashedPassword]);
    
    const userId = result.insertId;
    
    // Registrar para limpeza
    await db.query(`
      INSERT INTO test_cleanup (table_name, record_id) VALUES ('users', ?)
    `, [userId]);
    
    // Gerar token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId, email: 'superadmin@test.com', role: 'super_admin' },
      process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
      { expiresIn: '1h' }
    );
    
    return token;
  } catch (error) {
    console.error('❌ Erro ao criar super admin:', error);
    throw error;
  }
}

async function cleanupTestData() {
  try {
    // Obter registros para limpeza
    const cleanupRecords = await db.query(`
      SELECT * FROM test_cleanup ORDER BY id DESC
    `);
    
    // Deletar registros de teste
    for (const record of cleanupRecords) {
      await db.query(`DELETE FROM ${record.table_name} WHERE id = ?`, [record.record_id]);
    }
    
    // Limpar tabela de cleanup
    await db.query(`DROP TABLE IF EXISTS test_cleanup`);
    
    console.log(`✅ ${cleanupRecords.length} registros de teste removidos`);
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}
