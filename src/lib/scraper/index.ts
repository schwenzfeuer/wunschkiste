import * as cheerio from "cheerio";

export interface ProductData {
  title: string | null;
  image: string | null;
  price: string | null;
  currency: string | null;
  shopName: string | null;
  resolvedUrl: string | null;
}

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
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status}`);
      return getEmptyProductData(url);
    }

    const resolvedUrl = response.url;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Try OpenGraph tags first
    let title = getMetaContent($, 'property="og:title"');
    let image = getMetaContent($, 'property="og:image"');
    let price = getMetaContent($, 'property="og:price:amount"');
    let currency = getMetaContent($, 'property="og:price:currency"');

    // Fallback to JSON-LD structured data
    if (!title || !price) {
      const jsonLd = extractJsonLd($);
      if (jsonLd) {
        title = title || jsonLd.name || null;
        image = image || jsonLd.image || null;
        if (jsonLd.offers) {
          price = price || jsonLd.offers.price?.toString() || null;
          currency = currency || jsonLd.offers.priceCurrency || null;
        }
      }
    }

    // Fallback to standard meta tags
    if (!title) {
      title =
        getMetaContent($, 'name="title"') ||
        getMetaContent($, 'property="title"') ||
        $("title").text().trim() ||
        null;
    }
    if (!image) {
      image =
        getMetaContent($, 'name="image"') ||
        getMetaContent($, 'property="image"') ||
        null;
    }

    // Default currency
    if (!currency) {
      currency = "EUR";
    }

    return {
      title: cleanText(title),
      image: makeAbsoluteUrl(image, resolvedUrl),
      price: cleanPrice(price),
      currency,
      shopName: extractShopName(resolvedUrl),
      resolvedUrl: resolvedUrl !== url ? resolvedUrl : null,
    };
  } catch (error) {
    console.error("Failed to extract product data:", error);
    return getEmptyProductData(url);
  }
}

function getMetaContent($: cheerio.CheerioAPI, selector: string): string | null {
  const content = $(`meta[${selector}]`).attr("content");
  return content?.trim() || null;
}

function extractJsonLd(
  $: cheerio.CheerioAPI
): {
  name?: string;
  image?: string;
  offers?: { price?: number | string; priceCurrency?: string };
} | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const text = $(scripts[i]).html();
      if (!text) continue;
      const data = JSON.parse(text);

      // Handle array of schemas
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
          return item;
        }
        // Check @graph for Product
        if (item["@graph"]) {
          const product = item["@graph"].find(
            (g: { "@type"?: string | string[] }) =>
              g["@type"] === "Product" || g["@type"]?.includes?.("Product")
          );
          if (product) return product;
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }
  return null;
}

function cleanText(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 200);
}

function cleanPrice(price: string | null): string | null {
  if (!price) return null;
  // Extract numbers and decimal point
  const match = price.replace(",", ".").match(/[\d.]+/);
  return match ? parseFloat(match[0]).toFixed(2) : null;
}

function makeAbsoluteUrl(url: string | null, baseUrl: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function extractShopName(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.replace(/^www\./, "").split(".");
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return hostname;
  } catch {
    return null;
  }
}

function getEmptyProductData(url: string): ProductData {
  return {
    title: null,
    image: null,
    price: null,
    currency: "EUR",
    shopName: extractShopName(url),
    resolvedUrl: null,
  };
}
