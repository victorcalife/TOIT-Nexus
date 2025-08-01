import { Router } from 'express';
import { SalesMetricsService } from './salesMetricsService';

const router = Router();

/**
 * GET /api/admin/sales-metrics/overview
 * Obter métricas completas de vendas - Super Admin apenas
 */
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('📊 Calculando métricas completas de vendas...');
    
    const metrics = await SalesMetricsService.getCompleteSalesMetrics(start, end);
    
    res.json({
      success: true,
      data: metrics,
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter métricas de vendas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter métricas de vendas'
    });
  }
});

/**
 * GET /api/admin/sales-metrics/realtime
 * Obter métricas em tempo real - Super Admin apenas
 */
router.get('/realtime', async (req, res) => {
  try {
    console.log('⚡ Obtendo métricas em tempo real...');
    
    const metrics = await SalesMetricsService.getRealTimeMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter métricas em tempo real:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter métricas em tempo real'
    });
  }
});

/**
 * GET /api/admin/sales-metrics/revenue
 * Obter apenas métricas de receita - Super Admin apenas
 */
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('💰 Calculando métricas de receita...');
    
    const fullMetrics = await SalesMetricsService.getCompleteSalesMetrics(start, end);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: fullMetrics.overview.totalRevenue,
          monthlyRecurringRevenue: fullMetrics.overview.monthlyRecurringRevenue,
          averageRevenuePerUser: fullMetrics.overview.averageRevenuePerUser
        },
        revenue: fullMetrics.revenue,
        subscriptions: {
          byPlan: fullMetrics.subscriptions.byPlan
        }
      },
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter métricas de receita:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter métricas de receita'
    });
  }
});

/**
 * GET /api/admin/sales-metrics/trials
 * Obter apenas métricas de trials - Super Admin apenas
 */
router.get('/trials', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('🎯 Calculando métricas de trials...');
    
    const fullMetrics = await SalesMetricsService.getCompleteSalesMetrics(start, end);
    
    res.json({
      success: true,
      data: {
        overview: {
          activeTrials: fullMetrics.overview.activeTrials,
          conversionRate: fullMetrics.overview.conversionRate
        },
        trials: fullMetrics.trials,
        recentSignups: fullMetrics.subscriptions.recentSignups.filter(user => user.isTrialActive)
      },
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter métricas de trials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter métricas de trials'
    });
  }
});

/**
 * GET /api/admin/sales-metrics/subscriptions
 * Obter métricas de assinaturas - Super Admin apenas
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    console.log('📊 Calculando métricas de assinaturas...');
    
    const fullMetrics = await SalesMetricsService.getCompleteSalesMetrics(start, end);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: fullMetrics.overview.totalUsers,
          averageRevenuePerUser: fullMetrics.overview.averageRevenuePerUser
        },
        subscriptions: fullMetrics.subscriptions,
        geography: fullMetrics.geography,
        churn: fullMetrics.churn
      },
      period: {
        startDate: start?.toISOString() || 'Últimos 12 meses',
        endDate: end?.toISOString() || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter métricas de assinaturas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter métricas de assinaturas'
    });
  }
});

/**
 * GET /api/admin/sales-metrics/export
 * Exportar métricas em CSV - Super Admin apenas
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    console.log(`📥 Exportando métricas em formato ${format}...`);
    
    const metrics = await SalesMetricsService.getCompleteSalesMetrics();
    
    if (format === 'csv') {
      // Converter para CSV (simplificado)
      const csvData = [
        'Métrica,Valor',
        `Receita Total,R$ ${metrics.overview.totalRevenue}`,
        `Usuários Ativos,${metrics.overview.totalUsers}`,
        `Trials Ativos,${metrics.overview.activeTrials}`,
        `Taxa de Conversão,${metrics.overview.conversionRate}%`,
        `MRR,R$ ${metrics.overview.monthlyRecurringRevenue}`,
        `ARPU,R$ ${metrics.overview.averageRevenuePerUser}`
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="toit-nexus-metrics-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="toit-nexus-metrics-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        data: metrics
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao exportar métricas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao exportar métricas'
    });
  }
});

export default router;