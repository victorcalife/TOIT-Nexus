const { Router } = require('express');
const { paymentService } = require('./paymentService');
const { db } = require('./db');
const { tenants, users, businessLeads, paymentPlans } = require('../shared/schema');
const { eq } = require('drizzle-orm');
const { z } = require('zod');

const router = Router();

// ==================== VALIDATION SCHEMAS ====================

const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  billingCycle: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().optional()
});

const businessLeadSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().min(2),
  cnpj: z.string().optional(),
  employeeCount: z.number().optional(),
  sector: z.string().optional(),
  message: z.string().optional()
});

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/payment/plans
 * Obter planos disponíveis (público)
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await paymentService.getActivePlans();
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/business-lead
 * Capturar lead empresarial (público)
 */
router.post('/business-lead', async (req, res) => {
  try {
    const validatedData = businessLeadSchema.parse(req.body);
    
    // Salvar lead no banco
    const [lead] = await db.insert(businessLeads).values({
      ...validatedData,
      createdAt: new Date(),
      status: 'new'
    }).returning();

    res.json({ 
      success: true, 
      message: 'Lead capturado com sucesso',
      data: { id: lead.id }
    });
  } catch (error) {
    console.error('Error creating business lead:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos',
        details: error.errors 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/create-subscription
 * Criar nova assinatura
 */
router.post('/create-subscription', async (req, res) => {
  try {
    const validatedData = createSubscriptionSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const subscription = await paymentService.createSubscription(userId, validatedData);
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos',
        details: error.errors 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment/subscription
 * Obter assinatura atual do usuário
 */
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const subscription = await paymentService.getUserSubscription(userId);
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/cancel-subscription
 * Cancelar assinatura
 */
router.post('/cancel-subscription', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    await paymentService.cancelSubscription(userId);
    res.json({ success: true, message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/update-payment-method
 * Atualizar método de pagamento
 */
router.post('/update-payment-method', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { paymentMethodId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ success: false, error: 'Payment method ID é obrigatório' });
    }

    await paymentService.updatePaymentMethod(userId, paymentMethodId);
    res.json({ success: true, message: 'Método de pagamento atualizado' });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment/invoices
 * Obter histórico de faturas
 */
router.get('/invoices', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const invoices = await paymentService.getUserInvoices(userId);
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/retry-payment
 * Tentar novamente pagamento falhado
 */
router.post('/retry-payment', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { invoiceId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    if (!invoiceId) {
      return res.status(400).json({ success: false, error: 'Invoice ID é obrigatório' });
    }

    const result = await paymentService.retryPayment(userId, invoiceId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error retrying payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment/usage
 * Obter uso atual do plano
 */
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const usage = await paymentService.getUserUsage(userId);
    res.json({ success: true, data: usage });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
