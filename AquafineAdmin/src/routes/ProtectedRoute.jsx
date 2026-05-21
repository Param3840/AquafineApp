import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RefreshCw } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If AuthContext is checking saved token, show premium loader to prevent flashing redirects
  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <RefreshCw size={36} className="spin-animate" style={{ color: "var(--teal)" }} />
        <span style={styles.loadingText}>Initializing admin panel session...</span>
      </div>
    );
  }

  // Redirect to secure LoginPage if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const styles = {
  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--slate-50)",
  },
  loadingText: {
    marginTop: "1rem",
    color: "var(--slate-500)",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
};

export default ProtectedRoute;
