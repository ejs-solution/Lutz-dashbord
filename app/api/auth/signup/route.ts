import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const KEY  = process.env.AIRTABLE_API_KEY!;
const BASE = process.env.AIRTABLE_BASE_ID!;
const AT   = `https://api.airtable.com/v0/${BASE}`;
const HDR  = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function emailExists(email: string): Promise<boolean> {
  const r = await fetch(
    `${AT}/Accounts?filterByFormula=${encodeURIComponent(`{Email}="${email}"`)}&maxRecords=1`,
    { headers: HDR }
  );
  if (!r.ok) return false;
  const d = await r.json() as { records: unknown[] };
  return d.records.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string; email: string; password: string;
      salonName: string; address?: string; phone?: string; city?: string;
      categories?: string[];
    };

    const { name, email, password, salonName, address, phone, city, categories } = body;

    if (!name || !email || !password || !salonName) {
      return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Passwort zu kurz (mindestens 8 Zeichen)" }, { status: 400 });
    }

    // Check duplicate email
    if (await emailExists(email.toLowerCase())) {
      return NextResponse.json({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create Tenant record
    const tenantRes = await fetch(`${AT}/Tenants`, {
      method: "POST",
      headers: HDR,
      body: JSON.stringify({
        fields: {
          salon_name:       salonName,
          address:          `${address ?? ""}, ${city ?? ""}`.trim().replace(/^,\s*/, ""),
          phone:            phone ?? "",
          plan:             "starter",
          services_active:  (categories ?? []).join(", "),
        },
      }),
    });

    if (!tenantRes.ok) {
      const err = await tenantRes.text();
      console.error("Tenant creation error:", err);
      return NextResponse.json({ error: "Fehler beim Erstellen des Salons" }, { status: 500 });
    }
    const tenant = await tenantRes.json() as { id: string };

    // Create Account record
    const accountRes = await fetch(`${AT}/Accounts`, {
      method: "POST",
      headers: HDR,
      body: JSON.stringify({
        fields: {
          Name:         name,
          Email:        email.toLowerCase(),
          PasswordHash: passwordHash,
          Role:         "owner",
          TenantId:     tenant.id,
          IsActive:     true,
        },
      }),
    });

    if (!accountRes.ok) {
      const err = await accountRes.text();
      console.error("Account creation error:", err);
      return NextResponse.json({ error: "Fehler beim Erstellen des Accounts" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
