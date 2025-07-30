import {
  users,
  clientCategories,
  clients,
  integrations,
  workflows,
  workflowExecutions,
  reports,
  activities,
  type User,
  type UpsertUser,
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
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client Category operations
  getClientCategories(): Promise<ClientCategory[]>;
  getClientCategory(id: string): Promise<ClientCategory | undefined>;
  createClientCategory(category: InsertClientCategory): Promise<ClientCategory>;
  updateClientCategory(id: string, category: Partial<InsertClientCategory>): Promise<ClientCategory>;
  deleteClientCategory(id: string): Promise<void>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientsByCategory(categoryId: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Integration operations
  getIntegrations(): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration>;
  deleteIntegration(id: string): Promise<void>;
  updateIntegrationStatus(id: string, status: string): Promise<void>;
  
  // Workflow operations
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  getWorkflowsByCategory(categoryId: string): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;
  updateWorkflowExecution(workflowId: string): Promise<void>;
  
  // Workflow execution operations
  getWorkflowExecutions(workflowId?: string, limit?: number): Promise<WorkflowExecution[]>;
  createWorkflowExecution(execution: Omit<WorkflowExecution, 'id' | 'executedAt'>): Promise<WorkflowExecution>;
  
  // Report operations
  getReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: string): Promise<void>;
  
  // Activity operations
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalClients: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Client Category operations
  async getClientCategories(): Promise<ClientCategory[]> {
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

  // Client operations
  async getClients(): Promise<Client[]> {
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

  // Integration operations
  async getIntegrations(): Promise<Integration[]> {
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

  // Workflow operations
  async getWorkflows(): Promise<Workflow[]> {
    return await db
      .select()
      .from(workflows)
      .orderBy(desc(workflows.createdAt));
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

  // Workflow execution operations
  async getWorkflowExecutions(workflowId?: string, limit = 50): Promise<WorkflowExecution[]> {
    let query = db.select().from(workflowExecutions);
    
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

  // Report operations
  async getReports(): Promise<Report[]> {
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

  // Activity operations
  async getRecentActivities(limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
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
}

export const storage = new DatabaseStorage();
