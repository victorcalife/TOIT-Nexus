/**
 * TQL SYSTEM HOOK - TOIT NEXUS
 * Hook React para integração com sistema TQL avançado
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useTQLSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Configuração do axios para APIs TQL
  const tqlAPI = axios.create({
    baseURL: '/api/tql',
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para tratamento de erros
  tqlAPI.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code !== 'ERR_CANCELED') {
        console.error('TQL API Error:', error);
      }
      return Promise.reject(error);
    }
  );

  /**
   * Executar query TQL
   */
  const executeQuery = useCallback(async (query, options = {}) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const response = await tqlAPI.post('/execute', {
        query,
        options: {
          quantumProcessing: true,
          timeout: 30000,
          ...options
        }
      }, {
        signal: abortControllerRef.current.signal
      });

      const result = response.data;
      setLastResult(result);

      // Adicionar ao histórico se bem-sucedida
      if (result.success && !queryHistory.some(h => h.query === query)) {
        setQueryHistory(prev => [
          { 
            query, 
            timestamp: new Date().toISOString(),
            executionTime: result.metadata?.executionTime || 0,
            rowCount: result.metadata?.rowCount || 0
          },
          ...prev.slice(0, 49) // Manter apenas 50 entradas
        ]);
      }

      setError(null);
      return result;

    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        const errorMessage = err.response?.data?.error || err.message || 'Erro na execução da query';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [queryHistory]);

  /**
   * Validar query TQL
   */
  const validateQuery = useCallback(async (query) => {
    if (!query || !query.trim()) {
      return { valid: true, errors: [], suggestions: [] };
    }

    // Verificar cache
    const cacheKey = `validate_${query}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < 5000) { // Cache por 5 segundos
        return cached.data;
      }
    }

    try {
      const response = await tqlAPI.post('/validate', { query });
      const result = response.data;

      // Armazenar no cache
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (err) {
      console.error('Validation error:', err);
      return {
        valid: false,
        errors: [err.response?.data?.error || 'Erro na validação'],
        suggestions: []
      };
    }
  }, []);

  /**
   * Obter sugestões de autocomplete
   */
  const getSuggestions = useCallback(async (query, cursorPosition) => {
    try {
      const response = await tqlAPI.post('/suggestions', {
        query,
        cursorPosition
      });

      return response.data.suggestions || { keywords: [], tables: [], fields: [] };

    } catch (err) {
      console.error('Suggestions error:', err);
      return { keywords: [], tables: [], fields: [] };
    }
  }, []);

  /**
   * Converter TQL para SQL
   */
  const convertToSQL = useCallback(async (query) => {
    try {
      const response = await tqlAPI.post('/convert', { query });
      return response.data;

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      throw new Error(`Erro na conversão: ${errorMessage}`);
    }
  }, []);

  /**
   * Explicar plano de execução
   */
  const explainQuery = useCallback(async (query, options = {}) => {
    setLoading(true);
    try {
      const response = await tqlAPI.post('/explain', { query, options });
      return response.data.explanation;

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      throw new Error(`Erro no explain: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Salvar query nos favoritos
   */
  const saveFavorite = useCallback(async (name, query, description = '') => {
    try {
      const response = await tqlAPI.post('/favorites', {
        name,
        query,
        description
      });

      const newFavorite = response.data.favorite;
      setFavorites(prev => [newFavorite, ...prev]);

      return newFavorite;

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      throw new Error(`Erro ao salvar favorito: ${errorMessage}`);
    }
  }, []);

  /**
   * Carregar favoritos
   */
  const loadFavorites = useCallback(async () => {
    try {
      const response = await tqlAPI.get('/favorites');
      setFavorites(response.data.favorites || []);

    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, []);

  /**
   * Carregar histórico
   */
  const loadHistory = useCallback(async (limit = 50) => {
    try {
      const response = await tqlAPI.get('/history', {
        params: { limit }
      });

      setQueryHistory(response.data.history || []);

    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, []);

  /**
   * Carregar tabelas disponíveis
   */
  const loadTables = useCallback(async () => {
    try {
      const response = await tqlAPI.get('/tables');
      setTables(response.data.tables || []);

    } catch (err) {
      console.error('Error loading tables:', err);
    }
  }, []);

  /**
   * Obter campos de uma tabela
   */
  const getTableFields = useCallback(async (tableName) => {
    try {
      const response = await tqlAPI.get(`/tables/${tableName}/fields`);
      return response.data.fields || [];

    } catch (err) {
      console.error('Error loading table fields:', err);
      return [];
    }
  }, []);

  /**
   * Carregar estatísticas
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await tqlAPI.get('/stats');
      setStats(response.data.stats);

    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  /**
   * Limpar cache
   */
  const clearCache = useCallback(async () => {
    try {
      await tqlAPI.post('/cache/clear');
      cacheRef.current.clear();
      return true;

    } catch (err) {
      console.error('Error clearing cache:', err);
      return false;
    }
  }, []);

  /**
   * Cancelar query em execução
   */
  const cancelQuery = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  /**
   * Obter templates de query
   */
  const getQueryTemplates = useCallback(() => {
    return [
      {
        name: 'Consulta Básica',
        template: 'MOSTRAR * DE {tabela} ONDE {campo} IGUAL "{valor}"',
        description: 'Consulta simples com filtro',
        category: 'basic'
      },
      {
        name: 'Agregação com Agrupamento',
        template: 'SOMAR {campo} DE {tabela} AGRUPADO POR {categoria}',
        description: 'Soma valores agrupados por categoria',
        category: 'aggregation'
      },
      {
        name: 'JOIN Entre Tabelas',
        template: 'MOSTRAR a.{campo1}, b.{campo2} DE {tabela1} a JUNTAR_INTERNO {tabela2} b EM a.id IGUAL b.id',
        description: 'Unir dados de duas tabelas',
        category: 'join'
      },
      {
        name: 'Top N Registros',
        template: 'RANKING {campo} DE {tabela} ORDENADO POR {campo} DESC LIMITE {n}',
        description: 'Obter os N maiores valores',
        category: 'ranking'
      },
      {
        name: 'Análise Temporal',
        template: 'CONTAR * DE {tabela} ONDE {data} ENTRE DIA(-30) E HOJE AGRUPADO POR DIA({data})',
        description: 'Análise de dados por período',
        category: 'temporal'
      },
      {
        name: 'Busca com LIKE',
        template: 'MOSTRAR * DE {tabela} ONDE {campo} TEM "{texto}"',
        description: 'Busca por texto parcial',
        category: 'search'
      },
      {
        name: 'Subconsulta',
        template: 'MOSTRAR * DE {tabela1} ONDE {campo} DENTRO (MOSTRAR {campo} DE {tabela2} ONDE {condicao})',
        description: 'Query com subconsulta',
        category: 'advanced'
      },
      {
        name: 'Análise Estatística',
        template: 'MOSTRAR MEDIA({campo}), DESVIO_PADRAO({campo}), MIN({campo}), MAX({campo}) DE {tabela}',
        description: 'Estatísticas descritivas',
        category: 'statistics'
      }
    ];
  }, []);

  /**
   * Formatar resultado para exibição
   */
  const formatResult = useCallback((result) => {
    if (!result || !result.success) {
      return null;
    }

    return {
      data: result.data || [],
      metadata: {
        rowCount: result.metadata?.rowCount || 0,
        executionTime: result.metadata?.executionTime || 0,
        sql: result.metadata?.sql || '',
        optimizations: result.metadata?.optimizations || [],
        quantumEnhanced: result.metadata?.quantumEnhanced || false
      },
      quantumEnhancements: result.quantumEnhancements || null
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadTables();
    loadFavorites();
    loadHistory();
    loadStats();
  }, [loadTables, loadFavorites, loadHistory, loadStats]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cacheRef.current.clear();
    };
  }, []);

  return {
    // Estado
    loading,
    error,
    queryHistory,
    favorites,
    tables,
    stats,
    lastResult: formatResult(lastResult),

    // Funções principais
    executeQuery,
    validateQuery,
    getSuggestions,
    convertToSQL,
    explainQuery,

    // Gerenciamento de favoritos
    saveFavorite,
    loadFavorites,

    // Gerenciamento de dados
    loadHistory,
    loadTables,
    getTableFields,
    loadStats,

    // Utilitários
    clearCache,
    cancelQuery,
    getQueryTemplates,

    // Estado de controle
    isExecuting: loading,
    hasError: !!error
  };
};

export default useTQLSystem;
