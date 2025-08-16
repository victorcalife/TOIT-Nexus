/**
 * EMAIL VIEWER COMPONENT
 * Visualizador de email com funcionalidades avançadas
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  StarOff,
  Paperclip, 
  Download, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Print,
  Share2,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EmailViewer = ({ 
  email, 
  onReply, 
  onReplyAll, 
  onForward, 
  onArchive, 
  onDelete, 
  onToggleStar 
}) => {
  const [showFullHeaders, setShowFullHeaders] = useState(false);
  const [showRawContent, setShowRawContent] = useState(false);

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500">
          <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Selecione um email</h3>
          <p>Escolha um email da lista para visualizar seu conteúdo</p>
        </div>
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta Prioridade</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Baixa Prioridade</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      unread: { label: 'Não lido', variant: 'default' },
      read: { label: 'Lido', variant: 'secondary' },
      replied: { label: 'Respondido', variant: 'outline' },
      forwarded: { label: 'Encaminhado', variant: 'outline' }
    };

    const config = statusConfig[status];
    return config ? <Badge variant={config.variant} className="text-xs">{config.label}</Badge> : null;
  };

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header do Email */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-3 mb-3">
              {getPriorityBadge(email.priority)}
              {getStatusBadge(email.status)}
              {email.labels && email.labels.map(label => (
                <Badge key={label} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ações do Email */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStar(email.id)}
            >
              {email.isStarred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReply(email)}
            >
              <Reply className="h-4 w-4 mr-1" />
              Responder
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReplyAll(email)}
            >
              <ReplyAll className="h-4 w-4 mr-1" />
              Resp. Todos
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onForward(email)}
            >
              <Forward className="h-4 w-4 mr-1" />
              Encaminhar
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(email.id)}
            >
              <Archive className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(email.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações do Remetente */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {email.from.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-slate-900">{email.from}</div>
                <div className="text-sm text-slate-500">para {email.to}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-900">
                {format(email.date, 'dd/MM/yyyy')}
              </div>
              <div className="text-sm text-slate-500">
                {format(email.date, 'HH:mm')}
              </div>
            </div>
          </div>

          {/* Headers Expandidos */}
          {showFullHeaders && (
            <div className="bg-slate-50 p-3 rounded-lg text-sm">
              <div className="space-y-1">
                <div><strong>De:</strong> {email.from}</div>
                <div><strong>Para:</strong> {email.to}</div>
                {email.cc && <div><strong>CC:</strong> {email.cc}</div>}
                {email.bcc && <div><strong>CCO:</strong> {email.bcc}</div>}
                <div><strong>Data:</strong> {format(email.date, 'dd/MM/yyyy HH:mm:ss')}</div>
                <div><strong>Assunto:</strong> {email.subject}</div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => setShowFullHeaders(!showFullHeaders)}
              className="text-blue-600 hover:text-blue-800"
            >
              {showFullHeaders ? 'Ocultar' : 'Mostrar'} detalhes
            </button>
            
            <button
              onClick={() => setShowRawContent(!showRawContent)}
              className="text-blue-600 hover:text-blue-800"
            >
              {showRawContent ? 'Visualização normal' : 'Código fonte'}
            </button>

            <button className="text-blue-600 hover:text-blue-800 flex items-center">
              <Print className="h-4 w-4 mr-1" />
              Imprimir
            </button>

            <button className="text-blue-600 hover:text-blue-800 flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </button>
          </div>
        </div>
      </div>

      {/* Anexos */}
      {email.hasAttachments && (
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Paperclip className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Anexos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Anexos simulados */}
            <AttachmentItem 
              name="Proposta_Comercial.pdf" 
              size="2.4 MB" 
              type="pdf" 
            />
            <AttachmentItem 
              name="Planilha_Custos.xlsx" 
              size="856 KB" 
              type="excel" 
            />
            <AttachmentItem 
              name="Apresentacao.pptx" 
              size="5.2 MB" 
              type="powerpoint" 
            />
          </div>
        </div>
      )}

      {/* Conteúdo do Email */}
      <div className="flex-1 p-6 overflow-y-auto">
        {showRawContent ? (
          <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto">
            {`From: ${email.from}
To: ${email.to}
Subject: ${email.subject}
Date: ${format(email.date, 'dd/MM/yyyy HH:mm:ss')}

${email.body}`}
          </pre>
        ) : (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {email.body}
            </div>
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              onClick={() => onReply(email)}
              className="flex items-center space-x-1"
            >
              <Reply className="h-4 w-4" />
              <span>Responder</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onForward(email)}
              className="flex items-center space-x-1"
            >
              <Forward className="h-4 w-4" />
              <span>Encaminhar</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Agendar
            </Button>
            
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4 mr-1" />
              Marcar
            </Button>
            
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Anexo
const AttachmentItem = ({ name, size, type }) => {
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'powerpoint':
        return '📈';
      case 'word':
        return '📝';
      case 'image':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
      <div className="text-2xl">{getFileIcon(type)}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">{name}</div>
        <div className="text-xs text-slate-500">{size}</div>
      </div>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EmailViewer;
