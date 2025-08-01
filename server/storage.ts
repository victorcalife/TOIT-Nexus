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
  savedQueries,
  dashboards,
  taskTemplates,
  taskInstances,
  taskComments,
  notifications,
  verificationTokens,
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
  type SavedQuery,
  type InsertSavedQuery,
  type Dashboard,
  type InsertDashboard,
  type TaskTemplate,
  moduleDefinitions,
  tenantModules,
  userModuleAccess,
  moduleUsageTracking,
  type InsertTaskTemplate,
  type TaskInstance,
  type InsertTaskInstance,
  type TaskComment,
  type InsertTaskComment,
  type Notification,
  type InsertNotification,
  type VerificationToken,
  type InsertVerificationToken,
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
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // Verification system methods
  createVerificationTokens(data: { userId: string; emailToken: string; phoneToken: string; phone: string; expiresAt: Date }): Promise<void>;
  getVerificationToken(token: string, type: string): Promise<{ userId: string } | undefined>;
  getPhoneVerification(phone: string, code: string): Promise<{ userId: string } | undefined>;
  deleteVerificationToken(token: string, type: string): Promise<void>;
  deletePhoneVerification(phone: string, code: string): Promise<void>;
  verifyUserEmail(userId: string): Promise<void>;
  verifyUserPhone(userId: string): Promise<void>;
  activateUser(userId: string): Promise<void>;
  
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
  
  // TOIT Admin operations
  getSystemStats(): Promise<any>;
  getSystemHealth(): Promise<any>;
  getSystemLogs(): Promise<any>;
  getAllTenants(): Promise<Tenant[]>;
  deleteTenant(id: string): Promise<void>;
  getAllUsers(): Promise<any[]>;
  updateUser(id: string, userData: Partial<any>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllDepartments(): Promise<any[]>;
  getAllPermissions(): Promise<any[]>;
  createGlobalPermission(permissionData: any): Promise<Permission>;
  getAllWorkflows(): Promise<any[]>;
  createWorkflowTemplate(templateData: any): Promise<any>;
  getAllIntegrations(): Promise<any[]>;
  createGlobalIntegration(integrationData: any): Promise<any>;
  getSystemConfig(): Promise<any>;
  updateSystemConfig(configData: any): Promise<any>;
  getTenantAnalytics(): Promise<any>;
  getUsageAnalytics(period: string, tenantId?: string): Promise<any>;
  getBillingOverview(): Promise<any>;
  updateTenantSubscription(id: string, subscriptionData: any): Promise<Tenant>;
  exportTenantData(): Promise<any>;
  importTenantData(importData: any): Promise<any>;
  getSupportTickets(): Promise<any>;
  setMaintenanceMode(enabled: boolean, message?: string): Promise<void>;
  
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

  // Query Builder operations
  saveQuery(queryData: any): Promise<SavedQuery>;
  getSavedQueries(tenantId: string): Promise<SavedQuery[]>;
  getSavedQuery(id: string): Promise<SavedQuery | undefined>;
  updateSavedQuery(id: string, queryData: any): Promise<SavedQuery>;
  deleteSavedQuery(id: string): Promise<void>;
  executeRawQuery(sql: string): Promise<any[]>;
  getDatabaseSchema(): Promise<any>;

  // Dashboard operations
  saveDashboard(dashboardData: any): Promise<Dashboard>;
  getDashboards(tenantId: string): Promise<Dashboard[]>;
  getDashboard(id: string): Promise<Dashboard | undefined>;
  updateDashboard(id: string, dashboardData: any): Promise<Dashboard>;
  deleteDashboard(id: string): Promise<void>;

  // Task Management operations - CORE DA APLICAÇÃO
  createTaskTemplate(templateData: InsertTaskTemplate): Promise<TaskTemplate>;
  getTaskTemplatesByManager(managerId: string, tenantId: string): Promise<TaskTemplate[]>;
  getTaskTemplate(id: string): Promise<TaskTemplate | undefined>;
  updateTaskTemplate(id: string, templateData: Partial<InsertTaskTemplate>): Promise<TaskTemplate>;
  deleteTaskTemplate(id: string): Promise<void>;
  
  createTaskInstance(instanceData: InsertTaskInstance): Promise<TaskInstance>;
  getTaskInstance(id: string): Promise<TaskInstance | undefined>;
  updateTaskInstance(id: string, instanceData: Partial<InsertTaskInstance>): Promise<TaskInstance>;
  getTasksByUser(userId: string, tenantId: string): Promise<TaskInstance[]>;
  getDepartmentTasks(managerId: string, tenantId: string): Promise<TaskInstance[]>;
  
  createTaskComment(commentData: InsertTaskComment): Promise<TaskComment>;
  getTaskComments(taskInstanceId: string): Promise<TaskComment[]>;
  
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, tenantId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification>;
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

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Verification system methods
  async createVerificationTokens(data: { userId: string; emailToken: string; phoneToken: string; phone: string; expiresAt: Date }): Promise<void> {
    // Create email token
    await db.insert(verificationTokens).values({
      userId: data.userId,
      emailToken: data.emailToken,
      tokenType: 'email',
      expiresAt: data.expiresAt,
      createdAt: new Date()
    });

    // Create phone token  
    await db.insert(verificationTokens).values({
      userId: data.userId,
      phoneToken: data.phoneToken,
      phone: data.phone,
      tokenType: 'phone',
      expiresAt: data.expiresAt,
      createdAt: new Date()
    });
  }

  async getVerificationToken(token: string, type: string): Promise<{ userId: string } | undefined> {
    const [verification] = await db
      .select({ userId: verificationTokens.userId })
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.emailToken, token),
          eq(verificationTokens.tokenType, type),
          sql`${verificationTokens.expiresAt} > NOW()`,
          sql`${verificationTokens.usedAt} IS NULL`
        )
      );
    return verification;
  }

  async getPhoneVerification(phone: string, code: string): Promise<{ userId: string } | undefined> {
    const [verification] = await db
      .select({ userId: verificationTokens.userId })
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.phoneToken, code),
          eq(verificationTokens.phone, phone),
          eq(verificationTokens.tokenType, 'phone'),
          sql`${verificationTokens.expiresAt} > NOW()`,
          sql`${verificationTokens.usedAt} IS NULL`
        )
      );
    return verification;
  }

  async deleteVerificationToken(token: string, type: string): Promise<void> {
    await db
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(verificationTokens.emailToken, token),
          eq(verificationTokens.tokenType, type)
        )
      );
  }

  async deletePhoneVerification(phone: string, code: string): Promise<void> {
    await db
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(verificationTokens.phoneToken, code),
          eq(verificationTokens.phone, phone),
          eq(verificationTokens.tokenType, 'phone')
        )
      );
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailVerified: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async verifyUserPhone(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        phoneVerified: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async activateUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isActive: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    if (!user.id) {
      throw new Error('User ID is required');
    }
    
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
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          profileImageUrl: user.profileImageUrl || '',
          password: '', // Default empty password for OAuth users
          cpf: '', // Default empty CPF for OAuth users
          isActive: true,
          role: 'employee' as const,
          tenantId: null, // No default tenant for OAuth users
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return created;
    }
  }

  // Client Category operations (with tenant isolation)
  async getClientCategories(tenantId?: string): Promise<ClientCategory[]> {
    if (tenantId) {
      return await db
        .select()
        .from(clientCategories)
        .where(and(eq(clientCategories.isActive, true), eq(clientCategories.tenantId, tenantId)))
        .orderBy(desc(clientCategories.createdAt));
    }
    
    return await db
      .select()
      .from(clientCategories)
      .where(eq(clientCategories.isActive, true))
      .orderBy(desc(clientCategories.createdAt));
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
    if (tenantId) {
      return await db
        .select()
        .from(clients)
        .where(and(eq(clients.isActive, true), eq(clients.tenantId, tenantId)))
        .orderBy(desc(clients.createdAt));
    }
    
    return await db
      .select()
      .from(clients)
      .where(eq(clients.isActive, true))
      .orderBy(desc(clients.createdAt));
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
    if (tenantId) {
      return await db
        .select()
        .from(integrations)
        .where(and(eq(integrations.isActive, true), eq(integrations.tenantId, tenantId)))
        .orderBy(desc(integrations.createdAt));
    }
    
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.isActive, true))
      .orderBy(desc(integrations.createdAt));
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
    if (tenantId && workflowId) {
      return await db.select().from(workflowExecutions)
        .where(and(eq(workflowExecutions.tenantId, tenantId), eq(workflowExecutions.workflowId, workflowId)))
        .orderBy(desc(workflowExecutions.executedAt))
        .limit(limit);
    } else if (tenantId) {
      return await db.select().from(workflowExecutions)
        .where(eq(workflowExecutions.tenantId, tenantId))
        .orderBy(desc(workflowExecutions.executedAt))
        .limit(limit);
    } else if (workflowId) {
      return await db.select().from(workflowExecutions)
        .where(eq(workflowExecutions.workflowId, workflowId))
        .orderBy(desc(workflowExecutions.executedAt))
        .limit(limit);
    }
    
    return await db.select().from(workflowExecutions)
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
    if (tenantId) {
      return await db
        .select()
        .from(reports)
        .where(and(eq(reports.isActive, true), eq(reports.tenantId, tenantId)))
        .orderBy(desc(reports.createdAt));
    }
    
    return await db
      .select()
      .from(reports)
      .where(eq(reports.isActive, true))
      .orderBy(desc(reports.createdAt));
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
    if (tenantId && workflowId) {
      return await db.select().from(workflowRules)
        .where(and(eq(workflowRules.tenantId, tenantId), eq(workflowRules.workflowId, workflowId)));
    } else if (tenantId) {
      return await db.select().from(workflowRules)
        .where(eq(workflowRules.tenantId, tenantId));
    } else if (workflowId) {
      return await db.select().from(workflowRules)
        .where(eq(workflowRules.workflowId, workflowId));
    }
    
    return await db.select().from(workflowRules);
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
    if (role) {
      return await db.select().from(rolePermissions)
        .where(and(eq(rolePermissions.tenantId, tenantId), eq(rolePermissions.role, role as any)));
    }
    
    return await db.select().from(rolePermissions)
      .where(eq(rolePermissions.tenantId, tenantId));
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
    const rolePerms = await this.getRolePermissions(user.tenantId || '', user.role || 'employee');
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

  // Query Builder operations
  async saveQuery(queryData: any): Promise<SavedQuery> {
    const [saved] = await db
      .insert(savedQueries)
      .values(queryData)
      .returning();
    return saved;
  }

  async getSavedQueries(tenantId: string): Promise<SavedQuery[]> {
    return await db
      .select()
      .from(savedQueries)
      .where(eq(savedQueries.tenantId, tenantId))
      .orderBy(desc(savedQueries.createdAt));
  }

  async getSavedQuery(id: string): Promise<SavedQuery | undefined> {
    const [query] = await db
      .select()
      .from(savedQueries)
      .where(eq(savedQueries.id, id));
    return query;
  }

  async updateSavedQuery(id: string, queryData: any): Promise<SavedQuery> {
    const [updated] = await db
      .update(savedQueries)
      .set({ ...queryData, updatedAt: new Date() })
      .where(eq(savedQueries.id, id))
      .returning();
    return updated;
  }

  async deleteSavedQuery(id: string): Promise<void> {
    await db.delete(savedQueries).where(eq(savedQueries.id, id));
  }

  async executeRawQuery(sqlQuery: string): Promise<any[]> {
    try {
      const result = await db.execute(sql.raw(sqlQuery));
      return Array.isArray(result) ? result : result.rows || [];
    } catch (error) {
      console.error('Raw query execution error:', error);
      throw new Error('Query execution failed');
    }
  }

  async getDatabaseSchema(): Promise<any> {
    // Return available tables and their columns
    return {
      tables: [
        {
          name: 'clients',
          columns: ['id', 'name', 'email', 'currentInvestment', 'riskProfile', 'createdAt']
        },
        {
          name: 'workflows',
          columns: ['id', 'name', 'status', 'executionCount', 'createdAt']
        },
        {
          name: 'reports',
          columns: ['id', 'name', 'createdAt']
        },
        {
          name: 'activities',
          columns: ['id', 'action', 'description', 'createdAt']
        }
      ]
    };
  }

  // Dashboard operations
  async saveDashboard(dashboardData: any): Promise<Dashboard> {
    const [saved] = await db
      .insert(dashboards)
      .values(dashboardData)
      .returning();
    return saved;
  }

  async getDashboards(tenantId: string): Promise<Dashboard[]> {
    return await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.tenantId, tenantId))
      .orderBy(desc(dashboards.createdAt));
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.id, id));
    return dashboard;
  }

  async updateDashboard(id: string, dashboardData: any): Promise<Dashboard> {
    const [updated] = await db
      .update(dashboards)
      .set({ ...dashboardData, updatedAt: new Date() })
      .where(eq(dashboards.id, id))
      .returning();
    return updated;
  }

  async deleteDashboard(id: string): Promise<void> {
    await db.delete(dashboards).where(eq(dashboards.id, id));
  }

  // TOIT Admin implementations
  async getSystemStats(): Promise<any> {
    const [totalTenants] = await db.select({ count: count() }).from(tenants);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalWorkflows] = await db.select({ count: count() }).from(workflows);
    const [totalExecutions] = await db.select({ count: count() }).from(workflowExecutions);
    
    return {
      totalTenants: totalTenants.count,
      totalUsers: totalUsers.count,
      totalWorkflows: totalWorkflows.count,
      totalExecutions: totalExecutions.count,
      monthlyRevenue: 125000, // Mock data for now
      systemUptime: '99.9%',
      activeIntegrations: 15,
      pendingIssues: 3,
      successRate: 97.5
    };
  }

  async getSystemHealth(): Promise<any> {
    return [
      { service: 'database', status: 'healthy', uptime: '99.9%' },
      { service: 'api', status: 'healthy', uptime: '99.8%' },
      { service: 'email', status: 'healthy', uptime: '99.7%' },
      { service: 'workflows', status: 'healthy', uptime: '99.9%' }
    ];
  }

  async getSystemLogs(): Promise<any> {
    return [
      { timestamp: new Date(), level: 'info', message: 'System health check completed', service: 'monitor' },
      { timestamp: new Date(), level: 'info', message: 'User authentication successful', service: 'auth' },
      { timestamp: new Date(), level: 'info', message: 'Workflow executed successfully', service: 'workflow' }
    ];
  }


  async deleteTenant(id: string): Promise<void> {
    // Delete all related data first
    await db.delete(users).where(eq(users.tenantId, id));
    await db.delete(departments).where(eq(departments.tenantId, id));
    await db.delete(permissions).where(eq(permissions.tenantId, id));
    await db.delete(clientCategories).where(eq(clientCategories.tenantId, id));
    await db.delete(clients).where(eq(clients.tenantId, id));
    await db.delete(workflows).where(eq(workflows.tenantId, id));
    await db.delete(integrations).where(eq(integrations.tenantId, id));
    await db.delete(reports).where(eq(reports.tenantId, id));
    await db.delete(activities).where(eq(activities.tenantId, id));
    
    // Finally delete the tenant
    await db.delete(tenants).where(eq(tenants.id, id));
  }


  async updateUser(id: string, userData: Partial<any>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete all related user data
    await db.delete(userDepartments).where(eq(userDepartments.userId, id));
    await db.delete(userPermissions).where(eq(userPermissions.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllDepartments(): Promise<any[]> {
    const allDepartments = await db.select({
      id: departments.id,
      name: departments.name,
      type: departments.type,
      description: departments.description,
      tenantId: departments.tenantId,
      tenantName: tenants.name
    })
    .from(departments)
    .leftJoin(tenants, eq(departments.tenantId, tenants.id))
    .orderBy(tenants.name, departments.name);
    
    return allDepartments;
  }

  async getAllPermissions(): Promise<any[]> {
    const allPermissions = await db.select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
      description: permissions.description,
      tenantId: permissions.tenantId,
      tenantName: tenants.name,
      isGlobal: sql<boolean>`${permissions.tenantId} IS NULL`
    })
    .from(permissions)
    .leftJoin(tenants, eq(permissions.tenantId, tenants.id))
    .orderBy(permissions.name);
    
    return allPermissions;
  }

  async createGlobalPermission(permissionData: any): Promise<Permission> {
    const [permission] = await db
      .insert(permissions)
      .values({
        ...permissionData,
        tenantId: null // Global permission has no tenant
      })
      .returning();
    return permission;
  }

  async getAllWorkflows(): Promise<any[]> {
    const allWorkflows = await db.select({
      id: workflows.id,
      name: workflows.name,
      description: workflows.description,
      status: workflows.status,
      tenantId: workflows.tenantId,
      tenantName: tenants.name,
      createdAt: workflows.createdAt
    })
    .from(workflows)
    .leftJoin(tenants, eq(workflows.tenantId, tenants.id))
    .orderBy(desc(workflows.createdAt));
    
    return allWorkflows;
  }

  async createWorkflowTemplate(templateData: any): Promise<any> {
    // For now, just create a regular workflow marked as template
    const [template] = await db
      .insert(workflows)
      .values({
        ...templateData,
        // isTemplate: true, // Remove this field as it doesn't exist in the schema
        tenantId: null // Global template
      })
      .returning();
    return template;
  }

  async getAllIntegrations(): Promise<any[]> {
    const allIntegrations = await db.select({
      id: integrations.id,
      name: integrations.name,
      type: integrations.type,
      lastStatus: integrations.lastStatus,
      tenantId: integrations.tenantId,
      tenantName: tenants.name,
      createdAt: integrations.createdAt
    })
    .from(integrations)
    .leftJoin(tenants, eq(integrations.tenantId, tenants.id))
    .orderBy(desc(integrations.createdAt));
    
    return allIntegrations;
  }

  async createGlobalIntegration(integrationData: any): Promise<any> {
    const [integration] = await db
      .insert(integrations)
      .values({
        ...integrationData,
        tenantId: null // Global integration
      })
      .returning();
    return integration;
  }

  async getSystemConfig(): Promise<any> {
    return {
      maintenanceMode: false,
      allowSignups: true,
      maxTenantsPerUser: 5,
      defaultPlan: 'basic',
      emailProvider: 'sendgrid',
      storageProvider: 'local'
    };
  }

  async updateSystemConfig(configData: any): Promise<any> {
    // For now, just return the updated config
    // In a real implementation, this would update a config table
    return configData;
  }

  async getTenantAnalytics(): Promise<any> {
    const [tenantsCount] = await db.select({ count: count() }).from(tenants);
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [workflowsCount] = await db.select({ count: count() }).from(workflows);
    
    return {
      totalTenants: tenantsCount.count,
      totalUsers: usersCount.count,
      totalWorkflows: workflowsCount.count,
      averageUsersPerTenant: Math.round(usersCount.count / Math.max(tenantsCount.count, 1)),
      averageWorkflowsPerTenant: Math.round(workflowsCount.count / Math.max(tenantsCount.count, 1))
    };
  }

  async getUsageAnalytics(period: string, tenantId?: string): Promise<any> {
    // Mock implementation - in real scenario would query actual usage data
    return {
      period,
      tenantId,
      apiCalls: 12500,
      workflowExecutions: 450,
      storageUsed: '2.5GB',
      activeUsers: 34
    };
  }

  async getBillingOverview(): Promise<any> {
    const [tenantsCount] = await db.select({ count: count() }).from(tenants);
    
    return {
      totalRevenue: 125000,
      monthlyRecurring: 45000,
      activeTenants: tenantsCount.count,
      churned: 2,
      newSubscriptions: 5
    };
  }

  async updateTenantSubscription(id: string, subscriptionData: any): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({
        subscriptionPlan: subscriptionData.plan,
        subscriptionExpiresAt: subscriptionData.expiresAt
      })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async exportTenantData(): Promise<any> {
    const allTenants = await this.getAllTenants();
    const allUsers = await this.getAllUsers();
    const allDepartments = await this.getAllDepartments();
    
    return {
      tenants: allTenants,
      users: allUsers,
      departments: allDepartments,
      exportedAt: new Date().toISOString()
    };
  }

  async importTenantData(importData: any): Promise<any> {
    // Mock implementation - would validate and import data
    return {
      success: true,
      tenantsImported: importData.tenants?.length || 0,
      usersImported: importData.users?.length || 0,
      departmentsImported: importData.departments?.length || 0
    };
  }

  async getSupportTickets(): Promise<any> {
    return [
      { id: '1', tenantId: 'tenant1', subject: 'Issue with workflow execution', status: 'open', priority: 'high' },
      { id: '2', tenantId: 'tenant2', subject: 'Need help with integration setup', status: 'pending', priority: 'medium' }
    ];
  }

  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    // In a real implementation, this would update system configuration
    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}${message ? ': ' + message : ''}`);
  }
  // MÓDULOS E ATIVAÇÃO - SISTEMA DE MONETIZAÇÃO
  async getModuleByName(name: string): Promise<any> {
    const [module] = await db.select().from(moduleDefinitions).where(eq(moduleDefinitions.name, name));
    return module;
  }

  async createModuleDefinition(moduleData: any): Promise<any> {
    const [module] = await db.insert(moduleDefinitions).values(moduleData).returning();
    return module;
  }

  async updateModuleDefinition(id: string, updateData: any): Promise<any> {
    const [module] = await db.update(moduleDefinitions)
      .set(updateData)
      .where(eq(moduleDefinitions.id, id))
      .returning();
    return module;
  }

  async getAvailableModules(userType: string): Promise<any[]> {
    return await db.select()
      .from(moduleDefinitions)
      .where(eq(moduleDefinitions.isActive, true))
      .orderBy(moduleDefinitions.sortOrder);
  }

  async getTenantModules(tenantId: string): Promise<any[]> {
    return await db.select()
      .from(tenantModules)
      .innerJoin(moduleDefinitions, eq(tenantModules.moduleId, moduleDefinitions.id))
      .where(eq(tenantModules.tenantId, tenantId))
      .orderBy(moduleDefinitions.sortOrder);
  }

  async getTenantModule(tenantId: string, moduleId: string): Promise<any> {
    const [tenantModule] = await db.select()
      .from(tenantModules)
      .where(
        and(
          eq(tenantModules.tenantId, tenantId),
          eq(tenantModules.moduleId, moduleId)
        )
      );
    return tenantModule;
  }

  async createTenantModule(tenantModuleData: any): Promise<any> {
    const [tenantModule] = await db.insert(tenantModules).values(tenantModuleData).returning();
    return tenantModule;
  }

  async updateTenantModule(tenantId: string, moduleId: string, updateData: any): Promise<any> {
    const [tenantModule] = await db.update(tenantModules)
      .set(updateData)
      .where(
        and(
          eq(tenantModules.tenantId, tenantId),
          eq(tenantModules.moduleId, moduleId)
        )
      )
      .returning();
    return tenantModule;
  }

  async getModuleUsageStats(tenantId: string): Promise<any> {
    return {};
  }

  async createModuleUsageTracking(trackingData: any): Promise<any> {
    const [tracking] = await db.insert(moduleUsageTracking).values(trackingData).returning();
    return tracking;
  }

  async getUserModuleAccess(userId: string, moduleId: string): Promise<any> {
    const [userAccess] = await db.select()
      .from(userModuleAccess)
      .where(
        and(
          eq(userModuleAccess.userId, userId),
          eq(userModuleAccess.moduleId, moduleId)
        )
      );
    return userAccess;
  }

  // TASK MANAGEMENT - CORE DA APLICAÇÃO
  async createTaskTemplate(templateData: any): Promise<any> {
    const [template] = await db.insert(taskTemplates).values(templateData).returning();
    return template;
  }

  async getTaskTemplates(tenantId: string, managerId?: string): Promise<any[]> {
    let query = db.select().from(taskTemplates).where(eq(taskTemplates.tenantId, tenantId));
    
    if (managerId) {
      query = query.where(eq(taskTemplates.managerId, managerId));
    }
    
    return await query.orderBy(desc(taskTemplates.createdAt));
  }

  async getTaskTemplate(id: string): Promise<any> {
    const [template] = await db.select().from(taskTemplates).where(eq(taskTemplates.id, id));
    return template;
  }

  async createTaskInstance(instanceData: any): Promise<any> {
    const [instance] = await db.insert(taskInstances).values(instanceData).returning();
    return instance;
  }

  async getTaskInstances(tenantId: string, userId?: string, status?: string): Promise<any[]> {
    let query = db.select().from(taskInstances).where(eq(taskInstances.tenantId, tenantId));

    if (userId) {
      query = query.where(eq(taskInstances.assignedToId, userId));
    }

    if (status) {
      query = query.where(eq(taskInstances.status, status));
    }

    return await query.orderBy(desc(taskInstances.createdAt));
  }

  async getTaskInstance(id: string): Promise<any> {
    const [instance] = await db.select().from(taskInstances).where(eq(taskInstances.id, id));
    return instance;
  }

  async updateTaskInstance(id: string, updateData: any): Promise<any> {
    const [instance] = await db.update(taskInstances)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(taskInstances.id, id))
      .returning();
    return instance;
  }

  async createNotification(notificationData: any): Promise<any> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  // Métodos administrativos funcionais
  async getAllUsers(): Promise<User[]> {
    try {
      const usersData = await db.select({
        id: users.id,
        cpf: users.cpf,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        tenantId: users.tenantId,
        isActive: users.isActive,
        tenant: {
          name: tenants.name
        }
      }).from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id));
      
      return usersData;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      await db.update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async getAllTenants(): Promise<Tenant[]> {
    try {
      const tenantsData = await db.select().from(tenants);
      return tenantsData;
    } catch (error) {
      console.error('Error getting all tenants:', error);
      return [];
    }
  }


  // Versão simplificada para getTaskTemplates que funciona
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    try {
      const templates = await db.select().from(taskTemplates);
      return templates;
    } catch (error) {
      console.error('Error getting task templates:', error);
      return [];
    }
  }

  // QUERY BUILDER E ANALYTICS REAIS
  async executeCustomQuery(sql: string): Promise<any[]> {
    try {
      console.log('Executando SQL personalizado:', sql);
      const results = await db.execute(sql);
      return results.rows || [];
    } catch (error) {
      console.error('Erro ao executar query personalizada:', error);
      throw error;
    }
  }

  async createKPIDashboard(kpiData: any): Promise<any> {
    try {
      // Salvar KPI no banco (usando tabela genérica)
      const [kpi] = await db.insert(kpiDashboards).values(kpiData).returning();
      return kpi;
    } catch (error) {
      console.error('Erro ao criar KPI dashboard:', error);
      throw error;
    }
  }

  async getUserGrowthData(period: string): Promise<any[]> {
    try {
      const sql = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '${period.replace('d', ' days')}'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
      return await this.executeCustomQuery(sql);
    } catch (error) {
      console.error('Erro ao buscar dados de crescimento:', error);
      return [];
    }
  }

  async getWorkflowExecutionData(period: string): Promise<any[]> {
    try {
      const sql = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as executions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM task_instances 
        WHERE created_at >= NOW() - INTERVAL '${period.replace('d', ' days')}'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
      return await this.executeCustomQuery(sql);
    } catch (error) {
      console.error('Erro ao buscar dados de execução:', error);
      return [];
    }
  }

  async getTenantUsageData(period: string): Promise<any[]> {
    try {
      const sql = `
        SELECT 
          t.name as tenant_name,
          COUNT(DISTINCT u.id) as active_users,
          COUNT(DISTINCT ti.id) as workflow_executions,
          AVG(CASE WHEN ti.status = 'completed' THEN 1.0 ELSE 0.0 END) as success_rate
        FROM tenants t
        LEFT JOIN users u ON t.id = u.tenant_id AND u.last_login_at >= NOW() - INTERVAL '${period.replace('d', ' days')}'
        LEFT JOIN task_instances ti ON t.id = ti.tenant_id AND ti.created_at >= NOW() - INTERVAL '${period.replace('d', ' days')}'
        GROUP BY t.id, t.name
        ORDER BY workflow_executions DESC
      `;
      return await this.executeCustomQuery(sql);
    } catch (error) {
      console.error('Erro ao buscar dados de uso por tenant:', error);
      return [];
    }
  }

  async getRevenueData(period: string): Promise<any[]> {
    try {
      // Simulação de dados de receita (implementar com tabela real)
      const sql = `
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(DISTINCT tenant_id) * 99.90 as monthly_revenue
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '${period.replace('d', ' days')}'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `;
      return await this.executeCustomQuery(sql);
    } catch (error) {
      console.error('Erro ao buscar dados de receita:', error);
      return [];
    }
  }

  async generateReport(templateId: string, filters: any): Promise<any[]> {
    try {
      let sql = '';
      
      switch (templateId) {
        case 'user-activity':
          sql = `
            SELECT 
              u.first_name || ' ' || u.last_name as user_name,
              u.email,
              u.role,
              t.name as company,
              u.last_login_at,
              COUNT(ti.id) as workflow_executions
            FROM users u
            LEFT JOIN tenants t ON u.tenant_id = t.id
            LEFT JOIN task_instances ti ON u.id = ti.assigned_to_id
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, t.name, u.last_login_at
            ORDER BY workflow_executions DESC
          `;
          break;
        case 'workflow-performance':
          sql = `
            SELECT 
              tt.name as workflow_name,
              COUNT(ti.id) as total_executions,
              COUNT(CASE WHEN ti.status = 'completed' THEN 1 END) as successful,
              COUNT(CASE WHEN ti.status = 'failed' THEN 1 END) as failed,
              AVG(EXTRACT(EPOCH FROM (ti.updated_at - ti.created_at))) as avg_duration_seconds
            FROM task_templates tt
            LEFT JOIN task_instances ti ON tt.id = ti.template_id
            GROUP BY tt.id, tt.name
            ORDER BY total_executions DESC
          `;
          break;
        default:
          sql = 'SELECT 1 as placeholder';
      }
      
      return await this.executeCustomQuery(sql);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return [];
    }
  }

  convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  async saveFile(fileData: any): Promise<any> {
    try {
      // Salvar informações do arquivo no banco
      const [file] = await db.insert(uploadedFiles).values(fileData).returning();
      return file;
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      throw error;
    }
  }

  async logWebhook(webhookData: any): Promise<any> {
    try {
      const [webhook] = await db.insert(webhookLogs).values(webhookData).returning();
      return webhook;
    } catch (error) {
      console.error('Erro ao registrar webhook:', error);
      throw error;
    }
  }

  async triggerWorkflowsByWebhook(webhookId: string, payload: any): Promise<void> {
    try {
      console.log(`Disparando workflows para webhook ${webhookId}`);
      // Implementar lógica de trigger de workflows
    } catch (error) {
      console.error('Erro ao disparar workflows:', error);
    }
  }

  // MÉTODOS PARA SISTEMA COMPLETO TOIT NEXUS

  // Database Connections
  async createDatabaseConnection(data: any): Promise<any> {
    try {
      const [connection] = await db.insert(databaseConnections).values(data).returning();
      return connection;
    } catch (error) {
      console.error('Erro ao criar conexão de banco:', error);
      throw error;
    }
  }

  async getDatabaseConnections(tenantId: string): Promise<any[]> {
    try {
      return await db.select().from(databaseConnections).where(eq(databaseConnections.tenantId, tenantId));
    } catch (error) {
      console.error('Erro ao buscar conexões de banco:', error);
      return [];
    }
  }

  async testDatabaseConnection(connectionId: string): Promise<boolean> {
    try {
      const [connection] = await db.select().from(databaseConnections).where(eq(databaseConnections.id, connectionId));
      if (!connection) return false;
      
      // Test logic implementado no databaseConnector
      await db.update(databaseConnections)
        .set({ lastTestedAt: new Date() })
        .where(eq(databaseConnections.id, connectionId));
      
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  // API Connections
  async createApiConnection(data: any): Promise<any> {
    try {
      const [connection] = await db.insert(apiConnections).values(data).returning();
      return connection;
    } catch (error) {
      console.error('Erro ao criar conexão API:', error);
      throw error;
    }
  }

  async getApiConnections(tenantId: string): Promise<any[]> {
    try {
      return await db.select().from(apiConnections).where(eq(apiConnections.tenantId, tenantId));
    } catch (error) {
      console.error('Erro ao buscar conexões API:', error);
      return [];
    }
  }

  // Query Builders
  async createQueryBuilder(data: any): Promise<any> {
    try {
      const [query] = await db.insert(queryBuilders).values(data).returning();
      return query;
    } catch (error) {
      console.error('Erro ao criar query builder:', error);
      throw error;
    }
  }

  async getQueryBuilders(tenantId: string): Promise<any[]> {
    try {
      return await db.select().from(queryBuilders).where(eq(queryBuilders.tenantId, tenantId));
    } catch (error) {
      console.error('Erro ao buscar query builders:', error);
      return [];
    }
  }

  async executeQueryBuilder(queryId: string): Promise<any> {
    try {
      const [query] = await db.select().from(queryBuilders).where(eq(queryBuilders.id, queryId));
      if (!query) throw new Error('Query não encontrada');

      // Update last executed
      await db.update(queryBuilders)
        .set({ lastExecutedAt: new Date() })
        .where(eq(queryBuilders.id, queryId));

      return {
        query,
        results: [], // Implemented by connectors
        executedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao executar query builder:', error);
      throw error;
    }
  }

  // KPI Dashboards
  async getKpiDashboards(tenantId: string): Promise<any[]> {
    try {
      return await db.select().from(kpiDashboards).where(eq(kpiDashboards.tenantId, tenantId));
    } catch (error) {
      console.error('Erro ao buscar KPI dashboards:', error);
      return [];
    }
  }

  // Complete Workflows
  async createCompleteWorkflow(data: any): Promise<any> {
    try {
      const [workflow] = await db.insert(completeWorkflows).values(data).returning();
      return workflow;
    } catch (error) {
      console.error('Erro ao criar workflow completo:', error);
      throw error;
    }
  }

  async getCompleteWorkflows(tenantId: string): Promise<any[]> {
    try {
      return await db.select().from(completeWorkflows).where(eq(completeWorkflows.tenantId, tenantId));
    } catch (error) {
      console.error('Erro ao buscar workflows completos:', error);
      return [];
    }
  }

  async executeCompleteWorkflow(workflowId: string): Promise<any> {
    try {
      const [workflow] = await db.select().from(completeWorkflows).where(eq(completeWorkflows.id, workflowId));
      if (!workflow) throw new Error('Workflow não encontrado');

      // Create execution record
      const execution = await db.insert(completeWorkflowExecutions).values({
        id: `exec-${Date.now()}`,
        workflowId,
        tenantId: workflow.tenantId,
        status: 'running',
        triggeredBy: 'manual'
      }).returning();

      // Update workflow execution count
      await db.update(completeWorkflows)
        .set({ 
          executionCount: workflow.executionCount + 1,
          lastExecutedAt: new Date()
        })
        .where(eq(completeWorkflows.id, workflowId));

      return execution[0];
    } catch (error) {
      console.error('Erro ao executar workflow completo:', error);
      throw error;
    }
  }

  // File Management
  async getUploadedFiles(tenantId: string): Promise<any[]> {
    try {
      return await db.select().from(uploadedFiles).where(eq(uploadedFiles.tenantId, tenantId));
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      return [];
    }
  }

  // ========== ADAPTIVE ENGINE OPERATIONS ==========
  
  async getAdaptiveSettings(tenantId: string): Promise<any> {
    console.log(`Buscando configurações adaptativas para tenant: ${tenantId}`);
    return {
      autoKPIGeneration: true,
      autoWorkflowAdjustment: true,
      autoThresholdAdjustment: true,
      adaptationFrequency: 'weekly',
      minDataPoints: 10,
      learningEnabled: true,
      autoAlerts: true
    };
  }

  async updateAdaptiveSettings(tenantId: string, settings: any): Promise<void> {
    console.log(`Atualizando configurações adaptativas para tenant ${tenantId}:`, settings);
    // Em produção, salvaria no banco de dados
  }

  async saveAdaptivePattern(tenantId: string, pattern: any): Promise<void> {
    console.log(`Salvando padrão adaptativo para tenant ${tenantId}:`, pattern);
    // Em produção, salvaria padrões detectados
  }

  async getAdaptivePatterns(tenantId: string): Promise<any[]> {
    console.log(`Buscando padrões adaptativos para tenant: ${tenantId}`);
    return []; // Em produção, retornaria padrões salvos
  }

  // ========== TASK MANAGEMENT + WORKFLOW INTEGRATION ==========
  
  // Criar tarefa automaticamente quando workflow é executado
  async createTaskFromWorkflow(workflowId: string, workflowExecution: any): Promise<TaskInstance> {
    try {
      const workflow = await this.getCompleteWorkflow(workflowId);
      if (!workflow) throw new Error('Workflow não encontrado');

      // Determinar assignee baseado nas regras do workflow
      const assigneeId = this.determineWorkflowAssignee(workflow, workflowExecution);
      
      const taskData: InsertTaskInstance = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: `workflow-${workflowId}`, // Link com workflow
        title: `Execução: ${workflow.name}`,
        description: workflow.description || `Tarefa gerada automaticamente pela execução do workflow ${workflow.name}`,
        assigneeId,
        managerId: workflow.createdBy || assigneeId,
        tenantId: workflow.tenantId,
        priority: this.determineWorkflowPriority(workflow),
        status: 'pending',
        dueAt: this.calculateWorkflowDueDate(workflow),
        metadata: {
          workflowId,
          workflowExecutionId: workflowExecution.id,
          autoGenerated: true,
          workflowTrigger: workflowExecution.triggeredBy
        }
      };

      const task = await this.createTaskInstance(taskData);
      
      // Criar notificação para o assignee
      await this.createNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: assigneeId,
        tenantId: workflow.tenantId,
        type: 'task_assigned',
        title: 'Nova Tarefa de Workflow',
        message: `Você recebeu uma nova tarefa: ${task.title}`,
        metadata: {
          taskId: task.id,
          workflowId,
          priority: task.priority
        }
      });

      console.log(`✅ Tarefa criada automaticamente para workflow ${workflowId}: ${task.id}`);
      return task;
    } catch (error) {
      console.error('Erro ao criar tarefa do workflow:', error);
      throw error;
    }
  }

  // Atualizar status do workflow baseado no progresso das tarefas
  async updateWorkflowFromTaskProgress(taskId: string): Promise<void> {
    try {
      const task = await this.getTaskInstance(taskId);
      if (!task?.metadata?.workflowId) return;

      const workflowId = task.metadata.workflowId;
      
      // Buscar todas as tarefas relacionadas ao workflow
      const workflowTasks = await db.select()
        .from(taskInstances)
        .where(sql`${taskInstances.metadata}->>'workflowId' = ${workflowId}`);

      // Calcular progresso
      const totalTasks = workflowTasks.length;
      const completedTasks = workflowTasks.filter(t => t.status === 'completed').length;
      const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

      // Atualizar workflow com progresso
      await db.update(completeWorkflows)
        .set({
          metadata: sql`jsonb_set(COALESCE(${completeWorkflows.metadata}, '{}'), '{taskProgress}', ${JSON.stringify({
            totalTasks,
            completedTasks,
            progressPercentage,
            lastTaskUpdate: new Date().toISOString()
          })})`,
          updatedAt: new Date()
        })
        .where(eq(completeWorkflows.id, workflowId));

      // Se todas as tarefas foram completadas, marcar workflow como concluído
      if (completedTasks === totalTasks && totalTasks > 0) {
        await db.update(completeWorkflows)
          .set({
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(completeWorkflows.id, workflowId));

        console.log(`🎉 Workflow ${workflowId} marcado como concluído - todas as tarefas finalizadas`);
      }

    } catch (error) {
      console.error('Erro ao atualizar workflow do progresso da tarefa:', error);
    }
  }

  // Determinar quem deve receber a tarefa do workflow
  private determineWorkflowAssignee(workflow: any, execution: any): string {
    // Lógica para determinar assignee baseada nas regras do workflow
    if (workflow.metadata?.defaultAssignee) {
      return workflow.metadata.defaultAssignee;
    }
    
    // Se não há assignee específico, usar o criador do workflow
    return workflow.createdBy || execution.triggeredBy || 'system';
  }

  // Determinar prioridade baseada no workflow
  private determineWorkflowPriority(workflow: any): 'low' | 'medium' | 'high' | 'urgent' {
    if (workflow.metadata?.priority) {
      return workflow.metadata.priority;
    }
    
    // Prioridade baseada no tipo de trigger
    const triggerType = workflow.trigger;
    switch (triggerType) {
      case 'api_error':
      case 'system_alert':
        return 'urgent';
      case 'client_complaint':
      case 'compliance_check':
        return 'high';
      case 'data_import':
      case 'report_generation':
        return 'medium';
      default:
        return 'low';
    }
  }

  // Calcular data de vencimento baseada no workflow
  private calculateWorkflowDueDate(workflow: any): Date {
    const now = new Date();
    
    // Se workflow tem SLA definido, usar ele
    if (workflow.metadata?.slaHours) {
      return new Date(now.getTime() + (workflow.metadata.slaHours * 60 * 60 * 1000));
    }
    
    // Prazo padrão baseado na prioridade
    const defaultHours = {
      urgent: 2,
      high: 24,
      medium: 72,
      low: 168 // 1 semana
    };
    
    const priority = this.determineWorkflowPriority(workflow);
    const hours = defaultHours[priority];
    
    return new Date(now.getTime() + (hours * 60 * 60 * 1000));
  }

  // Buscar tarefas relacionadas a um workflow
  async getWorkflowTasks(workflowId: string): Promise<TaskInstance[]> {
    try {
      return await db.select()
        .from(taskInstances)
        .where(sql`${taskInstances.metadata}->>'workflowId' = ${workflowId}`)
        .orderBy(desc(taskInstances.createdAt));
    } catch (error) {
      console.error('Erro ao buscar tarefas do workflow:', error);
      return [];
    }
  }

  // Buscar workflows relacionados a uma tarefa
  async getTaskWorkflow(taskId: string): Promise<any> {
    try {
      const task = await this.getTaskInstance(taskId);
      if (!task?.metadata?.workflowId) return null;

      return await this.getCompleteWorkflow(task.metadata.workflowId);
    } catch (error) {
      console.error('Erro ao buscar workflow da tarefa:', error);
      return null;
    }
  }
}

export const storage = new DatabaseStorage();
