const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const pool = new Pool({
    connectionString: 'postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@crossover.proxy.rlwy.net:41834/railway',
    ssl: false
});

async function resetDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Conectando ao banco de dados...');
        
        // Ler o arquivo SQL
        const sqlPath = path.join(__dirname, '..', 'database', 'complete-schema-migration-fixed.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 Executando script de migração...');
        
        // Executar o SQL
        await client.query(sqlContent);
        
        console.log('✅ Schema criado com sucesso!');
        
        // Executar seeders
        const seedersPath = path.join(__dirname, '..', 'database', 'essential-seeders.sql');
        const seedersContent = fs.readFileSync(seedersPath, 'utf8');
        
        console.log('🌱 Executando seeders...');
        await client.query(seedersContent);
        
        console.log('✅ Seeders executados com sucesso!');
        
        // Verificar tabelas criadas
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📊 Tabelas criadas:');
        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('📋 Detalhes:', error.detail || 'Nenhum detalhe adicional');
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Executar
resetDatabase().then(() => {
    console.log('🎉 Reset do banco concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
});