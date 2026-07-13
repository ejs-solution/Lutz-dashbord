// Server-only: nutzt den service_role-Key, damit die Google-Tokens per RLS vor dem
// öffentlichen anon-Key geschützt sind, ohne dass diese Server-Reads/-Writes brechen.
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI!;

// Maincut-Salon: Fallback-Ziel für die Legacy-Tokens aus `settings` (id=1),
// bis Google pro Salon neu verbunden wurde.
const MAINCUT_TENANT_ID = "8ef51fd0-e5b1-4cf4-b0cf-41d7a354b3e8";

/* ─── Exchange code → tokens ─────────────────────────────── */
export async function exchangeCode(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json() as { access_token?: string; refresh_token?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data as { access_token: string; refresh_token: string };
}

/* ─── Refresh → access token ─────────────────────────────── */
export async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(data.error ?? "Token refresh failed");
  return data.access_token;
}

/* ─── Google-Tokens pro Salon (tenants) ──────────────────── */
export type GoogleTokens = {
  gmail_refresh_token?: string | null;
  google_calendar_refresh_token?: string | null;
  gmail_email?: string | null;
};

// Liest die Google-Tokens des Salons aus `tenants`. Fehlen sie dort (noch),
// Fallback auf die Legacy-Tabelle `settings` (id=1) — nur für Maincut, bis Google
// dort neu verbunden wurde. So bleibt der Einzel-Salon-Betrieb unverändert.
export async function getTenantTokens(tenantId: string): Promise<GoogleTokens> {
  const { data } = await supabase
    .from("tenants")
    .select("gmail_refresh_token, google_calendar_refresh_token, gmail_email")
    .eq("id", tenantId)
    .maybeSingle();

  if (data && (data.gmail_refresh_token || data.google_calendar_refresh_token)) {
    return data as GoogleTokens;
  }

  if (tenantId === MAINCUT_TENANT_ID) {
    const { data: legacy } = await supabase
      .from("settings")
      .select("gmail_refresh_token, google_calendar_refresh_token, gmail_email")
      .eq("id", 1)
      .maybeSingle();
    if (legacy) return legacy as GoogleTokens;
  }
  return {};
}

// Schreibt die Google-Tokens in die tenants-Zeile des Salons.
export async function saveTenantTokens(tenantId: string, fields: GoogleTokens) {
  const { error } = await supabase
    .from("tenants")
    .update(fields)
    .eq("id", tenantId);
  if (error) throw new Error(error.message);
}

/* ─── OAuth URL ──────────────────────────────────────────── */
// state = tenant_id des Salons, damit der Callback den richtigen Salon kennt,
// ohne auf die Login-Session im Rückkanal angewiesen zu sein.
export function buildAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
      "email",
      "profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  if (state) params.set("state", state);
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
