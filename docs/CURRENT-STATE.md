# Current State

> Letzte Aktualisierung: 07.02.2026 (Abend)

## Status

**Phase:** MVP komplett + Polishing (Themes, Affiliate, i18n). Deployment-ready.

## Was existiert

- [x] Brainstorming abgeschlossen (`PROJECT.md`)
- [x] Tech-Stack gelockt (`TECH-STACK.md`)
- [x] API-Recherche durchgeführt (`LEARNINGS.md`)
- [x] Architektur & Datenmodell (`ARCHITECTURE.md`)
- [x] Design System mit Anlass-Themes (`DESIGN.md`)
- [x] Code Standards (`CODE-STANDARDS.md`)
- [x] Security & Legal (`SECURITY.md`)
- [x] ADRs dokumentiert (`DECISIONS.md`)
- [x] Git Repo auf GitHub (`schwenzfeuer/wunschkiste`)
- [x] Projekt-Setup (Next.js 16, Tailwind 4, shadcn/ui, Drizzle, better-auth, next-intl)
- [x] **PostgreSQL** via Docker auf Port 5433, Schema gepusht
- [x] **Auth** (Email/Password funktioniert, Google/Facebook Code vorbereitet)
- [x] **Wishlists API** (CRUD: erstellen, lesen, bearbeiten, löschen)
- [x] **Products API** (CRUD mit Affiliate-Link-Integration)
- [x] **URL-Scraper** (Cheerio: OpenGraph + JSON-LD + Meta-Tags Fallback)
- [x] **Share API** (öffentliche Wunschlisten mit Reservierungen)
- [x] **Frontend-Seiten**: Login, Register, Dashboard, Wishlist-Editor, Share-View
- [x] **Design Redesign (ADR-005)**: Warm-minimalistisch mit Storytelling-Flow
- [x] **Fonts**: Playfair Display (Serif) + DM Sans (Sans) Font-Pairing
- [x] **Button**: Custom :before-Layer-Trick (Pomegranate-Stil), accent-Variant
- [x] **Scroll-Animationen**: useInView Hook + AnimateOnScroll Komponente
- [x] **Landing Page**: Storytelling-Flow (Problem → Lösung → Features → CTA)
- [x] **Alle Seiten redesigned**: Auth, Dashboard, Editor, Share-View
- [x] **Themes**: Birthday, Christmas (aktiv), Wedding, Baby (ausgeblendet) (Hex-Farben, data-theme)
- [x] **Legal Pages**: Impressum & Datenschutz (mit TODO-Platzhaltern für persönliche Daten)
- [x] **Deployment**: Dockerfile (multi-stage, standalone), docker-compose, Drizzle Migrations, Health Check
- [x] **Google Auth Button**: Login + Register Seiten mit Google OAuth Button
- [x] **MainNav Komponente**: Auth-State-Aware Nav (Login/Register vs. Meine Wunschlisten/Logout)
- [x] **HeroCta Komponente**: Dynamischer CTA basierend auf Auth-State
- [x] **Playwright Tests**: 22 API-Tests + 13 E2E-Tests (Auth, Wishlists, Products, Share, Reservations, Landing, Wishlist-Flow)
- [x] **TanStack Query**: QueryClientProvider + Share-Page Polling (10s refetch + refetchOnWindowFocus)
- [x] **ProductImage**: Wiederverwendbare Komponente mit onError Fallback (Gift-Icon)
- [x] **Immersive Themes**: CSS-Animationen (Schneeflocken, Konfetti, Shimmer, Wolken) + prefers-reduced-motion
- [x] **ThemeCard**: Vorschaukarten mit echtem Theme-Hintergrund + Mini-Animationen
- [x] **Theme-Picker im Editor**: Theme nach Erstellung änderbar (PATCH API)
- [x] **Dashboard Theme-Cards**: Wunschlisten-Cards zeigen Theme-Hintergrund + Animation
- [x] **Amazon Affiliate**: ASIN-Extraktion, clean URLs, Tag `wunschkiste-21`
- [x] **Affiliate SEO**: `rel="sponsored nofollow"` auf Affiliate-Links
- [x] **Locale-aware Navigation**: next-intl `Link`/`useRouter` in allen Seiten (kein Locale-Verlust mehr)
- [x] **Locale Detection aus**: `localeDetection: false` – kein Browser-basierter Redirect auf `/en` (SEO: Googlebot indexiert DE-Version)
- [x] **Logo & Branding**: WunschkisteLogo-Komponente (inline SVG) + Wordmark in allen Headern
- [x] **Schwebender Stern**: CSS-Animation `logo-star-float` (2s, -50px), `transform-box: fill-box`
- [x] **Brand-Farben im Logo**: Geschenkbox `#0042AF`, Stern/Strahlen `#112334`, Wordmark `#0042AF`
- [x] **Favicon**: Stern-SVG als Favicon (alle Größen: ico, svg, png, apple-touch, webmanifest)
- [x] **Themes reduziert**: Wedding & Baby aus UI entfernt (nur Standard, Geburtstag, Weihnachten)
- [x] **Produkt-Edit**: Edit-Dialog im Wishlist-Editor (Titel + Preis bearbeitbar via PATCH API)
- [x] **Dashboard Fix**: Theme-Animationen von Dashboard-Cards entfernt

