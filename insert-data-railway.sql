-- Script SQL para inserir dados de teste no TOIT NEXUS Railway
-- Baseado na estrutura real encontrada no DataBaseStructureAgo2025.sql

-- CRIAR ENUMS SE NÃO EXISTIREM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'employee');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
        CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'suspended');
    END IF;
END $$;

-- 1. CRIAR TABELA TENANTS SE NÃO EXISTIR (baseado no padrão Railway)
CREATE TABLE IF NOT EXISTS tenants (
    id varchar NOT NULL DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    domain varchar(255),
    logo varchar,
    settings jsonb,
    status tenant_status DEFAULT 'active',
    subscription_plan varchar(50) DEFAULT 'basic',
    subscription_expires_at timestamp,
    is_active bool DEFAULT true,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    PRIMARY KEY (id)
);

-- 2. CRIAR TABELA USERS SE NÃO EXISTIR (baseado no padrão Railway)
CREATE TABLE IF NOT EXISTS users (
    id varchar NOT NULL DEFAULT gen_random_uuid(),
    cpf varchar(11) UNIQUE NOT NULL,
    email varchar UNIQUE,
    password varchar NOT NULL,
    first_name varchar,
    last_name varchar,
    phone varchar,
    profile_image_url varchar,
    role user_role DEFAULT 'employee',
    tenant_id varchar,
    department_id varchar,
    is_active bool DEFAULT true,
    last_login_at timestamp,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    PRIMARY KEY (id)
);

