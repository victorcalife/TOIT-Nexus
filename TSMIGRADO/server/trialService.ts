import { db } from './db.js';
import { users, tenants } from '../shared/schema.js';
import { eq, and, lt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { verificationService } from './verificationService';

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
  constructor() {
    // Sistema de verificação integrado via verificationService
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

      // Enviar códigos de verificação usando o sistema moderno
      if (userData.email) {
        await verificationService.sendEmailVerification(userId, userData.email);
      }
      
      if (userData.phone) {
        await verificationService.sendPhoneVerification(userId, userData.phone.replace(/\D/g, ''));
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
   * Ativa conta após verificação completa
   */
  async activateAccountAfterVerification(userId: string) {
    try {
      await db.update(users)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      console.log(`✅ Conta trial ativada para usuário: ${userId}`);
      return { success: true, message: 'Conta ativada com sucesso!' };

    } catch (error) {
      console.error('❌ Erro ao ativar conta:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário está com verificação completa e ativa conta
   */
  async checkAndActivateAccount(userId: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se ambas verificações estão completas
      const emailVerified = user.email_verified || false;
      const phoneVerified = user.phone_verified || false;
      const phoneRequired = !!user.phone; // Só exige verificação se tem telefone
      
      if (emailVerified && (phoneVerified || !phoneRequired)) {
        // Ativar conta trial
        await this.activateAccountAfterVerification(userId);
        return { success: true, accountActivated: true };
      }

      return { success: true, accountActivated: false };

    } catch (error) {
      console.error('❌ Erro ao verificar ativação da conta:', error);
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

        // Email de notificação será enviado via sistema de email automático
        console.log(`📧 Trial expirado para usuário: ${user.email}`);
      }

      console.log(`${expiredUsers.length} trials expirados desativados`);
      return expiredUsers.length;

    } catch (error) {
      console.error('Erro ao desativar trials expirados:', error);
      throw error;
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