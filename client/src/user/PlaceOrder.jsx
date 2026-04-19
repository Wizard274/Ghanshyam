import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI, appointmentAPI } from "../services/api";
import "../styles/form.css";
import "../styles/dashboard.css";

const CLOTH_TYPES = ["Afghani suit", "Blouse", "Chaniya", "Chaniya Choli", "Chudidar", "Fancy Dress", "Fancy T-shirt", "Gown Dress", "Lengho", "Pant", "Patiyala", "Salwar", "Shirt", "Other"];
const FABRIC_TYPES = ["Cotton", "Silk", "Linen", "Wool", "Polyester", "Chiffon", "Georgette", "Velvet", "Crepe", "Denim", "Net", "Rayon", "Other"];

const ESTIMATED_PRICES = {
  "Afghani suit": "1200 - 1300",
  "Blouse": "500 - 3000",
  "Chaniya": "1000 - 2000",
  "Chaniya Choli": "2000 - 6000",
  "Chudidar": "150 - 200",
  "Fancy Dress": "700 - 5000",
  "Fancy T-shirt": "400 - 500",
  "Gown Dress": "1200 - 3500",
  "Lengho": "150 - 200",
  "Pant": "400 - 600",
  "Patiyala": "200 - 300",
  "Salwar": "150 - 200",
  "Shirt": "300 - 400",
  "Other": "According to design"
};

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

