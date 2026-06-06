const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI!;
const BASE_ID       = process.env.AIRTABLE_BASE_ID!;
const AT_KEY        = process.env.AIRTABLE_API_KEY!;

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

/* ─── Airtable Tenants helpers ───────────────────────────── */
type TenantFields = {
  gmail_refresh_token?: string;
  google_calendar_refresh_token?: string;
  gmail_email?: string;
};

async function atFetch(path: string, opts?: RequestInit) {
  return fetch(`https://api.airtable.com/v0/${BASE_ID}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${AT_KEY}`,
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
  });
}

export async function getTenant(): Promise<{ id: string; fields: TenantFields }> {
  const res = await atFetch("/Tenants?maxRecords=1");
  const data = await res.json() as { records: { id: string; fields: TenantFields }[] };
  if (!data.records?.[0]) throw new Error("Kein Tenant gefunden");
  return data.records[0];
}

export async function saveTenantTokens(recordId: string, fields: TenantFields) {
  await atFetch(`/Tenants/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}

/* ─── OAuth URL ──────────────────────────────────────────── */
export function buildAuthUrl() {
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
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
