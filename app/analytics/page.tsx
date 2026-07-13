"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useBeta } from "@/lib/beta-context";
import { weekMetrics } from "@/lib/mock-data";

type Lead = { id: string; fields: Record<string, unknown>; createdTime?: string };
type RealAppt = {
  id: string; customerName: string; service: string; employee: string;
  date: string; startTime: string; duration: number; totalAmount: number;
  depositPaid: boolean; status: string; channel: string;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: "8px 14px", fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "var(--accent)", fontWeight: 800 }}>{payload[0].value}</div>
    </div>
  );
};

export default function AnalyticsPage() {
  const { betaMode } = useBeta();

  /* ── Supabase Leads (always real) ── */
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  /* ── Real appointments ── */
  const [appts, setAppts]         = useState<RealAppt[]>([]);
  const [apptsLoading, setApptsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads?maxRecords=100")
      .then(r => r.json())
      .then(d => d.records && setLeads(d.records))
      .catch(() => {})
      .finally(() => setLeadsLoading(false));
  }, []);

  useEffect(() => {
    if (betaMode) { setApptsLoading(false); return; }
    fetch("/api/appointments")
      .then(r => r.json())
      .then(d => setAppts(d.appointments ?? []))
      .catch(() => {})
      .finally(() => setApptsLoading(false));
  }, [betaMode]);

  /* ── Lead KPIs ── */
  const total       = leads.length;
  const bestätigt   = leads.filter(l => String(l.fields["Status"] || "").toLowerCase() === "bestätigt").length;
  const storniert   = leads.filter(l => String(l.fields["Status"] || "").toLowerCase() === "storniert").length;
  const neu         = leads.filter(l => String(l.fields["Status"] || "").toLowerCase() === "neu").length;
  const bookings    = leads.filter(l => l.fields["Service_Typ"] === "booking_request").length;
  const buchungsrate = total > 0 ? Math.round((bookings / total) * 100) : 0;

  /* ── Leads-per-day chart ── */
  const dayMap: Record<string, number> = {};
  leads.forEach(l => {
    const raw = String(l.fields["Erstellt_Am"] || l.createdTime || "");
    if (!raw) return;
    const d = new Date(raw).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const dayData = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).slice(-10).map(([day, count]) => ({ day, count }));

  /* ── Real appointment KPIs ── */
  const realRevenue = useMemo(() => appts.reduce((s, a) => s + (a.totalAmount ?? 0), 0), [appts]);
  const realConfirmed = appts.filter(a => a.status !== "cancelled").length;
  const realCancelled = appts.filter(a => a.status === "cancelled").length;
  const realNoShow    = appts.length > 0 ? +((realCancelled / appts.length) * 100).toFixed(1) : 0;

  /* ── Revenue-by-day chart (real appointments) ── */
  const revByDay = useMemo(() => {
    const map: Record<string, number> = {};
    appts.forEach(a => { map[a.date] = (map[a.date] ?? 0) + (a.totalAmount ?? 0); });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-10)
      .map(([day, rev]) => ({ day: day.slice(5), rev })); // MM-DD
  }, [appts]);

  /* ── Employee distribution (real) ── */
  const empDist = useMemo(() => {
    const map: Record<string, number> = {};
    appts.forEach(a => { map[a.employee] = (map[a.employee] ?? 0) + 1; });
    return Object.entries(map).map(([emp, cnt]) => ({ emp, cnt })).sort((a, b) => b.cnt - a.cnt);
  }, [appts]);

  /* ── Status data ── */
  const statusData = [
    { name: "Neu",        value: neu,       color: "var(--accent)" },
    { name: "Bestätigt",  value: bestätigt, color: "var(--green)"  },
    { name: "Storniert",  value: storniert, color: "var(--red)"    },
  ];

  const loading = leadsLoading || apptsLoading;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <h1 style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 900, color: "var(--text)" }}>Statistik</h1>
        {betaMode && (
          <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: "rgba(212,176,119,0.15)", color: "var(--c-accent)", border: "1px solid rgba(212,176,119,0.3)", letterSpacing: 0.5 }}>
            BETA-DEMO
          </span>
        )}
      </div>

      {/* ── Real appointment stats (live mode only) ── */}
      {!betaMode && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Gesamtumsatz</div>
            <div className="stat-number num-gold" style={{ fontSize: "1.8rem" }}>
              {apptsLoading ? "–" : `€ ${realRevenue.toLocaleString("de-DE")}`}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{appts.length} Termine gesamt</div>
          </div>
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Bestätigte Termine</div>
            <div className="stat-number num-green" style={{ fontSize: "1.8rem" }}>
              {apptsLoading ? "–" : realConfirmed}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {appts.length > 0 ? `${Math.round((realConfirmed / appts.length) * 100)}% Bestätigungsrate` : "Keine Daten"}
            </div>
          </div>
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Storno / No-Show</div>
            <div className={`stat-number ${realNoShow > 20 ? "num-red" : "num-green"}`} style={{ fontSize: "1.8rem" }}>
              {apptsLoading ? "–" : `${realNoShow}%`}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{realCancelled} Stornierungen</div>
          </div>
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Ø Umsatz/Termin</div>
            <div className="stat-number num-gold" style={{ fontSize: "1.8rem" }}>
              {apptsLoading || appts.length === 0 ? "–" : `€ ${Math.round(realRevenue / appts.length)}`}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>pro Termin</div>
          </div>
        </div>
      )}

      {/* ── Beta mode mock KPIs ── */}
      {betaMode && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Buchungsrate</div>
            <div className="stat-number num-gold">{buchungsrate}%</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{bookings} von {total} Anfragen</div>
          </div>
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Umsatz (Demo)</div>
            <div className="stat-number num-gold">€ {weekMetrics.revenueByPaul.toLocaleString("de-DE")}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>diese Woche</div>
          </div>
        </div>
      )}

      {/* ── Revenue-by-day chart (real mode) ── */}
      {!betaMode && revByDay.length > 0 && (
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Umsatz nach Tag</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revByDay} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rev" radius={[5, 5, 0, 0]} name="€">
                {revByDay.map((_, i) => <Cell key={i} fill="var(--accent)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Employee distribution (real mode) ── */}
      {!betaMode && empDist.length > 0 && (
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Termine nach Mitarbeiter</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {empDist.map(({ emp, cnt }) => (
              <div key={emp}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{emp}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>{cnt}</span>
                </div>
                <div style={{ height: 7, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${appts.length > 0 ? (cnt / appts.length) * 100 : 0}%`, background: "var(--accent)", borderRadius: 999, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lead status (always from Supabase) ── */}
      {!loading && total > 0 && (
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Lead-Status (Supabase)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {statusData.map(({ name, value, color }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{name}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color }}>
                    {value} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>({total > 0 ? Math.round((value / total) * 100) : 0}%)</span>
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${total > 0 ? (value / total) * 100 : 0}%`, background: color, borderRadius: 999, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Leads-per-day chart ── */}
      {dayData.length > 0 && (
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Leads nach Tag</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData} margin={{ left: -25, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Leads">
                {dayData.map((_, i) => <Cell key={i} fill="var(--accent)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Quick KPIs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Ø Antwortzeit", value: "< 3s",  color: "green" },
          { label: "Uptime",        value: "99.9%",  color: "green" },
          { label: "Abbruchrate",
            value: betaMode
              ? `${total > 0 ? Math.round((storniert / total) * 100) : 0}%`
              : `${realNoShow}%`,
            color: (betaMode ? storniert / Math.max(total, 1) : realNoShow / 100) > 0.2 ? "red" : "black",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
            <div className={`num-${color}`} style={{ fontSize: "1.4rem", fontWeight: 900 }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Empty state (live, no Supabase data yet) */}
      {!loading && !betaMode && appts.length === 0 && total === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 6 }}>Noch keine Daten</div>
          <div style={{ fontSize: 13 }}>Sobald Termine und Leads in Supabase sind, erscheinen hier echte Zahlen.</div>
        </div>
      )}
    </div>
  );
}
