-- =====================================================
-- SEEDER: Predições Automáticas Padrão
-- Descrição: Templates de predições para novos tenants
-- Data: 2025-08-14
-- =====================================================

-- Criar tabela temporária para templates de predições
CREATE TEMP TABLE prediction_templates (
    prediction_type VARCHAR(50),
    prediction_name VARCHAR(100),
    description TEXT,
    schedule_frequency VARCHAR(20),
    schedule_time TIME,
    data_source_config JSONB,
    output_config JSONB
);

-- Inserir templates de predições
INSERT INTO prediction_templates VALUES

-- PREVISÃO DE VENDAS
(
    'sales_forecast',
    'Previsão de Vendas Diária',
    'Predição automática de vendas baseada em histórico e tendências',
    'daily',
    '09:00:00',
    '{
        "source_type": "database",
        "table": "sales_data",
        "date_field": "sale_date",
        "value_field": "total_amount",
        "lookback_days": 90,
        "forecast_days": 30,
        "filters": {
            "status": "completed"
        }
    }'::jsonb,
    '{
        "notifications": {
            "email": true,
            "dashboard": true,
            "webhook": false
        },
        "thresholds": {
            "significant_change": 0.15,
            "alert_on_decline": true
        },
        "format": {
            "include_confidence": true,
            "include_factors": true
        }
    }'::jsonb
),

-- PREDIÇÃO DE CHURN
(
    'churn_prediction',
    'Análise de Churn Semanal',
    'Identificação de clientes com risco de cancelamento',
    'weekly',
    '08:00:00',
    '{
        "source_type": "database",
        "table": "customers",
        "features": [
            "last_login_days",
            "usage_frequency",
            "support_tickets",
            "payment_delays",
            "feature_adoption"
        ],
        "lookback_days": 180,
        "risk_threshold": 0.7
    }'::jsonb,
    '{
        "notifications": {
            "email": true,
            "dashboard": true,
            "webhook": true
        },
        "actions": {
            "create_tasks": true,
            "segment_customers": true,
            "trigger_campaigns": false
        },
        "export": {
            "csv": true,
            "include_recommendations": true
        }
    }'::jsonb
),

-- PREVISÃO DE DEMANDA
(
    'demand_forecast',
    'Previsão de Demanda de Produtos',
    'Predição de demanda por produto/categoria',
    'daily',
    '10:00:00',
    '{
        "source_type": "database",
        "table": "product_sales",
        "group_by": "product_category",
        "date_field": "sale_date",
        "quantity_field": "quantity_sold",
        "lookback_days": 60,
        "forecast_days": 14,
        "seasonal_adjustment": true
    }'::jsonb,
    '{
        "notifications": {
            "email": false,
            "dashboard": true,
            "webhook": false
        },
        "alerts": {
            "low_stock_prediction": true,
            "high_demand_spike": true
        },
        "integration": {
            "inventory_system": false,
            "procurement_system": false
        }
    }'::jsonb
),

-- FLUXO DE CAIXA
(
    'cash_flow',
    'Projeção de Fluxo de Caixa',
    'Predição de entradas e saídas financeiras',
    'weekly',
    '07:30:00',
    '{
        "source_type": "database",
        "tables": {
            "receivables": "accounts_receivable",
            "payables": "accounts_payable",
            "recurring": "recurring_transactions"
        },
        "date_field": "due_date",
        "amount_field": "amount",
        "lookback_days": 120,
        "forecast_days": 60
    }'::jsonb,
    '{
        "notifications": {
            "email": true,
            "dashboard": true,
            "webhook": false
        },
        "alerts": {
            "negative_balance": true,
            "cash_shortage": true,
            "threshold_amount": 10000
        },
        "reports": {
            "weekly_summary": true,
            "monthly_projection": true
        }
    }'::jsonb
),

-- ANÁLISE DE PERFORMANCE
(
    'performance_analysis',
    'Análise de Performance Mensal',
    'Avaliação automática de KPIs e métricas de performance',
    'monthly',
    '06:00:00',
    '{
        "source_type": "multiple",
        "kpis": [
            "revenue_growth",
            "customer_acquisition",
            "customer_retention",
            "operational_efficiency",
            "profit_margin"
        ],
        "comparison_periods": ["previous_month", "same_month_last_year"],
        "benchmark_data": true
    }'::jsonb,
    '{
        "notifications": {
            "email": true,
            "dashboard": true,
            "webhook": true
        },
        "reports": {
            "executive_summary": true,
            "detailed_analysis": true,
            "recommendations": true
        },
        "distribution": {
            "management_team": true,
            "department_heads": false
        }
    }'::jsonb
);

-- Função para criar predições padrão para um tenant
CREATE OR REPLACE FUNCTION create_default_predictions_for_tenant(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    template_record RECORD;
    created_count INTEGER := 0;
BEGIN
    -- Inserir predições baseadas nos templates
    FOR template_record IN 
        SELECT * FROM prediction_templates
    LOOP
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
        ) VALUES (
            p_tenant_id,
            template_record.prediction_type,
            template_record.prediction_name,
            template_record.description,
            template_record.schedule_frequency,
            template_record.schedule_time,
            template_record.data_source_config,
            template_record.output_config,
            calculate_next_run(
                template_record.schedule_frequency,
                template_record.schedule_time
            ),
            false  -- Inicialmente inativo, usuário deve ativar
        )
        ON CONFLICT (tenant_id, prediction_name) DO NOTHING;
        
        created_count := created_count + 1;
    END LOOP;
    
    RETURN created_count;
END;
$$ LANGUAGE plpgsql;

-- Limpar tabela temporária
DROP TABLE prediction_templates;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Templates de predições automáticas criados com sucesso!';
    RAISE NOTICE '📋 Use create_default_predictions_for_tenant(tenant_id) para criar predições para um tenant';
END $$;
