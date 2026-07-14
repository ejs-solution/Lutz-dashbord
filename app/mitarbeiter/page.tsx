"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Check, ChevronRight, User,
  Mail, Phone, Clock, Scissors, Shield,
  Trash2, Calendar,
} from "lucide-react";
import { SERVICE_CATALOG, SERVICE_CATEGORIES } from "@/lib/services-catalog";
import WorkHoursEditor from "@/components/dashboard/WorkHoursEditor";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Types ─────────────────────────────────────────────── */
type Role = "owner" | "stylist" | "receptionist";
type Weekday = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";
const WEEKDAYS: Weekday[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const CALENDAR_COLORS = [
  { name: "Gold",    value: "#D4B077" },
  { name: "Grün",    value: "#10B981" },
  { name: "Blau",    value: "#60A5FA" },
  { name: "Lila",    value: "#A78BFA" },
  { name: "Rose",    value: "#FB7185" },
  { name: "Orange",  value: "#F59E0B" },
  { name: "Cyan",    value: "#22D3EE" },
  { name: "Indigo",  value: "#818CF8" },
];

type WorkingDay = { active: boolean; from: string; to: string };
type Member = {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  color: string;
  serviceIds: string[];
  workingHours: Record<Weekday, WorkingDay>;
  hasAppAccess: boolean;
  notes: string;
  commissionRate: number;
};

const DEFAULT_HOURS: Record<Weekday, WorkingDay> = {
  Mo: { active: true,  from: "09:00", to: "18:00" },
  Di: { active: true,  from: "09:00", to: "18:00" },
  Mi: { active: true,  from: "09:00", to: "18:00" },
  Do: { active: true,  from: "09:00", to: "18:00" },
  Fr: { active: true,  from: "09:00", to: "18:00" },
  Sa: { active: true,  from: "09:00", to: "15:00" },
  So: { active: false, from: "09:00", to: "18:00" },
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: "aynur", name: "Aynur K.", role: "owner", email: "aynur@salon.de", phone: "+49 172 000 0001",
    color: "#D4B077",
    serviceIds: ["d-mittel", "d-lang", "c-ansatz", "c-balay", "c-ombre", "c-strm", "p-kur", "s-braut"],
    workingHours: { ...DEFAULT_HOURS },
    hasAppAccess: true, notes: "Inhaberin. Spezialisiert auf Colorationen und Brautstyling.", commissionRate: 0,
  },
  {
    id: "monika", name: "Monika S.", role: "stylist", email: "monika@salon.de", phone: "+49 172 000 0002",
    color: "#10B981",
    serviceIds: ["h-klass", "h-modern", "h-fade", "h-skin", "b-schnitt", "b-nass", "p-wash", "s-fm"],
    workingHours: { ...DEFAULT_HOURS, Sa: { active: false, from: "09:00", to: "18:00" } },
    hasAppAccess: true, notes: "Experte für Herrenschnitte und Bart.", commissionRate: 35,
  },
  {
    id: "lisa", name: "Lisa T.", role: "stylist", email: "lisa@salon.de", phone: "+49 172 000 0003",
    color: "#60A5FA",
    serviceIds: ["d-kurz", "d-bob", "d-pixie", "p-wash", "p-mass", "s-fk", "s-lock"],
    workingHours: { Mo: { active: false, from: "09:00", to: "18:00" }, Di: { active: true, from: "10:00", to: "18:00" }, Mi: { active: true, from: "10:00", to: "18:00" }, Do: { active: true, from: "10:00", to: "18:00" }, Fr: { active: true, from: "10:00", to: "18:00" }, Sa: { active: true, from: "09:00", to: "14:00" }, So: { active: false, from: "09:00", to: "18:00" } },
    hasAppAccess: false, notes: "Teilzeit Di–Sa.", commissionRate: 30,
  },
];

const ROLE_LABELS: Record<Role, string> = {
  owner: "Inhaber/in",
  stylist: "Stylist/in",
  receptionist: "Empfang",
};

/* ─── Helpers ────────────────────────────────────────────── */
function workingHoursSummary(wh: Record<Weekday, WorkingDay>): string {
  const active = WEEKDAYS.filter((d) => wh[d].active);
  if (active.length === 0) return "Keine Arbeitszeiten";
  if (active.length === 7) return `Tägl. ${wh[active[0]].from}–${wh[active[0]].to}`;
  const ranges: string[] = [];
  let start = active[0], prev = active[0];
  for (let i = 1; i <= active.length; i++) {
    const cur = active[i];
    if (!cur || WEEKDAYS.indexOf(cur) !== WEEKDAYS.indexOf(prev) + 1) {
      ranges.push(start === prev ? start : `${start}–${prev}`);
      start = cur; prev = cur;
    } else { prev = cur; }
  }
  return ranges.join(", ") + ` · ${wh[active[0]].from}–${wh[active[0]].to}`;
}

