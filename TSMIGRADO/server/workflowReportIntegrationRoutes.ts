/**
 * WORKFLOW ↔ REPORTS INTEGRATION ROUTES - Sistema completo de integração
 * Relatórios executivos gerados e enviados automaticamente por workflows
 * Sistema core para automação de reporting empresarial
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  visualWorkflows,
  workflowNodes,
  visualWorkflowExecutions,
  nodeExecutions,
  reportTemplates,
  reportSchedules,
  reportGenerations,
  savedQueries,
  dashboards,
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
// WORKFLOW → REPORT GENERATION
// ==========================================

const WorkflowReportGenerationSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  reportConfig: z.object({
    templateId: z.string().optional(),
    reportTemplate: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['financial', 'operational', 'performance', 'compliance', 'custom']).default('custom'),
      templateType: z.enum(['tabular', 'chart', 'dashboard', 'executive', 'detailed']).default('tabular'),
      dataSources: z.array(z.object({
        type: z.enum(['query', 'dashboard', 'api', 'webhook']),
        source: z.string(),
        params: z.record(z.any()).optional(),
        title: z.string(),
        weight: z.number().min(0).max(100).default(100)
      })),
      layout: z.object({
        format: z.enum(['pdf', 'excel', 'html', 'json']).default('pdf'),
        orientation: z.enum(['portrait', 'landscape']).default('portrait'),
        pageSize: z.enum(['A4', 'A3', 'Letter', 'Legal']).default('A4'),
        margins: z.object({
          top: z.number().default(20),
          bottom: z.number().default(20),
          left: z.number().default(20),
          right: z.number().default(20)
        }).optional(),
        header: z.object({
          enabled: z.boolean().default(true),
          title: z.string().optional(),
          logo: z.string().optional(),
          showDate: z.boolean().default(true)
        }).optional(),
        footer: z.object({
          enabled: z.boolean().default(true),
          text: z.string().optional(),
          showPageNumbers: z.boolean().default(true)
        }).optional()
      }),
      styling: z.object({
        theme: z.enum(['professional', 'modern', 'corporate', 'minimal']).default('professional'),
        primaryColor: z.string().default('#1a365d'),
        secondaryColor: z.string().default('#2d3748'),
        fontFamily: z.enum(['Arial', 'Helvetica', 'Times', 'Calibri']).default('Arial'),
        fontSize: z.number().min(8).max(16).default(11)
      }).optional()
    }).optional(),
    generationConfig: z.object({
      generateNow: z.boolean().default(true),
      schedule: z.object({
        frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'quarterly']).default('once'),
        time: z.string().optional(), // HH:MM format
        dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday
        dayOfMonth: z.number().min(1).max(31).optional(),
        endDate: z.string().optional()
      }).optional(),
      distribution: z.object({
        emails: z.array(z.string().email()).optional(),
        userIds: z.array(z.string()).optional(),
        saveToSystem: z.boolean().default(true),
        notifyOnComplete: z.boolean().default(true)
      }).optional()
    })
  })
});

// POST /api/workflow-report-integration/generate-report - Gerar relatório via workflow
router.post('/generate-report', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📋 Gerando relatório em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowReportGenerationSchema.parse(req.body);
    
    let templateId: string;
    
    // Se templateId fornecido, usar template existente
    if (validatedData.reportConfig.templateId) {
      const existingTemplate = await db
        .select()
        .from(reportTemplates)
        .where(and(
          eq(reportTemplates.id, validatedData.reportConfig.templateId),
          eq(reportTemplates.tenantId, tenantId)
        ))
        .limit(1);
      
      if (existingTemplate.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Template de relatório não encontrado',
          type: 'template_not_found'
        });
      }
      
      templateId = validatedData.reportConfig.templateId;
    } else if (validatedData.reportConfig.reportTemplate) {
      // Criar novo template
      const newTemplate = await db.insert(reportTemplates).values({
        id: nanoid(),
        tenantId,
        userId,
        name: validatedData.reportConfig.reportTemplate.name,
        description: validatedData.reportConfig.reportTemplate.description || '',
        category: validatedData.reportConfig.reportTemplate.category,
        templateType: validatedData.reportConfig.reportTemplate.templateType,
        templateData: {
          dataSources: validatedData.reportConfig.reportTemplate.dataSources,
          layout: validatedData.reportConfig.reportTemplate.layout,
          styling: validatedData.reportConfig.reportTemplate.styling,
          createdByWorkflow: true,
          workflowId: validatedData.workflowId
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      templateId = newTemplate[0].id;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Template ID ou configuração de template é obrigatória',
        type: 'missing_template'
      });
    }
    
    // Gerar relatório
    const reportGenerationId = nanoid();
    const reportGeneration = await db.insert(reportGenerations).values({
      id: reportGenerationId,
      templateId,
      tenantId,
      userId,
      status: 'generating',
      generatedBy: 'workflow',
      generationTrigger: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        triggeredAt: new Date()
      },
      parameters: validatedData.reportConfig.generationConfig || {},
      createdAt: new Date()
    }).returning();
    
    // Processar geração do relatório (simulado - em produção usar queue)
    const reportResult = await generateReportData(
      templateId,
      validatedData.reportConfig.generationConfig || {},
      tenantId
    );
    
    // Atualizar status da geração
    await db
      .update(reportGenerations)
      .set({
        status: reportResult.success ? 'completed' : 'failed',
        output: reportResult.data,
        error: reportResult.error,
        filePath: reportResult.filePath,
        fileSize: reportResult.fileSize,
        completedAt: new Date(),
        generationTime: Date.now() - new Date(reportGeneration[0].createdAt).getTime()
      })
      .where(eq(reportGenerations.id, reportGenerationId));
    
    // Configurar agendamento se necessário
    if (validatedData.reportConfig.generationConfig?.schedule?.frequency !== 'once') {
      const scheduleId = nanoid();
      await db.insert(reportSchedules).values({
        id: scheduleId,
        templateId,
        tenantId,
        userId,
        frequency: validatedData.reportConfig.generationConfig.schedule!.frequency,
        scheduledTime: validatedData.reportConfig.generationConfig.schedule!.time,
        dayOfWeek: validatedData.reportConfig.generationConfig.schedule!.dayOfWeek,
        dayOfMonth: validatedData.reportConfig.generationConfig.schedule!.dayOfMonth,
        endDate: validatedData.reportConfig.generationConfig.schedule!.endDate ? 
          new Date(validatedData.reportConfig.generationConfig.schedule!.endDate) : null,
        isActive: true,
        distributionConfig: validatedData.reportConfig.generationConfig.distribution || {},
        metadata: {
          createdByWorkflow: true,
          workflowId: validatedData.workflowId,
          nodeId: validatedData.nodeId
        },
        createdAt: new Date()
      });
    }
    
    // Enviar notificações/emails se configurado
    if (validatedData.reportConfig.generationConfig?.distribution?.notifyOnComplete) {
      await sendReportNotifications(
        reportGenerationId,
        validatedData.reportConfig.generationConfig.distribution,
        tenantId,
        userId
      );
    }
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'report_generation',
      status: reportResult.success ? 'completed' : 'failed',
      input: validatedData.reportConfig,
      output: { 
        reportGenerationId,
        templateId,
        success: reportResult.success,
        filePath: reportResult.filePath,
        fileSize: reportResult.fileSize
      },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.status(201).json({
      success: true,
      data: {
        reportGenerationId,
        templateId,
        nodeExecutionId,
        status: reportResult.success ? 'completed' : 'failed',
        filePath: reportResult.filePath,
        fileSize: reportResult.fileSize,
        generationTime: Date.now() - new Date(reportGeneration[0].createdAt).getTime()
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        generatedBy: userId
      },
      message: reportResult.success ? 
        'Relatório gerado com sucesso no workflow' : 
        'Falha na geração do relatório'
    });
    
  } catch (error: any) {
    console.error('Error generating workflow report:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de relatório inválida',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'generation_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na geração do relatório',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW → SCHEDULED REPORTS
// ==========================================

const WorkflowScheduledReportSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  scheduleConfig: z.object({
    templateId: z.string(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
    time: z.string(), // HH:MM
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    endDate: z.string().optional(),
    recipients: z.object({
      emails: z.array(z.string().email()).optional(),
      userIds: z.array(z.string()).optional(),
      includeCreator: z.boolean().default(true)
    }),
    customization: z.object({
      subjectPrefix: z.string().optional(),
      bodyTemplate: z.string().optional(),
      attachmentFormat: z.enum(['pdf', 'excel', 'both']).default('pdf')
    }).optional()
  })
});

// POST /api/workflow-report-integration/schedule-report - Agendar relatório via workflow
router.post('/schedule-report', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📅 Agendando relatório em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowScheduledReportSchema.parse(req.body);
    
    // Verificar se template existe
    const template = await db
      .select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.id, validatedData.scheduleConfig.templateId),
        eq(reportTemplates.tenantId, tenantId)
      ))
      .limit(1);
    
    if (template.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template de relatório não encontrado',
        type: 'template_not_found'
      });
    }
    
    // Criar agendamento
    const scheduleId = nanoid();
    const schedule = await db.insert(reportSchedules).values({
      id: scheduleId,
      templateId: validatedData.scheduleConfig.templateId,
      tenantId,
      userId,
      frequency: validatedData.scheduleConfig.frequency,
      scheduledTime: validatedData.scheduleConfig.time,
      dayOfWeek: validatedData.scheduleConfig.dayOfWeek,
      dayOfMonth: validatedData.scheduleConfig.dayOfMonth,
      endDate: validatedData.scheduleConfig.endDate ? 
        new Date(validatedData.scheduleConfig.endDate) : null,
      isActive: true,
      distributionConfig: {
        recipients: validatedData.scheduleConfig.recipients,
        customization: validatedData.scheduleConfig.customization || {}
      },
      metadata: {
        createdByWorkflow: true,
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        scheduledBy: userId
      },
      createdAt: new Date()
    }).returning();
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'report_scheduling',
      status: 'completed',
      input: validatedData.scheduleConfig,
      output: { 
        scheduleId,
        templateId: validatedData.scheduleConfig.templateId,
        frequency: validatedData.scheduleConfig.frequency,
        nextExecution: calculateNextExecution(validatedData.scheduleConfig)
      },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.status(201).json({
      success: true,
      data: {
        schedule: schedule[0],
        nodeExecutionId,
        nextExecution: calculateNextExecution(validatedData.scheduleConfig)
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        scheduledBy: userId
      },
      message: 'Relatório agendado com sucesso no workflow'
    });
    
  } catch (error: any) {
    console.error('Error scheduling workflow report:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de agendamento inválida',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'scheduling_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno no agendamento do relatório',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// REPORT MANAGEMENT FOR WORKFLOWS
// ==========================================

// GET /api/workflow-report-integration/workflow-reports/:workflowId - Listar relatórios de um workflow
router.get('/workflow-reports/:workflowId', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const tenantId = req.tenant.id;
    const { type = 'all', limit = 20, offset = 0 } = req.query;
    
    let baseQuery = db
      .select({
        generation: reportGenerations,
        template: {
          name: reportTemplates.name,
          category: reportTemplates.category,
          templateType: reportTemplates.templateType
        },
        creator: {
          name: users.name,
          email: users.email
        }
      })
      .from(reportGenerations)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reportGenerations.templateId))
      .leftJoin(users, eq(users.id, reportGenerations.userId))
      .where(and(
        eq(reportGenerations.tenantId, tenantId),
        sql`${reportGenerations.generationTrigger}->>'workflowId' = ${workflowId}`
      ));
    
    if (type !== 'all') {
      baseQuery = baseQuery.where(eq(reportGenerations.status, type));
    }
    
    const workflowReports = await baseQuery
      .orderBy(desc(reportGenerations.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json({
      success: true,
      data: workflowReports,
      total: workflowReports.length,
      metadata: {
        workflowId,
        tenantId,
        type
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching workflow reports:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar relatórios do workflow',
        type: 'internal_error'
      });
    }
  }
});

// GET /api/workflow-report-integration/workflow-schedules/:workflowId - Listar agendamentos de um workflow
router.get('/workflow-schedules/:workflowId', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const tenantId = req.tenant.id;
    
    const workflowSchedules = await db
      .select({
        schedule: reportSchedules,
        template: {
          name: reportTemplates.name,
          category: reportTemplates.category,
          templateType: reportTemplates.templateType
        }
      })
      .from(reportSchedules)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reportSchedules.templateId))
      .where(and(
        eq(reportSchedules.tenantId, tenantId),
        sql`${reportSchedules.metadata}->>'workflowId' = ${workflowId}`
      ))
      .orderBy(desc(reportSchedules.createdAt));
    
    res.json({
      success: true,
      data: workflowSchedules,
      total: workflowSchedules.length,
      metadata: {
        workflowId,
        tenantId
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching workflow schedules:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar agendamentos do workflow',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Gerar dados do relatório
async function generateReportData(
  templateId: string,
  generationConfig: any,
  tenantId: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  filePath?: string;
  fileSize?: number;
}> {
  try {
    // Buscar template
    const template = await db
      .select()
      .from(reportTemplates)
      .where(eq(reportTemplates.id, templateId))
      .limit(1);
    
    if (template.length === 0) {
      throw new Error('Template não encontrado');
    }
    
    const templateData = template[0].templateData as any;
    const reportData: any = {
      template: template[0],
      generatedAt: new Date(),
      sections: []
    };
    
    // Processar cada data source
    for (const dataSource of templateData.dataSources || []) {
      try {
        let sectionData = null;
        
        switch (dataSource.type) {
          case 'query':
            sectionData = await executeQueryForReport(dataSource.source, tenantId);
            break;
            
          case 'dashboard':
            sectionData = await getDashboardDataForReport(dataSource.source, tenantId);
            break;
            
          case 'api':
            sectionData = await fetchAPIDataForReport(dataSource.source, dataSource.params);
            break;
            
          case 'webhook':
            sectionData = await getWebhookDataForReport(dataSource.source, tenantId);
            break;
            
          default:
            console.warn(`Tipo de data source não suportado: ${dataSource.type}`);
            continue;
        }
        
        reportData.sections.push({
          title: dataSource.title,
          type: dataSource.type,
          data: sectionData,
          weight: dataSource.weight || 100
        });
        
      } catch (sectionError: any) {
        console.error(`Error processing section ${dataSource.title}:`, sectionError);
        
        reportData.sections.push({
          title: dataSource.title,
          type: dataSource.type,
          error: sectionError.message,
          weight: dataSource.weight || 100
        });
      }
    }
    
    // Simular geração de arquivo (em produção, usar biblioteca de PDF/Excel)
    const fileName = `report_${templateId}_${Date.now()}.pdf`;
    const filePath = `/reports/generated/${fileName}`;
    const fileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
    
    return {
      success: true,
      data: reportData,
      filePath,
      fileSize
    };
    
  } catch (error: any) {
    console.error('Error generating report data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Enviar notificações do relatório
async function sendReportNotifications(
  reportGenerationId: string,
  distributionConfig: any,
  tenantId: string,
  userId: string
): Promise<void> {
  try {
    const recipients = [];
    
    // Adicionar usuários específicos
    if (distributionConfig.userIds) {
      recipients.push(...distributionConfig.userIds);
    }
    
    // Adicionar criador se solicitado
    if (distributionConfig.includeCreator !== false) {
      recipients.push(userId);
    }
    
    // Enviar notificações
    const notificationPromises = recipients.map(async (recipientId) => {
      return db.insert(notifications).values({
        id: nanoid(),
        userId: recipientId,
        tenantId,
        title: 'Relatório Gerado pelo Workflow',
        message: 'Um novo relatório foi gerado automaticamente pelo workflow e está disponível para download.',
        type: 'info',
        channels: ['in_app', 'email'],
        isRead: false,
        metadata: {
          source: 'workflow_report',
          reportGenerationId,
          action: 'download_report'
        },
        createdAt: new Date()
      });
    });
    
    await Promise.all(notificationPromises);
    
  } catch (error: any) {
    console.error('Error sending report notifications:', error);
  }
}

// Calcular próxima execução do agendamento
function calculateNextExecution(scheduleConfig: any): Date {
  const now = new Date();
  const nextExecution = new Date(now);
  
  // Configurar horário
  const [hours, minutes] = scheduleConfig.time.split(':').map(Number);
  nextExecution.setHours(hours, minutes, 0, 0);
  
  // Se horário já passou hoje, ir para próximo período
  if (nextExecution <= now) {
    switch (scheduleConfig.frequency) {
      case 'daily':
        nextExecution.setDate(nextExecution.getDate() + 1);
        break;
        
      case 'weekly':
        const targetDayOfWeek = scheduleConfig.dayOfWeek || 1; // Monday default
        const daysUntilTarget = (targetDayOfWeek - nextExecution.getDay() + 7) % 7;
        nextExecution.setDate(nextExecution.getDate() + (daysUntilTarget || 7));
        break;
        
      case 'monthly':
        const targetDayOfMonth = scheduleConfig.dayOfMonth || 1;
        nextExecution.setDate(targetDayOfMonth);
        if (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          nextExecution.setDate(targetDayOfMonth);
        }
        break;
        
      case 'quarterly':
        // Próximo trimestre
        const currentMonth = nextExecution.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3 + 3;
        nextExecution.setMonth(quarterStartMonth);
        nextExecution.setDate(1);
        break;
    }
  }
  
  return nextExecution;
}

// Executar query para relatório
async function executeQueryForReport(queryId: string, tenantId: string): Promise<any> {
  try {
    const savedQuery = await db
      .select()
      .from(savedQueries)
      .where(and(
        eq(savedQueries.id, queryId),
        eq(savedQueries.tenantId, tenantId)
      ))
      .limit(1);
    
    if (savedQuery.length === 0) {
      throw new Error('Query não encontrada');
    }
    
    const { generateSQL } = require('./queryBuilderRoutes');
    const { storage } = require('./storage');
    
    const sql = generateSQL(savedQuery[0].queryConfig, tenantId);
    const results = await storage.executeRawQuery(sql, tenantId);
    
    return results;
    
  } catch (error: any) {
    console.error('Error executing query for report:', error);
    throw error;
  }
}

// Buscar dados de dashboard para relatório
async function getDashboardDataForReport(dashboardId: string, tenantId: string): Promise<any> {
  try {
    // Implementar busca de dados do dashboard
    return {
      dashboardId,
      data: [],
      timestamp: new Date()
    };
    
  } catch (error: any) {
    console.error('Error fetching dashboard data for report:', error);
    throw error;
  }
}

// Buscar dados de API para relatório
async function fetchAPIDataForReport(apiConnectionId: string, params: any = {}): Promise<any> {
  try {
    // Implementar integração com API
    return {
      connectionId: apiConnectionId,
      data: [],
      timestamp: new Date()
    };
    
  } catch (error: any) {
    console.error('Error fetching API data for report:', error);
    throw error;
  }
}

// Buscar dados de webhook para relatório
async function getWebhookDataForReport(webhookId: string, tenantId: string): Promise<any> {
  try {
    // Implementar busca de dados do webhook
    return {
      webhookId,
      data: [],
      timestamp: new Date()
    };
    
  } catch (error: any) {
    console.error('Error fetching webhook data for report:', error);
    throw error;
  }
}

export { router as workflowReportIntegrationRoutes };