import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  pgEnum,
  decimal,
  integer,
} from "drizzle-orm/pg-core";

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
  isActive: boolean("is_active").default(true),
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

// ==================== PAYMENT SYSTEM TABLES ====================

// Payment plan types enum
export const paymentPlanEnum = pgEnum('payment_plan_type', ['individual', 'business', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'trialing', 'incomplete']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'succeeded', 'failed', 'canceled']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'proposal', 'closed', 'lost']);

// Payment plans table
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
  features: jsonb("features").notNull(),
  maxUsers: integer("max_users"),
  maxModules: integer("max_modules"),
  trialDays: integer("trial_days").default(7),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  planId: varchar("plan_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id").notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  billingCycle: varchar("billing_cycle", { length: 20 }).notNull(), // monthly, yearly
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeInvoiceId: varchar("stripe_invoice_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('BRL'),
  status: transactionStatusEnum("status").notNull(),
  description: text("description"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  processedAt: timestamp("processed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  stripePaymentMethodId: varchar("stripe_payment_method_id").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // card, pix, boleto
  cardBrand: varchar("card_brand", { length: 20 }),
  cardLast4: varchar("card_last4", { length: 4 }),
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  subscriptionId: varchar("subscription_id"),
  stripeInvoiceId: varchar("stripe_invoice_id").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('BRL'),
  status: varchar("status", { length: 50 }).notNull(),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  hostedInvoiceUrl: text("hosted_invoice_url"),
  invoicePdf: text("invoice_pdf"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook events table
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeEventId: varchar("stripe_event_id").notNull().unique(),
  eventType: varchar("event_type").notNull(),
  apiVersion: varchar("api_version"),
  data: jsonb("data").notNull(),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business leads table
export const businessLeads = pgTable("business_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  companyName: varchar("company_name").notNull(),
  cnpj: varchar("cnpj"),
  employeeCount: integer("employee_count"),
  sector: varchar("sector"),
  message: text("message"),
  status: leadStatusEnum("status").default('new'),
  notes: text("notes"),
  assignedTo: varchar("assigned_to"),
  contactedAt: timestamp("contacted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});