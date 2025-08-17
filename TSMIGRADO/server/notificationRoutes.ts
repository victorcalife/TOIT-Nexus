/**
 * NOTIFICATION ROUTES - Sistema completo de notificações
 * Endpoints: GET /notifications, POST /notifications/:id/read, POST /notifications/read-all
 * Integração com NotificationService + Campanhas automáticas + Trial management
 */

import { Router } from 'express';
import { authMiddleware } from './authMiddleware';
import { NotificationService } from './notificationService';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/notifications
 * Buscar notificações ativas do usuário com campanhas personalizadas
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    console.log('📬 Buscando notificações para usuário:', userId);

    // Buscar informações do usuário
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    // Calcular informações do trial
    const now = new Date();
    const trialStart = new Date(user.createdAt);
    const daysInTrial = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const daysLeft = trialEndsAt 
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const userTrialInfo = {
      daysInTrial,
      daysLeft,
      isTrialActive: user.isTrialActive || false,
      trialPlan: user.selectedPlan || 'basico',
      trialEndsAt: user.trialEndsAt,
      createdAt: user.createdAt,
      isActive: user.isActive || false
    };

    // Processar campanhas automáticas para este usuário específico
    let campaignNotifications = [];
    try {
      if (user.isTrialActive) {
        campaignNotifications = await NotificationService.createTrialCampaignNotifications(userId, userTrialInfo);
      }
    } catch (error) {
      console.error('Erro ao processar campanhas automáticas:', error);
    }

    // Buscar notificações existentes no banco
    const dbNotifications = await NotificationService.getUserNotifications(userId, 20);

    // Carregar notificações de campanha do arquivo JSON
    const fs = require('fs');
    const path = require('path');
    const notificationsFilePath = path.join(process.cwd(), 'notifications.json');
    
    let jsonNotifications = [];
    try {
      if (fs.existsSync(notificationsFilePath)) {
        const jsonData = fs.readFileSync(notificationsFilePath, 'utf8');
        const allNotifications = JSON.parse(jsonData);
        
        // Filtrar notificações baseadas no contexto do usuário
        jsonNotifications = allNotifications.filter((notification: any) => {
          const trigger = notification.triggerCondition;
          const isActive = notification.isActive;
          const notExpired = !notification.expiresAt || new Date(notification.expiresAt) > now;
          
          if (!isActive || !notExpired) return false;
          
          // Filtrar por condições de trigger
          switch (trigger) {
            case 'trial_day_3':
              return daysInTrial === 3 && user.isTrialActive;
            case 'trial_day_4':
              return daysInTrial === 4 && user.isTrialActive;
            case 'trial_day_6_plus':
              return daysInTrial >= 6 && user.isTrialActive;
            case 'account_activated':
              return daysInTrial <= 1 && user.isActive;
            default:
              return false;
          }
        }).map((notification: any) => {
          // Personalizar mensagem com variáveis
          let personalizedMessage = notification.message;
          if (personalizedMessage.includes('{daysLeft}')) {
            personalizedMessage = personalizedMessage.replace('{daysLeft}', daysLeft.toString());
          }
          
          return {
            ...notification,
            message: personalizedMessage,
            userContext: userTrialInfo
          };
        });
      }
    } catch (error) {
      console.error('Erro ao carregar notificações JSON:', error);
    }

    // Combinar todas as notificações
    const allNotifications = [
      ...jsonNotifications,
      ...dbNotifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        actionText: 'Ver detalhes',
        actionUrl: notif.actionUrl || '/dashboard',
        priority: notif.data?.priority || 'medium',
        targetAudience: 'user',
        triggerCondition: notif.data?.triggerCondition || 'manual',
        backgroundColor: notif.data?.backgroundColor || 'bg-blue-100',
        iconColor: notif.data?.iconColor || 'text-blue-600',
        createdAt: notif.createdAt,
        expiresAt: null,
        isActive: true,
        userContext: userTrialInfo
      }))
    ];

    // Ordenar por prioridade
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    allNotifications.sort((a, b) => {
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
      return priorityA - priorityB;
    });

    console.log(`✅ Enviando ${allNotifications.length} notificações para usuário ${userId}`);

    res.status(200).json({
      success: true,
      notifications: allNotifications,
      count: allNotifications.length,
      userInfo: userTrialInfo
    });

  } catch (error) {
    console.error('❌ Erro na rota de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/notifications/:id/read
 * Marcar notificação específica como lida
 */
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'ID da notificação é obrigatório',
        error: 'NOTIFICATION_ID_REQUIRED'
      });
    }

    console.log(`📖 Marcando notificação ${notificationId} como lida para usuário ${userId}`);

    // Tentar marcar como lida no banco (pode não existir se for de campanha JSON)
    try {
      await NotificationService.markAsRead(notificationId, userId);
    } catch (error) {
      // Se não existir no banco, é uma notificação de campanha - ok para marcar como lida localmente
      console.log(`Notificação ${notificationId} não encontrada no banco - provavelmente é de campanha`);
    }

    res.status(200).json({
      success: true,
      message: 'Notificação marcada como lida',
      notificationId
    });

  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/notifications/read-all
 * Marcar todas as notificações como lidas
 */
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    console.log(`📖 Marcando todas as notificações como lidas para usuário ${userId}`);

    // Marcar todas no banco como lidas
    const updatedNotifications = await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas',
      updatedCount: updatedNotifications.length
    });

  } catch (error) {
    console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/notifications/count
 * Obter apenas o número de notificações não lidas
 */
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('❌ Erro ao contar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/notifications/create (Admin only)
 * Criar notificação manual
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const { targetUserId, type, title, message, actionUrl, data } = req.body;

    // Apenas super_admin pode criar notificações manuais
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem criar notificações.',
        error: 'FORBIDDEN'
      });
    }

    if (!targetUserId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: targetUserId, type, title, message',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    console.log(`📤 Criando notificação manual para usuário ${targetUserId}`);

    const notification = await NotificationService.createNotification({
      userId: targetUserId,
      type,
      title,
      message,
      actionUrl,
      data
    });

    res.status(201).json({
      success: true,
      message: 'Notificação criada com sucesso',
      notification
    });

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/notifications/campaign-test
 * Testar campanhas automáticas (Admin only)
 */
router.post('/campaign-test', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem testar campanhas.',
        error: 'FORBIDDEN'
      });
    }

    console.log('🧪 Testando processamento de campanhas automáticas');

    // Executar processamento de campanhas
    await NotificationService.processAutomaticCampaigns();

    res.status(200).json({
      success: true,
      message: 'Campanhas automáticas processadas com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao testar campanhas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;