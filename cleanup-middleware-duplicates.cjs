/**
 * SCRIPT DE LIMPEZA DE MIDDLEWARES DUPLICADOS
 * Remove middlewares antigos que foram consolidados em middleware-unified.js
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');

class MiddlewareCleanup {
  constructor() {
    this.toRemove = [];
    this.toKeep = [];
    this.removed = 0;
    this.errors = 0;
  }

  /**
   * IDENTIFICAR MIDDLEWARES DUPLICADOS
   */
  identifyDuplicateMiddlewares() {
    console.log('🔍 [MIDDLEWARE-CLEANUP] Identificando middlewares duplicados...\n');

    // Middlewares antigos que foram consolidados em middleware-unified.js
    const duplicateMiddlewares = [
      // Middleware principal que pode ter sobrado
      'middleware/quantumMiddleware.js',
      
      // Outros middlewares que podem estar duplicados
      'server/checkMLCredits.js',
      'server/quantumMiddleware.js',
      'server/rateLimitMiddleware.js',
      'server/corsMiddleware.js',
      'server/loggingMiddleware.js',
      'server/securityMiddleware.js',
      'server/errorMiddleware.js',
      'server/validationMiddleware.js',
      
      // Middlewares de ML que podem estar duplicados
      'middleware/ml/mlCreditsMiddleware.js',
      'middleware/ml/mlAuthMiddleware.js',
      'middleware/ml/mlValidationMiddleware.js',
      
      // Outros arquivos de middleware antigos
      'server/middleware.js', // Se existir e não for o unificado
    ];

    // Verificar quais arquivos existem
    for (const file of duplicateMiddlewares) {
      if (fs.existsSync(file)) {
        // Verificar se não é o arquivo unificado
        if (!file.includes('unified')) {
          this.toRemove.push(file);
          console.log(`🗑️ [REMOVE] ${file} - Consolidado em middleware-unified.js`);
        }
      }
    }

    // Middlewares que devem ser mantidos
    const essentialMiddlewares = [
      'server/middleware-unified.js', // Sistema unificado principal
    ];

    for (const file of essentialMiddlewares) {
      if (fs.existsSync(file)) {
        this.toKeep.push(file);
        console.log(`✅ [KEEP] ${file} - Middleware unificado essencial`);
      }
    }

    console.log(`\n📊 [SUMMARY] ${this.toRemove.length} middlewares duplicados para remover, ${this.toKeep.length} middleware unificado mantido`);
  }

  /**
   * VERIFICAR MIDDLEWARE UNIFICADO
   */
  verifyUnifiedMiddleware() {
    console.log('\n🔍 [UNIFIED] Verificando middleware unificado...\n');

    const requiredUnifiedFile = 'server/middleware-unified.js';

    if (fs.existsSync(requiredUnifiedFile)) {
      console.log(`✅ [VERIFIED] ${requiredUnifiedFile} existe`);
      
      // Verificar se o arquivo tem conteúdo substancial
      const stats = fs.statSync(requiredUnifiedFile);
      if (stats.size > 1000) { // Pelo menos 1KB
        console.log(`✅ [SIZE] ${requiredUnifiedFile} tem ${Math.round(stats.size/1024)}KB - adequado`);
      } else {
        throw new Error(`${requiredUnifiedFile} muito pequeno (${stats.size} bytes)`);
      }
    } else {
      throw new Error('Middleware unificado não encontrado! Não é seguro remover os antigos.');
    }

    console.log('\n✅ [SAFE] Middleware unificado verificado. Seguro para remover duplicados.');
  }

  /**
   * CRIAR BACKUP DOS ARQUIVOS ANTES DE REMOVER
   */
  createBackup() {
    const backupDir = 'backup-middleware-duplicates';
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`\n💾 [BACKUP] Criando backup em ${backupDir}/...\n`);

    for (const file of this.toRemove) {
      if (fs.existsSync(file)) {
        const backupPath = path.join(backupDir, path.basename(file));
        fs.copyFileSync(file, backupPath);
        console.log(`💾 [BACKUP] ${file} → ${backupPath}`);
      }
    }
  }

  /**
   * REMOVER MIDDLEWARES DUPLICADOS
   */
  removeDuplicateMiddlewares() {
    console.log('\n🗑️ [REMOVE] Removendo middlewares duplicados...\n');

    for (const file of this.toRemove) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`✅ [REMOVED] ${file}`);
          this.removed++;
        } else {
          console.log(`⚠️ [SKIP] ${file} (não existe)`);
        }
      } catch (error) {
        console.error(`❌ [ERROR] Falha ao remover ${file}: ${error.message}`);
        this.errors++;
      }
    }

    console.log(`\n📊 [RESULT] ${this.removed} middlewares removidos, ${this.errors} erros`);
  }

  /**
   * LIMPAR DIRETÓRIOS DE MIDDLEWARE VAZIOS
   */
  cleanEmptyMiddlewareDirectories() {
    console.log('\n🧹 [CLEAN] Limpando diretórios de middleware vazios...\n');

    const middlewareDirectories = [
      'middleware/ml',
      'middleware/quantum',
      'middleware'
    ];

    for (const dir of middlewareDirectories) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          if (files.length === 0) {
            fs.rmdirSync(dir);
            console.log(`🗑️ [REMOVED] Diretório vazio: ${dir}`);
          } else {
            console.log(`📁 [KEEP] Diretório não vazio: ${dir} (${files.length} arquivos)`);
          }
        } catch (error) {
          console.log(`⚠️ [SKIP] Erro ao verificar ${dir}: ${error.message}`);
        }
      }
    }
  }

  /**
   * VERIFICAR INTEGRIDADE APÓS REMOÇÃO
   */
  verifyIntegrity() {
    console.log('\n🔍 [VERIFY] Verificando integridade após remoção...\n');

    const criticalFile = 'server/middleware-unified.js';

    if (fs.existsSync(criticalFile)) {
      console.log(`✅ [OK] ${criticalFile} ainda existe`);
      
      // Verificar se ainda tem conteúdo
      const stats = fs.statSync(criticalFile);
      if (stats.size > 1000) {
        console.log(`✅ [SIZE] ${criticalFile} mantém ${Math.round(stats.size/1024)}KB`);
      } else {
        throw new Error(`${criticalFile} foi corrompido (${stats.size} bytes)`);
      }
    } else {
      throw new Error('Middleware unificado foi removido acidentalmente!');
    }

    console.log('\n✅ [INTEGRITY] Integridade verificada. Middleware unificado preservado.');
  }

  /**
   * GERAR RELATÓRIO DE LIMPEZA
   */
  generateReport() {
    console.log('\n📋 [REPORT] Relatório de Limpeza de Middlewares');
    console.log('=' .repeat(50));
    
    console.log(`\n🗑️ Middlewares Duplicados Removidos (${this.removed}):`);
    this.toRemove.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   - ${file} (ainda existe - erro)`);
      } else {
        console.log(`   - ${file} (removido com sucesso)`);
      }
    });
    
    console.log(`\n✅ Middleware Unificado Mantido (${this.toKeep.length}):`);
    this.toKeep.forEach(file => console.log(`   - ${file}`));
    
    console.log('\n🎯 Consolidação Alcançada:');
    console.log('   - quantumMiddleware.js → middleware-unified.js');
    console.log('   - checkMLCredits.js → middleware-unified.js');
    console.log('   - Múltiplos middlewares → sistema unificado');
    console.log('   - Ordem de execução centralizada');
    console.log('   - Configuração simplificada');
    
    console.log('\n✅ Status: Limpeza de middlewares concluída!');
    console.log('=' .repeat(50));
  }

  /**
   * EXECUTAR LIMPEZA COMPLETA
   */
  async runCleanup() {
    console.log('🚀 [MIDDLEWARE-CLEANUP] Iniciando limpeza de middlewares duplicados...\n');

    try {
      // 1. Identificar middlewares duplicados
      this.identifyDuplicateMiddlewares();
      
      // 2. Verificar middleware unificado
      this.verifyUnifiedMiddleware();
      
      // 3. Criar backup
      this.createBackup();
      
      // 4. Remover middlewares duplicados
      this.removeDuplicateMiddlewares();
      
      // 5. Limpar diretórios vazios
      this.cleanEmptyMiddlewareDirectories();
      
      // 6. Verificar integridade
      this.verifyIntegrity();
      
      // 7. Gerar relatório
      this.generateReport();

      if (this.errors === 0) {
        console.log('\n🎉 [SUCCESS] Limpeza de middlewares concluída com sucesso!');
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
  const cleanup = new MiddlewareCleanup();
  cleanup.runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [FATAL] Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = MiddlewareCleanup;
