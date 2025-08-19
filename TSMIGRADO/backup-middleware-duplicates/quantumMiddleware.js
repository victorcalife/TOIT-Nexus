/**
 * QUANTUM MIDDLEWARE - TOIT NEXUS
 * Middleware para interceptar e otimizar todas as operações do sistema
 * com inteligência quântica
 */

const QuantumIntegrator = require('../services/quantum/QuantumIntegrator');
const { performance } = require('perf_hooks');

class QuantumMiddleware {
  constructor() {
    this.quantumIntegrator = new QuantumIntegrator();
    this.enabledRoutes = new Set([
      '/api/workflows',
      '/api/reports',
      '/api/queries',
      '/api/dashboards',
      '/api/tasks',
      '/api/kpis',
      '/api/indicators'
    ]);
    this.quantumOperations = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Middleware principal para interceptação quântica
   */
  quantumInterceptor() {
    return async (req, res, next) => {
      const startTime = performance.now();
      
      try {
        // Verificar se a rota deve ser otimizada quanticamente
        if (!this.shouldApplyQuantumOptimization(req)) {
          return next();
        }

        // Extrair dados da requisição
        const operationData = this.extractOperationData(req);
        
        // Classificar tipo de operação
        const operationType = this.classifyOperation(req.path, req.method, operationData);
        
        // Aplicar pré-processamento quântico
        const quantumContext = await this.prepareQuantumContext(req, operationData);
        
        // Interceptar resposta para pós-processamento
        const originalSend = res.send;
        res.send = async (data) => {
          try {
            // Aplicar otimização quântica na resposta
            const optimizedData = await this.applyQuantumOptimization(
              operationType,
              data,
              quantumContext
            );
            
            // Registrar métricas
            await this.recordQuantumMetrics(req, operationType, startTime, optimizedData);
            
            // Enviar resposta otimizada
            originalSend.call(res, optimizedData);
            
          } catch (error) {
            console.error('❌ Quantum post-processing error:', error);
            // Fallback para resposta original
            originalSend.call(res, data);
          }
        };
        
        next();
        
      } catch (error) {
        console.error('❌ Quantum middleware error:', error);
        next();
      }
    };
  }

  /**
   * Verifica se deve aplicar otimização quântica
   */
  shouldApplyQuantumOptimization(req) {
    // Verificar rota
    const routeMatch = Array.from(this.enabledRoutes).some(route => 
      req.path.startsWith(route)
    );
    
    if (!routeMatch) return false;
    
    // Verificar método HTTP
    if (!['GET', 'POST', 'PUT', 'PATCH'].includes(req.method)) {
      return false;
    }
    
    // Verificar header de otimização quântica
    if (req.headers['x-quantum-optimization'] === 'false') {
      return false;
    }
    
    // Verificar tamanho dos dados (otimizar apenas operações significativas)
    const dataSize = this.estimateDataSize(req.body);
    if (dataSize < 100) { // Menos de 100 bytes
      return false;
    }
    
    return true;
  }

  /**
   * Extrai dados da operação
   */
  extractOperationData(req) {
    const data = {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers,
      user: req.user,
      tenant: req.user?.tenant || 'default'
    };
    
    return data;
  }

  /**
   * Classifica tipo de operação
   */
  classifyOperation(path, method, data) {
    if (path.includes('/workflows')) return 'workflow';
    if (path.includes('/reports')) return 'report';
    if (path.includes('/queries') || path.includes('/tql')) return 'query';
    if (path.includes('/dashboards')) return 'dashboard';
    if (path.includes('/tasks')) return 'task';
    if (path.includes('/kpis')) return 'kpi';
    if (path.includes('/indicators')) return 'indicator';
    
    return 'generic';
  }

  /**
   * Prepara contexto quântico
   */
  async prepareQuantumContext(req, operationData) {
    const context = {
      user: req.user,
      tenant: req.user?.tenant || 'default',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || this.generateRequestId(),
      optimization: {
        enabled: true,
        algorithms: ['QAOA', 'Grover', 'SQD'],
        fallbackToClassical: true
      },
      performance: {
        maxProcessingTime: 5000, // 5 segundos
        targetSpeedup: 2.0,
        minConfidence: 0.8
      }
    };
    
    // Adicionar contexto específico baseado no tipo de operação
    if (operationData.path.includes('/workflows')) {
      context.constraints = {
        maxExecutionTime: 3600,
        resourceLimits: req.body?.resourceLimits || {},
        priorityWeights: req.body?.priorityWeights || { time: 0.4, cost: 0.3, quality: 0.3 }
      };
    }
    
    if (operationData.path.includes('/reports')) {
      context.analysisType = req.query?.analysisType || 'comprehensive';
      context.timeRange = req.query?.timeRange || '30d';
    }
    
    if (operationData.path.includes('/queries')) {
      context.database = req.body?.database || { estimatedSize: 1000 };
      context.options = req.body?.options || {};
    }
    
    return context;
  }

  /**
   * Aplica otimização quântica
   */
  async applyQuantumOptimization(operationType, responseData, context) {
    try {
      // Parse da resposta se for string
      let data = responseData;
      if (typeof responseData === 'string') {
        try {
          data = JSON.parse(responseData);
        } catch (e) {
          return responseData; // Retornar original se não for JSON
        }
      }
      
      // Verificar se já foi otimizado
      if (data.quantumOptimized) {
        return responseData;
      }
      
      // Preparar operação para o integrador quântico
      const operation = {
        type: operationType,
        action: 'optimize_response',
        data: data
      };
      
      // Aplicar otimização quântica
      const quantumResult = await this.quantumIntegrator.processQuantumOperation(
        operation,
        data,
        context
      );
      
      // Construir resposta otimizada
      const optimizedResponse = {
        ...data,
        quantumOptimized: true,
        quantumMetrics: quantumResult.quantumMetrics,
        quantumEnhancements: quantumResult.quantumEnhancements,
        originalProcessingTime: data.processingTime || 0,
        quantumProcessingTime: quantumResult.quantumMetrics.processingTime,
        quantumAdvantage: quantumResult.quantumMetrics.quantumAdvantage,
        recommendations: quantumResult.recommendations
      };
      
      // Se houve melhoria significativa, usar resultado quântico
      if (quantumResult.quantumMetrics.quantumAdvantage.speedup > 1.2) {
        optimizedResponse.data = quantumResult.result;
        optimizedResponse.quantumImprovement = true;
      }
      
      return typeof responseData === 'string' ? 
        JSON.stringify(optimizedResponse) : 
        optimizedResponse;
        
    } catch (error) {
      console.error('❌ Quantum optimization error:', error);
      
      // Adicionar informação de fallback
      const fallbackResponse = typeof responseData === 'string' ? 
        JSON.parse(responseData) : responseData;
        
      fallbackResponse.quantumOptimized = false;
      fallbackResponse.quantumError = error.message;
      fallbackResponse.fallbackToClassical = true;
      
      return typeof responseData === 'string' ? 
        JSON.stringify(fallbackResponse) : 
        fallbackResponse;
    }
  }

  /**
   * Registra métricas quânticas
   */
  async recordQuantumMetrics(req, operationType, startTime, optimizedData) {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    const metrics = {
      requestId: req.headers['x-request-id'] || this.generateRequestId(),
      operationType,
      path: req.path,
      method: req.method,
      tenant: req.user?.tenant || 'default',
      user: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      processingTime: totalTime,
      quantumOptimized: optimizedData?.quantumOptimized || false,
      quantumAdvantage: optimizedData?.quantumAdvantage || { speedup: 1, efficiency: 0.8 },
      dataSize: this.estimateDataSize(optimizedData),
      success: true
    };
    
    // Armazenar métricas
    this.performanceMetrics.set(metrics.requestId, metrics);
    
    // Manter apenas as últimas 1000 métricas
    if (this.performanceMetrics.size > 1000) {
      const firstKey = this.performanceMetrics.keys().next().value;
      this.performanceMetrics.delete(firstKey);
    }
    
    // Log para monitoramento
    if (metrics.quantumOptimized && metrics.quantumAdvantage.speedup > 1.5) {
      console.log(`🚀 Quantum optimization success: ${operationType} - ${metrics.quantumAdvantage.speedup.toFixed(2)}x speedup`);
    }
  }

  /**
   * Estima tamanho dos dados
   */
  estimateDataSize(data) {
    if (!data) return 0;
    
    try {
      return JSON.stringify(data).length;
    } catch (e) {
      return String(data).length;
    }
  }

  /**
   * Gera ID único para requisição
   */
  generateRequestId() {
    return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Middleware para injeção de headers quânticos
   */
  quantumHeaders() {
    return (req, res, next) => {
      // Adicionar headers quânticos
      res.setHeader('X-Quantum-System', 'TOIT-NEXUS-2.0');
      res.setHeader('X-Quantum-Algorithms', 'QAOA,Grover,SQD,Portfolio');
      res.setHeader('X-Quantum-Status', this.quantumIntegrator.systemCoherence.toFixed(3));
      
      // Adicionar CORS para APIs quânticas
      res.setHeader('Access-Control-Expose-Headers', 'X-Quantum-System,X-Quantum-Algorithms,X-Quantum-Status,X-Quantum-Metrics');
      
      next();
    };
  }

  /**
   * Middleware para métricas de performance
   */
  performanceMonitoring() {
    return (req, res, next) => {
      const startTime = performance.now();
      
      // Interceptar fim da resposta
      const originalEnd = res.end;
      res.end = function(...args) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Adicionar header de performance
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
        
        // Adicionar métricas quânticas se disponíveis
        if (res.locals.quantumMetrics) {
          res.setHeader('X-Quantum-Speedup', res.locals.quantumMetrics.speedup || '1.0');
          res.setHeader('X-Quantum-Confidence', res.locals.quantumMetrics.confidence || '0.95');
        }
        
        originalEnd.apply(this, args);
      };
      
      next();
    };
  }

  /**
   * Obtém métricas de performance
   */
  getPerformanceMetrics() {
    const metrics = Array.from(this.performanceMetrics.values());
    
    const summary = {
      totalRequests: metrics.length,
      quantumOptimized: metrics.filter(m => m.quantumOptimized).length,
      averageSpeedup: 0,
      averageProcessingTime: 0,
      operationTypes: {},
      last24Hours: metrics.filter(m => 
        new Date(m.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };
    
    if (metrics.length > 0) {
      summary.averageSpeedup = metrics
        .filter(m => m.quantumOptimized)
        .reduce((sum, m) => sum + (m.quantumAdvantage.speedup || 1), 0) / 
        Math.max(1, summary.quantumOptimized);
        
      summary.averageProcessingTime = metrics
        .reduce((sum, m) => sum + m.processingTime, 0) / metrics.length;
    }
    
    // Agrupar por tipo de operação
    metrics.forEach(m => {
      if (!summary.operationTypes[m.operationType]) {
        summary.operationTypes[m.operationType] = {
          count: 0,
          quantumOptimized: 0,
          averageSpeedup: 0
        };
      }
      
      summary.operationTypes[m.operationType].count++;
      if (m.quantumOptimized) {
        summary.operationTypes[m.operationType].quantumOptimized++;
        summary.operationTypes[m.operationType].averageSpeedup += m.quantumAdvantage.speedup || 1;
      }
    });
    
    // Calcular médias por tipo
    Object.keys(summary.operationTypes).forEach(type => {
      const typeData = summary.operationTypes[type];
      if (typeData.quantumOptimized > 0) {
        typeData.averageSpeedup /= typeData.quantumOptimized;
      }
    });
    
    return summary;
  }

  /**
   * Reset das métricas
   */
  resetMetrics() {
    this.performanceMetrics.clear();
    console.log('🔄 Quantum middleware metrics reset');
  }
}

// Instância singleton
const quantumMiddleware = new QuantumMiddleware();

module.exports = {
  quantumInterceptor: quantumMiddleware.quantumInterceptor.bind(quantumMiddleware),
  quantumHeaders: quantumMiddleware.quantumHeaders.bind(quantumMiddleware),
  performanceMonitoring: quantumMiddleware.performanceMonitoring.bind(quantumMiddleware),
  getPerformanceMetrics: quantumMiddleware.getPerformanceMetrics.bind(quantumMiddleware),
  resetMetrics: quantumMiddleware.resetMetrics.bind(quantumMiddleware),
  quantumMiddleware
};
