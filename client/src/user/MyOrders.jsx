import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import "../styles/dashboard.css";

const STATUS_COLORS = { "Measurement Scheduled": "badge-pending", Pending: "badge-pending", Cutting: "badge-cutting", Stitching: "badge-stitching", Ready: "badge-ready", Delivered: "badge-delivered" };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    orderAPI.getMyOrders().then((res) => {
      setOrders(res.data.orders);
      setFiltered(res.data.orders);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = orders;
    if (statusFilter !== "All") list = list.filter((o) => o.status === statusFilter);
    if (search) list = list.filter((o) =>
      o.clothType.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, statusFilter, orders]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );

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

      {filtered.length === 0 ? (
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
                {filtered.map((order) => (
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
        </div>
      )}
    </div>
  );
}
