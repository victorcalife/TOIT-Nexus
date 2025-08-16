/**
 * SCHEMA UNIFICADO DO BANCO DE DADOS
 * Consolida shared/schema.ts em JavaScript puro
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES:
 * - Definições de tabelas Drizzle ORM
 * - Relacionamentos entre tabelas
 * - Validações Zod
 * - Índices otimizados
 * - Enums e tipos
 */

const { sql, relations } = require('drizzle-orm');
const {
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
} = require('drizzle-orm/pg-core');
const { createInsertSchema } = require('drizzle-zod');
const { z } = require('zod');

/**
 * ENUMS DO SISTEMA
 */
const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'toit_admin', 
  'tenant_admin',
  'manager',
  'employee'
]);

const tenantStatusEnum = pgEnum('tenant_status', [
  'active',
  'inactive', 
  'suspended',
  'pending'
]);

const riskProfileEnum = pgEnum('risk_profile', [
  'conservative',
  'moderate',
  'aggressive'
]);

const integrationTypeEnum = pgEnum('integration_type', [
  'api',
  'database',
  'webhook',
  'email'
]);

/**
 * TABELA DE SESSÕES
 */
const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)]
);

/**
 * TABELA DE TENANTS (EMPRESAS/CLIENTES)
 */
const tenants = pgTable('tenants', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  logo: varchar('logo'),
  settings: jsonb('settings'),
  status: tenantStatusEnum('status').default('active'),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('basic'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE USUÁRIOS
 */
const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  cpf: varchar('cpf', { length: 11 }).unique().notNull(),
  email: varchar('email').unique(),
  password: varchar('password').notNull(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  phone: varchar('phone'),
  birthDate: varchar('birth_date', { length: 10 }),
  profileImageUrl: varchar('profile_image_url'),
  role: userRoleEnum('role').default('employee'),
  tenantId: varchar('tenant_id').references(() => tenants.id),
  isActive: boolean('is_active').default(false),
  emailVerified: boolean('email_verified').default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE PERMISSÕES
 */
const permissions = pgTable('permissions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  module: varchar('module', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * TABELA DE PERMISSÕES POR USUÁRIO
 */
const userPermissions = pgTable('user_permissions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').references(() => users.id).notNull(),
  permissionId: varchar('permission_id').references(() => permissions.id).notNull(),
  tenantId: varchar('tenant_id').references(() => tenants.id),
  grantedById: varchar('granted_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * TABELA DE PERMISSÕES POR ROLE
 */
const rolePermissions = pgTable('role_permissions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id),
  role: userRoleEnum('role').notNull(),
  permissionId: varchar('permission_id').references(() => permissions.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * TABELA DE CLIENTES
 */
const clients = pgTable('clients', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email'),
  phone: varchar('phone'),
  currentInvestment: decimal('current_investment', { precision: 15, scale: 2 }),
  riskProfile: riskProfileEnum('risk_profile'),
  metadata: jsonb('metadata'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE WORKFLOWS
 */
const workflows = pgTable('workflows', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  config: jsonb('config').notNull(),
  isActive: boolean('is_active').default(true),
  createdById: varchar('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE DASHBOARDS
 */
const dashboards = pgTable('dashboards', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  userId: varchar('user_id').references(() => users.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  layout: jsonb('layout').notNull(),
  widgets: jsonb('widgets').notNull(),
  isDefault: boolean('is_default').default(false),
  isPublic: boolean('is_public').default(false),
  refreshInterval: integer('refresh_interval').default(300),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE CONEXÕES DE API
 */
const apiConnections = pgTable('api_connections', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  type: integrationTypeEnum('type').notNull(),
  config: jsonb('config').notNull(),
  isActive: boolean('is_active').default(true),
  lastTestedAt: timestamp('last_tested_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE UPLOADS DE ARQUIVOS
 */
const fileUploads = pgTable('file_uploads', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  userId: varchar('user_id').references(() => users.id),
  filename: varchar('filename').notNull(),
  originalName: varchar('original_name').notNull(),
  mimeType: varchar('mime_type'),
  size: integer('size'),
  path: varchar('path').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * TABELA DE SLOTS ML
 */
const mlSlots = pgTable('ml_slots', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  slotType: varchar('slot_type', { length: 50 }).notNull(),
  slotName: varchar('slot_name', { length: 200 }).notNull(),
  slotLocation: varchar('slot_location').notNull(),
  slotConfig: jsonb('slot_config'),
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * TABELA DE USO DE SLOTS ML
 */
const mlSlotUsage = pgTable('ml_slot_usage', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  slotId: varchar('slot_id').references(() => mlSlots.id).notNull(),
  tenantId: varchar('tenant_id').references(() => tenants.id).notNull(),
  usageData: jsonb('usage_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * RELACIONAMENTOS
 */
const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  userPermissions: many(userPermissions),
  createdWorkflows: many(workflows),
  dashboards: many(dashboards),
  fileUploads: many(fileUploads),
}));

const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  workflows: many(workflows),
  dashboards: many(dashboards),
  apiConnections: many(apiConnections),
  fileUploads: many(fileUploads),
  mlSlots: many(mlSlots),
}));

const permissionsRelations = relations(permissions, ({ many }) => ({
  userPermissions: many(userPermissions),
  rolePermissions: many(rolePermissions),
}));

const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
  tenant: one(tenants, {
    fields: [userPermissions.tenantId],
    references: [tenants.id],
  }),
}));

/**
 * SCHEMAS DE VALIDAÇÃO ZOD
 */
const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * EXPORTAÇÕES
 */
module.exports = {
  // Enums
  userRoleEnum,
  tenantStatusEnum,
  riskProfileEnum,
  integrationTypeEnum,
  
  // Tabelas
  sessions,
  tenants,
  users,
  permissions,
  userPermissions,
  rolePermissions,
  clients,
  workflows,
  dashboards,
  apiConnections,
  fileUploads,
  mlSlots,
  mlSlotUsage,
  
  // Relacionamentos
  usersRelations,
  tenantsRelations,
  permissionsRelations,
  userPermissionsRelations,
  
  // Schemas de validação
  insertTenantSchema,
  insertUserSchema,
  insertClientSchema,
  insertWorkflowSchema,
};
