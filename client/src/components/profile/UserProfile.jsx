/**
 * USER PROFILE - Componente de perfil de usuário profissional
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {  












 }
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserProfile({ 
  user, 
  isEditing = false, 
  onSave, 
  onCancel,
  onEdit 
}) {
  const [editMode, setEditMode] = useState(isEditing);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    department: user?.department || '',
    role: user?.role || '',
    profileImage: user?.profileImage || null
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Atualizar campo do formulário
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Upload de avatar
  const handleAvatarUpload = async (event) => ({ const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e }) => {
        updateField('profileImage', e.target.result);
      };
      reader.readAsDataURL(file);

      // Aqui você faria o upload real para o servidor
      console.log('Uploading avatar:', file.name);
      
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar perfil
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(formData);
      }
      
      setEditMode(false);
      console.log('Perfil salvo:', formData);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      department: user?.department || '',
      role: user?.role || '',
      profileImage: user?.profileImage || null
    });
    setEditMode(false);
    
    if (onCancel) {
      onCancel();
    }
  };

  // Obter iniciais do usuário
  const getUserInitials = () => {
    const name = formData.name || user?.name || 'Usuario';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="relative inline-block">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage 
              src={formData.profileImage || user?.profileImage} 
              alt="Avatar do usuário" 
            />
            <AvatarFallback className="text-2xl bg-primary-100 text-primary-700">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          ({ editMode && (
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={( }) => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="mt-4">
          {editMode ? (
            <Input
              value={formData.name}
              onChange=({ (e }) => updateField('name', e.target.value)}
              className="text-center text-xl font-semibold"
              placeholder="Nome completo"
            />
          ) : (
            <CardTitle className="text-2xl">{formData.name || 'Nome não informado'}</CardTitle>
          )}
          
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Badge variant="secondary">{formData.role || 'Usuário'}</Badge>
            <Badge variant="outline">{formData.department || 'Departamento'}</Badge>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-center space-x-2 mt-4">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />

              </Button>
            </>
          ) : (
            <Button onClick=({ ( }) => setEditMode(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Aba Informações */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                {editMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange=({ (e }) => updateField('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{formData.email || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                {editMode ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange=({ (e }) => updateField('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{formData.phone || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                {editMode ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange=({ (e }) => updateField('location', e.target.value)}
                    placeholder="Cidade, Estado"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{formData.location || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="department">Departamento</Label>
                {editMode ? (
                  <Input
                    id="department"
                    value={formData.department}
                    onChange=({ (e }) => updateField('department', e.target.value)}
                    placeholder="Tecnologia"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span>{formData.department || 'Não informado'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              {editMode ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange=({ (e }) => updateField('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                />
              ) : (
                <p className="mt-1 text-gray-700">
                  {formData.bio || 'Nenhuma biografia informada.'}
                </p>
              )}
            </div>
          </TabsContent>

          {/* Aba Contato */}
          <TabsContent value="contact" className="space-y-4">
            <div className="text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
              <p>Gerencie suas informações de contato e preferências de comunicação.</p>
            </div>
          </TabsContent>

          {/* Aba Atividade */}
          <TabsContent value="activity" className="space-y-4">
            <div className="text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Atividade Recente</h3>
              <p>Visualize suas atividades e interações recentes no sistema.</p>
            </div>
          </TabsContent>

          {/* Aba Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <div className="text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Configurações</h3>
              <p>Personalize suas preferências e configurações de conta.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Input oculto para upload de arquivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />
    </Card>
  );
}
