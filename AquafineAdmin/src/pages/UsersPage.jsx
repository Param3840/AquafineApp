import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Clock,
  ShieldCheck,
  UserCheck
} from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to retrieve users:", err.message);
      setError("Unable to connect to the backend server. Make sure it is running on port 4000.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Perform client-side filter based on search inputs
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.mobile?.includes(term)
    );
  });

  // Calculate stats
  const totalClients = users.length;
  const verifiedClients = users.filter(u => u.isVerified).length;
  const unverifiedClients = totalClients - verifiedClients;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Registered Clients</h1>
          <p className="page-subtitle">Manage client profiles, access credentials, and verified statuses.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          style={styles.refreshBtn}
        >
          <RefreshCw size={16} className={refreshing ? "spin-animate" : ""} />
          <span>Sync Database</span>
        </button>
      </div>

      {error && (
        <div className="alert-message alert-danger">
          <XCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.spinnerWrapper}>
          <RefreshCw size={40} className="spin-animate" style={{ color: "var(--teal)" }} />
          <span style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
            Querying MongoDB collections...
          </span>
        </div>
      ) : (
        <>
          {/* Mini-Stats Row */}
          <div style={styles.miniStatsRow}>
            <div style={styles.miniStatCard}>
              <div style={styles.miniStatIconBg}>
                <Users size={20} />
              </div>
              <div>
                <span style={styles.miniStatLabel}>Total Members</span>
                <span style={styles.miniStatValue}>{totalClients}</span>
              </div>
            </div>

            <div style={{ ...styles.miniStatCard, borderLeft: "4px solid var(--success)" }}>
              <div style={{ ...styles.miniStatIconBg, color: "var(--success)", backgroundColor: "var(--success-glow)" }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <span style={styles.miniStatLabel}>Verified Profiles</span>
                <span style={styles.miniStatValue}>{verifiedClients}</span>
              </div>
            </div>

            <div style={{ ...styles.miniStatCard, borderLeft: "4px solid var(--warning)" }}>
              <div style={{ ...styles.miniStatIconBg, color: "var(--warning)", backgroundColor: "rgba(245,158,11,0.08)" }}>
                <Clock size={20} />
              </div>
              <div>
                <span style={styles.miniStatLabel}>Approval Pending</span>
                <span style={styles.miniStatValue}>{unverifiedClients}</span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="card mb-6" style={styles.searchCard}>
            <div style={styles.searchContainer}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Filter clients by full name, email, or mobile..."
                className="input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Client Profile</th>
                  <th>Contact Details</th>
                  <th>Verification</th>
                  <th>Database Reference ID</th>
                  <th>Operations status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyCell}>
                      <UserCheck size={24} style={{ color: "var(--slate-300)" }} />
                      <p style={{ marginTop: "0.5rem" }}>
                        {searchTerm ? "No clients match your filter parameters" : "No users registered in the database yet."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div style={styles.profileCell}>
                          <div style={styles.avatar}>
                            {user.fullName?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div>
                            <span style={styles.userName}>{user.fullName}</span>
                            <span style={styles.userBadge}>Member Client</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={styles.contactCell}>
                          <div style={styles.contactItem}>
                            <Mail size={14} style={{ color: "var(--slate-400)" }} />
                            <span>{user.email}</span>
                          </div>
                          <div style={styles.contactItem}>
                            <Phone size={14} style={{ color: "var(--slate-400)" }} />
                            <span>{user.mobile}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.isVerified ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} style={{ marginRight: "0.25rem" }} />
                            Verified Account
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <Clock size={12} style={{ marginRight: "0.25rem" }} />
                            Pending Verification
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--slate-500)" }}>
                        {user.id}
                      </td>
                      <td>
                        <span style={styles.activeLabel}>
                          <span style={styles.activePulse} />
                          Active Session
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  refreshBtn: {
    height: "40px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0 1rem",
  },
  spinnerWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5rem 0",
  },
  miniStatsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  miniStatCard: {
    backgroundColor: "#ffffff",
    border: "1px solid var(--slate-200)",
    borderLeft: "4px solid var(--teal)",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "var(--shadow-sm)",
  },
  miniStatIconBg: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: "var(--teal-glow)",
    color: "var(--teal)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  miniStatLabel: {
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "var(--slate-500)",
    display: "block",
  },
  miniStatValue: {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "var(--slate-900)",
    lineHeight: "1.2",
  },
  searchCard: {
    padding: "1rem 1.5rem",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    color: "var(--slate-400)",
  },
  searchInput: {
    paddingLeft: "2.5rem",
  },
  profileCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--teal-glow)",
    color: "var(--teal)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.95rem",
    border: "1px solid rgba(15,118,110,0.15)",
  },
  userName: {
    fontWeight: "600",
    color: "var(--slate-900)",
    display: "block",
  },
  userBadge: {
    fontSize: "0.7rem",
    color: "var(--slate-400)",
    fontWeight: "500",
  },
  contactCell: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.825rem",
    color: "var(--slate-600)",
  },
  emptyCell: {
    textAlign: "center",
    padding: "3.5rem",
    color: "var(--slate-500)",
  },
  activeLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.8rem",
    color: "var(--success)",
    fontWeight: "600",
  },
  activePulse: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--success)",
    boxShadow: "0 0 6px var(--success)",
  },
};

export default UsersPage;
