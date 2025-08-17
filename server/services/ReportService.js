const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const DatabaseService = require('./DatabaseService');
const QuantumProcessor = require('./QuantumProcessor');

class ReportService {
  constructor() {
    this.db = new DatabaseService();
    this.quantumProcessor = new QuantumProcessor();
    this.scheduledReports = new Map();
    
    this.initializeReportDirectories();
    this.startScheduler();
  }

  /**
   * Inicializar diretórios de relatórios
   */
  async initializeReportDirectories() {
    try {
      const dirs = [
        'reports/generated',
        'reports/templates',
        'reports/temp'
      ];

      for (const dir of dirs) {
        const fullPath = path.join(process.cwd(), dir);
        try {
          await fs.access(fullPath);
        } catch {
          await fs.mkdir(fullPath, { recursive: true });
          console.log(`📁 Diretório criado: ${fullPath}`);
        }
      }

      console.log('✅ Diretórios de relatórios inicializados');

    } catch (error) {
      console.error('❌ Erro ao inicializar diretórios:', error);
    }
  }

  /**
   * Validar query SQL
   */
  async validateQuery(queryText, dataSource) {
    try {
      // Validações básicas de segurança
      const dangerousKeywords = [
        'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE',
        'EXEC', 'EXECUTE', 'xp_', 'sp_', '--', '/*', '*/', ';'
      ];

      const upperQuery = queryText.toUpperCase();
      
      for (const keyword of dangerousKeywords) {
        if (upperQuery.includes(keyword)) {
          return {
            valid: false,
            errors: [`Palavra-chave não permitida: ${keyword}`]
          };
        }
      }

      // Verificar se é uma query SELECT
      if (!upperQuery.trim().startsWith('SELECT')) {
        return {
          valid: false,
          errors: ['Apenas queries SELECT são permitidas']
        };
      }

      // Validar sintaxe básica (simulado)
      const hasFrom = upperQuery.includes('FROM');
      if (!hasFrom) {
        return {
          valid: false,
          errors: ['Query deve conter cláusula FROM']
        };
      }

      return {
        valid: true,
        errors: []
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Erro na validação: ${error.message}`]
      };
    }
  }

  /**
   * Gerar relatório
   */
  async generateReport(options) {
    try {
      const { report, runtimeParameters, outputFormat, quantumSpeedup = 1 } = options;

      console.log(`📊 Gerando relatório: ${report.name} (formato: ${outputFormat})`);

      // Simular tempo de processamento com speedup quântico
      const baseProcessingTime = 2000; // 2 segundos base
      const actualTime = baseProcessingTime / quantumSpeedup;
      
      await new Promise(resolve => setTimeout(resolve, actualTime));

      // Executar query e obter dados
      const data = await this.executeReportQuery(report, runtimeParameters);

      // Gerar arquivo baseado no formato
      let filePath, fileSize;
      
      switch (outputFormat.toLowerCase()) {
        case 'pdf':
          ({ filePath, fileSize } = await this.generatePDFReport(report, data));
          break;
        case 'excel':
          ({ filePath, fileSize } = await this.generateExcelReport(report, data));
          break;
        case 'csv':
          ({ filePath, fileSize } = await this.generateCSVReport(report, data));
          break;
        case 'html':
          ({ filePath, fileSize } = await this.generateHTMLReport(report, data));
          break;
        default:
          throw new Error(`Formato não suportado: ${outputFormat}`);
      }

      return {
        success: true,
        filePath,
        fileSize,
        recordCount: data.length,
        processingTime: actualTime,
        quantumSpeedup
      };

    } catch (error) {
      console.error('❌ Erro na geração do relatório:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Executar query do relatório
   */
  async executeReportQuery(report, runtimeParameters) {
    try {
      // Simular execução de query com dados mock
      const mockData = this.generateMockData(report.type, runtimeParameters);
      
      // Em produção, aqui seria executada a query real:
      // const data = await this.db.query(report.query_text, parameters);
      
      return mockData;

    } catch (error) {
      console.error('❌ Erro na execução da query:', error);
      throw error;
    }
  }

  /**
   * Gerar dados mock baseados no tipo de relatório
   */
  generateMockData(reportType, parameters) {
    const baseData = [];
    const recordCount = parameters.recordLimit || 100;

    switch (reportType) {
      case 'sales':
        for (let i = 0; i < recordCount; i++) {
          baseData.push({
            id: i + 1,
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            product: `Produto ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            quantity: Math.floor(Math.random() * 100) + 1,
            value: (Math.random() * 1000 + 100).toFixed(2),
            customer: `Cliente ${i + 1}`,
            region: ['Norte', 'Sul', 'Leste', 'Oeste'][Math.floor(Math.random() * 4)]
          });
        }
        break;

      case 'analytics':
        for (let i = 0; i < recordCount; i++) {
          baseData.push({
            metric: `Métrica ${i + 1}`,
            value: Math.floor(Math.random() * 1000),
            change: (Math.random() * 20 - 10).toFixed(2) + '%',
            category: ['Performance', 'Engagement', 'Conversion'][Math.floor(Math.random() * 3)],
            date: new Date(2024, 11, Math.floor(Math.random() * 30) + 1)
          });
        }
        break;

