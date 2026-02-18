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
BETTER_AUTH_URL=https://wunschkiste.app
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

**Redirect URLs (Google Cloud Console):**
- Local: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://wunschkiste.app/api/auth/callback/google`

### Facebook OAuth

**Env Variables:**
```
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx
```

**Redirect URLs (Facebook Developer Portal):**
- Local: `http://localhost:3000/api/auth/callback/facebook`
- Prod: `https://wunschkiste.app/api/auth/callback/facebook`

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

**Recherche-Datum:** 05.02.2026, aktualisiert 18.02.2026

### Zweistufiges System (seit 18.02.2026)

**Stufe 1 -- Cheerio:** Schnell (~200ms). Extrahiert aus OG-Tags, Twitter Cards, Microdata/itemprop, product:-Tags, JSON-LD (inkl. Array-Offers, AggregateOffer, verschachtelte @type).

**Stufe 2 -- Cloudflare Browser Rendering (Fallback):** Wenn Cheerio kein Titel ODER kein Bild liefert, wird die Seite per Browser gerendert und dann mit der gleichen Cheerio-Logik geparst. Loest JS-gerenderte Shops (Dior, Zara, Nike, IKEA, Apple Store).

### Cloudflare Browser Rendering REST API

- **Endpoint:** `POST /client/v4/accounts/{id}/browser-rendering/content`
- **Auth:** Bearer Token mit "Browser Rendering - Edit" Permission
- **Response:** Rohes HTML (kein JSON-Wrapper)
- **Env-Vars:** `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_BR_API_TOKEN`
- **Kosten:** 10 Browser-Stunden/Monat im Paid Plan inklusive, ~7.200 Scrapes/Monat kostenlos bei ~5s/Scrape
- Ohne Env-Vars: Graceful Degradation, nur Cheerio wird verwendet
- `rejectResourceTypes: ["image", "font", "media"]` spart Bandbreite/Zeit
- `gotoOptions.waitUntil: "networkidle0"` wartet bis alle Netzwerk-Requests fertig sind

### Shop-Kompatibilität

| Shop | Titel | Bild | Preis | Methode |
|------|-------|------|-------|---------|
| Amazon | ja | nein | nein | OG-Tags (blockiert Scraper fuer Details) |
| Otto | ja | ja | ja | OG-Tags + JSON-LD |
| JS-gerenderte Shops | ja | ja | variiert | Browser Rendering Fallback |

### Extraktions-Prioritaet

- **Titel:** og:title > twitter:title > JSON-LD name > itemprop name > meta title > `<title>` (mit Shop-Suffix-Bereinigung)
- **Bild:** og:image > twitter:image > itemprop image > JSON-LD image > meta image
- **Preis:** og:price:amount > product:price:amount > JSON-LD offers.price/lowPrice > itemprop price

### Preisformat-Erkennung

Deutsche Preise verwenden Komma als Dezimaltrenner (1.299,99), US-Preise Punkt (1,299.99). Die Erkennung basiert auf der Position des letzten Kommas vs. letzten Punkts.

### Tipps
- User-Agent Header setzen (sonst 403)
- `Accept-Language: de-DE` fuer deutsche Preise
- JSON-LD ist oft zuverlaessiger als OG-Tags fuer Preise
- Fallback-Kette: OG > Twitter Cards > JSON-LD > Microdata > Meta-Tags > Browser Rendering

---

## Amazon Affiliate URLs

**Recherche-Datum:** 06.02.2026

### URL-Formate

Amazon-URLs kommen in vielen Varianten:
- Sauber: `amazon.de/dp/ASIN/`
- Suche: `amazon.de/.../dp/ASIN/ref=sr_1_1?dib=...&keywords=...&qid=...`
- Affiliate: `...?linkCode=ll2&tag=xxx-21&linkId=...&ref_=as_li_ss_tl`
- Short: `amzn.to/3ZlUJXO`

### ASIN-Extraktion

ASIN ist ein 10-stelliger alphanumerischer Code, immer in `/dp/ASIN` oder `/gp/product/ASIN`.
Regex: `/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i`

### Clean URL Strategie

