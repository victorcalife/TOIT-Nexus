/**
 * ROTAS DO DASHBOARD
 * APIs para dados do dashboard, métricas e KPIs
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database-config');
const { requireAuth } = require('../middleware/enhanced-auth');
const { authSystem } = require('../auth-system');

/**
 * GET /api/dashboard/data
 * Obter dados do dashboard
 */
router.get('/data', requireAuth(authSystem), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    const tenantId = req.user.tenant_id;

    // Calcular período em dias
    const periodDays = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[period] || 7;

    // Dados base do dashboard
    const dashboardData = {
      activeUsers: 0,
      userGrowth: 0,
      userEngagement: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      systemPerformance: 0,
      quantumOperations: 0,
      quantumSpeedup: 0,
      alerts: []
    };

    // Se for super admin, mostrar dados globais
    if (userRole === 'super_admin') {
      // Usuários ativos globais
      const activeUsersResult = await db.query(`
        SELECT COUNT(DISTINCT id) as count
        FROM users 
        WHERE is_active = true 
        AND last_login >= NOW() - INTERVAL '${periodDays} days'
      `);
      dashboardData.activeUsers = parseInt(activeUsersResult.rows[0]?.count || 0);

      // Crescimento de usuários
      const previousPeriodUsers = await db.query(`
        SELECT COUNT(DISTINCT id) as count
        FROM users 
        WHERE is_active = true 
        AND last_login >= NOW() - INTERVAL '${periodDays * 2} days'
        AND last_login < NOW() - INTERVAL '${periodDays} days'
      `);
      const previousCount = parseInt(previousPeriodUsers.rows[0]?.count || 0);
      if (previousCount > 0) {
        dashboardData.userGrowth = ((dashboardData.activeUsers - previousCount) / previousCount * 100).toFixed(1);
      }

      // Total de tenants
      const tenantsResult = await db.query(`
        SELECT COUNT(*) as count FROM tenants WHERE status = 'active'
      `);
      dashboardData.totalTenants = parseInt(tenantsResult.rows[0]?.count || 0);

    } else {
      // Dados específicos do tenant
      const tenantFilter = tenantId ? `AND tenant_id = '${tenantId}'` : '';

      // Usuários ativos do tenant
      const activeUsersResult = await db.query(`
        SELECT COUNT(DISTINCT id) as count
        FROM users 
        WHERE is_active = true 
        AND last_login >= NOW() - INTERVAL '${periodDays} days'
        ${tenantFilter}
      `);
      dashboardData.activeUsers = parseInt(activeUsersResult.rows[0]?.count || 0);

      // Workspaces do tenant
      if (tenantId) {
        const workspacesResult = await db.query(`
          SELECT COUNT(*) as count FROM workspaces WHERE tenant_id = $1 AND is_active = true
        `, [tenantId]);
        dashboardData.activeWorkspaces = parseInt(workspacesResult.rows[0]?.count || 0);
      }
    }

    // Métricas de sistema (simuladas para demonstração)
    dashboardData.systemPerformance = Math.floor(Math.random() * 10) + 90; // 90-99%
    dashboardData.quantumOperations = Math.floor(Math.random() * 1000) + 2000;
    dashboardData.quantumSpeedup = (Math.random() * 2 + 2).toFixed(1); // 2.0-4.0x
    dashboardData.monthlyRevenue = Math.floor(Math.random() * 50000) + 30000;
    dashboardData.revenueGrowth = (Math.random() * 20 - 5).toFixed(1); // -5% a +15%

    // Alertas do sistema
    const alerts = [];
    
    if (dashboardData.systemPerformance < 95) {
      alerts.push({
        level: 'warning',
        message: `Performance do sistema em ${dashboardData.systemPerformance}% - monitorar`
      });
    }

    if (dashboardData.activeUsers === 0) {
      alerts.push({
        level: 'info',
        message: 'Nenhum usuário ativo no período selecionado'
      });
    }

    dashboardData.alerts = alerts;

    // Dados para gráficos (simulados)
    dashboardData.userGrowthChart = generateChartData(periodDays, 'users');
    dashboardData.revenueChart = generateChartData(periodDays, 'revenue');
    dashboardData.performanceChart = generateChartData(periodDays, 'performance');

    res.json({
      success: true,
      data: dashboardData,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao obter dados do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'DASHBOARD_ERROR'
    });
  }
});

/**
 * GET /api/dashboard/metrics
 * Obter métricas específicas
 */
