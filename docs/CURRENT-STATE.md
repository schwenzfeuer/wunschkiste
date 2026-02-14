# Current State

> Letzte Aktualisierung: 14.02.2026 (Abend)

## Status

**Phase:** v1.0 Live auf Cloudflare Workers + Neon PostgreSQL. Domain wunschkiste.app aktiv. 72 Tests gruen, Build gruen. Impressum/Datenschutz vollstaendig. Hidden-Flag fuer Wuensche live.

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
- [x] **PostgreSQL** via Neon (Frankfurt Region, neon-http Driver)
- [x] **Auth** (Email/Password + Google OAuth funktioniert)
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
- [x] **Legal Pages**: Impressum & Datenschutz (vollstaendig mit Kontaktdaten, ArcJet, Cloudflare, Neon)
- [x] **Deployment**: Cloudflare Workers via @opennextjs/cloudflare + wrangler
- [x] **Google Auth Button**: Login + Register Seiten mit Google OAuth Button
- [x] **MainNav Komponente**: Auth-State-Aware Nav (Login/Register vs. Meine Wunschlisten/Logout)
- [x] **HeroCta Komponente**: Dynamischer CTA basierend auf Auth-State
- [x] **Playwright Tests**: 38 API-Tests + 13 E2E-Tests (Auth, Wishlists, Products, Share, Reserve/Buy, Visibility, Landing, Wishlist-Flow)
- [x] **TanStack Query**: QueryClientProvider + Share-Page refetchOnWindowFocus
- [x] **ProductImage**: Wiederverwendbare Komponente mit onError Fallback (Gift-Icon)
- [x] **Immersive Themes**: CSS-Animationen (Schneeflocken, Konfetti, Shimmer, Wolken) + prefers-reduced-motion
- [x] **ThemeCard**: Vorschaukarten mit echtem Theme-Hintergrund + Mini-Animationen
- [x] **Theme-Picker im Editor**: Theme nach Erstellung änderbar (PATCH API)
- [x] **Dashboard Theme-Cards**: Wunschlisten-Cards zeigen Theme-Hintergrund + Animation
- [x] **Amazon Affiliate**: ASIN-Extraktion, clean URLs, Tag `wunschkiste-21`
- [x] **AWIN Affiliate**: Domain-Mapping (73 Shops), Deep-Links via cread.php, Publisher-ID 2771080
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
- [x] **Christmas SVG-Dekorationen**: ChristmasDecorations-Komponente (Schneeflocken, Sterne, Tannen, Geschenk)
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
- [x] **Rate-Limiting**: ArcJet auf /api/scrape, /api/share/[token]/reserve und /api/auth (DRY_RUN in dev)
- [x] **51 Tests gruen**: 38 API (inkl. 20 neue Share-Tests) + 13 E2E
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
- [x] **Mobile-First Responsive Fix**: Nav, Dashboard, Editor, Landing, Auth-Seiten, Share-Seite
- [x] **Nav Mobile**: Logo-Icon hidden auf Mobile, "Meine Wunschkisten" ins Dropdown verschoben
- [x] **Responsive Layouts**: flex-col/sm:flex-row fuer Dashboard-Header, Cards, Editor-Buttons
- [x] **Mobile Padding**: px-4/pt-28 auf Mobile, px-6/pt-36 ab sm Breakpoint
- [x] **Leere Wunschkiste nicht teilbar**: Teilen-Button disabled + Toast wenn 0 Produkte
- [x] **Build-Fix**: Toter `setClaimMessage`-Code aus Share-Seite entfernt
- [x] **Affiliate-Kennzeichnung**: Heart-Icon auf Kauf-Buttons bei Affiliate-Links (statt ShoppingBag)
- [x] **Footer konsolidiert**: Doppelter Footer auf Share-Page entfernt, nur globaler SiteFooter mit Heart + Disclosure-Text
- [x] **Kauf-Dialog verschlankt**: Ungenutztes Nachrichten-Feld entfernt (DB-Spalte bleibt fuer spaeter)
- [x] **Badge-Farben**: Reserviert/Gekauft nutzen Theme-Accent-Farbe (Orange) statt hardcoded Gruen/Grau
- [x] **Badges differenziert**: Reserviert = Outline + Bookmark-Icon, Gekauft = Filled + Check-Icon, Name neben Badge
- [x] **Produkt-Sortierung**: Share-Seite sortiert verfuegbar > reserviert > gekauft
- [x] **Konsistente Produkt-Cards**: Editor + Share-Seite identisch (size-16, truncate, p-3/sm:p-4)
- [x] **Mobile Context-Menu**: DropdownMenu statt Icon-Buttons im Editor auf Mobile
- [x] **Dashboard Teilnehmer**: Wishlists-API liefert Participants, xs-Avatare neben Titel
- [x] **Dashboard Eye-Icon**: Statt Pencil-Icon auf Wunschlisten-Cards
- [x] **UserAvatar xs**: Neue Groesse size-5 (20px) fuer kompakte Darstellung
- [x] **ThemeToggle Hydration-Fix**: mounted-Check verhindert Server/Client-Mismatch
- [x] **Smooth Scrolling**: `scroll-behavior: smooth` auf html
- [x] **Desktop 125% Zoom**: `font-size: 125%` ab lg-Breakpoint (1024px)
- [x] **Landing: Logo auf Mobile**: WunschkisteLogo ueber Hero-Text (sm:hidden)
- [x] **Landing: Theme-Section entfernt**: Schlankere Startseite
- [x] **AuthDialog**: "Willkommen" als Titel statt Login/Registrieren
- [x] **Kalender**: Vergangene Daten disabled, "Datum entfernen" als dezenter Text-Link
- [x] **robots.txt**: Crawler erlaubt, Auth/Dashboard/API blockiert, Sitemap-Verweis
- [x] **sitemap.xml**: Statische Seiten (/, /impressum, /datenschutz)
- [x] **OG-Tags + Twitter Cards**: Root Layout mit metadataBase, openGraph, twitter
- [x] **Title-Template**: `%s - Wunschkiste` fuer alle Unterseiten
- [x] **Statisches OG-Image**: 1200x630, Wunschkiste-Branding auf Creme-Hintergrund
- [x] **Dynamisches OG-Image (Share)**: Wishlist-Titel, Owner-Name, Produktanzahl
- [x] **Seitenspezifische Metadata**: Alle 11 Seiten mit eigenem Title + robots (noindex fuer geschuetzte Seiten)
- [x] **JSON-LD**: WebSite + Organization Schema auf Landing Page
- [x] **Share-Seite Server/Client-Split**: page.tsx (Server) + share-page-content.tsx (Client)
- [x] **Share-Seite SSR**: Server fetcht volle Daten inkl. Auth, uebergibt als initialData an react-query
- [x] **Alle Client-Pages refactored**: Auth, Dashboard, Wishlist-Editor mit Server-Wrapper fuer Metadata
- [x] **Cloudflare Workers Deployment**: @opennextjs/cloudflare + wrangler, Custom Domain wunschkiste.app
- [x] **Neon PostgreSQL**: neon-http Driver, Frankfurt Region, Schema gepusht
- [x] **Google OAuth Production**: Redirect URI + JavaScript Origin fuer wunschkiste.app
- [x] **Share Auto-Save SSR**: Eingeloggte Nicht-Owner werden beim SSR in saved_wishlists gespeichert
- [x] **Share Auth-Flow**: AuthDialog oeffnet sich automatisch fuer nicht-eingeloggte User mit "An [Titel] teilnehmen"
- [x] **AuthDialog title-Prop**: Kontextbezogene Ueberschrift statt hardcoded "Willkommen"
- [x] **Toast-Styling**: Brandfarben (primary/primary-foreground), Position top-center
- [x] **Dashboard Wishlist-Edit**: PencilLine-Icon + Dialog zum Bearbeiten von Titel/Beschreibung
- [x] **Editor Wishlist-Edit**: Inline-PencilLine am Titel (on hover), klickbare Flaeche oeffnet Dialog
- [x] **Teilnehmer-Button**: Oranger 3D-Button (accent, xs) mit Users-Icon
- [x] **Mobile Badge-Layout**: Badge + "von Name" untereinander auf Mobile (Share + Editor)
- [x] **PencilLine Icon**: Alle Pencil-Icons durch PencilLine ersetzt
- [x] **Wrangler Custom Domain**: routes-Config in wrangler.jsonc damit Deploy Domain nicht entfernt
- [x] **React Query Migration**: Dashboard + Editor auf useQuery/invalidateQueries umgestellt (wie Share-Seite)
- [x] **Auth Rate-Limiting**: ajAuth (5 req/min + Bot-Detection) auf /api/auth POST
- [x] **Datenschutz komplett**: Bot-Schutz (ArcJet), Hosting (Cloudflare + Neon), Kontaktdaten
- [x] **Email-Reminders Cron**: GitHub Actions Workflow (taeglich 09:00 UTC, CRON_API_KEY Secret)
- [x] **Web Share API**: Nativer Share-Dialog auf Mobile (Dashboard + Editor), Clipboard-Fallback auf Desktop
- [x] **Mitverwalter-Rolle (Co-Editor)**: Zwei-Rollen-Modell (participant/editor) in saved_wishlists
- [x] **verifyWishlistAccess Helper**: Zentrale Zugriffspruefung (owner/editor/null), ersetzt duplizierte Ownership-Checks
- [x] **Editor Produkt-Zugriff**: Editoren koennen Produkte verwalten (GET/POST/PATCH/DELETE)
- [x] **Editor Einschraenkungen**: Kein Zugriff auf Wishlist-Settings (PATCH/DELETE), keine Reservierungen (403)
- [x] **Rollen-Management API**: PATCH /api/wishlists/[id]/participants (Owner kann Rollen aendern)
- [x] **Share-Seite Editor-Erkennung**: isEditor-Flag, Reserve/Buy-Buttons ausgeblendet, Edit-Link angezeigt
- [x] **Dashboard Editor-Integration**: Editor-Wishlists verlinken zum Editor, Mitverwalter-Badge
- [x] **72 Tests gruen**: 59 API (inkl. 18 neue Co-Editor-Tests) + 13 E2E
- [x] **Countdown-Badge**: "noch X Tage" / "Morgen" / "Heute" neben Wishlist-Titel (Dashboard + Share-Seite)
- [x] **getCountdownDays**: Hilfsfunktion in format.ts (0-99 Tage oder null)
- [x] **Countdown i18n**: countdown.today/tomorrow/daysLeft Keys (de + en)
- [x] **Lokaler DB-Driver**: Auto-Detection localhost → postgres (TCP), Neon → neon-http (HTTPS)
- [x] **Theme-Emojis entfernt**: Keine Emojis mehr auf Dashboard-Cards
- [x] **Top 1/2/3 Prioritaet**: priority-Spalte in products, PATCH API mit Swap-Logik, Star-Dropdown im Editor (Desktop + Mobile), Badge + Sortierung auf Share-Seite
- [x] **Refetch-Fix**: refetchOnWindowFocus aus Editor-Queries entfernt, 10s-Polling von Share-Seite entfernt (nur refetchOnWindowFocus bleibt)
- [x] **Umlaute korrigiert**: ae/oe/ue durch echte Umlaute in de.json, Email-Templates, SEO-Texten, OG-Image
- [x] **Editor UX**: Card-Klick oeffnet Edit-Dialog, Stern-Button auf Mobile als eigener Button neben Context-Menu, stopPropagation auf Action-Bereiche
- [x] **AWIN Affiliate-Integration**: Domain-zu-AdvertiserID Mapping (73 Shops), Deep-Link-Generierung via cread.php, Publisher-ID konfiguriert
- [x] **Co-Editor Icon**: ShieldCheck durch UserCog ersetzt (Dashboard, Editor, Share-Seite)
- [x] **Mobile Toolbar**: Schwebende Pill-Bar am unteren Bildschirmrand (sm:hidden) mit seitenspezifischen Buttons
- [x] **ProfileMenu**: Aus MainNav extrahiert, wiederverwendbar in Toolbar + Desktop Nav
- [x] **Linkshänder-Modus**: Toggle im ProfileMenu, spiegelt Toolbar-Reihenfolge (localStorage)
- [x] **Dashboard Mobile Tabs**: Meine/Freunde-Toggle via Toolbar, bedingte Anzeige der Sektionen
- [x] **Toolbar Footer-Erkennung**: IntersectionObserver blendet Toolbar aus wenn Footer sichtbar
- [x] **Scroll-Schutz Editor**: Pointer-Distanz-Check (10px) verhindert versehentliche Taps beim Scrollen
- [x] **Toolbar Context-Buttons**: 3D accent Buttons fuer Aktionen (Neue Kiste, Wunsch hinzufügen)
- [x] **Auth-Buttons Mobile hidden**: Login/Register in NavBar auf Mobile ausgeblendet (Toolbar uebernimmt)
- [x] **Wuensche verbergen (hidden flag)**: hidden-Spalte in products, PATCH API, Share-API + SSR filtern hidden, Dashboard-Counts schliessen hidden aus, Editor: opacity-50 + "Verborgen"-Badge + EyeOff/Eye Toggle (Desktop hover + Mobile ContextMenu)
- [x] **Mobile Dropdown Scroll-Fix**: Kontrollierte Dropdowns (open/onOpenChange) mit onClick statt pointerdown -- verhindert ungewolltes Oeffnen beim Scrollen
- [x] **Dashboard Tab-Wechsel Scroll-Reset**: window.scrollTo({top: 0}) beim Wechsel zwischen Meine/Freunde

