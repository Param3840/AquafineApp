import React, { useState } from "react";
import { 
  Save, 
  Palette, 
  Truck, 
  Sliders, 
  CheckCircle, 
  ShieldAlert,
  Server,
  AlertCircle
} from "lucide-react";

const SettingsPage = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // High-fidelity state controls matching production setups
  const [branding, setBranding] = useState({
    title: "Aquafine Premium",
    primaryColor: "#0f766e",
    secondaryColor: "#083d4a",
    accentColor: "#c89b2c",
  });

  const [delivery, setDelivery] = useState({
    hours: "08:00 AM - 08:00 PM",
    duration: "24 Hours Standard",
    minOrderValue: "₹500",
    charge: "₹50 (Free above ₹1,000)",
  });

  const [keys, setKeys] = useState({
    backendUrl: "http://localhost:4000",
    razorpayKeyId: "rzp_test_pLDDTGgG2uW6sO",
    jwtExpiry: "30 Days Persistent",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    // Simulate backend handshake saving configurations
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Automatically hide confirmation alert after 4 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }, 1500);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Global Settings</h1>
          <p className="page-subtitle">Configure application colors, schedules, keys, and API paths.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert-message alert-success mb-6">
          <CheckCircle size={18} />
          <span>System configurations synchronized and saved successfully!</span>
        </div>
      )}

      {/* Settings Sections Form */}
      <form onSubmit={handleSave}>
        <div style={styles.sectionsContainer}>
          
          {/* Card 1: Branding & Visual Customisation */}
          <div className="card">
            <div style={styles.cardHeader}>
              <Palette size={20} style={{ color: "var(--teal)" }} />
              <div>
                <h3 style={styles.cardTitle}>Visual Branding System</h3>
                <p style={styles.cardDesc}>Maintain customer app themes, colors, and layout variables.</p>
              </div>
            </div>
            <div style={styles.cardDivider} />
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="app-title">Application Label</label>
                <input
                  id="app-title"
                  type="text"
                  className="input-field"
                  value={branding.title}
                  onChange={(e) => setBranding({ ...branding, title: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="primary-color">Teal Primary Color</label>
                <input
                  id="primary-color"
                  type="text"
                  className="input-field"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="secondary-color">Dark Secondary Color</label>
                <input
                  id="secondary-color"
                  type="text"
                  className="input-field"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="accent-color">Gold Accent Accent</label>
                <input
                  id="accent-color"
                  type="text"
                  className="input-field"
                  value={branding.accentColor}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Operations & Delivery Schedules */}
          <div className="card">
            <div style={styles.cardHeader}>
              <Truck size={20} style={{ color: "var(--gold)" }} />
              <div>
                <h3 style={styles.cardTitle}>Operations & Delivery Parameters</h3>
                <p style={styles.cardDesc}>Fine-tune logistics timelines and minimum order value filters.</p>
              </div>
            </div>
            <div style={styles.cardDivider} />
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="dispatch-hours">Operating Delivery Hours</label>
                <input
                  id="dispatch-hours"
                  type="text"
                  className="input-field"
                  value={delivery.hours}
                  onChange={(e) => setDelivery({ ...delivery, hours: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="delivery-duration">Standard Delivery Duration</label>
                <input
                  id="delivery-duration"
                  type="text"
                  className="input-field"
                  value={delivery.duration}
                  onChange={(e) => setDelivery({ ...delivery, duration: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="min-order">Minimum Order Value</label>
                <input
                  id="min-order"
                  type="text"
                  className="input-field"
                  value={delivery.minOrderValue}
                  onChange={(e) => setDelivery({ ...delivery, minOrderValue: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="delivery-fee">Standard Delivery Charge</label>
                <input
                  id="delivery-fee"
                  type="text"
                  className="input-field"
                  value={delivery.charge}
                  onChange={(e) => setDelivery({ ...delivery, charge: e.target.value })}
                />
              </div>
            </div>
          </div>



          {/* Action Row */}
          <div style={styles.actionRow}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={styles.saveBtn}
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? "Saving settings..." : "Save System Configs"}</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

const styles = {
  sectionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    maxWidth: "1000px",
    width: "100%",
  },
  cardHeader: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--slate-900)",
  },
  cardDesc: {
    fontSize: "0.85rem",
    color: "var(--slate-500)",
    marginTop: "0.25rem",
  },
  cardDivider: {
    height: "1px",
    backgroundColor: "var(--slate-200)",
    margin: "1.25rem 0 1.5rem 0",
  },
  warningAlert: {
    display: "flex",
    gap: "0.65rem",
    alignItems: "flex-start",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    color: "var(--danger)",
    padding: "1rem",
    borderRadius: "10px",
    fontSize: "0.825rem",
    lineHeight: "1.5",
    marginBottom: "1.25rem",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1rem",
    marginBottom: "3rem",
  },
  saveBtn: {
    minWidth: "180px",
    height: "46px",
  },
};

export default SettingsPage;
