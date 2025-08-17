/**
 * QUANTUM BILLING SERVICE - JavaScript Puro
 * Serviço de cobrança para algoritmos quânticos
 */

const DatabaseService = require('./services/DatabaseService');
const db = new DatabaseService();

class QuantumBillingService {
  constructor() {
    this.pricingTiers = {
      'grover': { basePrice: 0.10, perQubit: 0.05 },
      'qaoa': { basePrice: 0.25, perQubit: 0.08 },
      'vqe': { basePrice: 0.30, perQubit: 0.10 },
      'qnn': { basePrice: 0.50, perQubit: 0.15 },
      'qft': { basePrice: 0.15, perQubit: 0.06 }
    };
  }

  /**
   * Calcular custo de execução quântica
   */
  calculateExecutionCost(algorithm, qubits, iterations = 1) {
    const pricing = this.pricingTiers[algorithm] || this.pricingTiers['grover'];
    const baseCost = pricing.basePrice;
    const qubitCost = pricing.perQubit * qubits;
    const totalCost = (baseCost + qubitCost) * iterations;
    
    return {
      algorithm,
      qubits,
      iterations,
      baseCost,
      qubitCost,
      totalCost: Math.round(totalCost * 100) / 100
    };
  }

  /**
   * Registrar execução quântica
   */
  async recordQuantumExecution(userId, executionData) {
    try {
      const cost = this.calculateExecutionCost(
        executionData.algorithm,
        executionData.qubits,
        executionData.iterations
      );

      await db.query(`
        INSERT INTO quantum_executions (
          user_id, algorithm, qubits, iterations, cost, executed_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        executionData.algorithm,
        executionData.qubits,
        executionData.iterations,
        cost.totalCost,
        new Date().toISOString()
      ]);

      return cost;
    } catch (error) {
      console.error('Erro ao registrar execução quântica:', error);
      throw error;
    }
  }

  /**
   * Obter uso quântico do usuário
   */
  async getUserQuantumUsage(userId, period = '30d') {
    try {
      const usage = await db.query(`
        SELECT 
          algorithm,
          COUNT(*) as executions,
          SUM(qubits) as total_qubits,
          SUM(cost) as total_cost
        FROM quantum_executions 
        WHERE user_id = ? 
        AND executed_at >= datetime('now', '-30 days')
        GROUP BY algorithm
      `, [userId]);

      return usage || [];
    } catch (error) {
      console.error('Erro ao obter uso quântico:', error);
      return [];
    }
  }

  /**
   * Verificar limites do plano
   */
  async checkPlanLimits(userId) {
    try {
      const usage = await this.getUserQuantumUsage(userId);
      const totalCost = usage.reduce((sum, u) => sum + u.total_cost, 0);
      
      // Limites básicos (podem ser configurados por plano)
      const limits = {
        monthly_cost: 100.00,
        daily_executions: 50,
        max_qubits: 32
      };

      return {
        usage: totalCost,
        limit: limits.monthly_cost,
        remaining: limits.monthly_cost - totalCost,
        withinLimits: totalCost < limits.monthly_cost
      };
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
      return { withinLimits: true };
    }
  }
}

/**
 * Inicializar preços dos algoritmos quânticos
 */
async function initializeQuantumAlgorithmPricing() {
  try {
    console.log('💰 Inicializando preços dos algoritmos quânticos...');
    
    // Criar tabela se não existir
    await db.query(`
      CREATE TABLE IF NOT EXISTS quantum_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        algorithm TEXT NOT NULL,
        qubits INTEGER NOT NULL,
        iterations INTEGER DEFAULT 1,
        cost REAL NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Preços dos algoritmos quânticos inicializados');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar preços quânticos:', error);
    return false;
  }
}

const quantumBillingService = new QuantumBillingService();

module.exports = {
  QuantumBillingService,
  quantumBillingService,
  initializeQuantumAlgorithmPricing
};
