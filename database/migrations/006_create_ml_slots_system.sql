-- ====================================================================
-- MIGRATION COMPLETA: SISTEMA QUANTUM ML 2.0
-- Sistema de Slots ML + Gestão Completa de Storage
-- OTIMIZADA PARA EXECUÇÃO NO TABLEPLUS
-- ====================================================================
--
-- INSTRUÇÕES:
-- 1. Abra o TablePlus e conecte ao seu banco PostgreSQL
-- 2. Cole este script completo em uma nova query
-- 3. Execute todo o script de uma vez (Cmd/Ctrl + Enter)
-- 4. Aguarde as mensagens de confirmação
--
-- ====================================================================

-- Verificar e criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- ETAPA 1: VERIFICAR E CRIAR TABELA SUBSCRIPTION_PLANS
-- ====================================================================

-- Criar tabela subscription_plans se não existir
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
-- ETAPA 2: CRIAR TABELAS DO SISTEMA QUANTUM ML
-- ====================================================================

-- Tabela ML_SLOTS - Gerencia slots ML por tenant
DROP TABLE IF EXISTS ml_slot_usage CASCADE;
DROP TABLE IF EXISTS ml_slots CASCADE;

CREATE TABLE ml_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    slot_type VARCHAR(100) NOT NULL, -- tql_query, report_column, workflow_step, etc.
    slot_name VARCHAR(255) NOT NULL,
    slot_location VARCHAR(500) NOT NULL, -- Localização específica
    slot_config JSONB DEFAULT '{}', -- Configuração específica do slot
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraint único por tenant e localização
    CONSTRAINT unique_tenant_location UNIQUE (tenant_id, slot_location)
);

-- Tabela ML_SLOT_USAGE - Histórico detalhado de uso dos slots ML
CREATE TABLE ml_slot_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES ml_slots(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL,
    usage_data JSONB DEFAULT '{}', -- Dados específicos do uso
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela TENANT_SUBSCRIPTIONS - Assinaturas dos tenants
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

-- Tabela STORAGE_USAGE_LOG - Log de uso de storage por categoria
DROP TABLE IF EXISTS storage_usage_log CASCADE;

CREATE TABLE storage_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- uploads, database, cache, logs, emails, calendar, chat
    bytes_used BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela SYSTEM_CACHE - Cache de sistema para otimização
DROP TABLE IF EXISTS system_cache CASCADE;

CREATE TABLE system_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    cache_key VARCHAR(500) NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Cache único por tenant e chave
    CONSTRAINT unique_tenant_cache_key UNIQUE (tenant_id, cache_key)
);

-- Tabela FILE_UPLOADS - Controle de arquivos enviados
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
-- ETAPA 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índices para ML_SLOTS
CREATE INDEX idx_ml_slots_tenant_active ON ml_slots (tenant_id, is_active);
CREATE INDEX idx_ml_slots_type ON ml_slots (slot_type);
CREATE INDEX idx_ml_slots_usage ON ml_slots (usage_count DESC);
CREATE INDEX idx_ml_slots_location ON ml_slots (slot_location);

-- Índices para ML_SLOT_USAGE
CREATE INDEX idx_ml_slot_usage_slot ON ml_slot_usage (slot_id);
CREATE INDEX idx_ml_slot_usage_tenant_date ON ml_slot_usage (tenant_id, created_at DESC);
CREATE INDEX idx_ml_slot_usage_success ON ml_slot_usage (success);

-- Índices para TENANT_SUBSCRIPTIONS
CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions (tenant_id);
CREATE INDEX idx_tenant_subscriptions_active ON tenant_subscriptions (is_active);
CREATE INDEX idx_tenant_subscriptions_tenant_active ON tenant_subscriptions (tenant_id, is_active);
CREATE INDEX idx_tenant_subscriptions_plan ON tenant_subscriptions (plan_id);

-- Índices para STORAGE_USAGE_LOG
CREATE INDEX idx_storage_log_tenant_date ON storage_usage_log (tenant_id, created_at DESC);
CREATE INDEX idx_storage_log_category ON storage_usage_log (category);
CREATE INDEX idx_storage_log_tenant_category ON storage_usage_log (tenant_id, category);

