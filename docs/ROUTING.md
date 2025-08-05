# Estrutura de Roteamento - TOIT NEXUS

Este documento descreve a estrutura de roteamento do sistema TOIT NEXUS, incluindo as rotas disponíveis para cada tipo de usuário (persona) e como o sistema gerencia a autenticação e autorização.

## Visão Geral

O sistema de roteamento foi projetado para atender três personas principais:

1. **Equipe TOIT** - Acesso administrativo completo
2. **Usuário Pessoa Física** - Acesso limitado às funcionalidades individuais
3. **Empresas** - Acesso administrativo limitado ao seu próprio ambiente

## Estrutura de Arquivos

```
client/src/
├── components/
│   └── routing/
│       └── AppRouter.tsx     # Componente principal de roteamento
└── config/
    └── routes/
        ├── index.ts          # Exportações e constantes de rotas
        ├── publicRoutes.tsx  # Rotas públicas (login, recuperação de senha, etc.)
        ├── adminRoutes.tsx   # Rotas administrativas (TOIT)
        └── clientRoutes.tsx  # Rotas do cliente (usuários e empresas)
```

## Rotas por Persona

### 1. Equipe TOIT (super_admin, toit_admin)

| Rota | Descrição | Permissões | Layout |
|------|-----------|------------|--------|
| `/admin/dashboard` | Painel administrativo | `super_admin` | admin |
| `/admin/profile-builder` | Gerenciamento de perfis | `super_admin` | admin |
| `/support/dashboard` | Painel de suporte | `super_admin`, `toit_admin` | admin |
| `/toit-admin` | Ferramentas administrativas TOIT | `super_admin`, `toit_admin` | admin |

### 2. Usuário Pessoa Física (user)

| Rota | Descrição | Permissões | Layout |
|------|-----------|------------|--------|
| `/dashboard` | Painel principal | `user` | client |
| `/my-tasks` | Minhas tarefas | `user` | client |
| `/integrations` | Integrações | `user` | client |
| `/settings` | Configurações | `user` | client |

### 3. Empresas (admin, manager, employee)

| Rota | Descrição | Permissões | Layout |
|------|-----------|------------|--------|
| `/dashboard` | Painel principal | `admin`, `manager`, `employee` | client |
| `/clients` | Gerenciamento de clientes | `admin`, `manager` | client |
| `/users` | Gerenciamento de usuários | `admin` | client |
| `/workflows` | Workflows | `admin`, `manager` | client |
| `/reports` | Relatórios | `admin`, `manager` | client |
| `/access-control` | Controle de acesso | `admin` | client |

## Fluxo de Autenticação

1. **Usuário não autenticado**:
   - Acesso limitado a rotas públicas
   - Redirecionado para `/login` ao tentar acessar rotas protegidas

2. **Login bem-sucedido**:
   - Redirecionado para a rota solicitada ou para o dashboard apropriado
   - Sessão é criada e mantida via cookies HTTP-only

3. **Acesso negado**:
   - Usuários sem permissão veem uma página de acesso negado
   - Logs de tentativas de acesso não autorizado são registrados

## Gerenciamento de Estado

O sistema utiliza um hook `useAuth` para gerenciar o estado de autenticação, que fornece:

- `isAuthenticated`: Booleano indicando se o usuário está autenticado
- `user`: Objeto com informações do usuário (role, tenant, etc.)
- `login`: Função para autenticar o usuário
- `logout`: Função para encerrar a sessão
- `checkAuth`: Verifica se o usuário está autenticado

## Segurança

- Todas as rotas de API são protegidas com autenticação via token JWT
- As permissões são verificadas tanto no frontend quanto no backend
- As sessões têm tempo de expiração configurável
- Proteção contra CSRF e XSS implementada

## Próximos Passos

1. Implementar validação de rotas no backend
2. Adicionar mais testes de integração para rotas
3. Documentar todas as rotas da API
4. Implementar rate limiting para prevenir abuso

## Considerações de Desempenho

- O carregamento de rotas é feito de forma lazy para melhorar o tempo de carregamento inicial
- As rotas são agrupadas por funcionalidade para facilitar o code-splitting
- As verificações de autenticação são otimizadas para minimizar chamadas desnecessárias à API
