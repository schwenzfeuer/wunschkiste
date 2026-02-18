import * as cheerio from "cheerio";

export interface ProductData {
  title: string | null;
  image: string | null;
  price: string | null;
  currency: string | null;
  shopName: string | null;
  resolvedUrl: string | null;
}

export function extractFromHtml(html: string, baseUrl: string): ProductData {
  const $ = cheerio.load(html);

  const rawTitle = extractTitle($);
  const shopName = extractShopName(baseUrl);
  const title = isErrorPageTitle(rawTitle)
    ? null
    : cleanText(removeShopSuffix(rawTitle, shopName));
  const image = extractImage($);
  const { price, currency } = extractPrice($);

  return {
    title,
    image: makeAbsoluteUrl(image, baseUrl),
    price: cleanPrice(price),
    currency: currency || "EUR",
    shopName,
    resolvedUrl: null,
  };
}

export function hasGoodQuality(data: ProductData): boolean {
  return !!data.title && !!data.image;
}

export function extractShopName(url: string): string | null {
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

// --- Title extraction ---

function extractTitle($: cheerio.CheerioAPI): string | null {
  return (
    getMetaContent($, 'property="og:title"') ||
    getMetaContent($, 'name="twitter:title"') ||
    extractJsonLdField($, "name") ||
    getMicrodataContent($, "name") ||
    getMetaContent($, 'name="title"') ||
    getMetaContent($, 'property="title"') ||
    cleanPageTitle($("title").text().trim()) ||
    null
  );
}

// --- Image extraction (priority: og > twitter > itemprop > JSON-LD) ---

function extractImage($: cheerio.CheerioAPI): string | null {
  return (
    getMetaContent($, 'property="og:image"') ||
    getMetaContent($, 'name="twitter:image"') ||
    getMetaContent($, 'name="twitter:image:src"') ||
    getMicrodataImage($) ||
    extractJsonLdImage($) ||
    getMetaContent($, 'name="image"') ||
    getMetaContent($, 'property="image"') ||
    null
  );
}

// --- Price extraction ---

function extractPrice($: cheerio.CheerioAPI): {
  price: string | null;
  currency: string | null;
} {
  let price =
    getMetaContent($, 'property="og:price:amount"') ||
    getMetaContent($, 'property="product:price:amount"') ||
    null;
  let currency =
    getMetaContent($, 'property="og:price:currency"') ||
    getMetaContent($, 'property="product:price:currency"') ||
    null;

  if (!price) {
    const jsonLdPrice = extractJsonLdPrice($);
    if (jsonLdPrice) {
      price = jsonLdPrice.price;
      currency = currency || jsonLdPrice.currency;
    }
  }

  if (!price) {
    const microdataPrice = getMicrodataContent($, "price");
    if (microdataPrice) {
      price = microdataPrice;
    }
    if (!currency) {
      currency = getMicrodataContent($, "priceCurrency");
    }
  }

  return { price, currency };
}

// --- JSON-LD helpers ---

interface JsonLdProduct {
  name?: string;
  image?: string | string[] | { url?: string }[];
  offers?:
    | JsonLdOffer
    | JsonLdOffer[];
}

interface JsonLdOffer {
  "@type"?: string;
  price?: number | string;
  lowPrice?: number | string;
  highPrice?: number | string;
  priceCurrency?: string;
  offers?: JsonLdOffer | JsonLdOffer[];
}

function findJsonLdProduct($: cheerio.CheerioAPI): JsonLdProduct | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const text = $(scripts[i]).html();
      if (!text) continue;
      const data = JSON.parse(text);

      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (isProduct(item)) return item;
        if (item["@graph"]) {
          const product = item["@graph"].find(
            (g: { "@type"?: string | string[] }) => isProduct(g)
          );
          if (product) return product;
        }
      }
    } catch {
      // Invalid JSON
    }
  }
  return null;
}

function isProduct(item: { "@type"?: string | string[] }): boolean {
  const type = item["@type"];
  if (typeof type === "string") return type === "Product";
  if (Array.isArray(type)) return type.includes("Product");
  return false;
}

function extractJsonLdField(
  $: cheerio.CheerioAPI,
  field: "name"
): string | null {
  const product = findJsonLdProduct($);
  if (!product) return null;
  const value = product[field];
  return typeof value === "string" ? value : null;
}

function extractJsonLdImage($: cheerio.CheerioAPI): string | null {
  const product = findJsonLdProduct($);
  if (!product?.image) return null;

  const img = product.image;
  if (typeof img === "string") return img;
  if (Array.isArray(img) && img.length > 0) {
    const first = img[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first.url) return first.url;
  }
  return null;
}

