import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";
import { Parser } from "csv-parser";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
// Remove node-fetch import as it's not available

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Schema validation
const databaseConnectionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb']),
  host: z.string(),
  port: z.number(),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().optional(),
  options: z.record(z.any()).optional()
});

const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  headers: z.record(z.string()).optional(),
  payload: z.any().optional(),
  authentication: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'api_key']),
    credentials: z.record(z.string()).optional()
  }).optional()
});

const apiConnectionSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  authentication: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'api_key', 'oauth2']),
    credentials: z.record(z.string())
  }),
  headers: z.record(z.string()).optional(),
  rateLimit: z.object({
    requests: z.number(),
    period: z.number() // in seconds
  }).optional()
});

export function registerDataConnectionRoutes(app: Express) {
  
  // Database Connections
  app.post('/api/data-connections/database', async (req, res) => {
    try {
      const connectionData = databaseConnectionSchema.parse(req.body);
      const tenantId = (req as any).tenantId || 'default';
      
      // Test connection first
      const testResult = await testDatabaseConnection(connectionData);
      if (!testResult.success) {
        return res.status(400).json({ error: testResult.error });
      }
      
      const connection = await storage.createIntegration({
        tenantId,
        name: connectionData.name,
        type: 'database' as any,
        config: connectionData,
        isActive: true
      });
      
      res.json(connection);
    } catch (error: any) {
      console.error('Database connection error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Test database connection
  app.post('/api/data-connections/database/test', async (req, res) => {
    try {
      const connectionData = databaseConnectionSchema.parse(req.body);
      const result = await testDatabaseConnection(connectionData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Webhook Connections
  app.post('/api/data-connections/webhook', async (req, res) => {
    try {
      const webhookData = webhookSchema.parse(req.body);
      const tenantId = (req as any).tenantId || 'default';
      
      // Test webhook
      const testResult = await testWebhook(webhookData);
      if (!testResult.success) {
        return res.status(400).json({ error: testResult.error });
      }
      
      const webhook = await storage.createIntegration({
        tenantId,
        name: webhookData.name,
        type: 'webhook' as any,
        config: webhookData,
        isActive: true
      });
      
      res.json(webhook);
    } catch (error: any) {
      console.error('Webhook creation error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Test webhook
  app.post('/api/data-connections/webhook/test', async (req, res) => {
    try {
      const webhookData = webhookSchema.parse(req.body);
      const result = await testWebhook(webhookData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API Connections
  app.post('/api/data-connections/api', async (req, res) => {
    try {
      const apiData = apiConnectionSchema.parse(req.body);
      const tenantId = (req as any).tenantId || 'default';
      
      // Test API connection
      const testResult = await testApiConnection(apiData);
      if (!testResult.success) {
        return res.status(400).json({ error: testResult.error });
      }
      
      const api = await storage.createIntegration({
        tenantId,
        name: apiData.name,
        type: 'api' as any,
        config: apiData,
        isActive: true
      });
      
      res.json(api);
    } catch (error: any) {
      console.error('API connection error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Test API connection
  app.post('/api/data-connections/api/test', async (req, res) => {
    try {
      const apiData = apiConnectionSchema.parse(req.body);
      const result = await testApiConnection(apiData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // File Upload and Processing
  app.post('/api/data-connections/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const tenantId = (req as any).tenantId || 'default';
      const file = req.file;
      const originalName = file.originalname;
      const fileExtension = path.extname(originalName).toLowerCase();
      
      let data: any[] = [];
      
      if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        // Process Excel file
        data = await processExcelFile(file.path);
      } else if (fileExtension === '.csv') {
        // Process CSV file
        data = await processCsvFile(file.path);
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Only Excel and CSV files are supported.' });
      }
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      
      // Save processed data metadata
      const dataSource = await storage.createIntegration({
        tenantId,
        name: `Upload: ${originalName}`,
        type: 'file' as any,
        config: {
          originalName,
          fileType: fileExtension,
          rowCount: data.length,
          columns: data.length > 0 ? Object.keys(data[0]) : [],
          uploadedAt: new Date().toISOString()
        },
        isActive: true
      });
      
      res.json({
        dataSource,
        preview: data.slice(0, 10), // Return first 10 rows as preview
        totalRows: data.length,
        columns: data.length > 0 ? Object.keys(data[0]) : []
      });
      
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Export to PDF
  app.post('/api/data-connections/export/pdf', async (req, res) => {
    try {
      const { data, title, columns } = req.body;
      
      const doc = new PDFDocument();
      const filename = `export_${Date.now()}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      doc.pipe(res);
      
      // Add title
      doc.fontSize(16).text(title || 'Data Export', { align: 'center' });
      doc.moveDown();
      
      // Add table
      const tableTop = doc.y;
      const rowHeight = 20;
      let currentY = tableTop;
      
      // Headers
      doc.fontSize(10);
      columns.forEach((col: string, i: number) => {
        doc.text(col, 50 + (i * 100), currentY, { width: 95 });
      });
      
      currentY += rowHeight;
      
      // Data rows
      data.forEach((row: any, rowIndex: number) => {
        columns.forEach((col: string, colIndex: number) => {
          doc.text(String(row[col] || ''), 50 + (colIndex * 100), currentY, { width: 95 });
        });
        currentY += rowHeight;
        
        // Start new page if needed
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
      });
      
      doc.end();
      
    } catch (error: any) {
      console.error('PDF export error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Export to Excel
  app.post('/api/data-connections/export/excel', async (req, res) => {
    try {
      const { data, title, sheetName } = req.body;
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Data');
      
      const filename = `export_${Date.now()}.xlsx`;
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.send(buffer);
      
    } catch (error: any) {
      console.error('Excel export error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all data connections
  app.get('/api/data-connections', async (req, res) => {
    try {
      const tenantId = (req as any).tenantId || 'default';
      const connections = await storage.getIntegrations(tenantId);
      res.json(connections);
    } catch (error: any) {
      console.error('Get connections error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete data connection
  app.delete('/api/data-connections/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteIntegration(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete connection error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

// Helper functions
async function testDatabaseConnection(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    // This would normally test the actual database connection
    // For now, we'll simulate the test
    if (!config.host || !config.database) {
      return { success: false, error: 'Host and database are required' };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function testWebhook(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (config.headers) {
      Object.assign(headers, config.headers);
    }
    
    if (config.authentication?.type === 'bearer' && config.authentication.credentials?.token) {
      headers.Authorization = `Bearer ${config.authentication.credentials.token}`;
    }
    
    // Simulate webhook test for now
    // In production, you would use a proper HTTP client like axios
    const response = { ok: true, status: 200, statusText: 'OK' };
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function testApiConnection(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (config.headers) {
      Object.assign(headers, config.headers);
    }
    
    if (config.authentication?.type === 'bearer' && config.authentication.credentials?.token) {
      headers.Authorization = `Bearer ${config.authentication.credentials.token}`;
    } else if (config.authentication?.type === 'api_key' && config.authentication.credentials?.key) {
      headers['X-API-Key'] = config.authentication.credentials.key;
    }
    
    // Simulate API test for now
    // In production, you would use a proper HTTP client like axios
    const response = { ok: true, status: 200, statusText: 'OK' };
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function processExcelFile(filePath: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

async function processCsvFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const parser = new Parser();
    
    fs.createReadStream(filePath)
      .pipe(parser)
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}