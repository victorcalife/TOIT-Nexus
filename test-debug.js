#!/usr/bin/env node

/**
 * TESTE DE DEBUG - ANÁLISE DE REDIRECIONAMENTOS RAILWAY
 */

const https = require('https');

console.log('🔍 TESTE DE DEBUG - ANÁLISE DE REDIRECIONAMENTOS\n');

async function testDebugRoute() {
  return new Promise((resolve) => {
    const url = 'https://toit-nexus-backend-main.up.railway.app/debug/favicon';
    
    console.log(`🧪 Testando rota de debug: ${url}`);
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📊 Headers de resposta:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`📊 Dados recebidos:`, parsed);
        } catch (e) {
          console.log(`📊 Resposta raw:`, data);
        }
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Erro na requisição:`, error.message);
      resolve({ error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.error(`❌ Timeout na requisição`);
      resolve({ error: 'Timeout' });
    });
  });
}

async function testFaviconDirect() {
  return new Promise((resolve) => {
    const url = 'https://toit-nexus-backend-main.up.railway.app/favicon.svg';
    
    console.log(`\n🧪 Testando favicon direto: ${url}`);
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📊 Headers de resposta:`, res.headers);
      console.log(`📊 Location header:`, res.headers['location'] || 'N/A');
      
      // Não ler o body se for redirecionamento
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log(`🔄 Redirecionamento detectado para: ${res.headers['location']}`);
      }
      
      resolve({ status: res.statusCode, headers: res.headers });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Erro na requisição:`, error.message);
      resolve({ error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.error(`❌ Timeout na requisição`);
      resolve({ error: 'Timeout' });
    });
  });
}

async function runDebugTests() {
  console.log('🚀 Iniciando testes de diagnóstico...\n');
  
  // Teste 1: Rota de debug
  const debugResult = await testDebugRoute();
  
  // Teste 2: Favicon direto
  const faviconResult = await testFaviconDirect();
  
  console.log('\n📋 ANÁLISE DOS RESULTADOS:');
  
  if (debugResult.status === 200) {
    console.log('✅ Rota de debug funcionando - nossas rotas estão sendo executadas');
  } else {
    console.log('❌ Rota de debug falhou - há interceptação antes das nossas rotas');
  }
  
  if (faviconResult.status === 302) {
    console.log('⚠️ Favicon retorna 302 - Railway está forçando redirecionamentos');
    console.log(`   Location: ${faviconResult.headers?.location}`);
  } else if (faviconResult.status === 200) {
    console.log('✅ Favicon funcionando corretamente');
  }
  
  console.log('\n🔧 RECOMENDAÇÕES:');
  if (debugResult.status !== 200) {
    console.log('1. Verificar configurações do Railway');
    console.log('2. Verificar se há middleware global de HTTPS redirect');
    console.log('3. Verificar se há configuração de domínio forçado');
  } else {
    console.log('1. Nossas rotas estão funcionando');
    console.log('2. O problema pode ser específico do Railway com assets');
    console.log('3. Considerar servir favicon via CDN ou outro método');
  }
}

runDebugTests().catch(console.error);