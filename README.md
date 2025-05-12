# Oak.io - Controle Financeiro

Este é um projeto SaaS de controle financeiro desenvolvido com **React**, **Tailwind CSS**, **Firebase** e **Firestore**. O objetivo principal é fornecer uma plataforma para gerenciar entradas e saídas de capital, além de facilitar o gerenciamento de investimentos.

## Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e eficiente.
- **Vite**: Ferramenta de build rápida para desenvolvimento moderno.
- **Firebase**: Utilizado para autenticação de usuários com login via Google.
- **Firestore**: Banco de dados NoSQL para armazenar e gerenciar as transações financeiras.
- **Vercel**: Plataforma de deploy para hospedar o projeto.

## Funcionalidades

- Controle de entradas e saídas de capital.
- Gerenciamento de investimentos.
- Login com Google utilizando Firebase.
- Armazenamento seguro de dados no Firestore.
- Interface moderna e responsiva.

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

   - Crie um arquivo `.env.local` na raiz do projeto.
   - Adicione as credenciais do Firebase e Firestore:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. Execute o projeto em ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse o projeto no navegador:
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
