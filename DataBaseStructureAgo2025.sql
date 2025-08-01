-- Table Definition
CREATE TABLE "public"."activities" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar,
    "user_id" varchar,
    "action" varchar(100) NOT NULL,
    "entity_type" varchar(50),
    "entity_id" varchar,
    "description" text,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."api_connections" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "base_url" varchar(500) NOT NULL,
    "auth_type" varchar(50) NOT NULL,
    "auth_config" jsonb NOT NULL,
    "headers" jsonb,
    "timeout" int4 DEFAULT 30000,
    "is_active" bool DEFAULT true,
    "last_tested_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "api_connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."business_leads" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "email" varchar(255) NOT NULL,
    "phone" varchar(20),
    "company_name" varchar(200) NOT NULL,
    "cnpj" varchar(18),
    "employee_count" int4,
    "sector" varchar(100),
    "message" text,
    "status" varchar(20) DEFAULT 'new'::character varying,
    "contacted_at" timestamp,
    "notes" text,
    "assigned_to" varchar,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "business_leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."risk_profile";
CREATE TYPE "public"."risk_profile" AS ENUM ('conservative', 'moderate', 'aggressive');

-- Table Definition
CREATE TABLE "public"."client_categories" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "min_investment" numeric(15,2),
    "max_investment" numeric(15,2),
    "risk_profile" "public"."risk_profile",
    "report_frequency" varchar(50),
    "rules" jsonb,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "client_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."risk_profile";
CREATE TYPE "public"."risk_profile" AS ENUM ('conservative', 'moderate', 'aggressive');

-- Table Definition
CREATE TABLE "public"."clients" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "email" varchar,
    "phone" varchar,
    "current_investment" numeric(15,2),
    "risk_profile" "public"."risk_profile",
    "category_id" varchar,
    "metadata" jsonb,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "clients_category_id_client_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."client_categories"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."complete_workflow_executions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "workflow_id" varchar NOT NULL,
    "tenant_id" varchar NOT NULL,
    "status" varchar(50) NOT NULL,
    "started_at" timestamp DEFAULT now(),
    "completed_at" timestamp,
    "execution_log" jsonb,
    "error_message" text,
    "triggered_by" varchar(255),
    CONSTRAINT "complete_workflow_executions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "complete_workflow_executions_workflow_id_complete_workflows_id_" FOREIGN KEY ("workflow_id") REFERENCES "public"."complete_workflows"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."workflow_status";
CREATE TYPE "public"."workflow_status" AS ENUM ('active', 'inactive', 'draft');

-- Table Definition
CREATE TABLE "public"."complete_workflows" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "steps" jsonb NOT NULL,
    "triggers" jsonb NOT NULL,
    "status" "public"."workflow_status" DEFAULT 'draft'::workflow_status,
    "execution_count" int4 DEFAULT 0,
    "last_executed_at" timestamp,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "complete_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "complete_workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."dashboards" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar,
    "name" varchar(200) NOT NULL,
    "description" text,
    "layout" jsonb NOT NULL,
    "widgets" jsonb NOT NULL,
    "is_default" bool DEFAULT false,
    "is_public" bool DEFAULT false,
    "refresh_interval" int4 DEFAULT 300,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "dashboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."database_type";
CREATE TYPE "public"."database_type" AS ENUM ('postgresql', 'mysql', 'mssql', 'oracle', 'sqlite');

-- Table Definition
CREATE TABLE "public"."database_connections" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "type" "public"."database_type" NOT NULL,
    "host" varchar(255) NOT NULL,
    "port" int4 NOT NULL,
    "database" varchar(255) NOT NULL,
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "ssl" bool DEFAULT false,
    "connection_string" text,
    "is_active" bool DEFAULT true,
    "last_tested_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "database_connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."department_type";
CREATE TYPE "public"."department_type" AS ENUM ('sales', 'purchases', 'finance', 'operations', 'hr', 'it', 'marketing', 'custom');

-- Table Definition
CREATE TABLE "public"."departments" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(100) NOT NULL,
    "type" "public"."department_type" NOT NULL,
    "description" text,
    "parent_department_id" varchar,
    "settings" jsonb,
    "data_filters" jsonb,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "departments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."integration_type";
