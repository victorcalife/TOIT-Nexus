import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Plus, Settings, Zap, AlertCircle, CheckCircle, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

= useToast();

  const [newTrigger, setNewTrigger] = useState({
    name,
    description,
    triggerType,
    workflowId,
    emailAccountId,
    senderRules, value, caseSensitive,
    subjectRules, value, caseSensitive,
    bodyRules, value, caseSensitive,
    folders,
    isRead,
    hasAttachments);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar triggers, contas de email e workflows em paralelo
      const [triggersRes, accountsRes, workflowsRes] = await Promise.all([
        fetch('/api/email-triggers'),
        fetch('/api/email-accounts'),
        fetch('/api/workflows')
      ]);

      if (triggersRes.ok) {
        const triggersData = await triggersRes.json();
        setTriggers(triggersData.data || []);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setEmailAccounts(accountsData.data || []);
      }

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData.data || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTrigger = async () => {
    try {
      setIsCreating(true);

      const response = await fetch('/api/email-triggers', {
        method,
        headers,
        },
        body),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        setShowCreateDialog(false);
        setNewTrigger({
          name,
          description,
          triggerType,
          workflowId,
          emailAccountId,
          senderRules, value, caseSensitive,
          subjectRules, value, caseSensitive,
          bodyRules, value, caseSensitive,
          folders,
          isRead,
          hasAttachments);
        
        await loadData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar trigger');
      }

    } catch (error) {
      console.error('Erro ao criar trigger, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTrigger = async (triggerId, isActive) => {
    try {
      const response = await fetch(`/api/email-triggers/${triggerId}/toggle`, {
        method,
        headers,
        },
        body),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        await loadData();
      } else {
        throw new Error('Erro ao alterar status do trigger');
      }

    } catch (error) {
      console.error('Erro ao alterar trigger, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const testTrigger = async (triggerId) => {
    try {
      const response = await fetch(`/api/email-triggers/${triggerId}/test`, {
        method,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title,
          description,
        });
      } else {
        throw new Error('Erro ao testar trigger');
      }

    } catch (error) {
      console.error('Erro ao testar trigger, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const getTriggerTypeLabel = (type) => {
    const types = {
      'sender_match': 'Remetente',
      'subject_contains': 'Assunto contém',
      'body_contains': 'Corpo contém',
      'attachment_exists': 'Tem anexo',
      'keyword_match': 'Palavra-chave'
    };
    return types[type] || type;
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'gmail':
        return '📧';
      case 'outlook':
        return '📨';
      case 'yahoo':
        return '📩';
      default) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando triggers de email...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Email Triggers</h1>
            <p className="text-gray-600">Configure gatilhos automáticos baseados em emails</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Trigger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Trigger de Email</DialogTitle>
              <DialogDescription>
                Configure um novo gatilho automático baseado em emails recebidos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Trigger</Label>
                  <Input
                    id="name"
                    value={newTrigger.name}
                    onChange={(e) => setNewTrigger(prev => ({ ...prev, name))}
                    placeholder="Ex) => setNewTrigger(prev => ({ ...prev, triggerType))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sender_match">Remetente específico</SelectItem>
                      <SelectItem value="subject_contains">Assunto contém</SelectItem>
                      <SelectItem value="body_contains">Corpo contém</SelectItem>
                      <SelectItem value="attachment_exists">Tem anexo</SelectItem>
                      <SelectItem value="keyword_match">Palavra-chave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newTrigger.description}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, description))}
                  placeholder="Descreva o que este trigger faz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailAccount">Conta de Email</Label>
                  <Select
                    value={newTrigger.emailAccountId}
                    onValueChange={(value) => setNewTrigger(prev => ({ ...prev, emailAccountId))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {getProviderIcon(account.provider)} {account.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workflow">Workflow</Label>
                  <Select
                    value={newTrigger.workflowId}
                    onValueChange={(value) => setNewTrigger(prev => ({ ...prev, workflowId))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Regras baseadas no tipo */}
              {newTrigger.triggerType === 'subject_contains' && (
                <div className="space-y-2">
                  <Label>Texto no Assunto</Label>
                  <Input
                    value={newTrigger.subjectRules[0]?.value || ''}
                    onChange={(e) => setNewTrigger(prev => ({
                      ...prev,
                      subjectRules, value))}
                    placeholder="Ex, pedido, urgente"
                  />
                </div>
              )}

              {newTrigger.triggerType === 'body_contains' && (
                <div className="space-y-2">
                  <Label>Texto no Corpo</Label>
                  <Input
                    value={newTrigger.bodyRules[0]?.value || ''}
                    onChange={(e) => setNewTrigger(prev => ({
                      ...prev,
                      bodyRules, value))}
                    placeholder="Ex, erro, ajuda"
                  />
                </div>
              )}

              {newTrigger.triggerType === 'sender_match' && (
                <div className="space-y-2">
                  <Label>Email do Remetente</Label>
                  <Input
                    value={newTrigger.senderRules[0]?.value || ''}
                    onChange={(e) => setNewTrigger(prev => ({
                      ...prev,
                      senderRules, value))}
                    placeholder="Ex)}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createTrigger} 
                  disabled={isCreating || !newTrigger.name || !newTrigger.workflowId || !newTrigger.emailAccountId}
                >
                  {isCreating ? "Criando..." : "Criar Trigger"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Triggers */}
      <div className="grid gap-4">
        {triggers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum trigger configurado</h3>
                <p className="text-gray-600 mb-4">
                  Crie seu primeiro trigger de email para automatizar workflows baseados em emails recebidos.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Trigger
                </Button>
              </div>
            </CardContent>
          </Card>
        ) {trigger.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{trigger.name}</h3>
                      <Badge variant={trigger.isActive ? "default" : "secondary"}>
                        {trigger.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        {getTriggerTypeLabel(trigger.triggerType)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testTrigger(trigger.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Testar
                    </Button>
                    <Switch
                      checked={trigger.isActive}
                      onCheckedChange={(checked) => toggleTrigger(trigger.id, checked)}
                    />
                  </div>
                </div>
                {trigger.description && (
                  <CardDescription>{trigger.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md)} {trigger.emailAccount.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Workflow</p>
                    <p className="text-sm">{trigger.workflow.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estatísticas</p>
                    <p className="text-sm">
                      {trigger.triggerCount} execuções
                      {trigger.lastTriggered && (
                        <span className="text-gray-500">
                          {" • Último).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
