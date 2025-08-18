-- ====================================================================
-- DADOS ESSENCIAIS CORRIGIDOS - TOIT NEXUS
-- Inserção de dados iniciais com IDs e tipos corretos
-- ====================================================================

-- ====================================================================
-- INSERIR TENANT PRINCIPAL (TOIT)
-- ====================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    email,
    phone,
    document,
    address,
    plan,
    status,
    max_users,
    max_workspaces,
    max_storage_gb,
    settings
) VALUES (
    uuid_generate_v4(),
    'TOIT - Tecnologia e Inovação',
    'toit',
    'contato@toit.com.br',
    '+55 11 99999-9999',
    '12.345.678/0001-90',
    '{"street": "Rua da Inovação, 123", "city": "São Paulo", "state": "SP", "zip": "01234-567", "country": "Brasil"}',
    'enterprise',
    'active',
    100,
    50,
    1000,
    '{"quantum_enabled": true, "mila_enabled": true, "advanced_workflows": true}'
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW()
RETURNING id;

-- Salvar o ID do tenant para usar nas próximas inserções
DO $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'toit';
    
    -- ====================================================================
    -- INSERIR USUÁRIO PRINCIPAL (VICTOR)
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
        bio,
        location,
        website,
        github,
        linkedin,
        timezone,
        language,
        theme,
        is_active,
        is_verified
    ) VALUES (
        uuid_generate_v4(),
        tenant_uuid,
        'Victor Calife',
        'victor@toit.com.br',
        '33656299803',
        '+55 11 98765-4321',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', -- senha: 241286
        'super_admin',
        '["*"]',
        'https://github.com/victorcalife.png',
        'Fundador e CTO da TOIT. Especialista em sistemas quânticos e IA.',
        'São Paulo, Brasil',
        'https://toit.com.br',
        'victorcalife',
        'victor-calife',
        'America/Sao_Paulo',
        'pt-BR',
        'dark',
        true,
        true
    ) ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        updated_at = NOW();

    -- ====================================================================
    -- INSERIR WORKSPACE PRINCIPAL
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
        uuid_generate_v4(),
        tenant_uuid,
        'TOIT Nexus Workspace',
        'Workspace principal para desenvolvimento do TOIT Nexus',
        'toit-nexus',
        '{"default_project": "toit-nexus-core", "quantum_processing": true}',
        true,
        (SELECT id FROM users WHERE email = 'victor@toit.com.br')
    ) ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        updated_at = NOW();

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
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM workspaces WHERE slug = 'toit-nexus'),
        'Core Development Team',
        'Equipe principal de desenvolvimento do TOIT Nexus',
        '{"meeting_schedule": "daily", "timezone": "America/Sao_Paulo", "methodology": "agile"}',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br')
    );

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
    ) VALUES 
    (
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM workspaces WHERE slug = 'toit-nexus'),
        'TOIT Nexus Core',
        'Desenvolvimento do sistema principal TOIT Nexus com capacidades quânticas',
        '#3b82f6',
        'active',
        '2024-01-01',
        '2024-12-31',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br')
    ),
    (
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM workspaces WHERE slug = 'toit-nexus'),
        'MILA AI System',
        'Desenvolvimento e integração da MILA AI Assistant',
        '#8b5cf6',
        'active',
        '2024-02-01',
        '2024-08-31',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br')
    ),
    (
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM workspaces WHERE slug = 'toit-nexus'),
        'Quantum Algorithms',
        'Implementação de algoritmos quânticos (Grover, QAOA, VQE, QNN)',
        '#10b981',
        'active',
        '2024-03-01',
        '2024-09-30',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br')
    );

    -- ====================================================================
    -- INSERIR TAREFAS INICIAIS
    -- ====================================================================
    INSERT INTO tasks (
        id,
        tenant_id,
        project_id,
        title,
        description,
        assignee_id,
        reporter_id,
        priority,
        status,
        due_date,
        estimated_hours,
        tags
    ) VALUES 
    (
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM projects WHERE name = 'TOIT Nexus Core' LIMIT 1),
        'Implementar sistema de workflows profissionais',
        'Desenvolver sistema de workflows com nós de integração avançados, condições robustas e interface visual',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        'high',
        'in_progress',
        NOW() + INTERVAL '7 days',
        40.0,
        '["workflows", "automation", "integration"]'
    ),
    (
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM projects WHERE name = 'MILA AI System' LIMIT 1),
        'Integrar MILA com workflows',
        'Conectar MILA AI Assistant aos workflows para automação inteligente',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        'high',
        'todo',
        NOW() + INTERVAL '10 days',
        24.0,
        '["mila", "ai", "workflows", "integration"]'
    ),
    (
        uuid_generate_v4(),
        tenant_uuid,
        (SELECT id FROM projects WHERE name = 'Quantum Algorithms' LIMIT 1),
        'Otimizar algoritmos quânticos',
        'Melhorar performance dos algoritmos quânticos e integração com IBM Quantum',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        'medium',
        'todo',
        NOW() + INTERVAL '14 days',
        32.0,
        '["quantum", "algorithms", "optimization", "ibm"]'
    );

    -- ====================================================================
    -- INSERIR CONEXÃO DE BANCO EXTERNA (EXEMPLO)
    -- ====================================================================
    INSERT INTO external_database_connections (
        id,
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
    ) VALUES (
        uuid_generate_v4(),
        tenant_uuid,
        'PostgreSQL Principal',
        'postgresql',
        'postgres.railway.internal',
        5432,
        'railway',
        'postgres',
        'encrypted_password_here', -- Em produção seria criptografado
        true,
        'Conexão principal com banco PostgreSQL na Railway',
        '["production", "main", "postgresql"]',
        'connected',
        (SELECT id FROM users WHERE email = 'victor@toit.com.br')
    );

    -- ====================================================================
    -- INSERIR PREFERÊNCIAS DO USUÁRIO
    -- ====================================================================
    INSERT INTO user_preferences (
        user_id,
        email_notifications,
        push_notifications,
        weekly_reports,
        marketing_emails,
        two_factor_auth,
        public_profile,
        show_activity,
        show_stats
    ) VALUES (
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true
    ) ON CONFLICT (user_id) DO UPDATE SET
        email_notifications = EXCLUDED.email_notifications,
        push_notifications = EXCLUDED.push_notifications,
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
        data
    ) VALUES (
        tenant_uuid,
        (SELECT id FROM users WHERE email = 'victor@toit.com.br'),
        'Bem-vindo ao TOIT Nexus!',
        'Sistema inicializado com sucesso. Todos os módulos estão operacionais: MILA AI, Algoritmos Quânticos, Workflows Avançados e muito mais!',
        'success',
        '{"version": "2.0.0", "features": ["quantum", "ai", "workflows", "automation"]}'
    );

END $$;
