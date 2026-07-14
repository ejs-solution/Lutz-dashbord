"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Calendar, Clock, Check, ChevronLeft, ChevronRight, ChevronDown,
  MapPin, Phone, Loader2, User, UserRound, Baby, Sparkles,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type Service = { id: string; name: string; categoryId: string; durationMin: number; priceMin: number; priceMax: number; isPackage?: boolean };
type Group = { id: "maenner" | "frauen" | "kinder"; label: string; featured: Service[]; more: Service[] };
type Salon = { slug: string; name: string; phone: string | null; city: string | null; logoUrl: string | null };

const GROUP_META: Record<string, { icon: typeof User; sub: string }> = {
  maenner: { icon: User, sub: "Schnitt, Bart & Styling" },
  frauen: { icon: UserRound, sub: "Schnitt, Farbe & Pflege" },
  kinder: { icon: Baby, sub: "Für die Kleinen" },
};

const priceLabel = (s: Service) => (s.priceMin === s.priceMax ? `${s.priceMin} €` : `ab ${s.priceMin} €`);
const fmtDay = (d: Date) => ({
  wd: d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", ""),
  dm: d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" }).replace(".", ""),
});
const iso = (d: Date) => d.toISOString().slice(0, 10);
const longDate = (v: string) => new Date(v + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });

