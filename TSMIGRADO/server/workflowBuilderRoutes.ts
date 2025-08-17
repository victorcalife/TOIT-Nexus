/**
 * WORKFLOW BUILDER ROUTES - Painel completo de criação de workflows
 * Sistema drag-and-drop com TODOS os objetos disponíveis
 * Eventos e ações para cada módulo do sistema
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  visualWorkflows,
  workflowNodes,
  workflowConnections,
  savedQueries,
  taskTemplates,
  dashboards,
  reportTemplates,
  externalDatabaseConnections,
  apiConnections,
  webhookConnections,
  notifications,
  users,
  tenants,
  clients
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// WORKFLOW BUILDER - OBJETOS DISPONÍVEIS
// ==========================================

// GET /api/workflow-builder/available-objects - Lista TODOS os objetos disponíveis para workflows
router.get('/available-objects', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎯 Buscando objetos disponíveis para workflow builder - User: ${userId}, Tenant: ${tenantId}`);
    
    // Buscar todos os objetos em paralelo para performance
    const [
      savedQueriesData,
      taskTemplatesData,
      dashboardsData,
      reportTemplatesData,
      databaseConnectionsData,
      apiConnectionsData,
      webhookConnectionsData,
      usersData,
      clientsData
    ] = await Promise.all([
      // 1. Queries salvas
      db.select({
        id: savedQueries.id,
        name: savedQueries.name,
        description: savedQueries.description,
        category: savedQueries.category,
        createdAt: savedQueries.createdAt
      })
      .from(savedQueries)
      .where(eq(savedQueries.tenantId, tenantId))
      .orderBy(desc(savedQueries.createdAt)),
      
      // 2. Templates de tasks
      db.select({
        id: taskTemplates.id,
        name: taskTemplates.name,
        description: taskTemplates.description,
        category: taskTemplates.category,
        taskType: taskTemplates.taskType,
        priority: taskTemplates.priority
      })
      .from(taskTemplates)
      .where(eq(taskTemplates.tenantId, tenantId))
      .orderBy(desc(taskTemplates.createdAt)),
      
      // 3. Dashboards
      db.select({
        id: dashboards.id,
        name: dashboards.name,
        description: dashboards.description,
        category: dashboards.category,
        isPublic: dashboards.isPublic
      })
      .from(dashboards)
      .where(eq(dashboards.tenantId, tenantId))
      .orderBy(desc(dashboards.updatedAt)),
      
      // 4. Templates de relatórios
      db.select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        description: reportTemplates.description,
        category: reportTemplates.category,
        templateType: reportTemplates.templateType
      })
      .from(reportTemplates)
      .where(eq(reportTemplates.tenantId, tenantId))
      .orderBy(desc(reportTemplates.createdAt)),
      
      // 5. Conexões de banco de dados
      db.select({
        id: externalDatabaseConnections.id,
        name: externalDatabaseConnections.name,
        type: externalDatabaseConnections.type,
        description: externalDatabaseConnections.description,
        isActive: externalDatabaseConnections.isActive
      })
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.tenantId, tenantId),
        eq(externalDatabaseConnections.isActive, true)
      ))
      .orderBy(desc(externalDatabaseConnections.createdAt)),
      
      // 6. Conexões de API
      db.select({
        id: apiConnections.id,
        name: apiConnections.name,
        apiType: apiConnections.apiType,
        description: apiConnections.description,
        isActive: apiConnections.isActive
      })
      .from(apiConnections)
      .where(and(
        eq(apiConnections.tenantId, tenantId),
        eq(apiConnections.isActive, true)
      ))
      .orderBy(desc(apiConnections.createdAt)),
      
      // 7. Conexões de webhook
      db.select({
        id: webhookConnections.id,
        name: webhookConnections.name,
        webhookType: webhookConnections.webhookType,
        description: webhookConnections.description,
        isActive: webhookConnections.isActive
      })
      .from(webhookConnections)
      .where(and(
        eq(webhookConnections.tenantId, tenantId),
        eq(webhookConnections.isActive, true)
      ))
      .orderBy(desc(webhookConnections.createdAt)),
      
      // 8. Usuários do tenant
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department
      })
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(users.name),
      
      // 9. Clientes
      db.select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        company: clients.company,
        status: clients.status
      })
      .from(clients)
      .where(eq(clients.tenantId, tenantId))
      .orderBy(clients.name)
    ]);
    
    // Estruturar objetos com eventos e ações disponíveis
    const workflowObjects = {
      // MÓDULO 1: QUERY BUILDER
      queries: {
        category: 'Query Builder',
        icon: '🔍',
        description: 'Execução de queries TQL e manipulação de dados',
        objects: savedQueriesData.map(query => ({
          ...query,
          objectType: 'query',
          events: [
            { name: 'on_execute', description: 'Quando query é executada' },
            { name: 'on_success', description: 'Quando query executa com sucesso' },
            { name: 'on_error', description: 'Quando query falha' },
            { name: 'on_empty_result', description: 'Quando query retorna vazio' },
            { name: 'on_result_count', description: 'Baseado no número de resultados' }
          ],
          actions: [
            { name: 'execute', description: 'Executar query', inputs: ['variables'] },
            { name: 'execute_with_params', description: 'Executar com parâmetros', inputs: ['params', 'filters'] },
            { name: 'validate_syntax', description: 'Validar sintaxe TQL', inputs: [] },
            { name: 'get_results', description: 'Obter resultados da execução', inputs: [] }
          ]
        }))
      },
      
      // MÓDULO 2: TASK MANAGEMENT
      tasks: {
        category: 'Task Management',
        icon: '📋',
        description: 'Criação e gestão de tarefas colaborativas',
        objects: taskTemplatesData.map(task => ({
          ...task,
          objectType: 'task',
          events: [
            { name: 'on_create', description: 'Quando task é criada' },
            { name: 'on_assign', description: 'Quando task é atribuída' },
            { name: 'on_start', description: 'Quando task é iniciada' },
            { name: 'on_complete', description: 'Quando task é completada' },
            { name: 'on_overdue', description: 'Quando task está atrasada' },
            { name: 'on_comment', description: 'Quando comentário é adicionado' },
            { name: 'on_status_change', description: 'Quando status muda' }
          ],
          actions: [
            { name: 'create_instance', description: 'Criar instância da task', inputs: ['assignee', 'dueDate', 'priority'] },
            { name: 'assign_to_user', description: 'Atribuir a usuário', inputs: ['userId'] },
            { name: 'set_priority', description: 'Definir prioridade', inputs: ['priority'] },
            { name: 'add_comment', description: 'Adicionar comentário', inputs: ['comment', 'attachments'] },
            { name: 'change_status', description: 'Alterar status', inputs: ['status'] },
            { name: 'set_due_date', description: 'Definir prazo', inputs: ['dueDate'] }
          ]
        }))
      },
      
      // MÓDULO 3: DASHBOARD BUILDER
      dashboards: {
        category: 'Dashboards',
        icon: '📊',
        description: 'Criação e atualização de dashboards visuais',
        objects: dashboardsData.map(dashboard => ({
          ...dashboard,
          objectType: 'dashboard',
          events: [
            { name: 'on_create', description: 'Quando dashboard é criado' },
            { name: 'on_update', description: 'Quando dashboard é atualizado' },
            { name: 'on_view', description: 'Quando dashboard é visualizado' },
            { name: 'on_widget_add', description: 'Quando widget é adicionado' },
            { name: 'on_data_refresh', description: 'Quando dados são atualizados' }
          ],
          actions: [
            { name: 'create_widget', description: 'Criar widget', inputs: ['widgetType', 'dataSource', 'config'] },
            { name: 'update_data', description: 'Atualizar dados', inputs: ['dataSource'] },
            { name: 'refresh_all', description: 'Atualizar todos widgets', inputs: [] },
            { name: 'export_pdf', description: 'Exportar como PDF', inputs: ['title'] },
            { name: 'share_link', description: 'Gerar link de compartilhamento', inputs: ['permissions'] }
          ]
        }))
      },
      
      // MÓDULO 4: REPORTS
      reports: {
        category: 'Executive Reports',
        icon: '📋',
        description: 'Geração automática de relatórios executivos',
        objects: reportTemplatesData.map(report => ({
          ...report,
          objectType: 'report',
          events: [
            { name: 'on_generate', description: 'Quando relatório é gerado' },
            { name: 'on_schedule', description: 'Quando agendamento é ativado' },
            { name: 'on_complete', description: 'Quando geração é completa' },
            { name: 'on_error', description: 'Quando geração falha' },
            { name: 'on_send', description: 'Quando relatório é enviado' }
          ],
          actions: [
            { name: 'generate_now', description: 'Gerar imediatamente', inputs: ['format', 'recipients'] },
            { name: 'schedule_generation', description: 'Agendar geração', inputs: ['frequency', 'time'] },
            { name: 'send_email', description: 'Enviar por email', inputs: ['recipients', 'subject'] },
            { name: 'export_format', description: 'Exportar formato', inputs: ['format'] },
            { name: 'set_template', description: 'Definir template', inputs: ['templateConfig'] }
          ]
        }))
      },
      
      // MÓDULO 5: DATABASE CONNECTIONS
      databases: {
        category: 'Database Connections',
        icon: '🗄️',
        description: 'Conexões e operações em bancos de dados',
        objects: databaseConnectionsData.map(db => ({
          ...db,
          objectType: 'database',
          events: [
            { name: 'on_connect', description: 'Quando conexão é estabelecida' },
            { name: 'on_disconnect', description: 'Quando conexão é perdida' },
            { name: 'on_query_execute', description: 'Quando query é executada' },
            { name: 'on_data_change', description: 'Quando dados são alterados' },
            { name: 'on_error', description: 'Quando erro ocorre' }
          ],
          actions: [
            { name: 'execute_query', description: 'Executar query SQL', inputs: ['query', 'params'] },
            { name: 'test_connection', description: 'Testar conexão', inputs: [] },
            { name: 'get_schema', description: 'Obter schema', inputs: ['tables'] },
            { name: 'bulk_insert', description: 'Inserção em lote', inputs: ['table', 'data'] },
            { name: 'backup_table', description: 'Backup de tabela', inputs: ['table', 'location'] }
          ]
        }))
      },
      
      // MÓDULO 6: API CONNECTIONS
      apis: {
        category: 'API Integrations',
        icon: '🔌',
        description: 'Integrações com APIs externas',
        objects: apiConnectionsData.map(api => ({
          ...api,
          objectType: 'api',
          events: [
            { name: 'on_request', description: 'Quando requisição é feita' },
            { name: 'on_response', description: 'Quando resposta é recebida' },
            { name: 'on_success', description: 'Quando requisição é bem-sucedida' },
            { name: 'on_error', description: 'Quando requisição falha' },
            { name: 'on_rate_limit', description: 'Quando rate limit é atingido' }
          ],
          actions: [
            { name: 'make_request', description: 'Fazer requisição', inputs: ['method', 'endpoint', 'data'] },
            { name: 'authenticate', description: 'Autenticar conexão', inputs: ['credentials'] },
            { name: 'get_data', description: 'Obter dados', inputs: ['endpoint', 'filters'] },
            { name: 'post_data', description: 'Enviar dados', inputs: ['endpoint', 'payload'] },
            { name: 'set_headers', description: 'Definir headers', inputs: ['headers'] }
          ]
        }))
      },
      
      // MÓDULO 7: WEBHOOKS
      webhooks: {
        category: 'Webhooks',
        icon: '🔗',
        description: 'Triggers e callbacks automáticos',
        objects: webhookConnectionsData.map(webhook => ({
          ...webhook,
          objectType: 'webhook',
          events: [
            { name: 'on_receive', description: 'Quando webhook é recebido' },
            { name: 'on_trigger', description: 'Quando webhook é disparado' },
            { name: 'on_success', description: 'Quando processamento é bem-sucedido' },
            { name: 'on_retry', description: 'Quando retry é necessário' },
            { name: 'on_fail', description: 'Quando processamento falha' }
          ],
          actions: [
            { name: 'trigger_webhook', description: 'Disparar webhook', inputs: ['url', 'payload'] },
            { name: 'process_payload', description: 'Processar payload', inputs: ['data'] },
            { name: 'validate_signature', description: 'Validar assinatura', inputs: ['signature'] },
            { name: 'retry_failed', description: 'Retentar falhados', inputs: ['attempts'] },
            { name: 'log_event', description: 'Registrar evento', inputs: ['eventData'] }
          ]
        }))
      },
      
      // MÓDULO 8: NOTIFICATIONS
      notifications: {
        category: 'Notifications',
        icon: '🔔',
        description: 'Sistema de notificações multi-canal',
        objects: [
          {
            id: 'notification_system',
            name: 'Sistema de Notificações',
            description: 'Envio de notificações em tempo real',
            objectType: 'notification',
            events: [
              { name: 'on_send', description: 'Quando notificação é enviada' },
              { name: 'on_read', description: 'Quando notificação é lida' },
              { name: 'on_click', description: 'Quando notificação é clicada' },
              { name: 'on_expire', description: 'Quando notificação expira' }
            ],
            actions: [
              { name: 'send_notification', description: 'Enviar notificação', inputs: ['title', 'message', 'recipients', 'channels'] },
              { name: 'send_email', description: 'Enviar email', inputs: ['subject', 'body', 'recipients'] },
              { name: 'send_push', description: 'Enviar push notification', inputs: ['title', 'body', 'users'] },
              { name: 'create_campaign', description: 'Criar campanha', inputs: ['name', 'audience', 'message'] }
            ]
          }
        ]
      },
      
      // MÓDULO 9: USERS
      users: {
        category: 'User Management',
        icon: '👥',
        description: 'Gestão de usuários e permissões',
        objects: usersData.map(user => ({
          ...user,
          objectType: 'user',
          events: [
            { name: 'on_login', description: 'Quando usuário faz login' },
            { name: 'on_logout', description: 'Quando usuário faz logout' },
            { name: 'on_profile_update', description: 'Quando perfil é atualizado' },
            { name: 'on_role_change', description: 'Quando role é alterada' },
            { name: 'on_task_assigned', description: 'Quando task é atribuída' }
          ],
          actions: [
            { name: 'assign_task', description: 'Atribuir task', inputs: ['taskId', 'dueDate'] },
            { name: 'send_message', description: 'Enviar mensagem', inputs: ['message', 'priority'] },
            { name: 'change_role', description: 'Alterar role', inputs: ['newRole'] },
            { name: 'add_to_team', description: 'Adicionar ao time', inputs: ['teamId'] },
            { name: 'grant_permission', description: 'Conceder permissão', inputs: ['permission', 'resource'] }
          ]
        }))
      },
      
      // MÓDULO 10: CLIENTS
      clients: {
        category: 'Client Management',
        icon: '🏢',
        description: 'Gestão de clientes e relacionamentos',
        objects: clientsData.map(client => ({
          ...client,
          objectType: 'client',
          events: [
            { name: 'on_create', description: 'Quando cliente é criado' },
            { name: 'on_update', description: 'Quando dados são atualizados' },
            { name: 'on_status_change', description: 'Quando status muda' },
            { name: 'on_interaction', description: 'Quando há interação' },
            { name: 'on_contract_expire', description: 'Quando contrato expira' }
          ],
          actions: [
            { name: 'update_status', description: 'Atualizar status', inputs: ['status', 'reason'] },
            { name: 'send_proposal', description: 'Enviar proposta', inputs: ['template', 'values'] },
            { name: 'schedule_meeting', description: 'Agendar reunião', inputs: ['datetime', 'agenda'] },
            { name: 'create_project', description: 'Criar projeto', inputs: ['name', 'scope'] },
            { name: 'generate_report', description: 'Gerar relatório', inputs: ['type', 'period'] }
          ]
        }))
      }
    };
    
    // Calcular estatísticas
    const totalObjects = Object.values(workflowObjects).reduce((sum, category: any) => {
      return sum + category.objects.length;
    }, 0);
    
    const totalEvents = Object.values(workflowObjects).reduce((sum, category: any) => {
      return sum + category.objects.reduce((eventSum: number, obj: any) => {
        return eventSum + obj.events.length;
      }, 0);
    }, 0);
    
    const totalActions = Object.values(workflowObjects).reduce((sum, category: any) => {
      return sum + category.objects.reduce((actionSum: number, obj: any) => {
        return actionSum + obj.actions.length;
      }, 0);
    }, 0);
    
    res.json({
      success: true,
      data: workflowObjects,
      statistics: {
        totalCategories: Object.keys(workflowObjects).length,
        totalObjects,
        totalEvents,
        totalActions,
        tenantId,
        generatedAt: new Date()
      },
      message: `${totalObjects} objetos disponíveis em ${Object.keys(workflowObjects).length} categorias`
    });
    
  } catch (error: any) {
    console.error('Error fetching available workflow objects:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar objetos disponíveis para workflows',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW BUILDER - NODE TYPES & TEMPLATES
// ==========================================

// GET /api/workflow-builder/node-types - Tipos de nodes disponíveis para workflow
router.get('/node-types', async (req: any, res) => {
  try {
    
    const nodeTypes = {
      // TRIGGERS - Pontos de início do workflow
      triggers: [
        {
          type: 'schedule_trigger',
          name: 'Agendamento',
          icon: '⏰',
          description: 'Disparar workflow em horários específicos',
          config: ['frequency', 'time', 'timezone', 'days']
        },
        {
          type: 'webhook_trigger',
          name: 'Webhook',
          icon: '🔗',
          description: 'Disparar quando webhook é recebido',
          config: ['url', 'method', 'authentication']
        },
        {
          type: 'data_change_trigger',
          name: 'Mudança de Dados',
          icon: '🗄️',
          description: 'Disparar quando dados são alterados',
          config: ['dataSource', 'table', 'conditions']
        },
        {
          type: 'user_action_trigger',
          name: 'Ação do Usuário',
          icon: '👆',
          description: 'Disparar quando usuário executa ação',
          config: ['action', 'conditions', 'userRole']
        },
        {
          type: 'file_upload_trigger',
          name: 'Upload de Arquivo',
          icon: '📁',
          description: 'Disparar quando arquivo é enviado',
          config: ['fileType', 'location', 'size']
        }
      ],
      
      // ACTIONS - Ações que podem ser executadas
      actions: [
        {
          type: 'query_execution',
          name: 'Executar Query',
          icon: '🔍',
          description: 'Executar query TQL em banco de dados',
          config: ['queryId', 'parameters', 'outputVariable']
        },
        {
          type: 'task_creation',
          name: 'Criar Task',
          icon: '📋',
          description: 'Criar nova task para usuário',
          config: ['templateId', 'assignee', 'dueDate', 'priority']
        },
        {
          type: 'notification_send',
          name: 'Enviar Notificação',
          icon: '🔔',
          description: 'Enviar notificação para usuários',
          config: ['recipients', 'message', 'channels', 'priority']
        },
        {
          type: 'api_request',
          name: 'Requisição API',
          icon: '🔌',
          description: 'Fazer requisição para API externa',
          config: ['apiId', 'endpoint', 'method', 'payload']
        },
        {
          type: 'report_generation',
          name: 'Gerar Relatório',
          icon: '📊',
          description: 'Gerar relatório baseado em template',
          config: ['templateId', 'format', 'recipients', 'schedule']
        },
        {
          type: 'dashboard_update',
          name: 'Atualizar Dashboard',
          icon: '📈',
          description: 'Atualizar dados do dashboard',
          config: ['dashboardId', 'dataSource', 'widgets']
        },
        {
          type: 'email_send',
          name: 'Enviar Email',
          icon: '📧',
          description: 'Enviar email personalizado',
          config: ['recipients', 'subject', 'template', 'attachments']
        },
        {
          type: 'file_process',
          name: 'Processar Arquivo',
          icon: '⚙️',
          description: 'Processar arquivo enviado',
          config: ['fileId', 'processing', 'outputFormat']
        }
      ],
      
      // CONDITIONS - Condições e controle de fluxo
      conditions: [
        {
          type: 'if_condition',
          name: 'Condição Se/Então',
          icon: '🔀',
          description: 'Executar ação baseada em condição',
          config: ['variable', 'operator', 'value', 'trueAction', 'falseAction']
        },
        {
          type: 'switch_condition',
          name: 'Múltiplas Condições',
          icon: '🔄',
          description: 'Executar diferentes ações baseado em valor',
          config: ['variable', 'cases', 'defaultAction']
        },
        {
          type: 'loop_condition',
          name: 'Loop/Repetição',
          icon: '🔁',
          description: 'Repetir ações baseado em condição',
          config: ['variable', 'condition', 'maxIterations', 'actions']
        },
        {
          type: 'wait_condition',
          name: 'Aguardar',
          icon: '⏳',
          description: 'Pausar workflow por tempo determinado',
          config: ['duration', 'unit', 'condition']
        }
      ],
      
      // UTILITIES - Utilitários e ferramentas
      utilities: [
        {
          type: 'variable_set',
          name: 'Definir Variável',
          icon: '📝',
          description: 'Definir ou alterar variável do workflow',
          config: ['name', 'value', 'type', 'scope']
        },
        {
          type: 'data_transform',
          name: 'Transformar Dados',
          icon: '🔄',
          description: 'Transformar formato dos dados',
          config: ['input', 'transformation', 'output']
        },
        {
          type: 'log_activity',
          name: 'Registrar Log',
          icon: '📋',
          description: 'Registrar atividade no sistema',
          config: ['level', 'message', 'category']
        },
        {
          type: 'webhook_send',
          name: 'Enviar Webhook',
          icon: '📤',
          description: 'Enviar webhook para sistema externo',
          config: ['url', 'payload', 'headers', 'retry']
        }
      ]
    };
    
    // Calcular estatísticas
    const totalNodeTypes = Object.values(nodeTypes).reduce((sum, category: any) => {
      return sum + category.length;
    }, 0);
    
    res.json({
      success: true,
      data: nodeTypes,
      statistics: {
        totalCategories: Object.keys(nodeTypes).length,
        totalNodeTypes,
        triggers: nodeTypes.triggers.length,
        actions: nodeTypes.actions.length,
        conditions: nodeTypes.conditions.length,
        utilities: nodeTypes.utilities.length
      },
      message: `${totalNodeTypes} tipos de nodes disponíveis`
    });
    
  } catch (error: any) {
    console.error('Error fetching node types:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'internal_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar tipos de nodes',
        type: 'internal_error'
      });
    }
  }
});

export { router as workflowBuilderRoutes };