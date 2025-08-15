/**
 * QUANTUM SYSTEM HOOK - TOIT NEXUS
 * Hook React para integração com o sistema quântico
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useQuantumSystem = () => {
  const [quantumStatus, setQuantumStatus] = useState(null);
  const [quantumMetrics, setQuantumMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const intervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Configuração do axios para APIs quânticas
  const quantumAPI = axios.create({
    baseURL: '/api/quantum',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para tratamento de erros
  quantumAPI.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Quantum API Error:', error);
      return Promise.reject(error);
    }
  );

  /**
   * Carrega status do sistema quântico
   */
  const loadQuantumStatus = useCallback(async () => {
    try {
      const response = await quantumAPI.get('/status');
      setQuantumStatus(response.data.status);
      setIsConnected(true);
      setError(null);
      retryCountRef.current = 0;
      return response.data.status;
    } catch (err) {
      setIsConnected(false);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`Retrying quantum status... Attempt ${retryCountRef.current}`);
        setTimeout(() => loadQuantumStatus(), 2000);
      } else {
        setError(`Falha ao carregar status quântico: ${err.message}`);
      }
      throw err;
    }
  }, []);

  /**
   * Carrega métricas do sistema quântico
   */
  const loadQuantumMetrics = useCallback(async () => {
    try {
      const response = await quantumAPI.get('/metrics');
      setQuantumMetrics(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha ao carregar métricas quânticas: ${err.message}`);
      throw err;
    }
  }, []);

  /**
   * Processa operação quântica universal
   */
  const processQuantumOperation = useCallback(async (operation, data, context = {}) => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/process', {
        operation,
        data,
        context
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha no processamento quântico: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Otimiza workflow com algoritmos quânticos
   */
  const optimizeWorkflow = useCallback(async (workflowData, constraints = {}) => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/workflow/optimize', {
        workflowData,
        constraints
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha na otimização de workflow: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Analisa relatório com inteligência quântica
   */
  const analyzeReport = useCallback(async (reportData, analysisType = 'comprehensive') => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/report/analyze', {
        reportData,
        analysisType
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha na análise de relatório: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Executa query TQL com otimização quântica
   */
  const executeQuantumQuery = useCallback(async (query, database, options = {}) => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/query/execute', {
        query,
        database,
        options
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha na execução de query quântica: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gera insights para dashboard
   */
  const generateDashboardInsights = useCallback(async (dashboardData, userContext = {}) => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/dashboard/insights', {
        dashboardData,
        userContext
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha na geração de insights: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Prioriza tarefas com algoritmos quânticos
   */
  const prioritizeTasks = useCallback(async (tasks, constraints = {}) => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/tasks/prioritize', {
        tasks,
        constraints
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha na priorização de tarefas: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Analisa KPIs com inteligência quântica
   */
  const analyzeKPIs = useCallback(async (kpiData, benchmarks = {}) => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/kpis/analyze', {
        kpiData,
        benchmarks
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha na análise de KPIs: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset do sistema quântico
   */
  const resetQuantumSystem = useCallback(async () => {
    setLoading(true);
    try {
      const response = await quantumAPI.post('/reset');
      
      // Recarregar status após reset
      await loadQuantumStatus();
      await loadQuantumMetrics();
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Falha no reset do sistema quântico: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadQuantumStatus, loadQuantumMetrics]);

  /**
   * Inicia monitoramento em tempo real
   */
  const startRealTimeMonitoring = useCallback((interval = 5000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        await Promise.all([
          loadQuantumStatus(),
          loadQuantumMetrics()
        ]);
      } catch (err) {
        console.error('Real-time monitoring error:', err);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loadQuantumStatus, loadQuantumMetrics]);

  /**
   * Para monitoramento em tempo real
   */
  const stopRealTimeMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Inicialização do sistema quântico
   */
  const initializeQuantumSystem = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadQuantumStatus(),
        loadQuantumMetrics()
      ]);
      setError(null);
    } catch (err) {
      setError(`Falha na inicialização do sistema quântico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [loadQuantumStatus, loadQuantumMetrics]);

  /**
   * Calcula saúde do sistema
   */
  const getSystemHealth = useCallback(() => {
    if (!quantumStatus || !quantumMetrics) return null;

    const coherence = quantumStatus.systemCoherence;
    const entanglement = quantumStatus.networkEntanglement;
    const efficiency = quantumMetrics.systemHealth?.efficiency || 0;
    const successRate = quantumMetrics.metrics?.quantumSuccessRate || 0;

    const overallHealth = (coherence + entanglement + efficiency + successRate) / 4;

    let status = 'excellent';
    if (overallHealth < 0.6) status = 'poor';
    else if (overallHealth < 0.75) status = 'fair';
    else if (overallHealth < 0.9) status = 'good';

    return {
      overall: overallHealth,
      status,
      coherence,
      entanglement,
      efficiency,
      successRate,
      recommendations: generateHealthRecommendations(overallHealth, {
        coherence,
        entanglement,
        efficiency,
        successRate
      })
    };
  }, [quantumStatus, quantumMetrics]);

  /**
   * Gera recomendações de saúde do sistema
   */
  const generateHealthRecommendations = (overallHealth, metrics) => {
    const recommendations = [];

    if (metrics.coherence < 0.8) {
      recommendations.push({
        type: 'coherence',
        message: 'Coerência quântica baixa - considere reset do sistema',
        priority: 'high'
      });
    }

    if (metrics.entanglement < 0.5) {
      recommendations.push({
        type: 'entanglement',
        message: 'Entrelaçamento da rede fraco - verifique conectividade',
        priority: 'medium'
      });
    }

    if (metrics.efficiency < 0.7) {
      recommendations.push({
        type: 'efficiency',
        message: 'Eficiência quântica baixa - otimize algoritmos',
        priority: 'medium'
      });
    }

    if (metrics.successRate < 0.9) {
      recommendations.push({
        type: 'success_rate',
        message: 'Taxa de sucesso baixa - verifique fallbacks clássicos',
        priority: 'low'
      });
    }

    return recommendations;
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    quantumStatus,
    quantumMetrics,
    loading,
    error,
    isConnected,

    // Funções principais
    processQuantumOperation,
    optimizeWorkflow,
    analyzeReport,
    executeQuantumQuery,
    generateDashboardInsights,
    prioritizeTasks,
    analyzeKPIs,

    // Controle do sistema
    resetQuantumSystem,
    initializeQuantumSystem,
    loadQuantumStatus,
    loadQuantumMetrics,

    // Monitoramento
    startRealTimeMonitoring,
    stopRealTimeMonitoring,

    // Utilitários
    getSystemHealth,
    
    // Estado calculado
    systemHealth: getSystemHealth()
  };
};

export default useQuantumSystem;
