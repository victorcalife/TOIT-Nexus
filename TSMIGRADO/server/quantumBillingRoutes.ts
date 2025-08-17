import { Router } from 'express';
import { z } from 'zod';
import { QuantumBillingService } from './quantumBillingService';
import { nanoid } from 'nanoid';

const router = Router();

// ===== QUANTUM BILLING ROUTES =====
// Sistema completo de monetização quantum

// Validation schemas
const QuantumPackageSchema = z.object({
  packageType: z.enum(['lite', 'unstoppable'])
});

const PurchaseCreditsSchema = z.object({
  amount: z.number().min(10).max(1000), // 10-1000 créditos por compra
  autoRecharge: z.boolean().optional()
});

const ExecutionChargeSchema = z.object({
  algorithmType: z.string(),
  inputData: z.any(),
  workflowId: z.string().optional(),
  workflowExecutionId: z.string().optional()
});

// ===== QUANTUM PACKAGES MANAGEMENT =====

/**
 * GET /api/quantum-billing/package
 * Buscar pacote quantum do tenant
 */
router.get('/package', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const packageInfo = await QuantumBillingService.getQuantumPackage(tenantId);
    
    if (!packageInfo) {
      // Inicializar com pacote Lite por padrão
      const newPackage = await QuantumBillingService.initializeQuantumPackage(tenantId, 'lite');
      return res.json({
        success: true,
        data: newPackage
      });
    }

    res.json({
      success: true,
      data: packageInfo
    });

  } catch (error) {
    console.error('Error getting quantum package:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/quantum-billing/package/upgrade
 * Upgrade para Quantum Unstoppable
 */
router.post('/package/upgrade', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const upgradedPackage = await QuantumBillingService.upgradeToUnstoppable(tenantId);

    res.json({
      success: true,
      data: upgradedPackage,
      message: 'Upgrade realizado com sucesso! Você ganhou 100 créditos de bônus.'
    });

  } catch (error) {
    console.error('Error upgrading package:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao realizar upgrade'
    });
  }
});

// ===== CREDITS MANAGEMENT =====

/**
 * GET /api/quantum-billing/credits/balance
 * Verificar saldo de créditos
 */
router.get('/credits/balance', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const balance = await QuantumBillingService.getCreditsBalance(tenantId);
    const packageInfo = await QuantumBillingService.getQuantumPackage(tenantId);

    res.json({
      success: true,
      data: {
        creditsBalance: balance,
        packageType: packageInfo?.packageType || 'lite',
        autoRechargeEnabled: packageInfo?.autoRechargeEnabled || false,
        lowBalanceThreshold: packageInfo?.lowBalanceThreshold || 10
      }
    });

  } catch (error) {
    console.error('Error getting credits balance:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar saldo'
    });
  }
});

/**
 * POST /api/quantum-billing/credits/purchase
 * Comprar créditos (integração com Stripe)
 */
router.post('/credits/purchase', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { amount, autoRecharge } = PurchaseCreditsSchema.parse(req.body);

    // Validar se tenant tem pacote Unstoppable
    const packageInfo = await QuantumBillingService.getQuantumPackage(tenantId);
    if (!packageInfo || packageInfo.packageType !== 'unstoppable') {
      return res.status(400).json({
        success: false,
        error: 'Compra de créditos disponível apenas para Quantum Unstoppable'
      });
    }

    // Calcular preço
    const priceInCents = amount * packageInfo.creditPriceInCents;
    const priceInReais = priceInCents / 100;

    // Aqui integraria com Stripe para criar Payment Intent
    const stripePaymentIntentId = `pi_quantum_${nanoid()}`;

    // Simular compra bem-sucedida (integração real seria via webhook)
    const result = await QuantumBillingService.addCreditsTransaction(
      tenantId,
      packageInfo.id,
      amount,
      'credit_purchase',
      `Compra de ${amount} créditos quantum`,
      {
        priceInCents,
        stripePaymentIntentId
      }
    );

    // Atualizar auto-recharge se solicitado
    if (autoRecharge !== undefined) {
      await QuantumBillingService.updateAutoRechargeSettings(
        tenantId,
        autoRecharge,
        amount
      );
    }

    res.json({
      success: true,
      data: {
        creditsAdded: amount,
        newBalance: result.newBalance,
        paidAmount: priceInReais,
        transactionId: result.transaction.id
      },
      message: `${amount} créditos adicionados com sucesso!`
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Error purchasing credits:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar compra'
    });
  }
});

/**
 * GET /api/quantum-billing/credits/transactions
 * Histórico de transações de créditos
 */
router.get('/credits/transactions', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { page = 1, limit = 20 } = req.query;

    const transactions = await QuantumBillingService.getCreditTransactions(
      tenantId, 
      parseInt(page as string), 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar transações'
    });
  }
});

// ===== ALGORITHM EXECUTION & CHARGING =====

/**
 * POST /api/quantum-billing/execute/charge
 * Cobrar créditos para execução quantum
 */
