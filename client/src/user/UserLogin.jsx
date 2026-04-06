import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/form.css";

export default function UserLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
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
          <div className="auth-icon"><i className="fa-solid fa-right-to-bracket" /></div>
        </div>
        <div className="auth-body">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage your tailoring orders</p>

          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-envelope" />
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Password <span className="required">*</span>
                <Link to="/forgot-password" style={{ float: "right", fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-lock" />
                <input
                  className="form-control"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Signing In...</>
                : <><i className="fa-solid fa-right-to-bracket" /> Sign In</>
              }
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 20 }}>
            Don't have an account? <Link to="/register">Create Account</Link>
          </div>
          <div className="auth-footer" style={{ marginTop: 6 }}>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
