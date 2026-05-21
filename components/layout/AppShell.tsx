"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, CalendarDays, Users, Settings,
  Sun, Moon, Zap,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/",        label: "Übersicht", icon: LayoutDashboard },
  { href: "/inbox",   label: "Inbox",     icon: Inbox },
  { href: "/kalender",label: "Kalender",  icon: CalendarDays },
  { href: "/crm",     label: "Kunden",    icon: Users },
  { href: "/settings",label: "Settings",  icon: Settings },
];

function ThemeButton() {
  const { theme, toggle } = useTheme();
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={toggle}
      className="btn-ghost"
      style={{ padding: "8px 10px", borderRadius: 10, border: "none", background: "transparent" }}
      title={theme === "dark" ? "Helles Design" : "Dunkles Design"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex" }}
        >
          {theme === "dark"
            ? <Sun size={18} style={{ color: "var(--accent)" }} />
            : <Moon size={18} style={{ color: "var(--text-sub)" }} />
          }
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex"
        style={{
          width: 220,
          flexShrink: 0,
          flexDirection: "column",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--accent)",
                boxShadow: "var(--shadow-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={18} color="#0a0a18" strokeWidth={2.5} />
            </motion.div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "var(--text)", letterSpacing: -0.3 }}>
                Cutz Solution
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Salon OS · Paul KI
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`} style={{ marginBottom: 2, position: "relative" }}>
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    style={{
                      position: "absolute", inset: 0,
                      background: "var(--accent-glow)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: 10,
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={16} style={{ color: active ? "var(--accent)" : undefined }} />
                <span style={{ color: active ? "var(--text)" : undefined }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom of sidebar */}
        <div style={{ padding: "10px 8px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} className="pulse" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Paul aktiv</span>
            </div>
            <ThemeButton />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", padding: "0 6px" }}>
            v2.0 · Salon OS
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: 72 }} className="md:pb-0">

        {/* Mobile Header */}
        <header
          className="flex md:hidden"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={15} color="#0a0a18" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 17, color: "var(--text)", letterSpacing: -0.3 }}>Cutz</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-border)", padding: "2px 7px", borderRadius: 999 }}>
              Paul aktiv
            </span>
          </div>
          <ThemeButton />
        </header>

        <main>{children}</main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`bottom-nav-item ${active ? "active" : ""}`}>
              <motion.div
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Icon size={20} />
              </motion.div>
              <span>{label === "Übersicht" ? "Home" : label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
