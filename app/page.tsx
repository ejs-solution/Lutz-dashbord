"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { AlertTriangle, X, RefreshCw, ChevronRight, Ban, CalendarDays, TrendingUp, Clock, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useBeta } from "@/lib/beta-context";
import { todayAppointments } from "@/lib/mock-data";
import DashboardExtras from "@/components/dashboard/DashboardExtras";

/* ─── Types ──────────────────────────────────────────────── */
type Appt = {
  id: string;
  customerName: string;
  service: string;
  employee: string;
  startTime: string;
  duration: number;
  totalAmount: number;
  status: string;
  depositPaid: boolean;
};

type Employee = "Alle" | "Aynur" | "Monika" | "Lisa";
const EMPLOYEES: Employee[] = ["Alle", "Aynur", "Monika", "Lisa"];

const MOCK_BREAKS = [
  { afterTime: "12:30", label: "Mittagspause 13:00–14:00" },
];

/* ─── Helpers ────────────────────────────────────────────── */
function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/* ─── Detail modal ───────────────────────────────────────── */
function DetailModal({ appt, onClose }: { appt: Appt; onClose: () => void }) {
  const rows = [
    { label: "Service",     value: appt.service },
    { label: "Uhrzeit",     value: `${appt.startTime} Uhr · ${appt.duration} Min.` },
    { label: "Mitarbeiter", value: appt.employee },
    { label: "Preis",       value: `€ ${appt.totalAmount}` },
    { label: "Anzahlung",   value: appt.depositPaid ? "Bezahlt" : "Offen" },
  ];
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100 }}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 101,
          background: "var(--c-bg-elevated)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--c-border)",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          maxWidth: 600, margin: "0 auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--c-border)", margin: "12px auto 0" }} />

        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--c-fg)", letterSpacing: -0.3 }}>
                {appt.customerName}
              </div>
              <div style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginTop: 2 }}>
                {appt.startTime} Uhr
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <X size={18} style={{ color: "var(--c-fg-subtle)" }} />
            </button>
          </div>

          {rows.map(({ label, value }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "11px 0", borderTop: "1px solid var(--c-border)",
              fontSize: 14,
            }}>
              <span style={{ color: "var(--c-fg-subtle)" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "var(--c-fg)" }}>{value}</span>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, padding: "16px 0 20px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Swipeable appointment row ─────────────────────────── */
function ApptRow({
  appt, isLast, isCurrent, isPast,
  onClick, onCancel,
}: {
  appt: Appt; isLast: boolean; isCurrent: boolean; isPast: boolean;
  onClick: () => void; onCancel: () => void;
}) {
  const x       = useMotionValue(0);
  const opacity = useTransform(x, [-72, -20], [1, 0]);
  const [swiped, setSwiped] = useState(false);

  function onDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -55) {
      setSwiped(true);
    } else {
      x.set(0);
    }
  }

  if (swiped) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 64 }}
        animate={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25 }}
        onAnimationComplete={onCancel}
        style={{ overflow: "hidden" }}
      />
    );
  }

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      borderBottom: isLast ? "none" : "1px solid var(--c-border)",
    }}>
      {/* Cancel reveal (behind) */}
      <motion.div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 72,
        background: "#ef4444", display: "flex", alignItems: "center",
        justifyContent: "center", opacity,
      }}>
        <Ban size={18} color="#fff" />
      </motion.div>

      {/* Row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -72, right: 0 }}
        dragElastic={0.1}
        onDragEnd={onDragEnd}
        style={{
          x,
          display: "flex", alignItems: "center",
          minHeight: 64, padding: "0 16px",
          background: "var(--c-bg-elevated)",
          cursor: "pointer",
          borderLeft: isCurrent ? "3px solid var(--c-accent)" : "3px solid transparent",
        }}
        onClick={onClick}
        whileTap={{ backgroundColor: "var(--c-bg-subtle)" }}
      >
        {/* Time — always gold */}
        <div style={{
          width: 52, flexShrink: 0, marginRight: 16,
          fontSize: 17, fontWeight: 700,
          fontFamily: "ui-monospace, monospace",
          color: "var(--c-accent)",
          letterSpacing: -0.3,
        }}>
          {appt.startTime}
        </div>

        {/* Name + service */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: "var(--c-fg)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            marginBottom: 2,
          }}>
            {appt.customerName}
          </div>
          <div style={{
            fontSize: 13, color: "var(--c-fg-subtle)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {appt.service}
            <span style={{ color: "var(--c-fg-faint)", margin: "0 4px" }}>·</span>
            {appt.employee}
          </div>
        </div>

        {/* Price */}
        <div style={{
          flexShrink: 0, marginLeft: 12,
          fontSize: 14, fontWeight: 600,
          fontFamily: "ui-monospace, monospace",
          color: "var(--c-fg)",
          fontVariantNumeric: "tabular-nums",
        }}>
          €{appt.totalAmount}
        </div>

        <ChevronRight size={14} style={{ color: "var(--c-fg-faint)", marginLeft: 8, flexShrink: 0 }} />
      </motion.div>
    </div>
  );
}

