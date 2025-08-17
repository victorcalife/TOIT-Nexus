/**
 * VISUAL WORKFLOW ROUTES - Sistema completo de workflow engine visual
 * Builder drag-and-drop estilo Zapier/Make com triggers automáticos
 */

import express from 'express';
import { eq, desc, and, or, ilike, count, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  visualWorkflows,
  workflowNodes,
  workflowConnections,
  visualWorkflowExecutions,
  nodeExecutions,
  workflowTriggers,
  workflowTemplates,
  workflowVariables,
  tenants,
  users
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { nanoid } from 'nanoid';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// VISUAL WORKFLOWS - CRUD OPERATIONS
// ==========================================

// GET /api/visual-workflows - Lista workflows do tenant
router.get('/', async (req: any, res) => {
  try {
    const { search, category, status, limit = 20, offset = 0 } = req.query;
    const tenantId = req.tenant.id;

    let query = db
      .select({
        workflow: visualWorkflows,
        nodeCount: count(workflowNodes.id),
      })
      .from(visualWorkflows)
      .leftJoin(workflowNodes, eq(workflowNodes.workflowId, visualWorkflows.id))
      .where(eq(visualWorkflows.tenantId, tenantId))
      .groupBy(visualWorkflows.id);

    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          ilike(visualWorkflows.name, `%${search}%`),
          ilike(visualWorkflows.description, `%${search}%`)
        )
      );
    }

    if (category) {
      query = query.where(eq(visualWorkflows.category, category));
    }

    if (status === 'active') {
      query = query.where(eq(visualWorkflows.isActive, true));
    } else if (status === 'inactive') {
      query = query.where(eq(visualWorkflows.isActive, false));
    }

    const workflows = await query
      .orderBy(desc(visualWorkflows.updatedAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: workflows,
      total: workflows.length
    });

  } catch (error) {
    console.error('Error fetching visual workflows:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar workflows visuais' 
    });
  }
});

// GET /api/visual-workflows/:id - Buscar workflow específico com nodes e connections
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Buscar workflow
    const workflow = await db
      .select()
      .from(visualWorkflows)
      .where(and(
        eq(visualWorkflows.id, id),
        eq(visualWorkflows.tenantId, tenantId)
      ))
      .limit(1);

    if (workflow.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow não encontrado'
      });
    }

    // Buscar nodes do workflow
    const nodes = await db
      .select()
      .from(workflowNodes)
      .where(eq(workflowNodes.workflowId, id))
      .orderBy(workflowNodes.createdAt);

    // Buscar connections do workflow
    const connections = await db
      .select()
      .from(workflowConnections)
      .where(eq(workflowConnections.workflowId, id))
      .orderBy(workflowConnections.createdAt);

    // Buscar triggers do workflow
    const triggers = await db
      .select()
      .from(workflowTriggers)
      .where(eq(workflowTriggers.workflowId, id));

    // Buscar variáveis do workflow
    const variables = await db
      .select()
      .from(workflowVariables)
      .where(eq(workflowVariables.workflowId, id));

    res.json({
      success: true,
      data: {
        workflow: workflow[0],
        nodes,
        connections,
        triggers,
        variables
      }
    });

  } catch (error) {
    console.error('Error fetching workflow details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar detalhes do workflow' 
    });
  }
});

// POST /api/visual-workflows - Criar novo workflow
router.post('/', async (req: any, res) => {
  try {
    const {
      name,
      description,
      category,
      nodes = [],
      connections = [],
      canvasData = {},
      triggerConfig = {},
      variables = {},
      settings = {}
    } = req.body;

    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Nome do workflow é obrigatório'
      });
    }

    // Criar workflow
    const newWorkflow = await db
      .insert(visualWorkflows)
      .values({
        tenantId,
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        category: category || null,
        canvasData,
        nodes,
        connections,
        triggerConfig,
        variables,
        settings
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newWorkflow[0],
      message: 'Workflow criado com sucesso'
    });

  } catch (error) {
    console.error('Error creating visual workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao criar workflow visual' 
    });
  }
});

