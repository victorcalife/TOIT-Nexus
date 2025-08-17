const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ExportService = require('../services/ExportService');

const exportService = new ExportService();

/**
 * GET /api/exports/download/:filename
 * Download de arquivo exportado
 */
router.get('/download/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;

    console.log(`📥 Download solicitado: ${filename} por usuário ${req.user.id}`);

    // Validar nome do arquivo
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Nome de arquivo inválido'
      });
    }

    // Obter arquivo
    const fileInfo = await exportService.getFileForDownload(filename);

    // Configurar headers para download
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Length', fileInfo.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Enviar arquivo
    res.sendFile(fileInfo.filePath, (err) => {
      if (err) {
        console.error('❌ Erro no download:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Erro no download do arquivo'
          });
        }
      } else {
        console.log(`✅ Download concluído: ${filename}`);
      }
    });

  } catch (error) {
    console.error('❌ Erro no download:', error);
    res.status(404).json({
      success: false,
      error: 'Arquivo não encontrado'
    });
  }
});

/**
 * GET /api/exports/cleanup
 * Limpar arquivos antigos (apenas admins)
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const { maxAgeHours = 24 } = req.body;

    await exportService.cleanupOldFiles(maxAgeHours);

    console.log(`🗑️ Limpeza de arquivos executada por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Limpeza de arquivos executada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na limpeza de arquivos'
    });
  }
});

module.exports = router;