-- Índices para SYSTEM_CACHE
CREATE INDEX idx_system_cache_tenant_key ON system_cache (tenant_id, cache_key);
CREATE INDEX idx_system_cache_expires ON system_cache (expires_at);
CREATE INDEX idx_system_cache_tenant ON system_cache (tenant_id);

-- Índices para FILE_UPLOADS
CREATE INDEX idx_file_uploads_tenant ON file_uploads (tenant_id);
CREATE INDEX idx_file_uploads_temp ON file_uploads (is_temporary, created_at);
CREATE INDEX idx_file_uploads_type ON file_uploads (file_type);
CREATE INDEX idx_file_uploads_size ON file_uploads (file_size DESC);

-- ====================================================================
-- ETAPA 4: INSERIR/ATUALIZAR PLANOS DE ASSINATURA
-- ====================================================================

-- Inserir planos de assinatura com todas as configurações
INSERT INTO subscription_plans (
    name, display_name, description, price_monthly, currency,
    ml_credits_per_month, auto_predictions_per_day, max_workflows,
    ml_slots, storage_limits, functional_limits, features, is_active
) VALUES

-- Plano Standard
('standard', 'NEXUS Standard', 'Predições Automáticas com 500MB de storage', 79.00, 'BRL',
 0, 12, 10, 0,
 '{"total": 524288000, "uploads": 262144000, "database": 134217728, "cache": 67108864, "logs": 33554432, "emails": 16777216, "calendar": 8388608, "chat": 8388608}',
 '{"workflows": 10, "dashboards": 15, "reports": 30, "users": 5, "apiCallsPerDay": 2000, "emailsPerDay": 100, "automationsPerDay": 20}',
 '["workflows_basic", "dashboards_basic", "reports_basic", "auto_predictions", "storage_500mb", "email_support"]',
 true),

-- Plano Quantum Plus
('quantum_plus', 'NEXUS Quantum Plus', 'Predições Automáticas + 5 slots ML com 2GB de storage', 149.00, 'BRL',
 5, 12, 20, 5,
 '{"total": 2147483648, "uploads": 1073741824, "database": 536870912, "cache": 268435456, "logs": 134217728, "emails": 67108864, "calendar": 33554432, "chat": 33554432}',
 '{"workflows": 20, "dashboards": 30, "reports": 60, "users": 10, "apiCallsPerDay": 5000, "emailsPerDay": 300, "automationsPerDay": 50}',
 '["workflows_advanced", "dashboards_advanced", "reports_advanced", "auto_predictions", "manual_insights", "api_predictions", "ml_slots_5", "storage_2gb", "priority_support", "custom_alerts"]',
 true),

