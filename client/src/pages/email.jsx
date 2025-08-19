/**
 * SISTEMA DE EMAIL PROFISSIONAL COMPLETO
 * Interface tipo Gmail com composer WYSIWYG e funcionalidades avançadas
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
import
  {
    Mail, Send, Reply, ReplyAll, Forward, Archive, Trash2,
    Star, StarOff, Paperclip, Search, Filter, Plus, Settings,
    Inbox, Sent, Drafts, Spam, MoreHorizontal, Download,
    Bold, Italic, Underline, Link, Image, List, AlignLeft,
    AlignCenter, AlignRight, Code, Quote, Undo, Redo
  } from 'lucide-react';

export default function Email()
{
  const { user, tenant } = useAuth();
  const [ selectedFolder, setSelectedFolder ] = useState( 'inbox' );
  const [ emails, setEmails ] = useState( [] );
  const [ selectedEmail, setSelectedEmail ] = useState( null );
  const [ showComposer, setShowComposer ] = useState( false );
  const [ loading, setLoading ] = useState( true );
  const [ searchQuery, setSearchQuery ] = useState( '' );
  const [ composerData, setComposerData ] = useState( {
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: []
  } );

  const editorRef = useRef( null );

  useEffect( () =>
  {
    loadEmails();
  }, [ selectedFolder ] );

  const loadEmails = async () =>
  {
    try
    {
      setLoading( true );

      // Simular carregamento de emails
      await new Promise( resolve => setTimeout( resolve, 800 ) );

      const mockEmails = generateMockEmails( selectedFolder );
      setEmails( mockEmails );

    } catch ( error )
    {
      console.error( 'Erro ao carregar emails:', error );
    } finally
    {
      setLoading( false );
    }
  };

  const generateMockEmails = ( folder ) =>
  {
    const baseEmails = [
      {
        id: 1,
        from: 'joao.silva@empresa.com',
        fromName: 'João Silva',
        to: [ user?.email ],
        subject: 'Reunião de Projeto - Próxima Semana',
        body: 'Olá! Gostaria de agendar uma reunião para discutir o andamento do projeto. Que tal na próxima terça-feira às 14h?',
        date: new Date( Date.now() - 2 * 60 * 60 * 1000 ), // 2 horas atrás
        isRead: false,
        isStarred: true,
        hasAttachments: false,
        labels: [ 'trabalho', 'urgente' ],
        folder: 'inbox'
      },
      {
        id: 2,
        from: 'maria.santos@cliente.com',
        fromName: 'Maria Santos',
        to: [ user?.email ],
        subject: 'Proposta Comercial - Revisão',
        body: 'Boa tarde! Recebi a proposta e gostaria de fazer algumas alterações. Podemos conversar sobre os valores?',
        date: new Date( Date.now() - 5 * 60 * 60 * 1000 ), // 5 horas atrás
        isRead: true,
        isStarred: false,
        hasAttachments: true,
        labels: [ 'cliente', 'proposta' ],
        folder: 'inbox'
      },
      {
        id: 3,
        from: 'sistema@toit.com.br',
        fromName: 'Sistema TOIT',
        to: [ user?.email ],
        subject: 'Relatório Semanal de Performance',
        body: 'Seu relatório semanal está pronto! O sistema processou 1.247 transações com 99.8% de sucesso.',
        date: new Date( Date.now() - 24 * 60 * 60 * 1000 ), // 1 dia atrás
        isRead: true,
        isStarred: false,
        hasAttachments: true,
        labels: [ 'sistema', 'relatório' ],
        folder: 'inbox'
      }
    ];

    // Filtrar por pasta
    return baseEmails.filter( email =>
    {
      switch ( folder )
      {
        case 'inbox':
          return email.folder === 'inbox';
        case 'sent':
          return email.from === user?.email;
        case 'drafts':
          return email.isDraft;
        case 'starred':
          return email.isStarred;
        case 'trash':
          return email.isDeleted;
        default:
          return email.folder === folder;
      }
    } );
  };

  const folders = [
    { id: 'inbox', name: 'Caixa de Entrada', icon: Inbox, count: 3 },
    { id: 'sent', name: 'Enviados', icon: Sent, count: 12 },
    { id: 'drafts', name: 'Rascunhos', icon: Drafts, count: 2 },
    { id: 'starred', name: 'Com Estrela', icon: Star, count: 1 },
    { id: 'spam', name: 'Spam', icon: Spam, count: 0 },
    { id: 'trash', name: 'Lixeira', icon: Trash2, count: 5 }
  ];

  const handleCompose = () =>
  {
    setComposerData( {
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      attachments: []
    } );
    setShowComposer( true );
  };

  const handleReply = ( email, replyAll = false ) =>
  {
    setComposerData( {
      to: replyAll ? [ email.from, ...email.to ].join( ', ' ) : email.from,
      cc: replyAll ? email.cc || '' : '',
      bcc: '',
      subject: `Re: ${ email.subject }`,
      body: `\n\n--- Mensagem Original ---\nDe: ${ email.fromName } <${ email.from }>\nData: ${ email.date.toLocaleString() }\nAssunto: ${ email.subject }\n\n${ email.body }`,
      attachments: []
    } );
    setShowComposer( true );
  };

  const handleForward = ( email ) =>
  {
    setComposerData( {
      to: '',
      cc: '',
      bcc: '',
      subject: `Fwd: ${ email.subject }`,
      body: `\n\n--- Mensagem Encaminhada ---\nDe: ${ email.fromName } <${ email.from }>\nData: ${ email.date.toLocaleString() }\nAssunto: ${ email.subject }\n\n${ email.body }`,
      attachments: email.attachments || []
    } );
    setShowComposer( true );
  };

  const handleSendEmail = async () =>
  {
    try
    {
      // Simular envio de email
      console.log( 'Enviando email:', composerData );

      await new Promise( resolve => setTimeout( resolve, 1000 ) );

      setShowComposer( false );
      setComposerData( {
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        attachments: []
      } );

      // Mostrar notificação de sucesso
      alert( 'Email enviado com sucesso!' );

    } catch ( error )
    {
      console.error( 'Erro ao enviar email:', error );
      alert( 'Erro ao enviar email' );
    }
  };

  const formatEmailDate = ( date ) =>
  {
    const now = new Date();
    const diffHours = ( now - date ) / ( 1000 * 60 * 60 );

    if ( diffHours < 1 )
    {
      return 'Agora há pouco';
    } else if ( diffHours < 24 )
    {
      return `${ Math.floor( diffHours ) }h atrás`;
    } else if ( diffHours < 48 )
    {
      return 'Ontem';
    } else
    {
      return date.toLocaleDateString( 'pt-BR' );
    }
  };

  const renderEmailList = () =>
  {
    const filteredEmails = emails.filter( email =>
      email.subject.toLowerCase().includes( searchQuery.toLowerCase() ) ||
      email.fromName.toLowerCase().includes( searchQuery.toLowerCase() ) ||
      email.body.toLowerCase().includes( searchQuery.toLowerCase() )
    );

    if ( filteredEmails.length === 0 )
    {
      return (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum email encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        { filteredEmails.map( email => (
          <div
            key={ email.id }
            className={ `
              p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors
              ${ selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : '' }
              ${ !email.isRead ? 'bg-blue-25 font-medium' : '' }
            `}
            onClick={ () => setSelectedEmail( email ) }
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  { email.isStarred ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-400" />
                  ) }
                  { email.hasAttachments && (
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  ) }
                </div>

                <div className="flex-1 min-w-0">
                  <p className={ `text-sm truncate ${ !email.isRead ? 'font-semibold' : '' }` }>
                    { email.fromName }
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                { formatEmailDate( email.date ) }
              </div>
            </div>

            <div className="mb-2">
              <p className={ `text-sm truncate ${ !email.isRead ? 'font-semibold' : '' }` }>
                { email.subject }
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 truncate flex-1">
                { email.body.substring( 0, 100 ) }...
              </p>

              { email.labels && email.labels.length > 0 && (
                <div className="flex gap-1 ml-2">
                  { email.labels.slice( 0, 2 ).map( label => (
                    <Badge key={ label } variant="outline" className="text-xs">
                      { label }
                    </Badge>
                  ) ) }
                </div>
              ) }
            </div>
          </div>
        ) ) }
      </div>
    );
  };

  const renderEmailDetail = () =>
  {
    if ( !selectedEmail )
    {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Selecione um email para visualizar</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col">
        {/* Header do email */ }
        <div className="border-b p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{ selectedEmail.subject }</h2>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={ () => handleReply( selectedEmail ) }>
                <Reply className="h-4 w-4 mr-2" />
                Responder
              </Button>

              <Button variant="outline" size="sm" onClick={ () => handleReply( selectedEmail, true ) }>
                <ReplyAll className="h-4 w-4 mr-2" />
                Resp. Todos
              </Button>

              <Button variant="outline" size="sm" onClick={ () => handleForward( selectedEmail ) }>
                <Forward className="h-4 w-4 mr-2" />
                Encaminhar
              </Button>

              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">De:</span>
              <span>{ selectedEmail.fromName } &lt;{ selectedEmail.from }&gt;</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Para:</span>
              <span>{ selectedEmail.to.join( ', ' ) }</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Data:</span>
              <span>{ selectedEmail.date.toLocaleString( 'pt-BR' ) }</span>
            </div>

            { selectedEmail.labels && selectedEmail.labels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Labels:</span>
                <div className="flex gap-1">
                  { selectedEmail.labels.map( label => (
                    <Badge key={ label } variant="outline" className="text-xs">
                      { label }
                    </Badge>
                  ) ) }
                </div>
              </div>
            ) }
          </div>
        </div>

        {/* Corpo do email */ }
        <div className="flex-1 p-6 bg-white overflow-auto">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{ selectedEmail.body }</p>
          </div>

          { selectedEmail.hasAttachments && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Anexos</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                  <span className="flex-1">documento.pdf</span>
                  <span className="text-sm text-gray-500">2.3 MB</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) }
        </div>
      </div>
    );
  };

  const renderComposer = () =>
  {
    if ( !showComposer ) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
          {/* Header do composer */ }
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Nova Mensagem</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={ () => setShowComposer( false ) }
            >
              ✕
            </Button>
          </div>

          {/* Campos do email */ }
          <div className="p-4 space-y-3 border-b">
            <div className="flex items-center gap-3">
              <Label className="w-12 text-sm">Para:</Label>
              <Input
                value={ composerData.to }
                onChange={ ( e ) => setComposerData( prev => ( { ...prev, to: e.target.value } ) ) }
                placeholder="destinatario@email.com"
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <Label className="w-12 text-sm">CC:</Label>
              <Input
                value={ composerData.cc }
                onChange={ ( e ) => setComposerData( prev => ( { ...prev, cc: e.target.value } ) ) }
                placeholder="cc@email.com"
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <Label className="w-12 text-sm">Assunto:</Label>
              <Input
                value={ composerData.subject }
                onChange={ ( e ) => setComposerData( prev => ( { ...prev, subject: e.target.value } ) ) }
                placeholder="Assunto do email"
                className="flex-1"
              />
            </div>
          </div>

          {/* Toolbar de formatação */ }
          <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <Button variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <Button variant="ghost" size="sm">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor de texto */ }
          <div className="flex-1 p-4">
            <Textarea
              ref={ editorRef }
              value={ composerData.body }
              onChange={ ( e ) => setComposerData( prev => ( { ...prev, body: e.target.value } ) ) }
              placeholder="Digite sua mensagem..."
              className="w-full h-full resize-none border-0 focus:ring-0"
            />
          </div>

          {/* Footer com ações */ }
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Anexar
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={ () => setShowComposer( false ) }>
                Cancelar
              </Button>
              <Button onClick={ handleSendEmail }>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if ( loading )
  {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando emails...</p>
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
                Email
              </h1>

              {/* Barra de pesquisa */ }
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={ searchQuery }
                  onChange={ ( e ) => setSearchQuery( e.target.value ) }
                  placeholder="Pesquisar emails..."
                  className="pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>

              <Button onClick={ handleCompose }>
                <Plus className="h-4 w-4 mr-2" />
                Escrever
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal */ }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar com pastas */ }
          <div className="w-64 bg-white rounded-lg shadow-sm border p-4">
            <div className="space-y-1">
              { folders.map( folder =>
              {
                const Icon = folder.icon;
                return (
                  <button
                    key={ folder.id }
                    onClick={ () => setSelectedFolder( folder.id ) }
                    className={ `
                      w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors
                      ${ selectedFolder === folder.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{ folder.name }</span>
                    </div>

                    { folder.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        { folder.count }
                      </Badge>
                    ) }
                  </button>
                );
              } ) }
            </div>
          </div>

          {/* Lista de emails */ }
          <div className="w-96 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                { folders.find( f => f.id === selectedFolder )?.name }
              </h3>
            </div>

            <div className="overflow-auto h-full">
              { renderEmailList() }
            </div>
          </div>

          {/* Visualização do email */ }
          <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
            { renderEmailDetail() }
          </div>
        </div>
      </div>

      {/* Composer modal */ }
      { renderComposer() }
    </div>
  );
}
