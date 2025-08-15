-- ====================================================================
-- SEEDERS CORRIGIDOS PARA QUANTUM ML 2.0
-- Dados iniciais para sistema funcionando
-- EXECUTE ESTE ARQUIVO ÚNICO NO SEU BANCO
-- ====================================================================

-- ====================================================================
-- SEEDER 1: PLANOS DE ASSINATURA (CORRIGIDO)
-- ====================================================================

-- Inserir/Atualizar planos de assinatura
INSERT INTO subscription_plans (
    name,
    display_name,
    description,
    price_monthly,
    currency,
    ml_credits_per_month,
    auto_predictions_per_day,
    max_workflows,
    ml_slots,
    storage_limits,
    functional_limits,
    features,
    is_active
) VALUES 

-- PLANO STANDARD
(
    'standard',
    'NEXUS Standard',
    'Predições Automáticas com 500MB de storage',
    79.00,
    'BRL',
    0,  -- Sem créditos manuais
    12, -- 12 predições automáticas por dia
    10, -- 10 workflows
    0,  -- Sem slots ML manuais
    '{"total": 524288000, "uploads": 262144000, "database": 134217728, "cache": 67108864, "logs": 33554432, "emails": 16777216, "calendar": 8388608, "chat": 8388608}',
    '{"workflows": 10, "dashboards": 15, "reports": 30, "users": 5, "apiCallsPerDay": 2000, "emailsPerDay": 100, "automationsPerDay": 20}',
    '["workflows_basic", "dashboards_basic", "reports_basic", "auto_predictions", "storage_500mb", "email_support"]',
    true
),

-- PLANO QUANTUM PLUS
(
    'quantum_plus',
    'NEXUS Quantum Plus',
    'Predições Automáticas + 5 slots ML com 2GB de storage',
    149.00,
    'BRL',
    5,  -- 5 créditos manuais por mês
    12, -- 12 predições automáticas por dia
    20, -- 20 workflows
    5,  -- 5 slots ML manuais
    '{"total": 2147483648, "uploads": 1073741824, "database": 536870912, "cache": 268435456, "logs": 134217728, "emails": 67108864, "calendar": 33554432, "chat": 33554432}',
    '{"workflows": 20, "dashboards": 30, "reports": 60, "users": 10, "apiCallsPerDay": 5000, "emailsPerDay": 300, "automationsPerDay": 50}',
    '["workflows_advanced", "dashboards_advanced", "reports_advanced", "auto_predictions", "manual_insights", "api_predictions", "ml_slots_5", "storage_2gb", "priority_support", "custom_alerts"]',
    true
),

-- PLANO QUANTUM PREMIUM
(
    'quantum_premium',
    'NEXUS Quantum Premium',
    'Predições Automáticas + 25 slots ML com 50GB de storage',
    299.00,
    'BRL',
    25, -- 25 créditos manuais por mês
    12, -- 12 predições automáticas por dia
    50, -- 50 workflows
    25, -- 25 slots ML manuais
    '{"total": 53687091200, "uploads": 26843545600, "database": 10737418240, "cache": 5368709120, "logs": 2684354560, "emails": 1342177280, "calendar": 671088640, "chat": 671088640}',
    '{"workflows": 50, "dashboards": 100, "reports": 200, "users": 50, "apiCallsPerDay": 20000, "emailsPerDay": 2000, "automationsPerDay": 200}',
    '["workflows_premium", "dashboards_premium", "reports_premium", "auto_predictions", "manual_insights", "api_unlimited", "ml_slots_25", "storage_50gb", "real_time_alerts", "dedicated_support", "custom_integrations", "advanced_analytics", "white_label", "priority_queue"]',
    true
)

ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    ml_credits_per_month = EXCLUDED.ml_credits_per_month,
    auto_predictions_per_day = EXCLUDED.auto_predictions_per_day,
    max_workflows = EXCLUDED.max_workflows,
    ml_slots = EXCLUDED.ml_slots,
    storage_limits = EXCLUDED.storage_limits,
    functional_limits = EXCLUDED.functional_limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ====================================================================
-- SEEDER 2: ASSINATURAS PADRÃO (CORRIGIDO)
-- ====================================================================

-- Criar assinatura padrão para tenant default
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans 
WHERE name = 'quantum_plus'
AND NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions 
    WHERE tenant_id = 'default' AND is_active = true
);

-- Criar assinaturas de exemplo para testes
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'tenant-demo', id, true
FROM subscription_plans 
WHERE name = 'standard'
AND NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions 
    WHERE tenant_id = 'tenant-demo' AND is_active = true
);

INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'tenant-premium', id, true
FROM subscription_plans 
WHERE name = 'quantum_premium'
AND NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions 
    WHERE tenant_id = 'tenant-premium' AND is_active = true
);

-- ====================================================================
-- SEEDER 3: DADOS DE EXEMPLO PARA TESTES
-- ====================================================================

-- Inserir alguns slots de exemplo
INSERT INTO ml_slots (tenant_id, slot_type, slot_name, slot_location, slot_config, is_active, usage_count)
VALUES
('default', 'dashboard_widget', 'Predição de Vendas', 'dashboard_sales_prediction', '{"autoRefresh": true, "chartType": "line"}', true, 0),
('default', 'report_column', 'Score de Risco', 'report_risk_analysis', '{"algorithm": "logistic_regression", "threshold": 0.7}', true, 0),
('default', 'workflow_step', 'Aprovação Automática', 'workflow_auto_approval', '{"rules": ["amount < 1000", "customer_score > 0.8"]}', true, 0),
('tenant-demo', 'dashboard_widget', 'Análise de Churn', 'dashboard_churn_analysis', '{"updateInterval": 3600, "alertThreshold": 0.8}', true, 0),
('tenant-premium', 'api_endpoint', 'Predição em Tempo Real', 'api_realtime_prediction', '{"maxRequestsPerMinute": 100, "cacheResults": true}', true, 0)
ON CONFLICT (tenant_id, slot_location) DO NOTHING;

