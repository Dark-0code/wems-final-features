import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";

const CATEGORIES = ["", "plastic", "metal", "paper", "glass", "electronics", "textile", "rubber", "other"];

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  useEffect(() => { fetchListings(); }, [category]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const { data } = await api.get("/listings", { params });
      setListings(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };

  return (
    <div className="listings-page">
      <div className="listings-header">
        <h1>Waste Marketplace</h1>
        <p>Browse recyclable materials from sellers across Nigeria</p>
      </div>

      <div className="filters">
        <form onSubmit={handleSearch} className="search-bar">
          <input type="text" placeholder="Search by material, description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </button>
        </form>
        <div className="category-filters">
          {CATEGORIES.map((cat) => (
            <button key={cat || "all"} className={`filter-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
              {cat || "All Materials"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <h3>No listings found</h3>
          <p>Try a different category or search term</p>
        </div>
      ) : (
        <>
          <p className="results-count">{listings.length} listing{listings.length !== 1 ? "s" : ""} found</p>
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id || listing._id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
