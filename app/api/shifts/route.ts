import { NextRequest, NextResponse } from "next/server";

const KEY  = process.env.AIRTABLE_API_KEY!;
const BASE = process.env.AIRTABLE_BASE_ID!;
const AT   = `https://api.airtable.com/v0/${BASE}`;
const HDR  = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

/**
 * Airtable Shifts table fields (created via AI):
 *   Member   — Linked record → Members table
 *   Date     — Date field
 *   StartTime — Text (HH:MM)
 *   EndTime   — Text (HH:MM)
 *   Note     — Long text
 *
 * Until Members records exist, shifts are generated client-side from work schedule templates.
 */

/** GET /api/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to   = searchParams.get("to")   ?? "";

  try {
    const formula = from && to
      ? `AND(IS_AFTER({Date}, '${from}'), IS_BEFORE({Date}, '${to}'))`
      : "";
    const url = `${AT}/Shifts?${formula ? `filterByFormula=${encodeURIComponent(formula)}&` : ""}sort[0][field]=Date&sort[0][direction]=asc`;
    const r = await fetch(url, { headers: HDR, cache: "no-store" });

    if (!r.ok) {
      // Table may not exist yet or be empty — return empty gracefully
      return NextResponse.json({ shifts: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const data = await r.json() as {
      records: {
        id: string;
        fields: { Member?: string[]; Date?: string; StartTime?: string; EndTime?: string; Note?: string };
      }[];
    };

    const shifts = data.records.map(rec => ({
      id:        rec.id,
      memberId:  rec.fields.Member?.[0] ?? null,
      date:      rec.fields.Date ?? "",
      startTime: rec.fields.StartTime ?? "09:00",
      endTime:   rec.fields.EndTime ?? "18:00",
      note:      rec.fields.Note ?? "",
    }));

    return NextResponse.json({ shifts }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ shifts: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

/** POST /api/shifts — create a shift */
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    memberId?: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
  };

  if (!body.date || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fields: Record<string, unknown> = {
    Date:      body.date,
    StartTime: body.startTime,
    EndTime:   body.endTime,
  };
  if (body.memberId) fields.Member = [body.memberId];
  if (body.note)     fields.Note   = body.note;

  try {
    const r = await fetch(`${AT}/Shifts`, {
      method: "POST", headers: HDR,
      body: JSON.stringify({ fields }),
    });
    if (!r.ok) {
      const err = await r.json();
      return NextResponse.json({ error: err }, { status: r.status });
    }
    const created = await r.json();
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** DELETE /api/shifts?id=recXXX */
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await fetch(`${AT}/Shifts/${id}`, { method: "DELETE", headers: HDR });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
