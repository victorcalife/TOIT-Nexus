import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  unique,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'toit_admin', 'tenant_admin', 'manager', 'employee']);
export const riskProfileEnum = pgEnum('risk_profile', ['conservative', 'moderate', 'aggressive']);
export const integrationTypeEnum = pgEnum('integration_type', ['api', 'database', 'webhook', 'email']);
export const workflowStatusEnum = pgEnum('workflow_status', ['active', 'inactive', 'draft']);
export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'inactive', 'suspended']);
export const permissionTypeEnum = pgEnum('permission_type', ['read', 'write', 'delete', 'admin']);
export const departmentTypeEnum = pgEnum('department_type', ['sales', 'purchases', 'finance', 'operations', 'hr', 'it', 'marketing', 'custom']);
export const databaseTypeEnum = pgEnum('database_type', ['postgresql', 'mysql', 'mssql', 'oracle', 'sqlite']);
export const chartTypeEnum = pgEnum('chart_type', ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter']);
export const workflowStepTypeEnum = pgEnum('workflow_step_type', ['condition', 'action', 'webhook', 'email', 'api_call', 'file_process', 'database_query']);
export const triggerTypeEnum = pgEnum('trigger_type', ['email_received', 'email_sent', 'calendar_event', 'calendar_reminder', 'contact_update']);
export const emailTriggerTypeEnum = pgEnum('email_trigger_type', ['sender_match', 'subject_contains', 'body_contains', 'attachment_exists', 'keyword_match']);
export const calendarTriggerTypeEnum = pgEnum('calendar_trigger_type', ['event_created', 'event_updated', 'event_starts_soon', 'event_ends', 'reminder_time']);

// Tenants table (empresas/clientes)
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  domain: varchar("domain", { length: 255 }), // Optional custom domain
  logo: varchar("logo"),
  settings: jsonb("settings"), // Tenant-specific configurations
  status: tenantStatusEnum("status").default('active'),
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default('basic'),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  accessProfileId: varchar("access_profile_id").references(() => accessProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table with CPF/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpf: varchar("cpf", { length: 11 }).unique().notNull(), // CPF sem formatação (apenas números)
  email: varchar("email").unique(),
  password: varchar("password").notNull(), // Hash da senha
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  birthDate: varchar("birth_date", { length: 10 }), // YYYY-MM-DD
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('employee'),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for super_admin
  isActive: boolean("is_active").default(false), // MUDANÇA: Inativo até validação
  // Campos para sistema de trial e validação
  planType: varchar("plan_type", { length: 50 }), // basico, standard, premium, enterprise
  planCycle: varchar("plan_cycle", { length: 20 }), // monthly, yearly
  trialEndsAt: timestamp("trial_ends_at"), // Data fim do trial
  trialPlan: varchar("trial_plan", { length: 50 }).default('standard'), // Plano durante trial
  isTrialActive: boolean("is_trial_active").default(false), // Se está em trial
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table for organizational structure within tenants
export const departments: any = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: departmentTypeEnum("type").notNull(),
  description: text("description"),
  parentDepartmentId: varchar("parent_department_id"), // For hierarchical departments
  settings: jsonb("settings"), // Department-specific configurations
  dataFilters: jsonb("data_filters"), // What data this department can access
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-Department assignments (users can belong to multiple departments)
export const userDepartments = pgTable("user_departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  departmentId: varchar("department_id").references(() => departments.id).notNull(),
  isPrimary: boolean("is_primary").default(false), // Primary department for the user
  createdAt: timestamp("created_at").defaultNow(),
});

// Permissions table for granular access control
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(), // 'clients', 'reports', 'workflows', etc.
  action: permissionTypeEnum("action").notNull(),
  conditions: jsonb("conditions"), // Additional conditions (e.g., only own department data)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role-Permission assignments
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  role: userRoleEnum("role").notNull(),
  permissionId: varchar("permission_id").references(() => permissions.id).notNull(),
  departmentId: varchar("department_id").references(() => departments.id), // Permission specific to department
  createdAt: timestamp("created_at").defaultNow(),
});

// User-specific permissions (overrides for specific users)
export const userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  permissionId: varchar("permission_id").references(() => permissions.id).notNull(),
  departmentId: varchar("department_id").references(() => departments.id), // Permission specific to department
  granted: boolean("granted").default(true), // true = grant, false = revoke
  createdAt: timestamp("created_at").defaultNow(),
});

// Client categories table with tenant isolation
export const clientCategories = pgTable("client_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  minInvestment: decimal("min_investment", { precision: 15, scale: 2 }),
  maxInvestment: decimal("max_investment", { precision: 15, scale: 2 }),
  riskProfile: riskProfileEnum("risk_profile"),
  reportFrequency: varchar("report_frequency", { length: 50 }), // daily, weekly, monthly, quarterly
  rules: jsonb("rules"), // JSON object containing business rules
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table with tenant isolation
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  currentInvestment: decimal("current_investment", { precision: 15, scale: 2 }),
  riskProfile: riskProfileEnum("risk_profile"),
  categoryId: varchar("category_id").references(() => clientCategories.id),
  metadata: jsonb("metadata"), // Additional client data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integrations table with tenant isolation
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: integrationTypeEnum("type").notNull(),
  config: jsonb("config").notNull(), // API keys, endpoints, etc.
  isActive: boolean("is_active").default(true),
  lastStatus: varchar("last_status", { length: 50 }).default('unknown'),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflows table with tenant isolation
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  trigger: jsonb("trigger").notNull(), // Trigger conditions
  actions: jsonb("actions").notNull(), // Array of actions to execute
  status: workflowStatusEnum("status").default('draft'),
  categoryId: varchar("category_id").references(() => clientCategories.id),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow executions table with tenant isolation
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  workflowId: varchar("workflow_id").references(() => workflows.id).notNull(),
  clientId: varchar("client_id").references(() => clients.id),
  status: varchar("status", { length: 50 }).notNull(),
  result: jsonb("result"),
  error: text("error"),
  executedAt: timestamp("executed_at").defaultNow(),
});

// Reports table with tenant isolation and adaptive features
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  template: jsonb("template").notNull(),
  categoryId: varchar("category_id").references(() => clientCategories.id),
  // Enhanced adaptive features
  dataFilters: jsonb("data_filters"), // Dynamic filters based on tenant data
  kpiConfiguration: jsonb("kpi_configuration"), // Adaptive KPIs and indicators
  visualizationSettings: jsonb("visualization_settings"), // Dynamic charts
  autoAdaptRules: jsonb("auto_adapt_rules"), // Rules for automatic adaptation
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dynamic KPI definitions that adapt to tenant data
export const kpiDefinitions = pgTable("kpi_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // 'financial', 'client', 'portfolio', 'risk'
  calculationType: varchar("calculation_type", { length: 50 }).notNull(), // 'sum', 'avg', 'count', 'ratio', 'custom'
  dataSource: jsonb("data_source").notNull(), // Which tables/fields to use
  calculationFormula: text("calculation_formula"), // Custom calculations
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  alertThresholds: jsonb("alert_thresholds"), // Trigger alerts
  adaptationRules: jsonb("adaptation_rules"), // Auto-adapt based on data patterns
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow rules that adapt to client data patterns
export const workflowRules = pgTable("workflow_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  workflowId: varchar("workflow_id").references(() => workflows.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  triggerConditions: jsonb("trigger_conditions").notNull(), // Dynamic conditions based on data
  actions: jsonb("actions").notNull(), // Actions to execute
  dataThresholds: jsonb("data_thresholds"), // Adaptive thresholds based on historical data
  learningRules: jsonb("learning_rules"), // Rules for learning from data patterns
  priority: integer("priority").default(0), // Execution priority
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table for audit log with tenant isolation
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for super_admin actions
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id"),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved queries table for Query Builder
export const savedQueries = pgTable("saved_queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  queryConfig: jsonb("query_config").notNull(), // Query builder configuration
  visualizationConfig: jsonb("visualization_config").notNull(), // Chart/table configuration
  lastExecutedAt: timestamp("last_executed_at"),
  executionCount: integer("execution_count").default(0),
  isPublic: boolean("is_public").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard configurations
export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  layout: jsonb("layout").notNull(), // Dashboard layout configuration
  widgets: jsonb("widgets").notNull(), // Widget configurations
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  refreshInterval: integer("refresh_interval").default(300), // seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations

export const clientCategoriesRelations = relations(clientCategories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [clientCategories.tenantId],
    references: [tenants.id],
  }),
  clients: many(clients),
  workflows: many(workflows),
  reports: many(reports),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [clients.tenantId],
    references: [tenants.id],
  }),
  category: one(clientCategories, {
    fields: [clients.categoryId],
    references: [clientCategories.id],
  }),
  workflowExecutions: many(workflowExecutions),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrations.tenantId],
    references: [tenants.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [workflows.tenantId],
    references: [tenants.id],
  }),
  category: one(clientCategories, {
    fields: [workflows.categoryId],
    references: [clientCategories.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [workflowExecutions.tenantId],
    references: [tenants.id],
  }),
  workflow: one(workflows, {
    fields: [workflowExecutions.workflowId],
    references: [workflows.id],
  }),
  client: one(clients, {
    fields: [workflowExecutions.clientId],
    references: [clients.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reports.tenantId],
    references: [tenants.id],
  }),
  category: one(clientCategories, {
    fields: [reports.categoryId],
    references: [clientCategories.id],
  }),
}));

