import { AWIN_ADVERTISERS } from "./awin-advertisers";

const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG;
const AWIN_PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID;

export type AffiliateNetwork = "amazon" | "awin" | null;

function isAmazonHost(hostname: string): boolean {
  return (
    /^(www\.)?amazon\.[a-z.]+$/.test(hostname) ||
    /^amzn\.(to|eu)$/.test(hostname)
  );
}

/**
 * Finds the AWIN advertiser ID for a given hostname.
 * Tries exact match first, then strips "www." prefix,
 * then checks if any registered domain is a suffix of the hostname
 * (handles subdomains like "de.schleich-s.com").
 */
function findAwinAdvertiserId(hostname: string): number | null {
  // Exact match
  if (hostname in AWIN_ADVERTISERS) {
    return AWIN_ADVERTISERS[hostname];
  }

  // Strip www.
  const withoutWww = hostname.replace(/^www\./, "");
  if (withoutWww in AWIN_ADVERTISERS) {
    return AWIN_ADVERTISERS[withoutWww];
  }

  // Subdomain match: check if hostname ends with a registered domain
  for (const [domain, advertiserId] of Object.entries(AWIN_ADVERTISERS)) {
    if (hostname.endsWith(`.${domain}`) || hostname === domain) {
      return advertiserId;
    }
  }

  return null;
}

export function detectAffiliateNetwork(url: string): AffiliateNetwork {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (isAmazonHost(hostname)) {
      return "amazon";
    }

    if (findAwinAdvertiserId(hostname) !== null) {
      return "awin";
    }

    return null;
  } catch {
    return null;
  }
}

export function createAffiliateUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    // Amazon
    if (isAmazonHost(hostname) && AMAZON_TAG) {
      return buildCleanAmazonUrl(url, AMAZON_TAG);
    }

    // AWIN deep link
    const advertiserId = findAwinAdvertiserId(hostname);
    if (advertiserId && AWIN_PUBLISHER_ID) {
      return buildAwinDeepLink(url, advertiserId, AWIN_PUBLISHER_ID);
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Builds an AWIN deep link using the cread.php redirect.
 * Format: https://www.awin1.com/cread.php?awinmid={advertiserId}&awinaffid={publisherId}&ued={encodedUrl}
 */
function buildAwinDeepLink(
  destinationUrl: string,
  advertiserId: number,
  publisherId: string
): string {
  const encoded = encodeURIComponent(destinationUrl);
  return `https://www.awin1.com/cread.php?awinmid=${advertiserId}&awinaffid=${publisherId}&ued=${encoded}`;
}

/**
 * Extracts ASIN from Amazon URL and builds a clean affiliate link.
 * Handles: /dp/ASIN, /gp/product/ASIN, /gp/aw/d/ASIN
 * For short links (amzn.to, amzn.eu): just appends tag (no ASIN to extract).
 * Short links should ideally be resolved before calling this function.
 */
function buildCleanAmazonUrl(url: string, tag: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Short link domains — can't extract ASIN, just append tag
    if (/^amzn\.(to|eu)$/.test(hostname)) {
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
  const match = pathname.match(
    /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i
  );
  return match ? match[1] : null;
}
