"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, MessageSquare, Users, Star, Loader2, TrendingUp, CalendarClock } from "lucide-react";
import { useBeta } from "@/lib/beta-context";
import { customers as mockCustomers } from "@/lib/mock-data";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type Cust = { name: string; email: string | null; phone: string | null; visits: number; revenue: number; lastVisitLabel: string; lastService: string | null };

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;
const initials = (n: string) => n.split(" ").map((x) => x[0] ?? "").join("").slice(0, 2).toUpperCase();
const dateFmt = (d: string | null) => (d ? new Date(d + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function CRMPage() {
  const { betaMode } = useBeta();
  const [custs, setCusts] = useState<Cust[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (betaMode) {
        setCusts(mockCustomers.map((c) => ({
          name: c.name, email: c.email ?? null, phone: c.phone ?? null,
          visits: c.totalVisits ?? 0, revenue: c.totalRevenue ?? 0,
          lastVisitLabel: c.lastVisit ?? "—", lastService: c.preferredService ?? null,
        })));
        setLoading(false);
        return;
      }
      try {
        const r = await fetch("/api/crm/customers");
        const j = await r.json();
        setCusts((j.customers ?? []).map((c: { name: string; email: string | null; phone: string | null; visits: number; revenue: number; lastVisit: string | null; lastService: string | null }) => ({
          name: c.name, email: c.email, phone: c.phone, visits: c.visits, revenue: c.revenue,
          lastVisitLabel: dateFmt(c.lastVisit), lastService: c.lastService,
        })));
      } catch { setCusts([]); }
      finally { setLoading(false); }
    })();
  }, [betaMode]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return custs;
    return custs.filter((c) => c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.lastService ?? "").toLowerCase().includes(q));
  }, [custs, search]);

  const totalRevenue = custs.reduce((s, c) => s + c.revenue, 0);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 18px 48px" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={17} style={{ color: "var(--c-accent)" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.4, color: "var(--c-fg)", margin: 0 }}>Kunden</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", margin: 0 }}>
          {loading ? "Lädt…" : `${custs.length} Kund${custs.length === 1 ? "e" : "en"} aus echten Buchungen`}
        </p>
      </motion.div>

      {/* Kennzahlen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
        <Metric icon={Users} label="Kunden" value={String(custs.length)} />
        <Metric icon={TrendingUp} label="Gesamtumsatz" value={eur(totalRevenue)} />
        <Metric icon={CalendarClock} label="Ø Besuche" value={custs.length ? String(Math.round(custs.reduce((s, c) => s + c.visits, 0) / custs.length)) : "0"} />
      </div>

      {/* Suche */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--c-fg-muted)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, E-Mail oder Service…" style={{ width: "100%", padding: "11px 13px 11px 38px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 11, color: "var(--c-fg)", fontSize: 14, fontFamily: "inherit" }} />
      </div>

      {loading ? (
        <div style={{ padding: 50, textAlign: "center" }}><Loader2 size={24} className="spin" style={{ color: "var(--c-accent)" }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "44px 20px", textAlign: "center", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14 }}>
          <Users size={26} style={{ color: "var(--c-fg-muted)", marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: "var(--c-fg)", margin: "0 0 4px", fontWeight: 600 }}>{custs.length === 0 ? "Noch keine Kunden" : "Keine Treffer"}</p>
          <p style={{ fontSize: 13, color: "var(--c-fg-muted)", margin: 0 }}>{custs.length === 0 ? "Sobald Termine gebucht werden, erscheinen deine Kunden hier." : "Andere Suche versuchen."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((c, i) => {
            const vip = c.visits >= 10;
            return (
              <motion.div key={c.name + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3), ease: EASE }}
                style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 15px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 13 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: vip ? "linear-gradient(135deg, var(--c-accent), #e8cfa0)" : "var(--c-bg-strong)", color: vip ? "#2a1f12" : "var(--c-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                  {initials(c.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--c-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    {vip && <Star size={12} style={{ color: "var(--c-accent)", flexShrink: 0 }} fill="var(--c-accent)" />}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--c-fg-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.lastService ?? "—"} · zuletzt {c.lastVisitLabel}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginRight: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{eur(c.revenue)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-fg-muted)" }}>{c.visits} Besuch{c.visits === 1 ? "" : "e"}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {c.phone && (
                    <button onClick={() => window.open(`https://wa.me/${c.phone!.replace(/\D/g, "")}`, "_blank")} title="WhatsApp" style={iconBtn}>
                      <MessageSquare size={15} style={{ color: "var(--c-accent)" }} />
                    </button>
                  )}
                  {c.email && (
                    <button onClick={() => window.open(`mailto:${c.email}`)} title="E-Mail" style={iconBtn}>
                      <Mail size={15} style={{ color: "var(--c-fg-subtle)" }} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}} input:focus{outline:none;border-color:var(--c-accent)!important}`}</style>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div style={{ background: "var(--c-bg-subtle)", borderRadius: 12, padding: "13px 15px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <Icon size={13} style={{ color: "var(--c-accent)" }} />
        <span style={{ fontSize: 12, color: "var(--c-fg-muted)" }}>{label}</span>
      </div>
      <div style={{ fontSize: 21, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 9, border: "1px solid var(--c-border)", background: "var(--c-bg-subtle)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
