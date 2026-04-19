import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import "../styles/dashboard.css";

const STATUS_OPTIONS = ["All", "Measurement Scheduled", "Pending", "Cutting", "Stitching", "Ready", "Delivered"];
const STATUS_COLORS = { "Measurement Scheduled": "badge-pending", Pending: "badge-pending", Cutting: "badge-cutting", Stitching: "badge-stitching", Ready: "badge-ready", Delivered: "badge-delivered" };

export default function AdminOrders() {
  const navigate = useNavigate();
  // We'll primarily display items now, but still keep track of deleteConfirm which relies on order.
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customerFilter, setCustomerFilter] = useState(null); // { id, name }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // order object
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 700);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const s = searchParams.get("status");
    const uid = searchParams.get("userId");
    const uname = searchParams.get("customerName");
    if (s) setStatus(s);
    if (uid) setCustomerFilter({ id: uid, name: decodeURIComponent(uname || "") });
  }, []);

  useEffect(() => {
    fetchItems(debouncedSearch, status, customerFilter?.id || null, page);
  }, [debouncedSearch, status, customerFilter, page]);

  const fetchItems = async (q = "", s = "All", uid = null, p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 7 };
      if (q) params.search = q;
      if (s && s !== "All") params.status = s;
      if (uid) params.userId = uid;
      
      const res = await orderAPI.getAllItems(params);
      setItems(res.data.items);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    } finally {
      setLoading(false);
    }
  };

  const clearCustomerFilter = () => {
    setCustomerFilter(null);
    setPage(1);
    navigate("/admin/orders", { replace: true });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleStatus = (s) => {
    setStatus(s);
    setPage(1);
  };

  const handleDelete = async (orderId) => {
    setDeleting(true);
    try {
      await orderAPI.delete(orderId);
      // Remove all items that belong to this order
      setItems((prev) => prev.filter((i) => i.orderId?._id !== orderId));
      setDeleteConfirm(null);
      setMsg({ type: "success", text: "Order deleted successfully" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Delete Entire Order?</h3>
            <p style={{ color: "var(--text-gray)", marginBottom: 6 }}>
              Delete order <strong>{deleteConfirm.orderNumber}</strong>?
            </p>
            <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 24 }}>
              This will delete the order and <strong>ALL of its items</strong> permanently.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)} disabled={deleting}>
                {deleting ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting...</> : <><i className="fa-solid fa-trash" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            {customerFilter ? `${customerFilter.name}'s Items` : "All Order Items"}
          </h1>
          {customerFilter && (
            <button onClick={clearCustomerFilter} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer", marginTop: 4 }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} />
              Show all items
            </button>
          )}
        </div>
        <Link to="/admin/orders/create" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Create Walk-in Order
        </Link>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Customer filter active banner */}
      {customerFilter && (
        <div className="alert alert-info" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span><i className="fa-solid fa-filter" style={{ marginRight: 8 }} />Showing items for: <strong>{customerFilter.name}</strong></span>
          <button onClick={clearCustomerFilter} style={{ background: "none", border: "none", color: "var(--info)", cursor: "pointer", fontWeight: 600 }}>
            <i className="fa-solid fa-times" /> Clear Filter
          </button>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-wrap">
          <i className="search-icon fa-solid fa-search" />
          <input type="text" placeholder="Search by customer or order number..." value={search} onChange={handleSearch} />
        </div>
        <select value={status} onChange={(e) => handleStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => handleStatus(s)}
            className={`btn btn-sm ${status === s ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 12 }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="card"><div className="empty-state"><i className="fa-solid fa-inbox" /><p>No items found</p></div></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Item / Cloth Type</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--primary)" }}>{item.orderId?.orderNumber || "Unknown"}</span>
                      <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.orderId?.userId?.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{item.orderId?.userId?.phone || "—"}</div>
                    </td>
                    <td>
                      {item.clothType}
                      {item.customClothType && <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{item.customClothType}</div>}
                    </td>
                    <td>{item.quantity || 1}</td>
                    <td><span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{item.price ? `₹${item.price}` : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link to={`/admin/orders/${item.orderId?._id}`} className="btn btn-outline btn-sm">
                          <i className="fa-solid fa-gear" /> Manage Order
                        </Link>
                        {/* We use a specific item flag because we can't easily delete one item from the backend currently. We can just offer "Delete Full Order" for now. */}
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(item.orderId)} title="Delete entire order">
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          <div style={{ fontSize: 13, color: "var(--text-gray)" }}>
            Showing page {page} of {totalPages}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <i className="fa-solid fa-chevron-left" style={{ marginRight: 6 }} /> Previous
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next <i className="fa-solid fa-chevron-right" style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
