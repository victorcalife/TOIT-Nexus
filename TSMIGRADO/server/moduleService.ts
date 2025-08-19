import { storage } from './storage';

export interface ModuleCheck {
  hasAccess: boolean;
  reason?: string;
  limitations?: any;
  remainingUsage?: number;
}

export class ModuleService {
  // Verificar se usuário tem acesso a um módulo
  static async checkModuleAccess(userId: string, tenantId: string, moduleName: string): Promise<ModuleCheck> {
    try {
      // Buscar definição do módulo
      const moduleDefinition = await storage.getModuleByName(moduleName);
      if (!moduleDefinition) {
        return { hasAccess: false, reason: 'Módulo não encontrado' };
      }

      // Verificar se módulo está ativo no tenant
      const tenantModule = await storage.getTenantModule(tenantId, moduleDefinition.id);
      if (!tenantModule || !tenantModule.isEnabled) {
        return { 
          hasAccess: false, 
          reason: 'Módulo não está ativo para esta empresa. Entre em contato com o administrador.' 
        };
      }

      // Verificar se está em período de trial expirado
      if (tenantModule.trialEndsAt && new Date() > tenantModule.trialEndsAt && tenantModule.plan === 'trial') {
        return { 
          hasAccess: false, 
          reason: 'Período de avaliação expirado. Faça upgrade do plano para continuar usando.' 
        };
      }

      // Verificar acesso específico do usuário
      const userAccess = await storage.getUserModuleAccess(userId, moduleDefinition.id);
      if (userAccess && !userAccess.hasAccess) {
        return { 
          hasAccess: false, 
          reason: 'Acesso negado para este usuário. Entre em contato com seu gerente.' 
        };
      }

      // Verificar limites de uso
      if (userAccess?.usageLimit) {
        const remainingUsage = userAccess.usageLimit - (userAccess.currentUsage || 0);
        if (remainingUsage <= 0) {
          return { 
            hasAccess: false, 
            reason: 'Limite de uso mensal atingido. Aguarde o próximo ciclo ou faça upgrade.' 
          };
        }
      }

      // Verificar limite de usuários no tenant
      if (tenantModule.maxUsers && tenantModule.currentUsers >= tenantModule.maxUsers) {
        const hasExistingAccess = await storage.getUserModuleAccess(userId, moduleDefinition.id);
        if (!hasExistingAccess) {
          return { 
            hasAccess: false, 
            reason: 'Limite de usuários atingido para este módulo. Faça upgrade do plano.' 
          };
        }
      }

      return { 
        hasAccess: true, 
        limitations: tenantModule.usageLimits,
        remainingUsage: userAccess?.usageLimit ? userAccess.usageLimit - (userAccess.currentUsage || 0) : undefined
      };

    } catch (error) {
      console.error('Erro ao verificar acesso ao módulo:', error);
      return { hasAccess: false, reason: 'Erro interno do sistema' };
    }
  }

  // Registrar uso do módulo
  static async trackModuleUsage(
    userId: string, 
    tenantId: string, 
    moduleName: string, 
    action: string, 
    resourceId?: string,
    usage: number = 1
  ) {
    try {
      const moduleDefinition = await storage.getModuleByName(moduleName);
      if (!moduleDefinition) return;

      // Registrar tracking
      await storage.createModuleUsageTracking({
        tenantId,
        userId,
        moduleId: moduleDefinition.id,
        action,
        resource: resourceId ? resourceId.split('_')[0] : undefined,
        resourceId,
        usage,
        metadata: { timestamp: new Date().toISOString() }
      });

      // Atualizar contadores
      await storage.incrementUserModuleUsage(userId, moduleDefinition.id, usage);
      await storage.incrementTenantModuleUsage(tenantId, moduleDefinition.id, usage);

    } catch (error) {
      console.error('Erro ao rastrear uso do módulo:', error);
    }
  }

