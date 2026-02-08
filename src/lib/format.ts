const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
};

export function formatPrice(price: string | null, currency: string): string | null {
  if (!price) return null;
  const num = parseFloat(price);
  if (isNaN(num)) return null;
  const formatted = num.toFixed(2).replace(".", ",");
  const symbol = currencySymbols[currency] || currency;
  return `${formatted} ${symbol}`;
}

export function normalizePrice(input: string): string {
  return input.replace(",", ".");
}
