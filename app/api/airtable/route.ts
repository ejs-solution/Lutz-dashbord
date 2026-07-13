import { NextResponse } from "next/server";

// Deaktiviert: Airtable wurde vollständig durch Supabase ersetzt.
// Frühere Aufrufe (`/api/airtable?table=Leads`) laufen jetzt über `/api/leads` (Supabase).
export async function GET() {
  return NextResponse.json(
    { error: "gone", message: "Airtable wurde durch Supabase ersetzt. Nutze /api/leads." },
    { status: 410 }
  );
}
