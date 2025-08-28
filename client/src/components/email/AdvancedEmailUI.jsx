/**
 * ADVANCED EMAIL UI
 * Interface moderna e profissional de email
 * Filtros inteligentes, templates, anexos, integração workflow
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 






    Trash2,




































 }
  } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdvancedEmailUI = ( { tenantId, userId, userRole } ) =>
{
  const [ emails, setEmails ] = useState( [] );
  const [ selectedEmail, setSelectedEmail ] = useState( null );
  const [ currentFolder, setCurrentFolder ] = useState( 'inbox' );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ filterStatus, setFilterStatus ] = useState( 'all' );
  const [ isComposing, setIsComposing ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ selectedEmails, setSelectedEmails ] = useState( new Set() );
  const [ sortBy, setSortBy ] = useState( 'date' );
  const [ sortOrder, setSortOrder ] = useState( 'desc' );

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
    isHtml: true,
    signature: true
  } );

  const [ showCc, setShowCc ] = useState( false );
  const [ showBcc, setShowBcc ] = useState( false );
  const [ isFormatting, setIsFormatting ] = useState( false );
  const fileInputRef = useRef( null );

  // Pastas de email
  const emailFolders = {
    inbox: { label: 'Caixa de Entrada', icon: Mail, count: 12, color: 'text-blue-600' },
    sent: { label: 'Enviados', icon: Send, count: 45, color: 'text-green-600' },
    drafts: { label: 'Rascunhos', icon: Edit, count: 3, color: 'text-yellow-600' },
    starred: { label: 'Favoritos', icon: Star, count: 8, color: 'text-orange-600' },
    archive: { label: 'Arquivo', icon: Archive, count: 156, color: 'text-purple-600' },
    trash: { label: 'Lixeira', icon: Trash2, count: 23, color: 'text-red-600' },
    spam: { label: 'Spam', icon: AlertCircle, count: 5, color: 'text-gray-600' }
  };

  // Status de email
  const emailStatuses = {
    unread: { label: 'Não lidos', color: 'bg-blue-100 text-blue-800', icon: Circle },
    read: { label: 'Lidos', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    replied: { label: 'Respondidos', color: 'bg-green-100 text-green-800', icon: Reply },
    forwarded: { label: 'Encaminhados', color: 'bg-purple-100 text-purple-800', icon: Forward },
    important: { label: 'Importantes', color: 'bg-red-100 text-red-800', icon: AlertCircle }
  };

  // Templates de email
  const emailTemplates = {
    welcome: {
      name: 'Boas-vindas',
      subject: 'Bem-vindo(a) ao TOIT Nexus!',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bem-vindo(a) ao TOIT Nexus!</h2>
        <p>Olá <strong>[NOME]</strong>,</p>
        <p>Seja bem-vindo(a) ao TOIT Nexus! Estamos muito felizes em tê-lo(a) conosco.</p>
        <p>Sua conta foi criada com sucesso e você já pode começar a usar todas as funcionalidades da plataforma.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Próximos passos:</h3>
          <ul style="color: #475569;">
            <li>Complete seu perfil</li>
            <li>Explore o dashboard</li>
            <li>Configure suas preferências</li>
          </ul>
        </div>
        <p>Se tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
        <p>Atenciosamente,<br><strong>Equipe TOIT Nexus</strong></p>`
      </div>`
    },
    followup: {
      name: 'Follow-up',
      subject: 'Acompanhamento - [ASSUNTO]',`
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Acompanhamento</h2>
        <p>Olá <strong>[NOME]</strong>,</p>
        <p>Espero que esteja bem. Estou entrando em contato para dar continuidade à nossa conversa sobre <strong>[ASSUNTO]</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #475569;">[CONTEÚDO_PERSONALIZADO]</p>
        </div>
        <p>Fico no aguardo do seu retorno.</p>
        <p>Atenciosamente,<br><strong>[SEU_NOME]</strong></p>`
      </div>`
    },
    meeting: {
      name: 'Convite para Reunião',
      subject: 'Convite: Reunião sobre [ASSUNTO]',`
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Convite para Reunião</h2>
        <p>Olá <strong>[NOME]</strong>,</p>
        <p>Gostaria de convidá-lo(a) para uma reunião sobre <strong>[ASSUNTO]</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Detalhes da Reunião:</h3>
          <p style="margin: 5px 0;"><strong>Data:</strong> [DATA]</p>
          <p style="margin: 5px 0;"><strong>Horário:</strong> [HORÁRIO]</p>
          <p style="margin: 5px 0;"><strong>Local:</strong> [LOCAL]</p>
          <p style="margin: 5px 0;"><strong>Duração:</strong> [DURAÇÃO]</p>
        </div>
        <p>Por favor, confirme sua presença.</p>
        <p>Atenciosamente,<br><strong>[SEU_NOME]</strong></p>`
      </div>`
    },
    proposal: {
      name: 'Proposta Comercial',
      subject: 'Proposta Comercial - [EMPRESA]',`
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Proposta Comercial</h2>
        <p>Prezado(a) <strong>[NOME]</strong>,</p>
        <p>Conforme nossa conversa, segue em anexo nossa proposta comercial para <strong>[PROJETO/SERVIÇO]</strong>.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">A proposta inclui:</h3>
          <ul style="color: #475569;">
            <li>[ITEM_1]</li>
            <li>[ITEM_2]</li>
            <li>[ITEM_3]</li>
          </ul>
        </div>
        <p>Estou à disposição para esclarecer qualquer dúvida.</p>
        <p>Atenciosamente,<br><strong>[SEU_NOME]</strong></p>`
      </div>`
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
        fromName: 'João Silva',
        to: 'voce@toit.com.br',
        subject: 'Proposta de Parceria Estratégica',
        body: 'Olá, gostaria de discutir uma proposta de parceria estratégica entre nossas empresas...',
        htmlBody: '<p>Olá, gostaria de discutir uma proposta de parceria estratégica entre nossas empresas...</p>',
        date: new Date(),
        status: 'unread',
        priority: 'high',
        hasAttachments: true,
        isStarred: false,
        folder: 'inbox',
        labels: [ 'business', 'partnership' ],
        attachments: [
          { name: 'Proposta_Parceria.pdf', size: '2.4 MB', type: 'application/pdf' }
        ]
      },
      {
        id: '2',
        from: 'suporte@fornecedor.com',
        fromName: 'Suporte Técnico',
        to: 'voce@toit.com.br',
        subject: 'Atualização do Sistema - Manutenção Programada',
        body: 'Informamos que haverá manutenção programada do sistema no próximo domingo...',
        htmlBody: '<p>Informamos que haverá manutenção programada do sistema no próximo domingo...</p>',
        date: new Date( Date.now() - 3600000 ),
        status: 'read',
        priority: 'normal',
        hasAttachments: false,
        isStarred: true,
        folder: 'inbox',
        labels: [ 'system', 'maintenance' ],
        attachments: []
      },
      {
        id: '3',
        from: 'marketing@empresa.com',
        fromName: 'Maria Santos',
        to: 'voce@toit.com.br',
        subject: 'Relatório Mensal de Performance',
        body: 'Segue o relatório de performance do mês de julho com todas as métricas...',
        htmlBody: '<p>Segue o relatório de performance do mês de julho com todas as métricas...</p>',
        date: new Date( Date.now() - 7200000 ),
        status: 'replied',
        priority: 'normal',
        hasAttachments: true,
        isStarred: false,
        folder: 'inbox',
        labels: [ 'reports', 'monthly' ],
        attachments: [
          { name: 'Relatorio_Julho.xlsx', size: '1.2 MB', type: 'application/vnd.ms-excel' },
          { name: 'Graficos.png', size: '856 KB', type: 'image/png' }
        ]
      }
    ];
  };

  // Filtrar e ordenar emails
  const filteredAndSortedEmails = emails
    .filter( email =>
    {
      const matchesSearch = email.subject.toLowerCase().includes( searchTerm.toLowerCase() ) ||
        email.fromName.toLowerCase().includes( searchTerm.toLowerCase() ) ||
        email.body.toLowerCase().includes( searchTerm.toLowerCase() );

      const matchesFolder = email.folder === currentFolder;
      const matchesStatus = filterStatus === 'all' || email.status === filterStatus;

      return matchesSearch && matchesFolder && matchesStatus;
    } )
    .sort( ( a, b ) =>
    {
      let comparison = 0;

      switch ( sortBy )
      {
        case 'date':
          comparison = new Date( a.date ) - new Date( b.date );
          break;
        case 'subject':
          comparison = a.subject.localeCompare( b.subject );
          break;
        case 'from':
          comparison = a.fromName.localeCompare( b.fromName );
          break;
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[ a.priority ] - priorityOrder[ b.priority ];
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    } );

  // Compor novo email
  const handleCompose = ( template = null ) =>
  {
    if ( template && emailTemplates[ template ] )
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
      ...emailDraft,`
      to: replyAll ? `${ email.from }, ${ email.to }` : email.from,`
      subject: `Re: ${ email.subject }`,`
      body: `\n\n--- Mensagem Original ---\nDe: ${ email.fromName } <${ email.from }>\nPara: ${ email.to }\nAssunto: ${ email.subject }\nData: ${ format( email.date, 'dd/MM/yyyy HH:mm' ) }\n\n${ email.body }`
    } );
    setIsComposing( true );
  };

  // Encaminhar email
  const handleForward = ( email ) =>
  {
    setEmailDraft( {
      ...emailDraft,`
      subject: `Fwd: ${ email.subject }`,`
      body: `\n\n--- Mensagem Encaminhada ---\nDe: ${ email.fromName } <${ email.from }>\nPara: ${ email.to }\nAssunto: ${ email.subject }\nData: ${ format( email.date, 'dd/MM/yyyy HH:mm' ) }\n\n${ email.body }`,
      attachments: email.attachments || []
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
      console.log( 'Enviando email:', emailDraft );

      const newEmail = {
        id: Date.now().toString(),
        from: 'voce@toit.com.br',
        fromName: 'Você',
        to: emailDraft.to,
        subject: emailDraft.subject,
        body: emailDraft.body,`
        htmlBody: emailDraft.isHtml ? emailDraft.body : `<p>${ emailDraft.body }</p>`,
        date: new Date(),
        status: 'read',
        priority: emailDraft.priority,
        hasAttachments: emailDraft.attachments.length > 0,
        isStarred: false,
        folder: 'sent',
        labels: [],
        attachments: emailDraft.attachments
      };

      setEmails( [ ...emails, newEmail ] );
      setIsComposing( false );
      resetEmailDraft();
    } catch ( error )
    {
      console.error( 'Erro ao enviar email:', error );
    }
  };

  // Resetar draft
  const resetEmailDraft = () =>
  {
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
      isHtml: true,
      signature: true
    } );
    setShowCc( false );
    setShowBcc( false );
  };

  // Adicionar anexo
  const handleFileUpload = ( event ) =>
  {
    const files = Array.from( event.target.files );
    const newAttachments = files.map( file => ( {
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize( file.size ),
      type: file.type,
      file: file
    } ) );
    setEmailDraft( {
      ...emailDraft,
      attachments: [ ...emailDraft.attachments, ...newAttachments ]
    } );
  };

  // Remover anexo
  const removeAttachment = ( attachmentId ) =>
  {
    setEmailDraft( {
      ...emailDraft,
      attachments: emailDraft.attachments.filter( att => att.id !== attachmentId )
    } );
  };

  // Formatar tamanho do arquivo
  const formatFileSize = ( bytes ) =>
  {
    if ( bytes === 0 ) return '0 Bytes';
    const k = 1024;
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ];
    const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) ) + ' ' + sizes[ i ];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */ }
      <EmailSidebar
        folders={ emailFolders }
        currentFolder={ currentFolder }
        onFolderChange={ setCurrentFolder }
        templates={ emailTemplates }
        onCompose={ handleCompose }
      />

      {/* Área Principal */ }
      <div className="flex-1 flex flex-col">
        {/* Header */ }
        <EmailHeader
          searchTerm={ searchTerm }
          onSearchChange={ setSearchTerm }
          filterStatus={ filterStatus }
          onFilterChange={ setFilterStatus }
          sortBy={ sortBy }
          onSortByChange={ setSortBy }
          sortOrder={ sortOrder }
          onSortOrderChange={ setSortOrder }
          emailStatuses={ emailStatuses }
          onRefresh={ loadEmails }
          onCompose=({ ( }) => handleCompose() }
        />

        {/* Lista de Emails e Visualização */ }
        <div className="flex-1 flex">
          <EmailList
            emails={ filteredAndSortedEmails }
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
            emailStatuses={ emailStatuses }
          />

          { selectedEmail && (
            <EmailViewer
              email={ selectedEmail }
              onReply={ handleReply }
              onReplyAll=({ ( email  }) => handleReply( email, true ) }
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
        onClose=({ ( }) => setIsComposing( false ) }
        emailDraft={ emailDraft }
        setEmailDraft={ setEmailDraft }
        onSend={ sendEmail }
        templates={ emailTemplates }
        showCc={ showCc }
        setShowCc={ setShowCc }
        showBcc={ showBcc }
        setShowBcc={ setShowBcc }
        onFileUpload={ handleFileUpload }
        onRemoveAttachment={ removeAttachment }
        fileInputRef={ fileInputRef }
      />
    </div>
  );
};

