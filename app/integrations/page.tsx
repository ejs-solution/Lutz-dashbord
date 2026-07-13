"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, AlertCircle, Clock, ExternalLink, Settings,
  Zap, Mail,
} from "lucide-react";

type IntegrationStatus = "connected" | "disconnected" | "coming_soon";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: React.ReactNode;
  category: string;
  connectHref?: string;
  docsHref?: string;
  badge?: string;
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/* ── Google branded SVG ── */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.05 2C6.495 2 2 6.495 2 12.05c0 1.87.513 3.621 1.405 5.126L2 22l4.962-1.381A10.016 10.016 0 0012.05 22C17.604 22 22 17.505 22 11.95S17.605 2 12.05 2zm0 18.25a8.24 8.24 0 01-4.394-1.263l-.315-.188-3.262.907.907-3.177-.206-.326A8.239 8.239 0 013.8 11.95c0-4.55 3.7-8.25 8.25-8.25s8.25 3.7 8.25 8.25-3.7 8.3-8.25 8.3z"/>
    </svg>
  );
}

function StripeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#635BFF">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fd5949"/>
          <stop offset="50%" stopColor="#d6249f"/>
          <stop offset="100%" stopColor="#285AEB"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)"/>
    </svg>
  );
}

function SupabaseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#3ECF8E"/>
      <path d="M13 3 6 13h5l-1 8 8-11h-6l1-7z" fill="white"/>
    </svg>
  );
}

export default function IntegrationsPage() {
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Google connection status
    fetch("/api/calendar")
      .then(r => r.json())
      .then(d => {
        setGcalConnected(d.error !== "not_connected");
      })
      .catch(() => setGcalConnected(false))
      .finally(() => setLoading(false));
  }, []);

  const integrations: Integration[] = [
    // ── Google
    {
      id: "google-calendar",
      name: "Google Kalender",
      description: "Termine aus Google Kalender im Dashboard anzeigen und synchronisieren.",
      status: gcalConnected ? "connected" : "disconnected",
      icon: <GoogleIcon size={22} />,
      category: "Kalender",
      connectHref: "/api/auth/google",
      docsHref: "/settings",
    },
    {
      id: "google-gmail",
      name: "Gmail",
      description: "E-Mails direkt im Inbox-Bereich lesen und verwalten.",
      status: gmailConnected ? "connected" : "disconnected",
      icon: <Mail size={22} style={{ color: "#EA4335" }} />,
      category: "E-Mail",
      connectHref: "/api/auth/google",
    },
    // ── Messaging
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Kunden über WhatsApp erreichen. Paul antwortet automatisch und bucht Termine.",
      status: "coming_soon",
      icon: <WhatsAppIcon size={22} />,
      category: "Messaging",
      badge: "Q3 2026",
    },
    {
      id: "instagram",
      name: "Instagram DM",
      description: "Instagram Direct Messages automatisch beantworten lassen.",
      status: "coming_soon",
      icon: <InstagramIcon size={22} />,
      category: "Messaging",
      badge: "Q3 2026",
    },
    // ── Bezahlung
    {
      id: "stripe",
      name: "Stripe",
      description: "Online-Anzahlungen und Termingebühren sicher per Kreditkarte einziehen.",
      status: "coming_soon",
      icon: <StripeIcon size={22} />,
      category: "Bezahlung",
      badge: "Q4 2026",
    },
    // ── Daten
    {
      id: "supabase",
      name: "Supabase",
      description: "Deine Kundendaten, Termine und Mitarbeiter werden sicher in Supabase (EU / Frankfurt) gespeichert.",
      status: "connected",
      icon: <SupabaseIcon size={22} />,
      category: "Datenbank",
    },
  ];

  const categories = [...new Set(integrations.map(i => i.category))];

  const statusBadge = (status: IntegrationStatus) => {
    if (status === "connected")    return { label: "Verbunden",   color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: <CheckCircle size={11} /> };
    if (status === "disconnected") return { label: "Getrennt",    color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: <AlertCircle size={11} /> };
    return                                { label: "Bald",        color: "var(--c-fg-subtle)", bg: "var(--c-bg-strong)", icon: <Clock size={11} /> };
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} style={{ color: "var(--c-accent)" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.4 }}>Integrationen</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginLeft: 42 }}>
          Verbinde CUTZ Solution mit deinen bevorzugten Tools und Diensten.
        </p>
      </motion.div>

      {/* Categories */}
      {categories.map((cat, ci) => (
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.06, ease: EASE }}
          style={{ marginBottom: 28 }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 2 }}>
            {cat}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
            {integrations.filter(i => i.category === cat).map((intg, idx, arr) => {
              const badge = statusBadge(intg.status);
              const isLast = idx === arr.length - 1;
              return (
                <div
                  key={intg.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 20px",
                    borderBottom: isLast ? "none" : "1px solid var(--c-border)",
                    opacity: intg.status === "coming_soon" ? 0.7 : 1,
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {intg.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--c-fg)" }}>{intg.name}</span>
                      {/* Status badge */}
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                        color: badge.color, background: badge.bg,
                      }}>
                        {badge.icon} {badge.label}
                      </span>
                      {/* Coming soon date badge */}
                      {intg.badge && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--c-fg-subtle)", background: "var(--c-bg-strong)", padding: "2px 6px", borderRadius: 4 }}>
                          {intg.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--c-fg-subtle)", margin: 0, lineHeight: 1.5 }}>{intg.description}</p>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {intg.status === "connected" ? (
                      <button style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: "transparent", color: "var(--c-fg-muted)",
                        border: "1px solid var(--c-border)", cursor: "pointer",
                      }}>
                        <Settings size={13} /> Verwalten
                      </button>
                    ) : intg.status === "disconnected" ? (
                      <a
                        href={intg.connectHref ?? "#"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                          background: "var(--c-accent)", color: "var(--c-accent-fg)",
                          textDecoration: "none",
                        }}
                      >
                        Verbinden <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: "var(--c-bg-subtle)", color: "var(--c-fg-subtle)",
                        border: "1px solid var(--c-border)",
                      }}>
                        Bald verfügbar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: "var(--c-fg-subtle)" }}
      >
        Weitere Integrationen werden laufend hinzugefügt.{" "}
        <button
          onClick={() => window.location.href = "mailto:ejs-solution@outlook.de?subject=Integration%20Anfrage"}
          style={{ background: "none", border: "none", color: "var(--c-accent)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}
        >
          Integration anfragen →
        </button>
      </motion.div>
    </div>
  );
}