## Tech-Stack (installiert)

- Node.js 22.22.0 / pnpm 10.27.0 (via Volta)
- Next.js 16.1.6 (App Router + Turbopack)
- React 19.2.3
- Tailwind CSS 4.1.18 + shadcn/ui (new-york style)
- Drizzle ORM 0.45.1 + @neondatabase/serverless (neon-http)
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
- @opennextjs/cloudflare + wrangler (Deployment)

## Projektstruktur

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing Page (Hero + Features + CTA)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx + login-form.tsx
│   │   │   ├── register/page.tsx + register-form.tsx
│   │   │   ├── forgot-password/page.tsx + forgot-password-form.tsx
│   │   │   └── reset-password/page.tsx + reset-password-form.tsx
│   │   ├── dashboard/page.tsx + dashboard-content.tsx
│   │   ├── wishlist/
│   │   │   ├── new/page.tsx + new-wishlist-form.tsx
│   │   │   └── [id]/page.tsx + wishlist-editor.tsx
│   │   └── share/[token]/
│   │       ├── page.tsx               # Server Component (SSR + generateMetadata)
│   │       ├── share-page-content.tsx  # Client Component (Interaktivitaet)
│   │       └── opengraph-image.tsx     # Dynamisches OG-Image
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
│   ├── auth-dialog.tsx                # AuthDialog mit optionalem title-Prop
│   ├── confirmation-dialog.tsx        # Wiederverwendbarer Bestaetigungsdialog
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
│   ├── db/                            # Drizzle Schema & Connection (neon-http)
│   ├── affiliate/                     # Amazon + AWIN Affiliate Links
│   ├── scraper/                       # Cheerio + OpenGraph + JSON-LD
│   ├── email/                         # Resend Email-Service
│   ├── storage/                       # Cloudflare R2 Client
│   ├── security/                      # ArcJet Rate-Limiting
│   └── wishlist-access.ts             # Zentraler Owner/Editor Zugriffs-Check
├── lib/
│   └── format.ts                      # Preisformatierung + Countdown (formatPrice, normalizePrice, getCountdownDays)
├── i18n/                              # next-intl Config + lokalisierte Pathnames
└── middleware.ts                      # Locale Routing
messages/
├── de.json
└── en.json
```

## Naechste Schritte

### Sonstiges
- [ ] Frontend-Validierung (alle Formulare: Login, Register, Passwort-Reset, Wunschkiste erstellen, Wunsch hinzufuegen/bearbeiten)
- [ ] Cloudflare Rate Limiting als Ersatz/Ergaenzung fuer ArcJet evaluieren
- [ ] en.json: Englische Uebersetzungen fertigstellen (aktuell Platzhalter)
- [ ] Facebook OAuth Credentials einrichten

## Lokale Entwicklung

Lokale Entwicklung verbindet sich direkt mit Neon (kein lokaler Docker-PostgreSQL mehr noetig):
```bash
pnpm dev          # Dev-Server (verbindet sich mit Neon DB)
pnpm build        # Build pruefen
pnpm run deploy   # Deploy auf Cloudflare Workers
pnpm run preview  # Lokaler Test mit Wrangler
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
- [x] AWIN Publisher Account (Publisher-ID: 2771080, Programme-Bewerbungen laufen)
- [x] Google OAuth Credentials (Production: wunschkiste.app)
- [ ] Facebook App Credentials
- [x] Neon PostgreSQL (Frankfurt Region, Passwort rotiert 10.02.)
- [x] Cloudflare Workers Deployment (wunschkiste.app)