function extractJsonLdPrice($: cheerio.CheerioAPI): {
  price: string;
  currency: string | null;
} | null {
  const product = findJsonLdProduct($);
  if (!product?.offers) return null;

  const offer = resolveOffer(product.offers);
  if (!offer) return null;

  const price =
    offer.price?.toString() ||
    offer.lowPrice?.toString() ||
    offer.highPrice?.toString() ||
    null;

  if (!price) return null;

  return {
    price,
    currency: offer.priceCurrency || null,
  };
}

function resolveOffer(
  offers: JsonLdOffer | JsonLdOffer[]
): JsonLdOffer | null {
  if (Array.isArray(offers)) {
    return offers.length > 0 ? resolveOffer(offers[0]) : null;
  }

  if (
    offers["@type"] === "AggregateOffer" &&
    (offers.lowPrice || offers.highPrice)
  ) {
    return offers;
  }

  if (offers.price) return offers;

  if (offers.offers) {
    return resolveOffer(offers.offers);
  }

  if (offers.lowPrice || offers.highPrice) return offers;

  return null;
}

// --- Microdata helpers ---

function getMicrodataContent(
  $: cheerio.CheerioAPI,
  prop: string
): string | null {
  const metaVal = $(`meta[itemprop="${prop}"]`).attr("content");
  if (metaVal?.trim()) return metaVal.trim();

  const el = $(`[itemprop="${prop}"]`).first();
  if (!el.length) return null;

  const content = el.attr("content");
  if (content?.trim()) return content.trim();

  const text = el.text().trim();
  return text || null;
}

function getMicrodataImage($: cheerio.CheerioAPI): string | null {
  const img = $('img[itemprop="image"]').first();
  if (img.length) {
    return img.attr("src") || img.attr("data-src") || null;
  }
  const link = $('link[itemprop="image"]').first();
  if (link.length) {
    return link.attr("href") || null;
  }
  return getMicrodataContent($, "image");
}

// --- Generic helpers ---

function getMetaContent(
  $: cheerio.CheerioAPI,
  selector: string
): string | null {
  const content = $(`meta[${selector}]`).attr("content");
  return content?.trim() || null;
}

function cleanText(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/\s+/g, " ").trim().substring(0, 200);
}

function cleanPageTitle(title: string | null): string | null {
  if (!title) return null;
  const separators = [" | ", " - ", " – ", " — ", " :: ", " >> "];
  for (const sep of separators) {
    const idx = title.lastIndexOf(sep);
    if (idx > 0) {
      const before = title.substring(0, idx).trim();
      if (before.length > 5) return before;
    }
  }
  return title;
}

function removeShopSuffix(
  title: string | null,
  shopName: string | null
): string | null {
  if (!title || !shopName) return title;
  const separators = [" | ", " - ", " – ", " — ", " :: ", " >> "];
  for (const sep of separators) {
    const idx = title.lastIndexOf(sep);
    if (idx > 0) {
      const suffix = title.substring(idx + sep.length).trim();
      if (suffix.toLowerCase().includes(shopName.toLowerCase())) {
        return title.substring(0, idx).trim();
      }
    }
  }
  return title;
}

const ERROR_PAGE_PATTERNS = [
  /^(page )?not found$/i,
  /^seite nicht gefunden$/i,
  /^page unavailable$/i,
  /^access denied$/i,
  /^zugriff verweigert$/i,
  /^403 forbidden$/i,
  /^404$/i,
  /^error$/i,
  /^fehler$/i,
  /^just a moment/i,
  /^attention required/i,
];

function isErrorPageTitle(title: string | null): boolean {
  if (!title) return false;
  return ERROR_PAGE_PATTERNS.some((p) => p.test(title.trim()));
}

function cleanPrice(price: string | null): string | null {
  if (!price) return null;

  let cleaned = price.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  // Detect format: "1.299,99" (DE) vs "1,299.99" (US)
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma > lastDot) {
    // DE format: dots are thousands, comma is decimal
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // US format: commas are thousands, dot is decimal
    cleaned = cleaned.replace(/,/g, "");
  } else if (lastComma !== -1 && lastDot === -1) {
    // Only comma, treat as decimal separator
    cleaned = cleaned.replace(",", ".");
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num.toFixed(2);
}

function makeAbsoluteUrl(url: string | null, baseUrl: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
