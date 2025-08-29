const http = require('http');

// Função para fazer requisição HTTP
function makeRequest(hostname, path = '/') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Host': hostname,
        'User-Agent': 'Test-Client/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          size: data.length
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🧪 Testando roteamento baseado em domínio...\n');

  const tests = [
    { domain: 'supnexus.toit.com.br', path: '/', expected: 'login_suporte.html' },
    { domain: 'nexus.toit.com.br', path: '/', expected: 'nexus-landing-new.html' },
    { domain: 'localhost', path: '/', expected: 'index.html' },
    { domain: 'localhost', path: '/api/status', expected: 'API status' }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testando ${test.domain}${test.path}...`);
      const result = await makeRequest(test.domain, test.path);
      
      const isHTML = result.headers['content-type']?.includes('text/html');
      const preview = result.data.substring(0, 100).replace(/\n/g, ' ');
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Tipo: ${isHTML ? 'HTML' : 'Outro'}`);
      console.log(`   Tamanho: ${result.size} bytes`);
      console.log(`   Preview: ${preview}...`);
      console.log(`   ✅ ${test.expected}\n`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
  }
}

runTests().catch(console.error);