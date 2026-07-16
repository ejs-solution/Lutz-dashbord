import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId, requireTenantId } from "@/lib/tenant";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Abwesenheiten / Urlaub — blockieren die Online-Verfügbarkeit (siehe lib/booking dayWindow).
export async function GET() {
  const tid = await getTenantId();
  const { data } = await supabase
    .from("absences")
    .select("id, employee, from_date, to_date, note")
    .eq("tenant_id", tid)
    .gte("to_date", todayISO())
    .order("from_date", { ascending: true });
  return NextResponse.json({ absences: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { employee, from, to, note } = (await req.json()) as { employee?: string; from?: string; to?: string; note?: string };
  if (!employee || !from || !to) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  if (to < from) return NextResponse.json({ error: "bad_range" }, { status: 400 });
  const { error } = await supabase.from("absences").insert({ tenant_id: tid, employee, from_date: from, to_date: to, note: note?.trim() || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const { error } = await supabase.from("absences").delete().eq("tenant_id", tid).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
