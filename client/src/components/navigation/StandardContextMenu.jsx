import React from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemWithIcon,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../ui/context-menu';

import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { Eye, Edit, Copy, Trash2, Scissors, Clipboard, MousePointer } from 'lucide-react';

// Componente de item de menu com ícone
const ContextMenuItemWithIcon = ({ 
  icon: Icon, 
  children, 
  shortcut,
  disabled = false,
  destructive = false,
  onClick,
  className = '',
  ...props 
}) => {
  return (
    <ContextMenuItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2',
        destructive && 'text-destructive focus:text-destructive',
        className)}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="flex-1">{children}</span>
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuItem>
  );
};

// Componente de submenu com ícone
const ContextMenuSubWithIcon = ({ 
  icon: Icon, 
  children, 
  label,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger 
        disabled={disabled}
        className={cn('flex items-center gap-2', className)}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-48">
        {children}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
};

// Menu de contexto para tabelas
export const TableContextMenu = ({ 
  children, 
  row, 
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  customActions = [],
  showDefaultActions = true,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  
  const handleAction = (action, data) => {
    if (typeof action === 'function') {
      action(data);
    }
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {showDefaultActions && (
          <>
            {onView && (
              <ContextMenuItemWithIcon
                icon={Eye}
                onClick={() => handleAction(onView, row)}
              >
                Visualizar
              </ContextMenuItemWithIcon>
            )}
            
            {onEdit && hasPermission('edit') && (
              <ContextMenuItemWithIcon
                icon={Edit}
                onClick={() => handleAction(onEdit, row)}
                shortcut="Ctrl+E"
              >
                Editar
              </ContextMenuItemWithIcon>
            )}
            
            {onDuplicate && hasPermission('create') && (
              <ContextMenuItemWithIcon
                icon={Copy}
                onClick={() => handleAction(onDuplicate, row)}
                shortcut="Ctrl+D"
              >
                Duplicar
              </ContextMenuItemWithIcon>
            )}
            
            {(onEdit || onDuplicate || onView) && (onDelete || customActions.length > 0) && (
              <ContextMenuSeparator />
            )}
          </>
        )}
        
        {/* Ações customizadas */}
        {customActions.map((action, index) => {
          if (action.type === 'separator') {
            return <ContextMenuSeparator key={index} />;
          }
          
          if (action.type === 'label') {
            return (
              <ContextMenuLabel key={index}>
                {action.label}
              </ContextMenuLabel>
            );
          }
          
          if (action.type === 'submenu') {
            return (
              <ContextMenuSubWithIcon
                key={index}
                icon={action.icon}
                label={action.label}
                disabled={action.disabled}
              >
                {action.items?.map((subItem, subIndex) => (
                  <ContextMenuItemWithIcon
                    key={subIndex}
                    icon={subItem.icon}
                    onClick={() => handleAction(subItem.onClick, row)}
                    disabled={subItem.disabled}
                    destructive={subItem.destructive}
                  >
                    {subItem.label}
                  </ContextMenuItemWithIcon>
                ))}
              </ContextMenuSubWithIcon>
            );
          }
          
          if (action.type === 'checkbox') {
            return (
              <ContextMenuCheckboxItem
                key={index}
                checked={action.checked}
                onCheckedChange={(checked) => handleAction(action.onCheckedChange, { row, checked })}
                disabled={action.disabled}
              >
                {action.label}
              </ContextMenuCheckboxItem>
            );
          }
          
          if (action.type === 'radio') {
            return (
              <ContextMenuRadioGroup key={index} value={action.value} onValueChange={action.onValueChange}>
                {action.options?.map((option, optionIndex) => (
                  <ContextMenuRadioItem key={optionIndex} value={option.value}>
                    {option.label}
                  </ContextMenuRadioItem>
                ))}
              </ContextMenuRadioGroup>
            );
          }
          
          // Item padrão
          return (
            <ContextMenuItemWithIcon
              key={index}
              icon={action.icon}
              onClick={() => handleAction(action.onClick, row)}
              disabled={action.disabled || (action.permission && !hasPermission(action.permission))}
              destructive={action.destructive}
              shortcut={action.shortcut}
            >
              {action.label}
            </ContextMenuItemWithIcon>
          );
        })}
        
        {onDelete && hasPermission('delete') && (
          <>
            {(showDefaultActions || customActions.length > 0) && <ContextMenuSeparator />}
            <ContextMenuItemWithIcon
              icon={Trash2}
              onClick={() => handleAction(onDelete, row)}
              destructive
              shortcut="Del"
            >
              Excluir
            </ContextMenuItemWithIcon>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Menu de contexto para cards
export const CardContextMenu = ({ 
  children, 
  item, 
  actions = [],
  className = ''
}) => {
  const { hasPermission } = useAuth();
  
  const handleAction = (action, data) => {
    if (typeof action === 'function') {
      action(data);
    }
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {actions.map((action, index) => {
          if (action.type === 'separator') {
            return <ContextMenuSeparator key={index} />;
          }
          
          if (action.type === 'label') {
            return (
              <ContextMenuLabel key={index}>
                {action.label}
              </ContextMenuLabel>
            );
          }
          
          return (
            <ContextMenuItemWithIcon
              key={index}
              icon={action.icon}
              onClick={() => handleAction(action.onClick, item)}
              disabled={action.disabled || (action.permission && !hasPermission(action.permission))}
              destructive={action.destructive}
              shortcut={action.shortcut}
            >
              {action.label}
            </ContextMenuItemWithIcon>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Menu de contexto para texto/seleção
export const TextContextMenu = ({ 
  children, 
  selectedText = '',
  onCopy,
  onCut,
  onPaste,
  onSelectAll,
  customActions = [],
  className = ''
}) => {
  const handleClipboardAction = async (action) => {
    try {
      switch (action) {
        case 'copy':
          if (selectedText) {
            await navigator.clipboard.writeText(selectedText);
            onCopy?.(selectedText);
          }
          break;
        case 'cut':
          if (selectedText) {
            await navigator.clipboard.writeText(selectedText);
            onCut?.(selectedText);
          }
          break;
        case 'paste':
          const text = await navigator.clipboard.readText();
          onPaste?.(text);
          break;
        case 'selectAll':
          onSelectAll?.();
          break;
      }
    } catch (error) {
      console.error('Erro na ação da área de transferência:', error);
    }
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItemWithIcon
          icon={Copy}
          onClick={() => handleClipboardAction('copy')}
          disabled={!selectedText}
          shortcut="Ctrl+C"
        >
          Copiar
        </ContextMenuItemWithIcon>
        
        <ContextMenuItemWithIcon
          icon={Scissors}
          onClick={() => handleClipboardAction('cut')}
          disabled={!selectedText}
          shortcut="Ctrl+X"
        >
          Recortar
        </ContextMenuItemWithIcon>
        
        <ContextMenuItemWithIcon
          icon={Clipboard}
          onClick={() => handleClipboardAction('paste')}
          shortcut="Ctrl+V"
        >
          Colar
        </ContextMenuItemWithIcon>
        
        <ContextMenuSeparator />
        
        <ContextMenuItemWithIcon
          icon={MousePointer}
          onClick={() => handleClipboardAction('selectAll')}
          shortcut="Ctrl+A"
        >
          Selecionar Tudo
        </ContextMenuItemWithIcon>
        
        {customActions.length > 0 && (
          <>
            <ContextMenuSeparator />
            {customActions.map((action, index) => (
              <ContextMenuItemWithIcon
                key={index}
                icon={action.icon}
                onClick={() => action.onClick?.(selectedText)}
                disabled={action.disabled}
                destructive={action.destructive}
                shortcut={action.shortcut}
              >
                {action.label}
              </ContextMenuItemWithIcon>
            ))}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Menu de contexto genérico
export const StandardContextMenu = ({ 
  children, 
  actions = [],
  data = null,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  
  const handleAction = (action, actionData) => {
    if (typeof action === 'function') {
      action(actionData);
    }
  };
  
  const renderAction = (action, index) => {
    if (action.type === 'separator') {
      return <ContextMenuSeparator key={index} />;
    }
    
    if (action.type === 'label') {
      return (
        <ContextMenuLabel key={index}>
          {action.label}
        </ContextMenuLabel>
      );
    }
    
    if (action.type === 'submenu') {
      return (
        <ContextMenuSubWithIcon
          key={index}
          icon={action.icon}
          label={action.label}
          disabled={action.disabled || (action.permission && !hasPermission(action.permission))}
        >
          {action.items?.map((subItem, subIndex) => renderAction(subItem, subIndex))}
        </ContextMenuSubWithIcon>
      );
    }
    
    if (action.type === 'checkbox') {
      return (
        <ContextMenuCheckboxItem
          key={index}
          checked={action.checked}
          onCheckedChange={(checked) => handleAction(action.onCheckedChange, { data, checked })}
          disabled={action.disabled || (action.permission && !hasPermission(action.permission))}
        >
          {action.label}
        </ContextMenuCheckboxItem>
      );
    }
    
    return (
      <ContextMenuItemWithIcon
        key={index}
        icon={action.icon}
        onClick={() => handleAction(action.onClick, data)}
        disabled={action.disabled || (action.permission && !hasPermission(action.permission))}
        destructive={action.destructive}
        shortcut={action.shortcut}
      >
        {action.label}
      </ContextMenuItemWithIcon>
    );
  };
  
  if (actions.length === 0) {
    return children;
  }
  
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {actions.map(renderAction)}
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Hook para gerenciar ações de contexto
export const useContextActions = () => {
  const { hasPermission } = useAuth();
  
  const createAction = React.useCallback((config) => {
    return {
      type: 'item',
      ...config,
      disabled: config.disabled || (config.permission && !hasPermission(config.permission))
    };
  }, [hasPermission]);
  
  const createSeparator = React.useCallback(() => ({ type: 'separator' }), []);
  
  const createLabel = React.useCallback((label) => ({ type: 'label', label }), []);
  
  const createSubmenu = React.useCallback((label, items, config = {}) => {
    return {
      type: 'submenu',
      label,
      items,
      ...config,
      disabled: config.disabled || (config.permission && !hasPermission(config.permission))
    };
  }, [hasPermission]);
  
  return {
    createAction,
    createSeparator,
    createLabel,
    createSubmenu
  };
};

export default StandardContextMenu;