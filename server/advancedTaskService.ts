import { db } from './db.js';
import { taskTemplates, taskInstances } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface TaskField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime' | 'email' | 'url' | 'checkbox' | 'radio' | 'select' | 'multiselect' | 'file' | 'rating' | 'slider';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  options?: string[]; // Para radio, select, multiselect
  defaultValue?: any;
  conditionalLogic?: {
    showIf?: {
      fieldId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    };
  };
}

export interface TaskTemplate {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number; // em minutos
  priority: 'low' | 'medium' | 'high' | 'critical';
  fields: TaskField[];
  isActive: boolean;
  tags: string[];
  assignmentRules?: {
    autoAssign?: boolean;
    assignTo?: string; // userId ou departmentId
    dueInDays?: number;
  };
  notifications?: {
    onCreate?: boolean;
    onUpdate?: boolean;
    onComplete?: boolean;
    reminderDays?: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInstance {
  id: string;
  templateId: string;
  tenantId: string;
  assignedTo: string;
  assignedBy: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  responses: Record<string, any>; // fieldId -> response value
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  attachments: string[];
  comments: TaskComment[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
}

export interface TaskResponse {
  taskId: string;
  fieldId: string;
  fieldLabel: string;
  value: any;
  submittedAt: Date;
}

class AdvancedTaskService {
  /**
   * Criar template de tarefa avançado
   */
  async createTemplate(templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const templateId = nanoid();
    
    await db.insert(taskTemplates).values({
      id: templateId,
      tenantId: templateData.tenantId,
      userId: templateData.userId,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      estimatedDuration: templateData.estimatedDuration,
      priority: templateData.priority,
      fields: JSON.stringify(templateData.fields),
      isActive: templateData.isActive,
      tags: JSON.stringify(templateData.tags || []),
      assignmentRules: JSON.stringify(templateData.assignmentRules || {}),
      notifications: JSON.stringify(templateData.notifications || {}),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return templateId;
  }

  /**
   * Criar instância de tarefa a partir de template
   */
  async createTaskFromTemplate(
    templateId: string, 
    assignedTo: string, 
    assignedBy: string, 
    tenantId: string, 
    customData?: Partial<TaskInstance>
  ): Promise<string> {
    // Buscar template
    const [template] = await db.select()
      .from(taskTemplates)
      .where(and(
        eq(taskTemplates.id, templateId),
        eq(taskTemplates.tenantId, tenantId)
      ));

    if (!template) {
      throw new Error('Template não encontrado');
    }

    const taskId = nanoid();
    const assignmentRules = template.assignmentRules ? JSON.parse(template.assignmentRules) : {};
    
    // Calcular data de vencimento baseada nas regras
    let dueDate: Date | undefined;
    if (assignmentRules.dueInDays) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + assignmentRules.dueInDays);
    }

    await db.insert(taskInstances).values({
      id: taskId,
      templateId: templateId,
      tenantId: tenantId,
      assignedTo: assignedTo,
      assignedBy: assignedBy,
      title: customData?.title || template.name,
      description: customData?.description || template.description,
      priority: customData?.priority || template.priority,
      status: 'pending',
      responses: JSON.stringify({}),
      dueDate: customData?.dueDate || dueDate,
      attachments: JSON.stringify(customData?.attachments || []),
      comments: JSON.stringify([]),
      tags: JSON.stringify(customData?.tags || JSON.parse(template.tags || '[]')),
      metadata: JSON.stringify(customData?.metadata || {}),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Enviar notificação se configurado
    const notifications = template.notifications ? JSON.parse(template.notifications) : {};
    if (notifications.onCreate) {
      await this.sendTaskNotification(taskId, 'created');
    }

    return taskId;
  }

  /**
   * Atualizar respostas da tarefa
   */
  async updateTaskResponses(
    taskId: string, 
    responses: Record<string, any>, 
    userId: string, 
    tenantId: string
  ): Promise<void> {
    // Buscar tarefa e template
    const [task] = await db.select()
      .from(taskInstances)
      .where(and(
        eq(taskInstances.id, taskId),
        eq(taskInstances.tenantId, tenantId)
      ));

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    // Verificar se usuário pode atualizar (é o responsável ou manager)
    if (task.assignedTo !== userId) {
      // TODO: Verificar se é manager/admin
    }

    const [template] = await db.select()
      .from(taskTemplates)
      .where(eq(taskTemplates.id, task.templateId));

    if (!template) {
      throw new Error('Template da tarefa não encontrado');
    }

    // Validar respostas baseado nos campos do template
    const fields: TaskField[] = JSON.parse(template.fields || '[]');
    const validatedResponses = await this.validateResponses(responses, fields);

    // Atualizar tarefa
    const currentResponses = JSON.parse(task.responses || '{}');
    const updatedResponses = { ...currentResponses, ...validatedResponses };

    await db.update(taskInstances)
      .set({
        responses: JSON.stringify(updatedResponses),
        status: task.status === 'pending' ? 'in_progress' : task.status,
        startedAt: task.startedAt || new Date(),
        updatedAt: new Date()
      })
      .where(eq(taskInstances.id, taskId));

    // Enviar notificação se configurado
    const notifications = JSON.parse(template.notifications || '{}');
    if (notifications.onUpdate) {
      await this.sendTaskNotification(taskId, 'updated');
    }
  }

  /**
   * Marcar tarefa como concluída
   */
  async completeTask(
    taskId: string, 
    finalResponses: Record<string, any>, 
    userId: string, 
    tenantId: string
  ): Promise<void> {
    // Atualizar respostas finais
    await this.updateTaskResponses(taskId, finalResponses, userId, tenantId);

    // Marcar como concluída
    await db.update(taskInstances)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(taskInstances.id, taskId),
        eq(taskInstances.tenantId, tenantId)
      ));

    // Buscar template para notificação
    const [task] = await db.select()
      .from(taskInstances)
      .where(eq(taskInstances.id, taskId));

    if (task) {
      const [template] = await db.select()
        .from(taskTemplates)
        .where(eq(taskTemplates.id, task.templateId));

      if (template) {
        const notifications = JSON.parse(template.notifications || '{}');
        if (notifications.onComplete) {
          await this.sendTaskNotification(taskId, 'completed');
        }
      }
    }
  }

  /**
   * Adicionar comentário à tarefa
   */
  async addComment(
    taskId: string, 
    userId: string, 
    userName: string, 
    message: string, 
    tenantId: string
  ): Promise<string> {
    const [task] = await db.select()
      .from(taskInstances)
      .where(and(
        eq(taskInstances.id, taskId),
        eq(taskInstances.tenantId, tenantId)
      ));

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    const commentId = nanoid();
    const comment: TaskComment = {
      id: commentId,
      userId,
      userName,
      message,
      createdAt: new Date()
    };

    const currentComments: TaskComment[] = JSON.parse(task.comments || '[]');
    currentComments.push(comment);

    await db.update(taskInstances)
      .set({
        comments: JSON.stringify(currentComments),
        updatedAt: new Date()
      })
      .where(eq(taskInstances.id, taskId));

    return commentId;
  }

  /**
   * Buscar tarefas com filtros avançados
   */
  async getTasks(tenantId: string, filters: {
    assignedTo?: string;
    status?: string[];
    priority?: string[];
    category?: string;
    tags?: string[];
    dueDateFrom?: Date;
    dueDateTo?: Date;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // TODO: Implementar filtros complexos usando SQL
    // Por enquanto, busca básica
    const tasks = await db.select()
      .from(taskInstances)
      .where(eq(taskInstances.tenantId, tenantId))
      .limit(limit)
      .offset(offset);

    return tasks.map(task => ({
      ...task,
      responses: JSON.parse(task.responses || '{}'),
      comments: JSON.parse(task.comments || '[]'),
      tags: JSON.parse(task.tags || '[]'),
      attachments: JSON.parse(task.attachments || '[]'),
      metadata: JSON.parse(task.metadata || '{}')
    }));
  }

  /**
   * Gerar relatórios de produtividade
   */
  async generateProductivityReport(tenantId: string, period: {
    from: Date;
    to: Date;
    userId?: string;
  }) {
    // TODO: Implementar relatórios avançados
    const tasks = await db.select()
      .from(taskInstances)
      .where(eq(taskInstances.tenantId, tenantId));

    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;

    return {
      totalTasks: tasks.length,
      completed,
      pending,
      inProgress,
      completionRate: tasks.length > 0 ? (completed / tasks.length * 100) : 0,
      averageCompletionTime: 0, // TODO: Calcular baseado em datas
      topPerformers: [], // TODO: Implementar ranking
      tasksByCategory: {}, // TODO: Agrupar por categoria
      tasksByPriority: {} // TODO: Agrupar por prioridade
    };
  }

  /**
   * Validar respostas baseado nos campos do template
   */
  private async validateResponses(responses: Record<string, any>, fields: TaskField[]): Promise<Record<string, any>> {
    const validatedResponses: Record<string, any> = {};

    for (const field of fields) {
      const value = responses[field.id];

      // Verificar campos obrigatórios
      if (field.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Campo '${field.label}' é obrigatório`);
      }

      // Validar por tipo
      if (value !== undefined && value !== null && value !== '') {
        switch (field.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              throw new Error(`Campo '${field.label}' deve ser um email válido`);
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              throw new Error(`Campo '${field.label}' deve ser uma URL válida`);
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              throw new Error(`Campo '${field.label}' deve ser um número`);
            }
            // Validações min/max
            if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
              throw new Error(`Campo '${field.label}' deve ser maior que ${field.validation.min}`);
            }
            if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
              throw new Error(`Campo '${field.label}' deve ser menor que ${field.validation.max}`);
            }
            break;
          case 'select':
          case 'radio':
            if (field.options && !field.options.includes(value)) {
              throw new Error(`Valor inválido para campo '${field.label}'`);
            }
            break;
          case 'multiselect':
            if (field.options && Array.isArray(value)) {
              for (const item of value) {
                if (!field.options.includes(item)) {
                  throw new Error(`Valor inválido para campo '${field.label}': ${item}`);
                }
              }
            }
            break;
        }

        // Validação por regex se especificada
        if (field.validation?.pattern && typeof value === 'string') {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            throw new Error(field.validation.customMessage || `Formato inválido para campo '${field.label}'`);
          }
        }
      }

      validatedResponses[field.id] = value;
    }

    return validatedResponses;
  }

  /**
   * Enviar notificação de tarefa
   */
  private async sendTaskNotification(taskId: string, event: 'created' | 'updated' | 'completed') {
    // TODO: Integrar com sistema de notificações
    console.log(`📧 Notificação de tarefa: ${taskId} - ${event}`);
  }

  /**
   * Avaliar lógica condicional dos campos
   */
  evaluateConditionalLogic(responses: Record<string, any>, field: TaskField): boolean {
    if (!field.conditionalLogic?.showIf) {
      return true; // Sempre mostrar se não há lógica condicional
    }

    const condition = field.conditionalLogic.showIf;
    const fieldValue = responses[condition.fieldId];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue || '').includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue || 0) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue || 0) < Number(condition.value);
      default:
        return true;
    }
  }
}

export const advancedTaskService = new AdvancedTaskService();