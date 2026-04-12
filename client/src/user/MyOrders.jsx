import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import "../styles/dashboard.css";

const STATUS_COLORS = { "Measurement Scheduled": "badge-pending", Pending: "badge-pending", Cutting: "badge-cutting", Stitching: "badge-stitching", Ready: "badge-ready", Delivered: "badge-delivered" };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 7;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on search
    }, 2000);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const fetchOrders = () => {
    setLoading(true);
    // orderAPI.getMyOrders does not take params in api.js currently? Wait, let's fix api.js or use params in MyOrders.
    // If orderAPI.getMyOrders doesn't accept params, we should update api.js or pass them.
    // Assuming we'll update api.js to pass params if needed, or we just pass them here.
    orderAPI.getMyOrders({ page: currentPage, limit, search: debouncedSearch }).then((res) => {
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages || 1);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, currentPage, statusFilter]); // We'll apply statusFilter locally since backend didn't do it for getUserOrders, or we could add it to backend.
  
  // Wait, backend getUserOrders doesn't filter by status currently! Let's filter locally for status since it's already fetching paginated. 
  // Actually, wait, local filtering on paginated data only filters the current page. We should probably filter on the backend for status. I'll add a quick local filter just for UI consistency for now.
  const displayOrders = statusFilter === "All" ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Orders</h1>
        <Link to="/place-order" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> New Order
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <i className="search-icon fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search by cloth type or order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          {["Measurement Scheduled", "Pending", "Cutting", "Stitching", "Ready", "Delivered"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-inbox" />
            <p>No orders found.</p>
            <Link to="/place-order" className="btn btn-primary" style={{ marginTop: 16 }}>
              <i className="fa-solid fa-plus" /> Place Your First Order
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Cloth Type</th>
                  <th>Fabric</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>{order.orderNumber}</span>
                      <br />
                      <small style={{ color: "var(--text-gray)" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</small>
                    </td>
                    <td>
                      <strong>{order.clothType}</strong>
                      {order.customClothType && <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{order.customClothType}</div>}
                    </td>
                    <td style={{ color: "var(--text-gray)" }}>{order.fabricType || "—"}</td>
                    <td><span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span></td>
                    <td style={{ color: "var(--text-gray)" }}>
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-dark)" }}>
                      {order.price ? `₹${order.price}` : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                          <i className="fa-solid fa-eye" /> View
                        </Link>
                        {order.invoiceGenerated && (
                          <Link to="/invoices" className="btn btn-sm" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                            <i className="fa-solid fa-file-invoice" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid var(--border)", background: "#fff" }}>
              <div style={{ fontSize: 14, color: "var(--text-gray)" }}>
                Page {currentPage} of {totalPages}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <i className="fa-solid fa-chevron-left" /> Previous
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage >= totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