export const kpiDefinitionsRelations = relations(kpiDefinitions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [kpiDefinitions.tenantId],
    references: [tenants.id],
  }),
}));

export const workflowRulesRelations = relations(workflowRules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [workflowRules.tenantId],
    references: [tenants.id],
  }),
  workflow: one(workflows, {
    fields: [workflowRules.workflowId],
    references: [workflows.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activities.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const savedQueriesRelations = relations(savedQueries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [savedQueries.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [savedQueries.userId],
    references: [users.id],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dashboards.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
}));

// New relations for access control tables
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [departments.tenantId],
    references: [tenants.id],
  }),
  parentDepartment: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
  }),
  childDepartments: many(departments),
  userDepartments: many(userDepartments),
  rolePermissions: many(rolePermissions),
  userPermissions: many(userPermissions),
}));

export const userDepartmentsRelations = relations(userDepartments, ({ one }) => ({
  user: one(users, {
    fields: [userDepartments.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [userDepartments.departmentId],
    references: [departments.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [permissions.tenantId],
    references: [tenants.id],
  }),
  rolePermissions: many(rolePermissions),
  userPermissions: many(userPermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rolePermissions.tenantId],
    references: [tenants.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
  department: one(departments, {
    fields: [rolePermissions.departmentId],
    references: [departments.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
  department: one(departments, {
    fields: [userPermissions.departmentId],
    references: [departments.id],
  }),
}));

// SISTEMA DE MÓDULOS E ATIVAÇÃO - MONETIZAÇÃO E PERSONALIZAÇÃO
export const moduleDefinitions = pgTable("module_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // task_management, query_builder, crm, etc
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  category: varchar("category").default("core"), // core, advanced, premium, enterprise
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).default("0.00"),
  pricePerUser: decimal("price_per_user", { precision: 10, scale: 2 }).default("0.00"),
  priceModel: varchar("price_model").default("free"), // free, one_time, monthly, per_user, usage_based
  features: jsonb("features").default([]), // lista de funcionalidades incluídas
  limitations: jsonb("limitations").default({}), // limites por plano (max_tasks, max_users, etc)
  dependencies: jsonb("dependencies").default([]), // módulos necessários
  targetUserTypes: jsonb("target_user_types").default([]), // pessoa_fisica, pequena_empresa, enterprise
  isActive: boolean("is_active").default(true),
  icon: varchar("icon"), // ícone do módulo
  color: varchar("color"), // cor tema do módulo
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Access Profiles table - Define subscription plans with module access
export const accessProfiles = pgTable("access_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(), // BÁSICO, PREMIUM, ENTERPRISE
  slug: varchar("slug", { length: 100 }).notNull().unique(), // basico, premium, enterprise
  description: text("description"),
  price_monthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  price_yearly: decimal("price_yearly", { precision: 10, scale: 2 }).notNull(),
  max_users: integer("max_users").default(1), // -1 for unlimited
  max_storage_gb: integer("max_storage_gb").default(1),
  modules: jsonb("modules").default({}), // { module_id: enabled }
  features: jsonb("features").default([]), // lista de features destacadas
  stripe_price_id_monthly: varchar("stripe_price_id_monthly"), // price_1234abcd (mensal)
  stripe_price_id_yearly: varchar("stripe_price_id_yearly"), // price_5678efgh (anual)
  stripe_product_id: varchar("stripe_product_id"), // prod_1234abcd
  is_active: boolean("is_active").default(true),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const tenantModules = pgTable("tenant_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id").notNull().references(() => moduleDefinitions.id, { onDelete: "cascade" }),
  isEnabled: boolean("is_enabled").default(true),
  plan: varchar("plan").default("free"), // free, basic, premium, enterprise
  maxUsers: integer("max_users"), // limite de usuários para o módulo
  currentUsers: integer("current_users").default(0),
  usageLimits: jsonb("usage_limits").default({}), // limites específicos do tenant
  currentUsage: jsonb("current_usage").default({}), // uso atual
  customConfig: jsonb("custom_config").default({}), // configurações personalizadas
  billingCycle: varchar("billing_cycle").default("monthly"), // monthly, yearly
  nextBillingDate: timestamp("next_billing_date"),
  trialEndsAt: timestamp("trial_ends_at"),
  activatedAt: timestamp("activated_at").defaultNow(),
  activatedBy: varchar("activated_by").references(() => users.id),
  suspendedAt: timestamp("suspended_at"),
  suspendedReason: text("suspended_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userModuleAccess = pgTable("user_module_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id").notNull().references(() => moduleDefinitions.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  hasAccess: boolean("has_access").default(true),
  accessLevel: varchar("access_level").default("basic"), // basic, advanced, admin
  permissions: jsonb("permissions").default([]), // permissões específicas do módulo
  usageLimit: integer("usage_limit"), // limite de uso mensal
  currentUsage: integer("current_usage").default(0),
  features: jsonb("features").default([]), // funcionalidades específicas habilitadas
  restrictions: jsonb("restrictions").default({}), // restrições específicas
  lastUsedAt: timestamp("last_used_at"),
  grantedAt: timestamp("granted_at").defaultNow(),
  grantedBy: varchar("granted_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moduleUsageTracking = pgTable("module_usage_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id").notNull().references(() => moduleDefinitions.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // create_task, send_notification, run_query, etc
  resource: varchar("resource"), // task_template, query, etc
  resourceId: varchar("resource_id"),
  usage: integer("usage").default(1), // quantidade usada
  metadata: jsonb("metadata").default({}), // dados adicionais da ação
  createdAt: timestamp("created_at").defaultNow(),
});

// TASK MANAGEMENT SYSTEM - CORE DA APLICAÇÃO
export const taskTemplates = pgTable("task_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  managerId: varchar("manager_id").references(() => users.id), // Quem criou o template
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").default("general"), // 'client_follow_up', 'reporting', 'general'
  priority: varchar("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  estimatedDuration: integer("estimated_duration"), // em minutos
  instructions: jsonb("instructions").notNull(), // Array de passos/instruções
  checklistItems: jsonb("checklist_items"), // Array de itens de checklist
  requiredFields: jsonb("required_fields"), // Campos que devem ser preenchidos
  schedule: jsonb("schedule"), // Configuração de agendamento (diário, semanal, mensal)
  assignedTo: jsonb("assigned_to"), // Array de IDs de usuários ou departamentos
  tags: jsonb("tags"), // Array de tags
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskInstances = pgTable("task_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  templateId: varchar("template_id").references(() => taskTemplates.id),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  assignedById: varchar("assigned_by_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
  dueDate: timestamp("due_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completionData: jsonb("completion_data"), // Dados preenchidos pelo funcionário
  checklistProgress: jsonb("checklist_progress"), // Progresso do checklist
  notes: text("notes"),
  attachments: jsonb("attachments"), // Array de anexos
  remindersSent: integer("reminders_sent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskComments = pgTable("task_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  taskInstanceId: varchar("task_instance_id").references(() => taskInstances.id),
  userId: varchar("user_id").references(() => users.id),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").default(false), // Se é apenas para o gerente ver
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // 'task_assigned', 'task_reminder', 'task_overdue', 'task_completed'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Dados relacionados à notificação
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url"), // URL para onde a notificação deve levar
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// ADVANCED TASK MANAGEMENT SYSTEM - FASE 3
// ==========================================

// Task Automation Rules - Sistema de automação baseado em eventos
export const taskAutomationRules = pgTable("task_automation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Trigger configuration
  triggerType: varchar("trigger_type", { length: 50 }).notNull(), // 'time_based', 'event_based', 'condition_based'
  triggerConfig: jsonb("trigger_config").notNull(), // Configuração específica do trigger
  
  // Conditions
  conditions: jsonb("conditions"), // Array de condições que devem ser atendidas
  
  // Actions
  actions: jsonb("actions").notNull(), // Array de ações a serem executadas
  
  // Execution tracking
  lastTriggeredAt: timestamp("last_triggered_at"),
  totalExecutions: integer("total_executions").default(0),
  successfulExecutions: integer("successful_executions").default(0),
  failedExecutions: integer("failed_executions").default(0),
  
  // Metadata
  metadata: jsonb("metadata"), // Dados adicionais de configuração
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Automation Logs - Log de execuções de automação
export const taskAutomationLogs = pgTable("task_automation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  ruleId: varchar("rule_id").references(() => taskAutomationRules.id).notNull(),
  
  // Execution details
  executionId: varchar("execution_id").notNull(), // UUID único para esta execução
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'partial'
  
  // Trigger details
  triggerData: jsonb("trigger_data"), // Dados que causaram o trigger
  triggerTimestamp: timestamp("trigger_timestamp").notNull(),
  
  // Execution results
  actionsExecuted: jsonb("actions_executed"), // Array de ações executadas
  actionResults: jsonb("action_results"), // Resultados de cada ação
  
  // Error handling
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"),
  
  // Performance
  executionTimeMs: integer("execution_time_ms"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Task Time Tracking - Tracking avançado de tempo gasto
export const taskTimeTracking = pgTable("task_time_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  taskInstanceId: varchar("task_instance_id").references(() => taskInstances.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Time tracking
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationMs: integer("duration_ms"), // Calculado automaticamente
  isActive: boolean("is_active").default(false), // Se está trackando agora
  
  // Activity details
  activityType: varchar("activity_type", { length: 50 }), // 'work', 'pause', 'meeting', 'research'
  description: text("description"),
  
  // Productivity metrics
  productivityScore: integer("productivity_score"), // 1-10 (auto ou manual)
  focusLevel: integer("focus_level"), // 1-10 (baseado em interruções)
  interruptions: integer("interruptions").default(0),
  
  // Location/device info
  deviceInfo: jsonb("device_info"), // Info do dispositivo usado
  locationInfo: jsonb("location_info"), // Info de localização (se permitido)
  
  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Productivity Metrics - Métricas agregadas de produtividade
export const taskProductivityMetrics = pgTable("task_productivity_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Time period
  periodType: varchar("period_type", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Task metrics
  tasksCompleted: integer("tasks_completed").default(0),
  tasksStarted: integer("tasks_started").default(0),
  tasksOverdue: integer("tasks_overdue").default(0),
  averageCompletionTime: integer("average_completion_time"), // em minutos
  
  // Time metrics
  totalTimeWorked: integer("total_time_worked").default(0), // em minutos
  focusTime: integer("focus_time").default(0), // tempo focado sem interruções
  breakTime: integer("break_time").default(0), // tempo de pausas
  
  // Productivity scores
  overallProductivityScore: decimal("overall_productivity_score", { precision: 3, scale: 1 }),
  averageFocusLevel: decimal("average_focus_level", { precision: 3, scale: 1 }),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // percentual
  
  // Quality metrics
  reworkRequests: integer("rework_requests").default(0),
  qualityScore: decimal("quality_score", { precision: 3, scale: 1 }),
  
  // Collaboration metrics
  collaborationScore: decimal("collaboration_score", { precision: 3, scale: 1 }),
  commentsGiven: integer("comments_given").default(0),
  commentsReceived: integer("comments_received").default(0),
  
  // Metadata
  calculatedAt: timestamp("calculated_at").defaultNow(),
  metadata: jsonb("metadata"),
});

// Task Collaboration - Sistema avançado de colaboração
export const taskCollaborations = pgTable("task_collaborations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  taskInstanceId: varchar("task_instance_id").references(() => taskInstances.id).notNull(),
  
  // Collaboration type
  collaborationType: varchar("collaboration_type", { length: 50 }).notNull(), // 'assignment', 'review', 'approval', 'consultation'
  
  // Participants
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  collaboratorId: varchar("collaborator_id").references(() => users.id).notNull(),
  
  // Status and workflow
  status: varchar("status", { length: 20 }).default('pending'), // 'pending', 'accepted', 'rejected', 'completed'
  priority: varchar("priority", { length: 20 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
  
  // Timing
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  
  // Content
  requestMessage: text("request_message"),
  responseMessage: text("response_message"),
  completionNotes: text("completion_notes"),
  
  // Deliverables
  requiredDeliverables: jsonb("required_deliverables"), // Array de entregáveis esperados
  actualDeliverables: jsonb("actual_deliverables"), // Array de entregáveis fornecidos
  
  // Quality assessment
  qualityRating: integer("quality_rating"), // 1-5 stars
  feedbackComments: text("feedback_comments"),
  
  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Template Categories - Categorias avançadas de templates
export const taskTemplateCategories = pgTable("task_template_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  parentCategoryId: varchar("parent_category_id").references(() => taskTemplateCategories.id), // Para hierarquia
  
  // Visual
  color: varchar("color", { length: 7 }).default('#3B82F6'), // Hex color
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  
  // Configuration
  defaultPriority: varchar("default_priority", { length: 20 }).default('medium'),
  defaultDuration: integer("default_duration"), // minutos
  requiredFields: jsonb("required_fields"), // Campos obrigatórios para esta categoria
  
  // Ordering and display
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Skills and Competencies - Sistema de habilidades
export const taskSkills = pgTable("task_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // 'technical', 'soft', 'domain_specific'
  
  // Skill level system
  levels: jsonb("levels").notNull(), // Array de níveis (beginner, intermediate, expert)
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Task Skills - Habilidades dos usuários
export const userTaskSkills = pgTable("user_task_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  skillId: varchar("skill_id").references(() => taskSkills.id).notNull(),
  
  // Skill assessment
  currentLevel: varchar("current_level", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'expert'
  certifiedLevel: varchar("certified_level", { length: 20 }), // Nível certificado/validado
  
  // Progress tracking
  experiencePoints: integer("experience_points").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 1 }),
  
  // Validation
  validatedBy: varchar("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  validationNotes: text("validation_notes"),
  
  // Metadata
  lastUsedAt: timestamp("last_used_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Dependencies - Sistema de dependências entre tarefas
export const taskDependencies = pgTable("task_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Task relationship
  dependentTaskId: varchar("dependent_task_id").references(() => taskInstances.id).notNull(), // Tarefa que depende
  dependsOnTaskId: varchar("depends_on_task_id").references(() => taskInstances.id).notNull(), // Tarefa da qual depende
  
  // Dependency type
  dependencyType: varchar("dependency_type", { length: 30 }).notNull(), // 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
  
  // Timing
  lagTime: integer("lag_time").default(0), // Tempo de espera em minutos
  leadTime: integer("lead_time").default(0), // Tempo de antecipação em minutos
  
  // Status
  isActive: boolean("is_active").default(true),
  resolvedAt: timestamp("resolved_at"), // Quando a dependência foi resolvida
  
  // Metadata
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// External Database Connections - Conectividade universal
export const externalDatabaseConnections = pgTable("external_database_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Connection details
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'postgresql', 'mysql', 'sqlserver', 'rest_api', 'webhook'
  description: text("description"),
  
  // Configuration (encrypted)
  config: jsonb("config").notNull(), // { host, port, database, username, password, ssl, apiUrl, apiKey, etc }
  
  // Status and testing
  isActive: boolean("is_active").default(true),
  lastTestedAt: timestamp("last_tested_at"),
  testResult: jsonb("test_result"), // Resultado do último teste
  
  // Usage statistics
  totalQueries: integer("total_queries").default(0),
  lastUsedAt: timestamp("last_used_at"),
  
  // Metadata
  tags: jsonb("tags").default([]), // Tags para organização
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Database Query Cache - Cache para queries executadas
export const databaseQueryCache = pgTable("database_query_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Cache identification
  cacheKey: varchar("cache_key", { length: 255 }).notNull(),
  connectionId: varchar("connection_id").references(() => externalDatabaseConnections.id),
  
  // Cached data
  result: jsonb("result").notNull(), // Resultado da query
  queryHash: varchar("query_hash", { length: 64 }), // Hash da query original
  
  // Cache management
  expiresAt: timestamp("expires_at").notNull(),
  hitCount: integer("hit_count").default(0),
  lastHitAt: timestamp("last_hit_at"),
  
  // Metadata
  resultSize: integer("result_size"), // Tamanho do resultado em bytes
  executionTime: integer("execution_time"), // Tempo de execução original em ms
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique().on(table.tenantId, table.cacheKey),
}));

// File Uploads - Sistema de upload e processamento de arquivos
export const fileUploads = pgTable("file_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // File details
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(), // Nome único no storage
  filePath: varchar("file_path", { length: 500 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // Em bytes
  
  // Processing status
  status: varchar("status", { length: 30 }).default('uploaded'), // 'uploaded', 'processing', 'processed', 'error'
  processingResult: jsonb("processing_result"), // Resultado do processamento (schema, rows, etc)
  errorMessage: text("error_message"),
  
  // Data preview
  previewData: jsonb("preview_data"), // Primeiras linhas para preview
  columnMapping: jsonb("column_mapping"), // Mapeamento de colunas
  totalRows: integer("total_rows"),
  validRows: integer("valid_rows"),
  
  // Usage
  isActive: boolean("is_active").default(true),
  downloadCount: integer("download_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  
  // Metadata
  tags: jsonb("tags").default([]),
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Dashboards - Dashboards personalizáveis
export const customDashboards = pgTable("custom_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Dashboard details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull(),
  
  // Layout and configuration
  layout: jsonb("layout").notNull(), // Grid layout config
  widgets: jsonb("widgets").notNull(), // Array de widgets configurados
  filters: jsonb("filters").default([]), // Filtros globais do dashboard
  
  // Access control
  isPublic: boolean("is_public").default(false),
  allowedUsers: jsonb("allowed_users").default([]), // Array de user IDs
  allowedRoles: jsonb("allowed_roles").default([]), // Array de roles
  
  // Status
  isActive: boolean("is_active").default(true),
  isTemplate: boolean("is_template").default(false), // Se é um template reutilizável
  
  // Usage statistics
  viewCount: integer("view_count").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  
  // Metadata
  tags: jsonb("tags").default([]),
  category: varchar("category", { length: 100 }),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueSlug: unique().on(table.tenantId, table.slug),
}));

// Dashboard Widgets - Widgets individuais para dashboards
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  dashboardId: varchar("dashboard_id").references(() => customDashboards.id).notNull(),
  
  // Widget configuration
  widgetType: varchar("widget_type", { length: 50 }).notNull(), // 'chart', 'table', 'metric', 'text', 'image'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Position and size
  position: jsonb("position").notNull(), // { x, y, w, h }
  
  // Data source
  dataSource: jsonb("data_source"), // Connection ID, query, etc
  dataQuery: text("data_query"), // SQL ou endpoint
  dataParameters: jsonb("data_parameters").default({}),
  
  // Visualization config
  chartConfig: jsonb("chart_config"), // Configurações específicas do tipo de chart
  tableConfig: jsonb("table_config"), // Configurações de tabla
  styleConfig: jsonb("style_config"), // Cores, fontes, etc
  
  // Refresh and caching
  refreshInterval: integer("refresh_interval").default(300), // Segundos
  cacheKey: varchar("cache_key", { length: 255 }),
  lastRefreshAt: timestamp("last_refresh_at"),
  
  // Status
  isActive: boolean("is_active").default(true),
  hasError: boolean("has_error").default(false),
  errorMessage: text("error_message"),
  
  // Metadata
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Webhooks - Sistema de webhooks para integração
export const apiWebhooks = pgTable("api_webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Webhook details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }).notNull(),
  
  // Configuration
  method: varchar("method", { length: 10 }).default('POST'), // GET, POST, PUT, DELETE
  headers: jsonb("headers").default({}),
  authentication: jsonb("authentication"), // API key, Bearer token, etc
  
  // Events and triggers
  events: jsonb("events").notNull(), // Array de eventos que disparam o webhook
  triggers: jsonb("triggers").default([]), // Condições específicas
  
  // Request configuration
  timeout: integer("timeout").default(30), // Segundos
  retryAttempts: integer("retry_attempts").default(3),
  retryDelay: integer("retry_delay").default(5), // Segundos
  
  // Status and monitoring
  isActive: boolean("is_active").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  totalCalls: integer("total_calls").default(0),
  successfulCalls: integer("successful_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  
  // Metadata
  tags: jsonb("tags").default([]),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook Logs - Logs de execução de webhooks
export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  webhookId: varchar("webhook_id").references(() => apiWebhooks.id).notNull(),
  
  // Execution details
  executionId: varchar("execution_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'timeout', 'retry'
  
  // Request/Response
  requestPayload: jsonb("request_payload"),
  requestHeaders: jsonb("request_headers"),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  responseHeaders: jsonb("response_headers"),
  
  // Timing
  executionTime: integer("execution_time"), // Milliseconds
  triggeredAt: timestamp("triggered_at").notNull(),
  completedAt: timestamp("completed_at"),
  
  // Error handling
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"),
  retryAttempt: integer("retry_attempt").default(0),
  
  // Metadata
  eventType: varchar("event_type", { length: 100 }),
  triggerSource: varchar("trigger_source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertExternalDatabaseConnectionSchema = createInsertSchema(externalDatabaseConnections);
export const insertDatabaseQueryCacheSchema = createInsertSchema(databaseQueryCache);
export const insertFileUploadSchema = createInsertSchema(fileUploads);
export const insertCustomDashboardSchema = createInsertSchema(customDashboards);
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets);
export const insertApiWebhookSchema = createInsertSchema(apiWebhooks);
export const insertWebhookLogSchema = createInsertSchema(webhookLogs);

// Update existing relations to include new tables
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  departments: many(departments),
  permissions: many(permissions),
  rolePermissions: many(rolePermissions),
  clientCategories: many(clientCategories),
  clients: many(clients),
  integrations: many(integrations),
  workflows: many(workflows),
  workflowExecutions: many(workflowExecutions),
  reports: many(reports),
  activities: many(activities),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  userDepartments: many(userDepartments),
  userPermissions: many(userPermissions),
  activities: many(activities),
}));

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertClientCategorySchema = createInsertSchema(clientCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastStatus: true,
  lastChecked: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  executionCount: true,
  lastExecuted: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new access control tables
export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDepartmentSchema = createInsertSchema(userDepartments).omit({
  id: true,
  createdAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

// Task Management Insert Schemas
export const insertTaskTemplateSchema = createInsertSchema(taskTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskInstanceSchema = createInsertSchema(taskInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// INSERT SCHEMAS FOR ADVANCED TASK MANAGEMENT
export const insertTaskAutomationRuleSchema = createInsertSchema(taskAutomationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskAutomationLogSchema = createInsertSchema(taskAutomationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertTaskTimeTrackingSchema = createInsertSchema(taskTimeTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskProductivityMetricsSchema = createInsertSchema(taskProductivityMetrics).omit({
  id: true,
  calculatedAt: true,
});

export const insertTaskCollaborationSchema = createInsertSchema(taskCollaborations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskTemplateCategorySchema = createInsertSchema(taskTemplateCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSkillSchema = createInsertSchema(taskSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTaskSkillSchema = createInsertSchema(userTaskSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskDependencySchema = createInsertSchema(taskDependencies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertSavedQuerySchema = createInsertSchema(savedQueries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastExecutedAt: true,
  executionCount: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
// TABELAS PARA SISTEMA COMPLETO TOIT NEXUS

// Database Connections - Qualquer banco de dados
export const databaseConnections = pgTable("database_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: databaseTypeEnum("type").notNull(), // postgresql, mysql, mssql, oracle
  host: varchar("host", { length: 255 }).notNull(),
  port: integer("port").notNull(),
  database: varchar("database", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(), // Encrypted
  ssl: boolean("ssl").default(false),
  connectionString: text("connection_string"), // Alternative to individual fields
  isActive: boolean("is_active").default(true),
  lastTestedAt: timestamp("last_tested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Connections - Qualquer API externa
export const apiConnections = pgTable("api_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  baseUrl: varchar("base_url", { length: 500 }).notNull(),
  authType: varchar("auth_type", { length: 50 }).notNull(), // bearer, apikey, basic, oauth
  authConfig: jsonb("auth_config").notNull(), // Headers, tokens, etc
  headers: jsonb("headers"), // Default headers
  timeout: integer("timeout").default(30000),
  isActive: boolean("is_active").default(true),
  lastTestedAt: timestamp("last_tested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Query Builder - Queries visuais no-code
export const queryBuilders = pgTable("query_builders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  connectionId: varchar("connection_id"), // database or api connection
  connectionType: varchar("connection_type", { length: 20 }).notNull(), // 'database' or 'api'
  queryConfig: jsonb("query_config").notNull(), // Visual query configuration
  sqlGenerated: text("sql_generated"), // For database queries
  apiEndpoint: varchar("api_endpoint", { length: 500 }), // For API queries
  lastExecutedAt: timestamp("last_executed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KPI Dashboards - KPIs e métricas
export const kpiDashboards = pgTable("kpi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  queryBuilderId: varchar("query_builder_id").references(() => queryBuilders.id),
  chartType: chartTypeEnum("chart_type").notNull(),
  chartConfig: jsonb("chart_config").notNull(), // Chart.js configuration
  refreshInterval: integer("refresh_interval").default(300), // seconds
  isActive: boolean("is_active").default(true),
  position: jsonb("position"), // Dashboard layout position
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Uploaded Files - Gestão de arquivos Excel/CSV
export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(), // Nome único no servidor
  filePath: varchar("file_path", { length: 500 }).notNull(), // Caminho completo no servidor
  fileSize: integer("file_size").notNull(), // Tamanho em bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  headers: text("headers"), // JSON string com headers das colunas
  rowCount: integer("row_count").default(0), // Número de linhas processadas
  processingTime: integer("processing_time").default(0), // Tempo de processamento em ms
  status: varchar("status", { length: 20 }).default('processing'), // processing, processed, error
  metadata: jsonb("metadata"), // Metadados adicionais do processamento
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook Logs - Logs de webhooks (removendo duplicação)
// Já definido na linha 1149

// Complete Workflows - Workflows avançados
export const completeWorkflows = pgTable("complete_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(), // Array of workflow steps
  triggers: jsonb("triggers").notNull(), // Trigger configurations
  status: workflowStatusEnum("status").default('draft'),
  executionCount: integer("execution_count").default(0),
  lastExecutedAt: timestamp("last_executed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Complete Workflow Executions - Histórico de execuções
export const completeWorkflowExecutions = pgTable("complete_workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => completeWorkflows.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // running, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  executionLog: jsonb("execution_log"), // Detailed execution steps
  errorMessage: text("error_message"),
  triggeredBy: varchar("triggered_by", { length: 255 }), // user_id, webhook, schedule
});

// ==================== PAYMENT SYSTEM TABLES ====================

// Payment Plans - Planos de pagamento disponíveis
export const paymentPlanEnum = pgEnum('payment_plan_type', ['individual', 'business', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'canceled', 'incomplete', 'trialing']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'succeeded', 'failed', 'canceled']);

export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  type: paymentPlanEnum("type").notNull(),
  description: text("description"),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly"),
  stripePriceIdYearly: varchar("stripe_price_id_yearly"),
  features: jsonb("features").notNull(), // Array of features
  maxUsers: integer("max_users"),
  maxModules: integer("max_modules"),
  trialDays: integer("trial_days").default(7),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions - Assinaturas ativas
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  planId: varchar("plan_id").references(() => paymentPlans.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  stripeCustomerId: varchar("stripe_customer_id").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  billingCycle: varchar("billing_cycle", { length: 20 }).notNull(), // monthly, yearly
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  metadata: jsonb("metadata"), // Additional subscription data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Transactions - Histórico de transações
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  stripeInvoiceId: varchar("stripe_invoice_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('BRL'),
  status: paymentStatusEnum("status").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // card, boleto, pix
  failureReason: text("failure_reason"),
  receiptUrl: varchar("receipt_url"),
  metadata: jsonb("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Methods - Métodos de pagamento salvos
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  stripePaymentMethodId: varchar("stripe_payment_method_id").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // card, bank_account
  cardBrand: varchar("card_brand", { length: 20 }), // visa, mastercard, etc
  cardLast4: varchar("card_last4", { length: 4 }),
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice History - Histórico de faturas
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  stripeInvoiceId: varchar("stripe_invoice_id").unique(),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull(), // draft, open, paid, void
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default('BRL'),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  hostedInvoiceUrl: varchar("hosted_invoice_url"),
  invoicePdf: varchar("invoice_pdf"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhook Events - Log de eventos Stripe
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeEventId: varchar("stripe_event_id").notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  apiVersion: varchar("api_version", { length: 20 }),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  data: jsonb("data").notNull(),
  receivedAt: timestamp("received_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Business Leads - Formulário empresarial (não pagantes)
export const businessLeads = pgTable("business_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  employeeCount: integer("employee_count"),
  sector: varchar("sector", { length: 100 }),
  message: text("message"),
  status: varchar("status", { length: 20 }).default('new'), // new, contacted, qualified, converted
  contactedAt: timestamp("contacted_at"),
  notes: text("notes"), // Internal notes
  assignedTo: varchar("assigned_to").references(() => users.id), // TOIT team member
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification Tokens - Tokens para validação de email e telefone
export const verificationTokens = pgTable("verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  emailToken: varchar("email_token", { length: 64 }).unique(), // Token para verificação de email
  phoneToken: varchar("phone_token", { length: 6 }), // Código 6 dígitos para SMS
  phone: varchar("phone", { length: 20 }), // Telefone associado ao token
  tokenType: varchar("token_type", { length: 20 }).notNull(), // 'email', 'phone'
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"), // NULL = não usado ainda
  createdAt: timestamp("created_at").defaultNow(),
});

// Verification Codes - Sistema avançado de códigos de verificação Email/SMS
export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'email' or 'phone'
  code: varchar("code", { length: 6 }).notNull(), // Código de 6 dígitos
  contact: varchar("contact", { length: 100 }).notNull(), // Email ou telefone
  expires_at: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0), // Número de tentativas de verificação
  verified: boolean("verified").default(false), // Se foi verificado com sucesso
  created_at: timestamp("created_at").defaultNow(),
});

// Calendar Integrations - Integrações com calendários externos (Google, Apple, Outlook)
export const calendarIntegrations = pgTable("calendar_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 20 }).notNull(), // 'google', 'apple', 'outlook'
  accessToken: text("access_token").notNull(), // Token de acesso OAuth
  refreshToken: text("refresh_token"), // Token para renovar acesso
  tokenExpiresAt: timestamp("token_expires_at"), // Quando o token expira
  calendarId: varchar("calendar_id", { length: 255 }).notNull(), // ID do calendário no provedor
  calendarName: varchar("calendar_name", { length: 255 }).notNull(), // Nome do calendário
  isActive: boolean("is_active").default(true), // Se a integração está ativa
  lastSyncAt: timestamp("last_sync_at"), // Última sincronização
  syncErrors: integer("sync_errors").default(0), // Número de erros na sincronização
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Events - Eventos importados dos calendários externos
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  integrationId: varchar("integration_id").references(() => calendarIntegrations.id).notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(), // ID do evento no provedor externo
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  attendees: jsonb("attendees"), // Array de emails dos participantes
  location: varchar("location", { length: 500 }),
  reminders: jsonb("reminders"), // Array de lembretes
  recurrence: text("recurrence"), // Regras de recorrência
  status: varchar("status", { length: 20 }).default('confirmed'), // 'confirmed', 'tentative', 'cancelled'
  lastSyncAt: timestamp("last_sync_at").defaultNow(), // Última sincronização deste evento
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RELATIONS
export const databaseConnectionsRelations = relations(databaseConnections, ({ one }) => ({
  tenant: one(tenants, { fields: [databaseConnections.tenantId], references: [tenants.id] }),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  tenant: one(tenants, { fields: [apiConnections.tenantId], references: [tenants.id] }),
}));

export const queryBuildersRelations = relations(queryBuilders, ({ one, many }) => ({
  tenant: one(tenants, { fields: [queryBuilders.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [queryBuilders.userId], references: [users.id] }),
  kpiDashboards: many(kpiDashboards),
}));

export const kpiDashboardsRelations = relations(kpiDashboards, ({ one }) => ({
  tenant: one(tenants, { fields: [kpiDashboards.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [kpiDashboards.userId], references: [users.id] }),
  queryBuilder: one(queryBuilders, { fields: [kpiDashboards.queryBuilderId], references: [queryBuilders.id] }),
}));

export const uploadedFilesRelations = relations(uploadedFiles, ({ one }) => ({
  tenant: one(tenants, { fields: [uploadedFiles.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [uploadedFiles.userId], references: [users.id] }),
}));

export const completeWorkflowsRelations = relations(completeWorkflows, ({ one, many }) => ({
  tenant: one(tenants, { fields: [completeWorkflows.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [completeWorkflows.userId], references: [users.id] }),
  executions: many(completeWorkflowExecutions),
}));

export const completeWorkflowExecutionsRelations = relations(completeWorkflowExecutions, ({ one }) => ({
  workflow: one(completeWorkflows, { fields: [completeWorkflowExecutions.workflowId], references: [completeWorkflows.id] }),
  tenant: one(tenants, { fields: [completeWorkflowExecutions.tenantId], references: [tenants.id] }),
}));

// Payment System Relations
export const paymentPlansRelations = relations(paymentPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  tenant: one(tenants, { fields: [subscriptions.tenantId], references: [tenants.id] }),
  plan: one(paymentPlans, { fields: [subscriptions.planId], references: [paymentPlans.id] }),
  transactions: many(paymentTransactions),
  invoices: many(invoices),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  tenant: one(tenants, { fields: [paymentTransactions.tenantId], references: [tenants.id] }),
  subscription: one(subscriptions, { fields: [paymentTransactions.subscriptionId], references: [subscriptions.id] }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  tenant: one(tenants, { fields: [paymentMethods.tenantId], references: [tenants.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  tenant: one(tenants, { fields: [invoices.tenantId], references: [tenants.id] }),
  subscription: one(subscriptions, { fields: [invoices.subscriptionId], references: [subscriptions.id] }),
}));

export const businessLeadsRelations = relations(businessLeads, ({ one }) => ({
  assignedUser: one(users, { fields: [businessLeads.assignedTo], references: [users.id] }),
}));

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, { fields: [verificationTokens.userId], references: [users.id] }),
}));

export const verificationCodesRelations = relations(verificationCodes, ({ one }) => ({
  user: one(users, { fields: [verificationCodes.user_id], references: [users.id] }),
}));

// TYPE EXPORTS
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type UpsertDatabaseConnection = typeof databaseConnections.$inferInsert;
export type ApiConnection = typeof apiConnections.$inferSelect;
export type UpsertApiConnection = typeof apiConnections.$inferInsert;
export type QueryBuilder = typeof queryBuilders.$inferSelect;
export type UpsertQueryBuilder = typeof queryBuilders.$inferInsert;
export type KpiDashboard = typeof kpiDashboards.$inferSelect;
export type UpsertKpiDashboard = typeof kpiDashboards.$inferInsert;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type UpsertUploadedFile = typeof uploadedFiles.$inferInsert;
export type CompleteWorkflow = typeof completeWorkflows.$inferSelect;
export type UpsertCompleteWorkflow = typeof completeWorkflows.$inferInsert;
export type CompleteWorkflowExecution = typeof completeWorkflowExecutions.$inferSelect;
export type UpsertCompleteWorkflowExecution = typeof completeWorkflowExecutions.$inferInsert;
export type InsertUser = typeof users.$inferInsert;
export type ClientCategory = typeof clientCategories.$inferSelect;
export type InsertClientCategory = typeof clientCategories.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;
export type UserDepartment = typeof userDepartments.$inferSelect;
export type InsertUserDepartment = typeof userDepartments.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = typeof userPermissions.$inferInsert;
export type SavedQuery = typeof savedQueries.$inferSelect;
export type InsertSavedQuery = typeof savedQueries.$inferInsert;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = typeof dashboards.$inferInsert;

// Task Management Types
export type TaskTemplate = typeof taskTemplates.$inferSelect;
export type InsertTaskTemplate = typeof taskTemplates.$inferInsert;
export type TaskInstance = typeof taskInstances.$inferSelect;
export type InsertTaskInstance = typeof taskInstances.$inferInsert;
export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = typeof taskComments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ADVANCED TASK MANAGEMENT TYPES
export type TaskAutomationRule = typeof taskAutomationRules.$inferSelect;
export type InsertTaskAutomationRule = typeof taskAutomationRules.$inferInsert;
export type TaskAutomationLog = typeof taskAutomationLogs.$inferSelect;
export type InsertTaskAutomationLog = typeof taskAutomationLogs.$inferInsert;
export type TaskTimeTracking = typeof taskTimeTracking.$inferSelect;
export type InsertTaskTimeTracking = typeof taskTimeTracking.$inferInsert;
export type TaskProductivityMetrics = typeof taskProductivityMetrics.$inferSelect;
export type InsertTaskProductivityMetrics = typeof taskProductivityMetrics.$inferInsert;
export type TaskCollaboration = typeof taskCollaborations.$inferSelect;
export type InsertTaskCollaboration = typeof taskCollaborations.$inferInsert;
export type TaskTemplateCategory = typeof taskTemplateCategories.$inferSelect;
export type InsertTaskTemplateCategory = typeof taskTemplateCategories.$inferInsert;
export type TaskSkill = typeof taskSkills.$inferSelect;
export type InsertTaskSkill = typeof taskSkills.$inferInsert;
export type UserTaskSkill = typeof userTaskSkills.$inferSelect;
export type InsertUserTaskSkill = typeof userTaskSkills.$inferInsert;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = typeof taskDependencies.$inferInsert;

// Payment System Types
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = typeof paymentPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
export type BusinessLead = typeof businessLeads.$inferSelect;
export type InsertBusinessLead = typeof businessLeads.$inferInsert;

// Verification Token Types
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type InsertVerificationToken = typeof verificationTokens.$inferInsert;

// Verification Code Types
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = typeof verificationCodes.$inferInsert;

// Access Profile Types
export type AccessProfile = typeof accessProfiles.$inferSelect;
export type InsertAccessProfile = typeof accessProfiles.$inferInsert;
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;
export type InsertCalendarIntegration = typeof calendarIntegrations.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// ==========================================
// WORKFLOW ENGINE - VISUAL BUILDER TABLES
// ==========================================

// Node types for visual workflow builder
export const nodeTypeEnum = pgEnum('node_type', [
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

export const executionStatusEnum = pgEnum('execution_status', [
  'pending',
  'running', 
  'completed', 
  'failed', 
  'cancelled',
  'waiting_approval'
]);

// Visual workflow canvas definitions
export const visualWorkflows = pgTable("visual_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  version: integer("version").default(1),
  
  // Canvas and visual properties
  canvasData: jsonb("canvas_data").default({}), // Nodes positions, connections, zoom, etc
  nodes: jsonb("nodes").default([]), // Array of workflow nodes
  connections: jsonb("connections").default([]), // Array of node connections
  
  // Execution properties
  isActive: boolean("is_active").default(false),
  triggerConfig: jsonb("trigger_config").default({}), // Trigger configuration
  variables: jsonb("variables").default({}), // Workflow-level variables
  settings: jsonb("settings").default({}), // Execution settings
  
  // Statistics
  executionCount: integer("execution_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default('0'),
  lastExecuted: timestamp("last_executed"),
  avgExecutionTime: integer("avg_execution_time"), // in milliseconds
  
  // Metadata
  tags: jsonb("tags").default([]), // Array of tags for organization
  category: varchar("category", { length: 100 }),
  isTemplate: boolean("is_template").default(false),
  templateInfo: jsonb("template_info"), // If it's a template
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual workflow nodes with visual properties
export const workflowNodes = pgTable("workflow_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id, { onDelete: "cascade" }).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Node identification
  nodeKey: varchar("node_key", { length: 50 }).notNull(), // Unique within workflow
  nodeType: nodeTypeEnum("node_type").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  
  // Visual properties
  position: jsonb("position").notNull(), // { x: number, y: number }
  size: jsonb("size").default({ width: 200, height: 100 }), // { width: number, height: number }
  style: jsonb("style").default({}), // Visual styling properties
  
  // Configuration
  config: jsonb("config").notNull(), // Node-specific configuration
  inputSchema: jsonb("input_schema").default({}), // Expected input structure
  outputSchema: jsonb("output_schema").default({}), // Output structure
  
  // Execution properties
  isEnabled: boolean("is_enabled").default(true),
  timeout: integer("timeout").default(30000), // Timeout in milliseconds
  retryCount: integer("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Node connections/edges
export const workflowConnections = pgTable("workflow_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id, { onDelete: "cascade" }).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Connection endpoints
  sourceNodeId: varchar("source_node_id").references(() => workflowNodes.id, { onDelete: "cascade" }).notNull(),
  targetNodeId: varchar("target_node_id").references(() => workflowNodes.id, { onDelete: "cascade" }).notNull(),
  sourceHandle: varchar("source_handle", { length: 50 }), // Output handle identifier
  targetHandle: varchar("target_handle", { length: 50 }), // Input handle identifier
  
  // Connection properties
  label: varchar("label", { length: 100 }),
  style: jsonb("style").default({}), // Visual styling
  
  // Conditional connections
  condition: jsonb("condition"), // Condition for this connection to be taken
  priority: integer("priority").default(0), // For multiple connections from same node
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Workflow execution logs with detailed tracking
export const visualWorkflowExecutions = pgTable("visual_workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  
  // Execution tracking
  executionId: varchar("execution_id").notNull().unique(), // Unique execution identifier
  status: executionStatusEnum("status").default('pending'),
  triggerType: triggerTypeEnum("trigger_type").notNull(),
  triggerData: jsonb("trigger_data"), // Data that triggered the execution
  
  // Execution context
  context: jsonb("context").default({}), // Execution context and variables
  input: jsonb("input"), // Input data for execution
  output: jsonb("output"), // Final output
  
  // Timing
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // Duration in milliseconds
  
  // Error handling
  error: text("error"),
  errorNode: varchar("error_node"), // Node that caused the error
  stackTrace: text("stack_trace"),
  
  // Statistics
  nodesExecuted: integer("nodes_executed").default(0),
  totalNodes: integer("total_nodes").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Node execution logs for detailed tracking
export const nodeExecutions = pgTable("node_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executionId: varchar("execution_id").references(() => visualWorkflowExecutions.executionId, { onDelete: "cascade" }).notNull(),
  nodeId: varchar("node_id").references(() => workflowNodes.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Execution details
  status: executionStatusEnum("status").default('pending'),
  input: jsonb("input"), // Input data for this node
  output: jsonb("output"), // Output data from this node
  
  // Timing
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // Duration in milliseconds
  
  // Error handling
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Workflow triggers configuration
export const workflowTriggers = pgTable("workflow_triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id, { onDelete: "cascade" }).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Trigger configuration
  triggerType: triggerTypeEnum("trigger_type").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  
  // Configuration based on trigger type
  config: jsonb("config").notNull(), // Trigger-specific configuration
  conditions: jsonb("conditions").default([]), // Array of conditions
  
  // Schedule specific (for schedule triggers)
  cronExpression: varchar("cron_expression"), // Cron expression for scheduling
  timezone: varchar("timezone").default('UTC'),
  
  // Webhook specific
  webhookUrl: varchar("webhook_url"), // Generated webhook URL
  webhookSecret: varchar("webhook_secret"), // Secret for webhook validation
  
  // Email specific
  emailFilters: jsonb("email_filters"), // Email filtering rules
  
  // Status
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  triggerCount: integer("trigger_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow templates for reusability
export const workflowTemplates = pgTable("workflow_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  
  // Template data
  templateData: jsonb("template_data").notNull(), // Complete workflow structure
  previewImage: varchar("preview_image"), // Preview image URL
  
  // Metadata
  tags: jsonb("tags").default([]),
  difficulty: varchar("difficulty", { length: 20 }).default('beginner'), // beginner, intermediate, advanced
  estimatedTime: integer("estimated_time"), // Setup time in minutes
  
  // Usage statistics
  useCount: integer("use_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  
  // Availability
  isPublic: boolean("is_public").default(false),
  isPremium: boolean("is_premium").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow variables for dynamic data handling
export const workflowVariables = pgTable("workflow_variables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id, { onDelete: "cascade" }).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Variable definition
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // string, number, boolean, object, array
  defaultValue: jsonb("default_value"),
  
  // Metadata
  description: text("description"),
  isRequired: boolean("is_required").default(false),
  isSecret: boolean("is_secret").default(false), // For sensitive data
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types for Visual Workflow Engine
export type VisualWorkflow = typeof visualWorkflows.$inferSelect;
export type InsertVisualWorkflow = typeof visualWorkflows.$inferInsert;
export type WorkflowNode = typeof workflowNodes.$inferSelect;
export type InsertWorkflowNode = typeof workflowNodes.$inferInsert;
export type WorkflowConnection = typeof workflowConnections.$inferSelect;
export type InsertWorkflowConnection = typeof workflowConnections.$inferInsert;
export type VisualWorkflowExecution = typeof visualWorkflowExecutions.$inferSelect;
export type InsertVisualWorkflowExecution = typeof visualWorkflowExecutions.$inferInsert;
export type NodeExecution = typeof nodeExecutions.$inferSelect;
export type InsertNodeExecution = typeof nodeExecutions.$inferInsert;
export type WorkflowTrigger = typeof workflowTriggers.$inferSelect;
export type InsertWorkflowTrigger = typeof workflowTriggers.$inferInsert;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowTemplate = typeof workflowTemplates.$inferInsert;
export type WorkflowVariable = typeof workflowVariables.$inferSelect;
export type InsertWorkflowVariable = typeof workflowVariables.$inferInsert;

// ==============================================
// EMAIL & CALENDAR WORKFLOW TRIGGERS - SISTEMA CRÍTICO
// ==============================================

// Email Accounts - Contas de email conectadas
export const emailAccounts = pgTable("email_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Account details
  email: varchar("email").notNull(),
  displayName: varchar("display_name"),
  provider: varchar("provider", { length: 50 }).notNull(), // 'gmail', 'outlook', 'yahoo', 'imap'
  
  // Authentication
  accessToken: text("access_token"), // OAuth token (encrypted)
  refreshToken: text("refresh_token"), // OAuth refresh token (encrypted)
  
  // IMAP/SMTP configuration for non-OAuth providers
  imapHost: varchar("imap_host"),
  imapPort: integer("imap_port"),
  smtpHost: varchar("smtp_host"),
  smtpPort: integer("smtp_port"),
  
  // Status
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  
  // Settings
  syncSettings: jsonb("sync_settings").default({
    syncFrequency: 5, // minutes
    maxEmailsPerSync: 100,
    syncFolders: ['INBOX'],
    enableRealTimeSync: true
  }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Accounts - Contas de calendário conectadas  
export const calendarAccounts = pgTable("calendar_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Account details
  email: varchar("email").notNull(),
  displayName: varchar("display_name"),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'outlook', 'apple', 'caldav'
  
  // Authentication
  accessToken: text("access_token"), // OAuth token (encrypted)
  refreshToken: text("refresh_token"), // OAuth refresh token (encrypted)
  
  // CalDAV configuration
  caldavUrl: varchar("caldav_url"),
  caldavUsername: varchar("caldav_username"),
  caldavPassword: text("caldav_password"), // encrypted
  
  // Status
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  
  // Settings
  syncSettings: jsonb("sync_settings").default({
    syncFrequency: 15, // minutes
    maxEventsPerSync: 200,
    syncCalendars: ['primary'],
    enableRealTimeSync: true,
    reminderMinutes: [15, 60, 1440] // 15min, 1h, 1day
  }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Triggers - Triggers baseados em emails
export const emailTriggers = pgTable("email_triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id, { onDelete: "cascade" }).notNull(),
  emailAccountId: varchar("email_account_id").references(() => emailAccounts.id).notNull(),
  
  // Trigger configuration
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  triggerType: emailTriggerTypeEnum("trigger_type").notNull(),
  
  // Email matching rules
  senderRules: jsonb("sender_rules").default([]), // Array de regras de remetente
  subjectRules: jsonb("subject_rules").default([]), // Array de regras de assunto
  bodyRules: jsonb("body_rules").default([]), // Array de regras de corpo
  attachmentRules: jsonb("attachment_rules").default([]), // Array de regras de anexos
  
  // Advanced filtering
  folders: jsonb("folders").default(['INBOX']), // Pastas para monitorar
  isRead: boolean("is_read"), // null = any, true = read only, false = unread only
  hasAttachments: boolean("has_attachments"), // null = any, true = with, false = without
  priority: varchar("priority", { length: 20 }), // 'high', 'normal', 'low', null = any
  
  // Data extraction rules
  dataExtractionRules: jsonb("data_extraction_rules").default({}), // Como extrair dados do email
  
  // Status and statistics
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  triggerCount: integer("trigger_count").default(0),
  lastProcessedEmailId: varchar("last_processed_email_id"), // Para evitar reprocessamento
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Triggers - Triggers baseados em eventos de calendário
export const calendarTriggers = pgTable("calendar_triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id, { onDelete: "cascade" }).notNull(),
  calendarAccountId: varchar("calendar_account_id").references(() => calendarAccounts.id).notNull(),
  
  // Trigger configuration
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  triggerType: calendarTriggerTypeEnum("trigger_type").notNull(),
  
  // Event matching rules
  titleRules: jsonb("title_rules").default([]), // Array de regras de título
  descriptionRules: jsonb("description_rules").default([]), // Array de regras de descrição
  attendeeRules: jsonb("attendee_rules").default([]), // Array de regras de participantes
  locationRules: jsonb("location_rules").default([]), // Array de regras de localização
  
  // Calendar filtering
  calendars: jsonb("calendars").default(['primary']), // Calendários para monitorar
  eventTypes: jsonb("event_types").default([]), // Tipos de evento para filtrar
  
  // Time-based triggers
  minutesBeforeStart: integer("minutes_before_start"), // Para event_starts_soon
  minutesAfterEnd: integer("minutes_after_end"), // Para event_ends
  reminderOffsets: jsonb("reminder_offsets").default([15, 60]), // Minutos antes para lembretes
  
  // Recurrence handling
  handleRecurring: boolean("handle_recurring").default(true),
  maxRecurrenceInstances: integer("max_recurrence_instances").default(10),
  
  // Data extraction rules
  dataExtractionRules: jsonb("data_extraction_rules").default({}), // Como extrair dados do evento
  
  // Status and statistics
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  triggerCount: integer("trigger_count").default(0),
  lastProcessedEventId: varchar("last_processed_event_id"), // Para evitar reprocessamento
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Processing Queue - Fila de processamento de emails
export const emailProcessingQueue = pgTable("email_processing_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  emailAccountId: varchar("email_account_id").references(() => emailAccounts.id).notNull(),
  
  // Email data
  messageId: varchar("message_id").notNull(), // Email message ID
  emailData: jsonb("email_data").notNull(), // Dados completos do email
  
  // Processing status
  status: varchar("status", { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
  triggersMatched: jsonb("triggers_matched").default([]), // Array de trigger IDs que matcharam
  
  // Execution tracking
  processedAt: timestamp("processed_at"),
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Event Processing Queue - Fila de processamento de eventos
export const calendarEventProcessingQueue = pgTable("calendar_event_processing_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  calendarAccountId: varchar("calendar_account_id").references(() => calendarAccounts.id).notNull(),
  
  // Event data
  eventId: varchar("event_id").notNull(), // Calendar event ID
  eventData: jsonb("event_data").notNull(), // Dados completos do evento
  
  // Processing status
  status: varchar("status", { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
  triggersMatched: jsonb("triggers_matched").default([]), // Array de trigger IDs que matcharam
  
  // Execution tracking
  processedAt: timestamp("processed_at"),
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trigger Execution History - Histórico de execuções de triggers
export const triggerExecutionHistory = pgTable("trigger_execution_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Trigger reference
  triggerType: varchar("trigger_type", { length: 50 }).notNull(), // 'email' or 'calendar'
  triggerId: varchar("trigger_id").notNull(), // ID do email_trigger ou calendar_trigger
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id).notNull(),
  
  // Execution data
  executionId: varchar("execution_id"), // Link para workflow execution
  triggerData: jsonb("trigger_data").notNull(), // Dados que causaram o trigger
  extractedData: jsonb("extracted_data").default({}), // Dados extraídos pelo trigger
  
  // Result
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'skipped'
  error: text("error"),
  
  // Timing
  triggeredAt: timestamp("triggered_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // Duração em milliseconds
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types for Email & Calendar Triggers
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = typeof emailAccounts.$inferInsert;
export type CalendarAccount = typeof calendarAccounts.$inferSelect;
export type InsertCalendarAccount = typeof calendarAccounts.$inferInsert;
export type EmailTrigger = typeof emailTriggers.$inferSelect;
export type InsertEmailTrigger = typeof emailTriggers.$inferInsert;
export type CalendarTrigger = typeof calendarTriggers.$inferSelect;
export type InsertCalendarTrigger = typeof calendarTriggers.$inferInsert;
export type EmailProcessingQueue = typeof emailProcessingQueue.$inferSelect;
export type InsertEmailProcessingQueue = typeof emailProcessingQueue.$inferInsert;
export type CalendarEventProcessingQueue = typeof calendarEventProcessingQueue.$inferSelect;
export type InsertCalendarEventProcessingQueue = typeof calendarEventProcessingQueue.$inferInsert;
export type TriggerExecutionHistory = typeof triggerExecutionHistory.$inferSelect;
export type InsertTriggerExecutionHistory = typeof triggerExecutionHistory.$inferInsert;

// ===== QUANTUM MONETIZATION SYSTEM =====

// Quantum Package Types
export const quantumPackageTypeEnum = pgEnum('quantum_package_type', ['lite', 'unstoppable']);
export const quantumTransactionTypeEnum = pgEnum('quantum_transaction_type', ['credit_purchase', 'execution_charge', 'refund', 'bonus']);
export const quantumAlgorithmTypeEnum = pgEnum('quantum_algorithm_type', [
  // Lite (incluído na mensalidade)
  'adaptive_engine', 'basic_optimization', 'pattern_recognition',
  // Unstoppable (pago por execução)
  'grovers_search', 'qaoa_optimization', 'quantum_ml', 'business_analytics', 
  'qiskit_transpiler', 'long_range_entanglement', 'quantum_teleportation',
  'real_quantum_hardware', 'ai_enhanced_circuits'
]);

// Quantum Packages - Pacotes de quantum computing
export const quantumPackages = pgTable("quantum_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Package configuration
  packageType: quantumPackageTypeEnum("package_type").notNull(),
  isActive: boolean("is_active").default(true),
  
  // Lite package settings (incluído na mensalidade)
  liteAlgorithmsIncluded: jsonb("lite_algorithms_included").default([
    'adaptive_engine', 'basic_optimization', 'pattern_recognition'
  ]),
  
  // Unstoppable package settings (sistema de créditos)
  creditsBalance: integer("credits_balance").default(0), // Créditos disponíveis
  totalCreditsSpent: integer("total_credits_spent").default(0), // Total gasto histórico
  
  // Pricing configuration (em centavos)
  creditPriceInCents: integer("credit_price_in_cents").default(500), // R$ 5,00 por crédito
  autoRechargeEnabled: boolean("auto_recharge_enabled").default(false),
  autoRechargeAmount: integer("auto_recharge_amount").default(100), // Comprar 100 créditos quando acabar
  lowBalanceThreshold: integer("low_balance_threshold").default(10), // Alertar quando < 10 créditos
  
  // Usage limits
  monthlyExecutionLimit: integer("monthly_execution_limit"), // null = unlimited
  monthlyExecutionsUsed: integer("monthly_executions_used").default(0),
  lastMonthlyReset: timestamp("last_monthly_reset").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quantum Algorithm Pricing - Preços por algoritmo
export const quantumAlgorithmPricing = pgTable("quantum_algorithm_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  algorithmType: quantumAlgorithmTypeEnum("algorithm_type").notNull().unique(),
  packageRequired: quantumPackageTypeEnum("package_required").notNull(),
  
  // Pricing
  creditsPerExecution: integer("credits_per_execution").notNull(), // Créditos consumidos por execução
  estimatedExecutionTime: integer("estimated_execution_time"), // Tempo estimado em milliseconds
  
  // Metadata
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Computational complexity
  complexityLevel: varchar("complexity_level", { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'extreme'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quantum Transactions - Histórico de compras e consumo de créditos
export const quantumTransactions = pgTable("quantum_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  quantumPackageId: varchar("quantum_package_id").references(() => quantumPackages.id).notNull(),
  
  // Transaction details
  transactionType: quantumTransactionTypeEnum("transaction_type").notNull(),
  amount: integer("amount").notNull(), // Créditos (positivo = ganho, negativo = gasto)
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  
  // Payment information (para compras)
  priceInCents: integer("price_in_cents"), // Valor pago em centavos (apenas para compras)
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeInvoiceId: varchar("stripe_invoice_id"),
  
  // Execution information (para execuções)
  algorithmType: quantumAlgorithmTypeEnum("algorithm_type"),
  executionId: varchar("execution_id"), // ID da execução que consumiu créditos
  executionMetadata: jsonb("execution_metadata"), // Dados da execução
  
  // Metadata
  description: text("description"),
  metadata: jsonb("metadata"), // Dados extras
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quantum Executions - Log de todas as execuções quantum
export const quantumExecutions = pgTable("quantum_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quantumPackageId: varchar("quantum_package_id").references(() => quantumPackages.id).notNull(),
  
  // Execution details
  algorithmType: quantumAlgorithmTypeEnum("algorithm_type").notNull(),
  inputData: jsonb("input_data").notNull(), // Dados de entrada
  outputData: jsonb("output_data"), // Resultado da execução
  
  // Performance metrics
  executionTimeMs: integer("execution_time_ms"), // Tempo de execução
  quantumAdvantage: decimal("quantum_advantage", { precision: 5, scale: 2 }), // Fator de vantagem quântica
  classicalComparison: jsonb("classical_comparison"), // Comparação com algoritmo clássico
  
  // Billing
  creditsCharged: integer("credits_charged").notNull(), // Créditos cobrados
  transactionId: varchar("transaction_id").references(() => quantumTransactions.id),
  
  // Status
  status: varchar("status", { length: 20 }).notNull(), // 'running', 'completed', 'failed', 'timeout'
  error: text("error"),
  
  // Context
  workflowId: varchar("workflow_id").references(() => visualWorkflows.id), // Se executado via workflow
  workflowExecutionId: varchar("workflow_execution_id"),
  
  // Enhanced with IBM Qiskit
  useQiskitEnhancement: boolean("use_qiskit_enhancement").default(false),
  qiskitOptimizationApplied: jsonb("qiskit_optimization_applied"), // Otimizações aplicadas
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quantum Usage Analytics - Analytics de uso quantum por tenant
export const quantumUsageAnalytics = pgTable("quantum_usage_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  
  // Period
  period: varchar("period", { length: 7 }).notNull(), // 'YYYY-MM' format
  
  // Usage metrics
  totalExecutions: integer("total_executions").default(0),
  totalCreditsSpent: integer("total_credits_spent").default(0),
  totalExecutionTimeMs: integer("total_execution_time_ms").default(0),
  
  // Algorithm breakdown
  algorithmUsage: jsonb("algorithm_usage").default({}), // { "algorithm_type": execution_count }
  
  // Performance metrics
  avgQuantumAdvantage: decimal("avg_quantum_advantage", { precision: 5, scale: 2 }),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % de execuções bem-sucedidas
  
  // Business impact
  estimatedTimeSaved: integer("estimated_time_saved"), // Tempo economizado vs clássico (segundos)
  costPerExecution: decimal("cost_per_execution", { precision: 8, scale: 2 }), // Custo médio por execução
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types for Quantum Monetization
export type QuantumPackage = typeof quantumPackages.$inferSelect;
export type InsertQuantumPackage = typeof quantumPackages.$inferInsert;
export type QuantumAlgorithmPricing = typeof quantumAlgorithmPricing.$inferSelect;
export type InsertQuantumAlgorithmPricing = typeof quantumAlgorithmPricing.$inferInsert;
export type QuantumTransaction = typeof quantumTransactions.$inferSelect;
export type InsertQuantumTransaction = typeof quantumTransactions.$inferInsert;
export type QuantumExecution = typeof quantumExecutions.$inferSelect;
export type InsertQuantumExecution = typeof quantumExecutions.$inferInsert;
export type QuantumUsageAnalytics = typeof quantumUsageAnalytics.$inferSelect;
export type InsertQuantumUsageAnalytics = typeof quantumUsageAnalytics.$inferInsert;
