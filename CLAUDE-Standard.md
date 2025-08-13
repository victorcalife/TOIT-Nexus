# CLAUDE-Standard.md

**Template Base para Novos Projetos**  
**Documentação Técnica, Processual e Histórica Consolidada**

---
**INTEREAÇÕES SEMPRE NO IDIOMA PORTUGUÊS**
**CASO EXISTA CI-CD É OBRIGATÓRIO GARANTIR E SEGUIR WORKFLOW A RISCA**
**AO COMANDO PUSH, REALIZE PUSH COMPLETO (GITHUB) CONFORME NECESSIDADE DAS ALTERAÇÕES REALIZADAS**
**É PROIBIDO ALTERAR NOMENCLATURAS INCLUISIVE MUDAR LETRAS MINÚSCULAS PARA MAIÚSCULAS OU MAIÚSCULAS PARA MINÚSCULAS**
**NUNCA ALTERE NADA QUE NÃO FOI SOLICITADO!!! CASO TENHA ALGUMA ALTERAÇÃO DE MELHORIA, SUGERIR E AGUARDAR DECISÃO**

## ⚠️ PROTOCOLO OBRIGATÓRIO - SEMPRE LEIA PRIMEIRO - OBRIGATÓRIO SIGNIFICA 100% DAS VEZES - REGRAS INCREBÁVEIS E OBRIGATÓRIAS

**ANTES DE QUALQUER AÇÃO:**
1. **IDIOMA**: SEMPRE responder e comunicar em português brasileiro (pt-BR)
2. **SEMPRE** criar e manter lista de acompanhamento de tarefas (TodoWrite)
3. **JAMAIS** implemente funcionalidades já existentes (consultar seção STATUS FUNCIONALIDADES)
4. **SEMPRE** preservar funcionalidades operacionais
5. **RESPEITAR** hierarquia de permissões do sistema
6. **SEGUIR** padrões de nomenclatura estabelecidos
7. **MANTER** este arquivo sempre atualizado com mudanças
8. **SEMPRE** atualizar este arquivo com regras de negócio, fluxos e processos operacionais
9. **SEMPRE** considerar, manter e atualizar todas as funcionalidades e seus relacionamentos mantendo clareza no entendimento sobre o projeto de forma global, garantindo análise, revisão e tomada de decisões baseadas no contexto global de processos e objetivos do projeto
10. **SEMPRE** que tiver dúvidas ou mais de um caminho a seguir no fluxo, tomar a decisão em conjunto comigo para definirmos cada caminho a seguir
11. **NUNCA** ALTERAR NOMENCLATURAS INCLUISIVE MUDAR LETRAS MINÚSCULAS PARA MAIÚSCULAS OU MAIÚSCULAS PARA MINÚSCULAS
12. **NUNCA** ALTERE NADA QUE NÃO FOI SOLICITADO!!! CASO TENHA ALGUMA ALTERAÇÃO DE MELHORIA, SUGERIR E AGUARDAR DECISÃO
13. **SEMPRE** Implemente uma solução do início ao final (processo end-to-end), garantindo funcionamento entre todos os arquivos necessários durante o desenvolvimento. 
14. **SEMPRE** Popular este arquivo ao final da codificação com a cadeia de relacionamento com outros arquivos
15. **SEMPRE** Popular este arquivo ao final da codificação com as variáveis e constantes criadas em cada arquivo
16. **SEMPRE** Priorize criar funções em arquivos distintos para que possam ser utilizados e chamados em arquivos que serão criados futuramente

## 🤖 PROTOCOLO DE ATUALIZAÇÃO AUTOMÁTICA DO CLAUDE.md

**TRIGGERS OBRIGATÓRIOS PARA ATUALIZAÇÃO:**
### 🔄 A CADA INTERAÇÃO - ATUALIZAÇÃO CONTÍNUA E IMEDIATA:

