-- =====================================================
-- MIGRATION: Criar tabela auto_predictions
-- Descrição: Configurações de predições automáticas
-- Data: 2025-08-14
-- =====================================================

-- Criar tabela de predições automáticas
CREATE TABLE IF NOT EXISTS auto_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    prediction_name VARCHAR(100) NOT NULL,
    description TEXT,
    schedule_frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
    schedule_time TIME DEFAULT '09:00:00',
    schedule_config JSONB DEFAULT '{}'::jsonb,
    data_source_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_config JSONB DEFAULT '{}'::jsonb,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_result JSONB,
    last_error TEXT,
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT auto_predictions_tenant_name_unique UNIQUE(tenant_id, prediction_name),
    CONSTRAINT auto_predictions_valid_frequency CHECK (schedule_frequency IN (
        'hourly', 'daily', 'weekly', 'monthly'
    )),
    CONSTRAINT auto_predictions_valid_type CHECK (prediction_type IN (
        'sales_forecast',
        'churn_prediction', 
        'demand_forecast',
        'cash_flow',
        'performance_analysis',
        'anomaly_detection'
    )),
    CONSTRAINT auto_predictions_positive_counts CHECK (
        run_count >= 0 AND success_count >= 0 AND success_count <= run_count
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auto_predictions_tenant ON auto_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_predictions_type ON auto_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_auto_predictions_active ON auto_predictions(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_predictions_next_run ON auto_predictions(next_run_at);
CREATE INDEX IF NOT EXISTS idx_auto_predictions_frequency ON auto_predictions(schedule_frequency);

-- Índice composto para scheduler
CREATE INDEX IF NOT EXISTS idx_auto_predictions_scheduler ON auto_predictions(
    is_active, 
    next_run_at
) WHERE is_active = true AND next_run_at IS NOT NULL;

-- Comentários para documentação
COMMENT ON TABLE auto_predictions IS 'Configurações de predições automáticas por tenant';
COMMENT ON COLUMN auto_predictions.tenant_id IS 'ID do tenant proprietário da predição';
COMMENT ON COLUMN auto_predictions.prediction_type IS 'Tipo de predição: sales_forecast, churn_prediction, etc';
COMMENT ON COLUMN auto_predictions.prediction_name IS 'Nome único da predição dentro do tenant';
COMMENT ON COLUMN auto_predictions.schedule_frequency IS 'Frequência: hourly, daily, weekly, monthly';
COMMENT ON COLUMN auto_predictions.schedule_time IS 'Horário de execução (para daily/weekly/monthly)';
COMMENT ON COLUMN auto_predictions.schedule_config IS 'Configurações específicas do agendamento (JSON)';
COMMENT ON COLUMN auto_predictions.data_source_config IS 'Configuração da fonte de dados (JSON)';
COMMENT ON COLUMN auto_predictions.output_config IS 'Configuração de saída/notificações (JSON)';
COMMENT ON COLUMN auto_predictions.last_run_at IS 'Timestamp da última execução';
COMMENT ON COLUMN auto_predictions.next_run_at IS 'Timestamp da próxima execução agendada';
COMMENT ON COLUMN auto_predictions.last_result IS 'Resultado da última execução (JSON)';
COMMENT ON COLUMN auto_predictions.run_count IS 'Total de execuções realizadas';
COMMENT ON COLUMN auto_predictions.success_count IS 'Total de execuções bem-sucedidas';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_auto_predictions_updated_at 
    BEFORE UPDATE ON auto_predictions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular próxima execução
CREATE OR REPLACE FUNCTION calculate_next_run(
    p_frequency VARCHAR(20),
    p_schedule_time TIME DEFAULT '09:00:00',
    p_last_run TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    next_run TIMESTAMP WITH TIME ZONE;
    base_date DATE;
BEGIN
    -- Usar data atual se não há execução anterior
    base_date := COALESCE(DATE(p_last_run), CURRENT_DATE);
    
    CASE p_frequency
        WHEN 'hourly' THEN
            next_run := COALESCE(p_last_run, NOW()) + INTERVAL '1 hour';
        WHEN 'daily' THEN
            next_run := (base_date + INTERVAL '1 day')::DATE + p_schedule_time;
        WHEN 'weekly' THEN
            next_run := (base_date + INTERVAL '1 week')::DATE + p_schedule_time;
        WHEN 'monthly' THEN
            next_run := (base_date + INTERVAL '1 month')::DATE + p_schedule_time;
        ELSE
            RAISE EXCEPTION 'Frequência inválida: %', p_frequency;
    END CASE;
    
    -- Se a próxima execução já passou, calcular a seguinte
    WHILE next_run <= NOW() LOOP
        CASE p_frequency
            WHEN 'hourly' THEN
                next_run := next_run + INTERVAL '1 hour';
            WHEN 'daily' THEN
                next_run := next_run + INTERVAL '1 day';
            WHEN 'weekly' THEN
                next_run := next_run + INTERVAL '1 week';
            WHEN 'monthly' THEN
                next_run := next_run + INTERVAL '1 month';
        END CASE;
    END LOOP;
    
    RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar predições prontas para execução
CREATE OR REPLACE FUNCTION get_predictions_ready_to_run()
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    prediction_type VARCHAR(50),
    prediction_name VARCHAR(100),
    data_source_config JSONB,
    output_config JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.id,
        ap.tenant_id,
        ap.prediction_type,
        ap.prediction_name,
        ap.data_source_config,
        ap.output_config
    FROM auto_predictions ap
    WHERE ap.is_active = true
    AND ap.next_run_at <= NOW()
    ORDER BY ap.next_run_at ASC;
END;
$$ LANGUAGE plpgsql;
