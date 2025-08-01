/**
 * Script para gerar hash bcrypt de senha
 * Uso: node generate-hash.js [senha]
 */

import bcrypt from 'bcrypt';

async function generateHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.log('❌ Uso: node generate-hash.js [sua-senha]');
    console.log('📝 Exemplo: node generate-hash.js minhasenha123');
    process.exit(1);
  }

  try {
    console.log('🔐 Gerando hash bcrypt...');
    console.log(`📝 Senha: ${password}`);
    
    const hash = await bcrypt.hash(password, 10);
    
    console.log('✅ Hash gerado:');
    console.log(`🔑 ${hash}`);
    console.log('');
    console.log('📋 Para usar no SQL:');
    console.log(`'${hash}'`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error);
    process.exit(1);
  }
}

generateHash();