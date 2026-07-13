import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-only Supabase-Client.
 *
 * Nutzt den `service_role`-Key (umgeht RLS) für sensible Server-Operationen —
 * v. a. das Lesen/Schreiben der Google-Refresh-Tokens in der `settings`-Tabelle.
 * So können die Token-Spalten per RLS für den öffentlichen anon-Key gesperrt
 * werden, ohne dass Kalender/Gmail auf dem Server brechen.
 *
 * Solange `SUPABASE_SERVICE_ROLE_KEY` NICHT in der .env.local gesetzt ist, fällt
 * der Client auf den anon-Key zurück (nichts bricht) — dann greift die
 * settings-RLS-Absicherung aber noch nicht. Siehe hasServiceRole.
 *
 * WICHTIG: Diese Datei niemals in Client-/Browser-Komponenten importieren.
 */
export const supabaseAdmin = createClient(url, serviceKey || anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** true, wenn der service_role-Key konfiguriert ist (dann ist der RLS-Lock aktivierbar). */
export const hasServiceRole = Boolean(serviceKey);
