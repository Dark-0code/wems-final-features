import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TABS = ["Overview", "Users", "Listings", "Prices"];

const EMPTY_PRICE = { category: "metal", material: "", minPrice: "", maxPrice: "", unit: "kg", grade: "", notes: "" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceForm, setPriceForm] = useState(EMPTY_PRICE);
  const [priceMsg, setPriceMsg] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.adminRole !== "admin") return navigate("/");
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (tab === "Users") fetchUsers();
    if (tab === "Listings") fetchListings();
    if (tab === "Prices") fetchPrices();
  }, [tab]);

  const fetchStats = async () => {
    setLoading(true);
    try { const { data } = await api.get("/admin/stats"); setStats(data); }
    catch { navigate("/"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await api.get("/admin/users"); setUsers(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchListings = async () => {
    setLoading(true);
    try { const { data } = await api.get("/admin/listings"); setListings(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try { const { data } = await api.get("/prices"); setPrices(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSuspend = async (id) => {
    try { const { data } = await api.put(`/admin/users/${id}/suspend`); alert(data.message); fetchUsers(); }
    catch { alert("Error"); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their listings?`)) return;
    try { await api.delete(`/admin/users/${id}`); fetchUsers(); }
    catch { alert("Error deleting user"); }
  };

  const handleMakeAdmin = async (id, name) => {
    if (!window.confirm(`Make "${name}" an admin?`)) return;
    try { const { data } = await api.put(`/admin/users/${id}/make-admin`); alert(data.message); fetchUsers(); }
    catch { alert("Error"); }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try { await api.delete(`/admin/listings/${id}`); fetchListings(); }
    catch { alert("Error"); }
  };

  const handleListingStatus = async (id, status) => {
    try { await api.put(`/admin/listings/${id}/status`, { status }); fetchListings(); }
    catch { alert("Error"); }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setPriceMsg("");
    try {
      if (editingPrice) {
        await api.put(`/prices/${editingPrice.id}`, priceForm);
        setPriceMsg("✅ Price updated");
      } else {
        await api.post("/prices", priceForm);
        setPriceMsg("✅ Price added");
      }
      setPriceForm(EMPTY_PRICE);
      setEditingPrice(null);
      setShowPriceForm(false);
      fetchPrices();
    } catch (err) {
      setPriceMsg("❌ " + (err.response?.data?.message || "Error saving price"));
    }
  };

  const handleEditPrice = (price) => {
    setEditingPrice(price);
    setPriceForm({
      category: price.category, material: price.material,
      minPrice: price.minPrice, maxPrice: price.maxPrice,
      unit: price.unit, grade: price.grade || "", notes: price.notes || "",
    });
    setShowPriceForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeletePrice = async (id) => {
    if (!window.confirm("Delete this price entry?")) return;
    try { await api.delete(`/prices/${id}`); fetchPrices(); }
    catch { alert("Error deleting price"); }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPrices = prices.filter(p =>
    p.material.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group prices by category
  const priceGroups = filteredPrices.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  if (loading && !stats) return <div className="loading"><div className="spinner"></div>Loading admin panel...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Admin Panel
          </div>
          <h1>WEMS Admin Dashboard</h1>
          <p>Manage users, listings, prices and platform activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setSearch(""); setShowPriceForm(false); setPriceMsg(""); }}>
            {t === "Overview" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
            {t === "Users" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            {t === "Listings" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
            {t === "Prices" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "Overview" && stats && (
        <div className="admin-content">
          <div className="admin-stats-grid">
            {[
              { label: "Total Users", value: stats.totalUsers, bg: "#ede9fe", color: "#7c3aed" },
              { label: "Total Listings", value: stats.totalListings, bg: "#dbeafe", color: "#2563eb" },
              { label: "Active Listings", value: stats.activeListings, bg: "var(--green-100)", color: "var(--primary)" },
              { label: "Sold", value: stats.soldListings, bg: "#fef3c7", color: "#d97706" },
              { label: "Suspended Users", value: stats.suspendedUsers, bg: "var(--danger-light)", color: "var(--danger)" },
            ].map(s => (
              <div className="admin-stat-card" key={s.label}>
                <div className="admin-stat-icon" style={{ background: s.bg }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="admin-section">
            <h2>Listings by Category</h2>
            <div className="category-breakdown">
              {stats.categoryBreakdown.length === 0 && <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>No listings yet.</p>}
              {stats.categoryBreakdown.map(c => (
                <div className="breakdown-row" key={c.category}>
                  <span className="category-badge">{c.category}</span>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${Math.max((c._count.category / Math.max(stats.totalListings,1)) * 100, 2)}%` }}></div>
                  </div>
                  <span className="breakdown-count">{c._count.category}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-section">
            <h2>Recent Signups</h2>
            <div className="listings-table-wrapper">
              <table className="listings-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{fontWeight:600}}>{u.name}</td>
                      <td style={{color:'var(--text-muted)'}}>{u.email}</td>
                      <td><span className="category-badge">{u.role}</span></td>
                      <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-badge ${u.suspended ? 'status-sold' : 'status-available'}`}>{u.suspended ? "Suspended" : "Active"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === "Users" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>{filteredUsers.length} users</span>
          </div>
          <div className="listings-table-wrapper">
            <table className="listings-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Listings</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--green-400))',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,flexShrink:0}}>{u.name[0].toUpperCase()}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:'0.9rem'}}>{u.name}</div>
                          {u.adminRole === "admin" && <span style={{fontSize:'0.7rem',background:'#ede9fe',color:'#7c3aed',padding:'1px 6px',borderRadius:4,fontWeight:700}}>ADMIN</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>{u.email}</td>
                    <td><span className="category-badge">{u.role}</span></td>
                    <td style={{fontWeight:600}}>{u._count.listings}</td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${u.suspended ? 'status-sold' : 'status-available'}`}>{u.suspended ? "Suspended" : "Active"}</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        {u.adminRole !== "admin" ? (
                          <>
                            <button className={u.suspended ? "btn-view" : "btn-danger-sm"} onClick={() => handleSuspend(u.id)} style={{fontSize:'0.78rem',padding:'0.3rem 0.7rem'}}>{u.suspended ? "Unsuspend" : "Suspend"}</button>
                            <button className="btn-ghost" onClick={() => handleMakeAdmin(u.id, u.name)} style={{fontSize:'0.78rem',padding:'0.3rem 0.7rem'}}>Make Admin</button>
                            <button className="btn-danger-sm" onClick={() => handleDeleteUser(u.id, u.name)} style={{fontSize:'0.78rem',padding:'0.3rem 0.7rem'}}>Delete</button>
                          </>
                        ) : <span style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>Protected</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LISTINGS TAB */}
      {tab === "Listings" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>{filteredListings.length} listings</span>
          </div>
          <div className="listings-table-wrapper">
            <table className="listings-table">
              <thead><tr><th>Title</th><th>Category</th><th>Seller</th><th>Price/unit</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredListings.map(l => (
                  <tr key={l.id}>
                    <td style={{fontWeight:600,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</td>
                    <td><span className="category-badge">{l.category}</span></td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{l.seller?.name}</td>
                    <td style={{fontWeight:700,color:'var(--primary)'}}>₦{Number(l.pricePerUnit).toLocaleString()}</td>
                    <td>
                      <select value={l.status} onChange={e => handleListingStatus(l.id, e.target.value)} className="status-select">
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn-danger-sm" onClick={() => handleDeleteListing(l.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRICES TAB */}
      {tab === "Prices" && (
        <div className="admin-content">
          {/* Price Form */}
          <div className="form-panel" style={{marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom: showPriceForm ? '1.5rem' : 0}}>
              <h2 style={{margin:0}}>{editingPrice ? "Edit Price Entry" : "Add New Price Entry"}</h2>
              <button className="btn-primary" onClick={() => { setShowPriceForm(!showPriceForm); setEditingPrice(null); setPriceForm(EMPTY_PRICE); setPriceMsg(""); }}>
                {showPriceForm ? "Cancel" : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add Price</>
                )}
              </button>
            </div>
            {priceMsg && <div className={`alert ${priceMsg.startsWith("✅") ? "alert-success" : "alert-error"}`}>{priceMsg}</div>}
            {showPriceForm && (
              <form onSubmit={handlePriceSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={priceForm.category} onChange={e => setPriceForm({...priceForm, category: e.target.value})}>
                      {["metal","plastic","paper","glass","electronics","textile","rubber","other"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Material Name</label>
                    <input placeholder="e.g. Copper Wire (clean)" value={priceForm.material} onChange={e => setPriceForm({...priceForm, material: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Min Price (₦)</label>
                    <input type="number" placeholder="e.g. 400" value={priceForm.minPrice} onChange={e => setPriceForm({...priceForm, minPrice: e.target.value})} required min="0" />
                  </div>
                  <div className="form-group">
                    <label>Max Price (₦)</label>
                    <input type="number" placeholder="e.g. 600" value={priceForm.maxPrice} onChange={e => setPriceForm({...priceForm, maxPrice: e.target.value})} required min="0" />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select value={priceForm.unit} onChange={e => setPriceForm({...priceForm, unit: e.target.value})}>
                      {["kg","tonnes","unit","litres"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Grade (optional)</label>
                    <input placeholder="e.g. Grade A, Mixed, Clean" value={priceForm.grade} onChange={e => setPriceForm({...priceForm, grade: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <input placeholder="e.g. Price varies by purity" value={priceForm.notes} onChange={e => setPriceForm({...priceForm, notes: e.target.value})} />
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button type="submit" className="btn-primary">{editingPrice ? "Update Price" : "Add Price"}</button>
                  <button type="button" className="btn-ghost" onClick={() => { setShowPriceForm(false); setEditingPrice(null); setPriceForm(EMPTY_PRICE); }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Search */}
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>{filteredPrices.length} entries</span>
          </div>

          {/* Prices grouped by category */}
          {Object.entries(priceGroups).map(([category, items]) => (
            <div key={category} className="admin-section" style={{marginBottom:'1.25rem'}}>
              <h2 style={{textTransform:'capitalize',display:'flex',alignItems:'center',gap:8}}>
                <span className="category-badge">{category}</span>
                <span style={{fontWeight:500,fontSize:'0.9rem',color:'var(--text-muted)'}}>({items.length} entries)</span>
              </h2>
              <div className="listings-table-wrapper">
                <table className="listings-table">
                  <thead>
                    <tr><th>Material</th><th>Grade</th><th>Min (₦)</th><th>Max (₦)</th><th>Unit</th><th>Notes</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {items.map(p => (
                      <tr key={p.id}>
                        <td style={{fontWeight:600}}>{p.material}</td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{p.grade || "—"}</td>
                        <td style={{color:'var(--green-800)',fontWeight:700}}>₦{Number(p.minPrice).toLocaleString()}</td>
                        <td style={{color:'var(--primary)',fontWeight:700}}>₦{Number(p.maxPrice).toLocaleString()}</td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{p.unit}</td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.82rem',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.notes || "—"}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn-view" style={{fontSize:'0.78rem',padding:'0.3rem 0.7rem'}} onClick={() => handleEditPrice(p)}>Edit</button>
                            <button className="btn-danger-sm" style={{fontSize:'0.78rem',padding:'0.3rem 0.7rem'}} onClick={() => handleDeletePrice(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filteredPrices.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>No price entries yet</h3>
              <p>Add prices above or run the seed command in your backend.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
