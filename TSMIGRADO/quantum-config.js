/**
 * CONFIGURAÇÃO COMPLETA DO SISTEMA QUANTUM
 * Sistema de slots ML + gestão de storage por plano
 * 100% JavaScript - SEM TYPESCRIPT
 */

const QUANTUM_CONFIG = {
  // PLANOS DE ASSINATURA ATUALIZADOS
  PLANS: {
    STANDARD: {
      name: 'standard',
      displayName: 'NEXUS Standard',
      price: 79.00,
      currency: 'BRL',

      // SLOTS ML (apenas predições automáticas)
      mlSlots: 0, // Sem slots ML manuais, apenas predições automáticas

      // STORAGE E RECURSOS
      storage: {
        total: 500 * 1024 * 1024, // 500MB total
        uploads: 250 * 1024 * 1024, // 250MB para uploads
        database: 125 * 1024 * 1024, // 125MB para dados (queries, reports)
        cache: 62 * 1024 * 1024, // 62MB para cache
        logs: 31 * 1024 * 1024, // 31MB para logs
        emails: 16 * 1024 * 1024, // 16MB para emails
        calendar: 8 * 1024 * 1024, // 8MB para calendário
        chat: 8 * 1024 * 1024 // 8MB para chat
      },

      // LIMITES FUNCIONAIS
      limits: {
        workflows: 10,
        dashboards: 15,
        reports: 30,
        users: 5,
        apiCallsPerDay: 2000,
        emailsPerDay: 100,
        automationsPerDay: 20
      },

      features: [
        'workflows_basic',
        'dashboards_basic',
        'reports_basic',
        'auto_predictions',
        'storage_500mb',
        'support_email'
      ]
    },

    QUANTUM_PLUS: {
      name: 'quantum_plus',
      displayName: 'NEXUS Quantum Plus',
      price: 149.00,
      currency: 'BRL',

      // SLOTS ML (predições automáticas + 5 slots ML)
      mlSlots: 5, // Predições automáticas + 5 slots ML manuais

      // STORAGE E RECURSOS
      storage: {
        total: 2 * 1024 * 1024 * 1024, // 2GB total
        uploads: 1024 * 1024 * 1024, // 1GB para uploads
        database: 512 * 1024 * 1024, // 512MB para dados
        cache: 256 * 1024 * 1024, // 256MB para cache
        logs: 128 * 1024 * 1024, // 128MB para logs
        emails: 64 * 1024 * 1024, // 64MB para emails
        calendar: 32 * 1024 * 1024, // 32MB para calendário
        chat: 32 * 1024 * 1024 // 32MB para chat
      },

      // LIMITES FUNCIONAIS
      limits: {
        workflows: 20,
        dashboards: 30,
        reports: 60,
        users: 10,
        apiCallsPerDay: 5000,
        emailsPerDay: 300,
        automationsPerDay: 50
      },

      features: [
        'workflows_advanced',
        'dashboards_advanced',
        'reports_advanced',
        'auto_predictions',
        'manual_insights',
        'api_predictions',
        'ml_slots_5',
        'storage_2gb',
        'support_priority',
        'custom_integrations'
      ]
    },

    QUANTUM_PREMIUM: {
      name: 'quantum_premium',
      displayName: 'NEXUS Quantum Premium',
      price: 229.00,
      currency: 'BRL',

      // SLOTS ML (predições automáticas + 10 slots ML)
      mlSlots: 10, // Predições automáticas + 10 slots ML manuais

      // STORAGE E RECURSOS
      storage: {
        total: 5 * 1024 * 1024 * 1024, // 5GB total
        uploads: 2.5 * 1024 * 1024 * 1024, // 2.5GB para uploads
        database: 1024 * 1024 * 1024, // 1GB para dados
        cache: 512 * 1024 * 1024, // 512MB para cache
        logs: 256 * 1024 * 1024, // 256MB para logs
        emails: 128 * 1024 * 1024, // 128MB para emails
        calendar: 64 * 1024 * 1024, // 64MB para calendário
        chat: 64 * 1024 * 1024 // 64MB para chat
      },

      // LIMITES FUNCIONAIS
      limits: {
        workflows: 30,
        dashboards: 50,
        reports: 100,
        users: 25,
        apiCallsPerDay: 10000,
        emailsPerDay: 1000,
        automationsPerDay: 100
      },

      features: [
        'workflows_premium',
        'dashboards_premium',
        'reports_premium',
        'auto_predictions',
        'manual_insights',
        'api_unlimited',
        'ml_slots_10',
        'storage_5gb',
        'real_time_alerts',
        'dedicated_support',
        'custom_integrations',
        'advanced_analytics',
        'white_label'
      ]
    }
  },

  // TIPOS DE SLOTS ML DISPONÍVEIS
  ML_SLOT_TYPES: {
    tql_query: {
      name: 'TQL Query ML',
      description: 'ML integrado em consultas TQL',
      icon: 'database',
      category: 'data'
    },
    report_column: {
      name: 'Coluna Inteligente',
      description: 'ML aplicado em colunas de relatórios',
      icon: 'file-text',
      category: 'reports'
    },
    workflow_step: {
      name: 'Etapa ML',
      description: 'ML em workflows automáticos',
      icon: 'workflow',
      category: 'automation'
    },
    dashboard_widget: {
      name: 'Widget Preditivo',
      description: 'Widgets com insights ML em dashboards',
      icon: 'bar-chart',
      category: 'visualization'
    },
    auto_prediction: {
      name: 'Predição Agendada',
      description: 'Predições automáticas agendadas',
      icon: 'clock',
      category: 'automation'
    },
    email_trigger: {
      name: 'Email Inteligente',
      description: 'ML em triggers e conteúdo de email',
      icon: 'mail',
      category: 'communication'
    },
    form_validation: {
      name: 'Validação ML',
      description: 'Validação inteligente de formulários',
      icon: 'check-circle',
      category: 'validation'
    },
    data_enrichment: {
      name: 'Enriquecimento',
      description: 'Enriquecimento automático de dados',
      icon: 'plus-circle',
      category: 'data'
    },
    anomaly_monitor: {
      name: 'Monitor de Anomalias',
      description: 'Monitoramento contínuo de anomalias',
      icon: 'shield',
      category: 'monitoring'
    },
    smart_notification: {
      name: 'Notificação ML',
      description: 'Notificações baseadas em ML',
      icon: 'bell',
      category: 'communication'
    }
  },

  // TIPOS DE INSIGHTS ML
  INSIGHT_TYPES: {
    prediction: {
      name: 'Predição',
      description: 'Análise preditiva baseada em dados históricos',
      processingTime: 2000,
      icon: 'trending-up'
    },
    optimization: {
      name: 'Otimização',
      description: 'Identificação de oportunidades de melhoria',
      processingTime: 1500,
      icon: 'zap'
    },
    anomaly: {
      name: 'Detecção de Anomalias',
      description: 'Identificação de padrões incomuns',
      processingTime: 1800,
      icon: 'alert-triangle'
    },
    segmentation: {
      name: 'Segmentação',
      description: 'Agrupamento inteligente de dados',
      processingTime: 2200,
      icon: 'pie-chart'
    },
    recommendation: {
      name: 'Recomendações',
      description: 'Sugestões baseadas em análise de dados',
      processingTime: 1700,
      icon: 'lightbulb'
    }
  },

  // CATEGORIAS DE STORAGE
  STORAGE_CATEGORIES: {
    uploads: {
      name: 'Uploads',
      description: 'Arquivos enviados pelos usuários',
      extensions: [ '.jpg', '.png', '.pdf', '.doc', '.xls', '.csv' ]
    },
    database: {
      name: 'Banco de Dados',
      description: 'Dados de queries, relatórios e workflows',
      includes: [ 'query_results', 'report_data', 'workflow_data' ]
    },
    cache: {
      name: 'Cache',
      description: 'Cache de sistema e dados temporários',
      includes: [ 'ml_cache', 'query_cache', 'session_cache' ]
    },
    logs: {
      name: 'Logs',
      description: 'Logs de sistema e auditoria',
      includes: [ 'system_logs', 'audit_logs', 'error_logs' ]
    },
    emails: {
      name: 'Emails',
      description: 'Emails enviados e templates',
      includes: [ 'sent_emails', 'email_templates', 'attachments' ]
    },
    calendar: {
      name: 'Calendário',
      description: 'Eventos e agendamentos',
      includes: [ 'events', 'reminders', 'recurring_events' ]
    },
    chat: {
      name: 'Chat',
      description: 'Mensagens e histórico de chat',
      includes: [ 'messages', 'file_shares', 'chat_history' ]
    }
  },

  // CONFIGURAÇÕES DE SISTEMA
  SYSTEM: {
    // Limites de processamento
    processing: {
      maxConcurrentInsights: 5,
      maxDataPoints: 10000,
      timeoutMs: 30000
    },

    // Cache
    cache: {
      insightTtl: 3600, // 1 hora
      dataTtl: 1800, // 30 minutos
      maxCacheSize: 100 * 1024 * 1024 // 100MB
    },

    // Monitoramento
    monitoring: {
      healthCheckInterval: 300000, // 5 minutos
      storageCheckInterval: 3600000, // 1 hora
      cleanupInterval: 86400000 // 24 horas
    }
  },

  // ====================================================================
  // CONFIGURAÇÕES AVANÇADAS DO SISTEMA QUÂNTICO
  // ====================================================================

  QUANTUM_SYSTEM: {
    // Configurações do núcleo quântico
    core: {
      qubits: 64,
      coherenceTime: 1000, // ms
      fidelity: 0.99,
      quantumEfficiency: 0.95,
      maxEntanglementPairs: 100
    },

    // Algoritmos quânticos disponíveis
    algorithms: {
      QAOA: {
        enabled: true,
        maxIterations: 10,
        convergenceThreshold: 0.001,
        defaultParams: { gamma: Math.PI / 4, beta: Math.PI / 8 }
      },
      Grover: {
        enabled: true,
        maxSearchSpace: 1000000,
        amplificationRounds: 'auto' // Calculado automaticamente
      },
      SQD: {
        enabled: true,
        maxMatrixSize: 1024,
        samplingRate: 1000,
        convergenceTolerance: 1e-6
      },
      PortfolioOptimization: {
        enabled: true,
        maxAssets: 100,
        riskModels: [ 'VaR', 'CVaR', 'Sharpe' ],
        timeHorizons: [ 1, 7, 30, 90, 365 ]
      }
    },

    // Configurações de performance
    performance: {
      maxProcessingTime: 30000, // 30 segundos
      fallbackThreshold: 5000, // 5 segundos
      cacheEnabled: true,
      cacheExpiration: 300000, // 5 minutos
      parallelProcessing: true,
      maxConcurrentOperations: 10
    },

    // Configurações de monitoramento
    monitoring: {
      realTimeMetrics: true,
      metricsRetention: 86400000, // 24 horas
      alertThresholds: {
        coherenceLoss: 0.8,
        performanceDegradation: 0.7,
        errorRate: 0.05
      },
      logging: {
        level: 'info',
        quantumOperations: true,
        performanceMetrics: true,
        errors: true
      }
    }
  },

  // ====================================================================
  // INTEGRAÇÃO COM COMPONENTES DO SISTEMA
  // ====================================================================

  COMPONENT_INTEGRATION: {
    workflows: {
      quantumOptimization: true,
      algorithms: [ 'QAOA' ],
      fallbackEnabled: true,
      cacheResults: true
    },
    reports: {
      quantumAnalytics: true,
      algorithms: [ 'Grover', 'SQD' ],
      patternDetection: true,
      anomalyDetection: true
    },
    queries: {
      quantumTQL: true,
      algorithms: [ 'Grover', 'SQD' ],
      joinOptimization: true,
      indexOptimization: true
    },
    dashboards: {
      quantumInsights: true,
      algorithms: [ 'PortfolioOptimization', 'QAOA' ],
      realTimePredictions: true,
      adaptiveLayout: true
    },
    tasks: {
      quantumPrioritization: true,
      algorithms: [ 'QAOA' ],
      dependencyAnalysis: true,
      resourceOptimization: true
    },
    kpis: {
      quantumAnalysis: true,
      algorithms: [ 'SQD', 'PortfolioOptimization' ],
      correlationAnalysis: true,
      trendPrediction: true
    }
  },

  // ====================================================================
  // CONFIGURAÇÕES DE SEGURANÇA QUÂNTICA
  // ====================================================================

  QUANTUM_SECURITY: {
    encryption: {
      quantumResistant: true,
      keySize: 256,
      algorithm: 'AES-256-GCM'
    },
    authentication: {
      quantumTokens: false, // Futuro: tokens quânticos
      multiFactorRequired: true
    },
    dataProtection: {
      quantumEntanglement: true,
      coherenceValidation: true,
      tamperDetection: true
    }
  }
};

export default QUANTUM_CONFIG;
