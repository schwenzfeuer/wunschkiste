# Current State

> Letzte Aktualisierung: 08.02.2026 (Nachmittag)

## Status

**Phase:** v1.0 Feature-complete, i18n-Migration abgeschlossen. 67 Tests gruen, Build gruen.

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
- [x] **Playwright Tests**: 38 API-Tests + 13 E2E-Tests (Auth, Wishlists, Products, Share, Reserve/Buy, Visibility, Landing, Wishlist-Flow)
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
- [x] **Christmas SVG-Dekorationen**: ChristmasDecorations-Komponente (Schneeflocken, Sterne, Tannen als Inline-SVGs)
- [x] **Immersives Dark Christmas-Theme**: Dunkelgrün (#14532D) + Dunkelrot (#802429) Cards + Gold (#D4A84B) Schrift
- [x] **Geschenk-SVG Integration**: wunschkiste-geschenk.svg als Deko-Element (groß, angeschnitten unten rechts)
- [x] **Einheitlicher Header**: MainNav auf allen Seiten (Dashboard, Wishlist, Share) mit border-b
- [x] **Dashboard Header dedupliziert**: Eigener Header durch MainNav ersetzt
- [x] **Theme-Auswahl MVP-deaktiviert**: ThemeCards auskommentiert, Code bleibt erhalten
- [x] **v1.0 Schema-Upgrade**: ownerVisibility + reservationStatus Enums, eventDate, reservations mit Auth
- [x] **Reserve/Buy System**: Auth-Pflicht, Owner-Block, status reserved/bought, DELETE/PATCH
- [x] **Share-Seite v2**: Kaufen-Dialog, Auth-Status, Button-Logik, Owner-Visibility (full/partial/surprise)
- [x] **Calendar/Datepicker**: Event-Datum + Visibility in Wishlist-Editor und New-Page
- [x] **Avatar-Upload**: R2 Storage Client, Upload-API, UserAvatar mit Initialen-Fallback
- [x] **Passwort vergessen**: Resend Email-Service, Forgot/Reset-Password Seiten
- [x] **Toasts**: Sonner/Toaster, QueryProvider mit globalem onError, Error/404 Pages
- [x] **Rate-Limiting**: ArcJet auf /api/scrape und /api/share/[token]/reserve (DRY_RUN in dev)
- [x] **51 Tests grün**: 38 API (inkl. 20 neue Share-Tests) + 13 E2E
- [x] **Calendar Fix**: react-day-picker v9 Nav-Buttons korrekt oben positioniert
- [x] **ConfirmationDialog**: shadcn AlertDialog statt `window.confirm()` für Löschen-Aktionen
- [x] **Preisformatierung**: `formatPrice()` zeigt "29,99 €" statt "29.99 EUR", Komma-Eingabe
- [x] **Lokalisierte Routen**: next-intl `pathnames` — `/meine-wunschkisten`, `/wunschkiste/neu`, `/anmelden`, `/registrieren`, `/teilen/[token]`
- [x] **Dashboard UX**: Items komplett klickbar, hover border primary, "Neue Kiste" nur bei bestehenden Listen
- [x] **DropdownMenu Fix**: `modal={false}` verhindert Scrollbar-Layout-Shift
- [x] **New-Page**: MainNav Header, Theme-Auswahl für MVP entfernt
- [x] **Button destructive**: 3D-Effekt wie primary/accent, in Rot
- [x] **Auto-Save geteilter Wunschkisten**: Neue `saved_wishlists`-Tabelle, Share-Besuch speichert Wishlist automatisch im Dashboard
- [x] **Shared-Endpoint umgebaut**: Query basiert auf `saved_wishlists` statt `reservations` — Wishlists ohne Reservierungen erscheinen mit 0/0 Counts
- [x] **Owner Visibility im Editor**: Products-API liefert Reservierungsdaten basierend auf ownerVisibility (full/partial/surprise)
- [x] **Dashboard Reservierungs-Counts**: Wishlists-API liefert totalCount + claimedCount, Anzeige respektiert Visibility
- [x] **Surprise-Modus**: Keine Anzahlen, nur "Es wurden Wuensche vergeben", Confirmation Dialog beim Wechsel
- [x] **Visibility Live-Update**: Products werden nach Modus-Wechsel sofort neu geladen
- [x] **Teilnehmer-Feature**: /api/wishlists/[id]/participants, ueberlappende Avatare + Modal im Editor
- [x] **Dashboard Cards**: bg-card + sanfterer Hover (hover:border-primary/20)
- [x] **CLAUDE.md**: Projekt-spezifische Verhaltensregeln (keine Emojis, keine Annahmen, Arbeitsweise)
- [x] **ADR-007**: Hosting-Entscheidung Cloudflare Pages + Neon statt Hetzner + Dokploy
- [x] **Email-Reminders**: Cron-Endpoint `/api/reminders/send` mit CRON_API_KEY Bearer-Auth
- [x] **sent_reminders Tabelle**: Duplikat-Schutz via UNIQUE(userId, wishlistId, reminderType)
- [x] **Reminder-Logik**: 7-Tage + 3-Tage Erinnerungen, Owner/Kaeufer-Skip, 24h-Cooldown fuer frische Teilnehmer
- [x] **Gebrandetes Email-Template**: Logo + Wortmarke Header, Creme-Hintergrund, 3D-Button, Google Fonts (DM Sans + Playfair Display)
- [x] **Password-Reset-Email redesigned**: Gleiches Template-Layout wie Reminder-Emails
- [x] **67 Tests gruen**: 54 API (inkl. 5 neue Reminder-Tests) + 13 E2E
- [x] **i18n-Migration komplett**: Alle Seiten und Komponenten nutzen `useTranslations()` -- keine hardcoded deutschen Strings mehr
- [x] **de.json korrigiert**: Umlaute, scharfes S, Paragraphenzeichen, Apostrophe korrekt

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
- @aws-sdk/client-s3 (Cloudflare R2)
- resend (Email)
- sonner (Toasts via shadcn)
- @arcjet/next (Rate-Limiting + Bot-Protection)
- react-day-picker + date-fns (Calendar/Datepicker)

## Projektstruktur

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing Page (Hero + Features + CTA)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
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
│       ├── reminders/send/            # Cron: Email-Erinnerungen
│       ├── scrape/                    # URL Scraping
│       └── profile/avatar/            # Avatar Upload/Delete (R2)
├── components/
│   ├── animate-on-scroll.tsx          # Scroll-Animation Wrapper
│   ├── confirmation-dialog.tsx        # Wiederverwendbarer Bestätigungsdialog
│   ├── product-image.tsx              # Bild mit Broken-Image-Fallback
│   ├── theme-card.tsx                 # Theme-Vorschaukarte mit Mini-Animation
│   ├── wunschkiste-logo.tsx           # Inline SVG Logo mit schwebendem Stern
│   ├── themes/
│   │   └── christmas-decorations.tsx  # SVG-Dekorationen (Schneeflocken, Sterne, Tannen, Geschenk)
│   ├── providers/
│   │   └── query-provider.tsx         # TanStack Query Provider
│   └── ui/                            # shadcn Components
├── hooks/
│   └── use-in-view.ts                 # Intersection Observer Hook
├── lib/
│   ├── auth/                          # better-auth Config (UUID-Mode)
│   ├── db/                            # Drizzle Schema & Connection
│   ├── affiliate/                     # Amazon Tag Integration
│   ├── scraper/                       # Cheerio + OpenGraph + JSON-LD
│   ├── email/                         # Resend Email-Service
│   ├── storage/                       # Cloudflare R2 Client
│   └── security/                      # ArcJet Rate-Limiting
├── lib/
│   └── format.ts                      # Preisformatierung (formatPrice, normalizePrice)
├── i18n/                              # next-intl Config + lokalisierte Pathnames
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
- [x] Share-Tests erweitert: Reserve Auth, DELETE, PATCH, Owner-Visibility, EventDate CRUD
- 67 Tests gesamt: 54 API + 13 E2E, alle gruen

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

- [x] Finaler Projektname: Wunschkiste (Domain: wunschkiste.app)
- [x] Amazon Associates Account (Tag: `wunschkiste-21`, in .env.local gesetzt)
- [ ] AWIN Publisher Account (beantragt, warte auf Freischaltung)
- [x] Google OAuth Credentials
- [ ] Facebook App Credentials
- [x] PostgreSQL für lokale Entwicklung

## Letzte Sessions

### 08.02.2026 - i18n-Migration abgeschlossen
- **de.json korrigiert**: Alle Umlaute (ue/ae/oe), scharfes S (ss), Paragraphenzeichen (SS/SSSS), fehlende Apostrophe repariert
- **Translation-Files erweitert**: de.json + en.json mit allen Keys (auth, forgotPassword, resetPassword, dashboard, newWishlist, editor, visibility, share, nav)
- **Alle Seiten migriert**: Login, Register, Forgot-Password, Reset-Password, Dashboard, Wishlist New, Wishlist Editor, Share-Page
- **Alle Komponenten migriert**: main-nav (komplett), auth-dialog (komplett), confirmation-dialog (Props von Callern)
- **Landing Page war bereits migriert** in vorheriger Session
- Build gruen, 67 Tests gruen (54 API + 13 E2E)

### 08.02.2026 - Email-Erinnerungen fuer Teilnehmer
- **sent_reminders Tabelle**: reminderTypeEnum ("7_days", "3_days") + UNIQUE-Constraint (userId, wishlistId, reminderType)
- **sendReminderEmail()**: Gebrandetes Template mit Logo + Wortmarke, Creme-Hintergrund, 3D-Button (orange), Google Fonts
- **Password-Reset-Email**: Auf gleiches Layout umgestellt (emailLayout + ctaButton Helpers)
- **POST /api/reminders/send**: CRON_API_KEY Bearer-Auth, 7/3-Tage-Fenster mit 12h Toleranz
- **Teilnehmer-Filter**: Owner ausgeschlossen, Kaeufer (status "bought") uebersprungen, 24h-Cooldown fuer frische Teilnehmer
- **Idempotenz**: INSERT ON CONFLICT DO NOTHING auf sent_reminders, erst DB-Record dann Email
- **5 neue Tests**: Auth (401 ohne/falscher Key, 200 mit Key), Fresh-Participant-Skip, Buyer/Owner-Skip
- Build gruen, 67 Tests gruen (54 API + 13 E2E)

### 08.02.2026 - Owner Visibility, Teilnehmer & Hosting-Entscheidung
- **Visibility-Bug gefixt**: Products-API liefert jetzt Reservierungsdaten basierend auf ownerVisibility
- **Surprise-Modus**: Zeigt keine Anzahlen, nur "Es wurden Wuensche vergeben", Confirmation Dialog beim Verlassen
- **Visibility Live-Update**: Products werden nach Modus-Wechsel sofort neu geladen (kein Reload noetig)
- **Dashboard Counts**: Wishlists-API liefert totalCount + claimedCount, respektiert Surprise-Modus
- **Teilnehmer-Feature**: Neue /api/wishlists/[id]/participants Route, ueberlappende Avatare + Modal im Editor
- **Dashboard Cards**: bg-card + sanfterer Hover (konsistent mit Wunsch-Items)
- **CLAUDE.md**: Projekt-spezifische Verhaltensregeln erstellt
- **ADR-007**: Hosting-Entscheidung Cloudflare Pages + Neon (statt Hetzner + Dokploy)
- Build gruen, 44 API-Tests gruen

### 08.02.2026 - Auto-Save geteilter Wunschkisten
- **Neue Tabelle `saved_wishlists`**: user_id + wishlist_id mit UNIQUE-Constraint, CASCADE-Delete
- **Auto-Save in Share-Route**: Eingeloggte Nicht-Owner → INSERT ON CONFLICT DO NOTHING
- **Shared-Endpoint umgebaut**: `saved_wishlists` als Basis statt `reservations`, LEFT JOIN für 0/0 Counts
- **Migration**: `0002_saved_wishlists.sql` + `db:push`
- **6 neue Tests**: Auto-Save, keine Duplikate, Owner-Besuch, Unreserve behält Wishlist
- 57 Tests grün (44 API + 13 E2E), Build grün

### 08.02.2026 - UI/UX-Fixes, Preisformatierung & lokalisierte Routen
- **Calendar Fix**: react-day-picker v9 Nav-Pfeile oben positioniert (relative Container + absolute nav)
- **Button-Varianten**: "Wunsch hinzufügen" & "Neue Kiste" accent-Stil, destructive mit 3D-Effekt
- **ConfirmationDialog**: shadcn AlertDialog statt `window.confirm()` (Dashboard + Editor)
- **Dashboard UX**: Items komplett klickbar als Link, hover border primary, "Neue Kiste" nur bei Listen
- **DropdownMenu**: `modal={false}` verhindert Scrollbar-Layout-Shift beim Profilmenü
- **New-Page**: MainNav Header hinzugefügt, Theme-Auswahl für MVP entfernt
- **Preisformatierung**: `formatPrice()` → "29,99 €" statt "29.99 EUR", Komma-Eingabe im Input
- **Lokalisierte Routen**: next-intl pathnames (`/meine-wunschkisten`, `/wunschkiste/neu`, `/anmelden`, `/registrieren`, `/teilen/[token]`, `/passwort-vergessen`)
- **Tests angepasst**: E2E-Tests auf lokalisierte URLs umgestellt
- Build grün, 51 Tests grün

### 07.02.2026 - AP 9: Tests, Build-Fixes, .env.example
- **Build-Fixes**: ArcJet `protect()` braucht `{ requested: 1 }`, `forgetPassword` → `requestPasswordReset`, Resend lazy init, Suspense-Boundaries für `useSearchParams()`
- **Share-Tests komplett neu**: 20 Tests (Reserve Auth 401/403, Buy, DELETE eigene/fremde, PATCH upgrade, Owner-Visibility full/partial/surprise, EventDate CRUD)
- **ArcJet DRY_RUN**: In Development `DRY_RUN` statt `LIVE` (verhindert Rate-Limiting in Tests)
- **.env.example**: RESEND_API_KEY, ARCJET_KEY, R2_* ergänzt
- **Cloudflare R2 Bucket**: `wunschkiste-avatars` eingerichtet (User API Token für Dev)
- **DB-Migration**: `0001_v1_schema_upgrade.sql` manuell ausgeführt (drizzle-kit push war interaktiv)
- **Playwright Timeout**: 30s → 60s (Multi-User-Tests brauchen mehr Zeit bei paralleler Ausführung)
- 51 Tests grün (38 API + 13 E2E), Build grün

## Notizen fuer naechste Session

- **i18n komplett** -- App ist bereit fuer manuelles Testing und dann Deployment
- Email-Reminders: Endpoint bereit fuer Cron-Trigger (`curl -X POST -H "Authorization: Bearer $CRON_API_KEY"`)
- Resend Domain `wunschkiste.app` nicht verifiziert -- muss bei Resend verifiziert werden (DNS TXT Records)
- Drizzle Migrations: `db:generate` funktioniert nicht korrekt (fehlender 0001-Snapshot), daher Migrations manuell + `db:push`
- en.json: Englische Uebersetzungen sind Platzhalter (gleiche Keys wie de.json, Inhalte muessen noch uebersetzt werden)
- Naechste Schritte: Manuelles Testing, dann Cloudflare Pages Deployment
- Cloudflare R2: User API Token fuer Dev aktiv, Account API Token fuer Production noch erstellen
