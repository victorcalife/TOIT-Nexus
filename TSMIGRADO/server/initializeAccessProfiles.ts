import { eq } from 'drizzle-orm';
import { db } from './db';
import { moduleDefinitions, accessProfiles } from '../shared/schema';

// Definição dos módulos disponíveis no sistema
const defaultModules = [
  // Conectividade e Interfaces
  {
    id: 'email',
    name: 'email',
    displayName: 'E-mail',
    description: 'Conectar e-mail para workflows e notificações',
    category: 'conectividade',
    basePrice: '0.00',
    pricePerUser: '5.00',
    priceModel: 'per_user',
    features: ['integração_gmail', 'integração_outlook', 'workflows_email', 'notificações_automáticas'],
    limitations: { max_emails_per_month: 1000 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'Mail',
    color: '#3b82f6'
  },
  {
    id: 'apis',
    name: 'apis',
    displayName: 'APIs',
    description: 'Conectar com APIs de terceiros',
    category: 'conectividade',
    basePrice: '10.00',
    pricePerUser: '2.00',
    priceModel: 'per_user',
    features: ['rest_apis', 'webhooks', 'autenticação_oauth', 'rate_limiting'],
    limitations: { max_api_calls: 10000 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'Zap',
    color: '#10b981'
  },
  {
    id: 'calendars',
    name: 'calendars',
    displayName: 'Calendários',
    description: 'Google, Apple, Outlook/Microsoft',
    category: 'conectividade',
    basePrice: '5.00',
    pricePerUser: '3.00',
    priceModel: 'per_user',
    features: ['google_calendar', 'outlook_calendar', 'apple_calendar', 'sincronização_bidirecional'],
    limitations: { max_calendars: 5 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'Calendar',
    color: '#f59e0b'
  },
  {
    id: 'database',
    name: 'database',
    displayName: 'Banco de Dados',
    description: 'Conectar com PostgreSQL, MySQL, MongoDB',
    category: 'conectividade',
    basePrice: '15.00',
    pricePerUser: '5.00',
    priceModel: 'per_user',
    features: ['postgresql', 'mysql', 'mongodb', 'sqlite', 'queries_visuais'],
    limitations: { max_connections: 3, max_queries_per_hour: 1000 },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Database',
    color: '#8b5cf6'
  },
  {
    id: 'file_upload',
    name: 'file_upload',
    displayName: 'Upload de Arquivo',
    description: 'Upload .xls, .xlsx, .csv',
    category: 'conectividade',
    basePrice: '5.00',
    pricePerUser: '1.00',
    priceModel: 'per_user',
    features: ['excel_import', 'csv_import', 'processamento_automático', 'validação_dados'],
    limitations: { max_file_size_mb: 50, max_files_per_month: 100 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'Upload',
    color: '#06b6d4'
  },
  {
    id: 'webhooks',
    name: 'webhooks',
    displayName: 'Webhooks',
    description: 'Configurar webhooks e callbacks',
    category: 'conectividade',
    basePrice: '10.00',
    pricePerUser: '2.00',
    priceModel: 'per_user',
    features: ['webhooks_incoming', 'webhooks_outgoing', 'retry_logic', 'logs_detalhados'],
    limitations: { max_webhooks: 10, max_calls_per_hour: 5000 },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Webhook',
    color: '#ef4444'
  },

  // Ferramentas de Produtividade
  {
    id: 'task_management',
    name: 'task_management',
    displayName: 'Gestão de Tarefas',
    description: 'Criar e gerenciar tarefas com templates',
    category: 'produtividade',
    basePrice: '8.00',
    pricePerUser: '3.00',
    priceModel: 'per_user',
    features: ['templates_tarefas', 'atribuição_usuários', 'tracking_tempo', 'comentários'],
    limitations: { max_tasks_per_month: 500, max_templates: 20 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'CheckSquare',
    color: '#22c55e'
  },
  {
    id: 'workflow_builder',
    name: 'workflow_builder',
    displayName: 'Workflow Builder',
    description: 'Construtor de workflows automatizados',
    category: 'produtividade',
    basePrice: '20.00',
    pricePerUser: '5.00',
    priceModel: 'per_user',
    features: ['designer_visual', 'condições_lógicas', 'automação_completa', 'integrações'],
    limitations: { max_workflows: 10, max_steps_per_workflow: 50 },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Workflow',
    color: '#a855f7'
  },
  {
    id: 'query_builder',
    name: 'query_builder',
    displayName: 'Query Builder',
    description: 'Construtor visual de consultas SQL',
    category: 'produtividade',
    basePrice: '12.00',
    pricePerUser: '4.00',
    priceModel: 'per_user',
    features: ['interface_visual', 'sql_gerado', 'histórico_queries', 'compartilhamento'],
    limitations: { max_saved_queries: 50, max_query_complexity: 100 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'Search',
    color: '#0ea5e9'
  },
  {
    id: 'dashboard_builder',
    name: 'dashboard_builder',
    displayName: 'Dashboard Builder',
    description: 'Criar dashboards personalizados',
    category: 'produtividade',
    basePrice: '15.00',
    pricePerUser: '4.00',
    priceModel: 'per_user',
    features: ['gráficos_interativos', 'tempo_real', 'templates_prontos', 'export_pdf'],
    limitations: { max_dashboards: 10, max_widgets_per_dashboard: 20 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'BarChart3',
    color: '#f97316'
  },
  {
    id: 'reports',
    name: 'reports',
    displayName: 'Relatórios',
    description: 'Gerar relatórios personalizáveis',
    category: 'produtividade',
    basePrice: '10.00',
    pricePerUser: '3.00',
    priceModel: 'per_user',
    features: ['templates_relatórios', 'agendamento_automático', 'export_múltiplos_formatos', 'filtros_avançados'],
    limitations: { max_reports_per_month: 100, max_report_size_mb: 10 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'FileText',
    color: '#84cc16'
  },
  {
    id: 'notifications',
    name: 'notifications',
    displayName: 'Notificações',
    description: 'Central de notificações push/email/SMS',
    category: 'produtividade',
    basePrice: '5.00',
    pricePerUser: '2.00',
    priceModel: 'per_user',
    features: ['push_notifications', 'email_notifications', 'sms_notifications', 'templates_personalizados'],
    limitations: { max_notifications_per_month: 1000 },
    targetUserTypes: ['pessoa_fisica', 'pequena_empresa', 'enterprise'],
    icon: 'Bell',
    color: '#fbbf24'
  },

  // Funcionalidades Empresariais
  {
    id: 'team_management',
    name: 'team_management',
    displayName: 'Gestão de Equipe',
    description: 'Vincular/desvincular usuários',
    category: 'empresarial',
    basePrice: '25.00',
    pricePerUser: '5.00',
    priceModel: 'per_user',
    features: ['convites_usuários', 'hierarquia_equipe', 'controle_acesso', 'relatórios_atividade'],
    limitations: { max_team_members: 50 },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Users',
    color: '#6366f1'
  },
  {
    id: 'department_management',
    name: 'department_management',
    displayName: 'Departamentos',
    description: 'Controle dados por departamento',
    category: 'empresarial',
    basePrice: '30.00',
    pricePerUser: '3.00',
    priceModel: 'per_user',
    features: ['isolamento_dados', 'hierarquia_departamental', 'relatórios_por_setor', 'workflows_departamentais'],
    limitations: { max_departments: 20 },
    targetUserTypes: ['enterprise'],
    icon: 'Building2',
    color: '#dc2626'
  },
  {
    id: 'access_control',
    name: 'access_control',
    displayName: 'Controle de Acesso',
    description: 'Permissões granulares por usuário',
    category: 'empresarial',
    basePrice: '20.00',
    pricePerUser: '4.00',
    priceModel: 'per_user',
    features: ['rbac_completo', 'permissões_granulares', 'auditoria_acessos', 'políticas_segurança'],
    limitations: { max_custom_roles: 10 },
    targetUserTypes: ['pequena_empresa', 'enterprise'],
    icon: 'Shield',
    color: '#059669'
  }
];

// Perfis de acesso padrão
const defaultAccessProfiles = [
  {
    name: 'BÁSICO',
    description: 'Plano básico para iniciantes com funcionalidades essenciais',
    price_monthly: '59.00',
    price_yearly: '549.00',
    max_users: 1,
    max_storage_gb: 5,
    modules: {
      'email': true,
      'file_upload': true,
      'task_management': true,
      'query_builder': true,
      'reports': true,
      'notifications': true
    },
    features: [
      'Gestão básica de tarefas',
      'Upload de arquivos (.csv, .xlsx)',
      'Integração com e-mail',
      '5GB de armazenamento',
      'Relatórios básicos',
      'Suporte por e-mail'
    ],
    sort_order: 1
  },
  {
    name: 'STANDARD',
    description: 'Plano mais popular com automações e integrações poderosas',
    price_monthly: '89.00',
    price_yearly: '749.00',
    max_users: 5,
    max_storage_gb: 25,
    modules: {
      'email': true,
      'apis': true,
      'calendars': true,
      'database': true,
      'file_upload': true,
      'webhooks': true,
      'task_management': true,
      'workflow_builder': true,
      'query_builder': true,
      'dashboard_builder': true,
      'reports': true,
      'notifications': true,
      'team_management': true
    },
    features: [
      'Todas as funcionalidades do Básico',
      'Construtor de workflows',
      'Integrações com APIs',
      'Conectividade com bancos de dados',
      'Dashboard personalizados',
      'Até 5 usuários',
      '25GB de armazenamento',
      'Gestão básica de equipe',
      'Suporte prioritário'
    ],
    sort_order: 2
  },
  {
    name: 'PREMIUM',
    description: 'Plano premium com recursos avançados e benefícios exclusivos',
    price_monthly: '119.00',
    price_yearly: '999.00',
    max_users: 10,
    max_storage_gb: 50,
    modules: {
      'email': true,
      'apis': true,
      'calendars': true,
      'database': true,
      'file_upload': true,
      'webhooks': true,
      'task_management': true,
      'workflow_builder': true,
      'query_builder': true,
      'dashboard_builder': true,
      'reports': true,
      'notifications': true,
      'team_management': true,
      'access_control': true
    },
    features: [
      'Todas as funcionalidades do Standard',
      'Controle de acesso avançado',
      'Até 10 usuários',
      '50GB de armazenamento',
      'Integrações premium',
      'Relatórios avançados',
      'Suporte prioritário',
      'Recursos exclusivos'
    ],
    sort_order: 3
  },
  {
    name: 'ENTERPRISE',
    description: 'Solução completa para grandes empresas - A partir de R$ 29,00 por usuário/mês (mínimo de 5 usuários)',
    price_monthly: '29.00',
    price_yearly: '290.00',
    max_users: -1, // Ilimitado
    max_storage_gb: 100,
    modules: {
      'email': true,
      'apis': true,
      'calendars': true,
      'database': true,
      'file_upload': true,
      'webhooks': true,
      'task_management': true,
      'workflow_builder': true,
      'query_builder': true,
      'dashboard_builder': true,
      'reports': true,
      'notifications': true,
      'team_management': true,
      'department_management': true,
      'access_control': true
    },
    features: [
      'Todas as funcionalidades do Premium',
      'Gestão departamental avançada',
      'Controle de acesso granular',
      'Usuários ilimitados',
      '100GB de armazenamento',
      'Isolamento de dados por departamento',
      'Relatórios executivos',
      'Suporte dedicado 24/7',
      'Onboarding personalizado',
      'Mínimo de 5 usuários',
      'Preço por usuário personalizado'
    ],
    sort_order: 4,
    is_active: false  // Enterprise não é comercializado diretamente
  },
  {
    name: 'GRATUITO',
    description: 'Plano gratuito para teste e avaliação da plataforma',
    price_monthly: '0.00',
    price_yearly: '0.00',
    max_users: 1,
    max_storage_gb: 1,
    modules: {
      'task_management': true,
      'file_upload': true,
      'notifications': true
    },
    features: [
      'Gestão básica de tarefas (limitada)',
      'Upload de 1 arquivo por mês',
      '1GB de armazenamento',
      'Notificações básicas',
      'Suporte por comunidade'
    ],
    sort_order: 0,
    is_active: true
  }
];

export async function initializeAccessProfiles() {
  try {
    console.log('🚀 Inicializando módulos e perfis de acesso...');

    // 1. Inserir módulos padrão
    for (const module of defaultModules) {
      const existingModule = await db
        .select()
        .from(moduleDefinitions)
        .where(eq(moduleDefinitions.name, module.name))
        .limit(1);

      if (existingModule.length === 0) {
        await db.insert(moduleDefinitions).values({
          name: module.name,
          displayName: module.displayName,
          description: module.description,
          category: module.category,
          basePrice: module.basePrice,
          pricePerUser: module.pricePerUser,
          priceModel: module.priceModel,
          features: module.features,
          limitations: module.limitations,
          targetUserTypes: module.targetUserTypes,
          icon: module.icon,
          color: module.color,
          isActive: true
        });
        console.log(`✅ Módulo criado: ${module.displayName}`);
      }
    }

    // 2. Inserir perfis de acesso padrão
    for (const profile of defaultAccessProfiles) {
      const slug = profile.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existingProfile = await db
        .select()
        .from(accessProfiles)
        .where(eq(accessProfiles.slug, slug))
        .limit(1);

      if (existingProfile.length === 0) {
        await db.insert(accessProfiles).values({
          name: profile.name,
          slug,
          description: profile.description,
          price_monthly: profile.price_monthly,
          price_yearly: profile.price_yearly,
          max_users: profile.max_users,
          max_storage_gb: profile.max_storage_gb,
          modules: profile.modules,
          features: profile.features,
          is_active: profile.is_active ?? true,
          sort_order: profile.sort_order
        });
        console.log(`✅ Perfil de acesso criado: ${profile.name}`);
      }
    }

    console.log('🎉 Inicialização de perfis de acesso concluída com sucesso!');
    return { success: true, message: 'Perfis e módulos inicializados' };

  } catch (error) {
    console.error('❌ Erro ao inicializar perfis de acesso:', error);
    throw error;
  }
}