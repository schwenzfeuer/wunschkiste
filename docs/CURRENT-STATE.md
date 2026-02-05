# Current State

> Letzte Aktualisierung: 05.02.2026

## Status

**Phase:** MVP Backend & Frontend komplett, bereit für Testing

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
- [x] **Projekt-Setup abgeschlossen:**
  - Next.js 16.x mit App Router
  - Volta Version Pinning (Node 22.x, pnpm 10.x)
  - Tailwind CSS 4.x + shadcn/ui mit Custom Theme (Koralle, Mint, Cremeweiß)
  - Anlass-Themes (birthday, christmas, wedding, baby)
  - Drizzle ORM + PostgreSQL Schema (users, wishlists, products, reservations)
  - better-auth Integration (Google, Facebook, Email vorbereitet)
  - next-intl für i18n (de/en)
  - Basis-Ordnerstruktur nach CODE-STANDARDS.md
- [ ] Feature-Implementierung

## Tech-Stack (installiert)

- Node.js 22.22.0 / pnpm 10.27.0 (via Volta)
- Next.js 16.1.6 (App Router + Turbopack)
- React 19.2.3
- Tailwind CSS 4.1.18 + shadcn/ui (new-york style)
- Drizzle ORM 0.45.1 + postgres.js
- better-auth 1.4.18
- next-intl 4.8.2
- Lucide Icons

## Projektstruktur

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing Page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── wishlist/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── share/[token]/page.tsx
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
│   ├── auth/                          # better-auth Config
│   ├── db/                            # Drizzle Schema & Connection
│   ├── affiliate/                     # Affiliate-Link Logik
│   └── scraper/                       # URL-Scraping mit Cheerio
├── i18n/                              # next-intl Config
└── middleware.ts                      # Locale Routing
messages/
├── de.json
└── en.json
```

## Nächste Schritte

1. ~~**PostgreSQL aufsetzen** (lokal oder Docker)~~ ✅ Docker auf Port 5433
2. ~~**Migrations ausführen** (`pnpm db:push`)~~ ✅
3. ~~**Auth-Flow testen** (Email/Password)~~ ✅ Funktioniert
4. ~~**Wunschlisten-CRUD implementieren**~~ ✅ API fertig
5. ~~**Produkt-Scraping implementieren** (Cheerio + OpenGraph)~~ ✅
6. ~~**Affiliate-Links** (Amazon Tag)~~ ✅ Integriert
7. ~~**Share & Reservierung API**~~ ✅
8. ~~**Frontend-Komponenten implementieren**~~ ✅
9. ~~**UI-Seiten bauen**~~ ✅ Login, Register, Dashboard, Wishlist, Share
10. **Testing & Feinschliff** ← Aktuell

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
