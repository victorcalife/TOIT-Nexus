const DatabaseService = require( '../services/DatabaseService' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );

describe( '🗄️ TESTES BANCO DE DADOS - OPERAÇÕES REAIS', () =>
{
  let db;

  beforeAll( async () =>
  {
    db = new DatabaseService();

    // Configurar banco de teste
    await setupTestDatabase();

    console.log( '✅ Setup de testes de banco concluído' );
  } );

  afterAll( async () =>
  {
    // Limpar dados de teste
    await cleanupTestDatabase();
    console.log( '✅ Cleanup de banco concluído' );
  } );

  describe( '🔗 Conexão e Configuração', () =>
  {
    test( 'Deve conectar ao banco de dados', async () =>
    {
      const result = await db.testConnection();

      expect( result.success ).toBe( true );
      expect( result.connectionTime ).toBeLessThan( 1000 );
      expect( result.serverVersion ).toBeDefined();
    } );

    test( 'Deve executar query simples', async () =>
    {
      const result = await db.query( 'SELECT 1 as test' );

      expect( Array.isArray( result ) ).toBe( true );
      expect( result.length ).toBe( 1 );
      expect( result[ 0 ].test ).toBe( 1 );
    } );

    test( 'Deve lidar com erro de query inválida', async () =>
    {
      try
      {
        await db.query( 'SELECT * FROM tabela_inexistente' );
        fail( 'Deveria ter lançado erro' );
      } catch ( error )
      {
        expect( error.message ).toContain( 'tabela_inexistente' );
      }
    } );
  } );

  describe( '👥 Operações de Usuários', () =>
  {
    let testUserId;
    let testTenantId;

    test( 'Deve criar tenant', async () =>
    {
      const result = await db.query( `
        INSERT INTO tenants (name, domain, email, is_active, created_at, updated_at)
        VALUES ('Tenant Teste DB', 'teste-db.com', 'admin@teste-db.com', 1, NOW(), NOW())
      `);

      expect( result.insertId ).toBeDefined();
      expect( result.insertId ).toBeGreaterThan( 0 );

      testTenantId = result.insertId;
    } );

    test( 'Deve criar usuário', async () =>
    {
      const bcrypt = require( 'bcryptjs' );
      const hashedPassword = await bcrypt.hash( 'senha123', 12 );

      const result = await db.query( `
        INSERT INTO users (tenant_id, name, email, password, role, is_active, created_at, updated_at)
        VALUES (?, 'Usuário Teste DB', 'usuario@teste-db.com', ?, 'user', 1, NOW(), NOW())
      `, [ testTenantId, hashedPassword ] );

      expect( result.insertId ).toBeDefined();
      expect( result.insertId ).toBeGreaterThan( 0 );

      testUserId = result.insertId;
    } );

    test( 'Deve buscar usuário por ID', async () =>
    {
      const users = await db.query( `
        SELECT * FROM users WHERE id = ?
      `, [ testUserId ] );

      expect( users.length ).toBe( 1 );
      expect( users[ 0 ].id ).toBe( testUserId );
      expect( users[ 0 ].email ).toBe( 'usuario@teste-db.com' );
      expect( users[ 0 ].tenant_id ).toBe( testTenantId );
    } );

    test( 'Deve buscar usuário por email', async () =>
    {
      const users = await db.query( `
        SELECT * FROM users WHERE email = ?
      `, [ 'usuario@teste-db.com' ] );

      expect( users.length ).toBe( 1 );
      expect( users[ 0 ].id ).toBe( testUserId );
    } );

    test( 'Deve atualizar usuário', async () =>
    {
      const result = await db.query( `
        UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?
      `, [ 'Nome Atualizado', testUserId ] );

      expect( result.affectedRows ).toBe( 1 );

      // Verificar atualização
      const users = await db.query( `
        SELECT name FROM users WHERE id = ?
      `, [ testUserId ] );

      expect( users[ 0 ].name ).toBe( 'Nome Atualizado' );
    } );

    test( 'Deve listar usuários com paginação', async () =>
    {
      const users = await db.query( `
        SELECT * FROM users 
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [ testTenantId, 10, 0 ] );

      expect( Array.isArray( users ) ).toBe( true );
      expect( users.length ).toBeGreaterThan( 0 );
      expect( users.length ).toBeLessThanOrEqual( 10 );
    } );

    test( 'Deve contar total de usuários', async () =>
    {
      const result = await db.query( `
        SELECT COUNT(*) as total FROM users WHERE tenant_id = ?
      `, [ testTenantId ] );

      expect( result[ 0 ].total ).toBeGreaterThan( 0 );
    } );
  } );

  describe( '📊 Operações de Relatórios', () =>
  {
    let testReportId;

    test( 'Deve criar relatório', async () =>
    {
      const result = await db.query( `
        INSERT INTO reports (
          user_id, tenant_id, name, description, type, category,
          config, filters, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, [
        testUserId,
        testTenantId,
        'Relatório Teste DB',
        'Relatório para testes de banco',
        'table',
        'test',
        JSON.stringify( { columns: [ 'id', 'name' ] } ),
        JSON.stringify( { active: true } )
      ] );

      expect( result.insertId ).toBeDefined();
      testReportId = result.insertId;
    } );

    test( 'Deve buscar relatórios do usuário', async () =>
    {
      const reports = await db.query( `
        SELECT * FROM reports WHERE user_id = ?
      `, [ testUserId ] );

      expect( reports.length ).toBeGreaterThan( 0 );
      expect( reports[ 0 ].id ).toBe( testReportId );
      expect( reports[ 0 ].name ).toBe( 'Relatório Teste DB' );
    } );

    test( 'Deve criar execução de relatório', async () =>
    {
      const result = await db.query( `
        INSERT INTO report_executions (
          report_id, user_id, status, parameters, created_at
        ) VALUES (?, ?, 'completed', ?, NOW())
      `, [ testReportId, testUserId, JSON.stringify( { test: true } ) ] );

      expect( result.insertId ).toBeDefined();

      // Verificar execução
      const executions = await db.query( `
        SELECT * FROM report_executions WHERE report_id = ?
      `, [ testReportId ] );

      expect( executions.length ).toBe( 1 );
      expect( executions[ 0 ].status ).toBe( 'completed' );
    } );

    test( 'Deve buscar relatórios com execuções', async () =>
    {
      const reports = await db.query( `
        SELECT 
          r.*,
          COUNT(re.id) as execution_count,
          MAX(re.created_at) as last_executed
        FROM reports r
        LEFT JOIN report_executions re ON r.id = re.report_id
        WHERE r.user_id = ?
        GROUP BY r.id
      `, [ testUserId ] );

      expect( reports.length ).toBeGreaterThan( 0 );
      expect( reports[ 0 ].execution_count ).toBeGreaterThan( 0 );
      expect( reports[ 0 ].last_executed ).toBeDefined();
    } );
  } );

  describe( '🔄 Operações de Workflows', () =>
  {
    let testWorkflowId;

    test( 'Deve criar workflow', async () =>
    {
      const nodes = [
        { id: '1', type: 'start', position: { x: 0, y: 0 } },
        { id: '2', type: 'end', position: { x: 200, y: 0 } }
      ];
      const edges = [
        { id: 'e1-2', source: '1', target: '2' }
      ];

      const result = await db.query( `
        INSERT INTO workflows (
          user_id, tenant_id, name, description, category,
          nodes, edges, config, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, [
        testUserId,
        testTenantId,
        'Workflow Teste DB',
        'Workflow para testes de banco',
        'test',
        JSON.stringify( nodes ),
        JSON.stringify( edges ),
        JSON.stringify( { test: true } )
      ] );

      expect( result.insertId ).toBeDefined();
      testWorkflowId = result.insertId;
    } );

    test( 'Deve buscar workflows do usuário', async () =>
    {
      const workflows = await db.query( `
        SELECT * FROM workflows WHERE user_id = ?
      `, [ testUserId ] );

      expect( workflows.length ).toBeGreaterThan( 0 );
      expect( workflows[ 0 ].id ).toBe( testWorkflowId );
      expect( workflows[ 0 ].name ).toBe( 'Workflow Teste DB' );
    } );

    test( 'Deve criar execução de workflow', async () =>
    {
      const result = await db.query( `
        INSERT INTO workflow_executions (
          workflow_id, user_id, status, parameters, created_at
        ) VALUES (?, ?, 'completed', ?, NOW())
      `, [ testWorkflowId, testUserId, JSON.stringify( { test: true } ) ] );

      expect( result.insertId ).toBeDefined();
    } );
  } );

  describe( '💬 Operações de Chat', () =>
  {
    let testSessionId;

    test( 'Deve criar sessão de chat', async () =>
    {
      const result = await db.query( `
        INSERT INTO chat_sessions (
          user_id, title, is_active, quantum_enhanced, mila_assisted, created_at, updated_at
        ) VALUES (?, ?, 1, 1, 1, NOW(), NOW())
      `, [ testUserId, 'Sessão Teste DB' ] );

      expect( result.insertId ).toBeDefined();
      testSessionId = result.insertId;
    } );

    test( 'Deve criar mensagens de chat', async () =>
    {
      const messages = [
        { type: 'user', content: 'Olá!' },
        { type: 'assistant', content: 'Olá! Como posso ajudar?' },
        { type: 'user', content: 'Preciso de um relatório' }
      ];

      for ( const msg of messages )
      {
        const result = await db.query( `
          INSERT INTO chat_messages (
            session_id, user_id, message, message_type, created_at
          ) VALUES (?, ?, ?, ?, NOW())
        `, [ testSessionId, testUserId, msg.content, msg.type ] );

        expect( result.insertId ).toBeDefined();
      }
    } );

    test( 'Deve buscar mensagens da sessão', async () =>
    {
      const messages = await db.query( `
        SELECT * FROM chat_messages 
        WHERE session_id = ?
        ORDER BY created_at ASC
      `, [ testSessionId ] );

      expect( messages.length ).toBe( 3 );
      expect( messages[ 0 ].message_type ).toBe( 'user' );
      expect( messages[ 1 ].message_type ).toBe( 'assistant' );
      expect( messages[ 2 ].message_type ).toBe( 'user' );
    } );

    test( 'Deve buscar sessões com contagem de mensagens', async () =>
    {
      const sessions = await db.query( `
        SELECT 
          cs.*,
          COUNT(cm.id) as message_count,
          MAX(cm.created_at) as last_message_at
        FROM chat_sessions cs
        LEFT JOIN chat_messages cm ON cs.id = cm.session_id
        WHERE cs.user_id = ?
        GROUP BY cs.id
      `, [ testUserId ] );

      expect( sessions.length ).toBeGreaterThan( 0 );
      expect( sessions[ 0 ].message_count ).toBe( 3 );
      expect( sessions[ 0 ].last_message_at ).toBeDefined();
    } );
  } );

  describe( '🔑 Operações de Permissões', () =>
  {
    test( 'Deve criar permissão customizada', async () =>
    {
      const result = await db.query( `
        INSERT INTO user_permissions (
          user_id, permission, tenant_id, granted_by, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [ testUserId, 'custom.permission', testTenantId, testUserId ] );

      expect( result.insertId ).toBeDefined();
    } );

    test( 'Deve buscar permissões do usuário', async () =>
    {
      const permissions = await db.query( `
        SELECT permission FROM user_permissions 
        WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)
      `, [ testUserId, testTenantId ] );

      expect( permissions.length ).toBeGreaterThan( 0 );
      expect( permissions[ 0 ].permission ).toBe( 'custom.permission' );
    } );

    test( 'Deve remover permissão', async () =>
    {
      const result = await db.query( `
        DELETE FROM user_permissions 
        WHERE user_id = ? AND permission = ?
      `, [ testUserId, 'custom.permission' ] );

      expect( result.affectedRows ).toBe( 1 );
    } );
  } );

  describe( '📝 Operações de Logs', () =>
  {
    test( 'Deve criar log do sistema', async () =>
    {
      const result = await db.query( `
        INSERT INTO system_logs (
          user_id, action, details, ip_address, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [
        testUserId,
        'test_action',
        JSON.stringify( { test: true, data: 'teste' } ),
        '127.0.0.1'
      ] );

      expect( result.insertId ).toBeDefined();
    } );

    test( 'Deve buscar logs do usuário', async () =>
    {
      const logs = await db.query( `
        SELECT * FROM system_logs 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `, [ testUserId ] );

      expect( logs.length ).toBeGreaterThan( 0 );
      expect( logs[ 0 ].action ).toBe( 'test_action' );
      expect( logs[ 0 ].ip_address ).toBe( '127.0.0.1' );
    } );

    test( 'Deve buscar logs por ação', async () =>
    {
      const logs = await db.query( `
        SELECT * FROM system_logs 
        WHERE action = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      `, [ 'test_action' ] );

      expect( logs.length ).toBeGreaterThan( 0 );
    } );
  } );

  describe( '⚡ Performance e Otimização', () =>
  {
    test( 'Deve executar queries complexas rapidamente', async () =>
    {
      const startTime = Date.now();

      const result = await db.query( `
        SELECT 
          u.id,
          u.name,
          u.email,
          t.name as tenant_name,
          COUNT(r.id) as report_count,
          COUNT(w.id) as workflow_count,
          COUNT(cs.id) as session_count
        FROM users u
        LEFT JOIN tenants t ON u.tenant_id = t.id
        LEFT JOIN reports r ON u.id = r.user_id
        LEFT JOIN workflows w ON u.id = w.user_id
        LEFT JOIN chat_sessions cs ON u.id = cs.user_id
        WHERE u.is_active = 1
        GROUP BY u.id, t.id
        ORDER BY u.created_at DESC
        LIMIT 100
      `);

      const queryTime = Date.now() - startTime;

      expect( Array.isArray( result ) ).toBe( true );
      expect( queryTime ).toBeLessThan( 1000 ); // Menos de 1 segundo

      console.log( `⚡ Query complexa executada em ${ queryTime }ms` );
    } );

    test( 'Deve suportar transações', async () =>
    {
      await db.beginTransaction();

      try
      {
        // Criar usuário
        const userResult = await db.query( `
          INSERT INTO users (tenant_id, name, email, password, role, created_at, updated_at)
          VALUES (?, 'Usuário Transação', 'transacao@test.com', 'hash', 'user', NOW(), NOW())
        `, [ testTenantId ] );

        const newUserId = userResult.insertId;

        // Criar relatório para o usuário
        await db.query( `
          INSERT INTO reports (user_id, tenant_id, name, type, status, created_at, updated_at)
          VALUES (?, ?, 'Relatório Transação', 'table', 'active', NOW(), NOW())
        `, [ newUserId, testTenantId ] );

        await db.commit();

        // Verificar se dados foram salvos
        const users = await db.query( `
          SELECT * FROM users WHERE email = 'transacao@test.com'
        `);

        expect( users.length ).toBe( 1 );

      } catch ( error )
      {
        await db.rollback();
        throw error;
      }
    } );

    test( 'Deve fazer rollback em caso de erro', async () =>
    {
      await db.beginTransaction();

      try
      {
        // Operação válida
        await db.query( `
          INSERT INTO users (tenant_id, name, email, password, role, created_at, updated_at)
          VALUES (?, 'Usuário Rollback', 'rollback@test.com', 'hash', 'user', NOW(), NOW())
        `, [ testTenantId ] );

        // Operação inválida (vai gerar erro)
        await db.query( `
          INSERT INTO tabela_inexistente (campo) VALUES ('valor')
        `);

        await db.commit();
        fail( 'Deveria ter lançado erro' );

      } catch ( error )
      {
        await db.rollback();

        // Verificar se rollback funcionou
        const users = await db.query( `
          SELECT * FROM users WHERE email = 'rollback@test.com'
        `);

        expect( users.length ).toBe( 0 );
      }
    } );

    test( 'Deve executar múltiplas queries simultaneamente', async () =>
    {
      const queries = [
        'SELECT COUNT(*) as count FROM users',
        'SELECT COUNT(*) as count FROM tenants',
        'SELECT COUNT(*) as count FROM reports',
        'SELECT COUNT(*) as count FROM workflows',
        'SELECT COUNT(*) as count FROM chat_sessions'
      ];

      const startTime = Date.now();
      const promises = queries.map( query => db.query( query ) );
      const results = await Promise.all( promises );
      const totalTime = Date.now() - startTime;

      expect( results.length ).toBe( 5 );
      results.forEach( result =>
      {
        expect( result[ 0 ].count ).toBeGreaterThanOrEqual( 0 );
      } );

      expect( totalTime ).toBeLessThan( 2000 ); // Menos de 2 segundos
      console.log( `⚡ 5 queries simultâneas: ${ totalTime }ms` );
    } );
  } );

  describe( '🔍 Validação de Schema', () =>
  {
    test( 'Deve validar estrutura das tabelas principais', async () =>
    {
      const tables = [ 'users', 'tenants', 'reports', 'workflows', 'chat_sessions' ];

      for ( const table of tables )
      {
        const columns = await db.query( `
          SHOW COLUMNS FROM ${ table }
        `);

        expect( columns.length ).toBeGreaterThan( 0 );

        // Verificar se tem ID
        const hasId = columns.some( col => col.Field === 'id' );
        expect( hasId ).toBe( true );

        // Verificar se tem timestamps
        const hasCreatedAt = columns.some( col => col.Field === 'created_at' );
        const hasUpdatedAt = columns.some( col => col.Field === 'updated_at' );
        expect( hasCreatedAt ).toBe( true );
        expect( hasUpdatedAt ).toBe( true );

        console.log( `✅ Tabela ${ table }: ${ columns.length } colunas` );
      }
    } );

    test( 'Deve validar índices das tabelas', async () =>
    {
      const tables = [ 'users', 'tenants', 'reports' ];

      for ( const table of tables )
      {
        const indexes = await db.query( `
          SHOW INDEX FROM ${ table }
        `);

        expect( indexes.length ).toBeGreaterThan( 0 );

        // Deve ter índice primário
        const hasPrimary = indexes.some( idx => idx.Key_name === 'PRIMARY' );
        expect( hasPrimary ).toBe( true );

        console.log( `📊 Tabela ${ table }: ${ indexes.length } índices` );
      }
    } );

    test( 'Deve validar foreign keys', async () =>
    {
      const foreignKeys = await db.query( `
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      expect( foreignKeys.length ).toBeGreaterThan( 0 );

      // Verificar algumas foreign keys específicas
      const userTenantFK = foreignKeys.find( fk =>
        fk.TABLE_NAME === 'users' && fk.REFERENCED_TABLE_NAME === 'tenants'
      );
      expect( userTenantFK ).toBeDefined();

      console.log( `🔗 ${ foreignKeys.length } foreign keys encontradas` );
    } );
  } );
} );

// Funções auxiliares
async function setupTestDatabase()
{
  try
  {
    const db = new DatabaseService();

    // Verificar se as tabelas existem
    const tables = await db.query( `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    const tableNames = tables.map( t => t.TABLE_NAME );
    const requiredTables = [ 'users', 'tenants', 'reports', 'workflows', 'chat_sessions' ];

    for ( const table of requiredTables )
    {
      if ( !tableNames.includes( table ) )
      {
        console.log( `⚠️ Tabela ${ table } não encontrada - executando schema` );
        await executeSchema();
        break;
      }
    }

    console.log( '✅ Schema do banco validado' );
  } catch ( error )
  {
    console.error( '❌ Erro no setup do banco:', error );
    throw error;
  }
}

async function executeSchema()
{
  try
  {
    const db = new DatabaseService();
    const schemaPath = path.join( __dirname, '../database/schema.sql' );
    const schema = await fs.readFile( schemaPath, 'utf8' );

    // Dividir em statements individuais
    const statements = schema
      .split( ';' )
      .map( stmt => stmt.trim() )
      .filter( stmt => stmt.length > 0 );

    for ( const statement of statements )
    {
      if ( statement.toUpperCase().startsWith( 'CREATE' ) ||
        statement.toUpperCase().startsWith( 'INSERT' ) )
      {
        await db.query( statement );
      }
    }

    console.log( '✅ Schema executado com sucesso' );
  } catch ( error )
  {
    console.error( '❌ Erro ao executar schema:', error );
    throw error;
  }
}

async function cleanupTestDatabase()
{
  try
  {
    const db = new DatabaseService();

    // Deletar dados de teste (manter estrutura)
    const testTables = [
      'system_logs',
      'user_permissions',
      'chat_messages',
      'chat_sessions',
      'workflow_executions',
      'workflows',
      'report_executions',
      'reports',
      'users',
      'tenants'
    ];

    for ( const table of testTables )
    {
      await db.query( `
        DELETE FROM ${ table } 
        WHERE (
          email LIKE '%test%' OR 
          email LIKE '%teste%' OR
          name LIKE '%Teste%' OR
          name LIKE '%Test%' OR
          domain LIKE '%test%' OR
          domain LIKE '%teste%'
        )
      `);
    }

    console.log( '✅ Dados de teste removidos' );
  } catch ( error )
  {
    console.error( '❌ Erro na limpeza:', error );
  }
}
