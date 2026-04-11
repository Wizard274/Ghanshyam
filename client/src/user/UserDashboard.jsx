import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { orderAPI } from "../services/api";
import "../styles/dashboard.css";

const STATUS_STEPS = ["Pending", "Cutting", "Stitching", "Ready", "Delivered"];
const STEP_ICONS = ["fa-clock", "fa-scissors", "🧵", "fa-check-circle", "fa-truck"];
const PIE_COLORS = ["#E65100", "#C4941C", "#1565C0", "#6A1B9A", "#2E7D32"];

function StatusBadge({ status }) {
  const cls = { Pending: "badge-pending", Cutting: "badge-cutting", Stitching: "badge-stitching", Ready: "badge-ready", Delivered: "badge-delivered" };
  return <span className={`badge ${cls[status] || ""}`}>{status}</span>;
}

export default function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    orderAPI.getStats().then((res) => {
      setStats(res.data.stats);
      setRecent(res.data.recent || []);
    }).finally(() => setLoading(false));
  }, []);

  const pieData = stats
    ? [
        { name: "Pending", value: stats.pending },
        { name: "Cutting", value: 0 },
        { name: "Stitching", value: stats.stitching },
        { name: "Ready", value: stats.ready },
        { name: "Delivered", value: stats.delivered },
      ].filter((d) => d.value > 0)
    : [];

  const barData = recent.map((o) => ({
    name: o.clothType?.slice(0, 8),
    status: STATUS_STEPS.indexOf(o.status) + 1,
  }));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
      </div>
    );
  }

  const statCards = [
    { key: "total", icon: "fa-list", label: "Total Orders", value: stats?.total || 0, cls: "total" },
    { key: "pending", icon: "fa-clock", label: "Pending", value: stats?.pending || 0, cls: "pending" },
    { key: "stitching", icon: "🧵", label: "In Progress", value: stats?.stitching || 0, cls: "stitching" },
    { key: "ready", icon: "fa-check-circle", label: "Ready", value: stats?.ready || 0, cls: "ready" },
    { key: "delivered", icon: "fa-truck", label: "Delivered", value: stats?.delivered || 0, cls: "delivered" },
    { key: "invoices", icon: "fa-file-invoice", label: "Invoices", value: stats?.invoices || 0, cls: "invoices" },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ background: "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)", color: "#fff", marginBottom: 24, borderColor: "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>
              Welcome back, {user.name}! 👋
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
              Track your orders and manage your tailoring journey here.
            </p>
          </div>
          <Link to="/place-order" className="btn" style={{ background: "#fff", color: "var(--primary)", fontWeight: 600 }}>
            <i className="fa-solid fa-plus" /> Place New Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {statCards.map((s) => (
          <div className={`stat-card ${s.cls}`} key={s.key}>
            <div className="stat-icon">
              {s.icon === "🧵" ? <span style={{ fontSize: "20px" }}>🧵</span> : <i className={`fa-solid ${s.icon}`} />}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="dashboard-two-col">
        {/* Pie chart */}
        <div className="chart-card">
          <div className="chart-title">Order Status Overview</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <i className="fa-solid fa-chart-pie" />
              <p>No order data yet</p>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="chart-card">
          <div className="chart-title">Recent Order Progress</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-gray)" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip formatter={(v) => STATUS_STEPS[v - 1]} />
                <Bar dataKey="status" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <i className="fa-solid fa-chart-bar" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0 }}>Recent Orders</div>
          <Link to="/my-orders" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>
            View All <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-inbox" />
            <p>No orders yet. <Link to="/place-order" style={{ color: "var(--primary)" }}>Place your first order!</Link></p>
          </div>
        ) : (
          <div className="recent-list">
            {recent.map((order) => (
              <Link to={`/orders/${order._id}`} key={order._id} className="recent-item" style={{ textDecoration: "none" }}>
                <div className="item-icon"><i className="fa-solid fa-scissors" /></div>
                <div className="item-info">
                  <div className="item-name">{order.clothType}{order.customClothType ? ` (${order.customClothType})` : ""}</div>
                  <div className="item-sub">{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
                <div className="item-right">
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
        {[
          { to: "/place-order", icon: "fa-plus-circle", label: "Place Order", color: "var(--primary)" },
          { to: "/my-orders", icon: "fa-list-check", label: "My Orders", color: "var(--info)" },
          { to: "/invoices", icon: "fa-file-invoice", label: "Invoices", color: "var(--accent)" },
          { to: "/profile", icon: "fa-user-circle", label: "My Profile", color: "var(--success)" },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, textAlign: "center", cursor: "pointer" }}>
            <i className={`fa-solid ${q.icon}`} style={{ fontSize: 24, color: q.color }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dark)" }}>{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
