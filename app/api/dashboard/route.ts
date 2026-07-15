import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/tenant";

// Lokales Datum (nicht UTC) — sonst je nach Zeitzone einen Tag daneben.
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Kennzahlen der Woche + nächste 7 Tage + nächste Termine für die Übersicht.
export async function GET() {
  const tid = await getTenantId();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayISO = iso(today);

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Montag dieser Woche
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const horizon = new Date(today); horizon.setDate(today.getDate() + 14);

  const { data } = await supabase
    .from("appointments")
    .select("id, customer_name, service, date, start_time, employee, total_amount, status, channel")
    .eq("tenant_id", tid)
    .gte("date", iso(monday))
    .lte("date", iso(horizon))
    .neq("status", "cancelled");

  const rows = data ?? [];
  const monISO = iso(monday), sunISO = iso(sunday);
  const thisWeek = rows.filter((r) => (r.date as string) >= monISO && (r.date as string) <= sunISO);

  const week = {
    revenue: thisWeek.reduce((s, r) => s + Number(r.total_amount ?? 0), 0),
    count: thisWeek.length,
    online: thisWeek.filter((r) => r.channel === "booking_page").length,
  };

  const next7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const di = iso(d);
    return {
      date: di,
      weekday: d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", ""),
      day: d.getDate(),
      count: rows.filter((r) => r.date === di).length,
    };
  });

  const upcoming = rows
    .filter((r) => (r.date as string) >= todayISO)
    .sort((a, b) => ((a.date as string) + a.start_time).localeCompare((b.date as string) + b.start_time))
    .slice(0, 6)
    .map((r) => ({
      id: r.id, customer_name: r.customer_name, service: r.service,
      date: r.date, start_time: (r.start_time as string ?? "").slice(0, 5), employee: r.employee,
    }));

  return NextResponse.json({ week, next7, upcoming }, { headers: { "Cache-Control": "no-store" } });
}
