/**
 * TABELAS PADRÃO - TOIT NEXUS
 * Componentes de tabela consistentes para todo o sistema
 * Versão: 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

/**
 * Hook para gerenciar estado da tabela
 */
export const useTableState = ({
  data = [],
  initialSortBy = null,
  initialSortOrder = 'asc',
  initialPageSize = 10,
  searchableColumns = []
}) => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});

  // Dados filtrados e ordenados
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Aplicar busca
    if (searchTerm && searchableColumns.length > 0) {
      filtered = filtered.filter(item =>
        searchableColumns.some(column =>
          String(item[column] || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    // Aplicar ordenação
    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, searchableColumns, filters, sortBy, sortOrder]);

  // Dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Informações de paginação
  const totalPages = Math.ceil(processedData.length / pageSize);
  const totalItems = processedData.length;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Funções de controle
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectRow = (rowId, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(paginatedData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({});
    setCurrentPage(1);
    setSelectedRows([]);
  };

  return {
    // Dados
    data: paginatedData,
    totalItems,
    totalPages,
    startItem,
    endItem,
    
    // Estado
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    searchTerm,
    selectedRows,
    filters,
    
    // Ações
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    setSearchTerm,
    setSelectedRows,
    setFilters,
    handleSort,
    handleSelectRow,
    handleSelectAll,
    resetFilters
  };
};

/**
 * Componente de Cabeçalho de Coluna Ordenável
 */
export const SortableHeader = ({ column, sortBy, sortOrder, onSort, children, className }) => {
  const isSorted = sortBy === column;
  
  return (
    <TableHead className={cn("cursor-pointer select-none", className)}>
      <div
        className="flex items-center space-x-1 hover:text-gray-900"
        onClick={() => onSort(column)}
      >
        <span>{children}</span>
        <div className="flex flex-col">
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          )}
        </div>
      </div>
    </TableHead>
  );
};

/**
 * Componente de Barra de Ferramentas da Tabela
 */
export const TableToolbar = ({
  title,
  description,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  activeFilters = {},
  onFilterChange,
  onRefresh,
  onExport,
  onAdd,
  addButtonText = "Adicionar",
  selectedCount = 0,
  bulkActions = [],
  onResetFilters,
  className
}) => {
  const hasActiveFilters = Object.values(activeFilters).some(value => value && value !== 'all');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Título e descrição */}
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      
      {/* Barra de ferramentas */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          {/* Busca */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtros */}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || 'all'}
              onValueChange={(value) => onFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          {/* Botão de limpar filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        {/* Ações */}
        <div className="flex items-center space-x-2">
          {/* Ações em lote */}
          {selectedCount > 0 && bulkActions.length > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-600">
                {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          {/* Atualizar */}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          {/* Exportar */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          )}
          
          {/* Adicionar */}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de Paginação
 */
export const TablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Informações */}
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-700">
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </p>
        
        {/* Seletor de tamanho da página */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Itens por página:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Navegação */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-sm text-gray-500">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

/**
 * Componente de Menu de Ações da Linha
 */
export const RowActions = ({ actions = [], row }) => {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator ? (
              <DropdownMenuSeparator />
            ) : (
              <DropdownMenuItem
                onClick={() => action.onClick(row)}
                className={cn(
                  action.variant === 'destructive' && "text-red-600 focus:text-red-600"
                )}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Componente de Tabela Padrão
 */
export const StandardTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  emptyMessage = "Nenhum dado encontrado",
  selectable = false,
  sortable = true,
  searchable = true,
  searchableColumns = [],
  filters = [],
  actions = [],
  bulkActions = [],
  onRefresh,
  onExport,
  onAdd,
  addButtonText,
  title,
  description,
  className,
  tableClassName,
  ...tableProps
}) => {
  const tableState = useTableState({
    data,
    searchableColumns: searchableColumns.length > 0 ? searchableColumns : columns.map(col => col.key),
    ...tableProps
  });

  const {
    data: paginatedData,
    totalItems,
    totalPages,
    startItem,
    endItem,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    searchTerm,
    selectedRows,
    filters: activeFilters,
    handleSort,
    handleSelectRow,
    handleSelectAll,
    setCurrentPage,
    setPageSize,
    setSearchTerm,
    setFilters,
    resetFilters
  } = tableState;

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados: {error}</p>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Barra de ferramentas */}
        <TableToolbar
          title={title}
          description={description}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={(key, value) => setFilters({ ...activeFilters, [key]: value })}
          onRefresh={onRefresh}
          onExport={onExport}
          onAdd={onAdd}
          addButtonText={addButtonText}
          selectedCount={selectedRows.length}
          bulkActions={bulkActions}
          onResetFilters={resetFilters}
          className="mb-6"
        />
        
        {/* Tabela */}
        <div className="rounded-md border">
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow>
                {/* Checkbox de seleção */}
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                
                {/* Colunas */}
                {columns.map((column) => (
                  sortable && column.sortable !== false ? (
                    <SortableHeader
                      key={column.key}
                      column={column.key}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                      className={column.headerClassName}
                    >
                      {column.title}
                    </SortableHeader>
                  ) : (
                    <TableHead key={column.key} className={column.headerClassName}>
                      {column.title}
                    </TableHead>
                  )
                ))}
                
                {/* Ações */}
                {actions.length > 0 && (
                  <TableHead className="w-12">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="text-center py-8"
                  >
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Carregando...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="text-center py-8 text-gray-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={row.id || index}>
                    {/* Checkbox de seleção */}
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked)}
                        />
                      </TableCell>
                    )}
                    
                    {/* Células */}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.cellClassName}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                    
                    {/* Ações */}
                    {actions.length > 0 && (
                      <TableCell>
                        <RowActions actions={actions} row={row} />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            className="mt-6"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StandardTable;