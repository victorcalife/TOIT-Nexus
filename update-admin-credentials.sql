-- QUERY PARA ATUALIZAR CREDENCIAIS DO ADMIN FULL
-- CPF: 33656299803
-- Senha: 241286
-- Hash bcrypt da senha: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- 1. ATUALIZAR USUÁRIO EXISTENTE (se já existe)
UPDATE users
SET
    cpf = '33656299803',
    password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'super_admin',
    first_name = 'Admin',
    last_name = 'Full',
    email = 'admin@toit.com.br',
    is_active = true,
    updated_at = NOW()
WHERE cpf = '33656299803' OR email = 'admin@toit.com.br';

-- 2. INSERIR USUÁRIO (se não existe)
INSERT INTO users (
    id,
    cpf,
    password,
    first_name,
    last_name,
    email,
    role,
    tenant_id,
    is_active,
    created_at,
    updated_at
)
SELECT
    'admin_full_' || EXTRACT(EPOCH FROM NOW())::text,
    '33656299803',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Victor',
    'Calife',
    'victor@toit.com.br',
    'super_admin',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users
    WHERE cpf = '33656299803' OR email = 'admin@toit.com.br'
);

-- 3. VERIFICAR SE FOI CRIADO/ATUALIZADO
SELECT
    id,
    cpf,
    first_name,
    last_name,
    email,
    role,
    tenant_id,
    is_active,
    created_at,
    updated_at
FROM users
WHERE cpf = '33656299803' OR email = 'admin@toit.com.br';

-- NOTA: Hash gerado com bcrypt para senha "241286"
-- Este usuário terá acesso total como super_admin
-- Funcionará tanto no login cliente quanto no login suporte