1. ASIN aus URL extrahieren
2. Alle Query-Parameter wegwerfen (Tracking-Ballast)
3. Clean URL bauen: `https://www.amazon.de/dp/ASIN?tag=wunschkiste-21`
4. Für `amzn.to` Short-Links: nur `?tag=` anhängen (kein ASIN extrahierbar)

### Affiliate Tag

- Tag: `wunschkiste-21`
- In `.env.local` als `AMAZON_AFFILIATE_TAG`
- Links brauchen `rel="sponsored nofollow"` (Google SEO Requirement)

---

## next-intl Navigation

**Recherche-Datum:** 06.02.2026

### Problem

Mit `localePrefix: "as-needed"` und `defaultLocale: "de"`:
- `next/link` mit `href="/login"` → geht IMMER zu `/login` (= deutsch)
- User auf `/en/` klickt Login → landet auf `/login` statt `/en/login`

### Lösung

`createNavigation(routing)` aus `next-intl/navigation` exportiert locale-aware Versionen:
```typescript
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

Diese MÜSSEN statt `next/link` und `next/navigation` verwendet werden.
Import: `import { Link, useRouter } from "@/i18n/routing"`

### Pitfall: Playwright Tests

Wenn der Dev-Server mit `BETTER_AUTH_URL=https://tunnel.example.com` läuft und Playwright startet, blockiert der belegte Port 3000 Playwrights eigenen WebServer → Tests schlagen fehl. Dev-Server vorher stoppen.

---

## AWIN Publisher API (Recherche)

**Recherche-Datum:** 06.02.2026

### Wichtige Shops bei AWIN (DE)

Otto, Thalia, Douglas, Tchibo, MediaMarkt/Saturn, Zalando Lounge.
Amazon ist NICHT bei AWIN (eigenes PartnerNet).

### Integration-Flow

1. `GET /publishers/{id}/programmes` → alle Advertiser mit `validDomains`
2. Domain-Mapping bauen: `www.otto.de` → Advertiser-ID 14336
3. `POST /publishers/{id}/linkbuilder/generate` → Affiliate-Link zurück
4. Rate Limit: 20 API-Calls/Minute

### Kosten

- 5€ Deposit (wird zurückgezahlt)
- Kein laufender Kostenpunkt für Publisher
- Bei jedem Advertiser einzeln bewerben

### Deep-Link-Format (kein API-Call noetig)

**Recherche-Datum:** 13.02.2026

Statt der Link Builder API (20 Calls/min Rate Limit, async) kann man AWIN Deep-Links direkt bauen:
```
https://www.awin1.com/cread.php?awinmid={advertiserId}&awinaffid={publisherId}&ued={encodedDestinationUrl}
```

- `awinmid`: Advertiser-ID (aus dem AWIN-Programm)
- `awinaffid`: Publisher-ID (eigene ID, hier 2771080)
- `ued`: URL-encoded Ziel-URL

Vorteile gegenueber Link Builder API: synchron, kein Rate Limit, kein API-Token noetig. Nur Publisher-ID + Advertiser-ID reichen.

### Advertiser-Directory Export (13.02.2026)

AWIN bietet einen CSV-Export aller verfuegbaren Programme (Advertiser Directory). Nuetzliche Spalten fuer Filterung:
- `primaryRegion` (DE/AT/GB/...)
- `primarySector` / `subSectors` (Toys & Games, Baby & Toddler, etc.)
- `awinIndex` (Qualitaetsscore 0-100)
- `feedEnabled` (yes/no -- ob Produktdaten-Feed verfuegbar)
- `paymentStatus` (green/amber)
- `conversionRate`, `epc` (Earnings per Click)

---

## Cloudflare Workers + OpenNext Deployment

**Recherche-Datum:** 09.02.2026

### compatibility_date ist kritisch

`wrangler.jsonc` braucht eine aktuelle `compatibility_date`. Mit `2025-04-01` fehlt `MessagePort` als globale Variable, was Next.js intern braucht. Symptom: `ReferenceError: MessagePort is not defined` bei API-Route-Aufrufen. Fix: `compatibility_date: "2025-12-01"` oder neuer.

