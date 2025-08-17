const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DatabaseService = require('../services/DatabaseService');
const EmailService = require('../services/EmailService');
const QuantumProcessor = require('../services/QuantumProcessor');
const MilaService = require('../services/MilaService');
const multer = require('multer');
const path = require('path');

const db = new DatabaseService();
const emailService = new EmailService();
const quantumProcessor = new QuantumProcessor();
const milaService = new MilaService();

// Configurar multer para anexos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/email-attachments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Permitir todos os tipos de arquivo
    cb(null, true);
  }
});

/**
 * GET /api/email/folders
 * Listar pastas de email do usuário
 */
router.get('/folders', authenticateToken, async (req, res) => {
  try {
    const folders = await db.query(`
      SELECT 
        f.*,
        COUNT(e.id) as email_count,
        COUNT(CASE WHEN e.is_read = 0 THEN 1 END) as unread_count
      FROM email_folders f
      LEFT JOIN emails e ON f.id = e.folder_id AND e.user_id = ?
      WHERE f.user_id = ? OR f.is_system = 1
      GROUP BY f.id
      ORDER BY f.sort_order, f.name
    `, [req.user.id, req.user.id]);

    res.json({
      success: true,
      data: { folders }
    });

  } catch (error) {
    console.error('❌ Erro ao listar pastas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter pastas de email'
    });
  }
});

/**
 * GET /api/email/folders/:folderId
 * Listar emails de uma pasta
 */
