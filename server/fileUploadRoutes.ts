import { Router, Request, Response } from 'express';
import { fileProcessingService } from './fileProcessingService.js';
import { authMiddleware } from './authMiddleware.js';

const router = Router();

/**
 * Configurar upload middleware
 */
const upload = fileProcessingService.getMulterConfig();

/**
 * Upload de arquivo
 * POST /api/files/upload
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    console.log(`📁 Upload iniciado: ${file.originalname} (${file.size} bytes) - User: ${userId}`);

    // Processar arquivo
    const result = await fileProcessingService.processUploadedFile(file, userId, tenantId);

    if (result.success) {
      console.log(`✅ Arquivo processado com sucesso: ${result.fileId}`);
      res.json({
        success: true,
        message: 'Arquivo enviado e processado com sucesso',
        data: {
          fileId: result.fileId,
          fileName: result.fileName,
          headers: result.data?.headers || [],
          rowCount: result.data?.rowCount || 0,
          fileSize: result.data?.fileSize || 0,
          processingTime: result.data?.processingTime || 0
        }
      });
    } else {
      console.error(`❌ Erro ao processar arquivo: ${result.message}`);
      res.status(400).json({
        success: false,
        message: result.message || 'Erro ao processar arquivo'
      });
    }

  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Listar arquivos do usuário
 * GET /api/files/list
 */
router.get('/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const files = await fileProcessingService.getUserFiles(userId, tenantId);

    res.json({
      success: true,
      data: files,
      count: files.length
    });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar arquivos'
    });
  }
});

/**
 * Buscar dados de um arquivo específico
 * GET /api/files/:fileId/data
 */
router.get('/:fileId/data', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { limit = '100', offset = '0' } = req.query;
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    const fileData = await fileProcessingService.getFileData(
      fileId, 
      userId, 
      tenantId, 
      limitNum, 
      offsetNum
    );

    res.json({
      success: true,
      data: fileData
    });

  } catch (error) {
    console.error('Erro ao buscar dados do arquivo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar dados do arquivo'
    });
  }
});

/**
 * Deletar arquivo
 * DELETE /api/files/:fileId
 */
router.delete('/:fileId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    console.log(`🗑️ Deletando arquivo: ${fileId} - User: ${userId}`);

    await fileProcessingService.deleteFile(fileId, userId, tenantId);

    console.log(`✅ Arquivo deletado com sucesso: ${fileId}`);

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao deletar arquivo'
    });
  }
});

/**
 * Estatísticas de arquivos do usuário
 * GET /api/files/stats
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.user?.id;
    const tenantId = (req.session as any)?.user?.tenant?.id;

    if (!userId || !tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const files = await fileProcessingService.getUserFiles(userId, tenantId);

    // Calcular estatísticas
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    const totalRows = files.reduce((sum, file) => sum + (file.rowCount || 0), 0);

    // Agrupar por tipo
    const fileTypes = files.reduce((acc: any, file) => {
      const ext = file.originalName.split('.').pop()?.toLowerCase() || 'unknown';
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize,
        totalRows,
        fileTypes,
        recentFiles: files.slice(0, 5) // 5 arquivos mais recentes
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

export { router as fileUploadRoutes };