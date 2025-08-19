/**
 * FILE UPLOAD ROUTES - API completa para upload e processamento de arquivos
 * Endpoints: Upload, reprocessamento, conversão, listagem, delete
 * Suporta: Excel (.xlsx, .xls), CSV com preview e validação
 */

import express from 'express';
import { eq, desc, and, or, ilike, gte, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  fileUploads,
  users,
  tenants
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { 
  fileUploadService, 
  uploadMiddleware, 
  FileUploadSchema,
  FileProcessingSchema 
} from './fileUploadService';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// FILE UPLOADS - GESTÃO DE ARQUIVOS
// ==========================================

// GET /api/files - Listar arquivos do tenant
router.get('/', async (req: any, res) => {
  try {
    const { 
      search, 
      status, 
      mimeType,
      uploadedBy,
      startDate,
      endDate,
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    const result = await fileUploadService.getFiles(tenantId, {
      search,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar arquivos'
    });
  }
});

// POST /api/files/upload - Upload de arquivo
router.post('/upload', uploadMiddleware.single('file'), async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }

    console.log(`📁 Upload iniciado: ${req.file.originalname} (${req.file.size} bytes) - User: ${userId}`);

    // Validar metadados
    const metadata = {
      originalName: req.file.originalname,
      description: req.body.description || '',
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    };

    const validatedMetadata = FileUploadSchema.parse(metadata);

    // Processar arquivo
    const result = await fileUploadService.processUploadedFile(
      tenantId,
      userId,
      req.file,
      validatedMetadata
    );

    if (!result.success) {
      console.error(`❌ Erro ao processar arquivo: ${result.error}`);
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Arquivo processado com sucesso: ${result.data.file.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha no upload do arquivo'
      });
    }
  }
});

// GET /api/files/:id - Obter detalhes do arquivo
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    const file = await db
      .select({
        file: fileUploads,
        uploadedByUser: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(fileUploads)
      .leftJoin(users, eq(users.id, fileUploads.uploadedBy))
      .where(and(
        eq(fileUploads.id, id),
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .limit(1);

    if (file.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        ...file[0].file,
        uploadedByUser: file[0].uploadedByUser
      }
    });

  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar detalhes do arquivo'
    });
  }
});

// POST /api/files/:id/reprocess - Reprocessar arquivo
router.post('/:id/reprocess', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Validar configurações de reprocessamento
    const validatedConfig = FileProcessingSchema.parse(req.body);

    const result = await fileUploadService.reprocessFile(
      tenantId,
      id,
      validatedConfig
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error reprocessing file:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Configurações inválidas',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao reprocessar arquivo'
      });
    }
  }
});

// POST /api/files/:id/convert - Converter arquivo
router.post('/:id/convert', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { targetFormat } = req.body;
    const tenantId = req.tenant.id;

    if (!targetFormat || !['json', 'csv', 'xlsx'].includes(targetFormat)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de conversão inválido. Formatos aceitos: json, csv, xlsx'
      });
    }

    const result = await fileUploadService.convertFile(
      tenantId,
      id,
      targetFormat
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).json({
      success: false,
      error: 'Falha na conversão do arquivo'
    });
  }
});

// GET /api/files/:id/download - Download do arquivo original
router.get('/:id/download', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Buscar arquivo
    const file = await db
      .select()
      .from(fileUploads)
      .where(and(
        eq(fileUploads.id, id),
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .limit(1);

    if (file.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const fileRecord = file[0];

    // Verificar se arquivo físico existe
    try {
      await fs.access(fileRecord.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo físico não encontrado'
      });
    }

    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Type', fileRecord.mimeType || 'application/octet-stream');

    // Enviar arquivo
    res.sendFile(path.resolve(fileRecord.filePath));

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      error: 'Falha no download do arquivo'
    });
  }
});

// GET /api/files/:id/preview - Preview dos dados do arquivo
router.get('/:id/preview', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { rows = 10 } = req.query;
    const tenantId = req.tenant.id;

    // Buscar arquivo
    const file = await db
      .select()
      .from(fileUploads)
      .where(and(
        eq(fileUploads.id, id),
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .limit(1);

    if (file.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const fileRecord = file[0];

    if (fileRecord.status !== 'processed') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo ainda não foi processado com sucesso'
      });
    }

    // Retornar preview dos dados
    const previewData = fileRecord.previewData || [];
    const limitedPreview = previewData.slice(0, parseInt(rows.toString()));

    res.json({
      success: true,
      data: {
        preview: limitedPreview,
        totalRows: fileRecord.totalRows,
        validRows: fileRecord.validRows,
        schema: (fileRecord.processingResult as any)?.schema || [],
        summary: (fileRecord.processingResult as any)?.summary || {}
      }
    });

  } catch (error) {
    console.error('Error getting file preview:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao obter preview do arquivo'
    });
  }
});

