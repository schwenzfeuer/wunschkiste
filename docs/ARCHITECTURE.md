# Architektur

## Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                   Next.js 16 (App Router)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Wishlist  │  │   Product   │  │    Reservation      │  │
│  │    Views    │  │    Cards    │  │      System         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │  Wishlist   │  │   Product Scraper   │  │
│  │  (better-   │  │    CRUD     │  │   (OpenGraph +      │  │
│  │   auth)     │  │             │  │    Affiliate)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌───────────┐   ┌───────────┐   ┌───────────┐
       │ PostgreSQL│   │  Amazon   │   │   AWIN    │
       │           │   │ Creators  │   │    API    │
       │           │   │   API     │   │           │
       └───────────┘   └───────────┘   └───────────┘
```

## Datenfluss: Produkt hinzufügen

```
1. User fügt URL ein
         │
         ▼
2. Backend fetcht URL
         │
         ▼
3. OpenGraph/Meta-Tags extrahieren
   - Titel
   - Bild
   - Preis (falls vorhanden)
         │
         ▼
4. Affiliate-Link generieren
   ┌─────────────────────────────┐
   │ Amazon URL?                 │
   │ → Tag anhängen (?tag=xxx)   │
   ├─────────────────────────────┤
   │ AWIN Partner?               │
   │ → Link Builder API          │
   ├─────────────────────────────┤
   │ Kein Affiliate?             │
   │ → Original-URL behalten     │
   └─────────────────────────────┘
         │
         ▼
5. Produkt in DB speichern
   - Original URL
   - Affiliate URL
   - Extrahierte Daten
         │
         ▼
6. Response an Frontend
```

## Datenmodell

```
users
├── id (uuid)
├── email
├── name
├── created_at
└── updated_at

wishlists
├── id (uuid)
├── user_id (FK)
├── title
├── description
├── theme (enum: 'standard' | 'birthday' | 'christmas' | 'wedding' | 'baby')
├── share_token (unique, für öffentliche URLs)
├── is_public
├── created_at
└── updated_at

products
├── id (uuid)
├── wishlist_id (FK)
├── original_url
├── affiliate_url
├── title
├── image_url
├── price
├── currency
├── shop_name
├── created_at
└── updated_at

reservations
├── id (uuid)
├── product_id (FK)
├── reserved_by_user_id (FK, nullable)
├── reserved_by_name (für nicht-eingeloggte)
├── reserved_at
└── message (optional)
```

## Affiliate-Link Strategie

### Priorität

1. **Amazon** - Höchste Priorität (größte Reichweite)
   - Erkennung: URL enthält `amazon.de`, `amazon.com`, `amzn.to`
   - Methode: Tag-Parameter anhängen

2. **AWIN Partner** - Mittlere Priorität
   - Erkennung: Domain-Liste der AWIN-Partner
   - Methode: Link Builder API

3. **Kein Affiliate** - Fallback
   - Original-URL wird verwendet
   - Produkt wird trotzdem angezeigt

### URL-Erkennung

```typescript
function detectAffiliateNetwork(url: string): 'amazon' | 'awin' | null {
  const hostname = new URL(url).hostname;

  // Amazon
  if (/amazon\.(de|com|co\.uk)|amzn\.to/.test(hostname)) {
    return 'amazon';
  }

  // AWIN - Liste der Partner-Domains
  const awinPartners = ['otto.de', 'mediamarkt.de', ...];
  if (awinPartners.some(d => hostname.includes(d))) {
    return 'awin';
  }

  return null;
}
```

## Bilder-Strategie

### MVP: Externe URLs

Produktbilder werden direkt von der Quelle geladen (hotlinking):
```typescript
// Speichern der Original-URL
image_url: "https://m.media-amazon.com/images/I/..."
```

**Vorteile:** Kein Storage-Kosten, einfach
**Nachteile:** Bilder können verschwinden, langsamer, manche Shops blockieren

### Später: Eigenes Caching

Optional: Bilder beim Hinzufügen cachen:
```typescript
// Später erweitern
image_url: "https://cdn.wunschkiste.de/products/abc123.jpg"
image_url_original: "https://m.media-amazon.com/images/I/..."
```

Datenbank-Feld `image_url_original` ist bereits eingeplant für spätere Migration.

## Social Sharing

Jede Wunschliste braucht eigene OpenGraph-Tags:

```html
<meta property="og:title" content="Lenas Geburtstagswünsche" />
<meta property="og:description" content="5 Wünsche auf der Liste" />
<meta property="og:image" content="/api/og/wishlist/[id]" />
```

Dynamisches OG-Image generieren (z.B. mit `@vercel/og` oder `satori`).

## Security Considerations

- Affiliate-Tags sind öffentlich (kein Secret)
- API-Credentials nur serverseitig
- Rate Limiting für Scraping-Endpoint
- Sanitization von User-URLs

Siehe `SECURITY.md` für Details.
