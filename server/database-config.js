/**
 * CONFIGURAÇÃO ROBUSTA DO BANCO DE DADOS
 * Sistema unificado para PostgreSQL com pool de conexões
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite para conexões ociosas
  connectionTimeoutMillis: 2000, // tempo limite para conectar
});

/**
 * CLASSE PRINCIPAL DO BANCO DE DADOS
 */
class DatabaseManager {
  constructor() {
    this.pool = pool;
    this.isConnected = false;
  }

  /**
   * Conectar ao banco de dados
   */
  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('🗄️ Conectado ao PostgreSQL com sucesso');
      client.release();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Executar query simples
   */
  async query(text, params = []) {
    try {
      const start = Date.now();
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      console.log(`🔍 Query executada em ${duration}ms`);
      return result;
    } catch (error) {
      console.error('❌ Erro na query:', error.message);
      throw error;
    }
  }

  /**
   * Executar transação
   */
  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verificar se tabela existe
   */
  async tableExists(tableName) {
    const result = await this.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  }

  /**
   * Obter schema de uma tabela
   */
  async getTableSchema(tableName) {
    const result = await this.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    return result.rows;
  }

  /**
   * Listar todas as tabelas
   */
  async listTables() {
    const result = await this.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    return result.rows.map(row => row.table_name);
  }

  /**
   * Executar arquivo SQL
   */
  async executeSQLFile(filePath) {
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`📄 Executando arquivo SQL: ${filePath}`);
      
      const result = await this.query(sql);
      console.log(`✅ Arquivo SQL executado com sucesso`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao executar arquivo SQL ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Verificar integridade do banco
   */
  async checkIntegrity() {
    console.log('🔍 Verificando integridade do banco...');
    
    const requiredTables = [
      'tenants', 'users', 'workspaces', 'teams', 'departments',
      'permissions', 'user_permissions', 'sessions',
      'workspace_members', 'team_members', 'department_members'
    ];

    const results = {
      tablesExist: {},
      totalTables: 0,
      missingTables: []
    };

    for (const table of requiredTables) {
      const exists = await this.tableExists(table);
      results.tablesExist[table] = exists;
      
      if (exists) {
        results.totalTables++;
        console.log(`✅ Tabela ${table}: OK`);
      } else {
        results.missingTables.push(table);
        console.log(`❌ Tabela ${table}: FALTANDO`);
      }
    }

    console.log(`📊 Integridade: ${results.totalTables}/${requiredTables.length} tabelas`);
    return results;
  }

  /**
   * Verificar e adicionar coluna data à tabela user_sessions
   */
  async ensureUserSessionsDataColumn() {
    try {
      console.log('🔍 Verificando coluna data na tabela user_sessions...');
      
      // Verificar se a coluna data já existe
      const columnCheck = await this.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
      `);
      
      if (columnCheck.rows.length === 0) {
        console.log('➕ Adicionando coluna data à tabela user_sessions...');
        
        // Adicionar a coluna data
        await this.query('ALTER TABLE user_sessions ADD COLUMN data JSON');
        
        // Criar índices se não existirem
        await this.query(`
          CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
          ON user_sessions(user_id)
        `);
        
        await this.query(`
          CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token 
          ON user_sessions(session_token)
        `);
        
        console.log('✅ Coluna data adicionada com sucesso!');
      } else {
        console.log('✅ Coluna data já existe na tabela user_sessions');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar/adicionar coluna data:', error.message);
      throw error;
    }
  }

  /**
   * Executar migrations
   */
  async runMigrations() {
    console.log('🚀 Executando migrations...');
    
    try {
      // 1. Executar schema principal
      const schemaPath = path.join(__dirname, '..', 'database', 'complete-schema-migration-fixed.sql');
      if (fs.existsSync(schemaPath)) {
        await this.executeSQLFile(schemaPath);
        console.log('✅ Schema principal criado');
      }

      // 2. Executar seeders
      const seedersPath = path.join(__dirname, '..', 'database', 'essential-seeders.sql');
      if (fs.existsSync(seedersPath)) {
        await this.executeSQLFile(seedersPath);
        console.log('✅ Seeders executados');
      }

      // 3. Verificar e adicionar coluna data na tabela user_sessions
      await this.ensureUserSessionsDataColumn();

      // 4. Verificar integridade
      const integrity = await this.checkIntegrity();
      
      if (integrity.missingTables.length === 0) {
        console.log('🎉 Migrations executadas com sucesso!');
        return true;
      } else {
        console.log('⚠️ Algumas tabelas ainda estão faltando');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro nas migrations:', error.message);
      throw error;
    }
  }

  /**
   * Fechar conexões
   */
  async close() {
    await this.pool.end();
    console.log('🔒 Pool de conexões fechado');
  }
}

/**
 * FUNÇÕES UTILITÁRIAS PARA OPERAÇÕES CRUD
 */

// Criar usuário
async function createUser(userData) {
  const db = new DatabaseManager();
  
  const query = `
    INSERT INTO users (
      tenant_id, first_name, last_name, email, cpf, 
      password_hash, role, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, uuid, email, role, created_at
  `;
  
  const values = [
    userData.tenant_id,
    userData.first_name,
    userData.last_name,
    userData.email,
    userData.cpf,
    userData.password_hash,
    userData.role || 'user',
    userData.is_active !== false
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

// Buscar usuário por email
async function findUserByEmail(email) {
  const db = new DatabaseManager();
  
  const query = `
    SELECT 
      u.*,
      t.name as tenant_name,
      t.slug as tenant_slug
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    WHERE u.email = $1 AND u.is_active = true
  `;
  
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

// Buscar usuário por CPF
async function findUserByCPF(cpf) {
  const db = new DatabaseManager();
  
  const query = `
    SELECT 
      u.*,
      t.name as tenant_name,
      t.slug as tenant_slug
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    WHERE u.cpf = $1 AND u.is_active = true
  `;
  
  const result = await db.query(query, [cpf]);
  return result.rows[0] || null;
}

// Criar tenant
async function createTenant(tenantData) {
  const db = new DatabaseManager();
  
  const query = `
    INSERT INTO tenants (
      name, slug, domain, email, phone, 
      subscription_plan, status, is_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, uuid, name, slug, created_at
  `;
  
  const values = [
    tenantData.name,
    tenantData.slug,
    tenantData.domain,
    tenantData.email,
    tenantData.phone,
    tenantData.subscription_plan || 'free',
    tenantData.status || 'active',
    tenantData.is_verified || false
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

// Buscar tenant por slug
async function findTenantBySlug(slug) {
  const db = new DatabaseManager();
  
  const query = `
    SELECT * FROM tenants 
    WHERE slug = $1 AND status = 'active'
  `;
  
  const result = await db.query(query, [slug]);
  return result.rows[0] || null;
}

// Instância global do banco
const db = new DatabaseManager();

module.exports = {
  DatabaseManager,
  db,
  pool,
  
  // Funções CRUD
  createUser,
  findUserByEmail,
  findUserByCPF,
  createTenant,
  findTenantBySlug
};
