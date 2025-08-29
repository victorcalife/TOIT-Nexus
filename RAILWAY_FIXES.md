# Correções de Deployment Railway - TOIT Nexus

## Problemas Identificados

### 1. Frontend - Erro SIGTERM no Vite Preview

**Problema:** O comando `vite preview` estava sendo terminado com SIGTERM no Railway, causando falha no deployment.

**Causa:** O `vite preview` não é adequado para produção no Railway, pois:
- Não é um servidor HTTP estável para produção
- Pode ser terminado inesperadamente pelo Railway
- Não tem configurações adequadas para ambiente de produção

**Solução Aplicada:**
1. Substituído `vite preview` por `serve` (servidor HTTP estático)
2. Adicionado pacote `serve` como dependência de desenvolvimento
3. Criado script `start` no package.json: `serve -s dist -l $PORT`
4. Atualizado `railway.toml` para usar `npm start`

### 2. Backend - Erro 401 na Rota /api/auth/me

**Problema:** Requisições para `/api/auth/me` retornando 401 (Unauthorized)

**Possíveis Causas:**
1. Token JWT não está sendo enviado corretamente
2. Token JWT inválido ou expirado
3. Usuário não encontrado ou inativo no banco
4. Problema na configuração do JWT_SECRET

**Análise:**
- JWT_SECRET está configurado no .env do servidor
- Middleware de autenticação está funcionando corretamente
- Rota /me está protegida com `authenticateToken`

## Arquivos Modificados

### Frontend (client/)

1. **railway.toml**
   ```toml
   [deploy]
   startCommand = "npm start"  # Alterado de "npm run preview"
   ```

2. **package.json**
   ```json
   {
     "scripts": {
       "start": "serve -s dist -l $PORT",
       "serve": "serve -s dist -p 4173"
     },
     "devDependencies": {
       "serve": "^14.2.1"  # Adicionado
     }
   }
   ```

## Próximos Passos

### Para o Frontend:
1. ✅ Configuração corrigida
2. 🔄 Aguardar novo deploy no Railway
3. ✅ Testar acesso aos domínios

### Para o Backend:
1. 🔍 Verificar logs detalhados do Railway
2. 🔍 Validar se tokens JWT estão sendo enviados corretamente
3. 🔍 Verificar se há usuários válidos no banco de dados
4. 🔍 Testar autenticação localmente

## Comandos de Teste

### Testar Frontend Localmente:
```bash
cd client
npm run build
npm run serve
```

### Testar Backend Localmente:
```bash
cd server
npm start
# Testar: curl -H "Authorization: Bearer <token>" http://localhost:8080/api/auth/me
```

## Variáveis de Ambiente Necessárias

### Frontend (Railway):
- `NODE_ENV=production`
- `VITE_API_URL=https://api.toit.com.br`
- `VITE_FRONTEND_URL=https://toit.com.br`

### Backend (Railway):
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `JWT_SECRET=...`
- `SESSION_SECRET=...`

## Status das Correções

- ✅ Frontend: Configuração de deployment corrigida
- 🔄 Backend: Investigação em andamento
- ⏳ Testes: Aguardando novo deploy

## Observações

1. O erro SIGTERM no frontend era crítico e foi resolvido
2. O erro 401 no backend pode ser relacionado à autenticação de usuários
3. É necessário verificar se há usuários cadastrados no banco de produção
4. Recomenda-se criar um usuário de teste para validar a autenticação