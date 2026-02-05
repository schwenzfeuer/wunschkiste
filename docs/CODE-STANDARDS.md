# Code Standards

## TypeScript

- Strict mode aktiviert
- Keine `any` Types (außer in Ausnahmefällen mit Kommentar)
- Prefer `unknown` über `any`
- Explizite Return Types für exportierte Funktionen

```typescript
// Gut
export function getUser(id: string): Promise<User | null> { }

// Schlecht
export function getUser(id: string) { }
```

## Naming Conventions

| Element | Convention | Beispiel |
|---------|------------|----------|
| Dateien (Components) | kebab-case | `wishlist-card.tsx` |
| Dateien (Utils) | kebab-case | `affiliate-utils.ts` |
| Komponenten | PascalCase | `WishlistCard` |
| Funktionen | camelCase | `createWishlist` |
| Konstanten | SCREAMING_SNAKE | `MAX_PRODUCTS_PER_LIST` |
| Types/Interfaces | PascalCase | `Wishlist`, `ProductData` |
| Env Variables | SCREAMING_SNAKE | `DATABASE_URL` |

## Dateistruktur

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── wishlist/
│   │   ├── [id]/
│   │   └── new/
│   └── share/
│       └── [token]/
├── api/
│   ├── auth/
│   ├── wishlist/
│   └── product/
components/
├── ui/           # Generische UI-Komponenten
├── features/     # Feature-spezifische Komponenten
└── layout/       # Layout-Komponenten
lib/
├── db/           # Drizzle Schema & Queries
├── auth/         # better-auth Config
├── affiliate/    # Affiliate-Link Logik
└── scraper/      # URL-Scraping Logik
```

## Komponenten

- Functional Components mit TypeScript
- Props als Interface definieren
- Destructuring für Props

```typescript
interface WishlistCardProps {
  wishlist: Wishlist;
  onDelete?: () => void;
}

export function WishlistCard({ wishlist, onDelete }: WishlistCardProps) {
  // ...
}
```

## Server vs Client Components

- Default: Server Components
- `"use client"` nur wenn nötig:
  - Event Handler (onClick, onChange)
  - Hooks (useState, useEffect)
  - Browser APIs

## Error Handling

- Zod für Input-Validierung
- Try/Catch für externe API-Calls
- Sinnvolle Error Messages (deutsch für User, englisch für Logs)

```typescript
try {
  const data = await fetchProductData(url);
} catch (error) {
  console.error('Failed to fetch product data:', error);
  throw new Error('Produktdaten konnten nicht geladen werden');
}
```

## Imports

Reihenfolge:
1. React/Next.js
2. External Libraries
3. Internal Absolute Imports
4. Relative Imports
5. Types

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { createWishlist } from '@/lib/db/queries';

import { WishlistCard } from './wishlist-card';

import type { Wishlist } from '@/lib/db/schema';
```

## Commits

- Conventional Commits Format
- Deutsch für Beschreibung OK, Prefix englisch

```
feat: Wunschliste erstellen implementiert
fix: Affiliate-Tag wird jetzt korrekt angehängt
chore: Dependencies aktualisiert
```
