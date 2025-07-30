# Guia de Testes - Sistema Multi-Tenant InvestFlow

## Arquitetura Implementada

### Sistema de Roles
- **super_admin**: Equipe TOIT - Acesso administrativo completo
- **admin**: Administrador da empresa cliente
- **manager**: Gerente da empresa cliente  
- **employee**: Funcionário da empresa cliente

### Isolamento de Dados
- Cada empresa tem dados completamente isolados
- Middleware automático filtra todos os dados por `tenant_id`
- Super admins podem ver dados de todas as empresas

## Como Testar

### 1. **Acesso como Admin TOIT (Super Admin)**

**Usuário atual**: victorcalife@gmail.com
- ✅ **Já configurado como super_admin**
- 🎯 **Acesso**: Faça login normalmente
- 📍 **Será redirecionado para**: `/admin`
- 🔧 **Funcionalidades**:
  - Ver estatísticas de todos os clientes
  - Gerenciar empresas (suspender/ativar)
  - Monitorar atividades globais
  - Controle total do sistema

### 2. **Acesso como Cliente de Empresa**

**Usuário de teste criado**: test@acme.com (João Silva)
- ✅ **Configurado como admin da "Acme Investimentos"**
- 🎯 **Acesso**: Precisa autenticar via Replit Auth
- 📍 **Será direcionado para**: Interface principal da empresa
- 🔧 **Funcionalidades**:
  - Ver apenas dados da Acme Investimentos
  - Gerenciar clientes, workflows, relatórios
  - Acesso isolado da empresa

### 3. **Empresas de Teste Disponíveis**

1. **Acme Investimentos** (`acme`) - Status: Ativo
2. **Beta Capital** (`beta-capital`) - Status: Ativo  
3. **Gamma Fundos** (`gamma`) - Status: Inativo

## Fluxo de Teste Recomendado

### Como Super Admin (TOIT):
1. Faça login com sua conta atual
2. Você verá o painel administrativo da TOIT
3. Teste suspender/ativar empresas
4. Veja estatísticas globais

### Como Cliente:
1. Seria necessário criar uma conta Replit separada
2. Ou modificar temporariamente seu usuário atual
3. Para simplificar, posso simular o acesso de cliente

## Dados de Teste Inseridos

- ✅ Empresas criadas com diferentes status
- ✅ Usuário super_admin configurado
- ✅ Usuário de teste para Acme Investimentos
- ✅ Estrutura multi-tenant funcionando

## Arquivos Principais

- `server/tenantMiddleware.ts` - Isolamento de dados
- `server/routes.ts` - Rotas com proteção de tenant
- `client/src/App.tsx` - Roteamento baseado em roles
- `client/src/pages/tenant-selection.tsx` - Seleção de empresa
- `client/src/pages/admin/dashboard.tsx` - Painel TOIT

## Status Atual

🟢 **Sistema funcionando e pronto para testes**
🟢 **Isolamento de dados implementado**
🟢 **Interfaces separadas para TOIT e clientes**
🟢 **Autenticação multi-tenant operacional**