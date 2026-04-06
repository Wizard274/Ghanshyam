import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import "../styles/form.css";
import "../styles/dashboard.css";

const CLOTH_TYPES = ["Blouse", "Fancy Dress", "Chaniya", "Gown Dress", "Shirt", "Pant", "Salwar", "Chudidar", "Lengho", "Patiyala", "Other"];

const MEASUREMENT_FIELDS = [
  { key: "lambai", label: "Lambai (Length)" },
  { key: "shoulder", label: "Shoulder" },
  { key: "bai", label: "Bai (Sleeve)" },
  { key: "moli", label: "Moli" },
  { key: "chhati", label: "Chhati (Chest)" },
  { key: "kamar", label: "Kamar (Waist)" },
  { key: "sit", label: "Sit (Seat)" },
  { key: "gher", label: "Gher (Flare)" },
  { key: "kapo", label: "Kapo" },
  { key: "galu", label: "Galu (Neck Front)" },
  { key: "pachal_galu", label: "Pachal Galu (Neck Back)" },
  { key: "jangh", label: "Jangh (Thigh)" },
  { key: "jolo", label: "Jolo" },
  { key: "ghutan", label: "Ghutan (Knee)" },
  { key: "mori", label: "Mori (Bottom)" },
];

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clothType: "", customClothType: "", fabricType: "", color: "",
    specialInstructions: "", deliveryDate: "", price: "",
  });
  const [measurement, setMeasurement] = useState({});
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [designImage, setDesignImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMeasure = (e) => setMeasurement({ ...measurement, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clothType) return setError("Please select a cloth type");
    setError(""); setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      if (showMeasurement) formData.append("measurement", JSON.stringify(measurement));
      if (designImage) formData.append("designImage", designImage);
      const res = await orderAPI.create(formData);
      if (res.data.success) {
        setSuccess("Order placed successfully!");
        setTimeout(() => navigate("/my-orders"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="fa-solid fa-scissors" style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Place New Order</h1>
          <p style={{ color: "var(--text-gray)", fontSize: 13 }}>Fill in the details for your tailoring order</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}</div>}
      {success && <div className="alert alert-success"><i className="fa-solid fa-check-circle" style={{ marginRight: 8 }} />{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left: Order Details */}
          <div className="card">
            <div className="form-section-title"><i className="fa-solid fa-scissors" style={{ marginRight: 8 }} />Order Details</div>

            <div className="form-group">
              <label>Cloth Type <span className="required">*</span></label>
              <select className="form-control" name="clothType" value={form.clothType} onChange={handleChange} required>
                <option value="">Select cloth type</option>
                {CLOTH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {form.clothType === "Other" && (
              <div className="form-group">
                <label>Specify Cloth Type <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-pencil" />
                  <input className="form-control" name="customClothType" placeholder="Enter cloth type" value={form.customClothType} onChange={handleChange} required />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Fabric Type</label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-layer-group" />
                  <input className="form-control" name="fabricType" placeholder="e.g. Cotton, Silk" value={form.fabricType} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-palette" />
                  <input className="form-control" name="color" placeholder="e.g. Red, Blue" value={form.color} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Delivery Date</label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-calendar" />
                  <input className="form-control" type="date" name="deliveryDate" min={minDate.toISOString().split("T")[0]} value={form.deliveryDate} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Agreed Price (₹)</label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-indian-rupee-sign" />
                  <input className="form-control" type="number" name="price" placeholder="0.00" value={form.price} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Special Instructions</label>
              <textarea className="form-control" name="specialInstructions" rows={3} placeholder="Any special design instructions, references..." value={form.specialInstructions} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Design Image (Optional)</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(e) => setDesignImage(e.target.files[0])}
                style={{ padding: "8px 12px" }}
              />
              <small style={{ color: "var(--text-gray)", fontSize: 12 }}>Upload a reference image for the design (Max 5MB)</small>
            </div>
          </div>

          {/* Right: Measurements */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="form-section-title" style={{ margin: 0 }}>
                <i className="fa-solid fa-ruler" style={{ marginRight: 8 }} />Measurements
              </div>
              <button
                type="button"
                className={`btn btn-sm ${showMeasurement ? "btn-primary" : "btn-outline"}`}
                onClick={() => setShowMeasurement(!showMeasurement)}
              >
                {showMeasurement ? <><i className="fa-solid fa-minus" /> Hide</> : <><i className="fa-solid fa-plus" /> Add Measurements</>}
              </button>
            </div>

            {!showMeasurement ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-gray)" }}>
                <i className="fa-solid fa-ruler" style={{ fontSize: 36, color: "var(--primary-border)", marginBottom: 12, display: "block" }} />
                <p style={{ marginBottom: 8 }}>Add measurements for this order</p>
                <small>Click "Add Measurements" to enter your body measurements</small>
                <br /><br />
                <div className="alert alert-info" style={{ textAlign: "left", fontSize: 12 }}>
                  <i className="fa-solid fa-info-circle" style={{ marginRight: 6 }} />
                  Tip: If you've ordered the same cloth type before, the tailor may already have your measurements.
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--text-gray)", marginBottom: 16 }}>
                  Enter measurements in inches. Leave blank if unknown.
                </p>
                <div className="measurement-grid">
                  {MEASUREMENT_FIELDS.map((f) => (
                    <div className="form-group" key={f.key}>
                      <label style={{ fontSize: 12 }}>{f.label}</label>
                      <input
                        className="form-control"
                        name={f.key}
                        type="number"
                        step="0.5"
                        placeholder="inches"
                        value={measurement[f.key] || ""}
                        onChange={handleMeasure}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/my-orders")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Placing Order...</>
              : <><i className="fa-solid fa-check" /> Place Order</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
