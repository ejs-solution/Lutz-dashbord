"use client";

import { Crown, Lock } from "lucide-react";

// Legt sich über gesperrte Features: Inhalt bleibt als Vorschau sichtbar (geblurrt),
// darüber der Hinweis mit Upgrade-CTA. Gesperrt = Feature nicht im Plan enthalten.
export default function UpgradeGate({
  locked,
  feature,
  description,
  children,
}: {
  locked: boolean;
  feature: string;
  description: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div style={{ position: "relative", minHeight: 420, overflow: "hidden" }}>
      <div style={{ filter: "blur(6px)", opacity: 0.45, pointerEvents: "none", userSelect: "none" }} aria-hidden>
        {children}
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 380, width: "100%", textAlign: "center", background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)", borderRadius: 18, padding: "30px 26px", boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, margin: "0 auto 14px", background: "rgba(212,176,119,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={20} style={{ color: "var(--c-accent)" }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)", marginBottom: 6 }}>{feature} ist im Pro-Plan enthalten</div>
          <p style={{ fontSize: 13, color: "var(--c-fg-muted)", lineHeight: 1.55, margin: "0 0 18px" }}>{description}</p>
          <a
            href={`mailto:ejs-solution@outlook.de?subject=${encodeURIComponent(`[CUTZ] Plan-Upgrade: ${feature}`)}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, background: "var(--c-accent)", color: "var(--c-accent-fg)", fontSize: 13, fontWeight: 800, textDecoration: "none" }}
          >
            <Crown size={14} /> Jetzt Plan upgraden
          </a>
        </div>
      </div>
    </div>
  );
}
