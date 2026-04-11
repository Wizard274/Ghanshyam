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
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [itemUpdates, setItemUpdates] = useState({});
  const [itemMeasurements, setItemMeasurements] = useState({});
  const [editMeasureState, setEditMeasureState] = useState({});

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = () => {
    orderAPI.getById(id).then((res) => {
      const o = res.data.order;
      setOrder(o);
      setNotes(o.notes || "");
      setDeliveryDate(o.deliveryDate ? o.deliveryDate.split("T")[0] : "");
      
      const newUpdates = {};
      const newMeasures = {};
      const newEditState = {};
      o.items.forEach(item => {
        newUpdates[item._id] = { status: item.status, price: item.price };
        newMeasures[item._id] = item.measurement || {};
        newEditState[item._id] = false;
      });
      setItemUpdates(newUpdates);
      setItemMeasurements(newMeasures);
      setEditMeasureState(newEditState);

    }).catch(() => navigate("/admin/orders")).finally(() => setLoading(false));
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const handleOrderUpdate = async () => {
    if (deliveryDate) {
      const minDate = new Date(order.createdAt);
      minDate.setDate(minDate.getDate() + 3);
      minDate.setHours(0, 0, 0, 0);
      const selDate = new Date(deliveryDate);
      if (selDate < minDate) {
        return showMsg("error", "Delivery date must be at least 3 days after order date");
      }
    }

    setUpdatingOrder(true);
    try {
      const res = await orderAPI.updateStatus(id, { notes, deliveryDate });
      setOrder(res.data.order);
      showMsg("success", `Order updated successfully!`);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleItemUpdate = async (itemId) => {
    const updates = itemUpdates[itemId];
    try {
      await orderAPI.updateItemStatus(id, itemId, { status: updates.status, price: parseFloat(updates.price) || 0 });
      showMsg("success", `Item updated successfully!`);
      fetchOrder(); // Reload to get fresh states and possibly invoice generation trigger
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update item");
    }
  };

  const handleSaveMeasurement = async (itemId) => {
    try {
      const measurement = itemMeasurements[itemId];
      await orderAPI.updateItemStatus(id, itemId, { measurement });
      setEditMeasureState({...editMeasureState, [itemId]: false});
      showMsg("success", "Measurements updated successfully!");
      fetchOrder();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update measurements");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );
  if (!order) return null;

  const customer = order.userId;
  const statusSteps = order.measurementType === "tailor" ? TAILOR_STATUS_STEPS : DEFAULT_STATUS_STEPS;
  const stepIcons = order.measurementType === "tailor" ? TAILOR_STEP_ICONS : DEFAULT_STEP_ICONS;

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
        <span className={`badge badge-${(order.status || "Pending").toLowerCase()}`} style={{ marginLeft: "auto" }}>{order.status || "Pending"}</span>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

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

        {/* Global Order Info & Update Panel */}
        <div className="card">
          <div className="section-title">Global Order Info</div>
          
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13 }}>Delivery Date</label>
            <input 
              className="form-control" 
              type="date" 
              value={deliveryDate} 
              min={(() => {
                const minD = new Date(order.createdAt);
                minD.setDate(minD.getDate() + 3);
                return minD.toISOString().split("T")[0];
              })()}
              onChange={(e) => setDeliveryDate(e.target.value)} 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13 }}>Admin Notes</label>
            <input className="form-control" placeholder="Optional note" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleOrderUpdate} disabled={updatingOrder}>
              {updatingOrder ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-check" /> Update Details</>}
            </button>
            {order.invoiceGenerated && (
              <Link to="/admin/invoices" className="btn btn-success">
                <i className="fa-solid fa-file-invoice-dollar" /> View Invoice
              </Link>
            )}
          </div>
          {order.designImage && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-gray)", marginBottom: 6 }}>Global Order Design Reference</div>
              <img src={`/uploads/${order.designImage}`} alt="Design" style={{ width: "100%", borderRadius: 8, maxHeight: 160, objectFit: "cover" }} />
            </div>
          )}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 32, marginBottom: 16, fontSize: 18 }}>Order Items</div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {order.items && order.items.map((item, index) => {
          const currentStep = statusSteps.indexOf(item.status);
          const iUpdate = itemUpdates[item._id] || { status: item.status, price: item.price };
          const iMeasure = itemMeasurements[item._id] || {};
          const isEditingMeasure = editMeasureState[item._id] || false;

          return (
            <div key={item._id} className="card" style={{ borderLeft: "4px solid var(--primary)", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>
                    Item #{index + 1}: {item.clothType} {item.customClothType ? `(${item.customClothType})` : ""}
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--text-gray)" }}>
                    {item.fabricType && <span style={{ marginRight: 12 }}>Fabric: {item.fabricType}</span>}
                    {item.color && <span style={{ marginRight: 12 }}>Color: {item.color}</span>}
                    {item.quantity && <span>Qty: {item.quantity}</span>}
                  </div>
                </div>
                <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
              </div>

              {/* Item Tracker */}
              <div className="order-tracker" style={{ margin: "20px 0" }}>
                {statusSteps.map((step, i) => (
                  <div key={step} className={`tracker-step ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}>
                    <div className="tracker-dot">
                      <i className={`fa-solid ${i < currentStep ? "fa-check" : stepIcons[i]}`} />
                    </div>
                    <div className="tracker-label">{step}</div>
                  </div>
                ))}
              </div>

              {/* Status Update & Price */}
              <div style={{ background: "var(--bg)", padding: 16, borderRadius: 8, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div className="form-group" style={{ margin: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>Update Status</label>
                        <select className="form-control" value={iUpdate.status} 
                            onChange={(e) => setItemUpdates({...itemUpdates, [item._id]: {...iUpdate, status: e.target.value}})}>
                            {statusSteps.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>Update Price (₹)</label>
                        <input className="form-control" type="number" value={iUpdate.price} 
                            onChange={(e) => setItemUpdates({...itemUpdates, [item._id]: {...iUpdate, price: e.target.value}})} />
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={() => handleItemUpdate(item._id)}>
                            Save Status & Price
                        </button>
                    </div>
                  </div>
              </div>

              {item.specialInstructions && (
                <div style={{ marginBottom: 20, padding: "12px", background: "var(--primary-pale)", borderRadius: 8, fontSize: 13 }}>
                  <strong>Instructions:</strong> {item.specialInstructions}
                </div>
              )}

              {/* Measurements */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                        <i className="fa-solid fa-ruler" style={{ marginRight: 8 }} />Measurements
                    </div>
                    <button
                        className={`btn btn-sm ${isEditingMeasure ? "btn-outline" : "btn-ghost"}`}
                        onClick={() => {
                            if (isEditingMeasure) setItemMeasurements({...itemMeasurements, [item._id]: item.measurement || {}});
                            setEditMeasureState({...editMeasureState, [item._id]: !isEditingMeasure});
                        }}
                    >
                        <i className={`fa-solid ${isEditingMeasure ? "fa-times" : "fa-pencil"}`} />
                        {isEditingMeasure ? " Cancel" : " Edit Measurements"}
                    </button>
                </div>

                {isEditingMeasure ? (
                    <div>
                        <div className="measurement-grid">
                            {MEASUREMENT_FIELDS.map((f) => (
                                <div className="form-group" key={f.key} style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: 11 }}>{f.label}</label>
                                <input
                                    className="form-control"
                                    type="number" step="0.5" placeholder="in"
                                    value={iMeasure[f.key] || ""}
                                    onChange={(e) => setItemMeasurements({...itemMeasurements, [item._id]: {...iMeasure, [f.key]: e.target.value}})}
                                    style={{ padding: "8px 10px", fontSize: 12 }}
                                />
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => handleSaveMeasurement(item._id)}>
                            Save Measurements
                        </button>
                    </div>
                ) : (
                    <>
                        {item.measurement && Object.keys(item.measurement).some((k) => item.measurement[k]) ? (
                            <div className="measurement-grid">
                                {MEASUREMENT_FIELDS.map((f) => (
                                <div key={f.key} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: 10, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    {f.label}
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, color: item.measurement[f.key] ? "var(--text-dark)" : "var(--text-light)" }}>
                                    {item.measurement[f.key] ? `${item.measurement[f.key]}"` : "—"}
                                    </div>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: "20px 10px" }}>
                                <i className="fa-solid fa-ruler" style={{ fontSize: 24 }} />
                                <p style={{ fontSize: 13, marginTop: 8 }}>No measurements recorded for this item.</p>
                            </div>
                        )}
                    </>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
