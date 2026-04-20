import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");
  const type = searchParams.get("type"); // "advance" or "final"

  const [status, setStatus] = useState("loading"); // loading, otp, success, error
  const [msg, setMsg] = useState("");
  const [otp, setOtp] = useState("");
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!sessionId || !orderId || !type) {
        setStatus("error");
        setMsg("Invalid payment session details.");
        return;
    }
    
    if (!hasTriggered.current) {
        hasTriggered.current = true;
        triggerOTP();
    }
  }, [sessionId, orderId, type]);

  const triggerOTP = async () => {
     try {
         await paymentAPI.sendOtp({ orderId, type });
         setStatus("otp");
         setMsg(`Payment successful! An OTP has been sent to your email to confirm the ${type} payment.`);
     } catch (err) {
         setStatus("error");
         toast.error(err.response?.data?.message || "Failed to send OTP after payment.");
     }
  };

  const handleVerifyOTP = async (e) => {
     e.preventDefault();
     try {
        await paymentAPI.verifyOtp({ orderId, type, otp });
        setStatus("success");
        setMsg(`Your ${type} payment has been verified successfully!`);
        setTimeout(() => navigate("/my-orders"), 3000);
     } catch (err) {
        setMsg(err.response?.data?.message || "Invalid OTP. Please try again.");
     }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24 }} className="card">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
          {status === "loading" && <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 40, color: "var(--primary)" }} />}
          {status === "otp" && <i className="fa-solid fa-envelope-open-text" style={{ fontSize: 40, color: "var(--accent)" }} />}
          {status === "success" && <i className="fa-solid fa-check-circle" style={{ fontSize: 40, color: "green" }} />}
          {status === "error" && <i className="fa-solid fa-times-circle" style={{ fontSize: 40, color: "red" }} />}
      </div>
      
      <h2 style={{ textAlign: "center", marginBottom: 12 }}>Payment Status</h2>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-gray)", marginBottom: 24 }}>{msg || "Verifying payment..."}</p>

      {status === "otp" && (
        <form onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label>Enter 6-digit OTP</label>
            <input 
              className="form-control" 
              type="text" 
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ textAlign: "center", fontSize: 24, letterSpacing: 4 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Verify OTP & Confirm Order</button>
        </form>
      )}

      {status === "error" && (
         <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => navigate("/my-orders")}>Return to Orders</button>
      )}
    </div>
  );
}
