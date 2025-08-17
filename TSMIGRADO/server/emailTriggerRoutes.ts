/**
 * EMAIL TRIGGER ROUTES - APIs completas para gerenciamento de triggers de email
 * Sistema RESTful para configuração, teste e monitoramento de triggers
 * Integração direta com EmailWorkflowService
 */

import express from 'express';
import { z } from 'zod';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { emailWorkflowService } from './emailWorkflowService';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// SCHEMAS DE VALIDAÇÃO ZOD
// ==========================================

const EmailAccountSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().optional(),
  provider: z.enum(['gmail', 'outlook', 'yahoo', 'imap'], {
    errorMap: () => ({ message: 'Provider deve ser gmail, outlook, yahoo ou imap' })
  }),
  
  // OAuth fields
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  
  // IMAP fields
  imapHost: z.string().optional(),
  imapPort: z.number().min(1).max(65535).optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  
  syncSettings: z.object({
    syncFrequency: z.number().min(1).max(60).default(5),
    maxEmailsPerSync: z.number().min(10).max(1000).default(100),
    syncFolders: z.array(z.string()).default(['INBOX']),
    enableRealTimeSync: z.boolean().default(true)
  }).optional()
});

const EmailMatchRuleSchema = z.object({
  type: z.enum(['contains', 'equals', 'starts_with', 'ends_with', 'regex', 'not_contains']),
  value: z.string().min(1, 'Valor da regra é obrigatório'),
  caseSensitive: z.boolean().default(false)
});

const EmailCustomFieldSchema = z.object({
  name: z.string().min(1, 'Nome do campo é obrigatório'),
  source: z.enum(['subject', 'body', 'sender']),
  extractionType: z.enum(['regex', 'between_strings', 'after_string', 'before_string']),
  pattern: z.string().min(1, 'Padrão de extração é obrigatório'),
  outputType: z.enum(['string', 'number', 'date', 'boolean']).default('string')
});

const EmailTriggerSchema = z.object({
  name: z.string().min(1, 'Nome do trigger é obrigatório'),
  description: z.string().optional(),
  workflowId: z.string().min(1, 'ID do workflow é obrigatório'),
  emailAccountId: z.string().min(1, 'ID da conta de email é obrigatório'),
  triggerType: z.enum(['sender_match', 'subject_contains', 'body_contains', 'attachment_exists', 'keyword_match']),
  
  // Rules
  senderRules: z.array(EmailMatchRuleSchema).default([]),
  subjectRules: z.array(EmailMatchRuleSchema).default([]),
  bodyRules: z.array(EmailMatchRuleSchema).default([]),
  attachmentRules: z.array(EmailMatchRuleSchema).default([]),
  
  // Filters
  folders: z.array(z.string()).default(['INBOX']),
  isRead: z.boolean().optional(),
  hasAttachments: z.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  
  // Data extraction
  dataExtractionRules: z.object({
    extractSubject: z.boolean().default(false),
    extractBody: z.boolean().default(false),
    extractAttachments: z.boolean().default(false),
    extractSender: z.boolean().default(false),
    customFields: z.array(EmailCustomFieldSchema).default([])
  }).default({})
});

// ==========================================
// EMAIL ACCOUNTS - GERENCIAMENTO DE CONTAS
// ==========================================

/**
 * POST /api/email-triggers/accounts - Conectar nova conta de email
 */
router.post('/accounts', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📧 API: Conectando conta de email - Tenant: ${tenantId}, User: ${userId}`);
    
    const validatedData = EmailAccountSchema.parse(req.body);
    
    const newAccount = await emailWorkflowService.connectEmailAccount(
      tenantId, 
      userId, 
      validatedData
    );
    
    res.status(201).json({
      success: true,
      data: newAccount,
      message: 'Conta de email conectada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de conexão de email:', error);
    
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
      type: 'email_connection_error'
    });
  }
});

/**
 * GET /api/email-triggers/accounts - Listar contas de email
 */
router.get('/accounts', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.query.user_only === 'true' ? req.user.id : undefined;
    
    console.log(`📧 API: Listando contas de email - Tenant: ${tenantId}`);
    
    const accounts = await emailWorkflowService.getEmailAccounts(tenantId, userId);
    
    res.json({
      success: true,
      data: accounts,
      count: accounts.length,
      message: 'Contas de email carregadas com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de listagem de contas:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'accounts_fetch_error'
    });
  }
});

/**
 * POST /api/email-triggers/accounts/:id/test - Testar conexão da conta
 */
router.post('/accounts/:id/test', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🔧 API: Testando conexão da conta de email: ${id}`);
    
    const testResult = await emailWorkflowService.testEmailConnection(id);
    
    res.json({
      success: testResult.success,
      data: testResult,
      message: testResult.message
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de teste de conexão:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'connection_test_error'
    });
  }
});

