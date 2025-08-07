#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Railway
 */

console.log('🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - RAILWAY');
console.log('==================================================\n');

console.log('📋 INSTRUÇÕES PARA CONFIGURAR VARIÁVEIS DE AMBIENTE:');
console.log('----------------------------------------------------\n');

console.log('1. Acesse o painel do Railway:');
console.log('   - URL: https://railway.app/project/toit-nexus\n');

console.log('2. Vá para Settings → Variables\n');

console.log('3. Adicione estas variáveis de ambiente:\n');

console.log('   DATABASE_URL:');
console.log('   postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway\n');

console.log('   SESSION_SECRET:');
console.log('   toit-nexus-session-secret-2025\n');

console.log('   PORT:');
console.log('   3000\n');

console.log('4. Certifique-se de que o serviço PostgreSQL está adicionado ao projeto:');
console.log('   - Vá para o painel do projeto Railway');
console.log('   - Clique em "Add Service"');
console.log('   - Selecione "Database"');
console.log('   - Escolha "PostgreSQL" versão 14\n');

console.log('5. Após configurar as variáveis, faça redeploy da aplicação\n');

console.log('6. Execute as migrações do banco de dados:');
console.log('   railway run npm run db:push\n');

console.log('7. Inicialize o banco de dados:');
console.log('   railway run npm run db:setup\n');

console.log('\n✅ Configuração completa!');
console.log('   Após seguir estas instruções, sua aplicação deverá conectar-se ao banco de dados corretamente.\n');
