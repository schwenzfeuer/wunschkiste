# Current State

> Letzte Aktualisierung: 05.02.2026

## Status

**Phase:** Grundstruktur steht, bereit für Feature-Implementierung

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
│   ├── [locale]/          # i18n Routes
│   │   ├── layout.tsx
│   │   └── page.tsx       # Landing Page
│   └── api/
│       └── auth/[...all]/ # better-auth Handler
├── components/
│   └── ui/                # shadcn Components (button, card, input)
├── lib/
│   ├── auth/              # better-auth Config
│   ├── db/                # Drizzle Schema & Connection
│   ├── affiliate/         # Affiliate-Link Logik (Stub)
│   └── scraper/           # URL-Scraping Logik (Stub)
├── i18n/                  # next-intl Config
└── middleware.ts          # Locale Routing
messages/
├── de.json
└── en.json
```

## Nächste Schritte

1. **PostgreSQL aufsetzen** (lokal oder Docker)
2. **Migrations ausführen** (`pnpm db:push`)
3. **Auth-Flow testen** (Email/Password)
4. **Wunschlisten-CRUD implementieren**
5. **Produkt-Scraping implementieren** (Cheerio + OpenGraph)
6. **Affiliate-Links** (Amazon Tag)

## Offene Punkte

- [ ] Finaler Projektname (Arbeitstitel: Wunschkiste)
- [ ] Amazon Associates Account erstellen
- [ ] AWIN Publisher Account beantragen
- [ ] Google OAuth Credentials
- [ ] Facebook App Credentials
- [ ] PostgreSQL für lokale Entwicklung
