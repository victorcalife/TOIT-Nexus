import { EnterpriseQuantumInfrastructure } from "./enterpriseQuantumInfrastructure";
import { QuantumBillingService } from "./quantumBillingService";
import { db } from "./db";
import { quantumExecutions, quantumPackages, tenants } from "../shared/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

// ===== QUANTUM MONITORING SERVICE =====
// Sistema de monitoramento em tempo real da infraestrutura 260 qubits

export class QuantumMonitoringService {
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;
  private static listeners: ((data: any) => void)[] = [];

  // ===== REAL-TIME MONITORING =====

  /**
   * Iniciar monitoramento em tempo real dos 260 qubits
   */
  static startRealTimeMonitoring(intervalMs: number = 30000) { // 30 segundos
    if (this.isMonitoring) {
      console.log('🔮 Monitoramento quantum já está ativo');
      return;
    }

    console.log(`🔮 Iniciando monitoramento em tempo real - ${intervalMs}ms intervals`);
    this.isMonitoring = true;

    // Monitoramento inicial
    this.performMonitoringCycle();

    // Ciclos contínuos
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringCycle();
    }, intervalMs);
  }

  /**
   * Parar monitoramento
   */
  static stopRealTimeMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🔮 Monitoramento quantum parado');
  }

  /**
   * Adicionar listener para atualizações em tempo real
   */
  static addListener(callback: (data: any) => void) {
    this.listeners.push(callback);
  }

  /**
   * Remover listener
   */
  static removeListener(callback: (data: any) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Broadcast de dados para todos os listeners
   */
  private static broadcast(data: any) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in monitoring listener:', error);
      }
    });
  }

  // ===== MONITORING CYCLE =====

  /**
   * Ciclo completo de monitoramento
   */
  private static async performMonitoringCycle() {
    try {
      const timestamp = new Date();
      console.log(`🔮 Monitoramento quantum - ${timestamp.toISOString()}`);

      // 1. Status da infraestrutura enterprise
      const infrastructureStatus = EnterpriseQuantumInfrastructure.getInfrastructureStatus();
      
      // 2. Health check dos servidores
      const healthCheck = await EnterpriseQuantumInfrastructure.performHealthCheck();
      
      // 3. Estatísticas de execução em tempo real
      const executionStats = await this.getRealtimeExecutionStats();
      
      // 4. Análise de performance dos qubits
      const qubitAnalysis = await this.analyzeQubitPerformance();
      
      // 5. Métricas de billing em tempo real
      const billingMetrics = await this.getRealtimeBillingMetrics();
      
      // 6. Alertas automáticos
      const alerts = await this.generateAutomaticAlerts(infrastructureStatus, healthCheck, executionStats);

      // 7. Predições de capacidade
      const capacityPredictions = this.predictCapacityNeeds(executionStats, infrastructureStatus);

      const monitoringData = {
        timestamp,
        infrastructure: infrastructureStatus,
        health: healthCheck,
        executions: executionStats,
        qubits: qubitAnalysis,
        billing: billingMetrics,
        alerts,
        predictions: capacityPredictions,
        enterprise: {
          totalQubits: 260,
          serverDistribution: 'Alpha: 127Q, Beta: 133Q',
          monitoringActive: true,
          lastUpdate: timestamp
        }
      };

      // Broadcast para listeners em tempo real
      this.broadcast(monitoringData);

      // Log de status
      console.log(`✅ Ciclo monitoramento completo - ${infrastructureStatus.infrastructure.status} | ${infrastructureStatus.capacity.currentJobs} jobs ativos`);

      return monitoringData;

    } catch (error) {
      console.error('❌ Erro no ciclo de monitoramento:', error);
      
      const errorData = {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'monitoring_error'
      };
      
      this.broadcast(errorData);
      return errorData;
    }
  }

  // ===== REALTIME STATISTICS =====

  /**
   * Estatísticas de execução em tempo real
   */
  private static async getRealtimeExecutionStats() {
    try {
      // Execuções das últimas 24 horas
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);

      const recentExecutions = await db
        .select()
        .from(quantumExecutions)
        .where(gte(quantumExecutions.createdAt, last24h))
        .orderBy(desc(quantumExecutions.createdAt))
        .limit(100);

      // Execuções ativas (running)
      const activeExecutions = await db
        .select()
        .from(quantumExecutions)
        .where(eq(quantumExecutions.status, 'running'));

      // Estatísticas por algoritmo
      const algorithmStats = recentExecutions.reduce((acc, exec) => {
        if (!acc[exec.algorithmType]) {
          acc[exec.algorithmType] = {
            count: 0,
            totalCredits: 0,
            avgExecutionTime: 0,
            successCount: 0
          };
        }
        
        acc[exec.algorithmType].count++;
        acc[exec.algorithmType].totalCredits += exec.creditsCharged;
        
        if (exec.executionTimeMs) {
          acc[exec.algorithmType].avgExecutionTime = 
            (acc[exec.algorithmType].avgExecutionTime + exec.executionTimeMs) / 2;
        }
        
        if (exec.status === 'completed') {
          acc[exec.algorithmType].successCount++;
        }
        
        return acc;
      }, {});

      // Métricas globais
      const totalExecutions = recentExecutions.length;
      const successRate = totalExecutions > 0 ? 
        recentExecutions.filter(e => e.status === 'completed').length / totalExecutions : 0;
      
      const avgQuantumAdvantage = recentExecutions
        .filter(e => e.quantumAdvantage && e.status === 'completed')
        .reduce((sum, e) => sum + parseFloat(e.quantumAdvantage || '1'), 0) / 
        recentExecutions.filter(e => e.quantumAdvantage).length || 1;

      return {
        last24Hours: {
          totalExecutions,
          activeExecutions: activeExecutions.length,
          successRate: Math.round(successRate * 100),
          avgQuantumAdvantage: Math.round(avgQuantumAdvantage * 100) / 100
        },
        byAlgorithm: algorithmStats,
        trending: {
          mostUsedAlgorithm: Object.entries(algorithmStats)
            .sort(([,a], [,b]) => (b as any).count - (a as any).count)[0]?.[0] || 'none',
          fastestAlgorithm: Object.entries(algorithmStats)
            .filter(([,stats]) => (stats as any).avgExecutionTime > 0)
            .sort(([,a], [,b]) => (a as any).avgExecutionTime - (b as any).avgExecutionTime)[0]?.[0] || 'none'
        }
      };

    } catch (error) {
      console.error('Error getting realtime execution stats:', error);
      return {
        error: 'Failed to get execution statistics',
        last24Hours: {
          totalExecutions: 0,
          activeExecutions: 0,
          successRate: 0,
          avgQuantumAdvantage: 1
        }
      };
    }
  }

  /**
   * Análise de performance individual dos qubits
   */
  private static async analyzeQubitPerformance() {
    try {
      // Simular análise de performance dos 260 qubits
      const servers = [
        {
          id: 'ibm-server-1',
          name: 'TOIT Quantum Server Alpha',
          qubits: 127,
          qubitHealth: Array.from({ length: 127 }, (_, i) => ({
            id: i,
            coherenceTime: 100 + Math.random() * 20, // 100-120µs
            gateErrorRate: 0.001 + Math.random() * 0.0005, // 0.001-0.0015
            readoutErrorRate: 0.02 + Math.random() * 0.005, // 0.02-0.025
            status: Math.random() > 0.05 ? 'operational' : 'maintenance', // 95% uptime
            lastCalibration: new Date(Date.now() - Math.random() * 86400000) // Últimas 24h
          }))
        },
        {
          id: 'ibm-server-2',
          name: 'TOIT Quantum Server Beta',
          qubits: 133,
          qubitHealth: Array.from({ length: 133 }, (_, i) => ({
            id: i + 127, // Continuar numeração
            coherenceTime: 120 + Math.random() * 25, // 120-145µs (melhor servidor)
            gateErrorRate: 0.0008 + Math.random() * 0.0004, // 0.0008-0.0012
            readoutErrorRate: 0.018 + Math.random() * 0.004, // 0.018-0.022
            status: Math.random() > 0.03 ? 'operational' : 'maintenance', // 97% uptime
            lastCalibration: new Date(Date.now() - Math.random() * 86400000)
          }))
        }
      ];

      // Análise global dos 260 qubits
      const allQubits = [...servers[0].qubitHealth, ...servers[1].qubitHealth];
      const operationalQubits = allQubits.filter(q => q.status === 'operational');
      
      const avgCoherenceTime = operationalQubits.reduce((sum, q) => sum + q.coherenceTime, 0) / operationalQubits.length;
      const avgGateErrorRate = operationalQubits.reduce((sum, q) => sum + q.gateErrorRate, 0) / operationalQubits.length;
      const avgReadoutErrorRate = operationalQubits.reduce((sum, q) => sum + q.readoutErrorRate, 0) / operationalQubits.length;

      return {
        totalQubits: 260,
        operationalQubits: operationalQubits.length,
        maintenanceQubits: allQubits.length - operationalQubits.length,
        uptime: Math.round((operationalQubits.length / allQubits.length) * 100),
        averageMetrics: {
          coherenceTime: Math.round(avgCoherenceTime * 10) / 10,
          gateErrorRate: Math.round(avgGateErrorRate * 1000000) / 1000000,
          readoutErrorRate: Math.round(avgReadoutErrorRate * 1000) / 1000
        },
        serverBreakdown: servers.map(server => ({
          name: server.name,
          totalQubits: server.qubits,
          operationalQubits: server.qubitHealth.filter(q => q.status === 'operational').length,
          avgCoherenceTime: Math.round(
            server.qubitHealth
              .filter(q => q.status === 'operational')
              .reduce((sum, q) => sum + q.coherenceTime, 0) / 
            server.qubitHealth.filter(q => q.status === 'operational').length * 10
          ) / 10
        })),
        lastCalibrationWindow: Math.round(
          (Date.now() - Math.min(...allQubits.map(q => q.lastCalibration.getTime()))) / 3600000
        ) // horas
      };

    } catch (error) {
      console.error('Error analyzing qubit performance:', error);
      return {
        error: 'Failed to analyze qubit performance',
        totalQubits: 260,
        operationalQubits: 0
      };
    }
  }

  /**
   * Métricas de billing em tempo real
   */
  private static async getRealtimeBillingMetrics() {
    try {
      // Reveue das últimas 24 horas
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);

      const recentExecutions = await db
        .select({
          creditsCharged: quantumExecutions.creditsCharged,
          algorithmType: quantumExecutions.algorithmType,
          tenantId: quantumExecutions.tenantId
        })
        .from(quantumExecutions)
        .where(and(
          gte(quantumExecutions.createdAt, last24h),
          eq(quantumExecutions.status, 'completed')
        ));

      // Revenue total
      const totalCreditsCharged = recentExecutions.reduce((sum, e) => sum + e.creditsCharged, 0);
      const totalRevenue = totalCreditsCharged * 5; // R$ 5 por crédito

      // Revenue por algoritmo
      const revenueByAlgorithm = recentExecutions.reduce((acc, exec) => {
        acc[exec.algorithmType] = (acc[exec.algorithmType] || 0) + (exec.creditsCharged * 5);
        return acc;
      }, {} as Record<string, number>);

      // Tenants ativos
      const activeTenants = [...new Set(recentExecutions.map(e => e.tenantId))];

      // Pacotes ativos
      const activePackages = await db
        .select({
          packageType: quantumPackages.packageType,
          creditsBalance: quantumPackages.creditsBalance,
          tenantId: quantumPackages.tenantId
        })
        .from(quantumPackages)
        .where(eq(quantumPackages.isActive, true));

      const packageDistribution = activePackages.reduce((acc, pkg) => {
        acc[pkg.packageType] = (acc[pkg.packageType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalCreditsInCirculation = activePackages.reduce((sum, pkg) => sum + pkg.creditsBalance, 0);

      return {
        last24Hours: {
          revenue: totalRevenue,
          creditsConsumed: totalCreditsCharged,
          activeExecutions: recentExecutions.length,
          activeTenants: activeTenants.length
        },
        revenueByAlgorithm,
        packages: {
          distribution: packageDistribution,
          totalCreditsBalance: totalCreditsInCirculation,
          avgCreditsPerTenant: Math.round(totalCreditsInCirculation / activePackages.length) || 0
        },
        efficiency: {
          revenuePerExecution: Math.round((totalRevenue / Math.max(recentExecutions.length, 1)) * 100) / 100,
          creditsPerExecution: Math.round((totalCreditsCharged / Math.max(recentExecutions.length, 1)) * 100) / 100
        }
      };

    } catch (error) {
      console.error('Error getting realtime billing metrics:', error);
      return {
        error: 'Failed to get billing metrics',
        last24Hours: {
          revenue: 0,
          creditsConsumed: 0,
          activeExecutions: 0,
          activeTenants: 0
        }
      };
    }
  }

  // ===== AUTOMATIC ALERTS =====

  /**
   * Gerar alertas automáticos baseados nas métricas
   */
  private static async generateAutomaticAlerts(infrastructure: any, health: any, executions: any) {
    const alerts = [];

    // Alert 1: Infraestrutura degradada
    if (infrastructure.infrastructure.status !== 'fully_operational') {
      alerts.push({
        type: 'infrastructure_degraded',
        severity: infrastructure.infrastructure.status === 'offline' ? 'critical' : 'warning',
        message: `Infraestrutura ${infrastructure.infrastructure.status} - ${infrastructure.infrastructure.onlineServers}/${infrastructure.infrastructure.totalServers} servidores online`,
        timestamp: new Date(),
        autoAction: 'monitor_recovery'
      });
    }

    // Alert 2: Capacidade alta
    if (infrastructure.capacity.utilizationRate > 0.8) {
      alerts.push({
        type: 'high_capacity',
        severity: infrastructure.capacity.utilizationRate > 0.95 ? 'critical' : 'warning',
        message: `Alta utilização: ${Math.round(infrastructure.capacity.utilizationRate * 100)}% da capacidade`,
        timestamp: new Date(),
        autoAction: 'scale_preparation'
      });
    }

    // Alert 3: Performance degradada
    if (infrastructure.performance.averageSuccessRate < 90) {
      alerts.push({
        type: 'performance_degraded',
        severity: infrastructure.performance.averageSuccessRate < 80 ? 'critical' : 'warning',
        message: `Taxa de sucesso baixa: ${infrastructure.performance.averageSuccessRate}%`,
        timestamp: new Date(),
        autoAction: 'investigate_failures'
      });
    }

    // Alert 4: Health check crítico
    if (health.overallHealth === 'critical') {
      alerts.push({
        type: 'health_critical',
        severity: 'critical',
        message: 'Health check crítico detectado nos servidores quantum',
        timestamp: new Date(),
        autoAction: 'immediate_intervention'
      });
    }

    // Alert 5: Execuções acumulando
    if (executions.last24Hours.activeExecutions > 10) {
      alerts.push({
        type: 'execution_backlog',
        severity: 'warning',
        message: `${executions.last24Hours.activeExecutions} execuções ativas podem indicar bottleneck`,
        timestamp: new Date(),
        autoAction: 'monitor_queue'
      });
    }

    // Alert 6: Taxa de sucesso baixa
    if (executions.last24Hours.successRate < 85) {
      alerts.push({
        type: 'low_success_rate',
        severity: executions.last24Hours.successRate < 70 ? 'critical' : 'warning',
        message: `Taxa de sucesso de execuções: ${executions.last24Hours.successRate}%`,
        timestamp: new Date(),
        autoAction: 'analyze_failed_executions'
      });
    }

    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warnings: alerts.filter(a => a.severity === 'warning').length,
      alerts: alerts.slice(0, 10) // Limitar a 10 alertas mais recentes
    };
  }

  // ===== CAPACITY PREDICTIONS =====

  /**
   * Predições de capacidade baseadas em tendências
   */
  private static predictCapacityNeeds(executions: any, infrastructure: any) {
    try {
      const currentUtilization = infrastructure.capacity.utilizationRate;
      const executionsLast24h = executions.last24Hours.totalExecutions;
      
      // Predições simples baseadas em tendências
      const predictedDailyGrowth = Math.max(executionsLast24h * 0.1, 5); // 10% crescimento ou mínimo 5
      const predictedWeeklyExecutions = (executionsLast24h + predictedDailyGrowth) * 7;
      
      // Capacidade necessária
      const avgExecutionDuration = 3000; // 3 segundos médio
      const dailyCapacityNeeded = (executionsLast24h + predictedDailyGrowth) * avgExecutionDuration / (24 * 3600); // % do dia
      
      // Recomendações
      const recommendations = [];
      
      if (currentUtilization > 0.7) {
        recommendations.push('Considerar adicionar mais slots de execução');
      }
      
      if (dailyCapacityNeeded > 0.5) {
        recommendations.push('Planejamento de escala para próximas semanas necessário');
      }
      
      if (executionsLast24h > 100) {
        recommendations.push('Otimizar algoritmos mais usados para reduzir tempo de execução');
      }

      return {
        current: {
          utilization: Math.round(currentUtilization * 100),
          dailyExecutions: executionsLast24h
        },
        predictions: {
          dailyGrowthRate: Math.round((predictedDailyGrowth / Math.max(executionsLast24h, 1)) * 100),
          weeklyExecutions: Math.round(predictedWeeklyExecutions),
          capacityNeeded: Math.round(dailyCapacityNeeded * 100)
        },
        recommendations,
        horizon: '7 days'
      };

    } catch (error) {
      console.error('Error predicting capacity:', error);
      return {
        error: 'Failed to predict capacity needs',
        current: { utilization: 0, dailyExecutions: 0 },
        predictions: { dailyGrowthRate: 0, weeklyExecutions: 0, capacityNeeded: 0 },
        recommendations: []
      };
    }
  }

  // ===== API ENDPOINTS FOR MONITORING =====

  /**
   * Obter snapshot atual do monitoramento
   */
  static async getCurrentSnapshot() {
    return await this.performMonitoringCycle();
  }

  /**
   * Obter status resumido para dashboard
   */
  static async getDashboardSummary() {
    try {
      const snapshot = await this.getCurrentSnapshot();
      
      return {
        status: snapshot.infrastructure?.infrastructure?.status || 'unknown',
        totalQubits: 260,
        operationalQubits: snapshot.qubits?.operationalQubits || 0,
        activeExecutions: snapshot.executions?.last24Hours?.activeExecutions || 0,
        successRate: snapshot.executions?.last24Hours?.successRate || 0,
        utilizationRate: Math.round((snapshot.infrastructure?.capacity?.utilizationRate || 0) * 100),
        alerts: {
          critical: snapshot.alerts?.critical || 0,
          warnings: snapshot.alerts?.warnings || 0
        },
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obter histórico de alertas
   */
  static getAlertHistory() {
    // Implementar se necessário persistir alertas
    return {
      total: 0,
      alerts: [],
      message: 'Alert history not implemented - alerts are realtime only'
    };
  }
}