// Componente Sidebar do Email
const EmailSidebar = ( { folders, currentFolder, onFolderChange, templates, onCompose } ) => (
  <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-4">
    <Button
      onClick=({ ( }) => onCompose() }
      className="w-full mb-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
    >
      <Plus className="h-4 w-4 mr-2" />
      Compor Email
    </Button>

    {/* Pastas */ }
    <div className="space-y-1 mb-6">
      <h3 className="text-sm font-semibold text-slate-600 mb-3">Pastas</h3>
      ({ Object.entries( folders ).map( ( [ key, folder ]  }) =>
      {
        const Icon = folder.icon;
        return (
          <button
            key={ key }
            onClick=({ ( }) => onFolderChange( key ) }`
            className={ `
              w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200
              ${ currentFolder === key
                ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'}
              }`
            `}
          >
            <div className="flex items-center space-x-3">`
              <Icon className={ `h-4 w-4 ${ folder.color }` } />
              <span className="text-sm font-medium">{ folder.label }</span>
            </div>
            { folder.count > 0 && (
              <Badge
                variant={ currentFolder === key ? "default" : "secondary" }
                className="text-xs"
              >
                { folder.count }
              </Badge>
            ) }
          </button>
        );
      } ) }
    </div>

    {/* Templates Rápidos */ }
    <div>
      <h3 className="text-sm font-semibold text-slate-600 mb-3">Templates Rápidos</h3>
      <div className="space-y-1">
        ({ Object.entries( templates ).map( ( [ key, template ]  }) => (
          <button
            key={ key }
            onClick=({ ( }) => onCompose( key ) }
            className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <FileText className="h-3 w-3 inline mr-2" />
            { template.name }
          </button>
        ) ) }
      </div>
    </div>
  </div>
);

// Componente Header do Email
const EmailHeader = ( {
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  emailStatuses,
  onRefresh,
  onCompose
} ) => (
  <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-slate-800">Email</h1>
        <Button variant="outline" size="sm" onClick={ onRefresh }>
          <Refresh className="h-4 w-4 mr-1" />

        </Button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Busca */ }
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar emails..."
            value={ searchTerm }
            onChange=({ ( e  }) => onSearchChange( e.target.value ) }
            className="pl-10 w-80"
          />
        </div>

        {/* Filtros */ }
        <Select value={ filterStatus } onValueChange={ onFilterChange }>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            ({ Object.entries( emailStatuses ).map( ( [ key, status ]  }) => (
              <SelectItem key={ key } value={ key }>
                { status.label }
              </SelectItem>
            ) ) }
          </SelectContent>
        </Select>

        {/* Ordenação */ }
        <Select value={ sortBy } onValueChange={ onSortByChange }>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Data</SelectItem>
            <SelectItem value="subject">Assunto</SelectItem>
            <SelectItem value="from">Remetente</SelectItem>
            <SelectItem value="priority">Prioridade</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick=({ ( }) => onSortOrderChange( sortOrder === 'asc' ? 'desc' : 'asc' ) }
        >
          { sortOrder === 'asc' ? '↑' : '↓' }
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>

        <Button onClick={ onCompose }>
          <Plus className="h-4 w-4 mr-1" />

        </Button>
      </div>
    </div>
  </div>
);

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
  isLoading,
  emailStatuses
} ) =>
({ const toggleEmailSelection = ( emailId  }) =>
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

  if ( isLoading )
  ({ return (
      <div className="w-96 border-r border-slate-200 bg-white/50 p-4">
        <div className="space-y-4">
          { [ ...Array( 5 ) ].map( ( _, i  }) => (
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
    <div className="w-96 border-r border-slate-200 bg-white/50">
      {/* Ações em lote */ }
      { selectedEmails.size > 0 && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              { selectedEmails.size } email(s) selecionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick=({ ( }) => selectedEmails.forEach( onArchive ) }>
                <Archive className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick=({ ( }) => selectedEmails.forEach( onDelete ) }>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ) }

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
              onSelect=({ ( }) => onSelectEmail( email ) }
              onToggleCheck=({ ( }) => toggleEmailSelection( email.id ) }
              onToggleStar=({ ( }) => onToggleStar( email.id ) }
              onToggleRead=({ ( }) => onToggleRead( email.id ) }
              onArchive=({ ( }) => onArchive( email.id ) }
              onDelete=({ ( }) => onDelete( email.id ) }
              onReply=({ ( }) => onReply( email ) }
              onForward=({ ( }) => onForward( email ) }
              emailStatuses={ emailStatuses }
            />
          ) )
        ) }
      </div>
    </div>
  );
};

export default AdvancedEmailUI;
`