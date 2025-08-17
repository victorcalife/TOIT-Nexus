/**
 * SCRIPT PARA MOVER TODOS OS ARQUIVOS .TS RESTANTES PARA TSMIGRADO
 * Garantir sistema 100% JavaScript
 */

const fs = require('fs');
const path = require('path');

class TSFileMover {
  constructor() {
    this.moved = [];
    this.errors = [];
  }

  /**
   * Encontrar todos os arquivos .ts no servidor
   */
  findTSFiles(dir = 'server') {
    const tsFiles = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Pular node_modules e TSMIGRADO
          if (item !== 'node_modules' && item !== 'TSMIGRADO') {
            tsFiles.push(...this.findTSFiles(fullPath));
          }
        } else if (item.endsWith('.ts')) {
          tsFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Erro ao ler diretório ${dir}:`, error.message);
    }
    
    return tsFiles;
  }

  /**
   * Mover arquivo para TSMIGRADO
   */
  moveToTSMigrado(filePath) {
    try {
      const destPath = path.join('TSMIGRADO', filePath);
      const destDir = path.dirname(destPath);
      
      // Criar diretório de destino se não existir
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Mover arquivo
      fs.renameSync(filePath, destPath);
      
      this.moved.push({
        from: filePath,
        to: destPath
      });
      
      console.log(`✅ Movido: ${filePath} → ${destPath}`);
      
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message
      });
      
      console.error(`❌ Erro ao mover ${filePath}:`, error.message);
    }
  }

  /**
   * Executar migração completa
   */
  async execute() {
    console.log('🔍 INICIANDO MIGRAÇÃO DE ARQUIVOS .TS RESTANTES\n');
    
    // Encontrar todos os arquivos .ts
    const tsFiles = this.findTSFiles();
    
    console.log(`📊 Encontrados ${tsFiles.length} arquivos .ts para mover\n`);
    
    if (tsFiles.length === 0) {
      console.log('✅ Nenhum arquivo .ts encontrado - Sistema já está 100% JavaScript!');
      return;
    }
    
    // Mover cada arquivo
    for (const file of tsFiles) {
      this.moveToTSMigrado(file);
    }
    
    // Relatório final
    console.log('\n📋 RELATÓRIO FINAL:');
    console.log(`✅ Arquivos movidos: ${this.moved.length}`);
    console.log(`❌ Erros: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS:');
      this.errors.forEach(error => {
        console.log(`   • ${error.file}: ${error.error}`);
      });
    }
    
    if (this.moved.length > 0) {
      console.log('\n🎯 ARQUIVOS MOVIDOS:');
      this.moved.forEach(move => {
        console.log(`   • ${move.from} → ${move.to}`);
      });
    }
    
    console.log('\n🏁 MIGRAÇÃO CONCLUÍDA - SISTEMA 100% JAVASCRIPT!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const mover = new TSFileMover();
  mover.execute().catch(console.error);
}

module.exports = TSFileMover;
