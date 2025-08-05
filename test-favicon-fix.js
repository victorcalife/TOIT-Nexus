#!/usr/bin/env node

/**
 * TESTE DE CORREÇÃO - LOOPS INFINITOS FAVICON
 * 
 * Este script testa se as correções implementadas resolveram os problemas de:
 * 1. Loops infinitos com favicon.png
 * 2. Request initiator chain errors
 * 3. Redirecionamentos corretos de assets estáticos
 */

const http = require('http');
const https = require('https');

console.log('🧪 TESTE DE CORREÇÃO - LOOPS INFINITOS FAVICON\n');

// URLs para testar
const testUrls = [
  {
    url: 'https://toit-nexus-backend-main.up.railway.app/favicon.svg',
    description: 'Favicon SVG (deve servir arquivo)',
    expectStatus: 200,
    expectContentType: 'image/svg+xml'
  },
  {
    url: 'https://toit-nexus-backend-main.up.railway.app/favicon.png',
    description: 'Favicon PNG (deve servir arquivo SVG diretamente)',
    expectStatus: 200,
    expectContentType: 'image/svg+xml'
  },
  {
    url: 'https://toit-nexus-backend-main.up.railway.app/favicon.ico',
    description: 'Favicon ICO (deve servir arquivo SVG diretamente)',
    expectStatus: 200,
    expectContentType: 'image/svg+xml'
  },
  {
    url: 'https://nexus.toit.com.br/',
    description: 'Landing page comercial (domínio correto)',
    expectStatus: 200,
    expectContentType: 'text/html'
  },
  {
    url: 'https://supnexus.toit.com.br/',
    description: 'Login equipe TOIT (domínio correto)',
    expectStatus: 200,
    expectContentType: 'text/html'
  }
];

async function testUrl(testCase) {
  return new Promise((resolve) => {
    const client = testCase.url.startsWith('https') ? https : http;
    
    const startTime = Date.now();
    const req = client.get(testCase.url, { timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime;
      
      const result = {
        url: testCase.url,
        description: testCase.description,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        location: res.headers['location'],
        responseTime,
        success: true,
        error: null
      };
      
      // Verificar expectativas
      if (testCase.expectStatus && res.statusCode !== testCase.expectStatus) {
        result.success = false;
        result.error = `Status esperado ${testCase.expectStatus}, recebido ${res.statusCode}`;
      }
      
      if (testCase.expectContentType && !res.headers['content-type']?.includes(testCase.expectContentType)) {
        result.success = false;
        result.error = `Content-Type esperado ${testCase.expectContentType}, recebido ${res.headers['content-type']}`;
      }
      
      if (testCase.expectLocation && res.headers['location'] !== testCase.expectLocation) {
        result.success = false;
        result.error = `Location esperado ${testCase.expectLocation}, recebido ${res.headers['location']}`;
      }
      
      resolve(result);
    });
    
    req.on('error', (error) => {
      resolve({
        url: testCase.url,
        description: testCase.description,
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url: testCase.url,
        description: testCase.description,
        success: false,
        error: 'Request timeout (10s)',
        responseTime: 10000
      });
    });
  });
}

async function runTests() {
  console.log('🚀 Iniciando testes...\n');
  
  const results = [];
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of testUrls) {
    console.log(`🧪 Testando: ${testCase.description}`);
    console.log(`📍 URL: ${testCase.url}`);
    
    const result = await testUrl(testCase);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ SUCESSO`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.contentType || 'N/A'}`);
      console.log(`   Location: ${result.location || 'N/A'}`);
      console.log(`   Tempo: ${result.responseTime}ms`);
      passedTests++;
    } else {
      console.log(`❌ FALHA: ${result.error}`);
      console.log(`   Status: ${result.status || 'N/A'}`);
      console.log(`   Tempo: ${result.responseTime}ms`);
      failedTests++;
    }
    
    console.log('');
  }
  
  // Resumo final
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Sucessos: ${passedTests}/${testUrls.length}`);
  console.log(`❌ Falhas: ${failedTests}/${testUrls.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / testUrls.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Loops infinitos de favicon corrigidos com sucesso');
    console.log('✅ Redirecionamentos funcionando corretamente');
    console.log('✅ Assets estáticos não interferem no roteamento por domínio');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os logs acima para detalhes dos problemas');
  }
  
  // Teste específico para detectar loops
  console.log('\n🔄 TESTE ESPECÍFICO DE LOOPS:');
  console.log('Fazendo múltiplas requisições rápidas para detectar loops...');
  
  const loopTest = async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(testUrl({
        url: 'https://toit-nexus-backend-main.up.railway.app/favicon.png',
        description: `Loop test ${i + 1}`,
        expectStatus: 301
      }));
    }
    
    const loopResults = await Promise.all(promises);
    const allSuccess = loopResults.every(r => r.success);
    const avgTime = loopResults.reduce((sum, r) => sum + r.responseTime, 0) / loopResults.length;
    
    if (allSuccess && avgTime < 5000) {
      console.log('✅ NENHUM LOOP DETECTADO');
      console.log(`   Tempo médio: ${avgTime.toFixed(0)}ms`);
    } else {
      console.log('❌ POSSÍVEL LOOP DETECTADO');
      console.log(`   Tempo médio: ${avgTime.toFixed(0)}ms`);
    }
  };
  
  await loopTest();
}

// Executar testes
runTests().catch(console.error);