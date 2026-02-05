const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG;

export type AffiliateNetwork = "amazon" | "awin" | null;

export function detectAffiliateNetwork(url: string): AffiliateNetwork {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (/amazon\.(de|com|co\.uk|fr|it|es)|amzn\.to/.test(hostname)) {
      return "amazon";
    }

    // TODO: Add AWIN partner domains
    // const awinPartners = ["otto.de", "mediamarkt.de", ...];
    // if (awinPartners.some(d => hostname.includes(d))) {
    //   return "awin";
    // }

    return null;
  } catch {
    return null;
  }
}

export function createAffiliateUrl(url: string): string {
  const network = detectAffiliateNetwork(url);

  if (network === "amazon" && AMAZON_TAG) {
    return addAmazonTag(url, AMAZON_TAG);
  }

  // TODO: Implement AWIN Link Builder API
  // if (network === "awin") {
  //   return await createAwinLink(url);
  // }

  return url;
}

function addAmazonTag(url: string, tag: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("tag", tag);
    return parsed.toString();
  } catch {
    return url;
  }
}
