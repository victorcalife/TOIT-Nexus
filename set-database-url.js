#!/usr/bin/env node

/**
 * Script para configurar DATABASE_URL no Railway
 * 
 * Este script fornece instruções claras para configurar a variável de ambiente
 * DATABASE_URL no painel do Railway, o que é necessário para executar migrações.
 */

console.log('🔧 CONFIGURAÇÃO DO DATABASE_URL NO RAILWAY');
console.log('=========================================\n');

console.log('🚨 IMPORTANTE: Esta variável de ambiente deve ser configurada no painel do Railway\n');

console.log('📋 PASSO A PASSO PARA CONFIGURAR DATABASE_URL:');
console.log('----------------------------------------------');

console.log('1. Acesse o painel do Railway:');
console.log('   - URL: https://railway.app/project/toit-nexus\n');

console.log('2. Vá para Settings (Configurações) → Variables (Variáveis)\n');

console.log('3. Adicione a variável DATABASE_URL com este valor:');
console.log('   postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway\n');

console.log('4. Também configure estas outras variáveis importantes:');
console.log('   - SESSION_SECRET: toit-nexus-session-secret-2025\n');

console.log('5. Certifique-se de que o serviço PostgreSQL está adicionado:');
console.log('   - No painel do projeto, clique em "Add Service"');
console.log('   - Selecione "Database" → "PostgreSQL" (versão 14)\n');

console.log('6. Após configurar as variáveis, faça redeploy da aplicação\n');

console.log('7. Execute as migrações do banco de dados:');
console.log('   railway run npm run db:push\n');

console.log('\n✅ Após seguir estas instruções, você poderá migrar o banco de dados corretamente.\n');
