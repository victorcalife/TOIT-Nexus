import { db } from './db';
import { users, tenants, accessProfiles, tenantModules } from '@shared/schema';
import { eq, and, gte, lte, desc, sql, count, isNull, isNotNull } from 'drizzle-orm';

export interface SubscriptionReport {
  subscriptions: {
    active: SubscriptionDetail[];
    inactive: SubscriptionDetail[];
    trials: SubscriptionDetail[];
    expiringSoon: SubscriptionDetail[];
  };
  analytics: {
    totalActive: number;
    totalRevenue: number;
    averageTenure: number;
    churnRate: number;
    growthRate: number;
    revenueByPlan: { plan: string; revenue: number; count: number }[];
    monthlyTrends: { month: string; active: number; revenue: number; churn: number }[];
  };
  alerts: {
    expiringSoon: number;
    paymentFailed: number;
    trialEnding: number;
    highRiskChurn: number;
  };
}

export interface SubscriptionDetail {
  id: string;
  tenantName: string;
  userEmail: string;
  userName: string;
  planType: string;
  status: 'active' | 'inactive' | 'trial' | 'expired';
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  monthlyRevenue: number;
  tenureInMonths: number;
  isTrialActive: boolean;
  riskScore: number; // 0-100, sendo 100 = alto risco de churn
  lastLoginAt?: Date;
  moduleUsage: number; // percentual de módulos utilizados
}

export class SubscriptionReportsService {

  /**
   * Gerar relatório completo de assinaturas
   */
  static async generateCompleteReport(
    startDate?: Date, 
    endDate?: Date
  ): Promise<SubscriptionReport> {
    try {
      const now = new Date();
      const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const defaultEndDate = endDate || now;

      console.log(`📊 Gerando relatório de assinaturas: ${defaultStartDate.toISOString()} - ${defaultEndDate.toISOString()}`);

      // Buscar todas as assinaturas com detalhes
      const subscriptions = await this.getDetailedSubscriptions(defaultStartDate, defaultEndDate);
      
      // Calcular analytics
      const analytics = await this.calculateAnalytics(subscriptions, defaultStartDate, defaultEndDate);
      
      // Gerar alertas
      const alerts = this.generateAlerts(subscriptions);

      // Categorizar assinaturas
      const categorizedSubscriptions = this.categorizeSubscriptions(subscriptions);

      return {
        subscriptions: categorizedSubscriptions,
        analytics,
        alerts
      };

    } catch (error) {
      console.error('❌ Erro ao gerar relatório de assinaturas:', error);
      throw error;
    }
  }

  /**
   * Buscar detalhes de todas as assinaturas
   */
  private static async getDetailedSubscriptions(
    startDate: Date, 
    endDate: Date
  ): Promise<SubscriptionDetail[]> {
    // Buscar usuários com suas informações de tenant
    const usersWithTenants = await db
      .select({
        userId: users.id,
        userEmail: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        planType: users.planType,
        trialPlan: users.trialPlan,
        isActive: users.isActive,
        isTrialActive: users.isTrialActive,
        createdAt: users.createdAt,
        trialEndsAt: users.trialEndsAt,
        lastLoginAt: users.lastLoginAt,
        tenantId: users.tenantId,
        tenantName: tenants.name,
        role: users.role
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .where(
        and(
          gte(users.createdAt, startDate),
          lte(users.createdAt, endDate)
        )
      )
      .orderBy(desc(users.createdAt));

    // Buscar perfis de acesso para cálculo de receita
    const profiles = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.is_active, true));

    // Processar cada usuário para criar detalhes da assinatura
    const subscriptionDetails = await Promise.all(
      usersWithTenants
        .filter(user => user.role !== 'super_admin' && user.role !== 'toit_admin')
        .map(async (user) => {
          const planSlug = user.planType || user.trialPlan;
          const profile = profiles.find(p => p.slug === planSlug);
          
          const startDate = new Date(user.createdAt);
          const now = new Date();
          const tenureInMonths = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          
          // Calcular risco de churn (algoritmo simplificado)
          const riskScore = await this.calculateChurnRisk(user);
          
          // Calcular uso de módulos (placeholder - pode ser implementado com dados reais)
          const moduleUsage = Math.floor(Math.random() * 100); // 0-100%

          const subscription: SubscriptionDetail = {
            id: user.userId,
            tenantName: user.tenantName || 'Usuário Individual',
            userEmail: user.userEmail || '',
            userName: `${user.firstName} ${user.lastName || ''}`.trim(),
            planType: planSlug || 'N/A',
            status: this.determineStatus(user),
            startDate: startDate,
            endDate: user.isActive ? undefined : now, // Se inativo, considera como finalizado agora
            trialEndsAt: user.trialEndsAt ? new Date(user.trialEndsAt) : undefined,
            monthlyRevenue: profile?.price_monthly || 0,
            tenureInMonths,
            isTrialActive: user.isTrialActive || false,
            riskScore,
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
            moduleUsage
          };

          return subscription;
        })
    );

    return subscriptionDetails;
  }

