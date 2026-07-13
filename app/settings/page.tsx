"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, CreditCard, Globe, Zap, MessageSquare,
  Gift, Phone, Save, CheckCircle, Calendar, Mail, Link2, Check,
} from "lucide-react";
import { aiSettings as defaults } from "@/lib/mock-data";
import BookingLinkCard from "@/components/dashboard/BookingLinkCard";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.div
      className={`toggle-track ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
      whileTap={{ scale: 0.92 }}
    >
      <div className="toggle-thumb" />
    </motion.div>
  );
}

function SettingRow({
  label, desc, icon, value, onChange,
}: {
  label: string; desc?: string; icon: React.ReactNode;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: value ? "var(--accent-glow)" : "var(--surface-2)",
        border: `1px solid ${value ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.2s",
        color: value ? "var(--accent)" : "var(--text-muted)",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>}
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState(defaults.note);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleError, setGoogleError]         = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected") === "1") setGoogleConnected(true);
    if (params.get("google_error")) setGoogleError(params.get("google_error"));
  }, []);

  const toggle = (key: keyof typeof defaults) =>
    setSettings((p) => ({ ...p, [key]: !p[key] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    {
      title: "Erinnerungen & Kommunikation",
      icon: <Bell size={16} />,
      rows: [
        {
          key: "reminders24h" as const,
          label: "24h-Erinnerung vor Termin",
          desc: "Paul sendet automatisch eine WhatsApp-Erinnerung 24h vor dem Termin",
          icon: <Bell size={16} />,
        },
        {
          key: "noShowFollowUp" as const,
          label: "No-Show Follow-up",
          desc: "Bei verpassten Terminen fragt Paul automatisch nach einem Ersatztermin",
          icon: <MessageSquare size={16} />,
        },
        {
          key: "birthdayMessages" as const,
          label: "Geburtstags-Aktionen",
          desc: "Paul sendet automatisch Glückwünsche und einen Gutschein am Geburtstag",
          icon: <Gift size={16} />,
        },
      ],
    },
    {
      title: "Zahlungen & Buchungen",
      icon: <CreditCard size={16} />,
      rows: [
        {
          key: "stripeDeposit" as const,
          label: `Stripe Anzahlung (20%) ab € ${settings.depositThreshold}`,
          desc: "Kunden müssen bei Buchungen über dem Schwellenwert eine Anzahlung leisten",
          icon: <CreditCard size={16} />,
        },
        {
          key: "instagramAutoReply" as const,
          label: "Instagram DM Auto-Reply",
          desc: "Paul antwortet automatisch auf alle Instagram-Direktnachrichten",
          icon: <MessageSquare size={16} />,
        },
      ],
    },
    {
      title: "KI & Sprache",
      icon: <Globe size={16} />,
      rows: [
        {
          key: "multiLanguage" as const,
          label: "Mehrsprachigkeit",
          desc: "Paul antwortet in der Sprache des Kunden (Türkisch, Englisch, Arabisch, ...)",
          icon: <Globe size={16} />,
        },
        {
          key: "reminders24h" as const,
          label: "Voice-Anrufe (VAPI)",
          desc: "Paul nimmt eingehende Anrufe entgegen und bucht Termine per Sprache",
          icon: <Phone size={16} />,
        },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 40px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--accent-glow)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 999, padding: "5px 12px", marginBottom: 10,
            }}>
              <Zap size={12} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>Paul KI · Einstellungen</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: -0.4 }}>
              KI-Einstellungen
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Trainiere Paul und passe sein Verhalten an deinen Salon an
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={save}
            className={saved ? "" : "btn-gold"}
            style={saved ? {
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "var(--green)", color: "white", border: "none", cursor: "pointer",
            } : {}}
          >
            {saved ? <><CheckCircle size={14} /> Gespeichert!</> : <><Save size={14} /> Speichern</>}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Buchungslink ── */}
      <div style={{ marginBottom: 20 }}>
        <BookingLinkCard />
      </div>

      {/* ── Google Integration ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, ease: EASE }}
        className="card"
        style={{ padding: "18px 20px", marginBottom: 14 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <Link2 size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Google Integrationen</span>
          {googleConnected && (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
              <Check size={12} /> Verbunden
            </span>
          )}
        </div>

        {googleError && (
          <div style={{ marginBottom: 14, padding: "10px 12px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, fontSize: 13, color: "var(--red)" }}>
            Fehler: {googleError}
          </div>
        )}

        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { icon: <Calendar size={15} />, label: "Google Kalender", desc: "Termine & Verfügbarkeit" },
            { icon: <Mail size={15} />, label: "Gmail",           desc: "E-Mail-Buchungen lesen" },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{
              flex: 1, minWidth: 160,
              padding: "12px 14px",
              background: googleConnected ? "rgba(34,197,94,0.06)" : "var(--surface-2)",
              border: `1px solid ${googleConnected ? "var(--green-border)" : "var(--border)"}`,
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ color: googleConnected ? "var(--green)" : "var(--text-muted)" }}>{icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</div>
              </div>
              {googleConnected && <Check size={13} style={{ color: "var(--green)", marginLeft: "auto" }} />}
            </div>
          ))}
        </div>

        {googleConnected ? (
          <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
            Google Kalender und Gmail sind verbunden. Deine Daten werden jetzt live geladen.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              Verbinde deinen Google Account um echte Kalender-Termine und Gmail-Buchungen im Dashboard zu sehen.
            </p>
            <a href="/api/auth/google" className="btn-gold" style={{ display: "inline-flex", textDecoration: "none" }}>
              <Link2 size={14} />
              Mit Google verbinden
            </a>
          </>
        )}
      </motion.div>

      {/* ── Sections ── */}
      {sections.map(({ title, icon, rows }, si) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1, ease: EASE }}
          className="card"
          style={{ padding: "18px 20px", marginBottom: 14 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--accent)" }}>{icon}</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{title}</span>
          </div>

          {rows.map(({ key, label, desc, icon: rowIcon }) => (
            <SettingRow
              key={key + label}
              label={label}
              desc={desc}
              icon={rowIcon}
              value={Boolean(settings[key])}
              onChange={() => toggle(key)}
            />
          ))}
        </motion.div>
      ))}

      {/* ── Thresholds ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ease: EASE }}
        className="card"
        style={{ padding: "18px 20px", marginBottom: 14 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <CreditCard size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Zahlungs-Schwellenwerte</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-sub)", marginBottom: 8 }}>
              Anzahlung ab (€)
            </label>
            <input
              type="number"
              value={settings.depositThreshold}
              onChange={(e) => setSettings((p) => ({ ...p, depositThreshold: Number(e.target.value) }))}
              style={{
                width: "100%", padding: "10px 12px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 10, fontSize: 16, fontWeight: 800, color: "var(--text)",
                outline: "none", fontFamily: "inherit",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
              Buchungen über diesem Betrag benötigen Anzahlung
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-sub)", marginBottom: 8 }}>
              Anzahlung Prozent (%)
            </label>
            <input
              type="number"
              value={settings.depositPercent}
              onChange={(e) => setSettings((p) => ({ ...p, depositPercent: Number(e.target.value) }))}
              style={{
                width: "100%", padding: "10px 12px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 10, fontSize: 16, fontWeight: 800, color: "var(--accent)",
                outline: "none", fontFamily: "inherit",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
              Derzeit: {settings.depositPercent}% der Gesamtsumme via Stripe
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Paul's Notiz ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, ease: EASE }}
        className="card"
        style={{ padding: "18px 20px", marginBottom: 14 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <Zap size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Temporäre Notiz an Paul</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, marginTop: 12 }}>
          Schreibe Paul eine temporäre Anweisung, die er bei seinen nächsten Gesprächen berücksichtigt. Z.B. Abwesenheiten, Sonderaktionen, etc.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder='z.B. "Monika ist diese Woche im Urlaub (Mo–Fr). Bitte keine Termine für Monika buchen." oder "Bis Ende Mai 15% Rabatt auf alle Colorationen."'
          style={{
            width: "100%", padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 12, fontSize: 14, color: "var(--text)",
            resize: "vertical", outline: "none", fontFamily: "inherit",
            lineHeight: 1.6, minHeight: 100,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Paul erhält diese Notiz bei seiner nächsten Antwort
          </span>
          <button className="btn-gold" style={{ fontSize: 13, padding: "8px 14px" }} onClick={save}>
            <Zap size={13} /> Paul informieren
          </button>
        </div>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48, ease: EASE }}
        style={{
          padding: "18px 20px",
          background: "var(--red-bg)",
          border: "1px solid var(--red-border)",
          borderRadius: 18,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--red)", marginBottom: 8 }}>
          Danger Zone
        </div>
        <p style={{ fontSize: 13, color: "var(--red)", opacity: 0.8, marginBottom: 14 }}>
          Setze Paul vollständig zurück oder pausiere alle automatischen Antworten für heute.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-danger" style={{ fontSize: 13 }}>Paul heute pausieren</button>
          <button className="btn-ghost" style={{ fontSize: 13, color: "var(--red)", borderColor: "var(--red-border)" }}>
            Alle Daten zurücksetzen
          </button>
        </div>
      </motion.div>
    </div>
  );
}
