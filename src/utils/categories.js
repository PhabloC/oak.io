// Categorias padrão para transações
export const DEFAULT_CATEGORIES = {
  Ganho: [
    "Salário",
    "Freelance",
    "Investimentos",
    "Presente",
    "Venda",
    "Outros",
  ],
  Gasto: [
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Moradia",
    "Roupas",
    "Tecnologia",
    "Contas",
    "Outros",
  ],
  Investimento: [
    "CDB",
    "Tesouro Direto",
    "Ações",
    "FIIs",
    "Criptomoedas",
    "Poupança",
    "Outros",
  ],
};

export const getAllCategories = () => {
  return [
    ...new Set([
      ...DEFAULT_CATEGORIES.Ganho,
      ...DEFAULT_CATEGORIES.Gasto,
      ...DEFAULT_CATEGORIES.Investimento,
    ]),
  ];
};