// PUT /api/visual-workflows/:id - Atualizar workflow
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      canvasData,
      nodes,
      connections,
      triggerConfig,
      variables,
      settings,
      isActive
    } = req.body;

    const tenantId = req.tenant.id;

    // Verificar se workflow existe
    const existingWorkflow = await db
      .select()
      .from(visualWorkflows)
      .where(and(
        eq(visualWorkflows.id, id),
        eq(visualWorkflows.tenantId, tenantId)
      ))
      .limit(1);

    if (existingWorkflow.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow não encontrado'
      });
    }

    // Atualizar workflow
    const updatedWorkflow = await db
      .update(visualWorkflows)
      .set({
        name: name?.trim() || existingWorkflow[0].name,
        description: description?.trim() || existingWorkflow[0].description,
        category: category || existingWorkflow[0].category,
        canvasData: canvasData || existingWorkflow[0].canvasData,
        nodes: nodes || existingWorkflow[0].nodes,
        connections: connections || existingWorkflow[0].connections,
        triggerConfig: triggerConfig || existingWorkflow[0].triggerConfig,
        variables: variables || existingWorkflow[0].variables,
        settings: settings || existingWorkflow[0].settings,
        isActive: isActive !== undefined ? isActive : existingWorkflow[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(visualWorkflows.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedWorkflow[0],
      message: 'Workflow atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating visual workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao atualizar workflow visual' 
    });
  }
});

// DELETE /api/visual-workflows/:id - Deletar workflow
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se workflow existe
    const existingWorkflow = await db
      .select()
      .from(visualWorkflows)
      .where(and(
        eq(visualWorkflows.id, id),
        eq(visualWorkflows.tenantId, tenantId)
      ))
      .limit(1);

    if (existingWorkflow.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow não encontrado'
      });
    }

    // Deletar workflow (cascade deletará nodes, connections, etc.)
    await db
      .delete(visualWorkflows)
      .where(eq(visualWorkflows.id, id));

    res.json({
      success: true,
      message: 'Workflow deletado com sucesso'
    });

  } catch (error) {
    console.error('Error deleting visual workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao deletar workflow visual' 
    });
  }
});

// ==========================================
// WORKFLOW NODES - OPERAÇÕES
// ==========================================

// POST /api/visual-workflows/:workflowId/nodes - Adicionar node ao workflow
router.post('/:workflowId/nodes', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const {
      nodeKey,
      nodeType,
      name,
      description,
      position,
      size = { width: 200, height: 100 },
      style = {},
      config,
      inputSchema = {},
      outputSchema = {},
      timeout = 30000,
      retryCount = 0
    } = req.body;

    const tenantId = req.tenant.id;

    // Validações
    if (!nodeKey || !nodeType || !name || !position || !config) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nodeKey, nodeType, name, position, config'
      });
    }

    // Verificar se workflow existe
    const workflow = await db
      .select()
      .from(visualWorkflows)
      .where(and(
        eq(visualWorkflows.id, workflowId),
        eq(visualWorkflows.tenantId, tenantId)
      ))
      .limit(1);

    if (workflow.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow não encontrado'
      });
    }

    // Verificar se nodeKey é único no workflow
    const existingNode = await db
      .select()
      .from(workflowNodes)
      .where(and(
        eq(workflowNodes.workflowId, workflowId),
        eq(workflowNodes.nodeKey, nodeKey)
      ))
      .limit(1);

    if (existingNode.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um node com esta chave no workflow'
      });
    }

    // Criar node
    const newNode = await db
      .insert(workflowNodes)
      .values({
        workflowId,
        tenantId,
        nodeKey,
        nodeType,
        name: name.trim(),
        description: description?.trim() || null,
        position,
        size,
        style,
        config,
        inputSchema,
        outputSchema,
        timeout,
        retryCount
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newNode[0],
      message: 'Node adicionado com sucesso'
    });

  } catch (error) {
    console.error('Error adding workflow node:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao adicionar node ao workflow' 
    });
  }
});

