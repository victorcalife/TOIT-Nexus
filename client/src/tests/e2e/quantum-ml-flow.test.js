/**
 * TESTES E2E - FLUXO COMPLETO QUANTUM ML
 * Testa jornada completa do usuário no sistema ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { test, expect } from '@playwright/test';

test.describe('Quantum ML - Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar interceptadores de API
    await page.route('/api/ml-slots', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              totalSlots: 10,
              usedSlots: 2,
              availableSlots: 8,
              slots: [
                {
                  id: 'slot-1',
                  slot_type: 'dashboard_widget',
                  slot_name: 'Sales Prediction Widget',
                  slot_location: 'dashboard_sales_widget_1',
                  is_active: true,
                  usage_count: 15,
                  last_used_at: '2024-01-15T10:30:00Z'
                }
              ],
              planName: 'quantum_plus',
              planDisplayName: 'NEXUS Quantum Plus'
            }
          })
        });
      }
    });

    await page.route('/api/storage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            usage: { total: 2147483648, uploads: 1073741824 },
            limits: { total: 10737418240, uploads: 5368709120 },
            analysis: { status: 'ok', warnings: [], recommendations: [] }
          }
        })
      });
    });

    // Navegar para a página
    await page.goto('/quantum-ml');
  });

  test('deve exibir dashboard principal corretamente', async ({ page }) => {
    // Verificar título da página
    await expect(page.locator('h1')).toContainText('Quantum ML Dashboard');

    // Verificar widget de slots
    await expect(page.locator('[data-testid="ml-slots-widget"]')).toBeVisible();
    await expect(page.getByText('2/10 slots em uso')).toBeVisible();
    await expect(page.getByText('8 disponíveis')).toBeVisible();

    // Verificar informações de storage
    await expect(page.getByText('Storage')).toBeVisible();
    await expect(page.getByText('2 GB de 10 GB usado')).toBeVisible();
  });

  test('deve criar novo slot ML através do modal', async ({ page }) => {
    // Interceptar criação de slot
    await page.route('/api/ml-slots', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              slotId: 'new-slot-id',
              slotType: 'dashboard_widget',
              slotName: 'Test Widget E2E',
              slotLocation: 'test_widget_e2e_1'
            }
          })
        });
      }
    });

    // Clicar no botão "Novo Slot"
    await page.getByText('Novo Slot').click();

    // Verificar se modal abriu
    await expect(page.getByText('Criar Novo Slot ML')).toBeVisible();

    // Preencher formulário
    await page.getByLabel('Nome do Slot').fill('Test Widget E2E');
    await page.getByLabel('Localização').fill('test_widget_e2e_1');
    await page.getByLabel('Tipo de Slot').selectOption('dashboard_widget');

    // Submeter formulário
    await page.getByText('Criar Slot').click();

    // Verificar se modal fechou
    await expect(page.getByText('Criar Novo Slot ML')).not.toBeVisible();

    // Verificar se API foi chamada corretamente
    const requests = page.context().requests;
    const createRequest = requests.find(req => 
      req.url().includes('/api/ml-slots') && req.method() === 'POST'
    );
    expect(createRequest).toBeTruthy();
  });

  test('deve navegar entre páginas do sistema ML', async ({ page }) => {
    // Navegar para configuração de planos
    await page.getByText('Configurar Planos').click();
    await expect(page.url()).toContain('/ml-plans-configuration');
    await expect(page.getByText('Configuração de Planos ML')).toBeVisible();

    // Voltar para dashboard
    await page.getByText('Dashboard ML').click();
    await expect(page.url()).toContain('/quantum-ml');
    await expect(page.getByText('Quantum ML Dashboard')).toBeVisible();
  });

  test('deve executar insight ML através do botão', async ({ page }) => {
    // Interceptar execução de insight
    await page.route('/api/quantum/insight', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            insights: [
              'Tendência de crescimento de 15% identificada',
              'Pico de vendas esperado na próxima semana',
              'Recomenda-se aumentar estoque em 20%'
            ],
            predictions: [
              { date: '2024-01-16', value: 1150 },
              { date: '2024-01-17', value: 1200 },
              { date: '2024-01-18', value: 1180 }
            ],
            confidence: 0.87,
            processingTime: 1500
          }
        })
      });
    });

    // Localizar e clicar no botão de insight
    await page.getByText('Gerar Insight ML').click();

    // Verificar se loading aparece
    await expect(page.getByText('Processando...')).toBeVisible();

    // Aguardar resultado
    await expect(page.getByText('Tendência de crescimento de 15% identificada')).toBeVisible();
    await expect(page.getByText('Confiança: 87%')).toBeVisible();
  });

  test('deve mostrar alertas de limite de storage', async ({ page }) => {
    // Interceptar com storage em nível alto
    await page.route('/api/storage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            usage: { total: 9663676416 }, // 9GB
            limits: { total: 10737418240 }, // 10GB
            analysis: {
              status: 'warning',
              warnings: ['Storage em nível alto (90%+)'],
              recommendations: ['Considere fazer upgrade do plano']
            }
          }
        })
      });
    });

    // Recarregar página
    await page.reload();

    // Verificar se alerta aparece
    await expect(page.getByText('Storage em nível alto (90%+)')).toBeVisible();
    await expect(page.locator('.bg-yellow-50')).toBeVisible();
  });

  test('deve validar formulário de criação de slot', async ({ page }) => {
    // Abrir modal
    await page.getByText('Novo Slot').click();

    // Tentar submeter sem preencher campos
    await page.getByText('Criar Slot').click();

    // Verificar se validação aparece
    await expect(page.getByText('Nome e localização são obrigatórios')).toBeVisible();

    // Preencher apenas nome
    await page.getByLabel('Nome do Slot').fill('Test Widget');
    await page.getByText('Criar Slot').click();

    // Verificar se ainda mostra erro
    await expect(page.getByText('Nome e localização são obrigatórios')).toBeVisible();

    // Preencher localização
    await page.getByLabel('Localização').fill('test_widget');

    // Agora deve permitir submissão
    await page.getByText('Criar Slot').click();
    await expect(page.getByText('Nome e localização são obrigatórios')).not.toBeVisible();
  });

  test('deve remover slot com confirmação', async ({ page }) => {
    // Interceptar remoção
    await page.route('/api/ml-slots/dashboard_sales_widget_1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { slotId: 'slot-1', slotName: 'Sales Prediction Widget' }
          })
        });
      }
    });

    // Mock do confirm dialog
    await page.addInitScript(() => {
      window.confirm = () => true;
    });

    // Clicar no botão de remoção
    await page.getByTitle('Remover slot').first().click();

    // Verificar se slot foi removido (API chamada)
    const requests = page.context().requests;
    const deleteRequest = requests.find(req => 
      req.url().includes('/api/ml-slots/dashboard_sales_widget_1') && 
      req.method() === 'DELETE'
    );
    expect(deleteRequest).toBeTruthy();
  });

  test('deve cancelar remoção quando usuário não confirma', async ({ page }) => {
    // Mock do confirm dialog retornando false
    await page.addInitScript(() => {
      window.confirm = () => false;
    });

    // Clicar no botão de remoção
    await page.getByTitle('Remover slot').first().click();

    // Verificar se slot ainda está visível
    await expect(page.getByText('Sales Prediction Widget')).toBeVisible();
  });

  test('deve ser responsivo em diferentes tamanhos de tela', async ({ page }) => {
    // Testar em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="ml-slots-widget"]')).toBeVisible();

    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="ml-slots-widget"]')).toBeVisible();

    // Testar em desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="ml-slots-widget"]')).toBeVisible();
  });

  test('deve manter estado durante navegação', async ({ page }) => {
    // Abrir modal
    await page.getByText('Novo Slot').click();
    await page.getByLabel('Nome do Slot').fill('Test Widget');

    // Navegar para outra página
    await page.getByText('Configurar Planos').click();

    // Voltar
    await page.getByText('Dashboard ML').click();

    // Verificar se modal não está mais aberto (estado resetado)
    await expect(page.getByText('Criar Novo Slot ML')).not.toBeVisible();
  });

  test('deve tratar erros de API graciosamente', async ({ page }) => {
    // Interceptar com erro
    await page.route('/api/ml-slots', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
          })
        });
      }
    });

    // Recarregar página
    await page.reload();

    // Verificar se erro é mostrado
    await expect(page.getByText('Erro ao carregar slots ML')).toBeVisible();
    await expect(page.getByText('Erro interno do servidor')).toBeVisible();
  });

  test('deve funcionar com teclado (acessibilidade)', async ({ page }) => {
    // Navegar com Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verificar se botão "Novo Slot" está focado
    await expect(page.getByText('Novo Slot')).toBeFocused();

    // Pressionar Enter para abrir modal
    await page.keyboard.press('Enter');
    await expect(page.getByText('Criar Novo Slot ML')).toBeVisible();

    // Navegar pelos campos do formulário
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Tipo de Slot')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Nome do Slot')).toBeFocused();

    // Fechar modal com Escape
    await page.keyboard.press('Escape');
    await expect(page.getByText('Criar Novo Slot ML')).not.toBeVisible();
  });
});

// Configuração do Playwright
module.exports = {
  testDir: './client/src/tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://nexus.toit.com.br',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};
