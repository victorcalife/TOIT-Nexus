/**
 * WORKFLOW ↔ TASK INTEGRATION ROUTES - Sistema completo de integração
 * Tasks criadas por workflows com triggers automáticos baseados em respostas
 * Sistema core para funcionalidade empresarial de gestão colaborativa
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  visualWorkflows,
  workflowNodes,
  workflowConnections,
  visualWorkflowExecutions,
  nodeExecutions,
  taskInstances,
  taskTemplates,
  taskComments,
  taskAttachments,
  workflowTriggers,
  workflowVariables,
  users,
  notifications
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
// WORKFLOW → TASK CREATION WITH CONDITIONS
// ==========================================

const WorkflowTaskCreationSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  taskConfig: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    taskType: z.enum(['action', 'question', 'approval', 'review', 'form']).default('action'),
    tags: z.array(z.string()).optional(),
    formFields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'select', 'multiselect', 'date', 'checkbox', 'textarea', 'file']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional()
      }).optional()
    })).optional(),
    triggerConditions: z.object({
      onComplete: z.array(z.object({
        condition: z.string(), // 'always', 'if_approved', 'if_value_equals', etc.
        value: z.any().optional(),
        nextNodeId: z.string(),
        action: z.enum(['continue_workflow', 'create_task', 'send_notification', 'execute_query'])
      })).optional(),
      onReject: z.array(z.object({
        nextNodeId: z.string(),
        action: z.string()
      })).optional(),
      onTimeout: z.object({
        nextNodeId: z.string(),
        action: z.string()
      }).optional()
    }).optional()
  })
});

// POST /api/workflow-task-integration/create-conditional-task - Criar task com condições de trigger
router.post('/create-conditional-task', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📋 Criando task condicional em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowTaskCreationSchema.parse(req.body);
    
    // Criar instância de task
    const taskInstanceId = nanoid();
    
    const taskInstance = await db.insert(taskInstances).values({
      id: taskInstanceId,
      templateId: null, // Task criada dinamicamente pelo workflow
      title: validatedData.taskConfig.title,
      description: validatedData.taskConfig.description || '',
      assignedTo: validatedData.taskConfig.assignedTo || userId,
      createdBy: userId,
      tenantId,
      status: 'pending',
      priority: validatedData.taskConfig.priority,
      taskType: validatedData.taskConfig.taskType,
      dueDate: validatedData.taskConfig.dueDate ? new Date(validatedData.taskConfig.dueDate) : null,
      tags: validatedData.taskConfig.tags || [],
      formFields: validatedData.taskConfig.formFields || [],
      workflowContext: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        createdByWorkflow: true,
        triggerConditions: validatedData.taskConfig.triggerConditions
      },
      metadata: {
        isWorkflowTask: true,
        canTriggerWorkflow: true,
        triggerRules: validatedData.taskConfig.triggerConditions
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Registrar triggers da task no sistema de workflow
    if (validatedData.taskConfig.triggerConditions) {
      const triggers = [];
      
      // Triggers para conclusão
      if (validatedData.taskConfig.triggerConditions.onComplete) {
        for (const trigger of validatedData.taskConfig.triggerConditions.onComplete) {
          triggers.push({
            id: nanoid(),
            workflowId: validatedData.workflowId,
            triggerType: 'task_complete',
            triggerCondition: trigger.condition,
            triggerValue: trigger.value,
            sourceNodeId: validatedData.nodeId,
            targetNodeId: trigger.nextNodeId,
            action: trigger.action,
            isActive: true,
            metadata: {
              taskInstanceId,
              sourceType: 'task_completion'
            },
            tenantId,
            createdAt: new Date()
          });
        }
      }
      
      // Triggers para rejeição
      if (validatedData.taskConfig.triggerConditions.onReject) {
        for (const trigger of validatedData.taskConfig.triggerConditions.onReject) {
          triggers.push({
            id: nanoid(),
            workflowId: validatedData.workflowId,
            triggerType: 'task_reject',
            triggerCondition: 'always',
            sourceNodeId: validatedData.nodeId,
            targetNodeId: trigger.nextNodeId,
            action: trigger.action,
            isActive: true,
            metadata: {
              taskInstanceId,
              sourceType: 'task_rejection'
            },
            tenantId,
            createdAt: new Date()
          });
        }
      }
      
      // Trigger para timeout
      if (validatedData.taskConfig.triggerConditions.onTimeout) {
        triggers.push({
          id: nanoid(),
          workflowId: validatedData.workflowId,
          triggerType: 'task_timeout',
          triggerCondition: 'on_due_date',
          sourceNodeId: validatedData.nodeId,
          targetNodeId: validatedData.taskConfig.triggerConditions.onTimeout.nextNodeId,
          action: validatedData.taskConfig.triggerConditions.onTimeout.action,
          isActive: true,
          metadata: {
            taskInstanceId,
            sourceType: 'task_timeout'
          },
          tenantId,
          createdAt: new Date()
        });
      }
      
      // Inserir todos os triggers
      if (triggers.length > 0) {
        await db.insert(workflowTriggers).values(triggers);
      }
    }
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'conditional_task_creation',
      status: 'completed',
      input: validatedData.taskConfig,
      output: { 
        taskInstanceId,
        triggersCreated: validatedData.taskConfig.triggerConditions ? 
          Object.keys(validatedData.taskConfig.triggerConditions).length : 0
      },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    // Enviar notificação para o responsável pela task
    if (validatedData.taskConfig.assignedTo && validatedData.taskConfig.assignedTo !== userId) {
      await db.insert(notifications).values({
        id: nanoid(),
        userId: validatedData.taskConfig.assignedTo,
        tenantId,
        title: 'Nova Task Atribuída por Workflow',
        message: `Task "${validatedData.taskConfig.title}" foi criada automaticamente por um workflow e atribuída a você.`,
        type: 'info',
        channels: ['in_app', 'email'],
        isRead: false,
        metadata: {
          source: 'workflow_task_creation',
          workflowId: validatedData.workflowId,
          taskInstanceId,
          nodeId: validatedData.nodeId
        },
        createdAt: new Date()
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        taskInstance: taskInstance[0],
        nodeExecutionId,
        triggersCreated: validatedData.taskConfig.triggerConditions ? 
          Object.keys(validatedData.taskConfig.triggerConditions).length : 0
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        createdBy: userId
      },
      message: 'Task condicional criada com sucesso no workflow'
    });
    
  } catch (error: any) {
    console.error('Error creating conditional workflow task:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de task condicional inválida',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'creation_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na criação da task condicional',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// TASK COMPLETION → WORKFLOW TRIGGERS
// ==========================================

const TaskCompletionTriggerSchema = z.object({
  taskInstanceId: z.string(),
  completionData: z.object({
    status: z.enum(['completed', 'approved', 'rejected', 'canceled']),
    formResponses: z.record(z.any()).optional(),
    comments: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    attachments: z.array(z.string()).optional()
  })
});

// POST /api/workflow-task-integration/trigger-workflow-from-task - Disparar workflow baseado em conclusão de task
router.post('/trigger-workflow-from-task', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🔄 Disparando workflow baseado em task - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = TaskCompletionTriggerSchema.parse(req.body);
    
    // Buscar task instance
    const taskInstance = await db
      .select()
      .from(taskInstances)
      .where(and(
        eq(taskInstances.id, validatedData.taskInstanceId),
        eq(taskInstances.tenantId, tenantId)
      ))
      .limit(1);
    
    if (taskInstance.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task não encontrada',
        type: 'task_not_found'
      });
    }
    
    const task = taskInstance[0];
    
    // Verificar se task tem contexto de workflow
    if (!task.workflowContext || !(task.workflowContext as any).workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Task não foi criada por workflow',
        type: 'not_workflow_task'
      });
    }
    
    const workflowContext = task.workflowContext as any;
    
    // Buscar triggers relacionados à task
    const triggers = await db
      .select()
      .from(workflowTriggers)
      .where(and(
        eq(workflowTriggers.workflowId, workflowContext.workflowId),
        eq(workflowTriggers.isActive, true),
        sql`${workflowTriggers.metadata}->>'taskInstanceId' = ${validatedData.taskInstanceId}`
      ));
    
    const executedTriggers = [];
    
    // Processar cada trigger baseado no status de conclusão
    for (const trigger of triggers) {
      let shouldExecute = false;
      
      // Verificar condição do trigger
      switch (trigger.triggerType) {
        case 'task_complete':
          if (validatedData.completionData.status === 'completed') {
            // Verificar condições específicas
            if (trigger.triggerCondition === 'always') {
              shouldExecute = true;
            } else if (trigger.triggerCondition === 'if_approved' && validatedData.completionData.status === 'approved') {
              shouldExecute = true;
            } else if (trigger.triggerCondition === 'if_value_equals') {
              // Verificar valor específico nas respostas do formulário
              const expectedValue = trigger.triggerValue;
              const formResponses = validatedData.completionData.formResponses || {};
              
              // Lógica para verificar se valor das respostas corresponde ao esperado
              shouldExecute = Object.values(formResponses).some(value => 
                value === expectedValue || JSON.stringify(value) === JSON.stringify(expectedValue)
              );
            }
          }
          break;
          
        case 'task_reject':
          if (validatedData.completionData.status === 'rejected') {
            shouldExecute = true;
          }
          break;
          
        case 'task_timeout':
          // Implementar lógica de timeout se necessário
          break;
      }
      
      if (shouldExecute) {
        // Executar ação do trigger
        const triggerResult = await executeWorkflowTriggerAction(
          trigger,
          validatedData.completionData,
          tenantId,
          userId
        );
        
        executedTriggers.push({
          triggerId: trigger.id,
          action: trigger.action,
          result: triggerResult,
          executedAt: new Date()
        });
        
        // Registrar execução do trigger
        await db.insert(nodeExecutions).values({
          id: nanoid(),
          workflowExecutionId: workflowContext.workflowId,
          nodeId: trigger.targetNodeId,
          nodeType: `trigger_${trigger.action}`,
          status: triggerResult.success ? 'completed' : 'failed',
          input: {
            triggerType: trigger.triggerType,
            triggerCondition: trigger.triggerCondition,
            taskCompletion: validatedData.completionData
          },
          output: triggerResult,
          executedAt: new Date(),
          completedAt: new Date(),
          tenantId
        });
      }
    }
    
    // Atualizar status da task
    await db
      .update(taskInstances)
      .set({
        status: validatedData.completionData.status,
        completedAt: new Date(),
        completedBy: userId,
        formResponses: validatedData.completionData.formResponses,
        metadata: {
          ...(task.metadata as any || {}),
          workflowTriggersExecuted: executedTriggers.length,
          completionDetails: validatedData.completionData
        },
        updatedAt: new Date()
      })
      .where(eq(taskInstances.id, validatedData.taskInstanceId));
    
    // Adicionar comentário se fornecido
    if (validatedData.completionData.comments) {
      await db.insert(taskComments).values({
        id: nanoid(),
        taskInstanceId: validatedData.taskInstanceId,
        userId,
        tenantId,
        comment: validatedData.completionData.comments,
        commentType: 'completion',
        isWorkflowTrigger: true,
        createdAt: new Date()
      });
    }
    
    res.json({
      success: true,
      data: {
        taskUpdated: true,
        triggersExecuted: executedTriggers.length,
        executedTriggers,
        workflowContinued: executedTriggers.length > 0
      },
      metadata: {
        taskInstanceId: validatedData.taskInstanceId,
        workflowId: workflowContext.workflowId,
        tenantId,
        completedBy: userId
      },
      message: `Task concluída e ${executedTriggers.length} trigger(s) executado(s)`
    });
    
  } catch (error: any) {
    console.error('Error triggering workflow from task completion:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de conclusão de task inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'trigger_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno no disparo do workflow',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW TRIGGER ACTION EXECUTION
// ==========================================

async function executeWorkflowTriggerAction(
  trigger: any,
  completionData: any,
  tenantId: string,
  userId: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    switch (trigger.action) {
      case 'continue_workflow':
        // Continuar workflow para próximo node
        return { success: true, result: { action: 'workflow_continued', nodeId: trigger.targetNodeId } };
        
      case 'create_task':
        // Criar nova task baseada no resultado
        const newTaskId = nanoid();
        await db.insert(taskInstances).values({
          id: newTaskId,
          templateId: null,
          title: `Task gerada por trigger - ${trigger.triggerType}`,
          description: `Task criada automaticamente baseada na conclusão de outra task`,
          assignedTo: userId,
          createdBy: userId,
          tenantId,
          status: 'pending',
          priority: 'medium',
          taskType: 'action',
          workflowContext: {
            workflowId: trigger.workflowId,
            nodeId: trigger.targetNodeId,
            createdByTrigger: true,
            parentTaskCompletion: completionData
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        return { success: true, result: { action: 'task_created', taskId: newTaskId } };
        
      case 'send_notification':
        // Enviar notificação
        const notificationId = nanoid();
        await db.insert(notifications).values({
          id: notificationId,
          userId,
          tenantId,
          title: 'Workflow Trigger Executado',
          message: `Trigger do tipo ${trigger.triggerType} foi executado com sucesso`,
          type: 'success',
          channels: ['in_app'],
          isRead: false,
          metadata: {
            source: 'workflow_trigger',
            triggerId: trigger.id,
            completionData
          },
          createdAt: new Date()
        });
        
        return { success: true, result: { action: 'notification_sent', notificationId } };
        
      case 'execute_query':
        // Executar query (implementar conforme necessário)
        return { success: true, result: { action: 'query_executed', message: 'Query execution not implemented yet' } };
        
      default:
        return { success: false, error: `Ação não reconhecida: ${trigger.action}` };
    }
    
  } catch (error: any) {
    console.error('Error executing workflow trigger action:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// TASK MANAGEMENT FOR WORKFLOWS
// ==========================================

// GET /api/workflow-task-integration/workflow-tasks/:workflowId - Listar tasks de um workflow
router.get('/workflow-tasks/:workflowId', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const tenantId = req.tenant.id;
    
    const tasks = await db
      .select({
        task: taskInstances,
        assignedUser: {
          name: users.name,
          email: users.email
        }
      })
      .from(taskInstances)
      .leftJoin(users, eq(users.id, taskInstances.assignedTo))
      .where(and(
        eq(taskInstances.tenantId, tenantId),
        sql`${taskInstances.workflowContext}->>'workflowId' = ${workflowId}`
      ))
      .orderBy(desc(taskInstances.createdAt));
    
    res.json({
      success: true,
      data: tasks,
      total: tasks.length,
      metadata: {
        workflowId,
        tenantId
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching workflow tasks:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar tasks do workflow',
        type: 'internal_error'
      });
    }
  }
});

// GET /api/workflow-task-integration/task-triggers/:taskId - Listar triggers de uma task
router.get('/task-triggers/:taskId', async (req: any, res) => {
  try {
    const { taskId } = req.params;
    const tenantId = req.tenant.id;
    
    const triggers = await db
      .select()
      .from(workflowTriggers)
      .where(and(
        eq(workflowTriggers.tenantId, tenantId),
        sql`${workflowTriggers.metadata}->>'taskInstanceId' = ${taskId}`
      ));
    
    res.json({
      success: true,
      data: triggers,
      total: triggers.length,
      metadata: {
        taskId,
        tenantId
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching task triggers:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar triggers da task',
        type: 'internal_error'
      });
    }
  }
});

export { router as workflowTaskIntegrationRoutes };