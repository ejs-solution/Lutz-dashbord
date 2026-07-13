import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, saveTenantTokens } from "@/lib/google-auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state"); // = tenant_id

  if (error) {
    return NextResponse.redirect(new URL(`/settings?google_error=${error}`, req.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/settings?google_error=no_code", req.url));
  }
  if (!state || !UUID_RE.test(state)) {
    return NextResponse.redirect(new URL("/settings?google_error=not_logged_in", req.url));
  }

  try {
    const tokens = await exchangeCode(code);
    await saveTenantTokens(state, {
      gmail_refresh_token:           tokens.refresh_token,
      google_calendar_refresh_token: tokens.refresh_token,
    });
    return NextResponse.redirect(new URL("/settings?google_connected=1", req.url));
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(new URL(`/settings?google_error=${encodeURIComponent(String(e))}`, req.url));
  }
}