1. **AVALIAR IMPACTO:** Analisar se a mudança afeta:
   - Status de funcionalidades (seção STATUS ATUAL)
   - Regras de negócio ou processos operacionais
   - Arquitetura técnica ou dependências
   - Problemas conhecidos ou soluções
   - Próximas ações prioritárias
   - Analisar a cadeia como um todo, avaliando todos os arquivos que precisarão ser alterados para eficiência da tarefa solicitada
   - Implemente as alterações de código em todos os arquivos necessários para garantir o funcionamento da solução

2. **ATUALIZAR SEÇÕES RELEVANTES:**
   - ✅ **STATUS ATUAL**: Atualizar percentual e status de funcionalidades
   - 📊 **INFORMAÇÕES DO PROJETO**: Data da última atualização
   - 🚨 **PROBLEMAS CONHECIDOS**: Adicionar/resolver/atualizar problemas
   - 🎯 **PRÓXIMAS AÇÕES**: Mover itens entre pendente/progresso/concluído
   - 📈 **HISTÓRICO DE SESSÕES**: Documentar sessão atual quando relevante
   - 🔧 **COMANDOS**: Adicionar novos comandos descobertos/criados

3. **DOCUMENTAR MUDANÇAS:**
   - Registrar commits realizados
   - Documentar soluções implementadas
   - Atualizar dependências ou configurações
   - Registrar decisões técnicas tomadas

4. **VALIDAR CONSISTÊNCIA:**
   - Verificar se informações estão atualizadas
   - Confirmar se status reflete realidade atual
   - Validar se próximas ações fazem sentido
   - Checar se histórico está completo

**MOMENTO DA ATUALIZAÇÃO:**
- 🔥 **A CADA INTERAÇÃO** - Nunca aguardar fim de sessão
- ✅ **IMEDIATAMENTE** após qualquer mudança, por menor que seja
- ✅ **OBRIGATÓRIO** durante a resolução de problemas (não apenas ao final)
- ✅ **AUTOMÁTICO** ao descobrir qualquer nova informação
- ⚠️ **CRÍTICO:** Evitar perda de progresso entre sessões - atualizar SEMPRE

**CRITÉRIO "MUDANÇA SIGNIFICATIVA" (QUALQUER ITEM EXIGE ATUALIZAÇÃO):**
- ✅ Leitura de arquivos para entender estado atual
- ✅ Correção de bugs ou problemas (mesmo parciais)
- ✅ Implementação de funcionalidades (mesmo incompletas)
- ✅ Alteração em arquivos de configuração
- ✅ Deploy ou commits realizados
- ✅ Descoberta de novos problemas ou limitações
- ✅ Mudança em status de funcionalidades
- ✅ Alteração em processos ou regras de negócio
- ✅ Configuração de novas dependências/APIs
- ✅ Identificação de novos requisitos ou tarefas
- ✅ Análise de código ou arquitetura
- ✅ Teste de funcionalidades
- ⚠️ **REGRA:** Se duvidou se deve atualizar = DEVE ATUALIZAR

---

## 📊 INFORMAÇÕES DO PROJETO

**Nome:** [NOME_DO_PROJETO]  
**Cliente:** [NOME_DO_CLIENTE]  
**Descrição:** [DESCRIÇÃO_BREVE]  
**Arquitetura:** [STACK_PRINCIPAL]  
**Status:** [% COMPLETO] - [STATUS_ATUAL]  
**Última atualização:** [DATA/HORA] - [ÚLTIMA_MUDANÇA_IMPORTANTE]

### 🆔 Identificação do Arquivo
- ⚠️ **TEMPLATE:** Este é um arquivo template - personalize antes do uso
- ✅ **PROJETO ATIVO:** [Marcar quando for projeto real em desenvolvimento]

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológica
**Frontend:**
- **Framework:** [React/Vue/Angular/Next/etc]
- **Build:** [Vite/Webpack/etc]
- **Styling:** [Tailwind/Styled/CSS/etc]
- **State:** [Context/Redux/Zustand/etc]
- **Routing:** [React Router/Next Router/etc]

