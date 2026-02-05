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

### Nächste Schritte

- [ ] Google Cloud Project erstellen
- [ ] Facebook App erstellen
- [ ] OAuth Credentials generieren
