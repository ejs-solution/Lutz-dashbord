import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Mandanten-Trennung (Multi-Tenant) auf App-Ebene.
// Jede Salon-Zeile trägt eine tenant_id (FK -> tenants). Die API-Routen lesen die
// tenant_id aus der Login-Session und filtern/schreiben ausschließlich für diesen Salon.
// service_role umgeht RLS, deshalb ist DIESE Filterung die eigentliche Salon-Isolation.

export const MAINCUT_TENANT_ID = "8ef51fd0-e5b1-4cf4-b0cf-41d7a354b3e8";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// UUID, die auf keinen Salon passt -> Reads liefern fail-closed 0 Zeilen.
const NO_TENANT = "00000000-0000-0000-0000-000000000000";

type SessionUser = { tenantId?: string } | undefined;

// Sicherheits-Schalter für Mehr-Salon-Betrieb.
// STANDARD (aus): Maincut-Fallback, solange nur ein Salon existiert (Demo-Login +
// Alt-Sessions haben keine gültige UUID) -> heutiges Verhalten, nichts bricht.
// STRIKT (TENANT_STRICT=1): kein Fallback. Fehlt eine gültige tenant_id, liefert der
// Read 0 Zeilen und der Write 401. Beim Onboarding von Salon #2 setzen.
const STRICT = process.env.TENANT_STRICT === "1";

function valid(tid: string | undefined): string | null {
  return tid && UUID_RE.test(tid) ? tid : null;
}

/** tenant_id des eingeloggten Salons für GET/Reads. Nie null (fail-closed Sentinel im Strict-Mode). */
export async function getTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const tid = valid((session?.user as SessionUser)?.tenantId);
  if (tid) return tid;
  return STRICT ? NO_TENANT : MAINCUT_TENANT_ID;
}

/** tenant_id für schreibende Routen. null -> Route antwortet 401. */
export async function requireTenantId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const tid = valid((session.user as SessionUser)?.tenantId);
  if (tid) return tid;
  return STRICT ? null : MAINCUT_TENANT_ID;
}