// PUT /api/visual-workflows/:workflowId/nodes/:nodeId - Atualizar node
router.put('/:workflowId/nodes/:nodeId', async (req: any, res) => {
  try {
    const { workflowId, nodeId } = req.params;
    const updateData = req.body;
    const tenantId = req.tenant.id;

    // Verificar se node existe
    const existingNode = await db
      .select()
      .from(workflowNodes)
      .where(and(
        eq(workflowNodes.id, nodeId),
        eq(workflowNodes.workflowId, workflowId),
        eq(workflowNodes.tenantId, tenantId)
      ))
      .limit(1);

    if (existingNode.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Node não encontrado'
      });
    }

    // Atualizar node
    const updatedNode = await db
      .update(workflowNodes)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(workflowNodes.id, nodeId))
      .returning();

    res.json({
      success: true,
      data: updatedNode[0],
      message: 'Node atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating workflow node:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao atualizar node' 
    });
  }
});

// DELETE /api/visual-workflows/:workflowId/nodes/:nodeId - Deletar node
router.delete('/:workflowId/nodes/:nodeId', async (req: any, res) => {
  try {
    const { workflowId, nodeId } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se node existe
    const existingNode = await db
      .select()
      .from(workflowNodes)
      .where(and(
        eq(workflowNodes.id, nodeId),
        eq(workflowNodes.workflowId, workflowId),
        eq(workflowNodes.tenantId, tenantId)
      ))
      .limit(1);

    if (existingNode.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Node não encontrado'
      });
    }

    // Deletar connections relacionadas primeiro
    await db
      .delete(workflowConnections)
      .where(or(
        eq(workflowConnections.sourceNodeId, nodeId),
        eq(workflowConnections.targetNodeId, nodeId)
      ));

    // Deletar node
    await db
      .delete(workflowNodes)
      .where(eq(workflowNodes.id, nodeId));

    res.json({
      success: true,
      message: 'Node deletado com sucesso'
    });

  } catch (error) {
    console.error('Error deleting workflow node:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao deletar node' 
    });
  }
});

// ==========================================
// WORKFLOW CONNECTIONS - OPERAÇÕES
// ==========================================

// POST /api/visual-workflows/:workflowId/connections - Criar conexão
router.post('/:workflowId/connections', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const {
      sourceNodeId,
      targetNodeId,
      sourceHandle,
      targetHandle,
      label,
      style = {},
      condition,
      priority = 0
    } = req.body;

    const tenantId = req.tenant.id;

    // Validações
    if (!sourceNodeId || !targetNodeId) {
      return res.status(400).json({
        success: false,
        error: 'Source e target nodes são obrigatórios'
      });
    }

    // Verificar se os nodes existem
    const nodes = await db
      .select()
      .from(workflowNodes)
      .where(and(
        eq(workflowNodes.workflowId, workflowId),
        eq(workflowNodes.tenantId, tenantId),
        or(
          eq(workflowNodes.id, sourceNodeId),
          eq(workflowNodes.id, targetNodeId)
        )
      ));

    if (nodes.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Um ou ambos os nodes não foram encontrados'
      });
    }

    // Criar conexão
    const newConnection = await db
      .insert(workflowConnections)
      .values({
        workflowId,
        tenantId,
        sourceNodeId,
        targetNodeId,
        sourceHandle,
        targetHandle,
        label,
        style,
        condition,
        priority
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newConnection[0],
      message: 'Conexão criada com sucesso'
    });

  } catch (error) {
    console.error('Error creating workflow connection:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao criar conexão' 
    });
  }
});

// DELETE /api/visual-workflows/:workflowId/connections/:connectionId - Deletar conexão
router.delete('/:workflowId/connections/:connectionId', async (req: any, res) => {
  try {
    const { workflowId, connectionId } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se conexão existe
    const existingConnection = await db
      .select()
      .from(workflowConnections)
      .where(and(
        eq(workflowConnections.id, connectionId),
        eq(workflowConnections.workflowId, workflowId),
        eq(workflowConnections.tenantId, tenantId)
      ))
      .limit(1);

    if (existingConnection.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    // Deletar conexão
    await db
      .delete(workflowConnections)
      .where(eq(workflowConnections.id, connectionId));

    res.json({
      success: true,
      message: 'Conexão deletada com sucesso'
    });

  } catch (error) {
    console.error('Error deleting workflow connection:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao deletar conexão' 
    });
  }
});

