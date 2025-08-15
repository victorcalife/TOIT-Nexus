-- ====================================================================
-- MIGRATION QUANTUM ML 2.0 - CORRIGIDA PARA TABLEPLUS
-- Execute este script completo no TablePlus
-- ====================================================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- CRIAR TABELA SUBSCRIPTION_PLANS
-- ====================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'BRL',
    ml_credits_per_month INTEGER DEFAULT 0,
    auto_predictions_per_day INTEGER DEFAULT 0,
    max_workflows INTEGER DEFAULT 0,
    ml_slots INTEGER DEFAULT 0,
    storage_limits JSONB DEFAULT '{}',
    functional_limits JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- CRIAR TABELAS DO SISTEMA QUANTUM ML
-- ====================================================================

-- Tabela ML_SLOTS
DROP TABLE IF EXISTS ml_slot_usage CASCADE;
DROP TABLE IF EXISTS ml_slots CASCADE;

CREATE TABLE ml_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    slot_type VARCHAR(100) NOT NULL,
    slot_name VARCHAR(255) NOT NULL,
    slot_location VARCHAR(500) NOT NULL,
    slot_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_tenant_location UNIQUE (tenant_id, slot_location)
);

-- Tabela ML_SLOT_USAGE
CREATE TABLE ml_slot_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES ml_slots(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL,
    usage_data JSONB DEFAULT '{}',
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela TENANT_SUBSCRIPTIONS
DROP TABLE IF EXISTS tenant_subscriptions CASCADE;

CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela STORAGE_USAGE_LOG
DROP TABLE IF EXISTS storage_usage_log CASCADE;

CREATE TABLE storage_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bytes_used BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela SYSTEM_CACHE
DROP TABLE IF EXISTS system_cache CASCADE;

CREATE TABLE system_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    cache_key VARCHAR(500) NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_tenant_cache_key UNIQUE (tenant_id, cache_key)
);

-- Tabela FILE_UPLOADS
DROP TABLE IF EXISTS file_uploads CASCADE;

CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    is_temporary BOOLEAN DEFAULT false,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- CRIAR ÍNDICES
-- ====================================================================

-- Índices ML_SLOTS
CREATE INDEX idx_ml_slots_tenant_active ON ml_slots (tenant_id, is_active);
CREATE INDEX idx_ml_slots_type ON ml_slots (slot_type);
CREATE INDEX idx_ml_slots_usage ON ml_slots (usage_count DESC);

-- Índices ML_SLOT_USAGE
CREATE INDEX idx_ml_slot_usage_slot ON ml_slot_usage (slot_id);
CREATE INDEX idx_ml_slot_usage_tenant_date ON ml_slot_usage (tenant_id, created_at DESC);

-- Índices TENANT_SUBSCRIPTIONS
CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions (tenant_id);
CREATE INDEX idx_tenant_subscriptions_active ON tenant_subscriptions (is_active);
CREATE INDEX idx_tenant_subscriptions_tenant_active ON tenant_subscriptions (tenant_id, is_active);

-- Índices STORAGE_USAGE_LOG
CREATE INDEX idx_storage_log_tenant_date ON storage_usage_log (tenant_id, created_at DESC);
CREATE INDEX idx_storage_log_category ON storage_usage_log (category);

-- Índices SYSTEM_CACHE
CREATE INDEX idx_system_cache_tenant_key ON system_cache (tenant_id, cache_key);
CREATE INDEX idx_system_cache_expires ON system_cache (expires_at);

-- Índices FILE_UPLOADS
CREATE INDEX idx_file_uploads_tenant ON file_uploads (tenant_id);
CREATE INDEX idx_file_uploads_temp ON file_uploads (is_temporary, created_at);

-- ====================================================================
-- INSERIR PLANOS DE ASSINATURA
-- ====================================================================

INSERT INTO subscription_plans (
    name, display_name, description, price_monthly, currency,
    ml_credits_per_month, auto_predictions_per_day, max_workflows,
    ml_slots, storage_limits, functional_limits, features, is_active
) VALUES 

