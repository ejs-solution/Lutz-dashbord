import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google-auth";
import { requireTenantId } from "@/lib/tenant";

// Start des Google-OAuth: tenant_id aus der Session lesen und als state mitgeben.
export async function GET(req: Request) {
  const tenantId = await requireTenantId();
  if (!tenantId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.redirect(buildAuthUrl(tenantId));
}
