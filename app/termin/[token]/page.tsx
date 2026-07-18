"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Calendar, Clock, Check, X, Loader2, CalendarClock, Ban } from "lucide-react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type Details = { salon: string; phone: string | null; name: string; service: string; date: string; time: string; duration: number; status: string };

const longDate = (v: string) => new Date(v + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
const fmtDay = (d: Date) => ({ wd: d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", ""), dm: d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" }).replace(".", "") });
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function TerminPage() {
  const { token } = useParams<{ token: string }>();
  const [d, setD] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mode, setMode] = useState<"view" | "reschedule" | "cancelled" | "rescheduled">("view");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rDate, setRDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/public/appointment?token=${encodeURIComponent(token)}`);
        if (!r.ok) { setNotFound(true); return; }
        const j = (await r.json()) as Details;
        setD(j);
        if (j.status === "cancelled") setMode("cancelled");
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const days = useMemo(() => {
    const out: Date[] = [];
    const t = new Date(); t.setHours(0, 0, 0, 0);
    for (let i = 0; i < 24 && out.length < 14; i++) {
      const x = new Date(t); x.setDate(t.getDate() + i);
      if (x.getDay() !== 0) out.push(x);
    }
    return out;
  }, []);

  async function loadSlots(date: string) {
    setSlotsLoading(true); setSlots([]);
    try {
      const r = await fetch(`/api/public/appointment?token=${encodeURIComponent(token)}&date=${date}`);
      const j = await r.json();
      setSlots(j.slots ?? []);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  }

  async function doCancel() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/public/appointment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: "cancel" }) });
      if (!r.ok) { setErr("Absage fehlgeschlagen. Bitte erneut versuchen."); return; }
      setMode("cancelled");
    } catch { setErr("Netzwerkfehler."); }
    finally { setBusy(false); }
  }

  async function doReschedule(time: string) {
    if (!rDate) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/public/appointment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: "reschedule", date: rDate, time }) });
      if (r.status === 409) { setErr("Dieser Slot wurde gerade vergeben. Bitte einen anderen wählen."); loadSlots(rDate); return; }
      if (!r.ok) { setErr("Verschieben fehlgeschlagen."); return; }
      setD((prev) => prev ? { ...prev, date: rDate, time, status: "pending" } : prev);
      setMode("rescheduled");
    } catch { setErr("Netzwerkfehler."); }
    finally { setBusy(false); }
  }

  if (loading) return <Center><Loader2 size={26} className="spin" style={{ color: "var(--c-accent)" }} /></Center>;
  if (notFound || !d) return <Center><div style={{ textAlign: "center" }}><Scissors size={28} style={{ color: "var(--c-fg-muted)", marginBottom: 12 }} /><p style={{ color: "var(--c-fg-subtle)" }}>Dieser Termin wurde nicht gefunden.</p></div></Center>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-fg)" }}>
      <div style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-bg-elevated)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, var(--c-accent), #e8cfa0, var(--c-accent))" }} />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 22px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Scissors size={20} color="#2a1f12" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--c-accent)" }}>Dein Termin</div>
            <h1 style={{ fontSize: 19, fontWeight: 800, margin: "1px 0 0" }}>{d.salon}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 22px 60px" }}>
        {/* Termin-Karte */}
        <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderLeft: "4px solid var(--c-accent)", borderRadius: 15, padding: 18, marginBottom: 20, opacity: mode === "cancelled" ? 0.6 : 1 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, marginBottom: 10 }}>{d.service}</div>
          <Row icon={Calendar} text={longDate(d.date)} />
          <Row icon={Clock} text={`${d.time} Uhr · ${d.duration} Min`} />
          {mode === "cancelled" && <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--c-danger)", background: "rgba(239,68,68,0.1)", padding: "5px 10px", borderRadius: 8 }}><Ban size={13} /> Storniert</div>}
        </div>

        {err && <ErrBox>{err}</ErrBox>}

        <AnimatePresence mode="wait">
          {mode === "cancelled" && (
            <Panel k="c"><Info>Dein Termin wurde abgesagt. Falls du doch kommen möchtest, buche einfach einen neuen Termin oder melde dich beim Salon{d.phone ? ` (${d.phone})` : ""}.</Info></Panel>
          )}

          {mode === "rescheduled" && (
            <Panel k="r">
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg, var(--c-accent), #B8935A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Check size={30} strokeWidth={3} style={{ color: "var(--c-accent-fg)" }} />
                </motion.div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>Termin verschoben</div>
                <p style={{ fontSize: 13.5, color: "var(--c-fg-muted)", marginTop: 6 }}>Neuer Termin: {longDate(d.date)} um {d.time} Uhr.</p>
              </div>
            </Panel>
          )}

          {mode === "view" && (
            <Panel k="v">
              <div style={{ display: "grid", gap: 10 }}>
                <button onClick={() => { setMode("reschedule"); }} style={btnPrimary}>
                  <CalendarClock size={17} /> Termin verschieben
                </button>
                {!confirmCancel ? (
                  <button onClick={() => setConfirmCancel(true)} style={btnGhost}>
                    <X size={16} /> Termin absagen
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={doCancel} disabled={busy} style={{ ...btnDanger, flex: 1 }}>
                      {busy ? <Loader2 size={15} className="spin" /> : <Ban size={15} />} Wirklich absagen
                    </button>
                    <button onClick={() => setConfirmCancel(false)} style={{ ...btnGhost, flex: 1 }}>Zurück</button>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {mode === "reschedule" && (
            <Panel k="rs">
              <button onClick={() => { setMode("view"); setRDate(null); }} style={{ ...linkBtn, marginBottom: 12 }}>← Zurück</button>
              <H>Neues Datum wählen</H>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 9, marginTop: 12 }}>
                {days.map((x) => {
                  const v = iso(x); const sel = rDate === v; const { wd, dm } = fmtDay(x);
                  return (
                    <button key={v} onClick={() => { setRDate(v); loadSlots(v); }} style={{ ...dayCard, ...(sel ? cardActive : {}) }}>
                      <span style={{ fontSize: 11, color: "var(--c-fg-muted)", fontWeight: 600 }}>{wd}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{dm}</span>
                    </button>
                  );
                })}
              </div>

              {rDate && (
                <div style={{ marginTop: 18 }}>
                  <H>Neue Uhrzeit</H>
                  {slotsLoading ? (
                    <div style={{ padding: 24, textAlign: "center" }}><Loader2 size={20} className="spin" style={{ color: "var(--c-accent)" }} /></div>
                  ) : slots.length === 0 ? (
                    <p style={{ color: "var(--c-fg-muted)", fontSize: 13, marginTop: 10 }}>An diesem Tag ist nichts frei. Bitte anderes Datum wählen.</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8, marginTop: 10 }}>
                      {slots.map((s) => (
                        <button key={s} disabled={busy} onClick={() => doReschedule(s)} style={slotChip}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Panel>
          )}
        </AnimatePresence>
      </div>

      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}

function Panel({ k, children }: { k: string; children: React.ReactNode }) {
  return <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.26, ease: EASE }}>{children}</motion.div>;
}
const H = ({ children }: { children: React.ReactNode }) => <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{children}</h2>;
const Row = ({ icon: Icon, text }: { icon: typeof Calendar; text: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--c-fg-subtle)", padding: "3px 0" }}><Icon size={14} style={{ color: "var(--c-accent)" }} />{text}</div>
);
const Info = ({ children }: { children: React.ReactNode }) => <p style={{ fontSize: 13.5, color: "var(--c-fg-muted)", lineHeight: 1.6, textAlign: "center" }}>{children}</p>;
const ErrBox = ({ children }: { children: React.ReactNode }) => <div style={{ padding: "10px 13px", background: "rgba(239,68,68,0.1)", border: "1px solid var(--c-danger)", borderRadius: 10, color: "var(--c-danger)", fontSize: 12.5, marginBottom: 14 }}>{children}</div>;
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg)" }}>{children}<style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`}</style></div>;
}

const btnPrimary: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px", background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", color: "#2a1f12", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer" };
const btnGhost: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "12px", background: "transparent", color: "var(--c-fg-muted)", border: "1px solid var(--c-border)", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const btnDanger: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", background: "var(--c-danger)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" };
const linkBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "var(--c-fg-muted)", fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 500 };
const dayCard: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "11px 6px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, cursor: "pointer", color: "var(--c-fg)" };
const slotChip: React.CSSProperties = { padding: "11px 6px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 11, cursor: "pointer", color: "var(--c-fg)", fontSize: 13.5, fontWeight: 700 };
const cardActive: React.CSSProperties = { borderColor: "var(--c-accent)", background: "rgba(212,176,119,0.14)" };