### keep_names: false fuer next-themes

Esbuild setzt `keep-names` standardmaessig auf `true`, was eine `__name`-Funktion in Modules injiziert. `next-themes` konvertiert Scripts zu Strings (inline `<script>` Tags), in denen `__name` dann nicht definiert ist. Fix: `"keep_names": false` in `wrangler.jsonc`. Siehe: https://opennext.js.org/cloudflare/howtos/keep_names

### Worker Size Limits

Free Tier: 3 MiB (compressed). Paid ($5/mo): 10 MiB. Wunschkiste-Bundle ist ~5.2 MiB gzip wegen cheerio + @aws-sdk/client-s3. Paid Plan noetig.

### runtime="edge" nicht verwenden

OpenNext auf Cloudflare unterstuetzt kein Edge Runtime. `export const runtime = "edge"` aus Route-Dateien entfernen. Alles laeuft als nodejs Runtime.

### output: "standalone" entfernen

OpenNext uebernimmt das Bundling. `output: "standalone"` in `next.config.ts` muss entfernt werden, sonst Konflikte.

### drizzle-orm/neon-http statt postgres.js

Cloudflare Workers haben keine TCP-Sockets. `postgres.js` funktioniert nicht. Stattdessen `@neondatabase/serverless` mit `drizzle-orm/neon-http` (HTTP-basiert). Keine Code-Aenderungen an Queries noetig, nur der Driver-Import aendert sich.

### Lokaler DB-Driver: neon-http vs postgres (12.02.2026)

`@neondatabase/serverless` (neon-http) verbindet sich ueber HTTPS -- lokales PostgreSQL hat keinen HTTPS-Endpoint. Symptom: `Error: connect ECONNREFUSED 127.0.0.1:443`. Loesung: `db/index.ts` erkennt anhand der DATABASE_URL ob lokal (localhost/127.0.0.1) und nutzt dann `postgres` (TCP via drizzle-orm/postgres-js), sonst `neon-http`. Beide Packages sind installiert. Type-Cast `as unknown as Db` noetig weil die Drizzle-Instanzen unterschiedliche Generics haben, aber identische Query-API bieten.

### Neon Connection String

- `drizzle-kit push` liest `.env.local` NICHT automatisch. `source .env.local && pnpm db:push` verwenden.
- Connection Strings mit `&` muessen in der Shell gequoted werden (einfache Anfuehrungszeichen).
- Pooler-Endpoint (`-pooler` im Hostnamen) funktioniert mit neon-http.

### Workers vs Pages -- zwei verschiedene Projekte

`wrangler deploy` erstellt ein **Worker**-Projekt. Env-Vars die im **Pages**-Projekt gesetzt sind, gelten dort nicht. Env-Vars muessen im Worker-Projekt gesetzt werden (Dashboard → Workers & Pages → wunschkiste → Settings → Variables and Secrets).

### Custom Domain in wrangler.jsonc pflegen

`wrangler deploy` ueberschreibt die Remote-Config mit der lokalen. Wenn die Custom Domain (`wunschkiste.app`) nur remote im Dashboard konfiguriert ist aber nicht in `wrangler.jsonc`, wird sie beim naechsten Deploy entfernt. Die `routes`-Config muss in `wrangler.jsonc` stehen:
```jsonc
"routes": [
  {
    "pattern": "wunschkiste.app",
    "zone_name": "wunschkiste.app",
    "custom_domain": true
  }
]
```

### pnpm run deploy, nicht pnpm deploy

`pnpm deploy` ist ein pnpm-eigener Befehl (Workspace-Deployment) und schlaegt fehl mit "No project was selected for deployment". Das Script aus `package.json` muss mit `pnpm run deploy` aufgerufen werden.

### Google OAuth bei Domain-Wechsel

Bei Domain-Wechsel muessen in der Google Cloud Console **beide** aktualisiert werden:
1. Autorisierte JavaScript-Quellen: `https://wunschkiste.app`
2. Autorisierte Weiterleitungs-URIs: `https://wunschkiste.app/api/auth/callback/google`

Aenderungen brauchen ein paar Minuten bis sie aktiv sind.

---

