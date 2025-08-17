const { db } = require( './db.js' );
const { sql } = require( 'drizzle-orm' );

/**
 * Executar indexes e otimizações de performance para autenticação
 */
async function runAuthMigrations()
{
  try
  {
    console.log( '🗄️  Executando migrations de autenticação...' );

    // Index para CPF (usado no login)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_cpf 
      ON users (cpf);
    `);

    // Index para email (usado para busca de usuário)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
      ON users (email);
    `);

    // Index para tenant_id (usado para filtrar dados)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id 
      ON users (tenant_id);
    `);

    // Index para role (usado para verificar permissões)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role 
      ON users (role);
    `);

    // Index para status ativo (usado para filtrar usuários ativos)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active 
      ON users (is_active) WHERE is_active = true;
    `);

    // Index para tenants slug (usado para busca de tenant)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_slug 
      ON tenants (slug);
    `);

    // Index para tenants status ativo
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_active 
      ON tenants (status) WHERE status = 'active';
    `);

    // Index composto para login (CPF + tenant)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_cpf_tenant 
      ON users (cpf, tenant_id);
    `);

    // Index para sessões (usado pelo express-session)
    await db.execute( sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expire 
      ON sessions (expire);
    `);

    // Constraint para garantir CPF único por tenant (exceto super_admin)
    await db.execute( sql`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_cpf_tenant_unique 
      ON users (cpf, tenant_id) 
      WHERE role != 'super_admin';
    `);

    // Constraint para garantir email único por tenant (exceto super_admin)  
    await db.execute( sql`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_tenant_unique 
      ON users (email, tenant_id) 
      WHERE role != 'super_admin' AND email IS NOT NULL;
    `);

    // Trigger para atualizar updated_at automaticamente
    await db.execute( sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await db.execute( sql`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await db.execute( sql`
      DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
      CREATE TRIGGER update_tenants_updated_at 
        BEFORE UPDATE ON tenants 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // View para usuários com informações do tenant
    await db.execute( sql`
      CREATE OR REPLACE VIEW users_with_tenant AS
      SELECT 
        u.id,
        u.cpf,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.role,
        u.tenant_id,
        u.is_active,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.status as tenant_status,
        t.subscription_plan
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id;
    `);

    // View para estatísticas de autenticação
    await db.execute( sql`
      CREATE OR REPLACE VIEW auth_stats AS
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE role = 'super_admin') as super_admins,
        COUNT(*) FILTER (WHERE role = 'tenant_admin') as tenant_admins,
        COUNT(*) FILTER (WHERE role = 'manager') as managers,
        COUNT(*) FILTER (WHERE role = 'employee') as employees,
        COUNT(*) FILTER (WHERE last_login_at > CURRENT_DATE - INTERVAL '30 days') as active_last_30_days,
        COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as created_last_30_days
      FROM users;
    `);

    console.log( '✅ Migrations de autenticação executadas com sucesso' );

  } catch ( error )
  {
    console.error( '❌ Erro ao executar migrations de autenticação:', error );
    throw error;
  }
}

module.exports = { runAuthMigrations };