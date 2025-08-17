import { trialService } from './trialService.js';
import { fileProcessingService } from './fileProcessingService.js';

/**
 * Sistema de cron jobs para tarefas automáticas
 * Railway não suporta cron nativo, então usamos intervals
 */
class CronJobService {
  private intervals: NodeJS.Timeout[] = [];

  constructor() {
    this.startJobs();
  }

  /**
   * Iniciar todos os jobs automáticos
   */
  startJobs() {
    console.log('🔄 Iniciando cron jobs automáticos...');

    // Job 1: Limpar trials expirados a cada 1 hora
    const trialCleanupJob = setInterval(async () => {
      try {
        console.log('🧹 Executando limpeza de trials expirados...');
        const cleanedCount = await trialService.deactivateExpiredTrials();
        if (cleanedCount > 0) {
          console.log(`✅ ${cleanedCount} trials expirados foram desativados`);
        }
      } catch (error) {
        console.error('❌ Erro no job de limpeza de trials:', error);
      }
    }, 60 * 60 * 1000); // 1 hora

    // Job 2: Lembrete de trial expirando (1 dia antes)
    const trialReminderJob = setInterval(async () => {
      try {
        console.log('📧 Verificando trials que expiram em 1 dia...');
        // TODO: Implementar lembrete de expiração
        // await trialService.sendExpirationReminders();
      } catch (error) {
        console.error('❌ Erro no job de lembretes:', error);
      }
    }, 12 * 60 * 60 * 1000); // 12 horas

    // Job 3: Limpeza de arquivos antigos (diário)
    const fileCleanupJob = setInterval(async () => {
      try {
        console.log('🗂️ Executando limpeza de arquivos antigos...');
        const cleanedCount = await fileProcessingService.cleanupOldFiles(30); // 30 dias
        if (cleanedCount > 0) {
          console.log(`✅ ${cleanedCount} arquivos antigos foram limpos`);
        }
      } catch (error) {
        console.error('❌ Erro no job de limpeza de arquivos:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 horas

    // Job 4: Backup de dados críticos (semanal)
    const backupJob = setInterval(async () => {
      try {
        console.log('💾 Executando backup de dados críticos...');
        // TODO: Implementar backup automático
        // await backupService.createWeeklyBackup();
      } catch (error) {
        console.error('❌ Erro no job de backup:', error);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Salvar referencias para poder parar depois
    this.intervals.push(trialCleanupJob, trialReminderJob, fileCleanupJob, backupJob);

    console.log('✅ Cron jobs iniciados com sucesso!');
    console.log('  - Limpeza de trials: a cada 1 hora');
    console.log('  - Lembretes de trial: a cada 12 horas');
    console.log('  - Limpeza de arquivos: a cada 24 horas');
    console.log('  - Backup de dados: a cada 7 dias');
  }

  /**
   * Parar todos os jobs (usado no shutdown)
   */
  stopJobs() {
    console.log('🛑 Parando cron jobs...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('✅ Cron jobs parados');
  }

  /**
   * Executar job específico manualmente (para testes)
   */
  async runJob(jobName: string) {
    switch (jobName) {
      case 'trial-cleanup':
        console.log('🧹 Executando limpeza manual de trials...');
        return await trialService.deactivateExpiredTrials();
      
      case 'trial-reminders':
        console.log('📧 Executando lembretes manuais...');
        // TODO: Implementar
        return 0;
      
      case 'file-cleanup':
        console.log('🗂️ Executando limpeza manual de arquivos...');
        return await fileProcessingService.cleanupOldFiles(30);
      
      default:
        throw new Error(`Job desconhecido: ${jobName}`);
    }
  }

  /**
   * Status dos jobs ativos
   */
  getStatus() {
    return {
      activeJobs: this.intervals.length,
      jobs: [
        {
          name: 'trial-cleanup',
          description: 'Limpar trials expirados',
          interval: '1 hora',
          active: this.intervals.length > 0
        },
        {
          name: 'trial-reminders',
          description: 'Enviar lembretes de expiração',
          interval: '12 horas',
          active: this.intervals.length > 1
        },
        {
          name: 'file-cleanup',
          description: 'Limpeza de arquivos antigos',
          interval: '24 horas',
          active: this.intervals.length > 2
        },
        {
          name: 'backup',
          description: 'Backup de dados críticos',
          interval: '7 dias',
          active: this.intervals.length > 3
        }
      ]
    };
  }
}

// Instância singleton
export const cronJobService = new CronJobService();

// Parar jobs gracefully no shutdown
process.on('SIGINT', () => {
  console.log('📨 Recebido SIGINT, parando cron jobs...');
  cronJobService.stopJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📨 Recebido SIGTERM, parando cron jobs...');
  cronJobService.stopJobs();
  process.exit(0);
});