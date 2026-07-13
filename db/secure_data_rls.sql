-- ============================================================================
-- KRITISCH (Teil 2): appointments / customers / leads / shifts / … gegen den
-- öffentlichen anon-Key sperren (Kunden-PII schützen).
-- ============================================================================
-- Aktuell haben diese Tabellen `allow_all`-Policies -> der public anon-Key
-- (steckt in jedem Browser-Bundle) kann alle Datensätze lesen.
--
-- WARUM NICHT SCHON GESCHEHEN: Der anon-Key wird noch aktiv genutzt von:
--   (a) den App-API-Routen  -> BEREITS auf service_role umgestellt (erledigt).
--   (b) dem n8n-Workflow "Cutz-Projekt (Live)" -> nutzt die Credential
--       "Supabase FFM", die aktuell den ANON-Key enthält (lesen + schreiben).
--
-- VORAUSSETZUNG, BEVOR DU DAS AUSFÜHRST:
--   In n8n -> Credentials -> "Supabase FFM" öffnen -> im JSON den anon-Key durch den
--   SERVICE_ROLE-Key ersetzen (bei BEIDEN Headern: apikey UND Authorization: Bearer …).
--   Dann feuert n8n mit service_role (umgeht RLS) und schreibt/liest weiter.
--   -> Danach einen Test-Lauf machen (Buchung + Absage), erst dann diese Migration.
--
-- Danach im Supabase-SQL-Editor (Frankfurt) ausführen:

alter table public.appointments enable row level security;
drop policy if exists allow_all_appointments on public.appointments;

alter table public.customers enable row level security;
drop policy if exists allow_all_customers on public.customers;

alter table public.leads enable row level security;
drop policy if exists allow_all_leads on public.leads;

alter table public.shifts enable row level security;
drop policy if exists allow_all_shifts on public.shifts;

alter table public.services enable row level security;
drop policy if exists allow_all_services on public.services;

alter table public.service_settings enable row level security;
drop policy if exists allow_all_svc_set on public.service_settings;

alter table public.waitlist_entries enable row level security;
drop policy if exists allow_all_waitlist on public.waitlist_entries;

-- Ergebnis: anon/authenticated kommen an KEINE dieser Tabellen mehr ran.
-- service_role (App-Routen + n8n) umgeht RLS und funktioniert weiter.
-- Verifikation: mit dem anon-Key `select * from appointments` -> 0 Zeilen / permission denied.
-- Und: App (Dashboard/Kalender/CRM) + n8n (Buchung/Absage) testen -> müssen weiter gehen.
