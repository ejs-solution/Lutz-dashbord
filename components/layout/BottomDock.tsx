"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Inbox, CalendarDays, Users, Settings } from "lucide-react";

const ITEMS = [
  { href: "/",         label: "Home",         icon: LayoutDashboard },
  { href: "/inbox",    label: "Inbox",        icon: Inbox },
  { href: "/kalender", label: "Kalender",     icon: CalendarDays },
  { href: "/crm",      label: "Kunden",       icon: Users },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

// Schwebender, mittiger Dock auf dem Desktop — erscheint, wenn die Maus nach unten geht,
// und verschwindet wieder, wenn sie sich entfernt.
export default function BottomDock({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setShow(window.innerHeight - e.clientY < 90);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Über dem Inhaltsbereich zentrieren: Container startet nach der Sidebar (220px) und
  // zentriert den Dock per Flexbox — zuverlässiger als absolute Positionierung.
  return (
    <div className="bottom-dock-wrap" style={{ left: collapsed ? 0 : 220 }}>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 34 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onMouseLeave={() => setShow(false)}
            style={{
              pointerEvents: "auto", display: "flex", gap: 4, padding: 6,
              background: "var(--c-bg-elevated)", border: "1px solid var(--c-border)",
              borderRadius: 16, boxShadow: "0 14px 44px rgba(0,0,0,0.32)",
            }}
          >
            {ITEMS.map((it) => {
              const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  title={it.label}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "9px 15px", borderRadius: 12, textDecoration: "none",
                    background: active ? "var(--c-accent-bg)" : "transparent",
                    color: active ? "var(--c-accent)" : "var(--c-fg-muted)",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <it.icon size={19} strokeWidth={active ? 2.2 : 1.9} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{it.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
