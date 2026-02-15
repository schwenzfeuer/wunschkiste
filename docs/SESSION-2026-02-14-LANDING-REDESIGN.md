# Session 14.02.2026 -- Landing Page Redesign

## Was gemacht wurde

### 1. PhoneMockup + PhonePair Komponenten

**Datei:** `src/components/phone-mockup.tsx`

- `PhoneMockup`: CSS-only iPhone-Frame (border-radius 40px, Dynamic Island, Bottom Bar)
  - Props: `src`, `alt`, `className`, `dark` (fuer blauen Rahmen im Dark Mode)
  - Responsive: 240px mobile, 280px ab `sm`
- `PhonePair`: Zwei Phones versetzt (Front im Vordergrund, Back leicht nach rechts/unten versetzt)
  - Props: `frontSrc`, `backSrc`, `frontAlt`, `backAlt`, `backDark`
  - Back-Phone mit 85%/90% Skalierung und 80% Opacity

### 2. Demo-Daten in lokaler DB

Wishlist "Linas 7. Geburtstag" mit Standard-Theme:
- ID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Share-Token: `demo-screenshot-token`
- Owner: `70e7fa39-...` (Kai)

5 Produkte:
| Produkt | Preis | Priority | Hidden | Reserviert |
|---------|-------|----------|--------|------------|
| LEGO Friends Baumhaus | 49.99 | Top 1 | nein | Oma Helga (reserved) |
| Tonies Toniebox Starterset | 79.99 | Top 2 | nein | - |
| Aquabeads Kreativkoffer | 24.99 | - | ja | - |
| Affenzahn Kinderrucksack | 39.95 | - | nein | Oma Helga (bought) |
| Crayola Inspirationskoffer | 34.99 | Top 3 | nein | - |

Guest-User "Oma Helga" (`aa000001-...`) mit 2 Reservierungen.

### 3. Screenshots (6 Stueck)

Erstellt via Playwright (headless Chromium, 375x812 Viewport), gespeichert als WebP in `public/screenshots/`:

| Datei | Inhalt | Modus |
|-------|--------|-------|
| `collect-front.webp` | "Wunsch hinzufuegen" Dialog | Light |
| `collect-back.webp` | Editor mit Produktliste | Light |
| `manage-front.webp` | Editor (Prioritaeten, Hidden, Reservierungen) | Light |
| `manage-back.webp` | Editor (gleicher Inhalt) | Dark |
| `share-front.webp` | Gaeste-Ansicht mit Countdown, Reservierungen | Light |
| `share-back.webp` | Gaeste-Ansicht | Dark |

Methode: Playwright registriert frischen User via API, fuegt ihn per SQL als Co-Editor hinzu, navigiert zur Seite, macht Screenshot. Dark Mode via `colorScheme: "dark"` + `localStorage.setItem("theme", "dark")`.

### 4. i18n-Keys

**Entfernt:** `landing.features.scraper`, `landing.features.themes`

**Neu/Aktualisiert in de.json + en.json:**

```
landing.problem.label    = "Kennst du das?"
landing.problem.title    = "Lina wünscht sich was -- aber alle fragen einzeln."
landing.problem.text     = (Oma ruft an, Tante schreibt WhatsApp...)

landing.solution.label   = "So einfach geht's"
landing.solution.title   = "Eine Liste. Ein Link. Kein Chaos."
landing.solution.text    = (Erstell eine Wunschkiste mit allem...)

landing.features.collect = (Link rein -- Wunsch erkannt)
landing.features.manage  = (Deine Liste, deine Regeln)
landing.features.share   = (Ein Link fuer alle)
```

### 5. Landing Page Struktur

**Datei:** `src/app/[locale]/page.tsx`

```
1. HERO (unveraendert)
   "Wuensche teilen, Freude schenken."

2. PROBLEM
   "Lina wuenscht sich was -- aber alle fragen einzeln."

3. LOESUNG
   "Eine Liste. Ein Link. Kein Chaos."

4. FEATURE: Wuensche sammeln (Text links, Phones rechts)
   Front: Add-Dialog | Back: Editor

5. FEATURE: Verwalten (Phones links, Text rechts)
   Front: Editor Light | Back: Editor Dark

6. FEATURE: Teilen & Schenken (Text links, Phones rechts)
   Front: Share Light | Back: Share Dark

7. CTA (unveraendert)
   "Bereit fuer deine erste Wunschkiste?"
```

