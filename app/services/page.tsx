"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Plus, Search, X, ChevronRight,
  Clock, Euro, Pencil, Check, Loader2, Globe,
} from "lucide-react";
import { SERVICE_CATEGORIES, SERVICE_CATALOG, type ServiceCatalogItem } from "@/lib/services-catalog";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Toggle Switch ─────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 36, height: 20, borderRadius: 99, padding: 2,
        background: on ? "var(--c-accent)" : "var(--c-bg-strong)",
        border: "none", cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center",
        transition: "background 0.2s",
      }}
    >
      <motion.div
        animate={{ x: on ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
      />
    </button>
  );
}

/* ─── Service Edit Modal ────────────────────────────────── */
function EditModal({
  service, active, onSave, onClose,
}: {
  service: ServiceCatalogItem;
  active: boolean;
  onSave: (s: ServiceCatalogItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...service });
  return (
    <>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 200 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{
          position: "fixed", zIndex: 201,
          top: "50%", left: "50%", x: "-50%", y: "-50%",
          width: "min(520px, calc(100vw - 32px))",
          background: "var(--c-bg-elevated)",
          border: "1px solid var(--c-border-strong)",
          borderRadius: 18, overflow: "hidden",
          boxShadow: "var(--c-shadow-lg)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)" }}>{draft.name}</div>
            <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", marginTop: 2 }}>Service bearbeiten</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", padding: "6px 8px", color: "var(--c-fg-subtle)" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 6 }}>Name</label>
            <input
              value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-strong)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--c-fg)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {/* Duration */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 6 }}>
              Dauer: <span style={{ color: "var(--c-accent)" }}>{draft.durationMin} Min.</span>
            </label>
            <input
              type="range" min={5} max={360} step={5}
              value={draft.durationMin} onChange={(e) => setDraft((p) => ({ ...p, durationMin: +e.target.value, durationMax: +e.target.value }))}
              style={{ width: "100%", accentColor: "var(--c-accent)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 4 }}>
              <span>5 Min.</span><span>360 Min. (6h)</span>
            </div>
          </div>

          {/* Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(["priceMin", "priceMax"] as const).map((key) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)", display: "block", marginBottom: 6 }}>
                  {key === "priceMin" ? "Preis ab (€)" : "Preis bis (€)"}
                </label>
                <input
                  type="number" min={0} max={9999}
                  value={draft[key]} onChange={(e) => setDraft((p) => ({ ...p, [key]: +e.target.value }))}
                  style={{ width: "100%", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-strong)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--c-fg)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          {/* Online bookable */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--c-bg-subtle)", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={14} style={{ color: "var(--c-fg-subtle)" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fg)" }}>Online buchbar</div>
                <div style={{ fontSize: 11, color: "var(--c-fg-subtle)" }}>Erscheint auf der öffentlichen Buchungsseite</div>
              </div>
            </div>
            <Toggle on={draft.isOnlineBookable} onChange={(v) => setDraft((p) => ({ ...p, isOnlineBookable: v }))} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--c-border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 10, background: "transparent", border: "1px solid var(--c-border-strong)", fontSize: 13, fontWeight: 700, color: "var(--c-fg-muted)", cursor: "pointer", fontFamily: "inherit" }}>
            Abbrechen
          </button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onSave(draft)} style={{ padding: "9px 20px", borderRadius: 10, background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            <Check size={13} /> Speichern
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function ServicesPage() {
  const [activeCat, setActiveCat] = useState("damen");
  const [active, setActive]       = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, Partial<ServiceCatalogItem>>>({});
  const [search, setSearch]       = useState("");
  const [editItem, setEditItem]   = useState<ServiceCatalogItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<string | null>(null);

  // Load active services from API
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d: { activeIds?: string[]; overrides?: Record<string, Partial<ServiceCatalogItem>> }) => {
        if (d.activeIds) setActive(new Set(d.activeIds));
        if (d.overrides) setOverrides(d.overrides);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleService = async (id: string) => {
    const wasActive = active.has(id);
    // Optimistic
    setActive((prev) => {
      const next = new Set(prev);
      wasActive ? next.delete(id) : next.add(id);
      return next;
    });
    setSaving(id);
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !wasActive }),
      });
    } catch {
      // Rollback
      setActive((prev) => {
        const next = new Set(prev);
        wasActive ? next.add(id) : next.delete(id);
        return next;
      });
    } finally {
      setSaving(null);
    }
  };

  const saveEdit = (updated: ServiceCatalogItem) => {
    setOverrides((prev) => ({ ...prev, [updated.id]: { name: updated.name, durationMin: updated.durationMin, durationMax: updated.durationMax, priceMin: updated.priceMin, priceMax: updated.priceMax, isOnlineBookable: updated.isOnlineBookable } }));
    setEditItem(null);
    fetch("/api/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: updated.id, override: { name: updated.name, durationMin: updated.durationMin, priceMin: updated.priceMin, priceMax: updated.priceMax, isOnlineBookable: updated.isOnlineBookable } }),
    }).catch(() => {});
  };

  const getService = (s: ServiceCatalogItem): ServiceCatalogItem =>
    overrides[s.id] ? { ...s, ...overrides[s.id] } : s;

  const catServices = SERVICE_CATALOG.filter((s) => s.categoryId === activeCat);
  const displayed = search.trim()
    ? SERVICE_CATALOG.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : catServices;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.4, marginBottom: 2 }}>Services</h1>
          <p style={{ fontSize: 13, color: "var(--c-fg-subtle)" }}>
            {active.size} aktiviert · {SERVICE_CATALOG.length} verfügbar
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--c-fg-subtle)" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen..."
              style={{ background: "var(--c-bg-elevated)", border: "1px solid var(--c-border-strong)", borderRadius: 10, padding: "8px 12px 8px 30px", fontSize: 13, color: "var(--c-fg)", outline: "none", width: 180, fontFamily: "inherit" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--c-fg-subtle)", padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Plus size={14} /> Eigener Service
          </motion.button>
        </div>
      </motion.div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* ── Left: Category list ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, ease: EASE }}
          className="card"
          style={{ width: 220, flexShrink: 0, padding: "8px 0", position: "sticky", top: 20 }}
        >
          {SERVICE_CATEGORIES.map((cat) => {
            const count = SERVICE_CATALOG.filter((s) => s.categoryId === cat.id && active.has(s.id)).length;
            const total = SERVICE_CATALOG.filter((s) => s.categoryId === cat.id).length;
            const isActive = activeCat === cat.id && !search;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCat(cat.id); setSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "9px 14px",
                  background: isActive ? "var(--c-accent-bg)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "2px solid var(--c-accent)" : "2px solid transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--c-accent)" : "var(--c-fg-muted)" }}>
                  {cat.name}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99,
                  background: count > 0 ? "var(--c-accent-bg)" : "var(--c-bg-strong)",
                  color: count > 0 ? "var(--c-accent)" : "var(--c-fg-subtle)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {count}/{total}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ── Right: Service list ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ease: EASE }}
          style={{ flex: 1 }}
        >
          {search && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-subtle)", marginBottom: 10 }}>
              {displayed.length} Ergebnisse für &ldquo;{search}&rdquo;
            </div>
          )}

          {loading ? (
            <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--c-fg-subtle)", fontSize: 14 }}>
              Keine Services gefunden.
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              {displayed.map((raw, i) => {
                const s = getService(raw);
                const isOn = active.has(s.id);
                const isSaving = saving === s.id;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px",
                      borderBottom: i < displayed.length - 1 ? "1px solid var(--c-border)" : "none",
                      background: isOn ? "rgba(212,176,119,0.03)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    className="service-row"
                  >
                    {/* Active indicator */}
                    <div style={{ width: 3, alignSelf: "stretch", borderRadius: 99, background: isOn ? "var(--c-accent)" : "var(--c-bg-strong)", flexShrink: 0, transition: "background 0.2s" }} />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: isOn ? "var(--c-fg)" : "var(--c-fg-muted)", marginBottom: 4 }}>
                        {s.name}
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--c-fg-subtle)" }}>
                          <Clock size={11} /> {s.durationMin} Min.
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--c-fg-subtle)" }}>
                          <Euro size={11} />
                          {s.priceMin === s.priceMax
                            ? `${s.priceMin}`
                            : `${s.priceMin} – ${s.priceMax}`}
                        </span>
                        {s.isOnlineBookable && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--c-info)" }}>
                            <Globe size={10} /> Online
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit button — immer sichtbar (mobil gibt es kein Hover), Hover hebt nur hervor */}
                    <button
                      onClick={() => setEditItem(raw)}
                      title="Preis & Dauer anpassen"
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 9px", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", borderRadius: 8, cursor: "pointer", color: "var(--c-fg-muted)", opacity: 0.85, transition: "opacity 0.15s", flexShrink: 0, fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}
                      className="edit-btn"
                    >
                      <Pencil size={13} />
                      <span className="edit-btn-label">Preis</span>
                    </button>

                    {/* Toggle */}
                    <div style={{ flexShrink: 0 }}>
                      {isSaving
                        ? <Loader2 size={16} style={{ color: "var(--c-fg-subtle)", animation: "spin 1s linear infinite" }} />
                        : <Toggle on={isOn} onChange={() => toggleService(s.id)} />
                      }
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <EditModal
            service={getService(editItem)}
            active={active.has(editItem.id)}
            onSave={saveEdit}
            onClose={() => setEditItem(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .service-row:hover .edit-btn { opacity: 1 !important; }
        input::placeholder { color: var(--c-fg-faint); }
      `}</style>
    </div>
  );
}
