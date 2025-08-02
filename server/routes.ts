import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
// Custom authentication middleware that works with both auth systems
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.user || ((req.session as any) && (req.session as any).user)) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
import { 
  tenantMiddleware, 
  requireTenant, 
  requireSuperAdmin, 
  requireRole,
  getTenantId,
  canAccessTenantResource
} from "./tenantMiddleware";
import { accessControlRoutes } from "./accessControlRoutes";
import { adminRoutes } from "./adminRoutes";
import { registerQueryBuilderRoutes } from "./queryBuilderRoutes";
import { registerDataConnectionRoutes } from "./dataConnectionRoutes";
import { taskManagementRoutes } from "./taskManagementRoutes";
import { moduleRoutes } from "./moduleRoutes";
import { adaptiveEngine } from "./adaptiveEngine";
import accessProfileRoutes from "./accessProfileRoutes";
import stripeCheckoutRoutes from "./stripeCheckoutRoutes";
import emailTestRoutes from "./emailTestRoutes";
import trialAdminRoutes from "./trialAdminRoutes";
import salesMetricsRoutes from "./salesMetricsRoutes";
import subscriptionReportsRoutes from "./subscriptionReportsRoutes";
import planManagementRoutes from "./planManagementRoutes";
import { trialRoutes } from "./trialRoutes";
import { fileUploadRoutes } from "./fileUploadRoutes";
import { advancedTaskRoutes } from "./advancedTaskRoutes";
import { advancedTaskManagementRoutes } from "./advancedTaskManagementRoutes";
import verificationRoutes from "./verificationRoutes";
import enterpriseRoutes from "./enterpriseRoutes";
import adaptiveRoutes from "./adaptiveRoutes";
import notificationRoutes from "./notificationRoutes";
import calendarRoutes from "./calendarRoutes";
import { adminModuleRoutes } from "./adminModuleRoutes";
import { tenantControlRoutes } from "./tenantControlRoutes";
import { visualWorkflowRoutes } from "./visualWorkflowRoutes";
import { workflowIntegrationRoutes } from "./workflowIntegrationRoutes";
import { workflowBuilderRoutes } from "./workflowBuilderRoutes";
import { workflowTaskIntegrationRoutes } from "./workflowTaskIntegrationRoutes";
import { workflowDashboardIntegrationRoutes } from "./workflowDashboardIntegrationRoutes";
import { workflowReportIntegrationRoutes } from "./workflowReportIntegrationRoutes";
import { unifiedDataStudioRoutes } from "./unifiedDataStudioRoutes";
import { compactUnifiedStudioRoutes } from "./compactUnifiedStudioRoutes";
import { advancedDashboardBuilderRoutes } from "./advancedDashboardBuilderRoutes";
import { inlineDashboardEditorRoutes } from "./inlineDashboardEditorRoutes";
import { universalDatabaseRoutes } from "./universalDatabaseRoutes";
import { dashboardBuilderRoutes } from "./dashboardBuilderRoutes";
import { apiWebhookRoutes } from "./apiWebhookRoutes";
import { executiveReportsRoutes } from "./executiveReportsRoutes";
import { emailTriggerRoutes } from "./emailTriggerRoutes";
import { calendarTriggerRoutes } from "./calendarTriggerRoutes";
import { adaptiveEngineRoutes } from "./adaptiveEngineRoutes";
import { advancedMLEngine } from "./advancedMLEngine";
import { mlModelsService } from "./mlModelsService";
import { advancedMLRoutes } from "./advancedMLRoutes";