CREATE TYPE "public"."integration_type" AS ENUM ('api', 'database', 'webhook', 'email');

-- Table Definition
CREATE TABLE "public"."integrations" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(100) NOT NULL,
    "type" "public"."integration_type" NOT NULL,
    "config" jsonb NOT NULL,
    "is_active" bool DEFAULT true,
    "last_status" varchar(50) DEFAULT 'unknown'::character varying,
    "last_checked" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "integrations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."invoices" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "subscription_id" varchar,
    "stripe_invoice_id" varchar,
    "invoice_number" varchar(50),
    "status" varchar(20) NOT NULL,
    "amount_due" numeric(10,2) NOT NULL,
    "amount_paid" numeric(10,2) DEFAULT '0'::numeric,
    "currency" varchar(3) DEFAULT 'BRL'::character varying,
    "due_date" timestamp,
    "paid_at" timestamp,
    "hosted_invoice_url" varchar,
    "invoice_pdf" varchar,
    "period_start" timestamp,
    "period_end" timestamp,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id"),
    CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX invoices_stripe_invoice_id_unique ON public.invoices USING btree (stripe_invoice_id);

DROP TYPE IF EXISTS "public"."chart_type";
CREATE TYPE "public"."chart_type" AS ENUM ('bar', 'line', 'pie', 'doughnut', 'area', 'scatter');

-- Table Definition
CREATE TABLE "public"."kpi_dashboards" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "query_builder_id" varchar,
    "chart_type" "public"."chart_type" NOT NULL,
    "chart_config" jsonb NOT NULL,
    "refresh_interval" int4 DEFAULT 300,
    "is_active" bool DEFAULT true,
    "position" jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "kpi_dashboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "kpi_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "kpi_dashboards_query_builder_id_query_builders_id_fk" FOREIGN KEY ("query_builder_id") REFERENCES "public"."query_builders"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."kpi_definitions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "category" varchar(50) NOT NULL,
    "calculation_type" varchar(50) NOT NULL,
    "data_source" jsonb NOT NULL,
    "calculation_formula" text,
    "target_value" numeric(15,2),
    "alert_thresholds" jsonb,
    "adaptation_rules" jsonb,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "kpi_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."module_definitions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL,
    "display_name" varchar NOT NULL,
    "description" text,
    "category" varchar DEFAULT 'core'::character varying,
    "base_price" numeric(10,2) DEFAULT 0.00,
    "price_per_user" numeric(10,2) DEFAULT 0.00,
    "price_model" varchar DEFAULT 'free'::character varying,
    "features" jsonb DEFAULT '[]'::jsonb,
    "limitations" jsonb DEFAULT '{}'::jsonb,
    "dependencies" jsonb DEFAULT '[]'::jsonb,
    "target_user_types" jsonb DEFAULT '[]'::jsonb,
    "is_active" bool DEFAULT true,
    "icon" varchar,
    "color" varchar,
    "sort_order" int4 DEFAULT 0,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX module_definitions_name_unique ON public.module_definitions USING btree (name);

-- Table Definition
CREATE TABLE "public"."module_usage_tracking" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar NOT NULL,
    "module_id" varchar NOT NULL,
    "action" varchar NOT NULL,
    "resource" varchar,
    "resource_id" varchar,
    "usage" int4 DEFAULT 1,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "module_usage_tracking_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    CONSTRAINT "module_usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "module_usage_tracking_module_id_module_definitions_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."module_definitions"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."notifications" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar,
    "user_id" varchar,
    "type" varchar NOT NULL,
    "title" varchar NOT NULL,
    "message" text NOT NULL,
    "data" jsonb,
    "is_read" bool DEFAULT false,
    "read_at" timestamp,
    "action_url" varchar,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."payment_methods" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "stripe_payment_method_id" varchar NOT NULL,
    "type" varchar(50) NOT NULL,
    "card_brand" varchar(20),
    "card_last4" varchar(4),
    "card_exp_month" int4,
    "card_exp_year" int4,
    "is_default" bool DEFAULT false,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "payment_methods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX payment_methods_stripe_payment_method_id_unique ON public.payment_methods USING btree (stripe_payment_method_id);

