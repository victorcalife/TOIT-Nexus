import { db } from './db';
import { users, tenants, accessProfiles, tenantModules } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { sendToitNexusWelcomeEmail } from './emailService';

export interface PlanChangeRequest {
  userId: string;
  currentPlan: string;
  targetPlan: string;
  changeType: 'upgrade' | 'downgrade' | 'sidegrade';
  effectiveDate?: Date;
  prorationAmount?: number;
  reason?: string;
}

export interface PlanChangeResult {
  success: boolean;
  message: string;
  transactionId?: string;
  effectiveDate: Date;
  prorationAmount?: number;
  oldPlan: string;
  newPlan: string;
}

export interface PlanComparison {
  currentPlan: {
    slug: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    modules: string[];
    limits: any;
  };
  targetPlan: {
    slug: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    modules: string[];
    limits: any;
  };
  changes: {
    priceChange: number;
    addedModules: string[];
    removedModules: string[];
    changeType: 'upgrade' | 'downgrade' | 'sidegrade';
  };
}

export class PlanManagementService {

  /**
   * Solicitar mudança de plano
   */
  static async requestPlanChange(request: PlanChangeRequest): Promise<PlanChangeResult> {
    try {
      console.log(`🔄 Processando mudança de plano: ${request.currentPlan} → ${request.targetPlan}`);

      // Validar usuário existe
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (!user.length) {
        return {
          success: false,
          message: 'Usuário não encontrado',
          effectiveDate: new Date(),
          oldPlan: request.currentPlan,
          newPlan: request.targetPlan
        };
      }

      // Validar planos existem
      const [currentProfile, targetProfile] = await Promise.all([
        db.select().from(accessProfiles).where(eq(accessProfiles.slug, request.currentPlan)).limit(1),
        db.select().from(accessProfiles).where(eq(accessProfiles.slug, request.targetPlan)).limit(1)
      ]);

      if (!currentProfile.length || !targetProfile.length) {
        return {
          success: false,
          message: 'Plano não encontrado',
          effectiveDate: new Date(),
          oldPlan: request.currentPlan,
          newPlan: request.targetPlan
        };
      }

      // Calcular proração se necessário
      const prorationAmount = this.calculateProration(
        currentProfile[0], 
        targetProfile[0], 
        new Date(user[0].createdAt)
      );

      // Executar mudança de plano
      const changeResult = await this.executePlanChange(
        user[0], 
        currentProfile[0], 
        targetProfile[0], 
        prorationAmount,
        request.reason
      );

      return changeResult;

    } catch (error) {
      console.error('❌ Erro ao processar mudança de plano:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
        effectiveDate: new Date(),
        oldPlan: request.currentPlan,
        newPlan: request.targetPlan
      };
    }
  }

