# Security

## Kritische Bereiche

### 1. Authentifizierung

- OAuth via better-auth (Google, Facebook, Email)
- Session-basiert, HTTPOnly Cookies
- CSRF Protection aktiviert

**Env Variables (NIEMALS committen):**
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx
BETTER_AUTH_SECRET=xxx
```

### 2. API Credentials

Serverseitig speichern, nie zum Client senden:

```
AMAZON_CREDENTIAL_ID=xxx
AMAZON_CREDENTIAL_SECRET=xxx
AWIN_API_TOKEN=xxx
```

### 3. Datenbank

```
DATABASE_URL=xxx
```

- Prepared Statements via Drizzle (SQL Injection Prevention)
- Connection über SSL in Production

## Input Validation

### URL-Validierung

Jede User-URL validieren bevor Scraping:

```typescript
import { z } from 'zod';

const urlSchema = z.string().url().refine(
  (url) => {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  },
  { message: 'Nur HTTP/HTTPS URLs erlaubt' }
);
```

### Wishlist-Input

```typescript
const wishlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
```

## Rate Limiting

### Scraping Endpoint

- Max 10 Requests pro Minute pro User
- Verhindert Missbrauch des Scrapers

### Public Wishlist Access

- Max 100 Requests pro Minute pro IP
- Verhindert Scraping unserer Daten

## SSRF Prevention

Beim URL-Scraping:

```typescript
function isAllowedUrl(url: string): boolean {
  const parsed = new URL(url);

  // Keine internen IPs
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
  if (blockedHosts.includes(parsed.hostname)) {
    return false;
  }

  // Keine Private IP Ranges
  if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(parsed.hostname)) {
    return false;
  }

  return true;
}
```

## XSS Prevention

- React escaped standardmäßig
- Kein `dangerouslySetInnerHTML` ohne Sanitization
- Content-Security-Policy Header setzen

## Affiliate-Tag Security

- Affiliate Tags sind öffentlich (kein Security Risk)
- Aber: Nicht manipulierbar machen (serverseitig setzen)

## .gitignore

```gitignore
.env
.env.local
.env.production
*.pem
*.key
```

## Security Checklist vor Launch

- [ ] Alle Env Variables in Production gesetzt
- [ ] HTTPS erzwungen
- [ ] Rate Limiting aktiv
- [ ] CSP Headers konfiguriert
- [ ] Keine Secrets im Code
- [ ] Dependencies auf Vulnerabilities geprüft (pnpm audit)