## @arcjet/next Rate-Limiting

**Recherche-Datum:** 07.02.2026

### protect() Signatur

`tokenBucket` Rules erfordern `{ requested: number }` als zweiten Parameter:
```typescript
const decision = await aj.protect(request, { requested: 1 });
```
Ohne den zweiten Parameter: TypeScript-Fehler "Expected 2 arguments, but got 1."

### DRY_RUN vs LIVE

In Development/Tests `DRY_RUN` verwenden, sonst werden parallele Playwright-Tests durch Rate-Limiting blockiert:
```typescript
const mode = process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN";
```

---

## better-auth Client-Methoden

**Recherche-Datum:** 07.02.2026

### Password Reset Methoden

Die Client-Methode heißt `requestPasswordReset`, NICHT `forgetPassword`:
```typescript
export const { requestPasswordReset, resetPassword } = authClient;
```
`forgetPassword` existiert nur im email-otp Plugin. Die Core-Routes werden aus `/request-password-reset` → `requestPasswordReset` abgeleitet.

Trick zum Prüfen der verfügbaren Methoden:
```bash
node -e "/* TypeScript programmatisch auslesen, siehe Session-Log */"
```

---

## Resend Email SDK

**Recherche-Datum:** 07.02.2026

### Lazy Init erforderlich

`new Resend()` ohne API Key wirft sofort einen Error — auch beim Next.js Build (Static Page Collection). Lösung: Lazy init:
```typescript
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}
```

### Domain-Verifizierung (08.02.2026)

Resend verweigert den Versand mit `from: "...@wunschkiste.app"` wenn die Domain nicht verifiziert ist:
```
403: "The wunschkiste.app domain is not verified"
```
Zum Testen `onboarding@resend.dev` als Absender verwenden. Fuer Production muss die Domain bei Resend verifiziert werden (DNS TXT Records).

### Google Fonts in Emails (08.02.2026)

Email-Clients laden Web-Fonts nicht automatisch. Ein `<link>` Tag im `<head>` funktioniert in Gmail und Apple Mail:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
```
Outlook ignoriert es und faellt auf die Fallback-Fonts zurueck (`Georgia`, `sans-serif`).

---

## Next.js useSearchParams + Suspense

**Recherche-Datum:** 07.02.2026

### Build-Fehler bei Static Generation

`useSearchParams()` in einer Page-Komponente verursacht Build-Fehler:
> useSearchParams() should be wrapped in a suspense boundary

Lösung: Innere Komponente extrahieren und in `<Suspense>` wrappen:
```tsx
export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
function LoginForm() {
  const searchParams = useSearchParams();
  // ...
}
```

---

## Cloudflare R2

**Recherche-Datum:** 07.02.2026

### API Token Typen

- **User API Token**: Wird inaktiv wenn User die Organisation verlässt → für Development
- **Account API Token**: Bleibt immer aktiv → für Production

### Bucket Setup

1. Bucket erstellen (Standard Storage Class, Automatic Location)
2. Public access aktivieren (r2.dev subdomain) für öffentliche Avatar-URLs
3. S3-Endpunkt: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## SVG Animationen

**Recherche-Datum:** 07.02.2026

### transform-box: fill-box

CSS `transform` (z.B. `translateY`) funktioniert auf SVG `<g>` Elementen standardmäßig nicht, weil der Browser die viewport-Box als Referenz nimmt. Lösung:

```css
.logo-star-float {
  transform-box: fill-box;
  animation: logo-star-float 2s ease-in-out infinite;
}
```

`transform-box: fill-box` sagt dem Browser, die Bounding Box der SVG-Gruppe als Referenz für Transforms zu nutzen. Ohne das wird `translateY` auf `<g>`-Elementen ignoriert.

---

## next-intl Lokalisierte Pathnames

**Recherche-Datum:** 08.02.2026

### Konfiguration

`defineRouting` akzeptiert ein `pathnames`-Objekt, das Filesystem-Pfade auf lokalisierte URLs mapped:
```typescript
export const routing = defineRouting({
  pathnames: {
    "/dashboard": {
      de: "/meine-wunschkisten",
      en: "/dashboard",
    },
    "/wishlist/[id]": {
      de: "/wunschkiste/[id]",
      en: "/wishlist/[id]",
    },
  },
});
```

### Strikte Typisierung

Mit `pathnames` werden `Link href` und `router.push()` **strikt typisiert** — nur die definierten Pfade sind erlaubt. Dynamische Pfade brauchen die Objekt-Syntax:
```typescript
// ❌ Compile Error
router.push(`/wishlist/${id}`);
Link href={`/wishlist/${id}`}

