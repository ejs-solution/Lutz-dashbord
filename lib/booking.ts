// Server-only Buchungslogik für die öffentliche Terminseite (/buchen/[slug]).
// Nutzt service_role (supabaseAdmin), da die PII-Tabellen per RLS gesperrt sind.
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { SERVICE_CATALOG, type ServiceCatalogItem } from "@/lib/services-catalog";

// Standard-Öffnungszeiten pro Wochentag (0 = So … 6 = Sa), wenn keine Schichten
// hinterlegt sind. Zeiten in Minuten ab Mitternacht.
const DEFAULT_OPEN: Record<number, { open: number; close: number } | null> = {
  0: null,                          // Sonntag geschlossen
  1: { open: 9 * 60, close: 18 * 60 },
  2: { open: 9 * 60, close: 18 * 60 },
  3: { open: 9 * 60, close: 18 * 60 },
  4: { open: 9 * 60, close: 18 * 60 },
  5: { open: 9 * 60, close: 18 * 60 },
  6: { open: 9 * 60, close: 16 * 60 }, // Samstag
};

const SLOT_STEP = 15;          // Raster in Minuten
const DEFAULT_CONCURRENCY = 3; // parallele Termine, wenn keine Schichten hinterlegt

export type GroupId = "maenner" | "frauen" | "kinder";

export type BookableService = {
  id: string;
  name: string;
  categoryId: string;
  durationMin: number;
  priceMin: number;
  priceMax: number;
  isPackage?: boolean;
};

export type ServiceGroup = {
  id: GroupId;
  label: string;
  featured: BookableService[];
  more: BookableService[];
};

export type SalonPublic = {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  city: string | null;
  logoUrl: string | null;
};

// Kuratierte Top-Pakete pro Kategorie (Kombis aus echten Katalog-Leistungen).
const PACKAGES: { id: string; group: GroupId; name: string; parts: string[] }[] = [
  // Männer
  { id: "pkg-m-cut",      group: "maenner", name: "Haarschnitt",                     parts: ["h-klass"] },
  { id: "pkg-m-cut-bart", group: "maenner", name: "Haarschnitt + Bart",              parts: ["h-klass", "b-schnitt"] },
  { id: "pkg-m-cut-wash", group: "maenner", name: "Haarschnitt + Waschen & Styling", parts: ["h-klass", "p-wash"] },
  // Frauen
  { id: "pkg-f-cut-foehn", group: "frauen", name: "Schneiden + Föhnen",              parts: ["d-mittel", "s-fm"] },
  { id: "pkg-f-wash-cut",  group: "frauen", name: "Waschen, Schneiden & Föhnen",     parts: ["p-wash", "d-mittel", "s-fm"] },
  { id: "pkg-f-color-cut", group: "frauen", name: "Ansatzfarbe + Schnitt",           parts: ["c-ansatz", "d-mittel"] },
  // Kinder
  { id: "pkg-k-cut1",     group: "kinder", name: "Kinderhaarschnitt (bis 10 J.)",   parts: ["h-kid1"] },
  { id: "pkg-k-cut2",     group: "kinder", name: "Kinderhaarschnitt (11–15 J.)",    parts: ["h-kid2"] },
  { id: "pkg-k-cut-wash", group: "kinder", name: "Kinderhaarschnitt + Waschen",     parts: ["h-kid1", "p-wash"] },
];

const GROUP_DEFS: { id: GroupId; label: string }[] = [
  { id: "maenner", label: "Männer" },
  { id: "frauen",  label: "Frauen" },
  { id: "kinder",  label: "Kinder" },
];

const FRAUEN_CATS = new Set(["damen", "welle", "color", "styling", "pflege", "spezial"]);
const KID_IDS = new Set(["h-kid1", "h-kid2"]);

function atomicGroup(id: string, categoryId: string): GroupId | null {
  if (KID_IDS.has(id)) return "kinder";
  if (categoryId === "herren" || categoryId === "bart") return "maenner";
  if (FRAUEN_CATS.has(categoryId)) return "frauen";
  return null;
}

/* ─── Zeit-Helper ────────────────────────────────────────── */
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function toHHMM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/* ─── Salon per Slug (nur sichere Felder) ────────────────── */
export async function getSalonBySlug(slug: string): Promise<SalonPublic | null> {
  const { data } = await supabase
    .from("tenants")
    .select("id, slug, salon_name, phone, address_city, logo_url, active")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || data.active === false) return null;
  return {
    id: data.id, slug: data.slug, name: data.salon_name,
    phone: data.phone ?? null, city: data.address_city ?? null, logoUrl: data.logo_url ?? null,
  };
}

/* ─── Buchbare Einzel-Leistungen (Katalog + service_settings) ─ */
type Override = { durationMin?: number; priceMin?: number; priceMax?: number };

export async function getBookableServices(tenantId: string): Promise<BookableService[]> {
  const { data } = await supabase
    .from("service_settings")
    .select("service_id, active, overrides")
    .eq("tenant_id", tenantId);

  const map = (c: ServiceCatalogItem, o?: Override): BookableService => ({
    id: c.id, name: c.name, categoryId: c.categoryId,
    durationMin: o?.durationMin ?? c.durationMin,
    priceMin: o?.priceMin ?? c.priceMin,
    priceMax: o?.priceMax ?? c.priceMax,
  });

  if (!data || data.length === 0) {
    return SERVICE_CATALOG.filter((c) => c.isOnlineBookable).map((c) => map(c));
  }
  const active = new Set(data.filter((r) => r.active).map((r) => r.service_id as string));
  const ovr = new Map(data.map((r) => [r.service_id as string, (r.overrides ?? {}) as Override]));
  return SERVICE_CATALOG
    .filter((c) => c.isOnlineBookable && active.has(c.id))
    .map((c) => map(c, ovr.get(c.id)));
}

