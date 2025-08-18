/**
 * SISTEMA DE CONEXÕES COM BANCOS EXTERNOS
 * Interface para gerenciar conexões com múltiplos SGBDs
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import
{
  Database, Plus, Settings, TestTube, Trash2, Edit,
  CheckCircle2, XCircle, AlertCircle, Eye, EyeOff,
  Server, Wifi, WifiOff, Copy, Download, Upload
} from 'lucide-react';

export default function DatabaseConnections()
{
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [ showConnectionModal, setShowConnectionModal ] = useState( false );
  const [ selectedConnection, setSelectedConnection ] = useState( null );
  const [ testingConnection, setTestingConnection ] = useState( null );
  const [ showPassword, setShowPassword ] = useState( {} );
  const [ connectionForm, setConnectionForm ] = useState( {
    name: '',
    type: 'postgresql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    ssl: false,
    description: '',
    tags: []
  } );

  // Query para listar conexões
  const { data: connectionsData, isLoading } = useQuery( {
    queryKey: [ 'database-connections' ],
    queryFn: async () =>
    {
      const response = await fetch( '/api/database-connections', {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar conexões' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Mutation para testar conexão
  const testConnectionMutation = useMutation( {
    mutationFn: async ( connectionId ) =>
    {
      const response = await fetch( `/api/database-connections/${ connectionId }/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao testar conexão' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      toast( {
        title: 'Conexão testada',
        description: 'Conexão estabelecida com sucesso!'
      } );
      queryClient.invalidateQueries( [ 'database-connections' ] );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro na conexão',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  const generateMockConnections = () =>
  {
    return [
      {
        id: 'conn-1',
        name: 'PostgreSQL Principal',
        type: 'postgresql',
        host: 'postgres.railway.internal',
        port: 5432,
        database: 'railway',
        username: 'postgres',
        status: 'connected',
        lastTested: new Date( Date.now() - 2 * 60 * 60 * 1000 ), // 2 horas atrás
        description: 'Banco principal do sistema TOIT Nexus',
        tags: [ 'production', 'main' ],
        ssl: true,
        createdAt: new Date( Date.now() - 7 * 24 * 60 * 60 * 1000 )
      },
      {
        id: 'conn-2',
        name: 'MySQL Analytics',
        type: 'mysql',
        host: 'mysql-analytics.company.com',
        port: 3306,
        database: 'analytics_db',
        username: 'analytics_user',
        status: 'disconnected',
        lastTested: new Date( Date.now() - 24 * 60 * 60 * 1000 ), // 1 dia atrás
        description: 'Banco de dados para análises e relatórios',
        tags: [ 'analytics', 'reporting' ],
        ssl: false,
        createdAt: new Date( Date.now() - 14 * 24 * 60 * 60 * 1000 )
      },
      {
        id: 'conn-3',
        name: 'MongoDB Logs',
        type: 'mongodb',
        host: 'mongodb.cluster.com',
        port: 27017,
        database: 'logs_db',
        username: 'logs_user',
        status: 'error',
        lastTested: new Date( Date.now() - 6 * 60 * 60 * 1000 ), // 6 horas atrás
        description: 'Banco NoSQL para armazenamento de logs',
        tags: [ 'logs', 'nosql' ],
        ssl: true,
        createdAt: new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 )
      }
    ];
  };

  const databaseTypes = [
    { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', defaultPort: 5432 },
    { value: 'mysql', label: 'MySQL', icon: '🐬', defaultPort: 3306 },
    { value: 'mongodb', label: 'MongoDB', icon: '🍃', defaultPort: 27017 },
    { value: 'sqlserver', label: 'SQL Server', icon: '🏢', defaultPort: 1433 },
    { value: 'oracle', label: 'Oracle', icon: '🔴', defaultPort: 1521 },
    { value: 'redis', label: 'Redis', icon: '🔴', defaultPort: 6379 },
    { value: 'sqlite', label: 'SQLite', icon: '📁', defaultPort: null }
  ];

  const getStatusColor = ( status ) =>
  {
    const colors = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      testing: 'bg-yellow-100 text-yellow-800'
    };
    return colors[ status ] || colors.disconnected;
  };

  const getStatusIcon = ( status ) =>
  {
    const icons = {
      connected: <CheckCircle2 className="h-4 w-4" />,
      disconnected: <XCircle className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      testing: <TestTube className="h-4 w-4" />
    };
    return icons[ status ] || icons.disconnected;
  };

  const handleCreateConnection = () =>
  {
    setConnectionForm( {
      name: '',
      type: 'postgresql',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
      ssl: false,
      description: '',
      tags: []
    } );
    setSelectedConnection( null );
    setShowConnectionModal( true );
  };

  const handleEditConnection = ( connection ) =>
  {
    setConnectionForm( {
      name: connection.name,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: '••••••••', // Não mostrar senha real
      ssl: connection.ssl,
      description: connection.description,
      tags: connection.tags
    } );
    setSelectedConnection( connection );
    setShowConnectionModal( true );
  };

  const handleTestConnection = async ( connectionId ) =>
  {
    setTestingConnection( connectionId );
    testConnectionMutation.mutate( connectionId, {
      onSettled: () =>
      {
        setTestingConnection( null );
      }
    } );
  };

  const handleSaveConnection = async () =>
  {
    try
    {
      // Simular salvamento
      await new Promise( resolve => setTimeout( resolve, 1000 ) );

      if ( selectedConnection )
      {
        // Editar conexão existente
        setConnections( prev => prev.map( conn =>
          conn.id === selectedConnection.id
            ? { ...conn, ...connectionForm, updatedAt: new Date() }
            : conn
        ) );
      } else
      {
        // Criar nova conexão
        const newConnection = {
          id: `conn-${ Date.now() }`,
          ...connectionForm,
          status: 'disconnected',
          lastTested: null,
          createdAt: new Date()
        };
        setConnections( prev => [ ...prev, newConnection ] );
      }

      setShowConnectionModal( false );
      alert( 'Conexão salva com sucesso!' );

    } catch ( error )
    {
      console.error( 'Erro ao salvar conexão:', error );
      alert( 'Erro ao salvar conexão' );
    }
  };

  const handleDeleteConnection = async ( connectionId ) =>
  {
    if ( !confirm( 'Tem certeza que deseja deletar esta conexão?' ) ) return;

    try
    {
      setConnections( prev => prev.filter( conn => conn.id !== connectionId ) );
      alert( 'Conexão deletada com sucesso!' );
    } catch ( error )
    {
      console.error( 'Erro ao deletar conexão:', error );
      alert( 'Erro ao deletar conexão' );
    }
  };

  const togglePasswordVisibility = ( connectionId ) =>
  {
    setShowPassword( prev => ( {
      ...prev,
      [ connectionId ]: !prev[ connectionId ]
    } ) );
  };

  const formatLastTested = ( date ) =>
  {
    if ( !date ) return 'Nunca testado';

    const now = new Date();
    const diffHours = ( now - date ) / ( 1000 * 60 * 60 );

    if ( diffHours < 1 )
    {
      return 'Testado agora há pouco';
    } else if ( diffHours < 24 )
    {
      return `Testado há ${ Math.floor( diffHours ) }h`;
    } else
    {
      return `Testado há ${ Math.floor( diffHours / 24 ) } dias`;
    }
  };

  const renderConnectionModal = () =>
  {
    if ( !showConnectionModal ) return null;

    const selectedType = databaseTypes.find( type => type.value === connectionForm.type );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                { selectedConnection ? 'Editar Conexão' : 'Nova Conexão' }
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={ () => setShowConnectionModal( false ) }
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Nome da conexão */ }
              <div>
                <Label htmlFor="name">Nome da Conexão *</Label>
                <Input
                  id="name"
                  value={ connectionForm.name }
                  onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, name: e.target.value } ) ) }
                  placeholder="Ex: PostgreSQL Principal"
                />
              </div>

              {/* Tipo de banco */ }
              <div>
                <Label htmlFor="type">Tipo de Banco *</Label>
                <Select
                  value={ connectionForm.type }
                  onValueChange={ ( value ) =>
                  {
                    const type = databaseTypes.find( t => t.value === value );
                    setConnectionForm( prev => ( {
                      ...prev,
                      type: value,
                      port: type?.defaultPort || ''
                    } ) );
                  } }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    { databaseTypes.map( type => (
                      <SelectItem key={ type.value } value={ type.value }>
                        <div className="flex items-center gap-2">
                          <span>{ type.icon }</span>
                          <span>{ type.label }</span>
                        </div>
                      </SelectItem>
                    ) ) }
                  </SelectContent>
                </Select>
              </div>

              {/* Host e Porta */ }
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    value={ connectionForm.host }
                    onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, host: e.target.value } ) ) }
                    placeholder="localhost ou IP do servidor"
                  />
                </div>

                <div>
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    value={ connectionForm.port }
                    onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, port: e.target.value } ) ) }
                    placeholder={ selectedType?.defaultPort?.toString() || '' }
                  />
                </div>
              </div>

              {/* Database */ }
              <div>
                <Label htmlFor="database">Nome do Banco *</Label>
                <Input
                  id="database"
                  value={ connectionForm.database }
                  onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, database: e.target.value } ) ) }
                  placeholder="Nome do banco de dados"
                />
              </div>

              {/* Credenciais */ }
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Usuário *</Label>
                  <Input
                    id="username"
                    value={ connectionForm.username }
                    onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, username: e.target.value } ) ) }
                    placeholder="Nome do usuário"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={ showPassword.form ? 'text' : 'password' }
                      value={ connectionForm.password }
                      onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, password: e.target.value } ) ) }
                      placeholder="Senha do usuário"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={ () => togglePasswordVisibility( 'form' ) }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      { showPassword.form ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" /> }
                    </button>
                  </div>
                </div>
              </div>

              {/* SSL */ }
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={ connectionForm.ssl }
                  onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, ssl: e.target.checked } ) ) }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ssl">Usar SSL/TLS</Label>
              </div>

              {/* Descrição */ }
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={ connectionForm.description }
                  onChange={ ( e ) => setConnectionForm( prev => ( { ...prev, description: e.target.value } ) ) }
                  placeholder="Descrição opcional da conexão"
                  rows={ 3 }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={ () => setShowConnectionModal( false ) }>
                Cancelar
              </Button>
              <Button onClick={ handleSaveConnection }>
                { selectedConnection ? 'Atualizar' : 'Criar' } Conexão
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Obter dados das queries
  const connections = connectionsData?.data?.connections || [];

  if ( isLoading )
  {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conexões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */ }
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Conexões de Banco
              </h1>
              <Badge variant="secondary">
                { connections.length } conexão(ões)
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>

              <Button onClick={ handleCreateConnection }>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conexão
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */ }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas rápidas */ }
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{ connections.length }</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wifi className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conectadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    { connections.filter( c => c.status === 'connected' ).length }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <WifiOff className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Desconectadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    { connections.filter( c => c.status === 'disconnected' ).length }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Com Erro</p>
                  <p className="text-2xl font-bold text-gray-900">
                    { connections.filter( c => c.status === 'error' ).length }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de conexões */ }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          { connections.map( connection =>
          {
            const dbType = databaseTypes.find( type => type.value === connection.type );

            return (
              <Card key={ connection.id } className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{ dbType?.icon }</div>
                      <div>
                        <CardTitle className="text-lg">{ connection.name }</CardTitle>
                        <CardDescription>{ dbType?.label }</CardDescription>
                      </div>
                    </div>

                    <Badge className={ getStatusColor( connection.status ) }>
                      <div className="flex items-center gap-1">
                        { getStatusIcon( connection.status ) }
                        <span className="capitalize">{ connection.status }</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Informações da conexão */ }
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          { connection.host }:{ connection.port }
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{ connection.database }</span>
                      </div>
                    </div>

                    {/* Tags */ }
                    { connection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        { connection.tags.map( tag => (
                          <Badge key={ tag } variant="outline" className="text-xs">
                            { tag }
                          </Badge>
                        ) ) }
                      </div>
                    ) }

                    {/* Descrição */ }
                    { connection.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        { connection.description }
                      </p>
                    ) }

                    {/* Último teste */ }
                    <div className="text-xs text-gray-500">
                      { formatLastTested( connection.lastTested ) }
                    </div>

                    {/* Ações */ }
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={ () => handleTestConnection( connection.id ) }
                        disabled={ testingConnection === connection.id }
                      >
                        { testingConnection === connection.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-2"></div>
                            Testando...
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4 mr-2" />
                            Testar
                          </>
                        ) }
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={ () => handleEditConnection( connection ) }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={ () => handleDeleteConnection( connection.id ) }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          } ) }

          {/* Card para adicionar nova conexão */ }
          <Card
            className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
            onClick={ handleCreateConnection }
          >
            <CardContent className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Adicionar Nova Conexão</p>
                <p className="text-sm text-gray-500">Conecte-se a bancos externos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de conexão */ }
      { renderConnectionModal() }
    </div>
  );
}
