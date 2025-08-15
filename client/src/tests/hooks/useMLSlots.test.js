/**
 * TESTES DO HOOK useMLSlots
 * Testa funcionalidades do hook de gerenciamento de slots ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMLSlots } from '../../hooks/useMLSlots';

// Mock do fetch
global.fetch = jest.fn();

// Mock do AuthContext
const mockAuthContext = {
  user: { id: 'user-1', name: 'Test User' },
  tenantId: 'test-tenant'
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => mockAuthContext
}));

describe('useMLSlots Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('Inicialização', () => {
    test('deve inicializar com estado padrão', () => {
      const { result } = renderHook(() => useMLSlots());

      expect(result.current.slots.total).toBe(0);
      expect(result.current.slots.used).toBe(0);
      expect(result.current.slots.available).toBe(0);
      expect(result.current.slots.list).toEqual([]);
      expect(result.current.slots.needsSetup).toBe(true);
      expect(result.current.storage.total).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });

    test('deve buscar dados quando tenantId está disponível', async () => {
      const mockSlotsResponse = {
        totalSlots: 10,
        usedSlots: 3,
        availableSlots: 7,
        slots: [
          {
            id: 'slot-1',
            slot_type: 'dashboard_widget',
            slot_name: 'Test Widget',
            slot_location: 'test_widget_1',
            is_active: true,
            usage_count: 5
          }
        ],
        planName: 'quantum_plus',
        planDisplayName: 'NEXUS Quantum Plus'
      };

      const mockStorageResponse = {
        limits: { total: 10737418240, uploads: 5368709120 },
        usage: { total: 2147483648, uploads: 1073741824 },
        analysis: { status: 'ok', warnings: [], recommendations: [] }
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSlotsResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStorageResponse)
        });

      const { result } = renderHook(() => useMLSlots());

      await waitFor(() => {
        expect(result.current.slots.total).toBe(10);
        expect(result.current.slots.used).toBe(3);
        expect(result.current.slots.available).toBe(7);
        expect(result.current.slots.list).toHaveLength(1);
        expect(result.current.slots.needsSetup).toBe(false);
      });

      expect(fetch).toHaveBeenCalledWith('/api/ml-slots', {
        headers: {
          'X-Tenant-ID': 'test-tenant',
          'Content-Type': 'application/json'
        }
      });

      expect(fetch).toHaveBeenCalledWith('/api/storage', {
        headers: {
          'X-Tenant-ID': 'test-tenant',
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('Criação de Slots', () => {
    test('deve criar slot com sucesso', async () => {
      const mockResponse = {
        success: true,
        slotId: 'new-slot-id',
        slotType: 'dashboard_widget',
        slotName: 'New Widget',
        slotLocation: 'new_widget_1'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { result } = renderHook(() => useMLSlots());

      let createResult;
      await act(async () => {
        createResult = await result.current.createSlot(
          'dashboard_widget',
          'New Widget',
          'new_widget_1',
          { testConfig: true }
        );
      });

      expect(createResult).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/ml-slots', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': 'test-tenant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slotType: 'dashboard_widget',
          slotName: 'New Widget',
          slotLocation: 'new_widget_1',
          config: { testConfig: true }
        })
      });
    });

    test('deve tratar erro na criação de slot', async () => {
      const mockErrorResponse = {
        message: 'Limite de slots atingido'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockErrorResponse)
      });

      const { result } = renderHook(() => useMLSlots());

      await expect(
        result.current.createSlot('dashboard_widget', 'Test', 'test_1')
      ).rejects.toThrow('Limite de slots atingido');
    });
  });

  describe('Uso de Slots', () => {
    test('deve usar slot com sucesso', async () => {
      const mockResponse = {
        success: true,
        slotId: 'slot-1',
        slotType: 'dashboard_widget',
        slotName: 'Test Widget',
        usageCount: 6
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { result } = renderHook(() => useMLSlots());

      let useResult;
      await act(async () => {
        useResult = await result.current.useSlot('test_widget_1', {
          insightType: 'prediction',
          dataPoints: 100
        });
      });

      expect(useResult).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/ml-slots/test_widget_1/use', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': 'test-tenant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          insightType: 'prediction',
          dataPoints: 100
        })
      });
    });

    test('deve tratar erro no uso de slot', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Slot não encontrado' })
      });

      const { result } = renderHook(() => useMLSlots());

      await expect(
        result.current.useSlot('nonexistent_slot', {})
      ).rejects.toThrow('Slot não encontrado');
    });
  });

  describe('Desativação de Slots', () => {
    test('deve desativar slot com sucesso', async () => {
      const mockResponse = {
        success: true,
        slotId: 'slot-1',
        slotName: 'Test Widget'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { result } = renderHook(() => useMLSlots());

      let deactivateResult;
      await act(async () => {
        deactivateResult = await result.current.deactivateSlot('test_widget_1');
      });

      expect(deactivateResult).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/ml-slots/test_widget_1', {
        method: 'DELETE',
        headers: {
          'X-Tenant-ID': 'test-tenant',
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('Verificações de Capacidade', () => {
    test('canCreateSlot deve retornar true quando há slots disponíveis', () => {
      const { result } = renderHook(() => useMLSlots());

      // Simular estado com slots disponíveis
      act(() => {
        result.current.slots.available = 5;
        result.current.slots.loading = false;
      });

      expect(result.current.canCreateSlot()).toBe(true);
    });

    test('canCreateSlot deve retornar false quando não há slots disponíveis', () => {
      const { result } = renderHook(() => useMLSlots());

      // Simular estado sem slots disponíveis
      act(() => {
        result.current.slots.available = 0;
        result.current.slots.loading = false;
      });

      expect(result.current.canCreateSlot()).toBe(false);
    });

    test('canUseStorage deve verificar limites corretamente', () => {
      const { result } = renderHook(() => useMLSlots());

      // Simular estado de storage
      act(() => {
        result.current.storage.categories.uploads = {
          used: 1073741824, // 1GB
          limit: 5368709120 // 5GB
        };
        result.current.storage.used = 2147483648; // 2GB
        result.current.storage.total = 10737418240; // 10GB
      });

      // Teste com uso permitido
      expect(result.current.canUseStorage(1024 * 1024, 'uploads')).toBe(true);

      // Teste com uso que excede limite
      expect(result.current.canUseStorage(5 * 1024 * 1024 * 1024, 'uploads')).toBe(false);
    });
  });

  describe('Formatação de Bytes', () => {
    test('formatBytes deve formatar corretamente', () => {
      const { result } = renderHook(() => useMLSlots());

      expect(result.current.formatBytes(0)).toBe('0 Bytes');
      expect(result.current.formatBytes(1024)).toBe('1 KB');
      expect(result.current.formatBytes(1048576)).toBe('1 MB');
      expect(result.current.formatBytes(1073741824)).toBe('1 GB');
      expect(result.current.formatBytes(1099511627776)).toBe('1 TB');
    });
  });

  describe('Configuração de Plano', () => {
    test('deve configurar plano com sucesso', async () => {
      const mockResponse = {
        success: true,
        planName: 'quantum_plus',
        slotsConfigured: true
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { result } = renderHook(() => useMLSlots());

      let setupResult;
      await act(async () => {
        setupResult = await result.current.setupPlan('quantum_plus');
      });

      expect(setupResult).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/ml-slots/setup', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': 'test-tenant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planName: 'quantum_plus' })
      });
    });
  });

  describe('Atualização Automática', () => {
    test('deve atualizar dados periodicamente', async () => {
      jest.useFakeTimers();

      const mockResponse = {
        totalSlots: 10,
        usedSlots: 3,
        availableSlots: 7,
        slots: []
      };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      renderHook(() => useMLSlots());

      // Avançar 5 minutos
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(4); // 2 iniciais + 2 do intervalo
      });

      jest.useRealTimers();
    });
  });

  describe('Tratamento de Erros', () => {
    test('deve tratar erro de rede', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useMLSlots());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    test('deve tratar resposta de erro da API', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { result } = renderHook(() => useMLSlots());

      await waitFor(() => {
        expect(result.current.error).toContain('500');
      });
    });
  });

  describe('Cleanup', () => {
    test('deve limpar interval ao desmontar', () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useMLSlots());

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      jest.useRealTimers();
      clearIntervalSpy.mockRestore();
    });
  });
});
