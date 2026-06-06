"use client";

import { motion } from "framer-motion";
import { FileText, Download, Clock } from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function ReportsPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px" }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: EASE }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.5, marginBottom: 4 }}>
          Reports
        </h1>
        <p style={{ fontSize: 14, color: "var(--c-fg-subtle)" }}>
          Automatische Monats- und Wochenberichte
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: EASE }}
        className="card"
        style={{ padding: 48, textAlign: "center" }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
          <FileText size={36} style={{ color: "var(--c-accent)" }} />
          <Download size={36} style={{ color: "var(--c-fg-subtle)" }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--c-fg)", marginBottom: 8 }}>
          Bald verfügbar
        </h2>
        <p style={{ fontSize: 14, color: "var(--c-fg-subtle)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          Wöchentliche und monatliche PDF-Reports mit Umsatz, Terminauslastung,
          Top-Kunden und Servicezusammenfassungen — automatisch generiert von Paul.
        </p>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--c-fg-subtle)", padding: "6px 12px", borderRadius: 99, border: "1px solid var(--c-border)" }}>
            <Clock size={12} /> In Entwicklung
          </span>
        </div>
      </motion.div>
    </div>
  );
}
