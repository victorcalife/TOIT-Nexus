const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const DatabaseService = require('../services/DatabaseService');

const db = new DatabaseService();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'files');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Permitir todos os tipos de arquivo por enquanto
    cb(null, true);
  }
});

/**
 * POST /api/files/upload
 * Upload de arquivo
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const { description, category } = req.body;

    // Salvar informações do arquivo no banco
    const result = await db.query(`
      INSERT INTO file_uploads (
        filename, original_name, file_size, mime_type, 
        uploaded_by, description, category, file_path, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      req.file.filename,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      req.user.id,
      description || null,
      category || 'general',
      req.file.path
    ]);

    res.json({
      success: true,
      data: {
        id: result.insertId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      },
      message: 'Arquivo enviado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no upload do arquivo',
      details: error.message
    });
  }
});

/**
 * GET /api/files
 * Listar arquivos do usuário
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, mimeType } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE uploaded_by = ?';
    let params = [req.user.id];

    if (search) {
      whereClause += ' AND (original_name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (mimeType) {
      whereClause += ' AND mime_type LIKE ?';
      params.push(`${mimeType}%`);
    }

    // Buscar arquivos
    const files = await db.query(`
      SELECT 
        id, filename, original_name, file_size, mime_type,
        description, category, created_at
      FROM file_uploads 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total
    const totalResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM file_uploads 
      ${whereClause}
    `, params);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar arquivos'
    });
  }
});

/**
 * GET /api/files/:id
 * Obter informações de um arquivo específico
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const files = await db.query(`
      SELECT 
        id, filename, original_name, file_size, mime_type,
        description, category, file_path, created_at
      FROM file_uploads 
      WHERE id = ? AND uploaded_by = ?
    `, [id, req.user.id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    res.json({
      success: true,
      data: files[0]
    });

  } catch (error) {
    console.error('❌ Erro ao obter arquivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter informações do arquivo'
    });
  }
});

/**
 * GET /api/files/:id/download
 * Download de arquivo
 */
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const files = await db.query(`
      SELECT filename, original_name, file_path, mime_type
      FROM file_uploads 
      WHERE id = ? AND uploaded_by = ?
    `, [id, req.user.id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const file = files[0];
    const filePath = file.file_path || path.join(process.cwd(), 'uploads', 'files', file.filename);

    // Verificar se arquivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo físico não encontrado'
      });
    }

    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');

    // Enviar arquivo
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('❌ Erro no download:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no download do arquivo'
    });
  }
});

/**
 * DELETE /api/files/:id
 * Deletar arquivo
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar arquivo
    const files = await db.query(`
      SELECT filename, file_path
      FROM file_uploads 
      WHERE id = ? AND uploaded_by = ?
    `, [id, req.user.id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const file = files[0];
    const filePath = file.file_path || path.join(process.cwd(), 'uploads', 'files', file.filename);

    // Deletar arquivo físico
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('⚠️ Arquivo físico não encontrado:', filePath);
    }

    // Deletar registro do banco
    await db.query(`
      DELETE FROM file_uploads 
      WHERE id = ? AND uploaded_by = ?
    `, [id, req.user.id]);

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar arquivo'
    });
  }
});

module.exports = router;
