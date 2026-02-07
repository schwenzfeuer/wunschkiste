# Design System

> Basis: shadcn/ui mit Custom Theme | Tailwind CSS v4 | Next.js Font Loading

## Design-Prinzipien

1. **Freundlich & Einladend** - Keine kalte Admin-Ästhetik
2. **Einfach** - Familien sollen es sofort verstehen
3. **Warm** - Farben die Freude am Schenken vermitteln
4. **Accessible** - Kontrastreiche Farben, lesbare Schriften
5. **Immersiv** - Jedes Theme hat eigene Animationen und Atmosphäre

## Farbpalette (Standard-Theme)

### Kernpalette: Creme + Blau + Tangerine

```css
--background: #FEF1D0;          /* Warmes Creme */
--foreground: #0042AF;          /* Tiefes Blau */
--primary: #0042AF;             /* Tiefes Blau */
--primary-foreground: #FEF1D0;  /* Warmes Creme */
--accent: #FF8C42;              /* Soft Tangerine */
--accent-foreground: #FFFFFF;
```

### Vollständige Token-Tabelle

| Token | Hex | Beschreibung |
|-------|-----|-------------|
| `--background` | `#FEF1D0` | Warmes Creme |
| `--foreground` | `#0042AF` | Tiefes Blau |
| `--card` | `#FFF8E7` | Aufgehelltes Creme |
| `--card-foreground` | `#0042AF` | Tiefes Blau |
| `--popover` | `#FFF8E7` | Aufgehelltes Creme |
| `--popover-foreground` | `#0042AF` | Tiefes Blau |
| `--primary` | `#0042AF` | Tiefes Blau |
| `--primary-foreground` | `#FEF1D0` | Warmes Creme |
| `--secondary` | `#E8EFFA` | Aufgehelltes Blau |
| `--secondary-foreground` | `#0042AF` | Tiefes Blau |
| `--muted` | `#F5E6C0` | Gedämpftes Creme |
| `--muted-foreground` | `#6B7A99` | Grau-Blau |
| `--accent` | `#FF8C42` | Soft Tangerine |
| `--accent-foreground` | `#FFFFFF` | Weiß |
| `--destructive` | `#DC2626` | Rot |
| `--border` | `#E8DFC0` | Helles Sandbeige |
| `--input` | `#E8DFC0` | Helles Sandbeige |
| `--ring` | `#0042AF` | Tiefes Blau |
| `--success` | `#16A34A` | Grün |
| `--warning` | `#F59E0B` | Amber |

### Semantische Farben

```css
--success: #16A34A;    /* Grün - Reserviert/Erfolgreich */
--warning: #F59E0B;    /* Amber - Hinweise */
--destructive: #DC2626; /* Rot - Löschen */
```

## Typografie

### Font Stack

```css
--font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
--font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
```

- **DM Sans**: Freundlich, modern, gut lesbar — für Body und UI-Elemente
- **Playfair Display**: Elegant, für Headings und Akzente

### Größen

| Element | Size | Weight |
|---------|------|--------|
| H1 | 2.5rem | 700 |
| H2 | 2rem | 600 |
| H3 | 1.5rem | 600 |
| Body | 1rem | 400 |
| Small | 0.875rem | 400 |

## Border Radius

```css
--radius: 0.75rem;    /* 12px - Default */
```

Tailwind-Klassen: `rounded-xl` für Cards, `rounded-full` für Buttons (Pill-Form).

## Schatten

Weiche, warme Schatten:

```css
--shadow-sm: 0 2px 8px -2px rgba(120, 80, 60, 0.08);
--shadow-md: 0 4px 16px -4px rgba(120, 80, 60, 0.12);
--shadow-lg: 0 8px 32px -8px rgba(120, 80, 60, 0.16);
```

## Komponenten

### Buttons

**Primär (CTA)**: Pill-Form, gefüllt

```tsx
<Button className="rounded-full px-6">
  Wunsch hinzufügen
</Button>
```

**Referenz-Inspiration (pomegranate.health)**: Pill-Buttons mit `::before` Pseudo-Element als Hover-Shadow-Layer. Uppercase, bold, erhöhtes Letter-Spacing. Zu prüfen: Kann der "Wunsch hinzufügen"-Button einen ähnlichen Hover-Effekt bekommen (dunkler Layer der sich beim Hover zeigt)?

**Sekundär**: Outline, Pill-Form

```tsx
<Button variant="outline" className="rounded-full border-2">
  Abbrechen
</Button>
```

