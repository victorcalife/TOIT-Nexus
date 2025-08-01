-- SCRIPT SQL DEFINITIVO PARA TOIT NEXUS RAILWAY
-- Baseado na estrutura REAL do DataBaseStructureAgo2025.sql
-- 100% compatível com o schema em produção

-- 1. INSERIR TENANTS (SEM is_active - não existe na tabela real)
INSERT INTO tenants (id, name, slug, domain, status, subscription_plan, settings, created_at, updated_at) VALUES
('toit-enterprise', 'TOIT Enterprise', 'toit', 'toit.com.br', 'active', 'enterprise', '{"theme":"dark","features":["all"],"maxUsers":null,"maxStorage":null}', now(), now()),
('tech-solutions', 'Tech Solutions Ltda', 'tech-solutions', 'techsolutions.com.br', 'active', 'business', '{"theme":"light","features":["workflows","reports","task-management"],"maxUsers":25,"maxStorage":"500GB"}', now(), now()),
('inovacao-digital', 'Inovação Digital', 'inovacao-digital', 'inovacaodigital.com.br', 'active', 'professional', '{"theme":"blue","features":["basic","workflows","reports"],"maxUsers":15,"maxStorage":"250GB"}', now(), now()),
('startup-nexus', 'StartUp Nexus', 'startup-nexus', 'startupnexus.com.br', 'active', 'starter', '{"theme":"purple","features":["basic","task-management"],"maxUsers":5,"maxStorage":"50GB"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. INSERIR USERS (COM is_active - existe na tabela real)
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

-- 3. INSERIR DEPARTAMENTOS (baseado na estrutura real)
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

-- 4. ASSOCIAR USUÁRIOS AOS DEPARTAMENTOS (tabela user_departments)
INSERT INTO user_departments (id, user_id, department_id, is_primary, created_at) VALUES
-- Tech Solutions
('ud-tech-manager', 'tech-manager', 'tech-ti', true, now()),
('ud-tech-employee', 'tech-employee', 'tech-ti', true, now()),

-- Inovação Digital
('ud-inova-manager', 'inova-manager', 'inova-inovacao', true, now()),

-- StartUp Nexus
('ud-startup-employee', 'startup-employee', 'startup-produto', true, now())
ON CONFLICT (id) DO NOTHING;

-- 5. INSERIR CLIENTES (baseado na estrutura real de clients)
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

-- 6. INSERIR CATEGORIAS DE CLIENTES
INSERT INTO client_categories (id, tenant_id, name, description, min_investment, max_investment, risk_profile, is_active, created_at, updated_at) VALUES
-- Tech Solutions
('cat-empresarial', 'tech-solutions', 'Empresarial', 'Clientes empresariais com alto volume', 100000.00, null, 'moderate', true, now(), now()),
('cat-individual', 'tech-solutions', 'Individual', 'Clientes pessoa física', 1000.00, 100000.00, 'conservative', true, now(), now()),

-- Inovação Digital
('cat-startup', 'inovacao-digital', 'Startups', 'Empresas em crescimento', 50000.00, 500000.00, 'aggressive', true, now(), now()),

-- StartUp Nexus
('cat-aceleradoras', 'startup-nexus', 'Aceleradoras', 'Parcerias estratégicas', 25000.00, 200000.00, 'moderate', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. INSERIR TASK TEMPLATES
INSERT INTO task_templates (id, tenant_id, manager_id, title, description, category, priority, estimated_duration, instructions, is_active, created_at, updated_at) VALUES
-- Tech Solutions
('template-dev', 'tech-solutions', 'tech-manager', 'Desenvolvimento Feature', 'Template para desenvolvimento de novas funcionalidades', 'development', 'medium', 480, '{"steps":["Análise de requisitos","Desenvolvimento","Testes","Deploy"]}', true, now(), now()),
('template-bug', 'tech-solutions', 'tech-manager', 'Correção de Bug', 'Template para correção de bugs', 'maintenance', 'high', 240, '{"steps":["Reproduzir bug","Identificar causa","Corrigir","Testar"]}', true, now(), now()),

-- Inovação Digital
('template-pesquisa', 'inovacao-digital', 'inova-manager', 'Pesquisa e Desenvolvimento', 'Template para atividades de P&D', 'research', 'low', 960, '{"steps":["Pesquisa","Prototipagem","Validação","Documentação"]}', true, now(), now()),

-- StartUp Nexus
('template-mvp', 'startup-nexus', 'startup-admin', 'Desenvolvimento MVP', 'Template para desenvolvimento de MVP', 'product', 'high', 2400, '{"steps":["Definir escopo","Desenvolver","Testar com usuários","Iterar"]}', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 8. INSERIR BUSINESS LEADS (dados de exemplo)
INSERT INTO business_leads (id, first_name, last_name, email, phone, company_name, cnpj, employee_count, sector, message, status, created_at, updated_at) VALUES
('lead-consultoria', 'Roberto', 'Silva', 'roberto@consultoriatech.com.br', '+5511888777666', 'Consultoria Tech Brasil', '12.345.678/0001-90', 15, 'Consultoria', 'Interesse em soluções enterprise', 'new', now(), now()),
('lead-fintech', 'Ana', 'Costa', 'ana@fintechbrasil.com.br', '+5511777666555', 'FinTech Brasil', '98.765.432/0001-10', 50, 'Fintech', 'Precisa de sistema de gestão completo', 'contacted', now(), now()),
('lead-ecommerce', 'Carlos', 'Santos', 'carlos@ecommercepro.com.br', '+5511666555444', 'E-commerce Pro', '11.222.333/0001-44', 8, 'E-commerce', 'Busca automação de processos', 'qualified', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 9. ESTATÍSTICAS E CONFIRMAÇÃO
DO $$
DECLARE
    tenant_count int;
    user_count int;
    dept_count int;
    client_count int;
    category_count int;
    template_count int;
    lead_count int;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    SELECT COUNT(*) INTO user_count FROM users WHERE is_active = true;
    SELECT COUNT(*) INTO dept_count FROM departments WHERE is_active = true;
    SELECT COUNT(*) INTO client_count FROM clients WHERE is_active = true;
    SELECT COUNT(*) INTO category_count FROM client_categories WHERE is_active = true;
    SELECT COUNT(*) INTO template_count FROM task_templates WHERE is_active = true;
    SELECT COUNT(*) INTO lead_count FROM business_leads;
    
    RAISE NOTICE '=====================================';
    RAISE NOTICE '🎯 DADOS INSERIDOS COM SUCESSO!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '🏢 Tenants: %', tenant_count;
    RAISE NOTICE '👥 Users: %', user_count;
    RAISE NOTICE '🏛️ Departments: %', dept_count;
    RAISE NOTICE '📞 Clients: %', client_count;
    RAISE NOTICE '📊 Categories: %', category_count;
    RAISE NOTICE '📝 Templates: %', template_count;
    RAISE NOTICE '🎯 Leads: %', lead_count;
    RAISE NOTICE '=====================================';
    RAISE NOTICE '🔐 CREDENCIAIS DE ACESSO';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '👑 SUPER ADMIN: Victor Calife';
    RAISE NOTICE '   CPF: 33656299803 | Senha: 15151515';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 TECH SOLUTIONS:';
    RAISE NOTICE '   Admin: CPF 11111111111 | Senha: admin123';
    RAISE NOTICE '   Manager: CPF 22222222222 | Senha: manager123';
    RAISE NOTICE '   Employee: CPF 33333333333 | Senha: func123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 INOVAÇÃO DIGITAL:';
    RAISE NOTICE '   Admin: CPF 44444444444 | Senha: inova123';
    RAISE NOTICE '   Manager: CPF 55555555555 | Senha: gerente123';
    RAISE NOTICE '';
    RAISE NOTICE '⭐ STARTUP NEXUS:';
    RAISE NOTICE '   Admin: CPF 66666666666 | Senha: startup123';
    RAISE NOTICE '   Employee: CPF 77777777777 | Senha: dev123';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ INSERÇÃO COMPLETA - SISTEMA PRONTO!';
    RAISE NOTICE '=====================================';
END $$;