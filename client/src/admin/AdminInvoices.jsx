import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoiceAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/dashboard.css";

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 700);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchInvoices(debouncedSearch, status, page);
  }, [debouncedSearch, status, page]);

  const fetchInvoices = async (q = "", s = "All", p = 1) => {
    setLoading(true);
    try {
      const res = await invoiceAPI.getAll({ search: q, status: s !== "All" ? s : undefined, page: p, limit: 7 });
      setInvoices(res.data.invoices);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, number) => {
    try {
      const res = await invoiceAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { toast.error("Download failed"); }
  };

  const handleUpdatePayment = async (id, paymentStatus) => {
    try {
      await invoiceAPI.updatePayment(id, { paymentStatus });
      fetchInvoices(debouncedSearch, status, page);
    } catch { toast.error("Update failed"); }
  };

  const totalRevenue = invoices.filter((i) => i.paymentStatus === "Paid").reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Invoices</h1>
        <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
          <i className="fa-solid fa-indian-rupee-sign" style={{ marginRight: 6 }} />
          Revenue: ₹{totalRevenue.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <i className="search-icon fa-solid fa-search" />
          <input type="text" placeholder="Search by customer or invoice number..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="All">All Payments</option>
          <option>Pending</option><option>Paid</option><option>Partial</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
        </div>
      ) : invoices.length === 0 ? (
        <div className="card"><div className="empty-state"><i className="fa-solid fa-file-invoice" /><p>No invoices found</p></div></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td><strong style={{ color: "var(--primary)" }}>{inv.invoiceNumber}</strong></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{inv.customerId?.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{inv.customerId?.phone}</div>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-gray)" }}>
                      {inv.orderId?.orderNumber}<br />
                      <span style={{ fontSize: 12 }}>{inv.orderId?.clothType}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>₹{inv.totalAmount.toFixed(2)}</td>
                    <td>
                      <select
                        className="badge"
                        style={{ border: "none", cursor: "pointer", fontSize: 12 }}
                        value={inv.paymentStatus}
                        onChange={(e) => handleUpdatePayment(inv._id, e.target.value)}
                      >
                        <option>Pending</option><option>Paid</option><option>Partial</option>
                      </select>
                    </td>
                    <td style={{ color: "var(--text-gray)", fontSize: 13 }}>{inv.paymentMethod}</td>
                    <td style={{ color: "var(--text-gray)", fontSize: 13 }}>
                      {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link to={`/admin/invoices/${inv._id}`} className="btn btn-outline btn-sm">
                          <i className="fa-solid fa-eye" />
                        </Link>
                        <button className="btn btn-primary btn-sm" onClick={() => handleDownload(inv._id, inv.invoiceNumber)}>
                          <i className="fa-solid fa-download" />
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

      {!loading && invoices.length > 0 && totalPages > 1 && (
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
