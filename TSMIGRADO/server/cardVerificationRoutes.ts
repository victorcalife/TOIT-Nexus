/**
 * CARD VERIFICATION ROUTES - APIs para verificação de cartão de crédito
 * Endpoints: /create-intent, /verify-intent, /validate-data
 * Integração com CardVerificationService + Rate Limiting + Validações
 */

import { Router } from 'express';
import { cardVerificationService } from './cardVerificationService.js';

const router = Router();

// Rate limiting simples (em produção usar redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 300000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

/**
 * POST /api/card-verification/create-intent
 * Criar Setup Intent para verificação de cartão
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validações básicas
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        error: 'MISSING_USER_ID'
      });
    }
    
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `card_intent_${userId}_${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey, 3, 300000)) { // 3 tentativas por 5 minutos
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente em 5 minutos.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    console.log('💳 Solicitação de criação de Setup Intent:', { userId, ip: clientIp });
    
    const result = await cardVerificationService.createCardVerificationIntent(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na criação de Setup Intent:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/card-verification/verify-intent
 * Verificar status do Setup Intent
 */
router.post('/verify-intent', async (req, res) => {
  try {
    const { userId, setupIntentId } = req.body;
    
    // Validações básicas
    if (!userId || !setupIntentId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e Setup Intent são obrigatórios',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Validar formato do Setup Intent ID
    if (!setupIntentId.startsWith('seti_')) {
      return res.status(400).json({
        success: false,
        message: 'ID do Setup Intent inválido',
        error: 'INVALID_SETUP_INTENT_ID'
      });
    }
    
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `card_verify_${userId}_${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey, 10, 300000)) { // 10 verificações por 5 minutos
      return res.status(429).json({
        success: false,
        message: 'Muitas verificações. Tente novamente em 5 minutos.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    console.log('🔍 Solicitação de verificação de Setup Intent:', { userId, setupIntentId, ip: clientIp });
    
    const result = await cardVerificationService.verifyCardSetupIntent(userId, setupIntentId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação de Setup Intent:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/card-verification/validate-data
 * Validar dados do cartão (frontend validation)
 */
router.post('/validate-data', async (req, res) => {
  try {
    const cardData = req.body;
    
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `card_validate_${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey, 20, 300000)) { // 20 validações por 5 minutos
      return res.status(429).json({
        success: false,
        message: 'Muitas validações. Tente novamente em 5 minutos.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    console.log('✅ Validação de dados de cartão solicitada:', { ip: clientIp });
    
    const validation = cardVerificationService.validateCardData(cardData);
    
    res.status(200).json({
      success: validation.valid,
      message: validation.valid ? 'Dados do cartão válidos' : 'Dados do cartão inválidos',
      valid: validation.valid,
      errors: validation.errors
    });
    
  } catch (error) {
    console.error('❌ Erro na validação de dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/card-verification/status/:userId
 * Verificar status geral de verificação de cartão do usuário
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        error: 'MISSING_USER_ID'
      });
    }
    
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `card_status_${userId}_${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey, 30, 300000)) { // 30 consultas por 5 minutos
      return res.status(429).json({
        success: false,
        message: 'Muitas consultas. Tente novamente em 5 minutos.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    console.log('📊 Consulta de status de verificação de cartão:', { userId, ip: clientIp });
    
    // Por enquanto, retornar status básico
    // Em implementação futura, podemos adicionar campo cardVerified na tabela users
    res.status(200).json({
      success: true,
      message: 'Status de verificação consultado',
      data: {
        user_id: userId,
        card_verified: false, // Implementar lógica real
        verification_required: true,
        last_verification_attempt: null
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na consulta de status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;