-- Plano Standard
('standard', 'NEXUS Standard', 'Predições Automáticas com 500MB de storage', 79.00, 'BRL',
 0, 12, 10, 0,
 '{"total": 524288000, "uploads": 262144000, "database": 134217728, "cache": 67108864, "logs": 33554432, "emails": 16777216, "calendar": 8388608, "chat": 8388608}'::JSONB,
 '{"workflows": 10, "dashboards": 15, "reports": 30, "users": 5, "apiCallsPerDay": 2000, "emailsPerDay": 100, "automationsPerDay": 20}'::JSONB,
 '["workflows_basic", "dashboards_basic", "reports_basic", "auto_predictions", "storage_500mb", "email_support"]'::JSONB,
 true),

-- Plano Quantum Plus
('quantum_plus', 'NEXUS Quantum Plus', 'Predições Automáticas + 5 slots ML com 2GB de storage', 149.00, 'BRL',
 5, 12, 20, 5,
 '{"total": 2147483648, "uploads": 1073741824, "database": 536870912, "cache": 268435456, "logs": 134217728, "emails": 67108864, "calendar": 33554432, "chat": 33554432}'::JSONB,
 '{"workflows": 20, "dashboards": 30, "reports": 60, "users": 10, "apiCallsPerDay": 5000, "emailsPerDay": 300, "automationsPerDay": 50}'::JSONB,
 '["workflows_advanced", "dashboards_advanced", "reports_advanced", "auto_predictions", "manual_insights", "api_predictions", "ml_slots_5", "storage_2gb", "priority_support", "custom_alerts"]'::JSONB,
 true),

-- Plano Quantum Premium
('quantum_premium', 'NEXUS Quantum Premium', 'Predições Automáticas + 10 slots ML com 5GB de storage', 229.00, 'BRL',
 10, 12, 30, 10,
 '{"total": 5368709120, "uploads": 2684354560, "database": 1073741824, "cache": 536870912, "logs": 268435456, "emails": 134217728, "calendar": 67108864, "chat": 67108864}'::JSONB,
 '{"workflows": 30, "dashboards": 50, "reports": 100, "users": 25, "apiCallsPerDay": 10000, "emailsPerDay": 1000, "automationsPerDay": 100}'::JSONB,
 '["workflows_premium", "dashboards_premium", "reports_premium", "auto_predictions", "manual_insights", "api_unlimited", "ml_slots_10", "storage_5gb", "real_time_alerts", "dedicated_support", "custom_integrations", "advanced_analytics", "white_label"]'::JSONB,
 true)

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
-- CRIAR ASSINATURAS PADRÃO
-- ====================================================================

-- Assinatura para tenant default
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans 
WHERE name = 'quantum_plus'
ON CONFLICT DO NOTHING;

-- Assinatura para tenant demo
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'tenant-demo', id, true
FROM subscription_plans 
WHERE name = 'standard'
ON CONFLICT DO NOTHING;

-- Assinatura para tenant premium
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'tenant-premium', id, true
FROM subscription_plans
WHERE name = 'quantum_premium'
ON CONFLICT DO NOTHING;

-- ====================================================================
-- CRIAR FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para calcular uso de storage
CREATE OR REPLACE FUNCTION calculate_tenant_storage_usage(p_tenant_id VARCHAR)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  uploads_size BIGINT := 0;
  database_size BIGINT := 0;
  cache_size BIGINT := 0;
  logs_size BIGINT := 0;
  emails_size BIGINT := 0;
  calendar_size BIGINT := 0;
  chat_size BIGINT := 0;