/* ─── Toggle ─────────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} style={{ width: 36, height: 20, borderRadius: 99, padding: 2, background: on ? "var(--c-accent)" : "var(--c-bg-strong)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.2s", flexShrink: 0 }}>
      <motion.div animate={{ x: on ? 16 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

/* ─── Slide-Over Panel ───────────────────────────────────── */
function SlideOver({ member, onSave, onDelete, onClose }: {
  member: Member | null; // null = new
  onSave: (m: Member) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}) {
  const isNew = !member;
  const [draft, setDraft] = useState<Member>(member ?? {
    id: `m${Date.now()}`, name: "", role: "stylist", email: "", phone: "",
    color: "#10B981", serviceIds: [], workingHours: { ...DEFAULT_HOURS },
    hasAppAccess: false, notes: "", commissionRate: 30,
  });
  const [activeSection, setActiveSection] = useState<string>("stamm");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const upd = <K extends keyof Member>(k: K, v: Member[K]) => setDraft((p) => ({ ...p, [k]: v }));

  const SECTIONS = [
    { id: "stamm",   label: "Stammdaten" },
    { id: "zeiten",  label: "Arbeitszeiten" },
    { id: "services",label: "Services" },
    { id: "zugang",  label: "App-Zugang" },
    { id: "notizen", label: "Notizen" },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 100 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        style={{
          position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 101,
          width: "min(480px, 100vw)",
          background: "var(--c-bg-elevated)",
          borderLeft: "1px solid var(--c-border-strong)",
          display: "flex", flexDirection: "column",
          boxShadow: "-16px 0 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 0", borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: draft.color + "22", border: `2px solid ${draft.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={16} style={{ color: draft.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "var(--c-fg)" }}>{draft.name || "Neuer Mitarbeiter"}</div>
                <div style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>{ROLE_LABELS[draft.role]}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", padding: "6px 8px", color: "var(--c-fg-subtle)" }}>
              <X size={14} />
            </button>
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "transparent", color: activeSection === s.id ? "var(--c-fg)" : "var(--c-fg-subtle)", borderBottom: `2px solid ${activeSection === s.id ? "var(--c-accent)" : "transparent"}`, transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <AnimatePresence mode="wait">

            {/* ── Stammdaten ── */}
            {activeSection === "stamm" && (
              <motion.div key="stamm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Name */}
                <Field label="Name" value={draft.name} onChange={(v) => upd("name", v)} placeholder="Aynur Kaya" />
                {/* Role */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 6 }}>Rolle</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["owner", "stylist", "receptionist"] as Role[]).map((r) => (
                      <button key={r} onClick={() => upd("role", r)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1px solid ${draft.role === r ? "var(--c-accent)" : "var(--c-border-strong)"}`, background: draft.role === r ? "var(--c-accent-bg)" : "transparent", color: draft.role === r ? "var(--c-accent)" : "var(--c-fg-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="E-Mail" type="email" value={draft.email} onChange={(v) => upd("email", v)} placeholder="name@salon.de" icon={<Mail size={13} />} />
                <Field label="Telefon" type="tel" value={draft.phone} onChange={(v) => upd("phone", v)} placeholder="+49 172 …" icon={<Phone size={13} />} />
                {/* Kalender-Farbe */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 8 }}>Kalender-Farbe</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {CALENDAR_COLORS.map((c) => (
                      <button key={c.value} onClick={() => upd("color", c.value)} title={c.name} style={{ width: 28, height: 28, borderRadius: "50%", background: c.value, border: draft.color === c.value ? `3px solid var(--c-fg)` : "2px solid transparent", cursor: "pointer", transition: "border 0.15s", boxShadow: draft.color === c.value ? "0 0 0 2px var(--c-bg-elevated)" : "none" }} />
                    ))}
                  </div>
                </div>
                {/* Provision */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 6 }}>
                    Provision: <span style={{ color: "var(--c-accent)" }}>{draft.commissionRate} %</span>
                    <span style={{ fontWeight: 400, marginLeft: 6, color: "var(--c-fg-subtle)" }}>(0 % = Festgehalt)</span>
                  </label>
                  <input type="range" min={0} max={60} step={5} value={draft.commissionRate} onChange={(e) => upd("commissionRate", +e.target.value)} style={{ width: "100%", accentColor: "var(--c-accent)" }} />
                </div>
              </motion.div>
            )}

            {/* ── Arbeitszeiten ── */}
            {activeSection === "zeiten" && (
              <motion.div key="zeiten" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Quick templates */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Mo–Sa Vollzeit", fn: () => upd("workingHours", { ...DEFAULT_HOURS }) },
                    { label: "Mo–Fr", fn: () => upd("workingHours", { ...DEFAULT_HOURS, Sa: { ...DEFAULT_HOURS.Sa, active: false }, So: { ...DEFAULT_HOURS.So, active: false } }) },
                    { label: "Di–Sa", fn: () => upd("workingHours", { ...DEFAULT_HOURS, Mo: { ...DEFAULT_HOURS.Mo, active: false }, So: { ...DEFAULT_HOURS.So, active: false } }) },
                  ].map(({ label, fn }) => (
                    <button key={label} onClick={fn} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid var(--c-border-strong)", background: "transparent", color: "var(--c-fg-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {WEEKDAYS.map((day) => {
                  const wh = draft.workingHours[day];
                  return (
                    <div key={day} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--c-border)" }}>
                      <span style={{ width: 28, fontSize: 13, fontWeight: 700, color: wh.active ? "var(--c-fg)" : "var(--c-fg-subtle)" }}>{day}</span>
                      <Toggle on={wh.active} onChange={(v) => upd("workingHours", { ...draft.workingHours, [day]: { ...wh, active: v } })} />
                      {wh.active && (
                        <>
                          <input type="time" value={wh.from} onChange={(e) => upd("workingHours", { ...draft.workingHours, [day]: { ...wh, from: e.target.value } })} style={{ background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-strong)", borderRadius: 8, padding: "5px 8px", fontSize: 13, color: "var(--c-fg)", fontFamily: "inherit", outline: "none" }} />
                          <span style={{ color: "var(--c-fg-subtle)", fontSize: 12 }}>–</span>
                          <input type="time" value={wh.to} onChange={(e) => upd("workingHours", { ...draft.workingHours, [day]: { ...wh, to: e.target.value } })} style={{ background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-strong)", borderRadius: 8, padding: "5px 8px", fontSize: 13, color: "var(--c-fg)", fontFamily: "inherit", outline: "none" }} />
                        </>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* ── Services ── */}
            {activeSection === "services" && (
              <motion.div key="services" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginBottom: 16 }}>
                  Wähle welche Services {draft.name || "dieser Mitarbeiter"} anbietet.
                </p>
                {SERVICE_CATEGORIES.map((cat) => {
                  const catServices = SERVICE_CATALOG.filter((s) => s.categoryId === cat.id);
                  return (
                    <div key={cat.id} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--c-fg-subtle)", letterSpacing: "0.07em", marginBottom: 8 }}>
                        {cat.name.toUpperCase()}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {catServices.map((s) => {
                          const sel = draft.serviceIds.includes(s.id);
                          return (
                            <button key={s.id} onClick={() => upd("serviceIds", sel ? draft.serviceIds.filter((x) => x !== s.id) : [...draft.serviceIds, s.id])} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${sel ? "var(--c-accent)" : "var(--c-border-strong)"}`, background: sel ? "var(--c-accent-bg)" : "transparent", color: sel ? "var(--c-accent)" : "var(--c-fg-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s", fontFamily: "inherit" }}>
                              {sel && <Check size={10} />} {s.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* ── App-Zugang ── */}
            {activeSection === "zugang" && (
              <motion.div key="zugang" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px", background: "var(--c-bg-subtle)", borderRadius: 12, border: "1px solid var(--c-border)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Shield size={18} style={{ color: "var(--c-fg-subtle)", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--c-fg)", marginBottom: 3 }}>App-Zugang</div>
                      <div style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>
                        {draft.hasAppAccess
                          ? "Diese Person kann sich in die App einloggen und ihren eigenen Kalender sehen."
                          : "Kein Login — erscheint nur passiv im Kalender."}
                      </div>
                    </div>
                  </div>
                  <Toggle on={draft.hasAppAccess} onChange={(v) => upd("hasAppAccess", v)} />
                </div>
                {draft.hasAppAccess && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "14px 16px", background: "rgba(212,176,119,0.06)", borderRadius: 12, border: "1px solid rgba(212,176,119,0.2)", fontSize: 13, color: "var(--c-fg-muted)" }}>
                    Eine Einladungs-E-Mail wird an <strong style={{ color: "var(--c-accent)" }}>{draft.email || "die angegebene E-Mail"}</strong> geschickt, wenn du speicherst.
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Notizen ── */}
            {activeSection === "notizen" && (
              <motion.div key="notizen" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 8 }}>Interne Notizen (nur für Inhaber sichtbar)</label>
                <textarea
                  value={draft.notes} onChange={(e) => upd("notes", e.target.value)}
                  placeholder="z.B. Spezialist für Balayage, kann Türkisch…"
                  rows={8}
                  style={{ width: "100%", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-strong)", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--c-fg)", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--c-border)", display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          {!isNew && onDelete && (
            deleteConfirm ? (
              <div style={{ display: "flex", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 12, color: "var(--c-danger)", flex: 1, display: "flex", alignItems: "center" }}>Wirklich löschen?</span>
                <button onClick={() => onDelete(draft.id)} style={{ padding: "8px 14px", borderRadius: 9, background: "var(--c-danger)", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Ja, löschen</button>
                <button onClick={() => setDeleteConfirm(false)} style={{ padding: "8px 14px", borderRadius: 9, background: "transparent", color: "var(--c-fg-muted)", border: "1px solid var(--c-border-strong)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nein</button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirm(true)} style={{ padding: "9px 14px", borderRadius: 10, background: "transparent", border: "1px solid var(--c-border)", fontSize: 13, color: "var(--c-danger)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                <Trash2 size={13} /> Löschen
              </button>
            )
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 10, background: "transparent", border: "1px solid var(--c-border-strong)", fontSize: 13, fontWeight: 700, color: "var(--c-fg-muted)", cursor: "pointer", fontFamily: "inherit" }}>
            Abbrechen
          </button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onSave(draft)} style={{ padding: "9px 20px", borderRadius: 10, background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            <Check size={13} /> Speichern
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Field helper ───────────────────────────────────────── */
function Field({ label, type = "text", value, onChange, placeholder, icon }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--c-fg-subtle)" }}>{icon}</div>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-strong)", borderRadius: 10, padding: icon ? "10px 14px 10px 34px" : "10px 14px", fontSize: 14, color: "var(--c-fg)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

/* ─── Member Card ────────────────────────────────────────── */
function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const summary = workingHoursSummary(member.workingHours);
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "var(--c-shadow-md)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="card"
      style={{ padding: "20px", cursor: "pointer", position: "relative" }}
    >
      {/* Color bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "14px 14px 0 0", background: member.color }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: member.color + "22", border: `2px solid ${member.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: member.color }}>
            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--c-fg)", marginBottom: 2 }}>{member.name}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "var(--c-bg-strong)", color: "var(--c-fg-subtle)" }}>
              {ROLE_LABELS[member.role]}
            </span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: "var(--c-fg-subtle)" }} />
      </div>

      {/* Working hours */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12, color: "var(--c-fg-subtle)" }}>
        <Clock size={12} />
        <span>{summary}</span>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: "10px 12px", background: "var(--c-bg-subtle)", borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginBottom: 3 }}>Services</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{member.serviceIds.length}</div>
        </div>
        <div style={{ padding: "10px 12px", background: "var(--c-bg-subtle)", borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginBottom: 3 }}>
            {member.commissionRate > 0 ? "Provision" : "Gehalt"}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>
            {member.commissionRate > 0 ? `${member.commissionRate} %` : "fix"}
          </div>
        </div>
      </div>

      {/* App access badge */}
      {member.hasAppAccess && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--c-success)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-success)" }} />
          App-Zugang aktiv
        </div>
      )}
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function MitarbeiterPage() {
  const [members, setMembers]   = useState<Member[]>(INITIAL_MEMBERS);
  const [editing, setEditing]   = useState<Member | null | "new">(null);

  const save = (m: Member) => {
    setMembers((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      return idx >= 0 ? prev.map((x) => x.id === m.id ? m : x) : [...prev, m];
    });
    setEditing(null);
  };

  const del = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setEditing(null);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.4, marginBottom: 2 }}>Team</h1>
          <p style={{ fontSize: 13, color: "var(--c-fg-subtle)" }}>{members.length} Mitarbeiter · {members.filter((m) => m.hasAppAccess).length} mit App-Zugang</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setEditing("new")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={14} /> Mitarbeiter hinzufügen
        </motion.button>
      </motion.div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {members.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: EASE }}>
            <MemberCard member={m} onClick={() => setEditing(m)} />
          </motion.div>
        ))}

        {/* Add placeholder */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: members.length * 0.08 }}
          whileHover={{ y: -2 }}
          onClick={() => setEditing("new")}
          style={{ padding: 20, borderRadius: 14, border: "2px dashed var(--c-border-strong)", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 180, color: "var(--c-fg-subtle)", fontFamily: "inherit", transition: "border-color 0.15s" }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--c-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={20} style={{ color: "var(--c-fg-subtle)" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Mitarbeiter hinzufügen</span>
        </motion.button>
      </div>

      {/* Arbeitszeiten (steuern die Online-Buchung) */}
      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-fg)", marginBottom: 4 }}>Arbeitszeiten</h2>
        <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginBottom: 16 }}>Legt fest, wann online Termine buchbar sind.</p>
        <WorkHoursEditor />
      </div>

      {/* Slide-Over */}
      <AnimatePresence>
        {editing !== null && (
          <SlideOver
            member={editing === "new" ? null : editing}
            onSave={save}
            onDelete={editing !== "new" ? del : undefined}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>

      <style>{`input::placeholder { color: var(--c-fg-faint); }`}</style>
    </div>
  );
}
