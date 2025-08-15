/**
 * HOOK PARA GERENCIAR CRÉDITOS ML
 * Hook React para gerenciar estado dos créditos ML em toda aplicação
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Estado inicial dos créditos
const initialCreditsState = {
  available: 0,
  used: 0,
  total: 0,
  resetDate: null,
  lastResetDate: null,
  plan: {
    name: null,
    displayName: null,
    creditsPerMonth: 0
  },
  needsSetup: true,
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Hook para gerenciar créditos ML
 * @returns {Object} Estado e funções para gerenciar créditos ML
 */
export function useMLCredits() {
  const [credits, setCredits] = useState(initialCreditsState);
  const { user, token } = useContext(AuthContext);

  /**
   * Fazer requisição para API
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções da requisição
   * @returns {Promise<Object>} Resposta da API
   */
  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const baseURL = process.env.REACT_APP_API_URL || '';
    const url = `${baseURL}/api${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': user?.tenantId || 'default',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }, [user?.tenantId, token]);

  /**
   * Carregar créditos do servidor
   */
  const loadCredits = useCallback(async () => {
    if (!user?.tenantId) {
      console.log('🔍 [useMLCredits] Usuário sem tenant ID, pulando carregamento');
      return;
    }

    setCredits(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔍 [useMLCredits] Carregando créditos ML...');
      
      const response = await apiRequest('/ml-credits');

      if (response.success) {
        const newCredits = {
          available: response.data.credits.available,
          used: response.data.credits.used,
          total: response.data.credits.total,
          resetDate: response.data.credits.resetDate,
          lastResetDate: response.data.credits.lastResetDate,
          plan: {
            name: response.data.plan.name,
            displayName: response.data.plan.displayName,
            creditsPerMonth: response.data.plan.creditsPerMonth
          },
          needsSetup: response.data.needsSetup,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        };

        setCredits(newCredits);
        console.log('✅ [useMLCredits] Créditos carregados:', newCredits);
      } else {
        throw new Error(response.error || 'Erro ao carregar créditos');
      }

    } catch (error) {
      console.error('❌ [useMLCredits] Erro ao carregar créditos:', error);
      setCredits(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [user?.tenantId, apiRequest]);

  /**
   * Configurar créditos para um plano
   * @param {string} planName - Nome do plano
   * @returns {Promise<boolean>} Sucesso da operação
   */
  const setupCredits = useCallback(async (planName) => {
    if (!user?.tenantId) {
      throw new Error('Usuário sem tenant ID');
    }

    setCredits(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`⚙️ [useMLCredits] Configurando créditos para plano: ${planName}`);

      const response = await apiRequest('/ml-credits/setup', {
        method: 'POST',
        body: JSON.stringify({ planName })
      });

      if (response.success) {
        console.log('✅ [useMLCredits] Créditos configurados com sucesso');
        
        // Recarregar créditos após configuração
        await loadCredits();
        return true;
      } else {
        throw new Error(response.error || 'Erro ao configurar créditos');
      }

    } catch (error) {
      console.error('❌ [useMLCredits] Erro ao configurar créditos:', error);
      setCredits(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      return false;
    }
  }, [user?.tenantId, apiRequest, loadCredits]);

  /**
   * Verificar se há créditos suficientes
   * @param {number} required - Créditos necessários
   * @returns {boolean} Se há créditos suficientes
   */
  const hasEnoughCredits = useCallback((required = 1) => {
    return credits.available >= required;
  }, [credits.available]);

  /**
   * Consumir créditos (simulação local - o consumo real é feito no backend)
   * @param {number} amount - Quantidade de créditos a consumir
   */
  const consumeCreditsLocally = useCallback((amount = 1) => {
    setCredits(prev => ({
      ...prev,
      available: Math.max(0, prev.available - amount),
      used: prev.used + amount,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  /**
   * Obter histórico de uso
   * @param {Object} filters - Filtros para o histórico
   * @returns {Promise<Array>} Histórico de uso
   */
  const getUsageHistory = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/ml-credits/history${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiRequest(endpoint);

      if (response.success) {
        return response.data.history;
      } else {
        throw new Error(response.error || 'Erro ao buscar histórico');
      }

    } catch (error) {
      console.error('❌ [useMLCredits] Erro ao buscar histórico:', error);
      throw error;
    }
  }, [apiRequest]);

  /**
   * Obter estatísticas de uso
   * @param {string} period - Período das estatísticas
   * @returns {Promise<Array>} Estatísticas de uso
   */
  const getUsageStats = useCallback(async (period = 'month') => {
    try {
      const response = await apiRequest(`/ml-credits/stats?period=${period}`);

      if (response.success) {
        return response.data.stats;
      } else {
        throw new Error(response.error || 'Erro ao buscar estatísticas');
      }

    } catch (error) {
      console.error('❌ [useMLCredits] Erro ao buscar estatísticas:', error);
      throw error;
    }
  }, [apiRequest]);

  /**
   * Calcular dias até o reset
   * @returns {number} Dias até o reset
   */
  const daysUntilReset = useCallback(() => {
    if (!credits.resetDate) return 0;
    
    const resetDate = new Date(credits.resetDate);
    const today = new Date();
    const diffTime = resetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [credits.resetDate]);

  /**
   * Calcular porcentagem de uso
   * @returns {number} Porcentagem de uso (0-100)
   */
  const usagePercentage = useCallback(() => {
    if (credits.total === 0) return 0;
    return Math.round((credits.used / credits.total) * 100);
  }, [credits.used, credits.total]);

  /**
   * Verificar se está próximo do limite
   * @param {number} threshold - Limite em porcentagem (padrão: 80%)
   * @returns {boolean} Se está próximo do limite
   */
  const isNearLimit = useCallback((threshold = 80) => {
    return usagePercentage() >= threshold;
  }, [usagePercentage]);

  /**
   * Obter status dos créditos
   * @returns {string} Status: 'good', 'warning', 'critical', 'empty'
   */
  const getCreditsStatus = useCallback(() => {
    const percentage = usagePercentage();
    
    if (credits.available === 0) return 'empty';
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'good';
  }, [credits.available, usagePercentage]);

  /**
   * Refresh automático dos créditos
   */
  const refreshCredits = useCallback(() => {
    loadCredits();
  }, [loadCredits]);

  // Carregar créditos quando o usuário mudar
  useEffect(() => {
    if (user?.tenantId) {
      loadCredits();
    } else {
      setCredits(initialCreditsState);
    }
  }, [user?.tenantId, loadCredits]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!user?.tenantId) return;

    const interval = setInterval(() => {
      console.log('🔄 [useMLCredits] Auto-refresh dos créditos');
      loadCredits();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user?.tenantId, loadCredits]);

  return {
    // Estado dos créditos
    credits,
    
    // Funções principais
    loadCredits,
    setupCredits,
    refreshCredits,
    
    // Verificações
    hasEnoughCredits,
    isNearLimit,
    getCreditsStatus,
    
    // Estatísticas
    daysUntilReset,
    usagePercentage,
    
    // Histórico e estatísticas
    getUsageHistory,
    getUsageStats,
    
    // Utilitários
    consumeCreditsLocally,
    
    // Estados derivados
    isLoading: credits.loading,
    hasError: !!credits.error,
    error: credits.error,
    needsSetup: credits.needsSetup,
    isConfigured: !credits.needsSetup && credits.plan.name,
    
    // Informações do plano
    planName: credits.plan.name,
    planDisplayName: credits.plan.displayName,
    creditsPerMonth: credits.plan.creditsPerMonth
  };
}
