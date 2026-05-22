import { useState, useRef, useEffect } from "react";

const WEMS_SYSTEM = `You are WEMS Support AI — a friendly, knowledgeable assistant for the Waste Ecosystem Management System (WEMS), Nigeria's recyclable waste marketplace based in Abuja.

Your role:
- Help users understand how the platform works
- Answer questions about waste categories, pricing, and listings
- Guide sellers on how to post listings
- Guide buyers on how to contact sellers
- Provide Nigeria market price estimates for recyclable materials
- Answer customer service questions

Key platform info:
- WEMS is a marketplace connecting waste sellers and buyers in Nigeria
- Categories: plastic, metal, paper, glass, electronics, textile, rubber, other
- Users can register, post listings, browse, and message sellers
- Contact sellers via the Message Seller button on any listing
- Price Guide is available at /prices showing current Nigerian market rates
- Based in Abuja, expanding across Nigeria

Nigeria price ranges (approximate):
- Copper wire: ₦10,000-13,000/kg
- PET bottles (clear): ₦400-600/kg  
- Cardboard/OCC: ₦80-150/kg
- Iron/steel: ₦400-600/kg
- Aluminium: ₦800-3,000/kg depending on grade
- Glass bottles: ₦15-60/kg

Be concise, helpful, and friendly. Use Nigerian context where relevant. If asked about something outside WEMS or waste recycling, politely redirect to platform topics.`;

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm WEMS AI Support. How can I help you today? You can ask me about listings, pricing, how to sell, or anything about the platform." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: WEMS_SYSTEM,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      if (!open) setUnread(n => n + 1);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. For urgent help, use the contact details on any listing."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How do I post a listing?",
    "What are current PET bottle prices?",
    "How do I contact a seller?",
    "What categories are accepted?",
  ];

  return (
    <>
      {/* Floating Button */}
      <button className="support-fab" onClick={() => setOpen(!open)} aria-label="Support Chat">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {!open && unread > 0 && <span className="support-fab-badge">{unread}</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="support-window">
          {/* Header */}
          <div className="support-header">
            <div className="support-header-info">
              <div className="support-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                </svg>
              </div>
              <div>
                <div className="support-header-name">WEMS AI Support</div>
                <div className="support-header-status">
                  <span className="support-online-dot"></span>
                  Online — powered by Claude AI
                </div>
              </div>
            </div>
            <button className="support-close" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="support-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`support-msg ${msg.role === "user" ? "support-msg-user" : "support-msg-ai"}`}>
                {msg.role === "assistant" && (
                  <div className="support-ai-avatar">AI</div>
                )}
                <div className={`support-bubble ${msg.role === "user" ? "support-bubble-user" : "support-bubble-ai"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="support-msg support-msg-ai">
                <div className="support-ai-avatar">AI</div>
                <div className="support-bubble support-bubble-ai support-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="support-quick">
              {quickQuestions.map(q => (
                <button key={q} className="support-quick-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="support-input-area" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about listings, prices, how to sell..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="support-input"
            />
            <button type="submit" className="support-send" disabled={loading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
