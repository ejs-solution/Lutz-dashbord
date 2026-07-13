import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireTenantId } from "@/lib/tenant";

// Letzte Online-Buchungen (channel booking_page) des eingeloggten Salons —
// für die Echtzeit-Benachrichtigung im Dashboard.
export async function GET() {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ bookings: [] });

  const { data } = await supabaseAdmin
    .from("appointments")
    .select("id, customer_name, service, date, start_time, created_at")
    .eq("tenant_id", tid)
    .eq("channel", "booking_page")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({ bookings: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
