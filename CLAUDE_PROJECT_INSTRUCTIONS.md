# CUTZ Solution — Claude Project Instructions

Du arbeitest an **CUTZ Solution (ARIA Dashboard)**, einem B2B SaaS-Produkt für Friseursalons.  
Projektpfad: `~/Desktop/aria-dashboard` | Dev-Server: `npm run dev` → http://localhost:3000

---

## Kontext

CUTZ Solution hilft Friseursalons beim Verwalten von Terminen, Kunden und Mitarbeitern. Der KI-Agent "Paul" beantwortet Kundenanfragen automatisch und bucht Termine. Das Dashboard ist das Backend-Tool für den Salon-Besitzer.

Mitarbeiterinnen: **Aynur, Monika, Lisa** — diese Namen immer exakt so verwenden.  
Kontakt-E-Mail: `ejs-solution@outlook.de`  
Support-URL: `mailto:ejs-solution@outlook.de`

---

## Tech-Stack

- **Next.js 16.2.6** App Router mit Turbopack — NICHT der klassische Pages Router
- **React 19**, TypeScript strict, Tailwind CSS v4 (`@import "tailwindcss"`)
- **Framer Motion 12** für alle Animationen
- **Supabase** als primäre Datenbank (`lib/supabase.ts`)
- **NextAuth v4** für Auth (CredentialsProvider; Google OAuth separat für Calendar/Gmail)
- Kein Airtable mehr außer Legacy-Proxy (`/api/airtable`)

---

## Coding-Regeln

### Immer
- TypeScript strict — keine `any`, keine `!` außer wo unvermeidlich
- Inline-Styles mit CSS-Variablen (`var(--c-accent)`, `var(--c-fg)`, etc.) — kein hardcoded `#D4B077` außer in SVGs
- Framer Motion für alle sichtbaren Übergänge: `initial/animate/exit`
- Deutsche UI-Texte (Buttons, Labels, Meldungen) — das Produkt ist für den deutschsprachigen Markt
- Bezier-Kurve für Animationen: `ease: [0.25, 0.46, 0.45, 0.94]`

### Nie
- `.env.local` anfassen, ausgeben oder committen
- `console.log` in Production-Code lassen
- Neue npm-Pakete installieren ohne Rückfrage
- Bestehende Komponenten grundlos umstrukturieren (nur das ändern was gefragt wird)
- Kommentare die erklären WAS der Code tut — nur WARUM wenn nicht offensichtlich
- `any` als Typ verwenden

---

## Design-System (CSS-Variablen)

```
--c-bg              Haupt-Hintergrund
--c-bg-elevated     Sidebar, Cards, Modals
--c-bg-subtle       Hover-States, Tabellenzeilen
--c-bg-strong       Badges, Chips, Trenner
--c-fg              Primärer Text
--c-fg-subtle       Sekundärer Text
--c-fg-muted        Gedämpfter Text
--c-accent          Gold #D4B077 — Akzentfarbe, CTAs, aktive Links
--c-accent-fg       Text auf Gold-Hintergrund (dunkel)
--c-border          Rahmenfarbe
--c-success         Grün
--c-danger          Rot
```

Dark/Light Mode wird über `.dark`-Klasse auf `<html>` umgeschaltet.  
`ThemeProvider` in `components/layout/ThemeProvider.tsx` — `useTheme()` Hook verwenden.

---

## Datenbankzugriff

Supabase-Client aus `lib/supabase.ts` importieren:
```ts
import { supabase } from "@/lib/supabase";
```

**Tabellen:** `appointments`, `customers`, `services`, `service_settings`, `shifts`, `settings`

Alle API-Routen liegen in `app/api/`. Neue Datenbankzugriffe immer über API-Routen, nicht direkt vom Client (außer bei `use client` Seiten die `supabase` direkt nutzen).

---

## AppShell & Layout

`components/layout/AppShell.tsx` ist die Haupt-Datei für Sidebar, Header, mobile Nav und alle globalen Modals (SupportModal, WaitlistBanner/Modal).

- Desktop: 220px Sidebar sticky links
- Mobile: Slide-in Drawer + Bottom-Nav (4 Tabs)
- `AUTH_ROUTES = ["/login", "/signup"]` — diese Seiten kriegen keine Sidebar

**Neue Seiten** müssen in `PAGE_LABELS` und ggf. in einer der Nav-Konstanten (`WORKSPACE`, `ANALYSE`, `CONFIG`) eingetragen werden.

---

## WhatsApp-Integration

Nachrichten werden als Deep Links geöffnet — kein eigener Server:
```ts
const url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
window.open(url, "_blank");
```

Bulk-Send (mehrere Empfänger): `setTimeout(fn, i * 600)` damit Browser die Tabs erlaubt.  
Nachrichten auf Deutsch, informell (du), mit Emojis, WhatsApp-Bold via `*Text*`.

---

## Wichtige Dateien

| Datei | Wofür |
|---|---|
| `components/layout/AppShell.tsx` | Sidebar, Header, Modals, Nav |
| `lib/supabase.ts` | DB-Client + alle TypeScript-Typen |
| `lib/services-catalog.ts` | 64 Services mit Kategorien (statisch) |
| `lib/mock-data.ts` | Fake-Daten für Demo/Beta-Modus |
| `lib/beta-context.tsx` | Context: Mock-Daten vs. echte Supabase-Daten |
| `app/globals.css` | CSS-Variablen, Design-Tokens, globale Styles |

---

## Bekannte Eigenheiten

- `.next/types/routes.d 2.ts` — TS-Fehler durch doppelte generierte Datei, harmlos, ignorieren
- `middleware.ts` deprecated in Next.js 16.2.6, funktioniert aber noch
- Avatar-Upload via `localStorage` (base64) — kein Upload-Endpoint vorhanden
- WaitlistBanner: `sessionStorage("waitlist_shown")` verhindert doppelte Anzeige pro Session
- Mitarbeiter-Seite noch auf lokalem State — noch nicht auf Supabase umgestellt

---

## Wenn du eine neue Seite baust

1. Datei anlegen: `app/{route}/page.tsx`
2. `"use client"` oben wenn State/Effects gebraucht werden
3. In `PAGE_LABELS` in AppShell.tsx eintragen
4. In die passende Nav-Konstante (`WORKSPACE`, `ANALYSE` oder `CONFIG`) eintragen
5. Demo-Seite: `app/demo/{route}/page.tsx` mit `export { default } from "@/app/{route}/page"`
6. Seiten-Header immer mit dem gleichen Muster: Icon-Box (32px, `rgba(212,176,119,0.12)`) + `<h1>` + Subtitle

---

## Wenn du ein Modal baust

Standard-Struktur:
```
- Backdrop: position fixed, inset 0, blur(6-8px), zIndex 500
- Modal: position fixed, top/left 50%, translate(-50%,-50%), zIndex 501
- AnimatePresence mit spring (stiffness 320-340, damping 28)
- Farbiger Top-Balken: 3-4px height, background gradient gold
- Schließen: X-Button oben rechts + Backdrop-Klick
```
