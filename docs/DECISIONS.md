# Architecture Decision Records

## ADR-001: Tech-Stack Auswahl

**Datum:** 05.02.2026
**Status:** Akzeptiert

### Kontext

Neues Projekt "Wunschkiste" - eine Wunschzettel-App mit Affiliate-Link-Integration.

### Entscheidung

| Kategorie | Entscheidung |
|-----------|--------------|
| Runtime | Node.js 22.x (LTS) |
| Package Manager | pnpm 10.x |
| Framework | Next.js 16.x (App Router) |
| Styling | Tailwind CSS 4.x |
| Database | PostgreSQL + Drizzle |
| Auth | better-auth |
| Deployment | Hetzner + Dokploy |

### Begründung

- **Next.js 16:** Neueste stabile Version, Turbopack für schnelle Builds
- **Drizzle:** Leichtgewichtiger als Prisma, TypeScript-first
- **better-auth:** Einfaches Setup für OAuth, keine externen Abhängigkeiten
- **Hetzner:** Kostengünstig, EU-Hosting (DSGVO)

### Konsequenzen

- Stack ist gelockt, keine Änderungen ohne Diskussion
- Alle Teammitglieder nutzen gleiche Versionen via Volta

---

## ADR-002: Affiliate-Link Strategie

**Datum:** 05.02.2026
**Status:** Akzeptiert

### Kontext

Affiliate-Links sind die einzige Einnahmequelle. Verschiedene Netzwerke haben verschiedene Integrationsanforderungen.

### Entscheidung

1. **Amazon:** Tag-Parameter an URL anhängen (`?tag=xxx`)
2. **AWIN:** Link Builder API für Partner-Shops
3. **Fallback:** Original-URL wenn kein Affiliate möglich

### Begründung

- Amazon-Integration ist trivial (kein API-Call nötig für Link-Generierung)
- AWIN deckt viele deutsche Shops ab (Otto, MediaMarkt, etc.)
- Kein kostenpflichtiger Aggregator-Service

### Konsequenzen

- Manuell Liste von AWIN-Partner-Domains pflegen
- Produkte ohne Affiliate werden trotzdem angezeigt

---

## ADR-003: Kein Telefon-Login

**Datum:** 05.02.2026
**Status:** Akzeptiert

### Kontext

Telefon-Login wäre niedrigschwellig, erfordert aber SMS-Provider (Kosten).

### Entscheidung

Kein Telefon-Login im MVP. Nur Google, Facebook, Email.

### Begründung

- SMS-Verifizierung kostet Geld pro Nachricht
- Google/Facebook Login ist für Zielgruppe (Familien) ausreichend
- Email als Fallback für alle die kein Social Login wollen

### Konsequenzen

- Einfacheres Auth-Setup
- Kann später hinzugefügt werden wenn Bedarf besteht

---

## ADR-004: Produktdaten via Scraping

**Datum:** 05.02.2026
**Status:** Akzeptiert

### Kontext

Produktdaten (Titel, Bild, Preis) sollen automatisch extrahiert werden.

### Entscheidung

OpenGraph/Meta-Tags als primäre Datenquelle, JSON-LD als Fallback.

### Begründung

- Keine API-Kosten
- Funktioniert für die meisten großen Shops
- Cheerio ist leichtgewichtig

### Risiken

- Manche Shops blockieren Scraping
- Preise können veraltet sein
- Nicht alle Shops haben og:price

### Mitigationen

- Rate Limiting
- Manuelles Nachtragen ermöglichen
- Preis als "ungefähr" kennzeichnen
