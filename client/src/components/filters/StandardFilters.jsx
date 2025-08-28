import React from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { 
  ChevronDown,
  Filter,
  Calendar as CalendarIcon,
  Search,
  X,
  Plus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos de filtro disponíveis
const FILTER_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
  NUMBER: 'number',
  NUMBER_RANGE: 'numberRange',
  BOOLEAN: 'boolean'
};

// Operadores para diferentes tipos de filtro
const FILTER_OPERATORS = {
  text: [
    { value: 'contains', label: 'Contém' },
    { value: 'equals', label: 'Igual a' },
    { value: 'startsWith', label: 'Começa com' },
    { value: 'endsWith', label: 'Termina com' },
    { value: 'notContains', label: 'Não contém' }
  ],
  number: [
    { value: 'equals', label: 'Igual a' },
    { value: 'greaterThan', label: 'Maior que' },
    { value: 'lessThan', label: 'Menor que' },
    { value: 'greaterThanOrEqual', label: 'Maior ou igual a' },
    { value: 'lessThanOrEqual', label: 'Menor ou igual a' },
    { value: 'between', label: 'Entre' }
  ],
  date: [
    { value: 'equals', label: 'Igual a' },
    { value: 'after', label: 'Depois de' },
    { value: 'before', label: 'Antes de' },
    { value: 'between', label: 'Entre' }
  ]
};

