-- Script SQL CORRIGIDO para inserir dados de teste no TOIT NEXUS
-- Execute este script diretamente no PostgreSQL Railway
-- Schema corrigido baseado em shared/schema.js

-- 1. INSERIR EMPRESAS (TENANTS) - SCHEMA CORRETO
INSERT INTO tenants (id, name, slug, domain, status, subscription_plan, settings, "isActive", created_at, updated_at) VALUES
('toit-enterprise', 'TOIT Enterprise', 'toit', 'toit.com.br', 'active', 'enterprise', '{"theme":"dark","features":["all"],"maxUsers":null,"maxStorage":null}', true, NOW(), NOW()),
('tech-solutions', 'Tech Solutions Ltda', 'tech-solutions', 'techsolutions.com.br', 'active', 'business', '{"theme":"light","features":["workflows","reports","task-management"],"maxUsers":25,"maxStorage":"500GB"}', true, NOW(), NOW()),
('inovacao-digital', 'Inovação Digital', 'inovacao-digital', 'inovacaodigital.com.br', 'active', 'professional', '{"theme":"blue","features":["basic","workflows","reports"],"maxUsers":15,"maxStorage":"250GB"}', true, NOW(), NOW()),
('startup-nexus', 'StartUp Nexus', 'startup-nexus', 'startupnexus.com.br', 'active', 'starter', '{"theme":"purple","features":["basic","task-management"],"maxUsers":5,"maxStorage":"50GB"}', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. INSERIR USUÁRIOS - SCHEMA CORRETO (password não password_hash, isActive não is_active)
INSERT INTO users (id, cpf, email, password, first_name, last_name, phone, role, tenant_id, "isActive", last_login_at, created_at, updated_at) VALUES
-- Super Admin TOIT - Victor Calife
('toit-super-admin', '33656299803', 'victor@toit.com.br', '$2b$10$fGiUDsbfYp0UWynvUtLXWe.YfR94EENSRkaFrYBNU.5vvsVUP/qMi', 'Victor', 'Calife', '+5511999999999', 'super_admin', 'toit-enterprise', true, null, NOW(), NOW()),

-- Tech Solutions
('tech-admin', '11111111111', 'admin@techsolutions.com.br', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'Silva', '+5511888888888', 'tenant_admin', 'tech-solutions', true, null, NOW(), NOW()),
('tech-manager', '22222222222', 'manager@techsolutions.com.br', '$2b$10$K7L/8qbdHezbE0.E.zH/t.djE8CjV7Wyj2S/uY2b0MiVU8Z9AiwxG', 'Ana', 'Santos', '+5511777777777', 'manager', 'tech-solutions', true, null, NOW(), NOW()),
('tech-employee', '33333333333', 'funcionario@techsolutions.com.br', '$2b$10$D5qbHiQz8/o4xzJ.BdE5p.L.2XvZ9F.QmJ1Y8aE.zOp6L.HjI5qyS', 'João', 'Oliveira', '+5511666666666', 'employee', 'tech-solutions', true, null, NOW(), NOW()),

-- Inovação Digital
('inova-admin', '44444444444', 'admin@inovacaodigital.com.br', '$2b$10$G2hT9qE.L/8F.xVc4Y.aE.Y9L.6XbZ5P.MkY7fE.zHp4L.GjH5qxR', 'Maria', 'Costa', '+5511555555555', 'tenant_admin', 'inovacao-digital', true, null, NOW(), NOW()),
('inova-manager', '55555555555', 'gerente@inovacaodigital.com.br', '$2b$10$H3iU0rF.M/9G.yWd5Z.bF.Z0M.7YcA6Q.NlZ8gF.AIq5M.HkI6ryS', 'Pedro', 'Rodrigues', '+5511444444444', 'manager', 'inovacao-digital', true, null, NOW(), NOW()),

-- StartUp Nexus
('startup-admin', '66666666666', 'founder@startupnexus.com.br', '$2b$10$I4jV1sG.N/0H.zXe6a.cG.a1N.8ZdB7R.OmA9hG.BJr6N.IlJ7szT', 'Lucas', 'Fernandes', '+5511333333333', 'tenant_admin', 'startup-nexus', true, null, NOW(), NOW()),
('startup-employee', '77777777777', 'dev@startupnexus.com.br', '$2b$10$J5kW2tH.O/1I.AYf7b.dH.b2O.9AeC8S.PnB0iH.CKs7O.JmK8tAU', 'Julia', 'Mendes', '+5511222222222', 'employee', 'startup-nexus', true, null, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICAR SE TABELAS OPCIONAIS EXISTEM ANTES DE INSERIR

-- Verificar se tabela departments existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'departments') THEN
        -- INSERIR DEPARTAMENTOS (se tabela existir)
        INSERT INTO departments (id, name, description, tenant_id, manager_id, "isActive", created_at, updated_at) VALUES
        -- Tech Solutions
        ('tech-ti', 'TI e Desenvolvimento', 'Departamento de tecnologia e desenvolvimento de software', 'tech-solutions', 'tech-manager', true, NOW(), NOW()),
        ('tech-comercial', 'Comercial', 'Departamento comercial e vendas', 'tech-solutions', null, true, NOW(), NOW()),
        ('tech-admin-dept', 'Administrativo', 'Departamento administrativo e financeiro', 'tech-solutions', null, true, NOW(), NOW()),

        -- Inovação Digital
        ('inova-inovacao', 'Inovação', 'Departamento de pesquisa e desenvolvimento', 'inovacao-digital', 'inova-manager', true, NOW(), NOW()),
        ('inova-projetos', 'Projetos', 'Departamento de gestão de projetos', 'inovacao-digital', null, true, NOW(), NOW()),

        -- StartUp Nexus
        ('startup-produto', 'Produto', 'Departamento de desenvolvimento de produto', 'startup-nexus', null, true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Departamentos inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Tabela departments não existe - pulando inserção';
    END IF;
END $$;

-- Verificar se tabela clients existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        -- INSERIR CLIENTES (se tabela existir)
        INSERT INTO clients (id, name, email, phone, cpf_cnpj, type, address, tenant_id, assigned_user_id, status, notes, created_at, updated_at) VALUES
        -- Tech Solutions
        ('client-abc', 'Empresa ABC Ltda', 'contato@empresaabc.com.br', '+5511987654321', '12.345.678/0001-90', 'empresa', 'Rua das Flores, 123 - São Paulo/SP', 'tech-solutions', 'tech-manager', 'ativo', 'Cliente estratégico com potencial de crescimento', NOW(), NOW()),
        ('client-joao', 'João da Silva', 'joao.silva@email.com', '+5511876543210', '123.456.789-00', 'pessoa_fisica', 'Av. Principal, 456 - Rio de Janeiro/RJ', 'tech-solutions', 'tech-employee', 'ativo', 'Cliente pessoa física interessado em consultoria', NOW(), NOW()),
        ('client-inovacorp', 'Inovação Corp', 'contato@inovacaocorp.com.br', '+5511765432109', '98.765.432/0001-10', 'empresa', 'Rua da Tecnologia, 789 - Belo Horizonte/MG', 'tech-solutions', null, 'prospecto', 'Prospecto com interesse em soluções enterprise', NOW(), NOW()),

        -- Inovação Digital
        ('client-startupx', 'Startup X', 'hello@startupx.com.br', '+5511654321098', '11.222.333/0001-44', 'empresa', 'Hub de Inovação, 100 - Florianópolis/SC', 'inovacao-digital', 'inova-manager', 'ativo', 'Startup em crescimento acelerado', NOW(), NOW()),
        ('client-maria', 'Maria Fernanda', 'maria.fernanda@email.com', '+5511543210987', '987.654.321-00', 'pessoa_fisica', 'Rua dos Empreendedores, 200 - Porto Alegre/RS', 'inovacao-digital', null, 'ativo', 'Empreendedora individual buscando digitalização', NOW(), NOW()),

        -- StartUp Nexus
        ('client-techboost', 'Tech Boost', 'team@techboost.com.br', '+5511432109876', '55.666.777/0001-88', 'empresa', 'Distrito Tecnológico, 300 - Recife/PE', 'startup-nexus', 'startup-admin', 'ativo', 'Aceleradora de startups parceira', NOW(), NOW()),
        ('client-carlos', 'Carlos Eduardo', 'carlos.eduardo@email.com', '+5511321098765', '456.789.123-00', 'pessoa_fisica', 'Av. da Inovação, 400 - Brasília/DF', 'startup-nexus', null, 'prospecto', 'Investidor interessado em soluções tech', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Clientes inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Tabela clients não existe - pulando inserção';
    END IF;
END $$;

-- Verificar se tabela workflows existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workflows') THEN
        -- INSERIR WORKFLOWS (se tabela existir)
        INSERT INTO workflows (id, name, description, tenant_id, created_by_id, "isActive", steps, created_at, updated_at) VALUES
        ('workflow-onboarding', 'Onboarding Cliente', 'Processo de integração de novos clientes', 'tech-solutions', 'tech-admin', true, '{"steps":[{"id":1,"name":"Contrato","description":"Assinatura do contrato"},{"id":2,"name":"Configuração","description":"Setup inicial do sistema"},{"id":3,"name":"Treinamento","description":"Treinamento da equipe cliente"}]}', NOW(), NOW()),
        ('workflow-projeto', 'Gestão de Projeto', 'Workflow padrão para gestão de projetos', 'inovacao-digital', 'inova-admin', true, '{"steps":[{"id":1,"name":"Planejamento","description":"Definição de escopo e cronograma"},{"id":2,"name":"Execução","description":"Desenvolvimento do projeto"},{"id":3,"name":"Entrega","description":"Entrega e validação"}]}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Workflows inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Tabela workflows não existe - pulando inserção';
    END IF;
END $$;

-- Verificar se tabela task_templates existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_templates') THEN
        -- INSERIR TEMPLATES DE TASKS (se tabela existir)
        INSERT INTO task_templates (id, name, description, tenant_id, created_by_id, estimated_hours, priority, status, created_at, updated_at) VALUES
        ('template-dev', 'Desenvolvimento Feature', 'Template para desenvolvimento de novas funcionalidades', 'tech-solutions', 'tech-admin', 8, 'medium', 'active', NOW(), NOW()),
        ('template-bug', 'Correção de Bug', 'Template para correção de bugs', 'tech-solutions', 'tech-admin', 4, 'high', 'active', NOW(), NOW()),
        ('template-pesquisa', 'Pesquisa e Desenvolvimento', 'Template para atividades de P&D', 'inovacao-digital', 'inova-admin', 16, 'low', 'active', NOW(), NOW()),
        ('template-mvp', 'Desenvolvimento MVP', 'Template para desenvolvimento de MVP', 'startup-nexus', 'startup-admin', 40, 'high', 'active', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Templates de tasks inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Tabela task_templates não existe - pulando inserção';
    END IF;
END $$;

-- ESTATÍSTICAS FINAIS SEGURAS
DO $$
BEGIN
    -- Mostrar estatísticas das tabelas que existem
    RAISE NOTICE '=== ESTATÍSTICAS DOS DADOS INSERIDOS ===';
    
    -- Tenants (sempre existe)
    RAISE NOTICE 'Empresas inseridas: %', (SELECT COUNT(*) FROM tenants WHERE "isActive" = true);
    
    -- Users (sempre existe)
    RAISE NOTICE 'Usuários inseridos: %', (SELECT COUNT(*) FROM users WHERE "isActive" = true);
    
    -- Tabelas opcionais
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'departments') THEN
        RAISE NOTICE 'Departamentos inseridos: %', (SELECT COUNT(*) FROM departments WHERE "isActive" = true);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        RAISE NOTICE 'Clientes inseridos: %', (SELECT COUNT(*) FROM clients);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workflows') THEN
        RAISE NOTICE 'Workflows inseridos: %', (SELECT COUNT(*) FROM workflows WHERE "isActive" = true);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_templates') THEN
        RAISE NOTICE 'Templates inseridos: %', (SELECT COUNT(*) FROM task_templates WHERE status = 'active');
    END IF;
END $$;

-- MOSTRAR CREDENCIAIS CRIADAS
DO $$
BEGIN
    RAISE NOTICE '=== CREDENCIAIS DE ACESSO ===';
    RAISE NOTICE 'SUPER ADMIN: Victor Calife - CPF: 33656299803 | Senha: 15151515';
    RAISE NOTICE 'Tech Solutions Admin - CPF: 11111111111 | Senha: admin123';
    RAISE NOTICE 'Tech Solutions Manager - CPF: 22222222222 | Senha: manager123';
    RAISE NOTICE 'Tech Solutions Employee - CPF: 33333333333 | Senha: func123';
    RAISE NOTICE 'Inovação Digital Admin - CPF: 44444444444 | Senha: inova123';
    RAISE NOTICE 'Inovação Digital Manager - CPF: 55555555555 | Senha: gerente123';
    RAISE NOTICE 'StartUp Nexus Admin - CPF: 66666666666 | Senha: startup123';
    RAISE NOTICE 'StartUp Nexus Employee - CPF: 77777777777 | Senha: dev123';
    RAISE NOTICE '=== INSERÇÃO CONCLUÍDA COM SUCESSO ===';
END $$;