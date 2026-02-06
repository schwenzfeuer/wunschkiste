const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG;

export type AffiliateNetwork = "amazon" | "awin" | null;

export function detectAffiliateNetwork(url: string): AffiliateNetwork {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (/amazon\.(de|com|co\.uk|fr|it|es)|amzn\.to/.test(hostname)) {
      return "amazon";
    }

    // TODO: Add AWIN partner domains (after account approval)

    return null;
  } catch {
    return null;
  }
}

export function createAffiliateUrl(url: string): string {
  const network = detectAffiliateNetwork(url);

  if (network === "amazon" && AMAZON_TAG) {
    return buildCleanAmazonUrl(url, AMAZON_TAG);
  }

  // TODO: Implement AWIN Link Builder API

  return url;
}

/**
 * Extracts ASIN from Amazon URL and builds a clean affiliate link.
 * Handles: /dp/ASIN, /gp/product/ASIN, /gp/aw/d/ASIN
 * For amzn.to short links: just appends tag (no ASIN to extract).
 */
function buildCleanAmazonUrl(url: string, tag: string): string {
  try {
    const parsed = new URL(url);

    // amzn.to short links — can't extract ASIN, just append tag
    if (parsed.hostname === "amzn.to") {
      parsed.searchParams.set("tag", tag);
      return parsed.toString();
    }

    // Extract ASIN from path
    const asin = extractAsin(parsed.pathname);
    if (!asin) {
      // Fallback: keep original URL, just set tag
      parsed.searchParams.set("tag", tag);
      return parsed.toString();
    }

    // Extract TLD from hostname (amazon.de, amazon.com, etc.)
    const hostname = parsed.hostname;

    // Build clean URL with only the ASIN and tag
    return `https://${hostname}/dp/${asin}?tag=${encodeURIComponent(tag)}`;
  } catch {
    return url;
  }
}

/**
 * Extracts ASIN from Amazon URL pathname.
 * ASIN is a 10-character alphanumeric code (e.g. B0CX23V2ZK, 347355491X).
 */
function extractAsin(pathname: string): string | null {
  // Match /dp/ASIN, /gp/product/ASIN, /gp/aw/d/ASIN
  const match = pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}
