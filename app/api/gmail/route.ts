import { NextResponse } from "next/server";
import { getTenant, getAccessToken } from "@/lib/google-auth";

type GmailHeader = { name: string; value: string };

function header(headers: GmailHeader[], name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function GET() {
  try {
    const tenant = await getTenant();
    const refreshToken = tenant.fields.gmail_refresh_token;

    if (!refreshToken) {
      return NextResponse.json({ error: "not_connected" }, { status: 401 });
    }

    const accessToken = await getAccessToken(refreshToken);
    const authHeader  = { Authorization: `Bearer ${accessToken}` };

    // Fetch latest 20 message IDs
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox",
      { headers: authHeader }
    );
    if (!listRes.ok) throw new Error(`Gmail list ${listRes.status}`);
    const listData = await listRes.json() as { messages?: { id: string }[] };
    const ids = (listData.messages ?? []).slice(0, 20).map((m) => m.id);

    // Fetch each message (format=metadata for speed)
    const messages = await Promise.all(
      ids.map(async (id) => {
        const r = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: authHeader }
        );
        if (!r.ok) return null;
        const msg = await r.json() as {
          id: string;
          threadId: string;
          snippet: string;
          internalDate: string;
          labelIds: string[];
          payload: { headers: GmailHeader[] };
        };
        const hdrs = msg.payload?.headers ?? [];
        return {
          id:       msg.id,
          threadId: msg.threadId,
          from:     header(hdrs, "From"),
          subject:  header(hdrs, "Subject"),
          date:     msg.internalDate,
          snippet:  msg.snippet,
          unread:   (msg.labelIds ?? []).includes("UNREAD"),
        };
      })
    );

    return NextResponse.json(
      { messages: messages.filter(Boolean) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
