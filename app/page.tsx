"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, ChevronRight, MessageSquare,
  Phone, Activity, Scissors, X, Loader2,
} from "lucide-react";
import { todayAppointments, weekMetrics } from "@/lib/mock-data";
import { Sparkline } from "@/components/ui/Sparkline";
import { useBeta } from "@/lib/beta-context";

/* ─── Constants ──────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;

const LANG: Record<string, string> = {
  Türkisch: "TR",
  Deutsch:  "DE",
  Englisch: "EN",
};

const MOCK_SPARKLINES = {
  revenue:  [980, 1120, 1060, 1280, 1500, 1740, 1840],
  saved:    [8, 9, 9, 10, 11, 13, 14],
  time:     [15, 16, 16, 17, 18, 18, 18.5],
  noShow:   [6.2, 5.8, 4.9, 4.1, 3.5, 2.8, 1.2],
};

/* ─── Real appointment type (from API) ───────────────────── */
type RealAppt = {
  id: string;
  customerName: string;
  service: string;
  employee: string;
  date: string;
  startTime: string;
  duration: number;
  totalAmount: number;
  depositPaid: boolean;
  depositAmount?: number;
  status: string;
  channel: string;
  customerPhone?: string;
};

/* ─── Hooks ──────────────────────────────────────────────── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target && value !== 0) return;
    prevTarget.current = target;
    let start: number | null = null;
    const from = value;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + eased * (target - from)));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

/* ─── KPI section ────────────────────────────────────────── */
function KpiSection({ weekAppts, betaMode }: {
  weekAppts: RealAppt[];
  betaMode: boolean;
}) {
  const m = weekMetrics;

  // Real KPIs derived from Airtable appointments
  const realRevenue  = useMemo(() => weekAppts.reduce((s, a) => s + (a.totalAmount ?? 0), 0), [weekAppts]);
  const realCount    = weekAppts.length;
  const confirmedCount = weekAppts.filter(a => a.status !== "cancelled").length;
  const cancelledCount = weekAppts.filter(a => a.status === "cancelled").length;
  const noShowRate   = realCount > 0 ? +((cancelledCount / realCount) * 100).toFixed(1) : 0;

  const revenueVal = useCountUp(betaMode ? m.revenueByPaul : realRevenue, 900);
  const countVal   = useCountUp(betaMode ? m.savedAppointments : realCount, 900);
  const confirmedVal = useCountUp(betaMode ? Math.round(m.timeSaved) : confirmedCount, 900);
  const noShowX    = useCountUp(betaMode ? 12 : Math.round(noShowRate * 10), 900);

  const realSparks = useMemo(() => {
    // Build 7-day sparkline from weekAppts grouped by day
    const days: Record<string, number> = {};
    weekAppts.forEach(a => {
      days[a.date] = (days[a.date] ?? 0) + a.totalAmount;
    });
    return Object.values(days).slice(-7);
  }, [weekAppts]);

  type KpiItem = { value: string; label: string; delta: number; deltaLabel: string; sparks: number[] };

  const kpis: KpiItem[] = [
    {
      value: `€ ${revenueVal.toLocaleString("de-DE")}`,
      label: betaMode ? "Umsatz durch Paul" : "Umsatz diese Woche",
      delta: betaMode ? m.revenueTrend : 0,
      deltaLabel: "vs. Vorwoche",
      sparks: betaMode ? MOCK_SPARKLINES.revenue : (realSparks.length > 1 ? realSparks : MOCK_SPARKLINES.revenue.map(() => 0)),
    },
    {
      value: String(countVal),
      label: "Termine diese Woche",
      delta: betaMode ? m.savedAppointmentsTrend : 0,
      deltaLabel: "vs. Vorwoche",
      sparks: betaMode ? MOCK_SPARKLINES.saved : [],
    },
    {
      value: betaMode ? `${confirmedVal} St.` : String(confirmedVal),
      label: betaMode ? "Eingesparte Zeit" : "Bestätigt",
      delta: 0,
      deltaLabel: "konstant",
      sparks: betaMode ? MOCK_SPARKLINES.time : [],
    },
    {
      value: `${(noShowX / 10).toFixed(1)} %`,
      label: "Storno / No-Show",
      delta: betaMode ? m.noShowRateDelta : 0,
      deltaLabel: "vs. Vorwoche",
      sparks: betaMode ? MOCK_SPARKLINES.noShow : [],
    },
  ];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: EASE }}
      style={{ marginBottom: 16, overflow: "hidden" }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: "1px solid var(--c-border)",
      }}>
        <span className="text-overline" style={{ color: "var(--c-fg-subtle)" }}>Diese Woche</span>
        <button className="btn-ghost" style={{ height: 24, fontSize: 11, padding: "0 8px", color: "var(--c-fg-subtle)" }}>
          Diese Woche <ChevronRight size={10} />
        </button>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, i) => {
          const isGood = kpi.label.includes("No-Show") || kpi.label.includes("Storno") ? kpi.delta <= 0 : kpi.delta >= 0;
          const hasChange = kpi.delta !== 0;
          return (
            <div key={kpi.label} className="kpi-item" style={{
              padding: "16px 20px",
              borderRight: i < kpis.length - 1 ? "1px solid var(--c-border)" : "none",
            }}>
              <div className="text-mono-lg" style={{ color: "var(--c-fg)", marginBottom: 4 }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: "var(--c-fg-muted)", marginBottom: 8 }}>{kpi.label}</div>
              {kpi.sparks.length > 1 && (
                <div style={{ marginBottom: 8 }}>
                  <Sparkline data={kpi.sparks} width={100} height={28} color="var(--c-fg-subtle)" />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {hasChange ? (
                  <>
                    {isGood
                      ? <TrendingUp size={10} style={{ color: "var(--c-success)" }} />
                      : <TrendingDown size={10} style={{ color: "var(--c-danger)" }} />
                    }
                    <span style={{ fontSize: 11, fontWeight: 600, color: isGood ? "var(--c-success)" : "var(--c-danger)", fontVariantNumeric: "tabular-nums" }}>
                      {kpi.delta > 0 ? "+" : ""}{kpi.delta}%
                    </span>
                    <span style={{ fontSize: 11, color: "var(--c-fg-faint)" }}>{kpi.deltaLabel}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--c-fg-faint)" }}>
                    {betaMode ? "konstant" : "Live-Daten"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Appointment row ────────────────────────────────────── */
const channelIcon: Record<string, React.ReactNode> = {
  whatsapp:  <MessageSquare size={11} />,
  instagram: <Activity size={11} />,
  phone:     <Phone size={11} />,
  email:     <MessageSquare size={11} />,
};

type DisplayAppt = {
  id: string;
  customerName: string;
  service: string;
  services?: string[];
  duration: number;
  startTime: string;
  employee: string;
  channel: string;
  status: string;
  depositPaid?: boolean;
  depositAmount?: number;
  totalAmount: number;
  customerPhone?: string;
  isVIP?: boolean;
  language?: string;
};

function AppointmentRow({
  appt, i, total, isCurrent, isPast, onClick,
}: {
  appt: DisplayAppt; i: number; total: number; isCurrent: boolean; isPast: boolean; onClick: () => void;
}) {
  const lang = appt.language ? (LANG[appt.language] ?? appt.language.slice(0, 2).toUpperCase()) : null;
  const h = Math.floor(appt.duration / 60);
  const min = appt.duration % 60;
  const durLabel = h > 0 ? (min > 0 ? `${h}h ${min}m` : `${h}h`) : `${min}m`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isPast ? 0.4 : 1, x: 0 }}
      transition={{ delay: 0.3 + i * 0.04, ease: EASE }}
      onClick={onClick}
      whileHover={{ backgroundColor: "var(--c-bg-subtle)" }}
      style={{
        display: "grid", gridTemplateColumns: "72px 1fr auto",
        gap: 12, alignItems: "center", padding: "10px 20px",
        borderBottom: i < total - 1 ? "1px solid var(--c-border)" : "none",
        cursor: "pointer", position: "relative",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: isCurrent ? "var(--c-accent)" : "var(--c-fg)", fontVariantNumeric: "tabular-nums", lineHeight: 1.3 }}>
          {appt.startTime}
        </div>
        <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", lineHeight: 1.3 }}>{durLabel}</div>
        <div style={{ fontSize: 11, color: "var(--c-fg-muted)", lineHeight: 1.3 }}>{appt.employee}</div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", lineHeight: 1.4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-fg)" }}>{appt.customerName}</span>
          {lang && <span style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginLeft: 4 }}>·{lang}</span>}
          {appt.isVIP && <span style={{ fontSize: 11, color: "var(--c-accent)", marginLeft: 4, fontWeight: 600 }}>·VIP</span>}
          <span style={{ fontSize: 11, color: "var(--c-fg-faint)", marginLeft: 6, display: "flex", alignItems: "center" }}>
            {channelIcon[appt.channel] ?? <Phone size={11} />}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
          <Scissors size={9} /> {appt.service}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums", lineHeight: 1.3 }}>
          €{appt.totalAmount}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 2 }}>
          {appt.depositPaid ? (
            <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-success)", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "var(--c-success)", fontWeight: 600 }}>Bezahlt</span></>
          ) : appt.status === "cancelled" ? (
            <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-danger)", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "var(--c-danger)", fontWeight: 600 }}>Storniert</span></>
          ) : (
            <><span style={{ width: 6, height: 6, borderRadius: "50%", border: "1.5px solid var(--c-fg-subtle)", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "var(--c-fg-subtle)", fontWeight: 500 }}>Offen</span></>
          )}
        </div>
      </div>

      {isCurrent && (
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ position: "absolute", left: 0, top: "50%", width: 2, height: 20, marginTop: -10, background: "var(--c-accent)", borderRadius: "0 2px 2px 0" }} />
      )}
    </motion.div>
  );
}

