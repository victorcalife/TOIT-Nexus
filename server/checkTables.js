const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verificar quais tabelas existem
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sessions', 'user_sessions')
      ORDER BY table_name
    `);

    console.log('\n📋 Tabelas encontradas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar estrutura da tabela sessions se existir
    const sessionsCheck = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sessions'
      ORDER BY ordinal_position
    `);

    if (sessionsCheck.rows.length > 0) {
      console.log('\n🔍 Estrutura da tabela sessions:');
      sessionsCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`);
      });
    }

    // Verificar estrutura da tabela user_sessions se existir
    const userSessionsCheck = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_sessions'
      ORDER BY ordinal_position
    `);

    if (userSessionsCheck.rows.length > 0) {
      console.log('\n🔍 Estrutura da tabela user_sessions:');
      userSessionsCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();