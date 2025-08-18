-- ====================================================================
-- TOIT NEXUS - DADOS ESSENCIAIS (SEEDERS)
-- Execute este arquivo SEGUNDO no TablePlus (após 01-schema-completo.sql)
-- ====================================================================

-- ====================================================================
-- INSERIR TENANT PRINCIPAL: TOIT
-- ====================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    email,
    phone,
    document,
    address,
    settings,
    plan,
    status,
    max_users,
    max_workspaces,
    max_storage_gb
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'TOIT - Tecnologia e Inovação',
    'toit',
    'contato@toit.com.br',
    '+55 11 99999-9999',
    '12.345.678/0001-90',
    '{"street": "Rua da Inovação, 123", "city": "São Paulo", "state": "SP", "zip": "01234-567", "country": "Brasil"}',
    '{"theme": "dark", "language": "pt-BR", "timezone": "America/Sao_Paulo"}',
    'enterprise',
    'active',
    1000,
    100,
    1000
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- ====================================================================
-- INSERIR USUÁRIO VICTOR (SUPER ADMIN)
-- ====================================================================
INSERT INTO users (
    id,
    tenant_id,
    name,
    email,
    cpf,
    phone,
    password_hash,
    role,
    permissions,
    avatar_url,
    settings,
    is_active,
    is_verified
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Victor Calife',
    'victor@toit.com.br',
    '33656299803',
    '+55 11 98765-4321',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjWZifHEy', -- Senha: 241286
    'super_admin',
    '["admin.full_access", "tenant.manage", "user.manage", "workspace.manage", "system.admin"]',
    'https://github.com/victorcalife.png',
    '{"theme": "dark", "language": "pt-BR", "notifications": true, "email_notifications": true}',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    is_verified = EXCLUDED.is_verified,
    updated_at = NOW();

-- ====================================================================
-- INSERIR WORKSPACE PRINCIPAL: TOIT HQ
-- ====================================================================
INSERT INTO workspaces (
    id,
    tenant_id,
    name,
    description,
    slug,
    settings,
    is_active,
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'TOIT Headquarters',
    'Workspace principal da TOIT para gestão interna',
    'toit-hq',
    '{"default_permissions": ["read", "write"], "public": false}',
    true,
    '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ====================================================================
-- INSERIR WORKSPACE DE DESENVOLVIMENTO
-- ====================================================================
INSERT INTO workspaces (
    id,
    tenant_id,
    name,
    description,
    slug,
    settings,
    is_active,
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'Desenvolvimento TOIT Nexus',
    'Workspace para desenvolvimento do sistema TOIT Nexus',
    'dev-nexus',
    '{"default_permissions": ["read", "write", "admin"], "public": false}',
    true,
    '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ====================================================================
-- ASSOCIAR VICTOR AOS WORKSPACES
-- ====================================================================
INSERT INTO user_workspaces (
    user_id,
    workspace_id,
    role,
    permissions
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'admin',
    '["read", "write", "admin", "delete"]'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'admin',
    '["read", "write", "admin", "delete"]'
) ON CONFLICT (user_id, workspace_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- ====================================================================
-- INSERIR EQUIPE DE DESENVOLVIMENTO
-- ====================================================================
INSERT INTO teams (
    id,
    tenant_id,
    workspace_id,
    name,
    description,
    settings,
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440003',
    'Equipe Core Development',
    'Equipe principal de desenvolvimento do TOIT Nexus',
    '{"meeting_schedule": "daily", "timezone": "America/Sao_Paulo"}',
    '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ====================================================================
-- ASSOCIAR VICTOR À EQUIPE
-- ====================================================================
INSERT INTO user_teams (
    user_id,
    team_id,
    role
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440004',
    'lead'
) ON CONFLICT (user_id, team_id) DO UPDATE SET
    role = EXCLUDED.role;

-- ====================================================================
-- INSERIR PROJETOS INICIAIS
-- ====================================================================
INSERT INTO projects (
    id,
    tenant_id,
    workspace_id,
    name,
    description,
    color,
    status,
    start_date,
    end_date,
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440003',
    'TOIT Nexus Core',
    'Desenvolvimento do sistema principal TOIT Nexus',
    '#3b82f6',
    'active',
    '2024-01-01',
    '2024-12-31',
    '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    status = EXCLUDED.status,
    updated_at = NOW();

-- ====================================================================
-- INSERIR NOTIFICAÇÃO DE BOAS-VINDAS
-- ====================================================================
INSERT INTO notifications (
    tenant_id,
    user_id,
    title,
    message,
    type,
    data,
    is_read
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'Bem-vindo ao TOIT Nexus!',
    'Sistema inicializado com sucesso. Você tem acesso completo como Super Admin.',
    'success',
    '{"action": "welcome", "version": "2.0.0"}',
    false
);

-- ====================================================================
-- VERIFICAR DADOS INSERIDOS
-- ====================================================================
SELECT 
    'TENANTS' as tabela,
    COUNT(*) as registros
FROM tenants
UNION ALL
SELECT 
    'USERS' as tabela,
    COUNT(*) as registros
FROM users
UNION ALL
SELECT 
    'WORKSPACES' as tabela,
    COUNT(*) as registros
FROM workspaces
UNION ALL
SELECT
    'TEAMS' as tabela,
    COUNT(*) as registros
FROM teams
UNION ALL
SELECT
    'PROJECTS' as tabela,
    COUNT(*) as registros
FROM projects
UNION ALL
SELECT
    'NOTIFICATIONS' as tabela,
    COUNT(*) as registros
FROM notifications;

-- ====================================================================
-- DADOS ESSENCIAIS INSERIDOS COM SUCESSO!
-- Agora você pode executar o sistema com:
-- - Tenant: TOIT
-- - Usuário: victor@toit.com.br ou CPF: 33656299803
-- - Senha: 241286
-- ====================================================================
