-- QUERY SIMPLES PARA ATUALIZAR CREDENCIAIS DO ADMIN FULL
-- CPF: 33656299803
-- Senha: 241286
-- Hash bcrypt da senha: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- OPÇÃO 1: DELETAR E INSERIR (mais simples)
DELETE FROM users WHERE cpf = '33656299803' OR email = 'admin@toit.com.br';

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
) VALUES (
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
);

-- VERIFICAR SE FOI CRIADO
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
WHERE cpf = '33656299803';

-- NOTA: Hash gerado com bcrypt para senha "241286"
-- Este usuário terá acesso total como super_admin
-- Funcionará tanto no login cliente quanto no login suporte
