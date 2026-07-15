import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";

function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "salon"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name: string;
      email: string;
      password: string;
      salonName: string;
      address?: string;
      phone?: string;
      city?: string;
      categories?: string[];
    };

    const { name, email, password, salonName, address, phone, city } = body;

    if (!name || !email || !password || !salonName) {
      return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Passwort zu kurz (mindestens 8 Zeichen)" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Duplikat-Check
    const { data: existing } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .ilike("email", emailLower)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "Diese E-Mail ist bereits registriert." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Tenant anlegen
    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .insert({
        slug: makeSlug(salonName),
        salon_name: salonName,
        address_street: address ?? null,
        address_city: city ?? null,
        phone: phone ?? null,
        plan: "starter",
      })
      .select("id")
      .single();

    if (tenantErr || !tenant) {
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Salons" },
        { status: 500 }
      );
    }

    // Account anlegen
    const { error: accErr } = await supabaseAdmin.from("accounts").insert({
      name,
      email: emailLower,
      password_hash: passwordHash,
      role: "owner",
      tenant_id: tenant.id,
      is_active: true,
    });

    if (accErr) {
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Accounts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