  // Inicializar módulos padrão para um tenant
  static async initializeDefaultModules(tenantId: string, userType: 'pessoa_fisica' | 'pequena_empresa' | 'enterprise' = 'pequena_empresa') {
    try {
      const defaultModules = await storage.getDefaultModulesForUserType(userType);
      
      for (const module of defaultModules) {
        await storage.createTenantModule({
          tenantId,
          moduleId: module.id,
          isEnabled: true,
          plan: module.priceModel === 'free' ? 'free' : 'trial',
          maxUsers: this.getDefaultUserLimit(module.name, userType),
          usageLimits: this.getDefaultUsageLimits(module.name, userType),
          trialEndsAt: module.priceModel !== 'free' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined // 7 dias de trial
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar módulos padrão:', error);
    }
  }

  // Obter limites padrão por tipo de usuário
  private static getDefaultUserLimit(moduleName: string, userType: string): number {
    const limits = {
      pessoa_fisica: {
        task_management: 1,
        query_builder: 1,
        crm: 1
      },
      pequena_empresa: {
        task_management: 10,
        query_builder: 5,
        crm: 25
      },
      enterprise: {
        task_management: -1, // ilimitado
        query_builder: -1,
        crm: -1
      }
    };

    return limits[userType as keyof typeof limits]?.[moduleName as keyof typeof limits['pessoa_fisica']] || 5;
  }

  // Obter limites de uso padrão
  private static getDefaultUsageLimits(moduleName: string, userType: string): any {
    const limits = {
      pessoa_fisica: {
        task_management: { max_tasks_per_month: 50, max_templates: 5 },
        query_builder: { max_queries_per_month: 100, max_saved_queries: 10 },
        crm: { max_contacts: 100, max_deals: 25 }
      },
      pequena_empresa: {
        task_management: { max_tasks_per_month: 500, max_templates: 25 },
        query_builder: { max_queries_per_month: 1000, max_saved_queries: 50 },
        crm: { max_contacts: 1000, max_deals: 250 }
      },
      enterprise: {
        task_management: {}, // ilimitado
        query_builder: {},
        crm: {}
      }
    };

    return limits[userType as keyof typeof limits]?.[moduleName as keyof typeof limits['pessoa_fisica']] || {};
  }

  // Verificar se usuário pode executar ação específica
  static async canPerformAction(
    userId: string, 
    tenantId: string, 
    moduleName: string, 
    action: string,
    requiredUsage: number = 1
  ): Promise<ModuleCheck> {
    const access = await this.checkModuleAccess(userId, tenantId, moduleName);
    
    if (!access.hasAccess) {
      return access;
    }

    // Verificar limites específicos da ação
    if (access.limitations) {
      const actionLimit = access.limitations[`max_${action}_per_month`];
      if (actionLimit) {
        const currentUsage = await storage.getModuleActionUsage(userId, moduleName, action);
        if (currentUsage + requiredUsage > actionLimit) {
          return {
            hasAccess: false,
            reason: `Limite mensal de ${action} atingido (${actionLimit}). Faça upgrade do plano.`
          };
        }
      }
    }

    return access;
  }
}

// Middleware para verificar acesso a módulos
export const requireModuleAccess = (moduleName: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const tenantId = req.tenant?.id;

      if (!userId || !tenantId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const access = await ModuleService.checkModuleAccess(userId, tenantId, moduleName);
      
      if (!access.hasAccess) {
        return res.status(403).json({ 
          message: 'Acesso negado ao módulo',
          reason: access.reason,
          module: moduleName
        });
      }

      req.moduleAccess = access;
      next();
    } catch (error) {
      console.error('Erro no middleware de módulo:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

// Middleware para rastrear uso
export const trackModuleUsage = (moduleName: string, action: string) => {
  return async (req: any, res: any, next: any) => {
    // Executar próximo middleware primeiro
    next();

    // Rastrear uso de forma assíncrona
    setImmediate(async () => {
      try {
        const userId = req.user?.id || req.user?.claims?.sub;
        const tenantId = req.tenant?.id;
        const resourceId = req.params?.id || req.body?.id;

        if (userId && tenantId) {
          await ModuleService.trackModuleUsage(userId, tenantId, moduleName, action, resourceId);
        }
      } catch (error) {
        console.error('Erro ao rastrear uso do módulo:', error);
      }
    });
  };
};