## Letzte Sessions

### 14.02.2026 (Abend) - Hidden-Flag + Mobile Dropdown Fix
- **Hidden-Flag fuer Wuensche**: hidden boolean in products-Tabelle, PATCH API erlaubt hidden-Toggle
- **Share-API + SSR filtern hidden**: eq(products.hidden, false) in API-Route und Server Component
- **Dashboard-Counts hidden-aware**: totalCount + claimedCount schliessen verborgene Wuensche aus
- **Freunde-Dashboard hidden-aware**: LEFT JOIN filtert hidden Products
- **Editor UI**: Verborgene Karten opacity-50 + "Verborgen"-Badge (EyeOff-Icon), Desktop Eye/EyeOff hover-Button, Mobile ContextMenu "Verbergen"/"Sichtbar machen"
- **Mobile Dropdown Scroll-Fix**: Kontrollierte Dropdowns (open/onOpenChange + onClick) statt Radix pointerdown -- Star + 3-Punkte-Menues oeffnen sich nicht mehr beim Scrollen
- **Dashboard Tab-Wechsel Scroll-Reset**: window.scrollTo({top: 0}) beim Meine/Freunde-Wechsel
- **Mehrere Production-Deploys** auf wunschkiste.app
- **Learning**: Radix DropdownMenu oeffnet auf pointerdown, nicht click -- kontrollierte Dropdowns mit onClick sind der Fix fuer Mobile-Scroll-Probleme

