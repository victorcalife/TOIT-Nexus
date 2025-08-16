/**
 * ADVANCED EMAIL INTERFACE
 * Interface moderna de email com funcionalidades avançadas
 * Filtros inteligentes, templates, anexos e integração com workflow
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import
  {
    Mail,
    Send,
    Reply,
    ReplyAll,
    Forward,
    Archive,
    Trash2,
    Star,
    StarOff,
    Paperclip,
    Search,
    Filter,
    Plus,
    Edit,
    Eye,
    Download,
    Upload,
    Tag,
    Clock,
    Users,
    AlertCircle,
    CheckCircle,
    Circle,
    MoreHorizontal,
    Refresh,
    Settings,
    Folder,
    FolderOpen
  } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdvancedEmailInterface = ( { tenantId, userId, userRole } ) =>
{
  const [ emails, setEmails ] = useState( [] );
  const [ selectedEmail, setSelectedEmail ] = useState( null );
  const [ currentFolder, setCurrentFolder ] = useState( 'inbox' );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ filterStatus, setFilterStatus ] = useState( 'all' );
  const [ isComposing, setIsComposing ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ selectedEmails, setSelectedEmails ] = useState( new Set() );

  // Estados do composer
  const [ emailDraft, setEmailDraft ] = useState( {
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'normal',
    template: '',
    attachments: [],
    scheduledSend: null,
    isHtml: true
  } );

  // Pastas de email
  const emailFolders = {
    inbox: { label: 'Caixa de Entrada', icon: Mail, count: 12 },
    sent: { label: 'Enviados', icon: Send, count: 45 },
    drafts: { label: 'Rascunhos', icon: Edit, count: 3 },
    starred: { label: 'Favoritos', icon: Star, count: 8 },
    archive: { label: 'Arquivo', icon: Archive, count: 156 },
    trash: { label: 'Lixeira', icon: Trash2, count: 23 },
    spam: { label: 'Spam', icon: AlertCircle, count: 5 }
  };

  // Status de email
  const emailStatuses = {
    unread: { label: 'Não lidos', color: 'bg-blue-100 text-blue-800' },
    read: { label: 'Lidos', color: 'bg-gray-100 text-gray-800' },
    replied: { label: 'Respondidos', color: 'bg-green-100 text-green-800' },
    forwarded: { label: 'Encaminhados', color: 'bg-purple-100 text-purple-800' },
    important: { label: 'Importantes', color: 'bg-red-100 text-red-800' }
  };

  // Templates de email
  const emailTemplates = {
    welcome: {
      name: 'Boas-vindas',
      subject: 'Bem-vindo(a) ao TOIT Nexus!',
      body: `Olá [NOME],\n\nSeja bem-vindo(a) ao TOIT Nexus! Estamos muito felizes em tê-lo(a) conosco.\n\nSua conta foi criada com sucesso e você já pode começar a usar todas as funcionalidades da plataforma.\n\nSe tiver alguma dúvida, não hesite em entrar em contato conosco.\n\nAtenciosamente,\nEquipe TOIT Nexus`
    },
    followup: {
      name: 'Follow-up',
      subject: 'Acompanhamento - [ASSUNTO]',
      body: `Olá [NOME],\n\nEspero que esteja bem. Estou entrando em contato para dar continuidade à nossa conversa sobre [ASSUNTO].\n\n[CONTEÚDO_PERSONALIZADO]\n\nFico no aguardo do seu retorno.\n\nAtenciosamente,\n[SEU_NOME]`
    },
    meeting: {
      name: 'Convite para Reunião',
      subject: 'Convite: Reunião sobre [ASSUNTO]',
      body: `Olá [NOME],\n\nGostaria de convidá-lo(a) para uma reunião sobre [ASSUNTO].\n\nData: [DATA]\nHorário: [HORÁRIO]\nLocal: [LOCAL]\n\nPor favor, confirme sua presença.\n\nAtenciosamente,\n[SEU_NOME]`
    },
    proposal: {
      name: 'Proposta Comercial',
      subject: 'Proposta Comercial - [EMPRESA]',
      body: `Prezado(a) [NOME],\n\nConforme nossa conversa, segue em anexo nossa proposta comercial para [PROJETO/SERVIÇO].\n\nA proposta inclui:\n- [ITEM_1]\n- [ITEM_2]\n- [ITEM_3]\n\nEstou à disposição para esclarecer qualquer dúvida.\n\nAtenciosamente,\n[SEU_NOME]`
    }
  };

  // Carregar emails
  useEffect( () =>
  {
    loadEmails();
  }, [ currentFolder, tenantId, userId ] );

  const loadEmails = async () =>
  {
    setIsLoading( true );
    try
    {
      // Simular carregamento de emails
      const mockEmails = generateMockEmails();
      setEmails( mockEmails );
    } catch ( error )
    {
      console.error( 'Erro ao carregar emails:', error );
    } finally
    {
      setIsLoading( false );
    }
  };

  // Gerar emails mock
  const generateMockEmails = () =>
  {
    return [
      {
        id: '1',
        from: 'cliente@empresa.com',
        to: 'voce@toit.com.br',
        subject: 'Proposta de Parceria Estratégica',
        body: 'Olá, gostaria de discutir uma proposta de parceria...',
        date: new Date(),
        status: 'unread',
        priority: 'high',
        hasAttachments: true,
        isStarred: false,
        folder: 'inbox',
        labels: [ 'business', 'partnership' ]
      },
      {
        id: '2',
        from: 'suporte@fornecedor.com',
        to: 'voce@toit.com.br',
        subject: 'Atualização do Sistema - Manutenção Programada',
        body: 'Informamos que haverá manutenção programada...',
        date: new Date( Date.now() - 3600000 ),
        status: 'read',
        priority: 'normal',
        hasAttachments: false,
        isStarred: true,
        folder: 'inbox',
        labels: [ 'system', 'maintenance' ]
      },
      {
        id: '3',
        from: 'marketing@empresa.com',
        to: 'voce@toit.com.br',
        subject: 'Relatório Mensal de Performance',
        body: 'Segue o relatório de performance do mês...',
        date: new Date( Date.now() - 7200000 ),
        status: 'replied',
        priority: 'normal',
        hasAttachments: true,
        isStarred: false,
        folder: 'inbox',
        labels: [ 'reports', 'monthly' ]
      }
    ];
  };

  // Filtrar emails
  const filteredEmails = emails.filter( email =>
  {
    const matchesSearch = email.subject.toLowerCase().includes( searchTerm.toLowerCase() ) ||
      email.from.toLowerCase().includes( searchTerm.toLowerCase() ) ||
      email.body.toLowerCase().includes( searchTerm.toLowerCase() );

    const matchesFolder = email.folder === currentFolder;

    const matchesStatus = filterStatus === 'all' || email.status === filterStatus;

    return matchesSearch && matchesFolder && matchesStatus;
  } );

  // Compor novo email
  const handleCompose = ( template = null ) =>
  {
    if ( template )
    {
      setEmailDraft( {
        ...emailDraft,
        subject: emailTemplates[ template ].subject,
        body: emailTemplates[ template ].body,
        template: template
      } );
    }
    setIsComposing( true );
  };

  // Responder email
  const handleReply = ( email, replyAll = false ) =>
  {
    setEmailDraft( {
      ...emailDraft,
      to: replyAll ? `${ email.from }, ${ email.to }` : email.from,
      subject: `Re: ${ email.subject }`,
      body: `\n\n--- Mensagem Original ---\nDe: ${ email.from }\nPara: ${ email.to }\nAssunto: ${ email.subject }\nData: ${ format( email.date, 'dd/MM/yyyy HH:mm' ) }\n\n${ email.body }`
    } );
    setIsComposing( true );
  };

  // Encaminhar email
  const handleForward = ( email ) =>
  {
    setEmailDraft( {
      ...emailDraft,
      subject: `Fwd: ${ email.subject }`,
      body: `\n\n--- Mensagem Encaminhada ---\nDe: ${ email.from }\nPara: ${ email.to }\nAssunto: ${ email.subject }\nData: ${ format( email.date, 'dd/MM/yyyy HH:mm' ) }\n\n${ email.body }`
    } );
    setIsComposing( true );
  };

  // Marcar como favorito
  const toggleStar = ( emailId ) =>
  {
    setEmails( emails.map( email =>
      email.id === emailId
        ? { ...email, isStarred: !email.isStarred }
        : email
    ) );
  };

  // Marcar como lido/não lido
  const toggleRead = ( emailId ) =>
  {
    setEmails( emails.map( email =>
      email.id === emailId
        ? { ...email, status: email.status === 'unread' ? 'read' : 'unread' }
        : email
    ) );
  };

  // Arquivar email
  const archiveEmail = ( emailId ) =>
  {
    setEmails( emails.map( email =>
      email.id === emailId
        ? { ...email, folder: 'archive' }
        : email
    ) );
  };

  // Deletar email
  const deleteEmail = ( emailId ) =>
  {
    setEmails( emails.map( email =>
      email.id === emailId
        ? { ...email, folder: 'trash' }
        : email
    ) );
  };

  // Enviar email
  const sendEmail = async () =>
  {
    try
    {
      // Simular envio de email
      console.log( 'Enviando email:', emailDraft );

      // Adicionar à pasta de enviados
      const newEmail = {
        id: Date.now().toString(),
        from: 'voce@toit.com.br',
        to: emailDraft.to,
        subject: emailDraft.subject,
        body: emailDraft.body,
        date: new Date(),
        status: 'read',
        priority: emailDraft.priority,
        hasAttachments: emailDraft.attachments.length > 0,
        isStarred: false,
        folder: 'sent',
        labels: []
      };

      setEmails( [ ...emails, newEmail ] );
      setIsComposing( false );
      setEmailDraft( {
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        priority: 'normal',
        template: '',
        attachments: [],
        scheduledSend: null,
        isHtml: true
      } );
    } catch ( error )
    {
      console.error( 'Erro ao enviar email:', error );
    }
  };

  // Renderizar sidebar
  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-slate-200 p-4">
      <Button
        onClick={ () => handleCompose() }
        className="w-full mb-6"
      >
        <Plus className="h-4 w-4 mr-2" />
        Compor Email
      </Button>

      {/* Pastas */ }
      <div className="space-y-1 mb-6">
        { Object.entries( emailFolders ).map( ( [ key, folder ] ) =>
        {
          const Icon = folder.icon;
          return (
            <button
              key={ key }
              onClick={ () => setCurrentFolder( key ) }
              className={ `
                w-full flex items-center justify-between p-2 rounded-lg text-left
                ${ currentFolder === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-slate-100 text-slate-700'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{ folder.label }</span>
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

      {/* Templates Rápidos */ }
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Templates Rápidos</h3>
        <div className="space-y-1">
          { Object.entries( emailTemplates ).map( ( [ key, template ] ) => (
            <button
              key={ key }
              onClick={ () => handleCompose( key ) }
              className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-100 rounded"
            >
              { template.name }
            </button>
          ) ) }
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      { renderSidebar() }

      {/* Área Principal */ }
      <div className="flex-1 flex flex-col">
        {/* Header */ }
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-800">
                { emailFolders[ currentFolder ]?.label }
              </h1>
              <Button variant="outline" size="sm" onClick={ loadEmails }>
                <Refresh className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Busca */ }
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar emails..."
                  value={ searchTerm }
                  onChange={ ( e ) => setSearchTerm( e.target.value ) }
                  className="pl-10 w-80"
                />
              </div>

              {/* Filtros */ }
              <Select value={ filterStatus } onValueChange={ setFilterStatus }>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  { Object.entries( emailStatuses ).map( ( [ key, status ] ) => (
                    <SelectItem key={ key } value={ key }>
                      { status.label }
                    </SelectItem>
                  ) ) }
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Emails e Visualização */ }
        <div className="flex-1 flex">
          {/* Lista de Emails */ }
          <EmailList
            emails={ filteredEmails }
            selectedEmail={ selectedEmail }
            onSelectEmail={ setSelectedEmail }
            onToggleStar={ toggleStar }
            onToggleRead={ toggleRead }
            onArchive={ archiveEmail }
            onDelete={ deleteEmail }
            onReply={ handleReply }
            onForward={ handleForward }
            selectedEmails={ selectedEmails }
            setSelectedEmails={ setSelectedEmails }
            isLoading={ isLoading }
          />

          {/* Visualização do Email */ }
          { selectedEmail && (
            <EmailViewer
              email={ selectedEmail }
              onReply={ handleReply }
              onReplyAll={ ( email ) => handleReply( email, true ) }
              onForward={ handleForward }
              onArchive={ archiveEmail }
              onDelete={ deleteEmail }
              onToggleStar={ toggleStar }
            />
          ) }
        </div>
      </div>

      {/* Composer Dialog */ }
      <EmailComposer
        isOpen={ isComposing }
        onClose={ () => setIsComposing( false ) }
        emailDraft={ emailDraft }
        setEmailDraft={ setEmailDraft }
        onSend={ sendEmail }
        templates={ emailTemplates }
      />
    </div>
  );
};

// Componente Lista de Emails
const EmailList = ( {
  emails,
  selectedEmail,
  onSelectEmail,
  onToggleStar,
  onToggleRead,
  onArchive,
  onDelete,
  onReply,
  onForward,
  selectedEmails,
  setSelectedEmails,
  isLoading
} ) =>
{

  const toggleEmailSelection = ( emailId ) =>
  {
    const newSelected = new Set( selectedEmails );
    if ( newSelected.has( emailId ) )
    {
      newSelected.delete( emailId );
    } else
    {
      newSelected.add( emailId );
    }
    setSelectedEmails( newSelected );
  };

  const selectAllEmails = () =>
  {
    if ( selectedEmails.size === emails.length )
    {
      setSelectedEmails( new Set() );
    } else
    {
      setSelectedEmails( new Set( emails.map( email => email.id ) ) );
    }
  };

  if ( isLoading )
  {
    return (
      <div className="w-96 border-r border-slate-200 bg-white p-4">
        <div className="space-y-4">
          { [ ...Array( 5 ) ].map( ( _, i ) => (
            <div key={ i } className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </div>
          ) ) }
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-r border-slate-200 bg-white">
      {/* Ações em lote */ }
      { selectedEmails.size > 0 && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              { selectedEmails.size } email(s) selecionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={ () => selectedEmails.forEach( onArchive ) }>
                <Archive className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={ () => selectedEmails.forEach( onDelete ) }>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ) }

      {/* Cabeçalho da lista */ }
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={ selectedEmails.size === emails.length && emails.length > 0 }
            onChange={ selectAllEmails }
            className="rounded"
          />
          <span className="text-sm text-slate-600">
            { emails.length } email(s)
          </span>
        </div>
      </div>

      {/* Lista de emails */ }
      <div className="overflow-y-auto" style={ { height: 'calc(100vh - 200px)' } }>
        { emails.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum email encontrado</p>
          </div>
        ) : (
          emails.map( email => (
            <EmailListItem
              key={ email.id }
              email={ email }
              isSelected={ selectedEmail?.id === email.id }
              isChecked={ selectedEmails.has( email.id ) }
              onSelect={ () => onSelectEmail( email ) }
              onToggleCheck={ () => toggleEmailSelection( email.id ) }
              onToggleStar={ () => onToggleStar( email.id ) }
              onToggleRead={ () => onToggleRead( email.id ) }
              onArchive={ () => onArchive( email.id ) }
              onDelete={ () => onDelete( email.id ) }
              onReply={ () => onReply( email ) }
              onForward={ () => onForward( email ) }
            />
          ) )
        ) }
      </div>
    </div>
  );
};

// Componente Item da Lista de Email
const EmailListItem = ( {
  email,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
  onToggleStar,
  onToggleRead,
  onArchive,
  onDelete,
  onReply,
  onForward
} ) =>
{
  const [ showActions, setShowActions ] = useState( false );

  const getPriorityColor = ( priority ) =>
  {
    switch ( priority )
    {
      case 'high': return 'border-l-red-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-transparent';
    }
  };

  const getStatusIcon = ( status ) =>
  {
    switch ( status )
    {
      case 'unread': return <Circle className="h-3 w-3 text-blue-500" />;
      case 'replied': return <Reply className="h-3 w-3 text-green-500" />;
      case 'forwarded': return <Forward className="h-3 w-3 text-purple-500" />;
      default: return <CheckCircle className="h-3 w-3 text-slate-400" />;
    }
  };

  return (
    <div
      className={ `
        border-l-4 ${ getPriorityColor( email.priority ) } p-3 border-b border-slate-100 cursor-pointer
        ${ isSelected ? 'bg-blue-50' : 'hover:bg-slate-50' }
        ${ email.status === 'unread' ? 'bg-white' : 'bg-slate-25' }
      `}
      onClick={ onSelect }
      onMouseEnter={ () => setShowActions( true ) }
      onMouseLeave={ () => setShowActions( false ) }
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={ isChecked }
          onChange={ onToggleCheck }
          onClick={ ( e ) => e.stopPropagation() }
          className="mt-1 rounded"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={ `text-sm truncate ${ email.status === 'unread' ? 'font-semibold' : 'font-normal' }` }>
                { email.from }
              </span>
              { getStatusIcon( email.status ) }
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-slate-500">
                { format( email.date, 'HH:mm' ) }
              </span>
              { email.hasAttachments && (
                <Paperclip className="h-3 w-3 text-slate-400" />
              ) }
            </div>
          </div>

          <div className={ `text-sm mb-1 ${ email.status === 'unread' ? 'font-semibold' : 'font-normal' }` }>
            { email.subject }
          </div>

          <div className="text-xs text-slate-500 truncate">
            { email.body }
          </div>

          { email.labels && email.labels.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              { email.labels.map( label => (
                <Badge key={ label } variant="secondary" className="text-xs">
                  { label }
                </Badge>
              ) ) }
            </div>
          ) }
        </div>

        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={ ( e ) =>
            {
              e.stopPropagation();
              onToggleStar();
            } }
            className="p-1 hover:bg-slate-200 rounded"
          >
            { email.isStarred ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-4 w-4 text-slate-400" />
            ) }
          </button>

          { showActions && (
            <div className="flex flex-col space-y-1">
              <button
                onClick={ ( e ) =>
                {
                  e.stopPropagation();
                  onReply();
                } }
                className="p-1 hover:bg-slate-200 rounded"
                title="Responder"
              >
                <Reply className="h-3 w-3 text-slate-500" />
              </button>
              <button
                onClick={ ( e ) =>
                {
                  e.stopPropagation();
                  onArchive();
                } }
                className="p-1 hover:bg-slate-200 rounded"
                title="Arquivar"
              >
                <Archive className="h-3 w-3 text-slate-500" />
              </button>
              <button
                onClick={ ( e ) =>
                {
                  e.stopPropagation();
                  onDelete();
                } }
                className="p-1 hover:bg-slate-200 rounded"
                title="Excluir"
              >
                <Trash2 className="h-3 w-3 text-slate-500" />
              </button>
            </div>
          ) }
        </div>
      </div>
    </div>
  );
};

export default AdvancedEmailInterface;
