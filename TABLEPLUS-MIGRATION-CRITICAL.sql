-- ====================================================================
-- 🚨 MIGRAÇÃO CRÍTICA PARA TABLEPLUS - EXECUÇÃO IMEDIATA
-- ====================================================================
-- Data: 2025-08-29
-- Problema: column "data" of relation "user_sessions" does not exist
-- Impacto: Sistema de login quebrado (erro 500)
-- Solução: Adicionar coluna 'data' à tabela user_sessions
-- ====================================================================

-- PASSO 1: Verificar conexão e versão do PostgreSQL
SELECT 
    'CONEXÃO ESTABELECIDA' as status,
    NOW() as timestamp,
    version() as postgresql_version;

-- PASSO 2: Verificar se a tabela user_sessions existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
    ) THEN
        RAISE EXCEPTION '❌ ERRO CRÍTICO: Tabela user_sessions não existe! Verifique o schema do banco.';
    ELSE
        RAISE NOTICE '✅ Tabela user_sessions encontrada';
    END IF;
END $$;

-- PASSO 3: Mostrar estrutura atual da tabela
SELECT 
    '📊 ESTRUTURA ATUAL DA TABELA user_sessions' as info;

SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- PASSO 4: Verificar se a coluna 'data' já existe
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE '✅ Coluna data já existe - migração não necessária';
    ELSE
        RAISE NOTICE '🚨 Coluna data NÃO EXISTE - executando migração...';
        
        -- EXECUTAR A MIGRAÇÃO CRÍTICA
        ALTER TABLE user_sessions 
        ADD COLUMN data JSON DEFAULT '{}'::json;
        
        RAISE NOTICE '✅ Coluna data adicionada com sucesso!';
    END IF;
END $$;

-- PASSO 5: Criar índices para performance (se não existirem)
DO $$
BEGIN
    -- Índice para user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_sessions' 
        AND indexname = 'idx_user_sessions_user_id'
    ) THEN
        CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
        RAISE NOTICE '✅ Índice idx_user_sessions_user_id criado';
    ELSE
        RAISE NOTICE 'ℹ️ Índice idx_user_sessions_user_id já existe';
    END IF;
    
    -- Índice para expires_at (limpeza de sessões expiradas)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_sessions' 
        AND indexname = 'idx_user_sessions_expires_at'
    ) THEN
        CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
        RAISE NOTICE '✅ Índice idx_user_sessions_expires_at criado';
    ELSE
        RAISE NOTICE 'ℹ️ Índice idx_user_sessions_expires_at já existe';
    END IF;
END $$;

-- PASSO 6: Verificar estrutura FINAL da tabela
SELECT 
    '📊 ESTRUTURA FINAL DA TABELA user_sessions' as info;

SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- PASSO 7: Verificar índices criados
SELECT 
    '📋 ÍNDICES DA TABELA user_sessions' as info;

SELECT 
    indexname as "Nome do Índice",
    indexdef as "Definição"
FROM pg_indexes 
WHERE tablename = 'user_sessions'
ORDER BY indexname;

-- PASSO 8: Verificação final de sucesso
DO $$
DECLARE
    has_data_column BOOLEAN;
    column_count INTEGER;
BEGIN
    -- Verificar se a coluna data existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
    ) INTO has_data_column;
    
    -- Contar total de colunas
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'user_sessions'
    INTO column_count;
    
    IF has_data_column THEN
        RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '✅ Coluna data está presente na tabela user_sessions';
        RAISE NOTICE '📊 Total de colunas: %', column_count;
        RAISE NOTICE '🔄 PRÓXIMO PASSO: Reinicie o serviço backend no Railway';
        RAISE NOTICE '✅ Sistema de login deve funcionar após o restart';
    ELSE
        RAISE EXCEPTION '❌ FALHA NA MIGRAÇÃO: Coluna data não foi criada!';
    END IF;
END $$;

-- PASSO 9: Mensagem final
SELECT 
    '🎉 MIGRAÇÃO EXECUTADA COM SUCESSO!' as status,
    NOW() as executed_at,
    'Sistema de login deve funcionar após restart do backend' as next_step;

-- ====================================================================
-- INSTRUÇÕES PARA TABLEPLUS:
-- ====================================================================
-- 1. Conecte-se ao banco PostgreSQL do Railway
-- 2. Cole e execute este script completo
-- 3. Verifique se todas as mensagens de sucesso aparecem
-- 4. Reinicie o serviço backend no Railway
-- 5. Teste o login no frontend
-- ====================================================================