export default function BuchenPage() {
  const { slug } = useParams<{ slug: string }>();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState(0); // 0 kat · 1 service · 2 datum · 3 slot · 4 daten · 5 fertig
  const [group, setGroup] = useState<Group | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manageToken, setManageToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/public/salon?slug=${encodeURIComponent(slug)}`);
        if (!r.ok) { setNotFound(true); return; }
        const d = await r.json();
        setSalon(d.salon); setGroups(d.groups);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const days = useMemo(() => {
    const out: Date[] = [];
    const t = new Date(); t.setHours(0, 0, 0, 0);
    for (let i = 0; i < 24 && out.length < 14; i++) {
      const d = new Date(t); d.setDate(t.getDate() + i);
      if (d.getDay() !== 0) out.push(d);
    }
    return out;
  }, []);

  const slotSplit = useMemo(() => {
    const am = slots.filter((s) => Number(s.slice(0, 2)) < 12);
    const pm = slots.filter((s) => Number(s.slice(0, 2)) >= 12);
    return { am, pm };
  }, [slots]);

  async function loadSlots(d: string, svc: Service) {
    setSlotsLoading(true); setSlots([]); setTime(null);
    try {
      const r = await fetch(`/api/public/availability?slug=${encodeURIComponent(slug)}&serviceId=${svc.id}&date=${d}`);
      const j = await r.json();
      setSlots(j.slots ?? []);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  }

  function pickService(s: Service) { setService(s); setStep(2); }

  async function submit() {
    if (!service || !date || !time) return;
    setSubmitting(true); setErr(null);
    try {
      const r = await fetch("/api/public/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, serviceId: service.id, date, time, name, phone, email, notes }),
      });
      if (r.status === 409) { setErr("Dieser Termin wurde leider gerade vergeben. Bitte wähle eine andere Uhrzeit."); setStep(3); if (date && service) loadSlots(date, service); return; }
      if (!r.ok) { setErr("Etwas ist schiefgelaufen. Bitte versuche es erneut."); return; }
      const j = await r.json().catch(() => ({} as { manageToken?: string }));
      setManageToken(j.manageToken ?? null);
      setStep(5);
    } catch { setErr("Netzwerkfehler. Bitte versuche es erneut."); }
    finally { setSubmitting(false); }
  }

  if (loading) return <Center><Loader2 size={28} className="spin" style={{ color: "var(--c-accent)" }} /></Center>;
  if (notFound) return <Center><div style={{ textAlign: "center" }}><Scissors size={30} style={{ color: "var(--c-fg-muted)", marginBottom: 12 }} /><p style={{ color: "var(--c-fg-subtle)" }}>Dieser Salon wurde nicht gefunden.</p></div></Center>;

  const back = () => {
    setErr(null);
    if (step === 1) { setGroup(null); setShowMore(false); }
    setStep(Math.max(0, step - 1));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-fg)" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--c-border)", background: "var(--c-bg-elevated)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 100% 0%, rgba(212,176,119,0.14), transparent 55%)", pointerEvents: "none" }} />
        <div style={{ height: 3, background: "linear-gradient(90deg, var(--c-accent), #e8cfa0, var(--c-accent))" }} />
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "22px 22px 20px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 18px rgba(212,176,119,0.28)" }}>
              <Scissors size={22} color="#2a1f12" strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--c-accent)" }}>Online Terminbuchung</div>
              <h1 style={{ fontSize: 21, fontWeight: 800, margin: "1px 0 0", letterSpacing: -0.4 }}>{salon?.name}</h1>
              <div style={{ display: "flex", gap: 14, marginTop: 3, fontSize: 12.5, color: "var(--c-fg-muted)" }}>
                {salon?.city && <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><MapPin size={12} />{salon.city}</span>}
                {salon?.phone && <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Phone size={12} />{salon.phone}</span>}
              </div>
            </div>
          </div>
          {step < 5 && <Stepper step={step} />}
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 22px 64px" }}>
        {step > 0 && step < 5 && (
          <button onClick={back} style={backBtn}><ChevronLeft size={16} /> Zurück</button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0 — Kategorie */}
          {step === 0 && (
            <Panel k="cat">
              <Head title="Für wen ist der Termin?" sub="Wähle eine Kategorie, um passende Leistungen zu sehen." />
              <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                {groups.map((g, i) => {
                  const Icon = GROUP_META[g.id]?.icon ?? Scissors;
                  return (
                    <motion.button key={g.id} onClick={() => { setGroup(g); setShowMore(false); setStep(1); }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease: EASE }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} style={groupCard} className="hoverCard">
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(212,176,119,0.12)", border: "1px solid rgba(212,176,119,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={26} color="var(--c-accent)" strokeWidth={1.8} />
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 17, fontWeight: 700 }}>{g.label}</div>
                        <div style={{ fontSize: 12.5, color: "var(--c-fg-muted)", marginTop: 1 }}>{GROUP_META[g.id]?.sub}</div>
                      </div>
                      <ChevronRight size={20} style={{ color: "var(--c-fg-muted)" }} />
                    </motion.button>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* STEP 1 — Service (Top 3 + Weitere) */}
          {step === 1 && group && (
            <Panel k="svc">
              <Head title={group.label} sub="Unsere beliebtesten Leistungen — oder wähle unten weitere Optionen." />
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {group.featured.map((s, i) => (
                  <ServiceCard key={s.id} s={s} popular={i === 0} onClick={() => pickService(s)} />
                ))}
              </div>

              {group.more.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <button onClick={() => setShowMore((v) => !v)} style={moreBtn}>
                    <span>Weitere Optionen ({group.more.length})</span>
                    <motion.span animate={{ rotate: showMore ? 180 : 0 }} transition={{ ease: EASE }}><ChevronDown size={17} /></motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {showMore && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ ease: EASE, duration: 0.32 }} style={{ overflow: "hidden" }}>
                        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                          {group.more.map((s) => <ServiceCard key={s.id} s={s} compact onClick={() => pickService(s)} />)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Panel>
          )}

          {/* STEP 2 — Datum */}
          {step === 2 && (
            <Panel k="date">
              <Head title="Wann passt es dir?" sub={service?.name} />
              <ChosenBar service={service} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 9, marginTop: 16 }}>
                {days.map((d) => {
                  const v = iso(d); const sel = date === v; const { wd, dm } = fmtDay(d);
                  return (
                    <button key={v} onClick={() => { setDate(v); if (service) loadSlots(v, service); setStep(3); }} style={{ ...dayCard, ...(sel ? cardActive : {}) }} className="hoverCard">
                      <span style={{ fontSize: 11, color: "var(--c-fg-muted)", fontWeight: 600 }}>{wd}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{dm}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* STEP 3 — Slot */}
          {step === 3 && (
            <Panel k="slot">
              <Head title="Freie Uhrzeiten" sub={date ? longDate(date) : ""} />
              <ChosenBar service={service} date={date} />
              {err && <ErrBox>{err}</ErrBox>}
              {slotsLoading ? (
                <div style={{ padding: 40, textAlign: "center" }}><Loader2 size={24} className="spin" style={{ color: "var(--c-accent)" }} /></div>
              ) : slots.length === 0 ? (
                <Empty>An diesem Tag ist leider nichts mehr frei. Bitte wähle ein anderes Datum.</Empty>
              ) : (
                <div style={{ marginTop: 6 }}>
                  {slotSplit.am.length > 0 && <SlotBlock label="Vormittag" slots={slotSplit.am} time={time} pick={(s) => { setTime(s); setStep(4); }} />}
                  {slotSplit.pm.length > 0 && <SlotBlock label="Nachmittag" slots={slotSplit.pm} time={time} pick={(s) => { setTime(s); setStep(4); }} />}
                </div>
              )}
            </Panel>
          )}

          {/* STEP 4 — Daten */}
          {step === 4 && (
            <Panel k="form">
              <Head title="Fast geschafft" sub="Nur noch deine Kontaktdaten." />
              <div style={{ padding: "13px 15px", background: "var(--c-bg-subtle)", borderRadius: 13, border: "1px solid var(--c-border)", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{service?.name}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 12.5, color: "var(--c-fg-muted)" }}>
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Calendar size={13} />{date ? longDate(date) : ""}</span>
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Clock size={13} />{time} Uhr</span>
                </div>
              </div>
              {err && <ErrBox>{err}</ErrBox>}
              <div style={{ display: "grid", gap: 12 }}>
                <Field label="Name *"><input value={name} onChange={(e) => setName(e.target.value)} style={input} placeholder="Vor- und Nachname" /></Field>
                <Field label="Telefon"><input value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="Für Rückfragen" inputMode="tel" /></Field>
                <Field label="E-Mail"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="Für die Bestätigung" inputMode="email" /></Field>
                <Field label="Notiz (optional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...input, minHeight: 62, resize: "vertical" }} placeholder="Besondere Wünsche?" /></Field>
              </div>
              <motion.button whileTap={{ scale: 0.99 }} disabled={!name.trim() || submitting} onClick={submit} style={{ ...cta, opacity: !name.trim() || submitting ? 0.5 : 1 }}>
                {submitting ? <Loader2 size={18} className="spin" /> : <Check size={18} />} Termin anfragen
              </motion.button>
              <p style={{ fontSize: 11, color: "var(--c-fg-muted)", marginTop: 11, textAlign: "center", lineHeight: 1.5 }}>
                Mit dem Absenden stimmst du der Verarbeitung deiner Daten zur Terminvereinbarung zu.
              </p>
            </Panel>
          )}

          {/* STEP 5 — Fertig */}
          {step === 5 && (
            <Panel k="done">
              <div style={{ textAlign: "center", padding: "34px 0 10px" }}>
                <motion.div initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{ width: 72, height: 72, borderRadius: 22, background: "linear-gradient(135deg, var(--c-success), #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 30px rgba(34,197,94,0.3)" }}>
                  <Check size={36} color="#fff" strokeWidth={3} />
                </motion.div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 9px" }}>Anfrage gesendet!</h2>
                <p style={{ color: "var(--c-fg-muted)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 330, margin: "0 auto" }}>
                  {salon?.name} bestätigt deinen Wunschtermin in Kürze{email ? " per E-Mail" : ""}. Vielen Dank!
                </p>
                <div style={{ marginTop: 24, padding: 16, background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 15, textAlign: "left", maxWidth: 340, margin: "24px auto 0" }}>
                  <SumRow icon={Sparkles} l="Leistung" r={service?.name ?? ""} />
                  <SumRow icon={Calendar} l="Datum" r={date ? longDate(date) : ""} />
                  <SumRow icon={Clock} l="Uhrzeit" r={time ? `${time} Uhr` : ""} last />
                </div>
                {manageToken && (
                  <a href={`/termin/${manageToken}`} style={{ display: "inline-block", marginTop: 18, fontSize: 13, color: "var(--c-accent)", textDecoration: "none", fontWeight: 600 }}>
                    Termin ändern oder absagen →
                  </a>
                )}
              </div>
            </Panel>
          )}
        </AnimatePresence>
      </div>

      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
        .hoverCard{transition:border-color .18s, background .18s, transform .18s}
        .hoverCard:hover{border-color:var(--c-accent)!important}
        input:focus,textarea:focus{outline:none;border-color:var(--c-accent)!important;box-shadow:0 0 0 3px rgba(212,176,119,0.12)}
        *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}

/* ─── Bausteine ──────────────────────────────────────────── */
function Panel({ k, children }: { k: string; children: React.ReactNode }) {
  return <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: EASE }}>{children}</motion.div>;
}
const Head = ({ title, sub }: { title: string; sub?: string }) => (
  <div><h2 style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 4px", letterSpacing: -0.3 }}>{title}</h2>{sub && <p style={{ fontSize: 13.5, color: "var(--c-fg-muted)", margin: 0, lineHeight: 1.5 }}>{sub}</p>}</div>
);
function ServiceCard({ s, popular, compact, onClick }: { s: Service; popular?: boolean; compact?: boolean; onClick: () => void }) {
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} onClick={onClick} style={{ ...svcCard, padding: compact ? "12px 14px" : "15px 16px" }} className="hoverCard">
      <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: compact ? 14 : 15.5 }}>{s.name}</span>
          {popular && <span style={badge}><Sparkles size={10} /> Beliebt</span>}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--c-fg-muted)", marginTop: 3, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Clock size={12} /> {s.durationMin} Min
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: compact ? 13.5 : 15, fontWeight: 800, color: "var(--c-accent)" }}>{priceLabel(s)}</span>
        <ChevronRight size={18} style={{ color: "var(--c-fg-muted)" }} />
      </div>
    </motion.button>
  );
}
function SlotBlock({ label, slots, time, pick }: { label: string; slots: string[]; time: string | null; pick: (s: string) => void }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "var(--c-fg-muted)", marginBottom: 9 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 }}>
        {slots.map((s) => (
          <motion.button key={s} whileTap={{ scale: 0.96 }} onClick={() => pick(s)} style={{ ...slotChip, ...(time === s ? cardActive : {}) }} className="hoverCard">{s}</motion.button>
        ))}
      </div>
    </div>
  );
}
function Stepper({ step }: { step: number }) {
  const labels = ["Kategorie", "Leistung", "Datum", "Uhrzeit", "Daten"];
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
      {labels.map((l, i) => (
        <div key={l} style={{ flex: 1 }}>
          <div style={{ height: 3, borderRadius: 2, background: i <= step ? "var(--c-accent)" : "var(--c-bg-strong)", transition: "background .35s" }} />
          <div style={{ fontSize: 10, marginTop: 5, color: i <= step ? "var(--c-fg-subtle)" : "var(--c-fg-muted)", fontWeight: i === step ? 700 : 500, whiteSpace: "nowrap" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}
const ChosenBar = ({ service, date }: { service: Service | null; date?: string | null }) => (
  <div style={{ padding: "11px 14px", background: "var(--c-bg-subtle)", borderRadius: 12, borderLeft: "3px solid var(--c-accent)", marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{service?.name}</div>
      <div style={{ fontSize: 12, color: "var(--c-fg-muted)", marginTop: 1 }}>{service?.durationMin} Min · {service ? priceLabel(service) : ""}{date ? ` · ${longDate(date)}` : ""}</div>
    </div>
  </div>
);
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label style={{ display: "block" }}><span style={{ fontSize: 12, fontWeight: 600, color: "var(--c-fg-subtle)", display: "block", marginBottom: 6 }}>{label}</span>{children}</label>
);
const SumRow = ({ icon: Icon, l, r, last }: { icon: typeof User; l: string; r: string; last?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: last ? "none" : "1px solid var(--c-border)" }}>
    <Icon size={15} style={{ color: "var(--c-accent)", flexShrink: 0 }} />
    <span style={{ fontSize: 12.5, color: "var(--c-fg-muted)", width: 66, flexShrink: 0 }}>{l}</span>
    <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right", flex: 1 }}>{r}</span>
  </div>
);
const Empty = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "26px 20px", textAlign: "center", color: "var(--c-fg-muted)", fontSize: 13.5, lineHeight: 1.6, background: "var(--c-bg-subtle)", borderRadius: 13, marginTop: 16 }}>{children}</div>
);
const ErrBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "10px 13px", background: "rgba(239,68,68,0.1)", border: "1px solid var(--c-danger)", borderRadius: 10, color: "var(--c-danger)", fontSize: 12.5, margin: "14px 0", lineHeight: 1.45 }}>{children}</div>
);
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg)" }}>{children}<style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`}</style></div>;
}

