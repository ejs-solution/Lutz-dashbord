const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

async function fetchAirtable(table: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}/${encodeURIComponent(table)}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Airtable error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getLeads(maxRecords = 100) {
  return fetchAirtable("Leads", {
    maxRecords: String(maxRecords),
    sort: JSON.stringify([{ field: "Erstellt_Am", direction: "desc" }]),
  });
}

export async function getTenants() {
  return fetchAirtable("Tenants");
}

// Backward-compat aliases
export const getConversations = getLeads;
export const getBookings = getLeads;

export type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
};
