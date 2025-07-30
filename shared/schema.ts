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
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'employee']);
export const riskProfileEnum = pgEnum('risk_profile', ['conservative', 'moderate', 'aggressive']);
export const integrationTypeEnum = pgEnum('integration_type', ['api', 'database', 'webhook', 'email']);
export const workflowStatusEnum = pgEnum('workflow_status', ['active', 'inactive', 'draft']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('employee'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client categories table
export const clientCategories = pgTable("client_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Integrations table
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  type: integrationTypeEnum("type").notNull(),
  config: jsonb("config").notNull(), // API keys, endpoints, etc.
  isActive: boolean("is_active").default(true),
  lastStatus: varchar("last_status", { length: 50 }).default('unknown'),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflows table
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Workflow executions table
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => workflows.id).notNull(),
  clientId: varchar("client_id").references(() => clients.id),
  status: varchar("status", { length: 50 }).notNull(),
  result: jsonb("result"),
  error: text("error"),
  executedAt: timestamp("executed_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  template: jsonb("template").notNull(),
  categoryId: varchar("category_id").references(() => clientCategories.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table for audit log
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id"),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const clientCategoriesRelations = relations(clientCategories, ({ many }) => ({
  clients: many(clients),
  workflows: many(workflows),
  reports: many(reports),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  category: one(clientCategories, {
    fields: [clients.categoryId],
    references: [clientCategories.id],
  }),
  workflowExecutions: many(workflowExecutions),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  category: one(clientCategories, {
    fields: [workflows.categoryId],
    references: [clientCategories.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
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
  category: one(clientCategories, {
    fields: [reports.categoryId],
    references: [clientCategories.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClientCategory = z.infer<typeof insertClientCategorySchema>;
export type ClientCategory = typeof clientCategories.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
