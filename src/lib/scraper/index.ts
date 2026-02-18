import {
  extractFromHtml,
  extractShopName,
  type ProductData,
} from "./extract";

export type { ProductData } from "./extract";

export async function extractProductData(url: string): Promise<ProductData> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`[scraper] Fetch returned ${response.status} for ${url}`);
      return getEmptyResult(url);
    }

    const resolvedUrl = response.url;
    const html = await response.text();
    const result = extractFromHtml(html, resolvedUrl);
    result.resolvedUrl = resolvedUrl !== url ? resolvedUrl : null;

    return result;
  } catch (error) {
    console.error("Failed to extract product data:", error);
    return getEmptyResult(url);
  }
}

function getEmptyResult(url: string): ProductData {
  return {
    title: null,
    image: null,
    price: null,
    currency: "EUR",
    shopName: extractShopName(url),
    resolvedUrl: null,
  };
}
