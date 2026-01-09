# Changelog - Oak.io

## [Versão Atual] - Dezembro 2024

### ✨ Novas Funcionalidades

#### 🏷️ Sistema de Categorias
- **Categorias padrão por tipo de transação:**
  - Ganhos: Salário, Freelance, Investimentos, Presente, Venda, Outros
  - Gastos: Alimentação, Transporte, Saúde, Educação, Lazer, Moradia, Roupas, Tecnologia, Contas, Outros
  - Investimentos: CDB, Tesouro Direto, Ações, FIIs, Criptomoedas, Poupança, Outros
- Categorias são selecionáveis nos formulários de adicionar/editar transações
- A categoria é opcional e pode ser alterada ao editar uma transação

#### 📝 Campo de Descrição/Notas
- Novo campo opcional de descrição em todas as transações
- Permite adicionar observações, lembretes ou detalhes importantes
- Descrições são pesquisáveis nos filtros avançados

#### 🔍 Filtros e Busca Avançada
- **Busca por texto:** Busque transações por título ou descrição
- **Filtros disponíveis:**
  - Por tipo (Ganho, Gasto, Investimento)
  - Por categoria
  - Por método de pagamento (Pix, Cartão, Boleto)
  - Por valor mínimo
  - Por valor máximo
- Contador de resultados filtrados
- Botão para limpar todos os filtros de uma vez
- Filtros são combinados (múltiplos filtros simultâneos)

#### 📊 Gráficos por Categoria
- Novo gráfico de barras no dashboard mostrando gastos por categoria
- Top 10 categorias com maior gasto no mês selecionado
- Visualização clara da distribuição de gastos
- Apenas exibido quando há gastos categorizados no mês

### 🔄 Melhorias

#### Interface
- Tabela de transações agora exibe coluna de categoria
- Layout dos gráficos reorganizado para melhor visualização
- Filtros em painel dedicado com design moderno

#### Experiência do Usuário
- Seleção de categoria é resetada automaticamente ao mudar o tipo de transação
- Mensagens de feedback melhoradas
- Interface mais intuitiva para gerenciar filtros

### 🗄️ Mudanças no Banco de Dados

Novas colunas adicionadas à tabela `transactions`:
- `category` (TEXT, opcional) - Categoria da transação
- `description` (TEXT, opcional) - Descrição/notas da transação

**Para atualizar banco de dados existente:**
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;
```

### 📋 Próximas Funcionalidades Planejadas

Veja o arquivo `SUGESTOES_FUNCIONALIDADES.md` para uma lista completa de funcionalidades sugeridas, incluindo:
- Transações recorrentes
- Metas financeiras
- Orçamentos mensais
- Exportação de relatórios (CSV/PDF)
- E muito mais...

---

**Nota:** Esta versão mantém compatibilidade com transações antigas (sem categoria e descrição).

