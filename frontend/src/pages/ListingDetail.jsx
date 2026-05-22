import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await api.get(`/listings/${id}`); setListing(data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleMessage = async () => {
    if (!user) return navigate("/login");
    setStartingChat(true);
    try {
      const { data } = await api.post("/messages/conversations", {
        recipientId: listing.seller.id,
        listingId: listing.id,
      });
      navigate(`/messages/${data.id}`);
    } catch (e) { console.error(e); }
    finally { setStartingChat(false); }
  };
  if (!listing) return (
    <div className="listing-detail">
      <div className="empty-state">
        <div className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
        <h3>Listing not found</h3>
        <p>It may have been removed.</p>
        <Link to="/listings" className="btn-primary">Back to Marketplace</Link>
      </div>
    </div>
  );

  const { title, description, category, quantity, unit, pricePerUnit, location, status, seller, contactEmail, contactPhone, createdAt } = listing;

  return (
    <div className="listing-detail">
      <Link to="/listings" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back to Marketplace
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <span className="category-badge">{category}</span>
            <h1>{title}</h1>
          </div>
          <span className={`status-badge status-${status}`}>{status}</span>
        </div>

        <div className="detail-price">
          ₦{Number(pricePerUnit).toLocaleString()}
          <span>per {unit}</span>
        </div>

        <div className="detail-meta-grid">
          <div className="meta-item"><label>Quantity</label><span>{quantity} {unit}</span></div>
          <div className="meta-item"><label>Total Value</label><span>₦{(Number(pricePerUnit) * quantity).toLocaleString()}</span></div>
          <div className="meta-item"><label>Location</label><span>📍 {location}</span></div>
          <div className="meta-item"><label>Posted</label><span>{new Date(createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span></div>
        </div>

        <div className="detail-description">
          <h3>Description</h3>
          <p>{description}</p>
        </div>

        <div className="seller-contact">
          <h3>Contact Seller</h3>
          <div className="seller-info">
            <div className="seller-avatar">{seller?.name?.[0]?.toUpperCase()}</div>
            <div>
              <strong>{seller?.name}</strong>
              <p>📍 {seller?.location}</p>
            </div>
          </div>
          <div className="contact-buttons">
            {user && user.id !== seller?.id && (
              <button onClick={handleMessage} className="btn-primary" disabled={startingChat}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {startingChat ? "Opening..." : "Message Seller"}
              </button>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}?subject=Inquiry: ${title}`} className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email Seller
              </a>
            )}
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.82 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call {contactPhone}
              </a>
            )}
            {contactPhone && (
              <a href={`https://wa.me/${contactPhone.replace(/[^0-9]/g,"")}?text=Hi, I'm interested in: ${title} on WEMS`} target="_blank" rel="noreferrer" className="btn-whatsapp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
