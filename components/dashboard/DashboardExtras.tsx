"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, CalendarDays, Globe, Copy, Check, Link2, ChevronRight } from "lucide-react";

type Dash = {
  week: { revenue: number; count: number; online: number };
  next7: { date: string; weekday: string; day: number; count: number }[];
  upcoming: { id: string; customer_name: string; service: string; date: string; start_time: string; employee: string }[];
};

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;
const localISO = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
function dayLabel(d: string) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const today = localISO(t);
  const tm = new Date(t); tm.setDate(t.getDate() + 1);
  const tomorrow = localISO(tm);
  if (d === today) return "Heute";
  if (d === tomorrow) return "Morgen";
  return new Date(d + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" }).replace(/\./g, "");
}

export default function DashboardExtras() {
  const [dash, setDash] = useState<Dash | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await fetch("/api/dashboard"); if (r.ok) setDash(await r.json()); } catch { /* ignore */ }
      try { const r = await fetch("/api/me/salon"); if (r.ok) setSlug((await r.json()).slug); } catch { /* ignore */ }
    })();
  }, []);

  if (!dash) return null;

  const bookingUrl = slug && typeof window !== "undefined" ? `${window.location.origin}/buchen/${slug}` : null;
  async function copyLink() {
    if (!bookingUrl) return;
    try { await navigator.clipboard.writeText(bookingUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  }

  return (
    <div style={{ padding: "10px 16px 24px" }}>
      <SectionTitle>Diese Woche</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
        <Kpi icon={TrendingUp} label="Umsatz" value={eur(dash.week.revenue)} />
        <Kpi icon={CalendarDays} label="Termine" value={String(dash.week.count)} />
        <Kpi icon={Globe} label="Online" value={String(dash.week.online)} />
      </div>

      <SectionTitle>Nächste 7 Tage</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 24 }}>
        {dash.next7.map((d, i) => {
          const today = i === 0;
          return (
            <div key={d.date} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 11, border: `1px solid ${today ? "var(--c-accent)" : "var(--c-border)"}`, background: today ? "var(--c-accent-bg)" : "var(--c-bg-elevated)" }}>
              <div style={{ fontSize: 10.5, color: "var(--c-fg-muted)", fontWeight: 600 }}>{d.weekday}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--c-fg)", margin: "2px 0" }}>{d.day}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: d.count > 0 ? "var(--c-accent)" : "var(--c-fg-faint)" }}>{d.count > 0 ? d.count : "–"}</div>
            </div>
          );
        })}
      </div>

      {dash.upcoming.length > 0 ? (
        <>
          <SectionTitle>Nächste Termine</SectionTitle>
          <div style={{ display: "grid", gap: 8 }}>
            {dash.upcoming.map((a) => (
              <Link key={a.id} href="/kalender" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, textDecoration: "none" }}>
                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 56 }}>
                  <div style={{ fontSize: 11, color: "var(--c-fg-muted)", fontWeight: 600 }}>{dayLabel(a.date)}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--c-accent)" }}>{a.start_time}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.customer_name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--c-fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.service} · {a.employee}</div>
                </div>
                <ChevronRight size={16} style={{ color: "var(--c-fg-muted)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div style={{ padding: "24px 18px", textAlign: "center", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-fg)", marginBottom: 4 }}>Bereit für die ersten Buchungen</div>
          <div style={{ fontSize: 13, color: "var(--c-fg-muted)", marginBottom: 16, lineHeight: 1.5, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            Teile deinen Buchungslink, damit Kunden direkt online buchen — die Termine erscheinen dann automatisch hier.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {bookingUrl && (
              <button onClick={copyLink} style={ctaGold}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Kopiert" : "Buchungslink kopieren"}
              </button>
            )}
            <Link href="/settings" style={ctaGhost}><Link2 size={14} /> Google verbinden</Link>
          </div>
        </div>
      )}
    </div>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, color: "var(--c-fg-muted)", marginBottom: 10 }}>{children}</div>
);

function Kpi({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div style={{ background: "var(--c-bg-subtle)", borderRadius: 12, padding: "13px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, color: "var(--c-fg-muted)" }}>
        <Icon size={13} /><span style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

const ctaGold: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", color: "#2a1f12", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" };
const ctaGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-fg-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" };
