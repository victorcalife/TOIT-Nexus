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

// Users table with tenant support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('employee'),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null for super_admin
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Reports table with tenant isolation
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  template: jsonb("template").notNull(),
  categoryId: varchar("category_id").references(() => clientCategories.id),
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
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
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
  activities: many(activities),
}));

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
