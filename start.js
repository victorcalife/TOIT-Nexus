#!/usr/bin/env node

/**
 * ARQUIVO DE INICIALIZAÇÃO PARA RAILWAY
 * Garante que o servidor Node.js seja executado corretamente
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 [RAILWAY-START] Iniciando TOIT Nexus...');
console.log('📁 [RAILWAY-START] Diretório atual:', process.cwd());
console.log('🔧 [RAILWAY-START] NODE_ENV:', process.env.NODE_ENV);
console.log('🌐 [RAILWAY-START] PORT:', process.env.PORT);

// Mudar para o diretório do servidor
const serverDir = path.join(__dirname, 'server');
console.log('📂 [RAILWAY-START] Mudando para:', serverDir);

process.chdir(serverDir);

// Executar npm start
console.log('▶️ [RAILWAY-START] Executando: npm start');

const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '8080'
  }
});

child.on('error', (error) => {
  console.error('❌ [RAILWAY-START] Erro ao iniciar servidor:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🔚 [RAILWAY-START] Servidor encerrado com código: ${code}`);
  process.exit(code);
});

// Capturar sinais de encerramento
process.on('SIGTERM', () => {
  console.log('🛑 [RAILWAY-START] SIGTERM recebido, encerrando...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 [RAILWAY-START] SIGINT recebido, encerrando...');
  child.kill('SIGINT');
});
