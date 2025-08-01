import { db } from './db.js';
import { uploadedFiles } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import multer from 'multer';

interface ProcessedFileData {
  headers: string[];
  rows: any[];
  rowCount: number;
  fileSize: number;
  processingTime: number;
}

interface FileUploadResult {
  success: boolean;
  fileId: string;
  fileName: string;
  data?: ProcessedFileData;
  message?: string;
}

class FileProcessingService {
  private uploadDir: string;
  private storage: multer.StorageEngine;
  
  constructor() {
    // Criar diretório de uploads se não existir
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Configurar multer storage
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${nanoid()}_${file.originalname}`;
        cb(null, uniqueName);
      }
    });
  }

  /**
   * Configuração do multer para upload
   */
  getMulterConfig() {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1 // Apenas 1 arquivo por vez
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/vnd.ms-excel', // .xls
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'text/csv', // .csv
          'application/csv'
        ];
        
        const allowedExtensions = ['.xls', '.xlsx', '.csv'];
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos .xls, .xlsx e .csv são permitidos'));
        }
      }
    });
  }

  /**
   * Processar arquivo Excel (.xls, .xlsx)
   */
  async processExcelFile(filePath: string): Promise<ProcessedFileData> {
    const startTime = Date.now();
    
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Primeira planilha
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, // Retornar como array de arrays
        defval: '' // Valor padrão para células vazias
      });
      
      if (data.length === 0) {
        throw new Error('Arquivo vazio ou sem dados');
      }

      // Primeira linha como headers
      const headers = data[0] as string[];
      const rows = data.slice(1).filter(row => 
        // Filtrar linhas que não estão completamente vazias
        (row as any[]).some(cell => cell !== '' && cell != null)
      );

      const fileStats = fs.statSync(filePath);
      const processingTime = Date.now() - startTime;

      return {
        headers: headers.map(h => String(h || '')),
        rows: rows.map(row => {
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header || `Coluna_${index + 1}`] = (row as any[])[index] || '';
          });
          return rowObj;
        }),
        rowCount: rows.length,
        fileSize: fileStats.size,
        processingTime
      };

    } catch (error) {
      throw new Error(`Erro ao processar Excel: ${error.message}`);
    }
  }

  /**
   * Processar arquivo CSV
   */
  async processCSVFile(filePath: string): Promise<ProcessedFileData> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      let headers: string[] = [];
      let isFirstRow = true;

      fs.createReadStream(filePath)
        .pipe(csv({
          separator: [',', ';'], // Aceitar vírgula ou ponto-e-vírgula
          skipEmptyLines: true
        }))
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (data) => {
          if (isFirstRow) {
            // Se headers não foram detectados automaticamente
            if (headers.length === 0) {
              headers = Object.keys(data);
            }
            isFirstRow = false;
          }
          rows.push(data);
        })
        .on('end', () => {
          try {
            const fileStats = fs.statSync(filePath);
            const processingTime = Date.now() - startTime;

            resolve({
              headers,
              rows,
              rowCount: rows.length,
              fileSize: fileStats.size,
              processingTime
            });
          } catch (error) {
            reject(new Error(`Erro ao obter estatísticas do arquivo: ${error.message}`));
          }
        })
        .on('error', (error) => {
          reject(new Error(`Erro ao processar CSV: ${error.message}`));
        });
    });
  }

  /**
   * Processar arquivo enviado
   */
  async processUploadedFile(
    file: Express.Multer.File, 
    userId: string, 
    tenantId: string
  ): Promise<FileUploadResult> {
    try {
      const fileId = nanoid();
      const fileExt = path.extname(file.filename).toLowerCase();
      
      // Processar arquivo baseado na extensão
      let processedData: ProcessedFileData;
      
      if (fileExt === '.csv') {
        processedData = await this.processCSVFile(file.path);
      } else if (fileExt === '.xls' || fileExt === '.xlsx') {
        processedData = await this.processExcelFile(file.path);
      } else {
        throw new Error('Tipo de arquivo não suportado');
      }

      // Salvar metadados no banco
      await db.insert(uploadedFiles).values({
        id: fileId,
        tenantId: tenantId,
        userId: userId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        headers: JSON.stringify(processedData.headers),
        rowCount: processedData.rowCount,
        processingTime: processedData.processingTime,
        status: 'processed',
        metadata: JSON.stringify({
          uploadedAt: new Date().toISOString(),
          processingTime: processedData.processingTime,
          originalSize: file.size
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        fileId: fileId,
        fileName: file.originalname,
        data: processedData
      };

    } catch (error) {
      // Limpar arquivo em caso de erro
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        success: false,
        fileId: '',
        fileName: file.originalname,
        message: error.message
      };
    }
  }

  /**
   * Buscar arquivos de um usuário
   */
  async getUserFiles(userId: string, tenantId: string) {
    try {
      const files = await db.select({
        id: uploadedFiles.id,
        originalName: uploadedFiles.originalName,
        fileSize: uploadedFiles.fileSize,
        rowCount: uploadedFiles.rowCount,
        status: uploadedFiles.status,
        createdAt: uploadedFiles.createdAt,
        headers: uploadedFiles.headers
      })
      .from(uploadedFiles)
      .where(and(
        eq(uploadedFiles.userId, userId),
        eq(uploadedFiles.tenantId, tenantId)
      ))
      .orderBy(uploadedFiles.createdAt);

      return files.map(file => ({
        ...file,
        headers: file.headers ? JSON.parse(file.headers) : [],
        formattedSize: this.formatFileSize(file.fileSize),
        formattedDate: new Date(file.createdAt).toLocaleDateString('pt-BR')
      }));

    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      throw error;
    }
  }

  /**
   * Buscar dados de um arquivo específico
   */
  async getFileData(fileId: string, userId: string, tenantId: string, limit: number = 100, offset: number = 0) {
    try {
      const [file] = await db.select()
        .from(uploadedFiles)
        .where(and(
          eq(uploadedFiles.id, fileId),
          eq(uploadedFiles.userId, userId),
          eq(uploadedFiles.tenantId, tenantId)
        ));

      if (!file) {
        throw new Error('Arquivo não encontrado');
      }

      // Se arquivo foi processado, reprocessar para pegar dados com paginação
      if (file.status === 'processed' && fs.existsSync(file.filePath)) {
        const fileExt = path.extname(file.fileName).toLowerCase();
        let allData: ProcessedFileData;
        
        if (fileExt === '.csv') {
          allData = await this.processCSVFile(file.filePath);
        } else {
          allData = await this.processExcelFile(file.filePath);
        }

        // Aplicar paginação
        const paginatedRows = allData.rows.slice(offset, offset + limit);

        return {
          ...file,
          headers: allData.headers,
          rows: paginatedRows,
          totalRows: allData.rowCount,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(allData.rowCount / limit),
          hasMore: (offset + limit) < allData.rowCount
        };
      }

      throw new Error('Arquivo não processado ou não encontrado no disco');

    } catch (error) {
      console.error('Erro ao buscar dados do arquivo:', error);
      throw error;
    }
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(fileId: string, userId: string, tenantId: string) {
    try {
      const [file] = await db.select()
        .from(uploadedFiles)
        .where(and(
          eq(uploadedFiles.id, fileId),
          eq(uploadedFiles.userId, userId),
          eq(uploadedFiles.tenantId, tenantId)
        ));

      if (!file) {
        throw new Error('Arquivo não encontrado');
      }

      // Deletar arquivo físico
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }

      // Deletar registro do banco
      await db.delete(uploadedFiles)
        .where(eq(uploadedFiles.id, fileId));

      return { success: true };

    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  /**
   * Formatar tamanho do arquivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Limpar arquivos antigos (cleanup job)
   */
  async cleanupOldFiles(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldFiles = await db.select()
        .from(uploadedFiles)
        .where(and(
          eq(uploadedFiles.createdAt, cutoffDate) // Usar operador de comparação adequado
        ));

      let cleanedCount = 0;
      for (const file of oldFiles) {
        try {
          // Deletar arquivo físico
          if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
          }

          // Deletar registro do banco
          await db.delete(uploadedFiles)
            .where(eq(uploadedFiles.id, file.id));

          cleanedCount++;
        } catch (error) {
          console.error(`Erro ao limpar arquivo ${file.id}:`, error);
        }
      }

      console.log(`🧹 ${cleanedCount} arquivos antigos limpos`);
      return cleanedCount;

    } catch (error) {
      console.error('Erro no cleanup de arquivos:', error);
      throw error;
    }
  }
}

export const fileProcessingService = new FileProcessingService();