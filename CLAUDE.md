@AGENTS.md

# Cutz Solution — ARIA Dashboard

B2B SaaS Dashboard für Friseursalons. Markenname: **Cutz Solution**, interner Produktname: **ARIA**.

**Dev-Server:** `npm run dev` → http://localhost:3000  
**Projektpfad:** `~/Desktop/aria-dashboard`

---

## Stack

| Technologie | Version | Zweck |
|---|---|---|
| Next.js | 16.2.6 (App Router, Turbopack) | Framework |
| React | 19 | UI |
| TypeScript | 5 (strict) | Typen |
| Framer Motion | 12 | Animationen |
| Tailwind CSS | 4 (`@import "tailwindcss"`) | Styling |
| Recharts | 3 | Charts |
| NextAuth | 4 | Auth (Credentials + Google OAuth) |
| Supabase | 2 | Primäre Datenbank |
| Airtable REST | — | Legacy (API-Proxy noch vorhanden) |

---

## Datenbank — Supabase

**URL:** `https://fczogpmkldmgaiyiysyv.supabase.co`  
**Credentials:** `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Client:** `lib/supabase.ts`

### Tabellen

| Tabelle | Wichtigste Spalten | Zweck |
|---|---|---|
| `appointments` | customer_name, service, employee, date, start_time, duration, total_amount, deposit_paid, deposit_amount, status, channel, customer_phone, notes | Termine |
| `customers` | name, email, phone, preferred_service, total_visits, total_revenue, is_vip, last_visit | Kundenstamm |
| `services` | name, duration_min, price_min, price_max, category, active | Dienstleistungen |
| `service_settings` | service_id (PK), active, overrides (JSONB) | Aktiv/Overrides für statischen Katalog |
| `shifts` | employee, date, start_time, end_time, note | Mitarbeiterschichten |
| `settings` | id=1, gmail_refresh_token, google_calendar_refresh_token, gmail_email | Google OAuth Tokens (Tenant-weit) |

RLS aktiviert mit offener Policy (`USING (true)`) — für Produktion auf echte User-Auth einschränken.

---

## .env.local (NIE committen)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
AIRTABLE_API_KEY          # Legacy
AIRTABLE_BASE_ID          # Legacy
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
NEXTAUTH_URL
NEXTAUTH_SECRET
NEXT_PUBLIC_BASE_URL
```

---

## API-Routen

| Route | Methoden | Backend |
|---|---|---|
| `/api/appointments` | GET `?date=YYYY-MM-DD`, POST, PATCH | Supabase `appointments` |
| `/api/services` | GET (activeIds+overrides), POST (toggle), PATCH (override) | Supabase `service_settings` |
| `/api/shifts` | GET `?from=&to=`, POST, DELETE | Supabase `shifts` |
| `/api/calendar` | GET | Google Calendar API (Token aus `settings`) |
| `/api/gmail` | GET | Gmail API |
| `/api/stats` | GET | Supabase (Aggregierte Statistiken) |
| `/api/mitarbeiter` | GET, POST | Supabase / Mitarbeiterdaten |
| `/api/auth/*` | — | NextAuth |
| `/api/airtable` | GET | Legacy-Proxy, nicht mehr primär genutzt |

---

## App-Seiten

| Route | Beschreibung |
|---|---|
| `/` | Dashboard: Terminliste heute, Employee-Filter (Aynur/Monika/Lisa), Swipe-to-Cancel, Pull-to-Refresh |
| `/inbox` | Nachrichten-Inbox |
| `/kalender` | Kalenderansicht (Tag/Woche, Schichten, Konflikterkennung) |
| `/crm` | Kundenverwaltung |
| `/analytics` | Charts & Analytics |
| `/reports` | Reports |
| `/winback` | Win-Back Maschine (Kunden-Rückholung per WhatsApp) |
| `/services` | Service-Katalog (64 Services) mit Toggle und Edit-Modal |
| `/mitarbeiter` | Team-Übersicht (Aynur, Monika, Lisa) |
| `/settings` | Einstellungen, Google-Verbindung |
| `/integrations` | Integrationen-Übersicht |
| `/demo/*` | Showroom ohne Auth — re-exportiert alle Hauptseiten |
| `/login` | Login-Seite |
| `/signup` | Registrierung |