// ==========================================
// WORKFLOW EXECUTION - EXECUÇÃO E TESTE
// ==========================================

// POST /api/visual-workflows/:id/execute - Executar workflow manualmente
router.post('/:id/execute', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { input = {}, triggerData = {} } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Verificar se workflow existe e está ativo
    const workflow = await db
      .select()
      .from(visualWorkflows)
      .where(and(
        eq(visualWorkflows.id, id),
        eq(visualWorkflows.tenantId, tenantId)
      ))
      .limit(1);

    if (workflow.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow não encontrado'
      });
    }

    if (!workflow[0].isActive) {
      return res.status(400).json({
        success: false,
        error: 'Workflow está inativo'
      });
    }

    // Buscar nodes e connections
    const nodes = await db
      .select()
      .from(workflowNodes)
      .where(eq(workflowNodes.workflowId, id))
      .orderBy(workflowNodes.createdAt);

    const connections = await db
      .select()
      .from(workflowConnections)
      .where(eq(workflowConnections.workflowId, id));

    if (nodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Workflow não possui nodes para executar'
      });
    }

    // Criar execução
    const executionId = nanoid();
    const execution = await db
      .insert(visualWorkflowExecutions)
      .values({
        workflowId: id,
        tenantId,
        userId,
        executionId,
        status: 'running',
        triggerType: 'manual',
        triggerData,
        context: { variables: workflow[0].variables },
        input,
      })
      .returning();

    // Simular execução dos nodes (em produção, usar queue/worker)
    const executionResult = await simulateWorkflowExecution(
      workflow[0],
      nodes,
      connections,
      input,
      executionId
    );

    // Atualizar execução com resultado
    await db
      .update(visualWorkflowExecutions)
      .set({
        status: executionResult.success ? 'completed' : 'failed',
        output: executionResult.output,
        error: executionResult.error,
        completedAt: new Date(),
        duration: Date.now() - new Date(execution[0].startedAt).getTime(),
        nodesExecuted: executionResult.nodesExecuted,
        totalNodes: nodes.length
      })
      .where(eq(visualWorkflowExecutions.executionId, executionId));

    // Atualizar estatísticas do workflow
    await db
      .update(visualWorkflows)
      .set({
        executionCount: sql`${visualWorkflows.executionCount} + 1`,
        lastExecuted: new Date()
      })
      .where(eq(visualWorkflows.id, id));

    res.json({
      success: true,
      data: {
        executionId,
        status: executionResult.success ? 'completed' : 'failed',
        output: executionResult.output,
        error: executionResult.error,
        nodesExecuted: executionResult.nodesExecuted,
        totalNodes: nodes.length
      },
      message: 'Workflow executado com sucesso'
    });

  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao executar workflow' 
    });
  }
});

// GET /api/visual-workflows/:id/executions - Histórico de execuções
router.get('/:id/executions', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const tenantId = req.tenant.id;

    const executions = await db
      .select()
      .from(visualWorkflowExecutions)
      .where(and(
        eq(visualWorkflowExecutions.workflowId, id),
        eq(visualWorkflowExecutions.tenantId, tenantId)
      ))
      .orderBy(desc(visualWorkflowExecutions.startedAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: executions,
      total: executions.length
    });

  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar execuções do workflow' 
    });
  }
});

// ==========================================
// WORKFLOW TEMPLATES - TEMPLATES E GALERIA
// ==========================================

// GET /api/visual-workflows/templates - Listar templates disponíveis
router.get('/templates', async (req: any, res) => {
  try {
    const { category, difficulty, limit = 20 } = req.query;

    let query = db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.isPublic, true));

    if (category) {
      query = query.where(eq(workflowTemplates.category, category));
    }

    if (difficulty) {
      query = query.where(eq(workflowTemplates.difficulty, difficulty));
    }

    const templates = await query
      .orderBy(desc(workflowTemplates.useCount))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar templates' 
    });
  }
});

