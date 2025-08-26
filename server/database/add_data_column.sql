-- Migração para adicionar coluna data à tabela user_sessions
-- Verifica se a coluna já existe antes de adicionar
DO $$
BEGIN
    -- Verifica se a coluna 'data' já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
    ) THEN
        -- Adiciona a coluna data do tipo JSON
        ALTER TABLE user_sessions ADD COLUMN data JSON;
        
        -- Cria índice para user_id se não existir
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'user_sessions' 
            AND indexname = 'idx_user_sessions_user_id'
        ) THEN
            CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
        END IF;
        
        -- Cria índice para session_token se não existir
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'user_sessions' 
            AND indexname = 'idx_user_sessions_session_token'
        ) THEN
            CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
        END IF;
        
        RAISE NOTICE 'Coluna data adicionada à tabela user_sessions com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna data já existe na tabela user_sessions.';
    END IF;
END $$;

-- Verifica a estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;