Features alternieren: ungerade = Text links/Phones rechts, gerade = Phones links/Text rechts.

## Geaenderte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/phone-mockup.tsx` | **Neu** |
| `src/app/[locale]/page.tsx` | Komplett umgebaut |
| `messages/de.json` | landing-Keys aktualisiert |
| `messages/en.json` | landing-Keys aktualisiert |
| `public/screenshots/*.webp` | **Neu** (6 Dateien) |

## Bekannte Einschraenkungen

- Produktbilder laden nicht (Amazon CDN blockiert Headless-Browser) -- Gift-Box-Placeholder sichtbar
- Dark Mode Unterschied bei Manage/Share subtil, weil der Screenshot-Content identisch ist (nur Farbschema anders)
- Collect-Back und Manage-Front zeigen den gleichen Screen (Editor Light) -- spaeter ggf. differenzieren

---

## Offener Plan: Connected Participants Animation

### Kontext

Die "Teilen & Schenken" Feature-Section zeigt aktuell Phone-Mockups. Besser waere eine Animation die das Kernversprechen "viele Menschen teilen sich eine Wunschkiste" visuell darstellt. Inspiriert von pomegranate.health (schwebende Profil-Karten um ein zentrales Element).

### Was gebaut werden soll

`ConnectedParticipants`-Komponente: Zentrales Geschenk-Icon (`wunschkiste-geschenk.svg`) umgeben von 5 schwebenden Teilnehmer-Karten. Gestrichelte SVG-Linien verbinden die Karten mit dem Zentrum.

### Platzierung

Die PhonePair in der "Teilen & Schenken" Section wird durch die Animation ersetzt. `features`-Array wird auf 2 Eintraege reduziert (collect, manage). Share-Section separat gerendert.

### Komponenten-Aufbau

```
ConnectedParticipants
  +-- div.relative (320x320 mobile / 400x400 desktop)
       +-- <svg> Verbindungslinien (5x <line>, gestrichelt, animiert)
       +-- Zentrales Element (Geschenk-SVG in rundem bg-accent/10 Container)
       +-- 5x ParticipantCard (absolut positioniert, schwebend)
            +-- Farbiger Avatar-Kreis mit Initialen
            +-- Name
```

### Teilnehmer (hardcoded)

| Name | Initialen | Farbe | Position |
|------|-----------|-------|----------|
| Oma Helga | OH | amber-500 | oben mitte |
| Papa | PA | blue-500 | rechts oben |
| Tante Inge | TI | emerald-500 | rechts unten |
| Mia | MI | pink-500 | links unten |
| Onkel Peter | OP | violet-500 | links oben |

### CSS-Animationen (globals.css)

3 neue Keyframes:
1. **`participants-float`** -- translateY -8px, 5-7s pro Karte (verschiedene Dauern/Delays fuer organisches Schweben)
2. **`participants-pulse`** -- scale 1.03 + box-shadow Pulse auf dem Zentrum, 4s
3. **`participants-line-flow`** -- stroke-dashoffset Animation fuer "fliessende" gestrichelte Linien, 2s

`prefers-reduced-motion: reduce` stoppt alle Animationen.

### Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/connected-participants.tsx` | **Neu** (Server Component) |
| `src/app/globals.css` | 3 Keyframes + 7 Utility-Klassen + reduced-motion |
| `src/app/[locale]/page.tsx` | Share-Section mit Animation statt PhonePair |

Keine neuen Packages. Keine i18n-Aenderungen.

### Dark Mode

Automatisch via CSS-Variablen: `bg-card` -> dunkles Blau, `text-card-foreground` -> Creme, `var(--accent)` bleibt Tangerine, Avatar-Farben sind absolute Tailwind-Werte.

### Verifikation

- `pnpm build` gruen
- Desktop: Text links, Animation rechts mit 5 schwebenden Karten
- Mobile: Animation ueber Text gestackt
- Dark Mode: Karten in blauem Ton, Linien in Tangerine
- Reduced Motion: Statische Anordnung ohne Animation
