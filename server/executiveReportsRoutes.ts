/**
 * EXECUTIVE REPORTS ROUTES - API completa para relatórios executivos
 * Endpoints: Templates, geração, scheduling, distribuição, analytics
 * Funcionalidades: Relatórios personalizáveis, PDF/Excel export, automação
 */

import express from 'express';
import { eq, desc, and, or, ilike, gte, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  reports,
  reportTemplates,
  reportSchedules,
  reportExecutions,
  users
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { 
  executiveReportsService, 
  ReportTemplateSchema,
  ReportGenerationSchema,
  ReportScheduleSchema 
} from './executiveReportsService';
import { z } from 'zod';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// REPORT TEMPLATES - GESTÃO DE TEMPLATES DE RELATÓRIO
// ==========================================

// GET /api/reports/templates - Listar templates de relatório
router.get('/templates', async (req: any, res) => {
  try {
    const { 
      search, 
      category,
      isPublic,
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    console.log(`📋 Buscando templates de relatório - Tenant: ${tenantId}`);

    const filters = {
      search,
      category,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const result = await executiveReportsService.getReportTemplates(tenantId, filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar templates de relatório'
    });
  }
});

// POST /api/reports/templates - Criar template de relatório
router.post('/templates', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    console.log(`📋 Criando template de relatório - User: ${userId}, Tenant: ${tenantId}`);

    // Validar dados de entrada
    const validatedData = ReportTemplateSchema.parse(req.body);

    const result = await executiveReportsService.createReportTemplate(
      tenantId,
      userId,
      validatedData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Template de relatório criado: ${result.data.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error creating report template:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar template de relatório'
      });
    }
  }
});

// GET /api/reports/templates/:id - Obter template específico
router.get('/templates/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    const template = await db
      .select({
        template: reportTemplates,
        createdByUser: {
          name: users.name,
          email: users.email
        }
      })
      .from(reportTemplates)
      .leftJoin(users, eq(users.id, reportTemplates.createdBy))
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.tenantId, tenantId),
        eq(reportTemplates.isActive, true)
      ))
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template de relatório não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        ...template[0].template,
        createdByUser: template[0].createdByUser
      }
    });

  } catch (error) {
    console.error('Error fetching report template:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar template de relatório'
    });
  }
});

// PUT /api/reports/templates/:id - Atualizar template
router.put('/templates/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se template existe
    const existing = await db
      .select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template de relatório não encontrado'
      });
    }

    // Validar dados
    const validatedData = ReportTemplateSchema.partial().parse(req.body);

    // Atualizar template
    const updated = await db
      .update(reportTemplates)
      .set({
        ...validatedData,
        template: validatedData.template as any,
        parameters: validatedData.parameters as any,
        updatedAt: new Date(),
      })
      .where(eq(reportTemplates.id, id))
      .returning();

    console.log(`📋 Template de relatório atualizado: ${id}`);
    res.json({
      success: true,
      data: updated[0],
      message: 'Template de relatório atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating report template:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar template de relatório'
      });
    }
  }
});

// DELETE /api/reports/templates/:id - Deletar template
router.delete('/templates/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se template existe
    const existing = await db
      .select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template de relatório não encontrado'
      });
    }

    // Marcar como inativo
    await db
      .update(reportTemplates)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(reportTemplates.id, id));

    console.log(`🗑️ Template de relatório deletado: ${id}`);
    res.json({
      success: true,
      message: 'Template de relatório removido com sucesso'
    });

  } catch (error) {
    console.error('Error deleting report template:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar template de relatório'
    });
  }
});

// ==========================================
// REPORT GENERATION - GERAÇÃO DE RELATÓRIOS
// ==========================================

// POST /api/reports/generate - Gerar relatório a partir de template
router.post('/generate', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    console.log(`📊 Gerando relatório - User: ${userId}, Tenant: ${tenantId}`);

    // Validar dados de geração
    const validatedData = ReportGenerationSchema.parse(req.body);

    const result = await executiveReportsService.generateReport(
      tenantId,
      userId,
      validatedData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Relatório gerado: ${result.data.report.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error generating report:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Parâmetros de geração inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao gerar relatório'
      });
    }
  }
});

