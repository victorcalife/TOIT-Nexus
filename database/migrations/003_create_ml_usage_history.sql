-- =====================================================
-- MIGRATION: Criar tabela ml_usage_history
-- Descrição: Histórico de uso de créditos ML
-- Data: 2025-08-14
-- =====================================================

-- Criar tabela de histórico de uso ML
CREATE TABLE IF NOT EXISTS ml_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    usage_type VARCHAR(50) NOT NULL,
    insight_type VARCHAR(50),
    context VARCHAR(100) NOT NULL,
    credits_consumed INTEGER NOT NULL DEFAULT 1,
    input_data JSONB,
    result_data JSONB,
    processing_time_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ml_usage_positive_credits CHECK (credits_consumed > 0),
    CONSTRAINT ml_usage_valid_type CHECK (usage_type IN (
        'manual_insight', 
        'auto_prediction', 
        'api_call',
        'scheduled_job'
    )),
    CONSTRAINT ml_usage_valid_context CHECK (context IN (
        'workflow',
        'dashboard', 
        'report',
        'api',
        'scheduler',
        'manual'
    ))
);

-- Índices para performance e consultas frequentes
CREATE INDEX IF NOT EXISTS idx_ml_usage_tenant ON ml_usage_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ml_usage_user ON ml_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_usage_type ON ml_usage_history(usage_type);
CREATE INDEX IF NOT EXISTS idx_ml_usage_context ON ml_usage_history(context);
CREATE INDEX IF NOT EXISTS idx_ml_usage_created_at ON ml_usage_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_usage_success ON ml_usage_history(success);

-- Índices compostos para relatórios
CREATE INDEX IF NOT EXISTS idx_ml_usage_tenant_date ON ml_usage_history(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ml_usage_tenant_type ON ml_usage_history(tenant_id, usage_type);
CREATE INDEX IF NOT EXISTS idx_ml_usage_tenant_success ON ml_usage_history(tenant_id, success);

-- Índice para consultas de estatísticas mensais
CREATE INDEX IF NOT EXISTS idx_ml_usage_monthly_stats ON ml_usage_history(
    tenant_id, 
    DATE_TRUNC('month', created_at),
    usage_type
);

-- Comentários para documentação
COMMENT ON TABLE ml_usage_history IS 'Histórico completo de uso de créditos ML';
COMMENT ON COLUMN ml_usage_history.tenant_id IS 'ID do tenant que consumiu os créditos';
COMMENT ON COLUMN ml_usage_history.user_id IS 'ID do usuário que executou a ação (pode ser NULL para jobs automáticos)';
COMMENT ON COLUMN ml_usage_history.usage_type IS 'Tipo de uso: manual_insight, auto_prediction, api_call, scheduled_job';
COMMENT ON COLUMN ml_usage_history.insight_type IS 'Tipo específico do insight: prediction, optimization, anomaly, etc';
COMMENT ON COLUMN ml_usage_history.context IS 'Contexto onde foi usado: workflow, dashboard, report, api, scheduler, manual';
COMMENT ON COLUMN ml_usage_history.credits_consumed IS 'Quantidade de créditos consumidos nesta operação';
COMMENT ON COLUMN ml_usage_history.input_data IS 'Dados de entrada para o processamento ML (JSON)';
COMMENT ON COLUMN ml_usage_history.result_data IS 'Resultado do processamento ML (JSON)';
COMMENT ON COLUMN ml_usage_history.processing_time_ms IS 'Tempo de processamento em milissegundos';
COMMENT ON COLUMN ml_usage_history.success IS 'Se a operação foi bem-sucedida';
COMMENT ON COLUMN ml_usage_history.error_message IS 'Mensagem de erro em caso de falha';

-- Função para limpar histórico antigo (manter apenas 12 meses)
CREATE OR REPLACE FUNCTION cleanup_old_ml_usage()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ml_usage_history 
    WHERE created_at < NOW() - INTERVAL '12 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas de uso por tenant
CREATE OR REPLACE FUNCTION get_ml_usage_stats(
    p_tenant_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    usage_type VARCHAR(50),
    insight_type VARCHAR(50),
    total_uses BIGINT,
    total_credits BIGINT,
    success_rate NUMERIC(5,2),
    avg_processing_time NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        muh.usage_type,
        muh.insight_type,
        COUNT(*) as total_uses,
        SUM(muh.credits_consumed) as total_credits,
        ROUND(
            (COUNT(*) FILTER (WHERE muh.success = true) * 100.0 / COUNT(*)), 
            2
        ) as success_rate,
        ROUND(AVG(muh.processing_time_ms), 2) as avg_processing_time
    FROM ml_usage_history muh
    WHERE muh.tenant_id = p_tenant_id
    AND (p_start_date IS NULL OR muh.created_at >= p_start_date)
    AND (p_end_date IS NULL OR muh.created_at <= p_end_date + INTERVAL '1 day')
    GROUP BY muh.usage_type, muh.insight_type
    ORDER BY total_credits DESC;
END;
$$ LANGUAGE plpgsql;