router.get('/folders/:folderId', authenticateToken, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { page = 1, limit = 20, search, unreadOnly } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE e.user_id = ? AND e.folder_id = ?';
    let params = [req.user.id, folderId];

    if (search) {
      whereClause += ' AND (e.subject LIKE ? OR e.from_email LIKE ? OR e.from_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (unreadOnly === 'true') {
      whereClause += ' AND e.is_read = 0';
    }

    const emails = await db.query(`
      SELECT 
        e.id, e.subject, e.from_email, e.from_name, e.to_emails,
        e.is_read, e.is_starred, e.priority, e.has_attachments,
        e.created_at, e.quantum_processed, e.mila_generated,
        GROUP_CONCAT(t.name) as tags
      FROM emails e
      LEFT JOIN email_tags et ON e.id = et.email_id
      LEFT JOIN tags t ON et.tag_id = t.id
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total
    const totalResult = await db.query(`
      SELECT COUNT(*) as total FROM emails e ${whereClause}
    `, params);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        emails: emails.map(email => ({
          ...email,
          toEmails: JSON.parse(email.to_emails || '[]'),
          tags: email.tags ? email.tags.split(',') : []
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar emails:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter emails'
    });
  }
});

/**
 * GET /api/email/:id
 * Obter email específico
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const emails = await db.query(`
      SELECT * FROM emails 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (emails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    const email = emails[0];

    // Buscar anexos
    const attachments = await db.query(`
      SELECT * FROM email_attachments 
      WHERE email_id = ?
    `, [id]);

    // Marcar como lido se não estiver
    if (!email.is_read) {
      await db.query(`
        UPDATE emails SET is_read = 1, read_at = NOW() 
        WHERE id = ?
      `, [id]);
    }

    res.json({
      success: true,
      data: {
        email: {
          ...email,
          toEmails: JSON.parse(email.to_emails || '[]'),
          ccEmails: JSON.parse(email.cc_emails || '[]'),
          bccEmails: JSON.parse(email.bcc_emails || '[]'),
          quantumData: email.quantum_data ? JSON.parse(email.quantum_data) : null
        },
        attachments
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter email'
    });
  }
});

/**
 * POST /api/email/send
 * Enviar email
 */
router.post('/send', authenticateToken, upload.array('attachments', 10), async (req, res) => {
  try {
    const {
      to,
      cc = '',
      bcc = '',
      subject,
      body,
      priority = 'normal',
      template = 'blank',
      scheduledSend = null,
      quantumEnhanced = true
    } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Destinatário, assunto e corpo são obrigatórios'
      });
    }

    // Processar com algoritmos quânticos se habilitado
    let quantumData = null;
    if (quantumEnhanced) {
      quantumData = await quantumProcessor.processOperation({
        type: 'email_optimization',
        data: {
          subject,
          body,
          recipients: to.split(',').length,
          priority
        },
        complexity: 2,
        userId: req.user.id
      });
    }

    // Gerar insights MILA
    const milaInsights = await milaService.generateEmailInsights({
      subject,
      body,
      recipients: to.split(','),
      userId: req.user.id
    });

    // Criar registro do email
    const emailResult = await db.query(`
      INSERT INTO emails (
        user_id, folder_id, subject, body, from_email, from_name,
        to_emails, cc_emails, bcc_emails, priority, template,
        scheduled_send, quantum_processed, quantum_data,
        mila_generated, has_attachments, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      req.user.id,
      2, // Pasta "Enviados"
      subject,
      body,
      req.user.email,
      req.user.name,
      JSON.stringify(to.split(',')),
      JSON.stringify(cc ? cc.split(',') : []),
      JSON.stringify(bcc ? bcc.split(',') : []),
      priority,
      template,
      scheduledSend,
      quantumEnhanced,
      quantumData ? JSON.stringify(quantumData) : null,
      milaInsights.length > 0,
      req.files && req.files.length > 0
    ]);

    const emailId = emailResult.insertId;

    // Salvar anexos se houver
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(`
          INSERT INTO email_attachments (
            email_id, filename, original_name, file_path, file_size, mime_type
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          emailId,
          file.filename,
          file.originalname,
          file.path,
          file.size,
          file.mimetype
        ]);
      }
    }

    // Enviar email via serviço
    let sendResult;
    if (scheduledSend) {
      // Agendar envio
      sendResult = await emailService.scheduleEmail({
        emailId,
        to: to.split(','),
        cc: cc ? cc.split(',') : [],
        bcc: bcc ? bcc.split(',') : [],
        subject,
        body,
        attachments: req.files || [],
        scheduledFor: new Date(scheduledSend)
      });
    } else {
      // Enviar imediatamente
      sendResult = await emailService.sendEmail({
        emailId,
        to: to.split(','),
        cc: cc ? cc.split(',') : [],
        bcc: bcc ? bcc.split(',') : [],
        subject,
        body,
        attachments: req.files || [],
        from: {
          email: req.user.email,
          name: req.user.name
        }
      });
    }

    // Atualizar status do email
    await db.query(`
      UPDATE emails 
      SET sent_at = NOW(), send_status = ?, external_id = ?
      WHERE id = ?
    `, [sendResult.success ? 'sent' : 'failed', sendResult.messageId || null, emailId]);

    res.json({
      success: true,
      data: {
        emailId,
        sendResult,
        quantumData,
        milaInsights,
        attachmentCount: req.files ? req.files.length : 0
      }
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar email',
      details: error.message
    });
  }
});

/**
 * PUT /api/email/:id/star
 * Marcar/desmarcar email como favorito
 */
router.put('/:id/star', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;

    const result = await db.query(`
      UPDATE emails 
      SET is_starred = ?, starred_at = ${starred ? 'NOW()' : 'NULL'}
      WHERE id = ? AND user_id = ?
    `, [starred, id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    res.json({
      success: true,
      message: starred ? 'Email marcado como favorito' : 'Email desmarcado como favorito'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar favorito:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar favorito'
    });
  }
});

/**
 * PUT /api/email/:id/move
 * Mover email para outra pasta
 */