---

## Layout — AppShell (`components/layout/AppShell.tsx`)

### Desktop Sidebar (220px, sticky)
- **3 Nav-Sektionen:**
  - Workspace: Übersicht / Inbox / Kalender / Kunden
  - Analyse: Analytics / Reports / Win-Back
  - Konfiguration: Services / Team / Einstellungen / Integrationen
- Aktiver Link: `borderLeft: 2px solid var(--c-accent)` + heller Hintergrund
- Shortcuts (⌘1–5) angezeigt in Nav-Items

### Mobile
- Hamburger → Slide-in Drawer von links (280px, Framer Motion spring)
- Bottom-Navigation: 4 Tabs (Home / Inbox / Kalender / Kunden) + Einstellungen

### UserCard (oben links in Sidebar)
- Zeigt eingeloggten User: Avatar + Name + Plan-Badge
- **Avatar-Upload:** `<input type="file">` → FileReader → base64 → `localStorage` (`cutz_avatar_${email}`)
- **Plan-Badge:** `starter` / `pro` / `custom` — kommt aus `session.user.plan`
- Dropdown-Menü (nach unten): großes Avatar-Bild mit Kamera-Overlay, Plan-Badge mit Crown-Icon, "Profilbild ändern", "Profilbild entfernen", Kontoeinstellungen, Abmelden (`signOut({ callbackUrl: "/login" })`)

### WaitlistBanner + WaitlistModal
- **Banner:** erscheint 3s nach Seitenload, einmal pro Browser-Session (`sessionStorage("waitlist_shown")`)
- Zeigt freigewordenen Slot: `FREED_SLOT = { time: "14:00", duration: 60, employee: "Aynur", service: "Damenhaarschnitt" }`
- Gold-linker-Rand, Bell-Icon, dismissbar
- CTA "Jetzt alle fragen" → öffnet WaitlistModal
- **Modal:** 3 Wartelisten-Kunden (`WAITLIST_CUSTOMERS`), je mit Avatar, Telefon, Dienstleistung, Nachrichtenvorschau, WhatsApp-Button
- Bulk-Send: alle 3 WhatsApp-Tabs mit 600ms Versatz
- Nachrichten via `wa.me/{phone}?text={encoded}` Deep Links

### SupportModal
- Kategorie-Dropdown (6 Optionen), optionaler Betreff, Pflicht-Freitext
- Öffnet `mailto:ejs-solution@outlook.de` mit vorausgefülltem Betreff + Body
- Unten links in Sidebar als "Support kontaktieren" Button

### Paul-Status-Card
- Grüner Puls-Dot (animiert), "47 Aktionen heute", Ø 18s Antwortzeit
- Wird simuliert — kein echter AI-Agent angebunden

---

## Kalender (`app/kalender/page.tsx`)

### Views
- **Tab "Termine":** Tag-Ansicht / Woche-Ansicht umschaltbar
- **Tab "Schichten":** Wochenübersicht der Mitarbeiter-Schichten

### Features
- Employee-Tabs: Aynur / Monika / Lisa (in Tagansicht)
- Zeitachse: 08:00–20:00, 1px = 1min
- `apptTop(time)`: Pixel-Offset ab 08:00
- `apptH(duration)`: Höhe in Pixel (min 24px)
- **Konflikterkennung:** `hasConflict(a, pool)` — prüft Überschneidung per Zeitminuten
- Konflikt-Appointments: rote Linien + Warnsymbol
- **Woche:** `getMonday(d)` + `weekDates(monday)` für 7-Tage-Spalten

### Schicht-Templates (statisch, `SHIFT_TMPL`)
```ts
Aynur:  Mo–Sa 09:00–18:00
Monika: Mo–Fr 09:00–17:00
Lisa:   Di–Sa 10:00–18:00
```

