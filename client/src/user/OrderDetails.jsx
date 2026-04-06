import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import "../styles/dashboard.css";
import "../styles/form.css";

const STATUS_STEPS = ["Pending", "Cutting", "Stitching", "Ready", "Delivered"];
const STEP_ICONS = ["fa-clock", "fa-cut", "fa-spool", "fa-check-circle", "fa-truck"];

const MEASUREMENT_FIELDS = [
  { key: "lambai", label: "Lambai" }, { key: "shoulder", label: "Shoulder" },
  { key: "bai", label: "Bai" }, { key: "moli", label: "Moli" },
  { key: "chhati", label: "Chhati" }, { key: "kamar", label: "Kamar" },
  { key: "sit", label: "Sit" }, { key: "gher", label: "Gher" },
  { key: "kapo", label: "Kapo" }, { key: "galu", label: "Galu" },
  { key: "pachal_galu", label: "Pachal Galu" }, { key: "jangh", label: "Jangh" },
  { key: "jolo", label: "Jolo" }, { key: "ghutan", label: "Ghutan" },
  { key: "mori", label: "Mori" },
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMeasure, setEditMeasure] = useState(false);
  const [measurement, setMeasurement] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    orderAPI.getById(id).then((res) => {
      setOrder(res.data.order);
      setMeasurement(res.data.order.measurement || {});
    }).catch(() => navigate("/my-orders")).finally(() => setLoading(false));
  }, [id]);

  const currentStep = STATUS_STEPS.indexOf(order?.status);

  const handleSaveMeasurement = async () => {
    setSaving(true);
    try {
      const res = await orderAPI.updateMeasurement(id, { measurement });
      setOrder(res.data.order);
      setEditMeasure(false);
      setMsg("Measurements updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );

  if (!order) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/my-orders")}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Order Details</h1>
          <span style={{ fontSize: 13, color: "var(--text-gray)" }}>{order.orderNumber}</span>
        </div>
        <span className={`badge badge-${order.status.toLowerCase()} `} style={{ marginLeft: "auto" }}>{order.status}</span>
      </div>

      {msg && <div className={`alert ${msg.includes("success") ? "alert-success" : "alert-error"}`}>{msg}</div>}

      {/* Order Tracker */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Order Progress</div>
        <div className="order-tracker">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={`tracker-step ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}>
              <div className="tracker-dot">
                <i className={`fa-solid ${i < currentStep ? "fa-check" : STEP_ICONS[i]}`} />
              </div>
              <div className="tracker-label">{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Order Info */}
        <div className="card">
          <div className="section-title">Order Information</div>
          {[
            { label: "Cloth Type", value: order.clothType + (order.customClothType ? ` (${order.customClothType})` : "") },
            { label: "Fabric Type", value: order.fabricType || "—" },
            { label: "Color", value: order.color || "—" },
            { label: "Order Date", value: new Date(order.createdAt).toLocaleDateString("en-IN") },
            { label: "Delivery Date", value: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN") : "—" },
            { label: "Price", value: order.price ? `₹${order.price}` : "—" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
              <span style={{ color: "var(--text-gray)" }}>{row.label}</span>
              <span style={{ fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
          {order.specialInstructions && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-gray)", marginBottom: 4 }}>Special Instructions</div>
              <p style={{ fontSize: 14, color: "var(--text-dark)", background: "var(--primary-pale)", padding: "10px 14px", borderRadius: 8 }}>
                {order.specialInstructions}
              </p>
            </div>
          )}
          {order.designImage && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-gray)", marginBottom: 6 }}>Design Reference</div>
              <img src={`/uploads/${order.designImage}`} alt="Design" style={{ width: "100%", borderRadius: 8, maxHeight: 180, objectFit: "cover" }} />
            </div>
          )}
        </div>

        {/* Measurements */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Measurements</div>
            {order.status === "Pending" && (
              <button
                className={`btn btn-sm ${editMeasure ? "btn-primary" : "btn-outline"}`}
                onClick={() => setEditMeasure(!editMeasure)}
              >
                <i className={`fa-solid ${editMeasure ? "fa-times" : "fa-pencil"}`} />
                {editMeasure ? " Cancel" : " Edit"}
              </button>
            )}
            {order.status !== "Pending" && (
              <span className="badge badge-delivered" style={{ fontSize: 11 }}>
                <i className="fa-solid fa-lock" style={{ marginRight: 4 }} /> Locked
              </span>
            )}
          </div>

          {editMeasure ? (
            <>
              <div className="measurement-grid">
                {MEASUREMENT_FIELDS.map((f) => (
                  <div className="form-group" key={f.key}>
                    <label style={{ fontSize: 11 }}>{f.label}</label>
                    <input
                      className="form-control"
                      type="number"
                      step="0.5"
                      name={f.key}
                      placeholder="in"
                      value={measurement[f.key] || ""}
                      onChange={(e) => setMeasurement({ ...measurement, [f.key]: e.target.value })}
                      style={{ padding: "8px 10px", fontSize: 13 }}
                    />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={handleSaveMeasurement} disabled={saving}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-check" /> Save Measurements</>}
              </button>
            </>
          ) : (
            <div className="measurement-grid">
              {MEASUREMENT_FIELDS.map((f) => (
                <div key={f.key} style={{ background: "var(--primary-pale)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: order.measurement?.[f.key] ? "var(--primary)" : "var(--text-light)" }}>
                    {order.measurement?.[f.key] ? `${order.measurement[f.key]}"` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {order.invoiceGenerated && (
        <div className="card" style={{ marginTop: 20, background: "linear-gradient(135deg, var(--accent-light), var(--primary-pale))" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: 28, color: "var(--accent)" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Invoice Generated</div>
                <div style={{ fontSize: 13, color: "var(--text-gray)" }}>Your invoice is ready to download</div>
              </div>
            </div>
            <Link to="/invoices" className="btn btn-primary">
              <i className="fa-solid fa-file-invoice" /> View Invoice
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
