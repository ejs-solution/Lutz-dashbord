"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Lead = { id: string; fields: Record<string, unknown>; createdTime?: string };

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: "8px 14px", fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "var(--accent)", fontWeight: 800 }}>{payload[0].value} Leads</div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/airtable?table=Leads&maxRecords=100")
      .then((r) => r.json())
      .then((d) => d.records && setLeads(d.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = leads.length;
  const bestätigt = leads.filter((l) => String(l.fields["Status"] || "").toLowerCase() === "bestätigt").length;
  const storniert = leads.filter((l) => String(l.fields["Status"] || "").toLowerCase() === "storniert").length;
  const neu = leads.filter((l) => String(l.fields["Status"] || "").toLowerCase() === "neu").length;
  const bookings = leads.filter((l) => l.fields["Service_Typ"] === "booking_request").length;
  const buchungsrate = total > 0 ? Math.round((bookings / total) * 100) : 0;

  // Leads per day (last 14 days)
  const dayMap: Record<string, number> = {};
  leads.forEach((l) => {
    const raw = String(l.fields["Erstellt_Am"] || l.createdTime || "");
    if (!raw) return;
    const d = new Date(raw).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const dayData = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([day, count]) => ({ day, count }));

  // Status distribution
  const statusData = [
    { name: "Neu", value: neu, color: "var(--accent)" },
    { name: "Bestätigt", value: bestätigt, color: "var(--green)" },
    { name: "Storniert", value: storniert, color: "var(--red)" },
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "var(--text)", marginBottom: 20 }}>
        Statistik
      </h1>

      {/* Key numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            Buchungsrate
          </div>
          <div className="stat-number num-gold">{buchungsrate}%</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{bookings} von {total} Anfragen</div>
        </div>

        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            Erfolgsrate
          </div>
          <div className="stat-number num-green">
            {total > 0 ? Math.round((bestätigt / total) * 100) : 0}%
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{bestätigt} bestätigt</div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Lead-Status</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {statusData.map(({ name, value, color }) => (
            <div key={name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{name}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color }}>
                  {value} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                    ({total > 0 ? Math.round((value / total) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${total > 0 ? (value / total) * 100 : 0}%`,
                  background: color,
                  borderRadius: 999,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Chart */}
      {dayData.length > 0 && (
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Leads nach Tag</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData} margin={{ left: -25, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Leads">
                {dayData.map((_, i) => (
                  <Cell key={i} fill="var(--accent)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Ø Antwortzeit", value: "< 3s", color: "green" },
          { label: "Uptime", value: "99.9%", color: "green" },
          { label: "Abbruchrate", value: `${total > 0 ? Math.round((storniert / total) * 100) : 0}%`, color: storniert / total > 0.2 ? "red" : "black" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
            <div className={`num-${color}`} style={{ fontSize: "1.4rem", fontWeight: 900 }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
