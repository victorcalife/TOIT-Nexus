import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Shield, 
  Database,
  Key,
  Palette,
  Globe,
  Save
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "InvestFlow",
    companyEmail: "contato@investflow.com",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    
    // Notification Settings
    emailNotifications: true,
    workflowNotifications: true,
    reportNotifications: true,
    systemAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "24",
    passwordPolicy: "medium",
    
    // API Settings
    apiRateLimit: "1000",
    webhookTimeout: "30",
    maxFileSize: "10",
    
    // System Variables
    systemVariables: [
      { key: "DEFAULT_CURRENCY", value: "BRL" },
      { key: "MIN_INVESTMENT_VALUE", value: "1000" },
      { key: "REPORT_RETENTION_DAYS", value: "365" }
    ]
  });

  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would make an API call
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  const addSystemVariable = () => {
    setSettings({
      ...settings,
      systemVariables: [
        ...settings.systemVariables,
        { key: "", value: "" }
      ]
    });
  };

  const updateSystemVariable = (index: number, field: 'key' | 'value', newValue: string) => {
    const updatedVariables = settings.systemVariables.map((variable, i) => 
      i === index ? { ...variable, [field]: newValue } : variable
    );
    setSettings({ ...settings, systemVariables: updatedVariables });
  };

  const removeSystemVariable = (index: number) => {
    const updatedVariables = settings.systemVariables.filter((_, i) => i !== index);
    setSettings({ ...settings, systemVariables: updatedVariables });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Configurações do Sistema</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie configurações gerais, notificações e variáveis do sistema
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="bg-primary-500 hover:bg-primary-600">
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-primary-500" />
                <CardTitle>Configurações Gerais</CardTitle>
              </div>
              <CardDescription>
                Configure informações básicas da empresa e preferências do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email da Empresa</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary-500" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Configure quando e como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Notificações por Email</Label>
                    <p className="text-sm text-gray-500">Receber notificações gerais por email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="workflowNotifications">Notificações de Workflow</Label>
                    <p className="text-sm text-gray-500">Alertas sobre execução de workflows</p>
                  </div>
                  <Switch
                    id="workflowNotifications"
                    checked={settings.workflowNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, workflowNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reportNotifications">Notificações de Relatórios</Label>
                    <p className="text-sm text-gray-500">Alertas sobre geração de relatórios</p>
                  </div>
                  <Switch
                    id="reportNotifications"
                    checked={settings.reportNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, reportNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemAlerts">Alertas do Sistema</Label>
                    <p className="text-sm text-gray-500">Notificações sobre status do sistema</p>
                  </div>
                  <Switch
                    id="systemAlerts"
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <CardTitle>Segurança</CardTitle>
              </div>
              <CardDescription>
                Configure políticas de segurança e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-500">Exigir 2FA para todos os usuários</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout de Sessão (horas)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Política de Senhas</Label>
                  <Select value={settings.passwordPolicy} onValueChange={(value) => setSettings({ ...settings, passwordPolicy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa (mín. 6 caracteres)</SelectItem>
                      <SelectItem value="medium">Média (mín. 8 caracteres, números)</SelectItem>
                      <SelectItem value="high">Alta (mín. 12 caracteres, símbolos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary-500" />
                <CardTitle>Configurações de API</CardTitle>
              </div>
              <CardDescription>
                Configure limites e timeouts para integrações externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">Limite de Requisições/hora</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookTimeout">Timeout Webhook (seg)</Label>
                  <Input
                    id="webhookTimeout"
                    type="number"
                    value={settings.webhookTimeout}
                    onChange={(e) => setSettings({ ...settings, webhookTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamanho Máx. Arquivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Variables */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-primary-500" />
                <CardTitle>Variáveis do Sistema</CardTitle>
              </div>
              <CardDescription>
                Configure constantes e variáveis utilizadas pelos workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {settings.systemVariables.map((variable, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Input
                      placeholder="Nome da variável"
                      value={variable.key}
                      onChange={(e) => updateSystemVariable(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Valor"
                      value={variable.value}
                      onChange={(e) => updateSystemVariable(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSystemVariable(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" onClick={addSystemVariable}>
                <Key className="w-4 h-4 mr-2" />
                Adicionar Variável
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
