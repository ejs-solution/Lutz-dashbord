// ============================================================================
// Feature-Matrix pro Abo-Modell (Starter / Pro / Enterprise)
// ----------------------------------------------------------------------------
// Zentrale Wahrheit, welches Feature in welchem Plan enthalten ist.
// Nutzung: hasFeature(session.user.plan, "analytics") bzw. <FeatureGate feature="analytics">.
// Gesperrte Features werden NICHT versteckt, sondern zeigen "Upgrade nötig".
// ============================================================================

export type Plan = "starter" | "pro" | "enterprise";

export type Feature =
  | "dashboard"
  | "kalender"
  | "termine"
  | "services"
  | "crm"
  | "team"
  | "einstellungen"
  | "integrationen"
  | "whatsapp_bot"
  | "analytics"
  | "reports"
  | "winback"
  | "waitlist"
  | "instagram_bot"
  | "voice_bot"
  | "multi_standort"
  | "api_zugriff";

// Reihenfolge = Rangfolge. Ein Plan enthält alle Features seiner Stufe + darunter.
const PLAN_RANK: Record<Plan, number> = { starter: 0, pro: 1, enterprise: 2 };

// Ab welchem Plan ist ein Feature freigeschaltet?
const FEATURE_MIN_PLAN: Record<Feature, Plan> = {
  // Starter (Basis)
  dashboard: "starter",
  kalender: "starter",
  termine: "starter",
  services: "starter",
  crm: "starter",
  einstellungen: "starter",
  integrationen: "starter",
  whatsapp_bot: "starter",
  // Pro
  team: "pro",
  analytics: "pro",
  reports: "pro",
  winback: "pro",
  waitlist: "pro",
  instagram_bot: "pro",
  // Enterprise
  voice_bot: "enterprise",
  multi_standort: "enterprise",
  api_zugriff: "enterprise",
};

/** Ist das Feature im gegebenen Plan enthalten? */
export function hasFeature(plan: Plan | string | undefined | null, feature: Feature): boolean {
  const p = (plan ?? "starter") as Plan;
  const rank = PLAN_RANK[p] ?? 0;
  return rank >= PLAN_RANK[FEATURE_MIN_PLAN[feature]];
}

/** Der niedrigste Plan, der das Feature freischaltet (für "Upgrade auf …"-Hinweise). */
export function requiredPlan(feature: Feature): Plan {
  return FEATURE_MIN_PLAN[feature];
}

export const PLAN_LABEL: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

/** Alle Features eines Plans (z. B. für Preistabelle / Vergleich). */
export function featuresForPlan(plan: Plan): Feature[] {
  return (Object.keys(FEATURE_MIN_PLAN) as Feature[]).filter((f) => hasFeature(plan, f));
}
