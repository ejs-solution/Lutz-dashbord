"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Scissors, MessageSquare, X,
  CreditCard, CheckCircle, Calendar as CalIcon, RefreshCw,
  Clock, Plus, AlertTriangle, Users, CalendarDays,
} from "lucide-react";
import { todayAppointments, type Appointment } from "@/lib/mock-data";
import { SERVICE_CATALOG } from "@/lib/services-catalog";
import { useBeta } from "@/lib/beta-context";
import ShiftsPanel from "@/components/dashboard/ShiftsPanel";

/* ─── Types ──────────────────────────────────────────────────── */
export type ApptWithDate = Appointment & { date: string };
type MainView = "termine" | "schichten";
type CalView  = "day" | "week";
type Employee = "Aynur" | "Monika" | "Lisa";

/* ─── Constants ──────────────────────────────────────────────── */
const HOURS     = Array.from({ length: 12 }, (_, i) => i + 8); // 08–19
const EMPLOYEES: Employee[] = ["Aynur", "Monika", "Lisa"];

const EMP: Record<Employee, { bg: string; border: string; text: string }> = {
  Aynur:  { bg: "rgba(212,176,119,0.15)", border: "#D4B077", text: "#D4B077" },
  Monika: { bg: "rgba(16,185,129,0.14)",  border: "#10b981", text: "#10b981" },
  Lisa:   { bg: "rgba(96,165,250,0.14)",  border: "#60a5fa", text: "#60a5fa" },
};

const SHIFT_TMPL: Record<Employee, { days: number[]; start: string; end: string }> = {
  Aynur:  { days: [1,2,3,4,5,6], start: "09:00", end: "18:00" },
  Monika: { days: [1,2,3,4,5],   start: "09:00", end: "17:00" },
  Lisa:   { days: [2,3,4,5,6],   start: "10:00", end: "18:00" },
};

/* ─── Date helpers ───────────────────────────────────────────── */
function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function getMonday(d: Date): Date {
  const dow  = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const m    = new Date(d);
  m.setDate(d.getDate() + diff);
  return m;
}

function weekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtLong(d: Date) {
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" });
}

/* ─── Appointment helpers ────────────────────────────────────── */
function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function apptTop(t: string)      { return toMin(t) - 8 * 60; }   // 1 min = 1 px
function apptH(dur: number)      { return Math.max(dur - 2, 24); }

function hasConflict(a: ApptWithDate, pool: ApptWithDate[]): boolean {
  const aS = toMin(a.startTime), aE = aS + a.duration;
  return pool.some(
    b => b.id !== a.id && b.employee === a.employee && b.date === a.date &&
         toMin(b.startTime) < aE && toMin(b.startTime) + b.duration > aS
  );
}

/* ─── Shift generation (local until Supabase Shifts is seeded) ── */
type Shift = { id: string; employee: Employee; date: string; start: string; end: string };

function makeShifts(dates: Date[]): Shift[] {
  const result: Shift[] = [];
  for (const emp of EMPLOYEES) {
    const tmpl = SHIFT_TMPL[emp];
    for (const d of dates) {
      if (tmpl.days.includes(d.getDay())) {
        result.push({ id: `${emp}-${toISO(d)}`, employee: emp, date: toISO(d), start: tmpl.start, end: tmpl.end });
      }
    }
  }
  return result;
}

/* ─── GCal types ─────────────────────────────────────────────── */
type GCalEvent = {
  id: string;
  summary?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end:   { dateTime?: string; date?: string };
};
function fmtGCalTime(ev: GCalEvent) {
  if (!ev.start.dateTime) return "Ganztägig";
  const f = (s: string) => new Date(s).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return `${f(ev.start.dateTime!)} – ${f(ev.end.dateTime!)}`;
}
function fmtGCalDate(ev: GCalEvent) {
  const d = ev.start.dateTime ?? ev.start.date ?? "";
  return new Date(d).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" });
}