/* ─── Appointment modal ──────────────────────────────────── */
function ApptModal({ appt, onClose }: { appt: DisplayAppt; onClose: () => void }) {
  const lang = appt.language ? (LANG[appt.language] ?? appt.language.slice(0, 2).toUpperCase()) : null;
  const rows = [
    { label: "Service",    value: appt.service },
    { label: "Uhrzeit",    value: `${appt.startTime} Uhr · ${appt.duration} Min.` },
    { label: "Mitarbeiter",value: appt.employee },
    { label: "Kanal",      value: appt.channel.toUpperCase() },
    { label: "Preis",      value: `€ ${appt.totalAmount}` },
    { label: "Anzahlung",  value: appt.depositPaid ? `€ ${appt.depositAmount ?? "–"} bezahlt` : "Noch ausstehend" },
  ];
  return (
    <>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{ position: "fixed", zIndex: 101, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(440px, calc(100vw - 32px))", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border-strong)", borderRadius: 14, boxShadow: "var(--c-shadow-lg)", overflow: "hidden" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--c-border)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-fg)" }}>{appt.customerName}</span>
              {lang && <span style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>·{lang}</span>}
              {appt.isVIP && <span style={{ fontSize: 12, color: "var(--c-accent)", fontWeight: 600 }}>·VIP</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", marginTop: 2 }}>{appt.customerPhone ?? "Kein Telefon"}</div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={15} /></button>
        </div>
        <div style={{ padding: "0 20px" }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--c-border)", fontSize: 13 }}>
              <span style={{ color: "var(--c-fg-muted)" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "var(--c-fg)" }}>{value}</span>
            </div>
          ))}
        </div>
        {appt.services && (
          <div style={{ padding: "12px 20px" }}>
            <div className="text-overline" style={{ color: "var(--c-fg-subtle)", marginBottom: 8 }}>Service-Bundle</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {appt.services.map(s => (
                <span key={s} style={{ fontSize: 11, fontWeight: 500, color: "var(--c-fg-muted)", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", padding: "3px 9px", borderRadius: 4 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, padding: "12px 20px 20px" }}>
          <button className="btn-gold" style={{ flex: 1 }}><MessageSquare size={13} /> WhatsApp senden</button>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Schließen</button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
function EmptyDay() {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>✂️</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-fg)", marginBottom: 4 }}>Keine Termine heute</div>
      <div style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>Noch keine Airtable-Daten oder freier Tag.</div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const { betaMode } = useBeta();
  const [selectedAppt, setSelectedAppt] = useState<DisplayAppt | null>(null);
  const [realToday,    setRealToday]    = useState<RealAppt[]>([]);
  const [weekAppts,    setWeekAppts]    = useState<RealAppt[]>([]);
  const [loading,      setLoading]      = useState(true);

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  useEffect(() => {
    if (betaMode) { setLoading(false); return; }
    setLoading(true);

    // Fetch today's appointments
    fetch(`/api/appointments?date=${todayISO}`)
      .then(r => r.json())
      .then(d => setRealToday(d.appointments ?? []))
      .catch(() => {});

    // Fetch this week's appointments (Mon–Sun)
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    const monISO = mon.toISOString().slice(0, 10);
    // Fetch each day of the week — simple: fetch without date filter (all) and filter client-side
    fetch("/api/appointments")
      .then(r => r.json())
      .then(d => {
        const all: RealAppt[] = d.appointments ?? [];
        const weekStart = monISO;
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        const weekEnd = sun.toISOString().slice(0, 10);
        setWeekAppts(all.filter(a => a.date >= weekStart && a.date <= weekEnd));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betaMode, todayISO]);

  const displayAppts: DisplayAppt[] = betaMode
    ? todayAppointments
    : realToday;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const totalRevenue = displayAppts.reduce((s, a) => s + a.totalAmount, 0);
  const openCount = displayAppts.filter(a => !a.depositPaid && a.status !== "completed").length;
  const today = now.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const employees = ["Aynur", "Monika", "Lisa"];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 className="text-h1" style={{ color: "var(--c-fg)" }}>Heute</h1>
          {betaMode && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: "rgba(212,176,119,0.15)", color: "var(--c-accent)", border: "1px solid rgba(212,176,119,0.3)", letterSpacing: 0.5 }}>
              BETA-DEMO
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: "var(--c-fg-muted)", lineHeight: 1.5 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-fg-subtle)" }}>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Lade Termine…
            </span>
          ) : (
            <>
              <strong style={{ color: "var(--c-fg)", fontWeight: 500 }}>{displayAppts.length} Termine</strong>
              {" · "}
              <strong style={{ color: "var(--c-fg)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                €{totalRevenue} erwartet
              </strong>
              {" · "}
              <span>{openCount} Anzahlungen offen</span>
            </>
          )}
        </p>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "var(--c-fg-subtle)", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", padding: "2px 8px", borderRadius: 4 }}>
            {today} · Geöffnet bis 19:00
          </span>
        </div>
      </motion.div>

      {/* ── KPI card ── */}
      <KpiSection weekAppts={betaMode ? [] : weekAppts} betaMode={betaMode} />

      {/* ── Today's appointments ── */}
      <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35, ease: EASE }} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--c-border)" }}>
          <span className="text-overline" style={{ color: "var(--c-fg-subtle)" }}>Heute</span>
          <a href="/kalender" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: "var(--c-fg-muted)", textDecoration: "none" }}>
            {displayAppts.length} Termine · Kalender <ChevronRight size={12} />
          </a>
        </div>

        {/* Employee summary */}
        <div style={{ display: "flex", gap: 20, padding: "8px 20px", borderBottom: "1px solid var(--c-border)" }}>
          {employees.map(emp => {
            const count = displayAppts.filter(a => a.employee === emp).length;
            return (
              <div key={emp} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, color: "var(--c-fg-subtle)" }}>{emp} · {count} Termine</span>
              </div>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ height: 60, borderRadius: 8, background: "var(--c-bg-subtle)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        )}

        {/* Appointments or empty */}
        {!loading && displayAppts.length === 0 && <EmptyDay />}

        {!loading && displayAppts.map((appt, i) => {
          const [h, m] = appt.startTime.split(":").map(Number);
          const apptMin = h * 60 + m;
          const isPast    = currentMinutes > apptMin + appt.duration;
          const isCurrent = currentMinutes >= apptMin && currentMinutes < apptMin + appt.duration;
          return (
            <AppointmentRow
              key={appt.id} appt={appt} i={i} total={displayAppts.length}
              isCurrent={isCurrent} isPast={isPast}
              onClick={() => setSelectedAppt(appt)}
            />
          );
        })}
      </motion.div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedAppt && <ApptModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} />}
      </AnimatePresence>
    </div>
  );
}
