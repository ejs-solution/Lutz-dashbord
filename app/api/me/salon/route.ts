import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireTenantId } from "@/lib/tenant";

// Salon-Slug + Name des eingeloggten Tenants (für den Buchungslink im Dashboard).
export async function GET() {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("tenants")
    .select("slug, salon_name")
    .eq("id", tid)
    .maybeSingle();

  if (!data?.slug) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ slug: data.slug, name: data.salon_name });
}
