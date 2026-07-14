"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";

const EMPLOYEES = ["Aynur", "Monika", "Lisa"];
const WEEKDAYS: { wd: number; label: string }[] = [
  { wd: 1, label: "Mo" }, { wd: 2, label: "Di" }, { wd: 3, label: "Mi" },
  { wd: 4, label: "Do" }, { wd: 5, label: "Fr" }, { wd: 6, label: "Sa" }, { wd: 0, label: "So" },
];

type Entry = { start: string; end: string };
type Hours = Record<string, Record<number, Entry>>; // employee -> weekday -> {start,end}

export default function WorkHoursEditor() {
  const [hours, setHours] = useState<Hours>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/work-hours");
        const j = await r.json();
        const map: Hours = {};
        for (const h of j.hours ?? []) {
          (map[h.employee] ??= {})[h.weekday] = { start: h.start, end: h.end };
        }
        setHours(map);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  async function setDay(employee: string, wd: number, entry: Entry | null) {
    const key = `${employee}-${wd}`;
    setSavingKey(key);
    setHours((prev) => {
      const next = { ...prev, [employee]: { ...(prev[employee] ?? {}) } };
      if (entry) next[employee][wd] = entry; else delete next[employee][wd];
      return next;
    });
    try {
      if (entry) {
        await fetch("/api/work-hours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employee, weekday: wd, start: entry.start, end: entry.end }) });
      } else {
        await fetch(`/api/work-hours?employee=${encodeURIComponent(employee)}&weekday=${wd}`, { method: "DELETE" });
      }
    } catch { /* ignore */ }
    finally { setSavingKey(null); }
  }

  if (loading) return <div style={{ padding: 30, textAlign: "center" }}><Loader2 size={22} className="spin" style={{ color: "var(--c-accent)" }} /><style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={16} style={{ color: "var(--c-accent)" }} />
        <span style={{ fontSize: 13, color: "var(--c-fg-muted)" }}>Diese Arbeitszeiten steuern, welche Slots online buchbar sind.</span>
      </div>

      {EMPLOYEES.map((emp) => (
        <div key={emp} style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{emp}</div>
          <div style={{ display: "grid", gap: 7 }}>
            {WEEKDAYS.map(({ wd, label }) => {
              const entry = hours[emp]?.[wd];
              const on = !!entry;
              const key = `${emp}-${wd}`;
              return (
                <div key={wd} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setDay(emp, wd, on ? null : { start: "09:00", end: "18:00" })}
                    style={{
                      width: 42, height: 26, borderRadius: 8, flexShrink: 0, cursor: "pointer",
                      border: `1px solid ${on ? "var(--c-accent)" : "var(--c-border)"}`,
                      background: on ? "rgba(212,176,119,0.14)" : "var(--c-bg-subtle)",
                      color: on ? "var(--c-accent)" : "var(--c-fg-muted)", fontSize: 12, fontWeight: 800,
                    }}
                  >{label}</button>

                  {on ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <input type="time" value={entry.start} onChange={(e) => setDay(emp, wd, { ...entry, start: e.target.value })} style={timeInput} />
                      <span style={{ color: "var(--c-fg-muted)", fontSize: 13 }}>–</span>
                      <input type="time" value={entry.end} onChange={(e) => setDay(emp, wd, { ...entry, end: e.target.value })} style={timeInput} />
                      {savingKey === key && <Loader2 size={13} className="spin" style={{ color: "var(--c-fg-muted)" }} />}
                    </div>
                  ) : (
                    <span style={{ flex: 1, fontSize: 13, color: "var(--c-fg-faint)" }}>frei</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}} input[type=time]:focus{outline:none;border-color:var(--c-accent)}`}</style>
    </div>
  );
}

const timeInput: React.CSSProperties = {
  padding: "6px 9px", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)",
  borderRadius: 8, color: "var(--c-fg)", fontSize: 13, fontFamily: "inherit",
};
