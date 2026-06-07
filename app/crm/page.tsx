"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeta } from "@/lib/beta-context";
import { customers } from "@/lib/mock-data";
import {
  Search, ChevronRight, X, Phone,
  MessageSquare, Clock, Mail, Scissors,
  RefreshCw, AlertCircle,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Airtable types ─────────────────────────────────────── */
type LeadFields = {
  Name?: string;
  Email?: string;
  Status?: "Neu" | "Bestätigt" | "Storniert";
  Wunschtermin?: string;
  Dienstleistung?: string;
  Preis_Min_EUR?: number;
  Preis_Max_EUR?: number;
  Dauer_Min?: number;
  "Kundenwunsch / Notizen"?: string;
  Zielfarbe?: string;
  "Aktuelle Haarfarbe"?: string;
  Erstellt_Am?: string;
  Tenant_ID?: string;
  Komplexitaet?: string;
  Service_Typ?: string;
  Warnung_Aktiv?: boolean;
};

type Lead = {
  id: string;
  fields: LeadFields;
};

/* ─── Status dot ─────────────────────────────────────────── */
function StatusDot({ status }: { status?: string }) {
  const color =
    status === "Bestätigt" ? "var(--c-success)" :
    status === "Storniert" ? "var(--c-danger)" :
    "var(--c-warning)";
  return (
    <span style={{
      display: "inline-block",
      width: 6, height: 6,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }} />
  );
}

/* ─── Skeleton row ───────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 20px",
      borderBottom: "1px solid var(--c-border)",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--c-bg-strong)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: 140, height: 13, borderRadius: 4, background: "var(--c-bg-strong)", marginBottom: 6 }} />
        <div style={{ width: 200, height: 11, borderRadius: 4, background: "var(--c-bg-subtle)" }} />
      </div>
      <div style={{ width: 60, height: 13, borderRadius: 4, background: "var(--c-bg-strong)" }} />
    </div>
  );
}

/* ─── Lead detail sheet ──────────────────────────────────── */
function LeadSheet({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const f = lead.fields;
  const name = f.Name || "Unbekannt";
  const wunschDate = f.Wunschtermin
    ? new Date(f.Wunschtermin).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;
  const erstelltDate = f.Erstellt_Am
    ? new Date(f.Erstellt_Am).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  const rows = [
    f.Email       && { label: "E-Mail",         value: f.Email,        icon: <Mail size={13} /> },
    f.Dienstleistung && { label: "Service",      value: f.Dienstleistung },
    wunschDate    && { label: "Wunschtermin",    value: wunschDate,     icon: <Clock size={13} /> },
    f.Dauer_Min   && { label: "Dauer",           value: `${f.Dauer_Min} Min.` },
    (f.Preis_Min_EUR != null) && {
      label: "Preis",
      value: f.Preis_Min_EUR === f.Preis_Max_EUR
        ? `€ ${f.Preis_Min_EUR}`
        : `€ ${f.Preis_Min_EUR} – ${f.Preis_Max_EUR}`,
    },
    f.Komplexitaet && { label: "Komplexität",   value: f.Komplexitaet },
    f.Zielfarbe   && { label: "Zielfarbe",       value: f.Zielfarbe },
    f["Aktuelle Haarfarbe"] && { label: "Aktuelle Haarfarbe", value: f["Aktuelle Haarfarbe"] },
    erstelltDate  && { label: "Erstellt am",     value: erstelltDate },
  ].filter(Boolean) as { label: string; value: string; icon?: React.ReactNode }[];

  return (
    <>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{
          position: "fixed",
          zIndex: 101,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(460px, calc(100vw - 32px))",
          background: "var(--c-bg-elevated)",
          border: "1px solid var(--c-border-strong)",
          borderRadius: 14,
          boxShadow: "var(--c-shadow-lg)",
          overflow: "hidden",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--c-border)",
          position: "sticky", top: 0,
          background: "var(--c-bg-elevated)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--c-bg-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "var(--c-fg-muted)",
            }}>
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-fg)" }}>{name}</span>
                <StatusDot status={f.Status} />
                <span style={{ fontSize: 11, color: "var(--c-fg-muted)" }}>{f.Status ?? "Neu"}</span>
              </div>
              {f.Email && (
                <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 1 }}>{f.Email}</div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Schließen">
            <X size={15} />
          </button>
        </div>

        {/* Notes */}
        {f["Kundenwunsch / Notizen"] && (
          <div style={{ margin: "12px 20px 0", padding: 12, background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", borderRadius: 8 }}>
            <div className="text-overline" style={{ color: "var(--c-fg-subtle)", marginBottom: 4 }}>Kundenwunsch / Notizen</div>
            <p style={{ fontSize: 13, color: "var(--c-fg-muted)", lineHeight: 1.5 }}>
              {f["Kundenwunsch / Notizen"]}
            </p>
          </div>
        )}

        {/* Details */}
        <div style={{ padding: "0 20px" }}>
          {rows.map(({ label, value, icon }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid var(--c-border)",
              fontSize: 13,
            }}>
              <span style={{ color: "var(--c-fg-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                {icon}{label}
              </span>
              <span style={{ fontWeight: 600, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px 20px" }}>
          {f.Email && (
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => window.open(`mailto:${f.Email}`)}>
              <Mail size={13} /> E-Mail
            </button>
          )}
          <button className="btn-gold" style={{ flex: 1 }}>
            <MessageSquare size={13} /> WhatsApp
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Mock leads (Demo-Modus) ────────────────────────────── */
const MOCK_LEADS: Lead[] = customers.map((c, i) => ({
  id: c.id,
  fields: {
    Name:          c.name,
    Email:         c.email,
    Status:        c.isVIP ? "Bestätigt" : i % 3 === 0 ? "Storniert" : "Neu",
    Dienstleistung: c.preferredService,
    Preis_Min_EUR: c.totalVisits > 0 ? Math.round(c.totalRevenue / c.totalVisits) : 0,
    Preis_Max_EUR: c.totalVisits > 0 ? Math.round(c.totalRevenue / c.totalVisits * 1.2) : 0,
    Dauer_Min:     60,
    Erstellt_Am:   new Date(Date.now() - i * 3 * 24 * 3600 * 1000).toISOString(),
    "Kundenwunsch / Notizen": c.followUpSuggestion,
    Komplexitaet:  c.isVIP ? "Hoch" : "Mittel",
  } as LeadFields,
}));

/* ─── Page ───────────────────────────────────────────────── */
type StatusFilter = "alle" | "Neu" | "Bestätigt" | "Storniert";

export default function CRMPage() {
  const { betaMode }            = useBeta();
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [selected, setSelected] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    if (betaMode) { setLeads(MOCK_LEADS); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/airtable?table=Leads&maxRecords=200");
      if (!res.ok) throw new Error(`Fehler ${res.status}`);
      const data = await res.json();
      const records: Lead[] = (data.records ?? []).filter(
        (r: Lead) => r.fields.Name && r.fields.Name !== "Unbekannt"
      );
      setLeads(records);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [betaMode]); // re-run when mode switches

  const filtered = leads.filter((l) => {
    const f = l.fields;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (f.Name ?? "").toLowerCase().includes(q) ||
      (f.Email ?? "").toLowerCase().includes(q) ||
      (f.Dienstleistung ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "alle" || f.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    alle:       leads.length,
    Neu:        leads.filter((l) => l.fields.Status === "Neu" || !l.fields.Status).length,
    Bestätigt:  leads.filter((l) => l.fields.Status === "Bestätigt").length,
    Storniert:  leads.filter((l) => l.fields.Status === "Storniert").length,
  };

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: "alle",      label: "Alle" },
    { id: "Neu",       label: "Neu" },
    { id: "Bestätigt", label: "Bestätigt" },
    { id: "Storniert", label: "Storniert" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="text-h1" style={{ color: "var(--c-fg)", marginBottom: 4 }}>Kunden</h1>
            <p style={{ fontSize: 13, color: "var(--c-fg-muted)" }}>
              {loading ? "Lädt..." : `${leads.length} Einträge aus Airtable`}
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={fetchLeads}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={13} />
            Aktualisieren
          </button>
        </div>
      </motion.div>

      {/* ── Error state ───────────────────────────────────── */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px", marginBottom: 16,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 8, fontSize: 13, color: "var(--c-danger)",
        }}>
          <AlertCircle size={15} />
          <span>Daten konnten nicht geladen werden. </span>
          <button
            onClick={fetchLeads}
            style={{ background: "none", border: "none", color: "var(--c-danger)", cursor: "pointer", fontWeight: 600, textDecoration: "underline", padding: 0 }}
          >
            Neu laden
          </button>
        </div>
      )}

      {/* ── Search + Tabs ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 16 }}
      >
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={14} style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", color: "var(--c-fg-subtle)",
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, E-Mail oder Service..."
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 14,
              height: 36,
              background: "var(--c-bg-elevated)",
              border: "1px solid var(--c-border)",
              borderRadius: 6,
              fontSize: 13, color: "var(--c-fg)", outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--c-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--c-border)")}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(({ id, label }) => {
            const active = statusFilter === id;
            return (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "0 12px", height: 28,
                  borderRadius: 6, fontSize: 12, fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? "var(--c-accent)" : "var(--c-border)"}`,
                  background: active ? "var(--c-accent-bg)" : "transparent",
                  color: active ? "var(--c-accent)" : "var(--c-fg-muted)",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {id !== "alle" && <StatusDot status={id} />}
                {label}
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: active ? "var(--c-accent)" : "var(--c-fg-faint)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Lead list ─────────────────────────────────────── */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ease: EASE }}
        style={{ overflow: "hidden" }}
      >
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 100px 80px 28px",
          gap: 12,
          padding: "8px 20px",
          borderBottom: "1px solid var(--c-border)",
        }}>
          {["Name", "Service", "Wunschtermin", "Preis", ""].map((h) => (
            <div key={h} className="text-overline" style={{ color: "var(--c-fg-faint)" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--c-fg-muted)", marginBottom: 4 }}>Keine Einträge gefunden.</p>
            <p style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>Paul behält die Inbox im Auge.</p>
          </div>
        ) : (
          filtered.map((lead, i) => {
            const f = lead.fields;
            const name = f.Name || "—";
            const wunschDate = f.Wunschtermin
              ? new Date(f.Wunschtermin).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
              : "—";
            const preis = f.Preis_Min_EUR != null
              ? f.Preis_Min_EUR === f.Preis_Max_EUR
                ? `€${f.Preis_Min_EUR}`
                : `€${f.Preis_Min_EUR}–${f.Preis_Max_EUR}`
              : "—";

            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(lead)}
                whileHover={{ backgroundColor: "var(--c-bg-subtle)" }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 100px 80px 28px",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--c-border)" : "none",
                  cursor: "pointer",
                }}
              >
                {/* Name + email + status */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <StatusDot status={f.Status} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-fg)" }}>{name}</span>
                    {f.Warnung_Aktiv && (
                      <span style={{ fontSize: 10, color: "var(--c-warning)", fontWeight: 600 }}>Warnung</span>
                    )}
                  </div>
                  {f.Email && (
                    <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Mail size={9} /> {f.Email}
                    </div>
                  )}
                </div>

                {/* Service */}
                <div style={{ fontSize: 12, color: "var(--c-fg-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  {f.Dienstleistung ? (
                    <><Scissors size={10} /> {f.Dienstleistung}</>
                  ) : (
                    <span style={{ color: "var(--c-fg-faint)" }}>—</span>
                  )}
                </div>

                {/* Wunschtermin */}
                <div style={{
                  fontSize: 12, color: "var(--c-fg-muted)",
                  fontVariantNumeric: "tabular-nums",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {wunschDate !== "—" ? <><Clock size={10} /> {wunschDate}</> : <span style={{ color: "var(--c-fg-faint)" }}>—</span>}
                </div>

                {/* Preis */}
                <div style={{
                  fontSize: 12, fontWeight: 600, color: "var(--c-fg)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {preis}
                </div>

                <ChevronRight size={14} style={{ color: "var(--c-fg-faint)" }} />
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ── Detail modal ──────────────────────────────────── */}
      <AnimatePresence>
        {selected && <LeadSheet lead={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