**Backend:**
- **Framework:** [Express/FastAPI/Django/etc]
- **Language:** [Node.js/Python/Java/etc]
- **Database:** [PostgreSQL/MySQL/MongoDB/etc]
- **ORM:** [Prisma/Sequelize/SQLAlchemy/etc]
- **Auth:** [JWT/OAuth/Auth0/etc]

**Deploy:**
- **Frontend:** [Vercel/Netlify/Railway/etc]
- **Backend:** [Railway/Heroku/AWS/etc]
- **Database:** [Railway/Supabase/AWS RDS/etc]

### Estrutura do Projeto
```
/PROJETO/
├── CLAUDE.md                   # Este arquivo
├── [FRONTEND_DIR]/             # Frontend
│   ├── src/
│   ├── package.json
│   └── [CONFIG_FILES]
├── [BACKEND_DIR]/              # Backend
│   ├── src/
│   ├── package.json
│   └── [CONFIG_FILES]
└── docs/                       # Documentação adicional
```

---

## 🔐 SISTEMA DE HIERARQUIA E PERMISSÕES

### Perfis e Acessos
- **[PERFIL_1]:** [DESCRIÇÃO_PERMISSÕES]
- **[PERFIL_2]:** [DESCRIÇÃO_PERMISSÕES]
- **[PERFIL_3]:** [DESCRIÇÃO_PERMISSÕES]

### Validação de Acesso
```javascript
// Frontend - Verificação de permissões
const podeAcessar = usuario?.perfil === "[PERFIL_ADMIN]";
const podeGerenciar = ["[PERFIL_1]", "[PERFIL_2]"].includes(usuario?.perfil);

// Backend - Middleware de autenticação
// Implementar validação de perfil nas rotas sensíveis
```

---

## 📋 MÓDULOS FUNCIONAIS

### 🏠 [MÓDULO_1]
- **Arquivos:** `[LISTA_DE_ARQUIVOS]`
- **Acesso:** [QUEM_PODE_ACESSAR]
- **Status:** ⏳ [STATUS_ATUAL]
- **Funcionalidades:** [LISTA_DE_FUNCIONALIDADES]

### 👥 [MÓDULO_2]
- **Arquivos:** `[LISTA_DE_ARQUIVOS]`
- **Acesso:** [QUEM_PODE_ACESSAR]
- **Status:** ⏳ [STATUS_ATUAL]
- **Funcionalidades:** [LISTA_DE_FUNCIONALIDADES]

### 📊 [MÓDULO_3]
- **Arquivos:** `[LISTA_DE_ARQUIVOS]`
- **Acesso:** [QUEM_PODE_ACESSAR]
- **Status:** ⏳ [STATUS_ATUAL]
- **Funcionalidades:** [LISTA_DE_FUNCIONALIDADES]

---

## 🗄️ BANCO DE DADOS

### Tabelas Principais
```sql
-- Principais entidades do sistema
[TABELA_1]     # [DESCRIÇÃO]
[TABELA_2]     # [DESCRIÇÃO]
[TABELA_3]     # [DESCRIÇÃO]
```

### Nomenclatura e Padrões
```javascript
// Convenções estabelecidas:
// Tabelas: [CONVENÇÃO_TABELAS]
// Campos: [CONVENÇÃO_CAMPOS]
// Variáveis: [CONVENÇÃO_VARIÁVEIS]
```

---

## 🌐 API ENDPOINTS PRINCIPAIS

### Autenticação
- `POST /api/login` - [DESCRIÇÃO]
- `POST /api/logout` - [DESCRIÇÃO]

### [CATEGORIA_1]
- `GET /api/[ENDPOINT]` - [DESCRIÇÃO]
- `POST /api/[ENDPOINT]` - [DESCRIÇÃO]

### [CATEGORIA_2]
- `GET /api/[ENDPOINT]` - [DESCRIÇÃO]
- `POST /api/[ENDPOINT]` - [DESCRIÇÃO]

---

## 🔧 COMANDOS DE DESENVOLVIMENTO

### Frontend
```bash
cd [FRONTEND_DIR]
npm install                    # Instalar dependências
npm run dev                   # Desenvolvimento local
npm run build                 # Build para produção
npm run preview               # Preview do build
npm run lint                  # Verificar código
npm run test                  # Executar testes
```

