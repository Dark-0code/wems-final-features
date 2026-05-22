import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "both", phone: "", location: "Abuja, Nigeria" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
              <path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/>
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/>
              <path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
            </svg>
          </div>
          <h2>Create Account</h2>
          <p>Join Nigeria's waste marketplace</p>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" placeholder="+234 800 000 0000" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>I want to</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="both">Buy & Sell</option>
                <option value="seller">Sell only</option>
                <option value="buyer">Buy only</option>
              </select>
            </div>
          </div>
          <LocationPicker
            label="Location"
            value={form.location}
            onChange={(val) => setForm({ ...form, location: val })}
            required
          />
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? "Creating account..." : "Create Free Account"}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
