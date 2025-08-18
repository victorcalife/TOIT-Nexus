/**
 * PÁGINA DE BACKUP E DISASTER RECOVERY
 * Sistema completo de backup e recuperação de desastres
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Shield,
  Database,
  HardDrive,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Archive,
  Restore,
  Settings,
  Play,
  Pause,
  Square,
  Calendar,
  FileText,
  Server,
  Globe,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const BACKUP_TYPES = {
  FULL: 'full',
  INCREMENTAL: 'incremental',
  DIFFERENTIAL: 'differential'
};

const BACKUP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-yellow-100 text-yellow-800'
};

const STATUS_ICONS = {
  pending: Clock,
  running: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: AlertTriangle
};

const BACKUP_COMPONENTS = [
  {
    id: 'database',
    name: 'Banco de Dados',
    icon: Database,
    description: 'PostgreSQL principal e réplicas',
    size: '2.5 GB',
    lastBackup: '2025-01-18T20:00:00Z',
    frequency: 'Diário',
    retention: '30 dias'
  },
  {
    id: 'files',
    name: 'Arquivos do Sistema',
    icon: HardDrive,
    description: 'Uploads, logs e configurações',
    size: '850 MB',
    lastBackup: '2025-01-18T19:30:00Z',
    frequency: 'A cada 6h',
    retention: '7 dias'
  },
  {
    id: 'application',
    name: 'Código da Aplicação',
    icon: FileText,
    description: 'Frontend e backend',
    size: '120 MB',
    lastBackup: '2025-01-18T18:00:00Z',
    frequency: 'A cada deploy',
    retention: '90 dias'
  },
  {
    id: 'quantum_data',
    name: 'Dados Quânticos',
    icon: Zap,
    description: 'Resultados e configurações quânticas',
    size: '45 MB',
    lastBackup: '2025-01-18T17:45:00Z',
    frequency: 'Diário',
    retention: '365 dias'
  }
];

export default function BackupRecoveryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupFilter, setBackupFilter] = useState('all');
  const [recoveryMode, setRecoveryMode] = useState(false);

  // Query para status de backup
  const { data: backupStatusData, isLoading } = useQuery({
    queryKey: ['backup-status'],
    queryFn: async () => {
      const response = await fetch('/api/backup/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar status de backup');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  // Query para histórico de backups
  const { data: backupHistoryData } = useQuery({
    queryKey: ['backup-history'],
    queryFn: async () => {
      const response = await fetch('/api/backup/history?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico de backup');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para configurações de backup
  const { data: backupConfigData } = useQuery({
    queryKey: ['backup-config'],
    queryFn: async () => {
      const response = await fetch('/api/backup/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações de backup');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para iniciar backup manual
  const startBackupMutation = useMutation({
    mutationFn: async (backupConfig) => {
      const response = await fetch('/api/backup/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(backupConfig)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao iniciar backup');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Backup iniciado',
        description: `Backup ${data.backupId} iniciado com sucesso.`
      });
      queryClient.invalidateQueries(['backup-status']);
      queryClient.invalidateQueries(['backup-history']);
    },
    onError: (error) => {
      toast({
        title: 'Erro no backup',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para restaurar backup
  const restoreBackupMutation = useMutation({
    mutationFn: async (restoreConfig) => {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(restoreConfig)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao restaurar backup');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Restauração iniciada',
        description: `Processo de restauração ${data.restoreId} iniciado.`
      });
      queryClient.invalidateQueries(['backup-status']);
    },
    onError: (error) => {
      toast({
        title: 'Erro na restauração',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para testar disaster recovery
  const testDisasterRecoveryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup/test-dr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no teste de DR');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Teste de DR iniciado',
        description: `Teste de disaster recovery ${data.testId} iniciado.`
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro no teste de DR',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const backupStatus = backupStatusData?.data || {};
  const backupHistory = backupHistoryData?.data?.backups || [];
  const backupConfig = backupConfigData?.data || {};

  const getStatusIcon = (status) => {
    const Icon = STATUS_ICONS[status];
    return <Icon className={`w-5 h-5 ${
      status === 'completed' ? 'text-green-600' :
      status === 'failed' ? 'text-red-600' :
      status === 'running' ? 'text-blue-600 animate-spin' : 'text-gray-600'
    }`} />;
  };

  const getBackupHealth = () => {
    const recentBackups = backupHistory.filter(backup => {
      const backupDate = new Date(backup.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return backupDate > oneDayAgo;
    });

    const successfulBackups = recentBackups.filter(backup => backup.status === 'completed');
    const successRate = recentBackups.length > 0 ? (successfulBackups.length / recentBackups.length) * 100 : 100;

    if (successRate >= 95) return 'healthy';
    if (successRate >= 80) return 'warning';
    return 'critical';
  };

  const filteredBackups = backupHistory.filter(backup => {
    if (backupFilter === 'all') return true;
    return backup.type === backupFilter;
  });

  const backupHealth = getBackupHealth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Backup & Disaster Recovery
          </h1>
          <p className="text-gray-600">
            Sistema de backup e recuperação de desastres
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => startBackupMutation.mutate({ type: 'full', components: ['database', 'files'] })}
            disabled={startBackupMutation.isLoading}
            className="flex items-center space-x-2"
          >
            {startBackupMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
            <span>Backup Manual</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => testDisasterRecoveryMutation.mutate()}
            disabled={testDisasterRecoveryMutation.isLoading}
            className="flex items-center space-x-2"
          >
            {testDisasterRecoveryMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span>Testar DR</span>
          </Button>
        </div>
      </div>

      {/* Backup Health Status */}
      <Card className={`mb-8 border-2 ${
        backupHealth === 'healthy' ? 'border-green-200 bg-green-50' :
        backupHealth === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${
                backupHealth === 'healthy' ? 'bg-green-100' :
                backupHealth === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-8 h-8 ${
                  backupHealth === 'healthy' ? 'text-green-600' :
                  backupHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Status de Backup: {
                    backupHealth === 'healthy' ? 'Saudável' :
                    backupHealth === 'warning' ? 'Atenção' : 'Crítico'
                  }
                </h3>
                <p className={`${
                  backupHealth === 'healthy' ? 'text-green-700' :
                  backupHealth === 'warning' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {backupHealth === 'healthy' ? 'Todos os backups funcionando normalmente' :
                   backupHealth === 'warning' ? 'Alguns backups requerem atenção' :
                   'Problemas críticos nos backups'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Último Backup</p>
                <p className="text-lg font-bold text-blue-600">
                  {backupStatus.lastBackup ? 
                    new Date(backupStatus.lastBackup).toLocaleDateString('pt-BR') : 
                    'Nunca'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Próximo Backup</p>
                <p className="text-lg font-bold text-green-600">
                  {backupStatus.nextBackup ? 
                    new Date(backupStatus.nextBackup).toLocaleDateString('pt-BR') : 
                    'Agendado'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamanho Total</p>
                <p className="text-lg font-bold text-purple-600">
                  {backupStatus.totalSize || '3.5 GB'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-lg font-bold text-orange-600">
                  {backupStatus.successRate || 98}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {BACKUP_COMPONENTS.map(component => {
          const Icon = component.icon;
          const isRecent = new Date(component.lastBackup) > new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          return (
            <Card key={component.id} className={`cursor-pointer transition-all hover:shadow-lg ${
              !isRecent ? 'border-yellow-200' : 'border-gray-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <Badge className={isRecent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {isRecent ? 'Atualizado' : 'Atrasado'}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{component.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{component.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="font-medium">{component.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequência:</span>
                    <span className="font-medium">{component.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Último Backup:</span>
                    <span className="font-medium">
                      {new Date(component.lastBackup).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => startBackupMutation.mutate({ 
                    type: 'incremental', 
                    components: [component.id] 
                  })}
                  disabled={startBackupMutation.isLoading}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Backup Agora
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="recovery">Recuperação</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Backups Hoje</span>
                    <span className="font-medium">{backupStatus.backupsToday || 4}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Backups Esta Semana</span>
                    <span className="font-medium">{backupStatus.backupsThisWeek || 28}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Espaço Utilizado</span>
                    <span className="font-medium">{backupStatus.spaceUsed || '45.2 GB'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Espaço Disponível</span>
                    <span className="font-medium">{backupStatus.spaceAvailable || '154.8 GB'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tempo Médio de Backup</span>
                    <span className="font-medium">{backupStatus.avgBackupTime || '12 min'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Backups Agendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Backup do Banco</p>
                        <p className="text-sm text-gray-600">Backup completo diário</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Hoje, 23:00
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Backup de Arquivos</p>
                        <p className="text-sm text-gray-600">Backup incremental</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Amanhã, 02:00
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Backup Quântico</p>
                        <p className="text-sm text-gray-600">Dados quânticos</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Amanhã, 01:00
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <select
                value={backupFilter}
                onChange={(e) => setBackupFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os tipos</option>
                <option value="full">Backup Completo</option>
                <option value="incremental">Incremental</option>
                <option value="differential">Diferencial</option>
              </select>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar Relatório</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBackups.map(backup => {
              const StatusIcon = STATUS_ICONS[backup.status];
              
              return (
                <Card key={backup.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <StatusIcon className={`w-6 h-6 ${
                          backup.status === 'completed' ? 'text-green-600' :
                          backup.status === 'failed' ? 'text-red-600' :
                          backup.status === 'running' ? 'text-blue-600 animate-spin' : 'text-gray-600'
                        }`} />
                        <div>
                          <h4 className="font-semibold">
                            Backup {backup.type} #{backup.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Componentes: {backup.components.join(', ')}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Iniciado: {new Date(backup.created_at).toLocaleString('pt-BR')}</span>
                            {backup.completed_at && (
                              <span>Concluído: {new Date(backup.completed_at).toLocaleString('pt-BR')}</span>
                            )}
                            <span>Tamanho: {backup.size}</span>
                            {backup.duration && (
                              <span>Duração: {backup.duration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={STATUS_COLORS[backup.status]}>
                          {backup.status}
                        </Badge>
                        
                        {backup.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBackup(backup)}
                          >
                            <Restore className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disaster Recovery Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">RTO (Recovery Time Objective)</h4>
                    <p className="text-sm text-gray-600">Tempo máximo para restauração: <strong>4 horas</strong></p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">RPO (Recovery Point Objective)</h4>
                    <p className="text-sm text-gray-600">Perda máxima de dados: <strong>1 hora</strong></p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Último Teste de DR</h4>
                    <p className="text-sm text-gray-600">
                      {backupStatus.lastDrTest ? 
                        new Date(backupStatus.lastDrTest).toLocaleDateString('pt-BR') : 
                        'Nunca executado'
                      }
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => testDisasterRecoveryMutation.mutate()}
                    disabled={testDisasterRecoveryMutation.isLoading}
                  >
                    {testDisasterRecoveryMutation.isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 mr-2" />
                    )}
                    Executar Teste de DR
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restauração Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Selecionar Backup para Restaurar
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Backup mais recente (Hoje, 20:00)</option>
                      <option>Backup de ontem (17/01, 20:00)</option>
                      <option>Backup da semana passada (11/01, 20:00)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Componentes para Restaurar
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Banco de Dados
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Arquivos do Sistema
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Configurações
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => restoreBackupMutation.mutate({
                      backupId: 'latest',
                      components: ['database']
                    })}
                    disabled={restoreBackupMutation.isLoading}
                  >
                    {restoreBackupMutation.isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Restore className="w-4 h-4 mr-2" />
                    )}
                    Iniciar Restauração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Frequência de Backup Completo
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Diário</option>
                      <option>Semanal</option>
                      <option>Mensal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Retenção de Backups
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>30 dias</option>
                      <option>90 dias</option>
                      <option>1 ano</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Local de Armazenamento
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>AWS S3</option>
                      <option>Google Cloud Storage</option>
                      <option>Azure Blob Storage</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <label className="text-sm">Criptografar backups</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <label className="text-sm">Notificar por email</label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoramento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Backup Automático</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verificação de Integridade</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Alertas de Falha</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Relatórios Semanais</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
