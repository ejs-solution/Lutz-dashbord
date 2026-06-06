import { NextResponse } from "next/server";
import { getTenant, getAccessToken } from "@/lib/google-auth";

export async function GET() {
  try {
    const tenant = await getTenant();
    const refreshToken = tenant.fields.google_calendar_refresh_token;

    if (!refreshToken) {
      return NextResponse.json({ error: "not_connected" }, { status: 401 });
    }

    const accessToken = await getAccessToken(refreshToken);

    const now    = new Date();
    const start  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const end    = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString();

    const params = new URLSearchParams({
      timeMin:      start,
      timeMax:      end,
      singleEvents: "true",
      orderBy:      "startTime",
      maxResults:   "50",
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? `Calendar API ${res.status}`);
    }

    const data = await res.json();
    // Normalize: Google Calendar returns `items`, we expose as `events`
    return NextResponse.json(
      { events: data.items ?? [], summary: data.summary },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
