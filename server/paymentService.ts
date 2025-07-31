import Stripe from 'stripe';
import { db } from './db';
import { 
  paymentPlans, 
  subscriptions, 
  paymentTransactions, 
  paymentMethods,
  invoices,
  webhookEvents,
  tenants,
  users,
  type PaymentPlan,
  type Subscription,
  type PaymentTransaction,
  type PaymentMethod,
  type Invoice
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export class PaymentService {
  
  // ==================== PAYMENT PLANS ====================
  
  /**
   * Criar planos de pagamento padrão
   */
  async createDefaultPlans(): Promise<PaymentPlan[]> {
    const defaultPlans = [
      {
        name: 'Individual',
        slug: 'individual',
        type: 'individual' as const,
        description: 'Plano perfeito para usuários individuais',
        priceMonthly: '29.90',
        priceYearly: '299.00',
        features: [
          'Até 1 usuário',
          'Workflows ilimitados',
          'Query Builder avançado',
          'Relatórios personalizados',
          'Suporte por email',
          '10GB de armazenamento'
        ],
        maxUsers: 1,
        maxModules: 10,
        trialDays: 7,
        sortOrder: 1
      },
      {
        name: 'Business',
        slug: 'business',
        type: 'business' as const,
        description: 'Para pequenas equipes e empresas',
        priceMonthly: '89.90',
        priceYearly: '899.00',
        features: [
          'Até 10 usuários',
          'Workflows ilimitados',
          'Query Builder avançado',
          'Relatórios personalizados',
          'Gestão departamental',
          'Integrações avançadas',
          'Suporte prioritário',
          '100GB de armazenamento'
        ],
        maxUsers: 10,
        maxModules: 20,
        trialDays: 7,
        sortOrder: 2
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        type: 'enterprise' as const,
        description: 'Para grandes empresas com necessidades específicas',
        priceMonthly: '299.90',
        priceYearly: '2999.00',
        features: [
          'Usuários ilimitados',
          'Workflows ilimitados',
          'Query Builder avançado',
          'Relatórios personalizados',
          'Gestão departamental avançada',
          'Integrações customizadas',
          'Motor adaptativo premium',
          'Suporte 24/7',
          'Armazenamento ilimitado',
          'Gerente de conta dedicado'
        ],
        maxUsers: null,
        maxModules: null,
        trialDays: 14,
        sortOrder: 3
      }
    ];

    const createdPlans: PaymentPlan[] = [];
    
    for (const planData of defaultPlans) {
      // Verificar se já existe
      const existing = await db.select().from(paymentPlans).where(eq(paymentPlans.slug, planData.slug));
      
      if (existing.length === 0) {
        const [created] = await db.insert(paymentPlans).values(planData).returning();
        createdPlans.push(created);
      } else {
        createdPlans.push(existing[0]);
      }
    }

    return createdPlans;
  }

  /**
   * Obter todos os planos ativos
   */
  async getActivePlans(): Promise<PaymentPlan[]> {
    return await db.select().from(paymentPlans)
      .where(eq(paymentPlans.isActive, true))
      .orderBy(paymentPlans.sortOrder);
  }

  // ==================== STRIPE CUSTOMERS ====================

  /**
   * Criar customer no Stripe
   */
  async createStripeCustomer(userEmail: string, userName: string, tenantId: string): Promise<string> {
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        tenant_id: tenantId,
        source: 'toit_nexus'
      }
    });

    return customer.id;
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Criar nova assinatura
   */
  async createSubscription(params: {
    tenantId: string;
    planId: string;
    stripeCustomerId: string;
    billingCycle: 'monthly' | 'yearly';
    paymentMethodId?: string;
  }): Promise<Subscription> {
    const { tenantId, planId, stripeCustomerId, billingCycle, paymentMethodId } = params;

    // Buscar plano
    const [plan] = await db.select().from(paymentPlans).where(eq(paymentPlans.id, planId));
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Determinar preço
    const priceId = billingCycle === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;
    if (!priceId) {
      throw new Error('Preço não configurado para este plano');
    }

    // Criar subscription no Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: plan.trialDays,
      metadata: {
        tenant_id: tenantId,
        plan_id: planId,
        billing_cycle: billingCycle
      }
    });

    // Salvar no banco
    const [subscription] = await db.insert(subscriptions).values({
      tenantId,
      planId,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId,
      status: stripeSubscription.status as any,
      billingCycle,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      metadata: {
        stripe_subscription_id: stripeSubscription.id,
        setup_intent_id: (stripeSubscription.latest_invoice as any)?.payment_intent?.id
      }
    }).returning();

    return subscription;
  }

  /**
   * Obter assinatura ativa de um tenant
   */
  async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    const [subscription] = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, 'active')
      ));

    return subscription || null;
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    const [subscription] = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId));

    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    // Cancelar no Stripe
    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
        cancel_at_period_end: true
      });
    } else {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId!);
    }

    // Atualizar no banco
    await db.update(subscriptions)
      .set({
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscriptionId));
  }

  // ==================== PAYMENT METHODS ====================

  /**
   * Salvar método de pagamento
   */
  async savePaymentMethod(tenantId: string, stripePaymentMethodId: string): Promise<PaymentMethod> {
    const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    const [saved] = await db.insert(paymentMethods).values({
      tenantId,
      stripePaymentMethodId,
      type: paymentMethod.type,
      cardBrand: paymentMethod.card?.brand || null,
      cardLast4: paymentMethod.card?.last4 || null,
      cardExpMonth: paymentMethod.card?.exp_month || null,
      cardExpYear: paymentMethod.card?.exp_year || null,
      isDefault: true, // Primeiro cartão é sempre padrão
      isActive: true
    }).returning();

    return saved;
  }

  // ==================== WEBHOOKS ====================

  /**
   * Processar webhook do Stripe
   */
  async processWebhook(payload: string, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Log do evento
    await db.insert(webhookEvents).values({
      stripeEventId: event.id,
      eventType: event.type,
      apiVersion: event.api_version || null,
      data: event.data as any,
      processed: false
    });

    // Processar baseado no tipo
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`Evento não processado: ${event.type}`);
      }

      // Marcar como processado
      await db.update(webhookEvents)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(webhookEvents.stripeEventId, event.id));

    } catch (error: any) {
      // Log do erro
      await db.update(webhookEvents)
        .set({ 
          processed: false, 
          processingError: error.message,
          processedAt: new Date()
        })
        .where(eq(webhookEvents.stripeEventId, event.id));
      
      throw error;
    }
  }

  /**
   * Processar pagamento bem-sucedido
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = invoice.metadata?.tenant_id;
    if (!tenantId) return;

    // Registrar transação
    await db.insert(paymentTransactions).values({
      tenantId,
      stripePaymentIntentId: invoice.payment_intent as string,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_paid / 100).toString(),
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      processedAt: new Date()
    });

    // Atualizar status da assinatura se necessário
    if (invoice.subscription) {
      await db.update(subscriptions)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
    }
  }

  /**
   * Processar falha no pagamento
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const tenantId = invoice.metadata?.tenant_id;
    if (!tenantId) return;

    // Registrar transação falhada
    await db.insert(paymentTransactions).values({
      tenantId,
      stripePaymentIntentId: invoice.payment_intent as string,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_due / 100).toString(),
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
      failureReason: 'Payment failed',
      processedAt: new Date()
    });

    // Atualizar status da assinatura
    if (invoice.subscription) {
      await db.update(subscriptions)
        .set({ status: 'past_due', updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
    }
  }

  /**
   * Processar atualização de assinatura
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    await db.update(subscriptions)
      .set({
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }

  /**
   * Processar cancelamento de assinatura
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }

  // ==================== UTILITIES ====================

  /**
   * Verificar se tenant tem acesso a funcionalidade
   */
  async hasFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) return false;

    const [plan] = await db.select().from(paymentPlans)
      .where(eq(paymentPlans.id, subscription.planId));
    
    if (!plan) return false;

    const features = plan.features as string[];
    return features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  /**
   * Verificar se está no período de trial
   */
  async isInTrial(tenantId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) return false;

    return subscription.status === 'trialing' && 
           subscription.trialEnd && 
           subscription.trialEnd > new Date();
  }
}

export const paymentService = new PaymentService();