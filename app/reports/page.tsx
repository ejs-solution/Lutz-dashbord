"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, CalendarDays, Ban, Scissors, Loader2, Copy, Check } from "lucide-react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type Report = {
  period: string; count: number; revenue: number; cancelled: number; avgValue: number;
  byChannel: Record<string, number>;
  topServices: { name: string; count: number; revenue: number }[];
  topCustomers: { name: string; visits: number; revenue: number }[];
};

const PERIODS: { key: string; label: string }[] = [
  { key: "week", label: "Woche" }, { key: "month", label: "Monat" }, { key: "all", label: "Gesamt" },
];
const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [r, setR] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try { const res = await fetch(`/api/reports?period=${period}`); if (res.ok) setR(await res.json()); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [period]);

  function copyReport() {
    if (!r) return;
    const label = PERIODS.find(p => p.key === period)?.label ?? "";
    const lines = [
      `CUTZ Solution — Bericht (${label})`,
      `Termine: ${r.count}`,
      `Umsatz: ${eur(r.revenue)}`,
      `Ø pro Termin: ${eur(r.avgValue)}`,
      `Stornos: ${r.cancelled}`,
      "",
      "Top-Services:",
      ...r.topServices.map(s => `  • ${s.name}: ${s.count}× · ${eur(s.revenue)}`),
      "",
      "Top-Kunden:",
      ...r.topCustomers.map(c => `  • ${c.name}: ${c.visits} Besuche · ${eur(c.revenue)}`),
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
  }

  const maxSvc = r ? Math.max(1, ...r.topServices.map(s => s.count)) : 1;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 18px 48px" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={17} style={{ color: "var(--c-accent)" }} /></div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, color: "var(--c-fg)", margin: 0 }}>Reports</h1>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--c-fg-subtle)", margin: 0 }}>Auswertung deiner Termine nach Zeitraum.</p>
        </div>
        <button onClick={copyReport} disabled={!r} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-fg)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? <Check size={15} style={{ color: "var(--c-success)" }} /> : <Copy size={15} />} {copied ? "Kopiert" : "Bericht kopieren"}
        </button>
      </motion.div>

      {/* Zeitraum */}
      <div style={{ display: "inline-flex", gap: 3, padding: 3, background: "var(--c-bg-subtle)", borderRadius: 11, marginBottom: 22 }}>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{ padding: "7px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: period === p.key ? "var(--c-bg-elevated)" : "transparent", color: period === p.key ? "var(--c-fg)" : "var(--c-fg-muted)", boxShadow: period === p.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{p.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}><Loader2 size={24} className="spin" style={{ color: "var(--c-accent)" }} /></div>
      ) : !r ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--c-fg-muted)" }}>Keine Daten.</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 26 }}>
            <Kpi icon={CalendarDays} label="Termine" value={String(r.count)} />
            <Kpi icon={TrendingUp} label="Umsatz" value={eur(r.revenue)} accent />
            <Kpi icon={Scissors} label="Ø pro Termin" value={eur(r.avgValue)} />
            <Kpi icon={Ban} label="Stornos" value={String(r.cancelled)} />
          </div>

          <Section title="Top-Services">
            {r.topServices.length === 0 ? <Empty /> : (
              <div style={{ display: "grid", gap: 11 }}>
                {r.topServices.map(s => (
                  <div key={s.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ fontSize: 12.5, color: "var(--c-fg-muted)" }}>{s.count}×</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--c-fg)", minWidth: 64, textAlign: "right" }}>{eur(s.revenue)}</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: "var(--c-bg-subtle)", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((s.count / maxSvc) * 100)}%` }} transition={{ ease: EASE, duration: 0.6 }} style={{ height: "100%", borderRadius: 4, background: "var(--c-accent)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Top-Kunden">
            {r.topCustomers.length === 0 ? <Empty /> : (
              <div style={{ display: "grid", gap: 8 }}>
                {r.topCustomers.map(c => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 11 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--c-bg-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--c-fg)", flexShrink: 0 }}>{c.name.split(" ").map(x => x[0] ?? "").join("").slice(0, 2).toUpperCase()}</div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--c-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <span style={{ fontSize: 12.5, color: "var(--c-fg-muted)" }}>{c.visits} Besuche</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-accent)", minWidth: 64, textAlign: "right" }}>{eur(c.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: { icon: typeof FileText; label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "var(--c-accent-bg)" : "var(--c-bg-subtle)", borderRadius: 13, padding: "15px 16px", border: accent ? "1px solid rgba(212,176,119,0.3)" : "1px solid transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, color: accent ? "var(--c-accent)" : "var(--c-fg-muted)" }}><Icon size={13} /><span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span></div>
      <div style={{ fontSize: 25, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 26 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: "var(--c-fg-muted)", marginBottom: 12 }}>{title}</div>{children}</div>;
}
const Empty = () => <div style={{ fontSize: 13, color: "var(--c-fg-muted)", padding: "8px 0" }}>Noch keine Daten in diesem Zeitraum.</div>;
