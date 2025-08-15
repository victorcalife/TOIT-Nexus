/**
 * NO-CODE SYSTEM HOOK - TOIT NEXUS
 * Hook React para integração com funcionalidades no-code
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useNoCodeSystem = () => {
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cacheRef = useRef(new Map());

  // Configuração do axios para APIs no-code
  const noCodeAPI = axios.create({
    baseURL: '/api/nocode',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para tratamento de erros
  noCodeAPI.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('No-Code API Error:', error);
      return Promise.reject(error);
    }
  );

  /**
   * WORKFLOW FUNCTIONS
   */

  // Criar workflow
  const createWorkflow = useCallback(async (workflowData) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post('/workflows', workflowData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to create workflow: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Executar workflow
  const executeWorkflow = useCallback(async (workflowId, inputs = {}) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post(`/workflows/${workflowId}/execute`, { inputs });
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to execute workflow: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DASHBOARD FUNCTIONS
   */

  // Criar dashboard
  const createDashboard = useCallback(async (dashboardData) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post('/dashboards', dashboardData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to create dashboard: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter dados do dashboard
  const getDashboardData = useCallback(async (dashboardId, widgetId = null, query = null) => {
    const cacheKey = `dashboard_${dashboardId}_${widgetId}_${query}`;
    
    // Verificar cache
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // Cache por 30 segundos
        return cached.data;
      }
    }

    setLoading(true);
    try {
      const response = await noCodeAPI.get(`/dashboards/${dashboardId}/data`, {
        params: { widgetId, query }
      });
      
      // Armazenar no cache
      cacheRef.current.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to get dashboard data: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * FORM FUNCTIONS
   */

  // Criar formulário
  const createForm = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post('/forms', formData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to create form: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submeter formulário
  const submitForm = useCallback(async (formId, formData) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post(`/forms/${formId}/submit`, formData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to submit form: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * REPORT FUNCTIONS
   */

  // Criar relatório
  const createReport = useCallback(async (reportData) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post('/reports', reportData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to create report: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Gerar relatório
  const generateReport = useCallback(async (reportId, filters = {}, format = 'json') => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post(`/reports/${reportId}/generate`, {
        filters,
        format
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * COMPONENT LIBRARY FUNCTIONS
   */

  // Carregar biblioteca de componentes
  const loadComponentLibrary = useCallback(async () => {
    try {
      const response = await noCodeAPI.get('/components');
      setComponents(response.data.library);
      setError(null);
      return response.data.library;
    } catch (err) {
      setError(`Failed to load component library: ${err.message}`);
      throw err;
    }
  }, []);

  // Testar componente
  const testComponent = useCallback(async (componentType, config, testData) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post(`/components/${componentType}/test`, {
        config,
        testData
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to test component: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * TEMPLATE FUNCTIONS
   */

  // Carregar templates
  const loadTemplates = useCallback(async (category = null) => {
    try {
      const response = await noCodeAPI.get('/templates', {
        params: { category }
      });
      setTemplates(response.data.templates);
      setError(null);
      return response.data.templates;
    } catch (err) {
      setError(`Failed to load templates: ${err.message}`);
      throw err;
    }
  }, []);

  // Aplicar template
  const applyTemplate = useCallback(async (templateId, customization = {}) => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post(`/templates/${templateId}/apply`, {
        customization
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to apply template: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * OPTIMIZATION FUNCTIONS
   */

  // Otimizar aplicação
  const optimizeApplication = useCallback(async (applicationId, optimizationType = 'performance') => {
    setLoading(true);
    try {
      const response = await noCodeAPI.post('/optimize', {
        applicationId,
        optimizationType
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Failed to optimize application: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * PROJECT MANAGEMENT FUNCTIONS
   */

  // Salvar projeto
  const saveProject = useCallback(async (projectData) => {
    setLoading(true);
    try {
      let response;
      
      switch (projectData.type) {
        case 'workflow':
          response = await createWorkflow(projectData);
          break;
        case 'dashboard':
          response = await createDashboard(projectData);
          break;
        case 'form':
          response = await createForm(projectData);
          break;
        case 'report':
          response = await createReport(projectData);
          break;
        default:
          throw new Error(`Unknown project type: ${projectData.type}`);
      }
      
      // Atualizar lista de projetos
      setProjects(prev => {
        const existing = prev.find(p => p.id === projectData.id);
        if (existing) {
          return prev.map(p => p.id === projectData.id ? { ...p, ...projectData } : p);
        } else {
          return [...prev, { ...projectData, ...response }];
        }
      });
      
      setError(null);
      return response;
    } catch (err) {
      setError(`Failed to save project: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createWorkflow, createDashboard, createForm, createReport]);

  // Carregar projetos
  const loadProjects = useCallback(async () => {
    try {
      // Simular carregamento de projetos (em produção, seria uma API real)
      const mockProjects = [
        {
          id: 1,
          name: 'Sales Dashboard',
          type: 'dashboard',
          status: 'active',
          quantumOptimized: true,
          lastModified: new Date().toISOString(),
          performance: 95
        },
        {
          id: 2,
          name: 'Approval Workflow',
          type: 'workflow',
          status: 'active',
          quantumOptimized: true,
          lastModified: new Date().toISOString(),
          performance: 88
        }
      ];
      
      setProjects(mockProjects);
      setError(null);
      return mockProjects;
    } catch (err) {
      setError(`Failed to load projects: ${err.message}`);
      throw err;
    }
  }, []);

  // Deletar projeto
  const deleteProject = useCallback(async (projectId) => {
    try {
      // Simular deleção (em produção, seria uma API real)
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setError(null);
      return true;
    } catch (err) {
      setError(`Failed to delete project: ${err.message}`);
      throw err;
    }
  }, []);

  /**
   * UTILITY FUNCTIONS
   */

  // Validar configuração
  const validateConfiguration = useCallback((type, config) => {
    const errors = [];
    
    switch (type) {
      case 'workflow':
        if (!config.nodes || config.nodes.length === 0) {
          errors.push('Workflow must have at least one node');
        }
        break;
      
      case 'dashboard':
        if (!config.widgets || config.widgets.length === 0) {
          errors.push('Dashboard must have at least one widget');
        }
        break;
      
      case 'form':
        if (!config.fields || config.fields.length === 0) {
          errors.push('Form must have at least one field');
        }
        break;
      
      case 'report':
        if (!config.elements || config.elements.length === 0) {
          errors.push('Report must have at least one element');
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }, []);

  // Limpar cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Inicialização
  useEffect(() => {
    loadComponentLibrary();
    loadTemplates();
    loadProjects();
  }, [loadComponentLibrary, loadTemplates, loadProjects]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    // Estado
    projects,
    components,
    templates,
    loading,
    error,

    // Workflow functions
    createWorkflow,
    executeWorkflow,

    // Dashboard functions
    createDashboard,
    getDashboardData,

    // Form functions
    createForm,
    submitForm,

    // Report functions
    createReport,
    generateReport,

    // Component library functions
    loadComponentLibrary,
    testComponent,

    // Template functions
    loadTemplates,
    applyTemplate,

    // Optimization functions
    optimizeApplication,

    // Project management functions
    saveProject,
    loadProjects,
    deleteProject,

    // Utility functions
    validateConfiguration,
    clearCache
  };
};

export default useNoCodeSystem;