### Backend
```bash
cd [BACKEND_DIR]
npm install                   # Instalar dependências
npm start                     # Servidor em produção
npm run dev                   # Desenvolvimento local
npm run lint                  # Verificar código
npm run test                  # Executar testes
```

### Database
```bash
# Comandos específicos do ORM/Database escolhido
[COMANDO_MIGRATE]             # Aplicar migrações
[COMANDO_SEED]                # Popular dados iniciais
[COMANDO_STUDIO]              # Interface visual (se disponível)
```

### Deploy
```bash
# Frontend
cd [FRONTEND_DIR]
git add . && git commit -m "Descrição" && git push origin main

# Backend
cd [BACKEND_DIR]
git add . && git commit -m "Descrição" && git push origin main
```

---

## 📊 STATUS ATUAL COMPLETO

### ✅ Funcionalidades Implementadas
- ⏳ **[FUNCIONALIDADE_1]:** [STATUS_DETALHADO]
- ⏳ **[FUNCIONALIDADE_2]:** [STATUS_DETALHADO]

### ⚠️ Funcionalidades Parciais
- ⏳ **[FUNCIONALIDADE_X]:** [DESCRIÇÃO_DO_QUE_FALTA]

### 🔮 Funcionalidades Futuras
- **[FUNCIONALIDADE_FUTURA_1]:** [DESCRIÇÃO]
- **[FUNCIONALIDADE_FUTURA_2]:** [DESCRIÇÃO]

---

## 🚨 PROBLEMAS CONHECIDOS E SOLUÇÕES

### [PROBLEMA_1] (Status: [STATUS])
**Problema:** [DESCRIÇÃO_DO_PROBLEMA]  
**Solução:** [DESCRIÇÃO_DA_SOLUÇÃO]  
**Status:** [RESOLVIDO/EM_ANDAMENTO/PENDENTE]

### [PROBLEMA_2] (Status: [STATUS])
**Problema:** [DESCRIÇÃO_DO_PROBLEMA]  
**Solução:** [DESCRIÇÃO_DA_SOLUÇÃO]  
**Status:** [RESOLVIDO/EM_ANDAMENTO/PENDENTE]

---

## 📚 DECISÕES TÉCNICAS IMPORTANTES

### Arquitetura
- **[DECISÃO_1]:** [JUSTIFICATIVA]
- **[DECISÃO_2]:** [JUSTIFICATIVA]

### Banco de Dados
- **[DECISÃO_1]:** [JUSTIFICATIVA]
- **[DECISÃO_2]:** [JUSTIFICATIVA]

### Integrações
- **[DECISÃO_1]:** [JUSTIFICATIVA]
- **[DECISÃO_2]:** [JUSTIFICATIVA]

---

## 📈 HISTÓRICO DE SESSÕES CRÍTICAS

### Sessão [DATA] - [TÍTULO_DA_SESSÃO]

**Contexto:** [CONTEXTO_DA_SESSÃO]

**Problemas Identificados:**
- [PROBLEMA_1]
- [PROBLEMA_2]

**Soluções Implementadas:**
- [SOLUÇÃO_1]
- [SOLUÇÃO_2]

**Progresso:**
1. ✅ [ITEM_CONCLUÍDO]
2. ⏳ [ITEM_EM_ANDAMENTO]

**Commits da Sessão:**
- `[HASH]` - [DESCRIÇÃO_DO_COMMIT]

---

## 🎯 PRÓXIMAS AÇÕES PRIORITÁRIAS

### Sessão Atual
1. ⏳ **[AÇÃO_1]** - [DESCRIÇÃO]
2. ⏳ **[AÇÃO_2]** - [DESCRIÇÃO]

### Próximas Sessões
1. **[AÇÃO_FUTURA_1]** - [DESCRIÇÃO]
2. **[AÇÃO_FUTURA_2]** - [DESCRIÇÃO]

---

## 📊 ESTATÍSTICAS DO PROJETO

