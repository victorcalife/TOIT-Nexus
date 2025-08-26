-- Migração 03: Adicionar coluna CPF à tabela users
-- Data: 2025-01-26
-- Descrição: Adiciona coluna CPF única à tabela users para suportar autenticação por CPF

-- UP Migration
-- Verificar se a coluna cpf já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='cpf') THEN
        ALTER TABLE users ADD COLUMN cpf VARCHAR(11) UNIQUE;
    END IF;
END $$;

-- Adicionar índice para performance (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cpf') THEN
        CREATE INDEX idx_cpf ON users(cpf);
    END IF;
END $$;

-- Adicionar campos adicionais para compatibilidade
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
END $$;

-- Tornar email opcional (pode ser NULL)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Contar registros
SELECT COUNT(*) as total_users FROM users;

-- DOWN Migration (para rollback)
-- ALTER TABLE users DROP COLUMN IF EXISTS cpf;
-- ALTER TABLE users DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS last_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS phone;
-- ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- DROP INDEX IF EXISTS idx_cpf;

SELECT 'Migração 03 executada com sucesso!' as status;