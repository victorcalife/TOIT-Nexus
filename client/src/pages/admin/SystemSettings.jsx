/**
 * Página de Configurações do Sistema - Administração
 * Sistema TOIT Nexus - Módulo Administrador
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {  
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Server, 
  Shield, 
  Mail, 
  Bell, 
  Globe, 
  Lock, 
  Key, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network, 
  Zap, 
  Eye, 
  EyeOff, 
  Copy, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Minus, 
  Edit, 
  X, 
  Check, 
  Info, 
  ExternalLink,
  FileText,
  Code,
  Monitor,
  Smartphone,
  Palette,
  Languages,
  Calendar,
  MapPin,
  DollarSign,
  CreditCard,
  Webhook,
  Api,
  Cloud,
  Backup
} from 'lucide-react';
import { toast } from 'sonner';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  
  // Estados para diferentes seções de configuração
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'TOIT Nexus',
    systemDescription: 'Plataforma de Gestão Empresarial Inteligente',
    systemVersion: '2.1.0',
    maintenanceMode: false,
    allowRegistration: true,
    defaultLanguage: 'pt-BR',
    defaultTimezone: 'America/Sao_Paulo',
    sessionTimeout: 30, // minutos
    maxFileSize: 50, // MB
    supportEmail: 'suporte@toit-nexus.com',
    supportPhone: '(11) 3333-3333'
  });
  
  const [databaseSettings, setDatabaseSettings] = useState({
    host: 'localhost',
    port: 5432,
    database: 'toit_nexus',
    username: 'postgres',
    password: '••••••••',
    maxConnections: 100,
    connectionTimeout: 30,
    backupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30 // dias
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@toit-nexus.com',
    smtpPassword: '••••••••',
    smtpEncryption: 'tls',
    fromName: 'TOIT Nexus',
    fromEmail: 'noreply@toit-nexus.com',
    testEmailEnabled: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordExpiration: 90, // dias
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutos
    twoFactorEnabled: true,
    ipWhitelist: [],
    sslEnabled: true,
    corsEnabled: true,
    allowedOrigins: ['https://app.toit-nexus.com']
  });
  
  const [apiSettings, setApiSettings] = useState({
    rateLimit: 1000, // requests per hour
    apiKeyExpiration: 365, // dias
    webhookTimeout: 30, // segundos
    enableApiLogs: true,
    enableWebhooks: true,
    apiVersion: 'v1',
    documentationUrl: 'https://docs.toit-nexus.com/api'
  });
  
  const [integrationSettings, setIntegrationSettings] = useState({
    googleApiKey: '••••••••',
    microsoftClientId: '••••••••',
    microsoftClientSecret: '••••••••',
    slackWebhookUrl: '••••••••',
    zapierApiKey: '••••••••',
    openaiApiKey: '••••••••',
    stripePublicKey: '••••••••',
    stripeSecretKey: '••••••••'
  });

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'database', label: 'Banco de Dados', icon: Database },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'api', label: 'API', icon: Api },
    { id: 'integrations', label: 'Integrações', icon: Webhook }
  ];

  const handleSaveSettings = (section) => {
    setIsLoading(true);
    
    setTimeout(() => {
      toast.success(`Configurações de ${section} salvas com sucesso!`);
      setIsLoading(false);
    }, 1000);
  };

  const handleTestConnection = (type) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% chance de sucesso
      if (success) {
        toast.success(`Teste de ${type} realizado com sucesso!`);
      } else {
        toast.error(`Falha no teste de ${type}. Verifique as configurações.`);
      }
      setIsLoading(false);
    }, 2000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const generateApiKey = () => {
    const newKey = 'toit_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    toast.success('Nova chave API gerada!');
    return newKey;
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>Configurações básicas do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Sistema</label>
              <Input
                value={generalSettings.systemName}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, systemName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Versão</label>
              <Input value={generalSettings.systemVersion} disabled />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <Input
              value={generalSettings.systemDescription}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, systemDescription: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Idioma Padrão</label>
              <select
                value={generalSettings.defaultLanguage}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuso Horário</label>
              <select
                value={generalSettings.defaultTimezone}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultTimezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timeout de Sessão (min)</label>
              <Input
                type="number"
                value={generalSettings.sessionTimeout}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tamanho Máx. Arquivo (MB)</label>
              <Input
                type="number"
                value={generalSettings.maxFileSize}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={generalSettings.maintenanceMode}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium">
                Modo Manutenção
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contato de Suporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">E-mail de Suporte</label>
              <Input
                type="email"
                value={generalSettings.supportEmail}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone de Suporte</label>
              <Input
                value={generalSettings.supportPhone}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings('geral')} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Conexão</CardTitle>
          <CardDescription>Configurações do banco de dados PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Host</label>
              <Input
                value={databaseSettings.host}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, host: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Porta</label>
              <Input
                type="number"
                value={databaseSettings.port}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Banco de Dados</label>
              <Input
                value={databaseSettings.database}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, database: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Usuário</label>
              <Input
                value={databaseSettings.username}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <Input
                type={showPasswords.database ? 'text' : 'password'}
                value={databaseSettings.password}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('database')}
              >
                {showPasswords.database ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleTestConnection('banco de dados')}
              disabled={isLoading}
            >
              <Database className="h-4 w-4 mr-2" />
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Máx. Conexões</label>
              <Input
                type="number"
                value={databaseSettings.maxConnections}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, maxConnections: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timeout Conexão (s)</label>
              <Input
                type="number"
                value={databaseSettings.connectionTimeout}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, connectionTimeout: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Backup Automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="backupEnabled"
              checked={databaseSettings.backupEnabled}
              onChange={(e) => setDatabaseSettings(prev => ({ ...prev, backupEnabled: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="backupEnabled" className="text-sm font-medium">
              Habilitar Backup Automático
            </label>
          </div>
          
          {databaseSettings.backupEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Frequência</label>
                <select
                  value={databaseSettings.backupFrequency}
                  onChange={(e) => setDatabaseSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="hourly">A cada hora</option>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Retenção (dias)</label>
                <Input
                  type="number"
                  value={databaseSettings.backupRetention}
                  onChange={(e) => setDatabaseSettings(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings('banco de dados')} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações SMTP</CardTitle>
          <CardDescription>Configurações do servidor de e-mail</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Servidor SMTP</label>
              <Input
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Porta</label>
              <Input
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Usuário SMTP</label>
              <Input
                value={emailSettings.smtpUsername}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Senha SMTP</label>
              <div className="relative">
                <Input
                  type={showPasswords.smtp ? 'text' : 'password'}
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisibility('smtp')}
                >
                  {showPasswords.smtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Criptografia</label>
            <select
              value={emailSettings.smtpEncryption}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpEncryption: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="none">Nenhuma</option>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleTestConnection('e-mail')}
              disabled={isLoading}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar E-mail Teste
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Envio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Remetente</label>
              <Input
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-mail do Remetente</label>
              <Input
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings('e-mail')} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Políticas de Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Comprimento Mínimo</label>
            <Input
              type="number"
              value={securitySettings.passwordMinLength}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireUppercase"
                checked={securitySettings.passwordRequireUppercase}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireUppercase: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="requireUppercase" className="text-sm">Exigir letras maiúsculas</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireLowercase"
                checked={securitySettings.passwordRequireLowercase}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireLowercase: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="requireLowercase" className="text-sm">Exigir letras minúsculas</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireNumbers"
                checked={securitySettings.passwordRequireNumbers}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireNumbers: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="requireNumbers" className="text-sm">Exigir números</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireSymbols"
                checked={securitySettings.passwordRequireSymbols}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireSymbols: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="requireSymbols" className="text-sm">Exigir símbolos</label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Expiração da Senha (dias)</label>
            <Input
              type="number"
              value={securitySettings.passwordExpiration}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiration: parseInt(e.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Controle de Acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Máx. Tentativas de Login</label>
              <Input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duração do Bloqueio (min)</label>
              <Input
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="twoFactorEnabled"
              checked={securitySettings.twoFactorEnabled}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="twoFactorEnabled" className="text-sm font-medium">
              Habilitar Autenticação de Dois Fatores
            </label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações SSL/CORS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sslEnabled"
                checked={securitySettings.sslEnabled}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sslEnabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="sslEnabled" className="text-sm font-medium">Forçar HTTPS</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="corsEnabled"
                checked={securitySettings.corsEnabled}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, corsEnabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="corsEnabled" className="text-sm font-medium">Habilitar CORS</label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings('segurança')} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da API</CardTitle>
          <CardDescription>Configurações gerais da API REST</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Versão da API</label>
              <Input value={apiSettings.apiVersion} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rate Limit (req/hora)</label>
              <Input
                type="number"
                value={apiSettings.rateLimit}
                onChange={(e) => setApiSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiração Chave API (dias)</label>
              <Input
                type="number"
                value={apiSettings.apiKeyExpiration}
                onChange={(e) => setApiSettings(prev => ({ ...prev, apiKeyExpiration: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timeout Webhook (s)</label>
              <Input
                type="number"
                value={apiSettings.webhookTimeout}
                onChange={(e) => setApiSettings(prev => ({ ...prev, webhookTimeout: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">URL da Documentação</label>
            <div className="flex gap-2">
              <Input
                value={apiSettings.documentationUrl}
                onChange={(e) => setApiSettings(prev => ({ ...prev, documentationUrl: e.target.value }))}
              />
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableApiLogs"
                checked={apiSettings.enableApiLogs}
                onChange={(e) => setApiSettings(prev => ({ ...prev, enableApiLogs: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="enableApiLogs" className="text-sm font-medium">Habilitar Logs da API</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableWebhooks"
                checked={apiSettings.enableWebhooks}
                onChange={(e) => setApiSettings(prev => ({ ...prev, enableWebhooks: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="enableWebhooks" className="text-sm font-medium">Habilitar Webhooks</label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Chaves API do Sistema</CardTitle>
          <CardDescription>Gerencie as chaves de acesso à API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Chave Principal</p>
                <p className="text-sm text-gray-600">toit_••••••••••••••••</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Chave de Webhook</p>
                <p className="text-sm text-gray-600">toit_••••••••••••••••</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Button variant="outline" onClick={generateApiKey}>
            <Plus className="h-4 w-4 mr-2" />
            Gerar Nova Chave
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings('API')} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrações de Terceiros</CardTitle>
          <CardDescription>Configure as chaves de API para integrações externas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Google API Key</label>
              <div className="relative">
                <Input
                  type={showPasswords.google ? 'text' : 'password'}
                  value={integrationSettings.googleApiKey}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisibility('google')}
                >
                  {showPasswords.google ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
              <div className="relative">
                <Input
                  type={showPasswords.openai ? 'text' : 'password'}
                  value={integrationSettings.openaiApiKey}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisibility('openai')}
                >
                  {showPasswords.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Microsoft Client ID</label>
              <Input
                value={integrationSettings.microsoftClientId}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, microsoftClientId: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Microsoft Client Secret</label>
              <div className="relative">
                <Input
                  type={showPasswords.microsoft ? 'text' : 'password'}
                  value={integrationSettings.microsoftClientSecret}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, microsoftClientSecret: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisibility('microsoft')}
                >
                  {showPasswords.microsoft ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stripe Public Key</label>
              <Input
                value={integrationSettings.stripePublicKey}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
              <div className="relative">
                <Input
                  type={showPasswords.stripe ? 'text' : 'password'}
                  value={integrationSettings.stripeSecretKey}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisibility('stripe')}
                >
                  {showPasswords.stripe ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Slack Webhook URL</label>
            <div className="relative">
              <Input
                type={showPasswords.slack ? 'text' : 'password'}
                value={integrationSettings.slackWebhookUrl}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('slack')}
              >
                {showPasswords.slack ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Zapier API Key</label>
            <div className="relative">
              <Input
                type={showPasswords.zapier ? 'text' : 'password'}
                value={integrationSettings.zapierApiKey}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, zapierApiKey: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('zapier')}
              >
                {showPasswords.zapier ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings('integrações')} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'database':
        return renderDatabaseSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'api':
        return renderApiSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie todas as configurações e integrações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Config
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar Config
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SystemSettings;