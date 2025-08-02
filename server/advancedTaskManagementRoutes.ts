/**
 * ADVANCED TASK MANAGEMENT ROUTES - Sistema completo de task management avançado
 * Funcionalidades: Templates, Automação, Colaboração, Tracking, Métricas
 */

import express from 'express';
import { eq, desc, and, or, ilike, count, sql, gte, lte, between } from 'drizzle-orm';
import { db } from './db';
import { 
  taskTemplates,
  taskInstances,
  taskComments,
  taskAutomationRules,
  taskAutomationLogs,
  taskTimeTracking,
  taskProductivityMetrics,
  taskCollaborations,
  taskTemplateCategories,
  taskSkills,
  userTaskSkills,
  taskDependencies,
  users,
  tenants
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { nanoid } from 'nanoid';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// TASK TEMPLATE CATEGORIES - GESTÃO DE CATEGORIAS
// ==========================================

// GET /api/advanced-tasks/categories - Listar categorias
router.get('/categories', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    const categories = await db
      .select()
      .from(taskTemplateCategories)
      .where(and(
        eq(taskTemplateCategories.tenantId, tenantId),
        eq(taskTemplateCategories.isActive, true)
      ))
      .orderBy(taskTemplateCategories.sortOrder, taskTemplateCategories.name);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching task categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar categorias de tarefa' 
    });
  }
});

// POST /api/advanced-tasks/categories - Criar categoria
router.post('/categories', async (req: any, res) => {
  try {
    const { name, description, color, icon, defaultPriority, defaultDuration, parentCategoryId } = req.body;
    const tenantId = req.tenant.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Nome da categoria é obrigatório'
      });
    }

    const newCategory = await db
      .insert(taskTemplateCategories)
      .values({
        tenantId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'Folder',
        defaultPriority: defaultPriority || 'medium',
        defaultDuration: defaultDuration || null,
        parentCategoryId: parentCategoryId || null,
        sortOrder: 0
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newCategory[0],
      message: 'Categoria criada com sucesso'
    });

  } catch (error) {
    console.error('Error creating task category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao criar categoria de tarefa' 
    });
  }
});

// ==========================================
// TASK AUTOMATION RULES - AUTOMAÇÃO DE TAREFAS
// ==========================================

// GET /api/advanced-tasks/automation/rules - Listar regras de automação
router.get('/automation/rules', async (req: any, res) => {
  try {
    const { isActive, triggerType, limit = 20, offset = 0 } = req.query;
    const tenantId = req.tenant.id;

    let query = db
      .select({
        rule: taskAutomationRules,
        createdByUser: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(taskAutomationRules)
      .leftJoin(users, eq(users.id, taskAutomationRules.createdById))
      .where(eq(taskAutomationRules.tenantId, tenantId));

    // Aplicar filtros
    if (isActive !== undefined) {
      query = query.where(eq(taskAutomationRules.isActive, isActive === 'true'));
    }

    if (triggerType) {
      query = query.where(eq(taskAutomationRules.triggerType, triggerType));
    }

    const rules = await query
      .orderBy(desc(taskAutomationRules.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: rules,
      total: rules.length
    });

  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar regras de automação' 
    });
  }
});

// POST /api/advanced-tasks/automation/rules - Criar regra de automação
router.post('/automation/rules', async (req: any, res) => {
  try {
    const {
      name,
      description,
      triggerType,
      triggerConfig,
      conditions,
      actions,
      metadata
    } = req.body;

    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Nome da regra é obrigatório'
      });
    }

    if (!triggerType || !triggerConfig || !actions || actions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de trigger, configuração e ações são obrigatórios'
      });
    }

    const newRule = await db
      .insert(taskAutomationRules)
      .values({
        tenantId,
        createdById: userId,
        name: name.trim(),
        description: description?.trim() || null,
        triggerType,
        triggerConfig,
        conditions: conditions || [],
        actions,
        metadata: metadata || {},
        isActive: true
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newRule[0],
      message: 'Regra de automação criada com sucesso'
    });

  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao criar regra de automação' 
    });
  }
});

