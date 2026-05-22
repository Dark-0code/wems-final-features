import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = [
  { key: "", label: "All Materials" },
  { key: "metal", label: "Metals", color: "#f3f4f6", text: "#374151" },
  { key: "plastic", label: "Plastics", color: "#dbeafe", text: "#1d4ed8" },
  { key: "paper", label: "Paper", color: "#fef3c7", text: "#b45309" },
  { key: "glass", label: "Glass", color: "#e0f2fe", text: "#0369a1" },
  { key: "electronics", label: "Electronics", color: "#ede9fe", text: "#6d28d9" },
  { key: "textile", label: "Textile", color: "#fce7f3", text: "#be185d" },
  { key: "rubber", label: "Rubber", color: "#fef9c3", text: "#a16207" },
];

const CAT_META = {
  metal: { bg: "#f3f4f6", text: "#374151", icon: "🔩" },
  plastic: { bg: "#dbeafe", text: "#1d4ed8", icon: "🧴" },
  paper: { bg: "#fef3c7", text: "#b45309", icon: "📄" },
  glass: { bg: "#e0f2fe", text: "#0369a1", icon: "🫙" },
  electronics: { bg: "#ede9fe", text: "#6d28d9", icon: "💻" },
  textile: { bg: "#fce7f3", text: "#be185d", icon: "👕" },
  rubber: { bg: "#fef9c3", text: "#a16207", icon: "🔄" },
  other: { bg: "#f0fdf4", text: "#166534", icon: "📦" },
};

export default function PriceGuide() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/prices");
      setPrices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group by category
  const grouped = prices.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const filteredPrices = prices.filter((p) => {
    const matchCat = activeCategory ? p.category === activeCategory : true;
    const matchSearch = search
      ? p.material.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  const filteredGrouped = filteredPrices.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const lastUpdated = prices.length > 0
    ? new Date(Math.max(...prices.map(p => new Date(p.updatedAt)))).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="price-guide-page">
      {/* Hero */}
      <div className="price-hero">
        <div className="price-hero-content">
          <div className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Nigeria Market Rates
          </div>
          <h1>Recyclable Waste <em>Price Guide</em></h1>
          <p>Current market prices for recyclable materials in Nigeria. Use these as a reference when posting or buying listings.</p>
          {lastUpdated && (
            <div className="price-updated">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Last updated: {lastUpdated}
            </div>
          )}
        </div>
      </div>

      <div className="price-guide-inner">
        {/* Filters */}
        <div className="price-filters">
          <div className="search-bar" style={{ marginBottom: 0, flex: 1 }}>
            <input
              type="text"
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="category-filters" style={{ marginTop: "0.75rem" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`filter-btn ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price disclaimer */}
        <div className="price-disclaimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Prices are indicative market rates in Nigeria (₦/kg unless stated). Actual prices vary by location, quantity, quality, and market conditions. Updated regularly by WEMS admin.
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading prices...</div>
        ) : filteredPrices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <h3>No results found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="price-sections">
            {Object.entries(filteredGrouped).map(([category, items]) => {
              const meta = CAT_META[category] || CAT_META.other;
              return (
                <div className="price-section" key={category}>
                  <div className="price-section-header">
                    <div className="price-section-title">
                      <span className="price-cat-icon" style={{ background: meta.bg, color: meta.text }}>
                        {meta.icon}
                      </span>
                      <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                    </div>
                    <span className="price-count">{items.length} material{items.length !== 1 ? "s" : ""}</span>
                  </div>

                  <div className="price-table-wrap">
                    <table className="price-table">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Grade</th>
                          <th>Min Price</th>
                          <th>Max Price</th>
                          <th>Unit</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="price-material-name">{item.material}</td>
                            <td>
                              {item.grade && (
                                <span className="grade-badge" style={{ background: meta.bg, color: meta.text }}>
                                  {item.grade}
                                </span>
                              )}
                            </td>
                            <td className="price-min">₦{Number(item.minPrice).toLocaleString()}</td>
                            <td className="price-max">₦{Number(item.maxPrice).toLocaleString()}</td>
                            <td className="price-unit">/{item.unit}</td>
                            <td className="price-notes">{item.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="price-cta">
          <div className="price-cta-inner">
            <div>
              <h3>Ready to trade?</h3>
              <p>Post your recyclable waste or browse active listings on the marketplace.</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/listings" className="btn-primary">Browse Listings</Link>
              <Link to="/dashboard" className="btn-outline">Post a Listing</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
