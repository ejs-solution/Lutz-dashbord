"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { SERVICE_CATALOG } from "@/lib/services-catalog";
import { customers as mockCustomers } from "@/lib/mock-data";
import NotificationToaster from "@/components/dashboard/NotificationToaster";
import BottomDock from "@/components/layout/BottomDock";
import {
  LayoutDashboard, Inbox, CalendarDays, Users, Settings,
  BarChart2, FileText, Link2, Scissors, Search,
  Sun, Moon, Zap, UserSquare2, LogOut, ChevronUp,
  HelpCircle, Send, X, Crown, Camera, Bell, MessageCircle,
  Clock, RefreshCw, PanelLeft, type LucideIcon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useBeta } from "@/lib/beta-context";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────── */
type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  badge?: number;
  disabled?: boolean;
};

/* ─── Nav config ─────────────────────────────────────────── */
const WORKSPACE: NavItem[] = [
  { href: "/",         label: "Übersicht", icon: LayoutDashboard, shortcut: "⌘1" },
  { href: "/inbox",    label: "Inbox",     icon: Inbox,           shortcut: "⌘2", badge: 3 },
  { href: "/kalender", label: "Kalender",  icon: CalendarDays,    shortcut: "⌘3" },
  { href: "/crm",      label: "Kunden",    icon: Users,           shortcut: "⌘4" },
];

const ANALYSE: NavItem[] = [
  { href: "/analytics", label: "Analytics", icon: BarChart2  },
  { href: "/reports",   label: "Reports",   icon: FileText   },
  { href: "/winback",   label: "Win-Back",  icon: RefreshCw  },
];

const CONFIG: NavItem[] = [
  { href: "/services",     label: "Services",      icon: Scissors     },
  { href: "/mitarbeiter",  label: "Team",           icon: UserSquare2  },
  { href: "/settings",     label: "Einstellungen",  icon: Settings, shortcut: "⌘5" },
  { href: "/integrations", label: "Integrationen",  icon: Link2        },
];

const PAGE_LABELS: Record<string, string> = {
  "/":             "Übersicht",
  "/inbox":        "Inbox",
  "/kalender":     "Kalender",
  "/crm":          "Kunden",
  "/analytics":    "Analytics",
  "/reports":      "Reports",
  "/winback":      "Win-Back Maschine",
  "/services":     "Services",
  "/mitarbeiter":  "Team",
  "/settings":     "Einstellungen",
  "/integrations": "Integrationen",
};

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  starter: { label: "Basis",  color: "var(--c-fg-subtle)", bg: "var(--c-bg-strong)"         },
  pro:     { label: "Pro",    color: "var(--c-accent)",    bg: "rgba(212,176,119,0.14)"      },
  custom:  { label: "Custom", color: "#a78bfa",            bg: "rgba(167,139,250,0.12)"      },
};

const SUPPORT_CATS = [
  "Technisches Problem",
  "Frage zur Funktion",
  "Abrechnung / Abo",
  "Datenschutz / DSGVO",
  "Feedback / Verbesserungsvorschlag",
  "Sonstiges",
];

const AUTH_ROUTES = ["/login", "/signup"];
const PUBLIC_PREFIXES = ["/demo"];

/* ─── Helpers ────────────────────────────────────────────── */
function usePageLabel(pathname: string) {
  if (pathname === "/") return "Übersicht";
  const key = Object.keys(PAGE_LABELS).find(k => k !== "/" && pathname.startsWith(k));
  return key ? PAGE_LABELS[key] : "Dashboard";
}

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

