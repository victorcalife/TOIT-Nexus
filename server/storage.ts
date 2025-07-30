import {
  tenants,
  users,
  departments,
  userDepartments,
  permissions,
  rolePermissions,
  userPermissions,
  clientCategories,
  clients,
  integrations,
  workflows,
  workflowExecutions,
  reports,
  activities,
  kpiDefinitions,
  workflowRules,
  type Tenant,
  type InsertTenant,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type UserDepartment,
  type InsertUserDepartment,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type UserPermission,
  type InsertUserPermission,
  type ClientCategory,
  type InsertClientCategory,
  type Client,
  type InsertClient,
  type Integration,
  type InsertIntegration,
  type Workflow,
  type InsertWorkflow,
  type WorkflowExecution,
  type Report,
  type InsertReport,
  type Activity,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // Tenant operations
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant>;
  
  // User operations with CPF authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByCPF(cpf: string): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // Client Category operations (tenant-isolated)
  getClientCategories(tenantId?: string): Promise<ClientCategory[]>;
  getClientCategory(id: string): Promise<ClientCategory | undefined>;
  createClientCategory(category: InsertClientCategory): Promise<ClientCategory>;
  updateClientCategory(id: string, category: Partial<InsertClientCategory>): Promise<ClientCategory>;
  deleteClientCategory(id: string): Promise<void>;
  
  // Client operations (tenant-isolated)
  getClients(tenantId?: string): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientsByCategory(categoryId: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Integration operations (tenant-isolated)
  getIntegrations(tenantId?: string): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration>;
  deleteIntegration(id: string): Promise<void>;
  updateIntegrationStatus(id: string, status: string): Promise<void>;
  
  // Workflow operations (tenant-isolated)
  getWorkflows(tenantId?: string): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  getWorkflowsByCategory(categoryId: string): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;
  updateWorkflowExecution(workflowId: string): Promise<void>;
  
  // Workflow execution operations (tenant-isolated)
  getWorkflowExecutions(tenantId?: string, workflowId?: string, limit?: number): Promise<WorkflowExecution[]>;
  createWorkflowExecution(execution: Omit<WorkflowExecution, 'id' | 'executedAt'>): Promise<WorkflowExecution>;
  
  // Report operations (tenant-isolated)
  getReports(tenantId?: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: string): Promise<void>;
  
  // Activity operations (tenant-isolated)
  getRecentActivities(tenantId?: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalTenants: number;
    totalUsers: number;
    monthlyRevenue: number;
    issues: number;
  }>;
  getAllActivities(limit?: number): Promise<Activity[]>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalClients: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
  }>;

  // Department operations (tenant-isolated)
  getDepartments(tenantId: string): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: string): Promise<void>;

  // User-Department operations
  getUserDepartments(userId: string): Promise<UserDepartment[]>;
  assignUserToDepartment(assignment: InsertUserDepartment): Promise<UserDepartment>;
  removeUserFromDepartment(userId: string, departmentId: string): Promise<void>;

  // Permission operations (tenant-isolated)
  getPermissions(tenantId: string): Promise<Permission[]>;
  getPermission(id: string): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: string, permission: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: string): Promise<void>;

  // Role-Permission operations
  getRolePermissions(tenantId: string, role?: string): Promise<RolePermission[]>;
  assignPermissionToRole(assignment: InsertRolePermission): Promise<RolePermission>;
  removePermissionFromRole(tenantId: string, role: string, permissionId: string): Promise<void>;

  // User-Permission operations (overrides)
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  grantUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  revokeUserPermission(userId: string, permissionId: string): Promise<void>;

  // Access control utilities
  checkUserPermission(userId: string, resource: string, action: string, departmentId?: string): Promise<boolean>;
  getUserAccessibleDepartments(userId: string): Promise<Department[]>;
  getDepartmentFilters(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Tenant operations
  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant;
  }

  async createTenant(tenantData: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values(tenantData)
      .returning();
    return tenant;
  }

  async updateTenant(id: string, tenantData: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...tenantData, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByCPF(cpf: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.cpf, cpf));
    return user;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(user.id);
    
    if (existingUser) {
      // Update existing user
      const [updated] = await db
        .update(users)
        .set({ 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id))
        .returning();
      return updated;
    } else {
      // Create new user with default values
      const [created] = await db
        .insert(users)
        .values({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          password: '', // Default empty password for OAuth users
          cpf: '', // Default empty CPF for OAuth users
          isActive: true,
          role: 'user',
          tenantId: 'default', // Default tenant for OAuth users
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return created;
    }
  }

  // Client Category operations (with tenant isolation)
  async getClientCategories(tenantId?: string): Promise<ClientCategory[]> {
    const query = db
      .select()
      .from(clientCategories)
      .where(eq(clientCategories.isActive, true));
    
    if (tenantId) {
      return await query.where(eq(clientCategories.tenantId, tenantId)).orderBy(desc(clientCategories.createdAt));
    }
    
    return await query.orderBy(desc(clientCategories.createdAt));
  }

  async getClientCategory(id: string): Promise<ClientCategory | undefined> {
    const [category] = await db
      .select()
      .from(clientCategories)
      .where(eq(clientCategories.id, id));
    return category;
  }

  async createClientCategory(category: InsertClientCategory): Promise<ClientCategory> {
    const [created] = await db
      .insert(clientCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateClientCategory(id: string, category: Partial<InsertClientCategory>): Promise<ClientCategory> {
    const [updated] = await db
      .update(clientCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(clientCategories.id, id))
      .returning();
    return updated;
  }

  async deleteClientCategory(id: string): Promise<void> {
    await db
      .update(clientCategories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clientCategories.id, id));
  }

  // Client operations (with tenant isolation)
  async getClients(tenantId?: string): Promise<Client[]> {
    const query = db
      .select()
      .from(clients)
      .where(eq(clients.isActive, true));
    
    if (tenantId) {
      return await query.where(eq(clients.tenantId, tenantId)).orderBy(desc(clients.createdAt));
    }
    
    return await query.orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return client;
  }

  async getClientsByCategory(categoryId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(and(eq(clients.categoryId, categoryId), eq(clients.isActive, true)))
      .orderBy(desc(clients.createdAt));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db
      .insert(clients)
      .values(client)
      .returning();
    return created;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updated] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<void> {
    await db
      .update(clients)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clients.id, id));
  }

  // Integration operations (with tenant isolation)
  async getIntegrations(tenantId?: string): Promise<Integration[]> {
    const query = db
      .select()
      .from(integrations)
      .where(eq(integrations.isActive, true));
    
    if (tenantId) {
      return await query.where(eq(integrations.tenantId, tenantId)).orderBy(desc(integrations.createdAt));
    }
    
    return await query.orderBy(desc(integrations.createdAt));
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));
    return integration;
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [created] = await db
      .insert(integrations)
      .values(integration)
      .returning();
    return created;
  }

  async updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration> {
    const [updated] = await db
      .update(integrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return updated;
  }

  async deleteIntegration(id: string): Promise<void> {
    await db
      .update(integrations)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(integrations.id, id));
  }

  async updateIntegrationStatus(id: string, status: string): Promise<void> {
    await db
      .update(integrations)
      .set({ lastStatus: status, lastChecked: new Date() })
      .where(eq(integrations.id, id));
  }

  // Workflow operations (with tenant isolation)
  async getWorkflows(tenantId?: string): Promise<Workflow[]> {
    const query = db.select().from(workflows);
    
    if (tenantId) {
      return await query.where(eq(workflows.tenantId, tenantId)).orderBy(desc(workflows.createdAt));
    }
    
    return await query.orderBy(desc(workflows.createdAt));
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id));
    return workflow;
  }

  async getWorkflowsByCategory(categoryId: string): Promise<Workflow[]> {
    return await db
      .select()
      .from(workflows)
      .where(eq(workflows.categoryId, categoryId))
      .orderBy(desc(workflows.createdAt));
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [created] = await db
      .insert(workflows)
      .values(workflow)
      .returning();
    return created;
  }

  async updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow> {
    const [updated] = await db
      .update(workflows)
      .set({ ...workflow, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return updated;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await db.delete(workflows).where(eq(workflows.id, id));
  }

  async updateWorkflowExecution(workflowId: string): Promise<void> {
    await db
      .update(workflows)
      .set({ 
        executionCount: sql`${workflows.executionCount} + 1`,
        lastExecuted: new Date() 
      })
      .where(eq(workflows.id, workflowId));
  }

  // Workflow execution operations (with tenant isolation)  
  async getWorkflowExecutions(tenantId?: string, workflowId?: string, limit = 50): Promise<WorkflowExecution[]> {
    let query = db.select().from(workflowExecutions);
    
    if (tenantId) {
      query = query.where(eq(workflowExecutions.tenantId, tenantId));
    }
    
    if (workflowId) {
      query = query.where(eq(workflowExecutions.workflowId, workflowId));
    }
    
    return await query
      .orderBy(desc(workflowExecutions.executedAt))
      .limit(limit);
  }

  async createWorkflowExecution(execution: Omit<WorkflowExecution, 'id' | 'executedAt'>): Promise<WorkflowExecution> {
    const [created] = await db
      .insert(workflowExecutions)
      .values(execution)
      .returning();
    return created;
  }

  // Report operations (with tenant isolation)
  async getReports(tenantId?: string): Promise<Report[]> {
    const query = db
      .select()
      .from(reports)
      .where(eq(reports.isActive, true));
    
    if (tenantId) {
      return await query.where(eq(reports.tenantId, tenantId)).orderBy(desc(reports.createdAt));
    }
    
    return await query.orderBy(desc(reports.createdAt));
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    return report;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db
      .insert(reports)
      .values(report)
      .returning();
    return created;
  }

  async updateReport(id: string, report: Partial<InsertReport>): Promise<Report> {
    const [updated] = await db
      .update(reports)
      .set({ ...report, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async deleteReport(id: string): Promise<void> {
    await db
      .update(reports)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(reports.id, id));
  }

  // Activity operations (with tenant isolation)
  async getRecentActivities(tenantId?: string, limit = 20): Promise<Activity[]> {
    const query = db.select().from(activities);
    
    if (tenantId) {
      return await query
        .where(eq(activities.tenantId, tenantId))
        .orderBy(desc(activities.createdAt))
        .limit(limit);
    }
    
    return await query
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return created;
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalTenants: number;
    totalUsers: number;
    monthlyRevenue: number;
    issues: number;
  }> {
    const [tenantCount] = await db.select({ count: count() }).from(tenants);
    const [userCount] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    
    // Calculate monthly revenue based on subscription plans
    const activeTenantsWithPlans = await db
      .select({ subscriptionPlan: tenants.subscriptionPlan })
      .from(tenants)
      .where(eq(tenants.status, 'active'));
    
    const planPrices = { basic: 99, premium: 299, enterprise: 999 };
    const monthlyRevenue = activeTenantsWithPlans.reduce((sum, tenant) => {
      return sum + (planPrices[tenant.subscriptionPlan as keyof typeof planPrices] || 0);
    }, 0);

    // Count issues (suspended tenants + inactive integrations)
    const [suspendedTenants] = await db.select({ count: count() }).from(tenants).where(eq(tenants.status, 'suspended'));
    const [failedIntegrations] = await db.select({ count: count() }).from(integrations).where(eq(integrations.lastStatus, 'error'));
    
    return {
      totalTenants: tenantCount.count,
      totalUsers: userCount.count,
      monthlyRevenue,
      issues: suspendedTenants.count + failedIntegrations.count
    };
  }

  async getAllActivities(limit = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // KPI management operations
  async createKPI(kpi: any): Promise<any> {
    const [created] = await db
      .insert(kpiDefinitions)
      .values(kpi)
      .returning();
    return created;
  }

  async getKPIs(tenantId?: string): Promise<any[]> {
    const query = db.select().from(kpiDefinitions);
    
    if (tenantId) {
      return await query.where(eq(kpiDefinitions.tenantId, tenantId));
    }
    
    return await query;
  }

  // Workflow rules management
  async createWorkflowRule(rule: any): Promise<any> {
    const [created] = await db
      .insert(workflowRules)
      .values(rule)
      .returning();
    return created;
  }

  async getWorkflowRules(tenantId?: string, workflowId?: string): Promise<any[]> {
    let query = db.select().from(workflowRules);
    
    if (tenantId) {
      query = query.where(eq(workflowRules.tenantId, tenantId));
    }
    
    if (workflowId) {
      query = query.where(eq(workflowRules.workflowId, workflowId));
    }
    
    return await query;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalClients: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
  }> {
    const [clientCount] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.isActive, true));

    const [workflowCount] = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.status, 'active'));

    const [executionCount] = await db
      .select({ count: count() })
      .from(workflowExecutions);

    const [successCount] = await db
      .select({ count: count() })
      .from(workflowExecutions)
      .where(eq(workflowExecutions.status, 'success'));

    const successRate = executionCount.count > 0 
      ? (successCount.count / executionCount.count) * 100 
      : 0;

    return {
      totalClients: clientCount.count,
      activeWorkflows: workflowCount.count,
      totalExecutions: executionCount.count,
      successRate: Number(successRate.toFixed(1)),
    };
  }

  // Department operations
  async getDepartments(tenantId: string): Promise<Department[]> {
    return await db.select().from(departments)
      .where(eq(departments.tenantId, tenantId))
      .orderBy(desc(departments.createdAt));
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(departmentData: InsertDepartment): Promise<Department> {
    const [department] = await db
      .insert(departments)
      .values(departmentData)
      .returning();
    return department;
  }

  async updateDepartment(id: string, departmentData: Partial<InsertDepartment>): Promise<Department> {
    const [department] = await db
      .update(departments)
      .set({ ...departmentData, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return department;
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // User-Department operations
  async getUserDepartments(userId: string): Promise<UserDepartment[]> {
    return await db.select().from(userDepartments)
      .where(eq(userDepartments.userId, userId));
  }

  async assignUserToDepartment(assignment: InsertUserDepartment): Promise<UserDepartment> {
    const [userDept] = await db
      .insert(userDepartments)
      .values(assignment)
      .returning();
    return userDept;
  }

  async removeUserFromDepartment(userId: string, departmentId: string): Promise<void> {
    await db.delete(userDepartments)
      .where(and(
        eq(userDepartments.userId, userId),
        eq(userDepartments.departmentId, departmentId)
      ));
  }

  // Permission operations
  async getPermissions(tenantId: string): Promise<Permission[]> {
    return await db.select().from(permissions)
      .where(eq(permissions.tenantId, tenantId))
      .orderBy(desc(permissions.createdAt));
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async createPermission(permissionData: InsertPermission): Promise<Permission> {
    const [permission] = await db
      .insert(permissions)
      .values(permissionData)
      .returning();
    return permission;
  }

  async updatePermission(id: string, permissionData: Partial<InsertPermission>): Promise<Permission> {
    const [permission] = await db
      .update(permissions)
      .set(permissionData)
      .where(eq(permissions.id, id))
      .returning();
    return permission;
  }

  async deletePermission(id: string): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }

  // Role-Permission operations
  async getRolePermissions(tenantId: string, role?: string): Promise<RolePermission[]> {
    let query = db.select().from(rolePermissions)
      .where(eq(rolePermissions.tenantId, tenantId));
    
    if (role) {
      query = query.where(eq(rolePermissions.role, role as any));
    }
    
    return await query;
  }

  async assignPermissionToRole(assignment: InsertRolePermission): Promise<RolePermission> {
    const [rolePermission] = await db
      .insert(rolePermissions)
      .values(assignment)
      .returning();
    return rolePermission;
  }

  async removePermissionFromRole(tenantId: string, role: string, permissionId: string): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.role, role as any),
        eq(rolePermissions.permissionId, permissionId)
      ));
  }

  // User-Permission operations
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return await db.select().from(userPermissions)
      .where(eq(userPermissions.userId, userId));
  }

  async grantUserPermission(permission: InsertUserPermission): Promise<UserPermission> {
    const [userPermission] = await db
      .insert(userPermissions)
      .values(permission)
      .returning();
    return userPermission;
  }

  async revokeUserPermission(userId: string, permissionId: string): Promise<void> {
    await db.delete(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permissionId, permissionId)
      ));
  }

  // Access control utilities
  async checkUserPermission(userId: string, resource: string, action: string, departmentId?: string): Promise<boolean> {
    // Get user and their role
    const user = await this.getUser(userId);
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Tenant admin has all permissions within their tenant
    if (user.role === 'tenant_admin' && user.tenantId) return true;

    // Check role-based permissions
    const rolePerms = await this.getRolePermissions(user.tenantId || '', user.role);
    const roleHasPermission = rolePerms.some(rp => {
      return rp.permissionId && 
             (departmentId ? rp.departmentId === departmentId : true);
    });

    // Check user-specific permissions
    const userPerms = await this.getUserPermissions(userId);
    const userHasPermission = userPerms.some(up => {
      return up.granted && 
             (departmentId ? up.departmentId === departmentId : true);
    });

    return roleHasPermission || userHasPermission;
  }

  async getUserAccessibleDepartments(userId: string): Promise<Department[]> {
    const userDepts = await this.getUserDepartments(userId);
    const departmentIds = userDepts.map(ud => ud.departmentId);
    
    if (departmentIds.length === 0) return [];
    
    return await db.select().from(departments)
      .where(sql`${departments.id} = ANY(${departmentIds})`);
  }

  async getDepartmentFilters(userId: string): Promise<any[]> {
    const accessibleDepts = await this.getUserAccessibleDepartments(userId);
    return accessibleDepts.map(dept => dept.dataFilters).filter(Boolean);
  }
}

export const storage = new DatabaseStorage();
