// Gutschein-Verwaltung (Client-seitig, localStorage).
// NEUE Datei — bestehende lib-Logik bleibt unberührt. Später auf Supabase umziehbar (Elias).

export type Voucher = {
  id: string;
  code: string;
  percent: number;    // Rabatt in %
  validDays: number;  // Gültigkeit in Tagen ab Versand
  active: boolean;
  winback: boolean;   // dieser Code wird in Win-Back-Kampagnen verwendet
  createdAt: string;  // ISO-Datum
};

const KEY = "cutz_vouchers";

export const DEFAULT_VOUCHERS: Voucher[] = [
  { id: "v-comeback", code: "COMEBACK10", percent: 10, validDays: 30, active: true, winback: true, createdAt: "2026-07-01" },
];

function load(): Voucher[] {
  if (typeof window === "undefined") return DEFAULT_VOUCHERS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_VOUCHERS;
    const parsed = JSON.parse(raw) as Voucher[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VOUCHERS;
  } catch {
    return DEFAULT_VOUCHERS;
  }
}

/* Store mit useSyncExternalStore-Anbindung — hydration-sicher (Server sieht Defaults). */
let cache: Voucher[] | null = null;
const listeners = new Set<() => void>();

export function subscribeVouchers(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function getVouchersSnapshot(): Voucher[] {
  if (cache === null) cache = load();
  return cache;
}

export function getServerVouchersSnapshot(): Voucher[] {
  return DEFAULT_VOUCHERS;
}

export function setVouchers(next: Voucher[]) {
  cache = next;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Speicher voll/gesperrt — nur im Speicher halten */ }
  }
  listeners.forEach(l => l());
}

/** Der Gutschein, den Win-Back-Kampagnen verwenden (Fallback: erster aktiver, sonst Standard). */
export function getWinbackVoucher(): Voucher {
  const all = getVouchersSnapshot();
  return all.find(v => v.winback && v.active) ?? all.find(v => v.active) ?? DEFAULT_VOUCHERS[0];
}