## Tech-Stack (installiert)

- Node.js 22.22.0 / pnpm 10.27.0 (via Volta)
- Next.js 16.1.6 (App Router + Turbopack)
- React 19.2.3
- Tailwind CSS 4.1.18 + shadcn/ui (new-york style)
- Drizzle ORM 0.45.1 + postgres.js
- better-auth 1.4.18
- next-intl 4.8.2
- TanStack Query 5.90.20
- Cheerio 1.2.0, nanoid 5.1.6, zod 4.3.6
- Lucide Icons

## Projektstruktur

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing Page (Hero + Features + CTA)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx         # Wishlist-Übersicht
│   │   ├── wishlist/
│   │   │   ├── new/page.tsx           # Erstellen mit Theme-Picker
│   │   │   └── [id]/page.tsx          # Editor mit Scraper-Dialog
│   │   └── share/[token]/page.tsx     # Öffentliche Ansicht mit Reservierung
│   └── api/
│       ├── auth/[...all]/             # better-auth Handler
│       ├── wishlists/                 # Wishlists CRUD
│       │   └── [id]/products/         # Products CRUD
│       ├── share/[token]/             # Public share API
│       │   └── reserve/               # Reservations
│       └── scrape/                    # URL Scraping
├── components/
│   ├── animate-on-scroll.tsx          # Scroll-Animation Wrapper
│   ├── product-image.tsx              # Bild mit Broken-Image-Fallback
│   ├── theme-card.tsx                 # Theme-Vorschaukarte mit Mini-Animation
│   ├── wunschkiste-logo.tsx           # Inline SVG Logo mit schwebendem Stern
│   ├── providers/
│   │   └── query-provider.tsx         # TanStack Query Provider
│   └── ui/                            # shadcn Components
├── hooks/
│   └── use-in-view.ts                 # Intersection Observer Hook
├── lib/
│   ├── auth/                          # better-auth Config (UUID-Mode)
│   ├── db/                            # Drizzle Schema & Connection
│   ├── affiliate/                     # Amazon Tag Integration
│   └── scraper/                       # Cheerio + OpenGraph + JSON-LD
├── i18n/                              # next-intl Config
└── middleware.ts                      # Locale Routing
messages/
├── de.json
└── en.json
```

## Nächste Schritte

### Bug Fixes
- [x] Themes wirken nicht – CSS-Variablen in Wishlist-Komponenten nutzen (data-theme auf Editor-Seite)
- [x] Google Auth Button fehlt im Login/Register UI (Google-Button mit Divider hinzugefügt)
- [x] Nav Auth-State – MainNav-Komponente mit dynamischem Auth-State + HeroCta-Komponente

### Tests
- [x] Playwright E2E Setup + User-Flow Tests (Register, Login, Wishlist CRUD, Share, Reservierung)
- [x] API-Tests für alle Routes (Wishlists, Products, Scraper, Share, Auth)
- 35 Tests gesamt: 22 API + 13 E2E, alle grün

### Mobile-Testing & Live-Updates (Plan: `~/.claude/plans/serene-greeting-moon.md`)
- [x] TanStack Query installieren + QueryClientProvider einrichten
- [x] Share-Page: `useQuery` mit `refetchInterval: 10s` + `refetchOnWindowFocus: true`
- [x] Broken Images Fix: `ProductImage`-Komponente mit Fallback (Gift-Icon)
- [x] Immersive Themes: Christmas (Schneeflocken), Birthday (Konfetti), Wedding (Shimmer), Baby (Wolken)

### AWIN Integration (nach Account-Freischaltung)
- [ ] Programmes API abrufen → Domain-Mapping aufbauen
- [ ] Link Builder API integrieren → Affiliate-Links für AWIN-Shops generieren

### Sonstiges
- [ ] Persönliche Daten eintragen in messages/*.json (TODO-Platzhalter ersetzen)
- [x] Google OAuth Credentials einrichten (Cloud Console)
- [ ] Dokploy einrichten - App auf Hetzner deployen

## Lokale Entwicklung

PostgreSQL läuft via Docker:
```bash
# Container starten (falls nicht läuft)
docker start wunschkiste-postgres

