const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
  let connection;
  
  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    // Conectar ao banco usando a DATABASE_URL do Railway
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar se a coluna 'data' já existe
    console.log('🔍 Verificando se a coluna "data" já existe...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_sessions' 
      AND COLUMN_NAME = 'data'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (columns.length > 0) {
      console.log('✅ Coluna "data" já existe na tabela user_sessions');
      return;
    }
    
    console.log('📝 Coluna "data" não existe. Executando migração...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'migrations', '003_add_data_column_to_user_sessions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Extrair apenas os comandos UP (ignorar comentários e comandos DOWN)
    const upCommands = migrationSQL
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.startsWith('--') && 
               !trimmed.includes('DOWN:') &&
               !trimmed.includes('DROP') &&
               !trimmed.includes('DESCRIBE');
      })
      .join('\n')
      .split(';')
      .filter(cmd => cmd.trim());
    
    // Executar cada comando
    for (const command of upCommands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        console.log(`🔄 Executando: ${trimmedCommand.substring(0, 50)}...`);
        await connection.execute(trimmedCommand);
        console.log('✅ Comando executado com sucesso');
      }
    }
    
    // Verificar se a migração foi bem-sucedida
    console.log('🔍 Verificando estrutura da tabela após migração...');
    const [tableStructure] = await connection.execute('DESCRIBE user_sessions');
    
    console.log('📋 Estrutura atual da tabela user_sessions:');
    tableStructure.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    const hasDataColumn = tableStructure.some(col => col.Field === 'data');
    
    if (hasDataColumn) {
      console.log('🎉 Migração executada com sucesso! Coluna "data" adicionada.');
    } else {
      console.log('❌ Erro: Coluna "data" não foi adicionada.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco encerrada');
    }
  }
}

// Executar migração
if (require.main === module) {
  executeMigration();
}

module.exports = { executeMigration };