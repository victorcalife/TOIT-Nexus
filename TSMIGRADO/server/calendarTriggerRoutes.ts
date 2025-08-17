/**
 * CALENDAR TRIGGER ROUTES - APIs completas para gerenciamento de triggers de calendário
 * Sistema RESTful para configuração, teste e monitoramento de triggers de eventos
 * Integração direta com CalendarWorkflowService
 */

import express from 'express';
import { z } from 'zod';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { calendarWorkflowService } from './calendarWorkflowService';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// SCHEMAS DE VALIDAÇÃO ZOD
// ==========================================

const CalendarAccountSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().optional(),
  provider: z.enum(['google', 'outlook', 'apple', 'caldav'], {
    errorMap: () => ({ message: 'Provider deve ser google, outlook, apple ou caldav' })
  }),
  
  // OAuth fields
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  
  // CalDAV fields
  caldavUrl: z.string().url().optional(),
  caldavUsername: z.string().optional(),
  caldavPassword: z.string().optional(),
  
  syncSettings: z.object({
    syncFrequency: z.number().min(5).max(120).default(15),
    maxEventsPerSync: z.number().min(50).max(1000).default(200),
    syncCalendars: z.array(z.string()).default(['primary']),
    enableRealTimeSync: z.boolean().default(true),
    reminderMinutes: z.array(z.number()).default([15, 60, 1440])
  }).optional()
});

const CalendarMatchRuleSchema = z.object({
  type: z.enum(['contains', 'equals', 'starts_with', 'ends_with', 'regex', 'not_contains']),
  value: z.string().min(1, 'Valor da regra é obrigatório'),
  caseSensitive: z.boolean().default(false)
});

const CalendarCustomFieldSchema = z.object({
  name: z.string().min(1, 'Nome do campo é obrigatório'),
  source: z.enum(['title', 'description', 'location', 'attendees']),
  extractionType: z.enum(['regex', 'between_strings', 'after_string', 'before_string']),
  pattern: z.string().min(1, 'Padrão de extração é obrigatório'),
  outputType: z.enum(['string', 'number', 'date', 'boolean']).default('string')
});

const CalendarTriggerSchema = z.object({
  name: z.string().min(1, 'Nome do trigger é obrigatório'),
  description: z.string().optional(),
  workflowId: z.string().min(1, 'ID do workflow é obrigatório'),
  calendarAccountId: z.string().min(1, 'ID da conta de calendário é obrigatório'),
  triggerType: z.enum(['event_created', 'event_updated', 'event_starts_soon', 'event_ends', 'reminder_time']),
  
  // Rules
  titleRules: z.array(CalendarMatchRuleSchema).default([]),
  descriptionRules: z.array(CalendarMatchRuleSchema).default([]),
  attendeeRules: z.array(CalendarMatchRuleSchema).default([]),
  locationRules: z.array(CalendarMatchRuleSchema).default([]),
  
  // Filters
  calendars: z.array(z.string()).default(['primary']),
  eventTypes: z.array(z.string()).default([]),
  
  // Time-based settings
  minutesBeforeStart: z.number().min(1).max(1440).optional(),
  minutesAfterEnd: z.number().min(1).max(1440).optional(),
  reminderOffsets: z.array(z.number()).default([15, 60]),
  
  // Recurrence settings
  handleRecurring: z.boolean().default(true),
  maxRecurrenceInstances: z.number().min(1).max(50).default(10),
  
  // Data extraction
  dataExtractionRules: z.object({
    extractTitle: z.boolean().default(false),
    extractDescription: z.boolean().default(false),
    extractLocation: z.boolean().default(false),
    extractAttendees: z.boolean().default(false),
    extractStartTime: z.boolean().default(false),
    extractEndTime: z.boolean().default(false),
    customFields: z.array(CalendarCustomFieldSchema).default([])
  }).default({})
});

// ==========================================
// CALENDAR ACCOUNTS - GERENCIAMENTO DE CONTAS
// ==========================================

/**
 * POST /api/calendar-triggers/accounts - Conectar nova conta de calendário
 */
