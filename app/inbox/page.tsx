"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Phone, Mail, AtSign,
  UserCheck, Pause, Play, Send, ChevronLeft, Zap,
} from "lucide-react";
import { conversations, type Conversation } from "@/lib/mock-data";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const channelMeta: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
  whatsapp:  { icon: <MessageSquare size={14} />, label: "WhatsApp", class: "ch-whatsapp" },
  instagram: { icon: <AtSign size={14} />,         label: "Instagram", class: "ch-instagram" },
  email:     { icon: <Mail size={14} />,           label: "E-Mail",    class: "ch-email" },
  voice:     { icon: <Phone size={14} />,          label: "Anruf",     class: "ch-voice" },
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  neu:           { label: "Neu",           cls: "badge-gold" },
  buchung:       { label: "Buchung",       cls: "badge-green" },
  abgeschlossen: { label: "Abgeschlossen", cls: "badge-gray" },
  wartend:       { label: "Wartend",       cls: "badge-blue" },
};

export default function InboxPage() {
  const [convos, setConvos] = useState<Conversation[]>(conversations);
  const [selected, setSelected] = useState<Conversation | null>(convos[0]);
  const [replyText, setReplyText] = useState("");
  const [showMobile, setShowMobile] = useState(false);

  const togglePaul = (id: string) => {
    setConvos((prev) => prev.map((c) => c.id === id ? { ...c, paulPaused: !c.paulPaused } : c));
    if (selected?.id === id) setSelected((s) => s ? { ...s, paulPaused: !s.paulPaused } : s);
  };

  const sendReply = () => {
    if (!replyText.trim() || !selected) return;
    const msg = { id: `m${Date.now()}`, role: "human" as const, text: replyText, time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
    const updated = convos.map((c) => c.id === selected.id ? { ...c, messages: [...c.messages, msg], lastMessage: replyText, unread: 0 } : c);
    setConvos(updated);
    setSelected(updated.find((c) => c.id === selected.id) ?? null);
    setReplyText("");
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0", height: "calc(100vh - 52px)" }}
         className="md:h-[calc(100vh-0px)]">

      {/* ── Desktop: header bar ── */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "none" }} className="md:flex">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: -0.3 }}>Live-Inbox</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {convos.filter((c) => c.unread > 0).length} ungelesene · Paul überwacht alle Kanäle
            </p>
          </div>
          <div className="paul-active">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} className="pulse" />
            Paul aktiv · {convos.filter((c) => !c.paulPaused).length} Chats
          </div>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div style={{ display: "flex", height: "calc(100% - 73px)", overflow: "hidden" }}>

        {/* ── LEFT: Chat List ── */}
        <div
          className={`${showMobile ? "hidden" : "flex"} md:flex`}
          style={{
            width: "100%", maxWidth: 340,
            flexShrink: 0,
            flexDirection: "column",
            borderRight: "1px solid var(--border)",
            overflowY: "auto",
            background: "var(--surface)",
          }}
        >
          {/* Mobile header */}
          <div className="flex md:hidden" style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>Live-Inbox</h1>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Paul überwacht alle Kanäle</p>
            </div>
          </div>

          {convos.map((c, i) => {
            const ch = channelMeta[c.channel];
            const isSelected = selected?.id === c.id;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: EASE }}
                onClick={() => { setSelected(c); setShowMobile(true); setConvos((p) => p.map((cv) => cv.id === c.id ? { ...cv, unread: 0 } : cv)); }}
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: isSelected ? "var(--accent-glow)" : "transparent",
                  borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  {/* Avatar */}
                  <div style={{ position: "relative" }}>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{c.avatar}</div>
                    {c.unread > 0 && (
                      <span style={{
                        position: "absolute", top: -2, right: -2,
                        background: "var(--red)", color: "white",
                        width: 16, height: 16, borderRadius: "50%",
                        fontSize: 9, fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{c.unread}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{c.customerName}</span>
                        <span style={{ fontSize: 13 }}>{c.langFlag}</span>
                        {c.isVIP && <span className="badge badge-gold" style={{ fontSize: 9, padding: "2px 5px" }}>VIP</span>}
                        {c.isRegular && <span className="badge badge-gray" style={{ fontSize: 9, padding: "2px 5px" }}>Stamm</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{c.time}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span className={ch.class} style={{ display: "flex" }}>{ch.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{ch.label}</span>
                      <span className={`badge ${statusBadge[c.status].cls}`} style={{ fontSize: 9, padding: "2px 6px" }}>
                        {statusBadge[c.status].label}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.paulTyping ? (
                        <span style={{ color: "var(--accent)", fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                          <Zap size={11} /> Paul tippt...
                        </span>
                      ) : c.lastMessage}
                    </div>

                    {c.paulPaused && (
                      <div style={{ marginTop: 4 }}>
                        <span className="paul-paused" style={{ fontSize: 9, padding: "2px 6px" }}>
                          ⏸ Du hast übernommen
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── RIGHT: Chat View ── */}
        <div
          className={`${showMobile ? "flex" : "hidden"} md:flex`}
          style={{ flex: 1, flexDirection: "column", overflow: "hidden", background: "var(--bg-2)" }}
        >
          {selected ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: "14px 18px",
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                {/* Mobile back button */}
                <button className="md:hidden btn-ghost" style={{ padding: "6px 8px", borderRadius: 8, marginRight: -4 }}
                        onClick={() => setShowMobile(false)}>
                  <ChevronLeft size={18} />
                </button>

                <div className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>{selected.avatar}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{selected.customerName}</span>
                    <span style={{ fontSize: 14 }}>{selected.langFlag}</span>
                    {selected.isVIP && <span className="badge badge-gold" style={{ fontSize: 9 }}>VIP</span>}
                    {selected.isRegular && <span className="badge badge-gray" style={{ fontSize: 9 }}>Stammkunde</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span className={channelMeta[selected.channel].class} style={{ display: "flex" }}>
                      {channelMeta[selected.channel].icon}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{channelMeta[selected.channel].label} · {selected.language}</span>
                    {selected.paulTyping && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
                        <Zap size={11} /> Paul tippt
                        <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
                          <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Take Over button */}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => togglePaul(selected.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 13, fontWeight: 700,
                    cursor: "pointer",
                    background: selected.paulPaused ? "var(--green)" : "var(--accent)",
                    color: "#0a0a18",
                    boxShadow: selected.paulPaused ? "none" : "var(--shadow-accent)",
                    transition: "background 0.2s",
                  }}
                >
                  {selected.paulPaused
                    ? <><Play size={13} /> Paul fortsetzen</>
                    : <><UserCheck size={13} /> Take Over</>
                  }
                </motion.button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                {selected.messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, ease: EASE }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.role === "customer" ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.role !== "customer" && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: msg.role === "paul" ? "var(--accent)" : "var(--blue)", marginBottom: 4, marginLeft: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        {msg.role === "paul" ? <><Zap size={10} /> Paul KI</> : <><UserCheck size={10} /> Du</>}
                      </div>
                    )}
                    <div className={msg.role === "customer" ? "bubble-customer" : "bubble-paul"}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{msg.time}</div>
                  </motion.div>
                ))}

                {selected.paulTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <Zap size={10} /> Paul KI tippt
                    </div>
                    <div className="bubble-paul" style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Reply bar */}
              <div style={{
                padding: "12px 18px",
                background: "var(--surface)",
                borderTop: "1px solid var(--border)",
                display: "flex", gap: 10, alignItems: "flex-end",
              }}>
                {selected.paulPaused ? (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder={`Antworten als ${selected.channel === "whatsapp" ? "WhatsApp" : selected.channel}...`}
                      rows={2}
                      style={{
                        flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: 12, padding: "10px 14px",
                        fontSize: 14, color: "var(--text)", resize: "none",
                        outline: "none", fontFamily: "inherit",
                      }}
                    />
                    <motion.button whileTap={{ scale: 0.92 }} onClick={sendReply} className="btn-gold" style={{ padding: "10px 14px", borderRadius: 10 }}>
                      <Send size={16} />
                    </motion.button>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <Zap size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      Paul beantwortet diesen Chat automatisch. Klicke <strong style={{ color: "var(--accent)" }}>Take Over</strong>, um selbst zu schreiben.
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <MessageSquare size={40} style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Wähle ein Gespräch aus</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
