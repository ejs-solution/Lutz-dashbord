"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Clock, Zap, AlertCircle,
  CheckCircle, ChevronRight, MessageSquare, Phone,
  Activity, Scissors, Bell, HeartPulse,
} from "lucide-react";
import { todayAppointments, weekMetrics } from "@/lib/mock-data";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

function MetricCard({
  label, value, prefix = "", suffix = "", sub, trend, trendLabel, color = "green", icon, delay = 0,
}: {
  label: string; value: number; prefix?: string; suffix?: string; sub?: string;
  trend?: number; trendLabel?: string; color?: "green" | "red" | "gold" | "blue";
  icon: React.ReactNode; delay?: number;
}) {
  const colorMap = { green: "var(--green)", red: "var(--red)", gold: "var(--accent)", blue: "var(--blue)" };
  const displayed = useCountUp(value, 1200);
  const isPositive = (trend ?? 0) >= 0;

  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
      whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${colorMap[color]}18`,
          border: `1px solid ${colorMap[color]}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: colorMap[color] }}>{icon}</span>
        </div>
        {trend != null && (
          <div style={{
            display: "flex", alignItems: "center", gap: 3,
            fontSize: 12, fontWeight: 700,
            color: isPositive ? "var(--green)" : "var(--red)",
            background: isPositive ? "var(--green-bg)" : "var(--red-bg)",
            border: `1px solid ${isPositive ? "var(--green-border)" : "var(--red-border)"}`,
            padding: "3px 8px", borderRadius: 999,
          }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ fontSize: "1.9rem", fontWeight: 900, color: colorMap[color], lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {prefix}{displayed.toLocaleString("de-DE")}{suffix}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>}
      {trendLabel && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{trendLabel}</div>}
    </motion.div>
  );
}

const channelIcon: Record<string, React.ReactNode> = {
  whatsapp:  <MessageSquare size={12} className="ch-whatsapp" />,
  instagram: <Activity size={12} className="ch-instagram" />,
  phone:     <Phone size={12} className="ch-voice" />,
  email:     <MessageSquare size={12} className="ch-email" />,
};

const statusColors: Record<string, string> = {
  confirmed: "var(--green)",
  pending:   "var(--accent)",
  completed: "var(--text-muted)",
  cancelled: "var(--red)",
};

const employeeColors: Record<string, string> = {
  Aynur:  "var(--accent)",
  Monika: "var(--green)",
  Lisa:   "var(--blue)",
};