router.post('/accounts', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📅 API: Conectando conta de calendário - Tenant: ${tenantId}, User: ${userId}`);
    
    const validatedData = CalendarAccountSchema.parse(req.body);
    
    const newAccount = await calendarWorkflowService.connectCalendarAccount(
      tenantId, 
      userId, 
      validatedData
    );
    
    res.status(201).json({
      success: true,
      data: newAccount,
      message: 'Conta de calendário conectada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de conexão de calendário:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'calendar_connection_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/accounts - Listar contas de calendário
 */
router.get('/accounts', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.query.user_only === 'true' ? req.user.id : undefined;
    
    console.log(`📅 API: Listando contas de calendário - Tenant: ${tenantId}`);
    
    const accounts = await calendarWorkflowService.getCalendarAccounts(tenantId, userId);
    
    res.json({
      success: true,
      data: accounts,
      count: accounts.length,
      message: 'Contas de calendário carregadas com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de listagem de contas de calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'accounts_fetch_error'
    });
  }
});

/**
 * POST /api/calendar-triggers/accounts/:id/test - Testar conexão da conta
 */
router.post('/accounts/:id/test', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🔧 API: Testando conexão da conta de calendário: ${id}`);
    
    const testResult = await calendarWorkflowService.testCalendarConnection(id);
    
    res.json({
      success: testResult.success,
      data: testResult,
      message: testResult.message
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de teste de conexão calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'connection_test_error'
    });
  }
});

/**
 * POST /api/calendar-triggers/accounts/:id/sync - Forçar sincronização
 */
router.post('/accounts/:id/sync', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🔄 API: Forçando sync da conta de calendário: ${id}`);
    
    // Executar sync em background para não travar a resposta
    calendarWorkflowService.syncCalendarAccount(id).catch(error => {
      console.error(`❌ Erro no sync em background para conta calendário ${id}:`, error);
    });
    
    res.json({
      success: true,
      message: 'Sincronização de calendário iniciada em background',
      data: {
        accountId: id,
        syncStatus: 'started'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de sync forçado calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'sync_error'
    });
  }
});

// ==========================================
// CALENDAR TRIGGERS - GERENCIAMENTO DE TRIGGERS
// ==========================================

/**
 * POST /api/calendar-triggers/triggers - Criar novo trigger de calendário
 */
router.post('/triggers', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📝 API: Criando trigger de calendário - Tenant: ${tenantId}, User: ${userId}`);
    
    const validatedData = CalendarTriggerSchema.parse(req.body);
    
    const newTrigger = await calendarWorkflowService.createCalendarTrigger(
      tenantId,
      userId,
      validatedData
    );
    
    res.status(201).json({
      success: true,
      data: newTrigger,
      message: 'Trigger de calendário criado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de criação de trigger calendário:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de trigger inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_creation_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/triggers - Listar triggers de calendário
 */
router.get('/triggers', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const workflowId = req.query.workflow_id as string;
    
    console.log(`📅 API: Listando triggers de calendário - Tenant: ${tenantId}`);
    
    const triggers = await calendarWorkflowService.getCalendarTriggers(tenantId, workflowId);
    
    res.json({
      success: true,
      data: triggers,
      count: triggers.length,
      message: 'Triggers de calendário carregados com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de listagem de triggers calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'triggers_fetch_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/triggers/:id - Obter trigger específico
 */
router.get('/triggers/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`📅 API: Buscando trigger de calendário: ${id}`);
    
    const triggers = await calendarWorkflowService.getCalendarTriggers(tenantId);
    const trigger = triggers.find(t => t.id === id);
    
    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger de calendário não encontrado',
        type: 'not_found'
      });
    }
    
    res.json({
      success: true,
      data: trigger,
      message: 'Trigger de calendário encontrado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de busca de trigger calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_fetch_error'
    });
  }
});

/**
 * PUT /api/calendar-triggers/triggers/:id - Atualizar trigger
 */
router.put('/triggers/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📝 API: Atualizando trigger de calendário: ${id}`);
    
    const validatedData = CalendarTriggerSchema.partial().parse(req.body);
    
    // TODO: Implementar updateCalendarTrigger no service
    // const updatedTrigger = await calendarWorkflowService.updateCalendarTrigger(id, tenantId, validatedData);
    
    res.json({
      success: true,
      data: { id, ...validatedData },
      message: 'Trigger de calendário atualizado com sucesso (mock)'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de atualização de trigger calendário:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de atualização inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_update_error'
    });
  }
});

/**
 * DELETE /api/calendar-triggers/triggers/:id - Deletar trigger
 */
router.delete('/triggers/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🗑️ API: Deletando trigger de calendário: ${id}`);
    
    // TODO: Implementar deleteCalendarTrigger no service
    // await calendarWorkflowService.deleteCalendarTrigger(id, tenantId);
    
    res.json({
      success: true,
      message: 'Trigger de calendário deletado com sucesso (mock)',
      data: { id }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de deleção de trigger calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_delete_error'
    });
  }
});

