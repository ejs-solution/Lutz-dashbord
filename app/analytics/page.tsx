"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Globe, Mail, Phone, MessageSquare, AtSign, Ban, TrendingUp, Zap, Clock, Loader2, CalendarDays } from "lucide-react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type Analytics = {
  total: number; active: number; cancelled: number; cancelRate: number;
  onlineRate: number; last30: number; bookedHours: number;
  byChannel: { booking_page: number; email: number; phone: number; whatsapp: number; instagram: number };
};

const CHANNELS: { key: keyof Analytics["byChannel"]; label: string; icon: typeof Globe; color: string }[] = [
  { key: "booking_page", label: "Online-Buchung", icon: Globe, color: "var(--c-accent)" },
  { key: "email", label: "E-Mail", icon: Mail, color: "#60a5fa" },
  { key: "phone", label: "Telefon", icon: Phone, color: "#34d399" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "#22c55e" },
  { key: "instagram", label: "Instagram", icon: AtSign, color: "#f472b6" },
];

export default function AnalyticsPage() {
  const [a, setA] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await fetch("/api/analytics"); if (r.ok) setA(await r.json()); } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const maxChan = a ? Math.max(1, ...CHANNELS.map(c => a.byChannel[c.key])) : 1;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 18px 48px" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart3 size={17} style={{ color: "var(--c-accent)" }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, color: "var(--c-fg)", margin: 0 }}>System &amp; Insights</h1>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--c-fg-subtle)", margin: 0 }}>Echte Zahlen aus deinem Salon &amp; Paul.</p>
      </motion.div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}><Loader2 size={24} className="spin" style={{ color: "var(--c-accent)" }} /></div>
      ) : !a ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--c-fg-muted)" }}>Keine Daten verfügbar.</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 26 }}>
            <Kpi icon={CalendarDays} label="Buchungen gesamt" value={String(a.active)} sub={`${a.last30} in 30 Tagen`} />
            <Kpi icon={Globe} label="Online-Quote" value={`${a.onlineRate} %`} sub="über den Buchungslink" accent />
            <Kpi icon={Ban} label="Storno-Quote" value={`${a.cancelRate} %`} sub={`${a.cancelled} storniert`} />
            <Kpi icon={Clock} label="Gebuchte Stunden" value={`${a.bookedHours}`} sub="gesamt" />
          </div>

          {/* Kanäle */}
          <Section title="Buchungen nach Kanal">
            <div style={{ display: "grid", gap: 12 }}>
              {CHANNELS.map(({ key, label, icon: Icon, color }) => {
                const val = a.byChannel[key];
                const pct = Math.round((val / maxChan) * 100);
                return (
                  <div key={key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <Icon size={14} style={{ color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)", flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{val}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "var(--c-bg-subtle)", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ ease: EASE, duration: 0.6 }} style={{ height: "100%", borderRadius: 4, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Paul-Insights (ehrlich: noch keine Zählung) */}
          <Section title="Paul-Insights">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                { icon: Zap, label: "Automatisch beantwortet" },
                { icon: Mail, label: "Weitergeleitete Nachrichten" },
                { icon: TrendingUp, label: "Antwortrate" },
                { icon: Clock, label: "Ø Antwortzeit" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ background: "var(--c-bg-elevated)", border: "1px dashed var(--c-border)", borderRadius: 12, padding: "14px 15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-fg-muted)", marginBottom: 8 }}>
                    <Icon size={13} /><span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, color: "var(--c-accent)", background: "var(--c-accent-bg)", padding: "3px 8px", borderRadius: 6 }}>KOMMT BALD</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--c-fg-muted)", marginTop: 12, lineHeight: 1.5 }}>
              Diese Paul-Kennzahlen zeigen wir, sobald der Assistent sie erfasst — bewusst keine erfundenen Zahlen.
            </p>
          </Section>
        </>
      )}
      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: typeof Globe; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "var(--c-accent-bg)" : "var(--c-bg-subtle)", borderRadius: 13, padding: "15px 16px", border: accent ? "1px solid rgba(212,176,119,0.3)" : "1px solid transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, color: accent ? "var(--c-accent)" : "var(--c-fg-muted)" }}>
        <Icon size={13} /><span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--c-fg-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: "var(--c-fg-muted)", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
