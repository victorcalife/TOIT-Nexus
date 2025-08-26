/**
 * Script para criar usuários admin no PostgreSQL
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createAdminUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL');

    // 1. Verificar estrutura da tabela tenants
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estrutura da tabela tenants:');
    tableInfo.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    // 2. Criar tenant TOIT se não existir (usando apenas colunas que existem)
    const tenantResult = await client.query(`
      INSERT INTO tenants (name, slug, email, status, created_at, updated_at)
      VALUES ('TOIT - Administração', 'toit', 'admin@toit.com.br', 'active', NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `);
    
    let tenantId;
    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id;
      console.log('✅ Tenant TOIT criado com ID:', tenantId);
    } else {
      const existingTenant = await client.query(`SELECT id FROM tenants WHERE slug = 'toit'`);
      tenantId = existingTenant.rows[0].id;
      console.log('✅ Tenant TOIT já existe com ID:', tenantId);
    }

    // 2. Criar usuário admin@toit.nexus
    const adminPassword = await hashPassword('admin123');
    
    await client.query(`
      INSERT INTO users (first_name, last_name, email, cpf, password_hash, role, tenant_id, is_active, created_at, updated_at)
      VALUES ('Super', 'Admin', 'admin@toit.nexus', '00000000000', $1, 'super_admin', $2, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        role = 'super_admin',
        is_active = true,
        updated_at = NOW()
    `, [adminPassword, tenantId]);
    
    console.log('✅ Usuário admin@toit.nexus criado/atualizado');

    // 3. Criar usuário admin@cliente.com
    const clientAdminPassword = await hashPassword('admin123');
    
    await client.query(`
      INSERT INTO users (first_name, last_name, email, cpf, password_hash, role, tenant_id, is_active, created_at, updated_at)
      VALUES ('Admin', 'Cliente', 'admin@cliente.com', '11111111111', $1, 'tenant_admin', $2, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        role = 'tenant_admin',
        is_active = true,
        updated_at = NOW()
    `, [clientAdminPassword, tenantId]);
    
    console.log('✅ Usuário admin@cliente.com criado/atualizado');

    // 4. Criar usuário admin@toit.com.br
    const toitAdminPassword = await hashPassword('admin123');
    
    await client.query(`
      INSERT INTO users (first_name, last_name, email, cpf, password_hash, role, tenant_id, is_active, created_at, updated_at)
      VALUES ('Admin', 'TOIT', 'admin@toit.com.br', '22222222222', $1, 'super_admin', $2, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        role = 'super_admin',
        is_active = true,
        updated_at = NOW()
    `, [toitAdminPassword, tenantId]);
    
    console.log('✅ Usuário admin@toit.com.br criado/atualizado');

    console.log('\n🎉 Usuários admin criados com sucesso!');
    console.log('👤 Credenciais de acesso:');
    console.log('   admin@toit.nexus - Senha: admin123');
    console.log('   admin@cliente.com - Senha: admin123');
    console.log('   admin@toit.com.br - Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUsers()
    .then(() => {
      console.log('✅ Script concluído com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha no script:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUsers };