-- ====================================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- Script para validar se todos os dados foram inseridos corretamente
-- ====================================================================

-- ====================================================================
-- CONTAGEM DE REGISTROS POR TABELA
-- ====================================================================
SELECT 
    'TENANTS' as tabela,
    COUNT(*) as registros,
    'Organizações cadastradas' as descricao
FROM tenants
UNION ALL
SELECT 
    'USERS' as tabela,
    COUNT(*) as registros,
    'Usuários cadastrados' as descricao
FROM users
UNION ALL
SELECT 
    'WORKSPACES' as tabela,
    COUNT(*) as registros,
    'Espaços de trabalho' as descricao
FROM workspaces
UNION ALL
SELECT 
    'TEAMS' as tabela,
    COUNT(*) as registros,
    'Equipes criadas' as descricao
FROM teams
UNION ALL
SELECT 
    'PROJECTS' as tabela,
    COUNT(*) as registros,
    'Projetos ativos' as descricao
FROM projects
UNION ALL
SELECT 
    'TASKS' as tabela,
    COUNT(*) as registros,
    'Tarefas criadas' as descricao
FROM tasks
UNION ALL
SELECT 
    'EXTERNAL_DATABASE_CONNECTIONS' as tabela,
    COUNT(*) as registros,
    'Conexões externas' as descricao
FROM external_database_connections
UNION ALL
SELECT 
    'USER_PREFERENCES' as tabela,
    COUNT(*) as registros,
    'Preferências de usuário' as descricao
FROM user_preferences
UNION ALL
SELECT 
    'NOTIFICATIONS' as tabela,
    COUNT(*) as registros,
    'Notificações enviadas' as descricao
FROM notifications
ORDER BY tabela;

-- ====================================================================
-- VERIFICAÇÃO DE INTEGRIDADE DOS DADOS
-- ====================================================================

-- Verificar tenant TOIT
SELECT 
    'TENANT TOIT' as verificacao,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ OK - Tenant TOIT criado'
        ELSE '❌ ERRO - Tenant TOIT não encontrado'
    END as status
FROM tenants 
WHERE slug = 'toit';

-- Verificar usuário Victor
SELECT 
    'USUÁRIO VICTOR' as verificacao,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ OK - Usuário Victor criado'
        ELSE '❌ ERRO - Usuário Victor não encontrado'
    END as status
FROM users 
WHERE email = 'victor@toit.com.br';

-- Verificar workspace principal
SELECT 
    'WORKSPACE PRINCIPAL' as verificacao,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ OK - Workspace criado'
        ELSE '❌ ERRO - Workspace não encontrado'
    END as status
FROM workspaces 
WHERE slug = 'toit-nexus';

-- Verificar projetos
SELECT 
    'PROJETOS' as verificacao,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ OK - ' || COUNT(*) || ' projetos criados'
        ELSE '❌ ERRO - Apenas ' || COUNT(*) || ' projetos encontrados'
    END as status
FROM projects;

-- Verificar tarefas
SELECT 
    'TAREFAS' as verificacao,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ OK - ' || COUNT(*) || ' tarefas criadas'
        ELSE '❌ ERRO - Apenas ' || COUNT(*) || ' tarefas encontradas'
    END as status
FROM tasks;

-- ====================================================================
-- DETALHES DOS DADOS INSERIDOS
-- ====================================================================

-- Informações do tenant
SELECT 
    '=== TENANT PRINCIPAL ===' as info,
    '' as valor
UNION ALL
SELECT 'Nome', name FROM tenants WHERE slug = 'toit'
UNION ALL
SELECT 'Email', email FROM tenants WHERE slug = 'toit'
UNION ALL
SELECT 'Plano', plan FROM tenants WHERE slug = 'toit'
UNION ALL
SELECT 'Status', status FROM tenants WHERE slug = 'toit';

-- Informações do usuário
SELECT 
    '=== USUÁRIO PRINCIPAL ===' as info,
    '' as valor
UNION ALL
SELECT 'Nome', name FROM users WHERE email = 'victor@toit.com.br'
UNION ALL
SELECT 'Email', email FROM users WHERE email = 'victor@toit.com.br'
UNION ALL
SELECT 'Role', role FROM users WHERE email = 'victor@toit.com.br'
UNION ALL
SELECT 'Status', 
    CASE 
        WHEN is_active THEN 'Ativo'
        ELSE 'Inativo'
    END
FROM users WHERE email = 'victor@toit.com.br';

-- Lista de projetos
SELECT 
    '=== PROJETOS CRIADOS ===' as projeto,
    '' as status,
    '' as descricao
UNION ALL
SELECT 
    name as projeto,
    status,
    description
FROM projects
ORDER BY projeto;

-- Lista de tarefas
SELECT 
    '=== TAREFAS CRIADAS ===' as tarefa,
    '' as status,
    '' as prioridade
UNION ALL
SELECT 
    title as tarefa,
    status,
    priority as prioridade
FROM tasks
ORDER BY tarefa;

-- ====================================================================
-- VERIFICAÇÃO DE FOREIGN KEYS
-- ====================================================================

-- Verificar se todos os usuários têm tenant válido
SELECT 
    'FOREIGN KEY: users.tenant_id' as verificacao,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Todos os usuários têm tenant válido'
        ELSE '❌ ERRO - ' || COUNT(*) || ' usuários com tenant inválido'
    END as status
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE t.id IS NULL;

-- Verificar se todos os workspaces têm tenant válido
SELECT 
    'FOREIGN KEY: workspaces.tenant_id' as verificacao,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Todos os workspaces têm tenant válido'
        ELSE '❌ ERRO - ' || COUNT(*) || ' workspaces com tenant inválido'
    END as status
FROM workspaces w
LEFT JOIN tenants t ON w.tenant_id = t.id
WHERE t.id IS NULL;

-- Verificar se todas as tarefas têm projeto válido
SELECT 
    'FOREIGN KEY: tasks.project_id' as verificacao,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Todas as tarefas têm projeto válido'
        ELSE '❌ ERRO - ' || COUNT(*) || ' tarefas com projeto inválido'
    END as status
FROM tasks ta
LEFT JOIN projects p ON ta.project_id = p.id
WHERE p.id IS NULL;

-- ====================================================================
-- RESUMO FINAL
-- ====================================================================
SELECT 
    '=== RESUMO FINAL ===' as item,
    '' as valor
UNION ALL
SELECT 'Total de Tenants', COUNT(*)::text FROM tenants
UNION ALL
SELECT 'Total de Usuários', COUNT(*)::text FROM users
UNION ALL
SELECT 'Total de Workspaces', COUNT(*)::text FROM workspaces
UNION ALL
SELECT 'Total de Projetos', COUNT(*)::text FROM projects
UNION ALL
SELECT 'Total de Tarefas', COUNT(*)::text FROM tasks
UNION ALL
SELECT 'Sistema Status', '🚀 OPERACIONAL' as valor;
