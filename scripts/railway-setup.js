#!/usr/bin/env node

/**
 * Script de inicialização para Railway
 * Executa migrations e inicializa dados básicos
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupRailway() {
  console.log('🚀 Iniciando setup Railway TOIT Nexus...');
  
  try {
    // Verificar se DATABASE_URL existe
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não encontrada! Configure o PostgreSQL no Railway.');
    }
    
    console.log('✅ DATABASE_URL encontrada');
    console.log('🗄️  Executando migrations...');
    
    // Executar migrations
    await execAsync('npx drizzle-kit push');
    console.log('✅ Migrations executadas com sucesso');
    
    // Inicializar sistema (se necessário)
    console.log('🔧 Inicializando sistema...');
    // Note: initializeSystem será executado automaticamente no server/index.ts
    
    console.log('🎉 Setup Railway completo!');
    
  } catch (error) {
    console.error('❌ Erro no setup Railway:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupRailway();
}

module.exports = { setupRailway };