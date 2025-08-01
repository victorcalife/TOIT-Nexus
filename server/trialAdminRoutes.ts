import { Router } from 'express';
import { TrialManager } from './trialManager';

const router = Router();

/**
 * GET /api/admin/trials/stats
 * Obter estatísticas de trials - Super Admin apenas
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await TrialManager.getTrialStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter estatísticas de trials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter estatísticas de trials'
    });
  }
});

/**
 * POST /api/admin/trials/process-expired
 * Processar trials expirados manualmente - Super Admin apenas
 */
router.post('/process-expired', async (req, res) => {
  try {
    console.log('🔄 Processamento manual de trials expirados iniciado...');
    
    await TrialManager.processExpiredTrials();
    
    res.json({
      success: true,
      message: 'Processamento de trials expirados executado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar trials expirados:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar trials expirados'
    });
  }
});

/**
 * POST /api/admin/trials/process-reminders
 * Processar lembretes de trials manualmente - Super Admin apenas
 */
router.post('/process-reminders', async (req, res) => {
  try {
    console.log('📬 Processamento manual de lembretes de trials iniciado...');
    
    await TrialManager.processTrialReminders();
    
    res.json({
      success: true,
      message: 'Processamento de lembretes de trials executado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar lembretes de trials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar lembretes de trials'
    });
  }
});

/**
 * POST /api/admin/trials/reactivate/:userId
 * Reativar conta após pagamento - Super Admin apenas
 */
router.post('/reactivate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPlanType } = req.body;
    
    if (!userId || !newPlanType) {
      return res.status(400).json({
        success: false,
        message: 'User ID e novo tipo de plano são obrigatórios'
      });
    }

    console.log(`💰 Reativação manual da conta: ${userId} para plano ${newPlanType}`);
    
    const reactivated = await TrialManager.reactivateAfterPayment(userId, newPlanType);
    
    if (reactivated) {
      res.json({
        success: true,
        message: `Conta ${userId} reativada com sucesso para plano ${newPlanType}`,
        userId,
        newPlanType,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Falha ao reativar conta'
      });
    }

  } catch (error: any) {
    console.error('❌ Erro ao reativar conta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao reativar conta'
    });
  }
});

/**
 * GET /api/admin/trials/cron-status
 * Verificar status do cron job de trials
 */
router.get('/cron-status', async (req, res) => {
  try {
    // Informações sobre o cron job
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.json({
      success: true,
      data: {
        environment: process.env.NODE_ENV || 'unknown',
        cronInterval: isDevelopment ? '5 minutos' : '24 horas',
        isDevelopment,
        lastCheck: new Date().toISOString(),
        message: isDevelopment ? 
          'Cron job executa a cada 5 minutos em desenvolvimento' :
          'Cron job executa a cada 24 horas em produção'
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao verificar status do cron job'
    });
  }
});

export default router;