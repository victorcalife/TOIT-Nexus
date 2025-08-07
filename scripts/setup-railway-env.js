#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente Railway
 * Este script mostra as variáveis que precisam ser configuradas no dashboard da Railway
 */

console.log('🔧 Configuração de variáveis de ambiente Railway');
console.log('==============================================\n');

console.log('As seguintes variáveis de ambiente precisam ser configuradas no dashboard da Railway:\n');

console.log('1. DATABASE_URL');
console.log('   - Valor: postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway');
console.log('   - Tipo: Conexão com o banco de dados PostgreSQL\n');

console.log('2. SESSION_SECRET');
console.log('   - Valor: (gerar um segredo forte aleatório)');
console.log('   - Tipo: Segredo para sessões\n');

console.log('3. PORT');
console.log('   - Valor: 8080');
console.log('   - Tipo: Porta do servidor (definida automaticamente pela Railway)\n');

console.log('4. STRIPE_SECRET_KEY');
console.log('   - Valor: (sua chave secreta do Stripe)');
console.log('   - Tipo: Chave API do Stripe\n');

console.log('5. STRIPE_PUBLISHABLE_KEY');
console.log('   - Valor: (sua chave publicável do Stripe)');
console.log('   - Tipo: Chave publicável do Stripe\n');

console.log('6. STRIPE_WEBHOOK_SECRET');
console.log('   - Valor: (seu segredo do webhook do Stripe)');
console.log('   - Tipo: Segredo para webhooks do Stripe\n');

console.log('7. API_URL');
console.log('   - Valor: api.toit.com.br');
console.log('   - Tipo: URL para a API\n');

console.log('\n📋 Instruções para configurar no dashboard da Railway:');
console.log('1. Acesse https://railway.app/project/[PROJECT_ID]/settings');
console.log('2. Vá para a aba "Variables"');
console.log('3. Adicione cada variável listada acima com seus respectivos valores');
console.log('4. Redeploy sua aplicação após configurar todas as variáveis\n');

console.log('⚠️  Importante:');
console.log('- Use o DATABASE_URL interno para melhor performance');
console.log('- Gere um SESSION_SECRET forte usando um gerador de senhas');
console.log('- Configure as chaves do Stripe com valores reais');
console.log('- Certifique-se de que API_URL está configurada como api.toit.com.br\n');
