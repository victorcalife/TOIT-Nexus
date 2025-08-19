import { Router } from 'express';
import Stripe from 'stripe';
import { db } from './db';
import { accessProfiles, tenants, users, type AccessProfile } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { paymentService } from './paymentService';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { sendToitNexusWelcomeEmail } from './emailService';

const router = Router();

// Initialize Stripe
const stripe = new Stripe( process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
} );

/**
 * ==================== CHECKOUT INTEGRADO - API STRIPE ====================
 * 
 * Este endpoint permite checkout completamente dentro da aplicação,
 * sem redirecionar para Stripe. Usa metadata para identificar perfis.
 */

/**
 * POST /api/stripe/create-payment-intent
 * Criar Payment Intent para checkout integrado
 */
router.post( '/create-payment-intent', async ( req, res ) =>
{
  try
  {
    const {
      profile_slug,
      billing_cycle = 'monthly', // 'monthly' ou 'yearly'
      customer_name,
      customer_email,
      customer_cpf,
      customer_phone
    } = req.body;

    // Validações básicas
    if ( !profile_slug || !customer_name || !customer_email )
    {
      return res.status( 400 ).json( {
        error: 'Dados obrigatórios: profile_slug, customer_name, customer_email'
      } );
    }

    // Buscar perfil de acesso
    const [ accessProfile ] = await db
      .select()
      .from( accessProfiles )
      .where( and(
        eq( accessProfiles.slug, profile_slug.toLowerCase() ),
        eq( accessProfiles.is_active, true )
      ) );

    if ( !accessProfile )
    {
      return res.status( 404 ).json( {
        error: `Perfil de acesso '${ profile_slug }' não encontrado`
      } );
    }

    // Determinar valor baseado no ciclo de cobrança
    const amount = billing_cycle === 'yearly'
      ? Math.round( parseFloat( accessProfile.price_yearly.toString() ) * 100 ) // Centavos
      : Math.round( parseFloat( accessProfile.price_monthly.toString() ) * 100 );

    // Gerar IDs únicos
    const tenant_id = nanoid();
    const customer_id = nanoid();

    // Criar Customer no Stripe
    const stripeCustomer = await stripe.customers.create( {
      email: customer_email,
      name: customer_name,
      phone: customer_phone,
      metadata: {
        tenant_id,
        customer_id,
        profile_slug,
        billing_cycle,
        source: 'toit_nexus_landing'
      }
    } );

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create( {
      amount,
      currency: 'brl',
      customer: stripeCustomer.id,
      setup_future_usage: 'off_session', // Para futuras cobranças
      metadata: {
        tenant_id,
        customer_id,
        profile_slug,
        billing_cycle,
        customer_name,
        customer_email,
        customer_cpf: customer_cpf || '',
        customer_phone: customer_phone || '',
        access_profile_id: accessProfile.id,
        source: 'toit_nexus_integrated_checkout'
      },
      description: `TOIT Nexus - Plano ${ accessProfile.name } (${ billing_cycle === 'yearly' ? 'Anual' : 'Mensal' })`
    } );

    console.log( `💳 Payment Intent criado: ${ paymentIntent.id } para perfil ${ accessProfile.name }` );

    res.json( {
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amount / 100, // Valor em reais
      currency: 'BRL',
      profile: {
        name: accessProfile.name,
        description: accessProfile.description,
        billing_cycle,
        modules_count: Object.values( accessProfile.modules as any ).filter( Boolean ).length
      },
      customer: {
        id: stripeCustomer.id,
        email: customer_email,
        name: customer_name
      }
    } );

  } catch ( error: any )
  {
    console.error( '❌ Erro ao criar Payment Intent:', error );
    res.status( 500 ).json( {
      error: 'Falha ao processar pagamento',
      message: error.message
    } );
  }
} );

/**
 * GET /api/stripe/payment-intent/:intentId
 * Buscar dados do payment intent para checkout
 */
