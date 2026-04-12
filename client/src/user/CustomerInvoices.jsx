import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoiceAPI } from "../services/api";
import "../styles/dashboard.css";

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 7;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on new search
    }, 2000);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchInvoices = () => {
    setLoading(true);
    invoiceAPI.getMyInvoices({ page: currentPage, limit, search: debouncedSearch }).then((res) => {
      setInvoices(res.data.invoices);
      setTotalPages(res.data.totalPages || 1);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [debouncedSearch, currentPage]);

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
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download invoice");
    }
  };

  return (
    <div>
      <h1 className="page-title">My Invoices</h1>

      <div className="filter-bar">
        <div className="search-wrap">
          <i className="search-icon fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search by invoice number or order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
        </div>
      ) : invoices.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-file-invoice-dollar" />
            <p>No invoices found.</p>
            {search ? (
              <small style={{ color: "var(--text-light)" }}>Try adjusting your search keywords.</small>
            ) : (
              <small style={{ color: "var(--text-light)" }}>Invoices are generated when your order is delivered.</small>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 14 }}>
            {invoices.map((inv) => (
              <div key={inv._id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: 16 }}>
                <div style={{ width: 48, height: 48, background: "var(--accent-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="fa-solid fa-file-invoice" style={{ color: "var(--accent)", fontSize: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: 15 }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: 13, color: "var(--text-gray)", marginTop: 2 }}>
                    {inv.orderId?.clothType} · {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-dark)" }}>₹{inv.totalAmount}</div>
                  <div style={{ fontSize: 12, color: "var(--text-gray)" }}>Total</div>
                </div>
                <span className={`badge ${inv.paymentStatus === "Paid" ? "badge-delivered" : inv.paymentStatus === "Partial" ? "badge-cutting" : "badge-pending"}`}>
                  {inv.paymentStatus}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/invoices/${inv._id}`} className="btn btn-outline btn-sm">
                    <i className="fa-solid fa-eye" /> View
                  </Link>
                  <button className="btn btn-primary btn-sm" onClick={() => handleDownload(inv._id, inv.invoiceNumber)}>
                    <i className="fa-solid fa-download" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", marginTop: 14, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "#fff" }}>
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
        </>
      )}
    </div>
  );
}