**Linhas de Código:**
- Frontend: ~[NÚMERO] linhas
- Backend: ~[NÚMERO] linhas
- Total: ~[NÚMERO] linhas

**Arquivos:**
- Frontend: [NÚMERO] arquivos
- Backend: [NÚMERO] arquivos
- Total: [NÚMERO] arquivos

**Funcionalidades:**
- [NÚMERO] módulos principais
- [NÚMERO] páginas/telas
- [NÚMERO] endpoints API
- [NÚMERO] tabelas de banco
- [NÚMERO] perfis de usuário

**Tempo de Desenvolvimento:**
- Projeto iniciado: [DATA]
- Sessão atual: [DATA]
- Status: [% COMPLETO]

---

## 🔒 REGRAS DE SEGURANÇA E PADRÕES

### Nomenclatura Obrigatória
```javascript
// Estabelecer convenções específicas do projeto:
// Exemplo:
// - Tabelas banco: snake_case
// - Campos banco: camelCase
// - Variáveis: camelCase
// - Componentes: PascalCase
```

### Padrões de Código
- **Componentes:** [CONVENÇÃO]
- **Arquivos:** [CONVENÇÃO]
- **Funções:** [CONVENÇÃO]
- **Constantes:** [CONVENÇÃO]

### Validações de Segurança
- **Frontend:** [REGRAS_DE_VALIDAÇÃO]
- **Backend:** [REGRAS_DE_VALIDAÇÃO]
- **Dados:** [REGRAS_DE_SANITIZAÇÃO]

---

## ⚠️ ÁREAS CRÍTICAS - MODIFICAR COM CUIDADO

### Funcionalidades Core
- **[FUNCIONALIDADE_CRÍTICA_1]** - [MOTIVO_CRÍTICO]
- **[FUNCIONALIDADE_CRÍTICA_2]** - [MOTIVO_CRÍTICO]

### Configurações de Produção
- **[CONFIG_1]** - [DESCRIÇÃO]
- **[CONFIG_2]** - [DESCRIÇÃO]

---

## 🔄 COMO USAR ESTE ARQUIVO

### Para Iniciar Sessão
```bash
cd /caminho/para/projeto
init CLAUDE
```

### 🤖 ATUALIZAÇÃO AUTOMÁTICA (PROTOCOLO OBRIGATÓRIO)
**AÇÃO AUTOMÁTICA OBRIGATÓRIA APÓS CADA:**

1. **📝 Edição de arquivos:** Atualizar seção STATUS se funcionalidade mudou
2. **🔧 Correção de bugs:** Mover problema de "CONHECIDO" para "RESOLVIDO" 
3. **🚀 Deploy/Commit:** Registrar na seção HISTÓRICO com hash do commit
4. **❌ Erro encontrado:** Adicionar à seção PROBLEMAS CONHECIDOS
5. **✅ Funcionalidade concluída:** Atualizar percentual na seção STATUS
6. **🎯 Nova tarefa identificada:** Adicionar às PRÓXIMAS AÇÕES
7. **🗂️ Mudança de processo:** Atualizar REGRAS DE NEGÓCIO
8. **📊 Qualquer progresso:** Atualizar "Última atualização" com data/hora

### Para Atualizar Este Arquivo (Complementar ao Automático)
1. **Sempre** atualizar após mudanças significativas
2. **Manter** seções STATUS e PRÓXIMAS AÇÕES atualizadas
3. **Documentar** decisões técnicas importantes
4. **Registrar** problemas resolvidos no histórico
5. **Nunca** aguardar fim de sessão para atualizar

### Para Desenvolvimento
1. **Consultar** seção STATUS antes de implementar
2. **Verificar** ÁREAS CRÍTICAS antes de modificar
3. **Seguir** regras de nomenclatura e segurança
4. **Usar** comandos de desenvolvimento apropriados
5. **Considerar** impacto global antes de mudanças
6. **Validar** com o desenvolvedor quando há múltiplas opções

---

## 🎓 LIÇÕES APRENDIDAS E BOAS PRÁTICAS

