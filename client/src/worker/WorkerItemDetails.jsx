import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { workerAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/form.css";

const STATUS_STEPS = ["Pending", "Cutting", "Stitching", "Ready"];
const STATUS_STEPS_DISPLAY = ["Pending", "Cutting", "Stitching", "Ready", "Delivered"];
const STEP_ICONS = ["fa-check", "fa-scissors", "🧵", "fa-check-circle", "fa-truck"];

export default function WorkerItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await workerAPI.getAssignedItems();
      const found = res.data.items.find((i) => i._id === id);
      setItem(found || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await workerAPI.updateItemStatus(item._id, { status: newStatus });
      setItem((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="card">
        <div className="empty-state">
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--danger)" }} />
          <p>Item not found or you don't have access to it.</p>
          <Link to="/worker/dashboard" className="btn btn-outline" style={{ marginTop: 12 }}>
             Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS_DISPLAY.indexOf(item.status);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Link to="/worker/dashboard" className="btn btn-ghost" style={{ marginRight: 16 }}>
          <i className="fa-solid fa-arrow-left" /> Back
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Item Details <span style={{fontSize: 16, color: "var(--text-gray)", fontWeight: "normal"}}>({item.orderId?.orderNumber})</span></h1>
      </div>

      <div className="card" style={{ padding: "30px 20px", marginBottom: 20 }}>
        <div className="order-tracker">
          {STATUS_STEPS_DISPLAY.map((step, i) => (
            <div key={step} className={`tracker-step ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}>
              <div className="tracker-dot">
                {i < currentStep ? (
                  <i className="fa-solid fa-check" />
                ) : STEP_ICONS[i] === "🧵" ? (
                  <span style={{ fontSize: "16px" }}>🧵</span>
                ) : (
                  <i className={`fa-solid ${STEP_ICONS[i]}`} />
                )}
              </div>
              <div className="tracker-label">{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-two-col" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>Customer Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px 10px", fontSize: 14 }}>
            <div style={{ color: "var(--text-gray)" }}>Name</div>
            <div style={{ fontWeight: 500 }}>{item.orderId?.userId?.name || "N/A"}</div>
            
            <div style={{ color: "var(--text-gray)" }}>Delivery Date</div>
            <div style={{ fontWeight: 500 }}>
              {item.orderId?.deliveryDate ? new Date(item.orderId.deliveryDate).toLocaleDateString("en-IN") : "Not Set"}
            </div>
            
            <div style={{ color: "var(--text-gray)" }}>Item Name</div>
            <div style={{ fontWeight: 500 }}>
                {item.clothType} {item.customClothType ? `(${item.customClothType})` : ""}
            </div>
            
            <div style={{ color: "var(--text-gray)" }}>Quantity</div>
            <div style={{ fontWeight: 500 }}>{item.quantity || 1}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>Update Status</h4>
          <div className="form-group">
            <label>Current Status</label>
            <select 
              className="form-control" 
              value={item.status} 
              onChange={handleStatusUpdate}
              disabled={updating}
            >
              {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {updating && <div style={{ fontSize: 12, color: "var(--primary)", marginTop: 8 }}><i className="fa-solid fa-spinner fa-spin" /> Successfully updating...</div>}
          </div>
          
          {item.specialInstructions && (
              <div style={{ marginTop: 20 }}>
                  <label style={{ fontSize: 13, color: "var(--text-gray)", fontWeight: 600, display: "block", marginBottom: 6 }}>Instructions</label>
                  <div style={{ padding: 12, background: "var(--primary-pale)", borderRadius: 8, fontSize: 13 }}>
                      {item.specialInstructions}
                  </div>
              </div>
          )}
        </div>
      </div>

      {item.orderId?.designImage && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 16 }}>Reference Design</h4>
          <div style={{ textAlign: "center", background: "var(--bg-light)", padding: 20, borderRadius: 8, border: "1px dashed var(--border)" }}>
            <img 
              src={`http://localhost:5000/uploads/${item.orderId.designImage}`} 
              alt="Design Reference" 
              style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} 
            />
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <h4 style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
          <i className="fa-solid fa-ruler" style={{ marginRight: 8, color: "var(--primary)" }} />
          Measurements 
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: "normal", color: "var(--text-gray)", background: "var(--bg-light)", padding: "2px 8px", borderRadius: 12 }}>
            Read-Only
          </span>
        </h4>
        
        {!item.measurement || Object.keys(item.measurement).length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
             <i className="fa-solid fa-tape" />
             <p>No measurements maintained for this item</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {Object.entries(item.measurement).filter(([k,v]) => k !== "_id").map(([key, val]) => (
              <div key={key} style={{ background: "var(--bg-light)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-dark)" }}>
                  {val || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
