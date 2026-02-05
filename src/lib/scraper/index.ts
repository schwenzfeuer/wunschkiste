export interface ProductData {
  title: string | null;
  image: string | null;
  price: string | null;
  currency: string | null;
  shopName: string | null;
}

export async function extractProductData(url: string): Promise<ProductData> {
  // TODO: Implement with Cheerio
  // 1. Fetch URL
  // 2. Parse HTML
  // 3. Extract OpenGraph/Meta tags
  // 4. Fallback to JSON-LD Structured Data
  // 5. Fallback to standard meta tags

  return {
    title: null,
    image: null,
    price: null,
    currency: "EUR",
    shopName: extractShopName(url),
  };
}

function extractShopName(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. and .de/.com etc.
    const parts = hostname.replace(/^www\./, "").split(".");
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return hostname;
  } catch {
    return null;
  }
}
