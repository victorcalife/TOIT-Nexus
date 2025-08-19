/**
 * VERIFICATION SERVICE - Sistema Completo de Verificação Email + Telefone
 * Integração SendGrid (Email) + Twilio (SMS) + Redis (Cache)
 * Funcionalidades: Envio códigos, validação, reenvio, timeout, cleanup
 */

import { nanoid } from 'nanoid';
import { db } from './db';
import { users, tenants, verificationCodes } from '../shared/schema';
import { eq, and, gt } from 'drizzle-orm';

interface VerificationCode {
  id: string;
  user_id: string;
  type: 'email' | 'phone';
  code: string;
  contact: string; // email ou telefone
  expires_at: Date;
  attempts: number;
  verified: boolean;
  created_at: Date;
}

interface SendVerificationResult {
  success: boolean;
  message: string;
  code_id?: string;
  expires_in?: number;
  error?: string;
}

interface VerifyCodeResult {
  success: boolean;
  message: string;
  verified?: boolean;
  remaining_attempts?: number;
  error?: string;
}

class VerificationService {
  private sendgridApiKey: string;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioPhoneNumber: string;
  
  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || '';
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    
    if (!this.sendgridApiKey) {
      console.warn('⚠️ SENDGRID_API_KEY não configurada - emails de verificação não funcionarão');
    }
    
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      console.warn('⚠️ Credenciais Twilio não configuradas - SMS não funcionarão');
    }
  }
  
  /**
   * Gera código de verificação de 6 dígitos
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Envia código de verificação por email
   */
  async sendEmailVerification(userId: string, email: string): Promise<SendVerificationResult> {
    try {
      console.log('📧 Enviando código de verificação por email:', email);
      
      // Verificar se já existe código ativo
      const existingCode = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.user_id, userId),
            eq(verificationCodes.type, 'email'),
            eq(verificationCodes.verified, false),
            gt(verificationCodes.expires_at, new Date())
          )
        )
        .limit(1);
      
      if (existingCode.length > 0) {
        const timeRemaining = Math.ceil((existingCode[0].expires_at.getTime() - new Date().getTime()) / 1000);
        return {
          success: false,
          message: `Código já enviado. Aguarde ${Math.ceil(timeRemaining / 60)} minutos para reenviar.`,
          error: 'CODE_ALREADY_SENT'
        };
      }
      
      // Gerar novo código
      const code = this.generateVerificationCode();
      const codeId = nanoid();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
      
      // Salvar código no banco
      await db.insert(verificationCodes).values({
        id: codeId,
        user_id: userId,
        type: 'email',
        code: code,
        contact: email,
        expires_at: expiresAt,
        attempts: 0,
        verified: false,
        created_at: new Date()
      });
      
      // Enviar email via SendGrid
      if (this.sendgridApiKey) {
        await this.sendEmailViaSendGrid(email, code);
      } else {
        // Modo desenvolvimento - apenas log
        console.log('🔧 [DEV MODE] Código de verificação por email:', code);
      }
      
      return {
        success: true,
        message: 'Código de verificação enviado por email',
        code_id: codeId,
        expires_in: 600 // 10 minutos em segundos
      };
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Envia código de verificação por SMS
   */
  async sendPhoneVerification(userId: string, phone: string): Promise<SendVerificationResult> {
    try {
      console.log('📱 Enviando código de verificação por SMS:', phone);
      
      // Verificar se já existe código ativo
      const existingCode = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.user_id, userId),
            eq(verificationCodes.type, 'phone'),
            eq(verificationCodes.verified, false),
            gt(verificationCodes.expires_at, new Date())
          )
        )
        .limit(1);
      
      if (existingCode.length > 0) {
        const timeRemaining = Math.ceil((existingCode[0].expires_at.getTime() - new Date().getTime()) / 1000);
        return {
          success: false,
          message: `Código já enviado. Aguarde ${Math.ceil(timeRemaining / 60)} minutos para reenviar.`,
          error: 'CODE_ALREADY_SENT'
        };
      }
      
      // Gerar novo código
      const code = this.generateVerificationCode();
      const codeId = nanoid();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
      
      // Salvar código no banco
      await db.insert(verificationCodes).values({
        id: codeId,
        user_id: userId,
        type: 'phone',
        code: code,
        contact: phone,
        expires_at: expiresAt,
        attempts: 0,
        verified: false,
        created_at: new Date()
      });
      
      // Enviar SMS via Twilio
      if (this.twilioAccountSid && this.twilioAuthToken) {
        await this.sendSMSViaTwilio(phone, code);
      } else {
        // Modo desenvolvimento - apenas log
        console.log('🔧 [DEV MODE] Código de verificação por SMS:', code);
      }
      
      return {
        success: true,
        message: 'Código de verificação enviado por SMS',
        code_id: codeId,
        expires_in: 600 // 10 minutos em segundos
      };
      
    } catch (error) {
      console.error('❌ Erro ao enviar SMS de verificação:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Verifica código fornecido pelo usuário
   */
  async verifyCode(userId: string, type: 'email' | 'phone', inputCode: string): Promise<VerifyCodeResult> {
    try {
      console.log(`🔍 Verificando código ${type} para usuário:`, userId);
      
      // Buscar código ativo
      const verificationRecord = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.user_id, userId),
            eq(verificationCodes.type, type),
            eq(verificationCodes.verified, false),
            gt(verificationCodes.expires_at, new Date())
          )
        )
        .limit(1);
      
      if (verificationRecord.length === 0) {
        return {
          success: false,
          message: 'Código não encontrado ou expirado. Solicite um novo código.',
          error: 'CODE_NOT_FOUND'
        };
      }
      
      const record = verificationRecord[0];
      
      // Verificar se já excedeu tentativas
      if (record.attempts >= 3) {
        return {
          success: false,
          message: 'Muitas tentativas incorretas. Solicite um novo código.',
          error: 'MAX_ATTEMPTS_EXCEEDED'
        };
      }
      
      // Incrementar tentativas
      await db
        .update(verificationCodes)
        .set({ attempts: record.attempts + 1 })
        .where(eq(verificationCodes.id, record.id));
      
      // Verificar código
      if (record.code !== inputCode) {
        const remainingAttempts = 3 - (record.attempts + 1);
        return {
          success: false,
          message: `Código incorreto. ${remainingAttempts} tentativas restantes.`,
          remaining_attempts: remainingAttempts,
          error: 'INVALID_CODE'
        };
      }
      
      // Código correto - marcar como verificado
      await db
        .update(verificationCodes)
        .set({ verified: true })
        .where(eq(verificationCodes.id, record.id));
      
      // Atualizar status do usuário
      if (type === 'email') {
        await db
          .update(users)
          .set({ email_verified: true })
          .where(eq(users.id, userId));
      } else {
        await db
          .update(users)
          .set({ phone_verified: true })
          .where(eq(users.id, userId));
      }
      
      // Verificar se usuário pode ser ativado (integração com trial)
      await this.checkTrialActivation(userId);
      
      console.log(`✅ ${type} verificado com sucesso para usuário:`, userId);
      
      return {
        success: true,
        message: `${type === 'email' ? 'Email' : 'Telefone'} verificado com sucesso!`,
        verified: true
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar código:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Reenviar código de verificação
   */
  async resendCode(userId: string, type: 'email' | 'phone'): Promise<SendVerificationResult> {
    try {
      console.log(`🔄 Reenviando código ${type} para usuário:`, userId);
      
      // Invalidar códigos anteriores
      await db
        .update(verificationCodes)
        .set({ verified: true }) // Marca como verificado para invalidar
        .where(
          and(
            eq(verificationCodes.user_id, userId),
            eq(verificationCodes.type, type),
            eq(verificationCodes.verified, false)
          )
        );
      
      // Buscar dados do usuário
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          message: 'Usuário não encontrado',
          error: 'USER_NOT_FOUND'
        };
      }
      
      // Reenviar baseado no tipo
      if (type === 'email' && user[0].email) {
        return await this.sendEmailVerification(userId, user[0].email);
      } else if (type === 'phone' && user[0].phone) {
        return await this.sendPhoneVerification(userId, user[0].phone);
      } else {
        return {
          success: false,
          message: `${type === 'email' ? 'Email' : 'Telefone'} não encontrado no perfil do usuário`,
          error: 'CONTACT_NOT_FOUND'
        };
      }
      
    } catch (error) {
      console.error('❌ Erro ao reenviar código:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Verificar status de verificação do usuário
   */
  async getVerificationStatus(userId: string) {
    try {
      const user = await db
        .select({
          email_verified: users.email_verified,
          phone_verified: users.phone_verified,
          email: users.email,
          phone: users.phone
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (user.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      return {
        success: true,
        data: {
          email_verified: user[0].email_verified || false,
          phone_verified: user[0].phone_verified || false,
          has_email: !!user[0].email,
          has_phone: !!user[0].phone
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar status de verificação:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Cleanup de códigos expirados (executar via cron job)
   */
  async cleanupExpiredCodes(): Promise<number> {
    try {
      const result = await db
        .delete(verificationCodes)
        .where(
          and(
            eq(verificationCodes.verified, false),
            gt(new Date(), verificationCodes.expires_at)
          )
        );
      
      console.log(`🧹 Cleanup: ${result.rowCount || 0} códigos expirados removidos`);
      return result.rowCount || 0;
      
    } catch (error) {
      console.error('❌ Erro no cleanup de códigos expirados:', error);
      return 0;
    }
  }
  
  /**
   * Enviar email via SendGrid
   */
  private async sendEmailViaSendGrid(email: string, code: string): Promise<void> {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.sendgridApiKey);
      
      const msg = {
        to: email,
        from: 'noreply@toit.com.br', // Usar email verificado no SendGrid
        subject: 'Código de Verificação - TOIT Nexus',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">TOIT Nexus</h1>
              <p style="color: #6b7280; margin: 5px 0;">Plataforma Empresarial Inteligente</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 30px; border-radius: 8px; text-align: center;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Código de Verificação</h2>
              <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${code}</span>
              </div>
              <p style="color: #6b7280; margin: 10px 0;">Este código expira em 10 minutos</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px;">
                Se você não solicitou este código, ignore este email.<br>
                Este é um email automático, não responda.
              </p>
            </div>
          </div>
        `
      };
      
      await sgMail.send(msg);
      console.log('✅ Email de verificação enviado via SendGrid');
      
    } catch (error) {
      console.error('❌ Erro ao enviar email via SendGrid:', error);
      throw error;
    }
  }
  
  /**
   * Enviar SMS via Twilio
   */
  private async sendSMSViaTwilio(phone: string, code: string): Promise<void> {
    try {
      const twilio = require('twilio');
      const client = twilio(this.twilioAccountSid, this.twilioAuthToken);
      
      // Formatar número de telefone para padrão internacional
      const formattedPhone = phone.startsWith('+') ? phone : `+55${phone.replace(/\D/g, '')}`;
      
      const message = await client.messages.create({
        body: `Seu código de verificação TOIT Nexus: ${code}\n\nExpira em 10 minutos.\n\nSe você não solicitou, ignore esta mensagem.`,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });
      
      console.log('✅ SMS de verificação enviado via Twilio:', message.sid);
      
    } catch (error) {
      console.error('❌ Erro ao enviar SMS via Twilio:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário trial pode ser ativado após verificação
   */
  private async checkTrialActivation(userId: string): Promise<void> {
    try {
      const user = await db
        .select({
          id: users.id,
          email_verified: users.email_verified,
          phone_verified: users.phone_verified,
          phone: users.phone,
          isActive: users.isActive,
          isTrialActive: users.isTrialActive
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) return;

      const userData = user[0];
      
      // Verificar se é conta trial inativa
      if (userData.isTrialActive && !userData.isActive) {
        const emailVerified = userData.email_verified || false;
        const phoneVerified = userData.phone_verified || false;
        const phoneRequired = !!userData.phone;
        
        // Ativar se email verificado E (telefone verificado OU telefone não obrigatório)
        if (emailVerified && (phoneVerified || !phoneRequired)) {
          await db
            .update(users)
            .set({ 
              isActive: true,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
            
          console.log(`🎉 Conta trial ativada automaticamente para usuário: ${userId}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar ativação de trial:', error);
      // Não quebrar o fluxo se der erro na ativação
    }
  }
}

export const verificationService = new VerificationService();
export { VerificationService, SendVerificationResult, VerifyCodeResult };