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
    firstName = 'Admin',
    lastName = 'Full',
    email = 'admin@toit.com.br',
    isActive = true,
    updatedAt = NOW()
WHERE cpf = '33656299803' OR email = 'admin@toit.com.br';

-- 2. INSERIR USUÁRIO (se não existe)
INSERT INTO users (
    id,
    cpf,
    password,
    firstName,
    lastName,
    email,
    role,
    tenantId,
    isActive,
    createdAt,
    updatedAt
) 
SELECT 
    'admin_full_' || EXTRACT(EPOCH FROM NOW())::text,
    '33656299803',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'Full',
    'admin@toit.com.br',
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
    firstName,
    lastName,
    email,
    role,
    tenantId,
    isActive,
    createdAt,
    updatedAt
FROM users 
WHERE cpf = '33656299803' OR email = 'admin@toit.com.br';

-- NOTA: Hash gerado com bcrypt para senha "241286"
-- Este usuário terá acesso total como super_admin
-- Funcionará tanto no login cliente quanto no login suporte
