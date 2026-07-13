"use client";

import { useState, useEffect } from "react";
import { Search, AlertTriangle, ChevronRight, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

type Lead = { id: string; fields: Record<string, unknown>; createdTime?: string };

const STATUS_COLOR: Record<string, string> = {
  bestätigt: "var(--green)",
  storniert: "var(--red)",
  neu: "var(--accent)",
};

const STATUS_BG: Record<string, string> = {
  bestätigt: "var(--green-bg)",
  storniert: "var(--red-bg)",
  neu: "rgba(201,162,39,0.1)",
};

function ServiceLabel(s: string) {
  if (s === "booking_request") return "Buchungsanfrage";
  if (s === "unclear") return "Unklar";
  return s || "—";
}

function DetailSheet({ lead, onClose }: { lead: Lead; onClose: () => void }): React.ReactElement {
  const f: Record<string, string | number | boolean | null | undefined> = lead.fields as Record<string, string | number | boolean | null | undefined>;
  const status = String(f["Status"] || "Neu").toLowerCase();

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "16px 16px 0 0",
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: "var(--text)" }}>Lead Details</span>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "6px 8px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 20, color: "white",
          }}>
            {String(f["Name"] || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>{String(f["Name"] || "—")}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{String(f["Email"] || "—")}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="badge" style={{
              background: STATUS_BG[status] || "var(--surface-2)",
              color: STATUS_COLOR[status] || "var(--text-sub)",
              border: `1px solid ${STATUS_COLOR[status] || "var(--border)"}22`,
              fontSize: 12,
            }}>
              {String(f["Status"] || "Neu")}
            </span>
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Service", value: ServiceLabel(String(f["Service_Typ"] || "")) },
            { label: "Komplexität", value: String(f["Komplexitaet"] || "—") },
            { label: "Dienstleistung", value: String(f["Dienstleistung"] || "—") },
            { label: "Dauer", value: f["Dauer_Min"] != null ? `${String(f["Dauer_Min"])} Min.` : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Preis */}
        {f["Preis_Min_EUR"] != null && Number(f["Preis_Min_EUR"]) > 0 && (
          <div style={{
            background: "var(--green-bg)",
            border: "1px solid var(--green-border)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>Geschätzter Preis</span>
            <span className="num-green" style={{ fontSize: 20 }}>
              € {String(f["Preis_Min_EUR"])} – € {String(f["Preis_Max_EUR"])}
            </span>
          </div>
        )}

        {/* Wunschtermin */}
        {f["Wunschtermin"] && (
          <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>Wunschtermin</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
              {new Date(String(f["Wunschtermin"])).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
        )}

        {/* Notes */}
        {!!f["Kundenwunsch / Notizen"] && (
          <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>Notizen</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{String(f["Kundenwunsch / Notizen"])}</div>
          </div>
        )}

        {/* Warning */}
        {Boolean(f["Warnung_Aktiv"]) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 10, padding: "10px 14px",
          }}>
            <AlertTriangle size={15} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>Warnung aktiv</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("alle");
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    fetch("/api/leads?maxRecords=100")
      .then((r) => r.json())
      .then((d) => d.records && setLeads(d.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads
    .filter((l) => {
      const status = String(l.fields["Status"] || "").toLowerCase();
      const name = String(l.fields["Name"] || "").toLowerCase();
      const email = String(l.fields["Email"] || "").toLowerCase();
      const matchStatus = filterStatus === "alle" || status === filterStatus;
      const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      const ta = String(a.fields["Erstellt_Am"] || a.createdTime || "");
      const tb = String(b.fields["Erstellt_Am"] || b.createdTime || "");
      return tb.localeCompare(ta);
    });

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "var(--text)", marginBottom: 20 }}>
        Alle Leads <span className="num-gold">{leads.length}</span>
      </h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 160,
        }}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            className="input"
            style={{ border: "none", padding: 0, fontSize: 14, background: "transparent" }}
            placeholder="Name oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "alle", label: "Alle" },
            { key: "neu", label: "Neu" },
            { key: "bestätigt", label: "Bestätigt" },
            { key: "storniert", label: "Storniert" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`chip ${filterStatus === key ? "active" : ""}`}
              onClick={() => setFilterStatus(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--surface-2)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: "35%", height: 12, borderRadius: 4, background: "var(--surface-2)", marginBottom: 8 }} />
                  <div style={{ width: "55%", height: 11, borderRadius: 4, background: "var(--surface-2)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Keine Einträge gefunden.
          </div>
        ) : (
          filtered.map((lead, i) => {
            const status = String(lead.fields["Status"] || "Neu").toLowerCase();
            const name = String(lead.fields["Name"] || "Unbekannt");
            const email = String(lead.fields["Email"] || "");
            const preis = lead.fields["Preis_Min_EUR"];
            const time = String(lead.fields["Erstellt_Am"] || lead.createdTime || "");
            const service = String(lead.fields["Dienstleistung"] || lead.fields["Service_Typ"] || "");

            return (
              <button
                key={lead.id}
                onClick={() => setSelected(lead)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  background: "transparent",
                  border: "none",
                  borderBottomColor: "var(--border)",
                  borderBottomStyle: i < filtered.length - 1 ? "solid" : "none",
                  borderBottomWidth: 1,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 16, color: "white",
                  flexShrink: 0,
                }}>
                  {name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{name}</span>
                    <span className="badge" style={{
                      background: STATUS_BG[status] || "var(--surface-2)",
                      color: STATUS_COLOR[status] || "var(--text-sub)",
                      border: `1px solid ${STATUS_COLOR[status] || "var(--border)"}22`,
                      fontSize: 10,
                    }}>
                      {String(lead.fields["Status"] || "Neu")}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email}
                    {service && service !== "booking_request" && service !== "unclear" && ` · ${service}`}
                  </div>
                </div>

                {/* Right */}
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <div>
                    {preis != null && Number(preis) > 0 && (
                      <div className="num-green" style={{ fontSize: 14, marginBottom: 2 }}>€ {String(preis)}</div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {time ? formatRelativeTime(time) : "—"}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Detail Sheet */}
      {selected && <DetailSheet lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
