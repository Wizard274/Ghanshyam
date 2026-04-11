import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceAPI } from "../services/api";
import "../styles/dashboard.css";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceAPI.getById(id).then((res) => setInvoice(res.data.invoice))
      .catch(() => navigate("/invoices")).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    try {
      const res = await invoiceAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert("Download failed"); }
  };

  const handlePrint = () => window.print();

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} /></div>;
  if (!invoice) return null;

  const order = invoice.orderId;
  const customer = invoice.customerId;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/invoices")}>
            <i className="fa-solid fa-arrow-left" />
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>Invoice Details</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={handlePrint}><i className="fa-solid fa-print" /> Print</button>
          <button className="btn btn-primary" onClick={handleDownload}><i className="fa-solid fa-download" /> Download PDF</button>
        </div>
      </div>

      <div className="invoice-preview">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <div className="invoice-shop-name">ઘનશ્યામ Ladies Tailor</div>
            <div className="invoice-shop-tagline">Precision and Perfection in Every Stitch</div>
            <div className="invoice-shop-contact">
              📞 +91 81609 42724 &nbsp;·&nbsp; ✉ ghanshyamladiestailor21@gmail.com<br />
              📍 Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad.
            </div>
          </div>
          <div className="invoice-number-block">
            <div className="inv-label">Invoice</div>
            <div className="inv-number">{invoice.invoiceNumber}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 6 }}>
              {new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="invoice-body">
          {/* Meta */}
          <div className="invoice-meta-row">
            <div className="invoice-meta-box">
              <div className="meta-title">Bill To</div>
              <div className="meta-name">{customer?.name}</div>
              <div className="meta-detail">
                {customer?.email}<br />
                {customer?.phone}<br />
                {customer?.address || "—"}
              </div>
            </div>
            <div className="invoice-meta-box">
              <div className="meta-title">Invoice Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 13 }}>
                {[
                  ["Invoice No.", invoice.invoiceNumber],
                  ["Order No.", order?.orderNumber],
                  ["Date", new Date(invoice.createdAt).toLocaleDateString("en-IN")],
                  ["Payment", invoice.paymentStatus],
                  ["Method", invoice.paymentMethod],
                  ["Cloth", order?.clothType],
                ].map(([k, v]) => (
                  <React.Fragment key={k}>
                    <span style={{ color: "var(--text-gray)" }}>{k}:</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="table-wrap">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-gray)" }}>{i + 1}</td>
                    <td>
                      <strong>{item.name}</strong>
                      {item.description && <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{item.description}</div>}
                    </td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{item.price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="invoice-totals">
            <div className="total-row"><span>Subtotal</span><span>₹{invoice.subtotal.toFixed(2)}</span></div>
            {invoice.discount > 0 && <div className="total-row" style={{ color: "var(--danger)" }}><span>Discount</span><span>-₹{invoice.discount.toFixed(2)}</span></div>}
            {invoice.tax > 0 && <div className="total-row"><span>Tax (GST)</span><span>₹{invoice.tax.toFixed(2)}</span></div>}
            <div className="total-row grand"><span>Total Amount</span><span>₹{invoice.totalAmount.toFixed(2)}</span></div>
          </div>

          {/* Payment Status */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
            <span className={`badge ${invoice.paymentStatus === "Paid" ? "badge-delivered" : invoice.paymentStatus === "Partial" ? "badge-cutting" : "badge-pending"}`} style={{ padding: "6px 16px", fontSize: 13 }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />Payment: {invoice.paymentStatus}
            </span>
            <span className="badge badge-stitching" style={{ padding: "6px 16px", fontSize: 13 }}>
              <i className="fa-solid fa-credit-card" style={{ marginRight: 6 }} />{invoice.paymentMethod}
            </span>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--primary-pale)", borderRadius: 8, fontSize: 13, color: "var(--text-gray)", fontStyle: "italic" }}>
              <i className="fa-solid fa-note-sticky" style={{ marginRight: 8 }} />{invoice.notes}
            </div>
          )}

          <div className="invoice-footer-note">
            Thank you for choosing ઘનશ્યામ Ladies Tailor!<br />
            <span style={{ fontSize: 12 }}>This is a computer-generated invoice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
