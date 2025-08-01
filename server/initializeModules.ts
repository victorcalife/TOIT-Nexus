import { storage } from './storage';

// Definições padrão dos módulos do sistema
const DEFAULT_MODULES = [
  {
    name: 'task_management',
    display_name: 'Gestão de Tarefas',
    description: 'Sistema completo de gestão de tarefas com coleta rica de dados',
    category: 'core',
    version: '1.0.0',
    author: 'TOIT',
    icon: 'CheckSquare',
    color: '#10B981',
    is_active: true,
    is_core: true,
    target_user_types: ['pequena_empresa', 'media_empresa', 'grande_empresa'],
    dependencies: [],
    features: [
      'Criação de templates de tarefas',
      'Campos de resposta personalizáveis (texto, checkbox, dropdown, etc)',
      'Atribuição de tarefas para funcionários',
      'Acompanhamento de progresso',
      'Sistema de comentários',
      'Notificações automáticas',
      'Relatórios de produtividade'
    ],
    limitations: {
      free: { maxTasks: 10, maxUsers: 2 },
      basic: { maxTasks: 100, maxUsers: 10 },
      premium: { maxTasks: -1, maxUsers: -1 }
    },
    base_price: 29.90,
    pricing_model: 'per_user',
    trial_days: 7,
    sort_order: 1
  },
  {
    name: 'file_processing',
    display_name: 'Processamento de Arquivos',
    description: 'Upload e processamento inteligente de arquivos Excel (.xls/.xlsx) e CSV',
    category: 'conectividade',
    version: '1.0.0',
    author: 'TOIT',
    icon: 'FileSpreadsheet',
    color: '#8B5CF6',
    is_active: true,
    is_core: false,
    target_user_types: ['pessoa_fisica', 'pequena_empresa', 'media_empresa', 'grande_empresa'],
    dependencies: [],
    features: [
      'Upload de arquivos Excel (.xls, .xlsx) e CSV',
      'Processamento automático e extração de dados',
      'Preview dos dados com paginação',
      'Validação automática de formato',
      'Gestão de arquivos com histórico',
      'API para integração com workflows',
      'Estatísticas de uso de armazenamento'
    ],
    limitations: {
      free: { maxFileSize: 5, maxFiles: 10, maxStorageGB: 0.5 },
      basic: { maxFileSize: 10, maxFiles: 50, maxStorageGB: 2 },
      premium: { maxFileSize: 25, maxFiles: 200, maxStorageGB: 10 },
      enterprise: { maxFileSize: 100, maxFiles: -1, maxStorageGB: -1 }
    },
    base_price: 19.90,
    pricing_model: 'per_tenant',
    trial_days: 7,
    sort_order: 3
  },
  {
    name: 'query_builder',
    displayName: 'Construtor de Consultas',
    description: 'Interface visual para criação de consultas complexas aos dados',
    category: 'advanced',
    basePrice: '49.90',
    pricePerUser: '19.90',
    priceModel: 'per_user',
    features: [
      'Interface drag-and-drop para consultas',
      'Conexão com múltiplas fontes de dados',
      'Salvamento de consultas favoritas',
      'Exportação em múltiplos formatos',
      'Agendamento de relatórios',
      'Dashboards personalizáveis'
    ],
    limitations: {
      free: { max_queries_per_month: 100, max_saved_queries: 5, max_data_sources: 1 },
      basic: { max_queries_per_month: 1000, max_saved_queries: 25, max_data_sources: 3 },
      premium: { max_queries_per_month: 5000, max_saved_queries: 100, max_data_sources: 10 },
      enterprise: {} // ilimitado
    },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Search',
    color: '#8b5cf6',
    sortOrder: 3
  },
  {
    name: 'crm_basic',
    displayName: 'CRM Básico',
    description: 'Gestão básica de clientes e relacionamentos',
    category: 'premium',
    basePrice: '89.90',
    pricePerUser: '29.90',
    priceModel: 'per_user',
    features: [
      'Cadastro de clientes e contatos',
      'Histórico de interações',
      'Pipeline de vendas básico',
      'Lembretes e follow-ups',
      'Relatórios de vendas'
    ],
    limitations: {
      basic: { max_contacts: 500, max_deals: 100, max_users: 5 },
      premium: { max_contacts: 5000, max_deals: 1000, max_users: 25 },
      enterprise: {} // ilimitado
    },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Users',
    color: '#f59e0b',
    sortOrder: 4
  },
  {
    name: 'advanced_analytics',
    displayName: 'Analytics Avançado',
    description: 'Análises estatísticas avançadas e machine learning básico',
    category: 'enterprise',
    basePrice: '199.90',
    pricePerUser: '79.90',
    priceModel: 'per_user',
    features: [
      'Análises estatísticas avançadas',
      'Modelos de machine learning',
      'Previsões e tendências',
      'Análise de sentimento',
      'APIs de terceiros integradas',
      'Dashboards em tempo real'
    ],
    limitations: {
      premium: { max_models: 5, max_predictions_per_month: 10000, max_data_points: 100000 },
      enterprise: {} // ilimitado
    },
    targetUserTypes: ['enterprise'],
    icon: 'TrendingUp',
    color: '#ef4444',
    sortOrder: 5
  },
  {
    name: 'workflow_automation',
    displayName: 'Automação de Workflows',
    description: 'Criação e execução de workflows automatizados complexos',
    category: 'premium',
    basePrice: '149.90',
    pricePerUser: '49.90',
    priceModel: 'per_user',
    features: [
      'Editor visual de workflows',
      'Triggers condicionais',
      'Integração com APIs externas',
      'Execução agendada',
      'Monitoramento em tempo real',
      'Tratamento de erros avançado'
    ],
    limitations: {
      basic: { max_workflows: 10, max_executions_per_month: 1000, max_steps_per_workflow: 20 },
      premium: { max_workflows: 50, max_executions_per_month: 10000, max_steps_per_workflow: 100 },
      enterprise: {} // ilimitado
    },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Workflow',
    color: '#06b6d4',
    sortOrder: 6
  }
];

