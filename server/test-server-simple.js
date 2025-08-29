const request = require('supertest');
const { app } = require('./index-unified');

/**
 * TESTE SIMPLES DO SERVIDOR UNIFICADO
 * Valida que o servidor está funcionando corretamente
 */

async function runSimpleTests() {
  console.log('🧪 Iniciando testes simples do servidor...');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Teste 1: Health Check
    console.log('\n1️⃣ Testando Health Check...');
    const healthResponse = await request(app)
      .get('/api/health')
      .expect(200);
    
    if (healthResponse.body.success) {
      console.log('✅ Health Check funcionando');
      passed++;
    } else {
      console.log('❌ Health Check falhou');
      failed++;
    }
    
    // Teste 2: Health Check Simples
    console.log('\n2️⃣ Testando Health Check Simples...');
    const healthSimpleResponse = await request(app)
      .get('/api/health-simple')
      .expect(200);
    
    if (healthSimpleResponse.body.status === 'ok') {
      console.log('✅ Health Check Simples funcionando');
      passed++;
    } else {
      console.log('❌ Health Check Simples falhou');
      failed++;
    }
    
    // Teste 3: Rota de Auth (deve retornar 401 sem token)
    console.log('\n3️⃣ Testando rota de autenticação...');
    const authResponse = await request(app)
      .get('/api/auth/me')
      .expect(401);
    
    if (authResponse.body.error === 'Token de acesso requerido') {
      console.log('✅ Rota de autenticação funcionando (401 esperado)');
      passed++;
    } else {
      console.log('❌ Rota de autenticação não funcionou como esperado');
      failed++;
    }
    
    // Teste 4: Rota inexistente (deve retornar 404)
    console.log('\n4️⃣ Testando rota inexistente...');
    const notFoundResponse = await request(app)
      .get('/api/rota-inexistente')
      .expect(404);
    
    console.log('✅ Rota inexistente retorna 404 corretamente');
    passed++;
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    failed++;
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESULTADO DOS TESTES SIMPLES');
  console.log('='.repeat(50));
  console.log(`✅ Testes passaram: ${passed}`);
  console.log(`❌ Testes falharam: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram! Servidor está funcionando corretamente.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    process.exit(1);
  }
}

// Executar testes
if (require.main === module) {
  runSimpleTests().catch(error => {
    console.error('💥 Erro crítico nos testes:', error);
    process.exit(1);
  });
}

module.exports = { runSimpleTests };