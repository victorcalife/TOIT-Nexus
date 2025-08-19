/**
 * VERIFICATION ROUTES - APIs completas para verificação Email/Telefone
 * Endpoints: /send-email, /send-phone, /verify, /resend, /status
 * Integração com VerificationService + Validações + Rate Limiting
 */

import { Router } from 'express';
import { verificationService } from './verificationService';
import { authMiddleware } from './authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting para verificação - 5 tentativas por 15 minutos
const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    success: false,
    message: 'Muitas tentativas de verificação. Tente novamente em 15 minutos.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para envio de códigos - 3 envios por 10 minutos
const sendCodeRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 3, // máximo 3 envios por IP
  message: {
    success: false,
    message: 'Muitas solicitações de código. Tente novamente em 10 minutos.',
    error: 'SEND_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/verification/send-email
 * Enviar código de verificação por email
 */
router.post('/send-email', sendCodeRateLimit, authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email } = req.body;
    
    // Validações
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório',
        error: 'INVALID_EMAIL'
      });
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
        error: 'INVALID_EMAIL_FORMAT'
      });
    }
    
    console.log('📧 Solicitação de verificação de email:', { userId, email });
    
    const result = await verificationService.sendEmailVerification(userId, email);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota send-email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/verification/send-phone
 * Enviar código de verificação por SMS
 */
router.post('/send-phone', sendCodeRateLimit, authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { phone } = req.body;
    
    // Validações
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }
    
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Telefone é obrigatório',
        error: 'INVALID_PHONE'
      });
    }
    
    // Validar formato do telefone (apenas números, 10-11 dígitos)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use formato: (11) 99999-9999',
        error: 'INVALID_PHONE_FORMAT'
      });
    }
    
    console.log('📱 Solicitação de verificação de telefone:', { userId, phone: cleanPhone });
    
    const result = await verificationService.sendPhoneVerification(userId, cleanPhone);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota send-phone:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/verification/verify-code
 * Verificar código fornecido pelo usuário (endpoint usado pelo frontend)
 */
router.post('/verify-code', verificationRateLimit, async (req, res) => {
  try {
    const { userId, type, code } = req.body;
    
    // Validações
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        error: 'USER_ID_REQUIRED'
      });
    }
    
    if (!type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de verificação inválido. Use: email ou phone',
        error: 'INVALID_TYPE'
      });
    }
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Código é obrigatório',
        error: 'INVALID_CODE'
      });
    }
    
    // Validar formato do código (6 dígitos)
    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Código deve ter 6 dígitos',
        error: 'INVALID_CODE_FORMAT'
      });
    }
    
    console.log(`🔍 Verificação de código ${type}:`, { userId, code: '******' });
    
    const result = await verificationService.verifyCode(userId, type as 'email' | 'phone', cleanCode);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota verify-code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/verification/verify
 * Verificar código fornecido pelo usuário
 */
router.post('/verify', verificationRateLimit, authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type, code } = req.body;
    
    // Validações
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }
    
    if (!type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de verificação inválido. Use: email ou phone',
        error: 'INVALID_TYPE'
      });
    }
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Código é obrigatório',
        error: 'INVALID_CODE'
      });
    }
    
    // Validar formato do código (6 dígitos)
    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Código deve ter 6 dígitos',
        error: 'INVALID_CODE_FORMAT'
      });
    }
    
    console.log(`🔍 Verificação de código ${type}:`, { userId, code: '******' });
    
    const result = await verificationService.verifyCode(userId, type as 'email' | 'phone', cleanCode);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota verify:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/verification/resend
 * Reenviar código de verificação (endpoint público para frontend)
 */
router.post('/resend', sendCodeRateLimit, async (req, res) => {
  try {
    const { userId, type } = req.body;
    
    // Validações
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        error: 'USER_ID_REQUIRED'
      });
    }
    
    if (!type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de verificação inválido. Use: email ou phone',
        error: 'INVALID_TYPE'
      });
    }
    
    console.log(`🔄 Reenvio de código ${type}:`, { userId });
    
    const result = await verificationService.resendCode(userId, type as 'email' | 'phone');
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota resend:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/verification/resend-auth
 * Reenviar código de verificação (endpoint autenticado)
 */
router.post('/resend-auth', sendCodeRateLimit, authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type } = req.body;
    
    // Validações
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }
    
    if (!type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de verificação inválido. Use: email ou phone',
        error: 'INVALID_TYPE'
      });
    }
    
    console.log(`🔄 Reenvio de código ${type}:`, { userId });
    
    const result = await verificationService.resendCode(userId, type as 'email' | 'phone');
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota resend-auth:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/verification/status/:userId
 * Obter status de verificação do usuário (endpoint público para frontend)
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        error: 'USER_ID_REQUIRED'
      });
    }
    
    console.log('📊 Consultando status de verificação:', { userId });
    
    const result = await verificationService.getVerificationStatus(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/verification/status
 * Obter status de verificação do usuário (endpoint autenticado)
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }
    
    console.log('📊 Consultando status de verificação:', { userId });
    
    const result = await verificationService.getVerificationStatus(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/verification/cleanup (Admin only)
 * Limpar códigos expirados
 */
router.post('/cleanup', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    // Apenas super_admin pode executar cleanup
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem executar cleanup.',
        error: 'FORBIDDEN'
      });
    }
    
    console.log('🧹 Executando cleanup de códigos expirados');
    
    const deletedCount = await verificationService.cleanupExpiredCodes();
    
    res.status(200).json({
      success: true,
      message: `Cleanup concluído. ${deletedCount} códigos expirados removidos.`,
      deleted_count: deletedCount
    });
    
  } catch (error) {
    console.error('❌ Erro na rota cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/verification/health
 * Health check das integrações
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        sendgrid: {
          configured: !!process.env.SENDGRID_API_KEY,
          status: process.env.SENDGRID_API_KEY ? 'ready' : 'not_configured'
        },
        twilio: {
          configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
          status: (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? 'ready' : 'not_configured'
        },
        database: {
          status: 'connected' // Assumindo que se chegou aqui, DB está ok
        }
      }
    };
    
    res.status(200).json(health);
    
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no health check',
      error: 'HEALTH_CHECK_FAILED'
    });
  }
});

export default router;