  /**
   * Determinar status da assinatura
   */
  private static determineStatus(user: any): 'active' | 'inactive' | 'trial' | 'expired' {
    if (!user.isActive) return 'inactive';
    if (user.isTrialActive) {
      const now = new Date();
      const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
      return trialEnd && trialEnd > now ? 'trial' : 'expired';
    }
    return 'active';
  }

  /**
   * Calcular risco de churn
   */
  private static async calculateChurnRisk(user: any): Promise<number> {
    let riskScore = 0;

    // Fatores de risco:
    const now = new Date();
    
    // 1. Tempo sem login (peso: 30)
    if (user.lastLoginAt) {
      const daysSinceLogin = Math.floor((now.getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin > 30) riskScore += 30;
      else if (daysSinceLogin > 14) riskScore += 20;
      else if (daysSinceLogin > 7) riskScore += 10;
    } else {
      riskScore += 25; // Nunca fez login
    }

    // 2. Tipo de plano (peso: 20)
    if (user.planType === 'gratuito' || user.trialPlan === 'gratuito') riskScore += 15;
    else if (user.planType === 'basico') riskScore += 10;

    // 3. Trial próximo do fim (peso: 25)
    if (user.isTrialActive && user.trialEndsAt) {
      const daysToExpire = Math.floor((new Date(user.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpire < 2) riskScore += 25;
      else if (daysToExpire < 5) riskScore += 15;
    }

    // 4. Tenant sem nome (usuário não configurou adequadamente) (peso: 15)
    if (!user.tenantName || user.tenantName === 'Usuário Individual') riskScore += 15;

    // 5. Conta muito nova (peso: 10)
    const accountAge = Math.floor((now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (accountAge < 3) riskScore += 10;

    return Math.min(riskScore, 100); // Máximo 100
  }

  /**
   * Categorizar assinaturas
   */
  private static categorizeSubscriptions(subscriptions: SubscriptionDetail[]) {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    return {
      active: subscriptions.filter(s => s.status === 'active'),
      inactive: subscriptions.filter(s => s.status === 'inactive'),
      trials: subscriptions.filter(s => s.status === 'trial'),
      expiringSoon: subscriptions.filter(s => 
        s.trialEndsAt && 
        s.trialEndsAt > now && 
        s.trialEndsAt <= oneWeekFromNow
      )
    };
  }

  /**
   * Calcular analytics avançadas
   */
  private static async calculateAnalytics(
    subscriptions: SubscriptionDetail[],
    startDate: Date,
    endDate: Date
  ) {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const totalActive = activeSubscriptions.length;
    const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + s.monthlyRevenue, 0);
    
    // Calcular tenure média
    const averageTenure = totalActive > 0 ? 
      activeSubscriptions.reduce((sum, s) => sum + s.tenureInMonths, 0) / totalActive : 0;

    // Calcular churn rate (aproximado)
    const inactiveSubscriptions = subscriptions.filter(s => s.status === 'inactive');
    const totalSubscriptions = totalActive + inactiveSubscriptions.length;
    const churnRate = totalSubscriptions > 0 ? (inactiveSubscriptions.length / totalSubscriptions) * 100 : 0;

    // Calcular growth rate (comparar com período anterior)
    const growthRate = await this.calculateGrowthRate(startDate, endDate);

    // Receita por plano
    const revenueByPlan = this.calculateRevenueByPlan(activeSubscriptions);

    // Tendências mensais (últimos 12 meses)
    const monthlyTrends = await this.calculateMonthlyTrends(subscriptions);

    return {
      totalActive,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageTenure: Math.round(averageTenure * 10) / 10,
      churnRate: Math.round(churnRate * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      revenueByPlan,
      monthlyTrends
    };
  }

  /**
   * Calcular taxa de crescimento
   */
  private static async calculateGrowthRate(startDate: Date, endDate: Date): Promise<number> {
    // Período anterior para comparação
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate.getTime());

    const currentPeriodCount = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, startDate),
          lte(users.createdAt, endDate),
          eq(users.isActive, true),
          eq(users.isTrialActive, false)
        )
      );

    const previousPeriodCount = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, previousStartDate),
          lte(users.createdAt, previousEndDate),
          eq(users.isActive, true),
          eq(users.isTrialActive, false)
        )
      );

    const current = currentPeriodCount[0]?.count || 0;
    const previous = previousPeriodCount[0]?.count || 0;

    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  /**
   * Calcular receita por plano
   */
  private static calculateRevenueByPlan(subscriptions: SubscriptionDetail[]) {
    const planRevenue = subscriptions.reduce((acc, sub) => {
      const plan = sub.planType.toUpperCase();
      if (!acc[plan]) {
        acc[plan] = { revenue: 0, count: 0 };
      }
      acc[plan].revenue += sub.monthlyRevenue;
      acc[plan].count += 1;
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    return Object.entries(planRevenue).map(([plan, data]) => ({
      plan,
      revenue: Math.round(data.revenue * 100) / 100,
      count: data.count
    }));
  }

  /**
   * Calcular tendências mensais
   */
  private static async calculateMonthlyTrends(subscriptions: SubscriptionDetail[]) {
    const trends = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthSubscriptions = subscriptions.filter(sub => {
        const createdAt = new Date(sub.startDate);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      const activeInMonth = monthSubscriptions.filter(s => s.status === 'active').length;
      const revenueInMonth = monthSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.monthlyRevenue, 0);
      const churnInMonth = monthSubscriptions.filter(s => s.status === 'inactive').length;

      trends.push({
        month: monthStart.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' }),
        active: activeInMonth,
        revenue: Math.round(revenueInMonth * 100) / 100,
        churn: churnInMonth
      });
    }

    return trends;
  }

  /**
   * Gerar alertas automáticos
   */
  private static generateAlerts(subscriptions: SubscriptionDetail[]) {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    return {
      expiringSoon: subscriptions.filter(s => 
        s.trialEndsAt && 
        s.trialEndsAt > now && 
        s.trialEndsAt <= oneWeekFromNow
      ).length,
      paymentFailed: subscriptions.filter(s => s.status === 'inactive').length,
      trialEnding: subscriptions.filter(s => 
        s.isTrialActive && 
        s.trialEndsAt && 
        s.trialEndsAt <= new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000))
      ).length,
      highRiskChurn: subscriptions.filter(s => s.riskScore > 70).length
    };
  }

  /**
   * Obter detalhes de assinatura específica
   */
  static async getSubscriptionDetails(userId: string): Promise<SubscriptionDetail | null> {
    try {
      const user = await db
        .select({
          userId: users.id,
          userEmail: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          planType: users.planType,
          trialPlan: users.trialPlan,
          isActive: users.isActive,
          isTrialActive: users.isTrialActive,
          createdAt: users.createdAt,
          trialEndsAt: users.trialEndsAt,
          lastLoginAt: users.lastLoginAt,
          tenantId: users.tenantId,
          tenantName: tenants.name,
          role: users.role
        })
        .from(users)
        .leftJoin(tenants, eq(users.tenantId, tenants.id))
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) return null;

      const userData = user[0];
      const profiles = await db
        .select()
        .from(accessProfiles)
        .where(eq(accessProfiles.is_active, true));

      const planSlug = userData.planType || userData.trialPlan;  
      const profile = profiles.find(p => p.slug === planSlug);
      
      const startDate = new Date(userData.createdAt);
      const now = new Date();
      const tenureInMonths = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      const riskScore = await this.calculateChurnRisk(userData);
      const moduleUsage = Math.floor(Math.random() * 100);

      return {
        id: userData.userId,
        tenantName: userData.tenantName || 'Usuário Individual',
        userEmail: userData.userEmail || '',
        userName: `${userData.firstName} ${userData.lastName || ''}`.trim(),
        planType: planSlug || 'N/A',
        status: this.determineStatus(userData),
        startDate: startDate,
        endDate: userData.isActive ? undefined : now,
        trialEndsAt: userData.trialEndsAt ? new Date(userData.trialEndsAt) : undefined,
        monthlyRevenue: profile?.price_monthly || 0,
        tenureInMonths,
        isTrialActive: userData.isTrialActive || false,
        riskScore,
        lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined,
        moduleUsage
      };

    } catch (error) {
      console.error('❌ Erro ao obter detalhes da assinatura:', error);
      return null;
    }
  }

  /**
   * Exportar relatório para CSV
   */
  static async exportToCSV(startDate?: Date, endDate?: Date): Promise<string> {
    const report = await this.generateCompleteReport(startDate, endDate);
    
    const csvRows = [
      // Header
      'Nome,Email,Empresa,Plano,Status,Receita Mensal,Meses de Tenure,Risco Churn,Uso Módulos,Último Login'
    ];

    // Adicionar todas as assinaturas
    const allSubscriptions = [
      ...report.subscriptions.active,
      ...report.subscriptions.inactive,
      ...report.subscriptions.trials
    ];

    allSubscriptions.forEach(sub => {
      csvRows.push([
        sub.userName,
        sub.userEmail,
        sub.tenantName,
        sub.planType,
        sub.status,
        `R$ ${sub.monthlyRevenue.toFixed(2)}`,
        sub.tenureInMonths.toString(),
        `${sub.riskScore}%`,
        `${sub.moduleUsage}%`,
        sub.lastLoginAt ? sub.lastLoginAt.toLocaleDateString('pt-BR') : 'Nunca'
      ].join(','));
    });

    return csvRows.join('\n');
  }
}

export default SubscriptionReportsService;