/* ─── Styles ─────────────────────────────────────────────── */
const backBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "var(--c-fg-muted)", fontSize: 13, cursor: "pointer", padding: "0 0 16px", fontWeight: 500 };
const groupCard: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 16px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 16, cursor: "pointer", color: "var(--c-fg)" };
const svcCard: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14, cursor: "pointer", color: "var(--c-fg)" };
const badge: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "var(--c-accent)", background: "rgba(212,176,119,0.14)", border: "1px solid rgba(212,176,119,0.3)", padding: "2px 7px", borderRadius: 20 };
const moreBtn: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 15px", background: "transparent", border: "1px dashed var(--c-border)", borderRadius: 12, cursor: "pointer", color: "var(--c-fg-subtle)", fontSize: 13.5, fontWeight: 600 };
const dayCard: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "11px 6px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, cursor: "pointer", color: "var(--c-fg)" };
const slotChip: React.CSSProperties = { padding: "11px 6px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 11, cursor: "pointer", color: "var(--c-fg)", fontSize: 13.5, fontWeight: 700, textAlign: "center" };
const cardActive: React.CSSProperties = { borderColor: "var(--c-accent)", background: "rgba(212,176,119,0.14)", color: "var(--c-fg)" };
const input: React.CSSProperties = { width: "100%", padding: "11px 13px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 10, color: "var(--c-fg)", fontSize: 14.5, fontFamily: "inherit", transition: "border-color .15s, box-shadow .15s" };
const cta: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 20, padding: "14px", background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", color: "#2a1f12", border: "none", borderRadius: 13, fontSize: 15.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 22px rgba(212,176,119,0.28)" };
