# Wunschkiste v1.0 — Fortschritt

## Plan-Datei
`/home/kai/.claude/projects/-home-kai-claude-projects-wunschkiste/f9402607-7a8e-40e5-a952-4ebba8a3684f.jsonl`

## Status: AP 1-9 implementiert, v1.0 komplett

### Erledigt:
- **AP 1:** Schema erweitert (ownerVisibility, reservationStatus Enums, eventDate, reservations umgebaut) + Migration SQL `drizzle/0001_v1_schema_upgrade.sql`
- **AP 2:** Backend Reserve/Buy (Auth-Pflicht, Owner-Block, Status reserved/bought, DELETE nur eigene, PATCH Upgrade)
- **AP 3:** Frontend Share-Seite komplett neu (Kaufen-Dialog, Auth-Status, Button-Logik, Owner-Visibility), Login/Register mit callbackUrl
- **AP 4:** Calendar-Komponente, Datepicker + Visibility in New + Editor, APIs erweitert, Event-Datum auf Share-Seite
- **AP 5:** R2 Storage Client, Upload-API, UserAvatar mit Initialen-Fallback, MainNav mit Avatar-Dropdown
- **AP 6:** Resend Email-Service, better-auth sendResetPassword, Forgot/Reset-Password Seiten, "Passwort vergessen?" Link
- **AP 7:** Sonner/Toaster in Layout, QueryProvider mit globalem onError, alert()→toast.success(), Error/404 Pages, Mobile-Fixes
- **AP 8:** ArcJet installiert, Rate-Limiting auf /api/scrape und /api/share/[token]/reserve

- **AP 9:** Tests angepasst & erweitert, Build-Fixes, .env.example ergänzt

**AP 9 Details:**
- `share.spec.ts` komplett neu: 20 Tests (Reserve Auth, DELETE, PATCH, Owner-Visibility, EventDate CRUD)
- Build-Fixes: ArcJet `protect(request, { requested: 1 })`, `forgetPassword` → `requestPasswordReset`, Resend lazy init, Suspense-Boundaries für useSearchParams
- `.env.example` um RESEND_API_KEY, ARCJET_KEY, R2_* ergänzt
- `playwright.config.ts` Timeout auf 60s erhöht
- Migration `0001_v1_schema_upgrade.sql` gegen lokale DB ausgeführt
- **51 Tests grün** (38 API + 13 E2E), **Build grün**

### Neue Packages (installiert):
- `@aws-sdk/client-s3` — Cloudflare R2
- `resend` — Email
- `sonner` — Toasts (via shadcn)
- `@arcjet/next` — Bot-Protection + Rate-Limiting
- `react-day-picker` + `date-fns` — waren schon als shadcn-Dependency da

### Geänderte/neue Dateien (Hauptdateien):
- `src/lib/db/schema.ts` — neue Enums + Felder
- `drizzle/0001_v1_schema_upgrade.sql` — Migration
- `src/app/api/share/[token]/route.ts` — GET überarbeitet
- `src/app/api/share/[token]/reserve/route.ts` — POST/DELETE/PATCH überarbeitet
- `src/app/api/wishlists/route.ts` — eventDate + ownerVisibility
- `src/app/api/wishlists/[id]/route.ts` — eventDate + ownerVisibility
- `src/app/api/scrape/route.ts` — ArcJet
- `src/app/api/profile/avatar/route.ts` — NEU
- `src/app/[locale]/share/[token]/page.tsx` — komplett neu
- `src/app/[locale]/wishlist/new/page.tsx` — Datepicker + Visibility
- `src/app/[locale]/wishlist/[id]/page.tsx` — Datepicker + Visibility + toast
- `src/app/[locale]/dashboard/page.tsx` — toast + mobile fix
- `src/app/[locale]/(auth)/login/page.tsx` — callbackUrl + Passwort vergessen
- `src/app/[locale]/(auth)/register/page.tsx` — callbackUrl
- `src/app/[locale]/(auth)/forgot-password/page.tsx` — NEU
- `src/app/[locale]/(auth)/reset-password/page.tsx` — NEU
- `src/app/[locale]/layout.tsx` — Toaster
- `src/app/not-found.tsx` — NEU
- `src/app/error.tsx` — NEU
- `src/lib/auth/index.ts` — sendResetPassword
- `src/lib/auth/client.ts` — requestPasswordReset, resetPassword
- `src/lib/email/index.ts` — NEU
- `src/lib/storage/r2.ts` — NEU
- `src/lib/security/arcjet.ts` — NEU
- `src/components/main-nav.tsx` — Avatar-Dropdown
- `src/components/user-avatar.tsx` — NEU
- `src/components/ui/calendar.tsx` — NEU
- `src/components/ui/sonner.tsx` — vereinfacht
- `src/components/providers/query-provider.tsx` — globaler onError

### Deployment-Notizen
- **Cloudflare R2:** Für Production einen **Account API Token** erstellen (bleibt aktiv unabhängig vom User). Dev nutzt User API Token.
- **Resend:** Production-Domain verifizieren für E-Mail-Versand
- **ArcJet:** Production-Key in Environment setzen
