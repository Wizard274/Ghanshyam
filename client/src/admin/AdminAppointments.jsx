import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { appointmentAPI } from "../services/api";
import toast from "react-hot-toast";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("appointments"); // "appointments" or "slots"

  // Appointments Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 700);
    return () => clearTimeout(handler);
  }, [search]);

  // Generate Slots Form state
  const [form, setForm] = useState({ date: "", startTime: "10:00 AM", endTime: "06:00 PM", intervalMinutes: 30, capacity: 1 });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (tab === "appointments") {
      fetchAppointments(debouncedSearch, page);
    } else {
      fetchSlots();
    }
  }, [debouncedSearch, page, tab]);

  const fetchAppointments = (q = "", p = 1) => {
    setLoading(true);
    appointmentAPI.getAll({ search: q, page: p, limit: 7 }).then((res) => {
      setAppointments(res.data.appointments);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    }).finally(() => setLoading(false));
  };

  const fetchSlots = (dateString = "") => {
    appointmentAPI.getAdminSlots(dateString).then(res => {
        setSlots(res.data.slots);
    });
  };


  const handleGenerate = async (e) => {
      e.preventDefault();
      setGenerating(true);
      try {
          const res = await appointmentAPI.generateSlots(form);
          toast.success(res.data.message || "Slots generated successfully");
          fetchSlots();
          
      } catch (err) {
          toast.error(err.response?.data?.message || "Generation failed.");
          
      } finally {
          setGenerating(false);
      }
  };

  const handleDeleteSlot = async (id) => {
    if(!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
        await appointmentAPI.deleteSlot(id);
        fetchSlots();
    } catch(err) {
        toast.error(err.response?.data?.message || "Failed to delete slot");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Tailor Appointments</h1>
        <div style={{ display: "flex", gap: 10 }}>
            <button className={`btn ${tab === "appointments" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("appointments")}>
                <i className="fa-solid fa-calendar-check" /> Bookings
            </button>
            <button className={`btn ${tab === "slots" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("slots")}>
                <i className="fa-solid fa-clock" /> Manage Slots
            </button>
        </div>
      </div>

      {tab === "appointments" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="filter-bar" style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                  <div className="search-wrap" style={{ margin: 0, flex: 1 }}>
                      <i className="search-icon fa-solid fa-search" />
                      <input type="text" placeholder="Search by customer name..." value={search}
                          onChange={(e) => setSearch(e.target.value)} />
                  </div>
              </div>
              <div className="table-wrap">
                  <table>
                      <thead>
                          <tr>
                              <th>Date & Time</th>
                              <th>Customer</th>
                              <th>Order No.</th>
                              <th>Status</th>
                              <th>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {appointments.length === 0 ? (
                              <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>No appointments found.</td></tr>
                          ) : appointments.map(apt => (
                              <tr key={apt._id}>
                                  <td>
                                      <strong>{new Date(apt.date).toLocaleDateString("en-IN")}</strong>
                                      <br/>
                                      <small style={{ color: "var(--text-gray)" }}>{apt.time}</small>
                                  </td>
                                  <td>
                                      {apt.userId?.name}
                                      <br/>
                                      <small style={{ color: "var(--text-gray)" }}>{apt.userId?.phone}</small>
                                  </td>
                                  <td>
                                      {apt.orderId?.orderNumber}
                                      <br/>
                                      <span className="badge badge-pending" style={{ fontSize: 10 }}>{apt.orderId?.status}</span>
                                  </td>
                                  <td>
                                      <span className={`badge badge-${apt.status === "completed" ? "delivered" : apt.status === "scheduled" ? "working" : "error"}`}>
                                          {apt.status}
                                      </span>
                                  </td>
                                  <td>
                                      <Link to={`/admin/orders/${apt.orderId?._id}`} className="btn btn-outline btn-sm">
                                          <i className="fa-solid fa-ruler" /> Add Measurements
                                      </Link>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              
              {!loading && appointments.length > 0 && totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderTop: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 13, color: "var(--text-gray)" }}>
                          Showing page {page} of {totalPages}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                          <button
                              className="btn btn-outline btn-sm"
                              disabled={page <= 1}
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                          >
                              <i className="fa-solid fa-chevron-left" style={{ marginRight: 6 }} /> Previous
                          </button>
                          <button
                              className="btn btn-outline btn-sm"
                              disabled={page >= totalPages}
                              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          >
                              Next <i className="fa-solid fa-chevron-right" style={{ marginLeft: 6 }} />
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {tab === "slots" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
              <div className="card" style={{ alignSelf: "start" }}>
                  <div className="section-title">Generate Time Slots</div>
                  <form onSubmit={handleGenerate}>
                      <div className="form-group">
                          <label>Date</label>
                          <input className="form-control" type="date" required min={new Date().toISOString().split("T")[0]} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label>Start Time (eg. 10:00 AM)</label>
                          <input className="form-control" type="text" required value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label>End Time (eg. 06:00 PM)</label>
                          <input className="form-control" type="text" required value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label>Interval (Minutes)</label>
                          <input className="form-control" type="number" required value={form.intervalMinutes} onChange={e => setForm({...form, intervalMinutes: e.target.value})} />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={generating}>
                          {generating ? "Generating..." : "Generate Slots"}
                      </button>
                  </form>
              </div>

              <div className="card">
                  <div className="section-title">Existing Slots (Future)</div>
                  <div className="table-wrap" style={{ maxHeight: 500, overflowY: "auto" }}>
                      <table>
                          <thead>
                              <tr>
                                  <th>Date</th>
                                  <th>Time Range</th>
                                  <th>Booked</th>
                                  <th>Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              {slots.length === 0 ? (
                                  <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>No slots generated.</td></tr>
                              ) : slots.map(slot => (
                                  <tr key={slot._id}>
                                      <td>{new Date(slot.date).toLocaleDateString("en-IN")}</td>
                                      <td>{slot.startTime} - {slot.endTime}</td>
                                      <td>{slot.booked}/{slot.capacity}</td>
                                      <td>
                                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSlot(slot._id)} disabled={slot.booked > 0}>
                                              <i className="fa-solid fa-trash" />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
