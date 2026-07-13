import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId, requireTenantId } from "@/lib/tenant";

/** GET /api/appointments?date=YYYY-MM-DD */
export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get("date");
  const tenantId = await getTenantId();

  try {
    let query = supabase
      .from("appointments")
      .select("*")
      .eq("tenant_id", tenantId)
      .neq("status", "cancelled")
      .order("start_time", { ascending: true });

    if (date) query = query.eq("date", date);

    const { data, error } = await query;
    if (error) throw error;

    const appointments = (data ?? []).map(row => ({
      id:            row.id,
      customerName:  row.customer_name,
      service:       row.service,
      employee:      row.employee,
      date:          row.date,
      startTime:     row.start_time,
      duration:      row.duration,
      totalAmount:   row.total_amount,
      depositPaid:   row.deposit_paid,
      depositAmount: row.deposit_amount,
      status:        row.status,
      channel:       row.channel,
      customerPhone: row.customer_phone,
      notes:         row.notes,
    }));

    return NextResponse.json({ appointments }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ appointments: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

/** POST /api/appointments — create appointment */
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    customerName: string; service: string; employee?: string;
    date: string; startTime: string; duration?: number;
    totalAmount?: number; depositPaid?: boolean; depositAmount?: number;
    status?: string; channel?: string; customerPhone?: string; notes?: string;
  };

  if (!body.customerName || !body.service || !body.date || !body.startTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tenantId = await requireTenantId();
  if (!tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { data, error } = await supabase.from("appointments").insert({
      tenant_id:      tenantId,
      customer_name:  body.customerName,
      service:        body.service,
      employee:       body.employee ?? "Aynur",
      date:           body.date,
      start_time:     body.startTime,
      duration:       body.duration ?? 60,
      total_amount:   body.totalAmount ?? 0,
      deposit_paid:   body.depositPaid ?? false,
      deposit_amount: body.depositAmount ?? null,
      status:         body.status ?? "confirmed",
      channel:        body.channel ?? "phone",
      customer_phone: body.customerPhone ?? null,
      notes:          body.notes ?? null,
    }).select("id").single();

    if (error) throw error;
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** PATCH /api/appointments — update appointment */
export async function PATCH(req: NextRequest) {
  const { id, ...rest } = await req.json() as { id: string; [key: string]: unknown };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tenantId = await requireTenantId();
  if (!tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const updates: Record<string, unknown> = {};
  if (rest.customerName !== undefined) updates.customer_name  = rest.customerName;
  if (rest.service      !== undefined) updates.service        = rest.service;
  if (rest.employee     !== undefined) updates.employee       = rest.employee;
  if (rest.date         !== undefined) updates.date           = rest.date;
  if (rest.startTime    !== undefined) updates.start_time     = rest.startTime;
  if (rest.duration     !== undefined) updates.duration       = rest.duration;
  if (rest.totalAmount  !== undefined) updates.total_amount   = rest.totalAmount;
  if (rest.depositPaid  !== undefined) updates.deposit_paid   = rest.depositPaid;
  if (rest.status       !== undefined) updates.status         = rest.status;
  if (rest.channel      !== undefined) updates.channel        = rest.channel;
  if (rest.notes        !== undefined) updates.notes          = rest.notes;

  try {
    const { error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
