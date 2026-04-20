import React, { useState, useEffect } from "react";
import { userAPI, authAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/dashboard.css";
import "../styles/form.css";

export default function ManageWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", password: "", confirmPassword: "" });
  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = () => {
    setLoading(true);
    userAPI.getAllWorkers()
      .then((res) => {
        setWorkers(res.data.workers || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
    }
    if (formData.password.length < 6) {
        return toast.error("Password must be at least 6 characters");
    }
    try {
      await userAPI.createWorker(formData);
      setShowModal(false);
      setFormData({ name: "", phone: "", email: "", address: "", password: "", confirmPassword: "" });
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create worker");
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worker account? this is irreversible.")) return;
    try {
      await userAPI.deleteWorker(id);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete worker");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Manage Workers</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-plus" /> Add Worker
        </button>
      </div>

      <div className="card">
        {workers.length === 0 ? (
          <div className="empty-state">No workers found. Create one.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w._id}>
                    <td>{w.name}</td>
                    <td>{w.phone}</td>
                    <td>{w.email}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-outline text-danger" onClick={() => handleDeleteWorker(w._id)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Add Worker</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-times" /></button>
            </div>
            
            <form onSubmit={handleCreateWorker}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone <span className="required">*</span></label>
                <input 
                  className="form-control" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Min 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="form-control" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Repeat password" required />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
