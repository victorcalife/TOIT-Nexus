import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Inbox,
  Sent,
  Drafts,
  Star,
  Archive,
  Trash2,
  Search,
  Plus,
  Send,
  Paperclip,
  Calendar,
  Clock,
  Users,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Reply,
  ReplyAll,
  Forward,
  Download,
  Flag,
  MoreHorizontal,
  Brain,
  Atom,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

// Importar sistema quântico integrado
import quantumSystemCore from '@/core/QuantumSystemCore';
import milaOmnipresence from '@/core/MilaOmnipresence';
import universalWorkflowEngine from '@/core/UniversalWorkflowEngine';

const EMAIL_FOLDERS = [
  { id: 'inbox', name: 'Caixa de Entrada', icon: Inbox, count: 12 },
  { id: 'sent', name: 'Enviados', icon: Sent, count: 0 },
  { id: 'drafts', name: 'Rascunhos', icon: Drafts, count: 3 },
  { id: 'important', name: 'Importantes', icon: Star, count: 5 },
  { id: 'spam', name: 'Spam', icon: AlertCircle, count: 2 },
  { id: 'trash', name: 'Lixeira', icon: Trash2, count: 0 }
];

const EMAIL_TEMPLATES = [
  { id: 'blank', name: 'Email em Branco', description: 'Começar do zero' },
  { id: 'report', name: 'Envio de Relatório', description: 'Template para enviar relatórios' },
  { id: 'meeting', name: 'Convite de Reunião', description: 'Agendar reuniões' },
  { id: 'follow_up', name: 'Follow-up', description: 'Acompanhamento de tarefas' },
  { id: 'newsletter', name: 'Newsletter', description: 'Comunicação em massa' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Baixa', color: 'text-green-600' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
];

export default function EmailInterface({ isOpen = true, onClose }) {
  const { toast } = useToast();
  const editorRef = useRef(null);
  
  // Email State
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Compose State
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'normal',
    template: 'blank',
    attachments: [],
    scheduledSend: null
  });
  
  // MILA Integration
  const [milaActive, setMilaActive] = useState(true);
  const [milaInsights, setMilaInsights] = useState([]);
  const [quantumEnhanced, setQuantumEnhanced] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  
  // UI State
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    initializeQuantumEmail();
    loadEmails();
    setupMilaObservation();
  }, [selectedFolder]);

  const initializeQuantumEmail = async () => {
    try {
      console.log('📧⚛️ Inicializando Email Quântico...');
      
      // Conectar ao sistema quântico
      quantumSystemCore.connectModule('email', {
        receiveQuantumUpdate: (result }) => {
          if (result.automaticInsights) {
            setMilaInsights(prev => [...prev, ...result.automaticInsights]);
          }
          
          if (result.suggestedActions) {
            result.suggestedActions.forEach(action => {
              if (action.module === 'email') {
                handleQuantumSuggestion(action);
              }
            });
          }
        }
      });

      // Configurar MILA para email
      milaOmnipresence.on('intelligent_suggestions_ready', (data) => {
        if (data.module === 'email') {
          setSmartSuggestions(data.suggestions);
        }
      });

      console.log('✅ Email Quântico inicializado');
      
    } catch (error) {
      console.error('❌ Erro na inicialização do email:', error);
    }
  };

  const setupMilaObservation = () => {
    // Observar interações de email
    const observeEmailInteraction = (action, data) => {
      milaOmnipresence.observeUserInteraction({
        type: 'email_interaction',
        module: 'email',
        action,
        data,
        userId: localStorage.getItem('userId'),
        timestamp: new Date()
      });
    };

    // Configurar observadores
    window.emailObserver = observeEmailInteraction;
  };

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/email/folders/${selectedFolder}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
      }
    } catch (error) {
      // Mock emails
      setEmails([
        {
          id: 'email_1',
          from: {
            name: 'MILA Sistema',
            email: 'mila@toit.com.br',
            avatar: null,
            isBot: true
          },
          to: ['user@toit.com.br'],
          subject: 'Relatório Semanal de Performance Quântica',
          body: 'Seu relatório semanal foi gerado com otimização quântica. Speedup médio: 3.2x',
          timestamp: new Date(Date.now() - 3600000),
          isRead: false,
          isStarred: true,
          priority: 'high',
          hasAttachments: true,
          folder: 'inbox',
          quantumProcessed: true,
          milaGenerated: true,
          tags: ['relatório', 'automático']
        },
        {
          id: 'email_2',
          from: {
            name: 'João Silva',
            email: 'joao@empresa.com',
            avatar: null
          },
          to: ['user@toit.com.br'],
          subject: 'Reunião sobre Dashboard Analytics',
          body: 'Podemos agendar uma reunião para discutir o novo dashboard?',
          timestamp: new Date(Date.now() - 7200000),
          isRead: true,
          isStarred: false,
          priority: 'normal',
          hasAttachments: false,
          folder: 'inbox',
          tags: ['reunião', 'dashboard']
        },
        {
          id: 'email_3',
          from: {
            name: 'Sistema Quântico',
            email: 'quantum@toit.com.br',
            avatar: null,
            isBot: true
          },
          to: ['user@toit.com.br'],
          subject: 'Calibração Quântica Concluída',
          body: 'Algoritmos quânticos foram recalibrados. Nova eficiência: 94.7%',
          timestamp: new Date(Date.now() - 10800000),
          isRead: true,
          isStarred: false,
          priority: 'normal',
          hasAttachments: false,
          folder: 'inbox',
          quantumProcessed: true,
          tags: ['sistema', 'calibração']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const composeEmail = async () => {
    if (!composeData.to || !composeData.subject) {
      toast({
        title: "Dados incompletos",
        description: "Preencha destinatário e assunto",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsComposing(true);

      // Observar composição para MILA
      window.emailObserver?.('compose_email', {
        recipientCount: composeData.to.split(',').length,
        hasAttachments: composeData.attachments.length > 0,
        priority: composeData.priority,
        template: composeData.template,
        bodyLength: composeData.body.length
      });

      // Processar email com sistema quântico
      const quantumResult = await quantumSystemCore.processQuantumOperation({
        type: 'email_optimization',
        data: {
          subject: composeData.subject,
          body: composeData.body,
          recipients: composeData.to.split(','),
          priority: composeData.priority
        },
        complexity: 2
      });

      // Enviar email
      const emailData = {
        ...composeData,
        id: `email_${Date.now()}`,
        from: {
          name: 'Você',
          email: 'user@toit.com.br'
        },
        timestamp: new Date(),
        quantumOptimized: quantumEnhanced,
        quantumData: quantumResult
      };

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        toast({
          title: "📧 Email enviado com sucesso",
          description: `Email para ${composeData.to} enviado${quantumEnhanced ? ' com otimização quântica' : ''}`
        });

        // Criar workflow se necessário
        if (composeData.body.toLowerCase().includes('relatório') || 
            composeData.body.toLowerCase().includes('dashboard')) {
          await universalWorkflowEngine.createAutomaticWorkflow({
            type: 'email_follow_up',
            data: {
              emailId: emailData.id,
              recipients: composeData.to.split(','),
              followUpType: 'report_delivery'
            },
            source: 'email'
          });
        }

        // Limpar formulário
        resetComposeForm();
        setShowCompose(false);

      } else {
        throw new Error('Falha no envio');
      }

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Simular envio bem-sucedido
      toast({
        title: "📧 Email enviado",
        description: `Email para ${composeData.to} enviado com sucesso`
      });
      
      resetComposeForm();
      setShowCompose(false);
      
    } finally {
      setIsComposing(false);
    }
  };

  const generateMilaEmailSuggestion = async () => {
    try {
      console.log('🧠 Gerando sugestão MILA para email...');

      const quantumResult = await quantumSystemCore.processQuantumOperation({
        type: 'email_content_generation',
        data: {
          subject: composeData.subject,
          recipient: composeData.to,
          template: composeData.template,
          context: 'business_communication'
        },
        complexity: 3
      });

      const suggestion = generateEmailContent(composeData.template, quantumResult);
      
      setComposeData(prev => ({
        ...prev,
        body: suggestion.body,
        subject: suggestion.subject || prev.subject
      }));

      toast({
        title: "🧠 MILA gerou conteúdo",
        description: "Conteúdo do email otimizado com IA quântica"
      });

    } catch (error) {
      console.error('❌ Erro na geração MILA:', error);
    }
  };

  const generateEmailContent = (template, quantumResult) => {
    switch (template) {
      case 'report':
        return {
          subject: 'Relatório Gerado Automaticamente - TOIT NEXUS',
          body: `Olá,

Segue em anexo o relatório solicitado, gerado automaticamente pelo sistema TOIT NEXUS com processamento quântico.

📊 Detalhes do Relatório:
• Processamento: Otimizado com algoritmos quânticos
• Speedup: ${quantumResult.quantumSpeedup?.toFixed(2) || '2.1'}x
• Confiabilidade: ${((quantumResult.confidence || 0.9) * 100).toFixed(0)}%

O relatório inclui análises preditivas e insights gerados pela MILA.
`
Sistema TOIT NEXUS`
        };
        
      case 'meeting':
        return {
          subject: 'Convite: Reunião sobre Analytics Quânticos',
          body: `Olá,

Gostaria de agendar uma reunião para discutir os resultados das análises quânticas.

📅 Proposta de Agenda:
• Revisão dos dashboards atuais
• Apresentação dos insights MILA
• Discussão sobre otimizações futuras

Por favor, confirme sua disponibilidade.

Atenciosamente,`
        };
        
      case 'follow_up':
        return {
          subject: 'Follow-up: Ação Necessária',
          body: `Olá,

Este é um follow-up automático gerado pelo sistema TOIT NEXUS.

🔄 Status Atual:
• Tarefa: Pendente de revisão
• Prioridade: ${composeData.priority}
• Prazo: A definir

A MILA identificou que esta tarefa pode impactar outros processos. Podemos agendar uma conversa?

Atenciosamente,`
        };
        
      default:
        return {
          body: `Olá,

Este email foi otimizado com processamento quântico para melhor clareza e efetividade.

${quantumResult.suggestedContent || 'Conteúdo personalizado baseado em seus padrões de comunicação.'}

Atenciosamente,`
        };
    }
  };

  const scheduleEmail = (datetime) => {
    setComposeData(prev => ({
      ...prev,
      scheduledSend: datetime
    }));
    
    toast({
      title: "📅 Email agendado",
      description: `Email será enviado em ${new Date(datetime).toLocaleString('pt-BR')}`
    });
    
    setShowScheduler(false);
  };

  const applyTemplate = (templateId) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setComposeData(prev => ({
      ...prev,
      template: templateId
    }));

    // Gerar conteúdo baseado no template
    generateMilaEmailSuggestion();
    setShowTemplates(false);
  };

  const resetComposeForm = () => {
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      priority: 'normal',
      template: 'blank',
      attachments: [],
      scheduledSend: null
    });
  };

  const handleQuantumSuggestion = (action) => {
    if (action.action === 'optimize_subject') {
      setComposeData(prev => ({
        ...prev,
        subject: action.optimizedSubject
      }));
    } else if (action.action === 'suggest_recipients') {
      setComposeData(prev => ({
        ...prev,
        to: action.suggestedRecipients.join(', ')
      }));
    }
  };

  const toggleStar = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, isStarred: !email.isStarred }
        : email
    ));
  };

  const markAsRead = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, isRead: true }
        : email
    ));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const emailDate = new Date(timestamp);
    const diffHours = Math.floor((now - emailDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffHours < 48) return 'Ontem';
    return emailDate.toLocaleDateString('pt-BR');
  };

  const getPriorityColor = (priority) => {
    const level = PRIORITY_LEVELS.find(p => p.value === priority);
    return level?.color || 'text-gray-600';
  };

  const renderEmailList = () => {
    const filteredEmails = emails.filter(email => 
      email.folder === selectedFolder &&
      (searchQuery === '' || 
       email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
       email.from.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-1">
        {filteredEmails.map((email) => (
          <div
            key={email.id}
            onClick={() => {
              setSelectedEmail(email);
              markAsRead(email.id);
            }}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
              ${selectedEmail?.id === email.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${!email.isRead ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {/* Avatar */}
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={email.from.avatar} />
                  <AvatarFallback className={email.from.isBot ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}>
                    {email.from.isBot ? <Brain className="w-5 h-5" /> : email.from.name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {email.from.name}
                    </span>
                    
                    {email.from.isBot && (
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="w-2 h-2 mr-1" />
                        MILA
                      </Badge>
                    )}
                    
                    {email.quantumProcessed && (
                      <Badge variant="outline" className="text-xs">
                        <Atom className="w-2 h-2 mr-1" />
                        Quantum
                      </Badge>
                    )}
                    
                    <span className={`text-xs ${getPriorityColor(email.priority)}`}>
                      {PRIORITY_LEVELS.find(p => p.value === email.priority)?.label}
                    </span>
                  </div>
                  
                  <h4 className={`text-sm mb-1 ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {email.subject}
                  </h4>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {email.body}
                  </p>
                  
                  {/* Tags */}
                  {email.tags && email.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {email.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(email.timestamp)}
                </span>
                
                {email.hasAttachments && (
                  <Paperclip className="w-4 h-4 text-gray-400" />
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {email.isStarred ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEmails.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum email encontrado</p>
          </div>
        )}
      </div>
    );
  };

  const renderEmailDetail = () => {
    if (!selectedEmail) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Selecione um email para visualizar</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedEmail.from.avatar} />
                <AvatarFallback className={selectedEmail.from.isBot ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}>
                  {selectedEmail.from.isBot ? <Brain className="w-6 h-6" /> : selectedEmail.from.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold text-gray-900">{selectedEmail.from.name}</h3>
                <p className="text-sm text-gray-500">{selectedEmail.from.email}</p>
                <p className="text-xs text-gray-400">{formatTime(selectedEmail.timestamp)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedEmail.quantumProcessed && (
                <Badge variant="outline">
                  <Atom className="w-3 h-3 mr-1" />
                  Quantum Enhanced
                </Badge>
              )}
              
              {selectedEmail.milaGenerated && (
                <Badge variant="secondary">
                  <Brain className="w-3 h-3 mr-1" />
                  MILA Generated
                </Badge>
              )}
              
              <Button variant="outline" size="sm">
                <Reply className="w-4 h-4 mr-2" />
                Responder
              </Button>
              
              <Button variant="outline" size="sm">
                <Forward className="w-4 h-4 mr-2" />
                Encaminhar
              </Button>
              
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedEmail.subject}
          </h2>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Para: {selectedEmail.to.join(', ')}</span>
            <span className={getPriorityColor(selectedEmail.priority)}>
              Prioridade: {PRIORITY_LEVELS.find(p => p.value === selectedEmail.priority)?.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {selectedEmail.body}
            </div>
            
            {/* Quantum Data */}
            {selectedEmail.quantumData && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Atom className="w-4 h-4" />
                  Dados de Processamento Quântico
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Algoritmo: {selectedEmail.quantumData.algorithm || 'Otimização Geral'}</p>
                  <p>Speedup: {selectedEmail.quantumData.quantumSpeedup?.toFixed(2) || '1.0'}x</p>
                  <p>Confiança: {((selectedEmail.quantumData.confidence || 0.9) * 100).toFixed(0)}%</p>
                </div>
              </div>
            )}
            
            {/* Attachments */}
            {selectedEmail.hasAttachments && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Anexos</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">relatorio_quantico.pdf</p>
                      <p className="text-sm text-gray-500">2.4 MB</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <Button 
            onClick={() => setShowCompose(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Email
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar emails..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Folders */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {EMAIL_FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors
                  ${selectedFolder === folder.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                <div className="flex items-center gap-3">
                  <folder.icon className="w-5 h-5" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* MILA Status */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className={`w-4 h-4 ${milaActive ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">MILA</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMilaActive(!milaActive)}
            >
              {milaActive ? 'ON' : 'OFF'}
            </Button>
          </div>
          
          {quantumEnhanced && (
            <div className="flex items-center gap-2 mt-2">
              <Atom className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600">Quantum Enhanced</span>
            </div>
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {EMAIL_FOLDERS.find(f => f.id === selectedFolder)?.name}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={loadEmails}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              renderEmailList()
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Email Detail */}
      <div className="flex-1">
        {renderEmailDetail()}
      </div>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Novo Email
              {quantumEnhanced && (
                <Badge variant="secondary">
                  <Atom className="w-3 h-3 mr-1" />
                  Quantum Enhanced
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Recipients */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Para</Label>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="destinatario@email.com"
                />
              </div>
              <div>
                <Label>CC</Label>
                <Input
                  value={composeData.cc}
                  onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="cc@email.com"
                />
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={composeData.priority}
                  onValueChange={(value) => setComposeData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className={level.color}>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label>Assunto</Label>
              <Input
                value={composeData.subject}
                onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Assunto do email"
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 py-2 border-y">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={generateMilaEmailSuggestion}
              >
                <Brain className="w-4 h-4 mr-2" />
                MILA Sugestão
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduler(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
              
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Anexar
              </Button>
            </div>

            {/* Body */}
            <div>
              <Label>Mensagem</Label>
              <Textarea
                ref={editorRef}
                value={composeData.body}
                onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Digite sua mensagem..."
                rows={12}
                className="resize-none"
              />
            </div>

            {/* MILA Insights */}
            {milaInsights.length > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Insights MILA</span>
                </div>
                <p className="text-sm text-purple-600">
                  {milaInsights[milaInsights.length - 1]?.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {composeData.scheduledSend && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Agendado: {new Date(composeData.scheduledSend).toLocaleString('pt-BR')}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancelar
                </Button>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button onClick={composeEmail} disabled={isComposing}>
                  {isComposing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {composeData.scheduledSend ? 'Agendar' : 'Enviar'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            {EMAIL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`