### 14.02.2026 - Mobile Toolbar (Pill-Bar)
- **Mobile Toolbar**: Schwebende Pill-Bar mit seitenspezifischen Buttons (Landing, Dashboard, Editor, Share)
- **ProfileMenu**: Aus MainNav extrahiert mit Linkshänder-Modus Toggle (localStorage)
- **Dashboard Mobile Tabs**: Meine/Freunde-Toggle, Header passt sich aktivem Tab an
- **3D Accent Buttons**: Aktionen (Neue Kiste, Wunsch hinzufügen) als 3D-Buttons
- **Footer-Erkennung**: IntersectionObserver blendet Toolbar aus wenn Footer sichtbar
- **Scroll-Schutz**: Pointer-Distanz-Check verhindert versehentliche Taps beim Scrollen
- **Auth Mobile hidden**: Login/Register-Buttons in NavBar auf Mobile ausgeblendet

### 13.02.2026 - AWIN Affiliate-Integration + Icon-Fix
- **AWIN Advertiser-Analyse**: 2032 Advertiser aus CSV analysiert, 73 relevante Shops fuer Wunschlisten-App identifiziert (Baby/Kinder, Spielzeug, Buecher, Elektronik, Schmuck, Geschenke, Mode)
- **awin-advertisers.ts**: Domain-zu-AdvertiserID Mapping fuer alle empfohlenen Shops (Etsy, Thalia, babymarkt, Schleich, Samsung, Nike, Jochen Schweizer, etc.)
- **affiliate/index.ts erweitert**: findAwinAdvertiserId() mit www-Strip + Subdomain-Matching, buildAwinDeepLink() via cread.php-Format
- **AWIN_PUBLISHER_ID**: 2771080 in .env.local konfiguriert
- **Build-Fix**: Non-null Assertion in scripts/fix-affiliate-links.ts (AMAZON_TAG Typfehler)
- **Co-Editor Icon**: ShieldCheck durch UserCog in Dashboard, Editor, Share-Seite ersetzt

