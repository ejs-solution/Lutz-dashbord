import { NextRequest, NextResponse } from "next/server";

const KEY  = process.env.AIRTABLE_API_KEY!;
const BASE = process.env.AIRTABLE_BASE_ID!;
const AT   = `https://api.airtable.com/v0/${BASE}`;
const HDR  = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

/**
 * Airtable Appointments table (to be created):
 *   CustomerName  — Text
 *   Service       — Text
 *   Employee      — Single select (Aynur | Monika | Lisa)
 *   Date          — Date
 *   StartTime     — Text (HH:MM)
 *   Duration      — Number (minutes)
 *   TotalAmount   — Currency
 *   DepositPaid   — Checkbox
 *   DepositAmount — Currency
 *   Status        — Single select (confirmed | pending | completed | cancelled)
 *   Channel       — Single select (whatsapp | instagram | phone | email)
 *   CustomerPhone — Phone
 *   Notes         — Long text
 */

/** GET /api/appointments?date=YYYY-MM-DD */
export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get("date");
  const formula = date
    ? `{Date}='${date}'`
    : "";

  try {
    const url = `${AT}/Appointments?${formula ? `filterByFormula=${encodeURIComponent(formula)}&` : ""}sort[0][field]=StartTime&sort[0][direction]=asc`;
    const r = await fetch(url, { headers: HDR, cache: "no-store" });

    if (!r.ok) {
      return NextResponse.json({ appointments: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const data = await r.json() as {
      records: {
        id: string;
        fields: {
          CustomerName?: string;
          Service?: string;
          Employee?: string;
          Date?: string;
          StartTime?: string;
          Duration?: number;
          TotalAmount?: number;
          DepositPaid?: boolean;
          DepositAmount?: number;
          Status?: string;
          Channel?: string;
          CustomerPhone?: string;
          Notes?: string;
        };
      }[];
    };

    const appointments = data.records.map(rec => ({
      id:            rec.id,
      customerName:  rec.fields.CustomerName ?? "",
      service:       rec.fields.Service ?? "",
      employee:      rec.fields.Employee ?? "Aynur",
      date:          rec.fields.Date ?? "",
      startTime:     rec.fields.StartTime ?? "09:00",
      duration:      rec.fields.Duration ?? 60,
      totalAmount:   rec.fields.TotalAmount ?? 0,
      depositPaid:   rec.fields.DepositPaid ?? false,
      depositAmount: rec.fields.DepositAmount,
      status:        rec.fields.Status ?? "confirmed",
      channel:       rec.fields.Channel ?? "phone",
      customerPhone: rec.fields.CustomerPhone,
    }));

    return NextResponse.json({ appointments }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ appointments: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

/** POST /api/appointments — create appointment */
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    customerName: string;
    service: string;
    employee: string;
    date: string;
    startTime: string;
    duration: number;
    totalAmount?: number;
    depositPaid?: boolean;
    depositAmount?: number;
    status?: string;
    channel?: string;
    customerPhone?: string;
    notes?: string;
  };

  if (!body.customerName || !body.service || !body.date || !body.startTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fields: Record<string, unknown> = {
    CustomerName: body.customerName,
    Service:      body.service,
    Employee:     body.employee ?? "Aynur",
    Date:         body.date,
    StartTime:    body.startTime,
    Duration:     body.duration ?? 60,
    TotalAmount:  body.totalAmount ?? 0,
    DepositPaid:  body.depositPaid ?? false,
    Status:       body.status ?? "confirmed",
    Channel:      body.channel ?? "phone",
  };
  if (body.depositAmount)  fields.DepositAmount  = body.depositAmount;
  if (body.customerPhone)  fields.CustomerPhone  = body.customerPhone;
  if (body.notes)          fields.Notes          = body.notes;

  try {
    const r = await fetch(`${AT}/Appointments`, {
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

/** PATCH /api/appointments — update appointment */
export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json() as { id: string; [key: string]: unknown };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await fetch(`${AT}/Appointments/${id}`, {
      method: "PATCH", headers: HDR,
      body: JSON.stringify({ fields }),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
