import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { 
  CreditCard, 
  Search, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  Percent,
  Activity,
  User,
  RefreshCw
} from "lucide-react";

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      const data = await adminAPI.getPayments();
      setPayments(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch payments:", err.message);
      setError("Unable to retrieve payment transaction history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const filteredTransactions = payments.filter(t => 
    t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic computations
  const totalRevenue = payments.reduce((sum, p) => p.status === "Captured" ? sum + p.amount : sum, 0);
  const successfulCount = payments.filter(p => p.status === "Captured").length;
  const failedCount = payments.length - successfulCount;
  const successRate = payments.length > 0 ? ((successfulCount / payments.length) * 100).toFixed(1) : "0.0";

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Razorpay Payments</h1>
          <p className="page-subtitle">Monitor payment gateways, transaction statuses, and payout success rates.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          style={styles.refreshBtn}
        >
          <RefreshCw size={16} className={refreshing ? "spin-animate" : ""} />
          <span>Sync Payments</span>
        </button>
      </div>

      {error && (
        <div className="alert-message alert-danger mb-6">
          <XCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.spinnerWrapper}>
          <RefreshCw size={40} className="spin-animate" style={{ color: "var(--teal)" }} />
          <span style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
            Querying Razorpay transactions...
          </span>
        </div>
      ) : (
        <>
          {/* Transaction Summary Panel */}
          <div style={styles.summaryRow}>
            <div className="card" style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <span style={styles.summaryLabel}>TOTAL REVENUE CAPTURED</span>
                <TrendingUp size={16} style={{ color: "var(--success)" }} />
              </div>
              <span style={styles.summaryValue}>₹{totalRevenue.toLocaleString()}</span>
              <span style={styles.summarySub}>From {successfulCount} successful transactions</span>
            </div>

            <div className="card" style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <span style={styles.summaryLabel}>PAYMENT SUCCESS RATE</span>
                <Percent size={16} style={{ color: "var(--teal)" }} />
              </div>
              <span style={styles.summaryValue}>{successRate}%</span>
              <span style={styles.summarySub}>{failedCount} failed transaction{failedCount !== 1 ? "s" : ""} this cycle</span>
            </div>

            <div className="card" style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <span style={styles.summaryLabel}>GATEWAY INTEGRATION</span>
                <Activity size={16} style={{ color: "var(--success)" }} />
              </div>
              <span style={{ ...styles.summaryValue, color: "var(--teal)", fontSize: "1.35rem", fontWeight: "800", marginTop: "0.5rem" }}>
                Razorpay Live Mode
              </span>
              <span style={{ ...styles.summarySub, marginTop: "0.25rem" }}>Connected to Backend APIs</span>
            </div>
          </div>

          {/* Search Filter Panel */}
          <div className="card mb-6" style={styles.searchCard}>
            <div style={styles.searchContainer}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search payments by Transaction ID, Order ID or Customer Name..."
                className="input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Transactions spreadsheet list */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Processed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyCell}>
                      <CreditCard size={24} style={{ color: "var(--slate-300)" }} />
                      <span style={{ marginTop: "0.5rem", display: "block" }}>No payments match your filters</span>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: "600", color: "var(--slate-800)" }}>
                        {t.id}
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--teal)", fontFamily: "monospace" }}>
                        {t.orderId}
                      </td>
                      <td>
                        <div style={styles.customerCell}>
                          <User size={14} style={{ color: "var(--slate-400)" }} />
                          <span>{t.customer}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--slate-900)" }}>
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td style={{ color: "var(--slate-600)" }}>
                        {t.method}
                      </td>
                      <td>{t.date}</td>
                      <td>
                        {t.status === "Captured" ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} style={{ marginRight: "0.25rem" }} />
                            Captured
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <XCircle size={12} style={{ marginRight: "0.25rem" }} />
                            Failed
                          </span>
                        )}
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
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--slate-500)",
  },
  summaryValue: {
    fontSize: "1.875rem",
    fontWeight: "800",
    color: "var(--slate-900)",
    marginTop: "0.5rem",
    display: "block",
  },
  summarySub: {
    fontSize: "0.8rem",
    color: "var(--slate-500)",
    marginTop: "0.25rem",
    display: "block",
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
  customerCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontWeight: "500",
  },
  emptyCell: {
    textAlign: "center",
    padding: "3.5rem",
    color: "var(--slate-500)",
  },
};

export default PaymentsPage;