export default function PlaceOrder() {
  const navigate = useNavigate();
  
  const [items, setItems] = useState([
    { clothType: "", customClothType: "", fabricType: "", specialInstructions: "", price: "", measurement: {}, showMeasurement: false, quantity: 1 }
  ]);
  
  const [measurementType, setMeasurementType] = useState("self");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [designImage, setDesignImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleItemChange = (i, field, value) => {
    const newItems = [...items];
    newItems[i][field] = value;
    setItems(newItems);
  };
  
  const handleMeasure = (i, key, value) => {
    const newItems = [...items];
    newItems[i].measurement = { ...newItems[i].measurement, [key]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { clothType: "", customClothType: "", fabricType: "", specialInstructions: "", price: "", measurement: {}, showMeasurement: false, quantity: 1 }]);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  useEffect(() => {
    if (measurementType === "tailor" && appointmentDate) {
      setFetchingSlots(true);
      appointmentAPI.getAvailableSlots(appointmentDate)
        .then(res => {
          setSlots(res.data.slots);
          setSelectedSlot("");
        })
        .catch(() => setError("Failed to load appointment slots"))
        .finally(() => setFetchingSlots(false));
    }
  }, [measurementType, appointmentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(items.length === 0) return setError("Please add at least one item.");

    for(let i=0; i<items.length; i++) {
        if(!items[i].clothType) return setError(`Please select a cloth type for Item ${i+1}`);
    }

    setError(""); setLoading(true);
    try {
      if (measurementType === "tailor" && !selectedSlot) {
        throw new Error("Please select an appointment slot for tailor measurement");
      }
      
      const formData = new FormData();
      formData.append("measurementType", measurementType);
      if (measurementType === "tailor") formData.append("slotId", selectedSlot);
      
      const cleanedItems = items.map(item => ({
        ...item,
        measurement: (measurementType === "self" && item.showMeasurement) ? item.measurement : {}
      }));

      formData.append("items", JSON.stringify(cleanedItems));

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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="fa-solid fa-scissors" style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Place Multiple Item Order</h1>
          <p style={{ color: "var(--text-gray)", fontSize: 13 }}>Fill in the details for your tailoring order and add items dynamically</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}</div>}
      {success && <div className="alert alert-success"><i className="fa-solid fa-check-circle" style={{ marginRight: 8 }} />{success}</div>}

      <form onSubmit={handleSubmit}>
        
        {/* Global Measurement Preference */}
        <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="form-section-title" style={{ margin: 0 }}>
                <i className="fa-solid fa-ruler" style={{ marginRight: 8 }} />Global Measurement Option
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="radio" name="measType" checked={measurementType === "self"} onChange={() => setMeasurementType("self")} />
                Self Measurement
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="radio" name="measType" checked={measurementType === "tailor"} onChange={() => setMeasurementType("tailor")} />
                Book Tailor Appointment
              </label>
            </div>

            {measurementType === "tailor" && (
              <div style={{ padding: "20px", background: "var(--bg-light)", borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Schedule Appointment</h4>
                <div className="form-group">
                  <label>Select Date</label>
                  <input className="form-control" type="date" min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
                </div>
                {appointmentDate && (
                  <div className="form-group">
                    <label>Select Time Slot</label>
                    {fetchingSlots ? (
                      <div><i className="fa-solid fa-spinner fa-spin" /> Loading slots...</div>
                    ) : slots.length === 0 ? (
                      <div className="alert alert-info">No available slots on this date. Please pick another.</div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {slots.map(slot => (
                          <div 
                            key={slot._id}
                            onClick={() => setSelectedSlot(slot._id)}
                            style={{
                              padding: "10px", textAlign: "center", borderRadius: 8, cursor: "pointer", border: "1px solid",
                              borderColor: selectedSlot === slot._id ? "var(--primary)" : "var(--border)",
                              background: selectedSlot === slot._id ? "var(--primary-pale)" : "#fff",
                              fontWeight: selectedSlot === slot._id ? "bold" : "normal"
                            }}
                          >
                            {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Global Design Image */}
        <div className="card" style={{ marginBottom: 20 }}>
            <div className="form-section-title"><i className="fa-solid fa-image" style={{ marginRight: 8 }} />Design Reference</div>
            <div className="form-group">
              <label>Upload a global reference image (Optional)</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(e) => setDesignImage(e.target.files[0])}
                style={{ padding: "8px 12px" }}
              />
              <small style={{ color: "var(--text-gray)", fontSize: 12 }}>Max 5MB</small>
            </div>
        </div>

        <div className="form-section-title" style={{ marginTop: 32 }}>
            <i className="fa-solid fa-shirt" style={{ marginRight: 8 }} />Clothing Items
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {items.map((item, index) => (
            <div key={index} className="card" style={{ background: "var(--bg-light)", border: "1px solid var(--border)", position: 'relative' }}>
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                    {items.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>
                            <i className="fa-solid fa-times" /> Remove
                        </button>
                    )}
                </div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: 16, color: "var(--text-dark)" }}>Item #{index + 1}</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: measurementType === "self" ? "1.5fr 1fr" : "1fr", gap: 24 }}>
                    {/* Item Details */}
                    <div>
                        <div className="form-row">
                            <div className="form-group">
                            <label>Cloth Type <span className="required">*</span></label>
                            <select className="form-control" value={item.clothType} onChange={(e) => handleItemChange(index, "clothType", e.target.value)} required>
                                <option value="">Select type...</option>
                                {CLOTH_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                            </div>

                            {item.clothType === "Other" && (
                            <div className="form-group">
                                <label>Specify Type <span className="required">*</span></label>
                                <input className="form-control" placeholder="Enter cloth type"
                                value={item.customClothType} onChange={(e) => handleItemChange(index, "customClothType", e.target.value)} required />
                            </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                            <label>Fabric Type</label>
                            <select className="form-control" value={item.fabricType} onChange={(e) => handleItemChange(index, "fabricType", e.target.value)}>
                                <option value="">Select fabric</option>
                                {FABRIC_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" min="1" className="form-control" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} />
                            </div>
                            <div className="form-group">
                            <label>Estimated Price (₹)</label>
                            <div className="input-icon-wrap">
                                <i className="input-icon fa-solid fa-indian-rupee-sign" />
                                <input 
                                className="form-control" 
                                type="text" 
                                value={item.clothType && ESTIMATED_PRICES[item.clothType] ? ESTIMATED_PRICES[item.clothType] : ""} 
                                readOnly 
                                placeholder="Select cloth type first" 
                                style={{ backgroundColor: "var(--bg)", cursor: "not-allowed", color: "var(--text-gray)" }}
                                />
                            </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Special Instructions</label>
                            <textarea className="form-control" rows={2}
                            placeholder="Design instructions..."
                            value={item.specialInstructions} onChange={(e) => handleItemChange(index, "specialInstructions", e.target.value)} />
                        </div>
                    </div>

                    {/* Item Measurements */}
                    {measurementType === "self" && (
                        <div style={{ paddingLeft: 24, borderLeft: "1px dashed var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <label style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>
                                    Measurements <span style={{ color: "var(--text-gray)", fontSize: 12 }}>(inches)</span>
                                </label>
                                <button type="button"
                                    className={`btn btn-sm ${item.showMeasurement ? "btn-primary" : "btn-outline"}`}
                                    onClick={() => handleItemChange(index, "showMeasurement", !item.showMeasurement)}>
                                    {item.showMeasurement ? <><i className="fa-solid fa-minus" /> Hide</> : <><i className="fa-solid fa-plus" /> Add</>}
                                </button>
                            </div>

                            {item.showMeasurement ? (
                                <div className="measurement-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                                    {MEASUREMENT_FIELDS.map((f) => (
                                        <div className="form-group" key={f.key} style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: 11 }}>{f.label}</label>
                                        <input
                                            className="form-control"
                                            type="number" step="0.5" placeholder="in"
                                            value={item.measurement[f.key] || ""}
                                            onChange={(e) => handleMeasure(index, f.key, e.target.value)}
                                            style={{ padding: "5px 8px", fontSize: 12 }}
                                        />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "20px", marginTop: 20 }}>
                                    <i className="fa-solid fa-ruler" style={{ fontSize: 24 }} />
                                    <p style={{ fontSize: 13, marginTop: 10 }}>Measurements act as optional parameters.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-outline" onClick={addItem} style={{ marginTop: 20 }}>
            <i className="fa-solid fa-plus" /> Add Another Item
        </button>

        <div style={{ marginTop: 24, padding: "16px", background: "#fcf8f5", borderLeft: "4px solid var(--primary)", borderRadius: "4px" }}>
          <p style={{ margin: 0, color: "var(--primary)", fontWeight: "500", fontSize: 14 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }}></i>
            Note: Order completion requires a minimum of 3 days.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/my-orders")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Placing Order...</> : <><i className="fa-solid fa-check" /> Place Order ({items.length} items)</>}
          </button>
        </div>
      </form>
    </div>
  );
}
