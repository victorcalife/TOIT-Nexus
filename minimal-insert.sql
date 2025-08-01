-- Script MÍNIMO para inserir dados básicos
-- Insere apenas colunas obrigatórias que certamente existem

-- 1. INSERIR EMPRESAS - APENAS COLUNAS BÁSICAS
INSERT INTO tenants (id, name, slug, status) VALUES
('toit-enterprise', 'TOIT Enterprise', 'toit', 'active'),
('tech-solutions', 'Tech Solutions Ltda', 'tech-solutions', 'active'),
('inovacao-digital', 'Inovação Digital', 'inovacao-digital', 'active'),
('startup-nexus', 'StartUp Nexus', 'startup-nexus', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. INSERIR USUÁRIOS - APENAS COLUNAS BÁSICAS  
INSERT INTO users (id, cpf, password, first_name, last_name, role) VALUES
-- Super Admin Victor
('toit-super-admin', '33656299803', '$2b$10$fGiUDsbfYp0UWynvUtLXWe.YfR94EENSRkaFrYBNU.5vvsVUP/qMi', 'Victor', 'Calife', 'super_admin'),

-- Tech Solutions
('tech-admin', '11111111111', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'Silva', 'tenant_admin'),
('tech-manager', '22222222222', '$2b$10$K7L/8qbdHezbE0.E.zH/t.djE8CjV7Wyj2S/uY2b0MiVU8Z9AiwxG', 'Ana', 'Santos', 'manager'),
('tech-employee', '33333333333', '$2b$10$D5qbHiQz8/o4xzJ.BdE5p.L.2XvZ9F.QmJ1Y8aE.zOp6L.HjI5qyS', 'João', 'Oliveira', 'employee'),

-- Inovação Digital
('inova-admin', '44444444444', '$2b$10$G2hT9qE.L/8F.xVc4Y.aE.Y9L.6XbZ5P.MkY7fE.zHp4L.GjH5qxR', 'Maria', 'Costa', 'tenant_admin'),
('inova-manager', '55555555555', '$2b$10$H3iU0rF.M/9G.yWd5Z.bF.Z0M.7YcA6Q.NlZ8gF.AIq5M.HkI6ryS', 'Pedro', 'Rodrigues', 'manager'),

-- StartUp Nexus
('startup-admin', '66666666666', '$2b$10$I4jV1sG.N/0H.zXe6a.cG.a1N.8ZdB7R.OmA9hG.BJr6N.IlJ7szT', 'Lucas', 'Fernandes', 'tenant_admin'),
('startup-employee', '77777777777', '$2b$10$J5kW2tH.O/1I.AYf7b.dH.b2O.9AeC8S.PnB0iH.CKs7O.JmK8tAU', 'Julia', 'Mendes', 'employee')
ON CONFLICT (id) DO NOTHING;

-- 3. CONTAR REGISTROS INSERIDOS
SELECT 'Tenants inseridos' as tabela, COUNT(*) as total FROM tenants
UNION ALL
SELECT 'Users inseridos' as tabela, COUNT(*) as total FROM users;

-- 4. MOSTRAR CREDENCIAIS
SELECT 
    'CREDENCIAIS DE ACESSO:' as info
UNION ALL
SELECT 'Victor Calife (Super Admin) - CPF: 33656299803 | Senha: 15151515'
UNION ALL
SELECT 'Carlos Silva (Tech Admin) - CPF: 11111111111 | Senha: admin123'
UNION ALL
SELECT 'Ana Santos (Tech Manager) - CPF: 22222222222 | Senha: manager123';