/**
 * CONFIGURAÇÃO DO SISTEMA QUANTUM ML
 * Todas as configurações relacionadas ao Machine Learning
 * 100% JavaScript - SEM TYPESCRIPT
 */

const ML_CONFIG = {
  // PLANOS DE ASSINATURA
  PLANS: {
    STANDARD: {
      name: 'standard',
      displayName: 'NEXUS Standard',
      maxScheduledWorkflows: 5,
      mlCreditsPerMonth: 0, // Apenas predições automáticas
      autoPredictionsPerDay: 3,
      features: [
        'workflows_basic',
        'dashboards_basic',
        'reports_basic',
        'auto_predictions'
      ]
    },
    QUANTUM_PLUS: {
      name: 'quantum_plus',
      displayName: 'NEXUS Quantum Plus',
      maxScheduledWorkflows: 15,
      mlCreditsPerMonth: 5,
      autoPredictionsPerDay: 6,
      features: [
        'workflows_advanced',
        'dashboards_advanced',
        'reports_advanced',
        'auto_predictions',
        'manual_insights',
        'api_predictions'
      ]
    },
    QUANTUM_PREMIUM: {
      name: 'quantum_premium',
      displayName: 'NEXUS Quantum Premium',
      maxScheduledWorkflows: 30,
      mlCreditsPerMonth: 15,
      autoPredictionsPerDay: 12,
      features: [
        'workflows_premium',
        'dashboards_premium',
        'reports_premium',
        'auto_predictions',
        'manual_insights',
        'api_unlimited',
        'real_time_alerts',
        'dedicated_support'
      ]
    }
  },

  // TIPOS DE INSIGHTS ML
  INSIGHT_TYPES: {
    PREDICTION: {
      name: 'prediction',
      displayName: 'Predição',
      description: 'Previsões baseadas em dados históricos',
      creditsRequired: 1,
      processingTime: 2000 // ms
    },
    OPTIMIZATION: {
      name: 'optimization',
      displayName: 'Otimização',
      description: 'Sugestões para melhorar performance',
      creditsRequired: 1,
      processingTime: 3000
    },
    ANOMALY: {
      name: 'anomaly',
      displayName: 'Detecção de Anomalias',
      description: 'Identificar padrões incomuns nos dados',
      creditsRequired: 1,
      processingTime: 2500
    },
    SEGMENTATION: {
      name: 'segmentation',
      displayName: 'Segmentação',
      description: 'Agrupar dados por similaridade',
      creditsRequired: 2,
      processingTime: 4000
    },
    RECOMMENDATION: {
      name: 'recommendation',
      displayName: 'Recomendações',
      description: 'Sugestões personalizadas baseadas em ML',
      creditsRequired: 1,
      processingTime: 2000
    }
  },

  // PREDIÇÕES AUTOMÁTICAS
  AUTO_PREDICTIONS: {
    SALES_FORECAST: {
      name: 'sales_forecast',
      displayName: 'Previsão de Vendas',
      description: 'Predição de vendas para próximos períodos',
      defaultSchedule: 'daily',
      requiredData: [ 'sales_history', 'date_range' ]
    },
    CHURN_PREDICTION: {
      name: 'churn_prediction',
      displayName: 'Predição de Churn',
      description: 'Probabilidade de cancelamento de clientes',
      defaultSchedule: 'weekly',
      requiredData: [ 'customer_activity', 'subscription_data' ]
    },
    DEMAND_FORECAST: {
      name: 'demand_forecast',
      displayName: 'Previsão de Demanda',
      description: 'Demanda futura de produtos/serviços',
      defaultSchedule: 'daily',
      requiredData: [ 'product_sales', 'seasonal_data' ]
    },
    CASH_FLOW: {
      name: 'cash_flow',
      displayName: 'Fluxo de Caixa',
      description: 'Projeção de entradas e saídas financeiras',
      defaultSchedule: 'weekly',
      requiredData: [ 'financial_history', 'recurring_transactions' ]
    }
  },

  // CONFIGURAÇÕES TÉCNICAS
  TECHNICAL: {
    // Timeout para processamento ML (ms)
    PROCESSING_TIMEOUT: 30000,

    // Máximo de dados para processar por vez
    MAX_DATA_POINTS: 10000,

    // Cache de resultados (minutos)
    CACHE_DURATION: 60,

    // Retry em caso de falha
    MAX_RETRIES: 3,

    // Intervalo entre retries (ms)
    RETRY_INTERVAL: 1000
  },

  // MENSAGENS E TEXTOS
  MESSAGES: {
    INSUFFICIENT_CREDITS: 'Créditos ML insuficientes para esta operação',
    PROCESSING_ERROR: 'Erro no processamento do insight ML',
    INVALID_DATA: 'Dados insuficientes ou inválidos para análise ML',
    SUCCESS: 'Insight ML gerado com sucesso',
    CREDITS_CONSUMED: 'Créditos ML consumidos: {amount}',
    CREDITS_REMAINING: 'Créditos restantes: {amount}'
  },

  // VALIDAÇÕES
  VALIDATION: {
    MIN_DATA_POINTS: 10,
    MAX_DATA_POINTS: 10000,
    REQUIRED_FIELDS: [ 'date', 'value' ],
    SUPPORTED_FORMATS: [ 'json', 'csv' ]
  }
};

module.exports = ML_CONFIG;
