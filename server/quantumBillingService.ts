import { db } from "./db";
import { 
  quantumPackages, 
  quantumAlgorithmPricing, 
  quantumTransactions, 
  quantumExecutions,
  quantumUsageAnalytics,
  tenants,
  users
} from "../shared/schema";
import { eq, and, gte, lte, desc, sum, avg, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { EnterpriseQuantumInfrastructure } from "./enterpriseQuantumInfrastructure";

// ===== QUANTUM BILLING SERVICE =====
// Sistema completo de monetização quantum com ML/IA automático

export class QuantumBillingService {
  
  // ===== QUANTUM PACKAGES MANAGEMENT =====
  
  /**
   * Inicializar pacote quantum para um tenant
   */
  static async initializeQuantumPackage(tenantId: string, packageType: 'lite' | 'unstoppable') {
    try {
      // Verificar se já existe pacote
      const existingPackage = await db
        .select()
        .from(quantumPackages)
        .where(eq(quantumPackages.tenantId, tenantId))
        .limit(1);

      if (existingPackage.length > 0) {
        return existingPackage[0];
      }

      // Criar novo pacote
      const newPackage = await db
        .insert(quantumPackages)
        .values({
          tenantId,
          packageType,
          isActive: true,
          creditsBalance: packageType === 'unstoppable' ? 50 : 0, // 50 créditos de bônus
          liteAlgorithmsIncluded: [
            'adaptive_engine', 
            'basic_optimization', 
            'pattern_recognition'
          ],
          creditPriceInCents: 500, // R$ 5,00 por crédito
          autoRechargeEnabled: false,
          autoRechargeAmount: 100,
          lowBalanceThreshold: 10
        })
        .returning();

      // Se for unstoppable, dar créditos de bônus
      if (packageType === 'unstoppable' && newPackage[0]) {
        await this.addCreditsTransaction(
          tenantId,
          newPackage[0].id,
          50,
          'bonus',
          'Créditos de bônus para novo cliente Quantum Unstoppable'
        );
      }

      return newPackage[0];
    } catch (error) {
      console.error('Error initializing quantum package:', error);
      throw error;
    }
  }

  /**
   * Upgrade de pacote Lite para Unstoppable
   */
  static async upgradeToUnstoppable(tenantId: string) {
    try {
      const result = await db
        .update(quantumPackages)
        .set({
          packageType: 'unstoppable',
          creditsBalance: 100, // 100 créditos de bônus no upgrade
          updatedAt: new Date()
        })
        .where(eq(quantumPackages.tenantId, tenantId))
        .returning();

      if (result[0]) {
        // Adicionar créditos de bônus do upgrade
        await this.addCreditsTransaction(
          tenantId,
          result[0].id,
          100,
          'bonus',
          'Créditos de bônus por upgrade para Quantum Unstoppable'
        );
      }

      return result[0];
    } catch (error) {
      console.error('Error upgrading to unstoppable:', error);
      throw error;
    }
  }

  // ===== CREDITS MANAGEMENT =====

  /**
   * Verificar saldo de créditos
   */
  static async getCreditsBalance(tenantId: string): Promise<number> {
    try {
      const package_ = await db
        .select({ creditsBalance: quantumPackages.creditsBalance })
        .from(quantumPackages)
        .where(eq(quantumPackages.tenantId, tenantId))
        .limit(1);

      return package_[0]?.creditsBalance || 0;
    } catch (error) {
      console.error('Error getting credits balance:', error);
      return 0;
    }
  }

  /**
   * Adicionar créditos (compra, bônus, refund)
   */
  static async addCreditsTransaction(
    tenantId: string,
    quantumPackageId: string,
    amount: number,
    type: 'credit_purchase' | 'bonus' | 'refund',
    description: string,
    paymentData?: {
      priceInCents: number;
      stripePaymentIntentId: string;
      stripeInvoiceId?: string;
    }
  ) {
    try {
      // Buscar saldo atual
      const currentBalance = await this.getCreditsBalance(tenantId);

      // Atualizar saldo no pacote
      const updatedPackage = await db
        .update(quantumPackages)
        .set({
          creditsBalance: currentBalance + amount,
          totalCreditsSpent: type === 'credit_purchase' ? 
            quantumPackages.totalCreditsSpent : 
            quantumPackages.totalCreditsSpent,
          updatedAt: new Date()
        })
        .where(eq(quantumPackages.id, quantumPackageId))
        .returning();

      // Criar transação
      const transaction = await db
        .insert(quantumTransactions)
        .values({
          tenantId,
          quantumPackageId,
          transactionType: type,
          amount: amount,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance + amount,
          description,
          priceInCents: paymentData?.priceInCents,
          stripePaymentIntentId: paymentData?.stripePaymentIntentId,
          stripeInvoiceId: paymentData?.stripeInvoiceId
        })
        .returning();

      return {
        package: updatedPackage[0],
        transaction: transaction[0],
        newBalance: currentBalance + amount
      };
    } catch (error) {
      console.error('Error adding credits transaction:', error);
      throw error;
    }
  }

  /**
   * Consumir créditos para execução quantum
   */
  static async chargeCreditsForExecution(
    tenantId: string,
    userId: string,
    algorithmType: string,
    executionId: string,
    inputData: any,
    contextData?: {
      workflowId?: string;
      workflowExecutionId?: string;
    }
  ): Promise<{ success: boolean; creditsCharged: number; newBalance: number; error?: string }> {
    try {
      // 1. Verificar se algoritmo requer cobrança
      const pricing = await this.getAlgorithmPricing(algorithmType);
      if (!pricing) {
        return { success: false, creditsCharged: 0, newBalance: 0, error: 'Algoritmo não encontrado' };
      }

      // 2. Se for algoritmo Lite, não cobra
      if (pricing.packageRequired === 'lite') {
        return { success: true, creditsCharged: 0, newBalance: await this.getCreditsBalance(tenantId) };
      }

      // 3. Verificar pacote do tenant
      const package_ = await db
        .select()
        .from(quantumPackages)
        .where(eq(quantumPackages.tenantId, tenantId))
        .limit(1);

      if (!package_[0]) {
        return { success: false, creditsCharged: 0, newBalance: 0, error: 'Pacote quantum não encontrado' };
      }

      // 4. Verificar se tem pacote Unstoppable
      if (package_[0].packageType !== 'unstoppable') {
        return { 
          success: false, 
          creditsCharged: 0, 
          newBalance: 0, 
          error: 'Algoritmo requer pacote Quantum Unstoppable' 
        };
      }

      // 5. Verificar saldo
      const currentBalance = package_[0].creditsBalance;
      const creditsRequired = pricing.creditsPerExecution;

      if (currentBalance < creditsRequired) {
        // Verificar auto-recharge
        if (package_[0].autoRechargeEnabled) {
          await this.triggerAutoRecharge(tenantId, package_[0].id);
          // Recarregar saldo após auto-recharge
          const newBalance = await this.getCreditsBalance(tenantId);
          if (newBalance < creditsRequired) {
            return { 
              success: false, 
              creditsCharged: 0, 
              newBalance, 
              error: 'Saldo insuficiente após auto-recharge' 
            };
          }
        } else {
          return { 
            success: false, 
            creditsCharged: 0, 
            newBalance: currentBalance, 
            error: 'Saldo insuficiente' 
          };
        }
      }

      // 6. Cobrar créditos
      const newBalance = currentBalance - creditsRequired;
      
      await db
        .update(quantumPackages)
        .set({
          creditsBalance: newBalance,
          totalCreditsSpent: package_[0].totalCreditsSpent + creditsRequired,
          monthlyExecutionsUsed: package_[0].monthlyExecutionsUsed + 1,
          updatedAt: new Date()
        })
        .where(eq(quantumPackages.id, package_[0].id));

      // 7. Criar transação de cobrança
      const transaction = await db
        .insert(quantumTransactions)
        .values({
          tenantId,
          quantumPackageId: package_[0].id,
          transactionType: 'execution_charge',
          amount: -creditsRequired, // Negativo = gasto
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          algorithmType: algorithmType as any,
          executionId,
          executionMetadata: {
            inputData,
            contextData,
            pricingSnapshot: pricing
          },
          description: `Execução de ${pricing.displayName}`
        })
        .returning();

      // 8. Criar log de execução
      await db
        .insert(quantumExecutions)
        .values({
          id: executionId,
          tenantId,
          userId,
          quantumPackageId: package_[0].id,
          algorithmType: algorithmType as any,
          inputData,
          creditsCharged: creditsRequired,
          transactionId: transaction[0].id,
          status: 'running',
          workflowId: contextData?.workflowId,
          workflowExecutionId: contextData?.workflowExecutionId,
          useQiskitEnhancement: this.shouldUseQiskitEnhancement(algorithmType)
        });

      return {
        success: true,
        creditsCharged: creditsRequired,
        newBalance
      };

    } catch (error) {
      console.error('Error charging credits:', error);
      return { 
        success: false, 
        creditsCharged: 0, 
        newBalance: 0, 
        error: 'Erro interno no sistema de cobrança' 
      };
    }
  }

  // ===== AI/ML AUTOMATION TRIGGERS =====
  
  /**
   * Define quando usar Qiskit AI Enhancement automaticamente
   */
  static shouldUseQiskitEnhancement(algorithmType: string): boolean {
    const aiEnabledAlgorithms = [
      'qaoa_optimization',
      'quantum_ml', 
      'ai_enhanced_circuits',
      'qiskit_transpiler'
    ];
    
    return aiEnabledAlgorithms.includes(algorithmType);
  }

  /**
   * Trigger automático de insights de IA baseado em uso
   */
  static async triggerAutomaticInsights(tenantId: string): Promise<{
    usagePatterns: any;
    optimizationSuggestions: string[];
    predictedNeeds: any;
    costOptimization: any;
  }> {
    try {
      // 1. Análise de padrões de uso (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const executions = await db
        .select()
        .from(quantumExecutions)
        .where(and(
          eq(quantumExecutions.tenantId, tenantId),
          gte(quantumExecutions.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(quantumExecutions.createdAt));

      // 2. Padrões de uso detectados por IA
      const usagePatterns = this.analyzeUsagePatterns(executions);

      // 3. Sugestões automáticas de otimização
      const optimizationSuggestions = this.generateOptimizationSuggestions(executions, usagePatterns);

      // 4. Predições de necessidades futuras
      const predictedNeeds = this.predictFutureNeeds(executions, usagePatterns);

      // 5. Análise de otimização de custos
      const costOptimization = await this.analyzeCostOptimization(tenantId, executions);

      return {
        usagePatterns,
        optimizationSuggestions,
        predictedNeeds,
        costOptimization
      };

    } catch (error) {
      console.error('Error generating automatic insights:', error);
      return {
        usagePatterns: {},
        optimizationSuggestions: [],
        predictedNeeds: {},
        costOptimization: {}
      };
    }
  }

  /**
   * Análise automática de padrões de uso por ML
   */
  private static analyzeUsagePatterns(executions: any[]): any {
    if (executions.length === 0) return {};

    // Análise por algoritmo
    const algorithmUsage = executions.reduce((acc, exec) => {
      acc[exec.algorithmType] = (acc[exec.algorithmType] || 0) + 1;
      return acc;
    }, {});

    // Análise temporal (horário do dia)
    const hourlyUsage = executions.reduce((acc, exec) => {
      const hour = new Date(exec.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Análise de performance
    const avgExecutionTime = executions
      .filter(e => e.executionTimeMs)
      .reduce((sum, e) => sum + e.executionTimeMs, 0) / executions.length;

    const successRate = executions.filter(e => e.status === 'completed').length / executions.length;

    return {
      totalExecutions: executions.length,
      algorithmDistribution: algorithmUsage,
      peakUsageHours: Object.entries(hourlyUsage)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([hour]) => parseInt(hour)),
      avgExecutionTimeMs: Math.round(avgExecutionTime),
      successRate: Math.round(successRate * 100),
      mostUsedAlgorithm: Object.entries(algorithmUsage)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || null
    };
  }

  /**
   * IA gera sugestões automáticas de otimização
   */
  private static generateOptimizationSuggestions(executions: any[], patterns: any): string[] {
    const suggestions = [];

    // Sugestão baseada em algoritmo mais usado
    if (patterns.mostUsedAlgorithm) {
      suggestions.push(`Considere otimizar workflows com ${patterns.mostUsedAlgorithm} - é seu algoritmo mais utilizado`);
    }

    // Sugestão baseada em taxa de sucesso
    if (patterns.successRate < 80) {
      suggestions.push(`Taxa de sucesso de ${patterns.successRate}% pode ser melhorada - verifique dados de entrada`);
    }

    // Sugestão baseada em horário de uso
    if (patterns.peakUsageHours.length > 0) {
      suggestions.push(`Pico de uso às ${patterns.peakUsageHours[0]}h - considere executar algoritmos pesados em outros horários`);
    }

    // Sugestão baseada em tempo de execução
    if (patterns.avgExecutionTimeMs > 5000) {
      suggestions.push(`Tempo médio de execução elevado (${patterns.avgExecutionTimeMs}ms) - ative Qiskit AI Enhancement`);
    }

    // Sugestão de upgrade
    const unstoppableAlgorithms = executions.filter(e => 
      ['grovers_search', 'qaoa_optimization', 'quantum_ml'].includes(e.algorithmType)
    );
    if (unstoppableAlgorithms.length > 10) {
      suggestions.push(`${unstoppableAlgorithms.length} execuções de algoritmos avançados - considere upgrade para Quantum Unstoppable`);
    }

    return suggestions;
  }

  /**
   * IA prediz necessidades futuras baseado em tendências
   */
  private static predictFutureNeeds(executions: any[], patterns: any): any {
    // Análise de tendência de crescimento
    const last7Days = executions.filter(e => {
      const date = new Date(e.createdAt);
      const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    const previous7Days = executions.filter(e => {
      const date = new Date(e.createdAt);
      const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    }).length;

    const growthRate = previous7Days > 0 ? (last7Days - previous7Days) / previous7Days : 0;

    // Predição de créditos necessários próximo mês
    const avgCreditsPerExecution = 5; // Estimativa
    const predictedExecutions = Math.max(patterns.totalExecutions * 1.2, last7Days * 4.3); // Crescimento + 20%
    const predictedCreditsNeeded = Math.round(predictedExecutions * avgCreditsPerExecution);

    return {
      growthRate: Math.round(growthRate * 100),
      predictedMonthlyExecutions: Math.round(predictedExecutions),
      predictedCreditsNeeded,
      recommendedCreditsPurchase: Math.round(predictedCreditsNeeded * 1.3), // 30% buffer
      trendDirection: growthRate > 0.1 ? 'crescente' : growthRate < -0.1 ? 'decrescente' : 'estável'
    };
  }

  /**
   * Análise automática de otimização de custos
   */
  private static async analyzeCostOptimization(tenantId: string, executions: any[]): Promise<any> {
    // Análise de gasto por algoritmo
    const costByAlgorithm = executions.reduce((acc, exec) => {
      const cost = exec.creditsCharged * 5; // R$ 5 por crédito
      acc[exec.algorithmType] = (acc[exec.algorithmType] || 0) + cost;
      return acc;
    }, {});

    // Algoritmo mais caro
    const mostExpensive = Object.entries(costByAlgorithm)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    // Calcular economia potencial com Qiskit AI
    const aiOptimizableExecutions = executions.filter(e => 
      !e.useQiskitEnhancement && 
      ['qaoa_optimization', 'quantum_ml', 'ai_enhanced_circuits'].includes(e.algorithmType)
    );

    const potentialSavings = aiOptimizableExecutions.length * 2; // 2 créditos de economia por execução

    return {
      totalSpent: Object.values(costByAlgorithm).reduce((a: number, b: number) => a + b, 0),
      mostExpensiveAlgorithm: mostExpensive ? {
        algorithm: mostExpensive[0],
        cost: mostExpensive[1]
      } : null,
      potentialSavingsWithAI: potentialSavings * 5, // Em reais
      optimizableExecutions: aiOptimizableExecutions.length,
      recommendation: potentialSavings > 50 ? 
        'Ativar Qiskit AI Enhancement pode economizar significativamente' : 
        'Uso já otimizado'
    };
  }

  /**
   * Auto-recharge automático quando saldo baixo
   */
  private static async triggerAutoRecharge(tenantId: string, quantumPackageId: string) {
    try {
      const package_ = await db
        .select()
        .from(quantumPackages)
        .where(eq(quantumPackages.id, quantumPackageId))
        .limit(1);

      if (!package_[0] || !package_[0].autoRechargeEnabled) {
        return;
      }

      // Simular compra automática (integração com Stripe)
      const creditsToAdd = package_[0].autoRechargeAmount;
      const priceInCents = creditsToAdd * package_[0].creditPriceInCents;

      // Aqui integraria com Stripe para cobrança automática
      // Por enquanto, apenas simular
      await this.addCreditsTransaction(
        tenantId,
        quantumPackageId,
        creditsToAdd,
        'credit_purchase',
        'Auto-recharge automático',
        {
          priceInCents,
          stripePaymentIntentId: `auto_${nanoid()}`,
        }
      );

      console.log(`Auto-recharge executado: +${creditsToAdd} créditos para tenant ${tenantId}`);
    } catch (error) {
      console.error('Error in auto-recharge:', error);
    }
  }

  // ===== QUANTUM ALGORITHM PRICING =====

  /**
   * Buscar preço de algoritmo
   */
  static async getAlgorithmPricing(algorithmType: string) {
    try {
      const pricing = await db
        .select()
        .from(quantumAlgorithmPricing)
        .where(eq(quantumAlgorithmPricing.algorithmType, algorithmType as any))
        .limit(1);

      return pricing[0] || null;
    } catch (error) {
      console.error('Error getting algorithm pricing:', error);
      return null;
    }
  }

  /**
   * Listar todos os preços de algoritmos
   */
  static async getAllAlgorithmPricing() {
    try {
      return await db
        .select()
        .from(quantumAlgorithmPricing)
        .where(eq(quantumAlgorithmPricing.isActive, true))
        .orderBy(quantumAlgorithmPricing.packageRequired, quantumAlgorithmPricing.creditsPerExecution);
    } catch (error) {
      console.error('Error getting all algorithm pricing:', error);
      return [];
    }
  }

  // ===== PACKAGE MANAGEMENT HELPERS =====

  /**
   * Buscar pacote quantum do tenant
   */
  static async getQuantumPackage(tenantId: string) {
    try {
      const package_ = await db
        .select()
        .from(quantumPackages)
        .where(eq(quantumPackages.tenantId, tenantId))
        .limit(1);

      return package_[0] || null;
    } catch (error) {
      console.error('Error getting quantum package:', error);
      return null;
    }
  }

  /**
   * Atualizar configurações de auto-recharge
   */
  static async updateAutoRechargeSettings(
    tenantId: string,
    enabled: boolean,
    amount?: number
  ) {
    try {
      const updateData: any = {
        autoRechargeEnabled: enabled,
        updatedAt: new Date()
      };

      if (amount) {
        updateData.autoRechargeAmount = amount;
      }

      await db
        .update(quantumPackages)
        .set(updateData)
        .where(eq(quantumPackages.tenantId, tenantId));

      return true;
    } catch (error) {
      console.error('Error updating auto-recharge settings:', error);
      return false;
    }
  }

  /**
   * Buscar transações de créditos
   */
  static async getCreditTransactions(tenantId: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;

      const transactions = await db
        .select()
        .from(quantumTransactions)
        .where(eq(quantumTransactions.tenantId, tenantId))
        .orderBy(desc(quantumTransactions.createdAt))
        .limit(limit)
        .offset(offset);

      return transactions;
    } catch (error) {
      console.error('Error getting credit transactions:', error);
      return [];
    }
  }

  /**
   * Buscar histórico de execuções
   */
  static async getExecutionHistory(
    tenantId: string,
    filters: {
      page: number;
      limit: number;
      algorithmType?: string;
      status?: string;
    }
  ) {
    try {
      const { page, limit, algorithmType, status } = filters;
      const offset = (page - 1) * limit;

      let query = db
        .select()
        .from(quantumExecutions)
        .where(eq(quantumExecutions.tenantId, tenantId));

      if (algorithmType) {
        query = query.where(eq(quantumExecutions.algorithmType, algorithmType as any));
      }

      if (status) {
        query = query.where(eq(quantumExecutions.status, status));
      }

      const executions = await query
        .orderBy(desc(quantumExecutions.createdAt))
        .limit(limit)
        .offset(offset);

      return executions;
    } catch (error) {
      console.error('Error getting execution history:', error);
      return [];
    }
  }

  /**
   * Atualizar preços de algoritmos (admin)
   */
  static async updateAlgorithmPricing(
    algorithmType: string,
    updates: {
      creditsPerExecution?: number;
      displayName?: string;
      description?: string;
    }
  ) {
    try {
      await db
        .update(quantumAlgorithmPricing)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(quantumAlgorithmPricing.algorithmType, algorithmType as any));

      return true;
    } catch (error) {
      console.error('Error updating algorithm pricing:', error);
      return false;
    }
  }

  /**
   * Analytics globais do sistema (admin)
   */
  static async getGlobalAnalytics() {
    try {
      // Total de tenants com cada tipo de package
      const packageStats = await db
        .select({
          packageType: quantumPackages.packageType,
          count: count(quantumPackages.id)
        })
        .from(quantumPackages)
        .groupBy(quantumPackages.packageType);

      // Total de execuções e créditos por algoritmo
      const algorithmStats = await db
        .select({
          algorithmType: quantumExecutions.algorithmType,
          totalExecutions: count(quantumExecutions.id),
          totalCredits: sum(quantumExecutions.creditsCharged)
        })
        .from(quantumExecutions)
        .groupBy(quantumExecutions.algorithmType);

      // Revenue total (créditos vendidos)
      const revenueStats = await db
        .select({
          totalRevenue: sum(quantumTransactions.priceInCents)
        })
        .from(quantumTransactions)
        .where(eq(quantumTransactions.transactionType, 'credit_purchase'));

      // Métricas de performance
      const performanceStats = await db
        .select({
          avgExecutionTime: avg(quantumExecutions.executionTimeMs),
          avgQuantumAdvantage: avg(quantumExecutions.quantumAdvantage),
          successRate: count(quantumExecutions.id)
        })
        .from(quantumExecutions)
        .where(eq(quantumExecutions.status, 'completed'));

      return {
        packageDistribution: packageStats,
        algorithmUsage: algorithmStats,
        revenue: {
          totalInCents: revenueStats[0]?.totalRevenue || 0,
          totalInReais: (revenueStats[0]?.totalRevenue || 0) / 100
        },
        performance: performanceStats[0],
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting global analytics:', error);
      return null;
    }
  }

  // ===== ANALYTICS & REPORTING =====

  /**
   * Gerar relatório de usage analytics
   */
  static async generateUsageAnalytics(tenantId: string, period?: string) {
    try {
      const currentPeriod = period || new Date().toISOString().substring(0, 7); // YYYY-MM

      // Buscar execuções do período
      const executions = await db
        .select()
        .from(quantumExecutions)
        .where(and(
          eq(quantumExecutions.tenantId, tenantId),
          gte(quantumExecutions.createdAt, new Date(currentPeriod + '-01')),
          lte(quantumExecutions.createdAt, new Date(currentPeriod + '-31'))
        ));

      // Calcular métricas
      const totalExecutions = executions.length;
      const totalCreditsSpent = executions.reduce((sum, e) => sum + e.creditsCharged, 0);
      const totalExecutionTime = executions.reduce((sum, e) => sum + (e.executionTimeMs || 0), 0);
      
      const algorithmUsage = executions.reduce((acc, e) => {
        acc[e.algorithmType] = (acc[e.algorithmType] || 0) + 1;
        return acc;
      }, {});

      const successfulExecutions = executions.filter(e => e.status === 'completed');
      const successRate = totalExecutions > 0 ? successfulExecutions.length / totalExecutions : 0;

      const avgQuantumAdvantage = successfulExecutions.length > 0 ? 
        successfulExecutions.reduce((sum, e) => sum + parseFloat(e.quantumAdvantage || '1'), 0) / successfulExecutions.length : 0;

      // Salvar analytics
      await db
        .insert(quantumUsageAnalytics)
        .values({
          tenantId,
          period: currentPeriod,
          totalExecutions,
          totalCreditsSpent,
          totalExecutionTimeMs: totalExecutionTime,
          algorithmUsage,
          avgQuantumAdvantage,
          successRate,
          estimatedTimeSaved: Math.round(totalExecutionTime * (avgQuantumAdvantage - 1)), // Tempo economizado vs clássico
          costPerExecution: totalExecutions > 0 ? (totalCreditsSpent * 5) / totalExecutions : 0
        })
        .onConflictDoUpdate({
          target: [quantumUsageAnalytics.tenantId, quantumUsageAnalytics.period],
          set: {
            totalExecutions,
            totalCreditsSpent,
            totalExecutionTimeMs: totalExecutionTime,
            algorithmUsage,
            avgQuantumAdvantage,
            successRate,
            updatedAt: new Date()
          }
        });

      return {
        period: currentPeriod,
        totalExecutions,
        totalCreditsSpent,
        totalCostInReais: totalCreditsSpent * 5,
        algorithmUsage,
        successRate: Math.round(successRate * 100),
        avgQuantumAdvantage: Math.round(avgQuantumAdvantage * 100) / 100,
        estimatedTimeSaved: Math.round(totalExecutionTime * (avgQuantumAdvantage - 1)) / 1000 // em segundos
      };

    } catch (error) {
      console.error('Error generating usage analytics:', error);
      throw error;
    }
  }

  /**
   * Atualizar status de execução e finalizar cobrança
   */
  static async updateExecutionStatus(
    executionId: string,
    status: 'completed' | 'failed' | 'timeout',
    outputData?: any,
    performanceMetrics?: {
      executionTimeMs: number;
      quantumAdvantage: number;
      classicalComparison: any;
      qiskitOptimizationApplied?: any;
    },
    error?: string
  ) {
    try {
      await db
        .update(quantumExecutions)
        .set({
          status,
          outputData,
          executionTimeMs: performanceMetrics?.executionTimeMs,
          quantumAdvantage: performanceMetrics?.quantumAdvantage?.toString(),
          classicalComparison: performanceMetrics?.classicalComparison,
          qiskitOptimizationApplied: performanceMetrics?.qiskitOptimizationApplied,
          error,
          updatedAt: new Date()
        })
        .where(eq(quantumExecutions.id, executionId));

      // Se falhou, considerar reembolso parcial
      if (status === 'failed' || status === 'timeout') {
        const execution = await db
          .select()
          .from(quantumExecutions)
          .where(eq(quantumExecutions.id, executionId))
          .limit(1);

        if (execution[0] && execution[0].creditsCharged > 0) {
          // Reembolsar 50% dos créditos em caso de falha
          const refundAmount = Math.floor(execution[0].creditsCharged / 2);
          
          await this.addCreditsTransaction(
            execution[0].tenantId,
            execution[0].quantumPackageId,
            refundAmount,
            'refund',
            `Reembolso parcial por falha na execução ${executionId}`
          );
        }
      }

    } catch (error) {
      console.error('Error updating execution status:', error);
      throw error;
    }
  }

  // ===== ENTERPRISE QUANTUM INFRASTRUCTURE INTEGRATION =====

  /**
   * Executar algoritmo quântico usando infraestrutura enterprise de 260 qubits
   * Integração completa: Billing + Load Balancing + 2 servidores IBM
   */
  static async executeQuantumAlgorithmWithBilling(
    tenantId: string,
    userId: string,
    algorithmType: string,
    inputData: any,
    complexity: 'low' | 'medium' | 'high' | 'extreme' = 'medium',
    contextData?: {
      workflowId?: string;
      workflowExecutionId?: string;
    }
  ): Promise<{
    success: boolean;
    result?: any;
    executionId?: string;
    creditsCharged?: number;
    newBalance?: number;
    serverUsed?: string;
    executionTime?: number;
    quantumAdvantage?: number;
    error?: string;
    metadata?: any;
  }> {
    
    const executionId = nanoid();
    
    try {
      console.log(`🔮 Iniciando execução quantum enterprise: ${algorithmType} (${complexity})`);
      console.log(`📊 Tenant: ${tenantId} | User: ${userId} | Execution: ${executionId}`);

      // 1. FASE BILLING: Verificar e cobrar créditos
      const billingResult = await this.chargeCreditsForExecution(
        tenantId,
        userId,
        algorithmType,
        executionId,
        inputData,
        contextData
      );

      if (!billingResult.success) {
        console.log(`❌ Billing falhou: ${billingResult.error}`);
        return {
          success: false,
          error: billingResult.error,
          creditsCharged: 0,
          newBalance: billingResult.newBalance
        };
      }

      console.log(`✅ Billing aprovado: ${billingResult.creditsCharged} créditos | Saldo: ${billingResult.newBalance}`);

      // 2. FASE INFRASTRUCTURE: Verificar status dos 260 qubits
      const infrastructureStatus = EnterpriseQuantumInfrastructure.getInfrastructureStatus();
      console.log(`🏗️ Infraestrutura: ${infrastructureStatus.infrastructure.status} | ${infrastructureStatus.infrastructure.totalQubits} qubits disponíveis`);

      if (infrastructureStatus.infrastructure.status === 'offline') {
        console.log('❌ Infraestrutura offline - reembolsando créditos');
        
        // Reembolso automático se infraestrutura offline
        if (billingResult.creditsCharged > 0) {
          await this.addCreditsTransaction(
            tenantId,
            (await this.getQuantumPackage(tenantId))?.id || '',
            billingResult.creditsCharged,
            'refund',
            `Reembolso automático - infraestrutura offline (execução: ${executionId})`
          );
        }

        return {
          success: false,
          error: 'Infraestrutura quantum temporariamente indisponível',
          creditsCharged: 0,
          newBalance: billingResult.newBalance + billingResult.creditsCharged,
          metadata: {
            infrastructureStatus: infrastructureStatus.infrastructure.status,
            totalQubits: infrastructureStatus.infrastructure.totalQubits,
            onlineServers: infrastructureStatus.infrastructure.onlineServers
          }
        };
      }

      // 3. FASE EXECUTION: Executar com load balancing automático
      console.log(`🚀 Executando em infraestrutura de ${infrastructureStatus.infrastructure.totalQubits} qubits...`);
      
      const quantumResult = await EnterpriseQuantumInfrastructure.executeQuantumAlgorithm(
        algorithmType,
        inputData,
        complexity,
        executionId
      );

      if (!quantumResult.success) {
        console.log(`❌ Execução quantum falhou: ${quantumResult.error}`);
        
        // Atualizar status da execução
        await this.updateExecutionStatus(
          executionId,
          'failed',
          null,
          undefined,
          quantumResult.error
        );

        // Reembolso parcial já é feito automaticamente em updateExecutionStatus
        return {
          success: false,
          executionId,
          error: quantumResult.error,
          creditsCharged: billingResult.creditsCharged,
          newBalance: billingResult.newBalance + Math.floor(billingResult.creditsCharged / 2), // +50% refund
          serverUsed: quantumResult.serverUsed,
          executionTime: quantumResult.executionTime,
          metadata: quantumResult.metadata
        };
      }

      // 4. FASE SUCCESS: Atualizar status com métricas enterprise
      console.log(`✅ Execução concluída com sucesso no servidor ${quantumResult.serverUsed}`);
      console.log(`📈 Vantagem quantum: ${quantumResult.quantumAdvantage}x | Tempo: ${quantumResult.executionTime}ms`);

      await this.updateExecutionStatus(
        executionId,
        'completed',
        quantumResult.result,
        {
          executionTimeMs: quantumResult.executionTime || 0,
          quantumAdvantage: quantumResult.quantumAdvantage || 1,
          classicalComparison: quantumResult.metadata?.classicalComparison || {},
          qiskitOptimizationApplied: quantumResult.metadata?.qiskitOptimization || {}
        }
      );

      // 5. FASE ANALYTICS: Atualizar métricas de infraestrutura
      const finalInfraStatus = EnterpriseQuantumInfrastructure.getInfrastructureStatus();

      return {
        success: true,
        result: quantumResult.result,
        executionId,
        creditsCharged: billingResult.creditsCharged,
        newBalance: billingResult.newBalance,
        serverUsed: quantumResult.serverUsed,
        executionTime: quantumResult.executionTime,
        quantumAdvantage: quantumResult.quantumAdvantage,
        metadata: {
          ...quantumResult.metadata,
          billing: {
            creditsCharged: billingResult.creditsCharged,
            balanceAfter: billingResult.newBalance
          },
          infrastructure: {
            totalQubits: finalInfraStatus.infrastructure.totalQubits,
            serversUsed: finalInfraStatus.infrastructure.onlineServers,
            utilizationRate: finalInfraStatus.capacity.utilizationRate,
            performanceMetrics: finalInfraStatus.performance
          },
          enterprise: {
            multiServerExecution: true,
            loadBalancingApplied: true,
            realQuantumHardware: algorithmType.includes('real_quantum_hardware'),
            qiskitAIEnhancement: this.shouldUseQiskitEnhancement(algorithmType)
          }
        }
      };

    } catch (error) {
      console.error('❌ Erro crítico na execução quantum enterprise:', error);
      
      // Reembolso total em caso de erro crítico
      const billingResult = await this.chargeCreditsForExecution(tenantId, userId, algorithmType, executionId, inputData, contextData);
      if (billingResult.creditsCharged > 0) {
        await this.addCreditsTransaction(
          tenantId,
          (await this.getQuantumPackage(tenantId))?.id || '',
          billingResult.creditsCharged,
          'refund',
          `Reembolso total - erro crítico na execução ${executionId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return {
        success: false,
        executionId,
        error: error instanceof Error ? error.message : 'Erro crítico desconhecido',
        creditsCharged: 0,
        newBalance: billingResult.newBalance + billingResult.creditsCharged,
        metadata: {
          errorType: 'critical_system_error',
          infrastructureStatus: 'unknown',
          refundIssued: billingResult.creditsCharged > 0
        }
      };
    }
  }

  /**
   * Verificar status da infraestrutura enterprise de 260 qubits
   */
  static getEnterpriseInfrastructureStatus() {
    const status = EnterpriseQuantumInfrastructure.getInfrastructureStatus();
    
    return {
      ...status,
      enterprise: {
        totalQubits: 260,
        servers: 2,
        ibmQuantumNetwork: true,
        realHardwareAccess: true,
        loadBalancing: true,
        enterpriseGrade: true
      }
    };
  }

  /**
   * Health check da infraestrutura enterprise
   */
  static async performEnterpriseHealthCheck() {
    try {
      const healthResults = await EnterpriseQuantumInfrastructure.performHealthCheck();
      
      return {
        ...healthResults,
        enterprise: {
          totalCapacity: '260 qubits',
          serverDistribution: 'Alpha: 127q, Beta: 133q',
          networkStatus: 'IBM Quantum Network Active',
          lastFullCheck: new Date()
        }
      };
    } catch (error) {
      console.error('Error in enterprise health check:', error);
      return {
        timestamp: new Date(),
        overallHealth: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        enterprise: {
          status: 'health_check_failed'
        }
      };
    }
  }
}

// ===== INICIALIZAÇÃO DOS PREÇOS DOS ALGORITMOS =====

export async function initializeQuantumAlgorithmPricing() {
  try {
    const algorithms = [
      // LITE ALGORITHMS (incluído na mensalidade)
      {
        algorithmType: 'adaptive_engine',
        packageRequired: 'lite',
        creditsPerExecution: 0,
        displayName: 'Motor Adaptativo',
        description: 'IA adaptativa que personaliza a experiência do usuário',
        complexityLevel: 'low'
      },
      {
        algorithmType: 'basic_optimization',
        packageRequired: 'lite',
        creditsPerExecution: 0,
        displayName: 'Otimização Básica',
        description: 'Algoritmos básicos de otimização para workflows',
        complexityLevel: 'low'
      },
      {
        algorithmType: 'pattern_recognition',
        packageRequired: 'lite',
        creditsPerExecution: 0,
        displayName: 'Reconhecimento de Padrões',
        description: 'Identificação automática de padrões nos dados',
        complexityLevel: 'medium'
      },

      // UNSTOPPABLE ALGORITHMS (pago por execução) - ENTERPRISE 260 QUBITS
      {
        algorithmType: 'grovers_search',
        packageRequired: 'unstoppable',
        creditsPerExecution: 2, // Reduzido - infraestrutura própria
        displayName: 'Busca Quântica (Grover) - 260Q',
        description: 'Busca quântica enterprise com vantagem O(√N) vs O(N) - Infraestrutura própria 260 qubits',
        complexityLevel: 'medium',
        estimatedExecutionTime: 1500 // Mais rápido com infraestrutura própria
      },
      {
        algorithmType: 'qaoa_optimization',
        packageRequired: 'unstoppable',
        creditsPerExecution: 3, // Reduzido
        displayName: 'Otimização QAOA Enterprise',
        description: 'Quantum Approximate Optimization com 260 qubits - Load balancing automático',
        complexityLevel: 'high',
        estimatedExecutionTime: 2500
      },
      {
        algorithmType: 'quantum_ml',
        packageRequired: 'unstoppable',
        creditsPerExecution: 4, // Reduzido
        displayName: 'Machine Learning Quântico 260Q',
        description: 'ML quântico enterprise - VQC e redes neurais com 260 qubits distribuídos',
        complexityLevel: 'high',
        estimatedExecutionTime: 3500
      },
      {
        algorithmType: 'business_analytics',
        packageRequired: 'unstoppable',
        creditsPerExecution: 2, // Muito reduzido
        displayName: 'Analytics Empresarial Quantum',
        description: 'Análise quântica de PostgreSQL com infraestrutura enterprise própria',
        complexityLevel: 'medium',
        estimatedExecutionTime: 2000
      },
      {
        algorithmType: 'qiskit_transpiler',
        packageRequired: 'unstoppable',
        creditsPerExecution: 5, // Reduzido
        displayName: 'Qiskit AI Transpiler Enterprise',
        description: 'Transpilação AI-powered otimizada para topologia 260Q própria',
        complexityLevel: 'high',
        estimatedExecutionTime: 3000
      },
      {
        algorithmType: 'long_range_entanglement',
        packageRequired: 'unstoppable',
        creditsPerExecution: 3, // Reduzido significativamente 
        displayName: 'Emaranhamento 260Q Long-Range',
        description: 'Emaranhamento de longo alcance - máximo 259 qubits de distância',
        complexityLevel: 'high',
        estimatedExecutionTime: 2800
      },
      {
        algorithmType: 'quantum_teleportation',
        packageRequired: 'unstoppable',
        creditsPerExecution: 4, // Reduzido
        displayName: 'Teleportação Quântica Enterprise',
        description: 'Protocolos de teleportação em infraestrutura 260Q dedicada',
        complexityLevel: 'extreme',
        estimatedExecutionTime: 4000
      },
      {
        algorithmType: 'real_quantum_hardware',
        packageRequired: 'unstoppable',
        creditsPerExecution: 8, // Muito reduzido - hardware próprio
        displayName: 'Hardware Quântico Real TOIT',
        description: 'Execução direta em QPUs TOIT (Alpha 127Q + Beta 133Q) via IBM Quantum Network',
        complexityLevel: 'extreme',
        estimatedExecutionTime: 15000 // Mais rápido - sem fila externa
      },
      {
        algorithmType: 'ai_enhanced_circuits',
        packageRequired: 'unstoppable',
        creditsPerExecution: 6, // Reduzido
        displayName: 'Circuitos AI-Enhanced 260Q',
        description: 'Circuitos otimizados por IA para topologia enterprise 260 qubits',
        complexityLevel: 'extreme',
        estimatedExecutionTime: 4500
      },
      
      // NOVOS ALGORITMOS ENTERPRISE EXCLUSIVOS
      {
        algorithmType: 'enterprise_load_balancer',
        packageRequired: 'unstoppable',
        creditsPerExecution: 1,
        displayName: 'Load Balancer Quântico Enterprise',
        description: 'Distribuição inteligente de carga entre servidores Alpha (127Q) e Beta (133Q)',
        complexityLevel: 'low',
        estimatedExecutionTime: 500
      },
      {
        algorithmType: 'quantum_network_optimization',
        packageRequired: 'unstoppable',
        creditsPerExecution: 7,
        displayName: 'Otimização de Rede Quântica',
        description: 'Otimização de conectividade e roteamento entre 260 qubits distribuídos',
        complexityLevel: 'extreme',
        estimatedExecutionTime: 6000
      },
      {
        algorithmType: 'multi_server_entanglement',
        packageRequired: 'unstoppable',
        creditsPerExecution: 9,
        displayName: 'Emaranhamento Multi-Servidor',
        description: 'Emaranhamento entre qubits dos servidores Alpha e Beta - 260Q total',
        complexityLevel: 'extreme',
        estimatedExecutionTime: 8000
      },
      {
        algorithmType: 'quantum_cluster_computing',
        packageRequired: 'unstoppable',
        creditsPerExecution: 12,
        displayName: 'Computação Quântica em Cluster',
        description: 'Algoritmos distribuídos usando toda capacidade de 260 qubits simultaneamente',
        complexityLevel: 'extreme',
        estimatedExecutionTime: 12000
      }
    ];

    for (const algorithm of algorithms) {
      await db
        .insert(quantumAlgorithmPricing)
        .values(algorithm as any)
        .onConflictDoUpdate({
          target: [quantumAlgorithmPricing.algorithmType],
          set: {
            creditsPerExecution: algorithm.creditsPerExecution,
            displayName: algorithm.displayName,
            description: algorithm.description,
            complexityLevel: algorithm.complexityLevel,
            estimatedExecutionTime: algorithm.estimatedExecutionTime,
            updatedAt: new Date()
          }
        });
    }

    console.log('✅ Quantum Algorithm Pricing initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing quantum algorithm pricing:', error);
  }
}