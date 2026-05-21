import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Bell, Search, ShieldCheck } from "lucide-react";

const TopNavbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Generate dynamic, clean path names for the header
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return "Overview";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header style={styles.header}>
      {/* Sidebar Toggle & Breadcrumb */}
      <div style={styles.leftSection}>
        <button 
          style={styles.toggleBtn} 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <div style={styles.breadcrumb}>
          <span style={styles.parentBreadcrumb}>Aquafine</span>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.activeBreadcrumb}>{getPageTitle()}</span>
        </div>
      </div>

      {/* Right Tools, Notification & Info */}
      <div style={styles.rightSection}>
        {/* Search Widget */}
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search transactions, customers..." 
            style={styles.searchInput} 
          />
        </div>

        {/* Security / Health Badge */}
        <div style={styles.badgeWrapper}>
          <div style={styles.healthBadge}>
            <ShieldCheck size={14} style={{ marginRight: "0.25rem" }} />
            <span>Secure Node</span>
          </div>
        </div>

        {/* Notification Icon */}
        <button style={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} />
          <span style={styles.notificationDot} />
        </button>

        <div style={styles.divider} />

        {/* Profile details */}
        <div style={styles.profileWidget}>
          <div style={styles.profileDetails}>
            <span style={styles.profileName}>{user?.fullName || "Admin"}</span>
            <span style={styles.profileRole}>Server Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: "var(--navbar-height)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--slate-200)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2.5rem",
    position: "sticky",
    top: 0,
    zIndex: 90,
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  toggleBtn: {
    display: "none",
    background: "none",
    border: "none",
    color: "var(--slate-800)",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "10px",
    transition: "var(--transition-smooth)",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  parentBreadcrumb: {
    color: "var(--slate-500)",
  },
  breadcrumbSeparator: {
    color: "var(--slate-300)",
  },
  activeBreadcrumb: {
    color: "var(--teal-dark)",
    fontWeight: "600",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "0.85rem",
    color: "var(--slate-400)",
    pointerEvents: "none",
  },
  searchInput: {
    padding: "0.55rem 1rem 0.55rem 2.25rem",
    borderRadius: "10px",
    border: "1px solid var(--slate-200)",
    backgroundColor: "var(--slate-50)",
    fontSize: "0.85rem",
    width: "240px",
    outline: "none",
    transition: "var(--transition-smooth)",
  },
  badgeWrapper: {
    display: "block",
  },
  healthBadge: {
    display: "flex",
    alignItems: "center",
    padding: "0.35rem 0.65rem",
    borderRadius: "20px",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.15)",
    color: "var(--success)",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "var(--slate-600)",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "10px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-smooth)",
  },
  notificationDot: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "var(--danger)",
    border: "1.5px solid #ffffff",
  },
  divider: {
    height: "20px",
    width: "1px",
    backgroundColor: "var(--slate-200)",
  },
  profileWidget: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    textAlign: "right",
  },
  profileName: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--slate-900)",
  },
  profileRole: {
    fontSize: "0.75rem",
    color: "var(--slate-500)",
    fontWeight: "500",
  },
};

// Add styling responsive override using DOM elements
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @media (max-width: 1024px) {
      header[style] {
        padding: 0 1.5rem !important;
      }
      button[aria-label="Toggle menu"] {
        display: block !important;
      }
      .searchInput, div[style*="searchBox"], div[style*="badgeWrapper"], div[style*="profileWidget"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default TopNavbar;
