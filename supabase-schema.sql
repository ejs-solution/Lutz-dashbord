-- ============================================================
-- CUTZ Solution — Supabase Schema
-- Ausführen in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Termine ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT    NOT NULL,
  service       TEXT    NOT NULL,
  employee      TEXT    NOT NULL CHECK (employee IN ('Aynur','Monika','Lisa')),
  date          DATE    NOT NULL,
  start_time    TEXT    NOT NULL,   -- 'HH:MM'
  duration      INTEGER NOT NULL DEFAULT 60,
  total_amount  NUMERIC(10,2) DEFAULT 0,
  deposit_paid  BOOLEAN DEFAULT FALSE,
  deposit_amount NUMERIC(10,2),
  status        TEXT    DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','pending','completed','cancelled')),
  channel       TEXT    DEFAULT 'phone'
                  CHECK (channel IN ('whatsapp','instagram','phone','email')),
  customer_phone TEXT,
  notes         TEXT
);

-- Index für schnelle Datumsabfragen
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON appointments(employee);

-- ── Kunden ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  preferred_service TEXT,
  total_visits     INTEGER DEFAULT 0,
  total_revenue    NUMERIC(10,2) DEFAULT 0,
  is_vip           BOOLEAN DEFAULT FALSE,
  notes            TEXT,
  last_visit       DATE
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- ── Services ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 60,
  price_min    NUMERIC(10,2) DEFAULT 0,
  price_max    NUMERIC(10,2) DEFAULT 0,
  category     TEXT,
  active       BOOLEAN DEFAULT TRUE
);

-- ── Row Level Security (RLS) ──────────────────────────────────
-- Aktivieren (vorerst: alle können lesen/schreiben mit anon key)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;

-- Temporäre offene Policy (für Entwicklung)
-- Später auf Auth-User einschränken
CREATE POLICY "allow_all_appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_customers"    ON customers    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_services"     ON services     FOR ALL USING (true) WITH CHECK (true);

-- ── Beispieldaten einfügen ────────────────────────────────────
INSERT INTO appointments (customer_name, service, employee, date, start_time, duration, total_amount, deposit_paid, status, channel)
VALUES
  ('Fatma Yilmaz',   'Färben + Schneiden',  'Aynur',  CURRENT_DATE, '09:00', 120, 70,  true,  'confirmed', 'whatsapp'),
  ('Sarah Müller',   'Strähnen + Pflege',   'Monika', CURRENT_DATE, '09:30', 90,  90,  true,  'confirmed', 'whatsapp'),
  ('Kemal Arslan',   'Herrenschnitt',        'Aynur',  CURRENT_DATE, '11:00', 30,  25,  false, 'confirmed', 'phone'),
  ('Emma Johnson',   'Keratin-Behandlung',  'Lisa',   CURRENT_DATE, '12:00', 120, 120, false, 'confirmed', 'email'),
  ('Zeynep Kaya',    'Balayage',            'Monika', CURRENT_DATE, '13:00', 150, 100, true,  'confirmed', 'whatsapp'),
  ('Lena Fischer',   'Haarschnitt + Styling','Lisa',  CURRENT_DATE, '14:30', 60,  45,  false, 'confirmed', 'instagram'),
  ('Mehmet Demir',   'Bart + Schnitt',       'Aynur', CURRENT_DATE, '15:00', 45,  35,  false, 'confirmed', 'phone'),
  ('Anna Schneider', 'Coloration',           'Monika',CURRENT_DATE, '16:00', 120, 80,  true,  'confirmed', 'email')
ON CONFLICT DO NOTHING;

INSERT INTO services (name, duration_min, price_min, price_max, category)
VALUES
  ('Herrenschnitt',      30,  20,  35,  'Schnitt'),
  ('Damenhaarschnitt',   45,  35,  55,  'Schnitt'),
  ('Haarschnitt + Styling', 60, 45, 65, 'Schnitt'),
  ('Färben',             90,  60,  90,  'Farbe'),
  ('Balayage',           150, 90,  130, 'Farbe'),
  ('Strähnen',           120, 80,  110, 'Farbe'),
  ('Keratin-Behandlung', 120, 100, 150, 'Pflege'),
  ('Bart + Schnitt',     45,  30,  40,  'Herren')
ON CONFLICT DO NOTHING;
