import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/dashboard.css";

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 700);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchCustomers(debouncedSearch, page);
  }, [debouncedSearch, page]);

  const fetchCustomers = async (q = "", p = 1) => {
    setLoading(true);
    try {
      const res = await userAPI.getAllCustomers({ search: q, page: p, limit: 7 });
      setCustomers(res.data.customers);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
      setTotalCustomers(res.data.totalCustomers || res.data.customers.length);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await userAPI.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      setDeleteConfirm(null);
      toast.success("Customer deleted successfully");
          } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Navigate to orders filtered by this customer
  const viewCustomerOrders = (customerId, customerName) => {
    navigate(`/admin/orders?userId=${customerId}&customerName=${encodeURIComponent(customerName)}`);
  };

  return (
    <div>
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Delete Customer?</h3>
            <p style={{ color: "var(--text-gray)", marginBottom: 6 }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 24 }}>
              This will permanently delete their account, all orders and invoices.
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
        <h1 className="page-title" style={{ margin: 0 }}>Customers</h1>
        <div style={{ fontSize: 13, color: "var(--text-gray)" }}>
          <i className="fa-solid fa-users" style={{ marginRight: 6 }} />{totalCustomers} registered
        </div>
      </div>

      
      <div className="filter-bar">
        <div className="search-wrap">
          <i className="search-icon fa-solid fa-search" />
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
        </div>
      ) : customers.length === 0 ? (
        <div className="card"><div className="empty-state"><i className="fa-solid fa-users" /><p>No customers found</p></div></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-gray)", fontSize: 13 }}>{c.phone}</td>
                    <td style={{ color: "var(--text-gray)", fontSize: 13, maxWidth: 160 }}>
                      {c.address ? (
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(c.address)}`} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline", display: "inline-flex", alignItems: "center" }} title="Open in Google Maps">
                          <i className="fa-solid fa-location-dot" style={{ marginRight: 6, fontSize: 12 }} />{c.address}
                        </a>
                      ) : "—"}
                    </td>
                    <td style={{ color: "var(--text-gray)", fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span className={`badge ${c.isVerified ? "badge-delivered" : "badge-pending"}`}>
                        {c.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* ✅ FIX: Now filters orders by this customer */}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => viewCustomerOrders(c._id, c.name)}
                        >
                          <i className="fa-solid fa-list-check" /> Orders
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteConfirm(c)}
                          title="Delete customer"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!loading && customers.length > 0 && totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderTop: "1px solid var(--border)" }}>
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
      )}
    </div>
  );
}
