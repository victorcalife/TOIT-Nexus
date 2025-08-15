-- =====================================================
-- MIGRATION: Criar tabela subscription_plans
-- Descrição: Planos de assinatura com limites ML
-- Data: 2025-08-14
-- =====================================================

-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    max_scheduled_workflows INTEGER NOT NULL DEFAULT 0,
    ml_credits_per_month INTEGER NOT NULL DEFAULT 0,
    auto_predictions_per_day INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- Comentários para documentação
COMMENT ON TABLE subscription_plans IS 'Planos de assinatura do sistema Quantum ML';
COMMENT ON COLUMN subscription_plans.name IS 'Nome interno do plano (standard, quantum_plus, quantum_premium)';
COMMENT ON COLUMN subscription_plans.display_name IS 'Nome exibido para o usuário';
COMMENT ON COLUMN subscription_plans.max_scheduled_workflows IS 'Máximo de workflows agendados permitidos';
COMMENT ON COLUMN subscription_plans.ml_credits_per_month IS 'Créditos ML disponíveis por mês';
COMMENT ON COLUMN subscription_plans.auto_predictions_per_day IS 'Predições automáticas por dia';
COMMENT ON COLUMN subscription_plans.features IS 'Array JSON com features disponíveis no plano';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