// Componente de filtro de texto
const TextFilter = ({ filter, value, onChange, className = '' }) => {
  const [operator, setOperator] = React.useState(value?.operator || 'contains');
  const [inputValue, setInputValue] = React.useState(value?.value || '');
  
  React.useEffect(() => {
    onChange({
      operator,
      value: inputValue
    });
  }, [operator, inputValue, onChange]);
  
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-sm font-medium">{filter.label}</Label>
      </div>
      
      <Select value={operator} onValueChange={setOperator}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPERATORS.text.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        placeholder={filter.placeholder || 'Digite o valor...'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};

// Componente de filtro de seleção
const SelectFilter = ({ filter, value, onChange, className = '' }) => {
  const handleChange = (selectedValue) => {
    onChange({
      operator: 'equals',
      value: selectedValue
    });
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-sm font-medium">{filter.label}</Label>
      </div>
      
      <Select value={value?.value || ''} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder={filter.placeholder || 'Selecione...'} />
        </SelectTrigger>
        <SelectContent>
          {filter.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Componente de filtro de múltipla seleção
const MultiSelectFilter = ({ filter, value, onChange, className = '' }) => {
  const selectedValues = value?.value || [];
  
  const handleToggle = (optionValue) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    onChange({
      operator: 'in',
      value: newValues
    });
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-sm font-medium">{filter.label}</Label>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filter.options?.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${filter.key}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <Label
              htmlFor={`${filter.key}-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de filtro de data
const DateFilter = ({ filter, value, onChange, className = '' }) => {
  const [operator, setOperator] = React.useState(value?.operator || 'equals');
  const [startDate, setStartDate] = React.useState(value?.value?.start || null);
  const [endDate, setEndDate] = React.useState(value?.value?.end || null);
  
  React.useEffect(() => {
    if (operator === 'between') {
      onChange({
        operator,
        value: { start: startDate, end: endDate }
      });
    } else {
      onChange({
        operator,
        value: startDate
      });
    }
  }, [operator, startDate, endDate, onChange]);
  
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-sm font-medium">{filter.label}</Label>
      </div>
      
      <Select value={operator} onValueChange={setOperator}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPERATORS.date.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      
      {operator === 'between' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

// Componente de filtro numérico
const NumberFilter = ({ filter, value, onChange, className = '' }) => {
  const [operator, setOperator] = React.useState(value?.operator || 'equals');
  const [minValue, setMinValue] = React.useState(value?.value?.min || '');
  const [maxValue, setMaxValue] = React.useState(value?.value?.max || '');
  const [singleValue, setSingleValue] = React.useState(value?.value || '');
  
  React.useEffect(() => {
    if (operator === 'between') {
      onChange({
        operator,
        value: { min: minValue, max: maxValue }
      });
    } else {
      onChange({
        operator,
        value: singleValue
      });
    }
  }, [operator, minValue, maxValue, singleValue, onChange]);
  
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-sm font-medium">{filter.label}</Label>
      </div>
      
      <Select value={operator} onValueChange={setOperator}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPERATORS.number.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {operator === 'between' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Mínimo"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Máximo"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
        </div>
      ) : (
        <Input
          type="number"
          placeholder={filter.placeholder || 'Digite o valor...'}
          value={singleValue}
          onChange={(e) => setSingleValue(e.target.value)}
        />
      )}
    </div>
  );
};

// Componente de filtro booleano
const BooleanFilter = ({ filter, value, onChange, className = '' }) => {
  const handleChange = (checked) => {
    onChange({
      operator: 'equals',
      value: checked
    });
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={filter.key}
          checked={value?.value || false}
          onCheckedChange={handleChange}
        />
        <Label htmlFor={filter.key} className="text-sm font-medium cursor-pointer">
          {filter.label}
        </Label>
      </div>
    </div>
  );
};

// Componente principal de filtros
export const StandardFilters = ({
  filters = [],
  values = {},
  onChange,
  onReset,
  showActiveCount = true,
  showResetButton = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Contar filtros ativos
  const activeFiltersCount = Object.keys(values).filter(key => {
    const value = values[key];
    if (!value) return false;
    
    if (Array.isArray(value.value)) {
      return value.value.length > 0;
    }
    
    if (typeof value.value === 'object' && value.value !== null) {
      return Object.values(value.value).some(v => v !== null && v !== '');
    }
    
    return value.value !== null && value.value !== '';
  }).length;
  
  const handleFilterChange = (filterKey, filterValue) => {
    onChange({
      ...values,
      [filterKey]: filterValue
    });
  };
  
  const handleReset = () => {
    onReset?.();
    setIsOpen(false);
  };
  
  const renderFilter = (filter) => {
    const value = values[filter.key];
    
    switch (filter.type) {
      case FILTER_TYPES.TEXT:
        return (
          <TextFilter
            key={filter.key}
            filter={filter}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
          />
        );
      
      case FILTER_TYPES.SELECT:
        return (
          <SelectFilter
            key={filter.key}
            filter={filter}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
          />
        );
      
      case FILTER_TYPES.MULTISELECT:
        return (
          <MultiSelectFilter
            key={filter.key}
            filter={filter}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
          />
        );
      
      case FILTER_TYPES.DATE:
      case FILTER_TYPES.DATE_RANGE:
        return (
          <DateFilter
            key={filter.key}
            filter={filter}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
          />
        );
      
      case FILTER_TYPES.NUMBER:
      case FILTER_TYPES.NUMBER_RANGE:
        return (
          <NumberFilter
            key={filter.key}
            filter={filter}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
          />
        );
      
      case FILTER_TYPES.BOOLEAN:
        return (
          <BooleanFilter
            key={filter.key}
            filter={filter}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
          />
        );
      
      default:
        return null;
    }
  };
  
  if (filters.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {showActiveCount && activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros</h4>
              {showResetButton && activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filters.map(renderFilter)}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Badges dos filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {Object.entries(values).map(([key, value]) => {
            if (!value || 
                (Array.isArray(value.value) && value.value.length === 0) ||
                (typeof value.value === 'object' && value.value !== null && 
                 !Object.values(value.value).some(v => v !== null && v !== '')) ||
                (value.value === null || value.value === '')) {
              return null;
            }
            
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;
            
            let displayValue = '';
            if (Array.isArray(value.value)) {
              displayValue = `${value.value.length} selecionado(s)`;
            } else if (typeof value.value === 'object' && value.value !== null) {
              if (value.value.start && value.value.end) {
                displayValue = `${format(new Date(value.value.start), 'dd/MM/yy')} - ${format(new Date(value.value.end), 'dd/MM/yy')}`;
              } else if (value.value.min && value.value.max) {
                displayValue = `${value.value.min} - ${value.value.max}`;
              }
            } else {
              displayValue = value.value.toString();
            }
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {filter.label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange(key, null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Hook para gerenciar estado de filtros
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = React.useState(initialFilters);
  
  const updateFilter = React.useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  const removeFilter = React.useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);
  
  const resetFilters = React.useCallback(() => {
    setFilters({});
  }, []);
  
  const hasActiveFilters = React.useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);
  
  return {
    filters,
    updateFilter,
    removeFilter,
    resetFilters,
    hasActiveFilters,
    setFilters
  };
};

export { FILTER_TYPES };
export default StandardFilters;