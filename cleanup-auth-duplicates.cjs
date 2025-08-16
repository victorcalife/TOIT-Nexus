/**
 * SCRIPT DE LIMPEZA DE ARQUIVOS DE AUTENTICAÇÃO DUPLICADOS
 * Remove arquivos antigos de auth que foram consolidados
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');

class AuthCleanup {
  constructor() {
    this.toRemove = [];
    this.toKeep = [];
    this.removed = 0;
    this.errors = 0;
  }

  /**
   * IDENTIFICAR ARQUIVOS DE AUTENTICAÇÃO DUPLICADOS
   */
  identifyDuplicateAuthFiles() {
    console.log('🔍 [AUTH-CLEANUP] Identificando arquivos de autenticação duplicados...\n');

    // Arquivos de autenticação antigos que foram consolidados em auth-unified.js
    const duplicateAuthFiles = [
      // Arquivos JavaScript antigos
      'server/authMiddleware.js', // Consolidado em auth-unified.js
      'server/authService.js',    // Consolidado em auth-unified.js
      'server/authRoutes.js',     // Consolidado em routes-unified.js + routes/auth.js
      
      // Arquivos de inicialização antigos
      'server/initializeAuth.js', // Funcionalidade movida para auth-unified.js
      
      // Arquivos de sistema antigos
      'server/initializeSystem.js', // Consolidado em index-unified.js
      
      // Outros arquivos relacionados à auth que podem estar duplicados
      'server/auth.js', // Se existir, foi substituído por auth-unified.js
    ];

    // Verificar quais arquivos existem
    for (const file of duplicateAuthFiles) {
      if (fs.existsSync(file)) {
        // Verificar se não é o arquivo unificado
        if (!file.includes('unified')) {
          this.toRemove.push(file);
          console.log(`🗑️ [REMOVE] ${file} - Duplicado, consolidado em auth-unified.js`);
        }
      }
    }

    // Arquivos que devem ser mantidos
    const essentialAuthFiles = [
      'server/auth-unified.js',     // Sistema unificado principal
      'server/routes-unified.js',   // Sistema de rotas unificado
      'server/routes/auth.js',      // Módulo de rotas de auth
      'server/index-unified.js',    // Servidor principal unificado
    ];

    for (const file of essentialAuthFiles) {
      if (fs.existsSync(file)) {
        this.toKeep.push(file);
        console.log(`✅ [KEEP] ${file} - Arquivo unificado essencial`);
      }
    }

    console.log(`\n📊 [SUMMARY] ${this.toRemove.length} arquivos duplicados para remover, ${this.toKeep.length} arquivos essenciais mantidos`);
  }

  /**
   * VERIFICAR DEPENDÊNCIAS ANTES DA REMOÇÃO
   */
  checkDependencies() {
    console.log('\n🔍 [DEPENDENCIES] Verificando dependências...\n');

    // Verificar se os arquivos unificados existem antes de remover os antigos
    const requiredUnifiedFiles = [
      'server/auth-unified.js',
      'server/routes-unified.js',
      'server/index-unified.js'
    ];

    let allUnifiedExist = true;
    for (const file of requiredUnifiedFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ [VERIFIED] ${file} existe`);
      } else {
        console.log(`❌ [MISSING] ${file} não encontrado!`);
        allUnifiedExist = false;
      }
    }

    if (!allUnifiedExist) {
      throw new Error('Arquivos unificados não encontrados! Não é seguro remover os antigos.');
    }

    console.log('\n✅ [SAFE] Todos os arquivos unificados existem. Seguro para remover duplicados.');
  }

  /**
   * CRIAR BACKUP DOS ARQUIVOS ANTES DE REMOVER
   */
  createBackup() {
    const backupDir = 'backup-auth-duplicates';
    
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
   * REMOVER ARQUIVOS DUPLICADOS
   */
  removeDuplicateFiles() {
    console.log('\n🗑️ [REMOVE] Removendo arquivos de autenticação duplicados...\n');

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

    console.log(`\n📊 [RESULT] ${this.removed} arquivos removidos, ${this.errors} erros`);
  }

  /**
   * VERIFICAR INTEGRIDADE APÓS REMOÇÃO
   */
  verifyIntegrity() {
    console.log('\n🔍 [VERIFY] Verificando integridade após remoção...\n');

    // Verificar se os arquivos unificados ainda existem
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
        console.log(`✅ [OK] ${file} ainda existe`);
      } else {
        console.log(`❌ [MISSING] ${file} foi removido acidentalmente!`);
        allCriticalExist = false;
      }
    }

    if (!allCriticalExist) {
      throw new Error('Arquivos críticos foram removidos! Restaure do backup.');
    }

    console.log('\n✅ [INTEGRITY] Integridade verificada. Todos os arquivos críticos estão presentes.');
  }

  /**
   * GERAR RELATÓRIO DE LIMPEZA
   */
  generateReport() {
    console.log('\n📋 [REPORT] Relatório de Limpeza de Autenticação');
    console.log('=' .repeat(50));
    
    console.log(`\n🗑️ Arquivos Duplicados Removidos (${this.removed}):`);
    this.toRemove.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   - ${file} (ainda existe - erro)`);
      } else {
        console.log(`   - ${file} (removido com sucesso)`);
      }
    });
    
    console.log(`\n✅ Arquivos Essenciais Mantidos (${this.toKeep.length}):`);
    this.toKeep.forEach(file => console.log(`   - ${file}`));
    
    console.log('\n🎯 Consolidação Alcançada:');
    console.log('   - authMiddleware.js → auth-unified.js');
    console.log('   - authService.js → auth-unified.js');
    console.log('   - authRoutes.js → routes-unified.js + routes/auth.js');
    console.log('   - initializeAuth.js → auth-unified.js');
    console.log('   - Sistema de autenticação 100% unificado');
    
    console.log('\n✅ Status: Limpeza de autenticação concluída!');
    console.log('=' .repeat(50));
  }

  /**
   * EXECUTAR LIMPEZA COMPLETA
   */
  async runCleanup() {
    console.log('🚀 [AUTH-CLEANUP] Iniciando limpeza de arquivos de autenticação duplicados...\n');

    try {
      // 1. Identificar arquivos duplicados
      this.identifyDuplicateAuthFiles();
      
      // 2. Verificar dependências
      this.checkDependencies();
      
      // 3. Criar backup
      this.createBackup();
      
      // 4. Remover arquivos duplicados
      this.removeDuplicateFiles();
      
      // 5. Verificar integridade
      this.verifyIntegrity();
      
      // 6. Gerar relatório
      this.generateReport();

      if (this.errors === 0) {
        console.log('\n🎉 [SUCCESS] Limpeza de autenticação concluída com sucesso!');
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
  const cleanup = new AuthCleanup();
  cleanup.runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [FATAL] Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = AuthCleanup;
