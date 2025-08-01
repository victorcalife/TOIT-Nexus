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

// Uploaded Files - Gestão de arquivos
export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimetype: varchar("mimetype", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  isProcessed: boolean("is_processed").default(false),
  metadata: jsonb("metadata"), // File analysis results
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Webhook Logs - Logs de webhooks
export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  webhookId: varchar("webhook_id", { length: 255 }).notNull(),
  payload: jsonb("payload").notNull(),
  headers: jsonb("headers"),
  processed: boolean("processed").default(false),
  processingResult: jsonb("processing_result"),
  receivedAt: timestamp("received_at").defaultNow(),
});

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

// Access Profile Types
export type AccessProfile = typeof accessProfiles.$inferSelect;
export type InsertAccessProfile = typeof accessProfiles.$inferInsert;