# Oder neu erstellen
docker run -d --name wunschkiste-postgres \
  -e POSTGRES_USER=wunschkiste \
  -e POSTGRES_PASSWORD=wunschkiste \
  -e POSTGRES_DB=wunschkiste \
  -p 5433:5432 postgres:16-alpine
```

### Cloudflare Tunnel (Mobile-Testing)

Tunnel `wunschkiste` → `wunschkiste.schwenzfeuer.com` → `localhost:3000`
Config: `~/.cloudflared/config.yml`, Tunnel-ID: `34bc76f6-abac-43a2-a2a0-5c6ff2327806`

```bash
# Terminal 1: Tunnel starten
cloudflared tunnel run wunschkiste

# Terminal 2: Dev-Server mit Tunnel-URL (BETTER_AUTH_URL Override!)
BETTER_AUTH_URL=https://wunschkiste.schwenzfeuer.com pnpm dev
```

Wichtig: `BETTER_AUTH_URL` muss auf die Tunnel-URL gesetzt werden, sonst funktioniert Login nicht.

## Offene Punkte

- [x] Finaler Projektname: Wunschkiste (Domain: wunschkiste.xyz)
- [x] Amazon Associates Account (Tag: `wunschkiste-21`, in .env.local gesetzt)
- [ ] AWIN Publisher Account (beantragt, warte auf Freischaltung)
- [x] Google OAuth Credentials
- [ ] Facebook App Credentials
- [x] PostgreSQL für lokale Entwicklung

## Letzte Sessions

### 07.02.2026 - Branding, Logo & Produkt-Edit
- Logo eingebaut: WunschkisteLogo-Komponente (inline SVG) + Wordmark-SVG in allen Headern
- Schwebender Stern: CSS-Animation `logo-star-float` (2s, -50px, `transform-box: fill-box`)
- Brand-Farben: Geschenkbox `#0042AF`, Stern/Strahlen dunkel `#112334`, Wordmark blau
- Stern-Favicon: Separate SVG erstellt, alle Favicon-Größen über RealFaviconGenerator generiert
- Themes reduziert: Wedding & Baby aus UI entfernt (DB/CSS bleibt für Rückwärtskompatibilität)
- Dashboard-Fix: Theme-Animationen (Konfetti etc.) von Dashboard-Cards entfernt
- Produkt-Edit: Edit-Dialog mit Titel + Preis im Wishlist-Editor (nutzt bestehende PATCH API)
- Projektname final: Wunschkiste (Domain: wunschkiste.xyz), Google OAuth als erledigt markiert

### 07.02.2026 - Locale Detection Fix
- `localeDetection: false` in next-intl routing (Browser-Sprache führte zu ungewolltem `/en` Redirect)
- Besser für SEO: Googlebot crawlt mit `en-US`, würde sonst DE-Seiten nicht indexieren

