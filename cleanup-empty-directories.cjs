/**
 * SCRIPT DE LIMPEZA DE DIRETÓRIOS VAZIOS E ARQUIVOS DESNECESSÁRIOS
 * Remove diretórios vazios, arquivos de backup, .map files, etc.
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');

class DirectoryCleanup {
  constructor() {
    this.removedDirectories = [];
    this.removedFiles = [];
    this.keptDirectories = [];
    this.errors = 0;
  }

  /**
   * VERIFICAR SE DIRETÓRIO ESTÁ VAZIO
   */
  isDirectoryEmpty(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      return files.length === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * VERIFICAR SE DIRETÓRIO CONTÉM APENAS ARQUIVOS DESNECESSÁRIOS
   */
  containsOnlyUnnecessaryFiles(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      const unnecessaryExtensions = ['.map', '.tsbuildinfo', '.log', '.tmp'];
      
      return files.every(file => {
        const ext = path.extname(file);
        return unnecessaryExtensions.includes(ext) || file.startsWith('.');
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * IDENTIFICAR ARQUIVOS DESNECESSÁRIOS
   */
  identifyUnnecessaryFiles() {
    console.log('🔍 [CLEANUP] Identificando arquivos desnecessários...\n');

    const unnecessaryFiles = [
      // Arquivos de build TypeScript
      'server/dist/.tsbuildinfo',
      
      // Arquivos de backup temporários
      'cleanup-typescript.js', // Versão antiga do script
      
      // Arquivos de log
      'server/debug.log',
      'server/error.log',
      'npm-debug.log',
      'yarn-error.log',
      
      // Arquivos temporários
      'server/temp.js',
      'server/tmp.js',
      '.tmp',
      
      // Arquivos de teste temporários
      'server/test-temp.js',
      'server/temp-test.js',
    ];

    const mapFiles = this.findMapFiles();
    unnecessaryFiles.push(...mapFiles);

    for (const file of unnecessaryFiles) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          this.removedFiles.push(file);
          console.log(`🗑️ [REMOVED] ${file}`);
        } catch (error) {
          console.error(`❌ [ERROR] Falha ao remover ${file}: ${error.message}`);
          this.errors++;
        }
      }
    }

    console.log(`\n📊 [FILES] ${this.removedFiles.length} arquivos desnecessários removidos`);
  }

  /**
   * ENCONTRAR ARQUIVOS .MAP
   */
  findMapFiles() {
    const mapFiles = [];
    
    const searchDirectories = [
      'server/dist',
      'shared',
      'server'
    ];

    for (const dir of searchDirectories) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith('.map')) {
              mapFiles.push(path.join(dir, file));
            }
          }
        } catch (error) {
          // Ignorar erros de leitura de diretório
        }
      }
    }

    return mapFiles;
  }

  /**
   * LIMPAR DIRETÓRIOS VAZIOS
   */
  cleanEmptyDirectories() {
    console.log('\n🧹 [CLEANUP] Limpando diretórios vazios...\n');

    const directoriesToCheck = [
      // Diretórios que podem estar vazios após limpeza
      'backup-typescript',
      'backup-auth-duplicates', 
      'backup-old-routes',
      'backup-middleware-duplicates',
      
      // Diretórios de build que podem estar vazios
      'server/dist',
      'shared',
      
      // Diretórios de middleware que podem estar vazios
      'middleware/quantum',
      'middleware/ml',
      'middleware',
      
      // Outros diretórios que podem estar vazios
      'routes/storage',
      'services/ml',
      'services/quantum',
      'services/nocode',
      'services/tql',
      'services/scheduler',
      'services/storage',
      'services',
      
      // Diretórios de teste que podem estar vazios
      'tests/api',
      'tests/integration',
      'tests'
    ];

    for (const dir of directoriesToCheck) {
      this.processDirectory(dir);
    }

    console.log(`\n📊 [DIRECTORIES] ${this.removedDirectories.length} diretórios vazios removidos, ${this.keptDirectories.length} mantidos`);
  }

  /**
   * PROCESSAR DIRETÓRIO INDIVIDUAL
   */
  processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    try {
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        return;
      }

      if (this.isDirectoryEmpty(dirPath)) {
        fs.rmdirSync(dirPath);
        this.removedDirectories.push(dirPath);
        console.log(`🗑️ [REMOVED] Diretório vazio: ${dirPath}`);
      } else if (this.containsOnlyUnnecessaryFiles(dirPath)) {
        // Remover arquivos desnecessários primeiro
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ [REMOVED] Arquivo desnecessário: ${filePath}`);
          } catch (error) {
            console.error(`❌ [ERROR] Falha ao remover ${filePath}: ${error.message}`);
          }
        }
        
        // Tentar remover diretório agora vazio
        if (this.isDirectoryEmpty(dirPath)) {
          fs.rmdirSync(dirPath);
          this.removedDirectories.push(dirPath);
          console.log(`🗑️ [REMOVED] Diretório limpo: ${dirPath}`);
        }
      } else {
        const files = fs.readdirSync(dirPath);
        this.keptDirectories.push(dirPath);
        console.log(`📁 [KEEP] Diretório não vazio: ${dirPath} (${files.length} arquivos)`);
      }
    } catch (error) {
      console.error(`❌ [ERROR] Erro ao processar ${dirPath}: ${error.message}`);
      this.errors++;
    }
  }

  /**
   * LIMPAR DIRETÓRIO DIST ESPECÍFICO
   */
  cleanDistDirectory() {
    console.log('\n🧹 [DIST] Limpando diretório dist...\n');

    const distDir = 'server/dist';
    
    if (!fs.existsSync(distDir)) {
      console.log('📁 [DIST] Diretório dist não existe');
      return;
    }

    try {
      const files = fs.readdirSync(distDir);
      let removed = 0;

      for (const file of files) {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ [REMOVED] ${filePath}`);
          removed++;
        }
      }

      // Tentar remover o diretório se estiver vazio
      if (this.isDirectoryEmpty(distDir)) {
        fs.rmdirSync(distDir);
        console.log(`🗑️ [REMOVED] Diretório dist vazio`);
        this.removedDirectories.push(distDir);
      }

      console.log(`\n📊 [DIST] ${removed} arquivos removidos do diretório dist`);
    } catch (error) {
      console.error(`❌ [ERROR] Falha ao limpar dist: ${error.message}`);
      this.errors++;
    }
  }

  /**
   * VERIFICAR ESTRUTURA FINAL
   */
  verifyFinalStructure() {
    console.log('\n🔍 [VERIFY] Verificando estrutura final...\n');

    const criticalFiles = [
      'server/auth-unified.js',
      'server/routes-unified.js',
      'server/middleware-unified.js',
      'server/services-unified.js',
      'server/schema-unified.js',
      'server/index-unified.js'
    ];

    let allCriticalExist = true;
    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ [OK] ${file} preservado`);
      } else {
        console.log(`❌ [MISSING] ${file} foi removido acidentalmente!`);
        allCriticalExist = false;
      }
    }

    if (!allCriticalExist) {
      throw new Error('Arquivos críticos foram removidos durante a limpeza!');
    }

    console.log('\n✅ [STRUCTURE] Estrutura final verificada e preservada.');
  }

  /**
   * GERAR RELATÓRIO DE LIMPEZA
   */
  generateReport() {
    console.log('\n📋 [REPORT] Relatório de Limpeza de Diretórios');
    console.log('=' .repeat(50));
    
    console.log(`\n🗑️ Arquivos Removidos (${this.removedFiles.length}):`);
    this.removedFiles.forEach(file => console.log(`   - ${file}`));
    
    console.log(`\n🗑️ Diretórios Removidos (${this.removedDirectories.length}):`);
    this.removedDirectories.forEach(dir => console.log(`   - ${dir}`));
    
    console.log(`\n📁 Diretórios Mantidos (${this.keptDirectories.length}):`);
    this.keptDirectories.forEach(dir => console.log(`   - ${dir}`));
    
    console.log('\n🎯 Limpeza Alcançada:');
    console.log('   - Arquivos .map removidos');
    console.log('   - Diretórios vazios removidos');
    console.log('   - Arquivos de backup temporários limpos');
    console.log('   - Estrutura final organizada');
    
    console.log('\n✅ Status: Limpeza de diretórios concluída!');
    console.log('=' .repeat(50));
  }

  /**
   * EXECUTAR LIMPEZA COMPLETA
   */
  async runCleanup() {
    console.log('🚀 [CLEANUP] Iniciando limpeza de diretórios e arquivos...\n');

    try {
      // 1. Identificar e remover arquivos desnecessários
      this.identifyUnnecessaryFiles();
      
      // 2. Limpar diretório dist específico
      this.cleanDistDirectory();
      
      // 3. Limpar diretórios vazios
      this.cleanEmptyDirectories();
      
      // 4. Verificar estrutura final
      this.verifyFinalStructure();
      
      // 5. Gerar relatório
      this.generateReport();

      if (this.errors === 0) {
        console.log('\n🎉 [SUCCESS] Limpeza de diretórios concluída com sucesso!');
        return true;
      } else {
        console.log('\n⚠️ [WARNING] Limpeza concluída com alguns erros.');
        return false;
      }
    } catch (error) {
      console.error('\n💥 [ERROR] Erro durante a limpeza:', error.message);
      return false;
    }
  }
}

// Executar limpeza se chamado diretamente
if (require.main === module) {
  const cleanup = new DirectoryCleanup();
  cleanup.runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [FATAL] Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = DirectoryCleanup;