// POST /api/advanced-tasks/automation/rules/:id/execute - Executar regra manualmente
router.post('/automation/rules/:id/execute', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { testData } = req.body;
    const tenantId = req.tenant.id;

    // Buscar regra
    const rule = await db
      .select()
      .from(taskAutomationRules)
      .where(and(
        eq(taskAutomationRules.id, id),
        eq(taskAutomationRules.tenantId, tenantId)
      ))
      .limit(1);

    if (rule.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Regra de automação não encontrada'
      });
    }

    const executionId = nanoid();
    const startTime = Date.now();

    try {
      // Simular execução da regra
      const executionResult = await simulateAutomationRule(rule[0], testData || {});
      const executionTime = Date.now() - startTime;

      // Registrar log de execução
      await db
        .insert(taskAutomationLogs)
        .values({
          tenantId,
          ruleId: id,
          executionId,
          status: executionResult.success ? 'success' : 'failed',
          triggerData: testData || {},
          triggerTimestamp: new Date(),
          actionsExecuted: executionResult.actionsExecuted || [],
          actionResults: executionResult.actionResults || [],
          errorMessage: executionResult.error || null,
          executionTimeMs: executionTime
        });

      // Atualizar estatísticas da regra
      await db
        .update(taskAutomationRules)
        .set({
          lastTriggeredAt: new Date(),
          totalExecutions: sql`${taskAutomationRules.totalExecutions} + 1`,
          successfulExecutions: executionResult.success ? 
            sql`${taskAutomationRules.successfulExecutions} + 1` : 
            taskAutomationRules.successfulExecutions,
          failedExecutions: !executionResult.success ? 
            sql`${taskAutomationRules.failedExecutions} + 1` : 
            taskAutomationRules.failedExecutions
        })
        .where(eq(taskAutomationRules.id, id));

      res.json({
        success: true,
        data: {
          executionId,
          status: executionResult.success ? 'success' : 'failed',
          executionTime,
          actionsExecuted: executionResult.actionsExecuted?.length || 0,
          result: executionResult
        },
        message: 'Regra executada com sucesso'
      });

    } catch (execError) {
      // Registrar erro de execução
      await db
        .insert(taskAutomationLogs)
        .values({
          tenantId,
          ruleId: id,
          executionId,
          status: 'failed',
          triggerData: testData || {},
          triggerTimestamp: new Date(),
          errorMessage: execError instanceof Error ? execError.message : 'Erro desconhecido',
          errorDetails: { error: String(execError) },
          executionTimeMs: Date.now() - startTime
        });

      throw execError;
    }

  } catch (error) {
    console.error('Error executing automation rule:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao executar regra de automação' 
    });
  }
});

// ==========================================
// TASK TIME TRACKING - TRACKING DE TEMPO
// ==========================================

// POST /api/advanced-tasks/time-tracking/start - Iniciar tracking de tempo
router.post('/time-tracking/start', async (req: any, res) => {
  try {
    const { taskInstanceId, activityType, description } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Validações
    if (!taskInstanceId) {
      return res.status(400).json({
        success: false,
        error: 'ID da tarefa é obrigatório'
      });
    }

    // Verificar se já existe tracking ativo para este usuário
    const activeTracking = await db
      .select()
      .from(taskTimeTracking)
      .where(and(
        eq(taskTimeTracking.tenantId, tenantId),
        eq(taskTimeTracking.userId, userId),
        eq(taskTimeTracking.isActive, true)
      ))
      .limit(1);

    if (activeTracking.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um tracking ativo. Finalize o anterior antes de iniciar um novo.'
      });
    }

    // Iniciar novo tracking
    const newTracking = await db
      .insert(taskTimeTracking)
      .values({
        tenantId,
        taskInstanceId,
        userId,
        startTime: new Date(),
        activityType: activityType || 'work',
        description: description?.trim() || null,
        isActive: true,
        interruptions: 0
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newTracking[0],
      message: 'Tracking de tempo iniciado'
    });

  } catch (error) {
    console.error('Error starting time tracking:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao iniciar tracking de tempo' 
    });
  }
});

// POST /api/advanced-tasks/time-tracking/:id/stop - Parar tracking de tempo
router.post('/time-tracking/:id/stop', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { productivityScore, focusLevel, finalDescription } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Buscar tracking ativo
    const tracking = await db
      .select()
      .from(taskTimeTracking)
      .where(and(
        eq(taskTimeTracking.id, id),
        eq(taskTimeTracking.tenantId, tenantId),
        eq(taskTimeTracking.userId, userId),
        eq(taskTimeTracking.isActive, true)
      ))
      .limit(1);

    if (tracking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tracking ativo não encontrado'
      });
    }

    const endTime = new Date();
    const startTime = new Date(tracking[0].startTime);
    const durationMs = endTime.getTime() - startTime.getTime();

    // Atualizar tracking
    const updatedTracking = await db
      .update(taskTimeTracking)
      .set({
        endTime,
        durationMs,
        isActive: false,
        productivityScore: productivityScore || null,
        focusLevel: focusLevel || null,
        description: finalDescription?.trim() || tracking[0].description
      })
      .where(eq(taskTimeTracking.id, id))
      .returning();

    res.json({
      success: true,
      data: {
        ...updatedTracking[0],
        durationMinutes: Math.round(durationMs / 60000)
      },
      message: 'Tracking de tempo finalizado'
    });

  } catch (error) {
    console.error('Error stopping time tracking:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao parar tracking de tempo' 
    });
  }
});

