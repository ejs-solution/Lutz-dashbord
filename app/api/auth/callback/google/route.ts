import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, saveTenantTokens } from "@/lib/google-auth";
import { requireTenantId } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/settings?google_error=${error}`, req.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/settings?google_error=no_code", req.url));
  }

  try {
    const tenantId = await requireTenantId();
    if (!tenantId) {
      return NextResponse.redirect(new URL("/settings?google_error=not_logged_in", req.url));
    }

    const tokens = await exchangeCode(code);

    await saveTenantTokens(tenantId, {
      gmail_refresh_token:            tokens.refresh_token,
      google_calendar_refresh_token:  tokens.refresh_token,
    });

    return NextResponse.redirect(new URL("/settings?google_connected=1", req.url));
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(new URL(`/settings?google_error=${encodeURIComponent(String(e))}`, req.url));
  }
}
