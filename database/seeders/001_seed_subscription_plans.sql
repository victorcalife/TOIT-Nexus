-- =====================================================
-- SEEDER: Planos de Assinatura Padrão
-- Descrição: Dados iniciais dos 3 planos Quantum ML
-- Data: 2025-08-14
-- =====================================================

-- Limpar dados existentes (apenas em desenvolvimento)
-- DELETE FROM subscription_plans WHERE name IN ('standard', 'quantum_plus', 'quantum_premium');

-- Inserir planos padrão
INSERT INTO subscription_plans (
    name,
    display_name,
    max_scheduled_workflows,
    ml_credits_per_month,
    auto_predictions_per_day,
    features,
    is_active
) VALUES 
-- PLANO STANDARD
(
    'standard',
    'NEXUS Standard',
    5,  -- 5 workflows agendados
    0,  -- Sem créditos manuais
    3,  -- 3 predições automáticas por dia
    '[
        "workflows_basic",
        "dashboards_basic", 
        "reports_basic",
        "auto_predictions",
        "email_support"
    ]'::jsonb,
    true
),

-- PLANO QUANTUM PLUS  
(
    'quantum_plus',
    'NEXUS Quantum Plus',
    15, -- 15 workflows agendados
    5,  -- 5 créditos ML manuais por mês
    6,  -- 6 predições automáticas por dia
    '[
        "workflows_advanced",
        "dashboards_advanced",
        "reports_advanced", 
        "auto_predictions",
        "manual_insights",
        "api_predictions",
        "priority_support",
        "custom_alerts"
    ]'::jsonb,
    true
),

-- PLANO QUANTUM PREMIUM
(
    'quantum_premium', 
    'NEXUS Quantum Premium',
    30, -- 30 workflows agendados
    15, -- 15 créditos ML manuais por mês
    12, -- 12 predições automáticas por dia
    '[
        "workflows_premium",
        "dashboards_premium",
        "reports_premium",
        "auto_predictions",
        "manual_insights",
        "api_unlimited",
        "real_time_alerts",
        "dedicated_support",
        "custom_integrations",
        "advanced_analytics",
        "white_label"
    ]'::jsonb,
    true
)

-- Usar ON CONFLICT para evitar duplicatas
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    max_scheduled_workflows = EXCLUDED.max_scheduled_workflows,
    ml_credits_per_month = EXCLUDED.ml_credits_per_month,
    auto_predictions_per_day = EXCLUDED.auto_predictions_per_day,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verificar se os dados foram inseridos
DO $$
DECLARE
    plan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM subscription_plans WHERE is_active = true;
    
    IF plan_count >= 3 THEN
        RAISE NOTICE '✅ Planos de assinatura criados com sucesso! Total: %', plan_count;
    ELSE
        RAISE EXCEPTION '❌ Erro: Apenas % planos foram criados', plan_count;
    END IF;
END $$;
