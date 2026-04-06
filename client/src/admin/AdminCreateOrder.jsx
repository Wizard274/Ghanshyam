import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI, userAPI } from "../services/api";
import "../styles/form.css";
import "../styles/dashboard.css";

const CLOTH_TYPES = [
  "Blouse", "Fancy Dress", "Chaniya", "Gown Dress",
  "Shirt", "Pant", "Salwar", "Chudidar", "Lengho", "Patiyala", "Other",
];

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

export default function AdminCreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    userId: "", clothType: "", customClothType: "",
    fabricType: "", color: "", specialInstructions: "",
    deliveryDate: "", price: "", notes: "",
  });
  const [measurement, setMeasurement] = useState({});
  const [designImage, setDesignImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showMeasure, setShowMeasure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    userAPI.getAllCustomers().then((res) => setCustomers(res.data.customers));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDesignImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setDesignImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId) return setError("Please select a customer");
    if (!form.clothType) return setError("Please select a cloth type");
    setError(""); setLoading(true);

    try {
      const payload = {
        ...form,
        measurement: showMeasure ? measurement : {},
        designImage: designImage || undefined,
      };

      const res = await orderAPI.adminCreate(payload);
      if (res.data.success) {
        setSuccess("Order created successfully!");
        setTimeout(() => navigate("/admin/orders"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/orders")}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Create Walk-in Order</h1>
          <p style={{ color: "var(--text-gray)", fontSize: 13 }}>Create an order on behalf of a customer</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <i className="fa-solid fa-check-circle" style={{ marginRight: 8 }} />{success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Order Details */}
            <div className="card">
              <div className="form-section-title">
                <i className="fa-solid fa-user" style={{ marginRight: 8 }} />Customer & Order
              </div>

              <div className="form-group">
                <label>Select Customer <span className="required">*</span></label>
                <select className="form-control" name="userId" value={form.userId} onChange={handleChange} required>
                  <option value="">Choose customer...</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cloth Type <span className="required">*</span></label>
                <select className="form-control" name="clothType" value={form.clothType} onChange={handleChange} required>
                  <option value="">Select type...</option>
                  {CLOTH_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              {form.clothType === "Other" && (
                <div className="form-group">
                  <label>Specify Cloth Type <span className="required">*</span></label>
                  <div className="input-icon-wrap">
                    <i className="input-icon fa-solid fa-pencil" />
                    <input className="form-control" name="customClothType"
                      placeholder="Enter cloth type"
                      value={form.customClothType} onChange={handleChange} required />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Fabric Type</label>
                  <input className="form-control" name="fabricType" placeholder="e.g. Silk, Cotton"
                    value={form.fabricType} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input className="form-control" name="color" placeholder="e.g. Red"
                    value={form.color} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Date</label>
                  <input className="form-control" type="date" name="deliveryDate"
                    value={form.deliveryDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <div className="input-icon-wrap">
                    <i className="input-icon fa-solid fa-indian-rupee-sign" />
                    <input className="form-control" type="number" name="price"
                      placeholder="0.00" value={form.price} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea className="form-control" name="specialInstructions" rows={3}
                  placeholder="Any special design instructions..."
                  value={form.specialInstructions} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Admin Notes</label>
                <input className="form-control" name="notes"
                  placeholder="Internal note (not visible to customer)"
                  value={form.notes} onChange={handleChange} />
              </div>
            </div>

            {/* Design Image Upload */}
            <div className="card">
              <div className="form-section-title">
                <i className="fa-solid fa-image" style={{ marginRight: 8 }} />Design Reference Image
                <span style={{ fontSize: 11, color: "var(--text-gray)", fontWeight: 400, marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
                  (Optional)
                </span>
              </div>

              {!imagePreview ? (
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  border: "2px dashed var(--primary-border)", borderRadius: 12,
                  padding: "32px 20px", cursor: "pointer",
                  background: "var(--primary-pale)", transition: "all 0.2s",
                }}>
                  <i className="fa-solid fa-cloud-arrow-up"
                    style={{ fontSize: 36, color: "var(--primary)", opacity: 0.6 }} />
                  <div style={{ fontWeight: 500, color: "var(--text-mid)", fontSize: 14 }}>
                    Click to upload design image
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                    JPG, PNG, GIF, WEBP — Max 5MB
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              ) : (
                <div style={{ position: "relative" }}>
                  <img src={imagePreview} alt="Design preview"
                    style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10 }} />
                  <button type="button" onClick={removeImage}
                    style={{
                      position: "absolute", top: 8, right: 8,
                      background: "rgba(0,0,0,0.65)", color: "#fff",
                      border: "none", borderRadius: "50%",
                      width: 32, height: 32, cursor: "pointer", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    <i className="fa-solid fa-times" />
                  </button>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-gray)" }}>
                    <i className="fa-solid fa-check-circle" style={{ color: "var(--success)", marginRight: 4 }} />
                    {designImage?.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Measurements */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="form-section-title" style={{ margin: 0 }}>
                <i className="fa-solid fa-ruler" style={{ marginRight: 8 }} />Measurements
              </div>
              <button type="button"
                className={`btn btn-sm ${showMeasure ? "btn-primary" : "btn-outline"}`}
                onClick={() => setShowMeasure(!showMeasure)}>
                {showMeasure
                  ? <><i className="fa-solid fa-minus" /> Hide</>
                  : <><i className="fa-solid fa-plus" /> Add Measurements</>
                }
              </button>
            </div>

            {showMeasure ? (
              <>
                <p style={{ fontSize: 13, color: "var(--text-gray)", marginBottom: 14 }}>
                  Enter measurements in inches. Leave blank if unknown.
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
                        style={{ padding: "7px 10px", fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: "50px 20px" }}>
                <i className="fa-solid fa-ruler" />
                <p>Add measurements optionally</p>
                <small style={{ color: "var(--text-light)", fontSize: 12 }}>
                  You can also edit measurements later from order details
                </small>
              </div>
            )}
          </div>

        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/admin/orders")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Creating...</>
              : <><i className="fa-solid fa-plus" /> Create Order</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
