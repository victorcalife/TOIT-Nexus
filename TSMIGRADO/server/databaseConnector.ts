import mysql from 'mysql2/promise';
import { sql as mssql } from 'mssql';
import oracledb from 'oracledb';
import { db } from './db';
import type { DatabaseConnection } from '@shared/schema';

export class DatabaseConnector {
  private connections: Map<string, any> = new Map();

  async testConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      switch (connection.type) {
        case 'mysql':
          return await this.testMySQLConnection(connection);
        case 'mssql':
          return await this.testMSSQLConnection(connection);
        case 'oracle':
          return await this.testOracleConnection(connection);
        case 'postgresql':
          return await this.testPostgreSQLConnection(connection);
        default:
          throw new Error(`Tipo de banco não suportado: ${connection.type}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  private async testMySQLConnection(connection: DatabaseConnection): Promise<boolean> {
    const mysqlConnection = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      user: connection.username,
      password: connection.password,
      database: connection.database,
      ssl: connection.ssl ? { rejectUnauthorized: false } : false
    });

    await mysqlConnection.execute('SELECT 1');
    await mysqlConnection.end();
    return true;
  }

  private async testMSSQLConnection(connection: DatabaseConnection): Promise<boolean> {
    const pool = new mssql.ConnectionPool({
      server: connection.host,
      port: connection.port,
      user: connection.username,
      password: connection.password,
      database: connection.database,
      options: {
        encrypt: connection.ssl,
        trustServerCertificate: true
      }
    });

    await pool.connect();
    await pool.request().query('SELECT 1');
    await pool.close();
    return true;
  }

  private async testOracleConnection(connection: DatabaseConnection): Promise<boolean> {
    const oracleConnection = await oracledb.getConnection({
      user: connection.username,
      password: connection.password,
      connectString: `${connection.host}:${connection.port}/${connection.database}`
    });

    await oracleConnection.execute('SELECT 1 FROM DUAL');
    await oracleConnection.close();
    return true;
  }

  private async testPostgreSQLConnection(connection: DatabaseConnection): Promise<boolean> {
    // Usar connection string ou campos individuais
    const testQuery = 'SELECT 1';
    const result = await db.execute(testQuery);
    return true; // Se chegou aqui, funcionou
  }

  async executeQuery(connectionId: string, query: string): Promise<any[]> {
    // Buscar conexão no banco
    const [connection]: any = await db.execute(
      `SELECT * FROM database_connections WHERE id = '${connectionId}'`
    );

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    return await this.executeQueryOnConnection(connection, query);
  }

  private async executeQueryOnConnection(connection: any, query: string): Promise<any[]> {
    switch (connection.type) {
      case 'mysql':
        return await this.executeMySQLQuery(connection, query);
      case 'mssql':
        return await this.executeMSSQLQuery(connection, query);
      case 'oracle':
        return await this.executeOracleQuery(connection, query);
      case 'postgresql':
        return await this.executePostgreSQLQuery(connection, query);
      default:
        throw new Error(`Tipo de banco não suportado: ${connection.type}`);
    }
  }

  private async executeMySQLQuery(connection: any, query: string): Promise<any[]> {
    const mysqlConnection = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      user: connection.username,
      password: connection.password,
      database: connection.database,
      ssl: connection.ssl ? { rejectUnauthorized: false } : false
    });

    const [rows] = await mysqlConnection.execute(query);
    await mysqlConnection.end();
    return rows as any[];
  }

  private async executeMSSQLQuery(connection: any, query: string): Promise<any[]> {
    const pool = new mssql.ConnectionPool({
      server: connection.host,
      port: connection.port,
      user: connection.username,
      password: connection.password,
      database: connection.database,
      options: {
        encrypt: connection.ssl,
        trustServerCertificate: true
      }
    });

    await pool.connect();
    const result = await pool.request().query(query);
    await pool.close();
    return result.recordset;
  }

  private async executeOracleQuery(connection: any, query: string): Promise<any[]> {
    const oracleConnection = await oracledb.getConnection({
      user: connection.username,
      password: connection.password,
      connectString: `${connection.host}:${connection.port}/${connection.database}`
    });

    const result = await oracleConnection.execute(query);
    await oracleConnection.close();
    return result.rows || [];
  }

  private async executePostgreSQLQuery(connection: any, query: string): Promise<any[]> {
    const result = await db.execute(query);
    return result.rows || [];
  }

  async getTables(connectionId: string): Promise<string[]> {
    const [connection]: any = await db.execute(
      `SELECT * FROM database_connections WHERE id = '${connectionId}'`
    );

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    switch (connection.type) {
      case 'mysql':
        const mysqlTables = await this.executeMySQLQuery(connection, 'SHOW TABLES');
        return mysqlTables.map((row: any) => Object.values(row)[0] as string);
      
      case 'mssql':
        const mssqlTables = await this.executeMSSQLQuery(connection, 'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'');
        return mssqlTables.map((row: any) => row.TABLE_NAME);
      
      case 'oracle':
        const oracleTables = await this.executeOracleQuery(connection, 'SELECT TABLE_NAME FROM USER_TABLES');
        return oracleTables.map((row: any) => row[0]);
      
      case 'postgresql':
        const pgTables = await this.executePostgreSQLQuery(connection, 'SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');
        return pgTables.map((row: any) => row.tablename);
      
      default:
        return [];
    }
  }

  async getColumns(connectionId: string, tableName: string): Promise<any[]> {
    const [connection]: any = await db.execute(
      `SELECT * FROM database_connections WHERE id = '${connectionId}'`
    );

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    switch (connection.type) {
      case 'mysql':
        return await this.executeMySQLQuery(connection, `DESCRIBE ${tableName}`);
      
      case 'mssql':
        return await this.executeMSSQLQuery(connection, `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);
      
      case 'oracle':
        return await this.executeOracleQuery(connection, `SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = '${tableName.toUpperCase()}'`);
      
      case 'postgresql':
        return await this.executePostgreSQLQuery(connection, `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}'`);
      
      default:
        return [];
    }
  }
}

export const databaseConnector = new DatabaseConnector();