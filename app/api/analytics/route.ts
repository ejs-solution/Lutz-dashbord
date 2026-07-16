import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/tenant";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Echte System-Kennzahlen aus den Terminen (keine erfundenen Zahlen).
export async function GET() {
  const tid = await getTenantId();
  const { data } = await supabase
    .from("appointments")
    .select("channel, status, date, duration")
    .eq("tenant_id", tid);

  const rows = data ?? [];
  const total = rows.length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;
  const active = rows.filter((r) => r.status !== "cancelled");

  const chan = (c: string) => active.filter((r) => (r.channel ?? "phone") === c).length;
  const byChannel = {
    booking_page: chan("booking_page"),
    email: chan("email"),
    phone: chan("phone"),
    whatsapp: chan("whatsapp"),
    instagram: chan("instagram"),
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d30 = new Date(today); d30.setDate(today.getDate() - 30);
  const last30 = active.filter((r) => (r.date as string) >= iso(d30)).length;

  const onlineRate = active.length ? Math.round((byChannel.booking_page / active.length) * 100) : 0;
  const cancelRate = total ? Math.round((cancelled / total) * 100) : 0;
  const bookedHours = Math.round(active.reduce((s, r) => s + (r.duration ?? 0), 0) / 6) / 10;

  return NextResponse.json(
    { total, active: active.length, cancelled, cancelRate, onlineRate, last30, bookedHours, byChannel },
    { headers: { "Cache-Control": "no-store" } }
  );
}
