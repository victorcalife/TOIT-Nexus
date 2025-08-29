const axios = require('axios');
const jwt = require('jsonwebtoken');
const DatabaseService = require('./services/DatabaseService');

// Configuração
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.toit.com.br'
  : 'http://localhost:3001';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const db = new DatabaseService();

async function testAuth() {
  console.log('🔍 Testando Autenticação do Backend...');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log(`🔑 JWT Secret configurado: ${JWT_SECRET ? 'Sim' : 'Não'}`);
  
  try {
    // 1. Verificar se há usuários no banco
    console.log('\n1️⃣ Verificando usuários no banco...');
    const users = await db.query('SELECT id, name, email, role, is_active FROM users LIMIT 5');
    console.log(`👥 Usuários encontrados: ${users.length}`);
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role} - Ativo: ${user.is_active}`);
      });
    } else {
      console.log('⚠️  Nenhum usuário encontrado no banco!');
      return;
    }
    
    // 2. Criar token JWT válido para teste
    console.log('\n2️⃣ Criando token JWT de teste...');
    const testUser = users[0];
    const token = jwt.sign(
      { 
        id: testUser.id, 
        email: testUser.email, 
        role: testUser.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log(`🎫 Token criado para usuário: ${testUser.name}`);
    
    // 3. Testar rota /api/auth/me sem token
    console.log('\n3️⃣ Testando /api/auth/me sem token...');
    try {
      const response = await axios.get(`${API_BASE}/api/auth/me`);
      console.log('❌ Erro: Deveria retornar 401, mas retornou:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correto: Retornou 401 sem token');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }
    
    // 4. Testar rota /api/auth/me com token válido
    console.log('\n4️⃣ Testando /api/auth/me com token válido...');
    try {
      const response = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Sucesso! Status:', response.status);
      console.log('📄 Dados do usuário:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Erro com token válido:', error.response?.status, error.response?.data || error.message);
    }
    
    // 5. Testar rota /api/auth/me com token inválido
    console.log('\n5️⃣ Testando /api/auth/me com token inválido...');
    try {
      const response = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': 'Bearer token-invalido',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Erro: Deveria retornar 401, mas retornou:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correto: Retornou 401 com token inválido');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }
    
    // 6. Testar login
    console.log('\n6️⃣ Testando login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: testUser.email,
        password: 'senha-teste' // Você precisará saber a senha real
      });
      console.log('✅ Login bem-sucedido! Status:', loginResponse.status);
      const loginToken = loginResponse.data.data.token;
      
      // Testar /me com token do login
      console.log('\n7️⃣ Testando /api/auth/me com token do login...');
      const meResponse = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Sucesso com token do login! Status:', meResponse.status);
      
    } catch (error) {
      console.log('❌ Erro no login:', error.response?.status, error.response?.data || error.message);
      console.log('ℹ️  Isso é esperado se a senha estiver incorreta');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  } finally {
    await db.close();
  }
}

// Executar teste
if (require.main === module) {
  testAuth().catch(console.error);
}

module.exports = { testAuth };