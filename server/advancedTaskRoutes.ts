import { Router, Request, Response } from 'express';
import { advancedTaskService } from './advancedTaskService.js';
import { authMiddleware } from './authMiddleware.js';

const router = Router();

/**
 * Criar template de tarefa avançado
 * POST /api/advanced-tasks/templates
 */
router.post('/templates', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const templateData = {
      ...req.body,
      tenantId,
      userId
    };

    // Validar dados obrigatórios
    if (!templateData.name || !templateData.fields || !Array.isArray(templateData.fields)) {
      return res.status(400).json({
        success: false,
        message: 'Nome do template e campos são obrigatórios'
      });
    }

    const templateId = await advancedTaskService.createTemplate(templateData);

    res.json({
      success: true,
      data: { templateId },
      message: 'Template criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Criar tarefa a partir de template
 * POST /api/advanced-tasks/create-from-template
 */
router.post('/create-from-template', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const { templateId, assignedTo, customData } = req.body;

    if (!templateId || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Template ID e usuário a ser atribuído são obrigatórios'
      });
    }

    const taskId = await advancedTaskService.createTaskFromTemplate(
      templateId,
      assignedTo,
      userId,
      tenantId,
      customData
    );

    res.json({
      success: true,
      data: { taskId },
      message: 'Tarefa criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Atualizar respostas da tarefa
 * PUT /api/advanced-tasks/:taskId/responses
 */
router.put('/:taskId/responses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { responses } = req.body;
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Respostas são obrigatórias'
      });
    }

    await advancedTaskService.updateTaskResponses(taskId, responses, userId, tenantId);

    res.json({
      success: true,
      message: 'Respostas atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar respostas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Marcar tarefa como concluída
 * POST /api/advanced-tasks/:taskId/complete
 */
router.post('/:taskId/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { finalResponses = {} } = req.body;
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    await advancedTaskService.completeTask(taskId, finalResponses, userId, tenantId);

    res.json({
      success: true,
      message: 'Tarefa concluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Adicionar comentário à tarefa
 * POST /api/advanced-tasks/:taskId/comments
 */
router.post('/:taskId/comments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;
    const userId = (req.session as any)?.user?.id;
    const userName = (req.session as any)?.user?.firstName + ' ' + (req.session as any)?.user?.lastName;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    const commentId = await advancedTaskService.addComment(
      taskId,
      userId,
      userName,
      message.trim(),
      tenantId
    );

    res.json({
      success: true,
      data: { commentId },
      message: 'Comentário adicionado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Buscar tarefas com filtros avançados
 * GET /api/advanced-tasks
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const filters = {
      assignedTo: req.query.assignedTo as string,
      status: req.query.status ? (req.query.status as string).split(',') : undefined,
      priority: req.query.priority ? (req.query.priority as string).split(',') : undefined,
      category: req.query.category as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    // Converter datas se fornecidas
    if (req.query.dueDateFrom) {
      filters.dueDateFrom = new Date(req.query.dueDateFrom as string);
    }
    if (req.query.dueDateTo) {
      filters.dueDateTo = new Date(req.query.dueDateTo as string);
    }

    const tasks = await advancedTaskService.getTasks(tenantId, filters);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: tasks.length // TODO: Implementar contagem total
      }
    });

  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Buscar detalhes de uma tarefa específica
 * GET /api/advanced-tasks/:taskId
 */
router.get('/:taskId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const tasks = await advancedTaskService.getTasks(tenantId, { 
      page: 1, 
      limit: 1 
    });

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Gerar relatório de produtividade
 * GET /api/advanced-tasks/reports/productivity
 */
router.get('/reports/productivity', authMiddleware, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.session as any)?.user?.tenant?.id;
    const userId = req.query.userId as string;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Período padrão: últimos 30 dias
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    // Override com query params se fornecidos
    if (req.query.from) {
      from.setTime(new Date(req.query.from as string).getTime());
    }
    if (req.query.to) {
      to.setTime(new Date(req.query.to as string).getTime());
    }

    const report = await advancedTaskService.generateProductivityReport(tenantId, {
      from,
      to,
      userId
    });

    res.json({
      success: true,
      data: report,
      period: { from, to }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * Validar campos de template
 * POST /api/advanced-tasks/validate-fields
 */
router.post('/validate-fields', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { fields, responses } = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: 'Campos são obrigatórios'
      });
    }

    // Validar estrutura dos campos
    const validationErrors: string[] = [];

    for (const field of fields) {
      if (!field.id || !field.type || !field.label) {
        validationErrors.push(`Campo inválido: deve ter id, type e label`);
        continue;
      }

      // Validar tipos suportados
      const supportedTypes = [
        'text', 'textarea', 'number', 'date', 'time', 'datetime', 
        'email', 'url', 'checkbox', 'radio', 'select', 'multiselect', 
        'file', 'rating', 'slider'
      ];

      if (!supportedTypes.includes(field.type)) {
        validationErrors.push(`Tipo '${field.type}' não é suportado`);
      }

      // Validar campos que precisam de opções
      if (['radio', 'select', 'multiselect'].includes(field.type)) {
        if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
          validationErrors.push(`Campo '${field.label}' do tipo '${field.type}' precisa de opções`);
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação encontrados',
        errors: validationErrors
      });
    }

    // Se foram fornecidas respostas, validar também
    let responseValidation = null;
    if (responses) {
      try {
        // Simular validação sem salvar
        responseValidation = {
          valid: true,
          errors: []
        };
        // TODO: Usar o método de validação do service
      } catch (error) {
        responseValidation = {
          valid: false,
          errors: [error.message]
        };
      }
    }

    res.json({
      success: true,
      data: {
        fieldsValid: true,
        fieldCount: fields.length,
        responseValidation
      },
      message: 'Validação concluída com sucesso'
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

export { router as advancedTaskRoutes };