export default function DashboardPage() {
  const [sickMode, setSickMode] = useState(false);
  const [waitlistSent, setWaitlistSent] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<typeof todayAppointments[0] | null>(null);

  const m = weekMetrics;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = now.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--accent-glow)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 999, padding: "5px 12px", marginBottom: 10,
            }}>
              <Zap size={12} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>Paul · KI-Agent ist aktiv</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", lineHeight: 1.1, marginBottom: 4, letterSpacing: -0.5 }}>
              Guten Morgen! ☀️
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{today}</p>
          </div>

          {/* Quick stats pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "12px 16px", display: "flex", gap: 20, flexShrink: 0,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>{todayAppointments.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Heute</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--green)" }}>
                € {todayAppointments.reduce((s, a) => s + a.totalAmount, 0)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Umsatz</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)" }}>3</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Offen</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Metric Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        <MetricCard
          label="Umsatz durch Paul"
          value={m.revenueByPaul}
          prefix="€ "
          sub="Diese Woche"
          trend={m.revenueTrend}
          trendLabel="vs. letzte Woche"
          color="green"
          icon={<TrendingUp size={18} />}
          delay={0.05}
        />
        <MetricCard
          label="Gerettete Termine"
          value={m.savedAppointments}
          sub="Außerhalb Öffnungszeiten"
          trend={m.savedAppointmentsTrend}
          trendLabel="Paul hat 24/7 geantwortet"
          color="gold"
          icon={<Zap size={18} />}
          delay={0.12}
        />
        <MetricCard
          label="Eingesparte Zeit"
          value={m.timeSaved}
          suffix=" Std."
          sub="Manuelle Arbeit ersetzt"
          color="blue"
          icon={<Clock size={18} />}
          delay={0.19}
        />
        <MetricCard
          label="No-Show Rate"
          value={m.noShowRate}
          suffix="%"
          sub="KI-Erinnerungen aktiv"
          trend={m.noShowRateDelta}
          trendLabel="Dank automatischer Erinnerungen"
          color="red"
          icon={<AlertCircle size={18} />}
          delay={0.26}
        />
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: EASE }}
        className="card"
        style={{ padding: "16px 18px", marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-sub)", marginRight: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={14} style={{ color: "var(--accent)" }} />
          Quick Actions
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setSickMode(!sickMode)}
          className={sickMode ? "btn-danger" : "btn-ghost"}
          style={{ fontSize: 13 }}
        >
          <HeartPulse size={14} />
          {sickMode ? "Krankheits-Modus AKTIV" : "Krankheits-Modus"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setWaitlistSent(true); setTimeout(() => setWaitlistSent(false), 3000); }}
          className="btn-ghost"
          style={{ fontSize: 13, color: waitlistSent ? "var(--green)" : undefined, borderColor: waitlistSent ? "var(--green-border)" : undefined }}
        >
          {waitlistSent ? <CheckCircle size={14} /> : <Bell size={14} />}
          {waitlistSent ? "Warteliste benachrichtigt!" : "Warteliste benachrichtigen"}
        </motion.button>
      </motion.div>

      {/* ── Today's Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, ease: EASE }}
        className="card"
        style={{ overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Scissors size={17} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Heute — Terminplan</span>
            <span className="badge badge-gold">{todayAppointments.length} Termine</span>
          </div>
          <a href="/kalender" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
            Kalender <ChevronRight size={14} />
          </a>
        </div>

        {/* Employee legend */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["Aynur", "Monika", "Lisa"].map((e) => (
            <div key={e} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--text-sub)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: employeeColors[e], display: "inline-block" }} />
              {e}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
          {todayAppointments.map((appt, i) => {
            const [h, m] = appt.startTime.split(":").map(Number);
            const apptMinutes = h * 60 + m;
            const isPast = currentMinutes > apptMinutes + appt.duration;
            const isCurrent = currentMinutes >= apptMinutes && currentMinutes < apptMinutes + appt.duration;

            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05, ease: EASE }}
                onClick={() => setSelectedAppt(appt)}
                whileHover={{ x: 4 }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "10px 0",
                  borderBottom: i < todayAppointments.length - 1 ? "1px solid var(--border)" : "none",
                  opacity: isPast ? 0.45 : 1,
                  cursor: "pointer",
                }}
              >
                {/* Time */}
                <div style={{ width: 44, flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? "var(--accent)" : "var(--text-sub)" }}>
                    {appt.startTime}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{appt.duration}min</div>
                </div>

                {/* Line */}
                <div style={{ width: 2, height: 40, borderRadius: 999, background: employeeColors[appt.employee], flexShrink: 0, position: "relative" }}>
                  {isCurrent && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ position: "absolute", top: -3, left: -3, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }}
                    />
                  )}
                </div>

                {/* Avatar */}
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                  {appt.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{appt.customerName}</span>
                    {appt.isVIP && <span className="badge badge-gold" style={{ fontSize: 10 }}>VIP</span>}
                    <span style={{ fontSize: 11 }}>{appt.langFlag}</span>
                    <span style={{ fontSize: 11 }}>{channelIcon[appt.channel]}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Scissors size={11} />
                    {appt.service}
                    <span style={{ color: employeeColors[appt.employee], fontWeight: 700 }}>· {appt.employee}</span>
                  </div>
                </div>

                {/* Price + Status */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--green)", marginBottom: 2 }}>
                    € {appt.totalAmount}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[appt.status], display: "inline-block" }} />
                    {appt.depositPaid && (
                      <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>Anzahlung ✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Appointment Detail Modal ── */}
      <AnimatePresence>
        {selectedAppt && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppt(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{
                position: "fixed",
                zIndex: 101,
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: "min(460px, calc(100vw - 32px))",
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: 20,
                padding: 24,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Modal header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{selectedAppt.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>{selectedAppt.customerName}</span>
                    {selectedAppt.isVIP && <span className="badge badge-gold">VIP</span>}
                    <span style={{ fontSize: 14 }}>{selectedAppt.langFlag}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{selectedAppt.customerPhone || "Kein Tel."}</div>
                </div>
                <button onClick={() => setSelectedAppt(null)} className="btn-ghost" style={{ borderRadius: 8, padding: "6px 10px", fontSize: 20, lineHeight: 1 }}>×</button>
              </div>

              {/* Detail rows */}
              {[
                { label: "Service", value: selectedAppt.service },
                { label: "Uhrzeit", value: `${selectedAppt.startTime} Uhr · ${selectedAppt.duration} Min.` },
                { label: "Mitarbeiter", value: selectedAppt.employee },
                { label: "Kanal", value: selectedAppt.channel.toUpperCase() },
                { label: "Gesamtpreis", value: `€ ${selectedAppt.totalAmount}` },
                {
                  label: "Anzahlung (Stripe)",
                  value: selectedAppt.depositPaid
                    ? `€ ${selectedAppt.depositAmount} bezahlt ✓`
                    : "Noch nicht bezahlt",
                },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid var(--border)",
                  fontSize: 14,
                }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{value}</span>
                </div>
              ))}

              {selectedAppt.services && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>SERVICE-BUNDLE</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedAppt.services.map((s) => (
                      <span key={s} className="badge badge-gray" style={{ padding: "5px 10px" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <button className="btn-gold" style={{ flex: 1 }}>
                  <MessageSquare size={14} /> WhatsApp senden
                </button>
                <button className="btn-ghost" onClick={() => setSelectedAppt(null)} style={{ flex: 1 }}>
                  Schließen
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
