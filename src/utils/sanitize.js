const HTML_TAG_REGEX = /<[^>]*>/g;

export function sanitizeText(input, maxLength = 100) {
  if (typeof input !== "string") return "";
  return input.trim().replace(HTML_TAG_REGEX, "").slice(0, maxLength);
}

export function sanitizeNumber(input, min = 0, max = 999999999.99) {
  const num = typeof input === "number" ? input : parseFloat(input);
  if (isNaN(num)) return 0;
  return Math.min(Math.max(num, min), max);
}

export function sanitizeDate(input, { allowFuture = false, minYear = 2020 } = {}) {
  if (!input) return null;
  const date = new Date(input);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  if (!allowFuture && date > now) return null;
  if (date.getFullYear() < minYear) return null;

  return input;
}

export function validateTransactionForm({ title, value, date, type }) {
  const errors = [];

  if (!title || sanitizeText(title, 100).length === 0) {
    errors.push("Título é obrigatório (máx. 100 caracteres).");
  }
  if (typeof value !== "number" || value <= 0 || value > 999999999.99) {
    errors.push("Valor deve ser positivo e menor que R$ 999.999.999,99.");
  }
  if (!date || !sanitizeDate(date)) {
    errors.push("Data inválida ou no futuro.");
  }
  if (!["Ganho", "Gasto", "Investimento"].includes(type)) {
    errors.push("Tipo de transação inválido.");
  }

  return errors;
}

export function validateMetaForm({ title, targetValue, category }) {
  const errors = [];

  if (!title || sanitizeText(title, 100).length === 0) {
    errors.push("Título é obrigatório (máx. 100 caracteres).");
  }
  if (typeof targetValue !== "number" || targetValue <= 0 || targetValue > 999999999.99) {
    errors.push("Valor da meta deve ser positivo e menor que R$ 999.999.999,99.");
  }
  if (!category) {
    errors.push("Categoria é obrigatória.");
  }

  return errors;
}

export function validateDividaForm({ title, totalValue, category }) {
  const errors = [];

  if (!title || sanitizeText(title, 100).length === 0) {
    errors.push("Título é obrigatório (máx. 100 caracteres).");
  }
  if (typeof totalValue !== "number" || totalValue <= 0 || totalValue > 999999999.99) {
    errors.push("Valor total deve ser positivo e menor que R$ 999.999.999,99.");
  }
  if (!category) {
    errors.push("Categoria é obrigatória.");
  }

  return errors;
}
