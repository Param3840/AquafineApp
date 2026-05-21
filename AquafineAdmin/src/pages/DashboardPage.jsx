import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { 
  Users, 
  Droplet, 
  TrendingUp, 
  IndianRupee, 
  Activity,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck
} from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await adminAPI.getAnalytics();
      if (data.success) {
        setStats(data.stats);
        setRecentActivities(data.recentActivities);
      }
    } catch (err) {
      console.error("Failed to load dashboard analytics:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time control statistics and system analytics.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          style={styles.refreshBtn}
        >
          <RefreshCw size={16} className={refreshing ? "spin-animate" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.spinnerWrapper}>
          <RefreshCw size={40} className="spin-animate" style={{ color: "var(--teal)" }} />
          <span style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
            Syncing database records...
          </span>
        </div>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="analytics-grid" style={styles.grid6}>
            {/* Metric Card 1: Total Revenue */}
            <div className="metric-card">
              <div className="metric-icon-wrapper success">
                <IndianRupee size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Total Revenue</span>
                <span className="metric-value">₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
                <span className="metric-trend up">
                  <TrendingUp size={14} />
                  <span>Real Razorpay Revenue</span>
                </span>
              </div>
            </div>

            {/* Metric Card 2: Total Users */}
            <div className="metric-card">
              <div className="metric-icon-wrapper">
                <Users size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Total Users</span>
                <span className="metric-value">{stats?.totalUsers || 0}</span>
                <span className="metric-trend up">
                  <TrendingUp size={14} />
                  <span>Registered in MongoDB</span>
                </span>
              </div>
            </div>

            {/* Metric Card 3: Total Orders */}
            <div className="metric-card">
              <div className="metric-icon-wrapper gold">
                <Droplet size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Total Orders</span>
                <span className="metric-value">{stats?.totalOrders || 0}</span>
                <span className="metric-trend up">
                  <TrendingUp size={14} />
                  <span>Mobile App Orders</span>
                </span>
              </div>
            </div>

            {/* Metric Card 4: Successful Payments */}
            <div className="metric-card">
              <div className="metric-icon-wrapper success">
                <CheckCircle2 size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Successful Payments</span>
                <span className="metric-value">{stats?.successfulPaymentsCount || 0}</span>
                <span className="metric-trend up">
                  <TrendingUp size={14} />
                  <span>Captured Transactions</span>
                </span>
              </div>
            </div>

            {/* Metric Card 5: Pending Orders */}
            <div className="metric-card">
              <div className="metric-icon-wrapper warning">
                <Clock size={24} style={{ color: "var(--warning)" }} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Pending Orders</span>
                <span className="metric-value">{stats?.pendingOrders || 0}</span>
                <span className="metric-trend up">
                  <Clock size={14} style={{ color: "var(--warning)" }} />
                  <span>Awaiting Dispatch</span>
                </span>
              </div>
            </div>

            {/* Metric Card 6: Delivered Orders */}
            <div className="metric-card">
              <div className="metric-icon-wrapper" style={{ backgroundColor: "rgba(15,118,110,0.08)", color: "var(--teal)" }}>
                <Truck size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Delivered Orders</span>
                <span className="metric-value">{stats?.deliveredOrders || 0}</span>
                <span className="metric-trend up">
                  <CheckCircle2 size={14} style={{ color: "var(--teal)" }} />
                  <span>Successfully Received</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Analytics & Activity Section */}
          <div style={styles.gridSection}>
            {/* Section Left: Recent Transactions Table */}
            <div className="card" style={{ flex: 1.6, minWidth: "0" }}>
              <div className="flex-between mb-6">
                <div style={styles.cardHeader}>
                  <Activity size={20} style={{ color: "var(--teal)" }} />
                  <h3 style={styles.cardTitle}>Recent Operations Feed</h3>
                </div>
                <span style={styles.pulseBadge}>
                  <span style={styles.pulseDot} />
                  Live Sync Active
                </span>
              </div>

              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Activity</th>
                      <th>Detail</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--slate-400)" }}>
                          No recent activities found.
                        </td>
                      </tr>
                    ) : (
                      recentActivities.map((act) => (
                        <tr key={act.id}>
                          <td style={{ fontWeight: 600, color: "var(--slate-800)" }}>
                            {act.customer}
                          </td>
                          <td>{act.type}</td>
                          <td style={{ color: "var(--slate-600)" }}>{act.detail}</td>
                          <td>
                            <div style={styles.timestampCell}>
                              <Clock size={12} />
                              <span>{act.time}</span>
                            </div>
                          </td>
                          <td>
                            {act.status === "completed" ? (
                              <span className="badge badge-success">
                                <CheckCircle2 size={12} style={{ marginRight: "0.25rem" }} />
                                Completed
                              </span>
                            ) : (
                              <span className="badge badge-warning">
                                <Clock size={12} style={{ marginRight: "0.25rem" }} />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section Right: Quick Analytics Visual Panel */}
            <div className="card" style={{ flex: 1, minWidth: "280px" }}>
              <div className="mb-6">
                <h3 style={styles.cardTitle}>Sales Funnel Share</h3>
                <p style={styles.cardDesc}>Proportionate sales shares of premium bottle configurations.</p>
              </div>

              {/* Graphical representation bar */}
              <div style={styles.distributionContainer}>
                <div style={styles.distRow}>
                  <div style={styles.distLabelGroup}>
                    <span style={styles.distDot} />
                    <span style={styles.distName}>Customised Bottles</span>
                  </div>
                  <span style={styles.distValue}>{stats?.productShares?.customShare || 60}%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${stats?.productShares?.customShare || 60}%`, backgroundColor: "var(--teal)" }} />
                </div>

                <div style={styles.distRow}>
                  <div style={styles.distLabelGroup}>
                    <span style={{ ...styles.distDot, backgroundColor: "var(--gold)" }} />
                    <span style={styles.distName}>Premium Events</span>
                  </div>
                  <span style={styles.distValue}>{stats?.productShares?.eventShare || 25}%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${stats?.productShares?.eventShare || 25}%`, backgroundColor: "var(--gold)" }} />
                </div>

                <div style={styles.distRow}>
                  <div style={styles.distLabelGroup}>
                    <span style={{ ...styles.distDot, backgroundColor: "var(--teal-light)" }} />
                    <span style={styles.distName}>Retail Deliveries</span>
                  </div>
                  <span style={styles.distValue}>{stats?.productShares?.retailShare || 15}%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${stats?.productShares?.retailShare || 15}%`, backgroundColor: "var(--teal-light)" }} />
                </div>
              </div>

              {/* Link Banner */}
              <div style={styles.promoBanner}>
                <h4 style={styles.bannerTitle}>Customise Requests</h4>
                <p style={styles.bannerText}>Custom bottle requests are directly linked to active WhatsApp chats!</p>
                <a 
                  href="https://wa.me/9198271748494" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={styles.bannerLink}
                >
                  <span>WhatsApp Line</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  grid6: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
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
  gridSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
  pulseBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--teal)",
    backgroundColor: "var(--teal-glow)",
    padding: "0.25rem 0.65rem",
    borderRadius: "12px",
  },
  pulseDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--teal-light)",
    boxShadow: "0 0 8px var(--teal-light)",
  },
  timestampCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "var(--slate-500)",
    fontSize: "0.8rem",
  },
  distributionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  distRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.85rem",
  },
  distLabelGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  distDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--teal)",
  },
  distName: {
    fontWeight: "500",
    color: "var(--slate-700)",
  },
  distValue: {
    fontWeight: "600",
    color: "var(--slate-900)",
  },
  progressBarBg: {
    height: "6px",
    width: "100%",
    backgroundColor: "var(--slate-100)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "3px",
  },
  promoBanner: {
    marginTop: "2rem",
    padding: "1.25rem",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, var(--teal-dark) 0%, #03151a 100%)",
    color: "#ffffff",
  },
  bannerTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    letterSpacing: "0.1px",
  },
  bannerText: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.7)",
    marginTop: "0.35rem",
    lineHeight: 1.4,
  },
  bannerLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.8rem",
    color: "var(--gold-light)",
    fontWeight: "700",
    marginTop: "0.85rem",
    transition: "var(--transition-smooth)",
  },
};

export default DashboardPage;
