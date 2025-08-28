/**
 * EMAIL COMPOSER COMPONENT
 * Composer de email com funcionalidades avançadas
 */

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {  


















  Trash2,






 }
} from 'lucide-react';

const EmailComposer = ({ 
  isOpen, 
  onClose, 
  emailDraft, 
  setEmailDraft, 
  onSend, 
  templates 
}) => ({ const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const fileInputRef = useRef(null);

  // Atualizar campo do draft
  const updateDraft = (field, value }) => {
    setEmailDraft(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Aplicar template
  const applyTemplate = (templateKey) => {
    if (templates[templateKey]) {
      const template = templates[templateKey];
      updateDraft('subject', template.subject);
      updateDraft('body', template.body);
      setSelectedTemplate(templateKey);
    }
  };

  // Adicionar anexo
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
    updateDraft('attachments', [...emailDraft.attachments, ...newAttachments]);
  };

  // Remover anexo
  const removeAttachment = (attachmentId) => {
    const updatedAttachments = attachments.filter(att => att.id !== attachmentId);
    setAttachments(updatedAttachments);
    updateDraft('attachments', updatedAttachments);
  };

  // Formatação de texto
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // Validar email
  const isValidEmail = () => {
    return emailDraft.to.trim() !== '' && 
           emailDraft.subject.trim() !== '' && 
           emailDraft.body.trim() !== '';
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Compor Email</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick=({ ( }) => setIsScheduling(!isScheduling)}>
                <Clock className="h-4 w-4 mr-1" />

              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />

              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Templates Rápidos */}
          ({ Object.keys(templates).length > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <Label className="text-sm font-medium mb-2 block">Templates Rápidos</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(templates).map(([key, template] }) => (
                  <Button
                    key={key}
                    variant={selectedTemplate === key ? "default" : "outline"}
                    size="sm"
                    onClick=({ ( }) => applyTemplate(key)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Destinatários */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="to" className="w-12 text-sm font-medium">Para:</Label>
              <Input
                id="to"
                value={emailDraft.to}
                onChange=({ (e }) => updateDraft('to', e.target.value)}
                placeholder="destinatario@email.com"
                className="flex-1"
              />
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => setShowCc(!showCc)}
                  className={showCc ? 'text-blue-600' : ''}
                >

                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => setShowBcc(!showBcc)}
                  className={showBcc ? 'text-blue-600' : ''}
                >

                </Button>
              </div>
            </div>

            {showCc && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="cc" className="w-12 text-sm font-medium">CC:</Label>
                <Input
                  id="cc"
                  value={emailDraft.cc}
                  onChange=({ (e }) => updateDraft('cc', e.target.value)}
                  placeholder="copia@email.com"
                  className="flex-1"
                />
              </div>
            )}

            {showBcc && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="bcc" className="w-12 text-sm font-medium">CCO:</Label>
                <Input
                  id="bcc"
                  value={emailDraft.bcc}
                  onChange=({ (e }) => updateDraft('bcc', e.target.value)}
                  placeholder="copia.oculta@email.com"
                  className="flex-1"
                />
              </div>
            )}
          </div>

          {/* Assunto e Prioridade */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="subject" className="w-12 text-sm font-medium">Assunto:</Label>
            <Input
              id="subject"
              value={emailDraft.subject}
              onChange=({ (e }) => updateDraft('subject', e.target.value)}
              placeholder="Assunto do email"
              className="flex-1"
            />
            <Select value={emailDraft.priority} onValueChange=({ (value }) => updateDraft('priority', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge variant="secondary" className="text-xs">Baixa</Badge>
                </SelectItem>
                <SelectItem value="normal">
                  <Badge variant="outline" className="text-xs">Normal</Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge variant="destructive" className="text-xs">Alta</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Barra de Formatação */}
          <div className="border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('underline')}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                
                <Separator orientation="vertical" className="h-6" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('justifyLeft')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('justifyCenter')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('justifyRight')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                
                <Separator orientation="vertical" className="h-6" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('insertUnorderedList')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => formatText('createLink', prompt('URL:'))}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailDraft.isHtml}
                  onCheckedChange=({ (checked }) => updateDraft('isHtml', checked)}
                />
                <Label className="text-sm">HTML</Label>
              </div>
            </div>

            {/* Área de Texto */}
            <div className="p-3">
              ({ emailDraft.isHtml ? (
                <div
                  contentEditable
                  className="min-h-[300px] p-3 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onInput={(e }) => updateDraft('body', e.target.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: emailDraft.body }}
                />
              ) : (
                <Textarea
                  value={emailDraft.body}
                  onChange=({ (e }) => updateDraft('body', e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[300px] resize-none"
                />
              )}
            </div>
          </div>

          {/* Anexos */}
          {attachments.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Anexos ({attachments.length})</Label>
                <span className="text-xs text-slate-500">
                  Total: ({ formatFileSize(attachments.reduce((sum, att }) => sum + att.size, 0))}
                </span>
              </div>
              <div className="space-y-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">{attachment.name}</span>
                      <span className="text-xs text-slate-500">({formatFileSize(attachment.size)})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick=({ ( }) => removeAttachment(attachment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agendamento */}
          {isScheduling && (
            <div className="border border-slate-200 rounded-lg p-3 bg-blue-50">
              <Label className="text-sm font-medium mb-2 block">Agendar Envio</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={emailDraft.scheduledSend?.date || ''}
                  onChange=({ (e }) => updateDraft('scheduledSend', { 
                    ...emailDraft.scheduledSend, 
                    date: e.target.value 
                  })}
                />
                <Input
                  type="time"
                  value={emailDraft.scheduledSend?.time || ''}
                  onChange=({ (e }) => updateDraft('scheduledSend', { 
                    ...emailDraft.scheduledSend, 
                    time: e.target.value 
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="flex-shrink-0 border-t border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick=({ ( }) => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-1" />

              </Button>
              
              <Button variant="outline" size="sm">
                <Image className="h-4 w-4 mr-1" />

              </Button>
              
              <Button variant="outline" size="sm">
                <Smile className="h-4 w-4 mr-1" />

              </Button>
              
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Reunião
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>

              </Button>
              <Button 
                onClick={onSend} 
                disabled={!isValidEmail()}
                className="flex items-center space-x-1"
              >
                <Send className="h-4 w-4" />
                <span>{isScheduling ? 'Agendar' : 'Enviar'}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailComposer;