### Cards (Produkt-Karten)

```tsx
<Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
  <CardContent className="p-4">
    {/* Produktbild, Titel, Preis */}
  </CardContent>
</Card>
```

### Input-Felder

```tsx
<Input className="rounded-xl border-2 border-muted focus:border-primary" />
```

## Iconografie

**Lucide Icons** (kommt mit shadcn/ui)

Stil: Outline, 24px, stroke-width 1.5 (weicher als Default)

## Spacing

Großzügige Abstände für luftiges Design:

| Token | Value | Verwendung |
|-------|-------|------------|
| xs | 0.5rem | Inline-Elemente |
| sm | 1rem | Zwischen Text |
| md | 1.5rem | Card Padding |
| lg | 2rem | Section Spacing |
| xl | 3rem | Page Sections |

## Anlass-Themes

Jede Wunschliste kann ein eigenes Theme haben — passend zum Anlass. Themes werden als `data-theme` Attribut gesetzt und in der DB pro Wunschliste gespeichert.

### Standard (Default)

Warmes Creme + Tiefes Blau + Tangerine

```css
--background: #FEF1D0;
--foreground: #0042AF;
--primary: #0042AF;
--accent: #FF8C42;
```

### Geburtstag (`birthday`)

Verspielt, bunt — mit Konfetti-Animation (8s)

```css
--background: #FFF0F5;   /* Rosa-Weiß */
--foreground: #6B21A8;   /* Dunkles Lila */
--primary: #9333EA;      /* Lila */
--accent: #F472B6;       /* Pink */
```

### Weihnachten (`christmas`)

Klassisch festlich — mit Schneeflocken-Animation (12s)

```css
--background: #FDF8F0;   /* Warm-Weiß */
--foreground: #14532D;   /* Dunkelgrün */
--primary: #166534;      /* Tannengrün */
--secondary: #FEE2E2;   /* Zartes Rot */
--accent: #DC2626;       /* Weihnachtsrot */
```

### Hochzeit (`wedding`)

Elegant, dezent — mit Shimmer/Sparkle-Animation (6s/10s)

```css
--background: #FFF9F5;   /* Elfenbein */
--foreground: #44403C;   /* Warmes Grau */
--primary: #B08D82;      /* Rosé-Taupe */
--accent: #D4A894;       /* Roségold */
```

### Baby (`baby`)

Sanft, pastellig — mit schwebenden Wolken (20s/25s)

```css
--background: #F0F7FF;   /* Eisblau */
--foreground: #1E3A5F;   /* Dunkelblau */
--primary: #60A5FA;      /* Hellblau */
--accent: #F9A8D4;       /* Zartrosa */
```

### Immersive Animationen

Jedes Theme hat eine eigene CSS-Animation, die die Atmosphäre verstärkt. Alle Animationen respektieren `prefers-reduced-motion: reduce`.

| Theme | Animation | Effekt |
|-------|-----------|--------|
| Standard | — | Keine |
| Geburtstag | Konfetti-Fall | Bunte Partikel fallen herab |
| Weihnachten | Schneeflocken | Weiße Flocken rieseln |
| Hochzeit | Shimmer + Sparkle | Sanftes Glitzern |
| Baby | Schwebende Wolken | Wolken ziehen langsam vorbei |

Preview-Versionen existieren für die Theme-Auswahl-Cards (`.theme-preview`).

### Grafische Elemente (geplant)

Theme-spezifische Illustrationen via recraft.ai:
- Weihnachten: Geschenke, Tannenbäume, Sterne
- Geburtstag: Luftballons, Kuchen, Partyhüte
- Hochzeit: Ringe, Blumen, Herzen
- Baby: Schnuller, Rasseln, Sterne

Diese könnten als Hintergrund-Dekoration oder in leeren Zuständen eingesetzt werden.

### Theme-Hintergrund-Intensität

Aktuell: Theme-Farben sind dezent im Hintergrund. Der "Wunsch hinzufügen"-Button trägt die stärkste Theme-Farbe.

**Verbesserung gewünscht**: Theme-Hintergründe sollen präsenter werden — mehr Farbsättigung, evtl. Gradient-Verläufe oder stärkere Akzentflächen, damit das Theme-Feeling sofort spürbar ist.

## Dark Mode

Vorerst kein Dark Mode im MVP. Kann später hinzugefügt werden.

## Responsive Breakpoints

Standard Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Mobile-first Design.
