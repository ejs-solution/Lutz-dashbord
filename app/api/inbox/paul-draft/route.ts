import { NextRequest, NextResponse } from "next/server";
import { requireTenantId } from "@/lib/tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Erzeugt mit Claude einen Antwort-Vorschlag ("Paul") auf eine Kunden-E-Mail.
export async function POST(req: NextRequest) {
  const tid = await requireTenantId();
  if (!tid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no_key" }, { status: 400 });

  const { from, subject, body } = (await req.json()) as { from?: string; subject?: string; body?: string };

  const { data: t } = await supabaseAdmin.from("tenants").select("salon_name").eq("id", tid).maybeSingle();
  const salon = t?.salon_name ?? "unserem Salon";

  const system = `Du bist Paul, der freundliche Assistent des Friseursalons "${salon}". Formuliere eine kurze, professionelle Antwort-E-Mail auf Deutsch in der Du-Form, herzlich und hilfsbereit. Wichtig: Sage keine konkreten Termine verbindlich zu, die du nicht kennst — biete stattdessen an, einen passenden Termin zu finden, oder stelle eine kurze Rückfrage (z. B. Wunschtag/-zeit, Dienstleistung). Antworte AUSSCHLIESSLICH mit dem reinen E-Mail-Text (keine Betreffzeile, keine Platzhalter wie [Name] — nutze den echten Namen, falls erkennbar).`;
  const user = `Absender: ${from ?? ""}\nBetreff: ${subject ?? ""}\n\nNachricht:\n${(body ?? "").slice(0, 3000)}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!r.ok) return NextResponse.json({ error: await r.text() }, { status: r.status });
    const d = (await r.json()) as { content?: { text?: string }[] };
    const draft = (d.content?.[0]?.text ?? "").trim();
    await supabaseAdmin.from("paul_events").insert({ tenant_id: tid, type: "draft_generated" });
    return NextResponse.json({ draft });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
