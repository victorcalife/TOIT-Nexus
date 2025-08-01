# TQL - TOIT Query Language

Sistema de filtros simplificado e intuitivo para o Portal TOIT.

## 📚 Conceitos Básicos

TQL é uma linguagem de consulta simples inspirada no JQL do Jira, mas adaptada para ser mais amigável e fácil de usar.

## 🔍 Campos Disponíveis

| Campo | Descrição | Exemplos |
|-------|-----------|----------|
| `titulo` | Título da tarefa | `titulo:login` |
| `responsavel` | Pessoa responsável | `responsavel:victor` |
| `status` | Status atual | `status:fazendo` |
| `prioridade` | Nível de prioridade | `prioridade:alta` |
| `cliente` | Cliente/Empresa | `cliente:blueworld` |
| `sistema` | Sistema relacionado | `sistema:portal` |
| `tipo` | Tipo da tarefa | `tipo:bug` |
| `projeto` | Projeto relacionado | `projeto:portal-toit` |

## ⚙️ Operadores

| Operador | Significado | Exemplo |
|----------|-------------|---------|
| `:` | contém | `titulo:query` |
| `=` | igual a | `status=pronto` |
| `!=` | diferente de | `status!=bloqueado` |
| `>` | maior que | `prioridade>media` |
| `<` | menor que | `vencimento<hoje` |

## 📝 Exemplos Práticos

### Filtros Simples
```
responsavel:victor
cliente:blueworld
status:fazendo
prioridade:alta
titulo:filtro
```

### Filtros com Operadores
```
status=fazendo
prioridade!=baixa
cliente:blueworld
responsavel:victor
```

### Busca de Texto
```
query builder
sistema portal
bug crítico
```

## 💡 Dicas de Uso

1. **Auto-sugestões**: Digite alguns caracteres e veja as sugestões aparecerem
2. **Tab/Enter**: Use Tab ou Enter para aceitar uma sugestão
3. **Validação**: O sistema mostra se seu filtro é válido em tempo real
4. **Salvar**: Salve seus filtros mais usados para acesso rápido
5. **Filtros padrão**: Use os filtros pré-configurados no dropdown

## 🚀 Filtros Prontos

- **Minhas tarefas**: `responsavel:victor`
- **Alta prioridade**: `prioridade:alta`
- **Críticas**: `prioridade:critica`
- **Blue World**: `cliente:blueworld`
- **Portal TOIT**: `sistema:portal`
- **Em progresso**: `status:fazendo`

## 📊 Valores Comuns

### Status
- `todo`, `fazendo`, `revisao`, `pronto`, `bloqueado`

### Prioridade
- `critica`, `alta`, `media`, `baixa`

### Cliente
- `blueworld`, `demo`, `toit`

### Sistema
- `portal`, `oms`, `tradia`, `easis`

### Tipo
- `tarefa`, `bug`, `feature`, `melhoria`

---

**🎯 Objetivo**: Facilitar a localização de tarefas de forma rápida e intuitiva, sem complexidade desnecessária.