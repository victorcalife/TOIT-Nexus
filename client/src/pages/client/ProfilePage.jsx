/**
 * Página de Perfil - Gerenciamento de perfil do usuário
 * Sistema TOIT Nexus - Módulo Cliente
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {  
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Key,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Save,
  Edit,
  Settings,
  Lock,
  Globe,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState({
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '+55 11 99999-9999',
    avatar: '',
    position: 'Analista de Sistemas',
    department: 'Tecnologia da Informação',
    location: 'São Paulo, SP',
    bio: 'Desenvolvedor full-stack com 5 anos de experiência em React e Node.js.',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-15T10:30:00Z',
    status: 'online',
    permissions: ['read', 'write', 'admin'],
    preferences: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        statusVisible: true,
        lastSeenVisible: false
      }
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveProfile = () => {
    // Validações básicas
    if (!userProfile.name || !userProfile.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    // Simular salvamento
    setTimeout(() => {
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    }, 1000);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Preencha todos os campos de senha');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Simular alteração de senha
    setTimeout(() => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Senha alterada com sucesso!');
    }, 1000);
  };

  const handleUpdatePreferences = (section, key, value) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section],
          [key]: value
        }
      }
    }));
    toast.success('Preferência atualizada!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Summary */}
        <div className="col-span-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="text-2xl">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(userProfile.status)}`}></div>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{userProfile.name}</h2>
                  <p className="text-gray-600">{userProfile.position}</p>
                  <p className="text-sm text-gray-500">{userProfile.department}</p>
                </div>

                <div className="flex flex-wrap gap-1 justify-center">
                  {userProfile.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Membro desde {formatDate(userProfile.joinDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Último acesso: {formatDateTime(userProfile.lastLogin)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                      <Input
                        value={userProfile.name}
                        onChange={ (e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <Input
                        value={userProfile.email}
                        onChange={ (e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Telefone</label>
                      <Input
                        value={userProfile.phone}
                        onChange={ (e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Localização</label>
                      <Input
                        value={userProfile.location}
                        onChange={ (e) => setUserProfile({ ...userProfile, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cargo</label>
                      <Input
                        value={userProfile.position}
                        onChange={ (e) => setUserProfile({ ...userProfile, position: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Departamento</label>
                      <Input
                        value={userProfile.department}
                        onChange={ (e) => setUserProfile({ ...userProfile, department: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Biografia</label>
                    <Textarea
                      value={userProfile.bio}
                      onChange={ (e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Senha Atual</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={ (e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={ (e) => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nova Senha</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={ (e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Digite a nova senha"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={ (e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                  
                  <Button onClick={handleChangePassword} className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Autenticação de Dois Fatores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-gray-600">Adicione uma camada extra de segurança à sua conta</p>
                    </div>
                   

                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Preferências de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-gray-600">Receber notificações importantes por email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.notifications.email}
                      onChange={ (e) => handleUpdatePreferences('notifications', 'email', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Notificações Push</p>
                        <p className="text-sm text-gray-600">Receber notificações push no navegador</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.notifications.push}
                      onChange={ (e) => handleUpdatePreferences('notifications', 'push', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Notificações SMS</p>
                        <p className="text-sm text-gray-600">Receber notificações importantes por SMS</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.notifications.sms}
                      onChange={ (e) => handleUpdatePreferences('notifications', 'sms', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Configurações de Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Perfil Visível</p>
                      <p className="text-sm text-gray-600">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.privacy.profileVisible}
                      onChange={ (e) => handleUpdatePreferences('privacy', 'profileVisible', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Status Visível</p>
                      <p className="text-sm text-gray-600">Mostrar seu status online/offline para outros</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.privacy.statusVisible}
                      onChange={ (e) => handleUpdatePreferences('privacy', 'statusVisible', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Último Acesso Visível</p>
                      <p className="text-sm text-gray-600">Mostrar quando você esteve online pela última vez</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.privacy.lastSeenVisible}
                      onChange={ (e) => handleUpdatePreferences('privacy', 'lastSeenVisible', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Preferências Regionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Idioma</label>
                    <select
                      value={userProfile.preferences.language}
                      onChange={ (e) => handleUpdatePreferences('', 'language', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fuso Horário</label>
                    <select
                      value={userProfile.preferences.timezone}
                      onChange={ (e) => handleUpdatePreferences('', 'timezone', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;