-- Inserir alguns registros de cache de exemplo
INSERT INTO system_cache (tenant_id, cache_key, cache_data, expires_at)
VALUES
('default', 'dashboard_metrics', '{"total_users": 150, "active_sessions": 23, "revenue": 45000}', NOW() + INTERVAL '1 hour'),
('default', 'ml_model_predictions', '{"accuracy": 0.89, "last_trained": "2024-01-15", "predictions_count": 1250}', NOW() + INTERVAL '30 minutes'),
('tenant-demo', 'performance_stats', '{"cpu_usage": 0.45, "memory_usage": 0.67, "disk_usage": 0.23}', NOW() + INTERVAL '15 minutes')
ON CONFLICT (tenant_id, cache_key) DO UPDATE SET
    cache_data = EXCLUDED.cache_data,
    expires_at = EXCLUDED.expires_at;

-- Inserir alguns logs de storage de exemplo
INSERT INTO storage_usage_log (tenant_id, category, bytes_used, description)
VALUES
('default', 'uploads', 1048576, 'Upload de arquivo CSV - vendas_janeiro.csv'),
('default', 'database', 2097152, 'Cache de query - relatório mensal'),
('default', 'cache', 524288, 'Cache de dashboard - métricas principais'),
('tenant-demo', 'uploads', 524288, 'Upload de imagem - logo_empresa.png'),
('tenant-premium', 'uploads', 5242880, 'Upload de dataset - análise_completa.xlsx');

-- ====================================================================
-- SEEDER 4: PREDIÇÕES AUTOMÁTICAS DE EXEMPLO
-- ====================================================================

-- Inserir algumas predições automáticas de exemplo
INSERT INTO auto_predictions (
    tenant_id,
    prediction_type,
    prediction_name,
    description,
    schedule_frequency,
    schedule_time,
    data_source_config,
    output_config,
    next_run_at,
    is_active
) VALUES
(
    'default',
    'sales_forecast',
    'Previsão de Vendas Diária',
    'Predição automática de vendas baseada em dados históricos',
    'daily',
    '09:00:00',
    '{"source": "database", "table": "sales_data", "columns": ["date", "amount", "product_id"]}',
    '{"email": "admin@empresa.com", "dashboard": "sales_dashboard"}',
    calculate_next_run('daily', '09:00:00'),
    true
),
(
    'default',
    'churn_prediction',
    'Análise de Churn Semanal',
    'Identificação de clientes com risco de cancelamento',
    'weekly',
    '08:00:00',
    '{"source": "api", "endpoint": "/api/customers", "filters": {"active": true}}',
    '{"email": "marketing@empresa.com", "webhook": "https://empresa.com/webhook/churn"}',
    calculate_next_run('weekly', '08:00:00'),
    true
),
(
    'tenant-demo',
    'demand_forecast',
    'Previsão de Demanda',
    'Predição de demanda para planejamento de estoque',
    'daily',
    '07:30:00',
    '{"source": "database", "table": "inventory", "columns": ["product_id", "stock", "sales_velocity"]}',
    '{"dashboard": "inventory_dashboard", "alert_threshold": 0.8}',
    calculate_next_run('daily', '07:30:00'),
    true
);

-- ====================================================================
-- VERIFICAÇÃO FINAL E RELATÓRIO
-- ====================================================================

-- Executar verificação completa
DO $$
DECLARE
  plan_count INTEGER;
  subscription_count INTEGER;
  slot_count INTEGER;
  prediction_count INTEGER;
  cache_count INTEGER;
  plan_record RECORD;
BEGIN
  -- Contar registros criados
  SELECT COUNT(*) INTO plan_count FROM subscription_plans WHERE name IN ('standard', 'quantum_plus', 'quantum_premium');
  SELECT COUNT(*) INTO subscription_count FROM tenant_subscriptions;
  SELECT COUNT(*) INTO slot_count FROM ml_slots;
  SELECT COUNT(*) INTO prediction_count FROM auto_predictions;
  SELECT COUNT(*) INTO cache_count FROM system_cache;

  -- Exibir relatório de sucesso
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '🎉 SEEDERS QUANTUM ML EXECUTADOS!';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 DADOS INSERIDOS:';
  RAISE NOTICE '  💳 Planos configurados: %', plan_count;
  RAISE NOTICE '  👥 Assinaturas criadas: %', subscription_count;
  RAISE NOTICE '  🎯 Slots de exemplo: %', slot_count;
  RAISE NOTICE '  🔮 Predições automáticas: %', prediction_count;
  RAISE NOTICE '  💾 Registros de cache: %', cache_count;
  RAISE NOTICE '';

  -- Mostrar detalhes dos planos
  RAISE NOTICE '💳 PLANOS CONFIGURADOS:';
  FOR plan_record IN
    SELECT name, display_name, ml_slots, price_monthly
    FROM subscription_plans
    WHERE name IN ('standard', 'quantum_plus', 'quantum_premium')
    ORDER BY ml_slots
  LOOP
    RAISE NOTICE '  📋 %: % slots ML, R$ %/mês',
      plan_record.display_name,
      plan_record.ml_slots,
      plan_record.price_monthly;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ SEEDERS EXECUTADOS COM SUCESSO!';
  RAISE NOTICE '🚀 SISTEMA QUANTUM ML PRONTO PARA USO!';
  RAISE NOTICE '';

END $$;
