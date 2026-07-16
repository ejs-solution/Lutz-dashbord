"use client";

import { useEffect, useState } from "react";
import { Plane, Trash2, Loader2, Check } from "lucide-react";
import WorkHoursEditor from "@/components/dashboard/WorkHoursEditor";

const EMPLOYEES = ["Aynur", "Monika", "Lisa"];
type Absence = { id: string; employee: string; from_date: string; to_date: string; note: string | null };
const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });

export default function ShiftsPanel() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [emp, setEmp] = useState("Aynur");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try { const r = await fetch("/api/absences"); if (r.ok) setAbsences((await r.json()).absences); } catch { /* ignore */ }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!from || !to) return;
    setSaving(true);
    try {
      const r = await fetch("/api/absences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employee: emp, from, to, note }) });
      if (r.ok) { setShowForm(false); setFrom(""); setTo(""); setNote(""); load(); }
    } finally { setSaving(false); }
  }
  async function del(id: string) { await fetch(`/api/absences?id=${id}`, { method: "DELETE" }); load(); }

  return (
    <div style={{ display: "grid", gap: 26, maxWidth: 660 }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)", margin: "0 0 12px" }}>Arbeitszeiten</h3>
        <WorkHoursEditor />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)", margin: 0 }}>Urlaub &amp; Abwesenheit</h3>
          <button onClick={() => setShowForm(v => !v)} style={goldBtn}><Plane size={14} /> Urlaub beantragen</button>
        </div>

        {showForm && (
          <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 16, marginBottom: 12, display: "grid", gap: 11 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              <label><span style={lbl}>Mitarbeiter:in</span><select value={emp} onChange={e => setEmp(e.target.value)} style={inp}>{EMPLOYEES.map(e => <option key={e} value={e}>{e}</option>)}</select></label>
              <label><span style={lbl}>Grund (optional)</span><input value={note} onChange={e => setNote(e.target.value)} style={inp} placeholder="Urlaub" /></label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              <label><span style={lbl}>Von</span><input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} /></label>
              <label><span style={lbl}>Bis</span><input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} /></label>
            </div>
            <button disabled={!from || !to || saving} onClick={save} style={{ ...goldBtn, justifyContent: "center", padding: "11px", opacity: (!from || !to || saving) ? 0.6 : 1 }}>{saving ? <Loader2 size={15} className="spin" /> : <Check size={15} />} Eintragen</button>
          </div>
        )}

        {absences.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--c-fg-muted)", padding: "12px 0" }}>Keine geplanten Abwesenheiten. Urlaub blockt automatisch die Online-Verfügbarkeit.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {absences.map(ab => (
              <div key={ab.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12 }}>
                <Plane size={16} style={{ color: "var(--c-accent)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-fg)" }}>{ab.employee}{ab.note ? ` · ${ab.note}` : ""}</div>
                  <div style={{ fontSize: 12.5, color: "var(--c-fg-muted)" }}>{fmt(ab.from_date)} – {fmt(ab.to_date)}</div>
                </div>
                <button onClick={() => del(ab.id)} title="Löschen" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-fg-muted)", padding: 4 }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}} input:focus,select:focus{outline:none;border-color:var(--c-accent)}`}</style>
    </div>
  );
}
const goldBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", color: "#2a1f12", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", borderRadius: 9, color: "var(--c-fg)", fontSize: 14, fontFamily: "inherit" };
const lbl: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: "var(--c-fg-muted)", display: "block", marginBottom: 4 };
