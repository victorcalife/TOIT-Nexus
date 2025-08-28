/**
 * Página de Email - Gerenciamento de emails e comunicações
 * Sistema TOIT Nexus - Módulo Cliente
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {  
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Trash2, 
  Star, 
  Search,
  Plus,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  MoreHorizontal,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const EmailPage = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    body: '',
    attachments: []
  });

  // Dados simulados de emails
  const mockEmails = [
    {
      id: 1,
      from: 'joao.silva@empresa.com',
      to: 'usuario@toit.com',
      subject: 'Relatório Mensal - Novembro 2024',
      body: 'Segue em anexo o relatório mensal com os indicadores de performance...',
      date: '2024-01-15T10:30:00Z',
      read: false,
      starred: true,
      folder: 'inbox',
      attachments: ['relatorio_novembro.pdf'],
      priority: 'high'
    },
    {
      id: 2,
      from: 'maria.santos@cliente.com',
      to: 'usuario@toit.com',
      subject: 'Dúvidas sobre integração',
      body: 'Olá, tenho algumas dúvidas sobre o processo de integração...',
      date: '2024-01-15T09:15:00Z',
      read: true,
      starred: false,
      folder: 'inbox',
      attachments: [],
      priority: 'medium'
    },
    {
      id: 3,
      from: 'sistema@toit.com',
      to: 'usuario@toit.com',
      subject: 'Backup realizado com sucesso',
      body: 'O backup automático foi realizado com sucesso às 02:00...',
      date: '2024-01-15T02:00:00Z',
      read: true,
      starred: false,
      folder: 'inbox',
      attachments: [],
      priority: 'low'
    }
  ];

  useEffect(() => {
    setEmails(mockEmails);
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = email.folder === activeTab;
    return matchesSearch && matchesFolder;
  });

  const handleSendEmail = () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.body) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const emailToSend = {
      id: emails.length + 1,
      from: 'usuario@toit.com',
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent',
      attachments: newEmail.attachments,
      priority: 'medium'
    };

    setEmails([...emails, emailToSend]);
    setNewEmail({ to: '', subject: '', body: '', attachments: [] });
    setIsComposing(false);
    toast.success('Email enviado com sucesso!');
  };

  const handleMarkAsRead = (emailId) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  const handleStarEmail = (emailId) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  const handleDeleteEmail = (emailId) => {
    setEmails(emails.filter(email => email.id !== emailId));
    setSelectedEmail(null);
    toast.success('Email excluído com sucesso!');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
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
          <h1 className="text-3xl font-bold text-gray-900">Email</h1>
          <p className="text-gray-600">Gerencie suas comunicações e mensagens</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsComposing(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Email
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="grid w-full grid-cols-1 gap-2">
                  <TabsTrigger value="inbox" className="flex items-center gap-2 justify-start">
                    <Inbox className="h-4 w-4" />
                    Caixa de Entrada
                    <Badge variant="secondary" className="ml-auto">
                      {emails.filter(e => e.folder === 'inbox' && !e.read).length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2 justify-start">
                    <Send className="h-4 w-4" />
                    Enviados
                  </TabsTrigger>
                  <TabsTrigger value="starred" className="flex items-center gap-2 justify-start">
                    <Star className="h-4 w-4" />
                    Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="archive" className="flex items-center gap-2 justify-start">
                    <Archive className="h-4 w-4" />
                    Arquivados
                  </TabsTrigger>
                  <TabsTrigger value="trash" className="flex items-center gap-2 justify-start">
                    <Trash2 className="h-4 w-4" />
                    Lixeira
                  </TabsTrigger>

                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {activeTab === 'inbox' && 'Caixa de Entrada'}
                {activeTab === 'sent' && 'Enviados'}
                {activeTab === 'starred' && 'Favoritos'}
                {activeTab === 'archive' && 'Arquivados'}
                {activeTab === 'trash' && 'Lixeira'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                    } ${!email.read ? 'font-semibold bg-blue-25' : ''}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      handleMarkAsRead(email.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {email.from}
                          </span>
                          {email.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          <Badge className={getPriorityColor(email.priority)}>
                            {email.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900 truncate mt-1">
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {email.body}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(email.date)}
                          </span>
                          {email.attachments.length > 0 && (
                            <Paperclip className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Content */}
        <div className="col-span-5">
          {selectedEmail ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedEmail.subject}</CardTitle>
                    <CardDescription>
                      De: {selectedEmail.from} • {formatDate(selectedEmail.date)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStarEmail(selectedEmail.id)}
                    >
                      <Star className={`h-4 w-4 ${selectedEmail.starred ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ReplyAll className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedEmail.body}
                    </p>
                  </div>
                  
                  {selectedEmail.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Anexos</h4>
                      <div className="space-y-2">
                        {selectedEmail.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{attachment}</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              Baixar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Selecione um email para visualizar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Novo Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Para:</label>
                <Input
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                  placeholder="destinatario@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Assunto:</label>
                <Input
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  placeholder="Assunto do email"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mensagem:</label>
                <Textarea
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                  placeholder="Digite sua mensagem..."
                  rows={8}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Anexar Arquivo
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsComposing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendEmail} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>

              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmailPage;
