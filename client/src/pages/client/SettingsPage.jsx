/**
 * Página de Configurações - Configurações gerais do sistema
 * Sistema TOIT Nexus - Módulo Cliente
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import {  
  Settings, 
  Monitor, 
  Bell, 
  Shield, 
  Database,
  Wifi,
  Globe,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Clock,
  Users,
  Lock }
} from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    general: {
      companyName: 'TOIT Nexus',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3b82f6',
      fontSize: 'medium',
      compactMode: false,
      animations: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      desktopNotifications: false,
      notificationFrequency: 'immediate'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: []
    },
    integrations: {
      emailService: 'smtp',
      storageProvider: 'local',
      backupEnabled: true,
      backupFrequency: 'daily',
      apiRateLimit: 1000
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      lazyLoading: true,
      prefetchData: false,
      maxConcurrentUsers: 100
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      // Reset to default values
      setSettings({
        general: {
          companyName: 'TOIT Nexus',
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          dateFormat: 'DD/MM/YYYY',
          currency: 'BRL'
        },
        appearance: {
          theme: 'light',
          primaryColor: '#3b82f6',
          fontSize: 'medium',
          compactMode: false,
          animations: true
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          soundEnabled: true,
          desktopNotifications: false,
          notificationFrequency: 'immediate'
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAttempts: 5,
          ipWhitelist: []
        },
        integrations: {
          emailService: 'smtp',
          storageProvider: 'local',
          backupEnabled: true,
          backupFrequency: 'daily',
          apiRateLimit: 1000
        },
        performance: {
          cacheEnabled: true,
          compressionEnabled: true,
          lazyLoading: true,
          prefetchData: false,
          maxConcurrentUsers: 100
        }
      });
      setHasChanges(true);
      toast.success('Configurações restauradas para o padrão');
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'toit-nexus-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Configurações exportadas com sucesso!');
  };

  const handleImportSettings = (event) => ({ const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e }) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasChanges(true);
          toast.success('Configurações importadas com sucesso!');
        } catch (error) {
          toast.error('Erro ao importar configurações. Verifique o formato do arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'light': return <Sun className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-800">Você tem alterações não salvas</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick=({ ( }) => setActiveTab('general')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'general' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Settings className="h-4 w-4" />

                <button
                  onClick=({ ( }) => setActiveTab('appearance')}`
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'appearance' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Aparência
                </button>
                <button
                  onClick=({ ( }) => setActiveTab('notifications')}`
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  Notificações
                </button>
                <button
                  onClick=({ ( }) => setActiveTab('security')}`
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Segurança
                </button>
                <button
                  onClick=({ ( }) => setActiveTab('integrations')}`
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'integrations' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Wifi className="h-4 w-4" />
                  Integrações
                </button>
                <button
                  onClick=({ ( }) => setActiveTab('performance')}`
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'performance' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Zap className="h-4 w-4" />

                <button
                  onClick=({ ( }) => setActiveTab('backup')}`
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'backup' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'`}
                  }`}
                >
                  <Database className="h-4 w-4" />

              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="col-span-9">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome da Empresa</label>
                      <Input
                        value={settings.general.companyName}
                        onChange=({ (e }) => handleSettingChange('general', 'companyName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fuso Horário</label>
                      <select
                        value={settings.general.timezone}
                        onChange=({ (e }) => handleSettingChange('general', 'timezone', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                        <option value="America/New_York">New York (GMT-5)</option>
                        <option value="Europe/London">London (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Idioma</label>
                      <select
                        value={settings.general.language}
                        onChange=({ (e }) => handleSettingChange('general', 'language', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Formato de Data</label>
                      <select
                        value={settings.general.dateFormat}
                        onChange=({ (e }) => handleSettingChange('general', 'dateFormat', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Moeda</label>
                      <select
                        value={settings.general.currency}
                        onChange=({ (e }) => handleSettingChange('general', 'currency', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="BRL">Real (R$)</option>
                        <option value="USD">Dólar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance Settings */}
          ({ activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Configurações de Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Tema</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'auto'].map((theme }) => (
                        <button
                          key={theme}
                          onClick=({ ( }) => handleSettingChange('appearance', 'theme', theme)}`
                          className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                            settings.appearance.theme === theme
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'`}
                          }`}
                        >
                          {getThemeIcon(theme)}
                          <span className="text-sm capitalize">
                            {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cor Primária</label>
                      <input
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange=({ (e }) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tamanho da Fonte</label>
                      <select
                        value={settings.appearance.fontSize}
                        onChange=({ (e }) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="small">Pequena</option>
                        <option value="medium">Média</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Modo Compacto</p>
                        <p className="text-sm text-gray-600">Reduz o espaçamento entre elementos</p>
                      </div>
                      <Switch
                        checked={settings.appearance.compactMode}
                        onCheckedChange=({ (checked }) => handleSettingChange('appearance', 'compactMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Animações</p>
                        <p className="text-sm text-gray-600">Habilita transições e animações</p>
                      </div>
                      <Switch
                        checked={settings.appearance.animations}
                        onCheckedChange=({ (checked }) => handleSettingChange('appearance', 'animations', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configurações de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-gray-600">Receber notificações importantes por email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange=({ (checked }) => handleSettingChange('notifications', 'emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações Push</p>
                        <p className="text-sm text-gray-600">Receber notificações push no navegador</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange=({ (checked }) => handleSettingChange('notifications', 'pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Som das Notificações</p>
                        <p className="text-sm text-gray-600">Reproduzir som ao receber notificações</p>
                      </div>
                      <Switch
                        checked={settings.notifications.soundEnabled}
                        onCheckedChange=({ (checked }) => handleSettingChange('notifications', 'soundEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações Desktop</p>
                        <p className="text-sm text-gray-600">Mostrar notificações na área de trabalho</p>
                      </div>
                      <Switch
                        checked={settings.notifications.desktopNotifications}
                        onCheckedChange=({ (checked }) => handleSettingChange('notifications', 'desktopNotifications', checked)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Frequência de Notificações</label>
                    <select
                      value={settings.notifications.notificationFrequency}
                      onChange=({ (e }) => handleSettingChange('notifications', 'notificationFrequency', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="immediate">Imediata</option>
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Configurações de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-gray-600">Adiciona uma camada extra de segurança</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange=({ (checked }) => handleSettingChange('security', 'twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Timeout de Sessão (minutos)</label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange=({ (e }) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Expiração de Senha (dias)</label>
                      <Input
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange=({ (e }) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Máximo de Tentativas de Login</label>
                    <Input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange=({ (e }) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Integrations Settings */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Configurações de Integração
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Serviço de Email</label>
                      <select
                        value={settings.integrations.emailService}
                        onChange=({ (e }) => handleSettingChange('integrations', 'emailService', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="smtp">SMTP</option>
                        <option value="sendgrid">SendGrid</option>
                        <option value="mailgun">Mailgun</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Provedor de Armazenamento</label>
                      <select
                        value={settings.integrations.storageProvider}
                        onChange=({ (e }) => handleSettingChange('integrations', 'storageProvider', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="local">Local</option>
                        <option value="aws">AWS S3</option>
                        <option value="gcp">Google Cloud</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Backup Automático</p>
                      <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
                    </div>
                    <Switch
                      checked={settings.integrations.backupEnabled}
                      onCheckedChange=({ (checked }) => handleSettingChange('integrations', 'backupEnabled', checked)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Frequência de Backup</label>
                    <select
                      value={settings.integrations.backupFrequency}
                      onChange=({ (e }) => handleSettingChange('integrations', 'backupFrequency', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={!settings.integrations.backupEnabled}
                    >
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Limite de Taxa da API (req/min)</label>
                    <Input
                      type="number"
                      value={settings.integrations.apiRateLimit}
                      onChange=({ (e }) => handleSettingChange('integrations', 'apiRateLimit', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Settings */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Configurações de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cache Habilitado</p>
                        <p className="text-sm text-gray-600">Melhora a velocidade de carregamento</p>
                      </div>
                      <Switch
                        checked={settings.performance.cacheEnabled}
                        onCheckedChange=({ (checked }) => handleSettingChange('performance', 'cacheEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compressão Habilitada</p>
                        <p className="text-sm text-gray-600">Reduz o tamanho dos arquivos transferidos</p>
                      </div>
                      <Switch
                        checked={settings.performance.compressionEnabled}
                        onCheckedChange=({ (checked }) => handleSettingChange('performance', 'compressionEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Carregamento Lazy</p>
                        <p className="text-sm text-gray-600">Carrega conteúdo conforme necessário</p>
                      </div>
                      <Switch
                        checked={settings.performance.lazyLoading}
                        onCheckedChange=({ (checked }) => handleSettingChange('performance', 'lazyLoading', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pré-carregamento de Dados</p>
                        <p className="text-sm text-gray-600">Carrega dados antecipadamente</p>
                      </div>
                      <Switch
                        checked={settings.performance.prefetchData}
                        onCheckedChange=({ (checked }) => handleSettingChange('performance', 'prefetchData', checked)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Máximo de Usuários Simultâneos</label>
                    <Input
                      type="number"
                      value={settings.performance.maxConcurrentUsers}
                      onChange=({ (e }) => handleSettingChange('performance', 'maxConcurrentUsers', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backup e Restauração
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleExportSettings} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportar Configurações
                    </Button>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                        id="import-settings"
                      />
                      <Button 
                        onClick=({ ( }) => document.getElementById('import-settings').click()}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Importar Configurações
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Atenção</h4>
                        <p className="text-sm text-yellow-700">
                          Importar configurações substituirá todas as configurações atuais. 
                          Certifique-se de fazer backup antes de importar.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;`