### NewApptSlideOver
- Slide-in von rechts (Framer Motion), Backdrop
- Felder: Kunde, Telefon, Service (Autocomplete aus 64er-Katalog), Mitarbeiter, Datum, Uhrzeit, Dauer, Preis, Anzahlung, Notiz
- Optimistisches State-Update → dann POST `/api/appointments`

---

## Win-Back Maschine (`app/winback/page.tsx`)

### Konzept
Zeigt Stammkunden die seit 4+ Monaten nicht mehr da waren. Sendet personalisierte WhatsApp-Nachricht mit 10%-Gutschein.

### Features
- 15 Mock-Kunden (hardcoded) mit: Name, Telefon, letzter Besuch, Monate abwesend, Lieblingsservice, Ø Umsatz
- **Filter-Tabs:** 3 / 4 / 6 / 12+ Monate
- **Sort:** Dauer / Wert / Besuche
- **Statistik-Header:** Anzahl inaktiver Kunden, Ø Abwesenheit, potenzieller Umsatz
- **Checkbox-Selektion** + Batch-Aktion-Bar "Kampagne starten"
- Urgency-Farben: rot ≥8 Monate, orange ≥6, gold ≥4

### CampaignModal
- Zeigt alle ausgewählten Kunden mit Nachrichtenvorschau-Toggle
- Fortschrittsbalken wächst mit jedem gesendeten WhatsApp
- "Alle X gleichzeitig kontaktieren" — öffnet alle WhatsApp-Tabs mit 600ms Versatz
- **Gutscheincode:** `COMEBACK10` (10% Rabatt, 30 Tage gültig)

### Nachrichtenformat
```
Hallo {Vorname}! 👋
Ein Termin bei {Mitarbeiter} ist gerade freigeworden ...
🎁 Gutscheincode: COMEBACK10
```

---

## Integrations-Seite (`app/integrations/page.tsx`)

| Integration | Status | Aktion |
|---|---|---|
| Google Kalender | live-check via `/api/calendar` | "Verbinden" → `/api/auth/google` |
| Gmail | disconnected (dummy) | "Verbinden" → `/api/auth/google` |
| WhatsApp Business | coming_soon (Q3 2026) | — |
| Instagram DM | coming_soon (Q3 2026) | — |
| Stripe | coming_soon (Q4 2026) | — |
| Airtable | immer "connected" | — |

- Custom SVGs: `GoogleIcon`, `WhatsAppIcon`, `StripeIcon`, `InstagramIcon` (mit Gradient), `AirtableIcon`
- "Integration anfragen →" → `mailto:ejs-solution@outlook.de?subject=Integration%20Anfrage`

---

## Services-Seite (`app/services/page.tsx`)

- 64 Services aus `lib/services-catalog.ts` (ServiceCatalogItem, ServiceCategory)
- Toggle: aktiviert/deaktiviert Service via POST `/api/services`
- Edit-Modal: Preis-Range und Dauer überschreiben via PATCH `/api/services`
- Filter nach Kategorie

---

## Demo-Modus (`app/demo/`)

Alle Demo-Seiten re-exportieren die echten App-Seiten:
```ts
export { default } from "@/app/page"; // app/demo/page.tsx
```
Kein Auth-Requirement — für Showroom/Präsentationen.  
`lib/showroom-context.tsx` stellt ShowroomContext bereit (falls Demomodus erkannt werden soll).

---

## Komponenten

### `components/layout/`
- `AppShell.tsx` — Haupt-Layout (Sidebar, Header, Mobile-Nav, Modals)
- `ThemeProvider.tsx` — Dark/Light Mode Context + `useTheme()` Hook

### `components/dashboard/`
- `AnimatedPage.tsx` — Framer Motion Page-Wrapper (`opacity: 0→1, y: 8→0`)
- `CountUp.tsx` — Animierter Zahlen-Counter (Recharts/Custom)
- `Sparkline.tsx` — Mini-Liniendiagramm für Metriken-Cards

