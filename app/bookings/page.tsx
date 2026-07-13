"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Scissors, CheckCircle, XCircle, Clock3 } from "lucide-react";

type Lead = { id: string; fields: Record<string, unknown>; createdTime?: string };

const STATUS_ICON: Record<string, React.ReactNode> = {
  bestätigt: <CheckCircle size={16} style={{ color: "var(--green)" }} />,
  storniert: <XCircle size={16} style={{ color: "var(--red)" }} />,
  neu: <Clock3 size={16} style={{ color: "var(--accent)" }} />,
};

export default function BookingsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads?maxRecords=100")
      .then((r) => r.json())
      .then((d) => d.records && setLeads(d.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Only leads with a Wunschtermin
  const withDate = leads
    .filter((l) => !!l.fields["Wunschtermin"])
    .sort((a, b) => {
      const ta = String(a.fields["Wunschtermin"] || "");
      const tb = String(b.fields["Wunschtermin"] || "");
      return ta.localeCompare(tb);
    });

  const upcoming = withDate.filter((l) => {
    const d = new Date(String(l.fields["Wunschtermin"]));
    return d >= new Date();
  });
  const past = withDate.filter((l) => {
    const d = new Date(String(l.fields["Wunschtermin"]));
    return d < new Date();
  });

  const bestätigt = withDate.filter((l) => String(l.fields["Status"] || "").toLowerCase() === "bestätigt").length;
  const offen = withDate.filter((l) => String(l.fields["Status"] || "").toLowerCase() === "neu").length;

  function BookingRow({ lead }: { lead: Lead }) {
    const f = lead.fields;
    const status = String(f["Status"] || "neu").toLowerCase();
    const name = String(f["Name"] || "Unbekannt");
    const service = String(f["Dienstleistung"] || f["Service_Typ"] || "Termin");
    const termin = new Date(String(f["Wunschtermin"]));
    const preis = f["Preis_Min_EUR"];

    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
      }}>
        {/* Status Icon */}
        <div style={{ flexShrink: 0 }}>
          {STATUS_ICON[status] || STATUS_ICON.neu}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>{name}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Scissors size={12} />
              {service !== "booking_request" && service !== "unclear" ? service : "Haarschnitt"}
            </span>
            {!!f["Dauer_Min"] && (
              <>
                <span>·</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} />
                  {String(f["Dauer_Min"])} Min.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Date + Price */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
            {termin.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
          </div>
          {preis != null && Number(preis) > 0
            ? <div className="num-green" style={{ fontSize: 13 }}>€ {String(preis)}</div>
            : <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{String(f["Status"] || "Neu")}</div>
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "var(--text)", marginBottom: 20 }}>
        Termine
      </h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Mit Wunschtermin", value: withDate.length, color: "black" as const },
          { label: "Bestätigt", value: bestätigt, color: "green" as const },
          { label: "Offen", value: offen, color: "gold" as const },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
            <div className={`stat-number num-${color}`} style={{ fontSize: "1.8rem" }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="card" style={{ padding: "0 20px", marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "16px 0 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={16} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Kommende Termine</span>
          <span className="badge badge-gold" style={{ marginLeft: 4 }}>{upcoming.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: 14 }}>Lädt…</div>
        ) : upcoming.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Keine kommenden Termine mit Wunschtermin.
          </div>
        ) : (
          upcoming.map((l) => <BookingRow key={l.id} lead={l} />)
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="card" style={{ padding: "0 20px", overflow: "hidden" }}>
          <div style={{ padding: "16px 0 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-sub)" }}>Vergangene Termine</span>
            <span className="badge badge-gray" style={{ marginLeft: 4 }}>{past.length}</span>
          </div>
          {past.map((l) => <BookingRow key={l.id} lead={l} />)}
        </div>
      )}
    </div>
  );
}
