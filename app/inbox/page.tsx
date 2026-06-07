"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Phone, Mail, AtSign,
  UserCheck, Play, Send, ChevronLeft, Zap, RefreshCw, ExternalLink,
} from "lucide-react";
import { conversations, type Conversation } from "@/lib/mock-data";
import { useBeta } from "@/lib/beta-context";

/* ─── Types ──────────────────────────────────────────────── */
type GmailMessage = {
  id: string; threadId: string; from: string;
  subject: string; date: string; snippet: string; unread: boolean;
};
type Channel = "alle" | "gmail" | "whatsapp" | "instagram";

/* ─── Constants ──────────────────────────────────────────── */
const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const AVATAR_COLORS = ["#D4B077","#60a5fa","#34d399","#f472b6","#a78bfa","#fb923c","#22d3ee","#4ade80"];

const channelMeta: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
  whatsapp:  { icon: <MessageSquare size={14} />, label: "WhatsApp", class: "ch-whatsapp" },
  instagram: { icon: <AtSign size={14} />,         label: "Instagram", class: "ch-instagram" },
  email:     { icon: <Mail size={14} />,           label: "E-Mail",    class: "ch-email"     },
  voice:     { icon: <Phone size={14} />,          label: "Anruf",     class: "ch-voice"     },
};
const statusBadge: Record<string, { label: string; cls: string }> = {
  neu:           { label: "Neu",           cls: "badge-gold"  },
  buchung:       { label: "Buchung",       cls: "badge-green" },
  abgeschlossen: { label: "Abgeschlossen", cls: "badge-gray"  },
  wartend:       { label: "Wartend",       cls: "badge-blue"  },
};

