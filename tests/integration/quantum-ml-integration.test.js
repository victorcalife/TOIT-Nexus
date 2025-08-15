/**
 * TESTES DE INTEGRAÇÃO - QUANTUM ML
 * Testa todo o fluxo do sistema ML: slots, storage, insights, predições
 * 100% JavaScript - SEM TYPESCRIPT
 */

const request = require('supertest');
const { Pool } = require('pg');

// Mock do app Express
const express = require('express');
const app = express();
app.use(express.json());

// Importar rotas
const mlRoutes = require('../../routes/ml');
const slotsRoutes = require('../../routes/ml/slotsRoutes');
const storageRoutes = require('../../routes/storage/storageRoutes');

// Configurar rotas no app de teste
app.use('/api', slotsRoutes);
app.use('/api', storageRoutes);

// Configuração do banco de teste
const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/toit_nexus_test',
  ssl: false
});

describe('Quantum ML Integration Tests', () => {
  const testTenantId = 'test-tenant-integration';
  let createdSlotId = null;

  beforeAll(async () => {
    // Setup do banco de teste
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup do banco de teste
    await cleanupTestDatabase();
    await testPool.end();
  });

  describe('1. Sistema de Slots ML', () => {
    test('Deve verificar slots disponíveis para tenant', async () => {
      const response = await request(app)
        .get('/api/ml-slots')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSlots');
      expect(response.body.data).toHaveProperty('usedSlots');
      expect(response.body.data).toHaveProperty('availableSlots');
      expect(response.body.data.totalSlots).toBeGreaterThan(0);
    });

    test('Deve criar novo slot ML', async () => {
      const slotData = {
        slotType: 'dashboard_widget',
        slotName: 'Test Widget ML',
        slotLocation: 'test_dashboard_widget_1',
        config: {
          testMode: true,
          description: 'Widget de teste para integração'
        }
      };

      const response = await request(app)
        .post('/api/ml-slots')
        .set('X-Tenant-ID', testTenantId)
        .send(slotData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('slotId');
      expect(response.body.data.slotName).toBe(slotData.slotName);
      expect(response.body.data.slotType).toBe(slotData.slotType);

      createdSlotId = response.body.data.slotId;
    });

    test('Deve usar slot ML criado', async () => {
      const usageData = {
        insightType: 'prediction',
        dataPoints: 100,
        processingTime: 1500
      };

      const response = await request(app)
        .post(`/api/ml-slots/test_dashboard_widget_1/use`)
        .set('X-Tenant-ID', testTenantId)
        .send(usageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usageCount');
      expect(response.body.data.usageCount).toBeGreaterThan(0);
    });

    test('Deve listar slots do tenant', async () => {
      const response = await request(app)
        .get('/api/ml-slots/list')
        .set('X-Tenant-ID', testTenantId)
        .query({ active_only: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const testSlot = response.body.data.find(slot => 
        slot.slot_location === 'test_dashboard_widget_1'
      );
      expect(testSlot).toBeDefined();
      expect(testSlot.is_active).toBe(true);
    });

    test('Deve obter estatísticas de slots', async () => {
      const response = await request(app)
        .get('/api/ml-slots/stats')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.summary).toHaveProperty('totalSlots');
      expect(response.body.data.summary).toHaveProperty('usedSlots');
      expect(response.body.data.summary).toHaveProperty('utilizationRate');
    });
  });

  describe('2. Sistema de Storage', () => {
    test('Deve verificar uso de storage do tenant', async () => {
      const response = await request(app)
        .get('/api/storage')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usage');
      expect(response.body.data).toHaveProperty('limits');
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.usage).toHaveProperty('total');
      expect(response.body.data.limits).toHaveProperty('total');
    });

    test('Deve verificar disponibilidade de storage', async () => {
      const checkData = {
        bytes: 1024 * 1024, // 1MB
        category: 'uploads'
      };

      const response = await request(app)
        .post('/api/storage/check')
        .set('X-Tenant-ID', testTenantId)
        .send(checkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('allowed');
      expect(response.body.data).toHaveProperty('currentUsage');
      expect(response.body.data).toHaveProperty('limits');
    });

    test('Deve registrar uso de storage', async () => {
      const usageData = {
        bytes: 512 * 1024, // 512KB
        category: 'uploads',
        description: 'Test file upload for integration'
      };

      const response = await request(app)
        .post('/api/storage/record')
        .set('X-Tenant-ID', testTenantId)
        .send(usageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registrado com sucesso');
    });

    test('Deve gerar relatório de storage', async () => {
      const response = await request(app)
        .get('/api/storage/report')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usage');
      expect(response.body.data).toHaveProperty('limits');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    test('Deve executar limpeza de storage', async () => {
      const response = await request(app)
        .post('/api/storage/cleanup')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalBytesFreed');
      expect(response.body.data.totalBytesFreed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. Fluxo Completo de Integração', () => {
    test('Deve executar fluxo completo: criar slot → usar → verificar storage → limpar', async () => {
      // 1. Criar novo slot
      const slotData = {
        slotType: 'tql_query',
        slotName: 'Integration Test Query',
        slotLocation: 'integration_test_query_1',
        config: { queryType: 'analytics' }
      };

      const createResponse = await request(app)
        .post('/api/ml-slots')
        .set('X-Tenant-ID', testTenantId)
        .send(slotData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);

      // 2. Usar o slot criado
      const usageData = {
        queryExecuted: 'SELECT * FROM test_data',
        resultSize: 2048,
        processingTime: 800
      };

      const useResponse = await request(app)
        .post('/api/ml-slots/integration_test_query_1/use')
        .set('X-Tenant-ID', testTenantId)
        .send(usageData)
        .expect(200);

      expect(useResponse.body.success).toBe(true);

      // 3. Verificar impacto no storage
      const storageResponse = await request(app)
        .get('/api/storage')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(storageResponse.body.success).toBe(true);

      // 4. Registrar uso adicional de storage
      await request(app)
        .post('/api/storage/record')
        .set('X-Tenant-ID', testTenantId)
        .send({
          bytes: 1024,
          category: 'database',
          description: 'Query result cache'
        })
        .expect(200);

      // 5. Executar limpeza
      const cleanupResponse = await request(app)
        .post('/api/storage/cleanup')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(cleanupResponse.body.success).toBe(true);

      // 6. Desativar slot
      const deactivateResponse = await request(app)
        .delete('/api/ml-slots/integration_test_query_1')
        .set('X-Tenant-ID', testTenantId)
        .expect(200);

      expect(deactivateResponse.body.success).toBe(true);
    });

    test('Deve respeitar limites de slots por plano', async () => {
      // Tentar criar mais slots do que o limite do plano
      const slotsToCreate = 15; // Assumindo que o plano de teste tem menos que isso
      const createdSlots = [];

      for (let i = 0; i < slotsToCreate; i++) {
        const slotData = {
          slotType: 'dashboard_widget',
          slotName: `Limit Test Widget ${i}`,
          slotLocation: `limit_test_widget_${i}`,
          config: { testIndex: i }
        };

        try {
          const response = await request(app)
            .post('/api/ml-slots')
            .set('X-Tenant-ID', testTenantId)
            .send(slotData);

          if (response.status === 201) {
            createdSlots.push(slotData.slotLocation);
          } else if (response.status === 400) {
            // Esperado quando atingir o limite
            expect(response.body.error).toContain('limite');
            break;
          }
        } catch (error) {
          // Limite atingido
          break;
        }
      }

      // Verificar que pelo menos alguns slots foram criados
      expect(createdSlots.length).toBeGreaterThan(0);
      
      // Limpar slots criados
      for (const location of createdSlots) {
        await request(app)
          .delete(`/api/ml-slots/${location}`)
          .set('X-Tenant-ID', testTenantId);
      }
    });
  });

  describe('4. Testes de Erro e Validação', () => {
    test('Deve retornar erro ao criar slot sem dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/ml-slots')
        .set('X-Tenant-ID', testTenantId)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('obrigatórios');
    });

    test('Deve retornar erro ao usar slot inexistente', async () => {
      const response = await request(app)
        .post('/api/ml-slots/nonexistent_slot/use')
        .set('X-Tenant-ID', testTenantId)
        .send({ test: true })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrado');
    });

    test('Deve retornar erro ao verificar storage com bytes inválidos', async () => {
      const response = await request(app)
        .post('/api/storage/check')
        .set('X-Tenant-ID', testTenantId)
        .send({ bytes: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('maior que zero');
    });
  });
});

/**
 * Setup do banco de dados de teste
 */
async function setupTestDatabase() {
  try {
    // Criar tenant de teste
    await testPool.query(`
      INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
      SELECT $1, id, true
      FROM subscription_plans 
      WHERE name = 'quantum_plus'
      ON CONFLICT (tenant_id, is_active) DO NOTHING
    `, ['test-tenant-integration']);

    console.log('✅ Banco de teste configurado');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de teste:', error);
  }
}

/**
 * Limpeza do banco de dados de teste
 */
async function cleanupTestDatabase() {
  try {
    // Limpar dados de teste
    await testPool.query('DELETE FROM ml_slot_usage WHERE tenant_id = $1', ['test-tenant-integration']);
    await testPool.query('DELETE FROM ml_slots WHERE tenant_id = $1', ['test-tenant-integration']);
    await testPool.query('DELETE FROM storage_usage_log WHERE tenant_id = $1', ['test-tenant-integration']);
    await testPool.query('DELETE FROM tenant_subscriptions WHERE tenant_id = $1', ['test-tenant-integration']);

    console.log('✅ Banco de teste limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de teste:', error);
  }
}