// GET /api/advanced-tasks/time-tracking/active - Buscar tracking ativo do usuário
router.get('/time-tracking/active', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    const activeTracking = await db
      .select({
        tracking: taskTimeTracking,
        task: {
          id: taskInstances.id,
          title: taskInstances.title,
          priority: taskInstances.priority
        }
      })
      .from(taskTimeTracking)
      .leftJoin(taskInstances, eq(taskInstances.id, taskTimeTracking.taskInstanceId))
      .where(and(
        eq(taskTimeTracking.tenantId, tenantId),
        eq(taskTimeTracking.userId, userId),
        eq(taskTimeTracking.isActive, true)
      ))
      .limit(1);

    if (activeTracking.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    const tracking = activeTracking[0];
    const currentTime = new Date();
    const startTime = new Date(tracking.tracking.startTime);
    const elapsedMs = currentTime.getTime() - startTime.getTime();

    res.json({
      success: true,
      data: {
        ...tracking,
        elapsedTimeMs: elapsedMs,
        elapsedTimeMinutes: Math.floor(elapsedMs / 60000)
      }
    });

  } catch (error) {
    console.error('Error fetching active time tracking:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar tracking ativo' 
    });
  }
});

// ==========================================
// TASK COLLABORATIONS - SISTEMA DE COLABORAÇÃO
// ==========================================

// POST /api/advanced-tasks/collaborations - Solicitar colaboração
router.post('/collaborations', async (req: any, res) => {
  try {
    const {
      taskInstanceId,
      collaborationType,
      collaboratorId,
      requestMessage,
      dueDate,
      priority,
      requiredDeliverables
    } = req.body;

    const tenantId = req.tenant.id;
    const requesterId = req.user.id;

    // Validações
    if (!taskInstanceId || !collaborationType || !collaboratorId) {
      return res.status(400).json({
        success: false,
        error: 'Tarefa, tipo de colaboração e colaborador são obrigatórios'
      });
    }

    // Verificar se o colaborador existe no mesmo tenant
    const collaborator = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, collaboratorId),
        eq(users.tenantId, tenantId)
      ))
      .limit(1);

    if (collaborator.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador não encontrado'
      });
    }

    const newCollaboration = await db
      .insert(taskCollaborations)
      .values({
        tenantId,
        taskInstanceId,
        collaborationType,
        requesterId,
        collaboratorId,
        requestMessage: requestMessage?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'normal',
        requiredDeliverables: requiredDeliverables || [],
        status: 'pending'
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newCollaboration[0],
      message: 'Solicitação de colaboração enviada'
    });

  } catch (error) {
    console.error('Error creating collaboration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao solicitar colaboração' 
    });
  }
});

// GET /api/advanced-tasks/collaborations - Listar colaborações
router.get('/collaborations', async (req: any, res) => {
  try {
    const { status, type, taskId, limit = 20, offset = 0 } = req.query;
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    let query = db
      .select({
        collaboration: taskCollaborations,
        task: {
          id: taskInstances.id,
          title: taskInstances.title,
          priority: taskInstances.priority
        },
        requester: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(taskCollaborations)
      .leftJoin(taskInstances, eq(taskInstances.id, taskCollaborations.taskInstanceId))
      .leftJoin(users, eq(users.id, taskCollaborations.requesterId))
      .where(and(
        eq(taskCollaborations.tenantId, tenantId),
        or(
          eq(taskCollaborations.requesterId, userId),
          eq(taskCollaborations.collaboratorId, userId)
        )
      ));

    // Aplicar filtros
    if (status) {
      query = query.where(eq(taskCollaborations.status, status));
    }

    if (type) {
      query = query.where(eq(taskCollaborations.collaborationType, type));
    }

    if (taskId) {
      query = query.where(eq(taskCollaborations.taskInstanceId, taskId));
    }

    const collaborations = await query
      .orderBy(desc(taskCollaborations.requestedAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: collaborations,
      total: collaborations.length
    });

  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar colaborações' 
    });
  }
});

// PUT /api/advanced-tasks/collaborations/:id/respond - Responder à solicitação
router.put('/collaborations/:id/respond', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Validações
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status deve ser "accepted" ou "rejected"'
      });
    }

    // Verificar se é o colaborador responsável
    const collaboration = await db
      .select()
      .from(taskCollaborations)
      .where(and(
        eq(taskCollaborations.id, id),
        eq(taskCollaborations.tenantId, tenantId),
        eq(taskCollaborations.collaboratorId, userId),
        eq(taskCollaborations.status, 'pending')
      ))
      .limit(1);

    if (collaboration.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de colaboração não encontrada ou já respondida'
      });
    }

    const updatedCollaboration = await db
      .update(taskCollaborations)
      .set({
        status,
        responseMessage: responseMessage?.trim() || null,
        respondedAt: new Date()
      })
      .where(eq(taskCollaborations.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedCollaboration[0],
      message: `Solicitação ${status === 'accepted' ? 'aceita' : 'rejeitada'} com sucesso`
    });

  } catch (error) {
    console.error('Error responding to collaboration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao responder solicitação de colaboração' 
    });
  }
});

