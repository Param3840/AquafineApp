import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Droplet, Lock, Mail, AlertCircle, RefreshCw, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      setValidationError("Please fill in all details");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Branding Title */}
        <div className="login-brand">
          <div className="login-logo">
            <Droplet size={32} fill="#ffffff" stroke="none" />
          </div>
          <h1 className="login-title">Aquafine</h1>
          <p className="login-subtitle">Administrative Control Panel</p>
        </div>

        {/* Display backend auth and form validation errors */}
        {(validationError || authError) && (
          <div className="alert-message alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{validationError || authError}</span>
          </div>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={handleSubmit}>
          {/* Email input field */}
          <div className="input-group">
            <label className="input-label" htmlFor="email-input">
              Admin Email Address
            </label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email-input"
                type="email"
                placeholder="shivam@aquafine.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.fieldIndent}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="input-group">
            <label className="input-label" htmlFor="password-input">
              Security Password
            </label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.fieldIndentWithEye}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Submission Button */}
          <button
            type="submit"
            className="btn btn-primary mt-4"
            style={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className="spin-animate" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Access Control Panel</span>
            )}
          </button>
        </form>

        {/* Informative credentials hints */}
        <div style={styles.footerNote}>
          <p>Access is restricted to authorized administrators only. Enter your admin credentials to manage clients, orders, and payments.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: "1rem",
    color: "var(--slate-400)",
    pointerEvents: "none",
  },
  fieldIndent: {
    paddingLeft: "2.75rem",
  },
  fieldIndentWithEye: {
    paddingLeft: "2.75rem",
    paddingRight: "2.75rem",
  },
  eyeBtn: {
    position: "absolute",
    right: "1rem",
    background: "none",
    border: "none",
    color: "var(--slate-400)",
    cursor: "pointer",
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    width: "100%",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "1.75rem",
  },
  footerNote: {
    marginTop: "2.25rem",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "var(--slate-500)",
    lineHeight: 1.5,
  },
};

export default LoginPage;
