/**
 * WORKFLOW INTEGRATION ROUTES - Integrações críticas cross-módulos
 * Conecta Workflows com Query Builder, Tasks, Dashboards, Reports, Notifications
 * Sistema core para funcionalidade empresarial completa
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
  savedQueries,
  dashboards,
  reportSchedules,
  notifications,
  users,
  tenants
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
// WORKFLOW ↔ QUERY BUILDER INTEGRATION
// ==========================================

// Schema para execução de query em workflow
const WorkflowQueryExecutionSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  queryId: z.string().optional(),
  queryConfig: z.object({
    name: z.string(),
    query: z.any(), // TQL query object
    variables: z.record(z.any()).optional()
  }).optional()
});

// POST /api/workflow-integration/execute-query - Executar query dentro de workflow
router.post('/execute-query', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🔄 Executando query em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowQueryExecutionSchema.parse(req.body);
    
    let queryToExecute;
    
    // Se queryId fornecido, buscar query salva
    if (validatedData.queryId) {
      const savedQuery = await db
        .select()
        .from(savedQueries)
        .where(and(
          eq(savedQueries.id, validatedData.queryId),
          eq(savedQueries.tenantId, tenantId)
        ))
        .limit(1);
        
      if (savedQuery.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Query salva não encontrada',
          type: 'query_not_found'
        });
      }
      
      queryToExecute = savedQuery[0].queryConfig;
    } else if (validatedData.queryConfig) {
      queryToExecute = validatedData.queryConfig.query;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Query ID ou configuração de query é obrigatória',
        type: 'missing_query'
      });
    }
    
    // Importar generateSQL do queryBuilderRoutes
    const { generateSQL } = require('./queryBuilderRoutes');
    
    // Gerar SQL com tenant isolation
    const sql = generateSQL(queryToExecute, tenantId);
    
    // Executar query via storage
    const { storage } = require('./storage');
    const results = await storage.executeRawQuery(sql, tenantId);
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId, // Usar workflow ID como execution ID por simplicidade
      nodeId: validatedData.nodeId,
      nodeType: 'query_execution',
      status: 'completed',
      input: { query: queryToExecute, variables: validatedData.queryConfig?.variables },
      output: { results: results.slice(0, 100) }, // Limitar output para performance
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.json({
      success: true,
      data: {
        results,
        nodeExecutionId,
        query: sql,
        executedAt: new Date(),
        resultCount: Array.isArray(results) ? results.length : 1
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        executedBy: userId
      }
    });
    
  } catch (error: any) {
    console.error('Error executing workflow query:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de execução inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'execution_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na execução da query',
        type: 'internal_error'
      });
    }
  }
});

// GET /api/workflow-integration/available-queries - Listar queries disponíveis para workflows
router.get('/available-queries', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    
    const queries = await db
      .select({
        id: savedQueries.id,
        name: savedQueries.name,
        description: savedQueries.description,
        category: savedQueries.category,
        createdAt: savedQueries.createdAt,
        createdBy: {
          name: users.name,
          email: users.email
        }
      })
      .from(savedQueries)
      .leftJoin(users, eq(users.id, savedQueries.createdBy))
      .where(eq(savedQueries.tenantId, tenantId))
      .orderBy(desc(savedQueries.createdAt));
    
    res.json({
      success: true,
      data: queries,
      total: queries.length
    });
    
  } catch (error: any) {
    console.error('Error fetching available queries:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar queries disponíveis',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW ↔ TASK MANAGEMENT INTEGRATION
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
    taskType: z.enum(['action', 'question', 'approval', 'review']).default('action'),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'number', 'select', 'multiselect', 'date', 'checkbox']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional()
    })).optional()
  })
});

// POST /api/workflow-integration/create-task - Criar task dentro de workflow
router.post('/create-task', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📋 Criando task em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowTaskCreationSchema.parse(req.body);
    
    // Criar instância de task
    const taskInstanceId = nanoid();
    
    await db.insert(taskInstances).values({
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
      formFields: validatedData.taskConfig.fields || [],
      workflowContext: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        createdByWorkflow: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'task_creation',
      status: 'completed',
      input: validatedData.taskConfig,
      output: { taskInstanceId },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.status(201).json({
      success: true,
      data: {
        taskInstanceId,
        nodeExecutionId,
        status: 'task_created',
        assignedTo: validatedData.taskConfig.assignedTo || userId
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        createdBy: userId
      },
      message: 'Task criada com sucesso no workflow'
    });
    
  } catch (error: any) {
    console.error('Error creating workflow task:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de task inválida',
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
        error: 'Erro interno na criação da task',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW ↔ NOTIFICATIONS INTEGRATION
// ==========================================

const WorkflowNotificationSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  notificationConfig: z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
    recipients: z.array(z.string()).optional(), // User IDs
    channels: z.array(z.enum(['in_app', 'email', 'push'])).default(['in_app'])
  })
});

// POST /api/workflow-integration/send-notification - Enviar notificação em workflow
router.post('/send-notification', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🔔 Enviando notificação em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowNotificationSchema.parse(req.body);
    
    // Se não especificado recipients, enviar para o criador do workflow
    const recipients = validatedData.notificationConfig.recipients || [userId];
    
    const notificationPromises = recipients.map(async (recipientId) => {
      const notificationId = nanoid();
      
      return db.insert(notifications).values({
        id: notificationId,
        userId: recipientId,
        tenantId,
        title: validatedData.notificationConfig.title,
        message: validatedData.notificationConfig.message,
        type: validatedData.notificationConfig.type,
        channels: validatedData.notificationConfig.channels,
        isRead: false,
        metadata: {
          source: 'workflow',
          workflowId: validatedData.workflowId,
          nodeId: validatedData.nodeId
        },
        createdAt: new Date()
      });
    });
    
    await Promise.all(notificationPromises);
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'notification',
      status: 'completed',
      input: validatedData.notificationConfig,
      output: { recipientCount: recipients.length },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.json({
      success: true,
      data: {
        nodeExecutionId,
        notificationsSent: recipients.length,
        recipients
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId
      },
      message: `${recipients.length} notificação(ões) enviada(s) com sucesso`
    });
    
  } catch (error: any) {
    console.error('Error sending workflow notification:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de notificação inválida',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'notification_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno no envio de notificação',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW EXECUTION TRIGGERS & CONDITIONS
// ==========================================

// GET /api/workflow-integration/node-execution/:workflowId/:nodeId - Status de execução de node
router.get('/node-execution/:workflowId/:nodeId', async (req: any, res) => {
  try {
    const { workflowId, nodeId } = req.params;
    const tenantId = req.tenant.id;
    
    const executions = await db
      .select()
      .from(nodeExecutions)
      .where(and(
        eq(nodeExecutions.workflowExecutionId, workflowId),
        eq(nodeExecutions.nodeId, nodeId),
        eq(nodeExecutions.tenantId, tenantId)
      ))
      .orderBy(desc(nodeExecutions.executedAt))
      .limit(10);
    
    res.json({
      success: true,
      data: executions,
      total: executions.length
    });
    
  } catch (error: any) {
    console.error('Error fetching node executions:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar execuções do node',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW VARIABLES & DATA FLOW
// ==========================================

// GET /api/workflow-integration/workflow-variables/:workflowId - Obter variáveis do workflow
router.get('/workflow-variables/:workflowId', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const tenantId = req.tenant.id;
    
    const variables = await db
      .select()
      .from(workflowVariables)
      .where(and(
        eq(workflowVariables.workflowId, workflowId),
        eq(workflowVariables.tenantId, tenantId)
      ));
    
    res.json({
      success: true,
      data: variables,
      total: variables.length
    });
    
  } catch (error: any) {
    console.error('Error fetching workflow variables:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar variáveis do workflow',
        type: 'internal_error'
      });
    }
  }
});

export { router as workflowIntegrationRoutes };