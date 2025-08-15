-- ====================================================================
-- SEEDER SIMPLES E FUNCIONAL PARA QUANTUM ML 2.0
-- Funciona com os planos existentes no banco
-- ====================================================================

-- Verificar quais planos existem
DO $$
DECLARE
  plan_record RECORD;
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM subscription_plans;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 ========================================';
  RAISE NOTICE '🔍 VERIFICANDO PLANOS EXISTENTES';
  RAISE NOTICE '🔍 ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total de planos no banco: %', plan_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 PLANOS ENCONTRADOS:';
  
  FOR plan_record IN
    SELECT name, display_name, COALESCE(ml_slots, 0) as ml_slots, price_monthly
    FROM subscription_plans
    ORDER BY name
  LOOP
    RAISE NOTICE '  📋 %: % (% slots ML, R$ %/mês)',
      plan_record.name,
      COALESCE(plan_record.display_name, 'Sem nome'),
      plan_record.ml_slots,
      COALESCE(plan_record.price_monthly, 0);
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- Atualizar APENAS os planos que existem com configurações ML
UPDATE subscription_plans 
SET 
  ml_slots = CASE 
    WHEN name = 'standard' THEN 1
    WHEN name = 'quantum_plus' THEN 5
    WHEN name = 'quantum_premium' THEN 10
    WHEN name LIKE '%basic%' THEN 1
    WHEN name LIKE '%plus%' THEN 5
    WHEN name LIKE '%premium%' THEN 10
    WHEN name LIKE '%pro%' THEN 8
    ELSE 0
  END,
  ml_credits_per_month = CASE 
    WHEN name = 'standard' THEN 1
    WHEN name = 'quantum_plus' THEN 3
    WHEN name = 'quantum_premium' THEN 12
    WHEN name LIKE '%basic%' THEN 1
    WHEN name LIKE '%plus%' THEN 3
    WHEN name LIKE '%premium%' THEN 12
    WHEN name LIKE '%pro%' THEN 8
    ELSE 0
  END,
  auto_predictions_per_day = CASE 
    WHEN name = 'standard' THEN 1
    WHEN name = 'quantum_plus' THEN 5
    WHEN name = 'quantum_premium' THEN 12
    WHEN name LIKE '%basic%' THEN 1
    WHEN name LIKE '%plus%' THEN 5
    WHEN name LIKE '%premium%' THEN 12
    WHEN name LIKE '%pro%' THEN 8
    ELSE 12
  END,
  storage_limits = CASE 
    WHEN name = 'standard' OR name LIKE '%basic%' THEN 
      '{"total": 524288000, "uploads": 262144000, "database": 134217728, "cache": 67108864, "logs": 33554432, "emails": 16777216, "calendar": 8388608, "chat": 8388608}'::jsonb
    WHEN name = 'quantum_plus' OR name LIKE '%plus%' OR name LIKE '%pro%' THEN 
      '{"total": 2147483648, "uploads": 1073741824, "database": 536870912, "cache": 268435456, "logs": 134217728, "emails": 67108864, "calendar": 33554432, "chat": 33554432}'::jsonb
    WHEN name = 'quantum_premium' OR name LIKE '%premium%' THEN 
      '{"total": 53687091200, "uploads": 26843545600, "database": 10737418240, "cache": 5368709120, "logs": 2684354560, "emails": 1342177280, "calendar": 671088640, "chat": 671088640}'::jsonb
    ELSE 
      '{"total": 524288000, "uploads": 262144000, "database": 134217728, "cache": 67108864, "logs": 33554432, "emails": 16777216, "calendar": 8388608, "chat": 8388608}'::jsonb
  END,
  features = CASE 
    WHEN name = 'standard' OR name LIKE '%basic%' THEN 
      '["workflows_basic", "dashboards_basic", "reports_basic", "auto_predictions", "storage_500mb", "email_support"]'::jsonb
    WHEN name = 'quantum_plus' OR name LIKE '%plus%' OR name LIKE '%pro%' THEN 
      '["workflows_advanced", "dashboards_advanced", "reports_advanced", "auto_predictions", "manual_insights", "api_predictions", "ml_slots_5", "storage_2gb", "priority_support", "custom_alerts"]'::jsonb
    WHEN name = 'quantum_premium' OR name LIKE '%premium%' THEN 
      '["workflows_premium", "dashboards_premium", "reports_premium", "auto_predictions", "manual_insights", "api_unlimited", "ml_slots_25", "storage_50gb", "real_time_alerts", "dedicated_support", "custom_integrations", "advanced_analytics", "white_label", "priority_queue"]'::jsonb
    ELSE 
      '["basic_features"]'::jsonb
  END,
  updated_at = NOW()
