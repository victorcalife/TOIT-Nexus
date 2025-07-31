import Stripe from 'stripe';
import { db } from './db.js';
import { 
  paymentPlans, 
  subscriptions, 
  paymentTransactions, 
  paymentMethods,
  invoices,
  webhookEvents,
  tenants,
  users
} from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Initialize Stripe (only if key is provided)
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
    console.log('✅ Stripe initialized successfully');
  } else {
    console.warn('⚠️  STRIPE_SECRET_KEY not configured - payment features disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
}

export class PaymentService {
  
  // Helper method to check if Stripe is available
  _requireStripe() {
    if (!stripe) {
      throw new Error('Stripe não configurado. Configure STRIPE_SECRET_KEY para habilitar pagamentos.');
    }
    return stripe;
  }
  
  // ==================== PAYMENT PLANS ====================
  
  /**
   * Criar planos de pagamento padrão
   */
  async createDefaultPlans() {
    const defaultPlans = [
      {
        name: 'Individual',
        slug: 'individual',
        type: 'individual',
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
        type: 'business',
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
        type: 'enterprise',
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

    const createdPlans = [];
    
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
  async getActivePlans() {
    return await db.select().from(paymentPlans)
      .where(eq(paymentPlans.isActive, true))
      .orderBy(paymentPlans.sortOrder);
  }

  // ==================== STRIPE CUSTOMERS ====================

  /**
   * Criar customer no Stripe
   */
  async createStripeCustomer(userEmail, userName, tenantId) {
    const stripeClient = this._requireStripe();
    const customer = await stripeClient.customers.create({
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
  async createSubscription(params) {
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
    const stripeClient = this._requireStripe();
    const stripeSubscription = await stripeClient.subscriptions.create({
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
      status: stripeSubscription.status,
      billingCycle,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      metadata: {
        stripe_subscription_id: stripeSubscription.id,
        setup_intent_id: stripeSubscription.latest_invoice?.payment_intent?.id
      }
    }).returning();

    return subscription;
  }

  /**
   * Obter assinatura ativa de um tenant
   */
  async getActiveSubscription(tenantId) {
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
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    const [subscription] = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId));

    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    // Cancelar no Stripe
    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
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
  async savePaymentMethod(tenantId, stripePaymentMethodId) {
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
  async processWebhook(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Log do evento
    await db.insert(webhookEvents).values({
      stripeEventId: event.id,
      eventType: event.type,
      apiVersion: event.api_version || null,
      data: event.data,
      processed: false
    });

    // Processar baseado no tipo
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
        
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'customer.subscription.resumed':
          await this.handleSubscriptionResumed(event.data.object);
          break;

        default:
          console.log(`Evento não processado: ${event.type}`);
      }

      // Marcar como processado
      await db.update(webhookEvents)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(webhookEvents.stripeEventId, event.id));

    } catch (error) {
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
  async handleInvoicePaymentSucceeded(invoice) {
    const tenantId = invoice.metadata?.tenant_id;
    if (!tenantId) return;

    // Registrar transação
    await db.insert(paymentTransactions).values({
      tenantId,
      stripePaymentIntentId: invoice.payment_intent,
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
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription));
    }
  }

  /**
   * Processar falha no pagamento
   */
  async handleInvoicePaymentFailed(invoice) {
    const tenantId = invoice.metadata?.tenant_id;
    if (!tenantId) return;

    // Registrar transação falhada
    await db.insert(paymentTransactions).values({
      tenantId,
      stripePaymentIntentId: invoice.payment_intent,
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
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription));
    }
  }

  /**
   * Processar atualização de assinatura
   */
  async handleSubscriptionUpdated(subscription) {
    await db.update(subscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }

  /**
   * Processar criação de assinatura
   */
  async handleSubscriptionCreated(subscription) {
    console.log(`✅ Nova assinatura criada: ${subscription.id}`);
    
    // Verificar se já existe no banco (evitar duplicação)
    const existing = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    
    if (existing.length === 0) {
      // Buscar tenant pelo customer_id
      const tenantId = subscription.metadata?.tenant_id;
      if (tenantId) {
        await db.insert(subscriptions).values({
          tenantId,
          planId: subscription.metadata?.plan_id || 'unknown',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          status: subscription.status,
          billingCycle: subscription.metadata?.billing_cycle || 'monthly',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          metadata: {
            stripe_subscription_id: subscription.id,
            created_via_webhook: true
          }
        });
        console.log(`✅ Assinatura ${subscription.id} salva no banco`);
      }
    } else {
      console.log(`⚠️ Assinatura ${subscription.id} já existe no banco`);
    }
  }

  /**
   * Processar cancelamento de assinatura
   */
  async handleSubscriptionDeleted(subscription) {
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }

  /**
   * Processar reativação de assinatura
   */
  async handleSubscriptionResumed(subscription) {
    console.log(`🔄 Assinatura reativada: ${subscription.id}`);
    
    await db.update(subscriptions)
      .set({
        status: 'active',
        cancelAtPeriodEnd: false,
        canceledAt: null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
      
    console.log(`✅ Assinatura ${subscription.id} reativada no banco`);
  }

  // ==================== UTILITIES ====================

  /**
   * Verificar se tenant tem acesso a funcionalidade
   */
  async hasFeatureAccess(tenantId, feature) {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) return false;

    const [plan] = await db.select().from(paymentPlans)
      .where(eq(paymentPlans.id, subscription.planId));
    
    if (!plan) return false;

    const features = plan.features;
    return features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  /**
   * Verificar se está no período de trial
   */
  async isInTrial(tenantId) {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) return false;

    return subscription.status === 'trialing' && 
           subscription.trialEnd && 
           subscription.trialEnd > new Date();
  }
}

export const paymentService = new PaymentService();