      case 'financial':
        for (let i = 0; i < recordCount; i++) {
          baseData.push({
            account: `Conta ${1000 + i}`,
            description: `Transação ${i + 1}`,
            debit: Math.random() > 0.5 ? (Math.random() * 5000).toFixed(2) : 0,
            credit: Math.random() > 0.5 ? (Math.random() * 5000).toFixed(2) : 0,
            balance: (Math.random() * 10000).toFixed(2),
            date: new Date(2024, 11, Math.floor(Math.random() * 30) + 1)
          });
        }
        break;

      default:
        for (let i = 0; i < recordCount; i++) {
          baseData.push({
            id: i + 1,
            name: `Item ${i + 1}`,
            value: Math.floor(Math.random() * 1000),
            status: ['Ativo', 'Inativo', 'Pendente'][Math.floor(Math.random() * 3)],
            created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          });
        }
    }

    return baseData;
  }

  /**
   * Gerar relatório PDF
   */
  async generatePDFReport(report, data) {
    try {
      const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join('reports/generated', fileName);
      const fullPath = path.join(process.cwd(), filePath);

      const doc = new PDFDocument();
      const stream = require('fs').createWriteStream(fullPath);
      doc.pipe(stream);

      // Cabeçalho
      doc.fontSize(20).text(report.name, 50, 50);
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, 80);
      doc.fontSize(10).text(`Descrição: ${report.description || 'N/A'}`, 50, 100);

      // Linha separadora
      doc.moveTo(50, 120).lineTo(550, 120).stroke();

      // Dados
      let yPosition = 140;
      const pageHeight = 750;

      if (data.length > 0) {
        // Cabeçalhos das colunas
        const columns = Object.keys(data[0]);
        const columnWidth = 500 / columns.length;

        doc.fontSize(10).fillColor('black');
        columns.forEach((column, index) => {
          doc.text(column.toUpperCase(), 50 + (index * columnWidth), yPosition, {
            width: columnWidth - 10,
            align: 'left'
          });
        });

        yPosition += 20;
        doc.moveTo(50, yPosition - 5).lineTo(550, yPosition - 5).stroke();

        // Dados das linhas
        data.forEach((row, rowIndex) => {
          if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 50;
          }

          columns.forEach((column, colIndex) => {
            let value = row[column];
            if (value instanceof Date) {
              value = value.toLocaleDateString('pt-BR');
            } else if (typeof value === 'number') {
              value = value.toLocaleString('pt-BR');
            }

            doc.fontSize(9).text(String(value || ''), 50 + (colIndex * columnWidth), yPosition, {
              width: columnWidth - 10,
              align: 'left'
            });
          });

          yPosition += 15;
        });
      } else {
        doc.fontSize(12).text('Nenhum dado encontrado', 50, yPosition);
      }

      // Rodapé
      doc.fontSize(8).text(`Total de registros: ${data.length}`, 50, doc.page.height - 50);
      
      if (report.quantum_enhanced) {
        doc.text('⚛️ Processado com Algoritmos Quânticos', 300, doc.page.height - 50);
      }

      doc.end();

      // Aguardar conclusão
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      const stats = await fs.stat(fullPath);

      return {
        filePath,
        fileSize: stats.size
      };

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório Excel
   */
  async generateExcelReport(report, data) {
    try {
      const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
      const filePath = path.join('reports/generated', fileName);
      const fullPath = path.join(process.cwd(), filePath);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(report.name);

      // Metadados
      worksheet.getCell('A1').value = report.name;
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A2').value = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
      worksheet.getCell('A3').value = `Registros: ${data.length}`;

      if (data.length > 0) {
        // Cabeçalhos
        const headers = Object.keys(data[0]);
        const headerRow = worksheet.getRow(5);
        
        headers.forEach((header, index) => {
          const cell = headerRow.getCell(index + 1);
          cell.value = header.toUpperCase();
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
        });

        // Dados
        data.forEach((row, rowIndex) => {
          const dataRow = worksheet.getRow(rowIndex + 6);
          headers.forEach((header, colIndex) => {
            let value = row[header];
            if (value instanceof Date) {
              value = value.toLocaleDateString('pt-BR');
            }
            dataRow.getCell(colIndex + 1).value = value;
          });
        });

        // Auto-ajustar colunas
        worksheet.columns.forEach(column => {
          column.width = 15;
        });
      }

      await workbook.xlsx.writeFile(fullPath);

      const stats = await fs.stat(fullPath);

      return {
        filePath,
        fileSize: stats.size
      };

    } catch (error) {
      console.error('❌ Erro ao gerar Excel:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório CSV
   */
  async generateCSVReport(report, data) {
    try {
      const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
      const filePath = path.join('reports/generated', fileName);
      const fullPath = path.join(process.cwd(), filePath);

      if (data.length === 0) {
        await fs.writeFile(fullPath, 'Nenhum dado encontrado');
      } else {
        const headers = Object.keys(data[0]);
        
        const csvWriter = createObjectCsvWriter({
          path: fullPath,
          header: headers.map(h => ({ id: h, title: h.toUpperCase() })),
          encoding: 'utf8'
        });

        // Processar dados para CSV
        const processedData = data.map(row => {
          const processedRow = {};
          headers.forEach(header => {
            let value = row[header];
            if (value instanceof Date) {
              value = value.toLocaleDateString('pt-BR');
            }
            processedRow[header] = value;
          });
          return processedRow;
        });

        await csvWriter.writeRecords(processedData);
      }

      const stats = await fs.stat(fullPath);

      return {
        filePath,
        fileSize: stats.size
      };

    } catch (error) {
      console.error('❌ Erro ao gerar CSV:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório HTML
   */
  async generateHTMLReport(report, data) {
    try {
      const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.html`;
      const filePath = path.join('reports/generated', fileName);
      const fullPath = path.join(process.cwd(), filePath);

      let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #333; }
        .meta { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; color: #666; }
        .quantum-badge { background: linear-gradient(45deg, #8B5CF6, #EC4899); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${report.name}</div>
        <div class="meta">
            Gerado em: ${new Date().toLocaleString('pt-BR')}<br>
            ${report.description ? `Descrição: ${report.description}<br>` : ''}
            Total de registros: ${data.length}
            ${report.quantum_enhanced ? '<span class="quantum-badge">⚛️ Quantum Enhanced</span>' : ''}
        </div>
    </div>
`;

      if (data.length > 0) {
        html += '<table>';
        
        // Cabeçalhos
        const headers = Object.keys(data[0]);
        html += '<thead><tr>';
        headers.forEach(header => {
          html += `<th>${header.toUpperCase()}</th>`;
        });
        html += '</tr></thead>';

        // Dados
        html += '<tbody>';
        data.forEach(row => {
          html += '<tr>';
          headers.forEach(header => {
            let value = row[header];
            if (value instanceof Date) {
              value = value.toLocaleDateString('pt-BR');
            } else if (typeof value === 'number') {
              value = value.toLocaleString('pt-BR');
            }
            html += `<td>${value || ''}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table>';
      } else {
        html += '<p>Nenhum dado encontrado.</p>';
      }

      html += `
    <div class="footer">
        Relatório gerado pelo TOIT Nexus - Sistema Quântico de Gestão
    </div>
</body>
</html>`;

      await fs.writeFile(fullPath, html, 'utf8');

      const stats = await fs.stat(fullPath);

      return {
        filePath,
        fileSize: stats.size
      };

    } catch (error) {
      console.error('❌ Erro ao gerar HTML:', error);
      throw error;
    }
  }

  /**
   * Agendar relatório
   */
  async scheduleReport(options) {
    try {
      const { reportId, scheduleConfig, userId } = options;

      console.log(`📅 Agendando relatório ${reportId} para usuário ${userId}`);

      // Armazenar configuração de agendamento
      this.scheduledReports.set(reportId, {
        ...scheduleConfig,
        userId,
        nextRun: this.calculateNextRun(scheduleConfig),
        isActive: true
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao agendar relatório:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancelar agendamento
   */
  async unscheduleReport(reportId) {
    try {
      this.scheduledReports.delete(reportId);
      console.log(`📅 Agendamento cancelado para relatório ${reportId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calcular próxima execução
   */
  calculateNextRun(scheduleConfig) {
    const now = new Date();
    const { frequency, time, dayOfWeek, dayOfMonth } = scheduleConfig;

    switch (frequency) {
      case 'daily':
        const [hours, minutes] = time.split(':');
        const nextRun = new Date(now);
        nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        
        return nextRun;

      case 'weekly':
        // Implementar lógica semanal
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      case 'monthly':
        // Implementar lógica mensal
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Iniciar scheduler
   */
  startScheduler() {
    setInterval(async () => {
      const now = new Date();
      
      for (const [reportId, schedule] of this.scheduledReports.entries()) {
        if (schedule.isActive && schedule.nextRun <= now) {
          try {
            console.log(`📊 Executando relatório agendado: ${reportId}`);
            
            // Buscar dados do relatório
            const reports = await this.db.query(`
              SELECT * FROM reports WHERE id = ?
            `, [reportId]);

            if (reports.length > 0) {
              const report = reports[0];
              
              // Gerar relatório
              await this.generateReport({
                report,
                runtimeParameters: {},
                outputFormat: report.output_format
              });

              // Calcular próxima execução
              schedule.nextRun = this.calculateNextRun(schedule);
            }

          } catch (error) {
            console.error(`❌ Erro na execução agendada do relatório ${reportId}:`, error);
          }
        }
      }
    }, 60000); // Verificar a cada minuto

    console.log('✅ Scheduler de relatórios iniciado');
  }
}

module.exports = ReportService;