/* ─── Break divider ──────────────────────────────────────── */
function BreakDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "8px 16px",
      borderBottom: "1px solid var(--c-border)",
    }}>
      <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
      <span style={{ fontSize: 11, color: "var(--c-fg-faint)", fontWeight: 500, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const { betaMode }              = useBeta();
  const [appts, setAppts]         = useState<Appt[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeEmp, setActiveEmp] = useState<Employee>("Alle");
  const [selected, setSelected]   = useState<Appt | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY  = useRef(0);
  const listRef     = useRef<HTMLDivElement>(null);
  const now         = new Date();
  const nowMin      = now.getHours() * 60 + now.getMinutes();

  /* ── Load data ── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      if (betaMode) {
        setAppts(todayAppointments as Appt[]);
      } else {
        const r = await fetch(`/api/appointments?date=${todayISO()}`);
        const d = await r.json();
        setAppts((d.appointments ?? []).filter((a: Appt) => a.status !== "cancelled"));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [betaMode]);

  useEffect(() => { load(); }, [load]);

  /* ── Pull-to-refresh ── */
  function onTouchStart(e: React.TouchEvent) {
    pullStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dy = e.changedTouches[0].clientY - pullStartY.current;
    const scrollTop = listRef.current?.scrollTop ?? 0;
    if (dy > 60 && scrollTop === 0 && !loading) {
      setRefreshing(true);
      load(true);
    }
  }

  /* ── Derived ── */
  const filtered = useMemo(() =>
    activeEmp === "Alle" ? appts : appts.filter(a => a.employee === activeEmp),
    [appts, activeEmp]
  );

  const sortedAppts = useMemo(() =>
    [...filtered].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
    [filtered]
  );

  const totalRevenue   = appts.reduce((s, a) => s + a.totalAmount, 0);
  const openDeposits   = appts.filter(a => !a.depositPaid).length;
  const cancelledToday = 0; // real: fetch cancelled separately
  const newRequests    = betaMode ? 2 : 0;
  const showAlert      = newRequests > 0 || cancelledToday > 0;

  /* ── Cancel appt ── */
  function handleCancel(id: string) {
    setAppts(prev => prev.filter(a => a.id !== id));
  }

  /* ── Inject breaks ── */
  type Row = { type: "appt"; appt: Appt } | { type: "break"; label: string };
  const rows: Row[] = useMemo(() => {
    if (!betaMode) return sortedAppts.map(a => ({ type: "appt" as const, appt: a }));
    const result: Row[] = [];
    const breakInserted = new Set<string>();
    for (let i = 0; i < sortedAppts.length; i++) {
      const appt = sortedAppts[i];
      // Check if a break should be inserted before this appointment
      for (const br of MOCK_BREAKS) {
        if (!breakInserted.has(br.label) && toMinutes(appt.startTime) >= toMinutes(br.afterTime) + 30) {
          // Check previous appointment ended before break
          const prev = sortedAppts[i - 1];
          if (!prev || toMinutes(prev.startTime) + prev.duration <= toMinutes(br.afterTime) + 30) {
            result.push({ type: "break", label: br.label });
            breakInserted.add(br.label);
          }
        }
      }
      result.push({ type: "appt", appt });
    }
    return result;
  }, [sortedAppts, betaMode]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100dvh - 48px)", overflow: "hidden" }}>

      {/* ══ FIXED HEADER (never scrolls) ══ */}
      <div style={{ flexShrink: 0 }}>

      {/* ── Header ── */}
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--c-border)" }}>
        <div style={{ fontSize: 13, color: "var(--c-fg-subtle)", fontWeight: 400 }}>
          {fmtDate(now)}
        </div>
      </div>

      {/* ── 3 numbers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 12px 14px", borderBottom: "1px solid var(--c-border)" }}>
        {([{
          value: loading ? "–" : String(appts.length), label: "Termine heute", href: "/kalender", icon: CalendarDays,
        }, {
          value: loading ? "–" : `€ ${totalRevenue}`, label: "erwartet", href: null, icon: TrendingUp,
        }, {
          value: loading ? "–" : String(openDeposits), label: "offen", href: null, icon: Clock,
        }] as { value: string; label: string; href: string | null; icon: LucideIcon }[]).map(({ value, label, href, icon: Icon }) => {
          const content = (<><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: href ? "var(--c-accent)" : "var(--c-fg-muted)" }}><Icon size={16} strokeWidth={2} /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span>{href && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}</div><div style={{ fontSize: 34, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5, lineHeight: 1 }}>{value}</div></>);
          const s: React.CSSProperties = { padding: "20px 22px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 15, textAlign: "left" };
          return href ? <Link key={label} href={href} style={{ ...s, textDecoration: "none", display: "block" }}>{content}</Link> : <div key={label} style={s}>{content}</div>;
        })}
      </div>

      {/* ── Alert row ── */}
      {showAlert && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px",
            background: "rgba(212,176,119,0.08)",
            borderBottom: "1px solid rgba(212,176,119,0.2)",
          }}
        >
          <AlertTriangle size={13} style={{ color: "var(--c-accent)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--c-fg-subtle)" }}>
            {newRequests > 0 && <><strong style={{ color: "var(--c-fg)" }}>{newRequests} neue Anfragen</strong></>}
            {newRequests > 0 && cancelledToday > 0 && " · "}
            {cancelledToday > 0 && <><strong style={{ color: "var(--c-fg)" }}>{cancelledToday} Stornierung</strong> heute</>}
          </span>
        </motion.div>
      )}

      {/* ── Employee tabs ── */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "1px solid var(--c-border)",
        overflowX: "auto",
        scrollbarWidth: "none",
        background: "var(--c-bg-elevated)",
        padding: "0 4px",
      }}>
        {EMPLOYEES.map(emp => (
          <button
            key={emp}
            onClick={() => setActiveEmp(emp)}
            style={{
              padding: "10px 14px", fontSize: 13, fontWeight: activeEmp === emp ? 700 : 400,
              border: "none", background: "transparent", cursor: "pointer",
              color: activeEmp === emp ? "var(--c-fg)" : "var(--c-fg-subtle)",
              borderBottom: activeEmp === emp ? "2px solid var(--c-accent)" : "2px solid transparent",
              whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.13s",
            }}
          >
            {emp}
            {emp !== "Alle" && !loading && (
              <span style={{
                marginLeft: 5, fontSize: 11,
                color: activeEmp === emp ? "var(--c-accent)" : "var(--c-fg-faint)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {appts.filter(a => a.employee === emp).length}
              </span>
            )}
          </button>
        ))}
      </div>
      </div>{/* end fixed header */}

      {/* ══ SCROLLABLE LIST ══ */}
      <div
        ref={listRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
      >
        {/* Pull-to-refresh indicator */}
        <AnimatePresence>
          {refreshing && (
            <motion.div initial={{ height: 0 }} animate={{ height: 36 }} exit={{ height: 0 }} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg-subtle)", overflow: "hidden" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                <RefreshCw size={14} style={{ color: "var(--c-fg-subtle)" }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "0 16px", height: 64,
            borderBottom: "1px solid var(--c-border)",
          }}>
            <div style={{ width: 44, height: 16, borderRadius: 4, background: "var(--c-bg-strong)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "55%", height: 14, borderRadius: 4, background: "var(--c-bg-strong)", marginBottom: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ width: "40%", height: 11, borderRadius: 4, background: "var(--c-bg-subtle)", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
            <div style={{ width: 36, height: 14, borderRadius: 4, background: "var(--c-bg-strong)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        ))}

        {/* Error state */}
        {!loading && error && (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--c-fg-subtle)", marginBottom: 12 }}>
              Daten konnten nicht geladen werden.
            </div>
            <button
              onClick={() => load()}
              style={{
                padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "var(--c-bg-strong)", color: "var(--c-fg)", border: "none", cursor: "pointer",
              }}
            >
              Neu laden
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rows.length === 0 && (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-fg)", marginBottom: 6 }}>
              Heute noch keine Termine.
            </div>
            <div style={{ fontSize: 13, color: "var(--c-fg-subtle)" }}>
              Paul hält Ausschau.
            </div>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && rows.map((row, i) => {
          if (row.type === "break") {
            return <BreakDivider key={`break-${i}`} label={row.label} />;
          }
          const { appt } = row;
            const apptMin = toMinutes(appt.startTime);
          // Only mark as current — no past fading (looks broken in demo)
          const isCurrent = !betaMode && nowMin >= apptMin && nowMin < apptMin + appt.duration;
          const isPast    = false;
            const isLast = i === rows.length - 1 || rows[i + 1]?.type === "break";
          return (
            <ApptRow
              key={appt.id}
              appt={appt}
              isLast={isLast}
              isCurrent={isCurrent}
              isPast={isPast}
              onClick={() => setSelected(appt)}
              onCancel={() => handleCancel(appt.id)}
            />
          );
        })}

        {/* Wochen-Überblick, nächste Termine, hilfreiche Aktionen */}
        {!loading && !error && <DashboardExtras />}

        {/* Bottom padding for mobile nav */}
        <div style={{ height: 24 }} />
      </div>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selected && (
          <DetailModal appt={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