/* ─── NavSection ─────────────────────────────────────────── */
function NavSection({ label, items, pathname, hrefTransform }: {
  label: string; items: NavItem[]; pathname: string;
  hrefTransform?: (href: string) => string;
}) {
  const xfm = hrefTransform ?? ((h: string) => h);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-faint)", padding: "0 12px", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.9 }}>
        {label}
      </div>
      {items.map(item => {
        const resolvedHref = xfm(item.href);
        const active = !item.disabled && isActive(resolvedHref, pathname);
        const row = (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            height: 36, padding: "0 11px", borderRadius: 9,
            background: active ? "var(--c-accent-bg)" : "transparent",
            opacity: item.disabled ? 0.35 : 1,
            cursor: item.disabled ? "default" : "pointer",
            transition: "background 0.14s",
          }}>
            <item.icon size={16} strokeWidth={1.9} style={{ color: active ? "var(--c-accent)" : "var(--c-fg-muted)", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? "var(--c-fg)" : "var(--c-fg-muted)", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
            {item.badge != null && item.badge > 0 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--c-accent)", background: "var(--c-accent-bg)", padding: "0 5px", borderRadius: 4, lineHeight: "18px" }}>
                {item.badge}
              </span>
            )}
            {item.shortcut && (
              <span style={{ fontSize: 11, color: "var(--c-fg-faint)" }}>{item.shortcut}</span>
            )}
          </div>
        );

        if (item.disabled || item.href === "#") {
          return <div key={item.label} style={{ marginBottom: 1 }}>{row}</div>;
        }
        return (
          <Link key={resolvedHref} href={resolvedHref} style={{ display: "block", textDecoration: "none", marginBottom: 1 }}>
            <motion.div whileHover={!active ? { backgroundColor: "var(--c-bg-subtle)" } : {}} style={{ borderRadius: 9 }}>
              {row}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── ThemeToggle ────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <motion.button whileTap={{ scale: 0.85 }} onClick={toggle} className="btn-icon" title={theme === "dark" ? "Hell" : "Dunkel"}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 20, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: "flex" }}>
          {theme === "dark"
            ? <Sun size={15} style={{ color: "var(--c-fg-subtle)" }} />
            : <Moon size={15} style={{ color: "var(--c-fg-subtle)" }} />
          }
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── PaulPulse ──────────────────────────────────────────── */
function PaulPulse() {
  return (
    <motion.span
      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--c-success)", boxShadow: "0 0 0 2px rgba(34,197,94,0.25)", flexShrink: 0 }}
    />
  );
}