BEGIN
  -- Calcular uploads
  SELECT COALESCE(SUM(file_size), 0) INTO uploads_size
  FROM file_uploads WHERE tenant_id = p_tenant_id;

  -- Calcular cache
  SELECT COALESCE(SUM(pg_column_size(cache_data)), 0) INTO cache_size
  FROM system_cache WHERE tenant_id = p_tenant_id;

  -- Calcular logs
  SELECT COALESCE(SUM(COALESCE(pg_column_size(description), 1024)), 0) INTO logs_size
  FROM storage_usage_log WHERE tenant_id = p_tenant_id;

  -- Montar resultado
  result := jsonb_build_object(
    'total', uploads_size + database_size + cache_size + logs_size + emails_size + calendar_size + chat_size,
    'uploads', uploads_size,
    'database', database_size,
    'cache', cache_size,
    'logs', logs_size,
    'emails', emails_size,
    'calendar', calendar_size,
    'chat', chat_size,
    'calculated_at', NOW()
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar disponibilidade de storage
CREATE OR REPLACE FUNCTION can_use_storage(
  p_tenant_id VARCHAR,
  p_additional_bytes BIGINT,
  p_category VARCHAR DEFAULT 'uploads'
) RETURNS JSONB AS $$
DECLARE
  current_usage JSONB;
  plan_limits JSONB;
  category_limit BIGINT;
  total_limit BIGINT;
  current_category BIGINT;
  current_total BIGINT;
  result JSONB;
BEGIN
  -- Buscar uso atual
  current_usage := calculate_tenant_storage_usage(p_tenant_id);

  -- Buscar limites do plano
  SELECT sp.storage_limits INTO plan_limits
  FROM tenant_subscriptions ts
  JOIN subscription_plans sp ON ts.plan_id = sp.id
  WHERE ts.tenant_id = p_tenant_id AND ts.is_active = true
  LIMIT 1;

  IF plan_limits IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Plano não encontrado');
  END IF;

  -- Extrair limites
  category_limit := COALESCE((plan_limits ->> p_category)::BIGINT, 0);
  total_limit := COALESCE((plan_limits ->> 'total')::BIGINT, 0);
  current_category := COALESCE((current_usage ->> p_category)::BIGINT, 0);
  current_total := COALESCE((current_usage ->> 'total')::BIGINT, 0);

  -- Verificar se pode usar
  IF (current_category + p_additional_bytes) > category_limit THEN
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'Limite da categoria ' || p_category || ' seria excedido'
    );
  ELSIF (current_total + p_additional_bytes) > total_limit THEN
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'Limite total de storage seria excedido'
    );
  ELSE
    result := jsonb_build_object(
      'allowed', true,
      'reason', 'Storage disponível'
    );
  END IF;

  -- Adicionar informações
  result := result || jsonb_build_object(
    'current_usage', current_usage,
    'limits', plan_limits,
    'additional_bytes', p_additional_bytes
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza de cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM system_cache
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- INSERIR DADOS DE EXEMPLO
-- ====================================================================

-- Slots de exemplo
INSERT INTO ml_slots (tenant_id, slot_type, slot_name, slot_location, slot_config, is_active, usage_count)
VALUES
('default', 'dashboard_widget', 'Predição de Vendas', 'dashboard_sales_prediction', '{"autoRefresh": true, "chartType": "line"}'::JSONB, true, 0),
('default', 'report_column', 'Score de Risco', 'report_risk_analysis', '{"algorithm": "logistic_regression", "threshold": 0.7}'::JSONB, true, 0),
('tenant-demo', 'workflow_step', 'Aprovação Automática', 'workflow_auto_approval', '{"rules": ["amount < 1000", "customer_score > 0.8"]}'::JSONB, true, 0)
ON CONFLICT (tenant_id, slot_location) DO NOTHING;

-- Cache de exemplo
INSERT INTO system_cache (tenant_id, cache_key, cache_data, expires_at)
VALUES
('default', 'dashboard_metrics', '{"total_users": 150, "active_sessions": 23, "revenue": 45000}'::JSONB, NOW() + INTERVAL '1 hour'),
('default', 'ml_model_predictions', '{"accuracy": 0.89, "last_trained": "2024-01-15", "predictions_count": 1250}'::JSONB, NOW() + INTERVAL '30 minutes')
ON CONFLICT (tenant_id, cache_key) DO UPDATE SET
    cache_data = EXCLUDED.cache_data,
    expires_at = EXCLUDED.expires_at;

-- Logs de storage de exemplo
INSERT INTO storage_usage_log (tenant_id, category, bytes_used, description)
VALUES
('default', 'uploads', 1048576, 'Upload de arquivo CSV - vendas_janeiro.csv'),
('default', 'database', 2097152, 'Cache de query - relatório mensal'),
('tenant-demo', 'uploads', 524288, 'Upload de imagem - logo_empresa.png');

-- ====================================================================
-- VERIFICAÇÃO FINAL E RELATÓRIO
-- ====================================================================

-- Executar verificação e mostrar relatório de sucesso
DO $$
DECLARE
  table_count INTEGER;
  plan_count INTEGER;
  subscription_count INTEGER;
  slot_count INTEGER;
  function_count INTEGER;
  plan_record RECORD;
BEGIN
  -- Contar elementos criados
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name IN ('ml_slots', 'ml_slot_usage', 'tenant_subscriptions', 'storage_usage_log', 'system_cache', 'file_uploads', 'subscription_plans')
  AND table_schema = 'public';

  SELECT COUNT(*) INTO plan_count FROM subscription_plans WHERE ml_slots > 0;
  SELECT COUNT(*) INTO subscription_count FROM tenant_subscriptions;
  SELECT COUNT(*) INTO slot_count FROM ml_slots;

  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_name IN ('calculate_tenant_storage_usage', 'can_use_storage', 'cleanup_expired_cache')
  AND routine_schema = 'public';

  -- Relatório de sucesso
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '🎉 MIGRATION QUANTUM ML 2.0 CONCLUÍDA!';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO DA INSTALAÇÃO:';
  RAISE NOTICE '  📋 Tabelas criadas: %', table_count;
  RAISE NOTICE '  🔧 Funções criadas: %', function_count;
  RAISE NOTICE '  💳 Planos configurados: %', plan_count;
  RAISE NOTICE '  👥 Assinaturas criadas: %', subscription_count;
  RAISE NOTICE '  🎯 Slots de exemplo: %', slot_count;
  RAISE NOTICE '';

  -- Detalhes dos planos
  RAISE NOTICE '💳 PLANOS CONFIGURADOS:';
  FOR plan_record IN
    SELECT
      name,
      display_name,
      ml_slots,
      CASE
        WHEN (storage_limits->>'total')::BIGINT < 1073741824 THEN
          ROUND((storage_limits->>'total')::BIGINT / 1024.0 / 1024.0, 0) || 'MB'
        ELSE
          ROUND((storage_limits->>'total')::BIGINT / 1024.0 / 1024.0 / 1024.0, 1) || 'GB'
      END as storage_formatted,
      price_monthly,
      CASE
        WHEN ml_slots = 0 THEN 'Predições Automáticas'
        ELSE 'Predições Automáticas + ' || ml_slots || ' slots ML'
      END as features_summary
    FROM subscription_plans
    WHERE name IN ('standard', 'quantum_plus', 'quantum_premium')
    ORDER BY price_monthly
  LOOP
    RAISE NOTICE '  📋 %: %, % storage, R$ %/mês',
      plan_record.display_name,
      plan_record.features_summary,
      plan_record.storage_formatted,
      plan_record.price_monthly;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '🚀 SISTEMA QUANTUM ML PRONTO PARA USO!';
  RAISE NOTICE '✅ MIGRATION EXECUTADA COM SUCESSO!';
  RAISE NOTICE '';

END $$;

-- ====================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================================================

-- Comentários das tabelas
COMMENT ON TABLE subscription_plans IS 'Planos de assinatura com configurações de slots ML e storage';
COMMENT ON TABLE ml_slots IS 'Slots ML por tenant - substitui sistema de créditos mensais';
COMMENT ON TABLE ml_slot_usage IS 'Histórico detalhado de uso dos slots ML';
COMMENT ON TABLE tenant_subscriptions IS 'Assinaturas ativas dos tenants';
COMMENT ON TABLE storage_usage_log IS 'Log de uso de storage por categoria';
COMMENT ON TABLE system_cache IS 'Cache de sistema para otimização';
COMMENT ON TABLE file_uploads IS 'Controle de arquivos enviados por tenant';

-- Comentários das funções
COMMENT ON FUNCTION calculate_tenant_storage_usage(VARCHAR) IS 'Calcula uso total de storage por tenant';
COMMENT ON FUNCTION can_use_storage(VARCHAR, BIGINT, VARCHAR) IS 'Verifica disponibilidade de storage';
COMMENT ON FUNCTION cleanup_expired_cache() IS 'Remove cache expirado automaticamente';