// GET /api/reports - Listar relatórios gerados
router.get('/', async (req: any, res) => {
  try {
    const { 
      search, 
      templateId,
      status,
      generatedBy,
      startDate,
      endDate,
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    console.log(`📊 Buscando relatórios gerados - Tenant: ${tenantId}`);

    const filters = {
      search,
      templateId,
      status,
      generatedBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const result = await executiveReportsService.getReports(tenantId, filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar relatórios'
    });
  }
});

// GET /api/reports/:id - Obter relatório específico
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    const report = await db
      .select({
        report: reports,
        template: {
          name: reportTemplates.name,
          category: reportTemplates.category
        },
        generatedByUser: {
          name: users.name,
          email: users.email
        }
      })
      .from(reports)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reports.templateId))
      .leftJoin(users, eq(users.id, reports.generatedBy))
      .where(and(
        eq(reports.id, id),
        eq(reports.tenantId, tenantId)
      ))
      .limit(1);

    if (report.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Relatório não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        ...report[0].report,
        template: report[0].template,
        generatedByUser: report[0].generatedByUser
      }
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar relatório'
    });
  }
});

// GET /api/reports/:id/download - Download do arquivo do relatório
router.get('/:id/download', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Buscar relatório
    const report = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.id, id),
        eq(reports.tenantId, tenantId),
        eq(reports.status, 'completed')
      ))
      .limit(1);

    if (report.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Relatório não encontrado ou não finalizado'
      });
    }

    const reportData = report[0];

    if (!reportData.filePath) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo do relatório não encontrado'
      });
    }

    // Em produção, aqui seria feito o streaming do arquivo real
    // Por enquanto, retornar informações do arquivo
    res.json({
      success: true,
      data: {
        reportId: reportData.id,
        filename: `report_${reportData.name.replace(/\s+/g, '_')}.${reportData.format}`,
        format: reportData.format,
        fileSize: reportData.fileSize,
        generatedAt: reportData.createdAt,
        downloadUrl: `/api/reports/${id}/file` // URL para download real
      },
      message: 'Arquivo do relatório disponível para download'
    });

  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao baixar relatório'
    });
  }
});

// DELETE /api/reports/:id - Deletar relatório
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se relatório existe
    const existing = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.id, id),
        eq(reports.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Relatório não encontrado'
      });
    }

    // Marcar como deletado
    await db
      .update(reports)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id));

    console.log(`🗑️ Relatório deletado: ${id}`);
    res.json({
      success: true,
      message: 'Relatório removido com sucesso'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar relatório'
    });
  }
});

// ==========================================
// REPORT SCHEDULING - AGENDAMENTO DE RELATÓRIOS
// ==========================================

// GET /api/reports/schedules - Listar agendamentos
router.get('/schedules', async (req: any, res) => {
  try {
    const { 
      search, 
      templateId,
      frequency,
      isActive,
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    let query = db
      .select({
        schedule: reportSchedules,
        template: {
          name: reportTemplates.name,
          category: reportTemplates.category
        }
      })
      .from(reportSchedules)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reportSchedules.templateId))
      .where(eq(reportSchedules.tenantId, tenantId));

    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          ilike(reportSchedules.name, `%${search}%`),
          ilike(reportTemplates.name, `%${search}%`)
        )
      );
    }

    if (templateId) {
      query = query.where(eq(reportSchedules.templateId, templateId));
    }

    if (frequency) {
      query = query.where(eq(reportSchedules.frequency, frequency));
    }

    if (isActive !== undefined) {
      query = query.where(eq(reportSchedules.isActive, isActive === 'true'));
    }

    const schedules = await query
      .orderBy(desc(reportSchedules.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: schedules.map(item => ({
        ...item.schedule,
        template: item.template
      })),
      total: schedules.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching report schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar agendamentos de relatório'
    });
  }
});

// POST /api/reports/schedules - Criar agendamento
router.post('/schedules', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    console.log(`⏰ Criando agendamento de relatório - Tenant: ${tenantId}`);

    // Validar dados de agendamento
    const validatedData = ReportScheduleSchema.parse(req.body);

    const schedule = await db
      .insert(reportSchedules)
      .values({
        tenantId,
        templateId: validatedData.templateId,
        name: validatedData.name,
        frequency: validatedData.frequency,
        schedule: validatedData.schedule as any,
        parameters: validatedData.parameters as any,
        format: validatedData.format,
        recipients: validatedData.recipients as any,
        isActive: validatedData.isActive,
        nextExecution: null, // Calculado pelo sistema de scheduling
        createdAt: new Date(),
      })
      .returning();

    console.log(`✅ Agendamento criado: ${schedule[0].id}`);
    res.status(201).json({
      success: true,
      data: schedule[0],
      message: 'Agendamento de relatório criado com sucesso'
    });

  } catch (error) {
    console.error('Error creating report schedule:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados de agendamento inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar agendamento de relatório'
      });
    }
  }
});

