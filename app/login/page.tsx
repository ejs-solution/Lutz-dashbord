"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Scissors, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Decorative brand panel ──────────────────────────────── */
function BrandPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.setProperty("--mx", `${cx * 8}px`);
      el.style.setProperty("--my", `${cy * 8}px`);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #0C0B09 0%, #1A160F 50%, #0C0B09 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.4,
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute",
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,176,119,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Floating cards — parallax via CSS vars */}
      <div style={{
        position: "relative", zIndex: 1,
        transform: "translate(var(--mx, 0px), var(--my, 0px))",
        transition: "transform 0.12s ease-out",
        display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320,
      }}>

        {/* Main KPI card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: EASE }}
          style={{
            background: "rgba(26,22,15,0.85)",
            border: "1px solid var(--c-border-strong)",
            borderRadius: 16,
            padding: "20px 22px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-fg-subtle)", letterSpacing: "0.08em", marginBottom: 10 }}>
            HEUTE · MONTAG
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Umsatz", value: "€ 2.847" },
              { label: "Termine", value: "14 / 16" },
              { label: "Auslastung", value: "87 %" },
              { label: "Ø Bon", value: "€ 203" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--c-fg)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Paul card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, ease: EASE }}
          style={{
            background: "rgba(26,22,15,0.75)",
            border: "1px solid rgba(212,176,119,0.20)",
            borderRadius: 12,
            padding: "14px 16px",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-success)", flexShrink: 0, boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "var(--c-fg)" }}>Paul aktiv</div>
            <div style={{ fontSize: 11, color: "var(--c-fg-subtle)" }}>47 Aktionen · Ø 18s Reaktionszeit</div>
          </div>
        </motion.div>

        {/* Appointment row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ease: EASE }}
          style={{
            background: "rgba(26,22,15,0.75)",
            border: "1px solid var(--c-border)",
            borderRadius: 12,
            overflow: "hidden",
            backdropFilter: "blur(12px)",
          }}
        >
          {[
            { time: "10:00", name: "Dilara K.", service: "Balayage", stylist: "Aynur" },
            { time: "11:30", name: "Marco R.", service: "Herrenschnitt", stylist: "Monika" },
            { time: "13:00", name: "Sarah M.", service: "Coloration", stylist: "Aynur" },
          ].map(({ time, name, service, stylist }, i) => (
            <div key={time} style={{
              padding: "10px 14px",
              borderBottom: i < 2 ? "1px solid var(--c-border)" : "none",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--c-accent)", fontVariantNumeric: "tabular-nums" }}>{time}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg)" }}>{name}</div>
                  <div style={{ fontSize: 10, color: "var(--c-fg-subtle)" }}>{service}</div>
                </div>
              </div>
              <span style={{ fontSize: 10, color: "var(--c-fg-subtle)" }}>{stylist}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ position: "absolute", bottom: 32, textAlign: "center" }}
      >
        <div style={{ fontSize: 13, color: "var(--c-fg-subtle)", letterSpacing: "0.05em" }}>
          Dein Salon. Deine Daten. Dein Paul.
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Google SVG icon ──────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

/* ─── Login form ──────────────────────────────────────────── */
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") router.push("/");
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("E-Mail oder Passwort falsch.");
      } else if (res?.ok) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  if (status === "loading") return null;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "var(--c-bg)",
      fontFamily: "var(--font-geist-sans, sans-serif)",
    }}>

      {/* ── Left: Form ── */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", flexDirection: "column",
        padding: "40px 48px",
        borderRight: "1px solid var(--c-border)",
        background: "var(--c-bg)",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--c-accent-bg)",
            border: "1px solid rgba(212,176,119,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Scissors size={18} style={{ color: "var(--c-accent)" }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.5 }}>
            CUTZ
          </span>
        </motion.div>

        {/* Spacer */}
        <div style={{ flex: "0 0 64px" }} />

        {/* Form header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: EASE }}
          style={{ marginBottom: 28 }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.5, marginBottom: 6 }}>
            Willkommen zurück
          </h1>
          <p style={{ fontSize: 14, color: "var(--c-fg-subtle)" }}>
            Salon-Management · KI-Agent Paul
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, ease: EASE }}
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)" }}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@salon.de"
              autoComplete="email"
              required
              style={{
                background: "var(--c-bg-elevated)",
                border: `1px solid ${error ? "var(--c-danger)" : "var(--c-border-strong)"}`,
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 14, color: "var(--c-fg)",
                outline: "none",
                transition: "border-color 0.15s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--c-accent)"; }}
              onBlur={(e)  => { e.target.style.borderColor = error ? "var(--c-danger)" : "var(--c-border-strong)"; }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)" }}>Passwort</label>
              <button type="button" style={{ fontSize: 12, color: "var(--c-accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Vergessen?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  background: "var(--c-bg-elevated)",
                  border: `1px solid ${error ? "var(--c-danger)" : "var(--c-border-strong)"}`,
                  borderRadius: 10,
                  padding: "11px 42px 11px 14px",
                  fontSize: 14, color: "var(--c-fg)",
                  outline: "none",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--c-accent)"; }}
                onBlur={(e)  => { e.target.style.borderColor = error ? "var(--c-danger)" : "var(--c-border-strong)"; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--c-fg-subtle)", padding: 2,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: "var(--c-accent)", cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: "var(--c-fg-subtle)" }}>Eingeloggt bleiben (30 Tage)</span>
          </label>

          {/* Error toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px", borderRadius: 10,
                  background: "var(--c-danger)", color: "#fff",
                  fontSize: 13, fontWeight: 600,
                }}
              >
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 0",
              background: loading ? "var(--c-bg-strong)" : "var(--c-accent)",
              color: loading ? "var(--c-fg-subtle)" : "var(--c-accent-fg)",
              border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              marginTop: 2,
            }}
          >
            {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Anmelden...</> : "Anmelden"}
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--c-border-strong)" }} />
            <span style={{ fontSize: 12, color: "var(--c-fg-subtle)", fontWeight: 600 }}>oder</span>
            <div style={{ flex: 1, height: 1, background: "var(--c-border-strong)" }} />
          </div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "11px 0",
              background: "transparent",
              border: "1px solid var(--c-border-strong)",
              borderRadius: 10,
              fontSize: 14, fontWeight: 700, color: "var(--c-fg)",
              cursor: googleLoading ? "not-allowed" : "pointer",
              transition: "border-color 0.15s, background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--c-bg-elevated)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--c-border-strong)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {googleLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <GoogleIcon />}
            Mit Google anmelden
          </motion.button>
        </motion.form>

        {/* Demo hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 20,
            padding: "12px 14px",
            background: "var(--c-bg-elevated)",
            borderRadius: 10,
            border: "1px solid var(--c-border)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-fg-subtle)", marginBottom: 4 }}>DEMO-ZUGANG</div>
          <div style={{ fontSize: 12, color: "var(--c-fg-muted)", fontFamily: "monospace" }}>
            demo@cutzsolution.com / demo123
          </div>
        </motion.div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ textAlign: "center", fontSize: 13, color: "var(--c-fg-subtle)", marginTop: 24 }}
        >
          Noch kein Account?{" "}
          <Link href="/signup" style={{ color: "var(--c-accent)", fontWeight: 700, textDecoration: "none" }}>
            Salon anlegen
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ textAlign: "center", fontSize: 11, color: "var(--c-fg-faint)", marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}
        >
          <Link href="/impressum" style={{ color: "var(--c-fg-faint)", textDecoration: "none" }}>Impressum</Link>
          <span>·</span>
          <Link href="/datenschutz" style={{ color: "var(--c-fg-faint)", textDecoration: "none" }}>Datenschutz</Link>
        </motion.div>
      </div>

      {/* ── Right: Brand panel (desktop only) ── */}
      <div className="hidden lg:flex" style={{ flex: 1 }}>
        <BrandPanel />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--c-fg-faint); }
      `}</style>
    </div>
  );
}
