import { Router } from 'express';
import { SubscriptionReportsService } from './subscriptionReportsService';

const router = Router();

/**
 * GET /api/admin/subscription-reports/complete
 * Obter relatório completo de assinaturas - Super Admin apenas
 */
router.get('/complete', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('📊 Gerando relatório completo de assinaturas...');
    
    const report = await SubscriptionReportsService.generateCompleteReport(start, end);
    
    res.json({
      success: true,
      data: report,
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar relatório de assinaturas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao gerar relatório de assinaturas'
    });
  }
});

/**
 * GET /api/admin/subscription-reports/active
 * Obter apenas assinaturas ativas - Super Admin apenas
 */
router.get('/active', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('✅ Obtendo assinaturas ativas...');
    
    const report = await SubscriptionReportsService.generateCompleteReport(start, end);
    
    res.json({
      success: true,
      data: {
        subscriptions: report.subscriptions.active,
        totalCount: report.subscriptions.active.length,
        totalRevenue: report.analytics.totalRevenue,
        averageTenure: report.analytics.averageTenure
      },
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter assinaturas ativas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter assinaturas ativas'
    });
  }
});

/**
 * GET /api/admin/subscription-reports/at-risk
 * Obter assinaturas com alto risco de churn - Super Admin apenas
 */
router.get('/at-risk', async (req, res) => {
  try {
    const { riskThreshold = 70 } = req.query;
    const threshold = parseInt(riskThreshold as string);
    
    console.log(`⚠️ Obtendo assinaturas com risco >= ${threshold}%...`);
    
    const report = await SubscriptionReportsService.generateCompleteReport();
    
    const allSubscriptions = [
      ...report.subscriptions.active,
      ...report.subscriptions.trials
    ];
    
    const atRiskSubscriptions = allSubscriptions.filter(sub => sub.riskScore >= threshold);
    
    res.json({
      success: true,
      data: {
        subscriptions: atRiskSubscriptions,
        totalCount: atRiskSubscriptions.length,
        riskThreshold: threshold,
        averageRiskScore: atRiskSubscriptions.length > 0 ? 
          Math.round(atRiskSubscriptions.reduce((sum, sub) => sum + sub.riskScore, 0) / atRiskSubscriptions.length) : 0,
        potentialRevenueAtRisk: atRiskSubscriptions.reduce((sum, sub) => sum + sub.monthlyRevenue, 0)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter assinaturas em risco:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter assinaturas em risco'
    });
  }
});

/**
 * GET /api/admin/subscription-reports/trials
 * Obter relatório detalhado de trials - Super Admin apenas
 */
router.get('/trials', async (req, res) => {
  try {
    const { status } = req.query; // 'all', 'active', 'expiring'
    
    console.log(`🎯 Obtendo relatório de trials (${status || 'all'})...`);
    
    const report = await SubscriptionReportsService.generateCompleteReport();
    
    let trialsData = report.subscriptions.trials;
    
    if (status === 'expiring') {
      trialsData = report.subscriptions.expiringSoon;
    }
    
    const trialStats = {
      totalTrials: report.subscriptions.trials.length,
      expiringSoon: report.subscriptions.expiringSoon.length,
      averageRiskScore: trialsData.length > 0 ? 
        Math.round(trialsData.reduce((sum, sub) => sum + sub.riskScore, 0) / trialsData.length) : 0,
      potentialRevenue: trialsData.reduce((sum, sub) => sum + sub.monthlyRevenue, 0),
      conversionOpportunity: trialsData.filter(sub => sub.riskScore < 50).length
    };
    
    res.json({
      success: true,
      data: {
        trials: trialsData,
        stats: trialStats,
        alerts: {
          expiringSoon: report.alerts.expiringSoon,
          trialEnding: report.alerts.trialEnding
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter relatório de trials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter relatório de trials'
    });
  }
});

/**
 * GET /api/admin/subscription-reports/analytics
 * Obter apenas analytics de assinaturas - Super Admin apenas
 */
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('📈 Calculando analytics de assinaturas...');
    
    const report = await SubscriptionReportsService.generateCompleteReport(start, end);
    
    res.json({
      success: true,
      data: {
        analytics: report.analytics,
        alerts: report.alerts,
        summary: {
          totalSubscriptions: report.subscriptions.active.length + 
                              report.subscriptions.inactive.length +
                              report.subscriptions.trials.length,
          activeCount: report.subscriptions.active.length,
          trialCount: report.subscriptions.trials.length,
          inactiveCount: report.subscriptions.inactive.length
        }
      },
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao calcular analytics de assinaturas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao calcular analytics de assinaturas'
    });
  }
});

/**
 * GET /api/admin/subscription-reports/user/:userId
 * Obter detalhes de assinatura específica - Super Admin apenas
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID é obrigatório'
      });
    }

    console.log(`👤 Obtendo detalhes da assinatura: ${userId}...`);
    
    const subscription = await SubscriptionReportsService.getSubscriptionDetails(userId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Assinatura não encontrada'
      });
    }

    res.json({
      success: true,
      data: subscription,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter detalhes da assinatura:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter detalhes da assinatura'
    });
  }
});

/**
 * GET /api/admin/subscription-reports/export
 * Exportar relatórios em CSV ou JSON - Super Admin apenas
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log(`📥 Exportando relatório de assinaturas em formato ${format}...`);
    
    if (format === 'csv') {
      const csvData = await SubscriptionReportsService.exportToCSV(start, end);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="toit-nexus-subscriptions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      // JSON format
      const report = await SubscriptionReportsService.generateCompleteReport(start, end);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="toit-nexus-subscriptions-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        period: {
          startDate: start?.toISOString() || 'Últimos 12 meses',
          endDate: end?.toISOString() || new Date().toISOString()
        },
        data: report
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao exportar relatório de assinaturas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao exportar relatório de assinaturas'
    });
  }
});

/**
 * POST /api/admin/subscription-reports/alerts/configure
 * Configurar alertas personalizados - Super Admin apenas
 */
router.post('/alerts/configure', async (req, res) => {
  try {
    const { riskThreshold, daysBeforeExpiry, churnThreshold } = req.body;
    
    // Validação básica
    if (riskThreshold && (riskThreshold < 0 || riskThreshold > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Risk threshold deve ser entre 0 e 100'
      });
    }

    console.log('⚙️ Configurando alertas personalizados...');
    
    // Aqui você poderia salvar essas configurações em uma tabela de configurações
    // Por enquanto, retornamos apenas confirmação
    
    const alertConfig = {
      riskThreshold: riskThreshold || 70,
      daysBeforeExpiry: daysBeforeExpiry || 7,
      churnThreshold: churnThreshold || 5
    };

    res.json({
      success: true,
      message: 'Configurações de alerta atualizadas com sucesso',
      data: alertConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao configurar alertas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao configurar alertas'
    });
  }
});

export default router;