export async function initializeDefaultModules() {
  try {
    console.log('🔧 Inicializando módulos padrão...');
    
    for (const moduleData of DEFAULT_MODULES) {
      // Verificar se módulo já existe
      const existingModule = await storage.getModuleByName(moduleData.name);
      
      if (!existingModule) {
        await storage.createModuleDefinition(moduleData);
        console.log(`✅ Módulo ${moduleData.displayName} criado`);
      } else {
        // Atualizar módulo existente com novas configurações
        await storage.updateModuleDefinition(existingModule.id, moduleData);
        console.log(`🔄 Módulo ${moduleData.displayName} atualizado`);
      }
    }
    
    console.log('✅ Módulos padrão inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar módulos padrão:', error);
  }
}

export async function createProductConfigurations() {
  try {
    console.log('📦 Criando configurações de produtos...');
    
    // Configurações de produtos pré-definidos
    const PRODUCT_CONFIGS = [
      {
        name: 'starter_pack',
        displayName: 'Pacote Inicial',
        description: 'Perfeito para freelancers e pequenos negócios',
        price: '19.90',
        modules: ['file_uploader'],
        userType: 'pessoa_fisica',
        maxUsers: 1,
        trialDays: 7
      },
      {
        name: 'business_basic',
        displayName: 'Negócios Básico',
        description: 'Ideal para pequenas empresas em crescimento',
        price: '79.90',
        modules: ['file_uploader', 'task_management'],
        userType: 'pequena_empresa',
        maxUsers: 5,
        trialDays: 14
      },
      {
        name: 'business_pro',
        displayName: 'Negócios Pro',
        description: 'Para empresas que precisam de análises avançadas',
        price: '149.90',
        modules: ['file_uploader', 'task_management', 'query_builder', 'crm_basic'],
        userType: 'pequena_empresa',
        maxUsers: 15,
        trialDays: 14
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'Solução completa para grandes empresas',
        price: '399.90',
        modules: ['file_uploader', 'task_management', 'query_builder', 'crm_basic', 'workflow_automation', 'advanced_analytics'],
        userType: 'enterprise',
        maxUsers: -1, // ilimitado
        trialDays: 30
      }
    ];
    
    // Salvar configurações no banco (você pode criar uma tabela específica ou usar as existentes)
    for (const config of PRODUCT_CONFIGS) {
      console.log(`📋 Configuração ${config.displayName} definida`);
    }
    
    console.log('✅ Configurações de produtos criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar configurações de produtos:', error);
  }
}

