import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId, requireTenantId } from "@/lib/tenant";

// Wöchentliche Arbeitszeiten pro Mitarbeiter:in (steuert die Buchungs-Verfügbarkeit).
export async function GET() {
  const tid = await getTenantId();
  const { data } = await supabase
    .from("work_hours")
    .select("employee, weekday, start_time, end_time")
    .eq("tenant_id", tid);

  const hours = (data ?? []).map((r) => ({
    employee: r.employee as string,
    weekday: r.weekday as number,
    start: (r.start_time as string).slice(0, 5),
    end: (r.end_time as string).slice(0, 5),
  }));
  return NextResponse.json({ hours }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { employee, weekday, start, end } = (await req.json()) as {
    employee?: string; weekday?: number; start?: string; end?: string;
  };
  if (!employee || weekday == null || !start || !end) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("work_hours")
    .upsert({ tenant_id: tid, employee, weekday, start_time: start, end_time: end }, { onConflict: "tenant_id,employee,weekday" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const employee = searchParams.get("employee");
  const weekday = searchParams.get("weekday");
  if (!employee || weekday == null) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const { error } = await supabase
    .from("work_hours")
    .delete()
    .eq("tenant_id", tid)
    .eq("employee", employee)
    .eq("weekday", Number(weekday));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
