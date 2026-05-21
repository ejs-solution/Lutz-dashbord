"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Scissors, MessageSquare,
  X, CreditCard, CheckCircle,
} from "lucide-react";
import { todayAppointments, type Appointment } from "@/lib/mock-data";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08–18
const EMPLOYEES = ["Aynur", "Monika", "Lisa"] as const;
const EMPLOYEE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Aynur:  { bg: "rgba(245,158,11,0.14)",  border: "#f59e0b", text: "#f59e0b" },
  Monika: { bg: "rgba(16,185,129,0.14)",  border: "#10b981", text: "#10b981" },
  Lisa:   { bg: "rgba(96,165,250,0.14)",  border: "#60a5fa", text: "#60a5fa" },
};

type View = "day" | "week";

function apptTop(startTime: string): number {
  const [h, m] = startTime.split(":").map(Number);
  return (h - 8) * 60 + m; // 60px per hour
}
function apptHeight(duration: number): number {
  return Math.max(duration - 4, 24);
}

export default function KalenderPage() {
  const [view, setView] = useState<View>("day");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [activeEmployee, setActiveEmployee] = useState<string | null>(null);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const filtered = activeEmployee
    ? todayAppointments.filter((a) => a.employee === activeEmployee)
    : todayAppointments;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: -0.4, marginBottom: 2 }}>
              Kalender
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{dateLabel}</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
              {(["day", "week"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: "none", cursor: "pointer",
                    background: view === v ? "var(--accent)" : "transparent",
                    color: view === v ? "#0a0a18" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {v === "day" ? "Tag" : "Woche"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 4 }}>
              <button className="btn-ghost" style={{ padding: "7px 10px" }}><ChevronLeft size={16} /></button>
              <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "var(--accent)", borderColor: "rgba(245,158,11,0.3)" }}>Heute</button>
              <button className="btn-ghost" style={{ padding: "7px 10px" }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Employee filter chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>Mitarbeiter:</span>
          <button
            onClick={() => setActiveEmployee(null)}
            style={{
              padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              border: "1px solid var(--border)", cursor: "pointer",
              background: !activeEmployee ? "var(--text)" : "transparent",
              color: !activeEmployee ? "var(--bg)" : "var(--text-sub)",
              transition: "all 0.15s",
            }}
          >
            Alle
          </button>
          {EMPLOYEES.map((emp) => {
            const c = EMPLOYEE_COLORS[emp];
            const isActive = activeEmployee === emp;
            return (
              <button
                key={emp}
                onClick={() => setActiveEmployee(isActive ? null : emp)}
                style={{
                  padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                  border: `1px solid ${isActive ? c.border : "var(--border)"}`,
                  cursor: "pointer",
                  background: isActive ? c.bg : "transparent",
                  color: isActive ? c.text : "var(--text-sub)",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.border, display: "inline-block" }} />
                {emp}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Calendar Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ease: EASE }}
        className="card"
        style={{ overflow: "hidden" }}
      >
        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: view === "day"
            ? `60px repeat(${EMPLOYEES.length}, 1fr)`
            : `60px repeat(7, 1fr)`,
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}>
          <div />
          {view === "day"
            ? EMPLOYEES.map((emp) => {
                const c = EMPLOYEE_COLORS[emp];
                const count = filtered.filter((a) => a.employee === emp).length;
                return (
                  <div key={emp} style={{ padding: "12px 8px", borderLeft: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.border, display: "inline-block" }} />
                      <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{emp}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{count} Termine</div>
                  </div>
                );
              })
            : ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d, i) => (
                <div key={d} style={{ padding: "12px 8px", borderLeft: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: i === 0 ? "var(--accent)" : "var(--text)" }}>{d}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{19 + i}. Mai</div>
                </div>
              ))
          }
        </div>

        {/* Scrollable time body */}
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 360px)", minHeight: 300 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: view === "day"
              ? `60px repeat(${EMPLOYEES.length}, 1fr)`
              : `60px repeat(7, 1fr)`,
          }}>
            {/* Time column */}
            <div>
              {HOURS.map((h) => (
                <div key={h} style={{ height: 60, borderBottom: "1px solid var(--border)", padding: "4px 8px 0", display: "flex", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{h}:00</span>
                </div>
              ))}
            </div>

            {/* Employee columns (day view) */}
            {view === "day"
              ? EMPLOYEES.map((emp) => {
                  const c = EMPLOYEE_COLORS[emp];
                  const empAppts = filtered.filter((a) => a.employee === emp);
                  return (
                    <div key={emp} style={{ borderLeft: "1px solid var(--border)", position: "relative" }}>
                      {HOURS.map((h) => (
                        <div key={h} style={{ height: 60, borderBottom: "1px solid var(--border)" }} />
                      ))}
                      {empAppts.map((appt) => (
                        <motion.div
                          key={appt.id}
                          style={{
                            position: "absolute",
                            top: apptTop(appt.startTime),
                            height: apptHeight(appt.duration),
                            left: 4, right: 4,
                            background: c.bg,
                            borderLeft: `3px solid ${c.border}`,
                            color: c.text,
                            borderRadius: 8,
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 11, fontWeight: 700,
                            overflow: "hidden",
                          }}
                          whileHover={{ opacity: 0.82, scale: 1.01 }}
                          onClick={() => setSelectedAppt(appt)}
                          initial={{ opacity: 0, scaleY: 0.85 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ ease: EASE, duration: 0.3 }}
                        >
                          <div>{appt.startTime} · {appt.customerName}</div>
                          <div style={{ opacity: 0.75, fontSize: 10, marginTop: 1 }}>{appt.service}</div>
                          {appt.depositPaid && <div style={{ opacity: 0.65, fontSize: 9 }}>Anzahlung ✓</div>}
                        </motion.div>
                      ))}
                    </div>
                  );
                })
              : Array.from({ length: 7 }, (_, dayIdx) => (
                  <div key={dayIdx} style={{ borderLeft: "1px solid var(--border)", position: "relative" }}>
                    {HOURS.map((h) => (
                      <div key={h} style={{ height: 60, borderBottom: "1px solid var(--border)" }} />
                    ))}
                    {dayIdx === 0 && filtered.map((appt) => {
                      const c = EMPLOYEE_COLORS[appt.employee];
                      return (
                        <motion.div
                          key={appt.id}
                          style={{
                            position: "absolute",
                            top: apptTop(appt.startTime),
                            height: apptHeight(appt.duration),
                            left: 3, right: 3,
                            background: c.bg,
                            borderLeft: `3px solid ${c.border}`,
                            color: c.text,
                            borderRadius: 7,
                            padding: "3px 6px",
                            cursor: "pointer",
                            fontSize: 10, fontWeight: 700, overflow: "hidden",
                          }}
                          whileHover={{ opacity: 0.82 }}
                          onClick={() => setSelectedAppt(appt)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ ease: EASE }}
                        >
                          {appt.startTime} {appt.customerName.split(" ")[0]}
                        </motion.div>
                      );
                    })}
                  </div>
                ))
            }
          </div>
        </div>
      </motion.div>

      {/* ── Appointment Modal ── */}
      <AnimatePresence>
        {selectedAppt && (
          <>
            <motion.div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 100 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedAppt(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              style={{
                position: "fixed", zIndex: 101,
                top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: "min(460px, calc(100vw - 32px))",
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div style={{ height: 4, background: EMPLOYEE_COLORS[selectedAppt.employee].border }} />
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="avatar" style={{ width: 46, height: 46, fontSize: 15 }}>{selectedAppt.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18, color: "var(--text)" }}>{selectedAppt.customerName}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {selectedAppt.langFlag} {selectedAppt.language}
                        {selectedAppt.isVIP && <span className="badge badge-gold" style={{ marginLeft: 6, fontSize: 10 }}>VIP</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAppt(null)} className="btn-ghost" style={{ padding: "5px 9px", borderRadius: 8 }}>
                    <X size={16} />
                  </button>
                </div>

                {/* Services */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                  {(selectedAppt.services ?? [selectedAppt.service]).map((s) => (
                    <span key={s} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: EMPLOYEE_COLORS[selectedAppt.employee].bg,
                      color: EMPLOYEE_COLORS[selectedAppt.employee].text,
                      border: `1px solid ${EMPLOYEE_COLORS[selectedAppt.employee].border}40`,
                    }}>
                      <Scissors size={11} /> {s}
                    </span>
                  ))}
                </div>

                {[
                  { label: "Uhrzeit",     value: `${selectedAppt.startTime} Uhr · ${selectedAppt.duration} Min.` },
                  { label: "Mitarbeiter", value: selectedAppt.employee },
                  { label: "Gesamtpreis", value: `€ ${selectedAppt.totalAmount}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{value}</span>
                  </div>
                ))}

                <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: selectedAppt.depositPaid ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${selectedAppt.depositPaid ? "var(--green-border)" : "var(--border)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CreditCard size={16} style={{ color: selectedAppt.depositPaid ? "var(--green)" : "var(--text-muted)" }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: selectedAppt.depositPaid ? "var(--green)" : "var(--text)" }}>
                      Stripe Anzahlung (20%)
                    </span>
                    {selectedAppt.depositPaid && <CheckCircle size={14} style={{ color: "var(--green)" }} />}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, color: selectedAppt.depositPaid ? "var(--green)" : "var(--text-muted)" }}>
                    {selectedAppt.depositPaid
                      ? `€ ${selectedAppt.depositAmount} bezahlt — Termin gesichert`
                      : "Noch nicht bezahlt · Paul kann Erinnerung senden"
                    }
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                  <button className="btn-gold" style={{ flex: 1 }}>
                    <MessageSquare size={14} /> WhatsApp senden
                  </button>
                  <button className="btn-ghost" onClick={() => setSelectedAppt(null)} style={{ flex: 1 }}>
                    Schließen
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