// ==========================================
// PRODUCTIVITY METRICS - MÉTRICAS DE PRODUTIVIDADE
// ==========================================

// GET /api/advanced-tasks/productivity/user/:userId - Métricas do usuário
router.get('/productivity/user/:userId', async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { period, startDate, endDate } = req.query;
    const tenantId = req.tenant.id;

    // Verificar se o usuário pode ver essas métricas
    if (userId !== req.user.id && req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para ver métricas deste usuário'
      });
    }

    let periodStart: Date;
    let periodEnd: Date = new Date();

    // Calcular período baseado no parâmetro
    switch (period) {
      case 'today':
        periodStart = new Date();
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'month':
        periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            error: 'Data de início e fim são obrigatórias para período customizado'
          });
        }
        periodStart = new Date(startDate);
        periodEnd = new Date(endDate);
        break;
      default:
        periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 30);
    }

    // Buscar métricas do período
    const metrics = await db
      .select()
      .from(taskProductivityMetrics)
      .where(and(
        eq(taskProductivityMetrics.tenantId, tenantId),
        eq(taskProductivityMetrics.userId, userId),
        gte(taskProductivityMetrics.periodStart, periodStart),
        lte(taskProductivityMetrics.periodEnd, periodEnd)
      ))
      .orderBy(desc(taskProductivityMetrics.periodStart));

    // Calcular métricas agregadas
    const totalTasks = metrics.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0);
    const totalTime = metrics.reduce((sum, m) => sum + (m.totalTimeWorked || 0), 0);
    const avgProductivity = metrics.length > 0 ? 
      metrics.reduce((sum, m) => sum + (Number(m.overallProductivityScore) || 0), 0) / metrics.length : 0;

    res.json({
      success: true,
      data: {
        period: { start: periodStart, end: periodEnd },
        summary: {
          totalTasks,
          totalTimeWorked: totalTime,
          averageProductivityScore: avgProductivity.toFixed(1),
          metricsCount: metrics.length
        },
        metrics
      }
    });

  } catch (error) {
    console.error('Error fetching productivity metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar métricas de produtividade' 
    });
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Função para simular execução de regra de automação
async function simulateAutomationRule(rule: any, testData: any): Promise<{
  success: boolean;
  actionsExecuted?: any[];
  actionResults?: any[];
  error?: string;
}> {
  try {
    const actions = rule.actions || [];
    const actionsExecuted = [];
    const actionResults = [];

    for (const action of actions) {
      // Simular diferentes tipos de ações
      switch (action.type) {
        case 'create_task':
          const taskResult = await simulateCreateTask(action, testData, rule.tenantId);
          actionsExecuted.push(action);
          actionResults.push(taskResult);
          break;
          
        case 'send_notification':
          const notificationResult = await simulateSendNotification(action, testData, rule.tenantId);
          actionsExecuted.push(action);
          actionResults.push(notificationResult);
          break;
          
        case 'update_task':
          const updateResult = await simulateUpdateTask(action, testData, rule.tenantId);
          actionsExecuted.push(action);
          actionResults.push(updateResult);
          break;
          
        default:
          actionResults.push({ success: false, message: `Tipo de ação não suportado: ${action.type}` });
      }
    }

    return {
      success: true,
      actionsExecuted,
      actionResults
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Simular criação de tarefa
async function simulateCreateTask(action: any, testData: any, tenantId: string) {
  // Em produção, criaria uma tarefa real
  return {
    success: true,
    message: 'Tarefa criada com sucesso (simulação)',
    taskId: nanoid(),
    title: action.config?.title || 'Tarefa Automática'
  };
}

// Simular envio de notificação
async function simulateSendNotification(action: any, testData: any, tenantId: string) {
  // Em produção, enviaria notificação real
  return {
    success: true,
    message: 'Notificação enviada com sucesso (simulação)',
    recipients: action.config?.recipients || [],
    content: action.config?.message || 'Notificação automática'
  };
}

// Simular atualização de tarefa
async function simulateUpdateTask(action: any, testData: any, tenantId: string) {
  // Em produção, atualizaria tarefa real
  return {
    success: true,
    message: 'Tarefa atualizada com sucesso (simulação)',
    taskId: action.config?.taskId || testData.taskId,
    updates: action.config?.updates || {}
  };
}

export { router as advancedTaskManagementRoutes };