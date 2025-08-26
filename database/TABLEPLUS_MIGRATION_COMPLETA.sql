-- ====================================================================
-- MIGRAÇÃO COMPLETA TOIT NEXUS - TABLEPLUS
-- Execute este script completo no TablePlus para configurar o banco
-- ====================================================================

-- Verificar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- ETAPA 1: SCHEMA PRINCIPAL (se não existir)
-- ====================================================================

-- Criar tipos se não existirem
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'user', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'suspended', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('free', 'standard', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- ETAPA 2: VERIFICAR E ADICIONAR COLUNA DATA À TABELA USER_SESSIONS
-- ====================================================================

-- Verificar se a tabela user_sessions existe e adicionar coluna data se necessário
DO $$
BEGIN
    -- Verificar se a tabela user_sessions existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        -- Verificar se a coluna data já existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'user_sessions' AND column_name = 'data') THEN
            -- Adicionar coluna data
            ALTER TABLE user_sessions ADD COLUMN data JSONB DEFAULT '{}';
            RAISE NOTICE 'Coluna data adicionada à tabela user_sessions';
        ELSE
            RAISE NOTICE 'Coluna data já existe na tabela user_sessions';
        END IF;
        
        -- Criar índices se não existirem
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_user_id') THEN
            CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
            RAISE NOTICE 'Índice idx_user_sessions_user_id criado';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_session_token') THEN
            CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
            RAISE NOTICE 'Índice idx_user_sessions_session_token criado';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela user_sessions não encontrada - será criada no schema principal';
    END IF;
END $$;

-- ====================================================================
-- ETAPA 3: CRIAR TABELA SUBSCRIPTION_PLANS (QUANTUM ML)
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
-- ETAPA 4: CRIAR TABELAS DO SISTEMA QUANTUM ML
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
-- ETAPA 5: CRIAR ÍNDICES PARA PERFORMANCE
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
-- ETAPA 6: INSERIR PLANOS DE ASSINATURA
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
-- ETAPA 7: VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name IN (
        'subscription_plans', 'ml_slots', 'ml_slot_usage', 
        'tenant_subscriptions', 'storage_usage_log', 
        'system_cache', 'file_uploads'
    );
    
    RAISE NOTICE 'Tabelas Quantum ML criadas: % de 7', table_count;
    
    -- Verificar coluna data em user_sessions
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'user_sessions' AND column_name = 'data') THEN
        RAISE NOTICE 'Coluna data confirmada na tabela user_sessions';
    ELSE
        RAISE NOTICE 'ATENÇÃO: Coluna data não encontrada na tabela user_sessions';
    END IF;
END $$;

-- ====================================================================
-- MIGRAÇÃO CONCLUÍDA
-- ====================================================================

-- Mensagem final
SELECT 'MIGRAÇÃO TABLEPLUS CONCLUÍDA COM SUCESSO!' as status,
       NOW() as executed_at,
       'Todas as tabelas Quantum ML foram criadas e a coluna data foi adicionada à user_sessions' as details;