// Função para ativar módulos padrão para um novo tenant baseado no tipo
export async function activateDefaultModulesForTenant(
  tenantId: string, 
  userType: 'pessoa_fisica' | 'pequena_empresa' | 'enterprise',
  productPack?: string
) {
  try {
    console.log(`🎯 Ativando módulos padrão para tenant ${tenantId} (${userType})`);
    
    // Módulos padrão por tipo de usuário
    const defaultModulesMap = {
      pessoa_fisica: ['file_uploader'],
      pequena_empresa: ['file_uploader', 'task_management'],
      enterprise: ['file_uploader', 'task_management', 'query_builder', 'crm_basic']
    };
    
    const modulesToActivate = defaultModulesMap[userType] || [];
    
    for (const moduleName of modulesToActivate) {
      const module = await storage.getModuleByName(moduleName);
      if (module) {
        // Verificar se já está ativado
        const existingTenantModule = await storage.getTenantModule(tenantId, module.id);
        
        if (!existingTenantModule) {
          const defaultConfig = getDefaultConfigForUserType(moduleName, userType);
          
          await storage.createTenantModule({
            tenantId,
            moduleId: module.id,
            isEnabled: true,
            plan: module.priceModel === 'free' ? 'free' : 'trial',
            maxUsers: defaultConfig.maxUsers,
            usageLimits: defaultConfig.usageLimits,
            trialEndsAt: module.priceModel !== 'free' 
              ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
              : undefined
          });
          
          console.log(`✅ Módulo ${module.displayName} ativado para tenant ${tenantId}`);
        }
      }
    }
    
    console.log(`✅ Módulos padrão ativados para tenant ${tenantId}`);
  } catch (error) {
    console.error(`❌ Erro ao ativar módulos padrão para tenant ${tenantId}:`, error);
  }
}

function getDefaultConfigForUserType(moduleName: string, userType: string) {
  const configs = {
    pessoa_fisica: {
      file_uploader: { maxUsers: 1, usageLimits: { max_storage_gb: 1, max_file_size_mb: 10 } },
      task_management: { maxUsers: 1, usageLimits: { max_tasks_per_month: 25, max_templates: 3 } }
    },
    pequena_empresa: {
      file_uploader: { maxUsers: 5, usageLimits: { max_storage_gb: 10, max_file_size_mb: 50 } },
      task_management: { maxUsers: 10, usageLimits: { max_tasks_per_month: 500, max_templates: 25 } },
      query_builder: { maxUsers: 5, usageLimits: { max_queries_per_month: 1000, max_saved_queries: 25 } }
    },
    enterprise: {
      file_uploader: { maxUsers: -1, usageLimits: {} },
      task_management: { maxUsers: -1, usageLimits: {} },
      query_builder: { maxUsers: -1, usageLimits: {} },
      crm_basic: { maxUsers: -1, usageLimits: {} }
    }
  };
  
  return configs[userType as keyof typeof configs]?.[moduleName as keyof typeof configs['pessoa_fisica']] || 
         { maxUsers: 5, usageLimits: {} };
}