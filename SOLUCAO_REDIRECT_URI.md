# Solução: Erro "Acesso Bloqueado" - redirect_uri_mismatch

## 🔍 Diagnóstico Rápido

Quando você clicar em "Login com Google", **abra o Console do navegador (F12)** e procure por uma mensagem que mostra:

```
🔗 URL de callback do Supabase (adicione no Google Cloud Console): https://...
```

**Essa é a URL que você precisa adicionar no Google Cloud Console!**

## 📋 Passo a Passo Detalhado

### Passo 1: Encontrar a URL de Callback do Supabase

1. Abra o projeto no navegador (`http://localhost:5173`)
2. Pressione **F12** para abrir o Console
3. Clique em **"Login com Google"**
4. No console, você verá uma mensagem como:
   ```
   🔗 URL de callback do Supabase: https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```
5. **COPIE ESSA URL COMPLETA** (incluindo o `/auth/v1/callback`)

### Passo 2: Configurar no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione o projeto correto (o mesmo que você está usando no Supabase)
3. Vá em **APIs & Services** → **Credentials**
4. Encontre o **OAuth 2.0 Client ID** que você está usando no Supabase
5. Clique no **nome do Client ID** para editar
6. Role até a seção **"Authorized redirect URIs"**
7. Clique em **"+ ADD URI"**
8. Cole a URL que você copiou do console:
   ```
   https://[SEU-PROJETO-ID].supabase.co/auth/v1/callback
   ```
   ⚠️ **IMPORTANTE**:
   - Deve começar com `https://`
   - Deve terminar com `/auth/v1/callback`
   - Não deve ter barras extras ou espaços
   - Deve ser EXATAMENTE como aparece no console
9. Clique em **"SAVE"** (Salvar)

### Passo 3: Verificar no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Authentication** → **URL Configuration**
3. Em **Redirect URLs**, certifique-se de ter:
   ```
   http://localhost:5173/dashboard
   http://localhost:5173/**
   ```
4. Vá em **Authentication** → **Providers** → **Google**
5. Verifique se:
   - ✅ Google está **habilitado**
   - ✅ **Client ID** está preenchido
   - ✅ **Client Secret** está preenchido

### Passo 4: Aguardar e Testar

1. **Aguarde 2-5 minutos** após salvar no Google Cloud Console (as mudanças podem demorar para propagar)
2. **Feche completamente o navegador** ou use uma **janela anônima/privada**
3. Acesse `http://localhost:5173` novamente
4. Tente fazer login com Google

## 🎯 Exemplo Prático

Se sua URL do Supabase for:

```
https://abcdefghijklmnop.supabase.co
```

Então a URL de callback será:

```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

**Essa URL EXATA deve estar no Google Cloud Console!**

## ❌ Erros Comuns

### Erro 1: URL sem HTTPS

```
❌ http://abcdefghijklmnop.supabase.co/auth/v1/callback
✅ https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### Erro 2: URL sem o caminho completo

```
❌ https://abcdefghijklmnop.supabase.co
✅ https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### Erro 3: URL com barra extra

```
❌ https://abcdefghijklmnop.supabase.co/auth/v1/callback/
✅ https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### Erro 4: Projeto errado no Google Cloud Console

- Certifique-se de estar no projeto correto
- O Client ID deve ser o mesmo que está no Supabase

## 🔧 Verificação Final

Após configurar tudo, verifique:

1. ✅ Google Cloud Console → OAuth Client → Authorized redirect URIs contém:

   - `https://[PROJETO-ID].supabase.co/auth/v1/callback`

2. ✅ Supabase → Authentication → URL Configuration → Redirect URLs contém:

   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/**`

3. ✅ Supabase → Authentication → Providers → Google:
   - Habilitado ✅
   - Client ID preenchido ✅
   - Client Secret preenchido ✅

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos ainda não funcionar:

1. **Verifique o Console do navegador** (F12) para ver a URL exata
2. **Copie a URL exata** que aparece no console
3. **Cole no Google Cloud Console** exatamente como aparece
4. **Aguarde 5 minutos** e tente novamente
5. **Use uma janela anônima** para evitar cache

## 📞 Informações para Debug

Se precisar de ajuda adicional, forneça:

1. A URL que aparece no console quando você clica em "Login com Google"
2. Uma captura de tela das configurações no Google Cloud Console (Authorized redirect URIs)
3. Uma captura de tela das configurações no Supabase (Redirect URLs)
