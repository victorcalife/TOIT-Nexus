/**
 * ROTAS DE ARQUIVOS COMPLETAS
 * Upload, download, gestão de arquivos
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authSystem, requireAuth } = require('../auth-system');
const { db } = require('../database-config');

const router = express.Router();

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', req.user.tenant_id.toString());
    
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
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // máximo 10 arquivos por vez
  },
  fileFilter: (req, file, cb) => {
    // Tipos permitidos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv', 'application/json', 'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  }
});

/**
 * POST /api/files/upload
 * Upload de arquivos
 */
router.post('/upload', requireAuth(authSystem), upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const { category = 'general', description = '' } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      // Salvar informações no banco
      const query = `
        INSERT INTO uploaded_files (
          tenant_id, user_id, original_name, filename, file_path,
          mime_type, file_size, category, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, uuid, original_name, file_size, created_at
      `;

      const values = [
        req.user.tenant_id,
        req.user.id,
        file.originalname,
        file.filename,
        file.path,
        file.mimetype,
        file.size,
        category,
        description
      ];

      const result = await db.query(query, values);
      uploadedFiles.push(result.rows[0]);
    }

    console.log(`📁 ${uploadedFiles.length} arquivo(s) enviado(s) por ${req.user.email}`);

    res.json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      data: { files: uploadedFiles }
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error.message);
    
    // Limpar arquivos em caso de erro
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Erro ao limpar arquivo:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/files
 * Listar arquivos do tenant
 */
router.get('/', requireAuth(authSystem), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, mime_type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE tenant_id = $1 AND deleted_at IS NULL';
    let params = [req.user.tenant_id];
    let paramIndex = 2;

    // Filtro de busca
    if (search) {
      whereClause += ` AND (original_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por categoria
    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Filtro por tipo MIME
    if (mime_type) {
      whereClause += ` AND mime_type LIKE $${paramIndex}`;
      params.push(`${mime_type}%`);
      paramIndex++;
    }

    const query = `
      SELECT 
        f.id, f.uuid, f.original_name, f.filename, f.mime_type,
        f.file_size, f.category, f.description, f.download_count,
        f.created_at, f.updated_at,
        u.first_name || ' ' || u.last_name as uploaded_by
      FROM uploaded_files f
      LEFT JOIN users u ON f.user_id = u.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    // Formatar tamanho dos arquivos
    const files = result.rows.map(file => ({
      ...file,
      file_size_formatted: formatFileSize(file.file_size),
      is_image: file.mime_type.startsWith('image/'),
      is_document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mime_type)
    }));

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: files.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/files/:id
 * Obter informações de arquivo específico
 */
router.get('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        f.*,
        u.first_name || ' ' || u.last_name as uploaded_by,
        u.email as uploader_email
      FROM uploaded_files f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.id = $1 AND f.tenant_id = $2 AND f.deleted_at IS NULL
    `;

    const result = await db.query(query, [id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const file = result.rows[0];

    res.json({
      success: true,
      data: {
        file: {
          ...file,
          file_size_formatted: formatFileSize(file.file_size),
          is_image: file.mime_type.startsWith('image/'),
          is_document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mime_type)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar arquivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/files/:id/download
 * Download de arquivo
 */
router.get('/:id/download', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT file_path, original_name, mime_type
      FROM uploaded_files
      WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
    `;

    const result = await db.query(query, [id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const file = result.rows[0];

    // Verificar se arquivo existe no sistema de arquivos
    try {
      await fs.access(file.file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado no servidor'
      });
    }

    // Incrementar contador de downloads
    await db.query(
      'UPDATE uploaded_files SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );

    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type);

    // Enviar arquivo
    res.sendFile(path.resolve(file.file_path));

    console.log(`📥 Download: ${file.original_name} por ${req.user.email}`);

  } catch (error) {
    console.error('❌ Erro no download:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/files/:id
 * Deletar arquivo
 */
router.delete('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar arquivo
    const query = `
      SELECT file_path, original_name, user_id
      FROM uploaded_files
      WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
    `;

    const result = await db.query(query, [id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const file = result.rows[0];

    // Verificar permissões (apenas o dono ou admin pode deletar)
    const canDelete = file.user_id === req.user.id ||
                     ['super_admin', 'tenant_admin'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Soft delete no banco
    await db.query(
      'UPDATE uploaded_files SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Tentar deletar arquivo físico
    try {
      await fs.unlink(file.file_path);
    } catch (error) {
      console.warn('Arquivo físico não encontrado:', file.file_path);
    }

    console.log(`🗑️ Arquivo deletado: ${file.original_name} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/files/stats
 * Estatísticas de arquivos do tenant
 */
router.get('/stats', requireAuth(authSystem), async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as images,
        COUNT(CASE WHEN mime_type = 'application/pdf' THEN 1 END) as pdfs,
        COUNT(CASE WHEN mime_type LIKE 'application/vnd.ms-%' OR mime_type LIKE 'application/vnd.openxmlformats-%' THEN 1 END) as documents,
        SUM(download_count) as total_downloads
      FROM uploaded_files
      WHERE tenant_id = $1 AND deleted_at IS NULL
    `;

    const result = await db.query(statsQuery, [req.user.tenant_id]);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          total_size_formatted: formatFileSize(stats.total_size || 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Função auxiliar para formatar tamanho de arquivo
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;
