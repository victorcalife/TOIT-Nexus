/**
 * Script de teste para sistema de autenticação
 * Executa testes end-to-end do sistema de auth
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

async function testAuthentication() {
  console.log('🧪 Iniciando testes de autenticação...\n');

  let sessionCookie = '';

  try {
    // Teste 1: Login com super admin
    console.log('📝 Teste 1: Login Super Admin');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: '33656299803',
        password: '15151515'
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login super admin: SUCESSO');
      console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Redirect: ${loginData.redirectTo}\n`);

      // Extrair cookie de sessão
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        sessionCookie = setCookieHeader.split(';')[0];
      }
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login super admin: FALHOU');
      console.log(`   Erro: ${error.error}\n`);
      return;
    }

    // Teste 2: Verificar sessão
    console.log('📝 Teste 2: Verificar Sessão');
    const checkResponse = await fetch(`${API_BASE}/api/auth/check`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    });

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      if (checkData.authenticated) {
        console.log('✅ Verificação de sessão: SUCESSO');
        console.log(`   Autenticado: ${checkData.authenticated}`);
        console.log(`   User ID: ${checkData.user.id}\n`);
      } else {
        console.log('❌ Verificação de sessão: FALHOU (não autenticado)\n');
      }
    } else {
      console.log('❌ Verificação de sessão: FALHOU (erro HTTP)\n');
    }

    // Teste 3: Obter dados do usuário
    console.log('📝 Teste 3: Obter Dados do Usuário');
    const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Dados do usuário: SUCESSO');
      console.log(`   Nome: ${meData.user.firstName} ${meData.user.lastName}`);
      console.log(`   Email: ${meData.user.email}`);
      console.log(`   CPF: ${meData.user.cpf}`);
      console.log(`   Tenant: ${meData.user.tenantName}\n`);
    } else {
      const error = await meResponse.json();
      console.log('❌ Dados do usuário: FALHOU');
      console.log(`   Erro: ${error.error}\n`);
    }

    // Teste 4: Login com demo admin
    console.log('📝 Teste 4: Login Demo Admin');
    const demoLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: '11111111111',
        password: 'demo123'
      }),
    });

    if (demoLoginResponse.ok) {
      const demoLoginData = await demoLoginResponse.json();
      console.log('✅ Login demo admin: SUCESSO');
      console.log(`   User: ${demoLoginData.user.firstName} ${demoLoginData.user.lastName}`);
      console.log(`   Role: ${demoLoginData.user.role}`);
      console.log(`   Tenant: ${demoLoginData.user.tenantName}\n`);
    } else {
      const error = await demoLoginResponse.json();
      console.log('❌ Login demo admin: FALHOU');
      console.log(`   Erro: ${error.error}\n`);
    }

    // Teste 5: Login com credenciais inválidas
    console.log('📝 Teste 5: Login com Credenciais Inválidas');
    const invalidLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: '99999999999',
        password: 'wrongpassword'
      }),
    });

    if (!invalidLoginResponse.ok) {
      const error = await invalidLoginResponse.json();
      console.log('✅ Login inválido: REJEITADO (correto)');
      console.log(`   Erro: ${error.error}`);
      console.log(`   Code: ${error.code}\n`);
    } else {
      console.log('❌ Login inválido: NÃO FOI REJEITADO (problema de segurança)\n');
    }

    // Teste 6: Logout
    console.log('📝 Teste 6: Logout');
    const logoutResponse = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie
      }
    });

    if (logoutResponse.ok) {
      const logoutData = await logoutResponse.json();
      console.log('✅ Logout: SUCESSO');
      console.log(`   Mensagem: ${logoutData.message}\n`);
    } else {
      const error = await logoutResponse.json();
      console.log('❌ Logout: FALHOU');
      console.log(`   Erro: ${error.error}\n`);
    }

    // Teste 7: Verificar se sessão foi invalidada
    console.log('📝 Teste 7: Verificar Sessão Invalidada');
    const checkAfterLogoutResponse = await fetch(`${API_BASE}/api/auth/check`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    });

    if (checkAfterLogoutResponse.ok) {
      const checkData = await checkAfterLogoutResponse.json();
      if (!checkData.authenticated) {
        console.log('✅ Sessão invalidada: SUCESSO');
        console.log(`   Autenticado: ${checkData.authenticated}\n`);
      } else {
        console.log('❌ Sessão invalidada: FALHOU (ainda autenticado)\n');
      }
    } else {
      console.log('❌ Verificação pós-logout: FALHOU (erro HTTP)\n');
    }

    console.log('🎉 Testes de autenticação concluídos!');

  } catch (error) {
    console.error('💥 Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar testes se arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthentication();
}

export { testAuthentication };