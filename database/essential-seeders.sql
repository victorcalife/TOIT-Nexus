-- ====================================================================
-- SEEDERS ESSENCIAIS - DADOS INICIAIS TOIT NEXUS
-- Dados obrigatórios para funcionamento do sistema
-- Execute APÓS a migration completa
-- ====================================================================

-- ====================================================================
-- 1. PERMISSÕES DO SISTEMA
-- ====================================================================

INSERT INTO permissions (name, description, resource, action, is_system) VALUES
-- Permissões de usuários
('users.create', 'Criar usuários', 'users', 'create', true),
('users.read', 'Visualizar usuários', 'users', 'read', true),
('users.update', 'Editar usuários', 'users', 'update', true),
('users.delete', 'Excluir usuários', 'users', 'delete', true),

-- Permissões de tenants
('tenants.create', 'Criar organizações', 'tenants', 'create', true),
('tenants.read', 'Visualizar organizações', 'tenants', 'read', true),
('tenants.update', 'Editar organizações', 'tenants', 'update', true),
('tenants.delete', 'Excluir organizações', 'tenants', 'delete', true),

-- Permissões de workspaces
('workspaces.create', 'Criar espaços de trabalho', 'workspaces', 'create', true),
('workspaces.read', 'Visualizar espaços de trabalho', 'workspaces', 'read', true),
('workspaces.update', 'Editar espaços de trabalho', 'workspaces', 'update', true),
('workspaces.delete', 'Excluir espaços de trabalho', 'workspaces', 'delete', true),

-- Permissões de teams
('teams.create', 'Criar equipes', 'teams', 'create', true),
('teams.read', 'Visualizar equipes', 'teams', 'read', true),
('teams.update', 'Editar equipes', 'teams', 'update', true),
('teams.delete', 'Excluir equipes', 'teams', 'delete', true),

-- Permissões de departments
('departments.create', 'Criar departamentos', 'departments', 'create', true),
('departments.read', 'Visualizar departamentos', 'departments', 'read', true),
('departments.update', 'Editar departamentos', 'departments', 'update', true),
('departments.delete', 'Excluir departamentos', 'departments', 'delete', true),

-- Permissões administrativas
('admin.full_access', 'Acesso total ao sistema', 'admin', 'all', true),
('admin.system_config', 'Configurar sistema', 'admin', 'config', true),
('admin.view_logs', 'Visualizar logs do sistema', 'admin', 'logs', true)

ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- 2. TENANT PRINCIPAL - TOIT
-- ====================================================================

INSERT INTO tenants (
    uuid,
    name,
    slug,
    domain,
    email,
    phone,
    address,
    website,
    settings,
    features,
    branding,
    max_users,
    max_workspaces,
    max_storage_gb,
    subscription_plan,
    status,
    is_verified
) VALUES (
    uuid_generate_v4(),
    'TOIT - Tecnologia e Inovação',
    'toit',
    'toit.com.br',
    'admin@toit.com.br',
    '+55 11 99999-9999',
    'São Paulo, SP, Brasil',
    'https://toit.com.br',
    '{"timezone": "America/Sao_Paulo", "language": "pt-BR", "currency": "BRL"}',
    '["quantum_computing", "ml_advanced", "unlimited_storage", "priority_support"]',
    '{"primary_color": "#3B82F6", "secondary_color": "#10B981", "logo_url": "/assets/toit-logo.png"}',
    1000,
    100,
    1000,
    'enterprise',
    'active',
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- 3. USUÁRIO VICTOR - SUPER ADMIN
-- ====================================================================

INSERT INTO users (
    uuid,
    tenant_id,
    first_name,
    last_name,
    email,
    cpf,
    phone,
    password_hash,
    email_verified,
    role,
    permissions,
    preferences,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE slug = 'toit'),
    'Victor',
    'Calife',
    'victor@toit.com.br',
    '33656299803',
    '+55 11 99999-8888',
    crypt('241286', gen_salt('bf')),
    true,
    'super_admin',
    '["admin.full_access"]',
    '{"theme": "dark", "language": "pt-BR", "notifications": true}',
    true
) ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('241286', gen_salt('bf')),
    role = 'super_admin',
    permissions = '["admin.full_access"]',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- 4. WORKSPACE PADRÃO - TOIT
-- ====================================================================

INSERT INTO workspaces (
    uuid,
    tenant_id,
    owner_id,
    name,
    slug,
    description,
    color,
    icon,
    settings,
    is_default,
    is_public,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE slug = 'toit'),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'TOIT Workspace Principal',
    'principal',
    'Workspace principal da TOIT para desenvolvimento e operações',
    '#3B82F6',
    'building-office',
    '{"default_view": "dashboard", "auto_archive": false}',
    true,
    false,
    true
) ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- 5. DEPARTAMENTOS PRINCIPAIS
-- ====================================================================

