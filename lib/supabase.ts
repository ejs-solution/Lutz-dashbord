import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

/* ─── Database types ─────────────────────────────────────── */
export type DbAppointment = {
  id: string;
  created_at: string;
  customer_name: string;
  service: string;
  employee: "Aynur" | "Monika" | "Lisa";
  date: string;           // YYYY-MM-DD
  start_time: string;     // HH:MM
  duration: number;       // minutes
  total_amount: number;
  deposit_paid: boolean;
  deposit_amount: number | null;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  channel: "whatsapp" | "instagram" | "phone" | "email";
  customer_phone: string | null;
  notes: string | null;
};

export type DbCustomer = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  preferred_service: string | null;
  total_visits: number;
  total_revenue: number;
  is_vip: boolean;
  notes: string | null;
  last_visit: string | null;
};

export type DbService = {
  id: string;
  name: string;
  duration_min: number;
  price_min: number;
  price_max: number;
  category: string | null;
  active: boolean;
};