/* ─────────────────────────────────────────────────────────────── */
/*  SCHICHTEN VIEW                                                  */
/* ─────────────────────────────────────────────────────────────── */
function SchichtenView({ dates }: { dates: Date[] }) {
  const todayISO = toISO(new Date());
  const shifts   = makeShifts(dates);
  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}
    >
      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "110px repeat(7, 1fr)", borderBottom: "1px solid var(--c-border)", background: "var(--c-bg-subtle)" }}>
        <div style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.6 }}>Mitarbeiter</div>
        {dates.map((d, i) => {
          const isToday = toISO(d) === todayISO;
          return (
            <div key={i} style={{ padding: "10px 6px", textAlign: "center", borderLeft: "1px solid var(--c-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? "var(--c-accent)" : "var(--c-fg-subtle)", textTransform: "uppercase" }}>{dayLabels[i]}</div>
              <div style={{
                fontSize: 14, fontWeight: 800, color: isToday ? "var(--c-accent)" : "var(--c-fg)",
                width: 24, height: 24, borderRadius: "50%",
                background: isToday ? "rgba(212,176,119,0.18)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "3px auto 0",
              }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee rows */}
      {EMPLOYEES.map((emp, ei) => {
        const c = EMP[emp];
        return (
          <div key={emp} style={{
            display: "grid", gridTemplateColumns: "110px repeat(7, 1fr)",
            borderBottom: ei < EMPLOYEES.length - 1 ? "1px solid var(--c-border)" : "none",
          }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.border, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)" }}>{emp}</span>
            </div>
            {dates.map((d, di) => {
              const shift = shifts.find(s => s.employee === emp && s.date === toISO(d));
              return (
                <div key={di} style={{ borderLeft: "1px solid var(--c-border)", padding: "14px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {shift ? (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: c.text,
                      background: c.bg, padding: "4px 8px", borderRadius: 6,
                      border: `1px solid ${c.border}40`,
                    }}>
                      {shift.start}–{shift.end}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--c-fg-faint, var(--c-fg-subtle))", opacity: 0.4 }}>–</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  DAY VIEW                                                        */
/* ─────────────────────────────────────────────────────────────── */
function DayView({
  appts, allForDay, onSelect,
}: {
  appts: ApptWithDate[];
  allForDay: ApptWithDate[];
  onSelect: (a: ApptWithDate) => void;
}) {
  return (
    <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: `56px repeat(3, 1fr)`, borderBottom: "1px solid var(--c-border)", background: "var(--c-bg-subtle)" }}>
        <div />
        {EMPLOYEES.map(emp => {
          const c = EMP[emp];
          const count = appts.filter(a => a.employee === emp).length;
          return (
            <div key={emp} style={{ padding: "10px 8px", borderLeft: "1px solid var(--c-border)", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.border, display: "inline-block" }} />
                <span style={{ fontWeight: 800, fontSize: 15.5, color: "var(--c-fg)" }}>{emp}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--c-fg-subtle)", marginTop: 3 }}>{count} Termine</div>
            </div>
          );
        })}
      </div>

      {/* Time body */}
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 340px)", minHeight: 420 }}>
        <div style={{ display: "grid", gridTemplateColumns: "56px repeat(3, 1fr)" }}>
          {/* Time axis */}
          <div>
            {HOURS.map(h => (
              <div key={h} style={{ height: 60, borderBottom: "1px solid var(--c-border)", padding: "4px 6px 0", display: "flex", alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--c-fg-subtle)" }}>{h}:00</span>
              </div>
            ))}
          </div>

          {/* Employee columns */}
          {EMPLOYEES.map(emp => {
            const c        = EMP[emp];
            const empAppts = appts.filter(a => a.employee === emp);
            return (
              <div key={emp} style={{ borderLeft: "1px solid var(--c-border)", position: "relative" }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: 60, borderBottom: "1px solid var(--c-border)" }} />
                ))}
                {empAppts.map(appt => {
                  const conflict = hasConflict(appt, allForDay);
                  const bg       = conflict ? "rgba(239,68,68,0.12)" : c.bg;
                  const bdr      = conflict ? "#ef4444"              : c.border;
                  const clr      = conflict ? "#ef4444"              : c.text;
                  return (
                    <motion.div
                      key={appt.id}
                      style={{
                        position: "absolute",
                        top: apptTop(appt.startTime),
                        height: apptH(appt.duration),
                        left: 3, right: 3,
                        background: bg,
                        borderLeft: `3px solid ${bdr}`,
                        color: clr,
                        borderRadius: 8, padding: "4px 7px",
                        cursor: "pointer", fontSize: 11, fontWeight: 700, overflow: "hidden",
                      }}
                      whileHover={{ opacity: 0.84, scale: 1.01 }}
                      onClick={() => onSelect(appt)}
                      initial={{ opacity: 0, scaleY: 0.88 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ ease: [0.25, 0.46, 0.45, 0.94], duration: 0.25 }}
                    >
                      {conflict && <AlertTriangle size={9} style={{ display: "inline", marginRight: 3 }} />}
                      <div style={{ lineHeight: 1.3 }}>{appt.startTime} · {appt.customerName.split(" ")[0]}</div>
                      <div style={{ opacity: 0.75, fontSize: 10, marginTop: 1 }}>{appt.service}</div>
                      {appt.depositPaid && <div style={{ fontSize: 9, opacity: 0.65 }}>Anz. ✓</div>}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  WEEK VIEW                                                       */
/* ─────────────────────────────────────────────────────────────── */
function WeekView({
  dates, appts, allAppts, onSelect,
}: {
  dates: Date[];
  appts: ApptWithDate[];
  allAppts: ApptWithDate[];
  onSelect: (a: ApptWithDate) => void;
}) {
  const todayISO  = toISO(new Date());
  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(7, 1fr)", borderBottom: "1px solid var(--c-border)", background: "var(--c-bg-subtle)" }}>
        <div />
        {dates.map((d, i) => {
          const iso     = toISO(d);
          const isToday = iso === todayISO;
          const count   = appts.filter(a => a.date === iso).length;
          return (
            <div key={i} style={{ padding: "9px 4px", borderLeft: "1px solid var(--c-border)", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: isToday ? "var(--c-accent)" : "var(--c-fg-subtle)" }}>{dayLabels[i]}</div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: isToday ? "var(--c-accent)" : "var(--c-fg)",
                width: 26, height: 26, borderRadius: "50%",
                background: isToday ? "rgba(212,176,119,0.18)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "2px auto 0",
              }}>
                {d.getDate()}
              </div>
              {count > 0 && <div style={{ fontSize: 9, color: "var(--c-fg-subtle)", marginTop: 1 }}>{count}T</div>}
            </div>
          );
        })}
      </div>

      {/* Time body */}
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 340px)", minHeight: 420 }}>
        <div style={{ display: "grid", gridTemplateColumns: "44px repeat(7, 1fr)" }}>
          <div>
            {HOURS.map(h => (
              <div key={h} style={{ height: 60, borderBottom: "1px solid var(--c-border)", padding: "4px 4px 0" }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: "var(--c-fg-subtle)" }}>{h}:00</span>
              </div>
            ))}
          </div>
          {dates.map((d, di) => {
            const iso        = toISO(d);
            const isToday    = iso === todayISO;
            const dayAppts   = appts.filter(a => a.date === iso);
            const dayAll     = allAppts.filter(a => a.date === iso);
            return (
              <div key={di} style={{
                borderLeft: "1px solid var(--c-border)", position: "relative",
                background: isToday ? "rgba(212,176,119,0.025)" : "transparent",
              }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: 60, borderBottom: "1px solid var(--c-border)" }} />
                ))}
                {dayAppts.map(appt => {
                  const c        = EMP[appt.employee as Employee] ?? EMP.Aynur;
                  const conflict = hasConflict(appt, dayAll);
                  return (
                    <motion.div
                      key={appt.id}
                      style={{
                        position: "absolute",
                        top: apptTop(appt.startTime),
                        height: apptH(appt.duration),
                        left: 2, right: 2,
                        background: conflict ? "rgba(239,68,68,0.12)" : c.bg,
                        borderLeft: `2px solid ${conflict ? "#ef4444" : c.border}`,
                        color: conflict ? "#ef4444" : c.text,
                        borderRadius: 5, padding: "3px 5px",
                        cursor: "pointer", fontSize: 9, fontWeight: 700, overflow: "hidden",
                      }}
                      whileHover={{ opacity: 0.82 }}
                      onClick={() => onSelect(appt)}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      <div>{appt.startTime}</div>
                      <div style={{ opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {appt.customerName.split(" ")[0]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  NEW APPOINTMENT SLIDE-OVER                                      */
/* ─────────────────────────────────────────────────────────────── */
type ApptForm = {
  customerName: string;
  phone: string;
  service: string;
  employee: Employee;
  date: string;
  startTime: string;
  duration: number;
  price: number;
  depositPaid: boolean;
  notes: string;
};

function defaultForm(date: string): ApptForm {
  return { customerName: "", phone: "", service: "", employee: "Aynur", date, startTime: "09:00", duration: 60, price: 0, depositPaid: false, notes: "" };
}

function NewApptSlideOver({ open, onClose, onSave, defaultDate }: {
  open: boolean;
  onClose: () => void;
  onSave: (a: ApptWithDate) => void;
  defaultDate: string;
}) {
  const [form, setForm]           = useState<ApptForm>(defaultForm(defaultDate));
  const [errors, setErrors]       = useState<Partial<Record<keyof ApptForm, string>>>({});
  const [svcQuery, setSvcQuery]   = useState("");
  const [showList, setShowList]   = useState(false);

  useEffect(() => {
    if (open) { setForm(defaultForm(defaultDate)); setErrors({}); setSvcQuery(""); }
  }, [open, defaultDate]);

  const set = <K extends keyof ApptForm>(k: K, v: ApptForm[K]) => setForm(p => ({ ...p, [k]: v }));

  const filteredSvcs = useMemo(() =>
    SERVICE_CATALOG.filter(s => s.name.toLowerCase().includes(svcQuery.toLowerCase())).slice(0, 8),
  [svcQuery]);

  function validate() {
    const e: typeof errors = {};
    if (!form.customerName.trim()) e.customerName = "Pflichtfeld";
    if (!form.service.trim()) e.service = "Bitte Service wählen";
    if (form.duration < 5) e.duration = "Mindestens 5 Min.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id: `new-${Date.now()}`,
      customerName: form.customerName,
      service: form.service,
      duration: form.duration,
      startTime: form.startTime,
      employee: form.employee,
      channel: "phone",
      status: "confirmed",
      depositPaid: form.depositPaid,
      depositAmount: form.depositPaid ? Math.round(form.price * 0.2) : undefined,
      totalAmount: form.price,
      customerPhone: form.phone || undefined,
      avatar: form.customerName.split(" ").map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase(),
      date: form.date,
    });
    onClose();
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
    background: "var(--c-bg)", border: "1px solid var(--c-border)",
    color: "var(--c-fg)", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", display: "block",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6,
  };
  const errClr = "var(--c-danger, #ef4444)";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 200 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0, width: 480, zIndex: 201,
              background: "var(--c-bg-elevated)", borderLeft: "1px solid var(--c-border)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-fg)" }}>Neuer Termin</div>
                <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", marginTop: 2 }}>Termin manuell erstellen</div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={18} style={{ color: "var(--c-fg-muted)" }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Kunde */}
              <div>
                <label style={lbl}>Kundenname *</label>
                <input
                  style={{ ...inp, borderColor: errors.customerName ? errClr : "var(--c-border)" }}
                  placeholder="z. B. Fatma Yilmaz"
                  value={form.customerName}
                  onChange={e => set("customerName", e.target.value)}
                />
                {errors.customerName && <div style={{ fontSize: 11, color: errClr, marginTop: 3 }}>{errors.customerName}</div>}
              </div>

              <div>
                <label style={lbl}>Telefon</label>
                <input style={inp} placeholder="+49 …" value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>

              {/* Service with autocomplete */}
              <div style={{ position: "relative" }}>
                <label style={lbl}>Service *</label>
                <input
                  style={{ ...inp, borderColor: errors.service ? errClr : "var(--c-border)" }}
                  placeholder="Service suchen oder eingeben…"
                  value={svcQuery || form.service}
                  onChange={e => { setSvcQuery(e.target.value); set("service", e.target.value); setShowList(true); }}
                  onFocus={() => setShowList(true)}
                  onBlur={() => setTimeout(() => setShowList(false), 150)}
                />
                {errors.service && <div style={{ fontSize: 11, color: errClr, marginTop: 3 }}>{errors.service}</div>}
                <AnimatePresence>
                  {showList && filteredSvcs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                        background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
                        borderRadius: 8, overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                      }}
                    >
                      {filteredSvcs.map(s => (
                        <div
                          key={s.id}
                          onMouseDown={() => {
                            set("service", s.name);
                            set("duration", s.durationMin);
                            set("price", s.priceMin);
                            setSvcQuery("");
                            setShowList(false);
                          }}
                          style={{ padding: "9px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.1s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-bg-subtle)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <span style={{ fontSize: 13, color: "var(--c-fg)" }}>{s.name}</span>
                          <span style={{ fontSize: 11, color: "var(--c-fg-subtle)" }}>{s.durationMin} Min · ab €{s.priceMin}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Employee */}
              <div>
                <label style={lbl}>Mitarbeiter</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {EMPLOYEES.map(emp => {
                    const c   = EMP[emp];
                    const sel = form.employee === emp;
                    return (
                      <button key={emp} onClick={() => set("employee", emp)} style={{
                        flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `1px solid ${sel ? c.border : "var(--c-border)"}`,
                        background: sel ? c.bg : "transparent",
                        color: sel ? c.text : "var(--c-fg-muted)", cursor: "pointer",
                        transition: "all 0.15s",
                      }}>
                        {emp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date + Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Datum</label>
                  <input type="date" style={inp} value={form.date} onChange={e => set("date", e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Uhrzeit</label>
                  <input type="time" style={inp} value={form.startTime} onChange={e => set("startTime", e.target.value)} />
                </div>
              </div>

              {/* Duration + Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Dauer (Min.) *</label>
                  <input
                    type="number" min={5} step={5}
                    style={{ ...inp, borderColor: errors.duration ? errClr : "var(--c-border)" }}
                    value={form.duration}
                    onChange={e => set("duration", parseInt(e.target.value) || 0)}
                  />
                  {errors.duration && <div style={{ fontSize: 11, color: errClr, marginTop: 3 }}>{errors.duration}</div>}
                </div>
                <div>
                  <label style={lbl}>Preis (€)</label>
                  <input
                    type="number" min={0} step={1}
                    style={inp}
                    value={form.price}
                    onChange={e => set("price", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Deposit toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "var(--c-bg-subtle)", borderRadius: 10, border: "1px solid var(--c-border)",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)" }}>Anzahlung erhalten</div>
                  <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 1 }}>Termin als bezahlt markieren</div>
                </div>
                <button
                  onClick={() => set("depositPaid", !form.depositPaid)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                    background: form.depositPaid ? "var(--c-accent)" : "var(--c-bg-strong)",
                    position: "relative", flexShrink: 0,
                  }}
                >
                  <motion.span
                    animate={{ x: form.depositPaid ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    style={{
                      display: "block", width: 20, height: 20, borderRadius: "50%",
                      background: "#fff", position: "absolute", top: 2,
                    }}
                  />
                </button>
              </div>

              {/* Notes */}
              <div>
                <label style={lbl}>Notizen</label>
                <textarea
                  rows={3}
                  style={{ ...inp, resize: "vertical" }}
                  placeholder="Interne Notizen…"
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--c-border)", display: "flex", gap: 10, flexShrink: 0 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13,
                  background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
                }}
              >
                Termin erstellen
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13,
                  background: "transparent", color: "var(--c-fg-muted)", border: "1px solid var(--c-border)", cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  APPOINTMENT DETAIL MODAL                                        */
/* ─────────────────────────────────────────────────────────────── */
function ApptModal({ appt, onClose }: { appt: ApptWithDate; onClose: () => void }) {
  const c = EMP[appt.employee as Employee] ?? EMP.Aynur;
  return (
    <>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 300 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 14 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{
          position: "fixed", zIndex: 301,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(460px, calc(100vw - 32px))",
          background: "var(--c-bg-elevated)",
          border: "1px solid var(--c-border)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ height: 3, background: c.border }} />
        <div style={{ padding: 24 }}>
          {/* Customer row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", fontSize: 14, fontWeight: 800,
                background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${c.border}40`, flexShrink: 0,
              }}>
                {appt.avatar ?? appt.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "var(--c-fg)" }}>{appt.customerName}</div>
                {appt.langFlag && (
                  <div style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>{appt.langFlag} {appt.language ?? ""}
                    {appt.isVIP && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "var(--c-accent)", background: "rgba(212,176,119,0.12)", padding: "1px 6px", borderRadius: 4 }}>VIP</span>}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={16} style={{ color: "var(--c-fg-muted)" }} />
            </button>
          </div>

          {/* Services */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {(appt.services ?? [appt.service]).map(s => (
              <span key={s} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: c.bg, color: c.text, border: `1px solid ${c.border}40`,
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <Scissors size={10} /> {s}
              </span>
            ))}
          </div>

          {/* Details */}
          {[
            { label: "Uhrzeit",     value: `${appt.startTime} Uhr · ${appt.duration} Min.` },
            { label: "Mitarbeiter", value: appt.employee },
            { label: "Preis",       value: `€ ${appt.totalAmount}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--c-border)", fontSize: 13 }}>
              <span style={{ color: "var(--c-fg-subtle)", fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 700, color: "var(--c-fg)" }}>{value}</span>
            </div>
          ))}

          {/* Deposit */}
          <div style={{
            marginTop: 14, padding: 12, borderRadius: 10,
            background: appt.depositPaid ? "rgba(16,185,129,0.08)" : "var(--c-bg-subtle)",
            border: `1px solid ${appt.depositPaid ? "#10b98140" : "var(--c-border)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={14} style={{ color: appt.depositPaid ? "#10b981" : "var(--c-fg-subtle)" }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: appt.depositPaid ? "#10b981" : "var(--c-fg)" }}>
                Anzahlung
              </span>
              {appt.depositPaid && <CheckCircle size={13} style={{ color: "#10b981" }} />}
            </div>
            <div style={{ fontSize: 12, marginTop: 3, color: appt.depositPaid ? "#10b981" : "var(--c-fg-subtle)" }}>
              {appt.depositPaid
                ? `€ ${appt.depositAmount ?? Math.round(appt.totalAmount * 0.2)} bezahlt — Termin gesichert`
                : "Noch nicht bezahlt · Paul kann Erinnerung senden"}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{
              flex: 1, padding: "9px 0", borderRadius: 8, fontWeight: 700, fontSize: 13,
              background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <MessageSquare size={13} /> WhatsApp
            </button>
            <button onClick={onClose} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, fontWeight: 600, fontSize: 13,
              background: "transparent", color: "var(--c-fg-muted)", border: "1px solid var(--c-border)", cursor: "pointer",
            }}>
              Schließen
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                       */
/* ─────────────────────────────────────────────────────────────── */
export default function KalenderPage() {
  const { betaMode } = useBeta();
  const [mainView,      setMainView]      = useState<MainView>("termine");
  const [calView,       setCalView]       = useState<CalView>("day");
  const [currentDate,   setCurrentDate]   = useState(() => new Date());
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [selectedAppt,  setSelectedAppt]  = useState<ApptWithDate | null>(null);
  const [showNew,       setShowNew]       = useState(false);

  // GCal state
  const [gcalEvents,  setGcalEvents]  = useState<GCalEvent[]>([]);
  const [gcalLoading, setGcalLoading] = useState(true);
  const [gcalError,   setGcalError]   = useState<string | null>(null);

  // Appointments: mock seed in beta mode, empty + fetch from Supabase in live mode
  const todayISO = useMemo(() => toISO(new Date()), []);
  const [appts, setAppts] = useState<ApptWithDate[]>(() =>
    betaMode ? todayAppointments.map(a => ({ ...a, date: todayISO })) : []
  );

  // Load real appointments from Supabase when not in beta mode
  useEffect(() => {
    if (betaMode) {
      setAppts(todayAppointments.map(a => ({ ...a, date: todayISO })));
      return;
    }
    // Fetch all appointments (no date filter) so week view works too
    fetch("/api/appointments")
      .then(r => r.json())
      .then(d => {
        const raw = (d.appointments ?? []) as Array<{
          id: string; customerName: string; service: string; employee: string;
          date: string; startTime: string; duration: number; totalAmount: number;
          depositPaid: boolean; depositAmount?: number; status: string;
          channel: string; customerPhone?: string;
        }>;
        const mapped: ApptWithDate[] = raw.map(a => ({
          id:            a.id,
          customerName:  a.customerName,
          service:       a.service,
          employee:      (a.employee ?? "Aynur") as "Aynur" | "Monika" | "Lisa",
          date:          a.date,
          startTime:     a.startTime,
          duration:      a.duration ?? 60,
          totalAmount:   a.totalAmount ?? 0,
          depositPaid:   a.depositPaid ?? false,
          depositAmount: a.depositAmount,
          status:        (a.status ?? "confirmed") as "confirmed" | "pending" | "completed" | "cancelled",
          channel:       (a.channel ?? "phone") as "whatsapp" | "instagram" | "phone" | "email",
          customerPhone: a.customerPhone,
        }));
        setAppts(mapped);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betaMode]);

  useEffect(() => {
    if (betaMode) { setGcalLoading(false); return; } // No real data in demo mode
    fetch("/api/calendar")
      .then(r => r.json())
      .then(d => { if (d.error) setGcalError(d.error); else setGcalEvents(d.events ?? []); })
      .catch(e => setGcalError(String(e)))
      .finally(() => setGcalLoading(false));
  }, [betaMode]);

  const monday    = useMemo(() => getMonday(currentDate), [currentDate]);
  const wDates    = useMemo(() => weekDates(monday), [monday]);
  const currentISO = toISO(currentDate);

  function navigate(delta: number) {
    const d = new Date(currentDate);
    calView === "day" ? d.setDate(d.getDate() + delta) : d.setDate(d.getDate() + delta * 7);
    setCurrentDate(d);
  }

  const visibleAppts = useMemo(() => {
    const byDate = calView === "day"
      ? appts.filter(a => a.date === currentISO)
      : appts.filter(a => wDates.some(d => toISO(d) === a.date));
    return activeEmployee ? byDate.filter(a => a.employee === activeEmployee) : byDate;
  }, [appts, calView, currentISO, wDates, activeEmployee]);

  const allForDay = useMemo(() => appts.filter(a => a.date === currentISO), [appts, currentISO]);

  const dateLabel = calView === "day"
    ? fmtLong(currentDate)
    : `${fmtShort(wDates[0])} – ${fmtShort(wDates[6])} ${wDates[0].getFullYear()}`;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.4, marginBottom: 2 }}>Kalender</h1>
            <p style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>{dateLabel}</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Main view tabs */}
            <div style={{ display: "flex", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 3, gap: 2 }}>
              {([
                ["termine",   "Termine",  CalendarDays],
                ["schichten", "Schichten", Users],
              ] as const).map(([v, label, Icon]) => (
                <button key={v} onClick={() => setMainView(v)} style={{
                  padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  background: mainView === v ? "var(--c-bg-strong)" : "transparent",
                  color: mainView === v ? "var(--c-fg)" : "var(--c-fg-muted)",
                  transition: "all 0.14s",
                }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Day / Week toggle */}
            {mainView === "termine" && (
              <div style={{ display: "flex", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 3, gap: 2 }}>
                {([["day", "Tag"], ["week", "Woche"]] as [CalView, string][]).map(([v, label]) => (
                  <button key={v} onClick={() => setCalView(v)} style={{
                    padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                    border: "none", cursor: "pointer",
                    background: calView === v ? "var(--c-bg-strong)" : "transparent",
                    color: calView === v ? "var(--c-fg)" : "var(--c-fg-muted)",
                    transition: "all 0.14s",
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Date navigation */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button onClick={() => navigate(-1)} style={{ padding: "7px 9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ChevronLeft size={15} style={{ color: "var(--c-fg-muted)" }} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid rgba(212,176,119,0.3)", background: "transparent", color: "var(--c-accent)", cursor: "pointer" }}>
                Heute
              </button>
              <button onClick={() => navigate(1)} style={{ padding: "7px 9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ChevronRight size={15} style={{ color: "var(--c-fg-muted)" }} />
              </button>
            </div>

            {/* New appointment */}
            <button
              onClick={() => setShowNew(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
              }}
            >
              <Plus size={15} /> Neuer Termin
            </button>
          </div>
        </div>

        {/* Employee filter chips */}
        {mainView === "termine" && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.6 }}>Team:</span>
            <button onClick={() => setActiveEmployee(null)} style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              border: "1px solid var(--c-border)", cursor: "pointer",
              background: !activeEmployee ? "var(--c-fg)" : "transparent",
              color: !activeEmployee ? "var(--c-bg)" : "var(--c-fg-muted)",
              transition: "all 0.14s",
            }}>
              Alle
            </button>
            {EMPLOYEES.map(emp => {
              const c      = EMP[emp];
              const active = activeEmployee === emp;
              const count  = appts.filter(a => a.employee === emp && a.date === currentISO).length;
              return (
                <button key={emp} onClick={() => setActiveEmployee(active ? null : emp)} style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${active ? c.border : "var(--c-border)"}`,
                  background: active ? c.bg : "transparent",
                  color: active ? c.text : "var(--c-fg-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  transition: "all 0.14s",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.border, display: "inline-block" }} />
                  {emp}
                  {count > 0 && <span style={{ fontSize: 10, opacity: 0.65 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Calendar / Schichten ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {mainView === "schichten" ? (
          <motion.div key="schichten" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <SchichtenView dates={wDates} />
            <div style={{ marginTop: 28 }}><ShiftsPanel /></div>
          </motion.div>
        ) : calView === "day" ? (
          <motion.div key="day" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <DayView appts={visibleAppts} allForDay={allForDay} onSelect={setSelectedAppt} />
          </motion.div>
        ) : (
          <motion.div key="week" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <WeekView dates={wDates} appts={visibleAppts} allAppts={appts} onSelect={setSelectedAppt} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Google Kalender section — hidden in demo mode ───── */}
      {!betaMode && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalIcon size={15} style={{ color: "var(--c-accent)" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--c-fg)" }}>Mein Google Kalender</span>
            {!gcalLoading && !gcalError && <span style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>· nächste 14 Tage</span>}
          </div>
          {!gcalLoading && !gcalError && (
            <button className="btn-ghost" style={{ padding: "5px 9px", fontSize: 12 }} onClick={() => {
              setGcalLoading(true); setGcalError(null);
              fetch("/api/calendar").then(r => r.json()).then(d => { if (d.error) setGcalError(d.error); else setGcalEvents(d.events ?? []); }).catch(e => setGcalError(String(e))).finally(() => setGcalLoading(false));
            }}>
              <RefreshCw size={13} />
            </button>
          )}
        </div>

        {gcalLoading ? (
          <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
          </div>
        ) : gcalError === "not_connected" ? (
          <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <CalIcon size={28} style={{ color: "var(--c-fg-subtle)", margin: "0 auto 10px" }} />
            <p style={{ fontWeight: 700, color: "var(--c-fg)", marginBottom: 6 }}>Google Kalender nicht verbunden</p>
            <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginBottom: 14 }}>Verbinde deinen Google Account in den Einstellungen.</p>
            <a href="/settings" style={{ display: "inline-flex", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "var(--c-accent)", color: "var(--c-accent-fg)", textDecoration: "none" }}>Zu den Einstellungen</a>
          </div>
        ) : gcalError ? (
          <div style={{ padding: 16, color: "#ef4444", fontSize: 13 }}>Fehler: {gcalError}</div>
        ) : gcalEvents.length === 0 ? (
          <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 24, textAlign: "center", color: "var(--c-fg-subtle)", fontSize: 14 }}>
            Keine bevorstehenden Termine in den nächsten 14 Tagen.
          </div>
        ) : (
          <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
            {gcalEvents.map((ev, i) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderBottom: i < gcalEvents.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 99, flexShrink: 0, background: "var(--c-accent)", minHeight: 32 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--c-fg)", marginBottom: 3 }}>{ev.summary ?? "(Kein Titel)"}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--c-fg-subtle)" }}><CalIcon size={11} /> {fmtGCalDate(ev)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--c-fg-subtle)" }}><Clock size={11} /> {fmtGCalTime(ev)}</span>
                    {ev.location && <span style={{ fontSize: 12, color: "var(--c-fg-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {ev.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>}

      {/* ── Modals ──────────────────────────────────────────── */}
      <NewApptSlideOver
        open={showNew}
        onClose={() => setShowNew(false)}
        onSave={a => setAppts(prev => [...prev, a])}
        defaultDate={currentISO}
      />

      <AnimatePresence>
        {selectedAppt && (
          <ApptModal key={selectedAppt.id} appt={selectedAppt} onClose={() => setSelectedAppt(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
