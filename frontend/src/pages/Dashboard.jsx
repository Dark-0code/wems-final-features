import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PriceHint from "../components/PriceHint";
import LocationPicker from "../components/LocationPicker";

const EMPTY_FORM = { title: "", description: "", category: "plastic", quantity: "", unit: "kg", pricePerUnit: "", location: "", contactPhone: "" };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!user) return navigate("/login"); fetchMyListings(); }, [user]);

  const fetchMyListings = async () => {
    try { const { data } = await api.get("/listings/my/listings"); setListings(data); }
    catch (err) { console.error(err); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      await api.post("/listings", { ...form, quantity: Number(form.quantity), pricePerUnit: Number(form.pricePerUnit), location: form.location || user.location });
      setSuccess("✅ Listing posted successfully!"); setForm(EMPTY_FORM); setShowForm(false); fetchMyListings();
    } catch (err) { setError(err.response?.data?.message || "Failed to create listing."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try { await api.delete(`/listings/${id}`); setListings((prev) => prev.filter((l) => (l.id || l._id) !== id)); }
    catch { alert("Could not delete listing."); }
  };

  const handleStatusChange = async (id, status) => {
    try { await api.put(`/listings/${id}`, { status }); fetchMyListings(); }
    catch { alert("Could not update status."); }
  };

  const available = listings.filter(l => l.status === "available").length;
  const sold = listings.filter(l => l.status === "sold").length;
  const totalValue = listings.reduce((acc, l) => acc + (l.pricePerUnit * l.quantity), 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome back, {user?.name} · {user?.location}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>✕ Cancel</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New Listing
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--primary-light)'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5.5 4.5 1.3"/></svg>
          </div>
          <div className="stat-value">{listings.length}</div>
          <div className="stat-label">Total Listings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--green-100)'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="stat-value">{available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#fef3c7'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="stat-value">{sold}</div>
          <div className="stat-label">Sold</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#ede9fe'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="stat-value" style={{fontSize:'1.4rem'}}>₦{totalValue.toLocaleString()}</div>
          <div className="stat-label">Portfolio Value</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="form-panel">
          <h2>Post a New Listing</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input name="title" placeholder="e.g. Used PET Bottles" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {["plastic","metal","paper","glass","electronics","textile","rubber","other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Describe the material, condition, source, etc." value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" placeholder="500" value={form.quantity} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange}>
                  {["kg","tonnes","bags","units","litres"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price per Unit (₦)</label>
                <input type="number" name="pricePerUnit" placeholder="150" value={form.pricePerUnit} onChange={handleChange} required min="0" />
              </div>
            </div>
            <PriceHint category={form.category} />
            <div className="form-row">
            </div>
            <div className="form-row">
              <LocationPicker
                label="Pickup Location"
                value={form.location}
                onChange={(val) => setForm({ ...form, location: val })}
              />
              <div className="form-group">
                <label>Contact Phone</label>
                <input name="contactPhone" placeholder="+234 800 000 0000" value={form.contactPhone} onChange={handleChange} />
              </div>
            </div>
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Posting..." : "Post Listing"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Listings Table */}
      <div>
        <div className="my-listings-header">
          <h2>My Listings ({listings.length})</h2>
        </div>
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
            </div>
            <h3>No listings yet</h3>
            <p>Post your first recyclable waste listing to get started.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Post First Listing
            </button>
          </div>
        ) : (
          <div className="listings-table-wrapper">
            <table className="listings-table">
              <thead>
                <tr>
                  <th>Title</th><th>Category</th><th>Quantity</th><th>Price/Unit</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const id = l.id || l._id;
                  return (
                    <tr key={id}>
                      <td style={{fontWeight:600,color:'var(--gray-800)'}}>{l.title}</td>
                      <td><span className="category-badge">{l.category}</span></td>
                      <td>{l.quantity} {l.unit}</td>
                      <td style={{fontWeight:700,color:'var(--primary)'}}>₦{Number(l.pricePerUnit).toLocaleString()}</td>
                      <td>
                        <select value={l.status} onChange={(e) => handleStatusChange(id, e.target.value)} className={`status-select`}>
                          <option value="available">Available</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                      <td><button className="btn-danger-sm" onClick={() => handleDelete(id)}>Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
