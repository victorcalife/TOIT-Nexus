/**
 * CARD VERIFICATION SERVICE - Validação de Cartão de Crédito para Trial
 * Integração com Stripe para verificar se cartão está ativo
 * Funcionalidades: Validar cartão, criar setup intent, verificar status
 */

import Stripe from 'stripe';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface CardVerificationResult {
  success: boolean;
  message: string;
  setupIntentId?: string;
  clientSecret?: string;
  cardValid?: boolean;
  error?: string;
}

interface CardValidationData {
  userId: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  cardholderName: string;
}

class CardVerificationService {
  private stripe: Stripe;
  
  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.warn('⚠️ STRIPE_SECRET_KEY não configurada - verificação de cartão não funcionará');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-12-18.acacia',
      });
    }
  }
  
  /**
   * Cria Setup Intent para verificar cartão sem cobrança
   */
  async createCardVerificationIntent(userId: string): Promise<CardVerificationResult> {
    try {
      if (!this.stripe) {
        return {
          success: false,
          message: 'Stripe não configurado',
          error: 'STRIPE_NOT_CONFIGURED'
        };
      }

      console.log('💳 Criando Setup Intent para verificação de cartão:', userId);
      
      // Buscar dados do usuário
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado',
          error: 'USER_NOT_FOUND'
        };
      }

      // Criar ou buscar customer no Stripe
      let stripeCustomer;
      try {
        // Tentar buscar customer existente
        const customers = await this.stripe.customers.list({
          email: user.email,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          stripeCustomer = customers.data[0];
        } else {
          // Criar novo customer
          stripeCustomer = await this.stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            metadata: {
              user_id: userId,
              cpf: user.cpf,
              verification_purpose: 'trial_card_validation'
            }
          });
        }
      } catch (error) {
        console.error('❌ Erro ao criar/buscar customer Stripe:', error);
        return {
          success: false,
          message: 'Erro ao processar dados do cliente',
          error: 'STRIPE_CUSTOMER_ERROR'
        };
      }

      // Criar Setup Intent para verificação de cartão
      const setupIntent = await this.stripe.setupIntents.create({
        customer: stripeCustomer.id,
        payment_method_types: ['card'],
        usage: 'off_session', // Para futuras cobranças
        metadata: {
          user_id: userId,
          purpose: 'trial_card_verification',
          trial_validation: 'true'
        }
      });

      console.log('✅ Setup Intent criado:', setupIntent.id);

      return {
        success: true,
        message: 'Setup Intent criado com sucesso',
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret || undefined,
        cardValid: false // Será validado após confirmação
      };

    } catch (error) {
      console.error('❌ Erro ao criar Setup Intent:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Verifica status do Setup Intent e valida cartão
   */
  async verifyCardSetupIntent(userId: string, setupIntentId: string): Promise<CardVerificationResult> {
    try {
      if (!this.stripe) {
        return {
          success: false,
          message: 'Stripe não configurado',
          error: 'STRIPE_NOT_CONFIGURED'
        };
      }

      console.log('🔍 Verificando Setup Intent:', setupIntentId);
      
      // Buscar Setup Intent
      const setupIntent = await this.stripe.setupIntents.retrieve(setupIntentId);
      
      if (setupIntent.metadata.user_id !== userId) {
        return {
          success: false,
          message: 'Setup Intent não pertence ao usuário',
          error: 'UNAUTHORIZED'
        };
      }

      // Verificar status
      if (setupIntent.status === 'succeeded') {
        // Cartão foi validado com sucesso
        console.log('✅ Cartão validado com sucesso:', setupIntentId);
        
        // Atualizar usuário como tendo cartão verificado
        await db.update(users)
          .set({ 
            updatedAt: new Date()
            // Podemos adicionar um campo cardVerified se necessário
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          message: 'Cartão validado com sucesso',
          cardValid: true,
          setupIntentId: setupIntentId
        };
        
      } else if (setupIntent.status === 'requires_payment_method') {
        return {
          success: false,
          message: 'Cartão inválido ou método de pagamento necessário',
          cardValid: false,
          error: 'CARD_INVALID'
        };
        
      } else if (setupIntent.status === 'requires_confirmation') {
        return {
          success: false,
          message: 'Confirmação do cartão pendente',
          cardValid: false,
          error: 'CONFIRMATION_REQUIRED'
        };
        
      } else {
        return {
          success: false,
          message: `Status do cartão: ${setupIntent.status}`,
          cardValid: false,
          error: 'CARD_STATUS_UNKNOWN'
        };
      }

    } catch (error) {
      console.error('❌ Erro ao verificar Setup Intent:', error);
      return {
        success: false,
        message: 'Erro ao verificar cartão',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Validação básica de dados do cartão (frontend)
   */
  validateCardData(cardData: Partial<CardValidationData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Número do cartão inválido');
    }
    
    if (!cardData.expiryMonth || cardData.expiryMonth < 1 || cardData.expiryMonth > 12) {
      errors.push('Mês de expiração inválido');
    }
    
    if (!cardData.expiryYear || cardData.expiryYear < new Date().getFullYear()) {
      errors.push('Ano de expiração inválido');
    }
    
    if (!cardData.cvc || cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      errors.push('CVC inválido');
    }
    
    if (!cardData.cardholderName || cardData.cardholderName.trim().length < 2) {
      errors.push('Nome do portador inválido');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Limpar dados sensíveis de cartão (nunca armazenar)
   */
  sanitizeCardData(cardData: any): any {
    const sanitized = { ...cardData };
    delete sanitized.cardNumber;
    delete sanitized.cvc;
    return sanitized;
  }
}

export const cardVerificationService = new CardVerificationService();
export default cardVerificationService;
