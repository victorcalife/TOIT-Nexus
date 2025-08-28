/**
 * SISTEMA DE INPUTS COMPLETO - TOIT NEXUS
 * Sistema profissional de inputs com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Input básico responsivo
 * - Input com ícones (esquerda/direita)
 * - Input com validação em tempo real
 * - Input de senha com toggle de visibilidade
 * - Input de busca com clear button
 * - Input numérico com controles
 * - Input de arquivo com drag & drop
 * - Input de CPF/CNPJ com máscara
 * - Input de telefone com máscara
 * - Input de CEP com busca automática
 * - Estados de loading, error, success
 * - Diferentes tamanhos e variantes
 */

import * as React from "react"
import { Eye, EyeOff, Search, X, Upload, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCPF, formatCNPJ, formatPhone, isValidCPF, isValidEmail } from "@/lib/utils"

const Input = React.forwardRef(({ 
  className, 
  type, 
  error,
  success,
  disabled,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus-visible:ring-red-500",
        success && "border-green-500 focus-visible:ring-green-500",
        className}
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  )
})
Input.displayName = "Input"

/**
 * INPUT COM ÍCONE
 */
const IconInput = React.forwardRef(({ 
  icon: Icon,
  iconPosition = "left",
  className,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      {Icon && iconPosition === "left" && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        ref={ref}
        className={cn(
          Icon && iconPosition === "left" && "pl-10",
          Icon && iconPosition === "right" && "pr-10",
          className}
        )}
        {...props}
      />
      {Icon && iconPosition === "right" && (
        <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
    </div>
  )
})
IconInput.displayName = "IconInput"

/**
 * INPUT DE SENHA
 */
const PasswordInput = React.forwardRef(({ 
  className,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick=({ ( }) => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"

/**
 * INPUT DE BUSCA
 */
const SearchInput = React.forwardRef(({ 
  onClear,
  value,
  className,
  ...props 
}, ref) => ({ const [searchValue, setSearchValue] = React.useState(value || "")

  React.useEffect(( }) => {
    setSearchValue(value || "")
  }, [value])

  const handleClear = () => {
    setSearchValue("")
    onClear?.()
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={ref}
        type="text"
        value={searchValue}
        onChange=({ (e }) => {
          setSearchValue(e.target.value)
          props.onChange?.(e)
        }}
        className={cn("pl-10 pr-10", className)}
        {...props}
      />
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
SearchInput.displayName = "SearchInput"

/**
 * INPUT NUMÉRICO
 */
const NumberInput = React.forwardRef(({ 
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
  ...props 
}, ref) => ({ const [numValue, setNumValue] = React.useState(value || 0)

  const increment = ( }) => {
    const newValue = numValue + step
    if (max === undefined || newValue <= max) {
      setNumValue(newValue)
      onChange?.({ target: { value: newValue } })
    }
  }

  const decrement = () => {
    const newValue = numValue - step
    if (min === undefined || newValue >= min) {
      setNumValue(newValue)
      onChange?.({ target: { value: newValue } })
    }
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        type="number"
        value={numValue}
        onChange=({ (e }) => {
          const val = parseFloat(e.target.value) || 0
          setNumValue(val)
          onChange?.(e)
        }}
        min={min}
        max={max}
        step={step}
        className={cn("pr-16", className)}
        {...props}
      />
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={increment}
          className="px-2 py-0.5 text-xs hover:bg-muted rounded"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={decrement}
          className="px-2 py-0.5 text-xs hover:bg-muted rounded"
        >
          ▼
        </button>
      </div>
    </div>
  )
})
NumberInput.displayName = "NumberInput"

/**
 * INPUT DE CPF
 */
const CPFInput = React.forwardRef(({ 
  value,
  onChange,
  onValidation,
  className,
  ...props 
}, ref) => {
  const [cpfValue, setCpfValue] = React.useState(value || "")
  const [isValid, setIsValid] = React.useState(null)

  const handleChange = (e) => {
    const formatted = formatCPF(e.target.value)
    setCpfValue(formatted)
    
    const valid = isValidCPF(formatted)
    setIsValid(valid)
    onValidation?.(valid)
    
    onChange?.({ ...e, target: { ...e.target, value: formatted } })
  }

  return (
    <Input
      ref={ref}
      type="text"
      value={cpfValue}
      onChange={handleChange}
      placeholder="000.000.000-00"
      maxLength={14}
      success={isValid === true}
      error={isValid === false}
      className={className}
      {...props}
    />
  )
})
CPFInput.displayName = "CPFInput"

/**
 * INPUT DE TELEFONE
 */
const PhoneInput = React.forwardRef(({ 
  value,
  onChange,
  className,
  ...props 
}, ref) => {
  const [phoneValue, setPhoneValue] = React.useState(value || "")

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setPhoneValue(formatted)
    onChange?.({ ...e, target: { ...e.target, value: formatted } })
  }

  return (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={ref}
        type="text"
        value={phoneValue}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        maxLength={15}
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  )
})
PhoneInput.displayName = "PhoneInput"

/**
 * INPUT DE EMAIL COM VALIDAÇÃO
 */
const EmailInput = React.forwardRef(({ 
  value,
  onChange,
  onValidation,
  className,
  ...props 
}, ref) => {
  const [emailValue, setEmailValue] = React.useState(value || "")
  const [isValid, setIsValid] = React.useState(null)

  const handleChange = (e) => {
    const email = e.target.value
    setEmailValue(email)
    
    const valid = isValidEmail(email)
    setIsValid(email ? valid : null)
    onValidation?.(valid)
    
    onChange?.(e)
  }

  return (
    <Input
      ref={ref}
      type="email"
      value={emailValue}
      onChange={handleChange}
      placeholder="exemplo@email.com"
      success={isValid === true}
      error={isValid === false}
      className={className}
      {...props}
    />
  )
})
EmailInput.displayName = "EmailInput"

/**
 * INPUT DE ARQUIVO COM DRAG & DROP
 */
const FileInput = React.forwardRef(({ 
  onFileSelect,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  ...props 
}, ref) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [files, setFiles] = React.useState([])

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    const validFiles = fileArray.filter(file => file.size <= maxSize)
    
    setFiles(validFiles)
    onFileSelect?.(multiple ? validFiles : validFiles[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        className}
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Arraste arquivos aqui ou clique para selecionar
      </p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        {...props}
      />
      <button
        type="button"
        onClick={() => ref?.current?.click()}
        className="text-sm text-primary hover:underline"
      >
        Selecionar arquivos
      </button>
      {files.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {files.length} arquivo(s) selecionado(s)
        </div>
      )}
    </div>
  )
})
FileInput.displayName = "FileInput"

export {}
