import { NextRequest, NextResponse } from "next/server";
import { getSalonBySlug, getGroups } from "@/lib/booking";

// Öffentlich: Salon-Basisdaten + Leistungsgruppen (Männer/Frauen/Kinder) per Slug.
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  const salon = await getSalonBySlug(slug);
  if (!salon) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const groups = await getGroups(salon.id);
  return NextResponse.json(
    { salon: { slug: salon.slug, name: salon.name, phone: salon.phone, city: salon.city, logoUrl: salon.logoUrl }, groups },
    { headers: { "Cache-Control": "no-store" } }
  );
}
