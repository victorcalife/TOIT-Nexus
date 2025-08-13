-- QUERY BÁSICA PARA ATUALIZAR CREDENCIAIS DO ADMIN FULL
-- CPF: 33656299803
-- Senha: 241286

-- PRIMEIRO: VERIFICAR ESTRUTURA DA TABELA
\d users;

-- SEGUNDO: VERIFICAR SE USUÁRIO JÁ EXISTE
SELECT * FROM users WHERE cpf = '33656299803' OR email = 'admin@toit.com.br';

-- TERCEIRO: INSERIR USUÁRIO (ajuste os campos conforme necessário)
INSERT INTO users (
    cpf,
    password,
    first_name,
    last_name,
    email,
    role
) VALUES (
    '33656299803',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'Full',
    'admin@toit.com.br',
    'super_admin'
) ON CONFLICT (cpf) DO UPDATE SET
    password = EXCLUDED.password,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();

-- VERIFICAR RESULTADO
SELECT 
    id,
    cpf,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at
FROM users 
WHERE cpf = '33656299803';

-- HASHES DE SENHA PARA REFERÊNCIA:
-- Senha "241286" = $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Senha "admin123" = $2b$10$fGiUDsbfYp0UWynvUtLXWe.YfR94EENSRkaFrYBNU.5vvsVUP/qMi
