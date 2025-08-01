import express from 'express';
import { trialService } from './trialService.js';
import { validateCpf } from '../client/src/lib/utils.js';

const router = express.Router();

/**
 * POST /api/trial/signup
 * Criar conta trial com 7 dias
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, cpf, password, planType, planCycle } = req.body;

    // Validações básicas
    if (!name || !email || !cpf || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, CPF e senha são obrigatórios'
      });
    }

    // Validar CPF
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dígitos'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Criar usuário trial
    const result = await trialService.createTrialUser({
      name,
      email,
      phone,
      cpf: cleanCpf,
      password,
      planType: planType || 'standard',
      planCycle: planCycle || 'monthly'
    });

    res.json(result);

  } catch (error) {
    console.error('Erro no signup trial:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/trial/verify-email
 * Verificar email do usuário
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token, userId } = req.query;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Token e userId são obrigatórios'
      });
    }

    const result = await trialService.verifyEmail(userId as string, token as string);
    
    if (result.success) {
      // Redirecionar para página de sucesso
      const redirectUrl = result.accountActivated 
        ? '/login?verified=true&activated=true'
        : '/verify-phone?userId=' + userId;
      
      res.redirect(redirectUrl);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Erro na verificação de email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email'
    });
  }
});

/**
 * POST /api/trial/verify-phone
 * Verificar telefone do usuário
 */
router.post('/verify-phone', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message: 'userId e código são obrigatórios'
      });
    }

    const result = await trialService.verifyPhone(userId, code);
    res.json(result);

  } catch (error) {
    console.error('Erro na verificação de telefone:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar telefone'
    });
  }
});

/**
 * POST /api/trial/resend-email
 * Reenviar email de verificação
 */
router.post('/resend-email', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'userId e email são obrigatórios'
      });
    }

    await trialService.sendVerificationEmail(userId, email);
    
    res.json({
      success: true,
      message: 'Email de verificação reenviado'
    });

  } catch (error) {
    console.error('Erro ao reenviar email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reenviar email'
    });
  }
});

/**
 * POST /api/trial/resend-sms
 * Reenviar SMS de verificação
 */
router.post('/resend-sms', async (req, res) => {
  try {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'userId e telefone são obrigatórios'
      });
    }

    await trialService.sendVerificationSMS(userId, phone);
    
    res.json({
      success: true,
      message: 'SMS de verificação reenviado'
    });

  } catch (error) {
    console.error('Erro ao reenviar SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reenviar SMS'
    });
  }
});

/**
 * POST /api/trial/convert
 * Converter trial em assinatura paga
 */
router.post('/convert', async (req, res) => {
  try {
    const { userId, planType, planCycle } = req.body;

    if (!userId || !planType || !planCycle) {
      return res.status(400).json({
        success: false,
        message: 'userId, planType e planCycle são obrigatórios'
      });
    }

    const result = await trialService.convertTrialToSubscription(userId, planType, planCycle);
    res.json(result);

  } catch (error) {
    console.error('Erro ao converter trial:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao converter trial'
    });
  }
});

/**
 * POST /api/trial/cleanup
 * Job para limpar trials expirados (deve ser chamado por cron)
 */
router.post('/cleanup', async (req, res) => {
  try {
    // Verificar se é uma chamada autorizada (pode implementar auth de sistema)
    const { authKey } = req.body;
    
    if (authKey !== process.env.TRIAL_CLEANUP_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    const cleanedCount = await trialService.deactivateExpiredTrials();
    
    res.json({
      success: true,
      message: `${cleanedCount} trials expirados limpos`
    });

  } catch (error) {
    console.error('Erro no cleanup de trials:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no cleanup'
    });
  }
});

export { router as trialRoutes };