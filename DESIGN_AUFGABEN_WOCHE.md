# Design-Aufgaben der Woche — CUTZ Solution (ARIA Dashboard)

## ⚠️ WICHTIGSTE REGEL: NUR DESIGN. NICHTS AN DER FUNKTION.

Du machst diese Woche **ausschließlich Design/Optik**. Du änderst **nichts** an:
- der **Funktionalität** (keine Logik, keine Datenflüsse, keine Buttons „umverdrahten")
- dem **Login / Auth** (die *Login-Seite darfst du optisch verschönern*, aber die **Anmelde-Logik, NextAuth, Passwörter, API** bleiben unangetastet)
- den **Einstellungen** (die Seite `app/settings/` **komplett in Ruhe lassen** — macht Elias selbst)

Wenn du unsicher bist, ob etwas „Design" oder „Funktion" ist → **Finger weg und nachfragen.**

---

## Kontext

- **Was:** B2B-Dashboard für Friseursalons. Marke „CUTZ Solution", Produkt „ARIA".
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4, Framer Motion 12.
- **Starten:** `npm run dev` → http://localhost:3000
- **Live:** läuft auf Vercel (`cutzdashboard.vercel.app`) — **du deployst nicht**, das macht Elias.

---

## Design-Grundregeln (unbedingt einhalten)

- **Farben nur über CSS-Variablen** aus `app/globals.css`: `var(--c-bg)`, `var(--c-bg-elevated)`, `var(--c-fg)`, `var(--c-fg-muted)`, `var(--c-accent)` (Gold `#D4B077`), `var(--c-border)`, `var(--c-success)`, `var(--c-danger)` usw. **Keine hardcodierten Hex-Farben** (außer in SVGs).
- **Dark- UND Light-Mode** müssen beide gut aussehen (Umschaltung über `.dark`-Klasse). Immer beide testen.
- **Animationen** mit Framer Motion, Bezier: `ease: [0.25, 0.46, 0.45, 0.94]`. Sichtbare Übergänge mit `initial` / `animate` / `exit`.
- **Deutsche UI-Texte**, informeller, professioneller Ton.
- **Keine neuen npm-Pakete** installieren.
- **Bestehende Komponenten nicht grundlos umstrukturieren** — nur das anfassen, was fürs Design nötig ist.
- **Mobil + Desktop** testen (die App ist stark mobil genutzt).

---

## Deine Aufgaben

### 1. Allgemeiner Feinschliff — „soll schön aussehen"
Das Gesamtbild stimmiger und hochwertiger machen: einheitliche Abstände, Rundungen, Typo-Hierarchie, Hover-States, konsistente Karten/Buttons. Ziel: wirkt wie aus einem Guss, premium.

### 2. „Support kontaktieren" (Sidebar unten links) — ganz sichtbar machen
Der Button unten in der Sidebar (`components/layout/AppShell.tsx`) darf **nie abgeschnitten** sein — auch nicht auf kleinen Laptops oder in Safari. Sorge dafür, dass der untere Sidebar-Block (Paul-Karte, „Support kontaktieren", Impressum/Datenschutz) **immer vollständig im Bild** ist. (Hinweis: `100dvh` statt `100vh`, unteren Bereich pinnen, Navigation scrollt.)

### 3. Untere Leiste (Mobile Bottom-Nav) — überarbeiten oder entfernen
Die mobile Bottom-Navigation (in `AppShell.tsx`) gefällt so nicht. Entweder **schöner gestalten** (sauberer, moderner) **oder ganz entfernen** — entscheide, was besser aussieht, und setz es konsistent um. Wichtig: die **Navigation muss weiter funktionieren** (Links bleiben, nur Optik ändern).

### 4. Layout-Bugs entfernen
Abgeschnittene/halbe Texte, überlappende Elemente, falsche Abstände, Overflow-Probleme, Dinge die „aus dem Raster" fallen. Systematisch durch die Seiten gehen und sauber machen.

### 5. Login-Seite verschönern (`app/login/page.tsx`)
Die Login-Seite optisch aufwerten (Layout, Branding, Ruhe, Hochwertigkeit). **NUR die Optik** — das Anmelde-Formular, die Felder-Namen, die `signIn`-Logik und alles unter `app/api/auth/` bleiben **exakt wie sie sind**.

---

## ⛔ NICHT ANFASSEN (Tabu-Zone)

- `app/settings/` (Einstellungen) — **komplett**, macht Elias
- `app/api/**` (alle API-Routen), `lib/**` (Logik, Supabase, Auth, Booking, Tenant, Google)
- **Login-/Auth-Logik**: `lib/auth.ts`, `app/api/auth/**`, NextAuth, Passwörter, Sessions
- **Datenbank / Supabase**, **n8n**, **`.env.local`** (niemals öffnen, ändern oder committen)
- Keine Änderung an Datenmodellen, Feldnamen, Requests, Zuständen/Hooks-Logik
- Kein `console.log` im Code lassen, kein `any` als Typ

Wenn eine Design-Änderung *zwingend* Logik berühren würde → **stoppen und mit Elias abstimmen.**

---

## Arbeitsweise

1. Eigenen **Branch** anlegen (`git checkout -b design-woche`), nicht direkt auf `main` arbeiten.
2. `npm run dev` und im Browser gegenprüfen — **Dark + Light + Mobile + Desktop**.
3. Nach jeder Änderung `npx tsc --noEmit` laufen lassen → muss **fehlerfrei** sein.
4. Kleine, saubere Commits mit klaren Nachrichten.
5. **Nicht deployen.** Wenn fertig: Branch pushen und Elias Bescheid geben — er reviewt und deployt.

Bei Fragen oder wenn etwas an Funktion/Login/Einstellungen grenzt: **erst fragen, dann machen.**
