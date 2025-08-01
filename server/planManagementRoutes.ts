import { Router } from 'express';
import { PlanManagementService } from './planManagementService';

const router = Router();

/**
 * GET /api/plan-management/available/:currentPlan
 * Obter planos disponíveis para mudança - Usuário autenticado
 */
router.get('/available/:currentPlan', async (req, res) => {
  try {
    const { currentPlan } = req.params;
    
    if (!currentPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plano atual é obrigatório'
      });
    }

    console.log(`📋 Buscando planos disponíveis para mudança do plano: ${currentPlan}`);
    
    const availablePlans = await PlanManagementService.getAvailablePlans(currentPlan);
    
    res.json({
      success: true,
      data: availablePlans,
      currentPlan,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar planos disponíveis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar planos disponíveis'
    });
  }
});

/**
 * POST /api/plan-management/compare
 * Comparar dois planos - Usuário autenticado
 */
router.post('/compare', async (req, res) => {
  try {
    const { currentPlan, targetPlan } = req.body;
    
    if (!currentPlan || !targetPlan) {
      return res.status(400).json({
        success: false,
        message: 'Planos atual e alvo são obrigatórios'
      });
    }

    console.log(`🔍 Comparando planos: ${currentPlan} vs ${targetPlan}`);
    
    const comparison = await PlanManagementService.comparePlans(currentPlan, targetPlan);
    
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Um ou ambos os planos não foram encontrados'
      });
    }

    res.json({
      success: true,
      data: comparison,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao comparar planos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao comparar planos'
    });
  }
});

/**
 * POST /api/plan-management/check-eligibility
 * Verificar se mudança de plano é permitida - Usuário autenticado
 */
router.post('/check-eligibility', async (req, res) => {
  try {
    const { userId, targetPlan } = req.body;
    
    if (!userId || !targetPlan) {
      return res.status(400).json({
        success: false,
        message: 'User ID e plano alvo são obrigatórios'
      });
    }

    console.log(`✅ Verificando elegibilidade para mudança: ${userId} → ${targetPlan}`);
    
    const eligibility = await PlanManagementService.canChangePlan(userId, targetPlan);
    
    res.json({
      success: true,
      data: eligibility,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao verificar elegibilidade:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao verificar elegibilidade'
    });
  }
});

/**
 * POST /api/plan-management/change-plan
 * Executar mudança de plano - Usuário autenticado
 */
router.post('/change-plan', async (req, res) => {
  try {
    const { userId, currentPlan, targetPlan, reason } = req.body;
    
    if (!userId || !currentPlan || !targetPlan) {
      return res.status(400).json({
        success: false,
        message: 'User ID, plano atual e plano alvo são obrigatórios'
      });
    }

    console.log(`🔄 Executando mudança de plano: ${userId} | ${currentPlan} → ${targetPlan}`);
    
    // Verificar elegibilidade primeiro
    const eligibility = await PlanManagementService.canChangePlan(userId, targetPlan);
    
    if (!eligibility.allowed) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason || 'Mudança de plano não permitida'
      });
    }

    // Determinar tipo de mudança
    const comparison = await PlanManagementService.comparePlans(currentPlan, targetPlan);
    const changeType = comparison?.changes.changeType || 'sidegrade';

    // Executar mudança
    const result = await PlanManagementService.requestPlanChange({
      userId,
      currentPlan,
      targetPlan,
      changeType,
      reason
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          transactionId: result.transactionId,
          effectiveDate: result.effectiveDate,
          prorationAmount: result.prorationAmount,
          oldPlan: result.oldPlan,
          newPlan: result.newPlan,
          changeType
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        data: {
          oldPlan: result.oldPlan,
          newPlan: result.newPlan
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao executar mudança de plano:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao executar mudança de plano'
    });
  }
});

/**
 * GET /api/plan-management/history/:userId
 * Obter histórico de mudanças de plano - Usuário autenticado
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID é obrigatório'
      });
    }

    console.log(`📜 Buscando histórico de mudanças de plano: ${userId}`);
    
    const history = await PlanManagementService.getPlanChangeHistory(userId);
    
    res.json({
      success: true,
      data: history,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico de planos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar histórico de planos'
    });
  }
});

/**
 * POST /api/plan-management/cancel-subscription
 * Cancelar assinatura - Usuário autenticado
 */
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId, reason, effectiveDate } = req.body;
    
    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID e motivo do cancelamento são obrigatórios'
      });
    }

    console.log(`❌ Processando cancelamento de assinatura: ${userId} | Motivo: ${reason}`);
    
    const result = await PlanManagementService.cancelSubscription(
      userId, 
      reason, 
      effectiveDate ? new Date(effectiveDate) : undefined
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          effectiveDate: result.effectiveDate,
          oldPlan: result.oldPlan,
          reason
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao cancelar assinatura'
    });
  }
});

/**
 * POST /api/plan-management/admin/force-change
 * Forçar mudança de plano (Admin apenas) - Super Admin apenas
 */
router.post('/admin/force-change', async (req, res) => {
  try {
    const { userId, targetPlan, reason } = req.body;
    
    if (!userId || !targetPlan) {
      return res.status(400).json({
        success: false,
        message: 'User ID e plano alvo são obrigatórios'
      });
    }

    console.log(`⚙️ [ADMIN] Forçando mudança de plano: ${userId} → ${targetPlan}`);
    
    // Admin pode forçar qualquer mudança, então buscamos o plano atual do usuário
    const user = await require('./storage').storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const currentPlan = user.planType || 'unknown';

    // Executar mudança forçada
    const result = await PlanManagementService.requestPlanChange({
      userId,
      currentPlan,
      targetPlan,
      changeType: 'upgrade', // Admin override
      reason: `[ADMIN] ${reason || 'Mudança administrativa'}`
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Mudança administrativa executada: ${result.message}`,
        data: {
          transactionId: result.transactionId,
          effectiveDate: result.effectiveDate,
          oldPlan: result.oldPlan,
          newPlan: result.newPlan,
          adminOverride: true
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao forçar mudança de plano:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao forçar mudança de plano'
    });
  }
});

/**
 * GET /api/plan-management/admin/stats
 * Estatísticas de mudanças de plano - Super Admin apenas
 */
router.get('/admin/stats', async (req, res) => {
  try {
    console.log('📊 [ADMIN] Obtendo estatísticas de mudanças de plano...');
    
    // Placeholder - em produção seria baseado em tabela de auditoria
    const stats = {
      totalChanges: 47,
      thisMonth: {
        upgrades: 12,
        downgrades: 3,
        cancellations: 2
      },
      popularChanges: [
        { from: 'basico', to: 'standard', count: 18 },
        { from: 'standard', to: 'premium', count: 8 },
        { from: 'premium', to: 'standard', count: 4 }
      ],
      averageProration: 23.45,
      retentionRate: 94.2
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter estatísticas'
    });
  }
});

export default router;