/* ─── SupportModal ───────────────────────────────────────── */
function SupportModal({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const [category, setCategory] = useState(SUPPORT_CATS[0]);
  const [subject,  setSubject]  = useState("");
  const [body,     setBody]     = useState("");
  const email = session?.user?.email ?? "";
  const name  = session?.user?.name  ?? "";

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
    background: "var(--c-bg)", border: "1px solid var(--c-border)",
    color: "var(--c-fg)", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  function send() {
    const to  = "ejs-solution@outlook.de";
    const sub = encodeURIComponent(`[CUTZ Support] ${category}${subject ? ` – ${subject}` : ""}`);
    const msg = encodeURIComponent(`Von: ${name} (${email})\nKategorie: ${category}\n\n${body}\n\n---\nGesendet aus CUTZ Solution Dashboard`);
    window.location.href = `mailto:${to}?subject=${sub}&body=${msg}`;
    onClose();
  }

  return (
    <>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 500 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={{
          position: "fixed", zIndex: 501,
          top: "50%", left: "50%", x: "-50%", y: "-50%",
          width: "min(480px, calc(100vw - 32px))",
          background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
          borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ height: 3, background: "var(--c-accent)" }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(212,176,119,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HelpCircle size={18} style={{ color: "var(--c-accent)" }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-fg)" }}>Support kontaktieren</div>
                <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", marginTop: 1 }}>ejs-solution@outlook.de</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={17} style={{ color: "var(--c-fg-muted)" }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6 }}>Kategorie</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {SUPPORT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6 }}>Betreff <span style={{ opacity: 0.5 }}>(optional)</span></label>
              <input style={inp} placeholder="Kurze Beschreibung…" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--c-fg-subtle)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6 }}>Problembeschreibung *</label>
              <textarea rows={5} style={{ ...inp, resize: "vertical" }} placeholder="Beschreibe dein Problem so genau wie möglich…" value={body} onChange={e => setBody(e.target.value)} />
            </div>
            {email && (
              <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", background: "var(--c-bg-subtle)", borderRadius: 8, padding: "8px 12px" }}>
                Gesendet als <strong style={{ color: "var(--c-fg)" }}>{email}</strong>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={send} disabled={!body.trim()}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13,
                background: body.trim() ? "var(--c-accent)" : "var(--c-bg-strong)",
                color: body.trim() ? "var(--c-accent-fg)" : "var(--c-fg-subtle)",
                border: "none", cursor: body.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Send size={14} /> E-Mail senden
            </button>
            <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, background: "transparent", color: "var(--c-fg-muted)", border: "1px solid var(--c-border)", cursor: "pointer" }}>
              Abbrechen
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── SearchModal (⌘K): Seiten, Kunden und Services finden ── */
type SearchResult = {
  key: string;
  group: string;
  label: string;
  sub?: string;
  icon: LucideIcon;
  href: string;
};

function SearchModal({ onClose, navHref }: { onClose: () => void; navHref: (href: string) => string }) {
  const router = useRouter();
  const { betaMode } = useBeta();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [liveCustomers, setLiveCustomers] = useState<{ name: string; lastService?: string | null }[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Echte Kunden nur außerhalb des Demo-Modus laden; Fehler bleiben still (Suche zeigt dann nur Seiten/Services).
  useEffect(() => {
    if (betaMode) return;
    fetch("/api/crm/customers")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (Array.isArray(d?.customers)) setLiveCustomers(d.customers); })
      .catch(() => {});
  }, [betaMode]);

  const results = useMemo<SearchResult[]>(() => {
    // Hinweis: active wird im onChange des Inputs zurückgesetzt (kein setState im Effect).
    const term = q.trim().toLowerCase();
    const pages: SearchResult[] = [...WORKSPACE, ...ANALYSE, ...CONFIG].map(n => ({
      key: `page-${n.href}`, group: "Seiten", label: n.label, icon: n.icon, href: n.href,
    }));
    if (!term) return pages;

    const kunden = (betaMode || !liveCustomers ? mockCustomers : liveCustomers) as { name: string; preferredService?: string; lastService?: string | null }[];
    const custResults: SearchResult[] = kunden
      .filter(c => c.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map((c, i) => ({ key: `cust-${i}`, group: "Kunden", label: c.name, sub: c.preferredService ?? c.lastService ?? undefined, icon: Users, href: "/crm" }));

    const servResults: SearchResult[] = SERVICE_CATALOG
      .filter(s => s.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map(s => ({ key: `serv-${s.id}`, group: "Services", label: s.name, sub: `€ ${s.priceMin}–${s.priceMax}`, icon: Scissors, href: "/services" }));

    return [...pages.filter(p => p.label.toLowerCase().includes(term)), ...custResults, ...servResults];
  }, [q, betaMode, liveCustomers]);

  function go(r: SearchResult) {
    router.push(navHref(r.href));
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]); }
    else if (e.key === "Escape") { onClose(); }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 640 }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{
          position: "fixed", zIndex: 641, top: "14%", left: "50%", x: "-50%",
          width: "min(560px, calc(100vw - 32px))",
          background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
          borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--c-border)" }}>
          <Search size={15} style={{ color: "var(--c-fg-subtle)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Kunden, Services oder Seiten suchen…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 14, color: "var(--c-fg)", fontFamily: "inherit" }}
          />
          <button onClick={onClose} aria-label="Schließen" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
            <X size={15} style={{ color: "var(--c-fg-subtle)" }} />
          </button>
        </div>

        <div style={{ maxHeight: 340, overflowY: "auto", padding: "6px 0" }}>
          {results.length === 0 ? (
            <div style={{ padding: "22px 16px", textAlign: "center", fontSize: 13, color: "var(--c-fg-subtle)" }}>
              Keine Treffer für „{q}“
            </div>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon;
              const showGroup = i === 0 || results[i - 1].group !== r.group;
              return (
                <div key={r.key}>
                  {showGroup && (
                    <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "var(--c-fg-subtle)" }}>
                      {r.group}
                    </div>
                  )}
                  <button
                    onClick={() => go(r)}
                    onMouseEnter={() => setActive(i)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 16px", background: i === active ? "var(--c-bg-subtle)" : "transparent",
                      border: "none", borderLeft: `2px solid ${i === active ? "var(--c-accent)" : "transparent"}`,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    }}
                  >
                    <Icon size={15} style={{ color: i === active ? "var(--c-accent)" : "var(--c-fg-subtle)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                    {r.sub && <span style={{ fontSize: 11.5, color: "var(--c-fg-subtle)", flexShrink: 0 }}>{r.sub}</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", gap: 14, padding: "9px 16px", borderTop: "1px solid var(--c-border)", fontSize: 10.5, color: "var(--c-fg-faint)" }}>
          <span>↑↓ wählen</span>
          <span>↵ öffnen</span>
          <span>esc schließen</span>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Upgrade-Karte (Sidebar, nur im Starter-Plan) ────────── */
function UpgradeCard() {
  const { data: session } = useSession();
  const plan = ((session?.user as { plan?: string } | undefined)?.plan ?? "starter").toLowerCase();
  if (plan !== "starter") return null;
  return (
    <div style={{ margin: "8px 10px 0", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(212,176,119,0.35)", background: "var(--c-accent-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <Crown size={12} style={{ color: "var(--c-accent)" }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--c-fg)" }}>Starter-Plan</span>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--c-fg-muted)", lineHeight: 1.45, marginBottom: 8 }}>
        Schalte Win-Back, Analytics & mehr frei.
      </div>
      <a
        href={`mailto:ejs-solution@outlook.de?subject=${encodeURIComponent("[CUTZ] Plan-Upgrade")}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", borderRadius: 8, background: "var(--c-accent)", color: "var(--c-accent-fg)", fontSize: 11.5, fontWeight: 800, textDecoration: "none" }}
      >
        <Crown size={12} /> Jetzt Plan upgraden
      </a>
    </div>
  );
}

/* ─── UserCard (oben links in Sidebar) ───────────────────── */
function UserCard() {
  const { data: session }   = useSession();
  const [open, setOpen]     = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const wrapRef             = useRef<HTMLDivElement>(null);
  const fileRef             = useRef<HTMLInputElement>(null);

  const name     = session?.user?.name  ?? "Demo User";
  const email    = session?.user?.email ?? "demo@cutzsolution.com";
  const initials = name.split(" ").map((n: string) => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const rawPlan  = (session?.user as { plan?: string } | undefined)?.plan ?? "starter";
  const plan     = PLAN_LABELS[rawPlan] ?? PLAN_LABELS.starter;

  // Load saved avatar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cutz_avatar_${email}`);
      if (saved) setAvatar(saved);
    } catch { /* noop */ }
  }, [email]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setAvatar(b64);
      try { localStorage.setItem(`cutz_avatar_${email}`, b64); } catch { /* noop */ }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeAvatar() {
    setAvatar(null);
    try { localStorage.removeItem(`cutz_avatar_${email}`); } catch { /* noop */ }
  }

  /** Small circular avatar used in the trigger row */
  const AvatarImg = ({ size, fs }: { size: number; fs: number }) => (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      overflow: "hidden", background: avatar ? "transparent" : "var(--c-accent)",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "1.5px solid var(--c-border)",
    }}>
      {avatar
        ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: fs, fontWeight: 800, color: "var(--c-accent-fg)", lineHeight: 1, userSelect: "none" }}>{initials}</span>
      }
    </div>
  );

  const menuRow: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", gap: 9,
    padding: "10px 14px", border: "none", background: "transparent",
    fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
    transition: "background 0.12s",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", padding: "0 8px 8px" }}>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 9,
          padding: "8px 10px", borderRadius: 10,
          border: `1px solid ${open ? "var(--c-accent)" : "var(--c-border)"}`,
          background: open ? "var(--c-bg-subtle)" : "transparent",
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.14s",
        }}
      >
        <AvatarImg size={30} fs={11} />
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
            {name}
          </div>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 3, color: plan.color, background: plan.bg, marginTop: 2, display: "inline-block" }}>
            {plan.label}
          </span>
        </div>
        <ChevronUp size={13} style={{ color: "var(--c-fg-subtle)", flexShrink: 0, transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
      </button>

      {/* ── Dropdown (opens downward) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 8, right: 8, zIndex: 300,
              background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
              borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* Profile info */}
            <div style={{ padding: "16px 14px 12px" }}>
              {/* Avatar with hover-to-change */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
                  onClick={() => fileRef.current?.click()}
                  title="Profilbild ändern"
                >
                  <AvatarImg size={48} fs={17} />
                  {/* Camera overlay */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                  >
                    <Camera size={15} color="#fff" />
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{email}</div>
                </div>
              </div>

              {/* Plan badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                color: plan.color, background: plan.bg, border: `1px solid ${plan.color}30`,
              }}>
                <Crown size={11} /> {plan.label} Plan
              </div>
            </div>

            {/* Menu items */}
            <div style={{ borderTop: "1px solid var(--c-border)" }}>
              <button
                style={{ ...menuRow, color: "var(--c-fg-muted)" }}
                onClick={() => fileRef.current?.click()}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-bg-subtle)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Camera size={14} /> Profilbild ändern
              </button>

              {avatar && (
                <button
                  style={{ ...menuRow, color: "var(--c-fg-subtle)" }}
                  onClick={removeAvatar}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-bg-subtle)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <X size={14} /> Profilbild entfernen
                </button>
              )}

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                style={{ ...menuRow as React.CSSProperties, textDecoration: "none", display: "flex", color: "var(--c-fg-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--c-bg-subtle)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Settings size={14} /> Kontoeinstellungen
              </Link>

              <button
                style={{ ...menuRow, color: "#ef4444", fontWeight: 600, borderTop: "1px solid var(--c-border)" }}
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }); }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <LogOut size={14} /> Abmelden
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Waitlist data ──────────────────────────────────────── */
const FREED_SLOT = { time: "14:00", duration: 60, employee: "Aynur", service: "Damenhaarschnitt" };

const WAITLIST_CUSTOMERS = [
  {
    name: "Büşra Şahin",
    phone: "+4917623456789",
    phoneDisplay: "+49 176 2345 6789",
    service: "Haarpflege",
    avatar: "BŞ",
    color: "#10b981",
  },
  {
    name: "Ayşe Doğan",
    phone: "+4917787654321",
    phoneDisplay: "+49 177 8765 4321",
    service: "Dauerwelle",
    avatar: "AD",
    color: "#60a5fa",
  },
  {
    name: "Emma Johnson",
    phone: "+4915745678901",
    phoneDisplay: "+49 157 4567 8901",
    service: "Keratin-Behandlung",
    avatar: "EJ",
    color: "#D4B077",
  },
];

function waMsg(customer: typeof WAITLIST_CUSTOMERS[0]) {
  return `Hallo ${customer.name.split(" ")[0]}! 👋\n\nEin Termin um *${FREED_SLOT.time} Uhr* (${FREED_SLOT.duration} Min.) bei *${FREED_SLOT.employee}* ist gerade kurzfristig freigeworden!\n\nDa du auf unserer Warteliste stehst: Möchtest du diesen Slot übernehmen? 🙌\n\nEinfach kurz antworten – wir reservieren ihn sofort für dich.\n\nDein CUTZ Solution Team ✂️`;
}

/* ─── WaitlistModal ──────────────────────────────────────── */
function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState<Record<string, boolean>>({});

  function openWhatsApp(c: typeof WAITLIST_CUSTOMERS[0]) {
    const url = `https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg(c))}`;
    window.open(url, "_blank");
    setSent(s => ({ ...s, [c.name]: true }));
  }

  function sendAll() {
    WAITLIST_CUSTOMERS.forEach((c, i) => {
      setTimeout(() => openWhatsApp(c), i * 600);
    });
  }

  return (
    <>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 600 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={{
          position: "fixed", zIndex: 601,
          top: "50%", left: "50%", x: "-50%", y: "-50%",
          width: "min(560px, calc(100vw - 24px))",
          background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
          borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg,#D4B077,#f59e0b)" }} />
        <div style={{ padding: "22px 24px 20px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)", marginBottom: 4 }}>
                Warteliste kontaktieren
              </div>
              <div style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>
                Slot: <strong style={{ color: "var(--c-accent)" }}>{FREED_SLOT.time} Uhr · {FREED_SLOT.duration} Min. · {FREED_SLOT.employee}</strong> — 3 passende Kunden
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={17} style={{ color: "var(--c-fg-muted)" }} />
            </button>
          </div>

          {/* Customer cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {WAITLIST_CUSTOMERS.map(c => (
              <div key={c.name} style={{
                background: "var(--c-bg-subtle)", border: `1px solid ${sent[c.name] ? "#10b98140" : "var(--c-border)"}`,
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
                transition: "border-color 0.2s",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: `${c.color}22`, border: `1.5px solid ${c.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: c.color,
                }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fg)", marginBottom: 1 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginBottom: 8 }}>
                    {c.phoneDisplay} · wartet auf: {c.service}
                  </div>
                  {/* Message preview */}
                  <div style={{
                    fontSize: 11, color: "var(--c-fg-muted)", background: "var(--c-bg)",
                    border: "1px solid var(--c-border)", borderRadius: 8, padding: "8px 10px",
                    lineHeight: 1.5, whiteSpace: "pre-wrap", maxHeight: 70, overflow: "hidden",
                    position: "relative",
                  }}>
                    {waMsg(c).slice(0, 120)}…
                  </div>
                </div>
                <button
                  onClick={() => openWhatsApp(c)}
                  style={{
                    flexShrink: 0, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: sent[c.name] ? "rgba(16,185,129,0.12)" : "#25D366",
                    color: sent[c.name] ? "#10b981" : "#fff",
                    border: sent[c.name] ? "1px solid #10b98140" : "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
                  }}
                >
                  <MessageCircle size={13} />
                  {sent[c.name] ? "Gesendet ✓" : "WhatsApp"}
                </button>
              </div>
            ))}
          </div>

          {/* Send all */}
          <button
            onClick={sendAll}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10, fontWeight: 800, fontSize: 14,
              background: "linear-gradient(135deg,#D4B077,#f59e0b)",
              color: "#0A0908", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <MessageCircle size={16} />
            Alle 3 gleichzeitig per WhatsApp kontaktieren
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── WaitlistBanner ─────────────────────────────────────── */
function WaitlistBanner({ enabled }: { enabled: boolean }) {
  const [visible, setVisible]     = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Nur im Demo-/Beta-Modus (simuliert eine Echtzeit-Absage). Im echten Konto aus.
    if (!enabled) return;
    const shown = sessionStorage.getItem("waitlist_shown");
    if (shown) return;
    const t = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("waitlist_shown", "1");
    }, 3000);
    return () => clearTimeout(t);
  }, [enabled]);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 40, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            style={{
              position: "fixed", top: 16, right: 16,
              zIndex: 700, width: "min(420px, calc(100vw - 32px))",
              background: "var(--c-bg-elevated)",
              border: "1px solid rgba(212,176,119,0.5)",
              borderLeft: "4px solid var(--c-accent)",
              borderRadius: 14,
              boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,176,119,0.15)",
              padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14,
            }}
          >
            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: 3, duration: 0.4 }}
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: "rgba(212,176,119,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Bell size={18} style={{ color: "var(--c-accent)" }} />
            </motion.div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--c-fg)", marginBottom: 2 }}>
                Termin um {FREED_SLOT.time} Uhr freigeworden
                <span style={{ fontWeight: 500, color: "var(--c-fg-subtle)", marginLeft: 8 }}>
                  · {FREED_SLOT.employee} · {FREED_SLOT.duration} Min. · {FREED_SLOT.service}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--c-fg-subtle)" }}>
                <span style={{ color: "var(--c-accent)", fontWeight: 700 }}>3 Kunden</span>
                {" "}auf der Warteliste passen in diesen Slot
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                flexShrink: 0, padding: "9px 16px", borderRadius: 9, fontSize: 12, fontWeight: 800,
                background: "var(--c-accent)", color: "var(--c-accent-fg)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              }}
            >
              <MessageCircle size={13} />
              Jetzt alle fragen
            </button>

            {/* Dismiss */}
            <button
              onClick={() => setVisible(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, display: "flex" }}
            >
              <X size={16} style={{ color: "var(--c-fg-subtle)" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && <WaitlistModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── MobileUserButton ───────────────────────────────────── */
function MobileUserButton({ showroom }: { showroom: boolean }) {
  const { data: session } = useSession();
  const [open, setOpen]   = useState(false);

  const name     = showroom ? "Demo Salon" : (session?.user?.name ?? "Benutzer");
  const email    = showroom ? "demo@cutzsolution.com" : (session?.user?.email ?? "");
  const rawPlan  = showroom ? "pro" : ((session?.user as { plan?: string } | undefined)?.plan ?? "starter");
  const plan     = PLAN_LABELS[rawPlan] ?? PLAN_LABELS.starter;
  const initials = name.split(" ").map((n: string) => n[0] ?? "").join("").slice(0, 2).toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: showroom ? "rgba(212,176,119,0.2)" : "var(--c-accent)",
          border: `1.5px solid ${showroom ? "rgba(212,176,119,0.5)" : "transparent"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 11, fontWeight: 800,
          color: "var(--c-accent-fg)",
        }}
      >
        {initials}
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
                background: "var(--c-bg-elevated)", borderRadius: "20px 20px 0 0",
                border: "1px solid var(--c-border)", padding: "20px 20px 40px",
              }}
            >
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--c-border)", margin: "0 auto 20px" }} />

              {/* User info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: showroom ? "rgba(212,176,119,0.2)" : "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "var(--c-accent-fg)", flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fg)" }}>{name}</div>
                  <div style={{ fontSize: 12, color: "var(--c-fg-subtle)", marginTop: 2 }}>{email}</div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, color: plan.color, background: plan.bg, marginTop: 4, display: "inline-block" }}>
                    <Crown size={9} style={{ display: "inline", marginRight: 3 }} />{plan.label} Plan
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Link href="/settings" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "var(--c-bg-subtle)", textDecoration: "none", color: "var(--c-fg)", fontSize: 14, fontWeight: 600 }}>
                  <Settings size={16} style={{ color: "var(--c-fg-subtle)" }} /> Einstellungen
                </Link>
                {!showroom && (
                  <button
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, fontWeight: 600, fontFamily: "inherit", width: "100%", textAlign: "left", marginTop: 4 }}
                  >
                    <LogOut size={16} /> Abmelden
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── AppShell ───────────────────────────────────────────── */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname      = usePathname();
  const pageLabel     = usePageLabel(pathname);
  const [showSupport, setShowSupport] = useState(false);
  const [showDrawer,  setShowDrawer]  = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const { betaMode, toggleBeta } = useBeta();
  const router = useRouter();
  // Detect showroom from URL — ShowroomProvider lives below AppShell in the tree
  const showroom = pathname.startsWith("/demo");
  const navHref = (href: string) => showroom ? `/demo${href === "/" ? "" : href}` : href;

  // ⌘K öffnet die Suche, ⌘1–5 springen zu den Seiten (die Kürzel aus der Sidebar).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === "k") { e.preventDefault(); setShowSearch(v => !v); return; }
      const jump: Record<string, string> = { "1": "/", "2": "/inbox", "3": "/kalender", "4": "/crm", "5": "/settings" };
      const target = jump[e.key];
      if (target) { e.preventDefault(); router.push(showroom ? `/demo${target === "/" ? "" : target}` : target); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, showroom]);

  // Login/Signup und die öffentliche Buchungsseite ohne Dashboard-Shell rendern.
  if (AUTH_ROUTES.some(r => pathname.startsWith(r)) || pathname.startsWith("/buchen") || pathname.startsWith("/termin")) {
    return <>{children}</>;
  }
  // Public demo routes — render full shell but without session requirement
  const isPublic = PUBLIC_PREFIXES.some(p => pathname.startsWith(p));

  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--c-bg)" }}>

      {/* ══ Desktop Sidebar ══════════════════════════════════ */}
      <aside
        className="hidden md:flex"
        style={{
          width: 220, flexShrink: 0, flexDirection: "column",
          background: "var(--c-bg-elevated)", borderRight: "1px solid var(--c-border)",
          position: "sticky", top: 0, height: "100dvh", overflowY: "auto",
          display: collapsed ? "none" : undefined,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "14px 16px 13px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--c-accent), #e8cfa0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(212,176,119,0.28)" }}>
            <Scissors size={15} color="#2a1f12" strokeWidth={2.4} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--c-fg)", letterSpacing: -0.2 }}>CUTZ</span>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: "var(--c-fg-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Solution</span>
          </div>
        </div>

        {/* ── Benutzer oben links ── */}
        <div style={{ borderBottom: "1px solid var(--c-border)", padding: "10px 0 8px" }}>
          {showroom ? (
            <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(212,176,119,0.2)", border: "1.5px solid rgba(212,176,119,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--c-accent)" }}>DS</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg)" }}>Demo Salon</div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 3, background: "rgba(212,176,119,0.15)", color: "var(--c-accent)" }}>Showroom</span>
              </div>
            </div>
          ) : (
            <UserCard />
          )}
          <UpgradeCard />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "14px 8px 4px" }}>
          <NavSection label="Workspace"     items={WORKSPACE} pathname={pathname} hrefTransform={navHref} />
          <NavSection label="Analyse"       items={ANALYSE}   pathname={pathname} hrefTransform={navHref} />
          <NavSection label="Konfiguration" items={CONFIG}    pathname={pathname} hrefTransform={navHref} />
        </nav>

        {/* ── Footer (kompakt, gepinnt — wird nicht mehr abgeschnitten) ── */}
        <div style={{ flexShrink: 0, marginTop: 6, borderTop: "1px solid var(--c-border)", padding: "10px 10px 12px" }}>
          {/* Paul – schlank */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--c-bg-subtle)", borderRadius: 10, marginBottom: 8 }}>
            <PaulPulse />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg)" }}>Paul</div>
              <div style={{ fontSize: 10.5, color: "var(--c-fg-muted)" }}>antwortet automatisch</div>
            </div>
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 0.4, color: "var(--c-success)", background: "rgba(34,197,94,0.12)", padding: "2px 6px", borderRadius: 5 }}>ONLINE</span>
          </div>

          {!showroom && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                onClick={() => setShowSupport(true)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 10px", borderRadius: 9, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-fg-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                <HelpCircle size={13} /> Support
              </button>
              <button
                onClick={toggleBeta}
                title={betaMode ? "Beispieldaten aktiv" : "Echte Daten"}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, border: `1px solid ${betaMode ? "rgba(212,176,119,0.45)" : "var(--c-border)"}`, background: betaMode ? "var(--c-accent-bg)" : "transparent", color: betaMode ? "var(--c-accent)" : "var(--c-fg-muted)" }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: betaMode ? "var(--c-accent)" : "var(--c-fg-faint)" }} /> Demo
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/impressum" style={{ fontSize: 10, color: "var(--c-fg-faint)", textDecoration: "none" }}>Impressum</Link>
            <span style={{ fontSize: 10, color: "var(--c-fg-faint)" }}>·</span>
            <Link href="/datenschutz" style={{ fontSize: 10, color: "var(--c-fg-faint)", textDecoration: "none" }}>Datenschutz</Link>
          </div>
        </div>
      </aside>

      {/* ══ Main area ════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }} className="app-main">

        {/* Desktop topbar */}
        <header
          className="hidden md:flex"
          style={{
            alignItems: "center", gap: 16, height: 48, padding: "0 24px",
            background: "var(--c-bg-elevated)", borderBottom: "1px solid var(--c-border)",
            position: "sticky", top: 0, zIndex: 40,
          }}
        >
          <button onClick={() => setCollapsed(v => !v)} title={collapsed ? "Menü einblenden" : "Menü ausblenden"} className="btn-icon" style={{ marginLeft: -6, flexShrink: 0 }} aria-label="Menü ein-/ausklappen">
            <PanelLeft size={16} style={{ color: "var(--c-fg-subtle)" }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-fg)", lineHeight: 1.2 }}>{pageLabel}</div>
            <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", lineHeight: 1.2, marginTop: 1 }}>{today}</div>
          </div>

          <button onClick={() => setShowSearch(true)} className="btn-ghost" style={{ width: 240, justifyContent: "space-between", color: "var(--c-fg-subtle)", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Search size={12} /> Suche
            </span>
            <span style={{ fontSize: 11, color: "var(--c-fg-faint)" }}>⌘K</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile header */}
        <header
          className="flex md:hidden"
          style={{
            alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", background: "var(--c-bg-elevated)",
            borderBottom: "1px solid var(--c-border)",
            position: "sticky", top: 0, zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Hamburger */}
            <button
              onClick={() => setShowDrawer(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 4 }}
              aria-label="Menü"
            >
              <span style={{ display: "block", width: 20, height: 2, background: "var(--c-fg)", borderRadius: 1 }} />
              <span style={{ display: "block", width: 14, height: 2, background: "var(--c-fg)", borderRadius: 1 }} />
              <span style={{ display: "block", width: 20, height: 2, background: "var(--c-fg)", borderRadius: 1 }} />
            </button>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={13} color="var(--c-accent-fg)" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--c-fg)", letterSpacing: -0.3 }}>Cutz</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn-icon" onClick={() => setShowSearch(true)} aria-label="Suche">
              <Search size={16} style={{ color: "var(--c-fg-subtle)" }} />
            </button>
            <ThemeToggle />
            <MobileUserButton showroom={showroom} />
          </div>
        </header>

        {/* ── Mobile Drawer ── */}
        <AnimatePresence>
          {showDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowDrawer(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}
                className="md:hidden"
              />
              {/* Slide-in panel */}
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{
                  position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201,
                  width: 280, background: "var(--c-bg-elevated)",
                  borderRight: "1px solid var(--c-border)",
                  display: "flex", flexDirection: "column",
                  overflowY: "auto",
                }}
                className="md:hidden"
              >
                {/* Drawer header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid var(--c-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Zap size={13} color="var(--c-accent-fg)" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fg-subtle)", textTransform: "uppercase", letterSpacing: 0.5 }}>Cutz Solution</span>
                  </div>
                  <button onClick={() => setShowDrawer(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <X size={18} style={{ color: "var(--c-fg-subtle)" }} />
                  </button>
                </div>

                {/* Drawer user */}
                {showroom ? (
                  <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(212,176,119,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--c-accent)" }}>DS</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fg)" }}>Demo Salon</div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 5px", borderRadius: 3, background: "rgba(212,176,119,0.15)", color: "var(--c-accent)" }}>Showroom</span>
                    </div>
                  </div>
                ) : null}

                {/* Nav sections */}
                <nav style={{ flex: 1, padding: "14px 8px 0" }} onClick={() => setShowDrawer(false)}>
                  <NavSection label="Workspace"     items={WORKSPACE} pathname={pathname} hrefTransform={navHref} />
                  <NavSection label="Analyse"       items={ANALYSE}   pathname={pathname} hrefTransform={navHref} />
                  <NavSection label="Konfiguration" items={CONFIG}    pathname={pathname} hrefTransform={navHref} />
                </nav>

                {/* Paul status */}
                <div style={{ padding: "0 8px 8px" }}>
                  <div style={{ background: "var(--c-bg-subtle)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <PaulPulse />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--c-fg)", flex: 1 }}>Paul · KI-Agent</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--c-fg-muted)" }}>Aktiv · antwortet automatisch</div>
                  </div>
                </div>

                {/* Legal */}
                <div style={{ padding: "0 12px 20px", display: "flex", gap: 10 }}>
                  <Link href="/impressum" onClick={() => setShowDrawer(false)} style={{ fontSize: 10, color: "var(--c-fg-faint)", textDecoration: "none" }}>Impressum</Link>
                  <span style={{ fontSize: 10, color: "var(--c-fg-faint)" }}>·</span>
                  <Link href="/datenschutz" onClick={() => setShowDrawer(false)} style={{ fontSize: 10, color: "var(--c-fg-faint)", textDecoration: "none" }}>Datenschutz</Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main style={{ flex: 1 }}>{children}</main>
      </div>

      {/* ══ Mobile bottom nav ════════════════════════════════ */}
      <nav className="bottom-nav md:hidden">
        {[...WORKSPACE, CONFIG[2]].map(({ href, label, icon: Icon, badge }) => {
          const resolvedHref = navHref(href);
          const active = isActive(resolvedHref, pathname);
          return (
            <Link key={resolvedHref} href={resolvedHref} className={`bottom-nav-item ${active ? "active" : ""}`}>
              <div style={{ position: "relative" }}>
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                {badge != null && badge > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: "50%", background: "var(--c-danger)", fontSize: 8, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {badge}
                  </span>
                )}
              </div>
              <span>{label === "Übersicht" ? "Home" : label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Waitlist notification banner */}
      <WaitlistBanner enabled={betaMode} />
      {!showroom && <NotificationToaster />}
      {!showroom && <BottomDock collapsed={collapsed} />}

      {/* Support modal */}
      <AnimatePresence>
        {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      </AnimatePresence>

      {/* Suche (⌘K) */}
      <AnimatePresence>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} navHref={navHref} />}
      </AnimatePresence>
    </div>
  );
}