router.post('/execute/charge', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { algorithmType, inputData, workflowId, workflowExecutionId } = ExecutionChargeSchema.parse(req.body);

    const executionId = nanoid();

    const result = await QuantumBillingService.chargeCreditsForExecution(
      tenantId,
      userId,
      algorithmType,
      executionId,
      inputData,
      { workflowId, workflowExecutionId }
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: result.error === 'Saldo insuficiente' ? 'INSUFFICIENT_CREDITS' : 
               result.error === 'Algoritmo requer pacote Quantum Unstoppable' ? 'UPGRADE_REQUIRED' :
               'EXECUTION_ERROR'
      });
    }

    res.json({
      success: true,
      data: {
        executionId,
        creditsCharged: result.creditsCharged,
        newBalance: result.newBalance,
        canExecute: true
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Error charging for execution:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar cobrança'
    });
  }
});

/**
 * PUT /api/quantum-billing/execute/:executionId/complete
 * Finalizar execução e atualizar métricas
 */
router.put('/execute/:executionId/complete', async (req, res) => {
  try {
    const { executionId } = req.params;
    const { 
      status, 
      outputData, 
      executionTimeMs, 
      quantumAdvantage, 
      classicalComparison,
      qiskitOptimizationApplied,
      error 
    } = req.body;

    await QuantumBillingService.updateExecutionStatus(
      executionId,
      status,
      outputData,
      {
        executionTimeMs,
        quantumAdvantage,
        classicalComparison,
        qiskitOptimizationApplied
      },
      error
    );

    res.json({
      success: true,
      message: 'Execução finalizada com sucesso'
    });

  } catch (error) {
    console.error('Error completing execution:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao finalizar execução'
    });
  }
});

// ===== ALGORITHM PRICING =====

/**
 * GET /api/quantum-billing/algorithms/pricing
 * Listar preços de algoritmos quantum
 */
router.get('/algorithms/pricing', async (req, res) => {
  try {
    const pricing = await QuantumBillingService.getAllAlgorithmPricing();

    // Agrupar por package
    const liteAlgorithms = pricing.filter(p => p.packageRequired === 'lite');
    const unstoppableAlgorithms = pricing.filter(p => p.packageRequired === 'unstoppable');

    res.json({
      success: true,
      data: {
        lite: liteAlgorithms,
        unstoppable: unstoppableAlgorithms,
        creditPrice: 5.00 // R$ 5,00 por crédito
      }
    });

  } catch (error) {
    console.error('Error getting algorithm pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar preços'
    });
  }
});

/**
 * GET /api/quantum-billing/algorithms/:algorithmType/pricing
 * Buscar preço específico de algoritmo
 */
router.get('/algorithms/:algorithmType/pricing', async (req, res) => {
  try {
    const { algorithmType } = req.params;

    const pricing = await QuantumBillingService.getAlgorithmPricing(algorithmType);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Algoritmo não encontrado'
      });
    }

    res.json({
      success: true,
      data: pricing
    });

  } catch (error) {
    console.error('Error getting algorithm pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar preço do algoritmo'
    });
  }
});

// ===== AI/ML INSIGHTS & ANALYTICS =====

/**
 * GET /api/quantum-billing/insights/automatic
 * Insights automáticos de IA baseado em uso
 */
router.get('/insights/automatic', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const insights = await QuantumBillingService.triggerAutomaticInsights(tenantId);

    res.json({
      success: true,
      data: insights,
      message: 'Insights gerados automaticamente pela IA'
    });

  } catch (error) {
    console.error('Error generating automatic insights:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar insights'
    });
  }
});

/**
 * GET /api/quantum-billing/analytics/usage
 * Analytics de uso quantum
 */
router.get('/analytics/usage', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { period } = req.query; // YYYY-MM format

    const analytics = await QuantumBillingService.generateUsageAnalytics(
      tenantId, 
      period as string
    );

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error generating usage analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar analytics'
    });
  }
});

/**
 * GET /api/quantum-billing/executions/history
 * Histórico de execuções quantum
 */
router.get('/executions/history', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { page = 1, limit = 20, algorithmType, status } = req.query;

    const executions = await QuantumBillingService.getExecutionHistory(
      tenantId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        algorithmType: algorithmType as string,
        status: status as string
      }
    );

    res.json({
      success: true,
      data: executions
    });

  } catch (error) {
    console.error('Error getting execution history:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar histórico'
    });
  }
});

// ===== ADMIN ROUTES (TOIT TEAM ONLY) =====

/**
 * POST /api/quantum-billing/admin/pricing/update
 * Atualizar preços de algoritmos (apenas super_admin)
 */
router.post('/admin/pricing/update', async (req, res) => {
  try {
    // Verificar se é super_admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const { algorithmType, creditsPerExecution, displayName, description } = req.body;

    await QuantumBillingService.updateAlgorithmPricing(
      algorithmType,
      {
        creditsPerExecution,
        displayName,
        description
      }
    );

    res.json({
      success: true,
      message: 'Preço atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar preço'
    });
  }
});

/**
 * GET /api/quantum-billing/admin/analytics/global
 * Analytics globais do sistema quantum (apenas super_admin)
 */
router.get('/admin/analytics/global', async (req, res) => {
  try {
    // Verificar se é super_admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const globalAnalytics = await QuantumBillingService.getGlobalAnalytics();

    res.json({
      success: true,
      data: globalAnalytics
    });

  } catch (error) {
    console.error('Error getting global analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar analytics globais'
    });
  }
});

export default router;