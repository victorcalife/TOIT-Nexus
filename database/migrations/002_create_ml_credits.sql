-- =====================================================
-- MIGRATION: Criar tabela ml_credits
-- Descrição: Controle de créditos ML por tenant
-- Data: 2025-08-14
-- =====================================================

-- Criar tabela de créditos ML
CREATE TABLE IF NOT EXISTS ml_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    credits_total INTEGER NOT NULL DEFAULT 0,
    credits_used INTEGER NOT NULL DEFAULT 0,
    credits_available INTEGER GENERATED ALWAYS AS (credits_total - credits_used) STORED,
    reset_date DATE NOT NULL,
    last_reset_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ml_credits_tenant_unique UNIQUE(tenant_id),
    CONSTRAINT ml_credits_positive_total CHECK (credits_total >= 0),
    CONSTRAINT ml_credits_positive_used CHECK (credits_used >= 0),
    CONSTRAINT ml_credits_used_not_exceed_total CHECK (credits_used <= credits_total)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ml_credits_tenant ON ml_credits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ml_credits_plan ON ml_credits(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_ml_credits_reset_date ON ml_credits(reset_date);
CREATE INDEX IF NOT EXISTS idx_ml_credits_active ON ml_credits(is_active);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_ml_credits_tenant_active ON ml_credits(tenant_id, is_active);

-- Comentários para documentação
COMMENT ON TABLE ml_credits IS 'Controle de créditos ML por tenant';
COMMENT ON COLUMN ml_credits.tenant_id IS 'ID do tenant (referência externa)';
COMMENT ON COLUMN ml_credits.subscription_plan_id IS 'Plano de assinatura atual';
COMMENT ON COLUMN ml_credits.credits_total IS 'Total de créditos disponíveis no período';
COMMENT ON COLUMN ml_credits.credits_used IS 'Créditos já utilizados no período';
COMMENT ON COLUMN ml_credits.credits_available IS 'Créditos disponíveis (calculado automaticamente)';
COMMENT ON COLUMN ml_credits.reset_date IS 'Data do próximo reset de créditos';
COMMENT ON COLUMN ml_credits.last_reset_date IS 'Data do último reset realizado';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ml_credits_updated_at 
    BEFORE UPDATE ON ml_credits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para reset mensal de créditos
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
    reset_count INTEGER := 0;
    credit_record RECORD;
BEGIN
    -- Buscar todos os registros que precisam de reset
    FOR credit_record IN 
        SELECT mc.id, mc.tenant_id, sp.ml_credits_per_month
        FROM ml_credits mc
        JOIN subscription_plans sp ON mc.subscription_plan_id = sp.id
        WHERE mc.reset_date <= CURRENT_DATE 
        AND mc.is_active = true
    LOOP
        -- Resetar créditos
        UPDATE ml_credits 
        SET 
            credits_used = 0,
            credits_total = credit_record.ml_credits_per_month,
            last_reset_date = CURRENT_DATE,
            reset_date = CURRENT_DATE + INTERVAL '1 month',
            updated_at = NOW()
        WHERE id = credit_record.id;
        
        reset_count := reset_count + 1;
    END LOOP;
    
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql;
