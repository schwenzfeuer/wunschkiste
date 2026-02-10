# Tech-Stack

> **Gelockt am:** 05.02.2026
> **Status:** FINAL - Keine Änderungen ohne Diskussion

## Runtime & Tooling

| Tool | Version | Zweck |
|------|---------|-------|
| Node.js | 22.x | Runtime (via Volta, LTS) |
| pnpm | 10.x | Package Manager (via Volta) |
| TypeScript | 5.x | Language (strict mode) |

## Framework & Libraries

| Library | Version | Zweck |
|---------|---------|-------|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI Library |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | - | UI Komponenten (Custom Theme) |
| Radix UI | - | Headless Primitives (via shadcn) |
| Lucide Icons | - | Iconographie |
| TanStack Query | 5.x | Data Fetching & Caching |
| React Hook Form | 7.x | Formulare |
| Zod | 3.x | Validierung |
| next-intl | 3.x | Internationalisierung (de/en) |

## Backend & Datenbank

| Tool | Zweck |
|------|-------|
| PostgreSQL | Datenbank |
| Drizzle ORM | Database Access |
| better-auth | Authentifizierung (Google, Facebook, Email) |

## Zusätzliche Libraries (projektspezifisch)

| Library | Zweck |
|---------|-------|
| Cheerio | HTML Parsing für Meta-Tags/OpenGraph |

## Deployment (ADR-007)

| Service | Zweck |
|---------|-------|
| Cloudflare Pages | App Hosting (Edge, auto-skalierend) |
| Neon | Serverless PostgreSQL |
| Cloudflare R2 | Avatar Storage (bereits eingerichtet) |
| GitHub Actions | Geplante Jobs (Email-Erinnerungen, taeglich 09:00 UTC) |

## Explizit NICHT verwendet

- AI/LLM Integration (nicht benötigt)
- Telefon-Authentifizierung (SMS-Kosten)
- Kostenpflichtige Affiliate-Aggregatoren

## Externe APIs

| API | Status | Notizen |
|-----|--------|---------|
| Amazon Creators API | Recherchiert | OAuth 2.0, neue Credentials nötig |
| AWIN Publisher API | Recherchiert | OAuth 2.0, Link Builder |
| OpenGraph/Meta-Tags | Standard | Fallback für alle Shops |

Details zur API-Integration siehe `LEARNINGS.md`.
