import React, { useState, useEffect } from "react";
import { userAPI, orderAPI } from "../services/api";
import "../styles/dashboard.css";

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

export default function AdminMeasurements() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async (q = "") => {
    setLoading(true);
    try {
      const res = await userAPI.getAllCustomers({ search: q });
      setCustomers(res.data.customers);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (customer) => {
    setSelected(customer);
    setSelectedOrder(null);
    setLoadingOrders(true);
    try {
      const res = await orderAPI.getAll({ customer: customer._id });
      const withMeasure = res.data.orders.filter(o => o.measurement && Object.keys(o.measurement).some(k => o.measurement[k]));
      setOrders(withMeasure);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Customer Measurements</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Customer list */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Select Customer</div>
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", fontSize: 13 }} />
              <input
                style={{ width: "100%", padding: "8px 12px 8px 34px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, outline: "none" }}
                placeholder="Search customer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); fetchCustomers(e.target.value); }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ color: "var(--primary)", fontSize: 24 }} />
              </div>
            ) : customers.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-gray)", fontSize: 13 }}>No customers found</div>
            ) : customers.map((c) => (
              <div
                key={c._id}
                onClick={() => handleSelectCustomer(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
                  cursor: "pointer", borderBottom: "1px solid var(--border)",
                  background: selected?._id === c._id ? "var(--primary-pale)" : "#fff",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: selected?._id === c._id ? "var(--primary)" : "var(--border)", color: selected?._id === c._id ? "#fff" : "var(--text-gray)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: selected?._id === c._id ? "var(--primary)" : "var(--text-dark)" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{c.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Measurements panel */}
        <div>
          {!selected ? (
            <div className="card">
              <div className="empty-state">
                <i className="fa-solid fa-ruler" />
                <p>Select a customer to view measurements</p>
              </div>
            </div>
          ) : loadingOrders ? (
            <div className="card" style={{ display: "flex", justifyContent: "center", padding: 60 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--primary)" }} />
            </div>
          ) : (
            <div>
              {/* Customer header */}
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>
                  {selected.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-gray)" }}>{selected.email} · {selected.phone}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "var(--text-gray)", fontSize: 13 }}>
                  <i className="fa-solid fa-list-check" style={{ marginRight: 6 }} />{orders.length} order(s) with measurements
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="card"><div className="empty-state"><i className="fa-solid fa-ruler" /><p>No measurements recorded for this customer</p></div></div>
              ) : (
                <>
                  {/* Order selector */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {orders.map((o) => (
                      <button key={o._id} onClick={() => setSelectedOrder(o)}
                        className={`btn btn-sm ${selectedOrder?._id === o._id ? "btn-primary" : "btn-ghost"}`}>
                        {o.clothType} <span style={{ opacity: 0.7, marginLeft: 4, fontSize: 11 }}>{o.orderNumber}</span>
                      </button>
                    ))}
                  </div>

                  {selectedOrder ? (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div className="section-title" style={{ margin: 0 }}>
                          Measurements: {selectedOrder.clothType}
                        </div>
                        <span className={`badge badge-${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span>
                      </div>
                      <div className="measurement-grid">
                        {MEASUREMENT_FIELDS.map((f) => (
                          <div key={f.key} style={{ background: "var(--primary-pale)", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 10, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: selectedOrder.measurement?.[f.key] ? "var(--primary)" : "var(--text-light)" }}>
                              {selectedOrder.measurement?.[f.key] ? `${selectedOrder.measurement[f.key]}"` : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="card"><div className="empty-state" style={{ padding: "30px 20px" }}><i className="fa-solid fa-hand-pointer" /><p>Select an order above to view measurements</p></div></div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
