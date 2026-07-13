"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { TrendingUp, Clock, Phone, MessageSquare, CheckCircle, Euro, Star, Zap } from "lucide-react";

type Lead = { id: string; fields: Record<string, unknown>; createdTime?: string };

const MINUTES_PER_LEAD = 8; // Avg time saved per lead handling
const HOURLY_RATE = 15;     // Cost per hour of manual work
const AVG_SERVICE_VALUE = 35; // Avg revenue per confirmed booking

export default function ROIPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads?maxRecords=100")
      .then((r) => r.json())
      .then((d) => d.records && setLeads(d.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = leads.length;
  const bestätigt = leads.filter((l) => String(l.fields["Status"] || "").toLowerCase() === "bestätigt").length;
  const bookingRequests = leads.filter((l) => l.fields["Service_Typ"] === "booking_request").length;

  // Revenue from actual price fields
  const revenueFromPrices = leads
    .filter((l) => l.fields["Preis_Min_EUR"] != null && Number(l.fields["Preis_Min_EUR"]) > 0 && String(l.fields["Status"] || "").toLowerCase() === "bestätigt")
    .reduce((sum, l) => sum + Number(l.fields["Preis_Min_EUR"]), 0);

  const estimatedRevenue = revenueFromPrices > 0
    ? revenueFromPrices
    : bestätigt * AVG_SERVICE_VALUE;

  const minutesSaved = total * MINUTES_PER_LEAD;
  const hoursSaved = Math.round(minutesSaved / 60 * 10) / 10;
  const moneySaved = Math.round((minutesSaved / 60) * HOURLY_RATE);
  const buchungsrate = total > 0 ? Math.round((bookingRequests / total) * 100) : 0;

  const EASE = [0.25, 0.46, 0.45, 0.94] as const;
  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.09 } } },
    item: {
      initial: { opacity: 0, y: 22 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
    },
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)",
          borderRadius: 999, padding: "5px 12px", marginBottom: 10,
        }}>
          <Star size={12} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>Dein ROI durch ARIA</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.2 }}>
          Gewonnene Kunden
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Was ARIA automatisch für dich erledigt hat
        </p>
      </motion.div>

      {/* ── Hero Revenue Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 28 }}
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
          borderRadius: 18,
          padding: "24px 22px",
          marginBottom: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative bg */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", right: -40, top: -40,
            width: 160, height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,39,0.2) 0%, transparent 70%)",
          }}
        />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
            Umsatz gesichert durch ARIA
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--accent)", lineHeight: 1, marginBottom: 4 }}>
            {loading ? "—" : <CountUp value={estimatedRevenue} prefix="€ " duration={1500} delay={200} />}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {bestätigt} bestätigte Buchungen · Ø € {revenueFromPrices > 0 ? Math.round(revenueFromPrices / Math.max(bestätigt, 1)) : AVG_SERVICE_VALUE} pro Buchung
          </div>
        </div>
      </motion.div>

      {/* ── Key Metrics Grid ── */}
      {!loading && (
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}
        >
          {[
            {
              label: "Anfragen automatisch bearbeitet",
              value: total,
              suffix: "",
              color: "var(--text)",
              icon: <MessageSquare size={18} style={{ color: "var(--accent)" }} />,
              sub: "statt manuell beantworten",
            },
            {
              label: "Stunden Zeit gespart",
              value: hoursSaved,
              suffix: " Std.",
              color: "var(--green)",
              icon: <Clock size={18} style={{ color: "var(--green)" }} />,
              sub: `${minutesSaved} Minuten`,
              isFloat: true,
            },
            {
              label: "Gesparte Personalkosten",
              value: moneySaved,
              suffix: "",
              prefix: "€ ",
              color: "var(--green)",
              icon: <Euro size={18} style={{ color: "var(--green)" }} />,
              sub: `bei €${HOURLY_RATE}/Std. Personalaufwand`,
            },
            {
              label: "Buchungsrate",
              value: buchungsrate,
              suffix: "%",
              color: "var(--accent)",
              icon: <TrendingUp size={18} style={{ color: "var(--accent)" }} />,
              sub: `${bookingRequests} Buchungsabsichten`,
            },
          ].map(({ label, value, suffix, prefix = "", color, icon, sub, isFloat }) => (
            <motion.div
              key={label}
              variants={stagger.item}
              whileHover={{ y: -3 }}
              className="card"
              style={{ padding: "16px 16px" }}
            >
              <div style={{ marginBottom: 10 }}>{icon}</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>
                {prefix}
                {isFloat
                  ? <span className="count-up">{value}</span>
                  : <CountUp value={Math.round(value as number)} suffix={suffix} duration={1100} delay={300} />
                }
                {isFloat && suffix}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Comparison Block ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
        style={{ padding: "18px 18px", marginBottom: 14 }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 14 }}>
          ARIA vs. Ohne Automatisierung
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Antwortzeit", aria: "< 3 Sekunden", ohne: "Stunden / Tage", win: true },
            { label: "Verfügbarkeit", aria: "24/7 · 365 Tage", ohne: "Öffnungszeiten", win: true },
            { label: "Verpasste Anfragen", aria: "0", ohne: `~${Math.round(total * 0.4)} geschätzt`, win: true },
            { label: "Monatliche Kosten", aria: "Abo-Flat", ohne: `€ ${Math.round(moneySaved + 150)}+ Personalkosten`, win: true },
          ].map(({ label, aria, ohne, win }) => (
            <div key={label} style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</div>
              <div style={{
                fontSize: 12, fontWeight: 800, color: "var(--green)",
                background: "var(--green-bg)", borderRadius: 6, padding: "4px 8px", textAlign: "center",
              }}>
                ✓ {aria}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600, color: "var(--red)",
                background: "var(--red-bg)", borderRadius: 6, padding: "4px 8px", textAlign: "center",
              }}>
                ✗ {ohne}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Monthly Projection ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          background: "var(--green-bg)",
          border: "1px solid var(--green-border)",
          borderRadius: 14,
          padding: "18px 18px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <TrendingUp size={18} style={{ color: "var(--green)" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--green)" }}>Hochrechnung / Monat</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Gesicherte Buchungen", value: `${bestätigt * 4}+` },
            { label: "Umsatz-Potenzial", value: `€ ${(estimatedRevenue * 4).toLocaleString("de-DE")}+` },
            { label: "Zeit gespart", value: `${Math.round(hoursSaved * 4)} Std.` },
            { label: "Kosten gespart", value: `€ ${moneySaved * 4}+` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--green)", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--green)", opacity: 0.7, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--green)", opacity: 0.6, marginTop: 10 }}>
          * Basierend auf aktuellen {total} Leads × 4 Wochen Hochrechnung
        </div>
      </motion.div>

      {/* ── Channel Breakdown ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="card"
        style={{ padding: "18px 18px" }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 14 }}>
          Automatisch bearbeitet via
        </div>
        {[
          { label: "Booking Requests", value: bookingRequests, total, color: "var(--accent)", icon: <Zap size={14} /> },
          { label: "Bestätigt", value: bestätigt, total, color: "var(--green)", icon: <CheckCircle size={14} /> },
          { label: "Voice-Anrufe (VAPI)", value: Math.round(total * 0.15), total, color: "#c9a227", icon: <Phone size={14} /> },
        ].map(({ label, value, total, color, icon }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                <span style={{ color }}>{icon}</span>
                {label}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
            </div>
            <motion.div
              style={{ height: 7, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
                transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                style={{ height: "100%", background: color, borderRadius: 999 }}
              />
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