DROP TYPE IF EXISTS "public"."payment_plan_type";
CREATE TYPE "public"."payment_plan_type" AS ENUM ('individual', 'business', 'enterprise');

-- Table Definition
CREATE TABLE "public"."payment_plans" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar(100) NOT NULL,
    "slug" varchar(50) NOT NULL,
    "type" "public"."payment_plan_type" NOT NULL,
    "description" text,
    "price_monthly" numeric(10,2),
    "price_yearly" numeric(10,2),
    "stripe_price_id_monthly" varchar,
    "stripe_price_id_yearly" varchar,
    "features" jsonb NOT NULL,
    "max_users" int4,
    "max_modules" int4,
    "trial_days" int4 DEFAULT 7,
    "is_active" bool DEFAULT true,
    "sort_order" int4 DEFAULT 0,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX payment_plans_slug_unique ON public.payment_plans USING btree (slug);

DROP TYPE IF EXISTS "public"."payment_status";
CREATE TYPE "public"."payment_status" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'canceled');

-- Table Definition
CREATE TABLE "public"."payment_transactions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "subscription_id" varchar,
    "stripe_payment_intent_id" varchar,
    "stripe_invoice_id" varchar,
    "amount" numeric(10,2) NOT NULL,
    "currency" varchar(3) DEFAULT 'BRL'::character varying,
    "status" "public"."payment_status" NOT NULL,
    "payment_method" varchar(50),
    "failure_reason" text,
    "receipt_url" varchar,
    "metadata" jsonb,
    "processed_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "payment_transactions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id"),
    CONSTRAINT "payment_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX payment_transactions_stripe_payment_intent_id_unique ON public.payment_transactions USING btree (stripe_payment_intent_id);

DROP TYPE IF EXISTS "public"."permission_type";
CREATE TYPE "public"."permission_type" AS ENUM ('read', 'write', 'delete', 'admin');

-- Table Definition
CREATE TABLE "public"."permissions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(100) NOT NULL,
    "resource" varchar(100) NOT NULL,
    "action" "public"."permission_type" NOT NULL,
    "conditions" jsonb,
    "description" text,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."query_builders" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "connection_id" varchar,
    "connection_type" varchar(20) NOT NULL,
    "query_config" jsonb NOT NULL,
    "sql_generated" text,
    "api_endpoint" varchar(500),
    "last_executed_at" timestamp,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "query_builders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "query_builders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."reports" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "template" jsonb NOT NULL,
    "category_id" varchar,
    "data_filters" jsonb,
    "kpi_configuration" jsonb,
    "visualization_settings" jsonb,
    "auto_adapt_rules" jsonb,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "reports_category_id_client_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."client_categories"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."user_role";
CREATE TYPE "public"."user_role" AS ENUM ('super_admin', 'tenant_admin', 'manager', 'employee');

-- Table Definition
CREATE TABLE "public"."role_permissions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "permission_id" varchar NOT NULL,
    "department_id" varchar,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "role_permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id"),
    CONSTRAINT "role_permissions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."saved_queries" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar,
    "name" varchar(200) NOT NULL,
    "description" text,
    "query_config" jsonb NOT NULL,
    "visualization_config" jsonb NOT NULL,
    "last_executed_at" timestamp,
    "execution_count" int4 DEFAULT 0,
    "is_public" bool DEFAULT false,
    "tags" _text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "saved_queries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "saved_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."sessions" (
    "sid" varchar NOT NULL,
    "sess" jsonb NOT NULL,
    "expire" timestamp NOT NULL,
    PRIMARY KEY ("sid")
);


-- Indices
CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);

DROP TYPE IF EXISTS "public"."subscription_status";
CREATE TYPE "public"."subscription_status" AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');