// DELETE /api/files/:id - Deletar arquivo
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    console.log(`🗑️ Deletando arquivo: ${id} - Tenant: ${tenantId}`);

    const result = await fileUploadService.deleteFile(tenantId, id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Arquivo deletado com sucesso: ${id}`);
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar arquivo'
    });
  }
});

// ==========================================
// FILE STATISTICS - ESTATÍSTICAS DE ARQUIVOS
// ==========================================

// GET /api/files/stats/overview - Estatísticas de arquivos do tenant
router.get('/stats/overview', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    // Estatísticas básicas
    const totalFiles = await db
      .select({ count: sql<number>`count(*)` })
      .from(fileUploads)
      .where(and(
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ));

    // Estatísticas por status
    const statusStats = await db
      .select({
        status: fileUploads.status,
        count: sql<number>`count(*)`,
        totalSize: sql<number>`sum(${fileUploads.fileSize})`
      })
      .from(fileUploads)
      .where(and(
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .groupBy(fileUploads.status);

    // Estatísticas por tipo de arquivo
    const typeStats = await db
      .select({
        mimeType: fileUploads.mimeType,
        count: sql<number>`count(*)`,
        totalSize: sql<number>`sum(${fileUploads.fileSize})`
      })
      .from(fileUploads)
      .where(and(
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .groupBy(fileUploads.mimeType);

    // Arquivos recentes
    const recentFiles = await db
      .select({
        id: fileUploads.id,
        originalName: fileUploads.originalName,
        status: fileUploads.status,
        fileSize: fileUploads.fileSize,
        totalRows: fileUploads.totalRows,
        createdAt: fileUploads.createdAt,
        uploadedByUser: {
          name: users.name,
          email: users.email
        }
      })
      .from(fileUploads)
      .leftJoin(users, eq(users.id, fileUploads.uploadedBy))
      .where(and(
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .orderBy(desc(fileUploads.createdAt))
      .limit(5);

    // Top uploaders
    const topUploaders = await db
      .select({
        uploadedBy: fileUploads.uploadedBy,
        count: sql<number>`count(*)`,
        totalSize: sql<number>`sum(${fileUploads.fileSize})`,
        user: {
          name: users.name,
          email: users.email
        }
      })
      .from(fileUploads)
      .leftJoin(users, eq(users.id, fileUploads.uploadedBy))
      .where(and(
        eq(fileUploads.tenantId, tenantId),
        eq(fileUploads.isActive, true)
      ))
      .groupBy(fileUploads.uploadedBy, users.name, users.email)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          totalFiles: totalFiles[0]?.count || 0,
          totalSize: statusStats.reduce((sum, stat) => sum + (stat.totalSize || 0), 0),
          processed: statusStats.find(s => s.status === 'processed')?.count || 0,
          processing: statusStats.find(s => s.status === 'processing')?.count || 0,
          errors: statusStats.find(s => s.status === 'error')?.count || 0
        },
        statusStats,
        typeStats,
        recentFiles,
        topUploaders
      }
    });

  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar estatísticas de arquivos'
    });
  }
});

// ==========================================
// BULK OPERATIONS - OPERAÇÕES EM LOTE
// ==========================================

// POST /api/files/bulk/delete - Deletar múltiplos arquivos
router.post('/bulk/delete', async (req: any, res) => {
  try {
    const { fileIds } = req.body;
    const tenantId = req.tenant.id;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de IDs de arquivos é obrigatória'
      });
    }

    console.log(`🗑️ Deletando ${fileIds.length} arquivos em lote - Tenant: ${tenantId}`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Processar cada arquivo
    for (const fileId of fileIds) {
      try {
        const result = await fileUploadService.deleteFile(tenantId, fileId);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${fileId}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${fileId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log(`✅ Operação bulk concluída: ${results.success} sucessos, ${results.failed} falhas`);
    
    res.json({
      success: true,
      data: results,
      message: `${results.success} arquivos removidos, ${results.failed} falharam`
    });

  } catch (error) {
    console.error('Error bulk deleting files:', error);
    res.status(500).json({
      success: false,
      error: 'Falha na remoção em lote de arquivos'
    });
  }
});

// POST /api/files/bulk/reprocess - Reprocessar múltiplos arquivos
router.post('/bulk/reprocess', async (req: any, res) => {
  try {
    const { fileIds, config } = req.body;
    const tenantId = req.tenant.id;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de IDs de arquivos é obrigatória'
      });
    }

    console.log(`🔄 Reprocessando ${fileIds.length} arquivos em lote - Tenant: ${tenantId}`);

    // Validar configuração
    const validatedConfig = FileProcessingSchema.parse(config || {});

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Processar cada arquivo
    for (const fileId of fileIds) {
      try {
        const result = await fileUploadService.reprocessFile(
          tenantId, 
          fileId, 
          { ...validatedConfig, fileId }
        );
        
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${fileId}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${fileId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log(`✅ Reprocessamento concluído: ${results.success} sucessos, ${results.failed} falhas`);

    res.json({
      success: true,
      data: results,
      message: `${results.success} arquivos reprocessados, ${results.failed} falharam`
    });

  } catch (error) {
    console.error('Error bulk reprocessing files:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Configuração inválida',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha no reprocessamento em lote'
      });
    }
  }
});

export { router as fileUploadRoutes };