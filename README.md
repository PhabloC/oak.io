# Oak.io - Controle Financeiro

Este é um projeto SaaS de controle financeiro desenvolvido com **React**, **Tailwind CSS** e **Supabase**. O objetivo principal é fornecer uma plataforma para gerenciar entradas e saídas de capital, além de facilitar o gerenciamento de investimentos.

## Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e eficiente.
- **Vite**: Ferramenta de build rápida para desenvolvimento moderno.
- **Supabase**: Utilizado para autenticação de usuários com login via Google OAuth e banco de dados PostgreSQL.
- **Vercel**: Plataforma de deploy para hospedar o projeto.

## Funcionalidades

- ✅ Controle de entradas e saídas de capital.
- ✅ Gerenciamento de investimentos.
- ✅ **Categorias personalizadas** - Organize suas transações por categorias (Alimentação, Transporte, Saúde, etc.).
- ✅ **Campo de descrição** - Adicione notas e observações às suas transações.
- ✅ **Filtros e busca avançada** - Filtre transações por tipo, categoria, método de pagamento, valor e busque por título/descrição.
- ✅ **Gráficos por categoria** - Visualize seus gastos por categoria no dashboard.
- ✅ Dashboard com gráficos interativos (linha, pizza e barras).
- ✅ Login com Google utilizando Supabase OAuth.
- ✅ Armazenamento seguro de dados no PostgreSQL (Supabase).
- ✅ Interface moderna e responsiva.

## Como Executar o Projeto

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/oak-io.git
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione as credenciais do Supabase:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Configure o Supabase:

   - Crie um projeto no [Supabase](https://supabase.com)
   - Configure o Google OAuth em **Authentication → Providers**
   - **IMPORTANTE**: Configure as URLs de redirecionamento:
     - No Supabase: **Authentication → URL Configuration → Redirect URLs**
       - Para desenvolvimento, adicione:
         - `http://localhost:5173/`
         - `http://localhost:5173`
         - `http://localhost:5173/**`
       - Para produção, adicione também a URL do seu deploy (ex: Vercel):
         - `https://oak-io.vercel.app/`
         - `https://oak-io.vercel.app`
         - `https://oak-io.vercel.app/**`
         - Substitua `oak-io.vercel.app` pela URL real do seu projeto em produção
     - No Google Cloud Console: **APIs & Services → Credentials → OAuth 2.0 Client ID**
       - Adicione em **Authorized redirect URIs**: `https://[SEU-PROJETO-ID].supabase.co/auth/v1/callback`
       - Substitua `[SEU-PROJETO-ID]` pelo ID do seu projeto Supabase (encontre em Settings → API)
   - **NOTA**: Se o login estiver redirecionando para localhost mesmo em produção, verifique se adicionou a URL de produção nas configurações do Supabase acima
   - Veja o arquivo `CONFIGURACAO_OAUTH.md` para instruções detalhadas sobre configuração do OAuth
   - Crie a tabela `transactions` no banco de dados com a seguinte estrutura SQL:

   ```sql
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     value NUMERIC NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('Ganho', 'Gasto', 'Investimento')),
     method TEXT NOT NULL CHECK (method IN ('Boleto', 'Pix', 'Cartão')),
     date DATE NOT NULL,
     month TEXT NOT NULL,
     category TEXT,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Se a tabela já existir, adicione as novas colunas:
   ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT;
   ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;

   -- Criar índice para melhorar performance das queries
   CREATE INDEX idx_transactions_user_month ON transactions(user_id, month);

   -- Habilitar Row Level Security (RLS)
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

   -- Política RLS: usuários só podem ver suas próprias transações
   CREATE POLICY "Users can view own transactions"
     ON transactions FOR SELECT
     USING (auth.uid() = user_id);

   -- Política RLS: usuários só podem inserir suas próprias transações
   CREATE POLICY "Users can insert own transactions"
     ON transactions FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Política RLS: usuários só podem atualizar suas próprias transações
   CREATE POLICY "Users can update own transactions"
     ON transactions FOR UPDATE
     USING (auth.uid() = user_id);

   -- Política RLS: usuários só podem deletar suas próprias transações
   CREATE POLICY "Users can delete own transactions"
     ON transactions FOR DELETE
     USING (auth.uid() = user_id);
   ```

5. Execute o projeto em ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse o projeto no navegador:
   ```
   http://localhost:5173
   ```

## Deploy

O projeto está hospedado na Vercel e pode ser acessado pelo seguinte link:

[oak-io.vercel.app](https://oak-io.vercel.app/)

## Contato

Se você tiver dúvidas ou sugestões, sinta-se à vontade para entrar em contato!

- **GitHub**: https://github.com/PhabloC
- **Linkedin**: www.linkedin.com/in/phablo--carvalho
