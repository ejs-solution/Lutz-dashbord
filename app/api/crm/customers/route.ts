import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/tenant";

// Aggregiert echte Termine zu Kunden (Besuche, Umsatz, letzter Besuch) — für die CRM-Seite.
type Cust = {
  name: string; email: string | null; phone: string | null;
  visits: number; revenue: number; lastVisit: string | null; lastService: string | null;
};

export async function GET() {
  const tid = await getTenantId();
  const { data } = await supabase
    .from("appointments")
    .select("customer_name, customer_phone, customer_email, service, date, total_amount, status")
    .eq("tenant_id", tid);

  const map = new Map<string, Cust>();
  for (const a of data ?? []) {
    const name = (a.customer_name ?? "").trim();
    if (!name || name === "Unbekannt") continue;
    const key = name.toLowerCase();
    let c = map.get(key);
    if (!c) { c = { name, email: null, phone: null, visits: 0, revenue: 0, lastVisit: null, lastService: null }; map.set(key, c); }
    c.name = name;
    if (a.customer_email && !c.email) c.email = a.customer_email as string;
    if (a.customer_phone && !c.phone) c.phone = a.customer_phone as string;
    if (a.status !== "cancelled") { c.visits += 1; c.revenue += Number(a.total_amount ?? 0); }
    if (!c.lastVisit || (a.date as string) > c.lastVisit) { c.lastVisit = a.date as string; c.lastService = a.service as string; }
  }

  const customers = [...map.values()].sort((x, y) => (y.lastVisit ?? "").localeCompare(x.lastVisit ?? ""));
  return NextResponse.json({ customers }, { headers: { "Cache-Control": "no-store" } });
}