-- Departamento raiz
INSERT INTO departments (
    uuid,
    tenant_id,
    manager_id,
    name,
    slug,
    description,
    code,
    level,
    path,
    settings,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE slug = 'toit'),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'TOIT Corporativo',
    'corporativo',
    'Departamento corporativo principal da TOIT',
    'CORP',
    0,
    '/corporativo',
    '{"budget_tracking": true, "cost_center": "CORP001"}',
    true
) ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = CURRENT_TIMESTAMP;

-- Departamento de Tecnologia
INSERT INTO departments (
    uuid,
    tenant_id,
    parent_id,
    manager_id,
    name,
    slug,
    description,
    code,
    level,
    path,
    settings,
    budget,
    cost_center,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE slug = 'toit'),
    (SELECT id FROM departments WHERE slug = 'corporativo' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'toit')),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'Tecnologia e Desenvolvimento',
    'tecnologia',
    'Departamento responsável pelo desenvolvimento de soluções tecnológicas',
    'TECH',
    1,
    '/corporativo/tecnologia',
    '{"agile_methodology": true, "code_review_required": true}',
    500000.00,
    'TECH001',
    true
) ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- 6. EQUIPE PRINCIPAL
-- ====================================================================

INSERT INTO teams (
    uuid,
    tenant_id,
    workspace_id,
    leader_id,
    name,
    slug,
    description,
    color,
    settings,
    max_members,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE slug = 'toit'),
    (SELECT id FROM workspaces WHERE slug = 'principal' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'toit')),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'Equipe Core TOIT',
    'core-toit',
    'Equipe principal de desenvolvimento do TOIT Nexus',
    '#10B981',
    '{"daily_standup": true, "sprint_duration": 14}',
    20,
    true
) ON CONFLICT (workspace_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- 7. RELACIONAMENTOS - VICTOR EM TUDO
-- ====================================================================

-- Victor no workspace principal
INSERT INTO workspace_members (workspace_id, user_id, role, permissions) VALUES (
    (SELECT id FROM workspaces WHERE slug = 'principal' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'toit')),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'owner',
    '["workspaces.create", "workspaces.read", "workspaces.update", "workspaces.delete", "teams.create", "teams.read", "teams.update", "teams.delete"]'
) ON CONFLICT (workspace_id, user_id) DO UPDATE SET
    role = 'owner',
    permissions = EXCLUDED.permissions;

-- Victor na equipe core
INSERT INTO team_members (team_id, user_id, role) VALUES (
    (SELECT id FROM teams WHERE slug = 'core-toit'),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'leader'
) ON CONFLICT (team_id, user_id) DO UPDATE SET
    role = 'leader';

-- Victor no departamento de tecnologia
INSERT INTO department_members (department_id, user_id, position) VALUES (
    (SELECT id FROM departments WHERE slug = 'tecnologia' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'toit')),
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    'Diretor de Tecnologia'
) ON CONFLICT (department_id, user_id) DO UPDATE SET
    position = 'Diretor de Tecnologia';

-- ====================================================================
-- 8. PERMISSÕES PARA VICTOR
-- ====================================================================

-- Dar todas as permissões para Victor
INSERT INTO user_permissions (user_id, permission_id, granted_by)
SELECT 
    (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
    p.id,
    (SELECT id FROM users WHERE email = 'victor@toit.com.br')
FROM permissions p
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- ====================================================================
-- 9. TENANT DEMO PARA TESTES
-- ====================================================================

INSERT INTO tenants (
    uuid,
    name,
    slug,
    domain,
    email,
    phone,
    settings,
    max_users,
    max_workspaces,
    max_storage_gb,
    subscription_plan,
    status,
    is_verified,
    trial_ends_at
) VALUES (
    uuid_generate_v4(),
    'Empresa Demo',
    'demo',
    'demo.nexus.toit.com.br',
    'demo@nexus.toit.com.br',
    '+55 11 88888-8888',
    '{"timezone": "America/Sao_Paulo", "language": "pt-BR", "currency": "BRL"}',
    10,
    5,
    5,
    'standard',
    'trial',
    false,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- 10. USUÁRIO DEMO
-- ====================================================================

INSERT INTO users (
    uuid,
    tenant_id,
    first_name,
    last_name,
    email,
    password_hash,
    email_verified,
    role,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Admin',
    'Demo',
    'admin@demo.nexus.toit.com.br',
    crypt('demo123', gen_salt('bf')),
    true,
    'tenant_admin',
    true
) ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('demo123', gen_salt('bf')),
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DOS SEEDERS ===';
    RAISE NOTICE 'Tenants criados: %', (SELECT COUNT(*) FROM tenants);
    RAISE NOTICE 'Usuários criados: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Workspaces criados: %', (SELECT COUNT(*) FROM workspaces);
    RAISE NOTICE 'Teams criadas: %', (SELECT COUNT(*) FROM teams);
    RAISE NOTICE 'Departamentos criados: %', (SELECT COUNT(*) FROM departments);
    RAISE NOTICE 'Permissões criadas: %', (SELECT COUNT(*) FROM permissions);
    RAISE NOTICE '=== SEEDERS EXECUTADOS COM SUCESSO ===';
END $$;
