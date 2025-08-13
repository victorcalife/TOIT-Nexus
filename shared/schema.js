"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessProfiles = exports.moduleDefinitions = exports.userPermissionsRelations = exports.rolePermissionsRelations = exports.permissionsRelations = exports.userDepartmentsRelations = exports.departmentsRelations = exports.dashboardsRelations = exports.savedQueriesRelations = exports.activitiesRelations = exports.workflowRulesRelations = exports.kpiDefinitionsRelations = exports.reportsRelations = exports.workflowExecutionsRelations = exports.workflowsRelations = exports.integrationsRelations = exports.clientsRelations = exports.clientCategoriesRelations = exports.dashboards = exports.savedQueries = exports.activities = exports.workflowRules = exports.kpiDefinitions = exports.reports = exports.workflowExecutions = exports.workflows = exports.integrations = exports.clients = exports.clientCategories = exports.userPermissions = exports.rolePermissions = exports.permissions = exports.userDepartments = exports.departments = exports.users = exports.tenants = exports.calendarTriggerTypeEnum = exports.emailTriggerTypeEnum = exports.triggerTypeEnum = exports.workflowStepTypeEnum = exports.chartTypeEnum = exports.databaseTypeEnum = exports.departmentTypeEnum = exports.permissionTypeEnum = exports.tenantStatusEnum = exports.workflowStatusEnum = exports.integrationTypeEnum = exports.riskProfileEnum = exports.userRoleEnum = exports.sessions = void 0;
exports.insertTaskTimeTrackingSchema = exports.insertTaskAutomationLogSchema = exports.insertTaskAutomationRuleSchema = exports.insertNotificationSchema = exports.insertTaskCommentSchema = exports.insertTaskInstanceSchema = exports.insertTaskTemplateSchema = exports.insertPermissionSchema = exports.insertUserDepartmentSchema = exports.insertDepartmentSchema = exports.insertActivitySchema = exports.insertReportSchema = exports.insertWorkflowSchema = exports.insertIntegrationSchema = exports.insertClientSchema = exports.insertClientCategorySchema = exports.insertUserSchema = exports.insertTenantSchema = exports.usersRelations = exports.tenantsRelations = exports.insertWebhookLogSchema = exports.insertApiWebhookSchema = exports.insertDashboardWidgetSchema = exports.insertCustomDashboardSchema = exports.insertFileUploadSchema = exports.insertDatabaseQueryCacheSchema = exports.insertExternalDatabaseConnectionSchema = exports.webhookLogs = exports.apiWebhooks = exports.dashboardWidgets = exports.customDashboards = exports.fileUploads = exports.databaseQueryCache = exports.externalDatabaseConnections = exports.taskDependencies = exports.userTaskSkills = exports.taskSkills = exports.taskTemplateCategories = exports.taskCollaborations = exports.taskProductivityMetrics = exports.taskTimeTracking = exports.taskAutomationLogs = exports.taskAutomationRules = exports.notifications = exports.taskComments = exports.taskInstances = exports.taskTemplates = exports.moduleUsageTracking = exports.userModuleAccess = exports.tenantModules = void 0;
exports.workflowNodes = exports.visualWorkflows = exports.executionStatusEnum = exports.nodeTypeEnum = exports.verificationCodesRelations = exports.verificationTokensRelations = exports.businessLeadsRelations = exports.invoicesRelations = exports.paymentMethodsRelations = exports.paymentTransactionsRelations = exports.subscriptionsRelations = exports.paymentPlansRelations = exports.completeWorkflowExecutionsRelations = exports.completeWorkflowsRelations = exports.uploadedFilesRelations = exports.kpiDashboardsRelations = exports.queryBuildersRelations = exports.apiConnectionsRelations = exports.databaseConnectionsRelations = exports.calendarEvents = exports.calendarIntegrations = exports.verificationCodes = exports.verificationTokens = exports.businessLeads = exports.webhookEvents = exports.invoices = exports.paymentMethods = exports.paymentTransactions = exports.subscriptions = exports.paymentPlans = exports.paymentStatusEnum = exports.subscriptionStatusEnum = exports.paymentPlanEnum = exports.completeWorkflowExecutions = exports.completeWorkflows = exports.uploadedFiles = exports.kpiDashboards = exports.queryBuilders = exports.apiConnections = exports.databaseConnections = exports.insertDashboardSchema = exports.insertSavedQuerySchema = exports.insertUserPermissionSchema = exports.insertRolePermissionSchema = exports.insertTaskDependencySchema = exports.insertUserTaskSkillSchema = exports.insertTaskSkillSchema = exports.insertTaskTemplateCategorySchema = exports.insertTaskCollaborationSchema = exports.insertTaskProductivityMetricsSchema = void 0;
exports.quantumUsageAnalytics = exports.quantumExecutions = exports.quantumTransactions = exports.quantumAlgorithmPricing = exports.quantumPackages = exports.quantumAlgorithmTypeEnum = exports.quantumTransactionTypeEnum = exports.quantumPackageTypeEnum = exports.triggerExecutionHistory = exports.calendarEventProcessingQueue = exports.emailProcessingQueue = exports.calendarTriggers = exports.emailTriggers = exports.calendarAccounts = exports.emailAccounts = exports.workflowVariables = exports.workflowTemplates = exports.workflowTriggers = exports.nodeExecutions = exports.visualWorkflowExecutions = exports.workflowConnections = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Session storage table for auth
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// User roles enum
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['super_admin', 'toit_admin', 'tenant_admin', 'manager', 'employee']);
exports.riskProfileEnum = (0, pg_core_1.pgEnum)('risk_profile', ['conservative', 'moderate', 'aggressive']);
exports.integrationTypeEnum = (0, pg_core_1.pgEnum)('integration_type', ['api', 'database', 'webhook', 'email']);
exports.workflowStatusEnum = (0, pg_core_1.pgEnum)('workflow_status', ['active', 'inactive', 'draft']);
exports.tenantStatusEnum = (0, pg_core_1.pgEnum)('tenant_status', ['active', 'inactive', 'suspended']);
exports.permissionTypeEnum = (0, pg_core_1.pgEnum)('permission_type', ['read', 'write', 'delete', 'admin']);
exports.departmentTypeEnum = (0, pg_core_1.pgEnum)('department_type', ['sales', 'purchases', 'finance', 'operations', 'hr', 'it', 'marketing', 'custom']);
exports.databaseTypeEnum = (0, pg_core_1.pgEnum)('database_type', ['postgresql', 'mysql', 'mssql', 'oracle', 'sqlite']);
exports.chartTypeEnum = (0, pg_core_1.pgEnum)('chart_type', ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter']);
exports.workflowStepTypeEnum = (0, pg_core_1.pgEnum)('workflow_step_type', ['condition', 'action', 'webhook', 'email', 'api_call', 'file_process', 'database_query']);
exports.triggerTypeEnum = (0, pg_core_1.pgEnum)('trigger_type', ['email_received', 'email_sent', 'calendar_event', 'calendar_reminder', 'contact_update']);
exports.emailTriggerTypeEnum = (0, pg_core_1.pgEnum)('email_trigger_type', ['sender_match', 'subject_contains', 'body_contains', 'attachment_exists', 'keyword_match']);
exports.calendarTriggerTypeEnum = (0, pg_core_1.pgEnum)('calendar_trigger_type', ['event_created', 'event_updated', 'event_starts_soon', 'event_ends', 'reminder_time']);
// Tenants table (empresas/clientes)
exports.tenants = (0, pg_core_1.pgTable)("tenants", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
    domain: (0, pg_core_1.varchar)("domain", { length: 255 }), // Optional custom domain
    logo: (0, pg_core_1.varchar)("logo"),
    settings: (0, pg_core_1.jsonb)("settings"), // Tenant-specific configurations
    status: (0, exports.tenantStatusEnum)("status").default('active'),
    subscriptionPlan: (0, pg_core_1.varchar)("subscription_plan", { length: 50 }).default('basic'),
    subscriptionExpiresAt: (0, pg_core_1.timestamp)("subscription_expires_at"),
    accessProfileId: (0, pg_core_1.varchar)("access_profile_id").references(() => exports.accessProfiles.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Users table with CPF/password authentication
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    cpf: (0, pg_core_1.varchar)("cpf", { length: 11 }).unique().notNull(), // CPF sem formatação (apenas números)
    email: (0, pg_core_1.varchar)("email").unique(),
    password: (0, pg_core_1.varchar)("password").notNull(), // Hash da senha
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    phone: (0, pg_core_1.varchar)("phone"),
    birthDate: (0, pg_core_1.varchar)("birth_date", { length: 10 }), // YYYY-MM-DD
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    role: (0, exports.userRoleEnum)("role").default('employee'),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id), // null for super_admin
    isActive: (0, pg_core_1.boolean)("is_active").default(false), // MUDANÇA: Inativo até validação
    // Campos para sistema de trial e validação
    planType: (0, pg_core_1.varchar)("plan_type", { length: 50 }), // basico, standard, premium, enterprise
    planCycle: (0, pg_core_1.varchar)("plan_cycle", { length: 20 }), // monthly, yearly
    trialEndsAt: (0, pg_core_1.timestamp)("trial_ends_at"), // Data fim do trial
    trialPlan: (0, pg_core_1.varchar)("trial_plan", { length: 50 }).default('standard'), // Plano durante trial
    isTrialActive: (0, pg_core_1.boolean)("is_trial_active").default(false), // Se está em trial
    emailVerified: (0, pg_core_1.boolean)("email_verified").default(false),
    phoneVerified: (0, pg_core_1.boolean)("phone_verified").default(false),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Departments table for organizational structure within tenants
exports.departments = (0, pg_core_1.pgTable)("departments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    type: (0, exports.departmentTypeEnum)("type").notNull(),
    description: (0, pg_core_1.text)("description"),
    parentDepartmentId: (0, pg_core_1.varchar)("parent_department_id"), // For hierarchical departments
    settings: (0, pg_core_1.jsonb)("settings"), // Department-specific configurations
    dataFilters: (0, pg_core_1.jsonb)("data_filters"), // What data this department can access
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User-Department assignments (users can belong to multiple departments)
exports.userDepartments = (0, pg_core_1.pgTable)("user_departments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    departmentId: (0, pg_core_1.varchar)("department_id").references(() => exports.departments.id).notNull(),
    isPrimary: (0, pg_core_1.boolean)("is_primary").default(false), // Primary department for the user
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Permissions table for granular access control
exports.permissions = (0, pg_core_1.pgTable)("permissions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    resource: (0, pg_core_1.varchar)("resource", { length: 100 }).notNull(), // 'clients', 'reports', 'workflows', etc.
    action: (0, exports.permissionTypeEnum)("action").notNull(),
    conditions: (0, pg_core_1.jsonb)("conditions"), // Additional conditions (e.g., only own department data)
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Role-Permission assignments
exports.rolePermissions = (0, pg_core_1.pgTable)("role_permissions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    role: (0, exports.userRoleEnum)("role").notNull(),
    permissionId: (0, pg_core_1.varchar)("permission_id").references(() => exports.permissions.id).notNull(),
    departmentId: (0, pg_core_1.varchar)("department_id").references(() => exports.departments.id), // Permission specific to department
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// User-specific permissions (overrides for specific users)
exports.userPermissions = (0, pg_core_1.pgTable)("user_permissions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    permissionId: (0, pg_core_1.varchar)("permission_id").references(() => exports.permissions.id).notNull(),
    departmentId: (0, pg_core_1.varchar)("department_id").references(() => exports.departments.id), // Permission specific to department
    granted: (0, pg_core_1.boolean)("granted").default(true), // true = grant, false = revoke
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Client categories table with tenant isolation
exports.clientCategories = (0, pg_core_1.pgTable)("client_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    minInvestment: (0, pg_core_1.decimal)("min_investment", { precision: 15, scale: 2 }),
    maxInvestment: (0, pg_core_1.decimal)("max_investment", { precision: 15, scale: 2 }),
    riskProfile: (0, exports.riskProfileEnum)("risk_profile"),
    reportFrequency: (0, pg_core_1.varchar)("report_frequency", { length: 50 }), // daily, weekly, monthly, quarterly
    rules: (0, pg_core_1.jsonb)("rules"), // JSON object containing business rules
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Clients table with tenant isolation
exports.clients = (0, pg_core_1.pgTable)("clients", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    email: (0, pg_core_1.varchar)("email"),
    phone: (0, pg_core_1.varchar)("phone"),
    currentInvestment: (0, pg_core_1.decimal)("current_investment", { precision: 15, scale: 2 }),
    riskProfile: (0, exports.riskProfileEnum)("risk_profile"),
    categoryId: (0, pg_core_1.varchar)("category_id").references(() => exports.clientCategories.id),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional client data
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Integrations table with tenant isolation
exports.integrations = (0, pg_core_1.pgTable)("integrations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    type: (0, exports.integrationTypeEnum)("type").notNull(),
    config: (0, pg_core_1.jsonb)("config").notNull(), // API keys, endpoints, etc.
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastStatus: (0, pg_core_1.varchar)("last_status", { length: 50 }).default('unknown'),
    lastChecked: (0, pg_core_1.timestamp)("last_checked"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Workflows table with tenant isolation
exports.workflows = (0, pg_core_1.pgTable)("workflows", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    trigger: (0, pg_core_1.jsonb)("trigger").notNull(), // Trigger conditions
    actions: (0, pg_core_1.jsonb)("actions").notNull(), // Array of actions to execute
    status: (0, exports.workflowStatusEnum)("status").default('draft'),
    categoryId: (0, pg_core_1.varchar)("category_id").references(() => exports.clientCategories.id),
    executionCount: (0, pg_core_1.integer)("execution_count").default(0),
    lastExecuted: (0, pg_core_1.timestamp)("last_executed"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Workflow executions table with tenant isolation
exports.workflowExecutions = (0, pg_core_1.pgTable)("workflow_executions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.workflows.id).notNull(),
    clientId: (0, pg_core_1.varchar)("client_id").references(() => exports.clients.id),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(),
    result: (0, pg_core_1.jsonb)("result"),
    error: (0, pg_core_1.text)("error"),
    executedAt: (0, pg_core_1.timestamp)("executed_at").defaultNow(),
});
// Reports table with tenant isolation and adaptive features
exports.reports = (0, pg_core_1.pgTable)("reports", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    template: (0, pg_core_1.jsonb)("template").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").references(() => exports.clientCategories.id),
    // Enhanced adaptive features
    dataFilters: (0, pg_core_1.jsonb)("data_filters"), // Dynamic filters based on tenant data
    kpiConfiguration: (0, pg_core_1.jsonb)("kpi_configuration"), // Adaptive KPIs and indicators
    visualizationSettings: (0, pg_core_1.jsonb)("visualization_settings"), // Dynamic charts
    autoAdaptRules: (0, pg_core_1.jsonb)("auto_adapt_rules"), // Rules for automatic adaptation
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Dynamic KPI definitions that adapt to tenant data
exports.kpiDefinitions = (0, pg_core_1.pgTable)("kpi_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 50 }).notNull(), // 'financial', 'client', 'portfolio', 'risk'
    calculationType: (0, pg_core_1.varchar)("calculation_type", { length: 50 }).notNull(), // 'sum', 'avg', 'count', 'ratio', 'custom'
    dataSource: (0, pg_core_1.jsonb)("data_source").notNull(), // Which tables/fields to use
    calculationFormula: (0, pg_core_1.text)("calculation_formula"), // Custom calculations
    targetValue: (0, pg_core_1.decimal)("target_value", { precision: 15, scale: 2 }),
    alertThresholds: (0, pg_core_1.jsonb)("alert_thresholds"), // Trigger alerts
    adaptationRules: (0, pg_core_1.jsonb)("adaptation_rules"), // Auto-adapt based on data patterns
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Workflow rules that adapt to client data patterns
exports.workflowRules = (0, pg_core_1.pgTable)("workflow_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.workflows.id),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    triggerConditions: (0, pg_core_1.jsonb)("trigger_conditions").notNull(), // Dynamic conditions based on data
    actions: (0, pg_core_1.jsonb)("actions").notNull(), // Actions to execute
    dataThresholds: (0, pg_core_1.jsonb)("data_thresholds"), // Adaptive thresholds based on historical data
    learningRules: (0, pg_core_1.jsonb)("learning_rules"), // Rules for learning from data patterns
    priority: (0, pg_core_1.integer)("priority").default(0), // Execution priority
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Activities table for audit log with tenant isolation
exports.activities = (0, pg_core_1.pgTable)("activities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id), // null for super_admin actions
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    action: (0, pg_core_1.varchar)("action", { length: 100 }).notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type", { length: 50 }),
    entityId: (0, pg_core_1.varchar)("entity_id"),
    description: (0, pg_core_1.text)("description"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Saved queries table for Query Builder
exports.savedQueries = (0, pg_core_1.pgTable)("saved_queries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    queryConfig: (0, pg_core_1.jsonb)("query_config").notNull(), // Query builder configuration
    visualizationConfig: (0, pg_core_1.jsonb)("visualization_config").notNull(), // Chart/table configuration
    lastExecutedAt: (0, pg_core_1.timestamp)("last_executed_at"),
    executionCount: (0, pg_core_1.integer)("execution_count").default(0),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    tags: (0, pg_core_1.text)("tags").array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Dashboard configurations
exports.dashboards = (0, pg_core_1.pgTable)("dashboards", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    layout: (0, pg_core_1.jsonb)("layout").notNull(), // Dashboard layout configuration
    widgets: (0, pg_core_1.jsonb)("widgets").notNull(), // Widget configurations
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    refreshInterval: (0, pg_core_1.integer)("refresh_interval").default(300), // seconds
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Relations
exports.clientCategoriesRelations = (0, drizzle_orm_1.relations)(exports.clientCategories, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.clientCategories.tenantId],
        references: [exports.tenants.id],
    }),
    clients: many(exports.clients),
    workflows: many(exports.workflows),
    reports: many(exports.reports),
}));
exports.clientsRelations = (0, drizzle_orm_1.relations)(exports.clients, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.clients.tenantId],
        references: [exports.tenants.id],
    }),
    category: one(exports.clientCategories, {
        fields: [exports.clients.categoryId],
        references: [exports.clientCategories.id],
    }),
    workflowExecutions: many(exports.workflowExecutions),
}));
exports.integrationsRelations = (0, drizzle_orm_1.relations)(exports.integrations, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.integrations.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.workflowsRelations = (0, drizzle_orm_1.relations)(exports.workflows, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.workflows.tenantId],
        references: [exports.tenants.id],
    }),
    category: one(exports.clientCategories, {
        fields: [exports.workflows.categoryId],
        references: [exports.clientCategories.id],
    }),
    executions: many(exports.workflowExecutions),
}));
exports.workflowExecutionsRelations = (0, drizzle_orm_1.relations)(exports.workflowExecutions, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.workflowExecutions.tenantId],
        references: [exports.tenants.id],
    }),
    workflow: one(exports.workflows, {
        fields: [exports.workflowExecutions.workflowId],
        references: [exports.workflows.id],
    }),
    client: one(exports.clients, {
        fields: [exports.workflowExecutions.clientId],
        references: [exports.clients.id],
    }),
}));
exports.reportsRelations = (0, drizzle_orm_1.relations)(exports.reports, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.reports.tenantId],
        references: [exports.tenants.id],
    }),
    category: one(exports.clientCategories, {
        fields: [exports.reports.categoryId],
        references: [exports.clientCategories.id],
    }),
}));
exports.kpiDefinitionsRelations = (0, drizzle_orm_1.relations)(exports.kpiDefinitions, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.kpiDefinitions.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.workflowRulesRelations = (0, drizzle_orm_1.relations)(exports.workflowRules, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.workflowRules.tenantId],
        references: [exports.tenants.id],
    }),
    workflow: one(exports.workflows, {
        fields: [exports.workflowRules.workflowId],
        references: [exports.workflows.id],
    }),
}));
exports.activitiesRelations = (0, drizzle_orm_1.relations)(exports.activities, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.activities.tenantId],
        references: [exports.tenants.id],
    }),
    user: one(exports.users, {
        fields: [exports.activities.userId],
        references: [exports.users.id],
    }),
}));
exports.savedQueriesRelations = (0, drizzle_orm_1.relations)(exports.savedQueries, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.savedQueries.tenantId],
        references: [exports.tenants.id],
    }),
    user: one(exports.users, {
        fields: [exports.savedQueries.userId],
        references: [exports.users.id],
    }),
}));
exports.dashboardsRelations = (0, drizzle_orm_1.relations)(exports.dashboards, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.dashboards.tenantId],
        references: [exports.tenants.id],
    }),
    user: one(exports.users, {
        fields: [exports.dashboards.userId],
        references: [exports.users.id],
    }),
}));
// New relations for access control tables
exports.departmentsRelations = (0, drizzle_orm_1.relations)(exports.departments, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.departments.tenantId],
        references: [exports.tenants.id],
    }),
    parentDepartment: one(exports.departments, {
        fields: [exports.departments.parentDepartmentId],
        references: [exports.departments.id],
    }),
    childDepartments: many(exports.departments),
    userDepartments: many(exports.userDepartments),
    rolePermissions: many(exports.rolePermissions),
    userPermissions: many(exports.userPermissions),
}));
exports.userDepartmentsRelations = (0, drizzle_orm_1.relations)(exports.userDepartments, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userDepartments.userId],
        references: [exports.users.id],
    }),
    department: one(exports.departments, {
        fields: [exports.userDepartments.departmentId],
        references: [exports.departments.id],
    }),
}));
exports.permissionsRelations = (0, drizzle_orm_1.relations)(exports.permissions, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.permissions.tenantId],
        references: [exports.tenants.id],
    }),
    rolePermissions: many(exports.rolePermissions),
    userPermissions: many(exports.userPermissions),
}));
exports.rolePermissionsRelations = (0, drizzle_orm_1.relations)(exports.rolePermissions, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.rolePermissions.tenantId],
        references: [exports.tenants.id],
    }),
    permission: one(exports.permissions, {
        fields: [exports.rolePermissions.permissionId],
        references: [exports.permissions.id],
    }),
    department: one(exports.departments, {
        fields: [exports.rolePermissions.departmentId],
        references: [exports.departments.id],
    }),
}));
exports.userPermissionsRelations = (0, drizzle_orm_1.relations)(exports.userPermissions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userPermissions.userId],
        references: [exports.users.id],
    }),
    permission: one(exports.permissions, {
        fields: [exports.userPermissions.permissionId],
        references: [exports.permissions.id],
    }),
    department: one(exports.departments, {
        fields: [exports.userPermissions.departmentId],
        references: [exports.departments.id],
    }),
}));
// SISTEMA DE MÓDULOS E ATIVAÇÃO - MONETIZAÇÃO E PERSONALIZAÇÃO
exports.moduleDefinitions = (0, pg_core_1.pgTable)("module_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(), // task_management, query_builder, crm, etc
    displayName: (0, pg_core_1.varchar)("display_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category").default("core"), // core, advanced, premium, enterprise
    basePrice: (0, pg_core_1.decimal)("base_price", { precision: 10, scale: 2 }).default("0.00"),
    pricePerUser: (0, pg_core_1.decimal)("price_per_user", { precision: 10, scale: 2 }).default("0.00"),
    priceModel: (0, pg_core_1.varchar)("price_model").default("free"), // free, one_time, monthly, per_user, usage_based
    features: (0, pg_core_1.jsonb)("features").default([]), // lista de funcionalidades incluídas
    limitations: (0, pg_core_1.jsonb)("limitations").default({}), // limites por plano (max_tasks, max_users, etc)
    dependencies: (0, pg_core_1.jsonb)("dependencies").default([]), // módulos necessários
    targetUserTypes: (0, pg_core_1.jsonb)("target_user_types").default([]), // pessoa_fisica, pequena_empresa, enterprise
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    icon: (0, pg_core_1.varchar)("icon"), // ícone do módulo
    color: (0, pg_core_1.varchar)("color"), // cor tema do módulo
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Access Profiles table - Define subscription plans with module access
exports.accessProfiles = (0, pg_core_1.pgTable)("access_profiles", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(), // BÁSICO, PREMIUM, ENTERPRISE
    slug: (0, pg_core_1.varchar)("slug", { length: 100 }).notNull().unique(), // basico, premium, enterprise
    description: (0, pg_core_1.text)("description"),
    price_monthly: (0, pg_core_1.decimal)("price_monthly", { precision: 10, scale: 2 }).notNull(),
    price_yearly: (0, pg_core_1.decimal)("price_yearly", { precision: 10, scale: 2 }).notNull(),
    max_users: (0, pg_core_1.integer)("max_users").default(1), // -1 for unlimited
    max_storage_gb: (0, pg_core_1.integer)("max_storage_gb").default(1),
    modules: (0, pg_core_1.jsonb)("modules").default({}), // { module_id: enabled }
    features: (0, pg_core_1.jsonb)("features").default([]), // lista de features destacadas
    stripe_price_id_monthly: (0, pg_core_1.varchar)("stripe_price_id_monthly"), // price_1234abcd (mensal)
    stripe_price_id_yearly: (0, pg_core_1.varchar)("stripe_price_id_yearly"), // price_5678efgh (anual)
    stripe_product_id: (0, pg_core_1.varchar)("stripe_product_id"), // prod_1234abcd
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    sort_order: (0, pg_core_1.integer)("sort_order").default(0),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.tenantModules = (0, pg_core_1.pgTable)("tenant_modules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull().references(() => exports.tenants.id, { onDelete: "cascade" }),
    moduleId: (0, pg_core_1.varchar)("module_id").notNull().references(() => exports.moduleDefinitions.id, { onDelete: "cascade" }),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true),
    plan: (0, pg_core_1.varchar)("plan").default("free"), // free, basic, premium, enterprise
    maxUsers: (0, pg_core_1.integer)("max_users"), // limite de usuários para o módulo
    currentUsers: (0, pg_core_1.integer)("current_users").default(0),
    usageLimits: (0, pg_core_1.jsonb)("usage_limits").default({}), // limites específicos do tenant
    currentUsage: (0, pg_core_1.jsonb)("current_usage").default({}), // uso atual
    customConfig: (0, pg_core_1.jsonb)("custom_config").default({}), // configurações personalizadas
    billingCycle: (0, pg_core_1.varchar)("billing_cycle").default("monthly"), // monthly, yearly
    nextBillingDate: (0, pg_core_1.timestamp)("next_billing_date"),
    trialEndsAt: (0, pg_core_1.timestamp)("trial_ends_at"),
    activatedAt: (0, pg_core_1.timestamp)("activated_at").defaultNow(),
    activatedBy: (0, pg_core_1.varchar)("activated_by").references(() => exports.users.id),
    suspendedAt: (0, pg_core_1.timestamp)("suspended_at"),
    suspendedReason: (0, pg_core_1.text)("suspended_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.userModuleAccess = (0, pg_core_1.pgTable)("user_module_access", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    moduleId: (0, pg_core_1.varchar)("module_id").notNull().references(() => exports.moduleDefinitions.id, { onDelete: "cascade" }),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull().references(() => exports.tenants.id, { onDelete: "cascade" }),
    hasAccess: (0, pg_core_1.boolean)("has_access").default(true),
    accessLevel: (0, pg_core_1.varchar)("access_level").default("basic"), // basic, advanced, admin
    permissions: (0, pg_core_1.jsonb)("permissions").default([]), // permissões específicas do módulo
    usageLimit: (0, pg_core_1.integer)("usage_limit"), // limite de uso mensal
    currentUsage: (0, pg_core_1.integer)("current_usage").default(0),
    features: (0, pg_core_1.jsonb)("features").default([]), // funcionalidades específicas habilitadas
    restrictions: (0, pg_core_1.jsonb)("restrictions").default({}), // restrições específicas
    lastUsedAt: (0, pg_core_1.timestamp)("last_used_at"),
    grantedAt: (0, pg_core_1.timestamp)("granted_at").defaultNow(),
    grantedBy: (0, pg_core_1.varchar)("granted_by").references(() => exports.users.id),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.moduleUsageTracking = (0, pg_core_1.pgTable)("module_usage_tracking", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull().references(() => exports.tenants.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    moduleId: (0, pg_core_1.varchar)("module_id").notNull().references(() => exports.moduleDefinitions.id, { onDelete: "cascade" }),
    action: (0, pg_core_1.varchar)("action").notNull(), // create_task, send_notification, run_query, etc
    resource: (0, pg_core_1.varchar)("resource"), // task_template, query, etc
    resourceId: (0, pg_core_1.varchar)("resource_id"),
    usage: (0, pg_core_1.integer)("usage").default(1), // quantidade usada
    metadata: (0, pg_core_1.jsonb)("metadata").default({}), // dados adicionais da ação
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// TASK MANAGEMENT SYSTEM - CORE DA APLICAÇÃO
exports.taskTemplates = (0, pg_core_1.pgTable)("task_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id),
    managerId: (0, pg_core_1.varchar)("manager_id").references(() => exports.users.id), // Quem criou o template
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category").default("general"), // 'client_follow_up', 'reporting', 'general'
    priority: (0, pg_core_1.varchar)("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
    estimatedDuration: (0, pg_core_1.integer)("estimated_duration"), // em minutos
    instructions: (0, pg_core_1.jsonb)("instructions").notNull(), // Array de passos/instruções
    checklistItems: (0, pg_core_1.jsonb)("checklist_items"), // Array de itens de checklist
    requiredFields: (0, pg_core_1.jsonb)("required_fields"), // Campos que devem ser preenchidos
    schedule: (0, pg_core_1.jsonb)("schedule"), // Configuração de agendamento (diário, semanal, mensal)
    assignedTo: (0, pg_core_1.jsonb)("assigned_to"), // Array de IDs de usuários ou departamentos
    tags: (0, pg_core_1.jsonb)("tags"), // Array de tags
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.taskInstances = (0, pg_core_1.pgTable)("task_instances", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id),
    templateId: (0, pg_core_1.varchar)("template_id").references(() => exports.taskTemplates.id),
    assignedToId: (0, pg_core_1.varchar)("assigned_to_id").references(() => exports.users.id),
    assignedById: (0, pg_core_1.varchar)("assigned_by_id").references(() => exports.users.id),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    priority: (0, pg_core_1.varchar)("priority").default("medium"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    completionData: (0, pg_core_1.jsonb)("completion_data"), // Dados preenchidos pelo funcionário
    checklistProgress: (0, pg_core_1.jsonb)("checklist_progress"), // Progresso do checklist
    notes: (0, pg_core_1.text)("notes"),
    attachments: (0, pg_core_1.jsonb)("attachments"), // Array de anexos
    remindersSent: (0, pg_core_1.integer)("reminders_sent").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.taskComments = (0, pg_core_1.pgTable)("task_comments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id),
    taskInstanceId: (0, pg_core_1.varchar)("task_instance_id").references(() => exports.taskInstances.id),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    comment: (0, pg_core_1.text)("comment").notNull(),
    isInternal: (0, pg_core_1.boolean)("is_internal").default(false), // Se é apenas para o gerente ver
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    type: (0, pg_core_1.varchar)("type").notNull(), // 'task_assigned', 'task_reminder', 'task_overdue', 'task_completed'
    title: (0, pg_core_1.varchar)("title").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    data: (0, pg_core_1.jsonb)("data"), // Dados relacionados à notificação
    isRead: (0, pg_core_1.boolean)("is_read").default(false),
    readAt: (0, pg_core_1.timestamp)("read_at"),
    actionUrl: (0, pg_core_1.varchar)("action_url"), // URL para onde a notificação deve levar
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// ==========================================
// ADVANCED TASK MANAGEMENT SYSTEM - FASE 3
// ==========================================
// Task Automation Rules - Sistema de automação baseado em eventos
exports.taskAutomationRules = (0, pg_core_1.pgTable)("task_automation_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    createdById: (0, pg_core_1.varchar)("created_by_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    // Trigger configuration
    triggerType: (0, pg_core_1.varchar)("trigger_type", { length: 50 }).notNull(), // 'time_based', 'event_based', 'condition_based'
    triggerConfig: (0, pg_core_1.jsonb)("trigger_config").notNull(), // Configuração específica do trigger
    // Conditions
    conditions: (0, pg_core_1.jsonb)("conditions"), // Array de condições que devem ser atendidas
    // Actions
    actions: (0, pg_core_1.jsonb)("actions").notNull(), // Array de ações a serem executadas
    // Execution tracking
    lastTriggeredAt: (0, pg_core_1.timestamp)("last_triggered_at"),
    totalExecutions: (0, pg_core_1.integer)("total_executions").default(0),
    successfulExecutions: (0, pg_core_1.integer)("successful_executions").default(0),
    failedExecutions: (0, pg_core_1.integer)("failed_executions").default(0),
    // Metadata
    metadata: (0, pg_core_1.jsonb)("metadata"), // Dados adicionais de configuração
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Task Automation Logs - Log de execuções de automação
exports.taskAutomationLogs = (0, pg_core_1.pgTable)("task_automation_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    ruleId: (0, pg_core_1.varchar)("rule_id").references(() => exports.taskAutomationRules.id).notNull(),
    // Execution details
    executionId: (0, pg_core_1.varchar)("execution_id").notNull(), // UUID único para esta execução
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull(), // 'success', 'failed', 'partial'
    // Trigger details
    triggerData: (0, pg_core_1.jsonb)("trigger_data"), // Dados que causaram o trigger
    triggerTimestamp: (0, pg_core_1.timestamp)("trigger_timestamp").notNull(),
    // Execution results
    actionsExecuted: (0, pg_core_1.jsonb)("actions_executed"), // Array de ações executadas
    actionResults: (0, pg_core_1.jsonb)("action_results"), // Resultados de cada ação
    // Error handling
    errorMessage: (0, pg_core_1.text)("error_message"),
    errorDetails: (0, pg_core_1.jsonb)("error_details"),
    // Performance
    executionTimeMs: (0, pg_core_1.integer)("execution_time_ms"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Task Time Tracking - Tracking avançado de tempo gasto
exports.taskTimeTracking = (0, pg_core_1.pgTable)("task_time_tracking", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    taskInstanceId: (0, pg_core_1.varchar)("task_instance_id").references(() => exports.taskInstances.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    // Time tracking
    startTime: (0, pg_core_1.timestamp)("start_time").notNull(),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    durationMs: (0, pg_core_1.integer)("duration_ms"), // Calculado automaticamente
    isActive: (0, pg_core_1.boolean)("is_active").default(false), // Se está trackando agora
    // Activity details
    activityType: (0, pg_core_1.varchar)("activity_type", { length: 50 }), // 'work', 'pause', 'meeting', 'research'
    description: (0, pg_core_1.text)("description"),
    // Productivity metrics
    productivityScore: (0, pg_core_1.integer)("productivity_score"), // 1-10 (auto ou manual)
    focusLevel: (0, pg_core_1.integer)("focus_level"), // 1-10 (baseado em interruções)
    interruptions: (0, pg_core_1.integer)("interruptions").default(0),
    // Location/device info
    deviceInfo: (0, pg_core_1.jsonb)("device_info"), // Info do dispositivo usado
    locationInfo: (0, pg_core_1.jsonb)("location_info"), // Info de localização (se permitido)
    // Metadata
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Task Productivity Metrics - Métricas agregadas de produtividade
exports.taskProductivityMetrics = (0, pg_core_1.pgTable)("task_productivity_metrics", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    // Time period
    periodType: (0, pg_core_1.varchar)("period_type", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
    periodStart: (0, pg_core_1.timestamp)("period_start").notNull(),
    periodEnd: (0, pg_core_1.timestamp)("period_end").notNull(),
    // Task metrics
    tasksCompleted: (0, pg_core_1.integer)("tasks_completed").default(0),
    tasksStarted: (0, pg_core_1.integer)("tasks_started").default(0),
    tasksOverdue: (0, pg_core_1.integer)("tasks_overdue").default(0),
    averageCompletionTime: (0, pg_core_1.integer)("average_completion_time"), // em minutos
    // Time metrics
    totalTimeWorked: (0, pg_core_1.integer)("total_time_worked").default(0), // em minutos
    focusTime: (0, pg_core_1.integer)("focus_time").default(0), // tempo focado sem interruções
    breakTime: (0, pg_core_1.integer)("break_time").default(0), // tempo de pausas
    // Productivity scores
    overallProductivityScore: (0, pg_core_1.decimal)("overall_productivity_score", { precision: 3, scale: 1 }),
    averageFocusLevel: (0, pg_core_1.decimal)("average_focus_level", { precision: 3, scale: 1 }),
    completionRate: (0, pg_core_1.decimal)("completion_rate", { precision: 5, scale: 2 }), // percentual
    // Quality metrics
    reworkRequests: (0, pg_core_1.integer)("rework_requests").default(0),
    qualityScore: (0, pg_core_1.decimal)("quality_score", { precision: 3, scale: 1 }),
    // Collaboration metrics
    collaborationScore: (0, pg_core_1.decimal)("collaboration_score", { precision: 3, scale: 1 }),
    commentsGiven: (0, pg_core_1.integer)("comments_given").default(0),
    commentsReceived: (0, pg_core_1.integer)("comments_received").default(0),
    // Metadata
    calculatedAt: (0, pg_core_1.timestamp)("calculated_at").defaultNow(),
    metadata: (0, pg_core_1.jsonb)("metadata"),
});
// Task Collaboration - Sistema avançado de colaboração
exports.taskCollaborations = (0, pg_core_1.pgTable)("task_collaborations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    taskInstanceId: (0, pg_core_1.varchar)("task_instance_id").references(() => exports.taskInstances.id).notNull(),
    // Collaboration type
    collaborationType: (0, pg_core_1.varchar)("collaboration_type", { length: 50 }).notNull(), // 'assignment', 'review', 'approval', 'consultation'
    // Participants
    requesterId: (0, pg_core_1.varchar)("requester_id").references(() => exports.users.id).notNull(),
    collaboratorId: (0, pg_core_1.varchar)("collaborator_id").references(() => exports.users.id).notNull(),
    // Status and workflow
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default('pending'), // 'pending', 'accepted', 'rejected', 'completed'
    priority: (0, pg_core_1.varchar)("priority", { length: 20 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
    // Timing
    requestedAt: (0, pg_core_1.timestamp)("requested_at").defaultNow(),
    respondedAt: (0, pg_core_1.timestamp)("responded_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    // Content
    requestMessage: (0, pg_core_1.text)("request_message"),
    responseMessage: (0, pg_core_1.text)("response_message"),
    completionNotes: (0, pg_core_1.text)("completion_notes"),
    // Deliverables
    requiredDeliverables: (0, pg_core_1.jsonb)("required_deliverables"), // Array de entregáveis esperados
    actualDeliverables: (0, pg_core_1.jsonb)("actual_deliverables"), // Array de entregáveis fornecidos
    // Quality assessment
    qualityRating: (0, pg_core_1.integer)("quality_rating"), // 1-5 stars
    feedbackComments: (0, pg_core_1.text)("feedback_comments"),
    // Metadata
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Task Template Categories - Categorias avançadas de templates
exports.taskTemplateCategories = (0, pg_core_1.pgTable)("task_template_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    parentCategoryId: (0, pg_core_1.varchar)("parent_category_id").references(() => exports.taskTemplateCategories.id), // Para hierarquia
    // Visual
    color: (0, pg_core_1.varchar)("color", { length: 7 }).default('#3B82F6'), // Hex color
    icon: (0, pg_core_1.varchar)("icon", { length: 50 }), // Lucide icon name
    // Configuration
    defaultPriority: (0, pg_core_1.varchar)("default_priority", { length: 20 }).default('medium'),
    defaultDuration: (0, pg_core_1.integer)("default_duration"), // minutos
    requiredFields: (0, pg_core_1.jsonb)("required_fields"), // Campos obrigatórios para esta categoria
    // Ordering and display
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Task Skills and Competencies - Sistema de habilidades
exports.taskSkills = (0, pg_core_1.pgTable)("task_skills", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 50 }), // 'technical', 'soft', 'domain_specific'
    // Skill level system
    levels: (0, pg_core_1.jsonb)("levels").notNull(), // Array de níveis (beginner, intermediate, expert)
    // Metadata
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User Task Skills - Habilidades dos usuários
exports.userTaskSkills = (0, pg_core_1.pgTable)("user_task_skills", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    skillId: (0, pg_core_1.varchar)("skill_id").references(() => exports.taskSkills.id).notNull(),
    // Skill assessment
    currentLevel: (0, pg_core_1.varchar)("current_level", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'expert'
    certifiedLevel: (0, pg_core_1.varchar)("certified_level", { length: 20 }), // Nível certificado/validado
    // Progress tracking
    experiencePoints: (0, pg_core_1.integer)("experience_points").default(0),
    tasksCompleted: (0, pg_core_1.integer)("tasks_completed").default(0),
    averageRating: (0, pg_core_1.decimal)("average_rating", { precision: 3, scale: 1 }),
    // Validation
    validatedBy: (0, pg_core_1.varchar)("validated_by").references(() => exports.users.id),
    validatedAt: (0, pg_core_1.timestamp)("validated_at"),
    validationNotes: (0, pg_core_1.text)("validation_notes"),
    // Metadata
    lastUsedAt: (0, pg_core_1.timestamp)("last_used_at"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Task Dependencies - Sistema de dependências entre tarefas
exports.taskDependencies = (0, pg_core_1.pgTable)("task_dependencies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Task relationship
    dependentTaskId: (0, pg_core_1.varchar)("dependent_task_id").references(() => exports.taskInstances.id).notNull(), // Tarefa que depende
    dependsOnTaskId: (0, pg_core_1.varchar)("depends_on_task_id").references(() => exports.taskInstances.id).notNull(), // Tarefa da qual depende
    // Dependency type
    dependencyType: (0, pg_core_1.varchar)("dependency_type", { length: 30 }).notNull(), // 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
    // Timing
    lagTime: (0, pg_core_1.integer)("lag_time").default(0), // Tempo de espera em minutos
    leadTime: (0, pg_core_1.integer)("lead_time").default(0), // Tempo de antecipação em minutos
    // Status
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    resolvedAt: (0, pg_core_1.timestamp)("resolved_at"), // Quando a dependência foi resolvida
    // Metadata
    notes: (0, pg_core_1.text)("notes"),
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// External Database Connections - Conectividade universal
exports.externalDatabaseConnections = (0, pg_core_1.pgTable)("external_database_connections", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Connection details
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // 'postgresql', 'mysql', 'sqlserver', 'rest_api', 'webhook'
    description: (0, pg_core_1.text)("description"),
    // Configuration (encrypted)
    config: (0, pg_core_1.jsonb)("config").notNull(), // { host, port, database, username, password, ssl, apiUrl, apiKey, etc }
    // Status and testing
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTestedAt: (0, pg_core_1.timestamp)("last_tested_at"),
    testResult: (0, pg_core_1.jsonb)("test_result"), // Resultado do último teste
    // Usage statistics
    totalQueries: (0, pg_core_1.integer)("total_queries").default(0),
    lastUsedAt: (0, pg_core_1.timestamp)("last_used_at"),
    // Metadata
    tags: (0, pg_core_1.jsonb)("tags").default([]), // Tags para organização
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Database Query Cache - Cache para queries executadas
exports.databaseQueryCache = (0, pg_core_1.pgTable)("database_query_cache", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Cache identification
    cacheKey: (0, pg_core_1.varchar)("cache_key", { length: 255 }).notNull(),
    connectionId: (0, pg_core_1.varchar)("connection_id").references(() => exports.externalDatabaseConnections.id),
    // Cached data
    result: (0, pg_core_1.jsonb)("result").notNull(), // Resultado da query
    queryHash: (0, pg_core_1.varchar)("query_hash", { length: 64 }), // Hash da query original
    // Cache management
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    hitCount: (0, pg_core_1.integer)("hit_count").default(0),
    lastHitAt: (0, pg_core_1.timestamp)("last_hit_at"),
    // Metadata
    resultSize: (0, pg_core_1.integer)("result_size"), // Tamanho do resultado em bytes
    executionTime: (0, pg_core_1.integer)("execution_time"), // Tempo de execução original em ms
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    uniqueCacheKey: (0, pg_core_1.unique)().on(table.tenantId, table.cacheKey),
}));
// File Uploads - Sistema de upload e processamento de arquivos
exports.fileUploads = (0, pg_core_1.pgTable)("file_uploads", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // File details
    originalName: (0, pg_core_1.varchar)("original_name", { length: 255 }).notNull(),
    fileName: (0, pg_core_1.varchar)("file_name", { length: 255 }).notNull(), // Nome único no storage
    filePath: (0, pg_core_1.varchar)("file_path", { length: 500 }).notNull(),
    mimeType: (0, pg_core_1.varchar)("mime_type", { length: 100 }).notNull(),
    fileSize: (0, pg_core_1.integer)("file_size").notNull(), // Em bytes
    // Processing status
    status: (0, pg_core_1.varchar)("status", { length: 30 }).default('uploaded'), // 'uploaded', 'processing', 'processed', 'error'
    processingResult: (0, pg_core_1.jsonb)("processing_result"), // Resultado do processamento (schema, rows, etc)
    errorMessage: (0, pg_core_1.text)("error_message"),
    // Data preview
    previewData: (0, pg_core_1.jsonb)("preview_data"), // Primeiras linhas para preview
    columnMapping: (0, pg_core_1.jsonb)("column_mapping"), // Mapeamento de colunas
    totalRows: (0, pg_core_1.integer)("total_rows"),
    validRows: (0, pg_core_1.integer)("valid_rows"),
    // Usage
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    downloadCount: (0, pg_core_1.integer)("download_count").default(0),
    lastAccessedAt: (0, pg_core_1.timestamp)("last_accessed_at"),
    // Metadata
    tags: (0, pg_core_1.jsonb)("tags").default([]),
    description: (0, pg_core_1.text)("description"),
    uploadedBy: (0, pg_core_1.varchar)("uploaded_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Custom Dashboards - Dashboards personalizáveis
exports.customDashboards = (0, pg_core_1.pgTable)("custom_dashboards", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Dashboard details
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    slug: (0, pg_core_1.varchar)("slug", { length: 100 }).notNull(),
    // Layout and configuration
    layout: (0, pg_core_1.jsonb)("layout").notNull(), // Grid layout config
    widgets: (0, pg_core_1.jsonb)("widgets").notNull(), // Array de widgets configurados
    filters: (0, pg_core_1.jsonb)("filters").default([]), // Filtros globais do dashboard
    // Access control
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    allowedUsers: (0, pg_core_1.jsonb)("allowed_users").default([]), // Array de user IDs
    allowedRoles: (0, pg_core_1.jsonb)("allowed_roles").default([]), // Array de roles
    // Status
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    isTemplate: (0, pg_core_1.boolean)("is_template").default(false), // Se é um template reutilizável
    // Usage statistics
    viewCount: (0, pg_core_1.integer)("view_count").default(0),
    lastViewedAt: (0, pg_core_1.timestamp)("last_viewed_at"),
    // Metadata
    tags: (0, pg_core_1.jsonb)("tags").default([]),
    category: (0, pg_core_1.varchar)("category", { length: 100 }),
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    uniqueSlug: (0, pg_core_1.unique)().on(table.tenantId, table.slug),
}));
// Dashboard Widgets - Widgets individuais para dashboards
exports.dashboardWidgets = (0, pg_core_1.pgTable)("dashboard_widgets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    dashboardId: (0, pg_core_1.varchar)("dashboard_id").references(() => exports.customDashboards.id).notNull(),
    // Widget configuration
    widgetType: (0, pg_core_1.varchar)("widget_type", { length: 50 }).notNull(), // 'chart', 'table', 'metric', 'text', 'image'
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Position and size
    position: (0, pg_core_1.jsonb)("position").notNull(), // { x, y, w, h }
    // Data source
    dataSource: (0, pg_core_1.jsonb)("data_source"), // Connection ID, query, etc
    dataQuery: (0, pg_core_1.text)("data_query"), // SQL ou endpoint
    dataParameters: (0, pg_core_1.jsonb)("data_parameters").default({}),
    // Visualization config
    chartConfig: (0, pg_core_1.jsonb)("chart_config"), // Configurações específicas do tipo de chart
    tableConfig: (0, pg_core_1.jsonb)("table_config"), // Configurações de tabla
    styleConfig: (0, pg_core_1.jsonb)("style_config"), // Cores, fontes, etc
    // Refresh and caching
    refreshInterval: (0, pg_core_1.integer)("refresh_interval").default(300), // Segundos
    cacheKey: (0, pg_core_1.varchar)("cache_key", { length: 255 }),
    lastRefreshAt: (0, pg_core_1.timestamp)("last_refresh_at"),
    // Status
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    hasError: (0, pg_core_1.boolean)("has_error").default(false),
    errorMessage: (0, pg_core_1.text)("error_message"),
    // Metadata
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// API Webhooks - Sistema de webhooks para integração
exports.apiWebhooks = (0, pg_core_1.pgTable)("api_webhooks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Webhook details
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    url: (0, pg_core_1.varchar)("url", { length: 500 }).notNull(),
    // Configuration
    method: (0, pg_core_1.varchar)("method", { length: 10 }).default('POST'), // GET, POST, PUT, DELETE
    headers: (0, pg_core_1.jsonb)("headers").default({}),
    authentication: (0, pg_core_1.jsonb)("authentication"), // API key, Bearer token, etc
    // Events and triggers
    events: (0, pg_core_1.jsonb)("events").notNull(), // Array de eventos que disparam o webhook
    triggers: (0, pg_core_1.jsonb)("triggers").default([]), // Condições específicas
    // Request configuration
    timeout: (0, pg_core_1.integer)("timeout").default(30), // Segundos
    retryAttempts: (0, pg_core_1.integer)("retry_attempts").default(3),
    retryDelay: (0, pg_core_1.integer)("retry_delay").default(5), // Segundos
    // Status and monitoring
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTriggeredAt: (0, pg_core_1.timestamp)("last_triggered_at"),
    totalCalls: (0, pg_core_1.integer)("total_calls").default(0),
    successfulCalls: (0, pg_core_1.integer)("successful_calls").default(0),
    failedCalls: (0, pg_core_1.integer)("failed_calls").default(0),
    // Metadata
    tags: (0, pg_core_1.jsonb)("tags").default([]),
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Webhook Logs - Logs de execução de webhooks
exports.webhookLogs = (0, pg_core_1.pgTable)("webhook_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    webhookId: (0, pg_core_1.varchar)("webhook_id").references(() => exports.apiWebhooks.id).notNull(),
    // Execution details
    executionId: (0, pg_core_1.varchar)("execution_id", { length: 100 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull(), // 'success', 'failed', 'timeout', 'retry'
    // Request/Response
    requestPayload: (0, pg_core_1.jsonb)("request_payload"),
    requestHeaders: (0, pg_core_1.jsonb)("request_headers"),
    responseStatus: (0, pg_core_1.integer)("response_status"),
    responseBody: (0, pg_core_1.text)("response_body"),
    responseHeaders: (0, pg_core_1.jsonb)("response_headers"),
    // Timing
    executionTime: (0, pg_core_1.integer)("execution_time"), // Milliseconds
    triggeredAt: (0, pg_core_1.timestamp)("triggered_at").notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    // Error handling
    errorMessage: (0, pg_core_1.text)("error_message"),
    errorDetails: (0, pg_core_1.jsonb)("error_details"),
    retryAttempt: (0, pg_core_1.integer)("retry_attempt").default(0),
    // Metadata
    eventType: (0, pg_core_1.varchar)("event_type", { length: 100 }),
    triggerSource: (0, pg_core_1.varchar)("trigger_source", { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Insert schemas for new tables
exports.insertExternalDatabaseConnectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.externalDatabaseConnections);
exports.insertDatabaseQueryCacheSchema = (0, drizzle_zod_1.createInsertSchema)(exports.databaseQueryCache);
exports.insertFileUploadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fileUploads);
exports.insertCustomDashboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customDashboards);
exports.insertDashboardWidgetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dashboardWidgets);
exports.insertApiWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiWebhooks);
exports.insertWebhookLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhookLogs);
// Update existing relations to include new tables
exports.tenantsRelations = (0, drizzle_orm_1.relations)(exports.tenants, ({ many }) => ({
    users: many(exports.users),
    departments: many(exports.departments),
    permissions: many(exports.permissions),
    rolePermissions: many(exports.rolePermissions),
    clientCategories: many(exports.clientCategories),
    clients: many(exports.clients),
    integrations: many(exports.integrations),
    workflows: many(exports.workflows),
    workflowExecutions: many(exports.workflowExecutions),
    reports: many(exports.reports),
    activities: many(exports.activities),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.users.tenantId],
        references: [exports.tenants.id],
    }),
    userDepartments: many(exports.userDepartments),
    userPermissions: many(exports.userPermissions),
    activities: many(exports.activities),
}));
// Insert schemas
exports.insertTenantSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tenants).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
});
exports.insertClientCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.clientCategories).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertClientSchema = (0, drizzle_zod_1.createInsertSchema)(exports.clients).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertIntegrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.integrations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastStatus: true,
    lastChecked: true,
});
exports.insertWorkflowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflows).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    executionCount: true,
    lastExecuted: true,
});
exports.insertReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reports).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.activities).omit({
    id: true,
    createdAt: true,
});
// Insert schemas for new access control tables
exports.insertDepartmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.departments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertUserDepartmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userDepartments).omit({
    id: true,
    createdAt: true,
});
exports.insertPermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.permissions).omit({
    id: true,
    createdAt: true,
});
// Task Management Insert Schemas
exports.insertTaskTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskTemplates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskInstanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskInstances).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskComments).omit({
    id: true,
    createdAt: true,
});
exports.insertNotificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notifications).omit({
    id: true,
    createdAt: true,
});
// INSERT SCHEMAS FOR ADVANCED TASK MANAGEMENT
exports.insertTaskAutomationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskAutomationRules).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskAutomationLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskAutomationLogs).omit({
    id: true,
    createdAt: true,
});
exports.insertTaskTimeTrackingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskTimeTracking).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskProductivityMetricsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskProductivityMetrics).omit({
    id: true,
    calculatedAt: true,
});
exports.insertTaskCollaborationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskCollaborations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskTemplateCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskTemplateCategories).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskSkillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskSkills).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertUserTaskSkillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userTaskSkills).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertTaskDependencySchema = (0, drizzle_zod_1.createInsertSchema)(exports.taskDependencies).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertRolePermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rolePermissions).omit({
    id: true,
    createdAt: true,
});
exports.insertUserPermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userPermissions).omit({
    id: true,
    createdAt: true,
});
exports.insertSavedQuerySchema = (0, drizzle_zod_1.createInsertSchema)(exports.savedQueries).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastExecutedAt: true,
    executionCount: true,
});
exports.insertDashboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dashboards).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// TABELAS PARA SISTEMA COMPLETO TOIT NEXUS
// Database Connections - Qualquer banco de dados
exports.databaseConnections = (0, pg_core_1.pgTable)("database_connections", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    type: (0, exports.databaseTypeEnum)("type").notNull(), // postgresql, mysql, mssql, oracle
    host: (0, pg_core_1.varchar)("host", { length: 255 }).notNull(),
    port: (0, pg_core_1.integer)("port").notNull(),
    database: (0, pg_core_1.varchar)("database", { length: 255 }).notNull(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(), // Encrypted
    ssl: (0, pg_core_1.boolean)("ssl").default(false),
    connectionString: (0, pg_core_1.text)("connection_string"), // Alternative to individual fields
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTestedAt: (0, pg_core_1.timestamp)("last_tested_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// API Connections - Qualquer API externa
exports.apiConnections = (0, pg_core_1.pgTable)("api_connections", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    baseUrl: (0, pg_core_1.varchar)("base_url", { length: 500 }).notNull(),
    authType: (0, pg_core_1.varchar)("auth_type", { length: 50 }).notNull(), // bearer, apikey, basic, oauth
    authConfig: (0, pg_core_1.jsonb)("auth_config").notNull(), // Headers, tokens, etc
    headers: (0, pg_core_1.jsonb)("headers"), // Default headers
    timeout: (0, pg_core_1.integer)("timeout").default(30000),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTestedAt: (0, pg_core_1.timestamp)("last_tested_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Query Builder - Queries visuais no-code
exports.queryBuilders = (0, pg_core_1.pgTable)("query_builders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    connectionId: (0, pg_core_1.varchar)("connection_id"), // database or api connection
    connectionType: (0, pg_core_1.varchar)("connection_type", { length: 20 }).notNull(), // 'database' or 'api'
    queryConfig: (0, pg_core_1.jsonb)("query_config").notNull(), // Visual query configuration
    sqlGenerated: (0, pg_core_1.text)("sql_generated"), // For database queries
    apiEndpoint: (0, pg_core_1.varchar)("api_endpoint", { length: 500 }), // For API queries
    lastExecutedAt: (0, pg_core_1.timestamp)("last_executed_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// KPI Dashboards - KPIs e métricas
exports.kpiDashboards = (0, pg_core_1.pgTable)("kpi_dashboards", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    queryBuilderId: (0, pg_core_1.varchar)("query_builder_id").references(() => exports.queryBuilders.id),
    chartType: (0, exports.chartTypeEnum)("chart_type").notNull(),
    chartConfig: (0, pg_core_1.jsonb)("chart_config").notNull(), // Chart.js configuration
    refreshInterval: (0, pg_core_1.integer)("refresh_interval").default(300), // seconds
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    position: (0, pg_core_1.jsonb)("position"), // Dashboard layout position
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Uploaded Files - Gestão de arquivos Excel/CSV
exports.uploadedFiles = (0, pg_core_1.pgTable)("uploaded_files", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    originalName: (0, pg_core_1.varchar)("original_name", { length: 255 }).notNull(),
    fileName: (0, pg_core_1.varchar)("file_name", { length: 255 }).notNull(), // Nome único no servidor
    filePath: (0, pg_core_1.varchar)("file_path", { length: 500 }).notNull(), // Caminho completo no servidor
    fileSize: (0, pg_core_1.integer)("file_size").notNull(), // Tamanho em bytes
    mimeType: (0, pg_core_1.varchar)("mime_type", { length: 100 }).notNull(),
    headers: (0, pg_core_1.text)("headers"), // JSON string com headers das colunas
    rowCount: (0, pg_core_1.integer)("row_count").default(0), // Número de linhas processadas
    processingTime: (0, pg_core_1.integer)("processing_time").default(0), // Tempo de processamento em ms
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default('processing'), // processing, processed, error
    metadata: (0, pg_core_1.jsonb)("metadata"), // Metadados adicionais do processamento
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Webhook Logs - Logs de webhooks (removendo duplicação)
// Já definido na linha 1149
// Complete Workflows - Workflows avançados
exports.completeWorkflows = (0, pg_core_1.pgTable)("complete_workflows", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    steps: (0, pg_core_1.jsonb)("steps").notNull(), // Array of workflow steps
    triggers: (0, pg_core_1.jsonb)("triggers").notNull(), // Trigger configurations
    status: (0, exports.workflowStatusEnum)("status").default('draft'),
    executionCount: (0, pg_core_1.integer)("execution_count").default(0),
    lastExecutedAt: (0, pg_core_1.timestamp)("last_executed_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Complete Workflow Executions - Histórico de execuções
exports.completeWorkflowExecutions = (0, pg_core_1.pgTable)("complete_workflow_executions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.completeWorkflows.id).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(), // running, completed, failed
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    executionLog: (0, pg_core_1.jsonb)("execution_log"), // Detailed execution steps
    errorMessage: (0, pg_core_1.text)("error_message"),
    triggeredBy: (0, pg_core_1.varchar)("triggered_by", { length: 255 }), // user_id, webhook, schedule
});
// ==================== PAYMENT SYSTEM TABLES ====================
// Payment Plans - Planos de pagamento disponíveis
exports.paymentPlanEnum = (0, pg_core_1.pgEnum)('payment_plan_type', ['individual', 'business', 'enterprise']);
exports.subscriptionStatusEnum = (0, pg_core_1.pgEnum)('subscription_status', ['active', 'past_due', 'canceled', 'incomplete', 'trialing']);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)('payment_status', ['pending', 'processing', 'succeeded', 'failed', 'canceled']);
exports.paymentPlans = (0, pg_core_1.pgTable)("payment_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 50 }).notNull().unique(),
    type: (0, exports.paymentPlanEnum)("type").notNull(),
    description: (0, pg_core_1.text)("description"),
    priceMonthly: (0, pg_core_1.decimal)("price_monthly", { precision: 10, scale: 2 }),
    priceYearly: (0, pg_core_1.decimal)("price_yearly", { precision: 10, scale: 2 }),
    stripePriceIdMonthly: (0, pg_core_1.varchar)("stripe_price_id_monthly"),
    stripePriceIdYearly: (0, pg_core_1.varchar)("stripe_price_id_yearly"),
    features: (0, pg_core_1.jsonb)("features").notNull(), // Array of features
    maxUsers: (0, pg_core_1.integer)("max_users"),
    maxModules: (0, pg_core_1.integer)("max_modules"),
    trialDays: (0, pg_core_1.integer)("trial_days").default(7),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Subscriptions - Assinaturas ativas
exports.subscriptions = (0, pg_core_1.pgTable)("subscriptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    planId: (0, pg_core_1.varchar)("plan_id").references(() => exports.paymentPlans.id).notNull(),
    stripeSubscriptionId: (0, pg_core_1.varchar)("stripe_subscription_id").unique(),
    stripeCustomerId: (0, pg_core_1.varchar)("stripe_customer_id").notNull(),
    status: (0, exports.subscriptionStatusEnum)("status").notNull(),
    billingCycle: (0, pg_core_1.varchar)("billing_cycle", { length: 20 }).notNull(), // monthly, yearly
    currentPeriodStart: (0, pg_core_1.timestamp)("current_period_start").notNull(),
    currentPeriodEnd: (0, pg_core_1.timestamp)("current_period_end").notNull(),
    trialStart: (0, pg_core_1.timestamp)("trial_start"),
    trialEnd: (0, pg_core_1.timestamp)("trial_end"),
    canceledAt: (0, pg_core_1.timestamp)("canceled_at"),
    cancelAtPeriodEnd: (0, pg_core_1.boolean)("cancel_at_period_end").default(false),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional subscription data
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Payment Transactions - Histórico de transações
exports.paymentTransactions = (0, pg_core_1.pgTable)("payment_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    subscriptionId: (0, pg_core_1.varchar)("subscription_id").references(() => exports.subscriptions.id),
    stripePaymentIntentId: (0, pg_core_1.varchar)("stripe_payment_intent_id").unique(),
    stripeInvoiceId: (0, pg_core_1.varchar)("stripe_invoice_id"),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default('BRL'),
    status: (0, exports.paymentStatusEnum)("status").notNull(),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 50 }), // card, boleto, pix
    failureReason: (0, pg_core_1.text)("failure_reason"),
    receiptUrl: (0, pg_core_1.varchar)("receipt_url"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Payment Methods - Métodos de pagamento salvos
exports.paymentMethods = (0, pg_core_1.pgTable)("payment_methods", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    stripePaymentMethodId: (0, pg_core_1.varchar)("stripe_payment_method_id").notNull().unique(),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // card, bank_account
    cardBrand: (0, pg_core_1.varchar)("card_brand", { length: 20 }), // visa, mastercard, etc
    cardLast4: (0, pg_core_1.varchar)("card_last4", { length: 4 }),
    cardExpMonth: (0, pg_core_1.integer)("card_exp_month"),
    cardExpYear: (0, pg_core_1.integer)("card_exp_year"),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Invoice History - Histórico de faturas
exports.invoices = (0, pg_core_1.pgTable)("invoices", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    subscriptionId: (0, pg_core_1.varchar)("subscription_id").references(() => exports.subscriptions.id),
    stripeInvoiceId: (0, pg_core_1.varchar)("stripe_invoice_id").unique(),
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number", { length: 50 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull(), // draft, open, paid, void
    amountDue: (0, pg_core_1.decimal)("amount_due", { precision: 10, scale: 2 }).notNull(),
    amountPaid: (0, pg_core_1.decimal)("amount_paid", { precision: 10, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default('BRL'),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    paidAt: (0, pg_core_1.timestamp)("paid_at"),
    hostedInvoiceUrl: (0, pg_core_1.varchar)("hosted_invoice_url"),
    invoicePdf: (0, pg_core_1.varchar)("invoice_pdf"),
    periodStart: (0, pg_core_1.timestamp)("period_start"),
    periodEnd: (0, pg_core_1.timestamp)("period_end"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Webhook Events - Log de eventos Stripe
exports.webhookEvents = (0, pg_core_1.pgTable)("webhook_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    stripeEventId: (0, pg_core_1.varchar)("stripe_event_id").notNull().unique(),
    eventType: (0, pg_core_1.varchar)("event_type", { length: 100 }).notNull(),
    apiVersion: (0, pg_core_1.varchar)("api_version", { length: 20 }),
    processed: (0, pg_core_1.boolean)("processed").default(false),
    processingError: (0, pg_core_1.text)("processing_error"),
    data: (0, pg_core_1.jsonb)("data").notNull(),
    receivedAt: (0, pg_core_1.timestamp)("received_at").defaultNow(),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
});
// Business Leads - Formulário empresarial (não pagantes)
exports.businessLeads = (0, pg_core_1.pgTable)("business_leads", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 100 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 20 }),
    companyName: (0, pg_core_1.varchar)("company_name", { length: 200 }).notNull(),
    cnpj: (0, pg_core_1.varchar)("cnpj", { length: 18 }),
    employeeCount: (0, pg_core_1.integer)("employee_count"),
    sector: (0, pg_core_1.varchar)("sector", { length: 100 }),
    message: (0, pg_core_1.text)("message"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default('new'), // new, contacted, qualified, converted
    contactedAt: (0, pg_core_1.timestamp)("contacted_at"),
    notes: (0, pg_core_1.text)("notes"), // Internal notes
    assignedTo: (0, pg_core_1.varchar)("assigned_to").references(() => exports.users.id), // TOIT team member
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Verification Tokens - Tokens para validação de email e telefone
exports.verificationTokens = (0, pg_core_1.pgTable)("verification_tokens", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    emailToken: (0, pg_core_1.varchar)("email_token", { length: 64 }).unique(), // Token para verificação de email
    phoneToken: (0, pg_core_1.varchar)("phone_token", { length: 6 }), // Código 6 dígitos para SMS
    phone: (0, pg_core_1.varchar)("phone", { length: 20 }), // Telefone associado ao token
    tokenType: (0, pg_core_1.varchar)("token_type", { length: 20 }).notNull(), // 'email', 'phone'
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    usedAt: (0, pg_core_1.timestamp)("used_at"), // NULL = não usado ainda
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Verification Codes - Sistema avançado de códigos de verificação Email/SMS
exports.verificationCodes = (0, pg_core_1.pgTable)("verification_codes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    user_id: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 10 }).notNull(), // 'email' or 'phone'
    code: (0, pg_core_1.varchar)("code", { length: 6 }).notNull(), // Código de 6 dígitos
    contact: (0, pg_core_1.varchar)("contact", { length: 100 }).notNull(), // Email ou telefone
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(),
    attempts: (0, pg_core_1.integer)("attempts").default(0), // Número de tentativas de verificação
    verified: (0, pg_core_1.boolean)("verified").default(false), // Se foi verificado com sucesso
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Calendar Integrations - Integrações com calendários externos (Google, Apple, Outlook)
exports.calendarIntegrations = (0, pg_core_1.pgTable)("calendar_integrations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    provider: (0, pg_core_1.varchar)("provider", { length: 20 }).notNull(), // 'google', 'apple', 'outlook'
    accessToken: (0, pg_core_1.text)("access_token").notNull(), // Token de acesso OAuth
    refreshToken: (0, pg_core_1.text)("refresh_token"), // Token para renovar acesso
    tokenExpiresAt: (0, pg_core_1.timestamp)("token_expires_at"), // Quando o token expira
    calendarId: (0, pg_core_1.varchar)("calendar_id", { length: 255 }).notNull(), // ID do calendário no provedor
    calendarName: (0, pg_core_1.varchar)("calendar_name", { length: 255 }).notNull(), // Nome do calendário
    isActive: (0, pg_core_1.boolean)("is_active").default(true), // Se a integração está ativa
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"), // Última sincronização
    syncErrors: (0, pg_core_1.integer)("sync_errors").default(0), // Número de erros na sincronização
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Calendar Events - Eventos importados dos calendários externos
exports.calendarEvents = (0, pg_core_1.pgTable)("calendar_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    integrationId: (0, pg_core_1.varchar)("integration_id").references(() => exports.calendarIntegrations.id).notNull(),
    externalId: (0, pg_core_1.varchar)("external_id", { length: 255 }).notNull(), // ID do evento no provedor externo
    title: (0, pg_core_1.varchar)("title", { length: 500 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    startTime: (0, pg_core_1.timestamp)("start_time").notNull(),
    endTime: (0, pg_core_1.timestamp)("end_time").notNull(),
    attendees: (0, pg_core_1.jsonb)("attendees"), // Array de emails dos participantes
    location: (0, pg_core_1.varchar)("location", { length: 500 }),
    reminders: (0, pg_core_1.jsonb)("reminders"), // Array de lembretes
    recurrence: (0, pg_core_1.text)("recurrence"), // Regras de recorrência
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default('confirmed'), // 'confirmed', 'tentative', 'cancelled'
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at").defaultNow(), // Última sincronização deste evento
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// RELATIONS
exports.databaseConnectionsRelations = (0, drizzle_orm_1.relations)(exports.databaseConnections, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.databaseConnections.tenantId], references: [exports.tenants.id] }),
}));
exports.apiConnectionsRelations = (0, drizzle_orm_1.relations)(exports.apiConnections, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.apiConnections.tenantId], references: [exports.tenants.id] }),
}));
exports.queryBuildersRelations = (0, drizzle_orm_1.relations)(exports.queryBuilders, ({ one, many }) => ({
    tenant: one(exports.tenants, { fields: [exports.queryBuilders.tenantId], references: [exports.tenants.id] }),
    user: one(exports.users, { fields: [exports.queryBuilders.userId], references: [exports.users.id] }),
    kpiDashboards: many(exports.kpiDashboards),
}));
exports.kpiDashboardsRelations = (0, drizzle_orm_1.relations)(exports.kpiDashboards, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.kpiDashboards.tenantId], references: [exports.tenants.id] }),
    user: one(exports.users, { fields: [exports.kpiDashboards.userId], references: [exports.users.id] }),
    queryBuilder: one(exports.queryBuilders, { fields: [exports.kpiDashboards.queryBuilderId], references: [exports.queryBuilders.id] }),
}));
exports.uploadedFilesRelations = (0, drizzle_orm_1.relations)(exports.uploadedFiles, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.uploadedFiles.tenantId], references: [exports.tenants.id] }),
    user: one(exports.users, { fields: [exports.uploadedFiles.userId], references: [exports.users.id] }),
}));
exports.completeWorkflowsRelations = (0, drizzle_orm_1.relations)(exports.completeWorkflows, ({ one, many }) => ({
    tenant: one(exports.tenants, { fields: [exports.completeWorkflows.tenantId], references: [exports.tenants.id] }),
    user: one(exports.users, { fields: [exports.completeWorkflows.userId], references: [exports.users.id] }),
    executions: many(exports.completeWorkflowExecutions),
}));
exports.completeWorkflowExecutionsRelations = (0, drizzle_orm_1.relations)(exports.completeWorkflowExecutions, ({ one }) => ({
    workflow: one(exports.completeWorkflows, { fields: [exports.completeWorkflowExecutions.workflowId], references: [exports.completeWorkflows.id] }),
    tenant: one(exports.tenants, { fields: [exports.completeWorkflowExecutions.tenantId], references: [exports.tenants.id] }),
}));
// Payment System Relations
exports.paymentPlansRelations = (0, drizzle_orm_1.relations)(exports.paymentPlans, ({ many }) => ({
    subscriptions: many(exports.subscriptions),
}));
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one, many }) => ({
    tenant: one(exports.tenants, { fields: [exports.subscriptions.tenantId], references: [exports.tenants.id] }),
    plan: one(exports.paymentPlans, { fields: [exports.subscriptions.planId], references: [exports.paymentPlans.id] }),
    transactions: many(exports.paymentTransactions),
    invoices: many(exports.invoices),
}));
exports.paymentTransactionsRelations = (0, drizzle_orm_1.relations)(exports.paymentTransactions, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.paymentTransactions.tenantId], references: [exports.tenants.id] }),
    subscription: one(exports.subscriptions, { fields: [exports.paymentTransactions.subscriptionId], references: [exports.subscriptions.id] }),
}));
exports.paymentMethodsRelations = (0, drizzle_orm_1.relations)(exports.paymentMethods, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.paymentMethods.tenantId], references: [exports.tenants.id] }),
}));
exports.invoicesRelations = (0, drizzle_orm_1.relations)(exports.invoices, ({ one }) => ({
    tenant: one(exports.tenants, { fields: [exports.invoices.tenantId], references: [exports.tenants.id] }),
    subscription: one(exports.subscriptions, { fields: [exports.invoices.subscriptionId], references: [exports.subscriptions.id] }),
}));
exports.businessLeadsRelations = (0, drizzle_orm_1.relations)(exports.businessLeads, ({ one }) => ({
    assignedUser: one(exports.users, { fields: [exports.businessLeads.assignedTo], references: [exports.users.id] }),
}));
exports.verificationTokensRelations = (0, drizzle_orm_1.relations)(exports.verificationTokens, ({ one }) => ({
    user: one(exports.users, { fields: [exports.verificationTokens.userId], references: [exports.users.id] }),
}));
exports.verificationCodesRelations = (0, drizzle_orm_1.relations)(exports.verificationCodes, ({ one }) => ({
    user: one(exports.users, { fields: [exports.verificationCodes.user_id], references: [exports.users.id] }),
}));
// ==========================================
// WORKFLOW ENGINE - VISUAL BUILDER TABLES
// ==========================================
// Node types for visual workflow builder
exports.nodeTypeEnum = (0, pg_core_1.pgEnum)('node_type', [
    'trigger',
    'action',
    'condition',
    'loop',
    'delay',
    'webhook',
    'email',
    'api_call',
    'database_query',
    'file_process',
    'approval',
    'notification',
    'data_transform',
    'schedule'
]);
// triggerTypeEnum duplicado removido - já definido na linha 39
exports.executionStatusEnum = (0, pg_core_1.pgEnum)('execution_status', [
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'waiting_approval'
]);
// Visual workflow canvas definitions
exports.visualWorkflows = (0, pg_core_1.pgTable)("visual_workflows", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    version: (0, pg_core_1.integer)("version").default(1),
    // Canvas and visual properties
    canvasData: (0, pg_core_1.jsonb)("canvas_data").default({}), // Nodes positions, connections, zoom, etc
    nodes: (0, pg_core_1.jsonb)("nodes").default([]), // Array of workflow nodes
    connections: (0, pg_core_1.jsonb)("connections").default([]), // Array of node connections
    // Execution properties
    isActive: (0, pg_core_1.boolean)("is_active").default(false),
    triggerConfig: (0, pg_core_1.jsonb)("trigger_config").default({}), // Trigger configuration
    variables: (0, pg_core_1.jsonb)("variables").default({}), // Workflow-level variables
    settings: (0, pg_core_1.jsonb)("settings").default({}), // Execution settings
    // Statistics
    executionCount: (0, pg_core_1.integer)("execution_count").default(0),
    successRate: (0, pg_core_1.decimal)("success_rate", { precision: 5, scale: 2 }).default('0'),
    lastExecuted: (0, pg_core_1.timestamp)("last_executed"),
    avgExecutionTime: (0, pg_core_1.integer)("avg_execution_time"), // in milliseconds
    // Metadata
    tags: (0, pg_core_1.jsonb)("tags").default([]), // Array of tags for organization
    category: (0, pg_core_1.varchar)("category", { length: 100 }),
    isTemplate: (0, pg_core_1.boolean)("is_template").default(false),
    templateInfo: (0, pg_core_1.jsonb)("template_info"), // If it's a template
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Individual workflow nodes with visual properties
exports.workflowNodes = (0, pg_core_1.pgTable)("workflow_nodes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id, { onDelete: "cascade" }).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Node identification
    nodeKey: (0, pg_core_1.varchar)("node_key", { length: 50 }).notNull(), // Unique within workflow
    nodeType: (0, exports.nodeTypeEnum)("node_type").notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Visual properties
    position: (0, pg_core_1.jsonb)("position").notNull(), // { x: number, y: number }
    size: (0, pg_core_1.jsonb)("size").default({ width: 200, height: 100 }), // { width: number, height: number }
    style: (0, pg_core_1.jsonb)("style").default({}), // Visual styling properties
    // Configuration
    config: (0, pg_core_1.jsonb)("config").notNull(), // Node-specific configuration
    inputSchema: (0, pg_core_1.jsonb)("input_schema").default({}), // Expected input structure
    outputSchema: (0, pg_core_1.jsonb)("output_schema").default({}), // Output structure
    // Execution properties
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true),
    timeout: (0, pg_core_1.integer)("timeout").default(30000), // Timeout in milliseconds
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Node connections/edges
exports.workflowConnections = (0, pg_core_1.pgTable)("workflow_connections", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id, { onDelete: "cascade" }).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Connection endpoints
    sourceNodeId: (0, pg_core_1.varchar)("source_node_id").references(() => exports.workflowNodes.id, { onDelete: "cascade" }).notNull(),
    targetNodeId: (0, pg_core_1.varchar)("target_node_id").references(() => exports.workflowNodes.id, { onDelete: "cascade" }).notNull(),
    sourceHandle: (0, pg_core_1.varchar)("source_handle", { length: 50 }), // Output handle identifier
    targetHandle: (0, pg_core_1.varchar)("target_handle", { length: 50 }), // Input handle identifier
    // Connection properties
    label: (0, pg_core_1.varchar)("label", { length: 100 }),
    style: (0, pg_core_1.jsonb)("style").default({}), // Visual styling
    // Conditional connections
    condition: (0, pg_core_1.jsonb)("condition"), // Condition for this connection to be taken
    priority: (0, pg_core_1.integer)("priority").default(0), // For multiple connections from same node
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Workflow execution logs with detailed tracking
exports.visualWorkflowExecutions = (0, pg_core_1.pgTable)("visual_workflow_executions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id),
    // Execution tracking
    executionId: (0, pg_core_1.varchar)("execution_id").notNull().unique(), // Unique execution identifier
    status: (0, exports.executionStatusEnum)("status").default('pending'),
    triggerType: (0, exports.triggerTypeEnum)("trigger_type").notNull(),
    triggerData: (0, pg_core_1.jsonb)("trigger_data"), // Data that triggered the execution
    // Execution context
    context: (0, pg_core_1.jsonb)("context").default({}), // Execution context and variables
    input: (0, pg_core_1.jsonb)("input"), // Input data for execution
    output: (0, pg_core_1.jsonb)("output"), // Final output
    // Timing
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    duration: (0, pg_core_1.integer)("duration"), // Duration in milliseconds
    // Error handling
    error: (0, pg_core_1.text)("error"),
    errorNode: (0, pg_core_1.varchar)("error_node"), // Node that caused the error
    stackTrace: (0, pg_core_1.text)("stack_trace"),
    // Statistics
    nodesExecuted: (0, pg_core_1.integer)("nodes_executed").default(0),
    totalNodes: (0, pg_core_1.integer)("total_nodes").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Node execution logs for detailed tracking
exports.nodeExecutions = (0, pg_core_1.pgTable)("node_executions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    executionId: (0, pg_core_1.varchar)("execution_id").references(() => exports.visualWorkflowExecutions.executionId, { onDelete: "cascade" }).notNull(),
    nodeId: (0, pg_core_1.varchar)("node_id").references(() => exports.workflowNodes.id).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Execution details
    status: (0, exports.executionStatusEnum)("status").default('pending'),
    input: (0, pg_core_1.jsonb)("input"), // Input data for this node
    output: (0, pg_core_1.jsonb)("output"), // Output data from this node
    // Timing
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    duration: (0, pg_core_1.integer)("duration"), // Duration in milliseconds
    // Error handling
    error: (0, pg_core_1.text)("error"),
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Workflow triggers configuration
exports.workflowTriggers = (0, pg_core_1.pgTable)("workflow_triggers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id, { onDelete: "cascade" }).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Trigger configuration
    triggerType: (0, exports.triggerTypeEnum)("trigger_type").notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Configuration based on trigger type
    config: (0, pg_core_1.jsonb)("config").notNull(), // Trigger-specific configuration
    conditions: (0, pg_core_1.jsonb)("conditions").default([]), // Array of conditions
    // Schedule specific (for schedule triggers)
    cronExpression: (0, pg_core_1.varchar)("cron_expression"), // Cron expression for scheduling
    timezone: (0, pg_core_1.varchar)("timezone").default('UTC'),
    // Webhook specific
    webhookUrl: (0, pg_core_1.varchar)("webhook_url"), // Generated webhook URL
    webhookSecret: (0, pg_core_1.varchar)("webhook_secret"), // Secret for webhook validation
    // Email specific
    emailFilters: (0, pg_core_1.jsonb)("email_filters"), // Email filtering rules
    // Status
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTriggered: (0, pg_core_1.timestamp)("last_triggered"),
    triggerCount: (0, pg_core_1.integer)("trigger_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Workflow templates for reusability
exports.workflowTemplates = (0, pg_core_1.pgTable)("workflow_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 100 }),
    // Template data
    templateData: (0, pg_core_1.jsonb)("template_data").notNull(), // Complete workflow structure
    previewImage: (0, pg_core_1.varchar)("preview_image"), // Preview image URL
    // Metadata
    tags: (0, pg_core_1.jsonb)("tags").default([]),
    difficulty: (0, pg_core_1.varchar)("difficulty", { length: 20 }).default('beginner'), // beginner, intermediate, advanced
    estimatedTime: (0, pg_core_1.integer)("estimated_time"), // Setup time in minutes
    // Usage statistics
    useCount: (0, pg_core_1.integer)("use_count").default(0),
    rating: (0, pg_core_1.decimal)("rating", { precision: 3, scale: 2 }).default('0'),
    // Availability
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    isPremium: (0, pg_core_1.boolean)("is_premium").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Workflow variables for dynamic data handling
exports.workflowVariables = (0, pg_core_1.pgTable)("workflow_variables", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id, { onDelete: "cascade" }).notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Variable definition
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // string, number, boolean, object, array
    defaultValue: (0, pg_core_1.jsonb)("default_value"),
    // Metadata
    description: (0, pg_core_1.text)("description"),
    isRequired: (0, pg_core_1.boolean)("is_required").default(false),
    isSecret: (0, pg_core_1.boolean)("is_secret").default(false), // For sensitive data
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// ==============================================
// EMAIL & CALENDAR WORKFLOW TRIGGERS - SISTEMA CRÍTICO
// ==============================================
// Email Accounts - Contas de email conectadas
exports.emailAccounts = (0, pg_core_1.pgTable)("email_accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    // Account details
    email: (0, pg_core_1.varchar)("email").notNull(),
    displayName: (0, pg_core_1.varchar)("display_name"),
    provider: (0, pg_core_1.varchar)("provider", { length: 50 }).notNull(), // 'gmail', 'outlook', 'yahoo', 'imap'
    // Authentication
    accessToken: (0, pg_core_1.text)("access_token"), // OAuth token (encrypted)
    refreshToken: (0, pg_core_1.text)("refresh_token"), // OAuth refresh token (encrypted)
    // IMAP/SMTP configuration for non-OAuth providers
    imapHost: (0, pg_core_1.varchar)("imap_host"),
    imapPort: (0, pg_core_1.integer)("imap_port"),
    smtpHost: (0, pg_core_1.varchar)("smtp_host"),
    smtpPort: (0, pg_core_1.integer)("smtp_port"),
    // Status
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"),
    lastError: (0, pg_core_1.text)("last_error"),
    // Settings
    syncSettings: (0, pg_core_1.jsonb)("sync_settings").default({
        syncFrequency: 5, // minutes
        maxEmailsPerSync: 100,
        syncFolders: ['INBOX'],
        enableRealTimeSync: true
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Calendar Accounts - Contas de calendário conectadas  
exports.calendarAccounts = (0, pg_core_1.pgTable)("calendar_accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    // Account details
    email: (0, pg_core_1.varchar)("email").notNull(),
    displayName: (0, pg_core_1.varchar)("display_name"),
    provider: (0, pg_core_1.varchar)("provider", { length: 50 }).notNull(), // 'google', 'outlook', 'apple', 'caldav'
    // Authentication
    accessToken: (0, pg_core_1.text)("access_token"), // OAuth token (encrypted)
    refreshToken: (0, pg_core_1.text)("refresh_token"), // OAuth refresh token (encrypted)
    // CalDAV configuration
    caldavUrl: (0, pg_core_1.varchar)("caldav_url"),
    caldavUsername: (0, pg_core_1.varchar)("caldav_username"),
    caldavPassword: (0, pg_core_1.text)("caldav_password"), // encrypted
    // Status
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"),
    lastError: (0, pg_core_1.text)("last_error"),
    // Settings
    syncSettings: (0, pg_core_1.jsonb)("sync_settings").default({
        syncFrequency: 15, // minutes
        maxEventsPerSync: 200,
        syncCalendars: ['primary'],
        enableRealTimeSync: true,
        reminderMinutes: [15, 60, 1440] // 15min, 1h, 1day
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Email Triggers - Triggers baseados em emails
exports.emailTriggers = (0, pg_core_1.pgTable)("email_triggers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id, { onDelete: "cascade" }).notNull(),
    emailAccountId: (0, pg_core_1.varchar)("email_account_id").references(() => exports.emailAccounts.id).notNull(),
    // Trigger configuration
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    triggerType: (0, exports.emailTriggerTypeEnum)("trigger_type").notNull(),
    // Email matching rules
    senderRules: (0, pg_core_1.jsonb)("sender_rules").default([]), // Array de regras de remetente
    subjectRules: (0, pg_core_1.jsonb)("subject_rules").default([]), // Array de regras de assunto
    bodyRules: (0, pg_core_1.jsonb)("body_rules").default([]), // Array de regras de corpo
    attachmentRules: (0, pg_core_1.jsonb)("attachment_rules").default([]), // Array de regras de anexos
    // Advanced filtering
    folders: (0, pg_core_1.jsonb)("folders").default(['INBOX']), // Pastas para monitorar
    isRead: (0, pg_core_1.boolean)("is_read"), // null = any, true = read only, false = unread only
    hasAttachments: (0, pg_core_1.boolean)("has_attachments"), // null = any, true = with, false = without
    priority: (0, pg_core_1.varchar)("priority", { length: 20 }), // 'high', 'normal', 'low', null = any
    // Data extraction rules
    dataExtractionRules: (0, pg_core_1.jsonb)("data_extraction_rules").default({}), // Como extrair dados do email
    // Status and statistics
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTriggered: (0, pg_core_1.timestamp)("last_triggered"),
    triggerCount: (0, pg_core_1.integer)("trigger_count").default(0),
    lastProcessedEmailId: (0, pg_core_1.varchar)("last_processed_email_id"), // Para evitar reprocessamento
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Calendar Triggers - Triggers baseados em eventos de calendário
exports.calendarTriggers = (0, pg_core_1.pgTable)("calendar_triggers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id, { onDelete: "cascade" }).notNull(),
    calendarAccountId: (0, pg_core_1.varchar)("calendar_account_id").references(() => exports.calendarAccounts.id).notNull(),
    // Trigger configuration
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    triggerType: (0, exports.calendarTriggerTypeEnum)("trigger_type").notNull(),
    // Event matching rules
    titleRules: (0, pg_core_1.jsonb)("title_rules").default([]), // Array de regras de título
    descriptionRules: (0, pg_core_1.jsonb)("description_rules").default([]), // Array de regras de descrição
    attendeeRules: (0, pg_core_1.jsonb)("attendee_rules").default([]), // Array de regras de participantes
    locationRules: (0, pg_core_1.jsonb)("location_rules").default([]), // Array de regras de localização
    // Calendar filtering
    calendars: (0, pg_core_1.jsonb)("calendars").default(['primary']), // Calendários para monitorar
    eventTypes: (0, pg_core_1.jsonb)("event_types").default([]), // Tipos de evento para filtrar
    // Time-based triggers
    minutesBeforeStart: (0, pg_core_1.integer)("minutes_before_start"), // Para event_starts_soon
    minutesAfterEnd: (0, pg_core_1.integer)("minutes_after_end"), // Para event_ends
    reminderOffsets: (0, pg_core_1.jsonb)("reminder_offsets").default([15, 60]), // Minutos antes para lembretes
    // Recurrence handling
    handleRecurring: (0, pg_core_1.boolean)("handle_recurring").default(true),
    maxRecurrenceInstances: (0, pg_core_1.integer)("max_recurrence_instances").default(10),
    // Data extraction rules
    dataExtractionRules: (0, pg_core_1.jsonb)("data_extraction_rules").default({}), // Como extrair dados do evento
    // Status and statistics
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastTriggered: (0, pg_core_1.timestamp)("last_triggered"),
    triggerCount: (0, pg_core_1.integer)("trigger_count").default(0),
    lastProcessedEventId: (0, pg_core_1.varchar)("last_processed_event_id"), // Para evitar reprocessamento
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Email Processing Queue - Fila de processamento de emails
exports.emailProcessingQueue = (0, pg_core_1.pgTable)("email_processing_queue", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    emailAccountId: (0, pg_core_1.varchar)("email_account_id").references(() => exports.emailAccounts.id).notNull(),
    // Email data
    messageId: (0, pg_core_1.varchar)("message_id").notNull(), // Email message ID
    emailData: (0, pg_core_1.jsonb)("email_data").notNull(), // Dados completos do email
    // Processing status
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
    triggersMatched: (0, pg_core_1.jsonb)("triggers_matched").default([]), // Array de trigger IDs que matcharam
    // Execution tracking
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    error: (0, pg_core_1.text)("error"),
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    maxRetries: (0, pg_core_1.integer)("max_retries").default(3),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Calendar Event Processing Queue - Fila de processamento de eventos
exports.calendarEventProcessingQueue = (0, pg_core_1.pgTable)("calendar_event_processing_queue", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    calendarAccountId: (0, pg_core_1.varchar)("calendar_account_id").references(() => exports.calendarAccounts.id).notNull(),
    // Event data
    eventId: (0, pg_core_1.varchar)("event_id").notNull(), // Calendar event ID
    eventData: (0, pg_core_1.jsonb)("event_data").notNull(), // Dados completos do evento
    // Processing status
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
    triggersMatched: (0, pg_core_1.jsonb)("triggers_matched").default([]), // Array de trigger IDs que matcharam
    // Execution tracking
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    error: (0, pg_core_1.text)("error"),
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    maxRetries: (0, pg_core_1.integer)("max_retries").default(3),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Trigger Execution History - Histórico de execuções de triggers
exports.triggerExecutionHistory = (0, pg_core_1.pgTable)("trigger_execution_history", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Trigger reference
    triggerType: (0, pg_core_1.varchar)("trigger_type", { length: 50 }).notNull(), // 'email' or 'calendar'
    triggerId: (0, pg_core_1.varchar)("trigger_id").notNull(), // ID do email_trigger ou calendar_trigger
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id).notNull(),
    // Execution data
    executionId: (0, pg_core_1.varchar)("execution_id"), // Link para workflow execution
    triggerData: (0, pg_core_1.jsonb)("trigger_data").notNull(), // Dados que causaram o trigger
    extractedData: (0, pg_core_1.jsonb)("extracted_data").default({}), // Dados extraídos pelo trigger
    // Result
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull(), // 'success', 'failed', 'skipped'
    error: (0, pg_core_1.text)("error"),
    // Timing
    triggeredAt: (0, pg_core_1.timestamp)("triggered_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    duration: (0, pg_core_1.integer)("duration"), // Duração em milliseconds
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// ===== QUANTUM MONETIZATION SYSTEM =====
// Quantum Package Types
exports.quantumPackageTypeEnum = (0, pg_core_1.pgEnum)('quantum_package_type', ['lite', 'unstoppable']);
exports.quantumTransactionTypeEnum = (0, pg_core_1.pgEnum)('quantum_transaction_type', ['credit_purchase', 'execution_charge', 'refund', 'bonus']);
exports.quantumAlgorithmTypeEnum = (0, pg_core_1.pgEnum)('quantum_algorithm_type', [
    // Lite (incluído na mensalidade)
    'adaptive_engine', 'basic_optimization', 'pattern_recognition',
    // Unstoppable (pago por execução)
    'grovers_search', 'qaoa_optimization', 'quantum_ml', 'business_analytics',
    'qiskit_transpiler', 'long_range_entanglement', 'quantum_teleportation',
    'real_quantum_hardware', 'ai_enhanced_circuits'
]);
// Quantum Packages - Pacotes de quantum computing
exports.quantumPackages = (0, pg_core_1.pgTable)("quantum_packages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Package configuration
    packageType: (0, exports.quantumPackageTypeEnum)("package_type").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    // Lite package settings (incluído na mensalidade)
    liteAlgorithmsIncluded: (0, pg_core_1.jsonb)("lite_algorithms_included").default([
        'adaptive_engine', 'basic_optimization', 'pattern_recognition'
    ]),
    // Unstoppable package settings (sistema de créditos)
    creditsBalance: (0, pg_core_1.integer)("credits_balance").default(0), // Créditos disponíveis
    totalCreditsSpent: (0, pg_core_1.integer)("total_credits_spent").default(0), // Total gasto histórico
    // Pricing configuration (em centavos)
    creditPriceInCents: (0, pg_core_1.integer)("credit_price_in_cents").default(500), // R$ 5,00 por crédito
    autoRechargeEnabled: (0, pg_core_1.boolean)("auto_recharge_enabled").default(false),
    autoRechargeAmount: (0, pg_core_1.integer)("auto_recharge_amount").default(100), // Comprar 100 créditos quando acabar
    lowBalanceThreshold: (0, pg_core_1.integer)("low_balance_threshold").default(10), // Alertar quando < 10 créditos
    // Usage limits
    monthlyExecutionLimit: (0, pg_core_1.integer)("monthly_execution_limit"), // null = unlimited
    monthlyExecutionsUsed: (0, pg_core_1.integer)("monthly_executions_used").default(0),
    lastMonthlyReset: (0, pg_core_1.timestamp)("last_monthly_reset").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Quantum Algorithm Pricing - Preços por algoritmo
exports.quantumAlgorithmPricing = (0, pg_core_1.pgTable)("quantum_algorithm_pricing", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    algorithmType: (0, exports.quantumAlgorithmTypeEnum)("algorithm_type").notNull().unique(),
    packageRequired: (0, exports.quantumPackageTypeEnum)("package_required").notNull(),
    // Pricing
    creditsPerExecution: (0, pg_core_1.integer)("credits_per_execution").notNull(), // Créditos consumidos por execução
    estimatedExecutionTime: (0, pg_core_1.integer)("estimated_execution_time"), // Tempo estimado em milliseconds
    // Metadata
    displayName: (0, pg_core_1.varchar)("display_name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    // Computational complexity
    complexityLevel: (0, pg_core_1.varchar)("complexity_level", { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'extreme'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Quantum Transactions - Histórico de compras e consumo de créditos
exports.quantumTransactions = (0, pg_core_1.pgTable)("quantum_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    quantumPackageId: (0, pg_core_1.varchar)("quantum_package_id").references(() => exports.quantumPackages.id).notNull(),
    // Transaction details
    transactionType: (0, exports.quantumTransactionTypeEnum)("transaction_type").notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(), // Créditos (positivo = ganho, negativo = gasto)
    balanceBefore: (0, pg_core_1.integer)("balance_before").notNull(),
    balanceAfter: (0, pg_core_1.integer)("balance_after").notNull(),
    // Payment information (para compras)
    priceInCents: (0, pg_core_1.integer)("price_in_cents"), // Valor pago em centavos (apenas para compras)
    stripePaymentIntentId: (0, pg_core_1.varchar)("stripe_payment_intent_id"),
    stripeInvoiceId: (0, pg_core_1.varchar)("stripe_invoice_id"),
    // Execution information (para execuções)
    algorithmType: (0, exports.quantumAlgorithmTypeEnum)("algorithm_type"),
    executionId: (0, pg_core_1.varchar)("execution_id"), // ID da execução que consumiu créditos
    executionMetadata: (0, pg_core_1.jsonb)("execution_metadata"), // Dados da execução
    // Metadata
    description: (0, pg_core_1.text)("description"),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Dados extras
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Quantum Executions - Log de todas as execuções quantum
exports.quantumExecutions = (0, pg_core_1.pgTable)("quantum_executions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    quantumPackageId: (0, pg_core_1.varchar)("quantum_package_id").references(() => exports.quantumPackages.id).notNull(),
    // Execution details
    algorithmType: (0, exports.quantumAlgorithmTypeEnum)("algorithm_type").notNull(),
    inputData: (0, pg_core_1.jsonb)("input_data").notNull(), // Dados de entrada
    outputData: (0, pg_core_1.jsonb)("output_data"), // Resultado da execução
    // Performance metrics
    executionTimeMs: (0, pg_core_1.integer)("execution_time_ms"), // Tempo de execução
    quantumAdvantage: (0, pg_core_1.decimal)("quantum_advantage", { precision: 5, scale: 2 }), // Fator de vantagem quântica
    classicalComparison: (0, pg_core_1.jsonb)("classical_comparison"), // Comparação com algoritmo clássico
    // Billing
    creditsCharged: (0, pg_core_1.integer)("credits_charged").notNull(), // Créditos cobrados
    transactionId: (0, pg_core_1.varchar)("transaction_id").references(() => exports.quantumTransactions.id),
    // Status
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull(), // 'running', 'completed', 'failed', 'timeout'
    error: (0, pg_core_1.text)("error"),
    // Context
    workflowId: (0, pg_core_1.varchar)("workflow_id").references(() => exports.visualWorkflows.id), // Se executado via workflow
    workflowExecutionId: (0, pg_core_1.varchar)("workflow_execution_id"),
    // Enhanced with IBM Qiskit
    useQiskitEnhancement: (0, pg_core_1.boolean)("use_qiskit_enhancement").default(false),
    qiskitOptimizationApplied: (0, pg_core_1.jsonb)("qiskit_optimization_applied"), // Otimizações aplicadas
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Quantum Usage Analytics - Analytics de uso quantum por tenant
exports.quantumUsageAnalytics = (0, pg_core_1.pgTable)("quantum_usage_analytics", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").references(() => exports.tenants.id).notNull(),
    // Period
    period: (0, pg_core_1.varchar)("period", { length: 7 }).notNull(), // 'YYYY-MM' format
    // Usage metrics
    totalExecutions: (0, pg_core_1.integer)("total_executions").default(0),
    totalCreditsSpent: (0, pg_core_1.integer)("total_credits_spent").default(0),
    totalExecutionTimeMs: (0, pg_core_1.integer)("total_execution_time_ms").default(0),
    // Algorithm breakdown
    algorithmUsage: (0, pg_core_1.jsonb)("algorithm_usage").default({}), // { "algorithm_type": execution_count }
    // Performance metrics
    avgQuantumAdvantage: (0, pg_core_1.decimal)("avg_quantum_advantage", { precision: 5, scale: 2 }),
    successRate: (0, pg_core_1.decimal)("success_rate", { precision: 5, scale: 2 }), // % de execuções bem-sucedidas
    // Business impact
    estimatedTimeSaved: (0, pg_core_1.integer)("estimated_time_saved"), // Tempo economizado vs clássico (segundos)
    costPerExecution: (0, pg_core_1.decimal)("cost_per_execution", { precision: 8, scale: 2 }), // Custo médio por execução
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
//# sourceMappingURL=schema.js.map