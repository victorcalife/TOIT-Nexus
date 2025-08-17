/**
 * SISTEMA DE PERFIL DE USUÁRIO PERSONALIZADO
 * Backend para gerenciamento completo de perfil e configurações
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { db } = require('../database-config');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

const router = express.Router();

// Configuração do multer para upload de avatar
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)'));
    }
  }
});

/**
 * OBTER PERFIL COMPLETO DO USUÁRIO
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Buscar dados do usuário
    const userResult = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.bio,
        u.location,
        u.website,
        u.github,
        u.linkedin,
        u.twitter,
        u.avatar_url,
        u.timezone,
        u.language,
        u.theme,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE u.id = $1
    `, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = userResult.rows[0];

    // Buscar preferências do usuário
    const preferencesResult = await db.query(`
      SELECT 
        email_notifications,
        push_notifications,
        weekly_reports,
        marketing_emails,
        two_factor_auth,
        public_profile,
        show_activity,
        show_stats
      FROM user_preferences
      WHERE user_id = $1
    `, [req.user.id]);

    const preferences = preferencesResult.rows[0] || {
      email_notifications: true,
      push_notifications: true,
      weekly_reports: true,
      marketing_emails: false,
      two_factor_auth: false,
      public_profile: false,
      show_activity: true,
      show_stats: true
    };

    // Buscar estatísticas do usuário
    const statsResult = await db.query(`
      SELECT 
        COUNT(DISTINCT ul.id) as total_logins,
        MAX(ul.created_at) as last_login,
        COUNT(DISTINCT t.id) as tasks_completed,
        COUNT(DISTINCT pt.project_id) as projects_participated,
        COALESCE(SUM(ttl.hours), 0) as hours_worked
      FROM users u
      LEFT JOIN user_login_logs ul ON u.id = ul.user_id
      LEFT JOIN tasks t ON u.id = t.assignee_id AND t.status = 'done'
      LEFT JOIN project_team pt ON u.id = pt.user_id
      LEFT JOIN task_time_logs ttl ON u.id = ttl.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.user.id]);

    const stats = statsResult.rows[0] || {
      total_logins: 0,
      last_login: null,
      tasks_completed: 0,
      projects_participated: 0,
      hours_worked: 0
    };

    // Calcular idade da conta em dias
    const accountAge = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        profile: user,
        preferences: preferences,
        stats: {
          ...stats,
          account_age: accountAge,
          average_session_time: stats.total_logins > 0 ? (stats.hours_worked / stats.total_logins).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ATUALIZAR PERFIL DO USUÁRIO
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      phone,
      bio,
      location,
      website,
      github,
      linkedin,
      twitter,
      timezone,
      language,
      theme
    } = req.body;

    const result = await db.query(`
      UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        bio = COALESCE($3, bio),
        location = COALESCE($4, location),
        website = COALESCE($5, website),
        github = COALESCE($6, github),
        linkedin = COALESCE($7, linkedin),
        twitter = COALESCE($8, twitter),
        timezone = COALESCE($9, timezone),
        language = COALESCE($10, language),
        theme = COALESCE($11, theme),
        updated_at = NOW()
      WHERE id = $12
      RETURNING id, name, email, phone, bio, location, website, github, linkedin, twitter, timezone, language, theme, updated_at
    `, [
      name, phone, bio, location, website, github, linkedin, twitter,
      timezone, language, theme, req.user.id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * UPLOAD DE AVATAR
 */
router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    // Construir URL do avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Atualizar URL do avatar no banco
    await db.query(`
      UPDATE users SET
        avatar_url = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [avatarUrl, req.user.id]);

    res.json({
      success: true,
      data: {
        avatar_url: avatarUrl
      },
      message: 'Avatar atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ATUALIZAR PREFERÊNCIAS
 */
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      weeklyReports,
      marketingEmails,
      twoFactorAuth,
      publicProfile,
      showActivity,
      showStats
    } = req.body;

    // Verificar se preferências já existem
    const existing = await db.query(
      'SELECT user_id FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );

    if (existing.rows.length === 0) {
      // Criar preferências
      await db.query(`
        INSERT INTO user_preferences (
          user_id,
          email_notifications,
          push_notifications,
          weekly_reports,
          marketing_emails,
          two_factor_auth,
          public_profile,
          show_activity,
          show_stats
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        req.user.id,
        emailNotifications,
        pushNotifications,
        weeklyReports,
        marketingEmails,
        twoFactorAuth,
        publicProfile,
        showActivity,
        showStats
      ]);
    } else {
      // Atualizar preferências
      await db.query(`
        UPDATE user_preferences SET
          email_notifications = COALESCE($1, email_notifications),
          push_notifications = COALESCE($2, push_notifications),
          weekly_reports = COALESCE($3, weekly_reports),
          marketing_emails = COALESCE($4, marketing_emails),
          two_factor_auth = COALESCE($5, two_factor_auth),
          public_profile = COALESCE($6, public_profile),
          show_activity = COALESCE($7, show_activity),
          show_stats = COALESCE($8, show_stats),
          updated_at = NOW()
        WHERE user_id = $9
      `, [
        emailNotifications,
        pushNotifications,
        weeklyReports,
        marketingEmails,
        twoFactorAuth,
        publicProfile,
        showActivity,
        showStats,
        req.user.id
      ]);
    }

    res.json({
      success: true,
      message: 'Preferências atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ALTERAR SENHA
 */
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha deve ter pelo menos 8 caracteres'
      });
    }

    // Buscar senha atual do usuário
    const userResult = await db.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    // Criptografar nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await db.query(`
      UPDATE users SET
        password = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [hashedNewPassword, req.user.id]);

    // Registrar alteração de senha no log
    await db.query(`
      INSERT INTO user_activity_logs (
        user_id,
        action,
        description,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'password_change',
      'Senha alterada pelo usuário',
      req.ip,
      req.get('User-Agent')
    ]);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * OBTER ATIVIDADES RECENTES
 */
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(`
      SELECT 
        id,
        action,
        description,
        ip_address,
        user_agent,
        created_at
      FROM user_activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao obter atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * EXPORTAR DADOS DO USUÁRIO
 */
router.get('/export', requireAuth, async (req, res) => {
  try {
    // Buscar todos os dados do usuário
    const userData = await db.query(`
      SELECT 
        u.*,
        up.email_notifications,
        up.push_notifications,
        up.weekly_reports,
        up.marketing_emails,
        up.two_factor_auth,
        up.public_profile,
        up.show_activity,
        up.show_stats
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    // Buscar atividades
    const activities = await db.query(`
      SELECT * FROM user_activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    // Buscar tarefas
    const tasks = await db.query(`
      SELECT * FROM tasks
      WHERE assignee_id = $1 OR reporter_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    const exportData = {
      user: userData.rows[0],
      activities: activities.rows,
      tasks: tasks.rows,
      exported_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETAR CONTA (SOFT DELETE)
 */
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Senha é obrigatória para deletar a conta'
      });
    }

    // Verificar senha
    const userResult = await db.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha incorreta'
      });
    }

    // Soft delete - marcar como deletado
    await db.query(`
      UPDATE users SET
        is_deleted = true,
        deleted_at = NOW(),
        email = CONCAT(email, '_deleted_', EXTRACT(EPOCH FROM NOW())),
        updated_at = NOW()
      WHERE id = $1
    `, [req.user.id]);

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
