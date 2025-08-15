-- =====================================================
-- SEEDER: Atualização dos Planos com Slots e Storage
-- Descrição: Atualiza planos existentes com sistema de slots ML e gestão de storage
-- Data: 2025-08-14
-- =====================================================

-- Atualizar planos existentes com novas configurações
UPDATE subscription_plans 
SET 
  -- Slots ML (substitui créditos mensais)
  ml_slots = CASE 
    WHEN name = 'standard' THEN 0
    WHEN name = 'quantum_plus' THEN 3
    WHEN name = 'quantum_premium' THEN 10
    ELSE 0
  END,
  
  -- Limites de Storage por categoria (em bytes)
  storage_limits = CASE 
    WHEN name = 'standard' THEN '{
      "total": 1073741824,
      "uploads": 536870912,
      "database": 268435456,
      "cache": 134217728,
      "logs": 67108864,
      "emails": 33554432,
      "calendar": 16777216,
      "chat": 16777216
    }'::JSONB
    WHEN name = 'quantum_plus' THEN '{
      "total": 10737418240,
      "uploads": 5368709120,
      "database": 2147483648,
      "cache": 1073741824,
      "logs": 536870912,
      "emails": 268435456,
      "calendar": 134217728,
      "chat": 134217728
    }'::JSONB
    WHEN name = 'quantum_premium' THEN '{
      "total": 53687091200,
      "uploads": 26843545600,
      "database": 10737418240,
      "cache": 5368709120,
      "logs": 2147483648,
      "emails": 1073741824,
      "calendar": 536870912,
      "chat": 536870912
    }'::JSONB
    ELSE '{}'::JSONB
  END,
  
  -- Limites funcionais
  functional_limits = CASE 
    WHEN name = 'standard' THEN '{
      "workflows": 5,
      "dashboards": 10,
      "reports": 20,
      "users": 3,
      "apiCallsPerDay": 1000,
      "emailsPerDay": 50,
      "automationsPerDay": 10
    }'::JSONB
    WHEN name = 'quantum_plus' THEN '{
      "workflows": 25,
      "dashboards": 50,
      "reports": 100,
      "users": 10,
      "apiCallsPerDay": 10000,
      "emailsPerDay": 500,
      "automationsPerDay": 100
    }'::JSONB
    WHEN name = 'quantum_premium' THEN '{
      "workflows": 100,
      "dashboards": 200,
      "reports": 500,
      "users": 50,
      "apiCallsPerDay": 100000,
      "emailsPerDay": 5000,
      "automationsPerDay": 1000
    }'::JSONB
    ELSE '{}'::JSONB
  END,
  
  -- Atualizar features para incluir slots e storage
  features = CASE 
    WHEN name = 'standard' THEN '[
      "workflows_basic",
      "dashboards_basic", 
      "reports_basic",
      "auto_predictions",
      "ml_slots_3",
      "storage_1gb",
      "email_support"
    ]'::JSONB
    WHEN name = 'quantum_plus' THEN '[
      "workflows_advanced",
      "dashboards_advanced",
      "reports_advanced", 
      "auto_predictions",
      "manual_insights",
      "api_predictions",
      "ml_slots_10",
      "storage_10gb",
      "priority_support",
      "custom_alerts"
    ]'::JSONB
    WHEN name = 'quantum_premium' THEN '[
      "workflows_premium",
      "dashboards_premium",
      "reports_premium",
      "auto_predictions",
      "manual_insights",
      "api_unlimited",
      "ml_slots_25",
      "storage_50gb",
      "real_time_alerts",
      "dedicated_support",
      "custom_integrations",
      "advanced_analytics",
      "white_label"
    ]'::JSONB
    ELSE features
  END,
  
  -- Atualizar descrições
  description = CASE 
    WHEN name = 'standard' THEN 'Plano gratuito com 3 slots ML e 1GB de storage'
    WHEN name = 'quantum_plus' THEN 'Plano avançado com 10 slots ML e 10GB de storage'
    WHEN name = 'quantum_premium' THEN 'Plano premium com 25 slots ML e 50GB de storage'
    ELSE description
  END,
  
  updated_at = NOW()
  
WHERE name IN ('standard', 'quantum_plus', 'quantum_premium');

-- Criar assinatura padrão para tenant default se não existir
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans
WHERE name = 'quantum_plus'
AND NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions
    WHERE tenant_id = 'default' AND is_active = true
);

-- Verificar se as atualizações foram aplicadas
DO $$
DECLARE
  plan_record RECORD;
  total_plans INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_plans
  FROM subscription_plans
  WHERE name IN ('standard', 'quantum_plus', 'quantum_premium')
  AND storage_limits IS NOT NULL;

  IF total_plans >= 2 THEN
    RAISE NOTICE '✅ Planos atualizados com sucesso! Total com slots ML: %', total_plans;
    
    -- Mostrar resumo dos planos
    FOR plan_record IN 
      SELECT 
        name,
        display_name,
        ml_slots,
        (storage_limits->>'total')::BIGINT / 1024 / 1024 / 1024 as storage_gb
      FROM subscription_plans 
      WHERE name IN ('standard', 'quantum_plus', 'quantum_premium')
      ORDER BY ml_slots
    LOOP
      RAISE NOTICE '  📋 %: % slots ML, %GB storage', 
        plan_record.display_name, 
        plan_record.ml_slots, 
        plan_record.storage_gb;
    END LOOP;
    
  ELSE
    RAISE NOTICE '⚠️ Aviso: Apenas % planos foram encontrados/atualizados. Continuando...', total_plans;
  END IF;
END $$;

-- Verificar se tenant default tem assinatura
DO $$
DECLARE
  subscription_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM tenant_subscriptions 
    WHERE tenant_id = 'default' AND is_active = true
  ) INTO subscription_exists;
  
  IF subscription_exists THEN
    RAISE NOTICE '✅ Tenant default configurado com assinatura ativa';
  ELSE
    RAISE EXCEPTION '❌ Erro: Tenant default não possui assinatura ativa';
  END IF;
END $$;
