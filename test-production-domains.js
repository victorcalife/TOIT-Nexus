#!/usr/bin/env node

/**
 * TESTE FINAL - DOMÍNIOS DE PRODUÇÃO
 * 
 * Testa os domínios onde usuários finais realmente acessam o sistema
 */

const https = require('https');

console.log('🎯 TESTE FINAL - DOMÍNIOS DE PRODUÇÃO\n');

const productionUrls = [
  {
    url: 'https://nexus.toit.com.br/',
    description: 'Landing page comercial (usuários finais)',
    expectStatus: 200,
    expectContentType: 'text/html'
  },
  {
    url: 'https://nexus.toit.com.br/favicon.svg',
    description: 'Favicon SVG na landing page',
    expectStatus: 200,
    expectContentType: 'image/svg+xml'
  },
  {
    url: 'https://supnexus.toit.com.br/',
    description: 'Login equipe TOIT (administradores)',
    expectStatus: 200,
    expectContentType: 'text/html'
  },
  {
    url: 'https://supnexus.toit.com.br/favicon.svg',
    description: 'Favicon SVG no sistema interno',
    expectStatus: 200,
    expectContentType: 'image/svg+xml'
  }
];

async function testUrl(testCase) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = https.get(testCase.url, { timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime;
      
      const result = {
        url: testCase.url,
        description: testCase.description,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        responseTime,
        success: true,
        error: null,
        serverHeader: res.headers['server'] || 'N/A'
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

async function runProductionTests() {
  console.log('🚀 Testando domínios de produção (usuários finais)...\n');
  
  const results = [];
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of productionUrls) {
    console.log(`🧪 Testando: ${testCase.description}`);
    console.log(`📍 URL: ${testCase.url}`);
    
    const result = await testUrl(testCase);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ SUCESSO`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.contentType || 'N/A'}`);
      console.log(`   Server: ${result.serverHeader}`);
      console.log(`   Tempo: ${result.responseTime}ms`);
      passedTests++;
    } else {
      console.log(`❌ FALHA: ${result.error}`);
      console.log(`   Status: ${result.status || 'N/A'}`);
      console.log(`   Server: ${result.serverHeader || 'N/A'}`);
      console.log(`   Tempo: ${result.responseTime}ms`);
      failedTests++;
    }
    
    console.log('');
  }
  
  // Resumo final
  console.log('📊 RESUMO DOS TESTES DE PRODUÇÃO:');
  console.log(`✅ Sucessos: ${passedTests}/${productionUrls.length}`);
  console.log(`❌ Falhas: ${failedTests}/${productionUrls.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / productionUrls.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 SISTEMA 100% OPERACIONAL EM PRODUÇÃO!');
    console.log('✅ Todos os domínios de usuários finais funcionando');
    console.log('✅ Landing page e sistema interno acessíveis');
    console.log('✅ Assets estáticos (favicon) servidos corretamente');
    console.log('✅ Zero loops infinitos nos domínios de produção');
    console.log('\n🚀 SISTEMA PRONTO PARA USO PELOS USUÁRIOS FINAIS!');
  } else {
    console.log('\n⚠️ ALGUNS PROBLEMAS DETECTADOS EM PRODUÇÃO');
    console.log('🔧 Verificar logs acima para detalhes dos problemas');
    console.log('🚨 AÇÃO NECESSÁRIA: Corrigir problemas antes do go-live');
  }
  
  console.log('\n📋 DETALHES TÉCNICOS:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.description}: ${result.status || 'ERROR'} (${result.responseTime}ms)`);
  });
}

runProductionTests().catch(console.error);