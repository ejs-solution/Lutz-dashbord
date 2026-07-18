"use client";

import { useState, useMemo } from "react";
import { useBeta } from "@/lib/beta-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Users, Clock, TrendingUp, MessageCircle, X,
  ChevronDown, Send, Zap, Filter, CheckCircle2,
} from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const COUPON = "COMEBACK10";

/* ─── Types ────────────────────────────────────────────────── */
type Customer = {
  id: string;
  name: string;
  phone: string;
  phoneDisplay: string;
  lastVisit: string;        // YYYY-MM-DD
  monthsAbsent: number;
  totalVisits: number;
  favoriteService: string;
  avgSpend: number;
  avatar: string;
  color: string;
};

/* ─── Mock data ─────────────────────────────────────────────── */
const CHURNED: Customer[] = [
  { id: "1",  name: "Büşra Şahin",    phone: "+4917623456789", phoneDisplay: "+49 176 234 56789", lastVisit: "2026-01-08", monthsAbsent: 4, totalVisits: 14, favoriteService: "Haarpflege",        avgSpend: 62, avatar: "BŞ", color: "#10b981" },
  { id: "2",  name: "Maria Müller",   phone: "+4916098765432", phoneDisplay: "+49 160 987 65432", lastVisit: "2025-12-15", monthsAbsent: 5, totalVisits: 22, favoriteService: "Balayage",           avgSpend: 120, avatar: "MM", color: "#60a5fa" },
  { id: "3",  name: "Emma Johnson",   phone: "+4915745678901", phoneDisplay: "+49 157 456 78901", lastVisit: "2025-11-20", monthsAbsent: 6, totalVisits: 8,  favoriteService: "Keratin-Behandlung", avgSpend: 95, avatar: "EJ", color: "#D4B077" },
  { id: "4",  name: "Fatma Yıldız",  phone: "+4917611223344", phoneDisplay: "+49 176 112 23344", lastVisit: "2026-01-30", monthsAbsent: 4, totalVisits: 31, favoriteService: "Dauerwelle",         avgSpend: 88, avatar: "FY", color: "#f472b6" },
  { id: "5",  name: "Sophie Wagner",  phone: "+4915212345678", phoneDisplay: "+49 152 123 45678", lastVisit: "2025-10-05", monthsAbsent: 8, totalVisits: 6,  favoriteService: "Haarschnitt",        avgSpend: 45, avatar: "SW", color: "#a78bfa" },
  { id: "6",  name: "Zeynep Kaya",   phone: "+4917699887766", phoneDisplay: "+49 176 998 87766", lastVisit: "2026-01-14", monthsAbsent: 4, totalVisits: 19, favoriteService: "Färbung",            avgSpend: 75, avatar: "ZK", color: "#34d399" },
  { id: "7",  name: "Laura Becker",  phone: "+4915811111222", phoneDisplay: "+49 158 111 11222", lastVisit: "2025-09-12", monthsAbsent: 9, totalVisits: 4,  favoriteService: "Highlights",         avgSpend: 110, avatar: "LB", color: "#fb923c" },
  { id: "8",  name: "Ayşe Doğan",   phone: "+4917787654321", phoneDisplay: "+49 177 876 54321", lastVisit: "2025-12-01", monthsAbsent: 6, totalVisits: 27, favoriteService: "Haarverlängerung",   avgSpend: 200, avatar: "AD", color: "#818cf8" },
  { id: "9",  name: "Mia Schneider", phone: "+4916133445566", phoneDisplay: "+49 161 334 45566", lastVisit: "2026-01-22", monthsAbsent: 4, totalVisits: 11, favoriteService: "Glättung",           avgSpend: 130, avatar: "MS", color: "#f87171" },
  { id: "10", name: "Hana Fischer",  phone: "+4917255443322", phoneDisplay: "+49 172 554 43322", lastVisit: "2025-08-30", monthsAbsent: 9, totalVisits: 7,  favoriteService: "Coloration",         avgSpend: 85, avatar: "HF", color: "#4ade80" },
  { id: "11", name: "Nora Hoffmann", phone: "+4915077665544", phoneDisplay: "+49 150 776 65544", lastVisit: "2026-02-10", monthsAbsent: 3, totalVisits: 16, favoriteService: "Botox-Behandlung",   avgSpend: 160, avatar: "NH", color: "#c084fc" },
  { id: "12", name: "Gülay Arslan",  phone: "+4917644332211", phoneDisplay: "+49 176 443 32211", lastVisit: "2025-11-05", monthsAbsent: 7, totalVisits: 23, favoriteService: "Ombre",              avgSpend: 95, avatar: "GA", color: "#fbbf24" },
  { id: "13", name: "Julia Richter", phone: "+4916077884455", phoneDisplay: "+49 160 778 84455", lastVisit: "2025-12-28", monthsAbsent: 5, totalVisits: 9,  favoriteService: "Toning",             avgSpend: 70, avatar: "JR", color: "#22d3ee" },
  { id: "14", name: "Leila Schmitt", phone: "+4915299887766", phoneDisplay: "+49 152 998 87766", lastVisit: "2025-07-14", monthsAbsent: 10, totalVisits: 5, favoriteService: "Haarschnitt",        avgSpend: 48, avatar: "LS", color: "#e879f9" },
  { id: "15", name: "Emine Çelik",  phone: "+4917633221100", phoneDisplay: "+49 176 332 21100", lastVisit: "2026-01-03", monthsAbsent: 5, totalVisits: 38, favoriteService: "Färbung + Schnitt",   avgSpend: 90, avatar: "EÇ", color: "#f59e0b" },
];

