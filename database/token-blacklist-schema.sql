/**
 * SCHEMA PARA BLACKLIST DE TOKENS JWT
 * Tabela para gerenciar tokens revogados e sessões
 */

-- ====================================================================
-- TABELA: TOKEN_BLACKLIST
-- ====================================================================
CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 hash do token
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(50) DEFAULT 'logout', -- logout, security_logout, password_change, etc.
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_token_blacklist_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user ON token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_created ON token_blacklist(created_at);

-- ====================================================================
-- TABELA: ACTIVE_SESSIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices para sessões ativas
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_sessions_activity ON active_sessions(last_activity);

-- ====================================================================
-- TABELA: LOGIN_ATTEMPTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- email ou CPF
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tentativas de login
CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);

-- ====================================================================
-- FUNÇÃO: LIMPEZA AUTOMÁTICA DE TOKENS EXPIRADOS
-- ====================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Limpar tokens expirados da blacklist
    DELETE FROM token_blacklist WHERE expires_at <= NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Limpar sessões expiradas
    DELETE FROM active_sessions WHERE expires_at <= NOW();
    
    -- Limpar tentativas de login antigas (mais de 30 dias)
    DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- TRIGGER: ATUALIZAR ÚLTIMA ATIVIDADE
-- ====================================================================
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE active_sessions 
    SET last_activity = NOW() 
    WHERE token_hash = NEW.token_hash;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- VIEWS ÚTEIS
-- ====================================================================

-- View para sessões ativas por usuário
CREATE OR REPLACE VIEW user_active_sessions AS
SELECT 
    u.id as user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.email,
    COUNT(s.id) as active_sessions,
    MAX(s.last_activity) as last_activity,
    ARRAY_AGG(
        json_build_object(
            'id', s.id,
            'ip_address', s.ip_address,
            'user_agent', s.user_agent,
            'created_at', s.created_at,
            'last_activity', s.last_activity
        )
    ) as sessions
FROM users u
LEFT JOIN active_sessions s ON u.id = s.user_id AND s.expires_at > NOW()
GROUP BY u.id, u.first_name, u.last_name, u.email;

-- View para estatísticas de login
CREATE OR REPLACE VIEW login_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN success THEN 1 END) as successful_logins,
    COUNT(CASE WHEN NOT success THEN 1 END) as failed_attempts,
    COUNT(DISTINCT identifier) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips
FROM login_attempts
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View para tokens na blacklist por usuário
CREATE OR REPLACE VIEW blacklisted_tokens_summary AS
SELECT 
    u.id as user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.email,
    COUNT(tb.id) as blacklisted_tokens,
    MAX(tb.created_at) as last_blacklist,
    ARRAY_AGG(DISTINCT tb.reason) as reasons
FROM users u
LEFT JOIN token_blacklist tb ON u.id = tb.user_id AND tb.expires_at > NOW()
GROUP BY u.id, u.first_name, u.last_name, u.email
HAVING COUNT(tb.id) > 0
ORDER BY blacklisted_tokens DESC;

-- ====================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON TABLE token_blacklist IS 'Armazena tokens JWT revogados para prevenir reutilização';
COMMENT ON TABLE active_sessions IS 'Rastreia sessões ativas de usuários para monitoramento de segurança';
COMMENT ON TABLE login_attempts IS 'Log de tentativas de login para análise de segurança';

COMMENT ON COLUMN token_blacklist.token_hash IS 'Hash SHA256 do token JWT para armazenamento seguro';
COMMENT ON COLUMN token_blacklist.reason IS 'Motivo da revogação: logout, security_logout, password_change, etc.';
COMMENT ON COLUMN active_sessions.device_info IS 'Informações do dispositivo em formato JSON';
COMMENT ON COLUMN login_attempts.failure_reason IS 'Motivo da falha: invalid_credentials, account_locked, etc.';

-- ====================================================================
-- DADOS INICIAIS E CONFIGURAÇÕES
-- ====================================================================

-- Configurar limpeza automática (executar a cada hora)
-- Isso seria configurado no cron job ou scheduler da aplicação

-- Inserir configurações padrão se necessário
INSERT INTO system_settings (key, value, description) VALUES
('token_cleanup_interval', '3600', 'Intervalo de limpeza de tokens em segundos')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('max_active_sessions_per_user', '5', 'Máximo de sessões ativas por usuário')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('login_attempt_window', '900', 'Janela de tempo para tentativas de login em segundos')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('max_login_attempts', '5', 'Máximo de tentativas de login por IP/usuário')
ON CONFLICT (key) DO NOTHING;
