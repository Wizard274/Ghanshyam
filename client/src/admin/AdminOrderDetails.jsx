import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderAPI, invoiceAPI } from "../services/api";
import "../styles/dashboard.css";
import "../styles/form.css";

const DEFAULT_STATUS_STEPS = ["Pending", "Cutting", "Stitching", "Ready", "Delivered"];
const DEFAULT_STEP_ICONS = ["fa-clock", "fa-cut", "fa-spool", "fa-check-circle", "fa-truck"];

const TAILOR_STATUS_STEPS = ["Measurement Scheduled", "Pending", "Cutting", "Stitching", "Ready", "Delivered"];
const TAILOR_STEP_ICONS = ["fa-calendar-check", "fa-clock", "fa-cut", "fa-spool", "fa-check-circle", "fa-truck"];

const MEASUREMENT_FIELDS = [
  { key: "lambai", label: "Lambai (Length)" }, { key: "shoulder", label: "Shoulder" },
  { key: "bai", label: "Bai (Sleeve)" }, { key: "moli", label: "Moli" },
  { key: "chhati", label: "Chhati (Chest)" }, { key: "kamar", label: "Kamar (Waist)" },
  { key: "sit", label: "Sit (Seat)" }, { key: "gher", label: "Gher (Flare)" },
  { key: "kapo", label: "Kapo" }, { key: "galu", label: "Galu (Neck F)" },
  { key: "pachal_galu", label: "Pachal Galu (Neck B)" }, { key: "jangh", label: "Jangh (Thigh)" },
  { key: "jolo", label: "Jolo" }, { key: "ghutan", label: "Ghutan (Knee)" },
  { key: "mori", label: "Mori (Bottom)" },
];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Measurement editing
  const [editMeasure, setEditMeasure] = useState(false);
  const [measurement, setMeasurement] = useState({});
  const [savingMeasure, setSavingMeasure] = useState(false);

  // Invoice form
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invForm, setInvForm] = useState({
    items: [{ name: "", quantity: 1, price: "" }],
    discount: 0, tax: 0,
    paymentStatus: "Pending", paymentMethod: "Cash", notes: ""
  });

  useEffect(() => {
    orderAPI.getById(id).then((res) => {
      const o = res.data.order;
      setOrder(o);
      setNewStatus(o.status);
      setPrice(o.price || "");
      setNotes(o.notes || "");
      setDeliveryDate(o.deliveryDate ? o.deliveryDate.split("T")[0] : "");
      setMeasurement(o.measurement || {});
    }).catch(() => navigate("/admin/orders")).finally(() => setLoading(false));
  }, [id]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const handleUpdate = async () => {
    if (deliveryDate) {
      const minDate = new Date(order.createdAt);
      minDate.setDate(minDate.getDate() + 3);
      minDate.setHours(0, 0, 0, 0);
      const selDate = new Date(deliveryDate);
      if (selDate < minDate) {
        return showMsg("error", "Delivery date must be at least 3 days after order date");
      }
    }

    setUpdating(true);
    try {
      const res = await orderAPI.updateStatus(id, { status: newStatus, price: parseFloat(price) || 0, notes, deliveryDate });
      setOrder(res.data.order);
      showMsg("success", `Order updated successfully!`);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // ✅ NEW: Admin can edit measurement at any time
  const handleSaveMeasurement = async () => {
    setSavingMeasure(true);
    try {
      const res = await orderAPI.updateMeasurement(id, { measurement });
      setOrder(res.data.order);
      setEditMeasure(false);
      showMsg("success", "Measurements updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update measurements");
    } finally {
      setSavingMeasure(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const items = invForm.items.filter((i) => i.name && i.price);
      if (!items.length) return showMsg("error", "Add at least one invoice item");
      const parsedItems = items.map((i) => ({ ...i, price: parseFloat(i.price), quantity: parseInt(i.quantity) }));
      await invoiceAPI.create({
        orderId: id,
        customerId: order.userId._id,
        items: parsedItems,
        discount: parseFloat(invForm.discount) || 0,
        tax: parseFloat(invForm.tax) || 0,
        paymentStatus: invForm.paymentStatus,
        paymentMethod: invForm.paymentMethod,
        notes: invForm.notes,
      });
      setOrder({ ...order, invoiceGenerated: true });
      setShowInvoiceForm(false);
      showMsg("success", "Invoice created successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to create invoice");
    }
  };

  const addInvItem = () => setInvForm({ ...invForm, items: [...invForm.items, { name: "", quantity: 1, price: "" }] });
  const removeInvItem = (i) => setInvForm({ ...invForm, items: invForm.items.filter((_, idx) => idx !== i) });
  const updateInvItem = (i, key, val) => {
    const items = [...invForm.items];
    items[i] = { ...items[i], [key]: val };
    setInvForm({ ...invForm, items });
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );
  if (!order) return null;

  const statusSteps = order.measurementType === "tailor" ? TAILOR_STATUS_STEPS : DEFAULT_STATUS_STEPS;
  const stepIcons = order.measurementType === "tailor" ? TAILOR_STEP_ICONS : DEFAULT_STEP_ICONS;
  const currentStep = statusSteps.indexOf(order.status);
  const customer = order.userId;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/orders")}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Manage Order</h1>
          <span style={{ fontSize: 13, color: "var(--text-gray)" }}>{order.orderNumber}</span>
        </div>
        <span className={`badge badge-${order.status.toLowerCase()}`} style={{ marginLeft: "auto" }}>{order.status}</span>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Tracker */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Order Progress</div>
        <div className="order-tracker">
          {statusSteps.map((step, i) => (
            <div key={step} className={`tracker-step ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}>
              <div className="tracker-dot">
                <i className={`fa-solid ${i < currentStep ? "fa-check" : stepIcons[i]}`} />
              </div>
              <div className="tracker-label">{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Customer Info */}
        <div className="card">
          <div className="section-title">Customer Details</div>
          {[
            { label: "Name", value: customer?.name },
            { label: "Email", value: customer?.email },
            { label: "Phone", value: customer?.phone },
            { label: "Address", value: customer?.address || "—" },
          ].map((r) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
              <span style={{ color: "var(--text-gray)" }}>{r.label}</span>
              <span style={{ fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Order Info */}
        <div className="card">
          <div className="section-title">Order Information</div>
          {[
            { label: "Cloth Type", value: order.clothType + (order.customClothType ? ` (${order.customClothType})` : "") },
            { label: "Fabric", value: order.fabricType || "—" },
            { label: "Color", value: order.color || "—" },
            { label: "Delivery Date", value: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN") : "—" },
            { label: "Price", value: order.price ? `₹${order.price}` : "Not set" },
          ].map((r) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
              <span style={{ color: "var(--text-gray)" }}>{r.label}</span>
              <span style={{ fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
          {order.specialInstructions && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--primary-pale)", borderRadius: 8, fontSize: 13 }}>
              <strong>Instructions:</strong> {order.specialInstructions}
            </div>
          )}
          {order.designImage && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-gray)", marginBottom: 6 }}>Design Reference</div>
              <img src={`/uploads/${order.designImage}`} alt="Design" style={{ width: "100%", borderRadius: 8, maxHeight: 160, objectFit: "cover" }} />
            </div>
          )}
        </div>
      </div>

      {/* Update Status Panel */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Update Order Status</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 13 }}>Status</label>
            <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {statusSteps.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 13 }}>Price (₹)</label>
            <input className="form-control" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 13 }}>Delivery Date</label>
            <input 
              className="form-control" 
              type="date" 
              min={order ? new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : ""} 
              value={deliveryDate} 
              onChange={(e) => setDeliveryDate(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 13 }}>Admin Notes</label>
            <input className="form-control" placeholder="Optional note" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <><i className="fa-solid fa-spinner fa-spin" /> Updating...</> : <><i className="fa-solid fa-check" /> Update Order</>}
          </button>
          {!order.invoiceGenerated && (
            <button className="btn btn-outline" onClick={() => setShowInvoiceForm(!showInvoiceForm)}>
              <i className="fa-solid fa-file-invoice" /> {showInvoiceForm ? "Cancel Invoice" : "Create Invoice"}
            </button>
          )}
          {order.invoiceGenerated && (
            <Link to="/admin/invoices" className="btn btn-success">
              <i className="fa-solid fa-file-invoice-dollar" /> View Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Invoice Creation Form */}
      {showInvoiceForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Create Invoice</div>
          {invForm.items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                {i === 0 && <label style={{ fontSize: 12 }}>Description</label>}
                <input className="form-control" placeholder="e.g. Blouse Stitching" value={item.name} onChange={(e) => updateInvItem(i, "name", e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                {i === 0 && <label style={{ fontSize: 12 }}>Qty</label>}
                <input className="form-control" type="number" min="1" value={item.quantity} onChange={(e) => updateInvItem(i, "quantity", e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                {i === 0 && <label style={{ fontSize: 12 }}>Price (₹)</label>}
                <input className="form-control" type="number" placeholder="0.00" value={item.price} onChange={(e) => updateInvItem(i, "price", e.target.value)} />
              </div>
              {i > 0 && (
                <button className="btn btn-danger btn-sm" onClick={() => removeInvItem(i)} style={{ alignSelf: "flex-end" }}>
                  <i className="fa-solid fa-trash" />
                </button>
              )}
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={addInvItem} style={{ marginBottom: 16 }}>
            <i className="fa-solid fa-plus" /> Add Item
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { label: "Discount (₹)", key: "discount", type: "number" },
              { label: "Tax (₹)", key: "tax", type: "number" },
              { label: "Payment Status", key: "paymentStatus", type: "select", opts: ["Pending", "Paid", "Partial"] },
              { label: "Payment Method", key: "paymentMethod", type: "select", opts: ["Cash", "UPI", "Online", "Card"] },
            ].map((f) => (
              <div key={f.key} className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12 }}>{f.label}</label>
                {f.type === "select"
                  ? <select className="form-control" value={invForm[f.key]} onChange={(e) => setInvForm({ ...invForm, [f.key]: e.target.value })}>{f.opts.map(o => <option key={o}>{o}</option>)}</select>
                  : <input className="form-control" type="number" value={invForm[f.key]} onChange={(e) => setInvForm({ ...invForm, [f.key]: e.target.value })} />
                }
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleCreateInvoice}>
            <i className="fa-solid fa-file-invoice-dollar" /> Create Invoice
          </button>
        </div>
      )}

      {/* ✅ NEW: Measurements section with admin edit */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0 }}>
            <i className="fa-solid fa-ruler" style={{ marginRight: 8 }} />Measurements
          </div>
          <button
            className={`btn btn-sm ${editMeasure ? "btn-outline" : "btn-primary"}`}
            onClick={() => {
              if (editMeasure) setMeasurement(order.measurement || {});
              setEditMeasure(!editMeasure);
            }}
          >
            <i className={`fa-solid ${editMeasure ? "fa-times" : "fa-pencil"}`} />
            {editMeasure ? " Cancel" : " Edit Measurements"}
          </button>
        </div>

        {editMeasure ? (
          <>
            <p style={{ fontSize: 13, color: "var(--text-gray)", marginBottom: 14 }}>
              <i className="fa-solid fa-info-circle" style={{ marginRight: 6 }} />
              Admin can edit measurements at any order stage. Enter values in inches.
            </p>
            <div className="measurement-grid">
              {MEASUREMENT_FIELDS.map((f) => (
                <div className="form-group" key={f.key} style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 11 }}>{f.label}</label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.5"
                    placeholder="in"
                    value={measurement[f.key] || ""}
                    onChange={(e) => setMeasurement({ ...measurement, [f.key]: e.target.value })}
                    style={{ padding: "8px 10px", fontSize: 13 }}
                  />
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={handleSaveMeasurement}
              disabled={savingMeasure}
            >
              {savingMeasure
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
                : <><i className="fa-solid fa-check" /> Save Measurements</>
              }
            </button>
          </>
        ) : (
          <>
            {order.measurement && Object.keys(order.measurement).some((k) => order.measurement[k]) ? (
              <div className="measurement-grid">
                {MEASUREMENT_FIELDS.map((f) => (
                  <div key={f.key} style={{ background: "var(--primary-pale)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2, color: order.measurement[f.key] ? "var(--primary)" : "var(--text-light)" }}>
                      {order.measurement[f.key] ? `${order.measurement[f.key]}"` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "30px 20px" }}>
                <i className="fa-solid fa-ruler" />
                <p>No measurements recorded</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setEditMeasure(true)}>
                  <i className="fa-solid fa-plus" /> Add Measurements
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
