const http = require('http');

// Função para fazer requisição HTTP
function makeRequest(hostname, path = '/', port = 8080) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Host': hostname,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          isHTML: res.headers['content-type']?.includes('text/html'),
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

// Testes específicos
async function runTests() {
  console.log('🧪 Testando domínios específicos...\n');
  
  const tests = [
    {
      name: 'supnexus.toit.com.br (raiz)',
      hostname: 'supnexus.toit.com.br',
      path: '/'
    },
    {
      name: 'supnexus.toit.com.br/support-login',
      hostname: 'supnexus.toit.com.br', 
      path: '/support-login'
    },
    {
      name: 'nexus.toit.com.br (raiz)',
      hostname: 'nexus.toit.com.br',
      path: '/'
    },
    {
      name: 'localhost (raiz)',
      hostname: 'localhost',
      path: '/'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`📋 Testando: ${test.name}`);
      const result = await makeRequest(test.hostname, test.path);
      
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   É HTML: ${result.isHTML}`);
      console.log(`   Tamanho: ${result.size} bytes`);
      
      if (result.statusCode !== 200) {
        console.log(`   ❌ Erro: ${result.data.substring(0, 200)}...`);
      } else {
        console.log(`   ✅ Sucesso`);
        // Mostrar início do conteúdo para verificar se é a página correta
        const preview = result.data.substring(0, 150).replace(/\n/g, ' ');
        console.log(`   📄 Preview: ${preview}...`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Erro na requisição: ${error.message}\n`);
    }
  }
  
  console.log('✅ Todos os testes concluídos!');
}

runTests().catch(console.error);