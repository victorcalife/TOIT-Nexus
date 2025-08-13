#!/usr/bin/env node

/**
 * Script para configurar o banco de dados Railway e variáveis de ambiente
 */

console.log( '🔧 CONFIGURAÇÃO DO BANCO DE DADOS RAILWAY' );
console.log( '=======================================\n' );

console.log( '🚨 PROBLEMA IDENTIFICADO:' );
console.log( '   O arquivo drizzle.config.ts está configurado corretamente' );
console.log( '   mas a variável DATABASE_URL não está definida no Railway\n' );

console.log( '\n📋 SOLUÇÃO - CONFIGURE AS VARIÁVEIS NO RAILWAY:' );
console.log( '----------------------------------------------' );

console.log( '1. Acesse o painel do Railway:' );
console.log( '   - URL: https://railway.app/project/toit-nexus\n' );

console.log( '2. Vá para Settings → Variables\n' );

console.log( '3. Adicione estas variáveis de ambiente:\n' );

console.log( '   DATABASE_URL:' );
console.log( '   postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway\n' );

console.log( '   SESSION_SECRET:' );
console.log( '   toit-nexus-session-secret-2025\n' );

console.log( '4. Certifique-se de que o serviço PostgreSQL está adicionado:' );
console.log( '   - No painel do projeto, clique em "Add Service"' );
console.log( '   - Selecione "Database" → "PostgreSQL" (versão 14)\n' );

console.log( '5. Após configurar as variáveis, faça redeploy da aplicação\n' );

console.log( '6. Execute as migrações do banco de dados (usando config JS):' );
console.log( '   railway run npx drizzle-kit push --config=drizzle.config.js\n' );

console.log( '7. Inicialize o banco de dados:' );
console.log( '   railway run npm run db:setup\n' );

console.log( '\n✅ Após seguir estas instruções, o drizzle.config.ts poderá acessar a DATABASE_URL corretamente.\n' );
