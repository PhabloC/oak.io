# Guia de Configuração do Google OAuth com Supabase

## Erro: redirect_uri_mismatch

Este erro ocorre quando a URL de redirecionamento não corresponde às configuradas no Google Cloud Console ou no Supabase.

## Passo a Passo para Resolver

### 1. Configurar no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Authentication** → **URL Configuration**
3. Em **Redirect URLs**, adicione:

   ```
   http://localhost:5173/dashboard
   http://localhost:5173/**
   ```

   (E sua URL de produção se tiver)

4. Vá em **Authentication** → **Providers** → **Google**
5. Certifique-se de que o Google está **habilitado**
6. Verifique se o **Client ID** e **Client Secret** estão preenchidos corretamente

### 2. Configurar no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione o projeto que você está usando no Supabase
3. Vá em **APIs & Services** → **Credentials**
4. Encontre o **OAuth 2.0 Client ID** que você está usando no Supabase
5. Clique para editar
6. Em **Authorized redirect URIs**, adicione:

   ```
   https://[SEU-PROJETO-ID].supabase.co/auth/v1/callback
   ```

   **Como encontrar seu projeto ID:**

   - No Supabase Dashboard, vá em **Settings** → **API**
   - O Project URL será algo como: `https://abcdefghijklmnop.supabase.co`
   - Use apenas a parte `abcdefghijklmnop` como `[SEU-PROJETO-ID]`

   Exemplo completo:

   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```

7. Clique em **Save**

### 3. Verificar Configuração

Após fazer as alterações:

1. **Aguarde alguns minutos** para as mudanças propagarem
2. **Limpe o cache do navegador** ou use uma janela anônima
3. Tente fazer login novamente

### 4. URLs Importantes

- **URL de callback do Supabase**: `https://[PROJETO-ID].supabase.co/auth/v1/callback`
- **URL de redirecionamento da aplicação**: `http://localhost:5173/dashboard` (dev) ou sua URL de produção

### 5. Troubleshooting

Se ainda não funcionar:

1. Verifique se o **Client ID** e **Client Secret** no Supabase estão corretos
2. Certifique-se de que a URL no Google Cloud Console está **exatamente** como mostrado acima (sem barras extras, com `/auth/v1/callback`)
3. Verifique se não há espaços extras nas URLs
4. Tente desabilitar e reabilitar o provider Google no Supabase
5. Verifique os logs do navegador (F12 → Console) para ver erros adicionais

### Exemplo de Configuração Correta

**No Google Cloud Console:**

```
Authorized redirect URIs:
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

**No Supabase (URL Configuration):**

```
Redirect URLs:
http://localhost:5173/dashboard
http://localhost:5173/**
https://seu-dominio.com/dashboard (se tiver produção)
```

**No Supabase (Google Provider):**

```
Client ID: [seu-client-id]
Client Secret: [seu-client-secret]
```
