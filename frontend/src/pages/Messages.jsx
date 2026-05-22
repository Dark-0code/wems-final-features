import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (conversationId) openConversation(conversationId);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (active) {
      pollRef.current = setInterval(() => pollMessages(active.id), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [active]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openConversation = async (id) => {
    try {
      const { data } = await api.get(`/messages/conversations/${id}`);
      setActive(data);
      setMessages(data.messages);
      fetchConversations(); // refresh unread counts
    } catch (e) { console.error(e); }
  };

  const pollMessages = async (id) => {
    try {
      const { data } = await api.get(`/messages/conversations/${id}`);
      setMessages(data.messages);
    } catch (e) {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/conversations/${active.id}/messages`, { content: text });
      setMessages(prev => [...prev, data]);
      setText("");
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const getOtherUser = (conv) => {
    if (!user) return null;
    return conv.user1.id === user.id ? conv.user2 : conv.user1;
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  };

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
          {conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) > 0 && (
            <span className="unread-badge">{conversations.reduce((a, c) => a + (c.unreadCount || 0), 0)}</span>
          )}
        </div>

        {loading ? (
          <div className="messages-empty"><div className="spinner"></div></div>
        ) : conversations.length === 0 ? (
          <div className="messages-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>No conversations yet.<br/>Message a seller from a listing.</p>
          </div>
        ) : (
          <div className="conv-list">
            {conversations.map(conv => {
              const other = getOtherUser(conv);
              const lastMsg = conv.messages?.[0];
              return (
                <div
                  key={conv.id}
                  className={`conv-item ${active?.id === conv.id ? "active" : ""}`}
                  onClick={() => openConversation(conv.id)}
                >
                  <div className="conv-avatar">{other?.name?.[0]?.toUpperCase()}</div>
                  <div className="conv-info">
                    <div className="conv-name-row">
                      <span className="conv-name">{other?.name}</span>
                      {lastMsg && <span className="conv-time">{formatTime(lastMsg.createdAt)}</span>}
                    </div>
                    {conv.listing && <div className="conv-listing">Re: {conv.listing.title}</div>}
                    {lastMsg && (
                      <div className="conv-preview">
                        {lastMsg.sender.id === user?.id ? "You: " : ""}{lastMsg.content}
                      </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && <span className="conv-unread">{conv.unreadCount}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {!active ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the left, or start one by messaging a seller on a listing.</p>
            <Link to="/listings" className="btn-primary" style={{marginTop:'0.5rem'}}>Browse Listings</Link>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="conv-avatar" style={{width:40,height:40,fontSize:'1rem'}}>
                  {getOtherUser(active)?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="chat-header-name">{getOtherUser(active)?.name}</div>
                  {active.listing && (
                    <Link to={`/listings/${active.listing.id}`} className="chat-header-listing">
                      Re: {active.listing.title} · ₦{Number(active.listing.pricePerUnit).toLocaleString()}/{active.listing.unit}
                    </Link>
                  )}
                </div>
              </div>
              {active.listing && (
                <Link to={`/listings/${active.listing.id}`} className="btn-view">View Listing</Link>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-start-msg">
                  Start the conversation — ask about availability, negotiate price, or arrange pickup.
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender.id === user?.id;
                const showName = !isMe && (i === 0 || messages[i-1].sender.id !== msg.sender.id);
                return (
                  <div key={msg.id} className={`message-wrap ${isMe ? "me" : "them"}`}>
                    {showName && <div className="message-sender-name">{msg.sender.name}</div>}
                    <div className={`message-bubble ${isMe ? "bubble-me" : "bubble-them"}`}>
                      {msg.content}
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={text}
                onChange={e => setText(e.target.value)}
                autoFocus
              />
              <button type="submit" className="chat-send-btn" disabled={sending || !text.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
