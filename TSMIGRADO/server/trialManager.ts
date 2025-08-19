import { db } from './db';
import { users } from '@shared/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import { sendTrialExpiredEmail } from './emailService';

export class TrialManager {
  
  /**
   * Verifica e processa trials expirados
   * Deve ser executado diariamente via cron job
   */
  static async processExpiredTrials(): Promise<void> {
    try {
      console.log('🔍 Verificando trials expirados...');
      
      const now = new Date();
      
      // Buscar usuários com trial ativo e expirado
      const expiredTrialUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          trialPlan: users.trialPlan,
          trialEndsAt: users.trialEndsAt,
          isTrialActive: users.isTrialActive,
          planType: users.planType
        })
        .from(users)
        .where(
          and(
            eq(users.isTrialActive, true),
            lte(users.trialEndsAt, now),
            eq(users.isActive, true) // Apenas usuários ativos
          )
        );

      console.log(`📊 Encontrados ${expiredTrialUsers.length} trials expirados`);

      if (expiredTrialUsers.length === 0) {
        console.log('✅ Nenhum trial expirado encontrado');
        return;
      }

      // Processar cada usuário com trial expirado
      for (const user of expiredTrialUsers) {
        try {
          console.log(`⏰ Processando trial expirado: ${user.email}`);
          
          // Desativar trial do usuário
          await db
            .update(users)
            .set({
              isTrialActive: false,
              isActive: false, // Desativar conta até pagamento
              updatedAt: now
            })
            .where(eq(users.id, user.id));

          // Enviar email de trial expirado
          if (user.email && user.firstName) {
            const userName = `${user.firstName} ${user.lastName || ''}`.trim();
            const planName = user.trialPlan || user.planType || 'premium';
            
            const emailSent = await sendTrialExpiredEmail(
              user.email,
              userName,
              planName
            );

            if (emailSent) {
              console.log(`✅ Email de trial expirado enviado para: ${user.email}`);
            } else {
              console.log(`⚠️ Falha ao enviar email para: ${user.email}`);
            }
          }

        } catch (error) {
          console.error(`❌ Erro ao processar usuário ${user.email}:`, error);
          // Continuar com outros usuários mesmo se um falhar
        }
      }

      console.log(`✅ Processamento de trials expirados concluído. ${expiredTrialUsers.length} usuários processados.`);

    } catch (error) {
      console.error('❌ Erro ao processar trials expirados:', error);
      throw error;
    }
  }

  /**
   * Verifica trials que vão expirar em 1-3 dias
   * Para enviar lembretes de vencimento
   */
  static async processTrialReminders(): Promise<void> {
    try {
      console.log('📬 Verificando trials para lembrete de vencimento...');
      
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      
      // Buscar usuários com trial ativo que vence em 1-3 dias
      const soonToExpireTrials = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          trialPlan: users.trialPlan,
          trialEndsAt: users.trialEndsAt,
          planType: users.planType
        })
        .from(users)
        .where(
          and(
            eq(users.isTrialActive, true),
            eq(users.isActive, true),
            lte(users.trialEndsAt, threeDaysFromNow),
            lte(oneDayFromNow, users.trialEndsAt) // Não incluir os que vão expirar hoje
          )
        );

      console.log(`📊 Encontrados ${soonToExpireTrials.length} trials próximos do vencimento`);

      for (const user of soonToExpireTrials) {
        try {
          // Calcular dias restantes
          const daysLeft = Math.ceil((new Date(user.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`⏰ Trial de ${user.email} expira em ${daysLeft} dias`);
          
          // TODO: Implementar email de lembrete de trial
          // await sendTrialReminderEmail(user.email, userName, planName, daysLeft);

        } catch (error) {
          console.error(`❌ Erro ao processar lembrete para ${user.email}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao processar lembretes de trial:', error);
      throw error;
    }
  }

  /**
   * Reativar conta após pagamento de usuário com trial expirado
   */
  static async reactivateAfterPayment(userId: string, newPlanType: string): Promise<boolean> {
    try {
      console.log(`💰 Reativando conta após pagamento: ${userId}`);
      
      const now = new Date();
      
      await db
        .update(users)
        .set({
          isActive: true,
          isTrialActive: false,
          planType: newPlanType,
          updatedAt: now
        })
        .where(eq(users.id, userId));

      console.log(`✅ Conta reativada com sucesso: ${userId} - Novo plano: ${newPlanType}`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao reativar conta ${userId}:`, error);
      return false;
    }
  }

  /**
   * Obter estatísticas de trials
   */
  static async getTrialStats(): Promise<{
    activeTrials: number;
    expiredTrials: number;
    expiringSoon: number;
    totalTrialsCreated: number;
  }> {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Trials ativos
      const activeTrialsResult = await db
        .selectDistinct({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.isTrialActive, true),
            eq(users.isActive, true),
            lte(now, users.trialEndsAt)
          )
        );

      // Trials expirados
      const expiredTrialsResult = await db
        .selectDistinct({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.isTrialActive, false),
            lte(users.trialEndsAt, now)
          )
        );

      // Trials que vão expirar em 3 dias
      const expiringSoonResult = await db
        .selectDistinct({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.isTrialActive, true),
            eq(users.isActive, true),
            lte(users.trialEndsAt, threeDaysFromNow),
            lte(now, users.trialEndsAt)
          )
        );

      // Total de trials já criados
      const totalTrialsResult = await db
        .selectDistinct({ id: users.id })
        .from(users)
        .where(
          and(
            isNull(users.tenantId), // Usuários individuais
            // Qualquer usuário que já teve trial
            lte(users.createdAt, now)
          )
        );

      return {
        activeTrials: activeTrialsResult.length,
        expiredTrials: expiredTrialsResult.length,
        expiringSoon: expiringSoonResult.length,
        totalTrialsCreated: totalTrialsResult.length
      };

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de trial:', error);
      return {
        activeTrials: 0,
        expiredTrials: 0,
        expiringSoon: 0,
        totalTrialsCreated: 0
      };
    }
  }
}

/**
 * Inicializar cron job para processamento automático de trials
 * Executa todos os dias às 09:00
 */
export function initializeTrialCronJob() {
  console.log('⏰ Inicializando cron job de gestão de trials...');
  
  // Para desenvolvimento, processar a cada 5 minutos
  // Em produção, alterar para execução diária
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cronInterval = isDevelopment ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000; // 5min dev / 24h prod
  
  setInterval(async () => {
    try {
      console.log('🔄 Executando processamento automático de trials...');
      await TrialManager.processExpiredTrials();
      await TrialManager.processTrialReminders();
    } catch (error) {
      console.error('❌ Erro no cron job de trials:', error);
    }
  }, cronInterval);

  console.log(`✅ Cron job de trials configurado (intervalo: ${isDevelopment ? '5 minutos' : '24 horas'})`);
}

export default TrialManager;