### 12.02.2026 (Abend) - Top-Prioritaet, Refetch-Fix, Umlaute, Editor UX
- **Top 1/2/3 Prioritaet**: priority-Spalte (integer, nullable) in products, PATCH API mit Swap-Logik (ne Import), Star-Dropdown im Editor (Desktop hover + Mobile eigener Button), Badge (accent) + Priority-first Sortierung auf Share-Seite
- **Refetch/Polling Fix**: refetchOnWindowFocus aus allen 3 Editor-Queries entfernt (wishlist, products, participants), 10s-Polling (refetchInterval) von Share-Seite entfernt -- nur noch refetchOnWindowFocus + manuelle Invalidation nach Mutationen
- **Umlaute korrigiert**: ae/oe/ue in de.json (hinzugefuegt, Prioritaet, affiliateDisclosure), Email-Templates (Wuensche, spaet, erhaeltst, Schoen, zuruecksetzen, gueltig), SEO meta-title, OG-Image
- **Editor UX**: Card-Klick oeffnet Edit-Dialog, stopPropagation auf Desktop/Mobile Action-Bereiche
- **Share-Page page.tsx**: priority auch im server-side SELECT ergaenzt (SSR-Typ-Kompatibilitaet)

### 12.02.2026 - Countdown-Badge + Lokaler DB-Driver
- **Countdown-Feature**: getCountdownDays() in format.ts -- berechnet Tage bis eventDate (0-99 oder null)
- **i18n Keys**: countdown.today/tomorrow/daysLeft in de.json + en.json
- **Dashboard**: Countdown-Badge (Accent-Farbe) neben Wishlist-Titel (justify-between), Datum als eigene Zeile darunter
- **Share-Seite**: Countdown-Badge neben formatiertem Datum (oder "Anlass vorbei" Badge bei vergangenem Datum)
- **Freunde-Wunschkisten**: Gleiche Darstellung wie eigene Kisten
- **Theme-Emojis entfernt**: themeEmojis Map und Anzeige aus Dashboard-Cards entfernt
- **Lokaler DB-Driver**: db/index.ts erkennt localhost/127.0.0.1 und nutzt postgres (TCP) statt neon-http (HTTPS)
- **Test-Daten**: User + Dummy-Wishlists mit verschiedenen eventDate-Szenarien fuer lokales Testing

