import { NextRequest, NextResponse } from "next/server";
import { getTenantTokens, getAccessToken } from "@/lib/google-auth";
import { getTenantId } from "@/lib/tenant";

type Part = { mimeType?: string; body?: { data?: string }; parts?: Part[] };

function decode(data?: string) {
  if (!data) return "";
  try { return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"); }
  catch { return ""; }
}
function stripHtml(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
}
function extractBody(payload?: Part): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) return decode(payload.body.data);
  if (payload.parts) {
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decode(plain.body.data);
    for (const p of payload.parts) { const b = extractBody(p); if (b) return b; }
    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) return stripHtml(decode(html.body.data));
  }
  if (payload.mimeType === "text/html" && payload.body?.data) return stripHtml(decode(payload.body.data));
  return "";
}

// Vollständiger Text einer Gmail-Nachricht (nur Lesen).
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const tokens = await getTenantTokens(await getTenantId());
  const refresh = tokens.gmail_refresh_token;
  if (!refresh) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  try {
    const accessToken = await getAccessToken(refresh);
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) throw new Error(`Gmail ${r.status}`);
    const msg = await r.json() as { payload?: Part };
    let body = extractBody(msg.payload).trim();
    if (body.length > 8000) body = body.slice(0, 8000) + "\n…";
    return NextResponse.json({ body }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
