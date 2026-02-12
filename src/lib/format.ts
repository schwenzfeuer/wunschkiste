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

export function getCountdownDays(dateStr: string): number | null {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0 || diffDays > 99) return null;
  return diffDays;
}
