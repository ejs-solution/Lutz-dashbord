import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/tenant";

// Ersetzt den alten /api/airtable?table=Leads-Aufruf.
// Liest Live-Buchungen aus Supabase `appointments` und liefert sie im gleichen
// Shape wie früher Airtable ({ records: [{ id, createdTime, fields: {...} }] }),
// damit die bestehenden Seiten (roi, bookings, crm, conversations, analytics)
// ohne Umbau funktionieren.

const STATUS_MAP: Record<string, string> = {
  confirmed: "Bestätigt",
  pending: "Neu",
  cancelled: "Storniert",
  completed: "Abgeschlossen",
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const maxRaw = parseInt(searchParams.get("maxRecords") || "200", 10);
  const max = Number.isFinite(maxRaw) ? Math.min(Math.max(maxRaw, 1), 500) : 200;

  const tenantId = await getTenantId();

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select(
      "id, created_at, customer_name, customer_phone, service, date, start_time, status, channel, total_amount"
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(max);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const records = (data ?? []).map((a) => ({
    id: a.id,
    createdTime: a.created_at,
    fields: {
      Name: a.customer_name,
      Email: null,
      Telefon: a.customer_phone,
      Dienstleistung: a.service,
      Service_Typ: a.channel || "booking_request",
      Wunschtermin: a.date ? `${a.date}T${a.start_time || "00:00"}` : null,
      Status: STATUS_MAP[a.status as string] || a.status,
      Preis_Min_EUR: a.total_amount,
      Erstellt_Am: a.created_at,
    },
  }));

  return NextResponse.json({ records });
}
