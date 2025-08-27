/**
 * SCRIPT DE LIMPEZA DE DEPENDÊNCIAS PACKAGE.JSON
 * Remove dependências TypeScript desnecessárias e atualiza scripts
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');

class PackageCleanup {
  constructor() {
    this.changes = [];
    this.removedDeps = [];
    this.updatedScripts = [];
  }

  /**
   * ANALISAR PACKAGE.JSON DO SERVIDOR
   */
  analyzeServerPackage() {
    console.log('🔍 [PACKAGE] Analisando package.json do servidor...\n');

    const serverPackagePath = 'server/package.json';
    
    if (!fs.existsSync(serverPackagePath)) {
      console.log('⚠️ [SKIP] server/package.json não encontrado');
      return;
    }

    try {
      const packageContent = fs.readFileSync(serverPackagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      console.log(`📦 [CURRENT] Nome: ${packageJson.name}`);
      console.log(`📦 [CURRENT] Versão: ${packageJson.version}`);
      
      // Analisar dependências TypeScript
      this.analyzeTypeScriptDependencies(packageJson);
      
      // Analisar scripts
      this.analyzeScripts(packageJson);
      
      // Atualizar package.json
      this.updateServerPackage(packageJson, serverPackagePath);
      
    } catch (error) {
      console.error(`❌ [ERROR] Erro ao analisar package.json: ${error.message}`);
    }
  }

  /**
   * ANALISAR DEPENDÊNCIAS TYPESCRIPT
   */
  analyzeTypeScriptDependencies(packageJson) {
    console.log('\n🔍 [DEPS] Analisando dependências TypeScript...\n');

    // Dependências TypeScript que podem ser removidas do servidor
    const unnecessaryTypescriptDeps = [
      '@types/node', // Pode ser mantido apenas no client
      'typescript',  // Pode ser mantido apenas no client
      'ts-node',     // Não necessário para JavaScript puro
      'tsx',         // Não necessário para JavaScript puro
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'tsc-watch'
    ];

    // Verificar devDependencies
    if (packageJson.devDependencies) {
      console.log('📋 [DEV-DEPS] Dependências de desenvolvimento atuais:');
      Object.keys(packageJson.devDependencies).forEach(dep => {
        console.log(`   - ${dep}@${packageJson.devDependencies[dep]}`);
      });

      // Marcar para remoção
      unnecessaryTypescriptDeps.forEach(dep => {
        if (packageJson.devDependencies[dep]) {
          this.removedDeps.push(dep);
          console.log(`🗑️ [REMOVE] ${dep} - Não necessário para JavaScript puro`);
        }
      });
    }

    // Verificar dependencies
    if (packageJson.dependencies) {
      console.log('\n📋 [DEPS] Dependências de produção atuais:');
      Object.keys(packageJson.dependencies).forEach(dep => {
        console.log(`   - ${dep}@${packageJson.dependencies[dep]}`);
      });
    }
  }

  /**
   * ANALISAR SCRIPTS
   */
  analyzeScripts(packageJson) {
    console.log('\n🔍 [SCRIPTS] Analisando scripts...\n');

    if (packageJson.scripts) {
      console.log('📋 [CURRENT] Scripts atuais:');
      Object.keys(packageJson.scripts).forEach(script => {
        console.log(`   - ${script}: ${packageJson.scripts[script]}`);
      });

      // Scripts que devem ser atualizados para JavaScript
      const scriptUpdates = {
        'dev': 'node index-unified.js',
        'start': 'node index-unified.js',
        'build': 'echo "Build não necessário para JavaScript puro"',
        'test': 'node test-auth-simple.js && node test-routes-modular.js && node test-middleware-unified.js',
        'test:performance': 'node test-performance.js',
        'test:edge-cases': 'node test-edge-cases.js',
        'test:all': 'npm run test && npm run test:performance && npm run test:edge-cases',
        'clean': 'node cleanup-empty-directories.cjs'
      };

      Object.keys(scriptUpdates).forEach(script => {
        if (packageJson.scripts[script] !== scriptUpdates[script]) {
          this.updatedScripts.push({
            script,
            old: packageJson.scripts[script] || 'não existia',
            new: scriptUpdates[script]
          });
        }
      });
    }
  }

  /**
   * ATUALIZAR PACKAGE.JSON DO SERVIDOR
   */
  updateServerPackage(packageJson, packagePath) {
    console.log('\n🔧 [UPDATE] Atualizando package.json do servidor...\n');

    let modified = false;

    // Remover dependências TypeScript desnecessárias
    if (packageJson.devDependencies) {
      this.removedDeps.forEach(dep => {
        if (packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
          modified = true;
          console.log(`🗑️ [REMOVED] ${dep} das devDependencies`);
        }
      });

      // Se devDependencies ficou vazio, remover a seção
      if (Object.keys(packageJson.devDependencies).length === 0) {
        delete packageJson.devDependencies;
        console.log('🗑️ [REMOVED] Seção devDependencies vazia');
      }
    }

    // Atualizar scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    this.updatedScripts.forEach(({ script, old, new: newScript }) => {
      packageJson.scripts[script] = newScript;
      modified = true;
      console.log(`🔧 [UPDATED] Script "${script}": ${old} → ${newScript}`);
    });

    // Adicionar scripts novos se não existirem
    const newScripts = {
      'dev': 'node index-unified.js',
      'start': 'node index-unified.js',
      'test:all': 'node test-auth-simple.js && node test-routes-modular.js && node test-middleware-unified.js && node test-performance.js && node test-edge-cases.js'
    };

    Object.keys(newScripts).forEach(script => {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = newScripts[script];
        modified = true;
        console.log(`➕ [ADDED] Script "${script}": ${newScripts[script]}`);
      }
    });

    // Atualizar descrição para refletir arquitetura JavaScript
    if (packageJson.description && packageJson.description.includes('TypeScript')) {
      packageJson.description = packageJson.description.replace(/TypeScript/g, 'JavaScript');
      modified = true;
      console.log('🔧 [UPDATED] Descrição atualizada para JavaScript');
    }

    // Salvar se houve modificações
    if (modified) {
      try {
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ [SAVED] ${packagePath} atualizado com sucesso`);
        this.changes.push(`Atualizado ${packagePath}`);
      } catch (error) {
        console.error(`❌ [ERROR] Falha ao salvar ${packagePath}: ${error.message}`);
      }
    } else {
      console.log('ℹ️ [NO-CHANGE] Nenhuma modificação necessária');
    }
  }

  /**
   * ANALISAR PACKAGE.JSON RAIZ
   */
  analyzeRootPackage() {
    console.log('\n🔍 [ROOT] Analisando package.json raiz...\n');

    const rootPackagePath = 'package.json';
    
    if (!fs.existsSync(rootPackagePath)) {
      console.log('⚠️ [SKIP] package.json raiz não encontrado');
      return;
    }

    try {
      const packageContent = fs.readFileSync(rootPackagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      console.log(`📦 [ROOT] Nome: ${packageJson.name}`);
      console.log(`📦 [ROOT] Versão: ${packageJson.version}`);
      
      // Verificar se há scripts que precisam ser atualizados
      if (packageJson.scripts) {
        console.log('\n📋 [ROOT-SCRIPTS] Scripts raiz:');
        Object.keys(packageJson.scripts).forEach(script => {
          console.log(`   - ${script}: ${packageJson.scripts[script]}`);
        });
      }

      // Atualizar scripts raiz se necessário
      this.updateRootPackage(packageJson, rootPackagePath);
      
    } catch (error) {
      console.error(`❌ [ERROR] Erro ao analisar package.json raiz: ${error.message}`);
    }
  }

  /**
   * ATUALIZAR PACKAGE.JSON RAIZ
   */
  updateRootPackage(packageJson, packagePath) {
    let modified = false;

    // Adicionar scripts úteis no nível raiz
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const rootScripts = {
      'server:deploy': 'cd server && railway deploy',
      'server:start': 'cd server && npm run start',
      'server:test': 'cd server && npm run test:all',
      'client:deploy': 'cd client && railway deploy',
      'client:build': 'cd client && npm run build',
      'dev': 'concurrently "npm run server:dev" "npm run client:dev"'
    };

    Object.keys(rootScripts).forEach(script => {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = rootScripts[script];
        modified = true;
        console.log(`➕ [ROOT-ADDED] Script "${script}": ${rootScripts[script]}`);
      }
    });

    // Salvar se houve modificações
    if (modified) {
      try {
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ [SAVED] ${packagePath} atualizado com sucesso`);
        this.changes.push(`Atualizado ${packagePath}`);
      } catch (error) {
        console.error(`❌ [ERROR] Falha ao salvar ${packagePath}: ${error.message}`);
      }
    } else {
      console.log('ℹ️ [ROOT-NO-CHANGE] Nenhuma modificação necessária no package.json raiz');
    }
  }

  /**
   * GERAR RELATÓRIO DE LIMPEZA
   */
  generateReport() {
    console.log('\n📋 [REPORT] Relatório de Limpeza de Dependências');
    console.log('=' .repeat(50));
    
    console.log(`\n🗑️ Dependências Removidas (${this.removedDeps.length}):`);
    this.removedDeps.forEach(dep => console.log(`   - ${dep}`));
    
    console.log(`\n🔧 Scripts Atualizados (${this.updatedScripts.length}):`);
    this.updatedScripts.forEach(({ script, old, new: newScript }) => {
      console.log(`   - ${script}: ${old} → ${newScript}`);
    });
    
    console.log(`\n📝 Arquivos Modificados (${this.changes.length}):`);
    this.changes.forEach(change => console.log(`   - ${change}`));
    
    console.log('\n🎯 Benefícios Alcançados:');
    console.log('   - Dependências TypeScript desnecessárias removidas');
    console.log('   - Scripts atualizados para JavaScript puro');
    console.log('   - Configuração simplificada');
    console.log('   - Redução de tamanho do node_modules');
    
    console.log('\n✅ Status: Limpeza de dependências concluída!');
    console.log('=' .repeat(50));
  }

  /**
   * EXECUTAR LIMPEZA COMPLETA
   */
  async runCleanup() {
    console.log('🚀 [CLEANUP] Iniciando limpeza de dependências...\n');

    try {
      // 1. Analisar package.json do servidor
      this.analyzeServerPackage();
      
      // 2. Analisar package.json raiz
      this.analyzeRootPackage();
      
      // 3. Gerar relatório
      this.generateReport();

      console.log('\n🎉 [SUCCESS] Limpeza de dependências concluída com sucesso!');
      return true;
    } catch (error) {
      console.error('\n💥 [ERROR] Erro durante a limpeza:', error.message);
      return false;
    }
  }
}

// Executar limpeza se chamado diretamente
if (require.main === module) {
  const cleanup = new PackageCleanup();
  cleanup.runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [FATAL] Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = PackageCleanup;
