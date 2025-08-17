const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');

class ExportService {
  constructor() {
    this.exportDir = path.join(process.cwd(), 'exports');
    this.initializeExportDirectory();
  }

  /**
   * Inicializar diretório de exportação
   */
  async initializeExportDirectory() {
    try {
      await fs.access(this.exportDir);
    } catch {
      await fs.mkdir(this.exportDir, { recursive: true });
      console.log(`📁 Diretório de exportação criado: ${this.exportDir}`);
    }
  }

  /**
   * Exportar relatório
   */
  async exportReport({ report, data, format, parameters = {} }) {
    try {
      console.log(`📥 Exportando relatório ${report.name} em formato ${format}`);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;

      let result;

      switch (format.toLowerCase()) {
        case 'pdf':
          result = await this.exportToPDF(report, data, filename);
          break;
        case 'excel':
        case 'xlsx':
          result = await this.exportToExcel(report, data, filename);
          break;
        case 'csv':
          result = await this.exportToCSV(report, data, filename);
          break;
        default:
          throw new Error(`Formato de exportação não suportado: ${format}`);
      }

      console.log(`✅ Relatório exportado: ${result.filename}`);
      return result;

    } catch (error) {
      console.error('❌ Erro na exportação:', error);
      throw error;
    }
  }

  /**
   * Exportar para PDF
   */
  async exportToPDF(report, data, filename) {
    try {
      const filePath = path.join(this.exportDir, `${filename}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      
      // Stream para arquivo
      const stream = require('fs').createWriteStream(filePath);
      doc.pipe(stream);

      // Cabeçalho
      doc.fontSize(20).text(report.name, { align: 'center' });
      doc.moveDown();

      if (report.description) {
        doc.fontSize(12).text(report.description, { align: 'center' });
        doc.moveDown();
      }

      // Informações do relatório
      doc.fontSize(10)
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' })
         .text(`Tipo: ${report.type}`, { align: 'right' })
         .text(`Categoria: ${report.category}`, { align: 'right' });
      
      doc.moveDown(2);

      // Dados
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        const tableTop = doc.y;
        const itemHeight = 20;
        const pageWidth = doc.page.width - 100;
        const columnWidth = pageWidth / headers.length;

        // Cabeçalhos da tabela
        doc.fontSize(10).fillColor('black');
        headers.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), tableTop, {
            width: columnWidth,
            align: 'left'
          });
        });

        // Linha separadora
        doc.moveTo(50, tableTop + 15)
           .lineTo(50 + pageWidth, tableTop + 15)
           .stroke();

        // Dados da tabela
        let currentY = tableTop + itemHeight;
        data.slice(0, 50).forEach((row, rowIndex) => { // Limitar a 50 linhas para PDF
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;
          }

          headers.forEach((header, colIndex) => {
            const value = row[header] || '';
            doc.text(String(value), 50 + (colIndex * columnWidth), currentY, {
              width: columnWidth,
              align: 'left'
            });
          });

          currentY += itemHeight;
        });

        // Resumo
        doc.moveDown(2);
        doc.fontSize(12).text(`Total de registros: ${data.length}`, { align: 'center' });
        
        if (data.length > 50) {
          doc.text('(Mostrando apenas os primeiros 50 registros)', { align: 'center' });
        }

      } else {
        doc.fontSize(12).text('Nenhum dado encontrado para este relatório.', { align: 'center' });
      }

      // Rodapé
      doc.fontSize(8)
         .text('Gerado pelo TOIT Nexus - Sistema Quântico de Gestão', 50, doc.page.height - 50, {
           align: 'center'
         });

      doc.end();

      // Aguardar conclusão
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      const stats = await fs.stat(filePath);

      return {
        filename: `${filename}.pdf`,
        filePath,
        downloadUrl: `/api/exports/download/${filename}.pdf`,
        size: stats.size,
        format: 'pdf'
      };

    } catch (error) {
      console.error('❌ Erro na exportação PDF:', error);
      throw error;
    }
  }

  /**
   * Exportar para Excel
   */
  async exportToExcel(report, data, filename) {
    try {
      const filePath = path.join(this.exportDir, `${filename}.xlsx`);
      const workbook = new ExcelJS.Workbook();
      
      // Metadados
      workbook.creator = 'TOIT Nexus';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Planilha principal
      const worksheet = workbook.addWorksheet(report.name.substring(0, 31)); // Excel limita a 31 caracteres

      // Cabeçalho
      worksheet.mergeCells('A1:Z1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = report.name;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };

      if (report.description) {
        worksheet.mergeCells('A2:Z2');
        const descCell = worksheet.getCell('A2');
        descCell.value = report.description;
        descCell.font = { size: 12 };
        descCell.alignment = { horizontal: 'center' };
      }

      // Informações do relatório
      const infoRow = worksheet.addRow([]);
      worksheet.addRow([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
      worksheet.addRow([`Tipo: ${report.type}`]);
      worksheet.addRow([`Categoria: ${report.category}`]);
      worksheet.addRow([]); // Linha vazia

      // Dados
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        
        // Cabeçalhos da tabela
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };

        // Dados da tabela
        data.forEach(row => {
          const values = headers.map(header => row[header] || '');
          worksheet.addRow(values);
        });

        // Formatação das colunas
        headers.forEach((header, index) => {
          const column = worksheet.getColumn(index + 1);
          column.width = Math.max(header.length, 15);
          
          // Auto-ajustar largura baseado no conteúdo
          const maxLength = Math.max(
            header.length,
            ...data.slice(0, 100).map(row => String(row[header] || '').length)
          );
          column.width = Math.min(maxLength + 2, 50);
        });

        // Bordas na tabela
        const tableRange = `A${worksheet.rowCount - data.length}:${String.fromCharCode(65 + headers.length - 1)}${worksheet.rowCount}`;
        worksheet.getCell(tableRange).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

      } else {
        worksheet.addRow(['Nenhum dado encontrado para este relatório.']);
      }

      // Resumo
      worksheet.addRow([]);
      worksheet.addRow([`Total de registros: ${data.length}`]);

      // Salvar arquivo
      await workbook.xlsx.writeFile(filePath);

      const stats = await fs.stat(filePath);

      return {
        filename: `${filename}.xlsx`,
        filePath,
        downloadUrl: `/api/exports/download/${filename}.xlsx`,
        size: stats.size,
        format: 'excel'
      };

    } catch (error) {
      console.error('❌ Erro na exportação Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar para CSV
   */
  async exportToCSV(report, data, filename) {
    try {
      const filePath = path.join(this.exportDir, `${filename}.csv`);

      if (!Array.isArray(data) || data.length === 0) {
        // Criar CSV vazio com cabeçalho
        await fs.writeFile(filePath, 'Nenhum dado encontrado\n');
      } else {
        const headers = Object.keys(data[0]);
        
        const csvWriter = createObjectCsvWriter({
          path: filePath,
          header: headers.map(header => ({ id: header, title: header })),
          encoding: 'utf8'
        });

        await csvWriter.writeRecords(data);
      }

      const stats = await fs.stat(filePath);

      return {
        filename: `${filename}.csv`,
        filePath,
        downloadUrl: `/api/exports/download/${filename}.csv`,
        size: stats.size,
        format: 'csv'
      };

    } catch (error) {
      console.error('❌ Erro na exportação CSV:', error);
      throw error;
    }
  }

  /**
   * Limpar arquivos antigos
   */
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.exportDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.exportDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️ Arquivo antigo removido: ${file}`);
        }
      }

    } catch (error) {
      console.error('❌ Erro na limpeza de arquivos:', error);
    }
  }

  /**
   * Obter arquivo para download
   */
  async getFileForDownload(filename) {
    try {
      const filePath = path.join(this.exportDir, filename);
      
      // Verificar se arquivo existe
      await fs.access(filePath);
      
      const stats = await fs.stat(filePath);
      
      return {
        filePath,
        size: stats.size,
        mimeType: this.getMimeType(filename)
      };

    } catch (error) {
      throw new Error('Arquivo não encontrado');
    }
  }

  /**
   * Obter MIME type baseado na extensão
   */
  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.csv':
        return 'text/csv';
      default:
        return 'application/octet-stream';
    }
  }
}

module.exports = ExportService;
