import { Router } from 'express';
import { paymentService } from './paymentService';

const router = Router();

/**
 * POST /api/webhooks/stripe
 * Processar webhooks do Stripe
 * 
 * IMPORTANTE: Esta rota deve usar raw body, não JSON parsed
 */
router.post('/stripe', async (req: any, res: any) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.body;

  if (!signature) {
    console.error('Missing Stripe signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    await paymentService.processWebhook(payload, signature);
    
    console.log('✅ Webhook processed successfully');
    res.json({ received: true });
    
  } catch (error: any) {
    console.error('❌ Webhook processing failed:', error.message);
    
    // Retornar 400 para webhooks mal formados
    if (error.message.includes('signature verification failed')) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Retornar 500 para erros de processamento (Stripe tentará novamente)
    res.status(500).json({ error: 'Processing failed' });
  }
});

/**
 * GET /api/webhooks/stripe/test
 * Testar conectividade do webhook
 */
router.get('/stripe/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Webhook endpoint is ready',
    timestamp: new Date().toISOString()
  });
});

export default router;