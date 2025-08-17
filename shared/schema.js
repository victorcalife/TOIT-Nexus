/**
 * SHARED SCHEMA - JavaScript Puro
 */

const userRoleEnum = [ 'super_admin', 'tenant_admin', 'manager', 'user' ];
const tenantStatusEnum = [ 'active', 'inactive', 'suspended' ];
const subscriptionStatusEnum = [ 'active', 'cancelled', 'expired' ];
const paymentStatusEnum = [ 'pending', 'paid', 'failed' ];

const insertUserSchema = {
    name: 'string',
    email: 'string',
    password: 'string',
    role: 'string',
    tenant_id: 'string'
};

const insertTenantSchema = {
    name: 'string',
    domain: 'string',
    status: 'string'
};

const users = {
    id: 'INTEGER PRIMARY KEY',
    name: 'TEXT NOT NULL',
    email: 'TEXT UNIQUE NOT NULL',
    password: 'TEXT NOT NULL',
    role: 'TEXT DEFAULT "user"',
    tenant_id: 'TEXT',
    is_active: 'INTEGER DEFAULT 1',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

const tenants = {
    id: 'INTEGER PRIMARY KEY',
    name: 'TEXT NOT NULL',
    domain: 'TEXT UNIQUE',
    status: 'TEXT DEFAULT "active"',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

const subscriptions = {
    id: 'INTEGER PRIMARY KEY',
    user_id: 'INTEGER',
    plan_id: 'TEXT',
    status: 'TEXT DEFAULT "active"',
    billing_cycle: 'TEXT DEFAULT "monthly"',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

const paymentPlans = {
    id: 'INTEGER PRIMARY KEY',
    name: 'TEXT NOT NULL',
    price: 'REAL',
    currency: 'TEXT DEFAULT "BRL"',
    is_active: 'INTEGER DEFAULT 1'
};

const invoices = {
    id: 'INTEGER PRIMARY KEY',
    user_id: 'INTEGER',
    amount: 'REAL',
    status: 'TEXT DEFAULT "pending"',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

const businessLeads = {
    id: 'INTEGER PRIMARY KEY',
    firstName: 'TEXT',
    lastName: 'TEXT',
    email: 'TEXT',
    companyName: 'TEXT',
    status: 'TEXT DEFAULT "new"',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

module.exports = {
    userRoleEnum,
    tenantStatusEnum,
    subscriptionStatusEnum,
    paymentStatusEnum,
    insertUserSchema,
    insertTenantSchema,
    users,
    tenants,
    subscriptions,
    paymentPlans,
    invoices,
    businessLeads
};