const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL');

    // Verificar usuários existentes
    const users = await client.query(`
      SELECT id, email, first_name, last_name, role, is_active, tenant_id, created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    console.log('👥 Usuários no banco de dados:');
    if (users.rows.length === 0) {
      console.log('   ❌ Nenhum usuário encontrado!');
    } else {
      users.rows.forEach(user => {
        console.log(`   📧 ${user.email} | ${user.first_name} ${user.last_name} | ${user.role} | Ativo: ${user.is_active} | Tenant: ${user.tenant_id}`);
      });
    }

    // Verificar tenants
    const tenants = await client.query(`
      SELECT id, name, slug, email, status, created_at
      FROM tenants 
      ORDER BY created_at DESC
    `);

    console.log('\n🏢 Tenants no banco de dados:');
    if (tenants.rows.length === 0) {
      console.log('   ❌ Nenhum tenant encontrado!');
    } else {
      tenants.rows.forEach(tenant => {
        console.log(`   🏢 ${tenant.name} | ${tenant.slug} | ${tenant.email} | ${tenant.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Verificação concluída');
  }
}

checkUsers();