### 🔄 Gestão de Estado e Persistência
- **Problema:** Perda de progresso entre sessões por falta de documentação contínua
- **Solução:** Sistema de atualização automática A CADA INTERAÇÃO
- **Implementação:** Protocolo obrigatório de documentação contínua

### 🗄️ Mapeamento de Dados
- **Problema:** Dados step-by-step não persistindo corretamente no banco
- **Solução:** Mapeamento específico por step com campos dedicados no BD
- **Implementação:** Função de mapeamento no frontend + endpoints específicos no backend

### 📸 Sistema de Upload/Preview
- **Problema:** UX ruim sem preview de fotos antes do upload
- **Solução:** Sistema de preview local + opção "Tirar Nova Foto"
- **Implementação:** Integração com cameraUtils.js reutilizável

### 🔐 OAuth e Integrações
- **Problema:** Service Accounts sem quota de armazenamento
- **Solução:** Sistema OAuth2 híbrido context-aware
- **Implementação:** Context parameters para redirecionamento inteligente

### 🏗️ Arquitetura de Desenvolvimento
- **Problema:** Perda de contexto entre sessões de desenvolvimento
- **Solução:** Documentação viva que se atualiza automaticamente
- **Implementação:** Este protocolo de CLAUDE.md automático

### 🚀 Deploy e Versionamento
- **Problema:** Falta de rastreabilidade de mudanças
- **Solução:** Commits descritivos + registro no histórico do CLAUDE.md
- **Implementação:** Protocolo de documentação de cada deploy

---

## 📋 CHECKLIST INICIAL PARA NOVOS PROJETOS

### Setup Básico
- [X] Configurar repositórios Git
- [X] Instalar dependências
- [X] Configurar ambiente de desenvolvimento
- [X] Configurar banco de dados
- [X] Configurar deploy/CI-CD

### Estrutura Base
- [X] Criar estrutura de pastas
- [X] Configurar sistema de autenticação
- [X] Implementar primeiros módulos
- [X] Configurar sistema de logs
- [X] Implementar tratamento de erros

### Configurações
- [X] Configurar CORS
- [X] Configurar variáveis de ambiente
- [X] Configurar segurança (headers, validações)
- [X] Configurar monitoramento
- [X] Documentar APIs

---

**✨ [NOME_DO_PROJETO] - [DESCRIÇÃO_BREVE] ✨**

*Template atualizado em: 2025-07-13 16:00 - Protocolo automático implementado*  
*Baseado em lições aprendidas do projeto OMS BlueWorld*  
*Para iniciar novo projeto: Copie este arquivo como CLAUDE.md e customize as seções*

---

## 🚀 INSTRUÇÕES PARA USO DESTE TEMPLATE

### Como Criar Novo Projeto:
1. **Copie** este arquivo para o diretório do novo projeto
2. **Renomeie** para `CLAUDE.md`
3. **Substitua** todas as tags `[PLACEHOLDER]` com informações reais
4. **Altere** "TEMPLATE" para "PROJETO ATIVO" na seção Identificação
5. **Delete** esta seção de instruções
6. **Commit** no repositório do projeto
7. **IMPORTANTE:** A partir deste momento, siga o protocolo automático de atualização

### Placeholders para Substituir:
- `[NOME_DO_PROJETO]` - Nome real do projeto
- `[NOME_DO_CLIENTE]` - Nome real do cliente
- `[DESCRIÇÃO_BREVE]` - Descrição do que o sistema faz
- `[STACK_PRINCIPAL]` - Tecnologias principais (ex: React + Node.js + PostgreSQL)
- `[% COMPLETO]` - Percentual atual de desenvolvimento
- `[STATUS_ATUAL]` - Status atual do projeto
- `[DATA]` - Datas relevantes
- `[FRONTEND_DIR]` - Nome da pasta do frontend
- `[BACKEND_DIR]` - Nome da pasta do backend
- E todos os outros placeholders em `[BRACKETS]`

### Após Personalização:
- Mantenha sempre atualizado
- Use `init CLAUDE` para carregar contexto
- Documente todas as decisões importantes
- Registre problemas e soluções