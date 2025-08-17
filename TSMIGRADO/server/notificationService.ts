import { db } from "./db";
import { notifications } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateNotificationParams {
  tenantId?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
}

export class NotificationService {
  // Criar notificação no banco de dados
  static async createNotification(params: CreateNotificationParams) {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          tenantId: params.tenantId || null,
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          data: params.data || null,
          actionUrl: params.actionUrl || null,
          isRead: false,
        })
        .returning();

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Buscar notificações não lidas de um usuário
  static async getUserNotifications(userId: string, limit: number = 10) {
    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit);

      return userNotifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Marcar notificação como lida
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const [updatedNotification] = await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marcar todas notificações como lidas
  static async markAllAsRead(userId: string) {
    try {
      const updatedNotifications = await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        )
        .returning();

      return updatedNotifications;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Criar notificações de campanhas promocionais baseadas no trial do usuário
  static async createTrialCampaignNotifications(userId: string, userTrialInfo: any) {
    const now = new Date();
    const trialStart = new Date(userTrialInfo.createdAt);
    const daysInTrial = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = userTrialInfo.trialEndsAt 
      ? Math.max(0, Math.ceil((new Date(userTrialInfo.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const notifications = [];

    // Campanha Dia 3: 1 Mês Grátis no Plano Anual
    if (daysInTrial === 3) {
      const notification = await this.createNotification({
        userId,
        type: 'promotional_campaign',
        title: '🎉 Oferta Especial: 1 Mês Grátis!',
        message: 'Assine o plano anual agora e ganhe 1 mês grátis. Apenas hoje!',
        actionUrl: '/upgrade?campaign=day3_annual',
        data: {
          campaign: 'day3_annual',
          discount: '1 mês grátis',
          priority: 'high',
          backgroundColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
          iconColor: 'text-green-600',
          triggerCondition: 'trial_day_3',
          urgency: 'Oferta válida apenas hoje'
        }
      });
      notifications.push(notification);
    }

    // Campanha Dia 4: 20% OFF Permanente
    if (daysInTrial === 4) {
      const notification = await this.createNotification({
        userId,
        type: 'promotional_campaign',
        title: '⚡ Última Chance: 20% OFF!',
        message: 'Assine agora e ganhe 20% de desconto permanente em qualquer plano.',
        actionUrl: '/upgrade?campaign=day4_discount',
        data: {
          campaign: 'day4_discount',
          discount: '20% OFF para sempre',
          priority: 'high',
          backgroundColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
          iconColor: 'text-purple-600',
          triggerCondition: 'trial_day_4',
          urgency: 'Restam apenas 3 dias de trial'
        }
      });
      notifications.push(notification);
    }

    // Campanha Dia 6+: Urgência Final
    if (daysInTrial >= 6) {
      const notification = await this.createNotification({
        userId,
        type: 'urgency_notification',
        title: '⏰ Seu trial expira em breve!',
        message: `Restam apenas ${daysLeft} dia(s). Continue aproveitando todas as funcionalidades Premium.`,
        actionUrl: '/upgrade?campaign=urgency_final',
        data: {
          campaign: 'urgency_final',
          priority: 'urgent',
          backgroundColor: 'bg-gradient-to-r from-red-500 to-orange-600',
          iconColor: 'text-red-600',
          triggerCondition: 'trial_day_6_plus',
          urgency: `Expira em ${daysLeft} dia(s)`,
          daysLeft
        }
      });
      notifications.push(notification);
    }

    // Notificação de Boas-vindas (apenas no primeiro dia ativo)
    if (daysInTrial === 0 && userTrialInfo.isActive) {
      const notification = await this.createNotification({
        userId,
        type: 'welcome',
        title: '🚀 Bem-vindo ao TOIT Nexus!',
        message: 'Sua conta Premium foi ativada. Explore todas as funcionalidades por 7 dias grátis.',
        actionUrl: '/onboarding',
        data: {
          campaign: 'welcome',
          priority: 'medium',
          backgroundColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          iconColor: 'text-blue-600',
          triggerCondition: 'account_activated'
        }
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Verificar e criar campanhas automáticas diárias
  static async processAutomaticCampaigns() {
    try {
      // Buscar usuários em trial ativo
      const trialUsers = await db.query.users.findMany({
        where: (users, { eq, and }) => and(
          eq(users.isTrialActive, true),
          eq(users.isActive, true)
        )
      });

      console.log(`🔔 Processando campanhas automáticas para ${trialUsers.length} usuários em trial`);

      for (const user of trialUsers) {
        try {
          await this.createTrialCampaignNotifications(user.id, user);
        } catch (error) {
          console.error(`Erro ao processar campanhas para usuário ${user.id}:`, error);
        }
      }

      console.log('✅ Campanhas automáticas processadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao processar campanhas automáticas:', error);
      throw error;
    }
  }

  // Contar notificações não lidas
  static async getUnreadCount(userId: string) {
    try {
      const count = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );

      return count.length;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  }
}

// Função para executar processamento automático de campanhas (cron job)
export function startNotificationCron() {
  // Executar campanhas automáticas a cada hora
  setInterval(async () => {
    try {
      await NotificationService.processAutomaticCampaigns();
    } catch (error) {
      console.error('Erro no cron de notificações:', error);
    }
  }, 60 * 60 * 1000); // 1 hora

  console.log('🔔 Cron de notificações iniciado - processamento a cada hora');
}