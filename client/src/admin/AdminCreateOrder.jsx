import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI, userAPI } from "../services/api";
import "../styles/form.css";
import "../styles/dashboard.css";

const CLOTH_TYPES = [
  "Afghani suit", "Blouse", "Chaniya", "Chaniya Choli",
  "Chudidar", "Fancy Dress", "Fancy T-shirt", "Gown Dress",
  "Lengho", "Pant", "Patiyala", "Salwar", "Shirt", "Other",
];

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

export default function AdminCreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  
  // Order Level Info
  const [orderForm, setOrderForm] = useState({
    userId: "", deliveryDate: "", notes: "",
  });
  
  // Items List
  const [items, setItems] = useState([
    {
      clothType: "", customClothType: "", fabricType: "",
      specialInstructions: "", price: "", measurement: {}, showMeasure: false, quantity: 1
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [customerWorking, setCustomerWorking] = useState(false);
  const [customerError, setCustomerError] = useState("");

  useEffect(() => {
    userAPI.getAllCustomers().then((res) => setCustomers(res.data.customers));
  }, []);

  const handleOrderChange = (e) => setOrderForm({ ...orderForm, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleMeasurementChange = (index, key, value) => {
    const newItems = [...items];
    newItems[index].measurement = { ...newItems[index].measurement, [key]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { clothType: "", customClothType: "", fabricType: "", specialInstructions: "", price: "", measurement: {}, showMeasure: false, quantity: 1 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleCreateCustomer = async () => {
    if(!newCustomerForm.name || !newCustomerForm.phone || !newCustomerForm.email) {
        setCustomerError("Name, Phone, and Email are required.");
        return;
    }
    setCustomerError(""); setCustomerWorking(true);
    try {
        const res = await userAPI.createCustomer(newCustomerForm);
        if(res.data.success) {
             const created = res.data.customer;
             setCustomers([created, ...customers]);
             setOrderForm({...orderForm, userId: created._id});
             setSelectedCustomer(created);
             setCustomerSearch(`${created.name} — ${created.phone}`);
             setShowAddCustomer(false);
             setNewCustomerForm({ name: "", phone: "", email: "", address: "" });
        }
    } catch(err) {
        setCustomerError(err.response?.data?.message || "Failed to create customer");
    } finally {
        setCustomerWorking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.userId) return setError("Please select a customer");
    if (!orderForm.deliveryDate) return setError("Please select a delivery date");
    if (items.length === 0) return setError("Please add at least one item.");

    for(let i=0; i<items.length; i++) {
        if(!items[i].clothType) return setError(`Please select a cloth type for Item ${i+1}`);
    }

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    minDate.setHours(0, 0, 0, 0);
    const selDate = new Date(orderForm.deliveryDate);
    if (selDate < minDate) {
      return setError("Delivery date must be at least 3 days after order date");
    }

    setError(""); setLoading(true);

    try {
      // Prepare payload
      const cleanedItems = items.map(item => ({
        ...item,
        measurement: item.showMeasure ? item.measurement : {}
      }));

      const payload = {
        userId: orderForm.userId,
        deliveryDate: orderForm.deliveryDate,
        notes: orderForm.notes,
        items: cleanedItems
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
        {/* Order Details Container */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-section-title">
            <i className="fa-solid fa-user" style={{ marginRight: 8 }} />Customer & Order General Details
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label>Select Customer <span className="required">*</span></label>
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                      className="form-control" 
                      placeholder="Search by name or phone..." 
                      value={customerSearch}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                      onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          if(selectedCustomer) {
                              setSelectedCustomer(null);
                              setOrderForm({...orderForm, userId: ""});
                          }
                      }} 
                    />
                    <button type="button" className="btn btn-outline"
                      onClick={(e) => { e.preventDefault(); setShowAddCustomer(true); }}
                      style={{ padding: "0 16px", whiteSpace: "nowrap" }}>
                      <i className="fa-solid fa-plus" /> New
                    </button>
                  </div>
                  {showCustomerDropdown && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: "90px", background: "var(--bg-card)", border: "1px solid var(--border)", zIndex: 10, maxHeight: 200, overflowY: "auto", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        {customers.filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 ? (
                            <div style={{ padding: "12px", color: "var(--text-gray)", textAlign: "center", fontSize: 13 }}>No customers found.</div>
                        ) : (
                            customers.filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                                <div key={c._id} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", ":hover": { background: "var(--bg-light)" } }} 
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input onBlur from firing before state updates
                                    setSelectedCustomer(c);
                                    setCustomerSearch(`${c.name} — ${c.phone}`);
                                    setOrderForm({...orderForm, userId: c._id});
                                    setShowCustomerDropdown(false);
                                }}>
                                    <div style={{ fontWeight: 500, color: "var(--text-dark)" }}>{c.name}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{c.phone}</div>
                                </div>
                            ))
                        )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Delivery Date <span className="required">*</span></label>
                <input className="form-control" type="date" name="deliveryDate" min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  value={orderForm.deliveryDate} onChange={handleOrderChange} required />
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <input className="form-control" name="notes"
                  placeholder="Internal note"
                  value={orderForm.notes} onChange={handleOrderChange} />
              </div>
          </div>
        </div>

        {/* Dynamic Items Container */}
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
                
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
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
                            <label>Price (₹)</label>
                            <div className="input-icon-wrap">
                                <i className="input-icon fa-solid fa-indian-rupee-sign" />
                                <input 
                                className="form-control" 
                                type="number" 
                                value={item.price} 
                                onChange={(e) => handleItemChange(index, "price", e.target.value)} 
                                placeholder={item.clothType && ESTIMATED_PRICES[item.clothType] ? `Est: ${ESTIMATED_PRICES[item.clothType]}` : "0"} 
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
                    <div style={{ paddingLeft: 24, borderLeft: "1px dashed var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <label style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>
                                Measurements <span style={{ color: "var(--text-gray)", fontSize: 12 }}>(inches)</span>
                            </label>
                            <button type="button"
                                className={`btn btn-sm ${item.showMeasure ? "btn-primary" : "btn-outline"}`}
                                onClick={() => handleItemChange(index, "showMeasure", !item.showMeasure)}>
                                {item.showMeasure ? <><i className="fa-solid fa-minus" /> Hide</> : <><i className="fa-solid fa-plus" /> Add</>}
                            </button>
                        </div>

                        {item.showMeasure ? (
                            <div className="measurement-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                                {MEASUREMENT_FIELDS.map((f) => (
                                    <div className="form-group" key={f.key} style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: 11 }}>{f.label}</label>
                                    <input
                                        className="form-control"
                                        type="number" step="0.5" placeholder="in"
                                        value={item.measurement[f.key] || ""}
                                        onChange={(e) => handleMeasurementChange(index, f.key, e.target.value)}
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
                </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-outline" onClick={addItem} style={{ marginTop: 20 }}>
            <i className="fa-solid fa-plus" /> Add Another Item
        </button>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/admin/orders")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Creating...</> : <><i className="fa-solid fa-check" /> Create Order With {items.length} Item(s)</>}
          </button>
        </div>
      </form>

      {/* Add New Customer Modal */}
      {showAddCustomer && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="card" style={{ width: "90%", maxWidth: 500, padding: 24, animation: "fadeIn 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0 }}>Create New Customer</h3>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddCustomer(false)}>
                      <i className="fa-solid fa-times" />
                  </button>
              </div>
              
              {customerError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{customerError}</div>}
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                      <label>Name <span className="required">*</span></label>
                      <input className="form-control" value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} placeholder="Full name" autoFocus />
                  </div>
                  <div className="form-group">
                      <label>Phone <span className="required">*</span></label>
                      <input 
                          className="form-control" 
                          value={newCustomerForm.phone} 
                          onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                          placeholder="10 digit mobile number" 
                          maxLength="10"
                      />
                  </div>
              </div>
              
              <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Email <span className="required">*</span></label>
                  <input className="form-control" type="email" value={newCustomerForm.email} onChange={e => setNewCustomerForm({...newCustomerForm, email: e.target.value})} placeholder="Email address" />
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Address <span style={{fontSize: 12, color: "var(--text-gray)", fontWeight: "normal"}}>(Optional)</span></label>
                  <textarea className="form-control" rows={2} value={newCustomerForm.address} onChange={e => setNewCustomerForm({...newCustomerForm, address: e.target.value})} placeholder="Full address" />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddCustomer(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleCreateCustomer} disabled={customerWorking}>
                      {customerWorking ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-check" /> Create Customer</>}
                  </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
