/**
 * TESTES DO COMPONENTE MLSlotsWidget
 * Testa funcionalidades e interface do widget de slots ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MLSlotsWidget } from '../../components/ml/MLSlotsWidget';
import { useMLSlots } from '../../hooks/useMLSlots';

// Mock do hook useMLSlots
jest.mock('../../hooks/useMLSlots');

const mockUseMLSlots = useMLSlots;

describe('MLSlotsWidget', () => {
  const defaultMockData = {
    slots: {
      total: 10,
      used: 3,
      available: 7,
      list: [
        {
          id: 'slot-1',
          slot_type: 'dashboard_widget',
          slot_name: 'Sales Prediction Widget',
          slot_location: 'dashboard_sales_widget_1',
          is_active: true,
          usage_count: 15,
          last_used_at: '2024-01-15T10:30:00Z',
          typeInfo: {
            description: 'Widget preditivo para dashboards'
          }
        },
        {
          id: 'slot-2',
          slot_type: 'report_column',
          slot_name: 'Revenue Forecast Column',
          slot_location: 'report_revenue_column_1',
          is_active: true,
          usage_count: 8,
          last_used_at: '2024-01-14T15:45:00Z',
          typeInfo: {
            description: 'ML aplicado em colunas de relatórios'
          }
        }
      ]
    },
    storage: {
      total: 10737418240, // 10GB
      used: 2147483648,   // 2GB
      available: 8589934592, // 8GB
      categories: {
        uploads: { used: 1073741824, limit: 5368709120 },
        database: { used: 536870912, limit: 2147483648 },
        cache: { used: 268435456, limit: 1073741824 }
      },
      analysis: {
        status: 'ok',
        warnings: [],
        recommendations: []
      }
    },
    createSlot: jest.fn(),
    deactivateSlot: jest.fn(),
    canCreateSlot: jest.fn(() => true),
    formatBytes: jest.fn((bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }),
    isLoading: false,
    error: null,
    refresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMLSlots.mockReturnValue(defaultMockData);
  });

  describe('Renderização Básica', () => {
    test('deve renderizar widget completo corretamente', () => {
      render(<MLSlotsWidget />);

      expect(screen.getByText('Slots ML')).toBeInTheDocument();
      expect(screen.getByText('3/10 slots em uso • 7 disponíveis')).toBeInTheDocument();
      expect(screen.getByText('Novo Slot')).toBeInTheDocument();
    });

    test('deve renderizar versão compacta corretamente', () => {
      render(<MLSlotsWidget variant="compact" />);

      expect(screen.getByText('Slots ML')).toBeInTheDocument();
      expect(screen.getByText('3/10 em uso')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('disponíveis')).toBeInTheDocument();
    });

    test('deve mostrar barra de progresso correta', () => {
      render(<MLSlotsWidget />);

      const progressBar = screen.getByRole('progressbar', { hidden: true });
      expect(progressBar).toHaveStyle('width: 30%'); // 3/10 = 30%
    });

    test('deve renderizar lista de slots', () => {
      render(<MLSlotsWidget />);

      expect(screen.getByText('Sales Prediction Widget')).toBeInTheDocument();
      expect(screen.getByText('Revenue Forecast Column')).toBeInTheDocument();
      expect(screen.getByText('📍 dashboard_sales_widget_1')).toBeInTheDocument();
      expect(screen.getByText('🔢 15 usos')).toBeInTheDocument();
    });
  });

  describe('Estados de Loading e Erro', () => {
    test('deve mostrar loading state', () => {
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        isLoading: true
      });

      render(<MLSlotsWidget />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    test('deve mostrar estado de erro', () => {
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        isLoading: false,
        error: 'Erro ao carregar slots ML'
      });

      render(<MLSlotsWidget />);

      expect(screen.getByText('Erro ao carregar slots ML')).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar slots ML')).toBeInTheDocument();
    });

    test('deve mostrar estado vazio quando não há slots', () => {
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        slots: {
          ...defaultMockData.slots,
          list: []
        }
      });

      render(<MLSlotsWidget />);

      expect(screen.getByText('Nenhum slot ML configurado')).toBeInTheDocument();
      expect(screen.getByText('Crie seu primeiro slot ML para começar a usar inteligência artificial.')).toBeInTheDocument();
    });
  });

  describe('Interações do Usuário', () => {
    test('deve abrir modal ao clicar em "Novo Slot"', () => {
      render(<MLSlotsWidget />);

      const newSlotButton = screen.getByText('Novo Slot');
      fireEvent.click(newSlotButton);

      expect(screen.getByText('Criar Novo Slot ML')).toBeInTheDocument();
      expect(screen.getByLabelText('Tipo de Slot')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome do Slot')).toBeInTheDocument();
      expect(screen.getByLabelText('Localização')).toBeInTheDocument();
    });

    test('deve criar novo slot através do modal', async () => {
      const mockCreateSlot = jest.fn().mockResolvedValue({ success: true });
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        createSlot: mockCreateSlot
      });

      render(<MLSlotsWidget />);

      // Abrir modal
      fireEvent.click(screen.getByText('Novo Slot'));

      // Preencher formulário
      fireEvent.change(screen.getByLabelText('Nome do Slot'), {
        target: { value: 'Test Widget' }
      });
      fireEvent.change(screen.getByLabelText('Localização'), {
        target: { value: 'test_widget_1' }
      });

      // Submeter
      fireEvent.click(screen.getByText('Criar Slot'));

      await waitFor(() => {
        expect(mockCreateSlot).toHaveBeenCalledWith(
          'dashboard_widget',
          'Test Widget',
          'test_widget_1',
          {}
        );
      });
    });

    test('deve remover slot ao clicar no botão de remoção', async () => {
      const mockDeactivateSlot = jest.fn().mockResolvedValue({ success: true });
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        deactivateSlot: mockDeactivateSlot
      });

      // Mock do window.confirm
      window.confirm = jest.fn(() => true);

      render(<MLSlotsWidget />);

      const removeButtons = screen.getAllByTitle('Remover slot');
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(mockDeactivateSlot).toHaveBeenCalledWith('dashboard_sales_widget_1');
      });
    });

    test('deve cancelar remoção se usuário não confirmar', async () => {
      const mockDeactivateSlot = jest.fn();
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        deactivateSlot: mockDeactivateSlot
      });

      // Mock do window.confirm retornando false
      window.confirm = jest.fn(() => false);

      render(<MLSlotsWidget />);

      const removeButtons = screen.getAllByTitle('Remover slot');
      fireEvent.click(removeButtons[0]);

      expect(mockDeactivateSlot).not.toHaveBeenCalled();
    });
  });

  describe('Informações de Storage', () => {
    test('deve mostrar informações de storage corretamente', () => {
      render(<MLSlotsWidget />);

      expect(screen.getByText('Storage')).toBeInTheDocument();
      expect(screen.getByText('2 GB de 10 GB usado')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('utilizado')).toBeInTheDocument();
    });

    test('deve mostrar warnings de storage quando necessário', () => {
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        storage: {
          ...defaultMockData.storage,
          analysis: {
            status: 'warning',
            warnings: ['Storage em nível alto (80%+)'],
            recommendations: []
          }
        }
      });

      render(<MLSlotsWidget />);

      expect(screen.getByText('Storage em nível alto (80%+)')).toBeInTheDocument();
    });

    test('deve mostrar cores diferentes na barra de progresso baseado no uso', () => {
      // Teste com uso alto (>90%)
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        storage: {
          ...defaultMockData.storage,
          used: 9663676416, // 9GB
          total: 10737418240 // 10GB
        }
      });

      render(<MLSlotsWidget />);

      const storageProgressBar = screen.getAllByRole('progressbar', { hidden: true })[1];
      expect(storageProgressBar).toHaveClass('bg-red-500');
    });
  });

  describe('Responsividade e Acessibilidade', () => {
    test('deve ter labels apropriados para screen readers', () => {
      render(<MLSlotsWidget />);

      expect(screen.getByLabelText('Tipo de Slot')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome do Slot')).toBeInTheDocument();
      expect(screen.getByLabelText('Localização')).toBeInTheDocument();
    });

    test('deve ter botões com títulos descritivos', () => {
      render(<MLSlotsWidget />);

      expect(screen.getByTitle('Remover slot')).toBeInTheDocument();
    });

    test('deve permitir navegação por teclado', () => {
      render(<MLSlotsWidget />);

      const newSlotButton = screen.getByText('Novo Slot');
      newSlotButton.focus();
      expect(newSlotButton).toHaveFocus();

      // Simular Tab para próximo elemento
      fireEvent.keyDown(newSlotButton, { key: 'Tab' });
    });
  });

  describe('Validação de Formulário', () => {
    test('deve mostrar erro quando campos obrigatórios estão vazios', async () => {
      render(<MLSlotsWidget />);

      // Abrir modal
      fireEvent.click(screen.getByText('Novo Slot'));

      // Tentar submeter sem preencher campos
      fireEvent.click(screen.getByText('Criar Slot'));

      // Verificar se alert foi chamado (mock do window.alert)
      window.alert = jest.fn();
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Nome e localização são obrigatórios');
      });
    });

    test('deve desabilitar botão durante criação', async () => {
      const mockCreateSlot = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        createSlot: mockCreateSlot
      });

      render(<MLSlotsWidget />);

      // Abrir modal e preencher
      fireEvent.click(screen.getByText('Novo Slot'));
      fireEvent.change(screen.getByLabelText('Nome do Slot'), {
        target: { value: 'Test' }
      });
      fireEvent.change(screen.getByLabelText('Localização'), {
        target: { value: 'test' }
      });

      // Submeter
      fireEvent.click(screen.getByText('Criar Slot'));

      // Verificar se botão está desabilitado
      expect(screen.getByText('Criando...')).toBeDisabled();
    });
  });

  describe('Performance e Otimização', () => {
    test('deve renderizar rapidamente com muitos slots', () => {
      const manySlots = Array.from({ length: 100 }, (_, i) => ({
        id: `slot-${i}`,
        slot_type: 'dashboard_widget',
        slot_name: `Widget ${i}`,
        slot_location: `widget_${i}`,
        is_active: true,
        usage_count: i,
        last_used_at: new Date().toISOString(),
        typeInfo: { description: 'Test widget' }
      }));

      mockUseMLSlots.mockReturnValue({
        ...defaultMockData,
        slots: {
          ...defaultMockData.slots,
          list: manySlots
        }
      });

      const startTime = performance.now();
      render(<MLSlotsWidget />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(100); // Menos de 100ms
      expect(screen.getByText('Widget 0')).toBeInTheDocument();
      expect(screen.getByText('Widget 99')).toBeInTheDocument();
    });
  });
});
