import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/form.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) return setError("Passwords do not match");
    if (form.newPassword.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ email, otp, newPassword: form.newPassword });
      if (res.data.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
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
          <div className="auth-icon"><i className="fa-solid fa-lock-open" /></div>
        </div>
        <div className="auth-body">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">Set a new password for your account</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success"><i className="fa-solid fa-check" style={{ marginRight: 8 }} />{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-lock" />
                <input
                  className="form-control"
                  type={showPass ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-lock" />
                <input
                  className="form-control"
                  type="password"
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              disabled={loading || !!success}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Resetting...</>
                : <><i className="fa-solid fa-check" /> Reset Password</>
              }
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 20 }}>
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
