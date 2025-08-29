-- ====================================================================
-- MIGRAÇÃO CRÍTICA: Adicionar coluna 'data' à tabela user_sessions
-- ====================================================================
-- Data: 2025-08-29
-- Descrição: Resolve erro "column data of relation user_sessions does not exist"
-- Prioridade: CRÍTICA - Sistema de login não funciona sem esta coluna

-- Verificar se a tabela user_sessions existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
    ) THEN
        RAISE EXCEPTION 'ERRO: Tabela user_sessions não existe! Execute primeiro o schema completo.';
    END IF;
END $$;

-- Adicionar coluna data se não existir
DO $$
BEGIN
    -- Verificar se a coluna 'data' já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
    ) THEN
        -- Adicionar a coluna data do tipo JSON
        ALTER TABLE user_sessions ADD COLUMN data JSON DEFAULT '{}';
        
        -- Criar índices se não existirem
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'user_sessions' 
            AND indexname = 'idx_user_sessions_user_id'
        ) THEN
            CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
        END IF;
        
        RAISE NOTICE '✅ Coluna data adicionada à tabela user_sessions com sucesso!';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna data já existe na tabela user_sessions.';
    END IF;
END $$;

-- Verificar a estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- Verificar se a migração foi bem-sucedida
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
    ) THEN
        RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '✅ Sistema de login agora deve funcionar corretamente.';
    ELSE
        RAISE EXCEPTION '❌ FALHA NA MIGRAÇÃO: Coluna data não foi criada!';
    END IF;
END $$;
