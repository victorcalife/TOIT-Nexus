/**
 * HOOK PARA GERENCIAR SLOTS ML + STORAGE
 * Hook React para gerenciar slots ML e storage por tenant
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Estado inicial dos slots
const initialSlotsState = {
  total: 0,
  used: 0,
  available: 0,
  list: [],
  plan: {
    name: null,
    displayName: null,
    mlSlots: 0
  },
  needsSetup: true,
  loading: false,
  error: null,
  lastUpdated: null
};

// Estado inicial do storage
const initialStorageState = {
  total: 0,
  used: 0,
  available: 0,
  categories: {
    uploads: { used: 0, limit: 0 },
    database: { used: 0, limit: 0 },
    cache: { used: 0, limit: 0 },
    logs: { used: 0, limit: 0 },
    emails: { used: 0, limit: 0 },
    calendar: { used: 0, limit: 0 },
    chat: { used: 0, limit: 0 }
  },
  analysis: {
    status: 'ok',
    warnings: [],
    recommendations: []
  },
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Hook para gerenciar slots ML e storage
 * @returns {Object} Estado e funções dos slots ML e storage
 */
export function useMLSlots() {
  const { user, tenantId } = useContext(AuthContext) || {};
  const [slots, setSlots] = useState(initialSlotsState);
  const [storage, setStorage] = useState(initialStorageState);

  /**
   * Buscar informações dos slots ML
   */
  const fetchSlots = useCallback(async () => {
    if (!tenantId) return;

    setSlots(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/ml-slots', {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setSlots({
        total: data.totalSlots || 0,
        used: data.usedSlots || 0,
        available: data.availableSlots || 0,
        list: data.slots || [],
        plan: {
          name: data.planName || null,
          displayName: data.planDisplayName || null,
          mlSlots: data.totalSlots || 0
        },
        needsSetup: !data.planName,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar slots ML:', error);
      setSlots(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [tenantId]);

  /**
   * Buscar informações de storage
   */
  const fetchStorage = useCallback(async () => {
    if (!tenantId) return;

    setStorage(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/storage', {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setStorage({
        total: data.limits?.total || 0,
        used: data.usage?.total || 0,
        available: (data.limits?.total || 0) - (data.usage?.total || 0),
        categories: {
          uploads: {
            used: data.usage?.uploads || 0,
            limit: data.limits?.uploads || 0
          },
          database: {
            used: data.usage?.database || 0,
            limit: data.limits?.database || 0
          },
          cache: {
            used: data.usage?.cache || 0,
            limit: data.limits?.cache || 0
          },
          logs: {
            used: data.usage?.logs || 0,
            limit: data.limits?.logs || 0
          },
          emails: {
            used: data.usage?.emails || 0,
            limit: data.limits?.emails || 0
          },
          calendar: {
            used: data.usage?.calendar || 0,
            limit: data.limits?.calendar || 0
          },
          chat: {
            used: data.usage?.chat || 0,
            limit: data.limits?.chat || 0
          }
        },
        analysis: data.analysis || { status: 'ok', warnings: [], recommendations: [] },
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar storage:', error);
      setStorage(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [tenantId]);

  /**
   * Criar novo slot ML
   */
  const createSlot = useCallback(async (slotType, slotName, slotLocation, config = {}) => {
    if (!tenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    try {
      const response = await fetch('/api/ml-slots', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slotType,
          slotName,
          slotLocation,
          config
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const result = await response.json();

      // Atualizar lista de slots
      await fetchSlots();

      return result;

    } catch (error) {
      console.error('Erro ao criar slot:', error);
      throw error;
    }
  }, [tenantId, fetchSlots]);

  /**
   * Usar um slot ML
   */
  const useSlot = useCallback(async (slotLocation, usageData = {}) => {
    if (!tenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    try {
      const response = await fetch(`/api/ml-slots/${slotLocation}/use`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const result = await response.json();

      // Atualizar lista de slots
      await fetchSlots();

      return result;

    } catch (error) {
      console.error('Erro ao usar slot:', error);
      throw error;
    }
  }, [tenantId, fetchSlots]);

  /**
   * Desativar slot ML
   */
  const deactivateSlot = useCallback(async (slotLocation) => {
    if (!tenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    try {
      const response = await fetch(`/api/ml-slots/${slotLocation}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const result = await response.json();

      // Atualizar lista de slots
      await fetchSlots();

      return result;

    } catch (error) {
      console.error('Erro ao desativar slot:', error);
      throw error;
    }
  }, [tenantId, fetchSlots]);

  /**
   * Verificar se pode criar novo slot
   */
  const canCreateSlot = useCallback(() => {
    return slots.available > 0 && !slots.loading;
  }, [slots.available, slots.loading]);

  /**
   * Verificar se pode usar storage
   */
  const canUseStorage = useCallback((bytes, category = 'uploads') => {
    const categoryInfo = storage.categories[category];
    if (!categoryInfo) return false;

    const wouldExceedCategory = (categoryInfo.used + bytes) > categoryInfo.limit;
    const wouldExceedTotal = (storage.used + bytes) > storage.total;

    return !wouldExceedCategory && !wouldExceedTotal;
  }, [storage]);

  /**
   * Formatar bytes em formato legível
   */
  const formatBytes = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * Configurar plano (migração do sistema antigo)
   */
  const setupPlan = useCallback(async (planName) => {
    if (!tenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    try {
      const response = await fetch('/api/ml-slots/setup', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const result = await response.json();

      // Atualizar dados
      await Promise.all([fetchSlots(), fetchStorage()]);

      return result;

    } catch (error) {
      console.error('Erro ao configurar plano:', error);
      throw error;
    }
  }, [tenantId, fetchSlots, fetchStorage]);

  // Carregar dados iniciais
  useEffect(() => {
    if (tenantId) {
      fetchSlots();
      fetchStorage();
    }
  }, [tenantId, fetchSlots, fetchStorage]);

  // Atualizar dados periodicamente
  useEffect(() => {
    if (!tenantId) return;

    const interval = setInterval(() => {
      fetchSlots();
      fetchStorage();
    }, 5 * 60 * 1000); // A cada 5 minutos

    return () => clearInterval(interval);
  }, [tenantId, fetchSlots, fetchStorage]);

  return {
    // Slots ML
    slots,
    createSlot,
    useSlot,
    deactivateSlot,
    canCreateSlot,
    
    // Storage
    storage,
    canUseStorage,
    formatBytes,
    
    // Funções gerais
    setupPlan,
    refresh: () => {
      fetchSlots();
      fetchStorage();
    },
    
    // Estados combinados para compatibilidade
    isLoading: slots.loading || storage.loading,
    error: slots.error || storage.error,
    needsSetup: slots.needsSetup
  };
}
