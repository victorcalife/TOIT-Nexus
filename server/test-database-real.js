/**
 * TESTE REAL DO BANCO DE DADOS
 * Verifica se o banco PostgreSQL Railway está funcionando
 * e quais tabelas realmente existem
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testDatabase() {
  console.log('🔍 ANÁLISE REAL DO BANCO DE DADOS TOIT NEXUS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Testar conexão
    console.log('\n1️⃣ TESTANDO CONEXÃO...');
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    // 2. Verificar versão do PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Versão PostgreSQL:', versionResult.rows[0].version.split(' ')[1]);
    
    // 3. Listar todas as tabelas existentes
    console.log('\n2️⃣ TABELAS EXISTENTES:');
    const tablesResult = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ NENHUMA TABELA ENCONTRADA - BANCO VAZIO!');
    } else {
      console.log(`✅ ${tablesResult.rows.length} tabelas encontradas:`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name} (${row.table_type})`);
      });
    }
    
    // 4. Verificar extensões instaladas
    console.log('\n3️⃣ EXTENSÕES POSTGRESQL:');
    const extensionsResult = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname;
    `);
    
    if (extensionsResult.rows.length > 0) {
      extensionsResult.rows.forEach(row => {
        console.log(`   📦 ${row.extname} v${row.extversion}`);
      });
    } else {
      console.log('   ⚠️ Nenhuma extensão encontrada');
    }
    
    // 5. Verificar se tabelas principais existem
    console.log('\n4️⃣ VERIFICAÇÃO DE TABELAS CORE:');
    const coreTables = ['users', 'tenants', 'sessions', 'permissions', 'workflows', 'clients'];
    
    for (const tableName of coreTables) {
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      const exists = tableCheck.rows[0].exists;
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${tableName}`);
      
      // Se a tabela existe, contar registros
      if (exists) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
          console.log(`      📊 ${countResult.rows[0].count} registros`);
        } catch (error) {
          console.log(`      ⚠️ Erro ao contar registros: ${error.message}`);
        }
      }
    }
    
    // 6. Verificar enums existentes
    console.log('\n5️⃣ ENUMS PERSONALIZADOS:');
    const enumsResult = await client.query(`
      SELECT t.typname as enum_name,
             string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);
    
    if (enumsResult.rows.length > 0) {
      enumsResult.rows.forEach(row => {
        console.log(`   🏷️ ${row.enum_name}: [${row.enum_values}]`);
      });
    } else {
      console.log('   ⚠️ Nenhum enum personalizado encontrado');
    }
    
    // 7. Verificar tamanho do banco
    console.log('\n6️⃣ ESTATÍSTICAS DO BANCO:');
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
    `);
    console.log(`   💾 Tamanho do banco: ${sizeResult.rows[0].database_size}`);
    
    client.release();
    
    // 8. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DA ANÁLISE:');
    
    if (tablesResult.rows.length === 0) {
      console.log('🚨 STATUS: BANCO VAZIO - MIGRATIONS NECESSÁRIAS');
      console.log('📝 AÇÃO: Execute as migrations para criar as tabelas');
      console.log('💡 COMANDO: npm run db:migrate ou execute os arquivos SQL');
    } else {
      const coreTablesExist = coreTables.filter(async (table) => {
        const check = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        return check.rows[0].exists;
      });
      
      console.log(`✅ STATUS: BANCO ATIVO com ${tablesResult.rows.length} tabelas`);
      console.log('📊 FUNCIONALIDADES: Sistema parcialmente implementado');
      console.log('🎯 PRÓXIMO PASSO: Verificar integridade dos dados');
    }
    
  } catch (error) {
    console.error('❌ ERRO NA ANÁLISE:', error.message);
    console.error('🔧 DETALHES:', error.stack);
  } finally {
    await pool.end();
    console.log('\n🔒 Conexão com banco encerrada');
  }
}

// Executar teste
testDatabase().catch(console.error);