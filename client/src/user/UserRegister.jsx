import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/form.css";

export default function UserRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "", address: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      if (res.data.success) {
        navigate("/verify-otp", { state: { email: form.email, type: "register" } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="shop-name">ઘનશ્યામ Ladies Tailor</div>
          <div className="shop-tagline">Precision and Perfection in Every Stitch</div>
          <div className="auth-icon"><i className="fa-solid fa-user-plus" /></div>
        </div>
        <div className="auth-body">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join us to place tailoring orders online</p>

          {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-user" />
                  <input className="form-control" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-phone" />
                  <input className="form-control" name="phone" placeholder="+91 99999 99999" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-envelope" />
                <input className="form-control" type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-location-dot" />
                <input className="form-control" name="address" placeholder="Your address" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-lock" />
                  <input className="form-control" type={showPass ? "text" : "password"} name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-lock" />
                  <input className="form-control" type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Creating Account...</> : <><i className="fa-solid fa-user-plus" /> Create Account</>}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
          <div className="auth-footer" style={{ marginTop: 6 }}>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
