/**
 * SCRIPT DE LIMPEZA DE ARQUIVOS DE ROTAS ANTIGOS
 * Remove arquivos de rotas que foram consolidados na estrutura modular
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');

class RoutesCleanup {
  constructor() {
    this.toRemove = [];
    this.toKeep = [];
    this.removed = 0;
    this.errors = 0;
  }

  /**
   * IDENTIFICAR ARQUIVOS DE ROTAS ANTIGOS
   */
  identifyOldRouteFiles() {
    console.log('🔍 [ROUTES-CLEANUP] Identificando arquivos de rotas antigos...\n');

    // Arquivos de rotas antigos que foram consolidados
    const oldRouteFiles = [
      // Arquivo gigante principal (já foi removido pelo usuário, mas verificar)
      'server/routes.js',
      
      // Arquivos de rotas específicos antigos que podem existir
      'server/adminModuleRoutes.js',
      'server/moduleRoutes.js',
      'server/tenantControlRoutes.js',
      'server/accessControlRoutes.js',
      'server/accessProfileRoutes.js',
      'server/adaptiveRoutes.js',
      'server/adaptiveEngineRoutes.js',
      'server/advancedTaskRoutes.js',
      'server/advancedTaskManagementRoutes.js',
      'server/advancedDashboardBuilderRoutes.js',
      'server/advancedMLRoutes.js',
      'server/apiWebhookRoutes.js',
      'server/calendarRoutes.js',
      'server/calendarTriggerRoutes.js',
      'server/cardVerificationRoutes.js',
      'server/compactUnifiedStudioRoutes.js',
      'server/dashboardBuilderRoutes.js',
      'server/dataConnectionRoutes.js',
      'server/emailTestRoutes.js',
      'server/emailTriggerRoutes.js',
      'server/enterpriseRoutes.js',
      'server/executiveReportsRoutes.js',
      'server/fileUploadRoutes.js',
      'server/inlineDashboardEditorRoutes.js',
      'server/longRangeEntanglementRoutes.js',
      'server/nativeQuantumRoutes.js',
      'server/nextGenMLRoutes.js',
      'server/notificationRoutes.js',
      'server/planManagementRoutes.js',
      'server/qiskitTranspilerRoutes.js',
      'server/qlibRoutes.js',
      'server/quantumBillingRoutes.js',
      'server/quantumCommercialRoutes.js',
      'server/quantumMLRoutes.js',
      'server/quantumMonitoringRoutes.js',
      'server/queryBuilderRoutes.js',
      'server/realQuantumRoutes.js',
      'server/salesMetricsRoutes.js',
      'server/stripeCheckoutRoutes.js',
      'server/subscriptionReportsRoutes.js',
      'server/taskManagementRoutes.js',
      'server/trialAdminRoutes.js',
      'server/trialRoutes.js',
      'server/unifiedDataStudioRoutes.js',
      'server/universalDatabaseRoutes.js',
      'server/verificationRoutes.js',
      'server/visualWorkflowRoutes.js',
      'server/workflowBuilderRoutes.js',
      'server/workflowDashboardIntegrationRoutes.js',
      'server/workflowIntegrationRoutes.js',
      'server/workflowReportIntegrationRoutes.js',
      'server/workflowTaskIntegrationRoutes.js',
      
      // Arquivos de rotas JavaScript antigos
      'server/chatRoutes.js',
      'server/paymentRoutes.js',
      'server/webhookRoutes.js'
    ];

    // Verificar quais arquivos existem
    for (const file of oldRouteFiles) {
      if (fs.existsSync(file)) {
        // Verificar se não é um arquivo unificado ou modular
        if (!file.includes('unified') && !file.startsWith('server/routes/')) {
          this.toRemove.push(file);
          console.log(`🗑️ [REMOVE] ${file} - Consolidado na estrutura modular`);
        }
      }
    }

    // Arquivos que devem ser mantidos (estrutura modular)
    const essentialRouteFiles = [
      'server/routes-unified.js',   // Sistema de rotas unificado
      'server/routes/auth.js',      // Módulo de autenticação
      'server/routes/admin.js',     // Módulo administrativo
      'server/routes/health.js',    // Módulo de health check
    ];

    for (const file of essentialRouteFiles) {
      if (fs.existsSync(file)) {
        this.toKeep.push(file);
        console.log(`✅ [KEEP] ${file} - Estrutura modular essencial`);
      }
    }

    console.log(`\n📊 [SUMMARY] ${this.toRemove.length} arquivos antigos para remover, ${this.toKeep.length} arquivos modulares mantidos`);
  }

  /**
   * VERIFICAR ESTRUTURA MODULAR
   */
  verifyModularStructure() {
    console.log('\n🔍 [MODULAR] Verificando estrutura modular...\n');

    // Verificar se a estrutura modular existe
    const requiredModularFiles = [
      'server/routes-unified.js',
      'server/routes/auth.js',
      'server/routes/admin.js',
      'server/routes/health.js'
    ];

    let allModularExist = true;
    for (const file of requiredModularFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ [VERIFIED] ${file} existe`);
      } else {
        console.log(`❌ [MISSING] ${file} não encontrado!`);
        allModularExist = false;
      }
    }

    if (!allModularExist) {
      throw new Error('Estrutura modular não encontrada! Não é seguro remover os arquivos antigos.');
    }

    console.log('\n✅ [SAFE] Estrutura modular verificada. Seguro para remover arquivos antigos.');
  }

  /**
   * CRIAR BACKUP DOS ARQUIVOS ANTES DE REMOVER
   */
  createBackup() {
    const backupDir = 'backup-old-routes';
    
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
   * REMOVER ARQUIVOS ANTIGOS
   */
  removeOldFiles() {
    console.log('\n🗑️ [REMOVE] Removendo arquivos de rotas antigos...\n');

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

    // Verificar se os arquivos modulares ainda existem
    const criticalFiles = [
      'server/routes-unified.js',
      'server/routes/auth.js',
      'server/routes/admin.js',
      'server/routes/health.js'
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

    console.log('\n✅ [INTEGRITY] Integridade verificada. Estrutura modular preservada.');
  }

  /**
   * GERAR RELATÓRIO DE LIMPEZA
   */
  generateReport() {
    console.log('\n📋 [REPORT] Relatório de Limpeza de Rotas');
    console.log('=' .repeat(50));
    
    console.log(`\n🗑️ Arquivos Antigos Removidos (${this.removed}):`);
    this.toRemove.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   - ${file} (ainda existe - erro)`);
      } else {
        console.log(`   - ${file} (removido com sucesso)`);
      }
    });
    
    console.log(`\n✅ Estrutura Modular Mantida (${this.toKeep.length}):`);
    this.toKeep.forEach(file => console.log(`   - ${file}`));
    
    console.log('\n🎯 Consolidação Alcançada:');
    console.log('   - routes.ts (2300+ linhas) → estrutura modular');
    console.log('   - 50+ arquivos *Routes.ts → módulos específicos');
    console.log('   - Arquitetura modular e escalável');
    console.log('   - Manutenibilidade drasticamente melhorada');
    
    console.log('\n✅ Status: Limpeza de rotas concluída!');
    console.log('=' .repeat(50));
  }

  /**
   * EXECUTAR LIMPEZA COMPLETA
   */
  async runCleanup() {
    console.log('🚀 [ROUTES-CLEANUP] Iniciando limpeza de arquivos de rotas antigos...\n');

    try {
      // 1. Identificar arquivos antigos
      this.identifyOldRouteFiles();
      
      // 2. Verificar estrutura modular
      this.verifyModularStructure();
      
      // 3. Criar backup
      this.createBackup();
      
      // 4. Remover arquivos antigos
      this.removeOldFiles();
      
      // 5. Verificar integridade
      this.verifyIntegrity();
      
      // 6. Gerar relatório
      this.generateReport();

      if (this.errors === 0) {
        console.log('\n🎉 [SUCCESS] Limpeza de rotas concluída com sucesso!');
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
  const cleanup = new RoutesCleanup();
  cleanup.runCleanup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 [FATAL] Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = RoutesCleanup;