-- 3. INSERIR TENANTS
INSERT INTO tenants (id, name, slug, domain, status, subscription_plan, settings, is_active, created_at, updated_at) VALUES
('toit-enterprise', 'TOIT Enterprise', 'toit', 'toit.com.br', 'active', 'enterprise', '{"theme":"dark","features":["all"],"maxUsers":null,"maxStorage":null}', true, now(), now()),
('tech-solutions', 'Tech Solutions Ltda', 'tech-solutions', 'techsolutions.com.br', 'active', 'business', '{"theme":"light","features":["workflows","reports","task-management"],"maxUsers":25,"maxStorage":"500GB"}', true, now(), now()),
('inovacao-digital', 'Inovação Digital', 'inovacao-digital', 'inovacaodigital.com.br', 'active', 'professional', '{"theme":"blue","features":["basic","workflows","reports"],"maxUsers":15,"maxStorage":"250GB"}', true, now(), now()),
('startup-nexus', 'StartUp Nexus', 'startup-nexus', 'startupnexus.com.br', 'active', 'starter', '{"theme":"purple","features":["basic","task-management"],"maxUsers":5,"maxStorage":"50GB"}', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 4. INSERIR USERS
INSERT INTO users (id, cpf, email, password, first_name, last_name, phone, role, tenant_id, is_active, last_login_at, created_at, updated_at) VALUES
-- Super Admin TOIT - Victor Calife
('toit-super-admin', '33656299803', 'victor@toit.com.br', '$2b$10$fGiUDsbfYp0UWynvUtLXWe.YfR94EENSRkaFrYBNU.5vvsVUP/qMi', 'Victor', 'Calife', '+5511999999999', 'super_admin', 'toit-enterprise', true, null, now(), now()),

-- Tech Solutions
('tech-admin', '11111111111', 'admin@techsolutions.com.br', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'Silva', '+5511888888888', 'tenant_admin', 'tech-solutions', true, null, now(), now()),
('tech-manager', '22222222222', 'manager@techsolutions.com.br', '$2b$10$K7L/8qbdHezbE0.E.zH/t.djE8CjV7Wyj2S/uY2b0MiVU8Z9AiwxG', 'Ana', 'Santos', '+5511777777777', 'manager', 'tech-solutions', true, null, now(), now()),
('tech-employee', '33333333333', 'funcionario@techsolutions.com.br', '$2b$10$D5qbHiQz8/o4xzJ.BdE5p.L.2XvZ9F.QmJ1Y8aE.zOp6L.HjI5qyS', 'João', 'Oliveira', '+5511666666666', 'employee', 'tech-solutions', true, null, now(), now()),

-- Inovação Digital
('inova-admin', '44444444444', 'admin@inovacaodigital.com.br', '$2b$10$G2hT9qE.L/8F.xVc4Y.aE.Y9L.6XbZ5P.MkY7fE.zHp4L.GjH5qxR', 'Maria', 'Costa', '+5511555555555', 'tenant_admin', 'inovacao-digital', true, null, now(), now()),
('inova-manager', '55555555555', 'gerente@inovacaodigital.com.br', '$2b$10$H3iU0rF.M/9G.yWd5Z.bF.Z0M.7YcA6Q.NlZ8gF.AIq5M.HkI6ryS', 'Pedro', 'Rodrigues', '+5511444444444', 'manager', 'inovacao-digital', true, null, now(), now()),

-- StartUp Nexus
('startup-admin', '66666666666', 'founder@startupnexus.com.br', '$2b$10$I4jV1sG.N/0H.zXe6a.cG.a1N.8ZdB7R.OmA9hG.BJr6N.IlJ7szT', 'Lucas', 'Fernandes', '+5511333333333', 'tenant_admin', 'startup-nexus', true, null, now(), now()),
('startup-employee', '77777777777', 'dev@startupnexus.com.br', '$2b$10$J5kW2tH.O/1I.AYf7b.dH.b2O.9AeC8S.PnB0iH.CKs7O.JmK8tAU', 'Julia', 'Mendes', '+5511222222222', 'employee', 'startup-nexus', true, null, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. INSERIR DEPARTAMENTOS (usando tabela existente)
INSERT INTO departments (id, tenant_id, name, type, description, is_active, created_at, updated_at) VALUES
-- Tech Solutions
('tech-ti', 'tech-solutions', 'TI e Desenvolvimento', 'it', 'Departamento de tecnologia e desenvolvimento de software', true, now(), now()),
('tech-comercial', 'tech-solutions', 'Comercial', 'sales', 'Departamento comercial e vendas', true, now(), now()),
('tech-admin-dept', 'tech-solutions', 'Administrativo', 'finance', 'Departamento administrativo e financeiro', true, now(), now()),

-- Inovação Digital
('inova-inovacao', 'inovacao-digital', 'Inovação', 'custom', 'Departamento de pesquisa e desenvolvimento', true, now(), now()),
('inova-projetos', 'inovacao-digital', 'Projetos', 'operations', 'Departamento de gestão de projetos', true, now(), now()),

-- StartUp Nexus
('startup-produto', 'startup-nexus', 'Produto', 'custom', 'Departamento de desenvolvimento de produto', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 6. INSERIR CLIENTES (usando tabela existente)
INSERT INTO clients (id, tenant_id, name, email, phone, current_investment, risk_profile, is_active, created_at, updated_at) VALUES
-- Tech Solutions
('client-abc', 'tech-solutions', 'Empresa ABC Ltda', 'contato@empresaabc.com.br', '+5511987654321', 250000.00, 'moderate', true, now(), now()),
('client-joao', 'tech-solutions', 'João da Silva', 'joao.silva@email.com', '+5511876543210', 50000.00, 'conservative', true, now(), now()),
('client-inovacorp', 'tech-solutions', 'Inovação Corp', 'contato@inovacaocorp.com.br', '+5511765432109', 500000.00, 'aggressive', true, now(), now()),

-- Inovação Digital
('client-startupx', 'inovacao-digital', 'Startup X', 'hello@startupx.com.br', '+5511654321098', 100000.00, 'aggressive', true, now(), now()),
('client-maria', 'inovacao-digital', 'Maria Fernanda', 'maria.fernanda@email.com', '+5511543210987', 25000.00, 'conservative', true, now(), now()),

-- StartUp Nexus
('client-techboost', 'startup-nexus', 'Tech Boost', 'team@techboost.com.br', '+5511432109876', 75000.00, 'moderate', true, now(), now()),
('client-carlos', 'startup-nexus', 'Carlos Eduardo', 'carlos.eduardo@email.com', '+5511321098765', 150000.00, 'moderate', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. ESTATÍSTICAS FINAIS
DO $$
BEGIN
    RAISE NOTICE '=== DADOS INSERIDOS COM SUCESSO ===';
    RAISE NOTICE 'Tenants: %', (SELECT COUNT(*) FROM tenants WHERE is_active = true);
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users WHERE is_active = true);
    RAISE NOTICE 'Departments: %', (SELECT COUNT(*) FROM departments WHERE is_active = true);
    RAISE NOTICE 'Clients: %', (SELECT COUNT(*) FROM clients WHERE is_active = true);
    
    RAISE NOTICE '=== CREDENCIAIS DE ACESSO ===';
    RAISE NOTICE 'SUPER ADMIN: Victor Calife - CPF: 33656299803 | Senha: 15151515';
    RAISE NOTICE 'Tech Solutions Admin - CPF: 11111111111 | Senha: admin123';
    RAISE NOTICE 'Tech Solutions Manager - CPF: 22222222222 | Senha: manager123';
    RAISE NOTICE 'Tech Solutions Employee - CPF: 33333333333 | Senha: func123';
    RAISE NOTICE 'Inovação Digital Admin - CPF: 44444444444 | Senha: inova123';
    RAISE NOTICE 'Inovação Digital Manager - CPF: 55555555555 | Senha: gerente123';
    RAISE NOTICE 'StartUp Nexus Admin - CPF: 66666666666 | Senha: startup123';
    RAISE NOTICE 'StartUp Nexus Employee - CPF: 77777777777 | Senha: dev123';
    RAISE NOTICE '=== INSERÇÃO COMPLETA ===';
END $$;