router.get( '/payment-intent/:intentId', async ( req, res ) =>
{
  try
  {
    const { intentId } = req.params;

    // Buscar payment intent no Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve( intentId );

    if ( !paymentIntent )
    {
      return res.status( 404 ).json( {
        success: false,
        message: 'Payment intent não encontrado'
      } );
    }

    // Extrair dados do metadata
    const metadata = paymentIntent.metadata;
    const profileSlug = metadata.profile_slug;
    const billingCycle = metadata.billing_cycle;

    // Buscar dados do perfil
    const profile = await db.accessProfile.findUnique( {
      where: { slug: profileSlug },
      include: {
        available_modules: {
          include: {
            module: true
          }
        }
      }
    } );

    if ( !profile )
    {
      return res.status( 404 ).json( {
        success: false,
        message: 'Perfil não encontrado'
      } );
    }

    // Preparar dados do perfil
    const profileData = {
      name: profile.name,
      slug: profile.slug,
      monthly_price: profile.monthly_price,
      yearly_price: profile.yearly_price,
      description: profile.description,
      features: profile.available_modules.map( am => am.module.name )
    };

    // Dados do cliente (se disponível no metadata)
    const customerData = {
      name: metadata.customer_name || '',
      email: metadata.customer_email || '',
      phone: metadata.customer_phone || '',
      cpf: metadata.customer_cpf || ''
    };

    res.json( {
      success: true,
      profile: profileData,
      billing_cycle: billingCycle,
      customer_data: customerData,
      amount: paymentIntent.amount / 100, // Converter de centavos
      currency: paymentIntent.currency
    } );

  } catch ( error )
  {
    console.error( 'Erro ao buscar payment intent:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/stripe/confirm-payment
 * Confirmar pagamento e criar usuário automaticamente
 */
router.post( '/confirm-payment', async ( req, res ) =>
{
  try
  {
    const { payment_intent_id } = req.body;

    if ( !payment_intent_id )
    {
      return res.status( 400 ).json( {
        error: 'payment_intent_id obrigatório'
      } );
    }

    // Buscar Payment Intent no Stripe para verificar status
    const paymentIntent = await stripe.paymentIntents.retrieve( payment_intent_id );

    if ( paymentIntent.status !== 'succeeded' )
    {
      return res.status( 400 ).json( {
        error: 'Pagamento não foi processado com sucesso',
        status: paymentIntent.status
      } );
    }

    const metadata = paymentIntent.metadata;
    console.log( '🎯 Processando confirmação de pagamento:', metadata );

    // Criar tenant
    const [ newTenant ] = await db.insert( tenants ).values( {
      id: metadata.tenant_id,
      name: `${ metadata.customer_name } - ${ metadata.profile_slug.toUpperCase() }`,
      slug: `${ metadata.customer_name.toLowerCase().replace( /\s+/g, '-' ) }-${ nanoid( 6 ) }`,
      accessProfileId: metadata.access_profile_id,
      subscriptionPlan: metadata.profile_slug,
      userCount: 1,
      isActive: true
    } ).returning();

    // Gerar senha temporária
    const temporaryPassword = nanoid( 8 );
    const hashedPassword = await bcrypt.hash( temporaryPassword, 10 );

    // Criar usuário admin do tenant
    const [ newUser ] = await db.insert( users ).values( {
      id: metadata.customer_id,
      tenantId: newTenant.id,
      email: metadata.customer_email,
      cpf: metadata.customer_cpf || null,
      firstName: metadata.customer_name.split( ' ' )[ 0 ],
      lastName: metadata.customer_name.split( ' ' ).slice( 1 ).join( ' ' ),
      passwordHash: hashedPassword,
      role: 'tenant_admin',
      isActive: true
    } ).returning();

    // Atribuir perfil de acesso
    await paymentService.assignAccessProfileByMetadata( newTenant.id, metadata );

    console.log( `✅ Usuário criado automaticamente: ${ newUser.email } - Tenant: ${ newTenant.name }` );

    // 📧 ENVIAR EMAIL DE BOAS-VINDAS AUTOMÁTICO
    console.log( '📧 Enviando email de boas-vindas...' );
    try
    {
      const emailSent = await sendToitNexusWelcomeEmail(
        newUser.email!,
        metadata.customer_name,
        metadata.profile_slug,
        temporaryPassword,
        newTenant.id,
        false // não é trial
      );

      if ( emailSent )
      {
        console.log( '✅ Email de boas-vindas enviado com sucesso' );
      } else
      {
        console.log( '⚠️ Falha ao enviar email de boas-vindas (usuário criado com sucesso)' );
      }
    } catch ( emailError )
    {
      console.error( '❌ Erro ao enviar email de boas-vindas:', emailError );
      // Não falhar a operação por causa do email
    }

    res.json( {
      success: true,
      message: 'Pagamento confirmado e usuário criado com sucesso!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${ newUser.firstName } ${ newUser.lastName }`,
        tenant: newTenant.name,
        profile: metadata.profile_slug,
        temporary_password: temporaryPassword, // ⚠️ Remover em produção
        login_url: 'https://nexus.toit.com.br'
      },
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status
      }
    } );

  } catch ( error: any )
  {
    console.error( '❌ Erro ao confirmar pagamento:', error );
    res.status( 500 ).json( {
      error: 'Falha ao confirmar pagamento',
      message: error.message
    } );
  }
} );

/**
 * GET /api/stripe/profiles
 * Listar perfis de acesso disponíveis para venda
 */
router.get( '/profiles', async ( req, res ) =>
{
  try
  {
    const profiles = await db
      .select( {
        id: accessProfiles.id,
        name: accessProfiles.name,
        slug: accessProfiles.slug,
        description: accessProfiles.description,
        price_monthly: accessProfiles.price_monthly,
        price_yearly: accessProfiles.price_yearly,
        max_users: accessProfiles.max_users,
        max_storage_gb: accessProfiles.max_storage_gb,
        modules: accessProfiles.modules
      } )
      .from( accessProfiles )
      .where( eq( accessProfiles.is_active, true ) )
      .orderBy( accessProfiles.sort_order );

    // Calcular desconto anual e módulos ativos
    const enhancedProfiles = profiles.map( profile =>
    {
      const monthly = parseFloat( profile.price_monthly.toString() );
      const yearly = parseFloat( profile.price_yearly.toString() );
      const monthlyEquivalent = yearly / 12;
      const discount = Math.round( ( ( monthly - monthlyEquivalent ) / monthly ) * 100 );

      const activeModules = Object.values( profile.modules as any ).filter( Boolean ).length;

      return {
        ...profile,
        price_monthly: monthly,
        price_yearly: yearly,
        yearly_discount: discount,
        yearly_savings: Math.round( ( monthly * 12 ) - yearly ),
        active_modules_count: activeModules
      };
    } );

    res.json( {
      success: true,
      profiles: enhancedProfiles
    } );

  } catch ( error: any )
  {
    console.error( '❌ Erro ao listar perfis:', error );
    res.status( 500 ).json( {
      error: 'Falha ao carregar perfis',
      message: error.message
    } );
  }
} );

/**
 * GET /api/stripe/config
 * Retornar chave pública do Stripe para frontend
 */
router.get( '/config', ( req, res ) =>
{
  res.json( {
    success: true,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY
  } );
} );

export default router;