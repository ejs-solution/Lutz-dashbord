import { NextRequest, NextResponse } from "next/server";
import { getSalonBySlug, computeSlots } from "@/lib/booking";

// Öffentlich: freie Slots für Salon + Service + Datum (YYYY-MM-DD).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  if (!slug || !serviceId || !date) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const salon = await getSalonBySlug(slug);
  if (!salon) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const res = await computeSlots(salon.id, serviceId, date);
  if (!res) return NextResponse.json({ error: "invalid_service" }, { status: 400 });

  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}
