# Guia de Teste do Login com Google OAuth

## Checklist de Verificação

Antes de testar, certifique-se de que:

- [ ] As variáveis de ambiente estão configuradas no arquivo `.env`
- [ ] O Google OAuth está habilitado no Supabase
- [ ] A URL de callback está configurada no Google Cloud Console
- [ ] As Redirect URLs estão configuradas no Supabase

## Passos para Testar

### 1. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor deve iniciar em `http://localhost:5173`

### 2. Abrir o Console do Navegador

1. Abra o navegador em `http://localhost:5173`
2. Pressione `F12` ou `Ctrl+Shift+I` para abrir as ferramentas de desenvolvedor
3. Vá para a aba **Console**

### 3. Testar o Login

1. Clique no botão **"Login com Google"**
2. Observe o console do navegador para verificar:
   - Se há erros de conexão com o Supabase
   - Se a URL de redirecionamento está correta
   - Se o OAuth está sendo iniciado corretamente

### 4. Fluxo Esperado

**Cenário 1: Login Bem-Sucedido**

1. Ao clicar em "Login com Google", você será redirecionado para a página de login do Google
2. Após fazer login e autorizar, você será redirecionado de volta para `/dashboard`
3. Você deve ver o dashboard carregado com seu nome e foto no header
4. No console, você deve ver: `Sessão encontrada: [seu-email]`

**Cenário 2: Erro de Configuração**

- Se aparecer o erro `redirect_uri_mismatch`:
  - Verifique se a URL de callback está correta no Google Cloud Console
  - Verifique se as Redirect URLs estão configuradas no Supabase
  - Aguarde alguns minutos após fazer alterações

**Cenário 3: Erro de Autenticação**

- Se aparecer erro de autenticação:
  - Verifique se o Client ID e Client Secret estão corretos no Supabase
  - Verifique se o Google OAuth está habilitado no Supabase

### 5. Verificar Funcionalidades Após Login

Após fazer login com sucesso, teste:

- [ ] O nome e foto aparecem no header
- [ ] Você consegue acessar `/dashboard`
- [ ] Você consegue acessar `/transacoes`
- [ ] Você consegue adicionar uma transação
- [ ] Você consegue editar uma transação
- [ ] Você consegue deletar uma transação
- [ ] O logout funciona corretamente

### 6. Testar Logout

1. Clique no botão "Sair" no sidebar
2. Você deve ser redirecionado para a página de login
3. Tente acessar `/dashboard` diretamente - deve redirecionar para login

## Debugging

### Verificar Variáveis de Ambiente

No console do navegador, execute:

```javascript
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "Supabase Key:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "Configurada" : "Não configurada"
);
```

### Verificar Sessão Atual

No console do navegador, execute:

```javascript
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Sessão atual:", session);
```

### Verificar Usuário Atual

No console do navegador, execute:

```javascript
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Usuário atual:", user);
```

### Limpar Sessão (para testar novamente)

No console do navegador, execute:

```javascript
await supabase.auth.signOut();
```

## Problemas Comuns

### Erro: "redirect_uri_mismatch"

- **Solução**: Verifique se a URL de callback está correta no Google Cloud Console
- Deve ser: `https://[PROJETO-ID].supabase.co/auth/v1/callback`

### Erro: "Invalid client"

- **Solução**: Verifique se o Client ID e Client Secret estão corretos no Supabase

### Não redireciona após login

- **Solução**: Verifique se as Redirect URLs estão configuradas no Supabase
- Deve incluir: `http://localhost:5173/dashboard`

### Sessão não persiste após refresh

- **Solução**: Verifique se o Supabase está salvando a sessão corretamente
- O Supabase usa localStorage por padrão

## Logs Úteis

Adicione estes logs temporários no código para debug:

```javascript
// No Login.jsx, após signInWithOAuth
console.log("Redirect URL:", redirectTo);
console.log("Erro OAuth:", error);

// No App.jsx, após getSession
console.log("Sessão:", session);
console.log("Usuário:", session?.user);
```

## Sucesso!

Se tudo funcionar corretamente, você deve:

1. Conseguir fazer login com Google
2. Ser redirecionado para o dashboard
3. Ver seu nome e foto no header
4. Conseguir usar todas as funcionalidades da aplicação
