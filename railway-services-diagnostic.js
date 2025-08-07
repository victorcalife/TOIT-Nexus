#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar serviços Railway
 */

console.log('🔍 DIAGNÓSTICO DE SERVIÇOS RAILWAY');
console.log('==================================\n');

console.log('🔧 PASSO 1: Verificar se o serviço PostgreSQL existe');
console.log('   Execute no terminal: railway service list\n');

console.log('🔧 PASSO 2: Se não existir, adicione o serviço PostgreSQL');
console.log('   No painel Railway:');
console.log('   - Clique em "Add Service"');
console.log('   - Selecione "Database" → "PostgreSQL" (versão 14)\n');

console.log('🔧 PASSO 3: Verifique as variáveis de ambiente');
console.log('   Execute no terminal: railway variables list\n');

console.log('🔧 PASSO 4: Configure estas variáveis essenciais:\n');

console.log('   DATABASE_URL:');
console.log('   postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway\n');

console.log('   SESSION_SECRET:');
console.log('   toit-nexus-session-secret-2025\n');

console.log('🔧 PASSO 5: Execute as migrações');
console.log('   railway run npm run db:push\n');

console.log('🔧 PASSO 6: Inicialize o banco de dados');
console.log('   railway run npm run db:setup\n');

console.log('\n✅ Diagnóstico completo!');
