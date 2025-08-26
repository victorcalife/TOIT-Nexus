-- Migração 003: Adicionar coluna 'data' à tabela user_sessions
-- Data: 2025-01-16
-- Descrição: Adiciona coluna JSON 'data' para armazenar informações da sessão

-- UP: Adicionar coluna
ALTER TABLE user_sessions ADD COLUMN data JSON;

-- Criar índice para melhor performance
CREATE INDEX idx_user_sessions_data ON user_sessions(user_id, (JSON_EXTRACT(data, '$.accessToken')));

-- DOWN: Remover coluna (para rollback)
-- ALTER TABLE user_sessions DROP COLUMN data;
-- DROP INDEX idx_user_sessions_data ON user_sessions;

-- Verificar estrutura da tabela após migração
-- DESCRIBE user_sessions;