import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { computeSlotsForDuration } from "@/lib/booking";

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findByToken(token: string) {
  const { data } = await supabase
    .from("appointments")
    .select("id, tenant_id, service, date, start_time, duration, status, customer_name")
    .eq("manage_token", token)
    .maybeSingle();
  return data;
}

/** GET ?token=…            → Termin-Details
 *  GET ?token=…&date=YYYY-MM-DD → freie Slots an dem Tag (zum Verschieben) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const date = searchParams.get("date");
  if (!token || !TOKEN_RE.test(token)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const appt = await findByToken(token);
  if (!appt) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (date) {
    const res = await computeSlotsForDuration(appt.tenant_id, appt.duration ?? 60, date, appt.id);
    return NextResponse.json({ slots: res.slots }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data: t } = await supabase.from("tenants").select("salon_name, phone").eq("id", appt.tenant_id).maybeSingle();
  return NextResponse.json(
    {
      salon: t?.salon_name ?? "",
      phone: t?.phone ?? null,
      name: appt.customer_name,
      service: appt.service,
      date: appt.date,
      time: (appt.start_time ?? "").slice(0, 5),
      duration: appt.duration,
      status: appt.status,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** POST { token, action: "cancel" | "reschedule", date?, time? } */
export async function POST(req: NextRequest) {
  let body: { token?: string; action?: string; date?: string; time?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const token = body.token;
  if (!token || !TOKEN_RE.test(token)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const appt = await findByToken(token);
  if (!appt) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (appt.status === "cancelled") return NextResponse.json({ error: "already_cancelled" }, { status: 409 });

  if (body.action === "cancel") {
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appt.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (body.action === "reschedule") {
    if (!body.date || !body.time) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    const res = await computeSlotsForDuration(appt.tenant_id, appt.duration ?? 60, body.date, appt.id);
    if (!res.slots.includes(body.time)) return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    const { error } = await supabase
      .from("appointments")
      .update({ date: body.date, start_time: body.time, status: "pending" })
      .eq("id", appt.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, date: body.date, time: body.time });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
