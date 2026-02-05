# Current State

> Letzte Aktualisierung: 05.02.2026

## Status

**Phase:** MVP funktional komplett. Backend + Frontend + Design stehen. Bereit für Feinschliff & Deployment.

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
- [x] **Design**: Catchy Landing Page mit Hero, Gradient, Occasion-Badges, Feature-Cards
- [x] **Themes**: Birthday, Christmas, Wedding, Baby via CSS-Variablen (`data-theme`)

## Tech-Stack (installiert)

- Node.js 22.22.0 / pnpm 10.27.0 (via Volta)
- Next.js 16.1.6 (App Router + Turbopack)
- React 19.2.3
- Tailwind CSS 4.1.18 + shadcn/ui (new-york style)
- Drizzle ORM 0.45.1 + postgres.js
- better-auth 1.4.18
- next-intl 4.8.2
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
│   └── ui/                            # shadcn Components
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

1. **Impressum & Datenschutz** Seiten erstellen
2. **Google OAuth** Credentials einrichten (Cloud Console)
3. **E2E Testing** - User-Flow testen
4. **Deployment** vorbereiten (Hetzner/Dokploy)

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

## Offene Punkte

- [ ] Finaler Projektname (Arbeitstitel: Wunschkiste)
- [ ] Amazon Associates Account erstellen
- [ ] AWIN Publisher Account beantragen
- [ ] Google OAuth Credentials
- [ ] Facebook App Credentials
- [x] PostgreSQL für lokale Entwicklung

## Letzte Sessions

### 05.02.2026 - MVP Implementation
- PostgreSQL via Docker aufgesetzt (Port 5433 wegen Konflikt)
- DB-Schema gepusht, Auth-Bug gefixt (UUID + password-Feld in accounts)
- Komplettes Backend: Wishlists, Products, Scraper, Share, Reservations API
- Komplettes Frontend: Login, Register, Dashboard, Wishlist-Editor, Share-View
- Design verbessert: Catchy Landing Page, visuelle Theme-Picker, echte CSS-Themes

## Notizen für nächste Session

- `drizzle-kit push` braucht explizite `DATABASE_URL` env var (wird nicht aus .env.local gelesen)
- better-auth braucht `advanced.database.generateId: "uuid"` wenn Schema UUID-Spalten hat
- better-auth `accounts`-Tabelle braucht `password`-Feld für Email/Password Auth
- Port 5432 war schon belegt → Docker auf 5433
- Amazon blockiert Scraper für Preis/Bild, aber Titel geht. Otto funktioniert komplett.
- `<img>` Warnings im Lint sind OK - externe Shop-Bilder können nicht über `next/image` laufen
