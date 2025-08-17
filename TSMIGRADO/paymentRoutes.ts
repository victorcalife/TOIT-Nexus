import { Router } from 'express';
import { paymentService } from './paymentService';
import { db } from './db';
import { tenants, users, businessLeads, paymentPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

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
  } catch (error: any) {
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
    
    const [lead] = await db.insert(businessLeads).values({
      ...validatedData,
      status: 'new'
    }).returning();

    res.json({ 
      success: true, 
      message: 'Obrigado pelo interesse! Nossa equipe entrará em contato em até 24 horas.',
      data: { id: lead.id }
    });
  } catch (error: any) {
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

// ==================== AUTHENTICATED ROUTES ====================

/**
 * Middleware para verificar autenticação
 */
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ success: false, error: 'Não autenticado' });
  }
  next();
};

/**
 * POST /api/payment/create-subscription
 * Criar nova assinatura
 */
router.post('/create-subscription', requireAuth, async (req: any, res: any) => {
  try {
    const validatedData = createSubscriptionSchema.parse(req.body);
    const { planId, billingCycle, paymentMethodId } = validatedData;
    const userId = req.session.user.id;
    const tenantId = req.session.user.tenantId;

    // Buscar usuário e tenant
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));

    if (!user || !tenant) {
      return res.status(404).json({ success: false, error: 'Usuário ou tenant não encontrado' });
    }

    // Verificar se já tem assinatura ativa
    const existingSubscription = await paymentService.getActiveSubscription(tenantId);
    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant já possui assinatura ativa' 
      });
    }

    // Criar customer no Stripe se não existir
    let stripeCustomerId = tenant.settings?.stripe_customer_id;
    if (!stripeCustomerId) {
      stripeCustomerId = await paymentService.createStripeCustomer(
        user.email || '',
        `${user.firstName} ${user.lastName}`,
        tenantId
      );

      // Salvar customer ID no tenant
      await db.update(tenants)
        .set({ 
          settings: { 
            ...tenant.settings as any, 
            stripe_customer_id: stripeCustomerId 
          }
        })
        .where(eq(tenants.id, tenantId));
    }

    // Criar assinatura
    const subscription = await paymentService.createSubscription({
      tenantId,
      planId,
      stripeCustomerId,
      billingCycle,
      paymentMethodId
    });

    res.json({ 
      success: true, 
      data: subscription,
      message: 'Assinatura criada com sucesso'
    });

  } catch (error: any) {
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
 * Obter assinatura atual do tenant
 */
router.get('/subscription', requireAuth, async (req: any, res: any) => {
  try {
    const tenantId = req.session.user.tenantId;
    const subscription = await paymentService.getActiveSubscription(tenantId);
    
    if (!subscription) {
      return res.json({ success: true, data: null });
    }

    // Buscar plano
    const [plan] = await db.select().from(paymentPlans)
      .where(eq(paymentPlans.id, subscription.planId));

    res.json({ 
      success: true, 
      data: {
        ...subscription,
        plan
      }
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/cancel-subscription
 * Cancelar assinatura
 */
router.post('/cancel-subscription', requireAuth, async (req: any, res: any) => {
  try {
    const tenantId = req.session.user.tenantId;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await paymentService.getActiveSubscription(tenantId);
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Assinatura não encontrada' });
    }

    await paymentService.cancelSubscription(subscription.id, cancelAtPeriodEnd);

    res.json({ 
      success: true, 
      message: cancelAtPeriodEnd 
        ? 'Assinatura será cancelada no final do período atual'
        : 'Assinatura cancelada imediatamente'
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment/billing-status
 * Verificar status de cobrança do tenant
 */
router.get('/billing-status', requireAuth, async (req: any, res: any) => {
  try {
    const tenantId = req.session.user.tenantId;
    
    const subscription = await paymentService.getActiveSubscription(tenantId);
    const isInTrial = await paymentService.isInTrial(tenantId);
    
    res.json({ 
      success: true, 
      data: {
        hasActiveSubscription: !!subscription,
        isInTrial,
        subscriptionStatus: subscription?.status || null,
        trialEnd: subscription?.trialEnd || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || null
      }
    });
  } catch (error: any) {
    console.error('Error fetching billing status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SUPER ADMIN ROUTES ====================

/**
 * Middleware para verificar super admin
 */
const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (!req.session?.user || req.session.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }
  next();
};

/**
 * GET /api/payment/admin/business-leads
 * Listar leads empresariais (super admin)
 */
router.get('/admin/business-leads', requireSuperAdmin, async (req: any, res: any) => {
  try {
    const leads = await db.select().from(businessLeads)
      .orderBy(businessLeads.createdAt);
    
    res.json({ success: true, data: leads });
  } catch (error: any) {
    console.error('Error fetching business leads:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/payment/admin/business-lead/:id
 * Atualizar lead empresarial (super admin)
 */
router.put('/admin/business-lead/:id', requireSuperAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo } = req.body;
    
    const [updated] = await db.update(businessLeads)
      .set({
        status,
        notes,
        assignedTo,
        contactedAt: status === 'contacted' ? new Date() : undefined,
        updatedAt: new Date()
      })
      .where(eq(businessLeads.id, id))
      .returning();

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating business lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payment/admin/create-default-plans
 * Criar planos padrão (super admin)
 */
router.post('/admin/create-default-plans', requireSuperAdmin, async (req: any, res: any) => {
  try {
    const plans = await paymentService.createDefaultPlans();
    res.json({ success: true, data: plans, message: 'Planos padrão criados com sucesso' });
  } catch (error: any) {
    console.error('Error creating default plans:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;