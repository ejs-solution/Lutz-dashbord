import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getSalonBySlug, resolveBookable, computeSlots } from "@/lib/booking";

type Body = {
  slug: string;
  serviceId: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
};

// Öffentlich: Buchungsanfrage anlegen (status pending) + n8n-Webhook feuern.
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (!body.slug || !body.serviceId || !body.date || !body.time || !body.name?.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const salon = await getSalonBySlug(body.slug);
  if (!salon) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const service = await resolveBookable(salon.id, body.serviceId);
  if (!service) return NextResponse.json({ error: "invalid_service" }, { status: 400 });

  // Slot serverseitig erneut prüfen (gegen Doppelbuchung / veraltete Auswahl).
  const avail = await computeSlots(salon.id, body.serviceId, body.date);
  if (!avail || !avail.slots.includes(body.time)) {
    return NextResponse.json({ error: "slot_taken" }, { status: 409 });
  }

  const total = Math.round((service.priceMin + service.priceMax) / 2);
  const idempotencyKey = randomUUID();
  const manageToken = randomUUID();
  const manageUrl = `${new URL(req.url).origin}/termin/${manageToken}`;

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id: salon.id,
      idempotency_key: idempotencyKey,
      manage_token: manageToken,
      customer_name: body.name.trim(),
      customer_phone: body.phone?.trim() || null,
      customer_email: body.email?.trim() || null,
      service: service.name,
      employee: "Unbesetzt",
      date: body.date,
      start_time: body.time,
      duration: service.durationMin,
      total_amount: total,
      deposit_paid: false,
      status: "pending",
      channel: "booking_page",
      notes: [body.email?.trim() ? `E-Mail: ${body.email.trim()}` : "", body.notes?.trim() || ""]
        .filter(Boolean)
        .join(" · ") || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // n8n-Webhook feuern (optional, non-blocking). Paul kann so automatisch bestätigen.
  const hook = process.env.N8N_BOOKING_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "public_booking",
          appointment_id: data.id,
          tenant_id: salon.id,
          salon: salon.name,
          idempotency_key: idempotencyKey,
          name: body.name.trim(),
          email: body.email?.trim() || null,
          phone: body.phone?.trim() || null,
          service: service.name,
          date: body.date,
          time: body.time,
          duration: service.durationMin,
          manage_url: manageUrl,
        }),
      });
    } catch {
      /* Webhook-Fehler dürfen die Buchung nicht scheitern lassen */
    }
  }

  return NextResponse.json({ ok: true, id: data.id, manageToken }, { status: 201 });
}
