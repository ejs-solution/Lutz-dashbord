import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getTenantId, requireTenantId } from "@/lib/tenant";

/** GET /api/services — return active service IDs + overrides */
export async function GET() {
  const tenantId = await getTenantId();
  try {
    const { data, error } = await supabase
      .from("service_settings")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;

    const activeIds = (data ?? []).filter(r => r.active).map(r => r.service_id as string);
    const overrides = Object.fromEntries(
      (data ?? [])
        .filter(r => r.overrides && Object.keys(r.overrides as object).length > 0)
        .map(r => [r.service_id, r.overrides])
    );

    return NextResponse.json({ activeIds, overrides }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ activeIds: [], overrides: {} }, { headers: { "Cache-Control": "no-store" } });
  }
}

/** POST /api/services — toggle a service active/inactive */
export async function POST(req: NextRequest) {
  const { id, active } = await req.json() as { id: string; active: boolean };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tenantId = await requireTenantId();
  if (!tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { error } = await supabase
      .from("service_settings")
      .upsert({ tenant_id: tenantId, service_id: id, active }, { onConflict: "tenant_id,service_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** PATCH /api/services — save field overrides for a service */
export async function PATCH(req: NextRequest) {
  const { id, override } = await req.json() as { id: string; override: Record<string, unknown> };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tenantId = await requireTenantId();
  if (!tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { error } = await supabase
      .from("service_settings")
      .upsert({ tenant_id: tenantId, service_id: id, overrides: override, active: true }, { onConflict: "tenant_id,service_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
