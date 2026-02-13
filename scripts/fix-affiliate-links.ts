/**
 * One-off migration: Fix products with missing affiliate URLs.
 *
 * Finds all products where affiliateUrl is NULL, checks if originalUrl
 * is an Amazon link (including short links like amzn.eu, amzn.to),
 * resolves short links to get the real Amazon URL, and generates
 * clean affiliate URLs with the tag.
 *
 * Usage:
 *   source .env.local && npx tsx scripts/fix-affiliate-links.ts
 *
 * Dry-run (default): only prints what would change.
 * Apply:  source .env.local && APPLY=1 npx tsx scripts/fix-affiliate-links.ts
 */

import { neon } from "@neondatabase/serverless";

const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG;
const DATABASE_URL = process.env.DATABASE_URL;
const DRY_RUN = process.env.APPLY !== "1";

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

if (!AMAZON_TAG) {
  console.error("AMAZON_AFFILIATE_TAG not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

function isAmazonUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      /^(www\.)?amazon\.[a-z.]+$/.test(hostname) ||
      /^amzn\.(to|eu)$/.test(hostname)
    );
  } catch {
    return false;
  }
}

function isShortLink(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return /^amzn\.(to|eu)$/.test(hostname);
  } catch {
    return false;
  }
}

async function resolveShortLink(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9",
    },
    redirect: "follow",
  });
  return response.url;
}

function extractAsin(pathname: string): string | null {
  const match = pathname.match(
    /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i
  );
  return match ? match[1] : null;
}

function buildAffiliateUrl(resolvedUrl: string, tag: string): string | null {
  try {
    const parsed = new URL(resolvedUrl);
    const asin = extractAsin(parsed.pathname);
    if (!asin) return null;
    return `https://${parsed.hostname}/dp/${asin}?tag=${encodeURIComponent(tag)}`;
  } catch {
    return null;
  }
}

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== APPLYING CHANGES ===");
  console.log(`Tag: ${AMAZON_TAG}\n`);

  const rows = await sql`
    SELECT id, original_url, affiliate_url
    FROM products
    WHERE affiliate_url IS NULL
  `;

  console.log(`${rows.length} Produkte ohne affiliateUrl gefunden.\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const { id, original_url: originalUrl } = row;

    if (!isAmazonUrl(originalUrl)) {
      skipped++;
      continue;
    }

    try {
      let targetUrl = originalUrl;

      if (isShortLink(originalUrl)) {
        console.log(`  Resolve: ${originalUrl}`);
        targetUrl = await resolveShortLink(originalUrl);
        console.log(`       --> ${targetUrl}`);
      }

      const affiliateUrl = buildAffiliateUrl(targetUrl, AMAZON_TAG!);

      if (!affiliateUrl) {
        console.log(`  SKIP (keine ASIN): ${originalUrl}`);
        skipped++;
        continue;
      }

      console.log(`  ${originalUrl}`);
      console.log(`  --> ${affiliateUrl}`);

      if (!DRY_RUN) {
        await sql`
          UPDATE products
          SET affiliate_url = ${affiliateUrl}
          WHERE id = ${id}
        `;
      }

      fixed++;
    } catch (err) {
      console.error(`  FEHLER bei ${originalUrl}:`, err);
      errors++;
    }
  }

  console.log(`\n--- Ergebnis ---`);
  console.log(`Gefixt: ${fixed}`);
  console.log(`Uebersprungen (kein Amazon): ${skipped}`);
  console.log(`Fehler: ${errors}`);

  if (DRY_RUN && fixed > 0) {
    console.log(`\nUm die Aenderungen anzuwenden: APPLY=1 npx tsx scripts/fix-affiliate-links.ts`);
  }
}

main().catch(console.error);
