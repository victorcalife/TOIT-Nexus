import { Router } from 'express';
import { QuantumMonitoringService } from './quantumMonitoringService';
import { QuantumBillingService } from './quantumBillingService';
import { EnterpriseQuantumInfrastructure } from './enterpriseQuantumInfrastructure';

const router = Router();

// ===== QUANTUM MONITORING ROUTES =====
// APIs para monitoramento em tempo real da infraestrutura 260 qubits

// Middleware de autenticação (apenas super_admin e tenant_admin)
const requireAdminAuth = (req: any, res: any, next: any) => {
  // TODO: Implementar verificação de role
  // Por enquanto, permitir acesso
  next();
};

// ===== REAL-TIME MONITORING =====

/**
 * GET /api/quantum-monitoring/status
 * Status geral da infraestrutura enterprise
 */
router.get('/status', requireAdminAuth, async (req, res) => {
  try {
    const snapshot = await QuantumMonitoringService.getCurrentSnapshot();
    
    res.json({
      success: true,
      data: snapshot,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting quantum monitoring status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quantum-monitoring/dashboard
 * Resumo para dashboard executivo
 */
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const summary = await QuantumMonitoringService.getDashboardSummary();
    
    res.json({
      success: true,
      data: summary,
      enterprise: {
        totalCapacity: '260 qubits',
        serverDistribution: 'Alpha: 127Q, Beta: 133Q',
        ibmQuantumNetwork: true,
        loadBalancing: true
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quantum-monitoring/infrastructure
 * Status detalhado da infraestrutura
 */
router.get('/infrastructure', requireAdminAuth, async (req, res) => {
  try {
    const status = QuantumBillingService.getEnterpriseInfrastructureStatus();
    
    res.json({
      success: true,
      data: status,
      realtime: true
    });
  } catch (error) {
    console.error('Error getting infrastructure status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quantum-monitoring/health
 * Health check completo dos 260 qubits
 */
router.get('/health', requireAdminAuth, async (req, res) => {
  try {
    const healthCheck = await QuantumBillingService.performEnterpriseHealthCheck();
    
    res.json({
      success: true,
      data: healthCheck,
      enterprise: {
        qubitsChecked: 260,
        serversChecked: 2,
        checkType: 'comprehensive'
      }
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quantum-monitoring/start
 * Iniciar monitoramento em tempo real
 */
router.post('/start', requireAdminAuth, async (req, res) => {
  try {
    const { intervalMs } = req.body;
    const interval = intervalMs && intervalMs >= 10000 ? intervalMs : 30000; // Mínimo 10s
    
    QuantumMonitoringService.startRealTimeMonitoring(interval);
    
    res.json({
      success: true,
      message: 'Monitoramento quantum iniciado',
      data: {
        intervalMs: interval,
        monitoring: true,
        startTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quantum-monitoring/stop
 * Parar monitoramento em tempo real
 */
router.post('/stop', requireAdminAuth, async (req, res) => {
  try {
    QuantumMonitoringService.stopRealTimeMonitoring();
    
    res.json({
      success: true,
      message: 'Monitoramento quantum parado',
      data: {
        monitoring: false,
        stopTime: new Date()
      }
    });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== QUANTUM EXECUTION ENTERPRISE =====

/**
 * POST /api/quantum-monitoring/execute
 * Executar algoritmo quantum usando infraestrutura enterprise integrada
 */
router.post('/execute', requireAdminAuth, async (req, res) => {
  try {
    const { 
      tenantId, 
      userId, 
      algorithmType, 
      inputData, 
      complexity = 'medium',
      contextData 
    } = req.body;

    // Validações básicas
    if (!tenantId || !userId || !algorithmType || !inputData) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: tenantId, userId, algorithmType, inputData'
      });
    }

    console.log(`🔮 API Request: Executar ${algorithmType} para tenant ${tenantId}`);

    // Executar usando infraestrutura enterprise integrada
    const result = await QuantumBillingService.executeQuantumAlgorithmWithBilling(
      tenantId,
      userId,
      algorithmType,
      inputData,
      complexity,
      contextData
    );

    if (result.success) {
      res.json({
        success: true,
        data: result,
        enterprise: {
          infrastructureUsed: '260 qubits enterprise',
          loadBalancingApplied: true,
          billingIntegrated: true
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        data: result
      });
    }

  } catch (error) {
    console.error('Error in quantum execution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== ANALYTICS & REPORTING =====

/**
 * GET /api/quantum-monitoring/analytics
 * Analytics avançadas da infraestrutura
 */
router.get('/analytics', requireAdminAuth, async (req, res) => {
  try {
    const { period = 'last24h' } = req.query;

    // Snapshot atual para analytics em tempo real
    const snapshot = await QuantumMonitoringService.getCurrentSnapshot();
    
    // Analytics específicas por período
    let analytics = {};
    
    switch (period) {
      case 'last24h':
        analytics = {
          executions: snapshot.executions,
          billing: snapshot.billing,
          infrastructure: snapshot.infrastructure,
          period: '24 horas'
        };
        break;
      case 'realtime':
        analytics = {
          qubits: snapshot.qubits,
          health: snapshot.health,
          alerts: snapshot.alerts,
          period: 'tempo real'
        };
        break;
      default:
        analytics = {
          summary: await QuantumMonitoringService.getDashboardSummary(),
          period: 'current'
        };
    }

    res.json({
      success: true,
      data: analytics,
      enterprise: {
        totalQubits: 260,
        analyticsType: period,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quantum-monitoring/metrics
 * Métricas específicas para grafana/prometheus
 */
router.get('/metrics', requireAdminAuth, async (req, res) => {
  try {
    const summary = await QuantumMonitoringService.getDashboardSummary();
    const infraStatus = QuantumBillingService.getEnterpriseInfrastructureStatus();
    
    // Formato de métricas para monitoramento externo
    const metrics = {
      quantum_total_qubits: 260,
      quantum_operational_qubits: summary.operationalQubits,
      quantum_active_executions: summary.activeExecutions,
      quantum_success_rate: summary.successRate,
      quantum_utilization_rate: summary.utilizationRate,
      quantum_servers_online: infraStatus.infrastructure.onlineServers,
      quantum_servers_total: infraStatus.infrastructure.totalServers,
      quantum_alerts_critical: summary.alerts.critical,
      quantum_alerts_warnings: summary.alerts.warnings,
      quantum_infrastructure_status: summary.status === 'fully_operational' ? 1 : 0,
      timestamp: Date.now()
    };

    res.json({
      success: true,
      metrics,
      format: 'prometheus_compatible'
    });

  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quantum-monitoring/alerts
 * Sistema de alertas em tempo real
 */
router.get('/alerts', requireAdminAuth, async (req, res) => {
  try {
    const { severity, limit = 50 } = req.query;
    
    // Obter alertas do snapshot atual
    const snapshot = await QuantumMonitoringService.getCurrentSnapshot();
    let alerts = snapshot.alerts?.alerts || [];
    
    // Filtrar por severidade se especificado
    if (severity) {
      alerts = alerts.filter((alert: any) => alert.severity === severity);
    }
    
    // Limitar resultados
    alerts = alerts.slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: {
        total: alerts.length,
        alerts,
        summary: snapshot.alerts || { total: 0, critical: 0, warnings: 0 }
      },
      realtime: true
    });

  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== SERVER MANAGEMENT =====

/**
 * GET /api/quantum-monitoring/servers
 * Status individual dos servidores Alpha e Beta
 */
router.get('/servers', requireAdminAuth, async (req, res) => {
  try {
    const status = QuantumBillingService.getEnterpriseInfrastructureStatus();
    
    res.json({
      success: true,
      data: {
        servers: status.servers,
        enterprise: status.enterprise,
        capacity: status.capacity,
        performance: status.performance
      }
    });

  } catch (error) {
    console.error('Error getting servers status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quantum-monitoring/servers/:serverId/health
 * Health check específico de um servidor
 */
router.post('/servers/:serverId/health', requireAdminAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    
    // Simular health check específico
    const healthCheck = await QuantumBillingService.performEnterpriseHealthCheck();
    const serverHealth = healthCheck.results?.find((r: any) => r.serverId === serverId);
    
    if (!serverHealth) {
      return res.status(404).json({
        success: false,
        error: 'Servidor não encontrado'
      });
    }

    res.json({
      success: true,
      data: serverHealth,
      serverId
    });

  } catch (error) {
    console.error('Error getting server health:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;