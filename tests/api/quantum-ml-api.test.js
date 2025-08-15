/**
 * TESTES DE API - QUANTUM ML
 * Testa todas as APIs do sistema ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

const MLSlotsService = require('../../services/ml/MLSlotsService');
const StorageManagementService = require('../../services/storage/StorageManagementService');
const QuantumInsightsService = require('../../services/ml/QuantumInsightsService');

// Mock do pool de banco de dados
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
    end: jest.fn()
  }))
}));

describe('Quantum ML API Tests', () => {
  const testTenantId = 'test-tenant-api';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MLSlotsService', () => {
    test('checkTenantSlots deve retornar informações corretas', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{ plan_name: 'quantum_plus' }]
          })
          .mockResolvedValueOnce({
            rows: [
              {
                slot_type: 'dashboard_widget',
                slot_name: 'Test Widget',
                slot_location: 'test_widget_1',
                is_active: true,
                created_at: new Date(),
                last_used_at: new Date(),
                usage_count: 5
              }
            ]
          })
      };

      MLSlotsService.pool = mockPool;

      const result = await MLSlotsService.checkTenantSlots(testTenantId);

      expect(result).toHaveProperty('tenantId', testTenantId);
      expect(result).toHaveProperty('planName', 'quantum_plus');
      expect(result).toHaveProperty('totalSlots', 10);
      expect(result).toHaveProperty('usedSlots', 1);
      expect(result).toHaveProperty('availableSlots', 9);
      expect(result.slots).toHaveLength(1);
    });

    test('createSlot deve criar slot com sucesso', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{ plan_name: 'quantum_plus' }]
          })
          .mockResolvedValueOnce({
            rows: [
              {
                slot_type: 'dashboard_widget',
                slot_name: 'Existing Widget',
                slot_location: 'existing_widget',
                is_active: true,
                created_at: new Date(),
                last_used_at: null,
                usage_count: 0
              }
            ]
          })
          .mockResolvedValueOnce({ rows: [] }) // Verificação de slot existente
          .mockResolvedValueOnce({
            rows: [{ id: 'new-slot-id', created_at: new Date() }]
          })
      };

      MLSlotsService.pool = mockPool;

      const result = await MLSlotsService.createSlot(
        testTenantId,
        'dashboard_widget',
        'New Test Widget',
        'new_test_widget_1',
        { testConfig: true }
      );

      expect(result.success).toBe(true);
      expect(result.slotId).toBe('new-slot-id');
      expect(result.slotType).toBe('dashboard_widget');
      expect(result.slotName).toBe('New Test Widget');
    });

    test('useSlot deve registrar uso corretamente', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{
              id: 'slot-id',
              slot_type: 'dashboard_widget',
              slot_name: 'Test Widget',
              usage_count: 5
            }]
          })
          .mockResolvedValueOnce({ rows: [] }) // Update
          .mockResolvedValueOnce({ rows: [] }) // Insert usage
      };

      MLSlotsService.pool = mockPool;

      const result = await MLSlotsService.useSlot(
        testTenantId,
        'test_widget_1',
        { insightType: 'prediction', dataPoints: 100 }
      );

      expect(result.success).toBe(true);
      expect(result.slotId).toBe('slot-id');
      expect(result.usageCount).toBe(6);
    });
  });

  describe('StorageManagementService', () => {
    test('checkTenantStorage deve calcular uso corretamente', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{
              plan_name: 'quantum_plus',
              storage_limits: JSON.stringify({
                total: 10737418240, // 10GB
                uploads: 5368709120, // 5GB
                database: 2147483648 // 2GB
              })
            }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_size: 1073741824 }] // 1GB uploads
          })
          .mockResolvedValueOnce({
            rows: [{
              query_data: 536870912, // 512MB
              report_data: 268435456, // 256MB
              workflow_data: 134217728 // 128MB
            }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_cache: 67108864 }] // 64MB cache
          })
          .mockResolvedValueOnce({
            rows: [{ total_logs: 33554432 }] // 32MB logs
          })
          .mockResolvedValueOnce({
            rows: [{ total_emails: 16777216 }] // 16MB emails
          })
          .mockResolvedValueOnce({
            rows: [{ total_calendar: 8388608 }] // 8MB calendar
          })
          .mockResolvedValueOnce({
            rows: [{ total_chat: 4194304 }] // 4MB chat
          })
      };

      StorageManagementService.pool = mockPool;

      const result = await StorageManagementService.checkTenantStorage(testTenantId);

      expect(result).toHaveProperty('tenantId', testTenantId);
      expect(result).toHaveProperty('planName', 'quantum_plus');
      expect(result.usage.uploads).toBe(1073741824);
      expect(result.usage.total).toBeGreaterThan(0);
      expect(result.limits.total).toBe(10737418240);
      expect(result.analysis.status).toBeDefined();
    });

    test('canUseStorage deve verificar limites corretamente', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{
              plan_name: 'quantum_plus',
              storage_limits: JSON.stringify({
                total: 10737418240,
                uploads: 5368709120
              })
            }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_size: 1073741824 }]
          })
          .mockResolvedValueOnce({
            rows: [{ query_data: 0, report_data: 0, workflow_data: 0 }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_cache: 0 }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_logs: 0 }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_emails: 0 }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_calendar: 0 }]
          })
          .mockResolvedValueOnce({
            rows: [{ total_chat: 0 }]
          })
      };

      StorageManagementService.pool = mockPool;

      // Teste com uso permitido
      const allowedResult = await StorageManagementService.canUseStorage(
        testTenantId,
        1024 * 1024, // 1MB
        'uploads'
      );

      expect(allowedResult.allowed).toBe(true);
      expect(allowedResult.reason).toBe('OK');

      // Teste com uso que excede limite
      const deniedResult = await StorageManagementService.canUseStorage(
        testTenantId,
        6 * 1024 * 1024 * 1024, // 6GB (excede limite de uploads)
        'uploads'
      );

      expect(deniedResult.allowed).toBe(false);
      expect(deniedResult.reason).toContain('uploads');
    });
  });

  describe('QuantumInsightsService', () => {
    test('processInsight deve processar dados corretamente', async () => {
      const testData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 110 },
        { date: '2024-01-03', value: 105 },
        { date: '2024-01-04', value: 120 },
        { date: '2024-01-05', value: 115 }
      ];

      const result = await QuantumInsightsService.processInsight(
        testData,
        'prediction',
        { forecastDays: 3 }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('insights');
      expect(result.data).toHaveProperty('predictions');
      expect(result.data).toHaveProperty('confidence');
      expect(result.data).toHaveProperty('processingTime');
      expect(result.data.insights).toHaveLength(3);
    });

    test('detectAnomalies deve identificar anomalias', async () => {
      const testData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 105 },
        { date: '2024-01-03', value: 500 }, // Anomalia
        { date: '2024-01-04', value: 110 },
        { date: '2024-01-05', value: 108 }
      ];

      const result = await QuantumInsightsService.detectAnomalies(testData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('anomalies');
      expect(result.data).toHaveProperty('threshold');
      expect(result.data.anomalies.length).toBeGreaterThan(0);
      
      const anomaly = result.data.anomalies[0];
      expect(anomaly).toHaveProperty('date', '2024-01-03');
      expect(anomaly).toHaveProperty('value', 500);
      expect(anomaly).toHaveProperty('severity');
    });

    test('optimizeData deve gerar recomendações', async () => {
      const testData = [
        { category: 'A', value: 100, efficiency: 0.8 },
        { category: 'B', value: 200, efficiency: 0.6 },
        { category: 'C', value: 150, efficiency: 0.9 }
      ];

      const result = await QuantumInsightsService.optimizeData(testData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('recommendations');
      expect(result.data).toHaveProperty('potentialGains');
      expect(result.data).toHaveProperty('priorityActions');
      expect(result.data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Testes de Performance', () => {
    test('processInsight deve completar em tempo aceitável', async () => {
      const startTime = Date.now();
      
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: Math.random() * 1000
      }));

      const result = await QuantumInsightsService.processInsight(
        testData,
        'prediction',
        { forecastDays: 7 }
      );

      const processingTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Menos de 5 segundos
    });

    test('checkTenantSlots deve ser rápido', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{ plan_name: 'quantum_plus' }]
          })
          .mockResolvedValueOnce({
            rows: []
          })
      };

      MLSlotsService.pool = mockPool;

      const startTime = Date.now();
      const result = await MLSlotsService.checkTenantSlots(testTenantId);
      const processingTime = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(1000); // Menos de 1 segundo
    });
  });

  describe('Testes de Concorrência', () => {
    test('múltiplas criações de slots simultâneas', async () => {
      const mockPool = {
        query: jest.fn()
          .mockResolvedValue({
            rows: [{ plan_name: 'quantum_plus' }]
          })
      };

      MLSlotsService.pool = mockPool;

      const promises = Array.from({ length: 5 }, (_, i) =>
        MLSlotsService.createSlot(
          testTenantId,
          'dashboard_widget',
          `Concurrent Widget ${i}`,
          `concurrent_widget_${i}`,
          { index: i }
        ).catch(error => ({ error: error.message }))
      );

      const results = await Promise.all(promises);
      
      // Pelo menos algumas devem ter sucesso
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => r.error);

      expect(successful.length + failed.length).toBe(5);
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});

// Configuração do Jest
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
