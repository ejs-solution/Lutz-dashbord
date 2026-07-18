"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, X } from "lucide-react";

type Booking = { id: string; customer_name: string; service: string; date: string; start_time: string; created_at: string };
type Toast = { id: string; name: string; service: string; when: string };

const POLL_MS = 25000;

function fmtDay(d: string) {
  try { return new Date(d + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "short" }); }
  catch { return d; }
}

// Kurzes „Schnipp-Schnipp" per Web Audio — zwei gefilterte Rausch-Impulse, keine Audio-Datei nötig.
// Browser erlauben Sound erst nach der ersten Nutzer-Interaktion; davor bleibt es einfach still.
let audioCtx: AudioContext | null = null;
function playScissorSnip() {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const snip = (at: number, freq: number) => {
      const dur = 0.07;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq;
      bp.Q.value = 1.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
      src.connect(bp).connect(gain).connect(ctx.destination);
      src.start(at);
    };
    const t = ctx.currentTime + 0.01;
    snip(t, 4200);
    snip(t + 0.13, 5200);
  } catch { /* Sound ist optional */ }
}

// Zeigt oben rechts einen animierten Toast, wenn eine neue Online-Buchung eingeht.
export default function NotificationToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const r = await fetch("/api/me/new-bookings");
        if (!r.ok || !active) return;
        const { bookings } = (await r.json()) as { bookings: Booking[] };

        if (seen.current === null) {
          // Erste Runde: Bestehendes als gesehen markieren (nicht nachträglich toasten).
          seen.current = new Set(bookings.map((b) => b.id));
          return;
        }
        const fresh = bookings.filter((b) => !seen.current!.has(b.id));
        if (!fresh.length) return;
        fresh.forEach((b) => seen.current!.add(b.id));
        playScissorSnip();

        setToasts((prev) => [
          ...fresh.reverse().map((b) => ({
            id: b.id,
            name: b.customer_name,
            service: b.service,
            when: `${fmtDay(b.date)} · ${(b.start_time ?? "").slice(0, 5)} Uhr`,
          })),
          ...prev,
        ].slice(0, 3));
      } catch { /* still */ }
    }

    poll();
    const iv = setInterval(poll, POLL_MS);
    return () => { active = false; clearInterval(iv); };
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 9000));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 800, display: "flex", flexDirection: "column", gap: 10, maxWidth: "calc(100vw - 32px)", pointerEvents: "none" }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              width: 340, maxWidth: "100%", pointerEvents: "auto",
              background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
              borderLeft: "4px solid var(--c-accent)", borderRadius: 13,
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)", padding: "13px 14px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: "rgba(212,176,119,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarCheck size={17} style={{ color: "var(--c-accent)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--c-accent)" }}>Neue Online-Buchung</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name} · {t.service}</div>
              <div style={{ fontSize: 11.5, color: "var(--c-fg-muted)", marginTop: 1 }}>{t.when}</div>
            </div>
            <button onClick={() => dismiss(t.id)} aria-label="Schließen" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0, display: "flex" }}>
              <X size={15} style={{ color: "var(--c-fg-subtle)" }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