WHERE name IS NOT NULL;

-- Criar assinatura padrão para tenant default (se não existir)
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans 
WHERE (name LIKE '%plus%' OR name = 'quantum_plus')
AND NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions 
    WHERE tenant_id = 'default' AND is_active = true
)
LIMIT 1;

-- Se não encontrou plano plus, usar o primeiro plano disponível
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans 
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions 
    WHERE tenant_id = 'default' AND is_active = true
)
LIMIT 1;

-- Inserir alguns dados de exemplo básicos
INSERT INTO ml_slots (tenant_id, slot_type, slot_name, slot_location, slot_config, is_active, usage_count)
VALUES
('default', 'dashboard_widget', 'Predição de Vendas', 'dashboard_sales_prediction', '{"autoRefresh": true, "chartType": "line"}', true, 0),
('default', 'report_column', 'Score de Risco', 'report_risk_analysis', '{"algorithm": "logistic_regression", "threshold": 0.7}', true, 0),
('default', 'workflow_step', 'Aprovação Automática', 'workflow_auto_approval', '{"rules": ["amount < 1000", "customer_score > 0.8"]}', true, 0)
ON CONFLICT (tenant_id, slot_location) DO NOTHING;

-- Inserir cache básico
INSERT INTO system_cache (tenant_id, cache_key, cache_data, expires_at)
VALUES
('default', 'dashboard_metrics', '{"total_users": 150, "active_sessions": 23, "revenue": 45000}', NOW() + INTERVAL '1 hour'),
('default', 'ml_model_predictions', '{"accuracy": 0.89, "last_trained": "2024-01-15", "predictions_count": 1250}', NOW() + INTERVAL '30 minutes')
ON CONFLICT (tenant_id, cache_key) DO UPDATE SET
    cache_data = EXCLUDED.cache_data,
    expires_at = EXCLUDED.expires_at;

-- Relatório final
DO $$
DECLARE
  plan_record RECORD;
  subscription_count INTEGER;
  slot_count INTEGER;
  cache_count INTEGER;
  updated_plans INTEGER;
BEGIN
  -- Contar atualizações
  SELECT COUNT(*) INTO updated_plans FROM subscription_plans WHERE ml_slots IS NOT NULL;
  SELECT COUNT(*) INTO subscription_count FROM tenant_subscriptions WHERE tenant_id = 'default';
  SELECT COUNT(*) INTO slot_count FROM ml_slots WHERE tenant_id = 'default';
  SELECT COUNT(*) INTO cache_count FROM system_cache WHERE tenant_id = 'default';

  RAISE NOTICE '';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '🎉 SEEDER EXECUTADO COM SUCESSO!';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESULTADOS:';
  RAISE NOTICE '  💳 Planos atualizados: %', updated_plans;
  RAISE NOTICE '  👥 Assinaturas criadas: %', subscription_count;
  RAISE NOTICE '  🎯 Slots de exemplo: %', slot_count;
  RAISE NOTICE '  💾 Cache criado: %', cache_count;
  RAISE NOTICE '';
  
  RAISE NOTICE '💳 PLANOS CONFIGURADOS:';
  FOR plan_record IN
    SELECT name, display_name, ml_slots, 
           COALESCE(price_monthly, 0) as price_monthly,
           (storage_limits->>'total')::BIGINT / 1024 / 1024 as storage_mb
    FROM subscription_plans
    WHERE ml_slots IS NOT NULL
    ORDER BY ml_slots
  LOOP
    RAISE NOTICE '  📋 %: % slots ML, % MB storage, R$ %/mês',
      COALESCE(plan_record.display_name, plan_record.name),
      plan_record.ml_slots,
      COALESCE(plan_record.storage_mb, 0),
      plan_record.price_monthly;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ SISTEMA QUANTUM ML CONFIGURADO!';
  RAISE NOTICE '🚀 PRONTO PARA USO!';
  RAISE NOTICE '';

END $$;
