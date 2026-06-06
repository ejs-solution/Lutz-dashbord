import { NextRequest, NextResponse } from "next/server";

const KEY  = process.env.AIRTABLE_API_KEY!;
const BASE = process.env.AIRTABLE_BASE_ID!;
const AT   = `https://api.airtable.com/v0/${BASE}`;
const HDR  = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function getServicesRecord() {
  try {
    const r = await fetch(`${AT}/Services?maxRecords=1`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json() as { records: { id: string; fields: { active_ids?: string; overrides?: string } }[] };
    return d.records[0] ?? null;
  } catch { return null; }
}

/** GET — return active service IDs + overrides */
export async function GET() {
  const record = await getServicesRecord();
  if (!record) {
    return NextResponse.json({ activeIds: [], overrides: {} }, { headers: { "Cache-Control": "no-store" } });
  }
  const activeIds  = record.fields.active_ids ? record.fields.active_ids.split(",").filter(Boolean) : [];
  const overrides  = record.fields.overrides  ? JSON.parse(record.fields.overrides) : {};
  return NextResponse.json({ activeIds, overrides }, { headers: { "Cache-Control": "no-store" } });
}

/** POST — toggle a service active/inactive */
export async function POST(req: NextRequest) {
  const { id, active } = await req.json() as { id: string; active: boolean };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const record = await getServicesRecord();
  let activeIds: string[] = record?.fields.active_ids
    ? record.fields.active_ids.split(",").filter(Boolean)
    : [];

  if (active) {
    if (!activeIds.includes(id)) activeIds.push(id);
  } else {
    activeIds = activeIds.filter((x) => x !== id);
  }

  const fields = { active_ids: activeIds.join(",") };

  if (record) {
    await fetch(`${AT}/Services/${record.id}`, { method: "PATCH", headers: HDR, body: JSON.stringify({ fields }) });
  } else {
    await fetch(`${AT}/Services`, { method: "POST", headers: HDR, body: JSON.stringify({ fields }) });
  }

  return NextResponse.json({ ok: true });
}

/** PATCH — save service field overrides */
export async function PATCH(req: NextRequest) {
  const { id, override } = await req.json() as { id: string; override: Record<string, unknown> };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const record = await getServicesRecord();
  const overrides: Record<string, unknown> = record?.fields.overrides ? JSON.parse(record.fields.overrides) : {};
  overrides[id] = override;

  const fields = { overrides: JSON.stringify(overrides) };
  if (record) {
    await fetch(`${AT}/Services/${record.id}`, { method: "PATCH", headers: HDR, body: JSON.stringify({ fields }) });
  } else {
    await fetch(`${AT}/Services`, { method: "POST", headers: HDR, body: JSON.stringify({ fields: { active_ids: "", ...fields } }) });
  }

  return NextResponse.json({ ok: true });
}
