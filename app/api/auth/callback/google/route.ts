import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getTenant, saveTenantTokens } from "@/lib/google-auth";

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
    const tokens = await exchangeCode(code);
    const tenant = await getTenant();

    await saveTenantTokens(tenant.id, {
      gmail_refresh_token:            tokens.refresh_token,
      google_calendar_refresh_token:  tokens.refresh_token,
    });

    return NextResponse.redirect(new URL("/settings?google_connected=1", req.url));
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(new URL(`/settings?google_error=${encodeURIComponent(String(e))}`, req.url));
  }
}
