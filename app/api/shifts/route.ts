import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId, requireTenantId } from "@/lib/tenant";

/** GET /api/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to   = searchParams.get("to")   ?? "";
  const tenantId = await getTenantId();

  try {
    let query = supabase
      .from("shifts")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (from) query = query.gte("date", from);
    if (to)   query = query.lte("date", to);

    const { data, error } = await query;
    if (error) throw error;

    const shifts = (data ?? []).map(row => ({
      id:        row.id,
      employee:  row.employee,
      date:      row.date,
      startTime: row.start_time,
      endTime:   row.end_time,
      note:      row.note ?? "",
    }));

    return NextResponse.json({ shifts }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ shifts: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

/** POST /api/shifts — create a shift */
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    employee?: string; date: string; startTime: string; endTime: string; note?: string;
  };

  if (!body.date || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tenantId = await requireTenantId();
  if (!tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { data, error } = await supabase.from("shifts").insert({
      tenant_id:  tenantId,
      employee:   body.employee ?? "",
      date:       body.date,
      start_time: body.startTime,
      end_time:   body.endTime,
      note:       body.note ?? null,
    }).select("id").single();

    if (error) throw error;
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** DELETE /api/shifts?id=UUID */
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tenantId = await requireTenantId();
  if (!tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