/* ─── Message generator ─────────────────────────────────────── */
function generateMessage(c: Customer): string {
  const firstName = c.name.split(" ")[0];
  const monthWord = c.monthsAbsent === 1 ? "Monat" : "Monaten";
  return `Hallo ${firstName}! 👋\n\nWir vermissen dich! Du warst seit ${c.monthsAbsent} ${monthWord} nicht mehr bei uns – und du weißt, dass deine Haare das liebste Pflege verdienen. 💆‍♀️\n\nAls Stammkunde hast du einen exklusiven *10% Rabatt* auf deinen nächsten Besuch:\n\n🎁 *Gutscheincode: ${COUPON}*\n\nEinfach beim Termin nennen und schon sparst du. Der Code ist 30 Tage gültig.\n\nWann darf ich dir einen Termin reservieren?\n\nDein CUTZ Solution Team ✂️\nwww.cutzsolution.de`;
}

/* ─── CampaignModal ──────────────────────────────────────────── */
function CampaignModal({ customers, onClose }: { customers: Customer[]; onClose: () => void }) {
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<string | null>(null); // customer id for preview

  function openWhatsApp(c: Customer) {
    const url = `https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(generateMessage(c))}`;
    window.open(url, "_blank");
    setSent(s => ({ ...s, [c.id]: true }));
  }

  function sendAll() {
    customers.forEach((c, i) => setTimeout(() => openWhatsApp(c), i * 600));
  }

  const sentCount = Object.values(sent).filter(Boolean).length;
  const previewCustomer = view ? customers.find(c => c.id === view) : null;

  return (
    <>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 700 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        style={{
          position: "fixed", zIndex: 701,
          top: "50%", left: "50%", x: "-50%", y: "-50%",
          width: "min(680px, calc(100vw - 24px))",
          maxHeight: "calc(100vh - 48px)",
          background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
          borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 96px rgba(0,0,0,0.65)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#D4B077,#f59e0b,#D4B077)", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.3 }}>
                Win-Back Kampagne starten
              </div>
              <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", marginTop: 4 }}>
                <span style={{ color: "var(--c-accent)", fontWeight: 700 }}>{customers.length} Kunden</span>
                {" "}· Gutscheincode <strong style={{ color: "var(--c-fg)" }}>{COUPON}</strong> (10% Rabatt, 30 Tage gültig) · via WhatsApp
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={18} style={{ color: "var(--c-fg-muted)" }} />
            </button>
          </div>

          {/* Progress bar */}
          {sentCount > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "var(--c-fg-subtle)" }}>Gesendet</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--c-accent)" }}>{sentCount} / {customers.length}</span>
              </div>
              <div style={{ height: 4, background: "var(--c-bg-strong)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${(sentCount / customers.length) * 100}%` }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#D4B077,#10b981)", borderRadius: 2 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Customer list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {customers.map(c => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                background: sent[c.id] ? "rgba(16,185,129,0.05)" : "var(--c-bg-subtle)",
                border: `1px solid ${sent[c.id] ? "#10b98130" : "var(--c-border)"}`,
                borderRadius: 12, transition: "all 0.2s",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `${c.color}22`, border: `1.5px solid ${c.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: c.color,
                }}>
                  {c.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fg)" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 1 }}>
                    {c.favoriteService} · seit <strong style={{ color: c.monthsAbsent >= 6 ? "#ef4444" : "var(--c-accent)" }}>{c.monthsAbsent} Mon.</strong> weg · Ø {c.avgSpend}€
                  </div>
                </div>

                {/* Preview button */}
                <button
                  onClick={() => setView(view === c.id ? null : c.id)}
                  style={{
                    padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: "transparent", color: "var(--c-fg-subtle)",
                    border: "1px solid var(--c-border)", cursor: "pointer",
                  }}
                >
                  Vorschau
                </button>

                {/* WhatsApp button */}
                <button
                  onClick={() => openWhatsApp(c)}
                  style={{
                    flexShrink: 0, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: sent[c.id] ? "rgba(16,185,129,0.12)" : "#25D366",
                    color: sent[c.id] ? "#10b981" : "#fff",
                    border: sent[c.id] ? "1px solid #10b98140" : "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                    transition: "all 0.2s",
                  }}
                >
                  <MessageCircle size={13} />
                  {sent[c.id] ? "✓ Gesendet" : "WhatsApp"}
                </button>
              </div>
            ))}

            {/* Message preview panel */}
            <AnimatePresence>
              {previewCustomer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    background: "var(--c-bg)", border: "1px solid var(--c-border)",
                    borderRadius: 12, padding: "14px 16px", marginTop: 4,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                      Nachrichtenvorschau · {previewCustomer.name}
                    </div>
                    <div style={{
                      fontSize: 12, color: "var(--c-fg)", lineHeight: 1.7,
                      whiteSpace: "pre-wrap", fontFamily: "inherit",
                      background: "var(--c-bg-subtle)", borderRadius: 8,
                      padding: "12px 14px", border: "1px solid var(--c-border)",
                    }}>
                      {generateMessage(previewCustomer)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--c-border)", flexShrink: 0 }}>
          <button
            onClick={sendAll}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 10, fontWeight: 900, fontSize: 14,
              background: "linear-gradient(135deg,#D4B077 0%,#f59e0b 100%)",
              color: "#0A0908", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(212,176,119,0.3)",
            }}
          >
            <Send size={16} />
            Alle {customers.length} gleichzeitig kontaktieren
          </button>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 8 }}>
            Öffnet WhatsApp mit personalisierter Nachricht + Gutscheincode {COUPON}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
const FILTER_OPTIONS = [
  { label: "3+ Monate", value: 3 },
  { label: "4+ Monate", value: 4 },
  { label: "6+ Monate", value: 6 },
  { label: "12+ Monate", value: 12 },
];

export default function WinBackPage() {
  const [minMonths, setMinMonths]       = useState(4);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [showCampaign, setShowCampaign] = useState(false);
  const [sortBy, setSortBy]             = useState<"months" | "value" | "visits">("months");
  const { betaMode } = useBeta();

  const filtered = useMemo(() => {
    // Echtes Konto: keine erfundenen Kunden. Beispieldaten nur im Beta-/Demo-Modus.
    const list = (betaMode ? CHURNED : []).filter(c => c.monthsAbsent >= minMonths);
    return [...list].sort((a, b) => {
      if (sortBy === "months")  return b.monthsAbsent - a.monthsAbsent;
      if (sortBy === "value")   return b.avgSpend - a.avgSpend;
      if (sortBy === "visits")  return b.totalVisits - a.totalVisits;
      return 0;
    });
  }, [minMonths, sortBy, betaMode]);

  const totalPotential = filtered.reduce((s, c) => s + c.avgSpend, 0);
  const avgMonths      = filtered.length
    ? Math.round(filtered.reduce((s, c) => s + c.monthsAbsent, 0) / filtered.length)
    : 0;

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  }

  function toggle(id: string) {
    setSelected(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const campaignCustomers = filtered.filter(c => selected.has(c.id));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={16} style={{ color: "var(--c-accent)" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.4 }}>Win-Back Maschine</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginLeft: 42 }}>
          Stammkunden zurückgewinnen mit personalisierten WhatsApp-Nachrichten und 10% Gutschein.
        </p>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, ease: EASE }}
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}
      >
        {[
          {
            icon: <Users size={16} style={{ color: "var(--c-accent)" }} />,
            label: "Inaktive Kunden",
            value: filtered.length,
            sub: `seit ${minMonths}+ Monaten weg`,
          },
          {
            icon: <Clock size={16} style={{ color: "#60a5fa" }} />,
            label: "Ø Abwesenheit",
            value: `${avgMonths} Mo.`,
            sub: "Durchschnitt",
          },
          {
            icon: <TrendingUp size={16} style={{ color: "#10b981" }} />,
            label: "Potenzieller Umsatz",
            value: `${totalPotential} €`,
            sub: "bei Rückgewinnung",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, ease: EASE }}
            style={{
              background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
              borderRadius: 12, padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--c-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: 11, color: "var(--c-fg-subtle)", fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.5 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 3 }}>{stat.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 3 }}>
          <Filter size={13} style={{ color: "var(--c-fg-subtle)", alignSelf: "center", marginLeft: 6 }} />
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setMinMonths(opt.value)}
              style={{
                padding: "5px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer",
                background: minMonths === opt.value ? "var(--c-accent)" : "transparent",
                color: minMonths === opt.value ? "var(--c-accent-fg)" : "var(--c-fg-muted)",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--c-fg-subtle)" }}>Sortieren:</span>
          <div style={{ display: "flex", gap: 3 }}>
            {(["months", "value", "visits"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: "4px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  background: sortBy === s ? "var(--c-bg-strong)" : "transparent",
                  color: sortBy === s ? "var(--c-fg)" : "var(--c-fg-subtle)",
                }}
              >
                {s === "months" ? "Dauer" : s === "value" ? "Wert" : "Besuche"}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Batch action bar ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 12 }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 16px",
              background: "rgba(212,176,119,0.08)",
              border: "1px solid rgba(212,176,119,0.3)",
              borderRadius: 10,
            }}>
              <CheckCircle2 size={15} style={{ color: "var(--c-accent)", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--c-fg)", fontWeight: 600, flex: 1 }}>
                {selected.size} Kunden ausgewählt
              </span>
              <button
                onClick={() => setShowCampaign(true)}
                style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                  background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Zap size={13} /> Kampagne starten
              </button>
              <button
                onClick={() => setSelected(new Set())}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
              >
                <X size={15} style={{ color: "var(--c-fg-subtle)" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Customer list ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, ease: EASE }}
        style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}
      >
        {/* List header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 18px", borderBottom: "1px solid var(--c-border)",
          background: "var(--c-bg-subtle)",
        }}>
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={toggleAll}
            style={{ width: 15, height: 15, accentColor: "var(--c-accent)", cursor: "pointer", flexShrink: 0 }}
          />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.6, flex: 1 }}>
            Kunde
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.6, width: 110, textAlign: "right" }}>
            Abwesend
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.6, width: 80, textAlign: "right" }}>
            Ø Umsatz
          </span>
          <div style={{ width: 140 }} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-fg-subtle)", fontSize: 13 }}>
            Keine inaktiven Kunden für diesen Filter gefunden.
          </div>
        ) : (
          filtered.map((c, idx) => {
            const isSelected = selected.has(c.id);
            const isLast     = idx === filtered.length - 1;
            const urgency    = c.monthsAbsent >= 8 ? "#ef4444" : c.monthsAbsent >= 6 ? "#f97316" : "var(--c-accent)";

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * idx, ease: EASE }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 18px",
                  borderBottom: isLast ? "none" : "1px solid var(--c-border)",
                  background: isSelected ? "rgba(212,176,119,0.04)" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(c.id)}
                  style={{ width: 15, height: 15, accentColor: "var(--c-accent)", cursor: "pointer", flexShrink: 0 }}
                />

                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `${c.color}20`, border: `1.5px solid ${c.color}45`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: c.color,
                }}>
                  {c.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fg)" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 1 }}>
                    {c.favoriteService} · {c.totalVisits} Besuche · zuletzt {new Date(c.lastVisit).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>

                {/* Absent months badge */}
                <div style={{ width: 110, textAlign: "right" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 12, fontWeight: 800, color: urgency,
                    background: `${urgency}15`, padding: "3px 9px", borderRadius: 999,
                  }}>
                    <Clock size={11} /> {c.monthsAbsent} Mon.
                  </span>
                </div>

                {/* Avg spend */}
                <div style={{ width: 80, textAlign: "right", fontSize: 13, fontWeight: 700, color: "var(--c-fg)" }}>
                  {c.avgSpend} €
                </div>

                {/* WhatsApp button */}
                <div style={{ width: 140, display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <button
                    onClick={() => {
                      toggle(c.id);
                      setTimeout(() => {
                        setSelected(new Set([c.id]));
                        setShowCampaign(true);
                      }, 50);
                    }}
                    style={{
                      padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: "#25D366", color: "#fff", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ── Bottom CTA ── */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ marginTop: 20, display: "flex", justifyContent: "center" }}
        >
          <button
            onClick={() => {
              setSelected(new Set(filtered.map(c => c.id)));
              setShowCampaign(true);
            }}
            style={{
              padding: "13px 32px", borderRadius: 12, fontSize: 14, fontWeight: 900,
              background: "linear-gradient(135deg,#D4B077 0%,#f59e0b 100%)",
              color: "#0A0908", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 6px 24px rgba(212,176,119,0.3)",
            }}
          >
            <Zap size={17} />
            Kampagne für alle {filtered.length} Kunden starten
            <ChevronDown size={16} style={{ transform: "rotate(-90deg)" }} />
          </button>
        </motion.div>
      )}

      {/* ── Campaign modal ── */}
      <AnimatePresence>
        {showCampaign && campaignCustomers.length > 0 && (
          <CampaignModal
            customers={campaignCustomers}
            onClose={() => setShowCampaign(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
