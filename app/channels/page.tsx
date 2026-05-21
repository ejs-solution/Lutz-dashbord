"use client";

import { MessageSquare, AtSign, Phone, Mail, CheckCircle, Clock, Globe } from "lucide-react";

const CHANNELS = [
  {
    name: "WhatsApp",
    icon: MessageSquare,
    color: "#16a34a",
    status: "aktiv",
    stats: { heute: 8, gesamt: 142, rate: "62%" },
    description: "Automatische Antworten · Terminbuchung · 24/7",
  },
  {
    name: "Instagram DM",
    icon: AtSign,
    color: "#dc2626",
    status: "aktiv",
    stats: { heute: 5, gesamt: 89, rate: "41%" },
    description: "DM-Antworten · Quick Replies · Stories",
  },
  {
    name: "Voice (VAPI)",
    icon: Phone,
    color: "#c9a227",
    status: "aktiv",
    stats: { heute: 3, gesamt: 56, rate: "100%" },
    description: "Anruf-Übernahme · Transkription · SMS",
  },
  {
    name: "E-Mail",
    icon: Mail,
    color: "#2563eb",
    status: "aktiv",
    stats: { heute: 4, gesamt: 67, rate: "55%" },
    description: "Gmail API · Auto-Antwort · Threads",
  },
];

export default function ChannelsPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "var(--text)", marginBottom: 6 }}>
          Kanäle
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Alle Kanäle laufen vollautomatisch über ARIA.
        </p>
      </div>

      {/* All Active Banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px", marginBottom: 20,
        background: "var(--green-bg)",
        border: "1px solid var(--green-border)",
        borderRadius: 12,
      }}>
        <CheckCircle size={18} style={{ color: "var(--green)", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--green)" }}>Alle 4 Kanäle aktiv</div>
          <div style={{ fontSize: 12, color: "var(--green)", opacity: 0.8 }}>ARIA antwortet 24/7 automatisch</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
          Uptime 99.9%
        </div>
      </div>

      {/* Channel Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          return (
            <div key={ch.name} className="card card-hover" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Icon */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: `${ch.color}15`,
                  border: `1.5px solid ${ch.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={22} style={{ color: ch.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{ch.name}</span>
                    <span className="badge badge-green" style={{ fontSize: 10 }}>Live</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ch.description}</div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: ch.color }}>{ch.stats.rate}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Buchungsrate</div>
                </div>
              </div>

              {/* Sub stats */}
              <div style={{
                display: "flex", gap: 16, marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid var(--border)",
              }}>
                {[
                  { label: "Heute", value: ch.stats.heute },
                  { label: "Gesamt", value: ch.stats.gesamt },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>{value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          In Kürze
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["SMS / RCS", "Google Business", "Website Chat Widget"].map((name) => (
            <div key={name} className="chip" style={{ cursor: "default", opacity: 0.6, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={11} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
