"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Check, ExternalLink, QrCode } from "lucide-react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function BookingLinkCard() {
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me/salon");
        if (r.ok) setSlug((await r.json()).slug);
      } catch { /* ignore */ }
    })();
  }, []);

  if (!slug) return null;

  const url = typeof window !== "undefined" ? `${window.location.origin}/buchen/${slug}` : `/buchen/${slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`;

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  return (
    <div style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 18, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link2 size={17} color="var(--c-accent)" />
        </div>
        <div>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: "var(--c-fg)" }}>Dein Buchungslink</h3>
          <p style={{ fontSize: 12, color: "var(--c-fg-muted)", margin: "1px 0 0" }}>Teile ihn mit Kunden oder häng den QR-Code im Salon auf.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, padding: "9px 12px", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", borderRadius: 9, fontSize: 13, color: "var(--c-fg-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {url}
        </div>
        <button onClick={copy} style={btn(copied)}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Kopiert" : "Kopieren"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ ...btn(false), textDecoration: "none" }}>
          <ExternalLink size={15} /> Öffnen
        </a>
        <button onClick={() => setShowQr((v) => !v)} style={btn(false)}>
          <QrCode size={15} /> QR-Code
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showQr && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ ease: EASE, duration: 0.3 }} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 16 }}>
              <div style={{ background: "#fff", padding: 10, borderRadius: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR-Code zum Buchungslink" width={200} height={200} style={{ display: "block" }} />
              </div>
              <a href={qrSrc} download={`buchungslink-${slug}.png`} style={{ fontSize: 12.5, color: "var(--c-accent)", textDecoration: "none", fontWeight: 600 }}>
                QR-Code herunterladen
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function btn(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 13px",
    background: active ? "rgba(212,176,119,0.14)" : "var(--c-bg-subtle)",
    border: `1px solid ${active ? "var(--c-accent)" : "var(--c-border)"}`,
    borderRadius: 9, color: active ? "var(--c-accent)" : "var(--c-fg)",
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  };
}
