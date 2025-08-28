/**
 * FORMULÁRIOS PADRÃO - TOIT NEXUS
 * Componentes de formulário consistentes para todo o sistema
 * Versão: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  Minus
} from 'lucide-react';

/**
 * Componente de Campo de Formulário Base
 */
export const FormField = ({
  label,
  description,
  error,
  required = false,
  children,
  className,
  labelClassName,
  helpText,
  success
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(
          "text-sm font-medium text-gray-700",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500",
          labelClassName
        )}>
          {label}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      <div className="relative">
        {children}
        
        {/* Ícone de sucesso */}
        {success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Texto de ajuda */}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * Componente de Input com Validação
 */
export const StandardInput = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className,
  leftIcon,
  rightIcon,
  onRightIconClick,
  maxLength,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [internalType, setInternalType] = useState(type);

  useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInternalType(showPassword ? 'text' : 'password');
    }
  }, [type, showPassword, showPasswordToggle]);

  return (
    <FormField label={label} error={error} required={required}>
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <Input
          type={internalType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            leftIcon && "pl-10",
            (rightIcon || showPasswordToggle) && "pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        
        {/* Ícone direito ou toggle de senha */}
        {(rightIcon || showPasswordToggle) && (
          <button
            type="button"
            onClick={showPasswordToggle ? () => setShowPassword(!showPassword) : onRightIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswordToggle ? (
              showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
            ) : (
              rightIcon
            )}
          </button>
        )}
        
        {/* Contador de caracteres */}
        {maxLength && (
          <div className="absolute right-3 bottom-1 text-xs text-gray-400">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
    </FormField>
  );
};

/**
 * Componente de Textarea com Validação
 */
export const StandardTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className,
  ...props
}) => {
  return (
    <FormField label={label} error={error} required={required}>
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        
        {/* Contador de caracteres */}
        {maxLength && (
          <div className="absolute right-3 bottom-3 text-xs text-gray-400">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
    </FormField>
  );
};

/**
 * Componente de Select com Validação
 */
export const StandardSelect = ({
  label,
  placeholder = "Selecione uma opção",
  value,
  onValueChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <FormField label={label} error={error} required={required}>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
};

/**
 * Componente de Checkbox com Validação
 */
export const StandardCheckbox = ({
  label,
  description,
  checked,
  onCheckedChange,
  error,
  required = false,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <FormField error={error} required={required} className={className}>
      <div className="flex items-start space-x-2">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            error && "border-red-500"
          )}
          {...props}
        />
        <div className="grid gap-1.5 leading-none">
          <Label className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}>
            {label}
          </Label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </FormField>
  );
};

/**
 * Componente de Radio Group com Validação
 */
export const StandardRadioGroup = ({
  label,
  value,
  onValueChange,
  options = [],
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className,
  ...props
}) => {
  return (
    <FormField label={label} error={error} required={required}>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          orientation === 'horizontal' ? "flex space-x-4" : "space-y-2",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  );
};

/**
 * Componente de Switch com Validação
 */
export const StandardSwitch = ({
  label,
  description,
  checked,
  onCheckedChange,
  error,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <FormField error={error} className={className}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          {...props}
        />
      </div>
    </FormField>
  );
};

/**
 * Componente de Upload de Arquivo
 */
export const StandardFileUpload = ({
  label,
  accept,
  multiple = false,
  onFileSelect,
  error,
  required = false,
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  preview = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    // Validar tamanho dos arquivos
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        console.error(`Arquivo ${file.name} é muito grande`);
        return false;
      }
      return true;
    });
    
    setFiles(validFiles);
    onFileSelect?.(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect?.(newFiles);
  };

  return (
    <FormField label={label} error={error} required={required}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500",
          className
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Arraste arquivos aqui ou{' '}
          <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
            clique para selecionar
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={disabled}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-xs text-gray-500">
          Tamanho máximo: {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </div>
      
      {/* Preview dos arquivos */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center mr-2">
                  <span className="text-xs text-blue-600">
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </FormField>
  );
};

/**
 * Componente de Formulário Padrão
 */
export const StandardForm = ({
  title,
  description,
  children,
  onSubmit,
  loading = false,
  error,
  success,
  submitText = "Salvar",
  cancelText = "Cancelar",
  onCancel,
  showCancel = true,
  className,
  cardClassName,
  actions,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", cardClassName)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)} {...props}>
          {/* Mensagem de erro global */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {/* Mensagem de sucesso global */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}
          
          {/* Campos do formulário */}
          {children}
          
          {/* Ações do formulário */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
            )}
            
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {submitText}
            </Button>
            
            {actions}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

/**
 * Componente de Formulário em Etapas
 */
export const StandardStepForm = ({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  loading = false,
  className
}) => {
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Indicador de etapas */}
      <CardHeader>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                  index <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                )}>
                  {index + 1}
                </div>
                <div className="ml-2">
                  <p className={cn(
                    "text-sm font-medium",
                    index <= currentStep ? "text-gray-900" : "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  index < currentStep ? "bg-blue-600" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Conteúdo da etapa atual */}
        <div className="mb-8">
          {steps[currentStep]?.content}
        </div>
        
        {/* Navegação */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep || loading}
          >
            Anterior
          </Button>
          
          <div className="text-sm text-gray-500">
            Etapa {currentStep + 1} de {steps.length}
          </div>
          
          {isLastStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              loading={loading}
            >
              Finalizar
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              disabled={loading}
            >
              Próximo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardForm;
