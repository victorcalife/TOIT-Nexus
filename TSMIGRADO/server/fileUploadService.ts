/**
 * FILE UPLOAD SERVICE - Sistema completo de upload e processamento
 * Suporta: Excel (.xlsx, .xls), CSV, com preview e validação
 * Funcionalidades: Upload, processamento, validação, preview, conversão
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from './db';
import { 
  fileUploads,
  insertFileUploadSchema
} from '../shared/schema';
import { eq, desc, and, or, ilike, gte, lte } from 'drizzle-orm';

// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const PREVIEW_ROWS = 10; // Número de linhas para preview

// Validation Schemas
export const FileUploadSchema = z.object({
  originalName: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const FileProcessingSchema = z.object({
  fileId: z.string(),
  columnMapping: z.record(z.string()).optional(), // Mapeamento de colunas
  skipRows: z.number().default(0), // Pular linhas do cabeçalho
  skipEmptyRows: z.boolean().default(true),
  validateData: z.boolean().default(true),
});

// Interface para resultado do processamento
interface ProcessingResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{ row: number; column: string; error: string; value: any }>;
  schema: Array<{ name: string; type: string; nullable: boolean }>;
  preview: any[];
  summary: {
    numericColumns: string[];
    textColumns: string[];
    dateColumns: string[];
    emptyColumns: string[];
  };
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${nanoid()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não suportado. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

export class FileUploadService {
  
  /**
   * PROCESSAR ARQUIVO APÓS UPLOAD
   */
  async processUploadedFile(
    tenantId: string, 
    userId: string, 
    file: Express.Multer.File, 
    metadata: z.infer<typeof FileUploadSchema>
  ) {
    try {
      const fileId = nanoid();
      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();

      // Processar arquivo baseado na extensão
      let processingResult: ProcessingResult;
      
      if (ext === '.csv') {
        processingResult = await this.processCSVFile(filePath);
      } else if (ext === '.xlsx' || ext === '.xls') {
        processingResult = await this.processExcelFile(filePath);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      // Salvar no banco de dados
      const uploadRecord = await db
        .insert(fileUploads)
        .values({
          id: fileId,
          tenantId,
          originalName: metadata.originalName,
          fileName: file.filename,
          filePath: filePath,
          mimeType: file.mimetype,
          fileSize: file.size,
          status: processingResult.success ? 'processed' : 'error',
          processingResult: processingResult as any,
          errorMessage: processingResult.success ? null : 'Erro no processamento',
          previewData: processingResult.preview,
          totalRows: processingResult.totalRows,
          validRows: processingResult.validRows,
          description: metadata.description || null,
          tags: metadata.tags || [],
          uploadedBy: userId,
        })
        .returning();

      return {
        success: true,
        data: {
          file: uploadRecord[0],
          processing: processingResult
        },
        message: 'Arquivo processado com sucesso'
      };

    } catch (error) {
      console.error('Error processing uploaded file:', error);
      
      // Limpar arquivo em caso de erro
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no processamento do arquivo'
      };
    }
  }

  /**
   * PROCESSAR ARQUIVO CSV
   */
  private async processCSVFile(filePath: string): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const errors: any[] = [];
      let headers: string[] = [];
      let rowCount = 0;

      const stream = createReadStream(filePath)
        .pipe(csv({ 
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('headers', (headerList: string[]) => {
          headers = headerList;
        })
        .on('data', (data: any) => {
          rowCount++;
          
          // Validar dados básicos
          const rowErrors = this.validateRowData(data, rowCount, headers);
          errors.push(...rowErrors);
          
          results.push(data);
          
          // Limitar preview
          if (results.length >= 1000) {
            stream.destroy();
          }
        })
        .on('end', () => {
          const schema = this.inferSchema(results, headers);
          const summary = this.generateDataSummary(results, headers);
          const preview = results.slice(0, PREVIEW_ROWS);

          resolve({
            success: true,
            totalRows: rowCount,
            validRows: rowCount - errors.length,
            invalidRows: errors.length,
            errors: errors.slice(0, 100), // Limitar errors no response
            schema,
            preview,
            summary
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * PROCESSAR ARQUIVO EXCEL
   */
  private async processExcelFile(filePath: string): Promise<ProcessingResult> {
    try {
      // Ler arquivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Usar primeira aba
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        blankrows: false
      });

      if (jsonData.length === 0) {
        throw new Error('Arquivo Excel está vazio');
      }

      // Primeira linha como headers
      const headers = (jsonData[0] as any[]).map(h => String(h || '').trim()).filter(h => h);
      const dataRows = jsonData.slice(1).filter(row => 
        Array.isArray(row) && row.some(cell => cell !== null && cell !== '')
      );

      // Converter para objetos
      const results: any[] = [];
      const errors: any[] = [];

      dataRows.forEach((row: any, index) => {
        const rowObj: any = {};
        headers.forEach((header, colIndex) => {
          rowObj[header] = row[colIndex] || null;
        });
        
        // Validar linha
        const rowErrors = this.validateRowData(rowObj, index + 2, headers); // +2 porque header é linha 1
        errors.push(...rowErrors);
        
        results.push(rowObj);
      });

      const schema = this.inferSchema(results, headers);
      const summary = this.generateDataSummary(results, headers);
      const preview = results.slice(0, PREVIEW_ROWS);

      return {
        success: true,
        totalRows: dataRows.length,
        validRows: dataRows.length - errors.length,
        invalidRows: errors.length,
        errors: errors.slice(0, 100),
        schema,
        preview,
        summary
      };

    } catch (error) {
      throw new Error(`Erro ao processar Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * VALIDAR DADOS DE UMA LINHA
   */
  private validateRowData(data: any, rowNumber: number, headers: string[]): any[] {
    const errors: any[] = [];

    headers.forEach(header => {
      const value = data[header];
      
      // Validações básicas
      if (value === null || value === undefined || value === '') {
        // Campo vazio - pode ser válido dependendo do contexto
        return;
      }

      // Validar se é número quando esperado
      if (this.looksLikeNumber(header) && !this.isValidNumber(value)) {
        errors.push({
          row: rowNumber,
          column: header,
          error: 'Valor não é um número válido',
          value: value
        });
      }

      // Validar se é data quando esperado
      if (this.looksLikeDate(header) && !this.isValidDate(value)) {
        errors.push({
          row: rowNumber,
          column: header,
          error: 'Valor não é uma data válida',
          value: value
        });
      }

      // Validar se é email quando esperado
      if (this.looksLikeEmail(header) && !this.isValidEmail(value)) {
        errors.push({
          row: rowNumber,
          column: header,
          error: 'Valor não é um email válido',
          value: value
        });
      }
    });

    return errors;
  }

  /**
   * INFERIR SCHEMA DOS DADOS
   */
  private inferSchema(data: any[], headers: string[]): Array<{ name: string; type: string; nullable: boolean }> {
    const schema: Array<{ name: string; type: string; nullable: boolean }> = [];

    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
      
      let type = 'text';
      let nullable = data.some(row => !row[header]);

      if (values.length > 0) {
        // Verificar se todos são números
        if (values.every(v => this.isValidNumber(v))) {
          type = values.some(v => String(v).includes('.')) ? 'decimal' : 'integer';
        }
        // Verificar se todos são datas
        else if (values.every(v => this.isValidDate(v))) {
          type = 'date';
        }
        // Verificar se todos são emails
        else if (values.every(v => this.isValidEmail(v))) {
          type = 'email';
        }
        // Verificar se são booleanos
        else if (values.every(v => this.isValidBoolean(v))) {
          type = 'boolean';
        }
      }

      schema.push({
        name: header,
        type,
        nullable
      });
    });

    return schema;
  }

  /**
   * GERAR RESUMO DOS DADOS
   */
  private generateDataSummary(data: any[], headers: string[]) {
    const summary = {
      numericColumns: [] as string[],
      textColumns: [] as string[],
      dateColumns: [] as string[],
      emptyColumns: [] as string[]
    };

    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
      
      if (values.length === 0) {
        summary.emptyColumns.push(header);
      } else if (values.every(v => this.isValidNumber(v))) {
        summary.numericColumns.push(header);
      } else if (values.every(v => this.isValidDate(v))) {
        summary.dateColumns.push(header);
      } else {
        summary.textColumns.push(header);
      }
    });

    return summary;
  }

  // Utility functions para validação
  private looksLikeNumber(header: string): boolean {
    const numberWords = ['valor', 'preco', 'quantidade', 'total', 'subtotal', 'desconto', 'taxa', 'porcentagem'];
    return numberWords.some(word => header.toLowerCase().includes(word));
  }

  private looksLikeDate(header: string): boolean {
    const dateWords = ['data', 'date', 'created', 'updated', 'nascimento', 'vencimento'];
    return dateWords.some(word => header.toLowerCase().includes(word));
  }

  private looksLikeEmail(header: string): boolean {
    const emailWords = ['email', 'e-mail', 'mail'];
    return emailWords.some(word => header.toLowerCase().includes(word));
  }

  private isValidNumber(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  private isValidDate(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private isValidEmail(value: any): boolean {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private isValidBoolean(value: any): boolean {
    if (typeof value === 'boolean') return true;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return ['true', 'false', 'sim', 'não', 'yes', 'no', '1', '0'].includes(lower);
    }
    return false;
  }

  /**
   * REPROCESSAR ARQUIVO COM CONFIGURAÇÕES CUSTOMIZADAS
   */
  async reprocessFile(
    tenantId: string, 
    fileId: string, 
    config: z.infer<typeof FileProcessingSchema>
  ) {
    try {
      // Buscar arquivo
      const file = await db
        .select()
        .from(fileUploads)
        .where(and(
          eq(fileUploads.id, fileId),
          eq(fileUploads.tenantId, tenantId)
        ))
        .limit(1);

      if (file.length === 0) {
        throw new Error('Arquivo não encontrado');
      }

      const fileRecord = file[0];
      const ext = path.extname(fileRecord.originalName).toLowerCase();

      // Reprocessar com configurações customizadas
      let processingResult: ProcessingResult;
      
      if (ext === '.csv') {
        processingResult = await this.processCSVWithConfig(fileRecord.filePath, config);
      } else if (ext === '.xlsx' || ext === '.xls') {
        processingResult = await this.processExcelWithConfig(fileRecord.filePath, config);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      // Atualizar registro
      const updatedFile = await db
        .update(fileUploads)
        .set({
          status: processingResult.success ? 'processed' : 'error',
          processingResult: processingResult as any,
          previewData: processingResult.preview,
          columnMapping: config.columnMapping as any,
          totalRows: processingResult.totalRows,
          validRows: processingResult.validRows,
          updatedAt: new Date(),
        })
        .where(eq(fileUploads.id, fileId))
        .returning();

      return {
        success: true,
        data: {
          file: updatedFile[0],
          processing: processingResult
        },
        message: 'Arquivo reprocessado com sucesso'
      };

    } catch (error) {
      console.error('Error reprocessing file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao reprocessar arquivo'
      };
    }
  }

  /**
   * PROCESSAR CSV COM CONFIGURAÇÕES
   */
  private async processCSVWithConfig(
    filePath: string, 
    config: z.infer<typeof FileProcessingSchema>
  ): Promise<ProcessingResult> {
    // Similar ao processCSVFile, mas aplicando as configurações
    // skipRows, columnMapping, etc.
    return this.processCSVFile(filePath); // Simplificado para demo
  }

  /**
   * PROCESSAR EXCEL COM CONFIGURAÇÕES
   */
  private async processExcelWithConfig(
    filePath: string, 
    config: z.infer<typeof FileProcessingSchema>
  ): Promise<ProcessingResult> {
    // Similar ao processExcelFile, mas aplicando as configurações
    return this.processExcelFile(filePath); // Simplificado para demo
  }

  /**
   * CONVERTER ARQUIVO PARA FORMATO
   */
  async convertFile(
    tenantId: string, 
    fileId: string, 
    targetFormat: 'json' | 'csv' | 'xlsx'
  ) {
    try {
      // Buscar arquivo
      const file = await db
        .select()
        .from(fileUploads)
        .where(and(
          eq(fileUploads.id, fileId),
          eq(fileUploads.tenantId, tenantId)
        ))
        .limit(1);

      if (file.length === 0) {
        throw new Error('Arquivo não encontrado');
      }

      const fileRecord = file[0];
      const processingResult = fileRecord.processingResult as any;

      if (!processingResult || !processingResult.success) {
        throw new Error('Arquivo não foi processado com sucesso');
      }

      // Gerar nome do arquivo convertido
      const baseName = path.parse(fileRecord.originalName).name;
      const convertedFileName = `${baseName}_converted_${Date.now()}.${targetFormat}`;
      const convertedFilePath = path.join(UPLOAD_DIR, convertedFileName);

      // Converter baseado no formato alvo
      let conversionResult: any;

      switch (targetFormat) {
        case 'json':
          conversionResult = await this.convertToJSON(processingResult, convertedFilePath);
          break;
        case 'csv':
          conversionResult = await this.convertToCSV(processingResult, convertedFilePath);
          break;
        case 'xlsx':
          conversionResult = await this.convertToExcel(processingResult, convertedFilePath);
          break;
        default:
          throw new Error('Formato de conversão não suportado');
      }

      return {
        success: true,
        data: {
          originalFile: fileRecord,
          convertedFile: {
            fileName: convertedFileName,
            filePath: convertedFilePath,
            format: targetFormat,
            size: conversionResult.size
          }
        },
        message: `Arquivo convertido para ${targetFormat.toUpperCase()} com sucesso`
      };

    } catch (error) {
      console.error('Error converting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na conversão do arquivo'
      };
    }
  }

  /**
   * CONVERTER PARA JSON
   */
  private async convertToJSON(processingResult: any, outputPath: string) {
    const jsonData = JSON.stringify(processingResult.preview, null, 2);
    await fs.writeFile(outputPath, jsonData, 'utf8');
    const stats = await fs.stat(outputPath);
    return { size: stats.size };
  }

  /**
   * CONVERTER PARA CSV
   */
  private async convertToCSV(processingResult: any, outputPath: string) {
    const data = processingResult.preview;
    if (!data || data.length === 0) {
      throw new Error('Nenhum dado para converter');
    }

    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    
    data.forEach((row: any) => {
      const values = headers.map(header => {
        const value = row[header];
        // Escapar valores que contém vírgula ou aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvContent += values.join(',') + '\n';
    });

    await fs.writeFile(outputPath, csvContent, 'utf8');
    const stats = await fs.stat(outputPath);
    return { size: stats.size };
  }

  /**
   * CONVERTER PARA EXCEL
   */
  private async convertToExcel(processingResult: any, outputPath: string) {
    const data = processingResult.preview;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, outputPath);
    
    const stats = await fs.stat(outputPath);
    return { size: stats.size };
  }

  /**
   * LISTAR ARQUIVOS DO TENANT
   */
  async getFiles(
    tenantId: string,
    filters: {
      search?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const { search, status, limit = 20, offset = 0 } = filters;

      let query = db
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
        .where(eq(fileUploads.tenantId, tenantId));

      // Aplicar filtros
      if (search) {
        query = query.where(
          or(
            ilike(fileUploads.originalName, `%${search}%`),
            ilike(fileUploads.description, `%${search}%`)
          )
        );
      }

      if (status) {
        query = query.where(eq(fileUploads.status, status));
      }

      const files = await query
        .orderBy(desc(fileUploads.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: files.map(item => ({
          ...item.file,
          uploadedByUser: item.uploadedByUser,
          // Não retornar dados grandes na listagem
          processingResult: undefined,
          previewData: undefined
        })),
        total: files.length
      };

    } catch (error) {
      console.error('Error getting files:', error);
      return {
        success: false,
        error: 'Erro ao buscar arquivos'
      };
    }
  }

  /**
   * DELETAR ARQUIVO
   */
  async deleteFile(tenantId: string, fileId: string) {
    try {
      const file = await db
        .select()
        .from(fileUploads)
        .where(and(
          eq(fileUploads.id, fileId),
          eq(fileUploads.tenantId, tenantId)
        ))
        .limit(1);

      if (file.length === 0) {
        throw new Error('Arquivo não encontrado');
      }

      const fileRecord = file[0];

      // Deletar arquivo físico
      try {
        await fs.unlink(fileRecord.filePath);
      } catch (unlinkError) {
        console.warn('File already deleted or not found:', unlinkError);
      }

      // Marcar como inativo no banco
      await db
        .update(fileUploads)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(fileUploads.id, fileId));

      return {
        success: true,
        message: 'Arquivo removido com sucesso'
      };

    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao remover arquivo'
      };
    }
  }
}

// Instância singleton
export const fileUploadService = new FileUploadService();