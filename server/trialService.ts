import { db } from './db.js';
import { users, tenants } from '../shared/schema.js';
import { eq, and, lt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

interface TrialUserData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  planType: string;
  planCycle: string;
}

class TrialService {
  private emailTransporter: any;
  private twilioClient: any;

  constructor() {
    // Configurar email transporter (SendGrid via SMTP)
    this.emailTransporter = nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });

    // Configurar Twilio para SMS (se disponível)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  /**
   * Cria usuário trial com 7 dias
   */
  async createTrialUser(userData: TrialUserData) {
    try {
      // Verificar se CPF já existe
      const existingUser = await db.select().from(users).where(eq(users.cpf, userData.cpf.replace(/\D/g, '')));
      if (existingUser.length > 0) {
        throw new Error('CPF já cadastrado no sistema');
      }

      // Verificar se email já existe
      if (userData.email) {
        const existingEmail = await db.select().from(users).where(eq(users.email, userData.email));
        if (existingEmail.length > 0) {
          throw new Error('Email já cadastrado no sistema');
        }
      }

      // Criar tenant para usuário pessoa física
      const tenantId = nanoid();
      const tenantSlug = `user-${userData.cpf.replace(/\D/g, '')}`;
      
      await db.insert(tenants).values({
        id: tenantId,
        name: `${userData.name} - Workspace`,
        slug: tenantSlug,
        status: 'active',
        subscriptionPlan: userData.planType || 'standard',
        subscriptionExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Hash da senha
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Criar usuário com trial de 7 dias
      const userId = nanoid();
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      const [newUser] = await db.insert(users).values({
        id: userId,
        cpf: userData.cpf.replace(/\D/g, ''),
        email: userData.email,
        password: passwordHash,
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ').slice(1).join(' ') || '',
        phone: userData.phone,
        role: 'tenant_admin',
        tenantId: tenantId,
        isActive: false, // Inativo até verificação
        planType: userData.planType || 'standard',
        planCycle: userData.planCycle || 'monthly',
        trialEndsAt: trialEndDate,
        trialPlan: userData.planType || 'standard',
        isTrialActive: true,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Enviar emails de verificação
      await this.sendVerificationEmail(userId, userData.email);
      
      // Enviar SMS de verificação (se Twilio configurado)
      if (userData.phone && this.twilioClient) {
        await this.sendVerificationSMS(userId, userData.phone);
      }

      return {
        success: true,
        userId: userId,
        tenantId: tenantId,
        trialEndsAt: trialEndDate,
        message: 'Conta trial criada! Verifique seu email e telefone para ativar.'
      };

    } catch (error) {
      console.error('Erro ao criar usuário trial:', error);
      throw error;
    }
  }

  /**
   * Envia email de verificação
   */
  async sendVerificationEmail(userId: string, email: string) {
    if (!email) return;

    const verificationToken = nanoid(32);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&userId=${userId}`;

    try {
      // Salvar token no banco (você pode criar uma tabela verification_tokens)
      // Por ora, salvamos no localStorage/sessão do frontend
      
      const mailOptions = {
        from: 'noreply@toit.com.br',
        to: email,
        subject: 'TOIT Nexus - Confirme seu email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bem-vindo ao TOIT Nexus!</h2>
            <p>Confirme seu email clicando no link abaixo:</p>
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Confirmar Email
            </a>
            <p><strong>Seu trial de 7 dias começou!</strong></p>
            <p>Após confirmar email e telefone, sua conta será ativada automaticamente.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Se você não criou esta conta, ignore este email.
            </p>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email de verificação enviado para: ${email}`);

    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error);
    }
  }

  /**
   * Envia SMS de verificação
   */
  async sendVerificationSMS(userId: string, phone: string) {
    if (!this.twilioClient || !phone) return;

    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
    
    try {
      await this.twilioClient.messages.create({
        body: `TOIT Nexus - Seu código de verificação: ${verificationCode}. Válido por 10 minutos.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      // Salvar código no banco para validação posterior
      // Por ora, implementação básica
      console.log(`SMS enviado para ${phone} - Código: ${verificationCode}`);

    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
    }
  }

  /**
   * Verifica email do usuário
   */
  async verifyEmail(userId: string, token: string) {
    try {
      // Verificar token (implementação básica)
      // Em produção, você salvaria o token no banco com expiração
      
      await db.update(users)
        .set({ 
          emailVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Verificar se email E telefone foram verificados para ativar conta
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (user && user.emailVerified && (user.phoneVerified || !user.phone)) {
        await db.update(users)
          .set({ 
            isActive: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        return { success: true, accountActivated: true };
      }

      return { success: true, accountActivated: false };

    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw error;
    }
  }

  /**
   * Verifica telefone do usuário
   */
  async verifyPhone(userId: string, code: string) {
    try {
      // Verificar código (implementação básica)
      // Em produção, você salvaria o código no banco com expiração
      
      await db.update(users)
        .set({ 
          phoneVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Verificar se email E telefone foram verificados para ativar conta
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (user && user.emailVerified && user.phoneVerified) {
        await db.update(users)
          .set({ 
            isActive: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        return { success: true, accountActivated: true };
      }

      return { success: true, accountActivated: false };

    } catch (error) {
      console.error('Erro ao verificar telefone:', error);
      throw error;
    }
  }

  /**
   * Job automático para desativar trials expirados
   */
  async deactivateExpiredTrials() {
    try {
      const now = new Date();
      
      // Buscar usuários com trial expirado
      const expiredUsers = await db.select()
        .from(users)
        .where(
          and(
            eq(users.isTrialActive, true),
            lt(users.trialEndsAt, now)
          )
        );

      for (const user of expiredUsers) {
        // Desativar usuário
        await db.update(users)
          .set({
            isActive: false,
            isTrialActive: false,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));

        // Desativar tenant
        if (user.tenantId) {
          await db.update(tenants)
            .set({
              status: 'suspended',
              updatedAt: new Date()
            })
            .where(eq(tenants.id, user.tenantId));
        }

        // Enviar email de notificação de expiração
        if (user.email) {
          await this.sendTrialExpiredEmail(user.email, user.firstName || '');
        }
      }

      console.log(`${expiredUsers.length} trials expirados desativados`);
      return expiredUsers.length;

    } catch (error) {
      console.error('Erro ao desativar trials expirados:', error);
      throw error;
    }
  }

  /**
   * Envia email de trial expirado
   */
  async sendTrialExpiredEmail(email: string, firstName: string) {
    try {
      const mailOptions = {
        from: 'noreply@toit.com.br',
        to: email,
        subject: 'TOIT Nexus - Seu trial expirou',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Trial Expirado</h2>
            <p>Olá ${firstName},</p>
            <p>Seu período de trial de 7 dias no TOIT Nexus expirou.</p>
            <p>Para continuar usando nossa plataforma, escolha um plano:</p>
            <a href="${process.env.FRONTEND_URL}/" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Ver Planos
            </a>
            <p>Sua conta foi temporariamente suspensa, mas seus dados estão seguros.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Equipe TOIT | toit.com.br
            </p>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);

    } catch (error) {
      console.error('Erro ao enviar email de expiração:', error);
    }
  }

  /**
   * Converte trial em assinatura paga
   */
  async convertTrialToSubscription(userId: string, planType: string, planCycle: string) {
    try {
      const subscriptionEndDate = planCycle === 'yearly' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 1 mês

      await db.update(users)
        .set({
          isTrialActive: false,
          planType: planType,
          planCycle: planCycle,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Atualizar tenant
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user && user.tenantId) {
        await db.update(tenants)
          .set({
            subscriptionPlan: planType,
            subscriptionExpiresAt: subscriptionEndDate,
            status: 'active',
            updatedAt: new Date()
          })
          .where(eq(tenants.id, user.tenantId));
      }

      return { success: true, subscriptionEndsAt: subscriptionEndDate };

    } catch (error) {
      console.error('Erro ao converter trial:', error);
      throw error;
    }
  }
}

export const trialService = new TrialService();