### 06.02.2026 - Polling, Themes, Affiliate, i18n-Fix
- TanStack Query 5.90: Share-Page pollt alle 10s + refetchOnWindowFocus
- ProductImage-Komponente: onError → Gift-Icon Fallback
- Immersive CSS Theme-Animationen: Schneeflocken, Konfetti, Shimmer, Wolken
- ThemeCard-Komponente: Vorschaukarten mit echtem Hintergrund + Mini-Animation
- Theme-Picker im Wishlist-Editor: Theme nach Erstellung änderbar
- Dashboard-Cards: Theme-Hintergrund + Mini-Animationen pro Wunschliste
- Amazon Affiliate: ASIN aus URL extrahieren, clean URL bauen, Tag `wunschkiste-21`
- `rel="sponsored nofollow"` auf Affiliate-Links (SEO/Legal)
- Locale-Fix: `next/link` → `@/i18n/routing` Link in allen 11 Dateien (kein Locale-Verlust)
- AWIN-Recherche: Programmes API + Link Builder API dokumentiert
- prefers-reduced-motion für alle Animationen
- Build OK, alle 35 Tests grün

### 06.02.2026 - Bug Fixes & Test Suite
- 3 Bug Fixes: Theme im Editor (data-theme), Google Auth Button, Nav Auth-State
- MainNav Komponente: Dynamische Nav mit Auth-State (Login/Register vs. Meine Wunschlisten/Logout)
- HeroCta Komponente: CTA passt sich Auth-State an
- Playwright installiert + konfiguriert
- 22 API-Tests: Health, Auth (Register, Login, Fehler), Wishlists (CRUD, Auth-Guard, Cross-User), Products (CRUD), Share (Token, Reservierung, Doppel-Reservierung)
- 13 E2E-Tests: Landing Page, Auth Flow (Register, Login, Google Button, Navigation), Wishlist Flow (Erstellen, Dashboard, Theme)
- Turbopack Cache Bug: `.next` Verzeichnis löschen wenn SST-Dateien korrupt

### 06.02.2026 - Design Redesign (ADR-005)
- Komplettes Redesign aller Frontend-Seiten nach ADR-005
- Neue Farbpalette: Warmes Creme (#FEF1D0) + Tiefes Blau (#0042AF) + Soft Tangerine (#FF8C42)
- Font-Pairing: Playfair Display (Serif-Headlines) + DM Sans (Body)
- Custom Button mit :before-Layer-Trick für Tiefe ohne Schatten
- useInView Hook + AnimateOnScroll Komponente für Scroll-Animationen
- Landing Page: Storytelling-Flow (Problem → Lösung → 3 Features → CTA)
- Auth-Seiten: Minimalistisch ohne Card-Wrapper
- Dashboard: Listenansicht statt Card-Grid, hover-Actions
- Wishlist-Editor: Schmaler Container, Listenansicht für Produkte
- Share-View: Zentrierter editorial Stil
- Anlass-Themes aktualisiert (Hex-Farben statt OKLCH)
- i18n Messages erweitert (nav, landing Sections)
- Build erfolgreich, keine Fehler

### 05.02.2026 - Legal Pages & Deployment
- Impressum & Datenschutz Seiten erstellt (DE + EN, i18n-fähig)
- DSGVO-konforme Datenschutzerklärung (Cookies, Account, Wunschlisten, Scraping, Affiliate, Hosting, Rechte)
- Dockerfile (multi-stage, standalone output, 251MB Image)
- docker-compose.production.yml (App + PostgreSQL)
- Drizzle Migrations generiert + migrate.mjs Script
- Health Check Endpoint (/api/health)
- start.sh: Migrationen vor App-Start

## Notizen für nächste Session

- `drizzle-kit push` braucht explizite `DATABASE_URL` env var (wird nicht aus .env.local gelesen)
- better-auth braucht `advanced.database.generateId: "uuid"` wenn Schema UUID-Spalten hat
- better-auth `accounts`-Tabelle braucht `password`-Feld für Email/Password Auth
- Port 5432 war schon belegt → Docker auf 5433
- Amazon blockiert Scraper für Preis/Bild, aber Titel geht. Otto funktioniert komplett.
- `<img>` Warnings im Lint sind OK - externe Shop-Bilder können nicht über `next/image` laufen
- Turbopack Cache kann korrupt werden → `.next` löschen und neu starten
- better-auth API braucht `origin` Header für CSRF-Schutz → in Playwright global setzen
- Playwright: `locale: "de-DE"` in Config setzen damit next-intl die richtige Sprache erkennt
- Playwright: Für Cross-User-Tests separate `request.newContext()` nutzen (Cookie-Jar ist shared)
