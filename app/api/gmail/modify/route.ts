import { NextRequest, NextResponse } from "next/server";
import { getTenantTokens, getAccessToken } from "@/lib/google-auth";
import { getTenantId } from "@/lib/tenant";

// Als gelesen markieren (UNREAD entfernen) oder archivieren (INBOX entfernen).
export async function POST(req: NextRequest) {
  const { id, action } = (await req.json()) as { id?: string; action?: "markRead" | "archive" };
  if (!id || !action) return NextResponse.json({ error: "missing" }, { status: 400 });

  const removeLabelIds = action === "markRead" ? ["UNREAD"] : action === "archive" ? ["INBOX"] : null;
  if (!removeLabelIds) return NextResponse.json({ error: "bad_action" }, { status: 400 });

  const tokens = await getTenantTokens(await getTenantId());
  if (!tokens.gmail_refresh_token) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  try {
    const at = await getAccessToken(tokens.gmail_refresh_token);
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json" },
      body: JSON.stringify({ removeLabelIds }),
    });
    if (!r.ok) return NextResponse.json({ error: await r.text() }, { status: r.status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