  /**
   * Executar mudança de plano
   */
  private static async executePlanChange(
    user: any,
    currentProfile: any,
    targetProfile: any,
    prorationAmount: number,
    reason?: string
  ): Promise<PlanChangeResult> {
    const effectiveDate = new Date();
    const transactionId = `PC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Atualizar usuário com novo plano
      await db
        .update(users)
        .set({
          planType: targetProfile.slug,
          updatedAt: effectiveDate
        })
        .where(eq(users.id, user.id));

      // Atualizar módulos do tenant se necessário
      if (user.tenantId) {
        await this.updateTenantModules(user.tenantId, targetProfile.slug);
      }

      // Log da mudança (poderia ser uma tabela de auditoria)
      console.log(`✅ Mudança de plano executada: ${user.email} | ${currentProfile.slug} → ${targetProfile.slug} | ${transactionId}`);

      // Enviar email de confirmação
      if (user.email) {
        try {
          await sendToitNexusWelcomeEmail(
            user.email,
            `${user.firstName} ${user.lastName || ''}`.trim(),
            targetProfile.slug,
            undefined, // sem nova senha
            user.tenantId,
            false // não é trial
          );
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de confirmação:', emailError);
          // Não falha a operação por erro de email
        }
      }

      return {
        success: true,
        message: `Plano alterado com sucesso para ${targetProfile.name}`,
        transactionId,
        effectiveDate,
        prorationAmount: prorationAmount !== 0 ? prorationAmount : undefined,
        oldPlan: currentProfile.slug,
        newPlan: targetProfile.slug
      };

    } catch (error) {
      console.error('❌ Erro ao executar mudança de plano:', error);
      return {
        success: false,
        message: 'Falha ao executar mudança de plano',
        effectiveDate,
        oldPlan: currentProfile.slug,
        newPlan: targetProfile.slug
      };
    }
  }

  /**
   * Calcular proração
   */
  private static calculateProration(
    currentProfile: any,
    targetProfile: any,
    subscriptionStart: Date
  ): number {
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysInMonth = 30; // Simplificado
    const remainingDays = Math.max(0, daysInMonth - (daysSinceStart % daysInMonth));

    // Calcular diferença de preço
    const priceDifference = (targetProfile.price_monthly || 0) - (currentProfile.price_monthly || 0);
    
    // Proração proporcional aos dias restantes
    const prorationAmount = (priceDifference * remainingDays) / daysInMonth;

    return Math.round(prorationAmount * 100) / 100; // Arredondar para 2 decimais
  }

  /**
   * Atualizar módulos do tenant
   */
  private static async updateTenantModules(tenantId: string, newPlanSlug: string) {
    try {
      // Buscar perfil do novo plano
      const profile = await db
        .select()
        .from(accessProfiles)
        .where(eq(accessProfiles.slug, newPlanSlug))
        .limit(1);

      if (!profile.length) return;

      // Obter módulos disponíveis para o novo plano
      const availableModules = profile[0].available_modules as string[] || [];

      // Atualizar módulos do tenant (remover todos e adicionar os do novo plano)
      await db
        .delete(tenantModules)
        .where(eq(tenantModules.tenantId, tenantId));

      // Adicionar módulos do novo plano
      if (availableModules.length > 0) {
        const moduleInserts = availableModules.map(moduleCode => ({
          tenantId,
          moduleCode,
          isActive: true,
          activatedAt: new Date()
        }));

        await db.insert(tenantModules).values(moduleInserts);
      }

      console.log(`✅ Módulos atualizados para tenant ${tenantId}: ${availableModules.join(', ')}`);

    } catch (error) {
      console.error('❌ Erro ao atualizar módulos do tenant:', error);
      // Não falha a operação principal
    }
  }

  /**
   * Comparar planos
   */
  static async comparePlans(currentPlanSlug: string, targetPlanSlug: string): Promise<PlanComparison | null> {
    try {
      const [currentProfile, targetProfile] = await Promise.all([
        db.select().from(accessProfiles).where(eq(accessProfiles.slug, currentPlanSlug)).limit(1),
        db.select().from(accessProfiles).where(eq(accessProfiles.slug, targetPlanSlug)).limit(1)
      ]);

      if (!currentProfile.length || !targetProfile.length) {
        return null;
      }

      const current = currentProfile[0];
      const target = targetProfile[0];

      const currentModules = (current.available_modules as string[]) || [];
      const targetModules = (target.available_modules as string[]) || [];

      const addedModules = targetModules.filter(m => !currentModules.includes(m));
      const removedModules = currentModules.filter(m => !targetModules.includes(m));

      const priceChange = (target.price_monthly || 0) - (current.price_monthly || 0);
      
      let changeType: 'upgrade' | 'downgrade' | 'sidegrade' = 'sidegrade';
      if (priceChange > 0) changeType = 'upgrade';
      else if (priceChange < 0) changeType = 'downgrade';

      return {
        currentPlan: {
          slug: current.slug,
          name: current.name,
          priceMonthly: current.price_monthly || 0,
          priceYearly: current.price_yearly || 0,
          modules: currentModules,
          limits: current.limits || {}
        },
        targetPlan: {
          slug: target.slug,
          name: target.name,
          priceMonthly: target.price_monthly || 0,
          priceYearly: target.price_yearly || 0,
          modules: targetModules,
          limits: target.limits || {}
        },
        changes: {
          priceChange,
          addedModules,
          removedModules,
          changeType
        }
      };

    } catch (error) {
      console.error('❌ Erro ao comparar planos:', error);
      return null;
    }
  }

  /**
   * Obter planos disponíveis para upgrade/downgrade
   */
  static async getAvailablePlans(currentPlanSlug: string): Promise<any[]> {
    try {
      // Buscar todos os planos ativos exceto o atual
      const availablePlans = await db
        .select()
        .from(accessProfiles)
        .where(eq(accessProfiles.is_active, true));

      return availablePlans
        .filter(plan => plan.slug !== currentPlanSlug)
        .map(plan => ({
          slug: plan.slug,
          name: plan.name,
          priceMonthly: plan.price_monthly || 0,
          priceYearly: plan.price_yearly || 0,
          description: plan.description,
          modules: (plan.available_modules as string[]) || [],
          limits: plan.limits || {},
          isPopular: plan.slug === 'standard' // Marcar plano mais popular
        }))
        .sort((a, b) => a.priceMonthly - b.priceMonthly); // Ordenar por preço

    } catch (error) {
      console.error('❌ Erro ao obter planos disponíveis:', error);
      return [];
    }
  }

  /**
   * Verificar se mudança de plano é permitida
   */
  static async canChangePlan(userId: string, targetPlanSlug: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return { allowed: false, reason: 'Usuário não encontrado' };
      }

      const userData = user[0];

      // Verificar se está em trial
      if (userData.isTrialActive) {
        return { allowed: false, reason: 'Não é possível alterar plano durante o período de trial' };
      }

      // Verificar se conta está ativa
      if (!userData.isActive) {
        return { allowed: false, reason: 'Conta inativa - reative sua conta antes de alterar o plano' };
      }

      // Verificar se o plano alvo existe e está ativo
      const targetProfile = await db
        .select()
        .from(accessProfiles)
        .where(and(
          eq(accessProfiles.slug, targetPlanSlug),
          eq(accessProfiles.is_active, true)
        ))
        .limit(1);

      if (!targetProfile.length) {
        return { allowed: false, reason: 'Plano selecionado não está disponível' };
      }

      // Verificar se não é o mesmo plano atual
      if (userData.planType === targetPlanSlug) {
        return { allowed: false, reason: 'Este já é o seu plano atual' };
      }

      // Verificar restrições específicas (exemplo: não permitir downgrade para gratuito)
      if (targetPlanSlug === 'gratuito') {
        return { allowed: false, reason: 'Downgrade para plano gratuito não permitido. Entre em contato com o suporte.' };
      }

      return { allowed: true };

    } catch (error) {
      console.error('❌ Erro ao verificar permissão de mudança de plano:', error);
      return { allowed: false, reason: 'Erro interno do servidor' };
    }
  }

  /**
   * Obter histórico de mudanças de plano (placeholder)
   */
  static async getPlanChangeHistory(userId: string): Promise<any[]> {
    // Placeholder - em produção seria uma tabela de auditoria
    return [
      {
        id: '1',
        fromPlan: 'basico',
        toPlan: 'standard',
        changeDate: new Date('2025-01-15'),
        changeType: 'upgrade',
        reason: 'Necessidade de mais funcionalidades',
        prorationAmount: 15.50
      }
    ];
  }

  /**
   * Cancelar assinatura (downgrade para inativo)
   */
  static async cancelSubscription(
    userId: string, 
    reason: string,
    effectiveDate?: Date
  ): Promise<PlanChangeResult> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return {
          success: false,
          message: 'Usuário não encontrado',
          effectiveDate: new Date(),
          oldPlan: 'unknown',
          newPlan: 'cancelled'
        };
      }

      const userData = user[0];
      const currentPlan = userData.planType || 'unknown';
      const cancelDate = effectiveDate || new Date();

      // Desativar usuário
      await db
        .update(users)
        .set({
          isActive: false,
          planType: null,
          updatedAt: cancelDate
        })
        .where(eq(users.id, userId));

      // Desativar módulos do tenant
      if (userData.tenantId) {
        await db
          .update(tenantModules)
          .set({ isActive: false })
          .where(eq(tenantModules.tenantId, userData.tenantId));
      }

      console.log(`❌ Assinatura cancelada: ${userData.email} | Plano: ${currentPlan} | Motivo: ${reason}`);

      return {
        success: true,
        message: 'Assinatura cancelada com sucesso',
        effectiveDate: cancelDate,
        oldPlan: currentPlan,
        newPlan: 'cancelled'
      };

    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error);
      return {
        success: false,
        message: 'Erro ao cancelar assinatura',
        effectiveDate: new Date(),
        oldPlan: 'unknown',
        newPlan: 'cancelled'
      };
    }
  }
}

export default PlanManagementService;