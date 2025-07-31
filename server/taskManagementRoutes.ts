import { Router } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTaskTemplateSchema, 
  insertTaskInstanceSchema, 
  insertTaskCommentSchema,
  insertNotificationSchema 
} from "@shared/schema";

const router = Router();

// CRIAR TEMPLATE DE TAREFA (para gerentes/líderes)
router.post("/templates", async (req: any, res) => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    const managerId = req.user.id;
    
    const templateData = {
      ...req.body,
      tenantId,
      managerId
    };
    
    const template = await storage.createTaskTemplate(templateData);
    
    // Log da atividade
    await storage.createActivity({
      tenantId,
      userId: managerId,
      action: "task_template_created",
      description: `Template de tarefa "${template.title}" criado`,
      metadata: { templateId: template.id }
    });
    
    res.json(template);
  } catch (error) {
    console.error("Erro criando template:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// LISTAR TEMPLATES DO GERENTE
router.get("/templates", async (req: any, res) => {
  try {
    const tenantId = req.tenant?.id || req.user?.tenantId;
    const managerId = req.user.id;
    
    const templates = await storage.getTaskTemplatesByManager(managerId, tenantId);
    res.json(templates);
  } catch (error) {
    console.error("Erro listando templates:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ATUALIZAR TEMPLATE
router.put("/templates/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const template = await storage.updateTaskTemplate(id, req.body);
    
    await storage.createActivity({
      tenantId,
      userId: req.user.id,
      action: "task_template_updated", 
      description: `Template "${template.title}" atualizado`,
      metadata: { templateId: id }
    });
    
    res.json(template);
  } catch (error) {
    console.error("Erro atualizando template:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETAR TEMPLATE
router.delete("/templates/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    await storage.deleteTaskTemplate(id);
    
    await storage.createActivity({
      tenantId,
      userId: req.user.id,
      action: "task_template_deleted",
      description: "Template de tarefa deletado",
      metadata: { templateId: id }
    });
    
    res.sendStatus(204);
  } catch (error) {
    console.error("Erro deletando template:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// CRIAR INSTÂNCIA DE TAREFA (executar template)
router.post("/templates/:id/execute", async (req: any, res) => {
  try {
    const { id: templateId } = req.params;
    const { assignedToId, dueDate, customData } = req.body;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    const assignedById = req.user.id;
    
    const template = await storage.getTaskTemplate(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template não encontrado" });
    }
    
    const taskInstance = await storage.createTaskInstance({
      tenantId,
      templateId,
      assignedToId,
      assignedById,
      title: template.title,
      description: template.description,
      priority: template.priority,
      dueDate: new Date(dueDate),
      status: "pending",
      completionData: customData || {},
      checklistProgress: {}
    });
    
    // Criar notificação para o funcionário
    await storage.createNotification({
      tenantId,
      userId: assignedToId,
      type: "task_assigned",
      title: "Nova tarefa atribuída",
      message: `Você recebeu uma nova tarefa: ${template.title}`,
      data: { taskInstanceId: taskInstance.id, templateId },
      actionUrl: `/tasks/${taskInstance.id}`
    });
    
    // Log da atividade
    await storage.createActivity({
      tenantId,
      userId: assignedById,
      action: "task_assigned",
      description: `Tarefa "${template.title}" atribuída para funcionário`,
      metadata: { 
        taskInstanceId: taskInstance.id,
        templateId,
        assignedToId 
      }
    });
    
    res.json(taskInstance);
  } catch (error) {
    console.error("Erro executando template:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// LISTAR TAREFAS DO FUNCIONÁRIO
router.get("/my-tasks", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const tasks = await storage.getTasksByUser(userId, tenantId);
    res.json(tasks);
  } catch (error) {
    console.error("Erro listando tarefas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// INICIAR TAREFA
router.post("/instances/:id/start", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const task = await storage.updateTaskInstance(id, {
      status: "in_progress",
      startedAt: new Date()
    });
    
    await storage.createActivity({
      tenantId,
      userId,
      action: "task_started",
      description: `Tarefa "${task.title}" iniciada`,
      metadata: { taskInstanceId: id }
    });
    
    res.json(task);
  } catch (error) {
    console.error("Erro iniciando tarefa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// COMPLETAR TAREFA
router.post("/instances/:id/complete", async (req: any, res) => {
  try {
    const { id } = req.params;
    const { completionData, notes } = req.body;
    const userId = req.user.id;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const task = await storage.updateTaskInstance(id, {
      status: "completed",
      completedAt: new Date(),
      completionData,
      notes
    });
    
    // Notificar o gerente que atribuiu a tarefa
    await storage.createNotification({
      tenantId,
      userId: task.assignedById,
      type: "task_completed",
      title: "Tarefa completada",
      message: `A tarefa "${task.title}" foi completada`,
      data: { taskInstanceId: id },
      actionUrl: `/tasks/${id}/review`
    });
    
    await storage.createActivity({
      tenantId,
      userId,
      action: "task_completed",
      description: `Tarefa "${task.title}" completada`,
      metadata: { taskInstanceId: id, completionData }
    });
    
    res.json(task);
  } catch (error) {
    console.error("Erro completando tarefa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// OBTER DETALHES DA TAREFA
router.get("/instances/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const task = await storage.getTaskInstance(id);
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    
    // Obter comentários da tarefa
    const comments = await storage.getTaskComments(id);
    
    res.json({ ...task, comments });
  } catch (error) {
    console.error("Erro obtendo tarefa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ADICIONAR COMENTÁRIO
router.post("/instances/:id/comments", async (req: any, res) => {
  try {
    const { id: taskInstanceId } = req.params;
    const { comment, isInternal } = req.body;
    const userId = req.user.id;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const taskComment = await storage.createTaskComment({
      tenantId,
      taskInstanceId,
      userId,
      comment,
      isInternal: isInternal || false
    });
    
    res.json(taskComment);
  } catch (error) {
    console.error("Erro adicionando comentário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// OBTER NOTIFICAÇÕES DO USUÁRIO
router.get("/notifications", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const notifications = await storage.getUserNotifications(userId, tenantId);
    res.json(notifications);
  } catch (error) {
    console.error("Erro obtendo notificações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// MARCAR NOTIFICAÇÃO COMO LIDA
router.put("/notifications/:id/read", async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const notification = await storage.markNotificationAsRead(id);
    res.json(notification);
  } catch (error) {
    console.error("Erro marcando notificação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// LISTAR TAREFAS DO DEPARTAMENTO (para gerentes)
router.get("/department-tasks", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenant?.id || req.user?.tenantId;
    
    const tasks = await storage.getDepartmentTasks(userId, tenantId);
    res.json(tasks);
  } catch (error) {
    console.error("Erro listando tarefas do departamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export { router as taskManagementRoutes };