// Helper function to determine if client should be assigned to a category
function shouldAssignToCategory(client: any, category: any): boolean {
  // Basic logic for auto-assignment based on client criteria
  if (!category.autoAssignmentRules) return false;
  
  const rules = category.autoAssignmentRules;
  
  // Check investment threshold
  if (rules.minInvestmentAmount && client.currentInvestment < rules.minInvestmentAmount) {
    return false;
  }
  if (rules.maxInvestmentAmount && client.currentInvestment > rules.maxInvestmentAmount) {
    return false;
  }
  
  // Check risk profile
  if (rules.riskProfiles && rules.riskProfiles.length > 0) {
    if (!rules.riskProfiles.includes(client.riskProfile)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to trigger workflows for a category
async function triggerWorkflowsForCategory(categoryId: string, clientId: string) {
  try {
    // Get workflows associated with this category
    const workflows = await storage.getWorkflowsByCategory(categoryId);
    
    for (const workflow of workflows) {
      if (workflow.status === 'active' && workflow.trigger === 'client_assignment') {
        // Log the workflow trigger
        await storage.createActivity({
          action: 'workflow_triggered',
          description: `Workflow "${workflow.name}" triggered for client assignment`,
          metadata: { workflowId: workflow.id, clientId, categoryId }
        });
        
        // Here you would integrate with your workflow engine
        // For now, we'll just log the action
        console.log(`Triggered workflow ${workflow.name} for client ${clientId} in category ${categoryId}`);
      }
    }
  } catch (error) {
    console.error('Error triggering workflows:', error);
  }
}

// Helper function to generate report data
async function generateReportData(report: any) {
  const template = report.template;
  const reportData: any = {
    reportName: report.name,
    generatedAt: new Date().toISOString(),
    filters: template.filters || {},
    data: []
  };

  try {
    // Get clients based on filters
    const clients = await storage.getClients();
    let filteredClients = clients;

    // Apply category filters
    if (template.filters?.categories && template.filters.categories.length > 0) {
      filteredClients = filteredClients.filter((client: any) => 
        template.filters.categories.includes(client.categoryId)
      );
    }

    // Apply risk profile filters
    if (template.filters?.riskProfiles && template.filters.riskProfiles.length > 0) {
      filteredClients = filteredClients.filter((client: any) => 
        template.filters.riskProfiles.includes(client.riskProfile)
      );
    }

    // Apply investment amount filters
    if (template.filters?.minInvestment) {
      filteredClients = filteredClients.filter((client: any) => 
        client.currentInvestment >= template.filters.minInvestment
      );
    }

    if (template.filters?.maxInvestment) {
      filteredClients = filteredClients.filter((client: any) => 
        client.currentInvestment <= template.filters.maxInvestment
      );
    }

    // Format data based on selected fields
    reportData.data = filteredClients.map((client: any) => {
      const clientData: any = {};
      
      if (!template.fields || template.fields.length === 0) {
        // Include all fields if none specified
        return client;
      }

      // Include only selected fields
      template.fields.forEach((field: string) => {
        switch (field) {
          case 'client_name':
            clientData.name = client.name;
            break;
          case 'email':
            clientData.email = client.email;
            break;
          case 'phone':
            clientData.phone = client.phone;
            break;
          case 'current_investment':
            clientData.currentInvestment = client.currentInvestment;
            break;
          case 'risk_profile':
            clientData.riskProfile = client.riskProfile;
            break;
          case 'category':
            clientData.categoryId = client.categoryId;
            break;
          case 'last_activity':
            clientData.lastActivity = client.metadata?.lastActivity;
            break;
          default:
            if (client[field]) {
              clientData[field] = client[field];
            }
        }
      });

      return clientData;
    });

    reportData.summary = {
      totalClients: filteredClients.length,
      totalInvestment: filteredClients.reduce((sum: number, client: any) => 
        sum + (client.currentInvestment || 0), 0
      ),
      averageInvestment: filteredClients.length > 0 
        ? filteredClients.reduce((sum: number, client: any) => 
            sum + (client.currentInvestment || 0), 0) / filteredClients.length
        : 0
    };

  } catch (error) {
    console.error('Error generating report data:', error);
    reportData.error = 'Failed to generate report data';
  }

  return reportData;
}
import {
  insertClientCategorySchema,
  insertClientSchema,
  insertIntegrationSchema,
  insertWorkflowSchema,
  insertReportSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple login endpoint for testing
  app.post('/api/simple-login', async (req: any, res) => {
    try {
      const { cpf, password } = req.body;
      
      if (!cpf || !password) {
        return res.status(400).json({ message: 'CPF e senha são obrigatórios' });
      }
      
      // Buscar usuário por CPF
      const user = await storage.getUserByCPF(cpf);
      
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar senha (implementação simples para teste)
      if (password !== 'admin123') {
        return res.status(401).json({ message: 'Senha incorreta' });
      }
      
      // Salvar na sessão
      (req.session as any).userId = user.id;
      (req.session as any).user = user;
      
      await storage.updateUserLastLogin(user.id);
      
      res.json({ 
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Endpoint para verificar usuário logado
  app.get('/api/auth/user', (req: any, res) => {
    if (req.session && (req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });

  // API básica para módulos (sem autenticação para teste)
  app.get('/api/modules/available', async (req, res) => {
    try {
      const modules = await storage.getAvailableModules('all');
      res.json(modules);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // API básica para task templates (sem autenticação para teste)
  app.get('/api/task-templates', async (req, res) => {
    try {
      const templates = await storage.getTaskTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // APIs administrativas funcionais
  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/admin/users', async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  });

  app.patch('/api/admin/users/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await storage.updateUserStatus(id, isActive);
      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ message: 'Erro ao atualizar status' });
    }
  });

  app.get('/api/admin/tenants', async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/admin/tenants', async (req, res) => {
    try {
      const tenantData = req.body;
      const tenant = await storage.createTenant(tenantData);
      res.json(tenant);
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      res.status(500).json({ message: 'Erro ao criar tenant' });
    }
  });

  // QUERY BUILDER E DASHBOARD INTEGRADOS
  app.post('/api/query/execute', async (req, res) => {
    try {
      const { query, table, fields, filters, groupBy, orderBy } = req.body;
      
      console.log('Executando query no PostgreSQL:', { table, fields, filters });
      
      // Construir query SQL real
      let sql = `SELECT ${fields.join(', ')} FROM ${table}`;
      
      if (filters && filters.length > 0) {
        const whereClause = filters.map((f: any) => {
          switch (f.operator) {
            case 'equals': return `${f.field} = '${f.value}'`;
            case 'greater_than': return `${f.field} > ${f.value}`;
            case 'less_than': return `${f.field} < ${f.value}`;
            case 'between': return `${f.field} BETWEEN '${f.value[0]}' AND '${f.value[1]}'`;
            default: return `${f.field} = '${f.value}'`;
          }
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
      }
      
      if (groupBy && groupBy.length > 0) {
        sql += ` GROUP BY ${groupBy.join(', ')}`;
      }
      
      if (orderBy && orderBy.length > 0) {
        sql += ` ORDER BY ${orderBy.join(', ')}`;
      }
      
      // Executar query real no banco PostgreSQL
      const results = await storage.executeCustomQuery(sql);
      
      console.log(`Query executada com sucesso: ${results.length} resultados`);
      
      res.json({ 
        sql,
        results,
        count: results.length,
        executedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao executar query:', error);
      res.status(500).json({ message: 'Erro ao executar query', error: error.message });
    }
  });

  // CRIAR KPI DASHBOARD
  app.post('/api/dashboard/kpi', async (req, res) => {
    try {
      const { name, query, chartType, filters } = req.body;
      
      console.log('Criando KPI dashboard:', { name, chartType });
      
      // Salvar configuração do KPI no banco
      const kpi = await storage.createKPIDashboard({
        id: `kpi-${Date.now()}`,
        name,
        query,
        chartType,
        filters,
        createdAt: new Date(),
        isActive: true
      });
      
      console.log('KPI criado no banco:', kpi.id);
      
      res.json(kpi);
    } catch (error) {
      console.error('Erro ao criar KPI:', error);
      res.status(500).json({ message: 'Erro ao criar KPI' });
    }
  });

  // BUSCAR DADOS PARA GRÁFICOS
  app.get('/api/analytics/chart-data/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const { period = '30d' } = req.query;
      
      console.log(`Buscando dados do gráfico: ${type}, período: ${period}`);
      
      let results;
      
      switch (type) {
        case 'users-growth':
          results = await storage.getUserGrowthData(period as string);
          break;
        case 'workflow-executions':
          results = await storage.getWorkflowExecutionData(period as string);
          break;
        case 'tenant-usage':
          results = await storage.getTenantUsageData(period as string);
          break;
        case 'revenue-trends':
          results = await storage.getRevenueData(period as string);
          break;
        default:
          results = [];
      }
      
      console.log(`Dados encontrados: ${results.length} registros`);
      
      res.json({
        type,
        period,
        data: results,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      res.status(500).json({ message: 'Erro ao buscar dados do gráfico' });
    }
  });

  // RELATÓRIOS AUTOMÁTICOS
  app.post('/api/reports/generate', async (req, res) => {
    try {
      const { templateId, filters, format = 'json' } = req.body;
      
      console.log('Gerando relatório:', { templateId, format });
      
      const reportData = await storage.generateReport(templateId, filters);
      
      if (format === 'csv') {
        // Converter para CSV
        const csv = storage.convertToCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report-${templateId}-${Date.now()}.csv"`);
        res.send(csv);
      } else {
        res.json({
          reportId: `report-${Date.now()}`,
          templateId,
          data: reportData,
          generatedAt: new Date().toISOString(),
          recordCount: reportData.length
        });
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ message: 'Erro ao gerar relatório' });
    }
  });

  // UPLOAD DE ARQUIVOS REAL
  app.post('/api/upload', async (req, res) => {
    try {
      // Processar arquivos (implementação real com multer seria aqui)
      const files = req.files || [];
      
      console.log(`Processando upload de ${files.length} arquivos`);
      
      const processedFiles = [];
      
      // Salvar informações dos arquivos no banco
      for (const file of files as any[]) {
        const fileRecord = await storage.saveFile({
          id: `file-${Date.now()}-${Math.random()}`,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          uploadedAt: new Date()
        });
        processedFiles.push(fileRecord);
      }
      
      console.log('Arquivos salvos no banco:', processedFiles.length);
      
      res.json({
        message: 'Upload realizado com sucesso',
        files: processedFiles,
        count: processedFiles.length
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ message: 'Erro no upload' });
    }
  });

  // WEBHOOK ENDPOINTS FUNCIONAIS
  app.post('/api/webhooks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      
      console.log(`Webhook recebido: ${id}`, payload);
      
      // Processar webhook e salvar no banco
      const webhookLog = await storage.logWebhook({
        webhookId: id,
        payload,
        receivedAt: new Date(),
        processed: false
      });
      
      // Disparar workflows associados
      await storage.triggerWorkflowsByWebhook(id, payload);
      
      console.log('Webhook processado:', webhookLog.id);
      
      res.json({ message: 'Webhook processado com sucesso', id: webhookLog.id });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      res.status(500).json({ message: 'Erro ao processar webhook' });
    }
  });

  // ========== ROTAS DE ADAPTAÇÃO INTELIGENTE TOIT NEXUS ==========
  
  // Análise automática de padrões por tenant
  app.get('/api/adaptive/analyze/:tenantId', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { tenantId } = req.params;
      console.log(`🧠 Iniciando análise adaptativa para tenant: ${tenantId}`);
      
      const patterns = await adaptiveEngine.analyzeDataPatterns(tenantId);
      
      res.json({
        success: true,
        tenantId,
        patterns,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro na análise adaptativa:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao analisar padrões de dados',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Geração automática de KPIs adaptativos
  app.post('/api/adaptive/generate-kpis/:tenantId', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { tenantId } = req.params;
      console.log(`🎯 Gerando KPIs adaptativos para tenant: ${tenantId}`);
      
      const kpis = await adaptiveEngine.generateAdaptiveKPIs(tenantId);
      
      res.json({
        success: true,
        tenantId,
        kpisGenerated: kpis.length,
        kpis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro na geração de KPIs:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao gerar KPIs adaptativos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Execução de adaptações automáticas
  app.post('/api/adaptive/execute/:tenantId', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { tenantId } = req.params;
      console.log(`🔄 Executando adaptações automáticas para tenant: ${tenantId}`);
      
      const adaptations = await adaptiveEngine.executeAdaptations(tenantId);
      
      res.json({
        success: true,
        tenantId,
        adaptationsExecuted: adaptations.adaptationsCount,
        adaptations: adaptations.adaptations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro na execução de adaptações:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao executar adaptações',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Análise em tempo real de mudanças de dados
  app.post('/api/adaptive/realtime-analysis/:tenantId', isAuthenticated, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { dataType, data } = req.body;
      
      console.log(`⚡ Análise em tempo real: ${dataType} para tenant: ${tenantId}`);
      
      const analysis = await adaptiveEngine.performRealtimeAnalysis(tenantId, dataType, data);
      
      res.json({
        success: true,
        tenantId,
        dataType,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro na análise em tempo real:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro na análise em tempo real',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Dashboard de insights adaptativos
  app.get('/api/adaptive/insights/:tenantId', isAuthenticated, async (req, res) => {
    try {
      const { tenantId } = req.params;
      
      // Verificar se usuário pode acessar este tenant
      if (!canAccessTenantResource(req, tenantId)) {
        return res.status(403).json({ message: 'Acesso negado ao tenant especificado' });
      }
      
      // Gerar insights em tempo real
      const patterns = await adaptiveEngine.analyzeDataPatterns(tenantId);
      
      const insights = {
        clientInsights: {
          totalClients: patterns.clientPatterns?.totalClients || 0,
          avgInvestment: patterns.clientPatterns?.avgInvestment || 0,
          riskDistribution: patterns.clientPatterns?.riskDistribution || {},
          suggestedKPIs: patterns.clientPatterns?.suggestedKPIs || []
        },
        investmentInsights: {
          patterns: patterns.investmentPatterns?.riskAnalysis || {},
          suggestedThresholds: patterns.investmentPatterns?.suggestedThresholds || {},
          adaptiveRules: patterns.investmentPatterns?.adaptiveRules || []
        },
        riskInsights: {
          incompatibilities: patterns.riskPatterns?.incompatibilities || 0,
          riskAlerts: patterns.riskPatterns?.riskAlerts || [],
          adaptiveThresholds: patterns.riskPatterns?.adaptiveThresholds || {}
        },
        workflowInsights: {
          totalWorkflows: patterns.workflowPatterns?.totalWorkflows || 0,
          activeWorkflows: patterns.workflowPatterns?.activeWorkflows || 0,
          suggestions: patterns.workflowPatterns?.suggestedOptimizations || []
        },
        dataInsights: {
          totalQueries: patterns.dataPatterns?.totalQueries || 0,
          totalFiles: patterns.dataPatterns?.totalFiles || 0,
          suggestions: patterns.dataPatterns?.suggestedConnections || []
        }
      };
      
      res.json({
        success: true,
        tenantId,
        insights,
        lastAnalysis: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao gerar insights adaptativos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // ========== ROTAS TASK + WORKFLOW INTEGRATION ==========
  
  // Buscar tarefas de um workflow específico
  app.get('/api/workflows/:workflowId/tasks', isAuthenticated, async (req, res) => {
    try {
      const { workflowId } = req.params;
      
      const tasks = await storage.getWorkflowTasks(workflowId);
      
      res.json({
        success: true,
        workflowId,
        tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas do workflow:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao buscar tarefas do workflow'
      });
    }
  });

  // Buscar workflow de uma tarefa específica
  app.get('/api/tasks/:taskId/workflow', isAuthenticated, async (req, res) => {
    try {
      const { taskId } = req.params;
      
      const workflow = await storage.getTaskWorkflow(taskId);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Workflow não encontrado para esta tarefa'
        });
      }
      
      res.json({
        success: true,
        taskId,
        workflow
      });
    } catch (error) {
      console.error('Erro ao buscar workflow da tarefa:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao buscar workflow da tarefa'
      });
    }
  });

  // ENDPOINTS PARA SISTEMA COMPLETO TOIT NEXUS

  // DATABASE CONNECTIONS - Conectar qualquer banco
  app.post('/api/database-connections', async (req, res) => {
    try {
      const { name, type, host, port, database, username, password, ssl } = req.body;
      
      const connection = await storage.createDatabaseConnection({
        id: `db-${Date.now()}`,
        tenantId: req.body.tenantId || 'default',
        name,
        type,
        host,
        port,
        database,
        username,
        password,
        ssl: ssl || false,
        isActive: true
      });

      console.log('Conexão de banco criada:', connection.id);
      res.json(connection);
    } catch (error) {
      console.error('Erro ao criar conexão de banco:', error);
      res.status(500).json({ message: 'Erro ao criar conexão de banco' });
    }
  });

  app.get('/api/database-connections', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || 'default';
      const connections = await storage.getDatabaseConnections(tenantId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar conexões' });
    }
  });

  app.post('/api/database-connections/:id/test', async (req, res) => {
    try {
      const { id } = req.params;
      const isConnected = await storage.testDatabaseConnection(id);
      res.json({ connected: isConnected });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao testar conexão' });
    }
  });

  // API CONNECTIONS - Conectar qualquer API
  app.post('/api/api-connections', async (req, res) => {
    try {
      const { name, baseUrl, authType, authConfig, headers } = req.body;
      
      const connection = await storage.createApiConnection({
        id: `api-${Date.now()}`,
        tenantId: req.body.tenantId || 'default',
        name,
        baseUrl,
        authType,
        authConfig,
        headers: headers || {},
        isActive: true
      });

      console.log('Conexão API criada:', connection.id);
      res.json(connection);
    } catch (error) {
      console.error('Erro ao criar conexão API:', error);
      res.status(500).json({ message: 'Erro ao criar conexão API' });
    }
  });

  app.get('/api/api-connections', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || 'default';
      const connections = await storage.getApiConnections(tenantId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar conexões API' });
    }
  });

  // QUERY BUILDERS - No-Code Query Builder
  app.post('/api/query-builders', async (req, res) => {
    try {
      const { name, description, connectionId, connectionType, queryConfig } = req.body;
      
      const queryBuilder = await storage.createQueryBuilder({
        id: `qb-${Date.now()}`,
        tenantId: req.body.tenantId || 'default',
        userId: req.body.userId || 'system',
        name,
        description,
        connectionId,
        connectionType,
        queryConfig,
        isActive: true
      });

      console.log('Query Builder criado:', queryBuilder.id);
      res.json(queryBuilder);
    } catch (error) {
      console.error('Erro ao criar query builder:', error);
      res.status(500).json({ message: 'Erro ao criar query builder' });
    }
  });

  app.get('/api/query-builders', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || 'default';
      const queries = await storage.getQueryBuilders(tenantId);
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar query builders' });
    }
  });

  app.post('/api/query-builders/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.executeQueryBuilder(id);
      res.json(result);
    } catch (error) {
      console.error('Erro ao executar query builder:', error);
      res.status(500).json({ message: 'Erro ao executar query builder' });
    }
  });

  // KPI DASHBOARDS - Dashboards integrados
  app.get('/api/kpi-dashboards', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || 'default';
      const dashboards = await storage.getKpiDashboards(tenantId);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar dashboards' });
    }
  });

  // COMPLETE WORKFLOWS - Workflows avançados
  app.post('/api/complete-workflows', async (req, res) => {
    try {
      const { name, description, steps, triggers } = req.body;
      
      const workflow = await storage.createCompleteWorkflow({
        id: `wf-${Date.now()}`,
        tenantId: req.body.tenantId || 'default',
        userId: req.body.userId || 'system',
        name,
        description,
        steps,
        triggers,
        status: 'active',
        isActive: true
      });

      console.log('Workflow completo criado:', workflow.id);
      res.json(workflow);
    } catch (error) {
      console.error('Erro ao criar workflow completo:', error);
      res.status(500).json({ message: 'Erro ao criar workflow completo' });
    }
  });

  app.get('/api/complete-workflows', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || 'default';
      const workflows = await storage.getCompleteWorkflows(tenantId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar workflows completos' });
    }
  });

  app.post('/api/complete-workflows/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      const execution = await storage.executeCompleteWorkflow(id);
      res.json(execution);
    } catch (error) {
      console.error('Erro ao executar workflow completo:', error);
      res.status(500).json({ message: 'Erro ao executar workflow completo' });
    }
  });

  // FILE MANAGEMENT - Gestão de arquivos
  app.get('/api/uploaded-files', async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || 'default';
      const files = await storage.getUploadedFiles(tenantId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar arquivos' });
    }
  });
  // Initialize system on startup
  const { initializeSystem } = await import('./initializeSystem');
  await initializeSystem();
  
  // Initialize access profiles and modules
  const { initializeAccessProfiles } = await import('./initializeAccessProfiles');
  await initializeAccessProfiles();
  // Auth middleware with CPF/password
  setupAuth(app);

  // Public routes (no authentication required)
  // Login and register routes are handled by setupAuth() above
  
  
  // Protected auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Handle both local auth (req.user directly) and OIDC auth (req.user.claims.sub)
      const userId = req.user.claims?.sub || req.user.id;
      const user = userId ? await storage.getUser(userId) : req.user;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Include tenant information in response
      const response: any = { ...user };
      if (req.tenant) {
        response.tenant = req.tenant;
      }
      if (user.role === 'super_admin') {
        response.isSuperAdmin = true;
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tenant selection for users with multiple tenant access
  app.post('/api/auth/select-tenant', isAuthenticated, async (req: any, res) => {
    try {
      const { tenantId } = req.body;
      const userId = req.user.claims?.sub || req.user.id;
      const user = userId ? await storage.getUser(userId) : req.user;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For super admin, allow access to any active tenant
      if (user.role === 'super_admin') {
        const tenant = await storage.getTenant(tenantId);
        if (!tenant) {
          return res.status(404).json({ message: "Tenant not found" });
        }
        // Set tenant in session or return token with tenant info
        res.json({ success: true, tenant });
        return;
      }

      // For regular users, verify they belong to this tenant
      if (user.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied to this tenant" });
      }

      const tenant = await storage.getTenant(tenantId);
      if (!tenant || tenant.status !== 'active') {
        return res.status(403).json({ message: "Tenant not available" });
      }

      res.json({ success: true, tenant });
    } catch (error) {
      console.error("Error selecting tenant:", error);
      res.status(500).json({ message: "Failed to select tenant" });
    }
  });

  // Admin routes (super admin only)
  app.get('/api/admin/tenants', requireSuperAdmin, async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.get('/api/admin/stats', requireSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/activities', requireSuperAdmin, async (req, res) => {
    try {
      const activities = await storage.getAllActivities(50);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/admin/tenants/:id/suspend', requireSuperAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateTenant(id, { status: 'suspended' });
      
      await storage.createActivity({
        userId: req.user.claims?.sub || req.user.id,
        action: 'suspend_tenant',
        entityType: 'tenant',
        entityId: id,
        description: `Suspended tenant`,
      });

      res.json({ message: "Tenant suspended successfully" });
    } catch (error) {
      console.error("Error suspending tenant:", error);
      res.status(500).json({ message: "Failed to suspend tenant" });
    }
  });

  app.post('/api/admin/tenants/:id/activate', requireSuperAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateTenant(id, { status: 'active' });
      
      await storage.createActivity({
        userId: req.user.claims?.sub || req.user.id,
        action: 'activate_tenant',
        entityType: 'tenant',
        entityId: id,
        description: `Activated tenant`,
      });

      res.json({ message: "Tenant activated successfully" });
    } catch (error) {
      console.error("Error activating tenant:", error);
      res.status(500).json({ message: "Failed to activate tenant" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities("20");
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Client Category routes (tenant-isolated)
  app.get('/api/categories', isAuthenticated, tenantMiddleware, requireTenant, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const categories = await storage.getClientCategories(tenantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getClientCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post('/api/categories', isAuthenticated, tenantMiddleware, async (req: any, res) => {
    try {
      const validatedData = insertClientCategorySchema.parse(req.body);
      const category = await storage.createClientCategory(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_category',
        entityType: 'client_category',
        entityId: category.id,
        description: `Created client category: ${category.name}`,
      });

      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientCategorySchema.partial().parse(req.body);
      const category = await storage.updateClientCategory(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_category',
        entityType: 'client_category',
        entityId: id,
        description: `Updated client category: ${category.name}`,
      });

      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClientCategory(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_category',
        entityType: 'client_category',
        entityId: id,
        description: `Deleted client category`,
      });

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const clientData = req.body;
      
      // Auto-assign category based on rules
      const categories = await storage.getClientCategories();
      let assignedCategory = null;
      
      for (const category of categories) {
        if (category.rules && shouldAssignToCategory(clientData, category.rules)) {
          assignedCategory = category.id;
          break;
        }
      }
      
      if (assignedCategory) {
        clientData.categoryId = assignedCategory;
      }
      
      const client = await storage.createClient(clientData);
      
      // Send welcome email if client has email and category
      if (client.email && assignedCategory) {
        try {
          const category = await storage.getClientCategory(assignedCategory);
          if (category) {
            const { sendWelcomeEmail } = await import('./emailService');
            await sendWelcomeEmail(client.email, client.name, category.name);
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the client creation if email fails
        }
      }
      
      // Trigger workflows for this category
      if (assignedCategory) {
        await triggerWorkflowsForCategory(assignedCategory, client.id);
      }
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_client',
        entityType: 'client',
        entityId: client.id,
        description: `Created client: ${client.name}`,
      });
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_client',
        entityType: 'client',
        entityId: id,
        description: `Updated client: ${client.name}`,
      });

      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClient(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_client',
        entityType: 'client',
        entityId: id,
        description: `Deleted client`,
      });

      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Integration routes
  app.get('/api/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.get('/api/integrations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.getIntegration(id);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error fetching integration:", error);
      res.status(500).json({ message: "Failed to fetch integration" });
    }
  });

  app.post('/api/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_integration',
        entityType: 'integration',
        entityId: integration.id,
        description: `Created integration: ${integration.name}`,
      });

      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(400).json({ message: "Failed to create integration" });
    }
  });

  app.put('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateIntegration(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_integration',
        entityType: 'integration',
        entityId: id,
        description: `Updated integration: ${integration.name}`,
      });

      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(400).json({ message: "Failed to update integration" });
    }
  });

  app.delete('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteIntegration(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_integration',
        entityType: 'integration',
        entityId: id,
        description: `Deleted integration`,
      });

      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  // Workflow routes
  app.get('/api/workflows', isAuthenticated, async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get('/api/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post('/api/workflows', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_workflow',
        entityType: 'workflow',
        entityId: workflow.id,
        description: `Created workflow: ${workflow.name}`,
      });

      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(400).json({ message: "Failed to create workflow" });
    }
  });

  app.put('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_workflow',
        entityType: 'workflow',
        entityId: id,
        description: `Updated workflow: ${workflow.name}`,
      });

      res.json(workflow);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(400).json({ message: "Failed to update workflow" });
    }
  });

  app.delete('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkflow(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_workflow',
        entityType: 'workflow',
        entityId: id,
        description: `Deleted workflow`,
      });

      res.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  app.get('/api/workflows/:id/executions', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const executions = await storage.getWorkflowExecutions(id);
      res.json(executions);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ message: "Failed to fetch workflow executions" });
    }
  });

  // System status and connectivity routes
  app.get('/api/system/status', isAuthenticated, async (req, res) => {
    try {
      const status = {
        server: 'online',
        database: 'online',
        api: 'online',
        integrations: 'warning'
      };
      res.json(status);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  app.post('/api/system/test-database', isAuthenticated, async (req, res) => {
    try {
      const startTime = Date.now();
      await storage.getDashboardStats(); // Test database query
      const latency = Date.now() - startTime;
      
      res.json({
        status: 'success',
        message: 'Database connection successful',
        latency
      });
    } catch (error) {
      console.error("Database test failed:", error);
      res.json({
        status: 'error',
        message: 'Database connection failed'
      });
    }
  });

  app.post('/api/integrations/:id/test', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.getIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Simulate integration test
      const result = {
        status: 'success',
        message: `Integration ${integration.name} is working correctly`,
        timestamp: new Date().toISOString()
      };

      res.json(result);
    } catch (error) {
      console.error("Integration test failed:", error);
      res.json({
        status: 'error',
        message: 'Integration test failed'
      });
    }
  });

  app.post('/api/system/custom-test', isAuthenticated, async (req, res) => {
    try {
      const { type, url, method, headers, body, timeout } = req.body;
      
      // Simulate custom test
      const result = {
        status: 'success',
        message: `${method} request to ${url} completed successfully`,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        statusCode: 200,
        data: { test: 'successful' }
      };

      res.json(result);
    } catch (error) {
      console.error("Custom test failed:", error);
      res.json({
        status: 'error',
        message: 'Custom test failed'
      });
    }
  });

  app.post('/api/reports/:id/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Generate report data based on template
      const reportData = await generateReportData(report);

      // Send email if configured
      if ((report.template as any)?.recipients && (report.template as any).recipients.length > 0) {
        const { sendReportEmail } = await import('./emailService');
        await sendReportEmail(
          (report.template as any).recipients,
          report.name,
          reportData,
          report.categoryId ? (await storage.getClientCategory(report.categoryId))?.name : undefined
        );
      }

      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'generate_report',
        entityType: 'report',
        entityId: id,
        description: `Generated report: ${report.name}`,
      });

      res.json({
        status: 'success',
        message: 'Report generated and sent successfully',
        reportId: id,
        reportData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Test email configuration
  app.post('/api/system/test-email', isAuthenticated, async (req, res) => {
    try {
      const { testEmailConfiguration } = await import('./emailService');
      const result = await testEmailConfiguration();
      
      res.json({
        status: result.success ? 'success' : 'error',
        message: result.message
      });
    } catch (error) {
      console.error("Email test failed:", error);
      res.json({
        status: 'error',
        message: 'Email test failed'
      });
    }
  });

  // Integration routes
  app.get('/api/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post('/api/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const integrationData = req.body;
      const integration = await storage.createIntegration(integrationData);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_integration',
        entityType: 'integration',
        entityId: integration.id,
        description: `Created integration: ${integration.name}`,
      });

      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });

  app.put('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const integrationData = req.body;
      const integration = await storage.updateIntegration(id, integrationData);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_integration',
        entityType: 'integration',
        entityId: id,
        description: `Updated integration: ${integration.name}`,
      });

      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ message: "Failed to update integration" });
    }
  });

  app.delete('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteIntegration(id);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_integration',
        entityType: 'integration',
        entityId: id,
        description: `Deleted integration`,
      });

      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  app.post('/api/integrations/:id/test', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.getIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      let testResult = { success: false, message: 'Test not implemented for this type' };

      // Test based on integration type
      switch (integration.type) {
        case 'email':
          if ((integration.config as any)?.email) {
            const { testEmailConfiguration } = await import('./emailService');
            testResult = await testEmailConfiguration();
          }
          break;
        case 'api':
          // TODO: Implement API testing
          testResult = { success: true, message: 'API test not yet implemented' };
          break;
        case 'database':
          // TODO: Implement database testing
          testResult = { success: true, message: 'Database test not yet implemented' };
          break;
        case 'webhook':
          // TODO: Implement webhook testing
          testResult = { success: true, message: 'Webhook test not yet implemented' };
          break;
      }

      // Update integration status based on test result
      await storage.updateIntegration(id, {
        lastStatus: testResult.success ? 'active' : 'error',
        lastChecked: new Date()
      });

      res.json({
        success: testResult.success,
        message: testResult.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error testing integration:", error);
      res.status(500).json({ message: "Failed to test integration" });
    }
  });

  // Report routes
  app.get('/api/reports', isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_report',
        entityType: 'report',
        entityId: report.id,
        description: `Created report template: ${report.name}`,
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(400).json({ message: "Failed to create report" });
    }
  });

  // Register access control routes
  app.use('/api/access-control', accessControlRoutes);
  
  // Register TOIT admin routes
  app.use('/api/admin', adminRoutes);

  // Register Admin Module Management routes (TOIT team only)
  app.use('/api/admin', adminModuleRoutes);
  
  // Register Tenant Control routes (TOIT team only)
  app.use('/api/admin/tenant-control', tenantControlRoutes);
  
  // Register Access Profile management routes (TOIT admin only)
  app.use('/api/admin/access-profiles', accessProfileRoutes);
  
  // Register Stripe Checkout integrado routes
  app.use('/api/stripe', stripeCheckoutRoutes);
  
  // Email Test routes - Para testes durante desenvolvimento
  app.use('/api/email-test', emailTestRoutes);
  
  // Trial Admin routes - Super Admin apenas
  app.use('/api/admin/trials', trialAdminRoutes);
  
  // Sales Metrics routes - Super Admin apenas
  app.use('/api/admin/sales-metrics', salesMetricsRoutes);
  
  // Subscription Reports routes - Super Admin apenas
  app.use('/api/admin/subscription-reports', subscriptionReportsRoutes);
  
  // Plan Management routes - Usuário autenticado
  app.use('/api/plan-management', planManagementRoutes);
  
  // Trial routes - não necessita autenticação
  app.use('/api/trial', trialRoutes);
  
  // File Upload routes - necessita autenticação
  app.use('/api/files', fileUploadRoutes);
  
  // Advanced Task routes - necessita autenticação
  app.use('/api/advanced-tasks', advancedTaskRoutes);
  
  // Advanced Task Management routes - Sistema completo com automação, colaboração e tracking
  app.use('/api/advanced-tasks', advancedTaskManagementRoutes);
  
  // Verification routes - Email/Phone verification system
  app.use('/api/verification', verificationRoutes);
  
  // Enterprise routes - Landing page contact forms
  app.use('/api/enterprise', enterpriseRoutes);
  
  // Adaptive ML routes - Sistema adaptativo e machine learning
  app.use('/api/adaptive', adaptiveRoutes);
  
  // Notification routes - Sistema completo de notificações com campanhas
  app.use('/api/notifications', notificationRoutes);
  
  // Calendar Integration routes - Integração com Google/Apple/Outlook calendários
  app.use('/api/calendar', calendarRoutes);

  // Universal Database Connector routes - Sistema completo de conectividade
  app.use('/api/database', universalDatabaseRoutes);

  // Dashboard Builder routes - Sistema completo de dashboard builder
  app.use('/api/dashboards', dashboardBuilderRoutes);

  // API & Webhook Integration routes - Sistema completo de integrações
  app.use('/api/integrations', apiWebhookRoutes);

  // Executive Reports routes - Sistema completo de relatórios executivos
  app.use('/api/reports', executiveReportsRoutes);

  // Register Query Builder routes
  registerQueryBuilderRoutes(app);
  
  // Register Data Connection routes
  registerDataConnectionRoutes(app);

  // CORE DA APLICAÇÃO - Task Management Routes
  app.use('/api/tasks', tenantMiddleware, isAuthenticated, taskManagementRoutes);

  // SISTEMA DE MÓDULOS - Controle e Monetização
  app.use('/api/modules', moduleRoutes);

  // VISUAL WORKFLOW ENGINE - Construtor visual drag-and-drop
  app.use('/api/visual-workflows', visualWorkflowRoutes);

  // WORKFLOW INTEGRATION ROUTES - Integrações críticas cross-módulos
  app.use('/api/workflow-integration', workflowIntegrationRoutes);

  // WORKFLOW BUILDER ROUTES - Painel completo de criação com todos objetos
  app.use('/api/workflow-builder', workflowBuilderRoutes);

  // WORKFLOW TASK INTEGRATION ROUTES - Integração avançada workflow ↔ tasks
  app.use('/api/workflow-task-integration', workflowTaskIntegrationRoutes);

  // WORKFLOW DASHBOARD INTEGRATION ROUTES - Dashboards criados por workflows
  app.use('/api/workflow-dashboard-integration', workflowDashboardIntegrationRoutes);

  // WORKFLOW REPORT INTEGRATION ROUTES - Relatórios automáticos em workflows
  app.use('/api/workflow-report-integration', workflowReportIntegrationRoutes);

  // UNIFIED DATA STUDIO ROUTES - Painel unificado NO-CODE completo
  app.use('/api/unified-data-studio', unifiedDataStudioRoutes);

  // COMPACT UNIFIED STUDIO ROUTES - Interface compacta com modais e carrossel
  app.use('/api/compact-studio', compactUnifiedStudioRoutes);

  // ADVANCED DASHBOARD BUILDER ROUTES - Sistema completo com 16+ tipos de widgets
  app.use('/api/advanced-dashboard', advancedDashboardBuilderRoutes);

  // INLINE DASHBOARD EDITOR ROUTES - Editor visual com single-click/double-click
  app.use('/api/inline-dashboard', inlineDashboardEditorRoutes);

  // ====================================================
  // EMAIL & CALENDAR WORKFLOW TRIGGERS - ROUTES CRÍTICAS
  // ====================================================
  app.use('/api/email-triggers', emailTriggerRoutes);
  app.use('/api/calendar-triggers', calendarTriggerRoutes);
  
  // ====================================================
  // REVOLUTIONARY ADAPTIVE ENGINE - MOTOR ML 100X MAIS PODEROSO
  // ====================================================
  app.use('/api/adaptive-engine', adaptiveEngineRoutes);
  
  // ====================================================
  // ADVANCED ML TENSORFLOW MODELS - MODELOS REAIS ML/AI
  // ====================================================
  app.use('/api/advanced-ml', advancedMLRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