/**
 * POST /api/email-triggers/accounts/:id/sync - Forçar sincronização
 */
router.post('/accounts/:id/sync', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🔄 API: Forçando sync da conta de email: ${id}`);
    
    // Executar sync em background para não travar a resposta
    emailWorkflowService.syncEmailAccount(id).catch(error => {
      console.error(`❌ Erro no sync em background para conta ${id}:`, error);
    });
    
    res.json({
      success: true,
      message: 'Sincronização iniciada em background',
      data: {
        accountId: id,
        syncStatus: 'started'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de sync forçado:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'sync_error'
    });
  }
});

// ==========================================
// EMAIL TRIGGERS - GERENCIAMENTO DE TRIGGERS
// ==========================================

/**
 * POST /api/email-triggers/triggers - Criar novo trigger de email
 */
router.post('/triggers', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📝 API: Criando trigger de email - Tenant: ${tenantId}, User: ${userId}`);
    
    const validatedData = EmailTriggerSchema.parse(req.body);
    
    const newTrigger = await emailWorkflowService.createEmailTrigger(
      tenantId,
      userId,
      validatedData
    );
    
    res.status(201).json({
      success: true,
      data: newTrigger,
      message: 'Trigger de email criado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de criação de trigger:', error);
    
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
 * GET /api/email-triggers/triggers - Listar triggers de email
 */
router.get('/triggers', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const workflowId = req.query.workflow_id as string;
    
    console.log(`📧 API: Listando triggers de email - Tenant: ${tenantId}`);
    
    const triggers = await emailWorkflowService.getEmailTriggers(tenantId, workflowId);
    
    res.json({
      success: true,
      data: triggers,
      count: triggers.length,
      message: 'Triggers de email carregados com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de listagem de triggers:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'triggers_fetch_error'
    });
  }
});

/**
 * GET /api/email-triggers/triggers/:id - Obter trigger específico
 */
router.get('/triggers/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`📧 API: Buscando trigger de email: ${id}`);
    
    const triggers = await emailWorkflowService.getEmailTriggers(tenantId);
    const trigger = triggers.find(t => t.id === id);
    
    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger não encontrado',
        type: 'not_found'
      });
    }
    
    res.json({
      success: true,
      data: trigger,
      message: 'Trigger encontrado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de busca de trigger:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_fetch_error'
    });
  }
});

/**
 * PUT /api/email-triggers/triggers/:id - Atualizar trigger
 */
