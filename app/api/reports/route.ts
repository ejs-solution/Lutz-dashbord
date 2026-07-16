import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/tenant";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Zeitraum-Bericht: Kennzahlen, Top-Services, Top-Kunden, Kanäle.
export async function GET(req: NextRequest) {
  const tid = await getTenantId();
  const period = new URL(req.url).searchParams.get("period") ?? "month";

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let from: string | null = null;
  if (period === "week") { const d = new Date(today); d.setDate(today.getDate() - 6); from = iso(d); }
  else if (period === "month") { const d = new Date(today); d.setDate(today.getDate() - 29); from = iso(d); }
  // "all" → from bleibt null

  let q = supabase
    .from("appointments")
    .select("customer_name, service, date, total_amount, status, channel")
    .eq("tenant_id", tid);
  if (from) q = q.gte("date", from);
  const { data } = await q;

  const rows = data ?? [];
  const active = rows.filter((r) => r.status !== "cancelled");
  const cancelled = rows.length - active.length;
  const revenue = active.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);

  const byChannel: Record<string, number> = {};
  for (const r of active) { const c = (r.channel as string) ?? "phone"; byChannel[c] = (byChannel[c] ?? 0) + 1; }

  const svc = new Map<string, { count: number; revenue: number }>();
  for (const r of active) {
    const k = (r.service as string) ?? "—";
    const e = svc.get(k) ?? { count: 0, revenue: 0 };
    e.count += 1; e.revenue += Number(r.total_amount ?? 0); svc.set(k, e);
  }
  const topServices = [...svc.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 6);

  const cust = new Map<string, { visits: number; revenue: number }>();
  for (const r of active) {
    const k = ((r.customer_name as string) ?? "").trim();
    if (!k || k === "Unbekannt") continue;
    const e = cust.get(k) ?? { visits: 0, revenue: 0 };
    e.visits += 1; e.revenue += Number(r.total_amount ?? 0); cust.set(k, e);
  }
  const topCustomers = [...cust.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  return NextResponse.json(
    { period, count: active.length, revenue, cancelled, avgValue: active.length ? Math.round(revenue / active.length) : 0, byChannel, topServices, topCustomers },
    { headers: { "Cache-Control": "no-store" } }
  );
}
