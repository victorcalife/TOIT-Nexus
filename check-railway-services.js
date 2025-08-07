#!/usr/bin/env node

/**
 * Script para verificar serviços Railway
 */

console.log('🔧 VERIFICAÇÃO DE SERVIÇOS RAILWAY');
console.log('=================================\n');

console.log('📋 INSTRUÇÕES PARA VERIFICAR SERVIÇOS:');
console.log('------------------------------------\n');

console.log('1. Execute este comando no terminal:');
console.log('   railway service list\n');

console.log('2. Você deve ver algo como:');
console.log('   Service Name    | Service URL');
console.log('   -----------------------------');
console.log('   toit-nexus      | https://railway.app/project/.../service/...');
console.log('   postgresql      | postgresql://postgres:...@postgres.railway.internal:5432/railway\n');

console.log('3. Se o serviço PostgreSQL não aparecer, adicione-o:');
console.log('   - Acesse o painel do Railway');
console.log('   - Clique em "Add Service"');
console.log('   - Selecione "Database" → "PostgreSQL"\n');

console.log('4. Após adicionar o serviço PostgreSQL, configure estas variáveis:');
console.log('   DATABASE_URL (obtida automaticamente do serviço)');
console.log('   SESSION_SECRET: toit-nexus-session-secret-2025\n');

console.log('5. Redeploy sua aplicação\n');

console.log('6. Execute as migrações:');
console.log('   railway run npm run db:push\n');

console.log('\n✅ Verificação completa!');
