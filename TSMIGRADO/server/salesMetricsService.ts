import { db } from './db';
import { users, tenants, accessProfiles, tenantModules } from '@shared/schema';
import { eq, and, gte, lte, isNull, desc, sql, count } from 'drizzle-orm';

export interface SalesMetrics {
  overview: {
    totalRevenue: number;
    totalUsers: number;
    activeTrials: number;
    conversionRate: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
  };
  subscriptions: {
    byPlan: { plan: string; count: number; revenue: number }[];
    byStatus: { status: string; count: number }[];
    recentSignups: any[];
  };
  trials: {
    total: number;
    active: number;
    expired: number;
    conversionRate: number;
    averageTrialDuration: number;
  };
  revenue: {
    monthly: { month: string; revenue: number; users: number }[];
    yearly: number;
    growth: number;
  };
  geography: {
    byRegion: { region: string; users: number; revenue: number }[];
  };
  churn: {
    rate: number;
    reasons: { reason: string; count: number }[];
  };
}

export class SalesMetricsService {
  
  /**
   * Obter métricas completas de vendas
   */
  static async getCompleteSalesMetrics(
    startDate?: Date, 
    endDate?: Date
  ): Promise<SalesMetrics> {
    try {
      const now = new Date();
      const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 11, 1); // Últimos 12 meses
      const defaultEndDate = endDate || now;

      console.log(`📊 Calculando métricas de vendas: ${defaultStartDate.toISOString()} - ${defaultEndDate.toISOString()}`);

      // Buscar todos os usuários no período
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          planType: users.planType,
          trialPlan: users.trialPlan,
          isTrialActive: users.isTrialActive,
          isActive: users.isActive,
          createdAt: users.createdAt,
          trialEndsAt: users.trialEndsAt,
          tenantId: users.tenantId
        })
        .from(users)
        .where(
          and(
            gte(users.createdAt, defaultStartDate),
            lte(users.createdAt, defaultEndDate)
          )
        )
        .orderBy(desc(users.createdAt));

      // Buscar perfis de acesso para cálculo de receita
      const profiles = await db
        .select()
        .from(accessProfiles)
        .where(eq(accessProfiles.is_active, true));

      // Calcular overview
      const overview = await this.calculateOverview(allUsers, profiles, defaultStartDate, defaultEndDate);
      
      // Calcular métricas de assinaturas
      const subscriptions = await this.calculateSubscriptionMetrics(allUsers, profiles);
      
      // Calcular métricas de trials
      const trials = await this.calculateTrialMetrics(allUsers);
      
      // Calcular métricas de receita
      const revenue = await this.calculateRevenueMetrics(allUsers, profiles, defaultStartDate, defaultEndDate);
      
      // Geografia (placeholder - pode ser implementado com dados reais)
      const geography = {
        byRegion: [
          { region: 'São Paulo', users: Math.floor(allUsers.length * 0.4), revenue: overview.totalRevenue * 0.4 },
          { region: 'Rio de Janeiro', users: Math.floor(allUsers.length * 0.2), revenue: overview.totalRevenue * 0.2 },
          { region: 'Minas Gerais', users: Math.floor(allUsers.length * 0.15), revenue: overview.totalRevenue * 0.15 },
          { region: 'Outros', users: Math.floor(allUsers.length * 0.25), revenue: overview.totalRevenue * 0.25 }
        ]
      };
      
      // Churn (placeholder - pode ser implementado com dados históricos)
      const churn = {
        rate: 0.05, // 5% de churn mensal
        reasons: [
          { reason: 'Preço', count: 3 },
          { reason: 'Falta de funcionalidades', count: 2 },
          { reason: 'Complexidade', count: 1 },
          { reason: 'Concorrência', count: 1 }
        ]
      };

      return {
        overview,
        subscriptions,
        trials,
        revenue,
        geography,
        churn
      };

    } catch (error) {
      console.error('❌ Erro ao calcular métricas de vendas:', error);
      throw error;
    }
  }

  /**
   * Calcular overview geral
   */
  private static async calculateOverview(
    allUsers: any[], 
    profiles: any[], 
    startDate: Date, 
    endDate: Date
  ) {
    const now = new Date();
    
    // Usuários ativos (não trials)
    const activeUsers = allUsers.filter(user => 
      user.isActive && 
      !user.isTrialActive && 
      user.role !== 'super_admin' && 
      user.role !== 'toit_admin'
    );
    
    // Trials ativos
    const activeTrials = allUsers.filter(user => 
      user.isTrialActive && 
      user.isActive &&
      user.trialEndsAt && 
      new Date(user.trialEndsAt) > now
    );
    
    // Trials que se converteram
    const convertedTrials = allUsers.filter(user => 
      !user.isTrialActive && 
      user.isActive && 
      user.trialEndsAt // Já teve trial
    );
    
    // Calcular receita total baseada nos planos
    const totalRevenue = activeUsers.reduce((sum, user) => {
      const profile = profiles.find(p => p.slug === user.planType);
      if (profile) {
        // Assumir cobrança mensal por padrão
        return sum + (profile.price_monthly || 0);
      }
      return sum;
    }, 0);
    
    // MRR (Monthly Recurring Revenue)
    const monthlyRecurringRevenue = totalRevenue;
    
    // ARPU (Average Revenue Per User)
    const averageRevenuePerUser = activeUsers.length > 0 ? totalRevenue / activeUsers.length : 0;
    
    // Taxa de conversão
    const totalTrialsEver = allUsers.filter(user => user.trialEndsAt).length;
    const conversionRate = totalTrialsEver > 0 ? (convertedTrials.length / totalTrialsEver) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalUsers: activeUsers.length,
      activeTrials: activeTrials.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100
    };
  }

  /**
   * Calcular métricas de assinaturas
   */
  private static async calculateSubscriptionMetrics(allUsers: any[], profiles: any[]) {
    // Assinaturas por plano
    const planCounts = allUsers
      .filter(user => user.isActive && !user.isTrialActive && user.planType)
      .reduce((acc, user) => {
        const plan = user.planType;
        if (!acc[plan]) {
          acc[plan] = { count: 0, revenue: 0 };
        }
        acc[plan].count++;
        
        const profile = profiles.find(p => p.slug === plan);
        if (profile) {
          acc[plan].revenue += profile.price_monthly || 0;
        }
        
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

    const byPlan = Object.entries(planCounts).map(([plan, data]) => ({
      plan: plan.toUpperCase(),
      count: data.count,
      revenue: Math.round(data.revenue * 100) / 100
    }));

    // Status das contas
    const byStatus = [
      { 
        status: 'Ativas', 
        count: allUsers.filter(user => user.isActive && !user.isTrialActive).length 
      },
      { 
        status: 'Trial', 
        count: allUsers.filter(user => user.isTrialActive && user.isActive).length 
      },
      { 
        status: 'Inativas', 
        count: allUsers.filter(user => !user.isActive).length 
      }
    ];

    // Usuários recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSignups = allUsers
      .filter(user => new Date(user.createdAt) >= sevenDaysAgo)
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        plan: user.planType || user.trialPlan || 'N/A',
        isTrialActive: user.isTrialActive,
        createdAt: user.createdAt
      }));

    return {
      byPlan,
      byStatus,
      recentSignups
    };
  }

  /**
   * Calcular métricas de trials
   */
  private static async calculateTrialMetrics(allUsers: any[]) {
    const now = new Date();
    
    const trialsEver = allUsers.filter(user => user.trialEndsAt);
    const activeTrials = trialsEver.filter(user => 
      user.isTrialActive && 
      user.isActive && 
      new Date(user.trialEndsAt) > now
    );
    const expiredTrials = trialsEver.filter(user => 
      new Date(user.trialEndsAt) <= now
    );
    const convertedTrials = expiredTrials.filter(user => 
      user.isActive && !user.isTrialActive
    );
    
    // Taxa de conversão de trials
    const conversionRate = expiredTrials.length > 0 ? 
      (convertedTrials.length / expiredTrials.length) * 100 : 0;
    
    // Duração média de trial (assumindo 7 dias padrão)
    const averageTrialDuration = 7; // Pode ser calculado com dados reais

    return {
      total: trialsEver.length,
      active: activeTrials.length,
      expired: expiredTrials.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTrialDuration
    };
  }

  /**
   * Calcular métricas de receita
   */
  private static async calculateRevenueMetrics(
    allUsers: any[], 
    profiles: any[], 
    startDate: Date, 
    endDate: Date
  ) {
    // Receita mensal (últimos 12 meses)
    const monthly = [];
    const currentDate = new Date(endDate);
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthUsers = allUsers.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= monthStart && 
               createdAt <= monthEnd && 
               user.isActive && 
               !user.isTrialActive;
      });

      const monthRevenue = monthUsers.reduce((sum, user) => {
        const profile = profiles.find(p => p.slug === user.planType);
        return sum + (profile?.price_monthly || 0);
      }, 0);

      monthly.push({
        month: monthStart.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' }),
        revenue: Math.round(monthRevenue * 100) / 100,
        users: monthUsers.length
      });
    }

    // Receita anual
    const yearly = monthly.reduce((sum, month) => sum + month.revenue, 0);
    
    // Crescimento (comparar último mês com anterior)
    const lastMonth = monthly[monthly.length - 1]?.revenue || 0;
    const previousMonth = monthly[monthly.length - 2]?.revenue || 0;
    const growth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      monthly,
      yearly: Math.round(yearly * 100) / 100,
      growth: Math.round(growth * 100) / 100
    };
  }

  /**
   * Obter métricas em tempo real (resumidas)
   */
  static async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    activeTrials: number;
    todaySignups: number;
    monthlyRevenue: number;
  }> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Usuários ativos
      const activeUsersResult = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.isActive, true),
            eq(users.isTrialActive, false)
          )
        );

      // Trials ativos
      const activeTrialsResult = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.isActive, true),
            eq(users.isTrialActive, true),
            gte(users.trialEndsAt, now)
          )
        );

      // Signups hoje
      const todaySignupsResult = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, todayStart));

      // Receita mensal estimada (placeholder)
      const monthlyRevenue = (activeUsersResult[0]?.count || 0) * 89; // Assumir plano médio de R$ 89

      return {
        activeUsers: activeUsersResult[0]?.count || 0,
        activeTrials: activeTrialsResult[0]?.count || 0,
        todaySignups: todaySignupsResult[0]?.count || 0,
        monthlyRevenue
      };

    } catch (error) {
      console.error('❌ Erro ao obter métricas em tempo real:', error);
      return {
        activeUsers: 0,
        activeTrials: 0,
        todaySignups: 0,
        monthlyRevenue: 0
      };
    }
  }
}

export default SalesMetricsService;