/**
 * ARQUIVO PRINCIPAL DE INICIALIZAÇÃO
 * Ponto de entrada único para o TOIT Nexus
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { TOITNexusServer } = require('./app');

/**
 * FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
 */
async function main() {
  try {
    console.log('🔥 TOIT NEXUS - SISTEMA INICIANDO...');
    console.log('═══════════════════════════════════════════');
    console.log('🏢 Empresa: TOIT - Tecnologia e Inovação');
    console.log('🚀 Sistema: TOIT Nexus v2.0.0');
    console.log('⚡ Arquitetura: Unificada JavaScript');
    console.log('🗄️ Banco: PostgreSQL');
    console.log('🔐 Auth: JWT + Sessions');
    console.log('🌐 Frontend: React + Vite');
    console.log('🔧 Backend: Node.js + Express');
    console.log('═══════════════════════════════════════════\n');

    // Verificar variáveis de ambiente críticas
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
      missingVars.forEach(varName => {
        console.error(`   • ${varName}`);
      });
      console.error('\n💡 Crie um arquivo .env com as variáveis necessárias');
      process.exit(1);
    }

    // Criar e iniciar servidor
    const server = new TOITNexusServer();
    await server.start();

    // Log de sucesso
    console.log('🎯 SISTEMA TOTALMENTE OPERACIONAL!');
    console.log('📋 Funcionalidades ativas:');
    console.log('   ✅ Autenticação JWT');
    console.log('   ✅ Multi-tenant');
    console.log('   ✅ Gestão de usuários');
    console.log('   ✅ Workspaces');
    console.log('   ✅ Upload de arquivos');
    console.log('   ✅ Notificações');
    console.log('   ✅ Rate limiting');
    console.log('   ✅ CORS configurado');
    console.log('   ✅ Error handling');
    console.log('   ✅ Health checks');
    console.log('   ✅ Graceful shutdown\n');

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NA INICIALIZAÇÃO:');
    console.error(error);
    process.exit(1);
  }
}

// Executar função principal
main();

module.exports = { main };
