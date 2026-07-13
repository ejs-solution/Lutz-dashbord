-- ============================================================================
-- KRITISCH: Google-Refresh-Tokens in `settings` vor dem öffentlichen anon-Key schützen
-- ============================================================================
-- Problem: `settings` hat aktuell eine `allow_all`-RLS-Policy. Der anon-Key steckt
-- via NEXT_PUBLIC_ in jedem Browser-Bundle -> jeder kann `gmail_refresh_token` /
-- `google_calendar_refresh_token` (= Dauer-Vollzugriff aufs Google-Konto) auslesen.
--
-- VORAUSSETZUNGEN, BEVOR DU DAS AUSFÜHRST:
--   1. SUPABASE_SERVICE_ROLE_KEY in ~/Desktop/aria-dashboard/.env.local eintragen
--      (Supabase Dashboard -> Settings -> API -> service_role). NICHT NEXT_PUBLIC_.
--   2. Der Server nutzt bereits `lib/supabase-admin.ts` (service_role) für settings
--      (lib/google-auth.ts wurde umgestellt). service_role umgeht RLS -> Kalender/Gmail
--      funktionieren weiter. Der Browser (anon) wird geblockt.
--   3. Dev-Server neu starten, damit der neue Key geladen wird.
--
-- Danach diese Migration im Supabase-SQL-Editor (Frankfurt-Projekt) ausführen:

alter table public.settings enable row level security;

-- allow_all entfernen -> ohne permissive Policy kann anon/authenticated nicht mehr lesen
drop policy if exists allow_all_settings on public.settings;

-- Optional (Defense in Depth): SELECT auf die Token-Spalten für anon explizit entziehen
revoke select (gmail_refresh_token, google_calendar_refresh_token) on public.settings from anon;
revoke select (gmail_refresh_token, google_calendar_refresh_token) on public.settings from authenticated;

-- Verifikation: mit anon-Key `select * from settings` -> muss leer/ohne Tokens sein.
-- Server (service_role) muss weiterhin lesen können (Kalender/Gmail testen).

-- WICHTIG danach: Die Tokens galten als exponiert -> in Google (myaccount.google.com ->
-- Sicherheit -> Drittanbieter-Zugriff) widerrufen und die App neu verbinden.
