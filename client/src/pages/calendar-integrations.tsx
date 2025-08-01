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
  Sync,
  Settings
} from 'lucide-react';

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
  features: string[];
}

interface CalendarIntegration {
  id: string;
  provider: string;
  calendarName: string;
  isActive: boolean;
  lastSyncAt: string | null;
  syncErrors: number;
  createdAt: string;
}

interface SyncResult {
  imported: number;
  errors: number;
  syncedAt: string;
}

export default function CalendarIntegrations() {
  const [providers, setProviders] = useState<CalendarProvider[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    integrationId: ''
  });
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  
  const { user } = useAuth();
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
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as integrações de calendário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (providerId: string) => {
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
          title: "Redirecionando...",
          description: `Conectando com ${providers.find(p => p.id === providerId)?.name}`,
        });
        
      } else {
        throw new Error(data.message || 'Erro ao conectar');
      }
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível iniciar a conexão com o calendário",
        variant: "destructive",
      });
      setConnectingProvider(null);
    }
  };

  const handleSync = async (integrationId: string) => {
    if (syncingIntegration) return;
    
    try {
      setSyncingIntegration(integrationId);
      
      const response = await apiRequest('POST', `/api/calendar/sync/${integrationId}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Sincronização concluída",
          description: `${data.result.imported} eventos importados${data.result.errors > 0 ? `, ${data.result.errors} erros` : ''}`,
        });
        
        // Atualizar lista de integrações
        await loadData();
      } else {
        throw new Error(data.message || 'Erro na sincronização');
      }
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar o calendário",
        variant: "destructive",
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
          title: "Sincronização geral concluída",
          description: `${data.summary.totalImported} eventos importados em ${data.summary.totalIntegrations} calendários`,
        });
        
        // Atualizar lista de integrações
        await loadData();
      } else {
        throw new Error(data.message || 'Erro na sincronização geral');
      }
      
    } catch (error) {
      console.error('Erro na sincronização geral:', error);
      toast({
        title: "Erro na sincronização geral",
        description: "Não foi possível sincronizar todos os calendários",
        variant: "destructive",
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Tem certeza que deseja desconectar este calendário?')) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/calendar/disconnect/${integrationId}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Calendário desconectado",
          description: "A integração foi removida com sucesso",
        });
        
        // Atualizar lista de integrações
        await loadData();
      } else {
        throw new Error(data.message || 'Erro ao desconectar');
      }
      
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o calendário",
        variant: "destructive",
      });
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEventData.title || !newEventData.startTime || !newEventData.endTime || !newEventData.integrationId) {
      toast({
        title: "Dados incompletos",
        description: "Preencha título, horários e selecione um calendário",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/calendar/create-event', {
        integrationId: newEventData.integrationId,
        event: {
          title: newEventData.title,
          description: newEventData.description,
          startTime: newEventData.startTime,
          endTime: newEventData.endTime,
          location: newEventData.location
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Evento criado",
          description: "O evento foi criado no calendário externo",
        });
        
        // Limpar formulário
        setNewEventData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          location: '',
          integrationId: ''
        });
        setShowCreateEvent(false);
      } else {
        throw new Error(data.message || 'Erro ao criar evento');
      }
      
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro ao criar evento",
        description: "Não foi possível criar o evento no calendário",
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      google: '📅',
      outlook: '📆', 
      apple: '🍎'
    };
    return icons[provider as keyof typeof icons] || '📅';
  };

  const formatDate = (dateString: string | null) => {
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  {syncingAll ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sync className="h-4 w-4 mr-2" />
                  )}
                  Sincronizar Todos
                </Button>
              )}
              
              {integrations.length > 0 && (
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Título *</Label>
                    <Input
                      id="eventTitle"
                      value={newEventData.title}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título do evento"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventIntegration">Calendário *</Label>
                    <select
                      id="eventIntegration"
                      value={newEventData.integrationId}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, integrationId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um calendário</option>
                      {integrations.filter(i => i.isActive).map(integration => (
                        <option key={integration.id} value={integration.id}>
                          {getProviderIcon(integration.provider)} {integration.calendarName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventStart">Data/Hora Início *</Label>
                    <Input
                      id="eventStart"
                      type="datetime-local"
                      value={newEventData.startTime}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventEnd">Data/Hora Fim *</Label>
                    <Input
                      id="eventEnd"
                      type="datetime-local"
                      value={newEventData.endTime}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Local</Label>
                  <Input
                    id="eventLocation"
                    value={newEventData.location}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Local do evento (opcional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Descrição</Label>
                  <textarea
                    id="eventDescription"
                    value={newEventData.description}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do evento (opcional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Evento
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateEvent(false)}
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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getProviderIcon(integration.provider)}
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
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                        
                        {integration.syncErrors > 0 && (
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
                        <span>Última sync: {formatDate(integration.lastSyncAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Conectado: {formatDate(integration.createdAt)}</span>
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
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Sync
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => {
                const isConnected = integrations.some(i => i.provider === provider.id);
                
                return (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">
                          {getProviderIcon(provider.id)}
                        </span>
                        <div>
                          <CardTitle>{provider.name}</CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Recursos:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {provider.features.map((feature, index) => (
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
                        ) : isConnected ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        {isConnected ? 'Já Conectado' : 'Conectar'}
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
                    Para conectar calendários externos, as seguintes variáveis de ambiente precisam ser configuradas no servidor:
                  </p>
                  <ul className="text-sm text-amber-600 space-y-1">
                    <li>• <code>GOOGLE_CALENDAR_CLIENT_ID</code> e <code>GOOGLE_CALENDAR_CLIENT_SECRET</code></li>
                    <li>• <code>MICROSOFT_CALENDAR_CLIENT_ID</code> e <code>MICROSOFT_CALENDAR_CLIENT_SECRET</code></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}