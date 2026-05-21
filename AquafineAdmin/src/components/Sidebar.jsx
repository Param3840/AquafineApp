import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut,
  Droplet,
  X
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", path: "/orders", icon: ShoppingCart },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    if (toggleSidebar && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          style={styles.backdrop} 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar container */}
      <aside style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "",
        left: isOpen ? "0" : "",
      }}>
        {/* Branding header */}
        <div style={styles.brandContainer}>
          <div style={styles.brandLogo}>
            <Droplet size={24} fill="#ffffff" stroke="none" />
          </div>
          <div style={styles.brandName}>
            <span style={styles.brandTitle}>Aquafine</span>
            <span style={styles.brandSubtitle}>Admin Hub</span>
          </div>
          <button 
            style={styles.closeBtn} 
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav style={styles.navMenu}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isOpen && toggleSidebar && toggleSidebar()}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <div style={{
                  ...styles.iconWrapper,
                  ...(isActive ? styles.iconWrapperActive : {}),
                }}>
                  <Icon size={20} />
                </div>
                <span style={styles.navLabel}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user?.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.fullName || "Administrator"}</span>
              <span style={styles.userRole}>Super Admin</span>
            </div>
          </div>
          <button 
            style={styles.logoutBtn} 
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 998,
    transition: "all 0.3s ease",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    width: "var(--sidebar-width)",
    backgroundColor: "var(--teal-dark)",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    zIndex: 999,
    boxShadow: "10px 0 30px rgba(8, 61, 74, 0.15)",
    transition: "var(--transition-smooth)",
  },
  brandContainer: {
    height: "var(--navbar-height)",
    display: "flex",
    alignItems: "center",
    padding: "0 1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    position: "relative",
  },
  brandLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, var(--teal-light), var(--teal))",
    boxShadow: "0 4px 10px rgba(20, 184, 166, 0.3)",
    marginRight: "0.85rem",
  },
  brandName: {
    display: "flex",
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: "1.25rem",
    fontWeight: "800",
    letterSpacing: "0.2px",
    color: "#ffffff",
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
  },
  closeBtn: {
    display: "none",
    position: "absolute",
    right: "1rem",
    background: "none",
    border: "none",
    color: "rgba(255, 255, 255, 0.6)",
    cursor: "pointer",
    padding: "0.25rem",
  },
  navMenu: {
    flex: 1,
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    fontSize: "0.95rem",
    transition: "var(--transition-smooth)",
  },
  navItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    fontWeight: "600",
  },
  iconWrapper: {
    marginRight: "0.85rem",
    display: "flex",
    alignItems: "center",
    color: "rgba(255, 255, 255, 0.5)",
    transition: "var(--transition-smooth)",
  },
  iconWrapperActive: {
    color: "var(--teal-light)",
  },
  navLabel: {
    flex: 1,
  },
  sidebarFooter: {
    padding: "1.5rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    background: "rgba(3, 21, 26, 0.4)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "var(--teal-light)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1.1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  userName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#ffffff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    padding: "0.65rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "var(--transition-smooth)",
  },
};

export default Sidebar;