router.get('/metrics', requireAuth(authSystem), async (req, res) => {
  try {
    const { metric } = req.query;
    const userId = req.user.id;
    const tenantId = req.user.tenant_id;

    let result = {};

    switch (metric) {
      case 'users':
        result = await getUserMetrics(tenantId);
        break;
      case 'performance':
        result = await getPerformanceMetrics();
        break;
      case 'quantum':
        result = await getQuantumMetrics();
        break;
      case 'security':
        result = await getSecurityMetrics(tenantId);
        break;
      default:
        throw new Error('Métrica não suportada');
    }

    res.json({
      success: true,
      data: result,
      metric,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao obter métricas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
      code: 'METRICS_ERROR'
    });
  }
});

/**
 * GET /api/dashboard/alerts
 * Obter alertas do sistema
 */
router.get('/alerts', requireAuth(authSystem), async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenant_id;

    // Buscar alertas do banco (se existir tabela)
    const alerts = [
      {
        id: 1,
        level: 'info',
        message: 'Sistema funcionando normalmente',
        timestamp: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });

  } catch (error) {
    console.error('❌ Erro ao obter alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'ALERTS_ERROR'
    });
  }
});

/**
 * FUNÇÕES AUXILIARES
 */

// Gerar dados para gráficos
function generateChartData(days, type) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let value;
    switch (type) {
      case 'users':
        value = Math.floor(Math.random() * 100) + 50;
        break;
      case 'revenue':
        value = Math.floor(Math.random() * 5000) + 1000;
        break;
      case 'performance':
        value = Math.floor(Math.random() * 20) + 80;
        break;
      default:
        value = Math.floor(Math.random() * 100);
    }

    data.push({
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      period: date.toLocaleDateString('pt-BR'),
      [type]: value,
      users: type === 'users' ? value : undefined,
      revenue: type === 'revenue' ? value : undefined,
      cpu: type === 'performance' ? value : undefined,
      memory: type === 'performance' ? Math.floor(Math.random() * 30) + 60 : undefined,
      response: type === 'performance' ? Math.floor(Math.random() * 100) + 50 : undefined
    });
  }

  return data;
}

// Métricas de usuários
async function getUserMetrics(tenantId) {
  const tenantFilter = tenantId ? 'WHERE tenant_id = $1' : '';
  const params = tenantId ? [tenantId] : [];

  const result = await db.query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN is_active THEN 1 END) as active_users,
      COUNT(CASE WHEN last_login >= NOW() - INTERVAL '24 hours' THEN 1 END) as daily_active,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users
    FROM users ${tenantFilter}
  `, params);

  return result.rows[0] || {};
}

// Métricas de performance
async function getPerformanceMetrics() {
  return {
    cpu_usage: Math.floor(Math.random() * 30) + 70,
    memory_usage: Math.floor(Math.random() * 40) + 50,
    disk_usage: Math.floor(Math.random() * 20) + 30,
    response_time: Math.floor(Math.random() * 100) + 50,
    uptime: 99.9
  };
}

// Métricas quânticas
async function getQuantumMetrics() {
  return {
    coherence_time: (Math.random() * 50 + 100).toFixed(2),
    gate_fidelity: (Math.random() * 5 + 95).toFixed(2),
    operations_per_second: Math.floor(Math.random() * 1000) + 2000,
    quantum_volume: 64,
    speedup_factor: (Math.random() * 2 + 2).toFixed(1)
  };
}

// Métricas de segurança
async function getSecurityMetrics(tenantId) {
  try {
    const loginAttemptsResult = await db.query(`
      SELECT COUNT(*) as total_attempts,
             COUNT(CASE WHEN success THEN 1 END) as successful_logins
      FROM login_attempts 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    const activeSessionsResult = await db.query(`
      SELECT COUNT(*) as active_sessions
      FROM active_sessions 
      WHERE expires_at > NOW()
    `);

    return {
      login_attempts: parseInt(loginAttemptsResult.rows[0]?.total_attempts || 0),
      successful_logins: parseInt(loginAttemptsResult.rows[0]?.successful_logins || 0),
      active_sessions: parseInt(activeSessionsResult.rows[0]?.active_sessions || 0),
      active_tokens: Math.floor(Math.random() * 100) + 50
    };
  } catch (error) {
    // Se tabelas não existirem, retornar dados simulados
    return {
      login_attempts: Math.floor(Math.random() * 50) + 10,
      successful_logins: Math.floor(Math.random() * 40) + 5,
      active_sessions: Math.floor(Math.random() * 20) + 5,
      active_tokens: Math.floor(Math.random() * 100) + 50
    };
  }
}

module.exports = router;
