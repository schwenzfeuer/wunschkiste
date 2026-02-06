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

---

## ADR-005: Design Redesign – Warm-Minimalistisch mit Storytelling

**Datum:** 06.02.2026
**Status:** ✅ Accepted

### Kontext

Das bisherige Design war ein generischer SaaS-Template-Look (Hero + Feature-Grid + CTA). Keine visuelle Eigenständigkeit, weckt keine Neugier. Für eine Consumer-App im Familien-Bereich brauchen wir einen einladenden, hochwertigen Look der sich von der Masse abhebt.

### Entscheidung

Komplett-Redesign inspiriert von pomegranate.health: warm-minimalistisch, editorial, handwerkliche UI-Details.

#### Farbpalette

| Rolle | Hex | Beschreibung |
|---|---|---|
| Hintergrund | `#FEF1D0` | Warmes Creme |
| Text/Primary | `#0042AF` | Tiefes Blau |
| Akzent/CTA | `#FF8C42` | Soft Tangerine |

#### Typografie

| Element | Font-Typ | Beispiel |
|---|---|---|
| Headlines | Serif | Playfair Display, Fraunces |
| Body/UI | Sans-Serif | Inter, DM Sans |

#### Visueller Stil

- **Keine Schatten** – Tiefe über grafische Elemente (`:before`-Layer-Trick wie Pomegranate)
- **Keine Borders/Gradients** auf Cards – minimalistisch
- **Schmaler Container** – Editorial/Magazin-artiger Look
- **Viel Whitespace** – Luft statt Überladung
- **Dezente Scroll-Animationen** – Fade-in, Slide-up via Intersection Observer
- **Mobile-first** – Responsive über alle Breakpoints

#### Landing Page Aufbau (Storytelling-Flow)

1. Nav – Minimal, zentriert
2. Hero – Großer Serif-Headline + kurzer Text + CTA
3. Visual – App-Mockup oder Illustration
4. Problem – Emotionale Ansprache ("Jeder fragt: Was wünschst du dir?")
5. Lösung – "Erstell eine Liste, teil den Link – fertig."
6. Feature: Auto-Erkennung – Link rein → Produkt erkannt
7. Feature: Teilen & Reservieren
8. Feature: Themes/Anlässe
9. CTA – "Erstell deine erste Wunschliste"
10. Footer – Minimal

### Alternativen

| Option | Vorteile | Nachteile |
|---|---|---|
| **Gewählt: Warm-Minimalistisch** | Eigenständig, hochwertig, hebt sich ab | Mehr Aufwand, Custom-Komponenten nötig |
| Bisheriges Koralle/Mint-Design beibehalten | Kein Aufwand | Generisch, keine Wiedererkennung |
| Trendy Glassmorphism/Bento-Grid | Modern, eye-catching | Schnell veraltet, überall zu sehen |

### Konsequenzen

**Positiv:**
- Eigenständiger visueller Auftritt
- Hochwertige Wahrnehmung trotz kostenloser App
- Storytelling-Ansatz erklärt das Produkt beim Scrollen
- Font-Pairing (Serif + Sans) schafft editorialen Charakter

**Negativ:**
- Komplettes Redesign aller bestehenden Seiten nötig
- Custom Button-Komponente statt Standard-shadcn
- Anlass-Themes müssen auf neue Basis angepasst werden
