"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Lock } from "lucide-react";
import {
  hasFeature,
  requiredPlan,
  PLAN_LABEL,
  type Feature,
} from "@/lib/plan-features";

/**
 * Sperrt Inhalte hinter dem Abo-Modell.
 * Ist das Feature im Plan enthalten -> children.
 * Sonst -> "Upgrade nötig"-Hinweis (Feature wird nicht versteckt, sondern erklärt).
 *
 * Beispiel:
 *   <FeatureGate feature="analytics"><AnalyticsCharts /></FeatureGate>
 */
export default function FeatureGate({
  feature,
  children,
}: {
  feature: Feature;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const plan = (session?.user as { plan?: string } | undefined)?.plan;

  if (hasFeature(plan, feature)) return <>{children}</>;

  const needed = requiredPlan(feature);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.25, 0.46, 0.45, 0.94], duration: 0.3 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        textAlign: "center",
        padding: "40px 24px",
        borderRadius: 14,
        border: "1px solid var(--c-border)",
        background: "var(--c-bg-elevated)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--c-accent-bg)",
        }}
      >
        <Lock size={20} color="var(--c-accent)" />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-fg)" }}>
        Upgrade nötig
      </div>
      <div style={{ fontSize: 13, color: "var(--c-fg-subtle)", maxWidth: 280 }}>
        Dieses Feature ist ab dem Plan{" "}
        <strong style={{ color: "var(--c-accent)" }}>{PLAN_LABEL[needed]}</strong>{" "}
        verfügbar.
      </div>
    </motion.div>
  );
}