function packageFrom(
  p: { id: string; group: GroupId; name: string; parts: string[] },
  byId: Map<string, BookableService>
): BookableService | null {
  const parts = p.parts.map((id) => byId.get(id));
  if (parts.some((x) => !x)) return null;
  const ps = parts as BookableService[];
  return {
    id: p.id, name: p.name, categoryId: p.group, isPackage: true,
    durationMin: ps.reduce((a, x) => a + x.durationMin, 0),
    priceMin: ps.reduce((a, x) => a + x.priceMin, 0),
    priceMax: ps.reduce((a, x) => a + x.priceMax, 0),
  };
}

/* ─── Gruppen (Männer/Frauen/Kinder) mit Top-3 + Weitere ─── */
export async function getGroups(tenantId: string): Promise<ServiceGroup[]> {
  const atomic = await getBookableServices(tenantId);
  const byId = new Map(atomic.map((s) => [s.id, s]));

  return GROUP_DEFS.map((g) => {
    const featured = PACKAGES.filter((p) => p.group === g.id)
      .map((p) => packageFrom(p, byId))
      .filter((x): x is BookableService => x !== null);
    const more = atomic.filter((s) => atomicGroup(s.id, s.categoryId) === g.id);
    return { id: g.id, label: g.label, featured, more };
  }).filter((g) => g.featured.length > 0 || g.more.length > 0);
}

/* ─── Leistung auflösen (Paket oder Einzel) ──────────────── */
export async function resolveBookable(tenantId: string, serviceId: string): Promise<BookableService | null> {
  const atomic = await getBookableServices(tenantId);
  if (serviceId.startsWith("pkg-")) {
    const p = PACKAGES.find((x) => x.id === serviceId);
    if (!p) return null;
    return packageFrom(p, new Map(atomic.map((s) => [s.id, s])));
  }
  return atomic.find((s) => s.id === serviceId) ?? null;
}

/* ─── Öffnungszeit + Kapazität für einen Tag ─────────────── */
type WindowRow = { employee: string; start_time: string; end_time: string };
function windowFrom(rows: WindowRow[]) {
  const open = Math.min(...rows.map((s) => toMin(s.start_time)));
  const close = Math.max(...rows.map((s) => toMin(s.end_time)));
  const capacity = new Set(rows.map((s) => s.employee)).size || 1;
  return { open, close, capacity };
}

async function dayWindow(tenantId: string, dateStr: string) {
  // 1. Datum-spezifische Schichten (Ausnahmen an einem konkreten Tag) haben Vorrang.
  const { data: shifts } = await supabase
    .from("shifts")
    .select("employee, start_time, end_time")
    .eq("tenant_id", tenantId)
    .eq("date", dateStr);
  if (shifts && shifts.length > 0) return windowFrom(shifts as WindowRow[]);

  // 2. Wöchentliche Arbeitszeiten (work_hours) — die reguläre Verfügbarkeit.
  const weekday = new Date(dateStr + "T00:00:00").getDay();
  const { data: wh } = await supabase
    .from("work_hours")
    .select("employee, start_time, end_time")
    .eq("tenant_id", tenantId)
    .eq("weekday", weekday);
  if (wh && wh.length > 0) {
    // Urlaub/Abwesenheiten an diesem Tag herausrechnen.
    const { data: abs } = await supabase
      .from("absences")
      .select("employee")
      .eq("tenant_id", tenantId)
      .lte("from_date", dateStr)
      .gte("to_date", dateStr);
    const absent = new Set((abs ?? []).map((x) => x.employee));
    const avail = (wh as WindowRow[]).filter((w) => !absent.has(w.employee));
    if (avail.length === 0) return null; // alle abwesend → geschlossen
    return windowFrom(avail);
  }

  // 3. Fallback: Standard-Öffnungszeiten.
  const def = DEFAULT_OPEN[weekday];
  if (!def) return null;
  return { open: def.open, close: def.close, capacity: DEFAULT_CONCURRENCY };
}

/* ─── Freie Slots für Leistung + Tag ─────────────────────── */
export async function computeSlotsForDuration(
  tenantId: string, duration: number, dateStr: string, excludeApptId?: string
): Promise<{ slots: string[]; duration: number }> {
  const win = await dayWindow(tenantId, dateStr);
  if (!win) return { slots: [], duration };

  const { data: appts } = await supabase
    .from("appointments")
    .select("id, start_time, duration")
    .eq("tenant_id", tenantId)
    .eq("date", dateStr)
    .neq("status", "cancelled");

  const booked = (appts ?? [])
    .filter((a) => a.id !== excludeApptId)  // eigenen Termin beim Umbuchen nicht als belegt zählen
    .map((a) => {
      const s = toMin(a.start_time);
      return { start: s, end: s + (a.duration ?? 60) };
    });

  const now = new Date();
  const isToday = dateStr === now.toISOString().slice(0, 10);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  for (let t = win.open; t + duration <= win.close; t += SLOT_STEP) {
    if (isToday && t <= nowMin + 30) continue;
    const overlap = booked.filter((b) => t < b.end && t + duration > b.start).length;
    if (overlap < win.capacity) slots.push(toHHMM(t));
  }
  return { slots, duration };
}

export async function computeSlots(
  tenantId: string, serviceId: string, dateStr: string
): Promise<{ slots: string[]; duration: number } | null> {
  const service = await resolveBookable(tenantId, serviceId);
  if (!service) return null;
  return computeSlotsForDuration(tenantId, service.durationMin, dateStr);
}
