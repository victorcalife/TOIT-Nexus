// Teste das APIs principais do TOIT NEXUS
import fetch from 'node-fetch';

const BASE_URL = process.env.BACKEND_URL || 'https://api.toit.com.br';

async function testAPI( endpoint, method = 'GET', body = null )
{
  try
  {
    console.log( `\n🔍 Testando ${ method } ${ endpoint }` );

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if ( body )
    {
      options.body = JSON.stringify( body );
    }

    const response = await fetch( `${ BASE_URL }${ endpoint }`, options );
    const data = await response.json();

    console.log( `✅ Status: ${ response.status }` );
    console.log( `📄 Response:`, JSON.stringify( data, null, 2 ) );

    return { success: true, status: response.status, data };
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }` );
    return { success: false, error: error.message };
  }
}

async function runTests()
{
  console.log( '🚀 INICIANDO TESTES DAS APIs TOIT NEXUS' );
  console.log( '='.repeat( 50 ) );

  // 1. Health Check
  await testAPI( '/api/health' );

  // 2. Login com credenciais válidas
  await testAPI( '/api/auth/login', 'POST', {
    identifier: '33656299803',
    password: '241286'
  } );

  // 3. Login de suporte
  await testAPI( '/api/simple-login', 'POST', {
    cpf: '33656299803',
    password: '241286',
    loginType: 'support'
  } );

  // 4. Login com credenciais inválidas
  await testAPI( '/api/auth/login', 'POST', {
    identifier: '00000000000',
    password: 'senha_errada'
  } );

  // 5. Verificar usuário (sem autenticação)
  await testAPI( '/api/user' );

  console.log( '\n🎉 TESTES CONCLUÍDOS!' );
}

// Executar testes
runTests().catch( console.error );
