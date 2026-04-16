import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 32, textAlign: "center" }} className="card">
      <i className="fa-solid fa-xmark-circle" style={{ fontSize: 48, color: "red", marginBottom: 16 }} />
      <h2 style={{ marginBottom: 12 }}>Payment Cancelled</h2>
      <p style={{ fontSize: 14, color: "var(--text-gray)", marginBottom: 24 }}>
        You have cancelled the payment process. Your order status remains unchanged.
      </p>
      <button className="btn btn-primary" onClick={() => navigate("/my-orders")}>Return to My Orders</button>
    </div>
  );
}
