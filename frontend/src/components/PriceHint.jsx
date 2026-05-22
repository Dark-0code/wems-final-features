import { useState, useEffect } from "react";
import api from "../api/axios";

export default function PriceHint({ category }) {
  const [hints, setHints] = useState([]);

  useEffect(() => {
    if (!category) return;
    api.get(`/prices?category=${category}`)
      .then(({ data }) => setHints(data.slice(0, 3)))
      .catch(() => {});
  }, [category]);

  if (hints.length === 0) return null;

  return (
    <div className="price-hint">
      <div className="price-hint-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Market rates for <strong>{category}</strong>:
      </div>
      <div className="price-hint-list">
        {hints.map(h => (
          <div key={h.id} className="price-hint-item">
            <span className="price-hint-name">{h.material}</span>
            <span className="price-hint-range">₦{Number(h.minPrice).toLocaleString()} – ₦{Number(h.maxPrice).toLocaleString()} /{h.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