// ✅ Korrekt
router.push({ pathname: "/wishlist/[id]", params: { id } });
<Link href={{ pathname: "/wishlist/[id]", params: { id } }}>

// Query-Params
<Link href={{ pathname: "/login", query: { callbackUrl: "/share/abc" } }}>
```

### Dynamische Strings (callbackUrl)

Für Werte aus URL-Params die nicht statisch typisierbar sind, Type-Cast verwenden:
```typescript
const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
router.push(callbackUrl as "/dashboard");
```

### Tests

E2E-Tests müssen die **lokalisierten** URLs verwenden (`page.goto("/anmelden")`, nicht `/login`), da die Middleware die Filesystem-Pfade zur Laufzeit rewritet.

---

## react-day-picker v9 Navigation

**Recherche-Datum:** 08.02.2026

### DOM-Struktur

In v9 ist `nav` ein **Geschwister**-Element von `months`, nicht ein Kind von `month_caption`:
```html
<div class="rdp-root">     <!-- DayPicker root -->
  <div class="rdp-months">
    <div class="rdp-month">
      <div class="rdp-month_caption">Februar 2026</div>
      <table class="rdp-month_grid">...</table>
    </div>
  </div>
  <nav class="rdp-nav">   <!-- Geschwister, nicht Kind! -->
    <button class="rdp-button_previous">◀</button>
    <button class="rdp-button_next">▶</button>
  </nav>
</div>
```

### Fix für shadcn Calendar

Die Standard-shadcn-Calendar setzt `absolute left-1`/`absolute right-1` auf die Buttons, aber ohne passenden `relative`-Container greifen diese ins Leere. Fix:
```typescript
className={cn("relative p-3", className)}  // Root: relative
classNames={{
  nav: "absolute top-3 left-3 right-3 flex justify-between z-10",  // Nav absolut oben
  button_previous: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"),  // KEIN absolute
  button_next: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"),  // KEIN absolute
}}
```

---

## Cloudflare Workers: Async nach Response

**Recherche-Datum:** 15.02.2026

### Problem

Fire-and-forget Calls (`notifyWishlistRoom(id).catch(() => {})`) werden in Cloudflare Workers nach dem Senden der Response terminiert. Der DO-Aufruf kommt nie an.

### Fix

Alle async Aufrufe die nach dem DB-Write aber vor der Response passieren muessen, MUESSEN awaited werden:
```typescript
// FALSCH - wird nach Response terminiert
notifyWishlistRoom(id).catch(() => {});
return NextResponse.json(product);

// RICHTIG
await notifyWishlistRoom(id);
return NextResponse.json(product);
```

---

## Affiliate-URL Vergleich bei Resolved URLs

**Recherche-Datum:** 15.02.2026

### Problem

Wenn der Scraper eine URL aufloest (z.B. Redirect), ist `resolvedUrl !== originalUrl`. `createAffiliateUrl` wird mit `resolvedUrl` aufgerufen. Wenn der Shop kein Affiliate-Partner ist, gibt die Funktion die `resolvedUrl` unveraendert zurueck. Der Vergleich `affiliateUrl !== originalUrl` ist dann `true`, obwohl keine Affiliate-Transformation stattfand.

### Fix

```typescript
const urlForAffiliate = parsed.data.resolvedUrl || parsed.data.originalUrl;
const affiliateUrl = createAffiliateUrl(urlForAffiliate);

// FALSCH - vergleicht gegen originalUrl
affiliateUrl: affiliateUrl !== parsed.data.originalUrl ? affiliateUrl : null,

