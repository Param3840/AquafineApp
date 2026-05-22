import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronRight,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  ThumbsUp
} from "lucide-react";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await adminAPI.getOrders();
      setOrders(data || []);
      
      // Update selected order reference to show fresh values if it's currently open
      if (selectedOrder) {
        const fresh = data.find(o => o.id === selectedOrder.id);
        if (fresh) setSelectedOrder(fresh);
      }
    } catch (err) {
      console.error("Failed to fetch database orders:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Update order status action handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        // Refresh local items
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to save order status change:", err.message);
      alert("Failed to update status. Please try again.");
    }
  };

  // Filter orders based on search string and selected status category
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobile.includes(searchTerm) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Order Catalog</h1>
          <p className="page-subtitle">Track custom branding requests and premium volume distribution.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            style={styles.exportBtn}
          >
            <RefreshCw size={16} className={refreshing ? "spin-animate" : ""} />
            <span>Sync Orders</span>
          </button>
        </div>
      </div>

      {/* Action Filters Panel */}
      <div className="card mb-6" style={styles.filterCard}>
        <div style={styles.searchSection}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by Order ID, name or mobile..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterSection}>
          <Filter size={16} style={{ color: "var(--slate-500)" }} />
          <div style={styles.filterBtns}>
            {["all", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  ...styles.filterBtn,
                  ...(statusFilter === status ? styles.filterBtnActive : {}),
                }}
              >
                {status === "all" ? "All Orders" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main split display: table list + details side modal */}
      {loading ? (
        <div style={styles.spinnerWrapper}>
          <RefreshCw size={40} className="spin-animate" style={{ color: "var(--teal)" }} />
          <span style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
            Querying orders catalog...
          </span>
        </div>
      ) : (
        <div style={styles.splitGrid}>
          {/* Table representation */}
          <div className="table-container" style={{ flex: 2, minWidth: "0" }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Items Ordered</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyCell}>
                      <AlertCircle size={20} style={{ color: "var(--slate-400)" }} />
                      <span style={{ marginTop: "0.5rem" }}>No matching orders found</span>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedOrder?.id === order.id ? "var(--slate-50)" : "",
                      }}
                    >
                      <td style={{ fontWeight: 700, color: "var(--teal)", fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {order.id}
                      </td>
                      <td>
                        <div style={styles.customerCell}>
                          <span style={styles.customerName}>{order.customer}</span>
                          <span style={styles.customerMobile}>{order.mobile}</span>
                        </div>
                      </td>
                      <td>{order.date}</td>
                      <td style={{ color: "var(--slate-600)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.items}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--slate-800)" }}>
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          order.status === "Delivered" ? "badge-success" : 
                          order.status === "Cancelled" ? "badge-danger" : 
                          order.status === "Pending" ? "badge-warning" : "badge-info"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          style={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Dynamic Detail Side card */}
          {selectedOrder && (
            <div className="card" style={styles.detailCard}>
              <div style={styles.detailHeader}>
                <div>
                  <span style={styles.detailLabel}>ORDER DETAILS</span>
                  <h3 style={{ ...styles.detailTitle, fontFamily: "monospace", fontSize: "1.1rem" }}>{selectedOrder.id}</h3>
                </div>
                <button 
                  style={styles.closeDetailBtn} 
                  onClick={() => setSelectedOrder(null)}
                >
                  &times;
                </button>
              </div>

              <div style={styles.detailDivider} />

              {/* Profile Info */}
              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>Client Information</h4>
                <p style={styles.detailValue}>{selectedOrder.customer}</p>
                <p style={styles.detailSubValue}>Mobile: {selectedOrder.mobile}</p>
                <p style={styles.detailSubValue}>Email: {selectedOrder.email}</p>
                <p style={styles.detailSubValue}>Payment ID: {selectedOrder.payment}</p>
              </div>

              {/* Delivery Address Snapshot */}
              {selectedOrder.deliveryAddress && (
                <div style={styles.detailSection}>
                  <h4 style={styles.sectionTitle}>Delivery Destination</h4>
                  <div style={styles.addressBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ ...styles.detailValue, margin: 0 }}>
                        {selectedOrder.deliveryAddress.fullName}
                      </p>
                      <span style={styles.addressTypeBadge}>
                        {selectedOrder.deliveryAddress.addressType || "Home"}
                      </span>
                    </div>
                    <p style={{ ...styles.detailSubValue, margin: "0.25rem 0 0", lineHeight: "1.4" }}>
                      {selectedOrder.deliveryAddress.houseFlat}, {selectedOrder.deliveryAddress.areaStreet}
                      {selectedOrder.deliveryAddress.landmark && `, ${selectedOrder.deliveryAddress.landmark}`}
                      <br />
                      {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                    </p>
                    <p style={{ ...styles.detailSubValue, margin: "0.25rem 0 0", fontWeight: 600, color: "var(--slate-700)" }}>
                      Phone: {selectedOrder.deliveryAddress.mobile}
                    </p>
                  </div>
                </div>
              )}

              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>Order Summary</h4>
                <p style={styles.detailValue}>{selectedOrder.items}</p>
                <p style={styles.detailSubValue}>Order Date: {selectedOrder.date}</p>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>Grand Total</h4>
                <p style={styles.detailTotal}>₹{selectedOrder.total.toLocaleString()}</p>
              </div>

              {/* Interactive Status Handlers */}
              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <span style={styles.actionHeaderLabel}>CHANGE ORDER STATUS</span>
                <div style={styles.selectWrapper}>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    style={styles.statusSelect}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  spinnerWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5rem 0",
  },
  exportBtn: {
    height: "40px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0 1rem",
  },
  filterCard: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.25rem",
    padding: "1.25rem 1.75rem",
  },
  searchSection: {
    position: "relative",
    flex: "1",
    minWidth: "240px",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    color: "var(--slate-400)",
  },
  searchInput: {
    paddingLeft: "2.5rem",
  },
  filterSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  filterBtns: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  filterBtn: {
    background: "none",
    border: "1px solid var(--slate-200)",
    borderRadius: "8px",
    padding: "0.45rem 0.85rem",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "var(--slate-600)",
    cursor: "pointer",
    transition: "var(--transition-smooth)",
  },
  filterBtnActive: {
    backgroundColor: "var(--teal)",
    borderColor: "var(--teal)",
    color: "#ffffff",
  },
  splitGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    alignItems: "flex-start",
  },
  customerCell: {
    display: "flex",
    flexDirection: "column",
  },
  customerName: {
    fontWeight: "600",
    color: "var(--slate-900)",
  },
  customerMobile: {
    fontSize: "0.75rem",
    color: "var(--slate-500)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid var(--slate-200)",
    backgroundColor: "#ffffff",
    color: "var(--slate-600)",
    cursor: "pointer",
    transition: "var(--transition-smooth)",
  },
  emptyCell: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--slate-500)",
  },
  detailCard: {
    flex: "1",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    backgroundColor: "#ffffff",
    boxShadow: "var(--shadow-lg)",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: "0.7rem",
    fontWeight: "800",
    color: "var(--slate-400)",
    letterSpacing: "0.05em",
  },
  detailTitle: {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "var(--teal-dark)",
    marginTop: "0.25rem",
  },
  closeDetailBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "var(--slate-400)",
    cursor: "pointer",
    lineHeight: "1",
    padding: "0.25rem",
  },
  detailDivider: {
    height: "1px",
    backgroundColor: "var(--slate-100)",
  },
  detailSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "var(--slate-400)",
    letterSpacing: "0.05em",
  },
  detailValue: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--slate-800)",
  },
  detailSubValue: {
    fontSize: "0.85rem",
    color: "var(--slate-500)",
  },
  detailTotal: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "var(--teal)",
  },
  actionHeaderLabel: {
    fontSize: "0.7rem",
    fontWeight: "800",
    color: "var(--slate-400)",
    display: "block",
    marginBottom: "0.75rem",
    letterSpacing: "0.05em",
  },
  selectWrapper: {
    width: "100%",
    position: "relative",
  },
  statusSelect: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    border: "1px solid var(--slate-200)",
    backgroundColor: "var(--slate-50)",
    color: "var(--slate-800)",
    fontSize: "0.85rem",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  addressBox: {
    backgroundColor: "var(--slate-50)",
    border: "1px solid var(--slate-100)",
    borderRadius: "10px",
    padding: "0.85rem",
    marginTop: "0.25rem",
  },
  addressTypeBadge: {
    display: "inline-block",
    fontSize: "0.65rem",
    fontWeight: "800",
    textTransform: "uppercase",
    backgroundColor: "#f0fdfa",
    color: "var(--teal)",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    border: "1px solid #ccfbf1",
  },
};

export default OrdersPage;
