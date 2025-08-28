/**
 * MODAIS PADRÃO - TOIT NEXUS
 * Componentes de modal consistentes para todo o sistema
 * Versão: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Settings,
  MoreHorizontal
} from 'lucide-react';

/**
 * Modal Padrão Base
 */
export const StandardModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] overflow-hidden flex flex-col",
          className
        )}
        onPointerDownOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
      >
        {/* Cabeçalho */}
        <DialogHeader className={cn("flex-shrink-0", headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {/* Conteúdo */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          contentClassName
        )}>
          {children}
        </div>
        
        {/* Rodapé */}
        {footer && (
          <DialogFooter className={cn("flex-shrink-0 mt-6", footerClassName)}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Modal de Confirmação
 */
export const ConfirmationModal = ({
  open,
  onOpenChange,
  title = "Confirmar ação",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  icon,
  children,
  ...props
}) => {
  const variants = {
    default: {
      icon: Info,
      iconColor: 'text-blue-600',
      confirmVariant: 'default'
    },
    destructive: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      confirmVariant: 'destructive'
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      confirmVariant: 'default'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      confirmVariant: 'default'
    }
  };

  const config = variants[variant];
  const IconComponent = icon || config.icon;

  const handleConfirm = () => {
    onConfirm?.();
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              variant === 'destructive' ? 'bg-red-100' :
              variant === 'warning' ? 'bg-yellow-100' :
              variant === 'success' ? 'bg-green-100' : 'bg-blue-100'
            )}>
              <IconComponent className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="mt-1">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            variant={config.confirmVariant}
            disabled={loading}
          >
            {loading ? 'Processando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Modal de Formulário
 */
export const FormModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = "Salvar",
  cancelText = "Cancelar",
  loading = false,
  error,
  success,
  size = 'lg',
  showCancel = true,
  submitDisabled = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <StandardModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      {...props}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagem de erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        {/* Mensagem de sucesso */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}
        
        {/* Conteúdo do formulário */}
        {children}
        
        {/* Ações */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          
          <Button
            type="submit"
            loading={loading}
            disabled={loading || submitDisabled}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </StandardModal>
  );
};

/**
 * Modal de Visualização
 */
export const ViewModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions = [],
  size = 'lg',
  ...props
}) => {
  return (
    <StandardModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      footer={actions.length > 0 && (
          <div className="flex items-center justify-end space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size={action.size || 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )
      }
      {...props}
    >
      {children}
    </StandardModal>
  );
};

/**
 * Modal Lateral (Sheet)
 */
export const SideModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'default',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-80',
    default: 'w-96',
    lg: 'w-[500px]',
    xl: 'w-[600px]',
    '2xl': 'w-[800px]'
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} {...props}>
      <SheetContent
        side={side}
        className={cn(
          sizeClasses[size],
          "flex flex-col",
          className
        )}
      >
        <SheetHeader className="flex-shrink-0">
          {title && <SheetTitle>{title}</SheetTitle>}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {children}
        </div>
        
        {footer && (
          <SheetFooter className="flex-shrink-0">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

/**
 * Modal de Upload
 */
export const UploadModal = ({
  open,
  onOpenChange,
  title = "Upload de arquivos",
  description,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  onUpload,
  onCancel,
  loading = false,
  progress = 0,
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => file.size <= maxSize);
    setFiles(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = () => {
    onUpload?.(files);
  };

  const handleCancel = () => {
    setFiles([]);
    onCancel?.();
    onOpenChange(false);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <StandardModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="lg"
      {...props}
    >
      <div className="space-y-6">
        {/* Área de drop */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
            loading && "opacity-50 pointer-events-none"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arraste arquivos aqui
          </p>
          <p className="text-sm text-gray-600 mb-4">
            ou{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
              clique para selecionar
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={loading}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            Tamanho máximo: {(maxSize / 1024 / 1024).toFixed(0)}MB por arquivo
          </p>
        </div>
        
        {/* Lista de arquivos */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              Arquivos selecionados ({files.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                      <span className="text-xs text-blue-600 font-medium">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {!loading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Barra de progresso */}
        {loading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enviando...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Ações */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || loading}
            loading={loading}
          >
            <Upload className="h-4 w-4 mr-1" />
            Enviar {files.length > 0 && `(${files.length})`}
          </Button>
        </div>
      </div>
    </StandardModal>
  );
};

/**
 * Hook para gerenciar estado de modais
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
};

/**
 * Hook para gerenciar múltiplos modais
 */
export const useModals = (modalNames = []) => {
  const [modals, setModals] = useState(
    modalNames.reduce((acc, name) => ({ ...acc, [name]: false }), {})
  );
  
  const openModal = (name) => {
    setModals(prev => ({ ...prev, [name]: true }));
  };
  
  const closeModal = (name) => {
    setModals(prev => ({ ...prev, [name]: false }));
  };
  
  const toggleModal = (name) => {
    setModals(prev => ({ ...prev, [name]: !prev[name] }));
  };
  
  const closeAllModals = () => {
    setModals(modalNames.reduce((acc, name) => ({ ...acc, [name]: false }), {}));
  };
  };
  
  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals
  };

export default StandardModal;