router.put('/:id/move', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'ID da pasta é obrigatório'
      });
    }

    // Verificar se a pasta existe e pertence ao usuário
    const folders = await db.query(`
      SELECT id FROM email_folders 
      WHERE id = ? AND (user_id = ? OR is_system = 1)
    `, [folderId, req.user.id]);

    if (folders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pasta não encontrada'
      });
    }

    const result = await db.query(`
      UPDATE emails 
      SET folder_id = ?, moved_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [folderId, id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Email movido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao mover email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao mover email'
    });
  }
});

/**
 * DELETE /api/email/:id
 * Deletar email
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    if (permanent) {
      // Deletar permanentemente
      await db.query(`DELETE FROM email_attachments WHERE email_id = ?`, [id]);
      await db.query(`DELETE FROM email_tags WHERE email_id = ?`, [id]);
      await db.query(`DELETE FROM emails WHERE id = ? AND user_id = ?`, [id, req.user.id]);
    } else {
      // Mover para lixeira (pasta 6)
      await db.query(`
        UPDATE emails 
        SET folder_id = 6, deleted_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [id, req.user.id]);
    }

    res.json({
      success: true,
      message: permanent ? 'Email deletado permanentemente' : 'Email movido para lixeira'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar email'
    });
  }
});

/**
 * GET /api/email/templates
 * Listar templates de email
 */
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = await db.query(`
      SELECT * FROM email_templates 
      WHERE user_id = ? OR is_system = 1
      ORDER BY is_system DESC, name
    `, [req.user.id]);

    res.json({
      success: true,
      data: { templates }
    });

  } catch (error) {
    console.error('❌ Erro ao listar templates:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter templates'
    });
  }
});

/**
 * POST /api/email/templates
 * Criar template de email
 */
router.post('/templates', authenticateToken, async (req, res) => {
  try {
    const { name, subject, body, description } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Nome, assunto e corpo são obrigatórios'
      });
    }

    const result = await db.query(`
      INSERT INTO email_templates (
        user_id, name, subject, body, description, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `, [req.user.id, name, subject, body, description]);

    res.status(201).json({
      success: true,
      data: {
        templateId: result.insertId,
        message: 'Template criado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar template'
    });
  }
});

/**
 * GET /api/email/search
 * Buscar emails
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, folder, dateFrom, dateTo, hasAttachments, isStarred } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query de busca é obrigatória'
      });
    }

    let whereClause = 'WHERE e.user_id = ? AND (e.subject LIKE ? OR e.body LIKE ? OR e.from_email LIKE ?)';
    let params = [req.user.id, `%${q}%`, `%${q}%`, `%${q}%`];

    if (folder) {
      whereClause += ' AND e.folder_id = ?';
      params.push(folder);
    }

    if (dateFrom) {
      whereClause += ' AND e.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND e.created_at <= ?';
      params.push(dateTo);
    }

    if (hasAttachments === 'true') {
      whereClause += ' AND e.has_attachments = 1';
    }

    if (isStarred === 'true') {
      whereClause += ' AND e.is_starred = 1';
    }

    const emails = await db.query(`
      SELECT 
        e.id, e.subject, e.from_email, e.from_name, e.to_emails,
        e.is_read, e.is_starred, e.priority, e.has_attachments,
        e.created_at, f.name as folder_name
      FROM emails e
      JOIN email_folders f ON e.folder_id = f.id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT 50
    `, params);

    res.json({
      success: true,
      data: {
        emails: emails.map(email => ({
          ...email,
          toEmails: JSON.parse(email.to_emails || '[]')
        })),
        query: q,
        resultCount: emails.length
      }
    });

  } catch (error) {
    console.error('❌ Erro na busca:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na busca de emails'
    });
  }
});

/**
 * GET /api/email/attachments/:id/download
 * Download de anexo
 */
router.get('/attachments/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const attachments = await db.query(`
      SELECT a.*, e.user_id 
      FROM email_attachments a
      JOIN emails e ON a.email_id = e.id
      WHERE a.id = ? AND e.user_id = ?
    `, [id, req.user.id]);

    if (attachments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Anexo não encontrado'
      });
    }

    const attachment = attachments[0];
    
    res.download(attachment.file_path, attachment.original_name, (err) => {
      if (err) {
        console.error('❌ Erro no download:', err);
        res.status(500).json({
          success: false,
          error: 'Erro no download do anexo'
        });
      }
    });

  } catch (error) {
    console.error('❌ Erro no download:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no download do anexo'
    });
  }
});

module.exports = router;
