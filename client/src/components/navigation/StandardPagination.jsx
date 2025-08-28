import React from 'react';
import { 






 }
} from '../ui/pagination';
import { 




 }
} from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {  




 }
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Opções padrão de itens por página
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Componente de informações da paginação
const PaginationInfo = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  pageSize,
  startItem,
  endItem,
  className = ''
}) => {
  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      Mostrando {startItem} a {endItem} de {totalItems} {totalItems === 1 ? 'item' : 'itens'}
    </div>
  );
};

// Componente de seletor de tamanho da página
const PageSizeSelector = ({ 
  pageSize, 
  onPageSizeChange, 
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label htmlFor="page-size" className="text-sm font-medium">
        Itens por página:
      </Label>
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => onPageSizeChange(Number(value))}
        disabled={disabled}
      >
        <SelectTrigger id="page-size" className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option} por página
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Componente de navegação rápida para página
const QuickPageNavigation = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  disabled = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(inputValue);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputValue('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
      <Label htmlFor="page-input" className="text-sm font-medium">
        Ir para página:
      </Label>
      <Input
        id="page-input"
        type="number"
        min={1}
        max={totalPages}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={currentPage.toString()}
        className="w-20"
        disabled={disabled}
      />
      <Button type="submit" variant="outline" size="sm" disabled={disabled}>

      </Button>
    </form>
  );
};

// Componente principal de paginação
export const StandardPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showQuickNavigation = false,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled = false,
  className = '',
  variant = 'default' // 'default', 'simple', 'compact'
}) => {
  // Calcular itens visíveis
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  // Gerar números de página visíveis
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;
  
  // Handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange?.(page);
    }
  };
  
  const handlePageSizeChange = (newPageSize) => {
    if (!disabled) {
      onPageSizeChange?.(newPageSize);
    }
  };
  
  // Renderização para variante simples
  if (variant === 'simple') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        {showInfo && (
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            startItem={startItem}
            endItem={endItem}
          />
        )}
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />

          </Button>
          
          <span className="text-sm font-medium">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage >= totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Renderização para variante compacta
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium px-2">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {showPageSizeSelector && (
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            options={pageSizeOptions}
            disabled={disabled}
          />
        )}
      </div>
    );
  }
  
  // Renderização padrão
  return (
    <div className={cn('space-y-4', className)}>
      {/* Informações e controles superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {showInfo && (
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            startItem={startItem}
            endItem={endItem}
          />
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          {showQuickNavigation && (
            <QuickPageNavigation
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={disabled}
            />
          )}
          
          {showPageSizeSelector && (
            <PageSizeSelector
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              options={pageSizeOptions}
              disabled={disabled}
            />
          )}
        </div>
      </div>
      
      {/* Navegação de páginas */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* Primeira página */}
            {showFirstLast && currentPage > 1 && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={disabled}
                  className="h-9 w-9"
                >
                  <ChevronFirst className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
            
            {/* Página anterior */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={disabled || currentPage <= 1}
              />
            </PaginationItem>
            
            {/* Primeira página se não estiver visível */}
            {showStartEllipsis && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    disabled={disabled}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}
            
            {/* Páginas visíveis */}
            {visiblePages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  disabled={disabled}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {/* Última página se não estiver visível */}
            {showEndEllipsis && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(totalPages)}
                    disabled={disabled}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            {/* Próxima página */}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={disabled || currentPage >= totalPages}
              />
            </PaginationItem>
            
            {/* Última página */}
            {showFirstLast && currentPage < totalPages && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={disabled}
                  className="h-9 w-9"
                >
                  <ChevronLast className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

// Hook para gerenciar estado de paginação
export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0
} = {}) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const handlePageChange = React.useCallback((page) => {
    setCurrentPage(page);
  }, []);
  
  const handlePageSizeChange = React.useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset para primeira página
  }, []);
  
  const reset = React.useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  // Ajustar página atual se estiver fora do range
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  return {
    currentPage,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    reset,
    // Valores calculados
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
    startItem: Math.min((currentPage - 1) * pageSize + 1, totalItems),
    endItem: Math.min(currentPage * pageSize, totalItems)
  };
};

export default StandardPagination;