-- Table Definition
CREATE TABLE "public"."subscriptions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "plan_id" varchar NOT NULL,
    "stripe_subscription_id" varchar,
    "stripe_customer_id" varchar NOT NULL,
    "status" "public"."subscription_status" NOT NULL,
    "billing_cycle" varchar(20) NOT NULL,
    "current_period_start" timestamp NOT NULL,
    "current_period_end" timestamp NOT NULL,
    "trial_start" timestamp,
    "trial_end" timestamp,
    "canceled_at" timestamp,
    "cancel_at_period_end" bool DEFAULT false,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "subscriptions_plan_id_payment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."payment_plans"("id"),
    CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX subscriptions_stripe_subscription_id_unique ON public.subscriptions USING btree (stripe_subscription_id);

-- Table Definition
CREATE TABLE "public"."task_comments" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar,
    "task_instance_id" varchar,
    "user_id" varchar,
    "comment" text NOT NULL,
    "is_internal" bool DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "task_comments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "task_comments_task_instance_id_task_instances_id_fk" FOREIGN KEY ("task_instance_id") REFERENCES "public"."task_instances"("id"),
    CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."task_instances" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar,
    "template_id" varchar,
    "assigned_to_id" varchar,
    "assigned_by_id" varchar,
    "title" varchar NOT NULL,
    "description" text,
    "priority" varchar DEFAULT 'medium'::character varying,
    "status" varchar DEFAULT 'pending'::character varying,
    "due_date" timestamp,
    "started_at" timestamp,
    "completed_at" timestamp,
    "completion_data" jsonb,
    "checklist_progress" jsonb,
    "notes" text,
    "attachments" jsonb,
    "reminders_sent" int4 DEFAULT 0,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "task_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "task_instances_template_id_task_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."task_templates"("id"),
    CONSTRAINT "task_instances_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "task_instances_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."task_templates" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar,
    "manager_id" varchar,
    "title" varchar NOT NULL,
    "description" text,
    "category" varchar DEFAULT 'general'::character varying,
    "priority" varchar DEFAULT 'medium'::character varying,
    "estimated_duration" int4,
    "instructions" jsonb NOT NULL,
    "checklist_items" jsonb,
    "required_fields" jsonb,
    "schedule" jsonb,
    "assigned_to" jsonb,
    "tags" jsonb,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "task_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "task_templates_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."tenant_modules" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "module_id" varchar NOT NULL,
    "is_enabled" bool DEFAULT true,
    "plan" varchar DEFAULT 'free'::character varying,
    "max_users" int4,
    "current_users" int4 DEFAULT 0,
    "usage_limits" jsonb DEFAULT '{}'::jsonb,
    "current_usage" jsonb DEFAULT '{}'::jsonb,
    "custom_config" jsonb DEFAULT '{}'::jsonb,
    "billing_cycle" varchar DEFAULT 'monthly'::character varying,
    "next_billing_date" timestamp,
    "trial_ends_at" timestamp,
    "activated_at" timestamp DEFAULT now(),
    "activated_by" varchar,
    "suspended_at" timestamp,
    "suspended_reason" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "tenant_modules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    CONSTRAINT "tenant_modules_module_id_module_definitions_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."module_definitions"("id") ON DELETE CASCADE,
    CONSTRAINT "tenant_modules_activated_by_users_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."tenant_status";
CREATE TYPE "public"."tenant_status" AS ENUM ('active', 'inactive', 'suspended');

-- Table Definition
CREATE TABLE "public"."tenants" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar(200) NOT NULL,
    "slug" varchar(100) NOT NULL,
    "domain" varchar(255),
    "logo" varchar,
    "settings" jsonb,
    "status" "public"."tenant_status" DEFAULT 'active'::tenant_status,
    "subscription_plan" varchar(50) DEFAULT 'basic'::character varying,
    "subscription_expires_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX tenants_slug_unique ON public.tenants USING btree (slug);

