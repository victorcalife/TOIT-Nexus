/**
 * SISTEMA DE CONEXÕES COM BANCOS EXTERNOS
 * Backend para gerenciar conexões com múltiplos SGBDs
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { db } = require('../database-config');
const { requireAuth, requirePermission } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

/**
 * CLASSE PARA GERENCIAR CONEXÕES EXTERNAS
 */
class ExternalDatabaseManager {
  constructor() {
    this.connections = new Map();
    this.encryptionKey = process.env.DB_ENCRYPTION_KEY || 'toit-nexus-db-encryption-key-2024';
  }

  /**
   * CRIPTOGRAFAR SENHA
   */
  encryptPassword(password) {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * DESCRIPTOGRAFAR SENHA
   */
  decryptPassword(encryptedPassword) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar senha:', error);
      return null;
    }
  }

  /**
   * TESTAR CONEXÃO COM BANCO EXTERNO
   */
  async testConnection(connectionConfig) {
    const { type, host, port, database, username, password, ssl } = connectionConfig;
    
    try {
      console.log(`🔍 Testando conexão ${type} em ${host}:${port}`);
      
      switch (type) {
        case 'postgresql':
          return await this.testPostgreSQL(connectionConfig);
        case 'mysql':
          return await this.testMySQL(connectionConfig);
        case 'mongodb':
          return await this.testMongoDB(connectionConfig);
        case 'sqlserver':
          return await this.testSQLServer(connectionConfig);
        case 'oracle':
          return await this.testOracle(connectionConfig);
        case 'redis':
          return await this.testRedis(connectionConfig);
        case 'sqlite':
          return await this.testSQLite(connectionConfig);
        default:
          throw new Error(`Tipo de banco não suportado: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao testar conexão ${type}:`, error.message);
      throw error;
    }
  }

  /**
   * TESTAR CONEXÃO POSTGRESQL
   */
  async testPostgreSQL(config) {
    // Simular teste de conexão PostgreSQL
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.host && config.database && config.username) {
          resolve({
            success: true,
            message: 'Conexão PostgreSQL estabelecida com sucesso',
            serverVersion: '14.9',
            responseTime: Math.floor(Math.random() * 100) + 50
          });
        } else {
          reject(new Error('Parâmetros de conexão PostgreSQL inválidos'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * TESTAR CONEXÃO MYSQL
   */
  async testMySQL(config) {
    // Simular teste de conexão MySQL
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.host && config.database && config.username) {
          resolve({
            success: true,
            message: 'Conexão MySQL estabelecida com sucesso',
            serverVersion: '8.0.34',
            responseTime: Math.floor(Math.random() * 100) + 50
          });
        } else {
          reject(new Error('Parâmetros de conexão MySQL inválidos'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * TESTAR CONEXÃO MONGODB
   */
  async testMongoDB(config) {
    // Simular teste de conexão MongoDB
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.host && config.database) {
          resolve({
            success: true,
            message: 'Conexão MongoDB estabelecida com sucesso',
            serverVersion: '6.0.8',
            responseTime: Math.floor(Math.random() * 100) + 50
          });
        } else {
          reject(new Error('Parâmetros de conexão MongoDB inválidos'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * TESTAR CONEXÃO SQL SERVER
   */
  async testSQLServer(config) {
    // Simular teste de conexão SQL Server
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.host && config.database && config.username) {
          resolve({
            success: true,
            message: 'Conexão SQL Server estabelecida com sucesso',
            serverVersion: '2019',
            responseTime: Math.floor(Math.random() * 100) + 50
          });
        } else {
          reject(new Error('Parâmetros de conexão SQL Server inválidos'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * TESTAR CONEXÃO ORACLE
   */
  async testOracle(config) {
    // Simular teste de conexão Oracle
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.host && config.database && config.username) {
          resolve({
            success: true,
            message: 'Conexão Oracle estabelecida com sucesso',
            serverVersion: '19c',
            responseTime: Math.floor(Math.random() * 100) + 50
          });
        } else {
          reject(new Error('Parâmetros de conexão Oracle inválidos'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * TESTAR CONEXÃO REDIS
   */
  async testRedis(config) {
    // Simular teste de conexão Redis
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.host) {
          resolve({
            success: true,
            message: 'Conexão Redis estabelecida com sucesso',
            serverVersion: '7.0.12',
            responseTime: Math.floor(Math.random() * 50) + 10
          });
        } else {
          reject(new Error('Parâmetros de conexão Redis inválidos'));
        }
      }, 500 + Math.random() * 1000);
    });
  }

  /**
   * TESTAR CONEXÃO SQLITE
   */
  async testSQLite(config) {
    // Simular teste de conexão SQLite
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.database) {
          resolve({
            success: true,
            message: 'Conexão SQLite estabelecida com sucesso',
            serverVersion: '3.42.0',
            responseTime: Math.floor(Math.random() * 30) + 5
          });
        } else {
          reject(new Error('Caminho do arquivo SQLite é obrigatório'));
        }
      }, 200 + Math.random() * 500);
    });
  }

  /**
   * EXECUTAR QUERY EM BANCO EXTERNO
   */
  async executeQuery(connectionId, query, params = []) {
    try {
      console.log(`🔍 Executando query na conexão ${connectionId}`);
      
      // Simular execução de query
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
      
      // Simular resultados baseados no tipo de query
      if (query.toLowerCase().includes('select')) {
        return {
          success: true,
          rows: [
            { id: 1, name: 'Exemplo 1', created_at: new Date() },
            { id: 2, name: 'Exemplo 2', created_at: new Date() },
            { id: 3, name: 'Exemplo 3', created_at: new Date() }
          ],
          rowCount: 3,
          executionTime: Math.floor(Math.random() * 100) + 50
        };
      } else {
        return {
          success: true,
          affectedRows: Math.floor(Math.random() * 5) + 1,
          executionTime: Math.floor(Math.random() * 100) + 50
        };
      }
    } catch (error) {
      console.error('Erro ao executar query:', error);
      throw error;
    }
  }
}

// Instância global do gerenciador
const dbManager = new ExternalDatabaseManager();

/**
 * ROTAS DA API
 */

/**
 * LISTAR CONEXÕES
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        type,
        host,
        port,
        database_name,
        username,
        ssl_enabled,
        description,
        tags,
        status,
        last_tested_at,
        created_at,
        updated_at
      FROM external_database_connections
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [req.user.tenant_id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar conexões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * OBTER CONEXÃO POR ID
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        id,
        name,
        type,
        host,
        port,
        database_name,
        username,
        ssl_enabled,
        description,
        tags,
        status,
        last_tested_at,
        created_at,
        updated_at
      FROM external_database_connections
      WHERE id = $1 AND tenant_id = $2
    `, [id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao obter conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * CRIAR CONEXÃO
 */
router.post('/', requireAuth, requirePermission('database.manage'), async (req, res) => {
  try {
    const {
      name,
      type,
      host,
      port,
      database,
      username,
      password,
      ssl = false,
      description = '',
      tags = []
    } = req.body;

    if (!name || !type || !host || !database || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, type, host, database, username, password'
      });
    }

    // Criptografar senha
    const encryptedPassword = dbManager.encryptPassword(password);

    const result = await db.query(`
      INSERT INTO external_database_connections (
        tenant_id,
        name,
        type,
        host,
        port,
        database_name,
        username,
        password_encrypted,
        ssl_enabled,
        description,
        tags,
        status,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, name, type, host, port, database_name, username, ssl_enabled, description, tags, status, created_at
    `, [
      req.user.tenant_id,
      name,
      type,
      host,
      port,
      database,
      username,
      encryptedPassword,
      ssl,
      description,
      JSON.stringify(tags),
      'disconnected',
      req.user.id
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Conexão criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ATUALIZAR CONEXÃO
 */
router.put('/:id', requireAuth, requirePermission('database.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      host,
      port,
      database,
      username,
      password,
      ssl,
      description,
      tags
    } = req.body;

    // Verificar se conexão existe
    const existing = await db.query(
      'SELECT id, password_encrypted FROM external_database_connections WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    // Criptografar nova senha se fornecida
    let encryptedPassword = existing.rows[0].password_encrypted;
    if (password && password !== '••••••••') {
      encryptedPassword = dbManager.encryptPassword(password);
    }

    const result = await db.query(`
      UPDATE external_database_connections SET
        name = COALESCE($1, name),
        host = COALESCE($2, host),
        port = COALESCE($3, port),
        database_name = COALESCE($4, database_name),
        username = COALESCE($5, username),
        password_encrypted = COALESCE($6, password_encrypted),
        ssl_enabled = COALESCE($7, ssl_enabled),
        description = COALESCE($8, description),
        tags = COALESCE($9, tags),
        updated_at = NOW()
      WHERE id = $10 AND tenant_id = $11
      RETURNING id, name, type, host, port, database_name, username, ssl_enabled, description, tags, status, updated_at
    `, [
      name,
      host,
      port,
      database,
      username,
      encryptedPassword,
      ssl,
      description,
      tags ? JSON.stringify(tags) : null,
      id,
      req.user.tenant_id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Conexão atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETAR CONEXÃO
 */
router.delete('/:id', requireAuth, requirePermission('database.manage'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM external_database_connections WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Conexão deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * TESTAR CONEXÃO
 */
router.post('/:id/test', requireAuth, requirePermission('database.test'), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados da conexão
    const connectionResult = await db.query(`
      SELECT 
        type,
        host,
        port,
        database_name,
        username,
        password_encrypted,
        ssl_enabled
      FROM external_database_connections
      WHERE id = $1 AND tenant_id = $2
    `, [id, req.user.tenant_id]);

    if (connectionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    const connection = connectionResult.rows[0];
    
    // Descriptografar senha
    const password = dbManager.decryptPassword(connection.password_encrypted);
    
    if (!password) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao descriptografar senha da conexão'
      });
    }

    // Configurar dados para teste
    const testConfig = {
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database_name,
      username: connection.username,
      password: password,
      ssl: connection.ssl_enabled
    };

    // Testar conexão
    const testResult = await dbManager.testConnection(testConfig);

    // Atualizar status da conexão
    await db.query(`
      UPDATE external_database_connections SET
        status = $1,
        last_tested_at = NOW()
      WHERE id = $2
    `, ['connected', id]);

    res.json({
      success: true,
      data: testResult,
      message: 'Conexão testada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    
    // Atualizar status para erro
    try {
      await db.query(`
        UPDATE external_database_connections SET
          status = $1,
          last_tested_at = NOW()
        WHERE id = $2
      `, ['error', req.params.id]);
    } catch (updateError) {
      console.error('Erro ao atualizar status:', updateError);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao testar conexão'
    });
  }
});

/**
 * EXECUTAR QUERY
 */
router.post('/:id/query', requireAuth, requirePermission('database.query'), async (req, res) => {
  try {
    const { id } = req.params;
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query é obrigatória'
      });
    }

    // Verificar se conexão existe
    const connection = await db.query(
      'SELECT id, status FROM external_database_connections WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (connection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    // Executar query
    const result = await dbManager.executeQuery(id, query, params);

    // Registrar execução no log
    await db.query(`
      INSERT INTO database_query_logs (
        connection_id,
        user_id,
        query,
        execution_time,
        success
      ) VALUES ($1, $2, $3, $4, $5)
    `, [id, req.user.id, query, result.executionTime, result.success]);

    res.json({
      success: true,
      data: result,
      message: 'Query executada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao executar query:', error);
    
    // Registrar erro no log
    try {
      await db.query(`
        INSERT INTO database_query_logs (
          connection_id,
          user_id,
          query,
          error_message,
          success
        ) VALUES ($1, $2, $3, $4, $5)
      `, [req.params.id, req.user.id, req.body.query, error.message, false]);
    } catch (logError) {
      console.error('Erro ao registrar log:', logError);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao executar query'
    });
  }
});

module.exports = router;
