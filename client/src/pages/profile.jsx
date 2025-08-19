/**
 * PÁGINA DE PERFIL DE USUÁRIO PERSONALIZADA
 * Interface completa para gerenciamento de perfil e configurações
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import
  {
    User, Camera, Upload, Save, Edit, Settings, Bell,
    Shield, Activity, Calendar, Clock, MapPin, Phone,
    Mail, Globe, Github, Linkedin, Twitter, Eye, EyeOff,
    Download, Trash2, Star, Award, TrendingUp, BarChart3
  } from 'lucide-react';

export default function Profile()
{
  const { user, tenant, updateUser } = useAuth();
  const [ activeTab, setActiveTab ] = useState( 'profile' );
  const [ loading, setLoading ] = useState( false );
  const [ profileData, setProfileData ] = useState( {
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    theme: 'light',
    avatar: user?.avatar || 'https://github.com/victorcalife.png'
  } );

  const [ preferences, setPreferences ] = useState( {
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false,
    twoFactorAuth: false,
    publicProfile: false,
    showActivity: true,
    showStats: true
  } );

  const [ securityData, setSecurityData ] = useState( {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  } );

  const [ activityData, setActivityData ] = useState( [] );
  const [ statsData, setStatsData ] = useState( {} );
  const fileInputRef = useRef( null );

  useEffect( () =>
  {
    loadUserData();
    loadActivityData();
    loadStatsData();
  }, [] );

  const loadUserData = async () =>
  {
    try
    {
      // Simular carregamento de dados do usuário
      await new Promise( resolve => setTimeout( resolve, 500 ) );

      // Dados já estão no estado inicial
    } catch ( error )
    {
      console.error( 'Erro ao carregar dados do usuário:', error );
    }
  };

  const loadActivityData = async () =>
  {
    try
    {
      const mockActivity = [
        {
          id: 1,
          type: 'login',
          description: 'Login realizado',
          timestamp: new Date( Date.now() - 2 * 60 * 60 * 1000 ), // 2 horas atrás
          ip: '192.168.1.100',
          device: 'Chrome - Windows'
        },
        {
          id: 2,
          type: 'profile_update',
          description: 'Perfil atualizado',
          timestamp: new Date( Date.now() - 24 * 60 * 60 * 1000 ), // 1 dia atrás
          ip: '192.168.1.100',
          device: 'Chrome - Windows'
        },
        {
          id: 3,
          type: 'password_change',
          description: 'Senha alterada',
          timestamp: new Date( Date.now() - 7 * 24 * 60 * 60 * 1000 ), // 7 dias atrás
          ip: '192.168.1.100',
          device: 'Chrome - Windows'
        }
      ];

      setActivityData( mockActivity );
    } catch ( error )
    {
      console.error( 'Erro ao carregar atividades:', error );
    }
  };

  const loadStatsData = async () =>
  {
    try
    {
      const mockStats = {
        totalLogins: 247,
        lastLogin: new Date( Date.now() - 2 * 60 * 60 * 1000 ),
        accountAge: 45, // dias
        tasksCompleted: 156,
        projectsParticipated: 8,
        hoursWorked: 320,
        averageSessionTime: 4.2 // horas
      };

      setStatsData( mockStats );
    } catch ( error )
    {
      console.error( 'Erro ao carregar estatísticas:', error );
    }
  };

  const handleAvatarUpload = ( event ) =>
  {
    const file = event.target.files[ 0 ];
    if ( file )
    {
      if ( file.size > 5 * 1024 * 1024 )
      { // 5MB
        alert( 'Arquivo muito grande. Máximo 5MB.' );
        return;
      }

      const reader = new FileReader();
      reader.onload = ( e ) =>
      {
        setProfileData( prev => ( { ...prev, avatar: e.target.result } ) );
      };
      reader.readAsDataURL( file );
    }
  };

  const handleSaveProfile = async () =>
  {
    try
    {
      setLoading( true );

      // Simular salvamento
      await new Promise( resolve => setTimeout( resolve, 1000 ) );

      // Atualizar contexto de autenticação
      if ( updateUser )
      {
        updateUser( {
          ...user,
          name: profileData.name,
          email: profileData.email,
          avatar: profileData.avatar
        } );
      }

      alert( 'Perfil atualizado com sucesso!' );

    } catch ( error )
    {
      console.error( 'Erro ao salvar perfil:', error );
      alert( 'Erro ao salvar perfil' );
    } finally
    {
      setLoading( false );
    }
  };

  const handleSavePreferences = async () =>
  {
    try
    {
      setLoading( true );

      // Simular salvamento
      await new Promise( resolve => setTimeout( resolve, 1000 ) );

      alert( 'Preferências salvas com sucesso!' );

    } catch ( error )
    {
      console.error( 'Erro ao salvar preferências:', error );
      alert( 'Erro ao salvar preferências' );
    } finally
    {
      setLoading( false );
    }
  };

  const handleChangePassword = async () =>
  {
    if ( !securityData.currentPassword || !securityData.newPassword )
    {
      alert( 'Preencha todos os campos' );
      return;
    }

    if ( securityData.newPassword !== securityData.confirmPassword )
    {
      alert( 'Nova senha e confirmação não coincidem' );
      return;
    }

    if ( securityData.newPassword.length < 8 )
    {
      alert( 'Nova senha deve ter pelo menos 8 caracteres' );
      return;
    }

    try
    {
      setLoading( true );

      // Simular alteração de senha
      await new Promise( resolve => setTimeout( resolve, 1000 ) );

      setSecurityData( {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      } );

      alert( 'Senha alterada com sucesso!' );

    } catch ( error )
    {
      console.error( 'Erro ao alterar senha:', error );
      alert( 'Erro ao alterar senha' );
    } finally
    {
      setLoading( false );
    }
  };

  const getActivityIcon = ( type ) =>
  {
    const icons = {
      login: <User className="h-4 w-4" />,
      profile_update: <Edit className="h-4 w-4" />,
      password_change: <Shield className="h-4 w-4" />,
      task_completed: <Award className="h-4 w-4" />,
      project_joined: <Star className="h-4 w-4" />
    };
    return icons[ type ] || <Activity className="h-4 w-4" />;
  };

  const formatDate = ( date ) =>
  {
    return new Intl.DateTimeFormat( 'pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } ).format( date );
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar e informações básicas */ }
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Gerencie suas informações básicas e foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */ }
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={ profileData.avatar }
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <button
                onClick={ () => fileInputRef.current?.click() }
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={ fileInputRef }
                type="file"
                accept="image/*"
                onChange={ handleAvatarUpload }
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{ profileData.name }</h3>
              <p className="text-gray-600">{ profileData.email }</p>
              <p className="text-sm text-gray-500 mt-1">
                Membro desde { new Date( user?.created_at || Date.now() ).toLocaleDateString( 'pt-BR' ) }
              </p>
            </div>
          </div>

          {/* Formulário */ }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={ profileData.name }
                onChange={ ( e ) => setProfileData( prev => ( { ...prev, name: e.target.value } ) ) }
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={ profileData.email }
                onChange={ ( e ) => setProfileData( prev => ( { ...prev, email: e.target.value } ) ) }
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={ profileData.phone }
                onChange={ ( e ) => setProfileData( prev => ( { ...prev, phone: e.target.value } ) ) }
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={ profileData.location }
                onChange={ ( e ) => setProfileData( prev => ( { ...prev, location: e.target.value } ) ) }
                placeholder="São Paulo, Brasil"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={ profileData.bio }
              onChange={ ( e ) => setProfileData( prev => ( { ...prev, bio: e.target.value } ) ) }
              placeholder="Conte um pouco sobre você..."
              rows={ 3 }
            />
          </div>

          {/* Links sociais */ }
          <div className="space-y-4">
            <h4 className="font-medium">Links Sociais</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={ profileData.website }
                    onChange={ ( e ) => setProfileData( prev => ( { ...prev, website: e.target.value } ) ) }
                    placeholder="https://seusite.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="github">GitHub</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="github"
                    value={ profileData.github }
                    onChange={ ( e ) => setProfileData( prev => ( { ...prev, github: e.target.value } ) ) }
                    placeholder="github.com/usuario"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="linkedin"
                    value={ profileData.linkedin }
                    onChange={ ( e ) => setProfileData( prev => ( { ...prev, linkedin: e.target.value } ) ) }
                    placeholder="linkedin.com/in/usuario"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={ handleSaveProfile } disabled={ loading }>
              { loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-current mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Perfil
                </>
              ) }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Notificações */ }
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por Email</Label>
              <p className="text-sm text-gray-600">Receber notificações importantes por email</p>
            </div>
            <Switch
              checked={ preferences.emailNotifications }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, emailNotifications: checked } ) ) }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações Push</Label>
              <p className="text-sm text-gray-600">Receber notificações no navegador</p>
            </div>
            <Switch
              checked={ preferences.pushNotifications }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, pushNotifications: checked } ) ) }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Relatórios Semanais</Label>
              <p className="text-sm text-gray-600">Receber resumo semanal de atividades</p>
            </div>
            <Switch
              checked={ preferences.weeklyReports }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, weeklyReports: checked } ) ) }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Emails de Marketing</Label>
              <p className="text-sm text-gray-600">Receber novidades e promoções</p>
            </div>
            <Switch
              checked={ preferences.marketingEmails }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, marketingEmails: checked } ) ) }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacidade */ }
      <Card>
        <CardHeader>
          <CardTitle>Privacidade</CardTitle>
          <CardDescription>
            Controle a visibilidade das suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Perfil Público</Label>
              <p className="text-sm text-gray-600">Permitir que outros vejam seu perfil</p>
            </div>
            <Switch
              checked={ preferences.publicProfile }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, publicProfile: checked } ) ) }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar Atividade</Label>
              <p className="text-sm text-gray-600">Exibir suas atividades recentes</p>
            </div>
            <Switch
              checked={ preferences.showActivity }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, showActivity: checked } ) ) }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar Estatísticas</Label>
              <p className="text-sm text-gray-600">Exibir suas estatísticas de uso</p>
            </div>
            <Switch
              checked={ preferences.showStats }
              onCheckedChange={ ( checked ) => setPreferences( prev => ( { ...prev, showStats: checked } ) ) }
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações regionais */ }
      <Card>
        <CardHeader>
          <CardTitle>Configurações Regionais</CardTitle>
          <CardDescription>
            Configure idioma, fuso horário e formato de data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select value={ profileData.language } onValueChange={ ( value ) => setProfileData( prev => ( { ...prev, language: value } ) ) }>
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

            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={ profileData.timezone } onValueChange={ ( value ) => setProfileData( prev => ( { ...prev, timezone: value } ) ) }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="theme">Tema</Label>
            <Select value={ profileData.theme } onValueChange={ ( value ) => setProfileData( prev => ( { ...prev, theme: value } ) ) }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="auto">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={ handleSavePreferences } disabled={ loading }>
          { loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b border-current mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Preferências
            </>
          ) }
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */ }
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Meu Perfil
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */ }
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={ activeTab } onValueChange={ setActiveTab }>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            { renderProfileTab() }
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            { renderPreferencesTab() }
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            {/* Conteúdo da aba de segurança será implementado */ }
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie suas configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Funcionalidades de segurança em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {/* Conteúdo da aba de atividade será implementado */ }
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Histórico das suas atividades no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Histórico de atividades em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
