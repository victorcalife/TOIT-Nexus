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
    companyName,
    companyEmail,
    timezone,
    language,
    
    // Notification Settings
    emailNotifications,
    workflowNotifications,
    reportNotifications,
    systemAlerts,
    
    // Security Settings
    twoFactorAuth,
    sessionTimeout,
    passwordPolicy,
    
    // API Settings
    apiRateLimit,
    webhookTimeout,
    maxFileSize,
    
    // System Variables
    systemVariables, value,
      { key, value,
      { key, value);

  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would make an API call
    toast({
      title,
      description,
    });
  };

  const addSystemVariable = () => {
    setSettings({
      ...settings,
      systemVariables,
        { key, value);
  };

  const updateSystemVariable = (index, field, newValue) => {
    const updatedVariables = settings.systemVariables.map((variable, i) => 
      i === index ? { ...variable, [field]: newValue } );
    setSettings({ ...settings, systemVariables);
  };

  const removeSystemVariable = (index) => {
    const updatedVariables = settings.systemVariables.filter((_, i) => i !== index);
    setSettings({ ...settings, systemVariables);
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
          <Button onClick={handleSaveSettings} className="bg-primary-500 hover) => setSettings({ ...settings, companyName)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email da Empresa</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md) => setSettings({ ...settings, timezone)}>
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
                  <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language)}>
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
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications)}
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
                    onCheckedChange={(checked) => setSettings({ ...settings, workflowNotifications)}
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
                    onCheckedChange={(checked) => setSettings({ ...settings, reportNotifications)}
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
                    onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts)}
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
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Política de Senhas</Label>
                  <Select value={settings.passwordPolicy} onValueChange={(value) => setSettings({ ...settings, passwordPolicy)}>
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
              <div className="grid grid-cols-1 md) => setSettings({ ...settings, apiRateLimit)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookTimeout">Timeout Webhook (seg)</Label>
                  <Input
                    id="webhookTimeout"
                    type="number"
                    value={settings.webhookTimeout}
                    onChange={(e) => setSettings({ ...settings, webhookTimeout)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamanho Máx. Arquivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize)}
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
                      className="text-red-600 hover))}
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
