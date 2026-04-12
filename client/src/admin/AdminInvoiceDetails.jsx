import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceAPI } from "../services/api";
import "../styles/dashboard.css";
import "../styles/form.css";

export default function AdminInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    invoiceAPI.getById(id).then((res) => {
      setInvoice(res.data.invoice);
      setEditForm({
        paymentStatus: res.data.invoice.paymentStatus,
        paymentMethod: res.data.invoice.paymentMethod,
        discount: res.data.invoice.discount,
        tax: res.data.invoice.tax,
        notes: res.data.invoice.notes || "",
      });
    }).catch(() => navigate("/admin/invoices")).finally(() => setLoading(false));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await invoiceAPI.update(id, editForm);
      setInvoice(res.data.invoice);
      setEditing(false);
      setMsg({ type: "success", text: "Invoice updated successfully!" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setMsg({ type: "error", text: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} /></div>;
  if (!invoice) return null;

  const order = invoice.orderId;
  const customer = invoice.customerId;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/invoices")}>
            <i className="fa-solid fa-arrow-left" />
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>Invoice: {invoice.invoiceNumber}</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setEditing(!editing)}>
            <i className={`fa-solid ${editing ? "fa-times" : "fa-pencil"}`} /> {editing ? "Cancel" : "Edit"}
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()}><i className="fa-solid fa-print" /> Print</button>
          <button className="btn btn-primary" onClick={handleDownload}><i className="fa-solid fa-download" /> Download PDF</button>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {editing && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-section-title">Edit Invoice</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Payment Status", key: "paymentStatus", type: "select", options: ["Pending", "Paid", "Partial"] },
              { label: "Payment Method", key: "paymentMethod", type: "select", options: ["Cash", "UPI", "Online", "Card"] },
              { label: "Discount (₹)", key: "discount", type: "number" },
              { label: "Tax (₹)", key: "tax", type: "number" },
            ].map((f) => (
              <div className="form-group" style={{ margin: 0 }} key={f.key}>
                <label style={{ fontSize: 12 }}>{f.label}</label>
                {f.type === "select" ? (
                  <select className="form-control" value={editForm[f.key]} onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="form-control" type="number" value={editForm[f.key]} onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Notes</label>
            <input className="form-control" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Add a note..." />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleSave} disabled={saving}>
            {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-check" /> Save Changes</>}
          </button>
        </div>
      )}

      {/* Invoice Preview */}
      <div className="invoice-preview">
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
          <div className="invoice-meta-row">
            <div className="invoice-meta-box">
              <div className="meta-title">Bill To</div>
              <div className="meta-name">{customer?.name}</div>
              <div className="meta-detail">{customer?.email}<br />{customer?.phone}<br />{customer?.address}</div>
            </div>
            <div className="invoice-meta-box">
              <div className="meta-title">Invoice Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px", fontSize: 13 }}>
                {[
                  ["Invoice No.", invoice.invoiceNumber],
                  ["Order No.", order?.orderNumber],
                  ["Cloth Type", order?.clothType],
                  ["Payment", invoice.paymentStatus],
                  ["Method", invoice.paymentMethod],
                  ["Date", new Date(invoice.createdAt).toLocaleDateString("en-IN")],
                ].map(([k, v]) => (
                  <React.Fragment key={k}>
                    <span style={{ color: "var(--text-gray)" }}>{k}:</span>
                    <strong>{v}</strong>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>#</th><th>Description</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-gray)" }}>{i + 1}</td>
                    <td><strong>{item.name}</strong>{item.description && <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{item.description}</div>}</td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{item.price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals">
            <div className="total-row"><span>Subtotal</span><span>₹{invoice.subtotal.toFixed(2)}</span></div>
            {invoice.discount > 0 && <div className="total-row" style={{ color: "var(--danger)" }}><span>Discount</span><span>-₹{invoice.discount.toFixed(2)}</span></div>}
            {invoice.tax > 0 && <div className="total-row"><span>Tax</span><span>₹{invoice.tax.toFixed(2)}</span></div>}
            <div className="total-row grand"><span>Total</span><span>₹{invoice.totalAmount.toFixed(2)}</span></div>
          </div>

          {invoice.notes && <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--primary-pale)", borderRadius: 8, fontSize: 13, color: "var(--text-gray)", fontStyle: "italic" }}><i className="fa-solid fa-note-sticky" style={{ marginRight: 8 }} />{invoice.notes}</div>}

          <div className="invoice-footer-note">
            Thank you for choosing ઘનશ્યામ Ladies Tailor!<br />
            <span style={{ fontSize: 12 }}>This is a computer-generated invoice. No signature required.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
