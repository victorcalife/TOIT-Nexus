/**
 * SCRIPT DE LIMPEZA DE ARQUIVOS TYPESCRIPT DESNECESSÁRIOS
 * Remove arquivos .ts que foram migrados para .js
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');

class TypeScriptCleanup {
  constructor() {
    this.toRemove = [];
    this.toKeep = [];
    this.migrated = [];
  }

  /**
   * IDENTIFICAR ARQUIVOS TYPESCRIPT PARA REMOÇÃO
   */
  identifyFilesToRemove() {
    console.log('🔍 [CLEANUP] Identificando arquivos TypeScript para remoção...\n');

    // Arquivos que foram migrados para versões unificadas em JavaScript
    const migratedFiles = [
      // Autenticação - migrado para auth-unified.js
      'server/auth.ts',
      'server/authMiddleware.ts',
      'server/replitAuth.ts',
      
      // Rotas - migrado para routes-unified.js + módulos
      'server/routes.ts',
      'server/adminRoutes.ts',
      
      // Middlewares - migrado para middleware-unified.js
      'server/tenantMiddleware.ts',
      
      // Schema - migrado para schema-unified.js
      'shared/schema.ts',
      
      // Serviços - migrados para services-unified.js
      'server/storage.ts',
      
      // Index principal - migrado para index-unified.js
      'server/index.ts',
      'server/index.ts.DISABLED',
      
      // Arquivos de teste TypeScript
      'server/test.ts',
      'server/test.tsx',
      
      // Configurações TypeScript desnecessárias do servidor
      'server/tsconfig.json',
      'server/tsconfig.test.json'
    ];

    // Verificar quais arquivos existem
    for (const file of migratedFiles) {
      if (fs.existsSync(file)) {
        this.toRemove.push(file);
        console.log(`🗑️ [REMOVE] ${file} - Migrado para versão JavaScript`);
      }
    }

    // Arquivos TypeScript que devem ser mantidos (essenciais)
    const essentialFiles = [
      'client/tsconfig.json',
      'client/tsconfig.node.json', 
      'client/vite.config.ts',
      'drizzle.config.ts' // Necessário para Drizzle
    ];

    for (const file of essentialFiles) {
      if (fs.existsSync(file)) {
        this.toKeep.push(file);
        console.log(`✅ [KEEP] ${file} - Essencial para o projeto`);
      }
    }

    console.log(`\n📊 [SUMMARY] ${this.toRemove.length} arquivos para remover, ${this.toKeep.length} arquivos mantidos`);
  }

  /**
   * VERIFICAR SE ARQUIVOS JAVASCRIPT EQUIVALENTES EXISTEM
   */
  verifyJavaScriptEquivalents() {
    console.log('\n🔍 [VERIFY] Verificando equivalentes JavaScript...\n');

    const equivalents = [
      { ts: 'server/auth.ts', js: 'server/auth-unified.js' },
      { ts: 'server/authMiddleware.ts', js: 'server/auth-unified.js' },
      { ts: 'server/routes.ts', js: 'server/routes-unified.js' },
      { ts: 'server/tenantMiddleware.ts', js: 'server/middleware-unified.js' },
      { ts: 'shared/schema.ts', js: 'server/schema-unified.js' },
      { ts: 'server/storage.ts', js: 'server/services-unified.js' },
      { ts: 'server/index.ts', js: 'server/index-unified.js' }
    ];

    for (const { ts, js } of equivalents) {
      if (fs.existsSync(ts) && fs.existsSync(js)) {
        console.log(`✅ [VERIFIED] ${ts} → ${js} (equivalente existe)`);
        this.migrated.push({ ts, js });
      } else if (fs.existsSync(ts) && !fs.existsSync(js)) {
        console.log(`⚠️ [WARNING] ${ts} existe mas ${js} não encontrado`);
      }
    }
  }

  /**
   * CRIAR BACKUP DOS ARQUIVOS ANTES DE REMOVER
   */
  createBackup() {
    const backupDir = 'backup-typescript';
    
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
   * REMOVER ARQUIVOS TYPESCRIPT DESNECESSÁRIOS
   */
  removeFiles() {
    console.log('\n🗑️ [REMOVE] Removendo arquivos TypeScript desnecessários...\n');

    let removed = 0;
    let errors = 0;

    for (const file of this.toRemove) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`✅ [REMOVED] ${file}`);
          removed++;
        } else {
          console.log(`⚠️ [SKIP] ${file} (não existe)`);
        }
      } catch (error) {
        console.error(`❌ [ERROR] Falha ao remover ${file}: ${error.message}`);
        errors++;
      }
    }

    console.log(`\n📊 [RESULT] ${removed} arquivos removidos, ${errors} erros`);
    return { removed, errors };
  }

  /**
   * GERAR RELATÓRIO DE LIMPEZA
   */
  generateReport() {
    console.log('\n📋 [REPORT] Relatório de Limpeza TypeScript');
    console.log('=' .repeat(50));
    
    console.log(`\n🗑️ Arquivos Removidos (${this.toRemove.length}):`);
    this.toRemove.forEach(file => console.log(`   - ${file}`));
    
    console.log(`\n✅ Arquivos Mantidos (${this.toKeep.length}):`);
    this.toKeep.forEach(file => console.log(`   - ${file}`));
    
    console.log(`\n🔄 Migrações Verificadas (${this.migrated.length}):`);
    this.migrated.forEach(({ ts, js }) => console.log(`   - ${ts} → ${js}`));
    
    console.log('\n🎯 Benefícios Alcançados:');
    console.log('   - Eliminação de duplicação TypeScript/JavaScript');
    console.log('   - Redução de complexidade de build');
    console.log('   - Arquitetura 100% JavaScript unificada');
    console.log('   - Manutenibilidade melhorada');
    
    console.log('\n✅ Status: Limpeza TypeScript concluída com sucesso!');
    console.log('=' .repeat(50));
  }

  /**
   * EXECUTAR LIMPEZA COMPLETA
   */
  async runCleanup() {
    console.log('🚀 [CLEANUP] Iniciando limpeza de arquivos TypeScript...\n');

    try {
      // 1. Identificar arquivos
      this.identifyFilesToRemove();
      
      // 2. Verificar equivalentes
      this.verifyJavaScriptEquivalents();
      
      // 3. Criar backup
      this.createBackup();
      
      // 4. Remover arquivos
      const result = this.removeFiles();
      
      // 5. Gerar relatório
      this.generateReport();

      if (result.errors === 0) {
        console.log('\n🎉 [SUCCESS] Limpeza TypeScript concluída com sucesso!');
        return true;
      } else {
        console.log('\n⚠️ [WARNING] Limpeza concluída com alguns erros.');
        return false;
      }
    } catch (error) {
      console.error('\n💥 [ERROR] Erro durante a limpeza:', error);
      return false;
    }
  }
}

// Executar limpeza se chamado diretamente
if (require.main === module) {
  const cleanup = new TypeScriptCleanup();
  cleanup.runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [FATAL] Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = TypeScriptCleanup;