/* ─── Helpers ────────────────────────────────────────────── */
function parseFrom(from: string) {
  const m = from.match(/^"?([^"<]+)"?\s*<(.+)>$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { name: from, email: from };
}
function getInitials(name: string) {
  return name.split(/\s+/).map(p => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
}
function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function formatDate(ts: string) {
  const d = new Date(parseInt(ts)), diff = Date.now() - d.getTime();
  return diff < 86_400_000
    ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

/* ─── Shared avatar ──────────────────────────────────────── */
function Av({ name, size = 40, fs = 14, unread = 0 }: { name: string; size?: number; fs?: number; unread?: number }) {
  const c = getColor(name);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `${c}22`, border: `1.5px solid ${c}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs, fontWeight: 800, color: c, userSelect: "none" }}>
        {getInitials(name)}
      </div>
      {unread > 0 && (
        <span style={{ position: "absolute", top: -2, right: -2, background: "var(--red)", color: "#fff", width: 16, height: 16, borderRadius: "50%", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </div>
  );
}

/* ─── Gmail card ─────────────────────────────────────────── */
function GmailCard({ msg, selected, onClick, delay }: { msg: GmailMessage; selected: boolean; onClick: () => void; delay: number }) {
  const { name } = parseFrom(msg.from);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, ease: EASE }}
      onClick={onClick}
      style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected ? "var(--accent-glow)" : "transparent", borderLeft: selected ? "2px solid var(--accent)" : "2px solid transparent", transition: "background 0.15s" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <Av name={name} size={40} fs={14} unread={msg.unread ? 1 : 0} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontWeight: msg.unread ? 800 : 600, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{name}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{formatDate(msg.date)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span className="ch-email" style={{ display: "flex" }}><Mail size={12} /></span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Gmail</span>
            {msg.unread && <span className="badge badge-gold" style={{ fontSize: 9, padding: "2px 6px" }}>Neu</span>}
          </div>
          <div style={{ fontSize: 12, color: msg.unread ? "var(--text)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: msg.unread ? 600 : 400 }}>
            {msg.subject || "(kein Betreff)"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Gmail detail ───────────────────────────────────────── */
function GmailDetail({ msg, onBack }: { msg: GmailMessage; onBack: () => void }) {
  const { name, email } = parseFrom(msg.from);
  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${msg.threadId}`;
  return (
    <>
      <div style={{ padding: "14px 18px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button className="md:hidden btn-ghost" style={{ padding: "6px 8px", marginRight: -4 }} onClick={onBack}><ChevronLeft size={18} /></button>
        <Av name={name} size={38} fs={13} />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <span className="ch-email" style={{ display: "flex" }}><Mail size={12} /></span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Gmail · {email}</span>
          </div>
        </div>
        <a href={gmailUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "var(--accent)", color: "#0a0a18", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          <ExternalLink size={13} /> Gmail öffnen
        </a>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{name} · {formatDate(msg.date)}</div>
          <div className="bubble-customer" style={{ maxWidth: "80%" }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{msg.subject || "(kein Betreff)"}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{msg.snippet}</div>
          </div>
        </motion.div>
      </div>
      <div style={{ padding: "12px 18px", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <Mail size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Im Gmail antworten →{" "}
            <a href={gmailUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>Antwort schreiben</a>
          </span>
        </div>
      </div>
    </>
  );
}

/* ─── Chat view (right panel for conversations) ──────────── */
function ChatView({ convo, onBack, onTogglePaul, replyText, setReplyText, onSend }: {
  convo: Conversation; onBack: () => void;
  onTogglePaul: () => void;
  replyText: string; setReplyText: (v: string) => void; onSend: () => void;
}) {
  const ch = channelMeta[convo.channel];
  return (
    <>
      <div style={{ padding: "14px 18px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button className="md:hidden btn-ghost" style={{ padding: "6px 8px", marginRight: -4 }} onClick={onBack}><ChevronLeft size={18} /></button>
        <div className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>{convo.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{convo.customerName}</span>
            <span style={{ fontSize: 14 }}>{convo.langFlag}</span>
            {convo.isVIP && <span className="badge badge-gold" style={{ fontSize: 9 }}>VIP</span>}
            {convo.isRegular && <span className="badge badge-gray" style={{ fontSize: 9 }}>Stammkunde</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <span className={ch.class} style={{ display: "flex" }}>{ch.icon}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{ch.label} · {convo.language}</span>
            {convo.paulTyping && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
                <Zap size={11} /> Paul tippt
                <span style={{ display: "flex", gap: 3 }}><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></span>
              </span>
            )}
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.94 }} onClick={onTogglePaul} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: convo.paulPaused ? "var(--green)" : "var(--accent)", color: "#0a0a18", transition: "background 0.2s" }}>
          {convo.paulPaused ? <><Play size={13} /> Paul fortsetzen</> : <><UserCheck size={13} /> Take Over</>}
        </motion.button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {convo.messages.map((msg, i) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: EASE }} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "customer" ? "flex-end" : "flex-start" }}>
            {msg.role !== "customer" && (
              <div style={{ fontSize: 11, fontWeight: 700, color: msg.role === "paul" ? "var(--accent)" : "var(--blue)", marginBottom: 4, marginLeft: 4, display: "flex", alignItems: "center", gap: 4 }}>
                {msg.role === "paul" ? <><Zap size={10} /> Paul KI</> : <><UserCheck size={10} /> Du</>}
              </div>
            )}
            <div className={msg.role === "customer" ? "bubble-customer" : "bubble-paul"}>{msg.text}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{msg.time}</div>
          </motion.div>
        ))}
        {convo.paulTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Zap size={10} /> Paul KI tippt</div>
            <div className="bubble-paul" style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </motion.div>
        )}
      </div>
      <div style={{ padding: "12px 18px", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end" }}>
        {convo.paulPaused ? (
          <>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} placeholder={`Antworten als ${convo.channel}...`} rows={2} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", fontSize: 14, color: "var(--text)", resize: "none", outline: "none", fontFamily: "inherit" }} />
            <motion.button whileTap={{ scale: 0.92 }} onClick={onSend} className="btn-gold" style={{ padding: "10px 14px", borderRadius: 10 }}><Send size={16} /></motion.button>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <Zap size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Paul beantwortet automatisch. <strong style={{ color: "var(--accent)" }}>Take Over</strong> zum selbst schreiben.</span>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function InboxPage() {
  const { betaMode } = useBeta();
  const [convos, setConvos]           = useState<Conversation[]>(conversations);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [replyText, setReplyText]     = useState("");
  const [showMobile, setShowMobile]   = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel>("gmail");

  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [gmailLoading, setGmailLoading]   = useState(false);
  const [gmailError, setGmailError]       = useState<string | null>(null);
  const [selectedMail, setSelectedMail]   = useState<GmailMessage | null>(null);

  // Switch to demo channel when betaMode becomes active
  useEffect(() => {
    if (betaMode) setActiveChannel("alle");
    else          setActiveChannel("gmail");
  }, [betaMode]);

  const loadGmail = () => {
    if (betaMode) return; // Never load real data in demo/beta mode
    setGmailLoading(true); setGmailError(null);
    fetch("/api/gmail")
      .then(r => r.json())
      .then(d => {
        if (d.error === "not_connected") setGmailError("not_connected");
        else if (d.error) setGmailError(d.error);
        else setGmailMessages(d.messages ?? []);
      })
      .catch(e => setGmailError(String(e)))
      .finally(() => setGmailLoading(false));
  };

  useEffect(() => {
    if (betaMode) return; // No real data in demo mode
    if (activeChannel === "gmail" && gmailMessages.length === 0 && !gmailError) loadGmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel, betaMode]);

  const togglePaul = (id: string) => {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, paulPaused: !c.paulPaused } : c));
    setSelectedConvo(s => s?.id === id ? { ...s, paulPaused: !s.paulPaused } : s);
  };

  const sendReply = () => {
    if (!replyText.trim() || !selectedConvo) return;
    const msg = { id: `m${Date.now()}`, role: "human" as const, text: replyText, time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
    const updated = convos.map(c => c.id === selectedConvo.id ? { ...c, messages: [...c.messages, msg], lastMessage: replyText, unread: 0 } : c);
    setConvos(updated);
    setSelectedConvo(updated.find(c => c.id === selectedConvo.id) ?? null);
    setReplyText("");
  };

  const selectConvo = (c: Conversation) => {
    setSelectedConvo(c); setShowMobile(true);
    setConvos(prev => prev.map(cv => cv.id === c.id ? { ...cv, unread: 0 } : cv));
  };

  // Conversations filtered by channel
  const filteredConvos = activeChannel === "alle"
    ? convos
    : convos.filter(c => c.channel === activeChannel);

  // Tabs config
  const tabs = betaMode
    ? [
        { key: "alle" as Channel,      label: "Alle",      icon: <MessageSquare size={13} />, soon: false },
        { key: "whatsapp" as Channel,  label: "WhatsApp",  icon: <MessageSquare size={13} />, soon: false },
        { key: "instagram" as Channel, label: "Instagram", icon: <AtSign size={13} />,        soon: false },
        { key: "gmail" as Channel,     label: "Gmail",     icon: <Mail size={13} />,          soon: false },
      ]
    : [
        { key: "gmail" as Channel,     label: "Gmail",     icon: <Mail size={13} />,          soon: false },
        { key: "whatsapp" as Channel,  label: "WhatsApp",  icon: <MessageSquare size={13} />, soon: true  },
        { key: "instagram" as Channel, label: "Instagram", icon: <AtSign size={13} />,        soon: true  },
      ];

  const unreadCount = betaMode
    ? convos.filter(c => c.unread > 0).length
    : gmailMessages.filter(m => m.unread).length;

  const showConvos = betaMode && activeChannel !== "gmail";
  const showGmail  = activeChannel === "gmail" && !betaMode;
  const showGmailBeta = betaMode && activeChannel === "gmail";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 0, height: "calc(100vh - 52px)" }} className="md:h-[calc(100vh-0px)]">

      {/* ── Desktop header ── */}
      <div style={{ padding: "16px 20px 0", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "none" }} className="md:flex md:flex-col">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: -0.3 }}>Live-Inbox</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {unreadCount > 0 ? `${unreadCount} ungelesen · ` : ""}
              {betaMode ? "Demo-Daten" : "Gmail"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!betaMode && (
              <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={loadGmail}><RefreshCw size={13} /></button>
            )}
            {betaMode && (
              <div className="paul-active">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} className="pulse" />
                Paul aktiv · {convos.filter(c => !c.paulPaused).length} Chats
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(({ key, label, icon, soon }) => (
            <button key={key} onClick={() => !soon && setActiveChannel(key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13, fontWeight: 700, border: "none", cursor: soon ? "default" : "pointer", background: "transparent", color: activeChannel === key ? "var(--text)" : "var(--text-muted)", borderBottom: activeChannel === key ? "2px solid var(--accent)" : "2px solid transparent", transition: "all 0.15s", opacity: soon ? 0.5 : 1 }}>
              {icon} {label}
              {soon && <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 3, background: "var(--c-bg-strong)", color: "var(--text-muted)" }}>bald</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split layout ── */}
      <div style={{ display: "flex", height: "calc(100% - 97px)", overflow: "hidden" }}>

        {/* ── LEFT ── */}
        <div className={`${showMobile ? "hidden" : "flex"} md:flex`} style={{ width: "100%", maxWidth: 340, flexShrink: 0, flexDirection: "column", borderRight: "1px solid var(--border)", overflowY: "auto", background: "var(--surface)" }}>

          {/* Mobile header */}
          <div className="flex md:hidden" style={{ padding: "16px 16px 8px", borderBottom: "1px solid var(--border)", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>Live-Inbox</h1>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{betaMode ? "Demo-Daten" : "Gmail"}</p>
              </div>
              {!betaMode && <button className="btn-ghost" style={{ padding: "5px 8px" }} onClick={loadGmail}><RefreshCw size={13} /></button>}
            </div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
              {tabs.map(({ key, label, icon, soon }) => (
                <button key={key} onClick={() => !soon && setActiveChannel(key)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 12, fontWeight: 700, border: "none", cursor: soon ? "default" : "pointer", background: "transparent", color: activeChannel === key ? "var(--text)" : "var(--text-muted)", borderBottom: activeChannel === key ? "2px solid var(--accent)" : "2px solid transparent", opacity: soon ? 0.5 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Beta: conversation list (alle / whatsapp / instagram) */}
          {showConvos && filteredConvos.map((c, i) => {
            const ch = channelMeta[c.channel];
            const isSel = selectedConvo?.id === c.id;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, ease: EASE }} onClick={() => selectConvo(c)} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: isSel ? "var(--accent-glow)" : "transparent", borderLeft: isSel ? "2px solid var(--accent)" : "2px solid transparent", transition: "background 0.15s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <div style={{ position: "relative" }}>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{c.avatar}</div>
                    {c.unread > 0 && <span style={{ position: "absolute", top: -2, right: -2, background: "var(--red)", color: "white", width: 16, height: 16, borderRadius: "50%", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.unread}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{c.customerName}</span>
                        <span style={{ fontSize: 13 }}>{c.langFlag}</span>
                        {c.isVIP && <span className="badge badge-gold" style={{ fontSize: 9, padding: "2px 5px" }}>VIP</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span className={ch.class} style={{ display: "flex" }}>{ch.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{ch.label}</span>
                      <span className={`badge ${statusBadge[c.status].cls}`} style={{ fontSize: 9, padding: "2px 6px" }}>{statusBadge[c.status].label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.paulTyping ? <span style={{ color: "var(--accent)", fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}><Zap size={11} /> Paul tippt...</span> : c.lastMessage}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Live: Gmail list */}
          {(showGmail || showGmailBeta) && (
            gmailLoading ? (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4,5].map(n => <div key={n} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}
              </div>
            ) : gmailError === "not_connected" ? (
              <div style={{ padding: 24, textAlign: "center" }}>
                <Mail size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
                <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6, fontSize: 14 }}>Gmail nicht verbunden</p>
                <a href="/integrations" className="btn-gold" style={{ display: "inline-flex", fontSize: 13 }}>Integrationen</a>
              </div>
            ) : gmailError ? (
              <div style={{ padding: 16, fontSize: 12, color: "var(--red)" }}>Fehler: {gmailError}</div>
            ) : gmailMessages.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Keine E-Mails gefunden.</div>
            ) : (
              gmailMessages.map((msg, i) => (
                <GmailCard key={msg.id} msg={msg} delay={i * 0.04} selected={selectedMail?.id === msg.id} onClick={() => { setSelectedMail(msg); setShowMobile(true); }} />
              ))
            )
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className={`${showMobile ? "flex" : "hidden"} md:flex`} style={{ flex: 1, flexDirection: "column", overflow: "hidden", background: "var(--bg-2)" }}>

          {/* Conversation detail */}
          {showConvos && selectedConvo ? (
            <ChatView convo={selectedConvo} onBack={() => setShowMobile(false)} onTogglePaul={() => togglePaul(selectedConvo.id)} replyText={replyText} setReplyText={setReplyText} onSend={sendReply} />
          ) : showConvos && !selectedConvo ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <MessageSquare size={40} style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Gespräch auswählen</p>
            </div>
          ) : null}

          {/* Gmail detail */}
          {(showGmail || showGmailBeta) && selectedMail ? (
            <GmailDetail msg={selectedMail} onBack={() => setShowMobile(false)} />
          ) : (showGmail || showGmailBeta) && !selectedMail ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <Mail size={40} style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>E-Mail auswählen</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