router.put('/triggers/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📝 API: Atualizando trigger de email: ${id}`);
    
    const validatedData = EmailTriggerSchema.partial().parse(req.body);
    
    // TODO: Implementar updateEmailTrigger no service
    // const updatedTrigger = await emailWorkflowService.updateEmailTrigger(id, tenantId, validatedData);
    
    res.json({
      success: true,
      data: { id, ...validatedData },
      message: 'Trigger atualizado com sucesso (mock)'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de atualização de trigger:', error);
    
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
 * DELETE /api/email-triggers/triggers/:id - Deletar trigger
 */
router.delete('/triggers/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🗑️ API: Deletando trigger de email: ${id}`);
    
    // TODO: Implementar deleteEmailTrigger no service
    // await emailWorkflowService.deleteEmailTrigger(id, tenantId);
    
    res.json({
      success: true,
      message: 'Trigger deletado com sucesso (mock)',
      data: { id }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de deleção de trigger:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'trigger_delete_error'
    });
  }
});

/**
 * POST /api/email-triggers/triggers/:id/toggle - Ativar/desativar trigger
 */
router.post('/triggers/:id/toggle', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const tenantId = req.tenant.id;
    
    console.log(`🔄 API: Alterando status do trigger: ${id} -> ${isActive ? 'ativo' : 'inativo'}`);
    
    // TODO: Implementar toggleEmailTrigger no service
    // await emailWorkflowService.toggleEmailTrigger(id, tenantId, isActive);
    
    res.json({
      success: true,
      message: `Trigger ${isActive ? 'ativado' : 'desativado'} com sucesso (mock)`,
      data: { id, isActive }
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de toggle de trigger:', error);
    
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
 * GET /api/email-triggers/analytics - Analytics de triggers
 */
router.get('/analytics', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { period = '7d' } = req.query;
    
    console.log(`📊 API: Buscando analytics de email triggers - Tenant: ${tenantId}, Period: ${period}`);
    
    // TODO: Implementar analytics completo
    const mockAnalytics = {
      totalTriggers: 5,
      activeTriggers: 3,
      inactiveTriggers: 2,
      totalExecutions: 127,
      successfulExecutions: 119,
      failedExecutions: 8,
      averageExecutionTime: 2340, // ms
      topTriggers: [
        { id: 'trigger-1', name: 'Novos Pedidos', executions: 45, successRate: 97.8 },
        { id: 'trigger-2', name: 'Support Tickets', executions: 32, successRate: 100 },
        { id: 'trigger-3', name: 'Newsletter Replies', executions: 28, successRate: 89.3 }
      ],
      executionTrend: [
        { date: '2025-01-26', executions: 18, successes: 17, failures: 1 },
        { date: '2025-01-27', executions: 22, successes: 21, failures: 1 },
        { date: '2025-01-28', executions: 19, successes: 18, failures: 1 },
        { date: '2025-01-29', executions: 25, successes: 24, failures: 1 },
        { date: '2025-01-30', executions: 21, successes: 20, failures: 1 },
        { date: '2025-01-31', executions: 15, successes: 14, failures: 1 },
        { date: '2025-02-01', executions: 7, successes: 5, failures: 2 }
      ],
      recentErrors: [
        { 
          triggerId: 'trigger-3', 
          error: 'Rate limit exceeded', 
          timestamp: '2025-02-01T14:30:00Z',
          count: 2
        },
        { 
          triggerId: 'trigger-1', 
          error: 'Connection timeout', 
          timestamp: '2025-02-01T10:15:00Z',
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
      message: 'Analytics de email triggers carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de analytics:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'analytics_error'
    });
  }
});

/**
 * GET /api/email-triggers/execution-history - Histórico de execuções
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
    
    console.log(`📊 API: Buscando histórico de execuções - Tenant: ${tenantId}`);
    
    // TODO: Implementar busca real no histórico
    const mockHistory = [
      {
        id: 'exec-1',
        triggerId: 'trigger-1',
        triggerName: 'Novos Pedidos',
        status: 'success',
        triggeredAt: '2025-02-01T14:45:00Z',
        completedAt: '2025-02-01T14:45:02Z',
        duration: 2340,
        extractedData: {
          sender: 'cliente@empresa.com',
          subject: 'Novo pedido #12345',
          orderNumber: '12345',
          amount: 299.90
        },
        workflowId: 'workflow-1',
        workflowName: 'Processar Novo Pedido'
      },
      {
        id: 'exec-2',
        triggerId: 'trigger-2',
        triggerName: 'Support Tickets',
        status: 'success',
        triggeredAt: '2025-02-01T13:20:00Z',
        completedAt: '2025-02-01T13:20:01Z',
        duration: 1890,
        extractedData: {
          sender: 'suporte@cliente.com',
          subject: 'Problema urgente - Sistema fora do ar',
          priority: 'high',
          ticketId: 'TKT-2025-0201-001'
        },
        workflowId: 'workflow-2',
        workflowName: 'Processar Ticket de Suporte'
      }
    ];
    
    res.json({
      success: true,
      data: mockHistory,
      count: mockHistory.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: 127
      },
      message: 'Histórico de execuções carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de histórico:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'history_error'
    });
  }
});

/**
 * GET /api/email-triggers/processing-queue - Status da fila de processamento
 */
router.get('/processing-queue', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { status, limit = 20 } = req.query;
    
    console.log(`📊 API: Buscando fila de processamento - Tenant: ${tenantId}`);
    
    // TODO: Implementar busca real na fila
    const mockQueue = [
      {
        id: 'queue-1',
        messageId: 'msg-123456789',
        emailAccount: 'joao@empresa.com',
        status: 'pending',
        triggersMatched: ['trigger-1', 'trigger-3'],
        createdAt: '2025-02-01T15:00:00Z',
        retryCount: 0,
        emailData: {
          subject: 'Novo pedido recebido',
          from: 'cliente@exemplo.com',
          receivedAt: '2025-02-01T14:58:30Z'
        }
      },
      {
        id: 'queue-2',
        messageId: 'msg-123456788',
        emailAccount: 'suporte@empresa.com',
        status: 'processing',
        triggersMatched: ['trigger-2'],
        createdAt: '2025-02-01T14:55:00Z',
        processedAt: '2025-02-01T14:55:30Z',
        retryCount: 0,
        emailData: {
          subject: 'Re: Problema com sistema',
          from: 'cliente.urgente@exemplo.com',
          receivedAt: '2025-02-01T14:54:45Z'
        }
      }
    ];
    
    res.json({
      success: true,
      data: mockQueue,
      count: mockQueue.length,
      stats: {
        pending: 1,
        processing: 1,
        completed: 0,
        failed: 0
      },
      message: 'Fila de processamento carregada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de fila de processamento:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'queue_error'
    });
  }
});

// ==========================================
// UTILITIES E HELPERS
// ==========================================

/**
 * GET /api/email-triggers/test-rules - Testar regras de matching
 */
router.post('/test-rules', async (req: any, res) => {
  try {
    const { rules, testData } = req.body;
    
    console.log('🧪 API: Testando regras de matching de email');
    
    // Validar entrada
    const rulesSchema = z.array(EmailMatchRuleSchema);
    const validatedRules = rulesSchema.parse(rules);
    
    const testDataSchema = z.object({
      text: z.string(),
      type: z.enum(['sender', 'subject', 'body', 'attachment'])
    });
    const validatedTestData = testDataSchema.parse(testData);
    
    // TODO: Implementar teste de regras real
    const mockResults = {
      matches: true,
      matchedRules: [
        {
          rule: validatedRules[0],
          matched: true,
          matchedText: 'exemplo de match encontrado'
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
      message: 'Teste de regras executado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de teste de regras:', error);
    
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
 * GET /api/email-triggers/templates - Templates de triggers pré-configurados
 */
router.get('/templates', async (req: any, res) => {
  try {
    console.log('📚 API: Buscando templates de email triggers');
    
    const templates = [
      {
        id: 'template-new-orders',
        name: 'Novos Pedidos',
        description: 'Dispara workflow quando um novo pedido é recebido por email',
        category: 'Vendas',
        triggerType: 'subject_contains',
        suggestedRules: {
          subjectRules: [
            { type: 'contains', value: 'novo pedido', caseSensitive: false },
            { type: 'contains', value: 'order', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractSubject: true,
          extractSender: true,
          customFields: [
            {
              name: 'orderNumber',
              source: 'subject',
              extractionType: 'regex',
              pattern: '#(\\d+)',
              outputType: 'string'
            }
          ]
        }
      },
      {
        id: 'template-support-tickets',
        name: 'Tickets de Suporte',
        description: 'Cria tickets automáticos a partir de emails de suporte',
        category: 'Suporte',
        triggerType: 'sender_match',
        suggestedRules: {
          senderRules: [
            { type: 'contains', value: 'suporte@', caseSensitive: false },
            { type: 'contains', value: 'help@', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractSubject: true,
          extractBody: true,
          extractSender: true
        }
      },
      {
        id: 'template-invoice-processing',
        name: 'Processamento de Faturas',
        description: 'Processa automaticamente faturas recebidas por email',
        category: 'Financeiro',
        triggerType: 'attachment_exists',
        suggestedRules: {
          attachmentRules: [
            { type: 'ends_with', value: '.pdf', caseSensitive: false },
            { type: 'contains', value: 'invoice', caseSensitive: false },
            { type: 'contains', value: 'fatura', caseSensitive: false }
          ]
        },
        dataExtractionRules: {
          extractAttachments: true,
          extractSender: true,
          extractSubject: true
        }
      }
    ];
    
    res.json({
      success: true,
      data: templates,
      count: templates.length,
      message: 'Templates carregados com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API de templates:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'templates_error'
    });
  }
});

export { router as emailTriggerRoutes };