# API Learnings & Recherche

> Dokumentation aller externen API-Integrationen

## Amazon Creators API

**Dokumentation:** https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction
**Recherche-Datum:** 05.02.2026

### Hintergrund

Die PA-API (Product Advertising API) wird am **30.04.2026 eingestellt**. Migration zur Creators API ist Pflicht.

**Wichtige Deadlines:**
- 31.01.2026: Offers V1 wird eingestellt
- 30.04.2026: PA-API komplett eingestellt

### Auth-Methode

OAuth 2.0 Client-Credentials Flow:
- Token gültig ca. 1 Stunde (cachen!)
- **Neue Credentials nötig** - AWS Keys funktionieren NICHT
- Credential ID + Credential Secret in Associates Central generieren

### API-Änderungen vs PA-API

- Field Naming: lowerCamelCase statt PascalCase
  - `ItemIds` → `itemIds`
  - `PartnerTag` → `partnerTag`
- Core Operations (Search, Get, Variations) bleiben ähnlich

### Einfache Affiliate-Links

Für reine Affiliate-Links ohne Produktdaten-Abruf:
```
https://www.amazon.de/dp/ASIN?tag=dein-tag-21
```
Kein API-Call nötig, nur Tag anhängen.

### Rate Limits

- Nicht explizit dokumentiert
- Vermutlich ähnlich PA-API: 1 TPS initial, steigt mit Umsatz

### Nächste Schritte

- [ ] Amazon Associates Account erstellen
- [ ] Creators API Credentials generieren
- [ ] 10 Sales generieren für API-Zugang

---

## AWIN Publisher API

**Dokumentation:** https://developer.awin.com / https://success.awin.com
**Recherche-Datum:** 05.02.2026

### Auth-Methode

OAuth 2.0:
- Token generieren via https://ui.awin.com/awin-api
- Bearer Token für API-Calls

### Link Builder API

**Endpoint:** `https://api.awin.com/publishers/{publisherId}/linkbuilder`

**Features:**
- Einzelne Links oder Batches (bis 100 Links)
- Short Links generierbar
- Daily Allowance prüfbar

### Request Format

```
POST /publishers/{publisherId}/linkbuilder
Authorization: Bearer {token}

{
  "advertiserId": 12345,
  "destinationUrl": "https://shop.de/produkt"
}
```

### Convert-a-Link

Alternative zu API-Calls:
- JavaScript-Tag auf der Seite
- Wandelt automatisch alle Links zu Affiliate-Links um
- Könnte für MVP einfacher sein

### Nächste Schritte

- [ ] AWIN Publisher Account beantragen
- [ ] API-Zugang freischalten
- [ ] Entscheiden: Link Builder API vs Convert-a-Link

---

## OpenGraph / Meta-Tags Scraping

**Standard:** https://ogp.me/
**Recherche-Datum:** 05.02.2026

### Verfügbare Daten

Die meisten Shops haben diese Meta-Tags:
```html
<meta property="og:title" content="Produktname">
<meta property="og:image" content="https://...">
<meta property="og:price:amount" content="29.99">
<meta property="og:price:currency" content="EUR">
<meta property="og:url" content="https://...">
```

### Implementierung

Mit Cheerio:
```typescript
import * as cheerio from 'cheerio';

async function extractProductData(url: string) {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);

  return {
    title: $('meta[property="og:title"]').attr('content'),
    image: $('meta[property="og:image"]').attr('content'),
    price: $('meta[property="og:price:amount"]').attr('content'),
    currency: $('meta[property="og:price:currency"]').attr('content'),
  };
}
```

### Bekannte Einschränkungen

- Nicht alle Shops haben og:price
- Manche Shops blockieren Scraping (Rate Limiting, CAPTCHAs)
- Bilder können verschiedene Größen haben
- Preis kann veraltet sein

### Fallback-Strategie

1. OpenGraph Tags versuchen
2. JSON-LD Structured Data prüfen
3. Standard Meta-Tags (title, description)
4. Manuell eingeben lassen

---

## better-auth Integration

**Dokumentation:** https://www.better-auth.com/docs
**Recherche-Datum:** 05.02.2026

### Google OAuth

**Env Variables:**
```
BETTER_AUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

**Redirect URLs (Google Cloud Console):**
- Local: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://domain.com/api/auth/callback/google`

### Facebook OAuth

**Env Variables:**
```
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx
```

**Redirect URLs (Facebook Developer Portal):**
- Local: `http://localhost:3000/api/auth/callback/facebook`
- Prod: `https://domain.com/api/auth/callback/facebook`

### Konfiguration

```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
  },
})
```

### Wichtige Pitfalls (erfahren am 05.02.2026)

**UUID-Kompatibilität:**
better-auth generiert standardmäßig kurze String-IDs (kein UUID). Wenn das Drizzle-Schema `uuid()` Spalten nutzt, MUSS `advanced.database.generateId: "uuid"` gesetzt werden:
```typescript
export const auth = betterAuth({
  // ...
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
```

**Password-Feld:**
Für Email/Password Auth braucht die `accounts`-Tabelle ein `password: text("password")` Feld. Ohne dieses Feld schlägt die Registrierung fehl mit "The field password does not exist in the account Drizzle schema".

**Session abrufen in API Routes:**
```typescript
const session = await auth.api.getSession({
  headers: request.headers,
});
```

### Nächste Schritte

- [ ] Google Cloud Project erstellen
- [ ] Facebook App erstellen
- [ ] OAuth Credentials generieren

---

## Drizzle ORM Pitfalls

**Recherche-Datum:** 05.02.2026

### drizzle-kit push & ENV

`drizzle-kit push` liest NICHT automatisch `.env.local`. Die `DATABASE_URL` muss explizit übergeben werden:
```bash
DATABASE_URL="postgres://..." pnpm db:push
```

---

## Cloudflare Tunnel (Mobile-Testing)

**Dokumentation:** https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
**Recherche-Datum:** 06.02.2026

### Setup

```bash
# Installation
sudo dpkg -i cloudflared-linux-amd64.deb

# Login (öffnet Browser, Domain auswählen)
cloudflared tunnel login

# Tunnel erstellen
cloudflared tunnel create wunschkiste

# DNS Route setzen
cloudflared tunnel route dns wunschkiste wunschkiste.schwenzfeuer.com
```

Config: `~/.cloudflared/config.yml`

### Bekannte Pitfalls

- **BETTER_AUTH_URL** muss auf die Tunnel-Domain gesetzt werden, sonst scheitert Auth (Cookies, Redirects)
- `.env.local` NICHT ändern → stattdessen per Env-Override: `BETTER_AUTH_URL=https://... pnpm dev`
- Bestehender `bot.schwenzfeuer.com` Tunnel läuft auf dem Raspberry Pi (separater Tunnel)
- `cloudflared tunnel run` muss manuell gestartet werden (kein systemd Service auf Dev-Rechner)

---

## Scraper-Erfahrungen

**Recherche-Datum:** 05.02.2026

### Shop-Kompatibilität

| Shop | Titel | Bild | Preis | Methode |
|------|-------|------|-------|---------|
| Amazon | ✅ | ❌ | ❌ | OG-Tags (blockiert Scraper für Details) |
| Otto | ✅ | ✅ | ✅ | OG-Tags + JSON-LD |

### Tipps
- User-Agent Header setzen (sonst 403)
- `Accept-Language: de-DE` für deutsche Preise
- JSON-LD ist oft zuverlässiger als OG-Tags für Preise
- Fallback-Kette: OG → JSON-LD → Meta-Tags → manuell
