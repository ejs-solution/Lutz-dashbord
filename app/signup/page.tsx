"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Scissors, ChevronRight, ChevronLeft, Check, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Service categories for step 3 ──────────────────────── */
const SERVICE_CATS = [
  { id: "herrenschnitt",  label: "Herrenschnitte",     desc: "Klassisch, Fade, Undercut" },
  { id: "damenschnitt",   label: "Damenschnitte",      desc: "Kurz, Mittellang, Lang, Bob" },
  { id: "bart",           label: "Bart & Rasur",       desc: "Bartschnitt, Nassrasur" },
  { id: "coloration",     label: "Colorationen",       desc: "Ansatz, Balayage, Strähnen" },
  { id: "pflege",         label: "Pflege & Treatments", desc: "Haarkur, Kopfmassage" },
  { id: "styling",        label: "Styling",            desc: "Föhnen, Hochsteckfrisur" },
];

type Step1Data = { name: string; email: string; password: string; confirm: string };
type Step2Data = { salonName: string; address: string; phone: string; city: string };
type Step3Data = { categories: string[] };

/* ─── Progress bar ────────────────────────────────────────── */
function ProgressBar({ step }: { step: number }) {
  const steps = ["Account", "Salon", "Services"];
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        {steps.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
              background: i < step ? "var(--c-accent)" : i === step ? "var(--c-bg-elevated)" : "transparent",
              border: `2px solid ${i <= step ? "var(--c-accent)" : "var(--c-border-strong)"}`,
              color: i < step ? "var(--c-accent-fg)" : i === step ? "var(--c-accent)" : "var(--c-fg-subtle)",
              transition: "all 0.3s",
              flexShrink: 0,
            }}>
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: i <= step ? "var(--c-fg-muted)" : "var(--c-fg-subtle)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: 2, background: "var(--c-border-strong)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${(step / 2) * 100}%` }}
          transition={{ ease: EASE, duration: 0.4 }}
          style={{ height: "100%", background: "var(--c-accent)", borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

/* ─── Input component ─────────────────────────────────────── */
function Field({
  label, type = "text", value, onChange, placeholder, error, suffix,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; suffix?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--c-fg-muted)" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "var(--c-bg-elevated)",
            border: `1px solid ${error ? "var(--c-danger)" : "var(--c-border-strong)"}`,
            borderRadius: 10,
            padding: suffix ? "11px 42px 11px 14px" : "11px 14px",
            fontSize: 14, color: "var(--c-fg)",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--c-accent)"; }}
          onBlur={(e)  => { e.target.style.borderColor = error ? "var(--c-danger)" : "var(--c-border-strong)"; }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 11, color: "var(--c-danger)" }}>{error}</span>}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const [s1, setS1] = useState<Step1Data>({ name: "", email: "", password: "", confirm: "" });
  const [s2, setS2] = useState<Step2Data>({ salonName: "", address: "", phone: "", city: "" });
  const [s3, setS3] = useState<Step3Data>({ categories: [] });

  const toggleCat = (id: string) => {
    setS3((prev) => ({
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!s1.name.trim())            e.name     = "Name ist erforderlich";
    if (!s1.email.includes("@"))    e.email    = "Ungültige E-Mail";
    if (s1.password.length < 8)     e.password = "Mindestens 8 Zeichen";
    if (s1.password !== s1.confirm) e.confirm  = "Passwörter stimmen nicht überein";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!s2.salonName.trim()) e.salonName = "Salon-Name ist erforderlich";
    if (!s2.city.trim())      e.city      = "Stadt ist erforderlich";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s1, ...s2, categories: s3.categories }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setErrors({ submit: data.error ?? "Fehler beim Erstellen des Accounts" });
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setErrors({ submit: "Netzwerkfehler. Bitte versuche es erneut." });
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--c-bg)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "48px 16px",
      fontFamily: "var(--font-geist-sans, sans-serif)",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--c-accent-bg)",
            border: "1px solid rgba(212,176,119,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Scissors size={18} style={{ color: "var(--c-accent)" }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "var(--c-fg)", letterSpacing: -0.5 }}>CUTZ</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            background: "var(--c-bg-elevated)",
            border: "1px solid var(--c-border-strong)",
            borderRadius: 18,
            padding: "32px 36px",
          }}
        >
          <ProgressBar step={step} />

          <AnimatePresence mode="wait">

            {/* ── Step 0: Account ── */}
            {step === 0 && (
              <motion.div key="s0"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE, duration: 0.22 }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--c-fg)", marginBottom: 4 }}>Account erstellen</h2>
                <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginBottom: 24 }}>Deine persönlichen Zugangsdaten</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Name" value={s1.name} onChange={(v) => setS1((p) => ({ ...p, name: v }))} placeholder="Max Mustermann" error={errors.name} />
                  <Field label="E-Mail" type="email" value={s1.email} onChange={(v) => setS1((p) => ({ ...p, email: v }))} placeholder="max@salon.de" error={errors.email} />
                  <Field
                    label="Passwort" type={showPw ? "text" : "password"}
                    value={s1.password} onChange={(v) => setS1((p) => ({ ...p, password: v }))}
                    placeholder="Mindestens 8 Zeichen" error={errors.password}
                    suffix={
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-fg-subtle)", padding: 0 }}>
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    }
                  />
                  <Field
                    label="Passwort bestätigen" type={showPw2 ? "text" : "password"}
                    value={s1.confirm} onChange={(v) => setS1((p) => ({ ...p, confirm: v }))}
                    placeholder="Gleich wie oben" error={errors.confirm}
                    suffix={
                      <button type="button" onClick={() => setShowPw2(!showPw2)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-fg-subtle)", padding: 0 }}>
                        {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    }
                  />
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Salon ── */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE, duration: 0.22 }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--c-fg)", marginBottom: 4 }}>Salon-Details</h2>
                <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginBottom: 24 }}>Grunddaten deines Betriebs</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Salon-Name" value={s2.salonName} onChange={(v) => setS2((p) => ({ ...p, salonName: v }))} placeholder="Maincut Maintal" error={errors.salonName} />
                  <Field label="Straße & Hausnummer" value={s2.address} onChange={(v) => setS2((p) => ({ ...p, address: v }))} placeholder="Musterstraße 12" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Stadt" value={s2.city} onChange={(v) => setS2((p) => ({ ...p, city: v }))} placeholder="Maintal" error={errors.city} />
                    <Field label="Telefon" type="tel" value={s2.phone} onChange={(v) => setS2((p) => ({ ...p, phone: v }))} placeholder="+49 6181 …" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Services ── */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE, duration: 0.22 }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--c-fg)", marginBottom: 4 }}>Services aktivieren</h2>
                <p style={{ fontSize: 13, color: "var(--c-fg-subtle)", marginBottom: 24 }}>
                  Was bietet dein Salon an? (Du kannst das später jederzeit ändern.)
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SERVICE_CATS.map((cat) => {
                    const active = s3.categories.includes(cat.id);
                    return (
                      <motion.button
                        key={cat.id}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCat(cat.id)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                          background: active ? "var(--c-accent-bg)" : "var(--c-bg-subtle)",
                          border: `1px solid ${active ? "rgba(212,176,119,0.35)" : "var(--c-border)"}`,
                          transition: "all 0.15s",
                          fontFamily: "inherit",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: active ? "var(--c-accent)" : "var(--c-fg)" }}>{cat.label}</div>
                          <div style={{ fontSize: 11, color: "var(--c-fg-subtle)", marginTop: 2 }}>{cat.desc}</div>
                        </div>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: active ? "var(--c-accent)" : "transparent",
                          border: `2px solid ${active ? "var(--c-accent)" : "var(--c-border-strong)"}`,
                          transition: "all 0.15s",
                        }}>
                          {active && <Check size={11} style={{ color: "var(--c-accent-fg)" }} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {errors.submit && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--c-danger)", color: "#fff", fontSize: 13 }}>
                    {errors.submit}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── Nav buttons ── */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep((s) => s - 1)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "11px 20px", borderRadius: 10,
                  background: "transparent", border: "1px solid var(--c-border-strong)",
                  fontSize: 14, fontWeight: 700, color: "var(--c-fg-muted)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <ChevronLeft size={15} /> Zurück
              </motion.button>
            )}

            {step < 2 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px 0", borderRadius: 10,
                  background: "var(--c-accent)", color: "var(--c-accent-fg)",
                  border: "none", fontSize: 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Weiter <ChevronRight size={15} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: loading ? 1 : 0.97 }}
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 0", borderRadius: 10,
                  background: loading ? "var(--c-bg-strong)" : "var(--c-accent)",
                  color: loading ? "var(--c-fg-subtle)" : "var(--c-accent-fg)",
                  border: "none", fontSize: 14, fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                {loading
                  ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Erstelle Account…</>
                  : <><Check size={15} /> Salon anlegen</>}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--c-fg-subtle)" }}>
          Bereits registriert?{" "}
          <Link href="/login" style={{ color: "var(--c-accent)", fontWeight: 700, textDecoration: "none" }}>
            Anmelden
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--c-fg-faint); }
      `}</style>
    </div>
  );
}
