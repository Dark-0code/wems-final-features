import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const categories = [
  { key: "plastic", label: "Plastic", cls: "cat-plastic", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6l2 4H7L9 2z"/><path d="M7 6v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6"/><path d="M10 11h4"/><path d="M10 15h4"/></svg> },
  { key: "metal", label: "Metal", cls: "cat-metal", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg> },
  { key: "paper", label: "Paper", cls: "cat-paper", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { key: "glass", label: "Glass", cls: "cat-glass", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8l2 6H6L8 2z"/><path d="M6 8l2 14h8l2-14"/></svg> },
  { key: "electronics", label: "Electronics", cls: "cat-electronics", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg> },
  { key: "textile", label: "Textile", cls: "cat-textile", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg> },
  { key: "rubber", label: "Rubber", cls: "cat-rubber", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg> },
  { key: "other", label: "Others", cls: "cat-other", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Starting in Abuja, Nigeria
          </div>
          <h1>Nigeria's <em>Recyclable</em> Waste Marketplace</h1>
          <p>Connect with buyers and sellers of recyclable materials. Turn your waste into value — one listing at a time.</p>
          <div className="hero-actions">
            <Link to="/listings" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Browse Listings
            </Link>
            {!user ? (
              <Link to="/register" className="btn-outline">
                Start Selling
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-outline">My Dashboard</Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="stat-number">8+</span><span className="stat-label">Waste Categories</span></div>
            <div className="hero-stat"><span className="stat-number">100%</span><span className="stat-label">Free to Use</span></div>
            <div className="hero-stat"><span className="stat-number">NGN</span><span className="stat-label">Local Currency</span></div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories">
        <div className="section-header">
          <span className="section-tag">Materials</span>
          <h2>What We Trade</h2>
          <p>Browse recyclable materials across all categories</p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.key} to={`/listings?category=${cat.key}`} className={`category-card ${cat.cls}`}>
              <div className="cat-icon-wrap">{cat.icon}</div>
              <span className="cat-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header">
          <span className="section-tag">Process</span>
          <h2>How It Works</h2>
          <p>Get started in 3 simple steps</p>
        </div>
        <div className="steps">
          {[
            { n: "1", title: "Register Free", desc: "Create a free account as a buyer, seller, or both. No hidden fees." },
            { n: "2", title: "Post or Browse", desc: "List your recyclable waste or browse hundreds of available materials." },
            { n: "3", title: "Connect & Trade", desc: "Contact sellers via email, phone, or WhatsApp and complete your deal." },
          ].map((s) => (
            <div className="step" key={s.n}>
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <h2>Ready to Start Trading?</h2>
          <p>Join the growing community of waste traders in Nigeria.</p>
          <Link to="/register" className="btn-primary">
            Create Free Account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </section>
      )}
    </div>
  );
}