// PUT /api/reports/schedules/:id - Atualizar agendamento
router.put('/schedules/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se agendamento existe
    const existing = await db
      .select()
      .from(reportSchedules)
      .where(and(
        eq(reportSchedules.id, id),
        eq(reportSchedules.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    // Validar dados
    const validatedData = ReportScheduleSchema.partial().parse(req.body);

    // Atualizar agendamento
    const updated = await db
      .update(reportSchedules)
      .set({
        ...validatedData,
        schedule: validatedData.schedule as any,
        parameters: validatedData.parameters as any,
        recipients: validatedData.recipients as any,
        updatedAt: new Date(),
      })
      .where(eq(reportSchedules.id, id))
      .returning();

    console.log(`⏰ Agendamento atualizado: ${id}`);
    res.json({
      success: true,
      data: updated[0],
      message: 'Agendamento atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating report schedule:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar agendamento'
      });
    }
  }
});

// DELETE /api/reports/schedules/:id - Deletar agendamento
router.delete('/schedules/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se agendamento existe
    const existing = await db
      .select()
      .from(reportSchedules)
      .where(and(
        eq(reportSchedules.id, id),
        eq(reportSchedules.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    // Marcar como inativo
    await db
      .update(reportSchedules)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(reportSchedules.id, id));

    console.log(`🗑️ Agendamento deletado: ${id}`);
    res.json({
      success: true,
      message: 'Agendamento removido com sucesso'
    });

  } catch (error) {
    console.error('Error deleting report schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar agendamento'
    });
  }
});

// ==========================================
// ANALYTICS & STATISTICS - ANALYTICS E ESTATÍSTICAS
// ==========================================

// GET /api/reports/analytics - Estatísticas de relatórios
router.get('/analytics', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { period = '30d' } = req.query;

    // Calcular data de início baseada no período
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Estatísticas gerais
    const generalStats = await db
      .select({
        totalReports: sql<number>`count(*)`,
        completedReports: sql<number>`count(case when ${reports.status} = 'completed' then 1 end)`,
        failedReports: sql<number>`count(case when ${reports.status} = 'failed' then 1 end)`,
        avgExecutionTime: sql<number>`avg(${reports.executionTime})`,
        totalFileSize: sql<number>`sum(${reports.fileSize})`,
      })
      .from(reports)
      .where(and(
        eq(reports.tenantId, tenantId),
        gte(reports.createdAt, startDate)
      ));

    // Relatórios por categoria
    const reportsByCategory = await db
      .select({
        category: reportTemplates.category,
        count: sql<number>`count(*)`,
      })
      .from(reports)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reports.templateId))
      .where(and(
        eq(reports.tenantId, tenantId),
        gte(reports.createdAt, startDate)
      ))
      .groupBy(reportTemplates.category);

    // Templates mais utilizados
    const topTemplates = await db
      .select({
        templateId: reports.templateId,
        templateName: reportTemplates.name,
        category: reportTemplates.category,
        count: sql<number>`count(*)`,
        avgExecutionTime: sql<number>`avg(${reports.executionTime})`,
      })
      .from(reports)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reports.templateId))
      .where(and(
        eq(reports.tenantId, tenantId),
        gte(reports.createdAt, startDate),
        eq(reports.status, 'completed')
      ))
      .groupBy(reports.templateId, reportTemplates.name, reportTemplates.category)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Execuções por dia (últimos 30 dias)
    const dailyExecutions = await db
      .select({
        date: sql<string>`date(${reports.createdAt})`,
        count: sql<number>`count(*)`,
        completed: sql<number>`count(case when ${reports.status} = 'completed' then 1 end)`,
        failed: sql<number>`count(case when ${reports.status} = 'failed' then 1 end)`,
      })
      .from(reports)
      .where(and(
        eq(reports.tenantId, tenantId),
        gte(reports.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      ))
      .groupBy(sql`date(${reports.createdAt})`)
      .orderBy(sql`date(${reports.createdAt})`);

    res.json({
      success: true,
      data: {
        period,
        general: generalStats[0] || {
          totalReports: 0,
          completedReports: 0,
          failedReports: 0,
          avgExecutionTime: 0,
          totalFileSize: 0
        },
        categories: reportsByCategory,
        topTemplates,
        dailyTrend: dailyExecutions,
        metrics: {
          successRate: generalStats[0] ? 
            (generalStats[0].completedReports / generalStats[0].totalReports * 100) || 0 : 0,
          avgFileSizeMB: generalStats[0] ? 
            Math.round((generalStats[0].totalFileSize || 0) / 1024 / 1024 * 100) / 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching report analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar analytics de relatórios'
    });
  }
});

export { router as executiveReportsRoutes };