// POST /api/visual-workflows/templates/:templateId/use - Usar template
router.post('/templates/:templateId/use', async (req: any, res) => {
  try {
    const { templateId } = req.params;
    const { name, description } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Buscar template
    const template = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.id, templateId))
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado'
      });
    }

    // Criar workflow a partir do template
    const templateData = template[0].templateData as any;
    const newWorkflow = await db
      .insert(visualWorkflows)
      .values({
        tenantId,
        userId,
        name: name || `${template[0].name} - Cópia`,
        description: description || template[0].description,
        category: template[0].category,
        canvasData: templateData.canvasData || {},
        nodes: templateData.nodes || [],
        connections: templateData.connections || [],
        triggerConfig: templateData.triggerConfig || {},
        variables: templateData.variables || {},
        settings: templateData.settings || {}
      })
      .returning();

    // Incrementar contador de uso do template
    await db
      .update(workflowTemplates)
      .set({
        useCount: sql`${workflowTemplates.useCount} + 1`
      })
      .where(eq(workflowTemplates.id, templateId));

    res.status(201).json({
      success: true,
      data: newWorkflow[0],
      message: 'Workflow criado a partir do template'
    });

  } catch (error) {
    console.error('Error using workflow template:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao usar template' 
    });
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Função para simular execução de workflow (versão simplificada)
async function simulateWorkflowExecution(
  workflow: any,
  nodes: any[],
  connections: any[],
  input: any,
  executionId: string
): Promise<{
  success: boolean;
  output?: any;
  error?: string;
  nodesExecuted: number;
}> {
  try {
    // Encontrar node trigger (primeiro node)
    const triggerNode = nodes.find(node => node.nodeType === 'trigger');
    if (!triggerNode) {
      return {
        success: false,
        error: 'Nenhum node trigger encontrado',
        nodesExecuted: 0
      };
    }

    let currentOutput = input;
    let nodesExecuted = 0;
    const executedNodes = new Set();

    // Simular execução sequencial dos nodes
    let currentNode = triggerNode;
    
    while (currentNode && !executedNodes.has(currentNode.id)) {
      executedNodes.add(currentNode.id);
      nodesExecuted++;

      // Simular processamento do node
      currentOutput = await simulateNodeExecution(currentNode, currentOutput);

      // Encontrar próximo node
      const nextConnection = connections.find(conn => 
        conn.sourceNodeId === currentNode.id
      );
      
      if (nextConnection) {
        currentNode = nodes.find(node => node.id === nextConnection.targetNodeId);
      } else {
        currentNode = null;
      }

      // Timeout de segurança
      if (nodesExecuted > 50) break;
    }

    return {
      success: true,
      output: currentOutput,
      nodesExecuted
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      nodesExecuted: 0
    };
  }
}

// Simular execução de um node individual
async function simulateNodeExecution(node: any, input: any): Promise<any> {
  // Simular delay baseado no tipo do node
  const delay = node.nodeType === 'delay' ? 
    (node.config?.duration || 1000) : 
    Math.random() * 500 + 100;
    
  await new Promise(resolve => setTimeout(resolve, delay));

  // Simular diferentes tipos de processamento
  switch (node.nodeType) {
    case 'trigger':
      return { ...input, triggeredBy: node.name, timestamp: new Date().toISOString() };
    
    case 'condition':
      const condition = node.config?.condition || true;
      return { ...input, conditionResult: condition };
    
    case 'action':
      return { ...input, actionExecuted: node.name, result: 'success' };
    
    case 'email':
      return { ...input, emailSent: true, to: node.config?.to || 'test@example.com' };
    
    case 'webhook':
      return { ...input, webhookCalled: true, url: node.config?.url || 'https://example.com' };
    
    case 'data_transform':
      return { ...input, transformed: true, data: input };
    
    default:
      return { ...input, processedBy: node.nodeType };
  }
}

export { router as visualWorkflowRoutes };