import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      api.get("/messages/unread-count").then(({ data }) => setUnread(data.count)).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
              <path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/>
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/>
              <path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
            </svg>
          </div>
          <span className="brand-text">WEMS</span>
        </Link>
        <div className="navbar-links">
          <Link to="/listings">Marketplace</Link>
          <Link to="/prices">Price Guide</Link>
          {user ? (
            <>
              <Link to="/messages" style={{position:'relative',display:'inline-flex',alignItems:'center',gap:5}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Messages
                {unread > 0 && <span className="nav-unread-badge">{unread}</span>}
              </Link>
              <Link to="/dashboard">Dashboard</Link>
              {user.adminRole === "admin" && <Link to="/admin" style={{color:'#7c3aed',fontWeight:700}}>Admin</Link>}
              <span style={{color:'var(--gray-300)',fontSize:'0.8rem'}}>|</span>
              <span style={{fontSize:'0.88rem',color:'var(--gray-600)',fontWeight:500}}>Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
