import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/form.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const type = location.state?.type || "register";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/register");
    const t = setInterval(() => setResendTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) return toast.error("Please enter complete OTP");
    setLoading(true);
    try {
      const endpoint = type === "reset" ? authAPI.verifyResetOtp : authAPI.verifyOtp;
      const res = await endpoint({ email, otp: otpStr });
      if (res.data.success) {
        if (type === "reset") {
          navigate("/reset-password", { state: { email, otp: otpStr } });
        } else {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.resendOtp({ email });
      setResendTimer(60);
      } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="shop-name">ઘનશ્યામ Ladies Tailor</div>
          <div className="shop-tagline">Precision and Perfection in Every Stitch</div>
          <div className="auth-icon"><i className="fa-solid fa-shield-halved" /></div>
        </div>
        <div className="auth-body">
          <h2>Verify OTP</h2>
          <p className="auth-subtitle">
            We sent a 6-digit OTP to<br />
            <strong style={{ color: "var(--primary)" }}>{email}</strong>
          </p>

          

          <form onSubmit={handleSubmit}>
            <div className="otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-gray)", marginBottom: 16 }}>
              OTP expires in 5 minutes
            </p>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Verifying...</> : <><i className="fa-solid fa-check" /> Verify OTP</>}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 20 }}>
            Didn't receive OTP?{" "}
            <button
              onClick={handleResend}
              style={{ background: "none", border: "none", color: resendTimer > 0 ? "var(--text-light)" : "var(--primary)", cursor: resendTimer > 0 ? "not-allowed" : "pointer", fontWeight: 500, fontSize: 14 }}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
