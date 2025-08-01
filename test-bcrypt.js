import bcrypt from 'bcrypt';

console.log('=== TESTE BCRYPT HASH ===');
console.log('Testando senha: 15151515');
console.log('Hash no banco: $2b$10$fGiUDsbfYp0UWynvUtLXWe.YfR94EENSRkaFrYBNU.5vvsVUP/qMi');
console.log('');

// Testando se o hash está correto
bcrypt.compare('15151515', '$2b$10$fGiUDsbfYp0UWynvUtLXWe.YfR94EENSRkaFrYBNU.5vvsVUP/qMi', (err, result) => {
  console.log('Resultado bcrypt.compare:', result);
  if (!result) {
    console.log('❌ Hash INCORRETO para senha 15151515');
    console.log('');
    console.log('=== GERANDO HASH CORRETO ===');
    bcrypt.hash('15151515', 10, (err, hash) => {
      console.log('Novo hash correto:', hash);
      console.log('');
      console.log('SOLUÇÃO SQL:');
      console.log(`UPDATE users SET password = '${hash}' WHERE cpf = '33656299803';`);
    });
  } else {
    console.log('✅ Hash CORRETO para senha 15151515');
  }
});