-- Table Definition
CREATE TABLE "public"."uploaded_files" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "user_id" varchar NOT NULL,
    "original_name" varchar(255) NOT NULL,
    "filename" varchar(255) NOT NULL,
    "mimetype" varchar(100) NOT NULL,
    "size" int4 NOT NULL,
    "path" varchar(500) NOT NULL,
    "is_processed" bool DEFAULT false,
    "metadata" jsonb,
    "uploaded_at" timestamp DEFAULT now(),
    CONSTRAINT "uploaded_files_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "uploaded_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."user_departments" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "user_id" varchar NOT NULL,
    "department_id" varchar NOT NULL,
    "is_primary" bool DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "user_departments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "user_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."user_module_access" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "user_id" varchar NOT NULL,
    "module_id" varchar NOT NULL,
    "tenant_id" varchar NOT NULL,
    "has_access" bool DEFAULT true,
    "access_level" varchar DEFAULT 'basic'::character varying,
    "permissions" jsonb DEFAULT '[]'::jsonb,
    "usage_limit" int4,
    "current_usage" int4 DEFAULT 0,
    "features" jsonb DEFAULT '[]'::jsonb,
    "restrictions" jsonb DEFAULT '{}'::jsonb,
    "last_used_at" timestamp,
    "granted_at" timestamp DEFAULT now(),
    "granted_by" varchar,
    "expires_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "user_module_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_module_access_module_id_module_definitions_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."module_definitions"("id") ON DELETE CASCADE,
    CONSTRAINT "user_module_access_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    CONSTRAINT "user_module_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."user_permissions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "user_id" varchar NOT NULL,
    "permission_id" varchar NOT NULL,
    "department_id" varchar,
    "granted" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id"),
    CONSTRAINT "user_permissions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."user_role";
CREATE TYPE "public"."user_role" AS ENUM ('super_admin', 'tenant_admin', 'manager', 'employee');

-- Table Definition
CREATE TABLE "public"."users" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "cpf" varchar(11) NOT NULL,
    "email" varchar,
    "password" varchar NOT NULL,
    "first_name" varchar,
    "last_name" varchar,
    "phone" varchar,
    "profile_image_url" varchar,
    "role" "public"."user_role" DEFAULT 'employee'::user_role,
    "tenant_id" varchar,
    "is_active" bool DEFAULT true,
    "last_login_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX users_cpf_unique ON public.users USING btree (cpf);
CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);

-- Table Definition
CREATE TABLE "public"."webhook_events" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "stripe_event_id" varchar NOT NULL,
    "event_type" varchar(100) NOT NULL,
    "api_version" varchar(20),
    "processed" bool DEFAULT false,
    "processing_error" text,
    "data" jsonb NOT NULL,
    "received_at" timestamp DEFAULT now(),
    "processed_at" timestamp,
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX webhook_events_stripe_event_id_unique ON public.webhook_events USING btree (stripe_event_id);

-- Table Definition
CREATE TABLE "public"."webhook_logs" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar,
    "webhook_id" varchar(255) NOT NULL,
    "payload" jsonb NOT NULL,
    "headers" jsonb,
    "processed" bool DEFAULT false,
    "processing_result" jsonb,
    "received_at" timestamp DEFAULT now(),
    CONSTRAINT "webhook_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."workflow_executions" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "workflow_id" varchar NOT NULL,
    "client_id" varchar,
    "status" varchar(50) NOT NULL,
    "result" jsonb,
    "error" text,
    "executed_at" timestamp DEFAULT now(),
    CONSTRAINT "workflow_executions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id"),
    CONSTRAINT "workflow_executions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id"),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."workflow_rules" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "workflow_id" varchar,
    "name" varchar(200) NOT NULL,
    "description" text,
    "trigger_conditions" jsonb NOT NULL,
    "actions" jsonb NOT NULL,
    "data_thresholds" jsonb,
    "learning_rules" jsonb,
    "priority" int4 DEFAULT 0,
    "is_active" bool DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "workflow_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "workflow_rules_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id"),
    PRIMARY KEY ("id")
);

DROP TYPE IF EXISTS "public"."workflow_status";
CREATE TYPE "public"."workflow_status" AS ENUM ('active', 'inactive', 'draft');

-- Table Definition
CREATE TABLE "public"."workflows" (
    "id" varchar NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" varchar NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "trigger" jsonb NOT NULL,
    "actions" jsonb NOT NULL,
    "status" "public"."workflow_status" DEFAULT 'draft'::workflow_status,
    "category_id" varchar,
    "execution_count" int4 DEFAULT 0,
    "last_executed" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id"),
    CONSTRAINT "workflows_category_id_client_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."client_categories"("id"),
    PRIMARY KEY ("id")
);