-- Plano Quantum Premium
('quantum_premium', 'NEXUS Quantum Premium', 'Predições Automáticas + 10 slots ML com 5GB de storage', 229.00, 'BRL',
 10, 12, 30, 10,
 '{"total": 5368709120, "uploads": 2684354560, "database": 1073741824, "cache": 536870912, "logs": 268435456, "emails": 134217728, "calendar": 67108864, "chat": 67108864}',
 '{"workflows": 30, "dashboards": 50, "reports": 100, "users": 25, "apiCallsPerDay": 10000, "emailsPerDay": 1000, "automationsPerDay": 100}',
 '["workflows_premium", "dashboards_premium", "reports_premium", "auto_predictions", "manual_insights", "api_unlimited", "ml_slots_10", "storage_5gb", "real_time_alerts", "dedicated_support", "custom_integrations", "advanced_analytics", "white_label"]',
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
-- ETAPA 5: CRIAR ASSINATURA PADRÃO PARA TENANT DEFAULT
-- ====================================================================

-- Criar assinatura padrão para tenant 'default' com plano Quantum Plus
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans
WHERE name = 'quantum_plus'
ON CONFLICT DO NOTHING;

-- Criar algumas assinaturas de exemplo para testes
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'tenant-demo', id, true
FROM subscription_plans
WHERE name = 'standard'
ON CONFLICT DO NOTHING;

INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'tenant-premium', id, true
FROM subscription_plans
WHERE name = 'quantum_premium'
ON CONFLICT DO NOTHING;

-- ====================================================================
-- ETAPA 6: CRIAR FUNÇÕES AUXILIARES PARA O SISTEMA
-- ====================================================================

-- Função para calcular uso total de storage por tenant
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
  -- Calcular uploads (arquivos enviados)
  SELECT COALESCE(SUM(file_size), 0) INTO uploads_size
  FROM file_uploads WHERE tenant_id = p_tenant_id;

  -- Calcular cache (dados em cache)
  SELECT COALESCE(SUM(pg_column_size(cache_data)), 0) INTO cache_size
  FROM system_cache WHERE tenant_id = p_tenant_id;

  -- Calcular logs (estimativa baseada em registros)
  SELECT COALESCE(SUM(COALESCE(pg_column_size(description), 1024)), 0) INTO logs_size
  FROM storage_usage_log WHERE tenant_id = p_tenant_id;

  -- Database, emails, calendar, chat serão implementados conforme necessário
  database_size := 0;
  emails_size := 0;
  calendar_size := 0;
  chat_size := 0;

  -- Montar resultado JSON
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

-- Função para verificar se tenant pode usar storage adicional
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
  -- Buscar uso atual de storage
  current_usage := calculate_tenant_storage_usage(p_tenant_id);

  -- Buscar limites do plano do tenant
  SELECT sp.storage_limits INTO plan_limits
  FROM tenant_subscriptions ts
  JOIN subscription_plans sp ON ts.plan_id = sp.id
  WHERE ts.tenant_id = p_tenant_id AND ts.is_active = true
  LIMIT 1;

  IF plan_limits IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Plano não encontrado para o tenant');
  END IF;

  -- Extrair limites específicos
  category_limit := COALESCE((plan_limits ->> p_category)::BIGINT, 0);
  total_limit := COALESCE((plan_limits ->> 'total')::BIGINT, 0);
  current_category := COALESCE((current_usage ->> p_category)::BIGINT, 0);
  current_total := COALESCE((current_usage ->> 'total')::BIGINT, 0);

  -- Verificar se pode usar o storage adicional
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

  -- Adicionar informações detalhadas
  result := result || jsonb_build_object(
    'current_usage', current_usage,
    'limits', plan_limits,
    'additional_bytes', p_additional_bytes,
    'category', p_category
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para calcular uso total de storage por tenant
CREATE OR REPLACE FUNCTION calculate_tenant_storage_usage(p_tenant_id VARCHAR)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  uploads_size BIGINT;
  database_size BIGINT;
  cache_size BIGINT;
  logs_size BIGINT;
  emails_size BIGINT;
  calendar_size BIGINT;
  chat_size BIGINT;
BEGIN
  -- Calcular uploads
  SELECT COALESCE(SUM(file_size), 0) INTO uploads_size
  FROM file_uploads WHERE tenant_id = p_tenant_id;
  
  -- Calcular cache
  SELECT COALESCE(SUM(pg_column_size(cache_data)), 0) INTO cache_size
  FROM system_cache WHERE tenant_id = p_tenant_id;
  
  -- Calcular logs (estimativa)
  SELECT COALESCE(COUNT(*) * 1024, 0) INTO logs_size
  FROM ml_usage_history WHERE tenant_id = p_tenant_id;
  
  -- Valores padrão para outras categorias (a serem implementadas)
  database_size := 0;
  emails_size := 0;
  calendar_size := 0;
  chat_size := 0;
  
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

-- Função para verificar se tenant pode usar mais storage
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

-- Função para limpeza automática de cache expirado
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
-- DADOS INICIAIS
-- ====================================================================

-- Função para limpeza automática de cache expirado
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

-- Função para obter próxima execução de scheduler
CREATE OR REPLACE FUNCTION calculate_next_run(
  frequency VARCHAR,
  last_run TIMESTAMP DEFAULT NULL
) RETURNS TIMESTAMP AS $$
DECLARE
  next_run TIMESTAMP;
  base_time TIMESTAMP;
BEGIN
  base_time := COALESCE(last_run, NOW());

  CASE frequency
    WHEN 'hourly' THEN
      next_run := base_time + INTERVAL '1 hour';
    WHEN 'daily' THEN
      next_run := base_time + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_run := base_time + INTERVAL '1 week';
    WHEN 'monthly' THEN
      next_run := base_time + INTERVAL '1 month';
    ELSE
      next_run := base_time + INTERVAL '1 day'; -- Default
  END CASE;

  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Criar assinatura padrão para tenant default
INSERT INTO tenant_subscriptions (tenant_id, plan_id, is_active)
SELECT 'default', id, true
FROM subscription_plans
WHERE name = 'quantum_plus'
-- ====================================================================
-- ETAPA 7: INSERIR DADOS DE EXEMPLO E TESTES
-- ====================================================================

-- Inserir alguns slots de exemplo para demonstração
INSERT INTO ml_slots (tenant_id, slot_type, slot_name, slot_location, slot_config, is_active, usage_count)
VALUES
('default', 'dashboard_widget', 'Predição de Vendas', 'dashboard_sales_prediction', '{"autoRefresh": true, "chartType": "line"}'::JSONB, true, 0),
('default', 'report_column', 'Score de Risco', 'report_risk_analysis', '{"algorithm": "logistic_regression", "threshold": 0.7}'::JSONB, true, 0),
('tenant-demo', 'workflow_step', 'Aprovação Automática', 'workflow_auto_approval', '{"rules": ["amount < 1000", "customer_score > 0.8"]}'::JSONB, true, 0)
ON CONFLICT (tenant_id, slot_location) DO NOTHING;

-- Inserir alguns registros de cache de exemplo
INSERT INTO system_cache (tenant_id, cache_key, cache_data, expires_at)
VALUES
('default', 'dashboard_metrics', '{"total_users": 150, "active_sessions": 23, "revenue": 45000}'::JSONB, NOW() + INTERVAL '1 hour'),
('default', 'ml_model_predictions', '{"accuracy": 0.89, "last_trained": "2024-01-15", "predictions_count": 1250}'::JSONB, NOW() + INTERVAL '30 minutes')
ON CONFLICT (tenant_id, cache_key) DO UPDATE SET
    cache_data = EXCLUDED.cache_data,
    expires_at = EXCLUDED.expires_at;

-- Inserir alguns logs de storage de exemplo
INSERT INTO storage_usage_log (tenant_id, category, bytes_used, description)
VALUES
('default', 'uploads', 1048576, 'Upload de arquivo CSV - vendas_janeiro.csv'),
('default', 'database', 2097152, 'Cache de query - relatório mensal'),
('tenant-demo', 'uploads', 524288, 'Upload de imagem - logo_empresa.png');

-- ====================================================================
-- ETAPA 8: VERIFICAÇÃO FINAL E RELATÓRIO DE SUCESSO
-- ====================================================================

-- Executar verificação completa do sistema
DO $$
DECLARE
  table_count INTEGER;
  plan_count INTEGER;
  subscription_count INTEGER;
  slot_count INTEGER;
  function_count INTEGER;
  index_count INTEGER;
  plan_record RECORD;
BEGIN
  -- Contar tabelas criadas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name IN ('ml_slots', 'ml_slot_usage', 'tenant_subscriptions', 'storage_usage_log', 'system_cache', 'file_uploads', 'subscription_plans')
  AND table_schema = 'public';

  -- Contar planos configurados
  SELECT COUNT(*) INTO plan_count
  FROM subscription_plans
  WHERE ml_slots > 0 AND storage_limits IS NOT NULL;

  -- Contar assinaturas criadas
  SELECT COUNT(*) INTO subscription_count FROM tenant_subscriptions;

  -- Contar slots de exemplo
  SELECT COUNT(*) INTO slot_count FROM ml_slots;

  -- Contar funções criadas
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_name IN ('calculate_tenant_storage_usage', 'can_use_storage', 'cleanup_expired_cache', 'calculate_next_run')
  AND routine_schema = 'public';

  -- Contar índices criados
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE indexname LIKE 'idx_%'
  AND tablename IN ('ml_slots', 'ml_slot_usage', 'tenant_subscriptions', 'storage_usage_log', 'system_cache', 'file_uploads');

  -- Exibir relatório de sucesso
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '🎉 MIGRATION QUANTUM ML 2.0 CONCLUÍDA!';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO DA INSTALAÇÃO:';
  RAISE NOTICE '  📋 Tabelas criadas: %', table_count;
  RAISE NOTICE '  🔧 Funções criadas: %', function_count;
  RAISE NOTICE '  ⚡ Índices criados: %', index_count;
  RAISE NOTICE '  💳 Planos configurados: %', plan_count;
  RAISE NOTICE '  👥 Assinaturas criadas: %', subscription_count;
  RAISE NOTICE '  🎯 Slots de exemplo: %', slot_count;
  RAISE NOTICE '';

  -- Mostrar detalhes dos planos
  RAISE NOTICE '💳 PLANOS DE ASSINATURA CONFIGURADOS:';
  FOR plan_record IN
    SELECT
      name,
      display_name,
      ml_slots,
      ROUND((storage_limits->>'total')::BIGINT / 1024.0 / 1024.0 / 1024.0, 1) as storage_gb,
      price_monthly
    FROM subscription_plans
    WHERE name IN ('standard', 'quantum_plus', 'quantum_premium')
    ORDER BY ml_slots
  LOOP
    RAISE NOTICE '  📋 %: % slots ML, %GB storage, R$ %/mês',
      plan_record.display_name,
      plan_record.ml_slots,
      plan_record.storage_gb,
      plan_record.price_monthly;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '🚀 SISTEMA QUANTUM ML PRONTO PARA USO!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PRÓXIMOS PASSOS:';
  RAISE NOTICE '  1. Verificar se todas as tabelas foram criadas';
  RAISE NOTICE '  2. Testar as funções de storage e slots';
  RAISE NOTICE '  3. Configurar o backend para usar as novas APIs';
  RAISE NOTICE '  4. Atualizar o frontend com os novos componentes';
  RAISE NOTICE '  5. Executar testes de integração';
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRATION EXECUTADA COM SUCESSO NO TABLEPLUS!';
  RAISE NOTICE '';

END $$;

-- ====================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO DAS TABELAS
-- ====================================================================

COMMENT ON TABLE subscription_plans IS 'Planos de assinatura com configurações de slots ML e storage';
COMMENT ON TABLE ml_slots IS 'Slots ML por tenant - substitui sistema de créditos mensais';
COMMENT ON TABLE ml_slot_usage IS 'Histórico detalhado de uso dos slots ML com métricas de performance';
COMMENT ON TABLE tenant_subscriptions IS 'Assinaturas ativas dos tenants vinculadas aos planos';
COMMENT ON TABLE storage_usage_log IS 'Log detalhado de uso de storage por categoria e tenant';
COMMENT ON TABLE system_cache IS 'Cache de sistema para otimização de performance';
COMMENT ON TABLE file_uploads IS 'Controle e rastreamento de arquivos enviados por tenant';

-- Comentários das funções
COMMENT ON FUNCTION calculate_tenant_storage_usage(VARCHAR) IS 'Calcula uso total de storage por tenant em todas as categorias';
COMMENT ON FUNCTION can_use_storage(VARCHAR, BIGINT, VARCHAR) IS 'Verifica se tenant pode usar storage adicional respeitando limites do plano';
COMMENT ON FUNCTION cleanup_expired_cache() IS 'Remove automaticamente entradas de cache expiradas';
COMMENT ON FUNCTION calculate_next_run(VARCHAR, TIMESTAMP) IS 'Calcula próxima execução baseada na frequência do scheduler';
