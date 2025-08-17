const mysql = require( 'mysql2/promise' );
const sqlite3 = require( 'sqlite3' ).verbose();
const { open } = require( 'sqlite' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );

class DatabaseService
{
  constructor()
  {
    this.pool = null;
    this.sqliteDb = null;
    this.isConnected = false;
    this.useSQLite = false;
    this.connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'toit_nexus',
      charset: 'utf8mb4',
      timezone: '+00:00',
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    };

    this.initialize();
  }

  /**
   * Inicializar conexão com banco de dados
   */
  async initialize()
  {
    try
    {
      console.log( '🔄 Inicializando conexão com banco de dados...' );

      // Tentar MySQL primeiro
      try
      {
        await this.initializeMySQL();
        console.log( '✅ Conectado ao MySQL' );
        return;
      } catch ( mysqlError )
      {
        console.warn( '⚠️ MySQL não disponível, usando SQLite:', mysqlError.message );
        await this.initializeSQLite();
        console.log( '✅ Conectado ao SQLite' );
        return;
      }

    } catch ( error )
    {
      console.error( '❌ Erro ao inicializar banco de dados:', error );
      throw error;
    }
  }

  /**
   * Inicializar MySQL
   */
  async initializeMySQL()
  {
    // Remover configurações inválidas para MySQL2
    const cleanConfig = {
      host: this.connectionConfig.host,
      port: this.connectionConfig.port,
      user: this.connectionConfig.user,
      password: this.connectionConfig.password,
      database: this.connectionConfig.database,
      charset: this.connectionConfig.charset,
      timezone: this.connectionConfig.timezone,
      connectionLimit: this.connectionConfig.connectionLimit,
      queueLimit: this.connectionConfig.queueLimit,
      ssl: this.connectionConfig.ssl
    };

    // Criar pool de conexões
    this.pool = mysql.createPool( cleanConfig );

    // Testar conexão
    const connection = await this.pool.getConnection();
    console.log( '✅ Conexão com banco de dados estabelecida' );

    // Marcar como conectado
    this.isConnected = true;
    this.useSQLite = false;

    // Verificar se o banco existe, se não, criar
    await this.ensureDatabaseExists();

    // Executar schema se necessário
    await this.initializeSchema();

    connection.release();

    // Configurar eventos
    this.setupEventHandlers();
  }

  /**
   * Inicializar SQLite
   */
  async initializeSQLite()
  {
    const dbPath = path.join( process.cwd(), 'data', 'toit_nexus.sqlite' );

    // Criar diretório se não existir
    const dbDir = path.dirname( dbPath );
    await fs.mkdir( dbDir, { recursive: true } );

    // Conectar ao SQLite
    this.sqliteDb = await open( {
      filename: dbPath,
      driver: sqlite3.Database
    } );

    this.isConnected = true;
    this.useSQLite = true;

    // Executar schema SQLite
    await this.initializeSQLiteSchema();
  }

  /**
   * Garantir que o banco de dados existe
   */
  async ensureDatabaseExists()
  {
    try
    {
      const tempConfig = { ...this.connectionConfig };
      delete tempConfig.database;

      const tempPool = mysql.createPool( tempConfig );
      const connection = await tempPool.getConnection();

      // Criar banco se não existir
      await connection.execute( `
        CREATE DATABASE IF NOT EXISTS \`${ this.connectionConfig.database }\` 
        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);

      console.log( `✅ Banco de dados '${ this.connectionConfig.database }' verificado/criado` );

      connection.release();
      await tempPool.end();

    } catch ( error )
    {
      console.error( '❌ Erro ao criar banco de dados:', error );
      throw error;
    }
  }

  /**
   * Inicializar schema do banco
   */
  async initializeSchema()
  {
    try
    {
      // Verificar se as tabelas já existem
      const [ tables ] = await this.pool.execute( `
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [ this.connectionConfig.database ] );

      if ( tables[ 0 ].table_count === 0 )
      {
        console.log( '🔄 Executando schema inicial...' );

        // Ler arquivo de schema
        const schemaPath = path.join( __dirname, '../database/schema.sql' );
        const schemaSQL = await fs.readFile( schemaPath, 'utf8' );

        // Dividir em statements individuais
        const statements = schemaSQL
          .split( ';' )
          .map( stmt => stmt.trim() )
          .filter( stmt => stmt.length > 0 );

        // Executar cada statement
        for ( const statement of statements )
        {
          try
          {
            await this.pool.execute( statement );
          } catch ( error )
          {
            if ( !error.message.includes( 'already exists' ) )
            {
              console.error( '❌ Erro ao executar statement:', statement.substring( 0, 100 ) );
              throw error;
            }
          }
        }

        console.log( '✅ Schema inicializado com sucesso' );
      } else
      {
        console.log( '✅ Schema já existe, pulando inicialização' );
      }

    } catch ( error )
    {
      console.error( '❌ Erro ao inicializar schema:', error );
      throw error;
    }
  }

  /**
   * Configurar event handlers
   */
  setupEventHandlers()
  {
    this.pool.on( 'connection', ( connection ) =>
    {
      console.log( '🔗 Nova conexão estabelecida:', connection.threadId );
    } );

    this.pool.on( 'error', ( error ) =>
    {
      console.error( '❌ Erro no pool de conexões:', error );

      if ( error.code === 'PROTOCOL_CONNECTION_LOST' )
      {
        console.log( '🔄 Reconectando ao banco de dados...' );
        this.initialize();
      }
    } );
  }

  /**
   * Executar query
   */
  async query( sql, params = [] )
  {
    // Tentar conectar se não estiver conectado
    if ( !this.isConnected )
    {
      try
      {
        await this.initialize();
      } catch ( error )
      {
        console.error( '❌ Erro ao conectar banco:', error );
        // Para desenvolvimento, permitir queries mesmo sem banco
        if ( process.env.NODE_ENV === 'development' )
        {
          console.warn( '⚠️ Executando em modo desenvolvimento sem banco' );
          return [];
        }
        throw new Error( 'Banco de dados não conectado' );
      }
    }

    try
    {
      const startTime = Date.now();
      let results;

      if ( this.useSQLite )
      {
        // Executar no SQLite
        if ( sql.toLowerCase().includes( 'select' ) )
        {
          results = await this.sqliteDb.all( sql, params );
        } else
        {
          const result = await this.sqliteDb.run( sql, params );
          results = { insertId: result.lastID, affectedRows: result.changes };
        }
      } else
      {
        // Executar no MySQL
        const [ mysqlResults ] = await this.pool.execute( sql, params );
        results = mysqlResults;
      }

      const executionTime = Date.now() - startTime;

      // Log de queries lentas (> 1 segundo)
      if ( executionTime > 1000 )
      {
        console.warn( `⚠️ Query lenta (${ executionTime }ms):`, sql.substring( 0, 100 ) );
      }

      return results;

    } catch ( error )
    {
      console.error( '❌ Erro na query:', {
        sql: sql.substring( 0, 200 ),
        params: params,
        error: error.message
      } );
      throw error;
    }
  }

  /**
   * Executar transação
   */
  async transaction( callback )
  {
    const connection = await this.pool.getConnection();

    try
    {
      await connection.beginTransaction();

      const result = await callback( connection );

      await connection.commit();
      return result;

    } catch ( error )
    {
      await connection.rollback();
      throw error;
    } finally
    {
      connection.release();
    }
  }

  /**
   * Inserir registro e retornar ID
   */
  async insert( table, data )
  {
    const fields = Object.keys( data );
    const values = Object.values( data );
    const placeholders = fields.map( () => '?' ).join( ', ' );

    const sql = `INSERT INTO ${ table } (${ fields.join( ', ' ) }) VALUES (${ placeholders })`;
    const result = await this.query( sql, values );

    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }

  /**
   * Atualizar registros
   */
  async update( table, data, where, whereParams = [] )
  {
    const fields = Object.keys( data );
    const values = Object.values( data );
    const setClause = fields.map( field => `${ field } = ?` ).join( ', ' );

    const sql = `UPDATE ${ table } SET ${ setClause } WHERE ${ where }`;
    const result = await this.query( sql, [ ...values, ...whereParams ] );

    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    };
  }

  /**
   * Deletar registros
   */
  async delete( table, where, whereParams = [] )
  {
    const sql = `DELETE FROM ${ table } WHERE ${ where }`;
    const result = await this.query( sql, whereParams );

    return {
      affectedRows: result.affectedRows
    };
  }

  /**
   * Buscar registros
   */
  async select( table, fields = '*', where = '1=1', whereParams = [], options = {} )
  {
    const {
      orderBy = '',
      limit = '',
      offset = 0
    } = options;

    let sql = `SELECT ${ fields } FROM ${ table } WHERE ${ where }`;

    if ( orderBy )
    {
      sql += ` ORDER BY ${ orderBy }`;
    }

    if ( limit )
    {
      sql += ` LIMIT ${ limit }`;
      if ( offset > 0 )
      {
        sql += ` OFFSET ${ offset }`;
      }
    }

    return await this.query( sql, whereParams );
  }

  /**
   * Contar registros
   */
  async count( table, where = '1=1', whereParams = [] )
  {
    const sql = `SELECT COUNT(*) as total FROM ${ table } WHERE ${ where }`;
    const result = await this.query( sql, whereParams );
    return result[ 0 ].total;
  }

  /**
   * Verificar se registro existe
   */
  async exists( table, where, whereParams = [] )
  {
    const count = await this.count( table, where, whereParams );
    return count > 0;
  }

  /**
   * Buscar um registro
   */
  async findOne( table, where, whereParams = [] )
  {
    const results = await this.select( table, '*', where, whereParams, { limit: 1 } );
    return results.length > 0 ? results[ 0 ] : null;
  }

  /**
   * Buscar por ID
   */
  async findById( table, id )
  {
    return await this.findOne( table, 'id = ?', [ id ] );
  }

  /**
   * Upsert (insert ou update)
   */
  async upsert( table, data, uniqueFields )
  {
    const fields = Object.keys( data );
    const values = Object.values( data );
    const placeholders = fields.map( () => '?' ).join( ', ' );

    const updateClause = fields
      .filter( field => !uniqueFields.includes( field ) )
      .map( field => `${ field } = VALUES(${ field })` )
      .join( ', ' );

    const sql = `
      INSERT INTO ${ table } (${ fields.join( ', ' ) }) 
      VALUES (${ placeholders })
      ON DUPLICATE KEY UPDATE ${ updateClause }
    `;

    const result = await this.query( sql, values );

    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      isInsert: result.affectedRows === 1,
      isUpdate: result.affectedRows === 2
    };
  }

  /**
   * Executar query raw com prepared statement
   */
  async raw( sql, params = [] )
  {
    return await this.query( sql, params );
  }

  /**
   * Obter estatísticas do banco
   */
  async getStats()
  {
    try
    {
      const [ tables ] = await this.query( `
        SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          (data_length + index_length) as total_size
        FROM information_schema.tables 
        WHERE table_schema = ?
        ORDER BY total_size DESC
      `, [ this.connectionConfig.database ] );

      const [ status ] = await this.query( 'SHOW STATUS LIKE "Threads_connected"' );
      const [ variables ] = await this.query( 'SHOW VARIABLES LIKE "max_connections"' );

      return {
        tables,
        connections: {
          current: parseInt( status[ 0 ].Value ),
          max: parseInt( variables[ 0 ].Value )
        },
        poolStats: {
          totalConnections: this.pool._allConnections.length,
          freeConnections: this.pool._freeConnections.length,
          acquiringConnections: this.pool._acquiringConnections.length
        }
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao obter estatísticas:', error );
      return null;
    }
  }

  /**
   * Backup do banco de dados
   */
  async backup( outputPath )
  {
    try
    {
      console.log( '🔄 Iniciando backup do banco de dados...' );

      const tables = await this.query( `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [ this.connectionConfig.database ] );

      let backupSQL = `-- TOIT NEXUS Database Backup\n-- Generated: ${ new Date().toISOString() }\n\n`;

      for ( const table of tables )
      {
        const tableName = table.table_name;

        // Estrutura da tabela
        const [ createTable ] = await this.query( `SHOW CREATE TABLE \`${ tableName }\`` );
        backupSQL += `-- Table: ${ tableName }\n`;
        backupSQL += `DROP TABLE IF EXISTS \`${ tableName }\`;\n`;
        backupSQL += `${ createTable[ 0 ][ 'Create Table' ] };\n\n`;

        // Dados da tabela
        const rows = await this.query( `SELECT * FROM \`${ tableName }\`` );
        if ( rows.length > 0 )
        {
          backupSQL += `-- Data for table: ${ tableName }\n`;

          for ( const row of rows )
          {
            const values = Object.values( row ).map( value =>
            {
              if ( value === null ) return 'NULL';
              if ( typeof value === 'string' ) return `'${ value.replace( /'/g, "''" ) }'`;
              if ( value instanceof Date ) return `'${ value.toISOString().slice( 0, 19 ).replace( 'T', ' ' ) }'`;
              return value;
            } );

            backupSQL += `INSERT INTO \`${ tableName }\` VALUES (${ values.join( ', ' ) });\n`;
          }
          backupSQL += '\n';
        }
      }

      await fs.writeFile( outputPath, backupSQL, 'utf8' );
      console.log( `✅ Backup salvo em: ${ outputPath }` );

      return { success: true, path: outputPath };

    } catch ( error )
    {
      console.error( '❌ Erro no backup:', error );
      return { success: false, error: error.message };
    }
  }

  /**
   * Fechar conexões
   */
  async close()
  {
    if ( this.pool )
    {
      await this.pool.end();
      this.isConnected = false;
      console.log( '✅ Conexões com banco de dados fechadas' );
    }
  }

  /**
   * Verificar saúde da conexão
   */
  async healthCheck()
  {
    try
    {
      await this.query( 'SELECT 1' );
      return {
        status: 'healthy',
        connected: true,
        timestamp: new Date()
      };
    } catch ( error )
    {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Limpar dados antigos
   */
  async cleanup()
  {
    try
    {
      console.log( '🧹 Iniciando limpeza de dados antigos...' );

      // Limpar logs antigos (> 30 dias)
      const logsDeleted = await this.delete(
        'system_logs',
        'created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );

      // Limpar sessões expiradas
      const sessionsDeleted = await this.delete(
        'user_sessions',
        'expires_at < NOW()'
      );

      // Limpar tokens de reset expirados
      const tokensDeleted = await this.delete(
        'password_reset_tokens',
        'expires_at < NOW() OR used_at IS NOT NULL'
      );

      // Limpar emails da lixeira (> 30 dias)
      const emailsDeleted = await this.delete(
        'emails',
        'folder_id = (SELECT id FROM email_folders WHERE type = "trash" LIMIT 1) AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );

      console.log( `✅ Limpeza concluída:`, {
        logs: logsDeleted.affectedRows,
        sessions: sessionsDeleted.affectedRows,
        tokens: tokensDeleted.affectedRows,
        emails: emailsDeleted.affectedRows
      } );

      return {
        success: true,
        deleted: {
          logs: logsDeleted.affectedRows,
          sessions: sessionsDeleted.affectedRows,
          tokens: tokensDeleted.affectedRows,
          emails: emailsDeleted.affectedRows
        }
      };

    } catch ( error )
    {
      console.error( '❌ Erro na limpeza:', error );
      return { success: false, error: error.message };
    }
  }
  /**
   * Inicializar schema SQLite
   */
  async initializeSQLiteSchema()
  {
    const schema = `
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        tenant_id INTEGER,
        is_active INTEGER DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de tenants
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        is_active INTEGER DEFAULT 1,
        settings TEXT,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de operações quânticas
      CREATE TABLE IF NOT EXISTS quantum_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        operation_type TEXT NOT NULL,
        algorithm_used TEXT,
        input_data TEXT,
        result_data TEXT,
        quantum_speedup REAL DEFAULT 1,
        execution_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Tabela de conversas MILA
      CREATE TABLE IF NOT EXISTS mila_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        mila_response TEXT NOT NULL,
        context_data TEXT,
        processing_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Tabela de análises MILA
      CREATE TABLE IF NOT EXISTS mila_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        analysis_type TEXT NOT NULL,
        input_data TEXT NOT NULL,
        result_data TEXT NOT NULL,
        confidence_score REAL DEFAULT 0.9,
        processing_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Tabela de relatórios
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Tabela de uploads de arquivos
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT,
        description TEXT,
        category TEXT DEFAULT 'general',
        file_path TEXT,
        uploaded_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      );

      -- Tabela de workflows
      CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Tabela de execuções de workflow
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id INTEGER NOT NULL,
        status TEXT DEFAULT 'running',
        input_data TEXT,
        output_data TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        error_message TEXT,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id)
      );

      -- Tabela de notificações
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        data TEXT,
        is_read INTEGER DEFAULT 0,
        read_at DATETIME,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Inserir usuário admin padrão se não existir
      INSERT OR IGNORE INTO users (id, email, password_hash, name, role, is_active)
      VALUES (1, 'admin@toit.com.br', '$2b$10$hash', 'Admin TOIT', 'super_admin', 1);

      -- Inserir tenant padrão se não existir
      INSERT OR IGNORE INTO tenants (id, name, domain, is_active)
      VALUES (1, 'TOIT Nexus', 'nexus.toit.com.br', 1);
    `;

    // Executar schema
    await this.sqliteDb.exec( schema );
    console.log( '✅ Schema SQLite inicializado' );
  }
}

module.exports = DatabaseService;
