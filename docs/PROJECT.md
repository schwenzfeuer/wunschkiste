# Wunschkiste (Arbeitstitel)

> Brainstorming-Ergebnis vom 05.02.2026

## Die Idee

Eine Wunschzettel-App bei der Nutzer kostenlos Wunschlisten erstellen und teilen können. Im Hintergrund werden Links automatisch in Affiliate-Links umgewandelt - so finanziert sich die App.

**Problem das gelöst wird:** Statt jedem einzeln zu schreiben was das Kind sich wünscht, erstellt man eine Wunschliste und teilt den Link.

**Zielgruppe:** Familien, primär deutscher Markt.

**Geschäftsmodell:** Kostenlos für Nutzer, Einnahmen über Affiliate-Provisionen.

## Kern-Features (MVP)

- [ ] Account erstellen (Google, Facebook, Email)
- [ ] Wunschzettel anlegen
- [ ] Produkte per Link hinzufügen
- [ ] Automatische Extraktion von Bild, Titel, Preis (via Meta-Tags/OpenGraph)
- [ ] Affiliate-Links generieren wo möglich (Amazon: `?tag=xxx`)
- [ ] Wunschzettel per Link teilen
- [ ] Reservierungsfunktion ("Ich kauf das")
- [ ] Evtl. Kommentarfunktion

## Später / Nice-to-have

- [ ] Browser-Plugin (Chrome, Firefox) - direkt von Produktseite hinzufügen
- [ ] Freundes-/Familien-Netzwerk ("Sehen wer welche Wunschliste hat")
- [ ] Benachrichtigungen ("Jemand hat reserviert")
- [ ] Mehrere Wunschzettel pro Person

## Explizit NICHT im MVP

- Gruppen-Geschenke ("Wir legen zusammen")
- Preisalarme
- Prioritäten/Ranking

## Externe API-Abhängigkeiten

| Service | Zweck | Notizen |
|---------|-------|---------|
| Amazon Affiliate | Link-Tagging | Einfach via `?tag=xxx`, PA-API für Produktdaten |
| Amazon PA-API | Produktdaten | Wird 30.04.2026 eingestellt, 10 Sales/Monat nötig |
| Amazon Creators API | Produktdaten | Nachfolger der PA-API, recherchieren |
| AWIN | Affiliate-Links | Link Builder API verfügbar |
| OpenGraph/Meta-Tags | Produktdaten scrapen | Fallback für alle Shops |

**Wichtig:** Keine kostenpflichtigen Aggregator-Services (Strackr, wecantrack etc.)

## Offene Fragen / Risiken

- [ ] Amazon Creators API genauer recherchieren
- [ ] Rechtliche Situation beim Scraping von Produktdaten prüfen
- [x] ~~Telefon-Login~~ - entschieden: nicht im MVP
- [ ] Schnell starten um PA-API Zugang zu sichern (10 Sales generieren)
- [ ] Finaler Projektname (Wunschkiste ist vergeben)

## Konkurrenz

- Wantic (wantic.io) - größte deutsche Wunschlisten-App
- Wishlists
- Wunschbiber
- Starsnoopy

Alle vermutlich auch mit Affiliate-Links finanziert, aber nicht transparent kommuniziert.

## Nächste Schritte

1. `/plan` ausführen für technische Planung
2. Tech-Stack entscheiden
3. Externe APIs recherchieren (Amazon Creators API, AWIN)
