"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Plus, X, Check, Trash2, RefreshCw, Percent, CalendarDays } from "lucide-react";
import {
  type Voucher,
  subscribeVouchers, getVouchersSnapshot, getServerVouchersSnapshot, setVouchers,
} from "@/lib/vouchers";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Toggle ─────────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-label={on ? "Deaktivieren" : "Aktivieren"}
      style={{
        width: 36, height: 20, borderRadius: 999, border: "none", cursor: "pointer",
        background: on ? "var(--c-accent)" : "var(--c-bg-strong)",
        position: "relative", transition: "background 0.15s", flexShrink: 0, padding: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

/* ─── Neuer-Gutschein-Modal ──────────────────────────────── */
function NewVoucherModal({ existing, onClose }: { existing: Voucher[]; onClose: () => void }) {
  const [code, setCode]         = useState("");
  const [percent, setPercent]   = useState(10);
  const [validDays, setValidDays] = useState(30);
  const [error, setError]       = useState("");

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
    background: "var(--c-bg)", border: "1px solid var(--c-border)",
    color: "var(--c-fg)", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", display: "block",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6,
  };

  function save() {
    const clean = code.trim().toUpperCase().replace(/\s+/g, "-");
    if (!clean) { setError("Bitte einen Code eingeben."); return; }
    if (existing.some(v => v.code === clean)) { setError("Diesen Code gibt es schon."); return; }
    if (percent < 1 || percent > 100) { setError("Rabatt muss zwischen 1 und 100 % liegen."); return; }
    const voucher: Voucher = {
      id: `v-${Date.now()}`,
      code: clean,
      percent,
      validDays: Math.max(1, validDays),
      active: true,
      winback: existing.length === 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setVouchers([...existing, voucher]);
    onClose();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 500 }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={{
          position: "fixed", zIndex: 501,
          top: "50%", left: "50%", x: "-50%", y: "-50%",
          width: "min(420px, calc(100vw - 32px))",
          background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
          borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ height: 3, background: "var(--c-accent)" }} />
        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--c-fg)" }}>Neuer Gutschein</div>
            <button onClick={onClose} aria-label="Schließen" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={16} style={{ color: "var(--c-fg-muted)" }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Code</label>
              <input
                style={{ ...inp, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}
                placeholder="z.B. SOMMER15"
                value={code}
                onChange={e => { setCode(e.target.value); setError(""); }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Rabatt (%)</label>
                <input
                  type="number" min={1} max={100} style={inp} value={percent}
                  onChange={e => { setPercent(Number(e.target.value)); setError(""); }}
                />
              </div>
              <div>
                <label style={lbl}>Gültig (Tage)</label>
                <input
                  type="number" min={1} max={365} style={inp} value={validDays}
                  onChange={e => setValidDays(Number(e.target.value))}
                />
              </div>
            </div>
            {error && (
              <div style={{ fontSize: 12, color: "var(--c-danger)", background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: "8px 12px" }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={save}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13,
                background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit",
              }}
            >
              <Check size={14} /> Gutschein anlegen
            </button>
            <button
              onClick={onClose}
              style={{ padding: "10px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, background: "transparent", color: "var(--c-fg-muted)", border: "1px solid var(--c-border)", cursor: "pointer", fontFamily: "inherit" }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Seite ──────────────────────────────────────────────── */
export default function GutscheinePage() {
  const vouchers = useSyncExternalStore(subscribeVouchers, getVouchersSnapshot, getServerVouchersSnapshot);
  const [showNew, setShowNew] = useState(false);

  function update(id: string, patch: Partial<Voucher>) {
    setVouchers(vouchers.map(v => (v.id === id ? { ...v, ...patch } : v)));
  }

  function setWinback(id: string) {
    setVouchers(vouchers.map(v => ({ ...v, winback: v.id === id })));
  }

  function remove(id: string) {
    setVouchers(vouchers.filter(v => v.id !== id));
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ticket size={16} style={{ color: "var(--c-accent)" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.4, flex: 1 }}>Gutscheine</h1>
          <button
            onClick={() => setShowNew(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
              background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none",
              fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Plus size={15} /> Neuer Gutschein
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginLeft: 42 }}>
          Lege eigene Rabatt-Codes an und entscheide selbst, welcher in Win-Back-Kampagnen verschickt wird.
        </p>
      </motion.div>

      {/* Liste */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ease: EASE }}
        style={{ display: "flex", flexDirection: "column", gap: 2, background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}
      >
        {vouchers.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center", fontSize: 13, color: "var(--c-fg-subtle)" }}>
            Noch keine Gutscheine — leg den ersten an.
          </div>
        ) : (
          vouchers.map((v, idx) => (
            <div
              key={v.id}
              style={{
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                padding: "14px 18px",
                borderBottom: idx === vouchers.length - 1 ? "none" : "1px solid var(--c-border)",
                opacity: v.active ? 1 : 0.55,
              }}
            >
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-fg)", letterSpacing: 0.5 }}>{v.code}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "var(--c-accent-bg)", color: "var(--c-accent)" }}>
                    <Percent size={10} /> {v.percent}
                  </span>
                  {v.winback && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "var(--c-success)" }}>
                      <RefreshCw size={9} /> Win-Back
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--c-fg-subtle)", marginTop: 3 }}>
                  <CalendarDays size={11} /> {v.validDays} Tage gültig · angelegt {v.createdAt}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!v.winback && v.active && (
                  <button
                    onClick={() => setWinback(v.id)}
                    title="Diesen Code in Win-Back-Kampagnen verwenden"
                    style={{ fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-fg-muted)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Für Win-Back nutzen
                  </button>
                )}
                <Toggle on={v.active} onChange={on => update(v.id, { active: on, winback: on ? v.winback : false })} />
                <button
                  onClick={() => remove(v.id)}
                  aria-label="Gutschein löschen"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--c-fg-subtle)" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ fontSize: 12, color: "var(--c-fg-subtle)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}
      >
        Der mit <span style={{ color: "var(--c-success)", fontWeight: 700 }}>Win-Back</span> markierte Code wird automatisch
        in den Rückgewinnungs-Nachrichten verwendet.
      </motion.p>

      <AnimatePresence>
        {showNew && <NewVoucherModal existing={vouchers} onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  );
}
