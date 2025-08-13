/**
 * CALENDAR INTEGRATIONS PAGE - Gestão de integrações com calendários externos
 * Conectar/desconectar Google Calendar, Apple iCloud, Microsoft Outlook
 * Sincronização automática e gestão de eventos
 */

import { useState, useEffect } from 'react';
import { StandardHeader } from '@/components/standard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react';

= useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar provedores disponíveis e integrações do usuário
      const [providersResponse, integrationsResponse] = await Promise.all([
        apiRequest('GET', '/api/calendar/providers'),
        apiRequest('GET', '/api/calendar/integrations')
      ]);

      const providersData = await providersResponse.json();
      const integrationsData = await integrationsResponse.json();

      setProviders(providersData.providers || []);
      setIntegrations(integrationsData.integrations || []);
      
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

  const handleConnect = async (providerId) => {
    if (connectingProvider) return;
    
    try {
      setConnectingProvider(providerId);
      
      const response = await apiRequest('POST', `/api/calendar/connect/${providerId}`);
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Abrir janela popup para OAuth
        const popup = window.open(
          data.authUrl,
          'calendar_auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        // Aguardar fechamento da popup ou callback
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setConnectingProvider(null);
            // Recarregar integrações após possível conexão
            setTimeout(() => loadData(), 2000);
          }
        }, 1000);
        
        toast({
          title,
          description)?.name}`,
        });
        
      } else {
        throw new Error(data.message || 'Erro ao conectar');
      }
      
    } catch (error) {
      console.error('Erro ao conectar, error);
      toast({
        title,
        description,
        variant,
      });
      setConnectingProvider(null);
    }
  };

  const handleSync = async (integrationId) => {
    if (syncingIntegration) return;
    
    try {
      setSyncingIntegration(integrationId);
      
      const response = await apiRequest('POST', `/api/calendar/sync/${integrationId}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title,
          description, ${data.result.errors} erros` : ''}`,
        });
        
        // Atualizar lista de integrações
        await loadData();
      } else {
        throw new Error(data.message || 'Erro na sincronização');
      }
      
    } catch (error) {
      console.error('Erro na sincronização, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setSyncingIntegration(null);
    }
  };

  const handleSyncAll = async () => {
    if (syncingAll || integrations.length === 0) return;
    
    try {
      setSyncingAll(true);
      
      const response = await apiRequest('POST', '/api/calendar/sync-all');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title,
          description,
        });
        
        // Atualizar lista de integrações
        await loadData();
      } else {
        throw new Error(data.message || 'Erro na sincronização geral');
      }
      
    } catch (error) {
      console.error('Erro na sincronização geral, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDisconnect = async (integrationId) => {
    if (!confirm('Tem certeza que deseja desconectar este calendário?')) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/calendar/disconnect/${integrationId}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title,
          description,
        });
        
        // Atualizar lista de integrações
        await loadData();
      } else {
        throw new Error(data.message || 'Erro ao desconectar');
      }
      
    } catch (error) {
      console.error('Erro ao desconectar, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!newEventData.title || !newEventData.startTime || !newEventData.endTime || !newEventData.integrationId) {
      toast({
        title,
        description, horários e selecione um calendário",
        variant,
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/calendar/create-event', {
        integrationId,
        event,
          description,
          startTime,
          endTime,
          location);
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title,
          description,
        });
        
        // Limpar formulário
        setNewEventData({
          title,
          description,
          startTime,
          endTime,
          location,
          integrationId);
        setShowCreateEvent(false);
      } else {
        throw new Error(data.message || 'Erro ao criar evento');
      }
      
    } catch (error) {
      console.error('Erro ao criar evento, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const getProviderIcon = (provider) => {
    const icons = {
      google,
      outlook, 
      apple) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StandardHeader showUserActions={true} user={user} />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Carregando integrações de calendário...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader showUserActions={true} user={user} />
      
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                Integrações de Calendário
              </h1>
              <p className="text-gray-600 mt-2">
                Conecte seus calendários externos para sincronização automática
              </p>
            </div>
            
            <div className="flex space-x-3">
              {integrations.length > 0 && (
                <Button
                  onClick={handleSyncAll}
                  disabled={syncingAll}
                  className="bg-green-600 hover) {integrations.length > 0 && (
                <Button
                  onClick={() => setShowCreateEvent(!showCreateEvent)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Evento
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Formulário Criar Evento */}
        {showCreateEvent && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Criar Novo Evento
              </CardTitle>
              <CardDescription>
                Criar evento diretamente no calendário externo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid md) => setNewEventData(prev => ({ ...prev, title))}
                      placeholder="Título do evento"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventIntegration">Calendário *</Label>
                    <select
                      id="eventIntegration"
                      value={newEventData.integrationId}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, integrationId))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus).map(integration => (
                        <option key={integration.id} value={integration.id}>
                          {getProviderIcon(integration.provider)} {integration.calendarName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid md) => setNewEventData(prev => ({ ...prev, startTime))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventEnd">Data/Hora Fim *</Label>
                    <Input
                      id="eventEnd"
                      type="datetime-local"
                      value={newEventData.endTime}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, endTime))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Local</Label>
                  <Input
                    id="eventLocation"
                    value={newEventData.location}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, location))}
                    placeholder="Local do evento (opcional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Descrição</Label>
                  <textarea
                    id="eventDescription"
                    value={newEventData.description}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, description))}
                    placeholder="Descrição do evento (opcional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus) => setShowCreateEvent(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Calendários Conectados */}
        {integrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Calendários Conectados ({integrations.length})
            </h2>
            
            <div className="grid md) => (
                <Card key={integration.id} className="hover)}
                        </span>
                        <div>
                          <CardTitle className="text-lg">{integration.calendarName}</CardTitle>
                          <CardDescription className="capitalize">
                            {integration.provider}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {integration.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) {integration.syncErrors > 0 && (
                          <Badge variant="destructive" title={`${integration.syncErrors} erros de sincronização`}>
                            {integration.syncErrors}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Última sync)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Conectado)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSync(integration.id)}
                        disabled={syncingIntegration === integration.id}
                        className="flex-1"
                      >
                        {syncingIntegration === integration.id ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) {() => handleDisconnect(integration.id)}
                        className="text-red-600 hover))}
            </div>
          </div>
        )}

        {/* Provedores Disponíveis */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-500" />
            Conectar Novo Calendário
          </h2>
          
          {providers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Nenhum provedor de calendário está configurado no servidor.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Entre em contato com o administrador para configurar as integrações.
                </p>
              </CardContent>
            </Card>
          ) {
                const isConnected = integrations.some(i => i.provider === provider.id);
                
                return (
                  <Card key={provider.id} className="hover)}
                        </span>
                        <div>
                          <CardTitle>{provider.name}</CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Recursos, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={connectingProvider === provider.id || isConnected}
                        className="w-full"
                        variant={isConnected ? "secondary" : "default"}
                      >
                        {connectingProvider === provider.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) {isConnected ? 'Já Conectado' : 'Conectar'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Info sobre configuração */}
        {providers.length === 0 && (
          <Card className="mt-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <Settings className="h-6 w-6 text-amber-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">
                    Configuração Necessária
                  </h3>
                  <p className="text-amber-700 mb-3">
                    Para conectar calendários externos, as seguintes variáveis de ambiente precisam ser configuradas no servidor)}
      </div>
    </div>
  );
}