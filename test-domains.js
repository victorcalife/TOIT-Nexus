/**
 * TESTE DE ROTEAMENTO POR DOMÍNIO
 * Este arquivo testa se as rotas estão funcionando corretamente para diferentes domínios
 */

const http = require('http');

// Função para fazer requisições de teste
function testDomain(hostname, path = '/') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {
        'Host': hostname,
        'x-forwarded-host': hostname
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          hostname,
          path,
          statusCode: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          isHTML: data.includes('<html>') || data.includes('<!DOCTYPE html>')
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// Executar testes
async function runTests() {
  console.log('🧪 Testando roteamento por domínio...\n');

  try {
    // Teste 1: supnexus.toit.com.br deve servir login_suporte.html
    console.log('📋 Teste 1: supnexus.toit.com.br');
    const test1 = await testDomain('supnexus.toit.com.br');
    console.log(`   Status: ${test1.statusCode}`);
    console.log(`   É HTML: ${test1.isHTML}`);
    console.log(`   Tamanho: ${test1.bodyLength} bytes\n`);

    // Teste 2: nexus.toit.com.br deve servir nexus-landing-new.html
    console.log('📋 Teste 2: nexus.toit.com.br');
    const test2 = await testDomain('nexus.toit.com.br');
    console.log(`   Status: ${test2.statusCode}`);
    console.log(`   É HTML: ${test2.isHTML}`);
    console.log(`   Tamanho: ${test2.bodyLength} bytes\n`);

    // Teste 3: outro domínio deve servir o SPA
    console.log('📋 Teste 3: localhost (SPA)');
    const test3 = await testDomain('localhost');
    console.log(`   Status: ${test3.statusCode}`);
    console.log(`   É HTML: ${test3.isHTML}`);
    console.log(`   Tamanho: ${test3.bodyLength} bytes\n`);

    // Teste 4: API status
    console.log('📋 Teste 4: API Status');
    const test4 = await testDomain('localhost', '/api/status');
    console.log(`   Status: ${test4.statusCode}`);
    console.log(`   Tamanho: ${test4.bodyLength} bytes\n`);

    console.log('✅ Todos os testes concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar os testes
runTests();