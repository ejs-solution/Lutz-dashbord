"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Star, Clock, Gift,
  MessageSquare, Zap, ChevronRight, X, Phone,
  TrendingUp, Heart,
} from "lucide-react";
import { customers, type Customer } from "@/lib/mock-data";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Tab = "alle" | "warteliste" | "followup";

export default function CRMPage() {
  const [tab, setTab] = useState<Tab>("alle");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [sentFollowUps, setSentFollowUps] = useState<Set<string>>(new Set());
  const [sentBirthday, setSentBirthday] = useState<Set<string>>(new Set());

  const followUpCustomers = customers.filter((c) => c.followUpSuggestion);
  const waitlistCustomers = customers.filter((c) => c.waitlisted);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.preferredService.toLowerCase().includes(q);
    if (tab === "warteliste") return c.waitlisted && matchesSearch;
    if (tab === "followup")   return !!c.followUpSuggestion && matchesSearch;
    return matchesSearch;
  });

  const sendFollowUp = (id: string) => setSentFollowUps((prev) => new Set([...prev, id]));
  const sendBirthday = (id: string) => setSentBirthday((prev) => new Set([...prev, id]));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: -0.4, marginBottom: 2 }}>
              Kundenkartei
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {customers.length} Kunden · {waitlistCustomers.length} auf Warteliste · {followUpCustomers.length} Follow-up Vorschläge
            </p>
          </div>

          {/* KPI pills */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--accent)" }}>
                € {customers.reduce((s, c) => s + c.totalRevenue, 0).toLocaleString("de-DE")}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>Gesamtumsatz</div>
            </div>
            <div style={{ padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--green)" }}>
                {customers.filter((c) => c.isVIP).length}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>VIP Kunden</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Search & Tabs ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: 18 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, Telefon oder Service suchen..."
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
              fontSize: 14, color: "var(--text)", outline: "none", fontFamily: "inherit",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {([
            { id: "alle",      label: "Alle Kunden",   count: customers.length },
            { id: "warteliste",label: "Warteliste",     count: waitlistCustomers.length },
            { id: "followup",  label: "KI Follow-ups", count: followUpCustomers.length },
          ] as { id: Tab; label: string; count: number }[]).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                border: `1px solid ${tab === id ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                cursor: "pointer",
                background: tab === id ? "var(--accent-glow)" : "transparent",
                color: tab === id ? "var(--accent)" : "var(--text-sub)",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {label}
              <span style={{
                background: tab === id ? "var(--accent)" : "var(--surface-3)",
                color: tab === id ? "#0a0a18" : "var(--text-muted)",
                fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: 999,
              }}>{count}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Follow-up Suggestions (only on followup tab) ── */}
      <AnimatePresence>
        {tab === "followup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Zap size={16} style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>KI-Vorschläge von Paul</span>
            </div>
            {followUpCustomers.map((c) => {
              const isBirthday = c.tags.some((t) => t.includes("Geburtstag"));
              const sent = isBirthday ? sentBirthday.has(c.id) : sentFollowUps.has(c.id);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                  style={{ padding: "14px 16px", marginBottom: 10 }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div className="avatar" style={{ width: 38, height: 38, fontSize: 13, background: isBirthday ? "var(--purple)" : "var(--accent)" }}>
                      {isBirthday ? "🎂" : c.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{c.name}</span>
                        <span style={{ fontSize: 13 }}>{c.langFlag}</span>
                        {isBirthday && <span className="badge badge-purple">🎂 Geburtstag</span>}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.5, marginBottom: 10 }}>
                        {c.followUpSuggestion}
                      </p>
                      {sent ? (
                        <span className="badge badge-green">✓ Gesendet!</span>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-gold"
                            style={{ fontSize: 12, padding: "7px 14px" }}
                            onClick={() => isBirthday ? sendBirthday(c.id) : sendFollowUp(c.id)}
                          >
                            <MessageSquare size={12} />
                            {isBirthday ? "🎁 Gutschein senden" : "Paul sendet WhatsApp"}
                          </button>
                          <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }}>Überspringen</button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Customer List ── */}
      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            Keine Kunden gefunden
          </div>
        ) : (
          filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: EASE }}
              onClick={() => setSelected(c)}
              whileHover={{ backgroundColor: "var(--surface-2)" }}
              style={{
                padding: "14px 18px",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
                transition: "background 0.12s",
              }}
            >
              <div style={{ position: "relative" }}>
                <div className="avatar" style={{ width: 42, height: 42, fontSize: 14 }}>{c.avatar}</div>
                {c.isVIP && (
                  <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 11, lineHeight: 1 }}>⭐</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{c.name}</span>
                  <span style={{ fontSize: 13 }}>{c.langFlag}</span>
                  {c.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={`badge ${tag.includes("VIP") ? "badge-gold" : tag.includes("Geburtstag") ? "badge-purple" : tag.includes("Warteliste") ? "badge-blue" : "badge-gray"}`} style={{ fontSize: 9, padding: "2px 6px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Heart size={10} /> {c.preferredService}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} /> {c.lastVisit}</span>
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--green)", marginBottom: 2 }}>
                  € {c.totalRevenue.toLocaleString("de-DE")}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.totalVisits} Besuche</div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            </motion.div>
          ))
        )}
      </div>

      {/* ── Customer Detail Sheet ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <motion.div
              className="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 35 }}
            >
              <div style={{ padding: "20px 20px 32px" }}>
                {/* Handle */}
                <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--border-strong)", margin: "0 auto 20px" }} />

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div className="avatar" style={{ width: 52, height: 52, fontSize: 17 }}>{selected.avatar}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 900, fontSize: 19, color: "var(--text)" }}>{selected.name}</span>
                        {selected.isVIP && <Star size={16} style={{ color: "var(--accent)", fill: "var(--accent)" }} />}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{selected.langFlag} {selected.language}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: "5px 9px", borderRadius: 8 }}>
                    <X size={16} />
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Gesamtumsatz", value: `€ ${selected.totalRevenue.toLocaleString("de-DE")}`, color: "var(--green)", icon: <TrendingUp size={14} /> },
                    { label: "Besuche", value: String(selected.totalVisits), color: "var(--accent)", icon: <Users size={14} /> },
                    { label: "Letzter Besuch", value: selected.lastVisit, color: "var(--text)", icon: <Clock size={14} /> },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} style={{ padding: "12px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color }}>{icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Details */}
                {[
                  { label: "Telefon", value: selected.phone, icon: <Phone size={13} /> },
                  { label: "E-Mail", value: selected.email ?? "—" },
                  { label: "Lieblingsservice", value: selected.preferredService, icon: <Heart size={13} /> },
                  { label: "Nächster Termin", value: selected.nextAppointment ?? "—" },
                  ...(selected.birthday ? [{ label: "Geburtstag", value: new Date(selected.birthday).toLocaleDateString("de-DE"), icon: <Gift size={13} /> }] : []),
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {icon}{label}
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{value}</span>
                  </div>
                ))}

                {/* Tags */}
                {selected.tags.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selected.tags.map((tag) => (
                      <span key={tag} className="badge badge-gray">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Follow-up */}
                {selected.followUpSuggestion && (
                  <div style={{ marginTop: 16, padding: 14, background: "var(--accent-glow)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                      <Zap size={14} style={{ color: "var(--accent)" }} />
                      <span style={{ fontWeight: 800, fontSize: 13, color: "var(--accent)" }}>Paul-Vorschlag</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.5 }}>{selected.followUpSuggestion}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button className="btn-gold" style={{ flex: 1 }}>
                    <MessageSquare size={14} /> WhatsApp senden
                  </button>
                  <button className="btn-ghost" style={{ flex: 1 }}>
                    Termin buchen
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