### `components/ui/`
- Misc UI-Primitives (Buttons, Badges, etc.)

---

## Lib-Dateien (`lib/`)

| Datei | Inhalt |
|---|---|
| `supabase.ts` | Supabase Client + TypeScript-Typen (`DbAppointment`, `DbCustomer`, `DbService`) |
| `mock-data.ts` | Fake-Daten für Beta-/Demo-Modus |
| `services-catalog.ts` | Statischer 64er-Service-Katalog mit Kategorien |
| `beta-context.tsx` | React Context für Beta-Modus Toggle (Mock ↔ Echtdaten) |
| `showroom-context.tsx` | Context für Demo-/Showroom-Modus |
| `auth.ts` | NextAuth Konfiguration (CredentialsProvider) |
| `google-auth.ts` | Google OAuth Helpers, Token aus Supabase `settings` lesen/schreiben |
| `airtable.ts` | Legacy Airtable-Proxy-Helpers |
| `utils.ts` | Gemeinsame Hilfsfunktionen |

---

## Design-System

CSS-Variablen in `globals.css`, umgeschaltet per `.dark`-Klasse auf `<html>`:

```
--c-bg              Haupt-Hintergrund        Dark: #0A0908
--c-bg-elevated     Sidebar, Cards           Dark: #111110
--c-bg-subtle       Hover, Zeilen            Dark: #1A1917
--c-bg-strong       Badges, Chips            Dark: #242320
--c-fg              Text primär              Dark: #FAF8F3
--c-fg-subtle       Text sekundär
--c-fg-muted        Text gedämpft
--c-fg-faint        Text fast unsichtbar
--c-accent          Champagne Gold           #D4B077
--c-accent-fg       Text auf Gold            Dunkel
--c-accent-bg       Gold transparent
--c-border          Rahmen
--c-success         Grün                     #22c55e
--c-danger          Rot                      #ef4444
```

Animationen: immer `ease: [0.25, 0.46, 0.45, 0.94]` als Custom-Bezier.

---

## Auth-Flow

- **Login:** `NextAuth` CredentialsProvider (`/login` → `pages.signIn`)
- **Geschützte Routen:** `middleware.ts` leitet nicht-authentifizierte User auf `/login` um
- **AUTH_ROUTES** (`/login`, `/signup`): AppShell rendert nur `{children}` ohne Sidebar
- **Google OAuth (separat):** `/api/auth/google` → holt `access_token` + `refresh_token` → speichert in Supabase `settings` (id=1)
- Google Scopes: Calendar + Gmail readonly

---

## Bekannte Eigenheiten

- `.next/types/routes.d 2.ts` — doppelte TS-Definitionen (generierte Datei, harmlos, kein Runtime-Einfluss)
- `middleware.ts` in Next.js 16.2.6 deprecated → ggf. in `proxy.ts` umbenennen
- Avatar-Speicherung via `localStorage` (kein Upload-Endpoint) — kann später auf Supabase Storage / S3 erweitert werden
- Mitarbeiter-Seite läuft noch auf lokalem State, nicht Supabase
- WhatsApp-Nachrichten: `wa.me/{E.164-Nummer}?text={encodeURIComponent(text)}`
- Bulk-WhatsApp: mehrere Tabs mit `setTimeout(fn, i * 600)` Versatz öffnen

---

## Offene Punkte

- [ ] RLS-Policies auf echte User-Auth einschränken (aktuell `USING (true)`)
- [ ] CRM-Seite auf Supabase `customers` umstellen (aktuell Mock)
- [ ] Mitarbeiter-Seite auf Supabase `shifts` umstellen
- [ ] Analytics mit echten Supabase-Aggregaten befüllen
- [ ] Avatar-Upload auf Supabase Storage migrieren
- [ ] WhatsApp Business API ersetzen WA-Deep-Links (Q3 2026)
- [ ] Stripe-Integration für Online-Anzahlungen (Q4 2026)
