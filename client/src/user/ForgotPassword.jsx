import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/form.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.data.success) {
        navigate("/verify-otp", { state: { email, type: "reset" } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email not found");
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
          <div className="auth-icon"><i className="fa-solid fa-key" /></div>
        </div>
        <div className="auth-body">
          <h2>Forgot Password?</h2>
          <p className="auth-subtitle">Enter your email and we'll send you an OTP to reset your password</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-envelope" />
                <input
                  className="form-control"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Sending OTP...</>
                : <><i className="fa-solid fa-paper-plane" /> Send OTP</>
              }
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 20 }}>
            Remember your password? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