// RICHTIG - vergleicht gegen die URL die an createAffiliateUrl uebergeben wurde
affiliateUrl: affiliateUrl !== urlForAffiliate ? affiliateUrl : null,
```

---

## Resend: Test-Emails verbrauchen Quota

**Recherche-Datum:** 15.02.2026

### Problem

Playwright-Tests registrieren pro Testlauf dutzende User (`test-{timestamp}@example.com`). better-auth triggert bei jedem signup die Welcome-Email via Resend. Free Tier hat nur 100 Emails/Tag -- ein voller Testlauf verbraucht das gesamte Kontingent.

### Fix

Guard in allen Email-Funktionen:
```typescript
function isTestEmail(to: string) {
  return to.endsWith("@example.com");
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (isTestEmail(to)) return;
  // ...
}
```

`@example.com` ist per RFC 2606 reserviert und nie zustellbar -- sicherer als env-basierte Guards (die bei `reuseExistingServer` nicht greifen).

---

## Chat: Optimistic Update + WebSocket Dedup

**Recherche-Datum:** 16.02.2026

### Problem

Beim Senden einer Chat-Nachricht erscheint sie doppelt: einmal vom Optimistic Update (useMutation onSuccess) und einmal vom WebSocket (onChatMessage). Je nach Timing kann die Dedup-Prüfung fehlschlagen, wenn sie nur die letzte Page prüft.

### Fix

Beide Stellen (onSuccess + onChatMessage) müssen über ALLE Pages dedupen:
```typescript
queryClient.setQueryData<typeof data>(queryKey, (old) => {
  if (!old) return old;
  const allMessages = old.pages.flatMap((p) => p.messages);
  if (allMessages.some((m) => m.id === newMessage.id)) return old;
  // ... append to last page
});
```

### Allgemeine Regel

Bei Echtzeit-Features mit Optimistic Updates: Dedup IMMER über den gesamten Cache, nicht nur den zuletzt geschriebenen Teil.

---

## Radix DropdownMenu auf Mobile

**Recherche-Datum:** 14.02.2026

### Problem: pointerdown statt click

Radix DropdownMenu oeffnet auf `pointerdown`, nicht auf `click`. Auf Mobile feuert `pointerdown` sofort bei Beruehrung -- auch beim Scrollen. Das fuehrt dazu, dass Menues sich beim Wischen ueber Buttons oeffnen.

### Fix: Kontrollierte Dropdowns mit onClick

```typescript
const [openMenu, setOpenMenu] = useState<string | null>(null);

<DropdownMenu
  modal={false}
  open={openMenu === `ctx-${product.id}`}
  onOpenChange={(open) => { if (!open) setOpenMenu(null); }}
>
  <DropdownMenuTrigger asChild>
    <Button onClick={() => setOpenMenu(prev =>
      prev === `ctx-${product.id}` ? null : `ctx-${product.id}`
    )}>
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
  ...
</DropdownMenu>
```

Wichtig: `onOpenChange` wird nur zum Schliessen verwendet (Klick ausserhalb, Escape, Item-Auswahl). Das Oeffnen passiert ausschliesslich ueber `onClick` auf dem Button. Mobile Browser feuern `click` nicht bei Scroll-Gesten, daher oeffnen sich die Menues nicht mehr beim Scrollen.

---

## Zod 4: z.record() braucht zwei Argumente

**Recherche-Datum:** 17.02.2026

### Problem

`z.record(z.string())` kompiliert nicht in Zod 4 -- TypeScript meldet "Expected 2-3 arguments, but got 1."

### Fix

In Zod 4 ist der Key-Type nicht mehr optional:
```typescript
// FALSCH (Zod 3 Syntax)
z.record(z.string())

// RICHTIG (Zod 4)
z.record(z.string(), z.string())
```

---

## navigator.sendBeacon mit JSON

**Recherche-Datum:** 17.02.2026

### Problem

`navigator.sendBeacon(url, jsonString)` sendet den Body als `text/plain`, nicht als `application/json`. Der Server bekommt dann einen Parse-Fehler bei `request.json()`.

### Fix

Body als Blob mit explizitem Content-Type wrappen:
```typescript
const body = JSON.stringify(data);
navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
```