### 11.02.2026 - Mitverwalter-Rolle (Co-Editor)
- **DB-Schema**: savedWishlistRoleEnum ("participant"/"editor"), role-Spalte in saved_wishlists
- **verifyWishlistAccess**: Zentraler Helper ersetzt duplizierte Ownership-Checks in Products/Wishlists API
- **Products API**: Editoren koennen Produkte verwalten (GET/POST/PATCH/DELETE) via verifyWishlistAccess
- **Wishlists API**: GET liefert role-Feld, PATCH/DELETE bleiben owner-only
- **Participants API**: GET liefert role, neuer PATCH-Endpoint fuer Rollen-Management (owner-only)
- **Reserve-Endpoint**: Editoren werden geblockt (403), wie Owner
- **Share API + SSR**: isEditor-Flag in Response, Reserve/Buy-Buttons fuer Editoren ausgeblendet
- **Shared-Wishlists API**: role-Feld in Response fuer Dashboard-Differenzierung
- **Wishlist-Editor UI**: Bedingte Anzeige (Settings/Titel/Teilnehmer nur Owner), Rollen-Toggle im Teilnehmer-Dialog
- **Share-Seite**: Edit-Link + Mitverwalter-Badge fuer Editoren
- **Dashboard**: Editor-Wishlists verlinken zum Editor statt Share-Seite, Mitverwalter-Badge
- **i18n**: Neue Keys fuer Editor-Feature (de.json + en.json)
- **18 neue API-Tests**: co-editor.spec.ts (Rollen-Management, Editor-Zugriff, Einschraenkungen)
- **Bugfix**: Participants-Query nur fuer Owner ausfuehren (404-Fehler fuer Editoren behoben)
- Deployed auf Production (2x: Initial + Bugfix)

### 10.02.2026 - React Query, Auth Rate-Limiting, Legal, Cron, Web Share
- **React Query Migration**: Dashboard (wishlists, sharedWishlists) + Editor (wishlist, products, participants) auf useQuery/invalidateQueries umgestellt
- **Auth Rate-Limiting**: ajAuth (tokenBucket 5/min + detectBot) auf /api/auth POST-Handler gewrappt
- **Datenschutz erweitert**: Bot-Schutz-Sektion (ArcJet, IP-Verarbeitung, Art. 6 Abs. 1 lit. f), Hosting konkretisiert (Cloudflare + Neon)
- **Impressum/Datenschutz**: Alle TODO-Platzhalter durch echte Kontaktdaten ersetzt (DE + EN)
- **Email-Reminders Cron**: GitHub Actions Workflow (.github/workflows/reminders.yml), taeglich 09:00 UTC, CRON_API_KEY Secret
- **Web Share API**: Teilen-Button nutzt navigator.share() auf Mobile (nativer Share-Dialog), Clipboard-Fallback auf Desktop
- **ESLint-Fix**: `as const` statt `as "/dashboard"` in main-nav.tsx


## Notizen fuer naechste Session

- **Hidden-Flag live**: Wuensche verbergen ist implementiert und deployed. DB-Schema muss noch auf Neon gepusht werden (Passwort rotiert, lokal gepusht)
- **App ist LIVE** auf https://wunschkiste.app (Cloudflare Workers + Neon)
- **Deploy-Command**: `pnpm run deploy` (NICHT `pnpm deploy`)
- **Radix Dropdown Pitfall**: pointerdown statt click -- kontrollierte Dropdowns mit onClick verwenden (siehe LEARNINGS.md)
- en.json: Englische Uebersetzungen sind Platzhalter
