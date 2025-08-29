# 🚨 MIGRAÇÃO CRÍTICA: user_sessions.data

## ❌ PROBLEMA IDENTIFICADO

**Erro:** `column "data" of relation "user_sessions" does not exist`

**Impacto:** Sistema de login não funciona - erro 500 na API `/api/auth/login`

**Causa:** A tabela `user_sessions` não possui a coluna `data` que o código está tentando usar.

## ✅ SOLUÇÃO

### Opção 1: Script Automatizado (RECOMENDADO)

Execute o script de migração que criamos:

```bash
npm run db:fix-sessions
```

### Opção 2: SQL Manual no Railway

1. Acesse o Railway Dashboard
2. Vá para o serviço de Database (PostgreSQL)
3. Abra o Query Editor
4. Execute o arquivo: `database/fix-user-sessions-data-column.sql`

### Opção 3: Conexão Direta

Se você tem acesso direto ao banco:

```sql
-- Verificar se a coluna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
AND column_name = 'data';

-- Se não existir, adicionar:
ALTER TABLE user_sessions ADD COLUMN data JSON DEFAULT '{}';

-- Criar índice para performance:
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
```

## 🔍 VERIFICAÇÃO

Após executar a migração, verifique se funcionou:

```sql
-- Verificar estrutura da tabela
\d user_sessions

-- Ou via query
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;
```

**Resultado esperado:** Deve aparecer a coluna `data` do tipo `json`.

## 🎯 RESULTADO ESPERADO

Após a migração:

✅ **Sistema de login funcionando**
✅ **API `/api/auth/login` retorna 200**
✅ **Sessões sendo criadas corretamente**
✅ **Coluna `data` disponível na tabela `user_sessions`**

## 🔄 PRÓXIMOS PASSOS

1. Execute a migração
2. Reinicie o serviço backend no Railway
3. Teste o login no frontend
4. Verifique os logs para confirmar que não há mais erros

## 📋 ARQUIVOS RELACIONADOS

- `scripts/fix-user-sessions-migration.js` - Script automatizado
- `database/fix-user-sessions-data-column.sql` - SQL manual
- `server/auth-system.js:223` - Código que usa a coluna `data`

## ⚠️ IMPORTANTE

Esta é uma **migração crítica** - o sistema não funciona sem ela. Execute o mais rápido possível para restaurar o funcionamento do login.
