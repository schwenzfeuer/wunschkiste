# Design System

> Basis: shadcn/ui mit Custom Theme

## Design-Prinzipien

1. **Freundlich & Einladend** - Keine kalte Admin-Ästhetik
2. **Einfach** - Familien sollen es sofort verstehen
3. **Warm** - Farben die Freude am Schenken vermitteln
4. **Accessible** - Kontrastreiche Farben, lesbare Schriften

## Farbpalette

### Primärfarbe: Koralle/Warm Orange

```css
--primary: 15 90% 60%;        /* Warmes Koralle */
--primary-foreground: 0 0% 100%;
```

Begründung: Warm, freundlich, hebt sich von typischen Tech-Apps ab.

### Sekundärfarbe: Sanftes Mint

```css
--secondary: 160 40% 90%;     /* Helles Mint für Akzente */
--secondary-foreground: 160 40% 20%;
```

### Hintergrund: Cremeweiß

```css
--background: 30 20% 98%;     /* Leicht warmes Weiß */
--foreground: 20 15% 20%;     /* Weiches Dunkelbraun statt Schwarz */
```

### Semantische Farben

```css
--success: 145 60% 45%;       /* Grün - Reserviert */
--warning: 40 95% 55%;        /* Gelb - Hinweise */
--destructive: 0 70% 55%;     /* Rot - Löschen */
```

## Border Radius

Überall großzügiger Radius für weichen Look:

```css
--radius: 1rem;               /* 16px - Default für Buttons, Cards */
--radius-sm: 0.75rem;         /* 12px - Kleine Elemente */
--radius-lg: 1.5rem;          /* 24px - Cards, Modals */
--radius-full: 9999px;        /* Pillen, Avatare */
```

## Schatten

Weiche, warme Schatten statt harte:

```css
--shadow-sm: 0 2px 8px -2px rgba(120, 80, 60, 0.08);
--shadow-md: 0 4px 16px -4px rgba(120, 80, 60, 0.12);
--shadow-lg: 0 8px 32px -8px rgba(120, 80, 60, 0.16);
```

## Typographie

### Font Stack

```css
--font-sans: 'Inter', system-ui, sans-serif;
```

Inter ist freundlich, gut lesbar, kostenlos.

### Größen

| Element | Size | Weight |
|---------|------|--------|
| H1 | 2.5rem | 700 |
| H2 | 2rem | 600 |
| H3 | 1.5rem | 600 |
| Body | 1rem | 400 |
| Small | 0.875rem | 400 |

## Komponenten-Anpassungen

### Buttons

```tsx
// Primär: Gefüllt, rund, warm
<Button className="bg-primary hover:bg-primary/90 rounded-full px-6">
  Wunsch hinzufügen
</Button>

// Sekundär: Outline, weich
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

## Iconographie

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

## Beispiel: Produktkarte

```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │      Produktbild      │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Produkttitel               │
│  Shop-Name                  │
│                             │
│  29,99 €                    │
│                             │
│  ┌─────────────────────┐    │
│  │   🎁 Reservieren    │    │
│  └─────────────────────┘    │
└─────────────────────────────┘

- Radius: 24px
- Schatten: shadow-md
- Padding: 16px
- Button: rounded-full, Koralle
```

## Dark Mode

Vorerst kein Dark Mode im MVP. Kann später hinzugefügt werden.

## Responsive Breakpoints

Standard Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Mobile-first Design.
