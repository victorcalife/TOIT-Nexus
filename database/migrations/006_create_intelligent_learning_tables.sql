-- =====================================================
-- INTELLIGENT LEARNING SYSTEM TABLES
-- Sistema de aprendizado que evolui com dados e tempo
-- =====================================================

-- Tabela principal para dados de aprendizado inteligente
CREATE TABLE IF NOT EXISTS intelligent_learning_data (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    behavior_patterns JSONB NOT NULL DEFAULT '{}',
    intelligence_metrics JSONB NOT NULL DEFAULT '{}',
    temporal_knowledge JSONB NOT NULL DEFAULT '{}',
    quantum_correlations JSONB DEFAULT '{}',
    learning_version VARCHAR(10) NOT NULL DEFAULT '3.0.0',
    total_interactions INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 0.5000,
    learning_velocity DECIMAL(5,4) DEFAULT 0.0000,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_intelligent_learning_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para histórico de interações do usuário
CREATE TABLE IF NOT EXISTS user_interaction_history (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    user_id INTEGER,
    interaction_type VARCHAR(50) NOT NULL,
    interaction_data JSONB NOT NULL,
    features_extracted JSONB,
    success BOOLEAN DEFAULT false,
    duration_ms INTEGER DEFAULT 0,
    complexity_score DECIMAL(5,4) DEFAULT 0.0000,
    quantum_processed BOOLEAN DEFAULT false,
    learning_applied BOOLEAN DEFAULT false,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interaction_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para padrões de comportamento descobertos
CREATE TABLE IF NOT EXISTS behavior_patterns (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    pattern_type VARCHAR(50) NOT NULL,
    pattern_name VARCHAR(100) NOT NULL,
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    frequency INTEGER DEFAULT 1,
    first_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantum_derived BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    
    CONSTRAINT fk_patterns_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para conhecimento temporal
CREATE TABLE IF NOT EXISTS temporal_knowledge (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    time_period VARCHAR(20) NOT NULL, -- 'short', 'medium', 'long'
    period_key BIGINT NOT NULL,
    knowledge_data JSONB NOT NULL,
    pattern_strength DECIMAL(5,4) DEFAULT 0.0000,
    prediction_accuracy DECIMAL(5,4) DEFAULT 0.0000,
    quantum_enhanced BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_temporal_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para modelos de aprendizado por domínio
CREATE TABLE IF NOT EXISTS domain_learning_models (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    domain_name VARCHAR(50) NOT NULL,
    model_data JSONB NOT NULL,
    model_version VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    accuracy DECIMAL(5,4) DEFAULT 0.5000,
    last_training TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    training_samples INTEGER DEFAULT 0,
    quantum_optimized BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    
    CONSTRAINT fk_domain_models_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_tenant_domain 
        UNIQUE (tenant_id, domain_name)
);

-- Tabela para correlações quânticas descobertas
CREATE TABLE IF NOT EXISTS quantum_correlations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    correlation_type VARCHAR(50) NOT NULL,
    entities JSONB NOT NULL, -- Entidades correlacionadas
    correlation_strength DECIMAL(5,4) NOT NULL,
    quantum_algorithm VARCHAR(20) NOT NULL, -- 'qaoa', 'grover', 'sqd'
    entanglement_data JSONB,
    discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_count INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    
    CONSTRAINT fk_correlations_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para predições inteligentes
CREATE TABLE IF NOT EXISTS intelligent_predictions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    quantum_derived BOOLEAN DEFAULT false,
    algorithm_used VARCHAR(50),
    context_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_date TIMESTAMP,
    verified BOOLEAN,
    verification_date TIMESTAMP,
    accuracy_score DECIMAL(5,4),
    
    CONSTRAINT fk_predictions_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para evolução da inteligência
CREATE TABLE IF NOT EXISTS intelligence_evolution (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    measurement_date DATE NOT NULL,
    accuracy DECIMAL(5,4) NOT NULL,
    adaptability DECIMAL(5,4) NOT NULL,
    prediction_power DECIMAL(5,4) NOT NULL,
    learning_speed DECIMAL(5,4) NOT NULL,
    quantum_efficiency DECIMAL(5,4) NOT NULL,
    overall_intelligence DECIMAL(5,4) NOT NULL,
    interactions_processed INTEGER DEFAULT 0,
    patterns_discovered INTEGER DEFAULT 0,
    quantum_operations INTEGER DEFAULT 0,
    
    CONSTRAINT fk_evolution_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_tenant_date 
        UNIQUE (tenant_id, measurement_date)
);

-- Tabela para adaptações do sistema
CREATE TABLE IF NOT EXISTS system_adaptations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    adaptation_type VARCHAR(50) NOT NULL,
    domain VARCHAR(50) NOT NULL,
    adaptation_data JSONB NOT NULL,
    trigger_event JSONB,
    impact_score DECIMAL(5,4) DEFAULT 0.0000,
    quantum_enhanced BOOLEAN DEFAULT false,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effectiveness DECIMAL(5,4),
    measured_at TIMESTAMP,
    
    CONSTRAINT fk_adaptations_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_intelligent_learning_tenant 
    ON intelligent_learning_data(tenant_id);

CREATE INDEX IF NOT EXISTS idx_interaction_history_tenant_type 
    ON user_interaction_history(tenant_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_interaction_history_timestamp 
    ON user_interaction_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_behavior_patterns_tenant_type 
    ON behavior_patterns(tenant_id, pattern_type);

CREATE INDEX IF NOT EXISTS idx_behavior_patterns_active 
    ON behavior_patterns(tenant_id) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_temporal_knowledge_tenant_period 
    ON temporal_knowledge(tenant_id, time_period, period_key);

CREATE INDEX IF NOT EXISTS idx_domain_models_tenant_domain 
    ON domain_learning_models(tenant_id, domain_name);

CREATE INDEX IF NOT EXISTS idx_quantum_correlations_tenant_type 
    ON quantum_correlations(tenant_id, correlation_type);

CREATE INDEX IF NOT EXISTS idx_quantum_correlations_active 
    ON quantum_correlations(tenant_id) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_predictions_tenant_type 
    ON intelligent_predictions(tenant_id, prediction_type);

CREATE INDEX IF NOT EXISTS idx_predictions_target_date 
    ON intelligent_predictions(target_date) WHERE target_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evolution_tenant_date 
    ON intelligence_evolution(tenant_id, measurement_date DESC);

CREATE INDEX IF NOT EXISTS idx_adaptations_tenant_domain 
    ON system_adaptations(tenant_id, domain);

-- Índices para queries complexas
CREATE INDEX IF NOT EXISTS idx_interaction_quantum_processed 
    ON user_interaction_history(tenant_id, quantum_processed, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_patterns_confidence 
    ON behavior_patterns(tenant_id, confidence_score DESC) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_correlations_strength 
    ON quantum_correlations(tenant_id, correlation_strength DESC) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_predictions_confidence 
    ON intelligent_predictions(tenant_id, confidence_score DESC);

-- =====================================================
-- TRIGGERS PARA AUTOMAÇÃO
-- =====================================================

-- Trigger para atualizar timestamp de learning data
CREATE OR REPLACE FUNCTION update_learning_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learning_timestamp
    BEFORE UPDATE ON intelligent_learning_data
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_timestamp();

-- Trigger para atualizar temporal knowledge
CREATE OR REPLACE FUNCTION update_temporal_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_temporal_timestamp
    BEFORE UPDATE ON temporal_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_temporal_knowledge_timestamp();

-- Trigger para calcular inteligência geral
CREATE OR REPLACE FUNCTION calculate_overall_intelligence()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overall_intelligence = (
        NEW.accuracy + 
        NEW.adaptability + 
        NEW.prediction_power + 
        NEW.learning_speed + 
        NEW.quantum_efficiency
    ) / 5.0;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_intelligence
    BEFORE INSERT OR UPDATE ON intelligence_evolution
    FOR EACH ROW
    EXECUTE FUNCTION calculate_overall_intelligence();

-- =====================================================
-- VIEWS PARA ANÁLISE
-- =====================================================

-- View para dashboard de inteligência
CREATE OR REPLACE VIEW intelligence_dashboard AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    ild.total_interactions,
    ild.success_rate,
    ild.learning_velocity,
    ie.accuracy,
    ie.adaptability,
    ie.prediction_power,
    ie.learning_speed,
    ie.quantum_efficiency,
    ie.overall_intelligence,
    (SELECT COUNT(*) FROM behavior_patterns bp WHERE bp.tenant_id = t.id AND bp.active = true) as active_patterns,
    (SELECT COUNT(*) FROM quantum_correlations qc WHERE qc.tenant_id = t.id AND qc.active = true) as quantum_correlations_count,
    (SELECT COUNT(*) FROM intelligent_predictions ip WHERE ip.tenant_id = t.id AND ip.created_at > CURRENT_DATE - INTERVAL '7 days') as recent_predictions
FROM tenants t
LEFT JOIN intelligent_learning_data ild ON t.id = ild.tenant_id
LEFT JOIN intelligence_evolution ie ON t.id = ie.tenant_id AND ie.measurement_date = CURRENT_DATE;

-- View para análise de padrões
CREATE OR REPLACE VIEW pattern_analysis AS
SELECT 
    tenant_id,
    pattern_type,
    COUNT(*) as pattern_count,
    AVG(confidence_score) as avg_confidence,
    MAX(confidence_score) as max_confidence,
    COUNT(*) FILTER (WHERE quantum_derived = true) as quantum_patterns,
    MIN(first_detected) as first_pattern_date,
    MAX(last_seen) as latest_pattern_date
FROM behavior_patterns
WHERE active = true
GROUP BY tenant_id, pattern_type;

-- View para evolução temporal da inteligência
CREATE OR REPLACE VIEW intelligence_trends AS
SELECT 
    tenant_id,
    measurement_date,
    overall_intelligence,
    LAG(overall_intelligence) OVER (PARTITION BY tenant_id ORDER BY measurement_date) as previous_intelligence,
    overall_intelligence - LAG(overall_intelligence) OVER (PARTITION BY tenant_id ORDER BY measurement_date) as intelligence_growth,
    quantum_efficiency,
    interactions_processed,
    patterns_discovered
FROM intelligence_evolution
ORDER BY tenant_id, measurement_date DESC;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE intelligent_learning_data IS 'Dados principais do sistema de aprendizado inteligente por tenant';
COMMENT ON TABLE user_interaction_history IS 'Histórico completo de interações do usuário para aprendizado';
COMMENT ON TABLE behavior_patterns IS 'Padrões de comportamento descobertos pelo sistema';
COMMENT ON TABLE temporal_knowledge IS 'Conhecimento temporal em diferentes escalas de tempo';
COMMENT ON TABLE domain_learning_models IS 'Modelos de aprendizado específicos por domínio';
COMMENT ON TABLE quantum_correlations IS 'Correlações descobertas usando algoritmos quânticos';
COMMENT ON TABLE intelligent_predictions IS 'Predições geradas pelo sistema inteligente';
COMMENT ON TABLE intelligence_evolution IS 'Evolução das métricas de inteligência ao longo do tempo';
COMMENT ON TABLE system_adaptations IS 'Adaptações automáticas realizadas pelo sistema';

COMMENT ON VIEW intelligence_dashboard IS 'Dashboard consolidado da inteligência do sistema por tenant';
COMMENT ON VIEW pattern_analysis IS 'Análise estatística dos padrões descobertos';
COMMENT ON VIEW intelligence_trends IS 'Tendências de evolução da inteligência ao longo do tempo';
