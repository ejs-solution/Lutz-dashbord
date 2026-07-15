import { NextRequest, NextResponse } from "next/server";
import { getTenantTokens, getAccessToken } from "@/lib/google-auth";
import { getTenantId } from "@/lib/tenant";

const b64url = (s: string) => Buffer.from(s, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// Sendet eine Antwort-E-Mail über Gmail (bleibt im selben Thread).
export async function POST(req: NextRequest) {
  const { to, subject, body, threadId } = (await req.json()) as { to?: string; subject?: string; body?: string; threadId?: string };
  if (!to || !body) return NextResponse.json({ error: "missing" }, { status: 400 });

  const tokens = await getTenantTokens(await getTenantId());
  if (!tokens.gmail_refresh_token) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  try {
    const at = await getAccessToken(tokens.gmail_refresh_token);
    const base = subject ?? "";
    const subj = base.toLowerCase().startsWith("re:") ? base : `Re: ${base}`;
    const encSubj = `=?UTF-8?B?${Buffer.from(subj, "utf-8").toString("base64")}?=`;
    const mime = [
      `To: ${to}`,
      `Subject: ${encSubj}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
    ].join("\r\n");

    const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: b64url(mime), ...(threadId ? { threadId } : {}) }),
    });
    if (!r.ok) return NextResponse.json({ error: await r.text() }, { status: r.status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
