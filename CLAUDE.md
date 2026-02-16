# Wunschkiste - Claude Code Regeln

## Strikte Regeln

- **KEINE EMOJIS** - nirgendwo. Nicht im Code, nicht in Commits, nicht in UI-Texten, nicht in Konsolenausgaben.
- **Echte Umlaute verwenden** - immer ä/ö/ü/ß, niemals ae/oe/ue/ss. Gilt für Code-Kommentare, Commits, Docs, i18n-Texte, UI-Strings.
- **Keine neuen Packages** ohne Rueckfrage
- **Keine .env Aenderungen** ohne Rueckfrage
- **Kein Production Deploy** ohne explizite Anweisung

## Keine Annahmen

NIEMALS raten. Dieses Projekt nutzt spezifische Library-Versionen und Patterns die sich von dem unterscheiden was du aus dem Training kennst.

**Bevor du Code schreibst:**
1. **Bestehenden Code lesen.** Nicht vermuten wie eine Funktion heisst oder welche Parameter sie nimmt - nachschauen. `src/lib/` und `src/components/` durchsuchen.
2. **Library-APIs verifizieren.** better-auth, Drizzle, next-intl, ArcJet - die Syntax hat sich seit deinem Training geaendert. Im Zweifel `docs/LEARNINGS.md` lesen, dort sind alle bekannten Pitfalls dokumentiert.
3. **DB-Schema lesen.** Spalten heissen nicht immer wie erwartet (z.B. `user_id` nicht `owner_id`). Schema liegt in `src/lib/db/schema.ts`.
4. **Bestehende Patterns uebernehmen.** Nicht dein eigenes Pattern erfinden - schau wie es in den anderen Dateien geloest ist und mach es genauso.

**Wenn du dir nicht sicher bist:** Frag. Eine Frage kostet 10 Sekunden, eine falsche Annahme kostet eine halbe Stunde Debugging.

## Arbeitsweise

**Nach jeder Aenderung verifizieren:**
- `pnpm build` - muss gruen sein
- Relevante Tests laufen lassen: `pnpm exec playwright test tests/api/betroffene-datei.spec.ts`
- Wenn die Aenderung UI betrifft: dem User sagen was er pruefen soll und wo

**Nicht ueberengineeren:**
- Einfachste Loesung die funktioniert
- Keine Abstraktion fuer einen einzigen Use-Case
- Keine "vorsorglich" hinzugefuegten Features
- Kein Refactoring von Code der nicht Teil des Auftrags ist

**Fehler fixen, nicht Symptome behandeln:**
- Wenn ein Bug auftritt: Ursache verstehen, nicht nur das sichtbare Problem patchen
- Daten aus der DB pruefen wenn noetig (`docker exec wunschkiste-postgres psql -U wunschkiste -d wunschkiste`)
- Nach einem Fix: messbar verifizieren dass er wirkt

## Routing-Falle (next-intl)

Das ist der haeufigste Bug in diesem Projekt. IMMER aus `@/i18n/routing` importieren:

```typescript
// RICHTIG
import { Link, useRouter } from "@/i18n/routing";
<Link href={{ pathname: "/wishlist/[id]", params: { id } }}>

// FALSCH - Locale geht verloren, Compile Error bei dynamischen Pfaden
import Link from "next/link";
router.push(`/wishlist/${id}`);
```

E2E-Tests muessen lokalisierte DE-URLs verwenden (`/anmelden`, nicht `/login`).

## Commands

```bash
pnpm dev                               # Dev-Server
pnpm build                             # Build pruefen
pnpm exec playwright test              # Alle Tests
pnpm exec playwright test tests/api    # API-Tests
pnpm exec playwright test tests/e2e    # E2E-Tests
docker start wunschkiste-postgres      # PostgreSQL (Port 5433)
```

## Referenzen

Detailliertes Wissen liegt in `docs/` - nicht hier duplizieren:

- `docs/CURRENT-STATE.md` - Aktueller Stand, was existiert, was offen ist
- `docs/LEARNINGS.md` - **Bekannte Pitfalls und API-Quirks (ZUERST LESEN!)**
- `docs/TECH-STACK.md` - Versionen und Libraries
- `docs/PROJECT.md` - Vision, Features, Geschaeftsmodell
- `docs/ARCHITECTURE.md` - Datenmodell, System-Uebersicht
- `docs/DESIGN.md` - Design System, Farben, Themes
- `docs/DECISIONS.md` - Architecture Decision Records