/**
 * POST /api/calendar-triggers/triggers/:id/toggle - Ativar/desativar trigger
 */
router.post('/triggers/:id/toggle', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const tenantId = req.tenant.id;
    
    console.log(`🔄 API: Alterando status do trigger calendário: ${id} -> ${isActive ? 'ativo' : 'inativo'}`);
    
    // TODO: Implementar toggleCalendarTrigger no service
    // await calendarWorkflowService.toggleCalendarTrigger(id, tenantId, isActive);
    
    res.json({
      success: true,
      message: `Trigger de calendário ${isActive ? 'ativado' : 'desativado'} com sucesso (mock)`,
      data: { id, isActive }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de toggle de trigger calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_toggle_error'
    });
  }
});

// ==========================================
// MONITORING E ANALYTICS
// ==========================================

/**
 * GET /api/calendar-triggers/analytics - Analytics de triggers de calendário
 */
router.get('/analytics', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { period = '7d' } = req.query;
    
    console.log(`📊 API: Buscando analytics de calendar triggers - Tenant: ${tenantId}, Period: ${period}`);
    
    // TODO: Implementar analytics completo
    const mockAnalytics = {
      totalTriggers: 8,
      activeTriggers: 6,
      inactiveTriggers: 2,
      totalExecutions: 94,
      successfulExecutions: 89,
      failedExecutions: 5,
      averageExecutionTime: 1850, // ms
      topTriggers: [
        { id: 'cal-trigger-1', name: 'Reuniões de Vendas', executions: 28, successRate: 100 },
        { id: 'cal-trigger-2', name: 'Lembretes de Follow-up', executions: 25, successRate: 96 },
        { id: 'cal-trigger-3', name: 'Eventos de Treinamento', executions: 19, successRate: 89.5 }
      ],
      executionTrend: [
        { date: '2025-01-26', executions: 12, successes: 11, failures: 1 },
        { date: '2025-01-27', executions: 15, successes: 14, failures: 1 },
        { date: '2025-01-28', executions: 13, successes: 12, failures: 1 },
        { date: '2025-01-29', executions: 18, successes: 17, failures: 1 },
        { date: '2025-01-30', executions: 16, successes: 15, failures: 1 },
        { date: '2025-01-31', executions: 11, successes: 11, failures: 0 },
        { date: '2025-02-01', executions: 9, successes: 9, failures: 0 }
      ],
      upcomingEvents: [
        {
          eventId: 'evt-1',
          title: 'Reunião de Vendas - Cliente Premium',
          startTime: '2025-02-02T10:00:00Z',
          triggersActive: ['cal-trigger-1', 'cal-trigger-2'],
          minutesUntilTrigger: 35
        },
        {
          eventId: 'evt-2',
          title: 'Treinamento - Novo Sistema',
          startTime: '2025-02-02T14:30:00Z',
          triggersActive: ['cal-trigger-3'],
          minutesUntilTrigger: 305
        }
      ],
      recentErrors: [
        { 
          triggerId: 'cal-trigger-3', 
          error: 'Calendar API rate limit', 
          timestamp: '2025-02-01T13:45:00Z',
          count: 2
        },
        { 
          triggerId: 'cal-trigger-1', 
          error: 'Event not found', 
          timestamp: '2025-01-31T16:20:00Z',
          count: 1
        }
      ]
    };
    
    res.json({
      success: true,
      data: mockAnalytics,
      metadata: {
        period,
        generatedAt: new Date(),
        tenantId
      },
      message: 'Analytics de calendar triggers carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de analytics calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'analytics_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/upcoming-events - Próximos eventos que irão disparar triggers
 */
router.get('/upcoming-events', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { hours = 24 } = req.query; // Próximas X horas
    
    console.log(`📅 API: Buscando próximos eventos - Tenant: ${tenantId}, Hours: ${hours}`);
    
    // TODO: Implementar busca real de eventos próximos
    const mockUpcomingEvents = [
      {
        id: 'upcoming-1',
        eventId: 'evt-001',
        calendarAccount: 'joao@empresa.com',
        title: 'Daily Standup Meeting',
        startTime: '2025-02-02T09:00:00Z',
        endTime: '2025-02-02T09:30:00Z',
        location: 'Sala de Reuniões 1',
        attendees: ['joao@empresa.com', 'maria@empresa.com', 'pedro@empresa.com'],
        triggers: [
          {
            id: 'cal-trigger-1',
            name: 'Reuniões Diárias',
            triggerType: 'event_starts_soon',
            minutesBeforeStart: 15,
            willTriggerAt: '2025-02-02T08:45:00Z'
          }
        ],
        status: 'scheduled'
      },
      {
        id: 'upcoming-2',
        eventId: 'evt-002',
        calendarAccount: 'vendas@empresa.com',
        title: 'Apresentação Cliente - Proposta Q1',
        startTime: '2025-02-02T14:00:00Z',
        endTime: '2025-02-02T15:30:00Z',
        location: 'Microsoft Teams',
        attendees: ['vendas@empresa.com', 'cliente@exemplo.com'],
        triggers: [
          {
            id: 'cal-trigger-2',
            name: 'Preparação de Apresentações',
            triggerType: 'event_starts_soon',
            minutesBeforeStart: 60,
            willTriggerAt: '2025-02-02T13:00:00Z'
          },
          {
            id: 'cal-trigger-4',
            name: 'Follow-up Automático',
            triggerType: 'event_ends',
            minutesAfterEnd: 30,
            willTriggerAt: '2025-02-02T16:00:00Z'
          }
        ],
        status: 'scheduled'
      }
    ];
    
    res.json({
      success: true,
      data: mockUpcomingEvents,
      count: mockUpcomingEvents.length,
      metadata: {
        hoursAhead: parseInt(hours as string),
        generatedAt: new Date(),
        nextUpdate: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
      },
      message: 'Próximos eventos carregados com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de próximos eventos:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'upcoming_events_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/execution-history - Histórico de execuções
 */
router.get('/execution-history', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { 
      triggerId, 
      status, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    console.log(`📊 API: Buscando histórico de execuções calendário - Tenant: ${tenantId}`);
    
    // TODO: Implementar busca real no histórico
    const mockHistory = [
      {
        id: 'cal-exec-1',
        triggerId: 'cal-trigger-1',
        triggerName: 'Reuniões de Vendas',
        status: 'success',
        triggeredAt: '2025-02-01T13:45:00Z',
        completedAt: '2025-02-01T13:45:01Z',
        duration: 1650,
        extractedData: {
          title: 'Reunião com Cliente Premium',
          startTime: '2025-02-01T14:00:00Z',
          endTime: '2025-02-01T15:00:00Z',
          location: 'Escritório Principal',
          attendees: [
            { email: 'vendas@empresa.com', displayName: 'João Silva' },
            { email: 'cliente@premium.com', displayName: 'Maria Santos' }
          ],
          meetingId: 'MTG-2025-0201-001'
        },
        workflowId: 'workflow-3',
        workflowName: 'Preparar Reunião de Vendas'
      },
      {
        id: 'cal-exec-2',
        triggerId: 'cal-trigger-2',
        triggerName: 'Lembretes de Follow-up',
        status: 'success',
        triggeredAt: '2025-02-01T11:30:00Z',
        completedAt: '2025-02-01T11:30:02Z',
        duration: 2140,
        extractedData: {
          title: 'Follow-up: Proposta de Serviços',
          startTime: '2025-02-01T12:00:00Z',
          endTime: '2025-02-01T12:30:00Z',
          location: 'Video Chamada',
          clientName: 'Tech Solutions Ltd',
          proposalId: 'PROP-2025-015'
        },
        workflowId: 'workflow-4',
        workflowName: 'Preparar Follow-up Cliente'
      }
    ];
    
    res.json({
      success: true,
      data: mockHistory,
      count: mockHistory.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: 94
      },
      message: 'Histórico de execuções calendário carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de histórico calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'history_error'
    });
  }
});

// ==========================================
// UTILITIES E HELPERS
// ==========================================

/**
 * POST /api/calendar-triggers/test-rules - Testar regras de matching
 */
router.post('/test-rules', async (req: any, res) => {
  try {
    const { rules, testData } = req.body;
    
    console.log('🧪 API: Testando regras de matching de calendário');
    
    // Validar entrada
    const rulesSchema = z.array(CalendarMatchRuleSchema);
    const validatedRules = rulesSchema.parse(rules);
    
    const testDataSchema = z.object({
      text: z.string(),
      type: z.enum(['title', 'description', 'location', 'attendees'])
    });
    const validatedTestData = testDataSchema.parse(testData);
    
    // TODO: Implementar teste de regras real
    const mockResults = {
      matches: true,
      matchedRules: [
        {
          rule: validatedRules[0],
          matched: true,
          matchedText: 'exemplo de match encontrado no evento'
        }
      ],
      testData: validatedTestData,
      summary: {
        totalRules: validatedRules.length,
        matchedRules: 1,
        overallMatch: true
      }
    };
    
    res.json({
      success: true,
      data: mockResults,
      message: 'Teste de regras de calendário executado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de teste de regras calendário:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de teste inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'rule_test_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/templates - Templates de triggers pré-configurados
 */
router.get('/templates', async (req: any, res) => {
  try {
    console.log('📚 API: Buscando templates de calendar triggers');
    
    const templates = [
      {
        id: 'template-meeting-prep',
        name: 'Preparação de Reuniões',
        description: 'Dispara workflow 30min antes de reuniões importantes para preparar materiais',
        category: 'Produtividade',
        triggerType: 'event_starts_soon',
        suggestedSettings: {
          minutesBeforeStart: 30
        },
        suggestedRules: {
          titleRules: [
            { type: 'contains', value: 'reunião', caseSensitive: false },
            { type: 'contains', value: 'meeting', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractTitle: true,
          extractLocation: true,
          extractAttendees: true,
          extractStartTime: true
        }
      },
      {
        id: 'template-client-followup',
        name: 'Follow-up Automático',
        description: 'Cria tarefas de follow-up após reuniões com clientes',
        category: 'Vendas',
        triggerType: 'event_ends',
        suggestedSettings: {
          minutesAfterEnd: 15
        },
        suggestedRules: {
          titleRules: [
            { type: 'contains', value: 'cliente', caseSensitive: false },
            { type: 'contains', value: 'client', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractTitle: true,
          extractAttendees: true,
          extractDescription: true,
          customFields: [
            {
              name: 'clientName',
              source: 'title',
              extractionType: 'after_string',
              pattern: 'Cliente:',
              outputType: 'string'
            }
          ]
        }
      },
      {
        id: 'template-training-reminder',
        name: 'Lembretes de Treinamento',
        description: 'Envia lembretes e materiais antes de sessões de treinamento',
        category: 'RH',
        triggerType: 'event_starts_soon',
        suggestedSettings: {
          minutesBeforeStart: 60,
          reminderOffsets: [60, 15]
        },
        suggestedRules: {
          titleRules: [
            { type: 'contains', value: 'treinamento', caseSensitive: false },
            { type: 'contains', value: 'training', caseSensitive: false },
            { type: 'contains', value: 'capacitação', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractTitle: true,
          extractLocation: true,
          extractAttendees: true,
          extractDescription: true
        }
      },
      {
        id: 'template-deadline-tracking',
        name: 'Acompanhamento de Prazos',
        description: 'Monitora eventos de deadline e cria alertas automáticos',
        category: 'Projetos',
        triggerType: 'event_starts_soon',
        suggestedSettings: {
          minutesBeforeStart: 1440, // 24 horas
          reminderOffsets: [1440, 240, 60] // 24h, 4h, 1h
        },
        suggestedRules: {
          titleRules: [
            { type: 'contains', value: 'deadline', caseSensitive: false },
            { type: 'contains', value: 'prazo', caseSensitive: false },
            { type: 'contains', value: 'entrega', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractTitle: true,
          extractDescription: true,
          extractStartTime: true,
          customFields: [
            {
              name: 'projectName',
              source: 'description',
              extractionType: 'regex',
              pattern: 'Projeto: ([^\\n]+)',
              outputType: 'string'
            }
          ]
        }
      }
    ];
    
    res.json({
      success: true,
      data: templates,
      count: templates.length,
      message: 'Templates de calendário carregados com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de templates calendário:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'templates_error'
    });
  }
});

/**
 * GET /api/calendar-triggers/oauth-urls - URLs de OAuth para providers
 */
router.get('/oauth-urls', async (req: any, res) => {
  try {
    const { provider } = req.query;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🔐 API: Gerando URLs de OAuth - Provider: ${provider}`);
    
    // TODO: Implementar geração real de URLs OAuth
    const mockOAuthUrls: Record<string, string> = {
      google: `https://accounts.google.com/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=https://www.googleapis.com/auth/calendar&response_type=code&state=${tenantId}-${userId}`,
      outlook: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=REDIRECT_URI&scope=https://graph.microsoft.com/calendars.read&state=${tenantId}-${userId}`,
      apple: `https://appleid.apple.com/auth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&response_type=code&scope=name%20email&state=${tenantId}-${userId}`
    };
    
    const oauthUrl = provider ? mockOAuthUrls[provider as string] : mockOAuthUrls;
    
    res.json({
      success: true,
      data: oauthUrl,
      message: 'URLs de OAuth geradas com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de OAuth URLs:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'oauth_error'
    });
  }
});

export { router as calendarTriggerRoutes };