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
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'tenant_admin', 'manager', 'employee']);
export const riskProfileEnum = pgEnum('risk_profile', ['conservative', 'moderate', 'aggressive']);
export const integrationTypeEnum = pgEnum('integration_type', ['api', 'database', 'webhook', 'email']);
export const workflowStatusEnum = pgEnum('workflow_status', ['active', 'inactive', 'draft']);
export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'inactive', 'suspended']);
export const permissionTypeEnum = pgEnum('permission_type', ['read', 'write', 'delete', 'admin']);
export const departmentTypeEnum = pgEnum('department_type', ['sales', 'purchases', 'finance', 'operations', 'hr', 'it', 'marketing', 'custom']);

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
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('employee'),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for super_admin
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table for organizational structure within tenants
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: departmentTypeEnum("type").notNull(),
  description: text("description"),
  parentDepartmentId: varchar("parent_department_id").references(() => departments.id), // For hierarchical departments
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

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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
