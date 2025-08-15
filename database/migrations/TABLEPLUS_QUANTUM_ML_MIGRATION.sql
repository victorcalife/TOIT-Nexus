-- ====================================================================
-- MIGRATION QUANTUM ML - OTIMIZADA PARA TABLEPLUS
-- Sistema de Slots ML + Gestão de Storage
-- Execute este script completo no TablePlus
-- ====================================================================

-- Verificar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. CRIAR TABELA SUBSCRIPTION_PLANS (se não existir)
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
-- 2. CRIAR TABELAS DO SISTEMA QUANTUM ML
-- ====================================================================

-- Tabela ML_SLOTS
CREATE TABLE IF NOT EXISTS ml_slots (
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
CREATE TABLE IF NOT EXISTS ml_slot_usage (
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
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
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
CREATE TABLE IF NOT EXISTS storage_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bytes_used BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela SYSTEM_CACHE
CREATE TABLE IF NOT EXISTS system_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    cache_key VARCHAR(500) NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_tenant_cache_key UNIQUE (tenant_id, cache_key)
);

-- Tabela FILE_UPLOADS
CREATE TABLE IF NOT EXISTS file_uploads (
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
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índices ML_SLOTS
CREATE INDEX IF NOT EXISTS idx_ml_slots_tenant_active ON ml_slots (tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ml_slots_type ON ml_slots (slot_type);
CREATE INDEX IF NOT EXISTS idx_ml_slots_usage ON ml_slots (usage_count DESC);

-- Índices ML_SLOT_USAGE
CREATE INDEX IF NOT EXISTS idx_ml_slot_usage_slot ON ml_slot_usage (slot_id);
CREATE INDEX IF NOT EXISTS idx_ml_slot_usage_tenant_date ON ml_slot_usage (tenant_id, created_at DESC);

-- Índices TENANT_SUBSCRIPTIONS
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant ON tenant_subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_active ON tenant_subscriptions (is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_active ON tenant_subscriptions (tenant_id, is_active);

-- Índices STORAGE_USAGE_LOG
CREATE INDEX IF NOT EXISTS idx_storage_log_tenant_date ON storage_usage_log (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_storage_log_category ON storage_usage_log (category);

-- Índices SYSTEM_CACHE
CREATE INDEX IF NOT EXISTS idx_system_cache_tenant_key ON system_cache (tenant_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_system_cache_expires ON system_cache (expires_at);

-- Índices FILE_UPLOADS
CREATE INDEX IF NOT EXISTS idx_file_uploads_tenant ON file_uploads (tenant_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_temp ON file_uploads (is_temporary, created_at);

-- ====================================================================
-- 4. INSERIR PLANOS DE ASSINATURA
-- ====================================================================

INSERT INTO subscription_plans (
    name, display_name, description, price_monthly, currency,
    ml_credits_per_month, auto_predictions_per_day, max_workflows,
    ml_slots, storage_limits, functional_limits, features, is_active
) VALUES 
-- Plano Standard
('standard', 'NEXUS Standard', 'Plano gratuito com 3 slots ML e 1GB de storage', 0.00, 'BRL',
 0, 3, 5, 3,
 '{"total": 1073741824, "uploads": 536870912, "database": 268435456, "cache": 134217728, "logs": 67108864, "emails": 33554432, "calendar": 16777216, "chat": 16777216}',
 '{"workflows": 5, "dashboards": 10, "reports": 20, "users": 3, "apiCallsPerDay": 1000, "emailsPerDay": 50, "automationsPerDay": 10}',
 '["workflows_basic", "dashboards_basic", "reports_basic", "ml_slots_3", "storage_1gb", "email_support"]',
 true),

-- Plano Quantum Plus
('quantum_plus', 'NEXUS Quantum Plus', 'Plano avançado com 10 slots ML e 10GB de storage', 99.00, 'BRL',
 5, 6, 15, 10,
 '{"total": 10737418240, "uploads": 5368709120, "database": 2147483648, "cache": 1073741824, "logs": 536870912, "emails": 268435456, "calendar": 134217728, "chat": 134217728}',
 '{"workflows": 25, "dashboards": 50, "reports": 100, "users": 10, "apiCallsPerDay": 10000, "emailsPerDay": 500, "automationsPerDay": 100}',
 '["workflows_advanced", "dashboards_advanced", "reports_advanced", "manual_insights", "api_predictions", "ml_slots_10", "storage_10gb", "priority_support", "custom_alerts"]',
 true),

-- Plano Quantum Premium
('quantum_premium', 'NEXUS Quantum Premium', 'Plano premium com 25 slots ML e 50GB de storage', 199.00, 'BRL',
 15, 12, 30, 25,
 '{"total": 53687091200, "uploads": 26843545600, "database": 10737418240, "cache": 5368709120, "logs": 2147483648, "emails": 1073741824, "calendar": 536870912, "chat": 536870912}',
 '{"workflows": 100, "dashboards": 200, "reports": 500, "users": 50, "apiCallsPerDay": 100000, "emailsPerDay": 5000, "automationsPerDay": 1000}',
 '["workflows_premium", "dashboards_premium", "reports_premium", "manual_insights", "api_unlimited", "ml_slots_25", "storage_50gb", "real_time_alerts", "dedicated_support", "custom_integrations", "advanced_analytics", "white_label"]',
 true)

ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    ml_slots = EXCLUDED.ml_slots,
    storage_limits = EXCLUDED.storage_limits,
    functional_limits = EXCLUDED.functional_limits,
    features = EXCLUDED.features,
    updated_at = NOW();

-- ====================================================================
-- 5. CRIAR ASSINATURA PADRÃO
-- ====================================================================

INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans 
WHERE name = 'quantum_plus'
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 6. CRIAR FUNÇÕES AUXILIARES
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
  
  -- Calcular logs (estimativa baseada em registros)
  SELECT COALESCE(SUM(pg_column_size(description)), 0) INTO logs_size
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
  WHERE ts.tenant_id = p_tenant_id AND ts.is_active = true;
  
  IF plan_limits IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Plano não encontrado');
  END IF;
  
  -- Extrair limites
  category_limit := (plan_limits ->> p_category)::BIGINT;
  total_limit := (plan_limits ->> 'total')::BIGINT;
  current_category := (current_usage ->> p_category)::BIGINT;
  current_total := (current_usage ->> 'total')::BIGINT;
  
  -- Verificar se pode usar
  IF (current_category + p_additional_bytes) > category_limit THEN
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'Limite da categoria ' || p_category || ' excedido'
    );
  ELSIF (current_total + p_additional_bytes) > total_limit THEN
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'Limite total de storage excedido'
    );
  ELSE
    result := jsonb_build_object(
      'allowed', true,
      'reason', 'OK'
    );
  END IF;
  
  -- Adicionar informações de uso
  result := result || jsonb_build_object(
    'current_usage', current_usage,
    'limits', plan_limits,
    'additional_bytes', p_additional_bytes
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza de cache expirado
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
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON TABLE ml_slots IS 'Slots ML por tenant - substitui sistema de créditos mensais';
COMMENT ON TABLE ml_slot_usage IS 'Histórico detalhado de uso dos slots ML';
COMMENT ON TABLE tenant_subscriptions IS 'Assinaturas dos tenants com planos';
COMMENT ON TABLE storage_usage_log IS 'Log de uso de storage por categoria';
COMMENT ON TABLE system_cache IS 'Cache de sistema para otimização';
COMMENT ON TABLE file_uploads IS 'Controle de arquivos enviados por tenant';

-- ====================================================================
-- 8. VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar se tudo foi criado corretamente
DO $$
DECLARE
  table_count INTEGER;
  plan_count INTEGER;
  subscription_count INTEGER;
BEGIN
  -- Contar tabelas criadas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_name IN ('ml_slots', 'ml_slot_usage', 'tenant_subscriptions', 'storage_usage_log', 'system_cache', 'file_uploads');
  
  -- Contar planos
  SELECT COUNT(*) INTO plan_count FROM subscription_plans WHERE ml_slots > 0;
  
  -- Contar assinaturas
  SELECT COUNT(*) INTO subscription_count FROM tenant_subscriptions;
  
  RAISE NOTICE '🎉 MIGRATION QUANTUM ML CONCLUÍDA!';
  RAISE NOTICE '📋 Tabelas criadas: %', table_count;
  RAISE NOTICE '💳 Planos configurados: %', plan_count;
  RAISE NOTICE '👥 Assinaturas criadas: %', subscription_count;
  RAISE NOTICE '✅ Sistema pronto para uso!';
END $$;
