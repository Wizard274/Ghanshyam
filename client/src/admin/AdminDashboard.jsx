import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { orderAPI, invoiceAPI } from "../services/api";
import "../styles/dashboard.css";

const PIE_COLORS = ["#E65100", "#C4941C", "#1565C0", "#6A1B9A", "#2E7D32"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderAPI.getStats(), invoiceAPI.getAll()])
      .then(([statsRes, invRes]) => {
        setStats(statsRes.data.stats);
        setRecent(statsRes.data.recent || []);
        const invs = invRes.data.invoices || [];
        setInvoiceStats({
          total: invs.length,
          paid: invs.filter((i) => i.paymentStatus === "Paid").length,
          pending: invs.filter((i) => i.paymentStatus === "Pending").length,
          revenue: invs.filter((i) => i.paymentStatus === "Paid").reduce((s, i) => s + i.totalAmount, 0),
        });
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );

  const statCards = [
    { icon: "fa-list", label: "Total Orders", value: stats?.total || 0, cls: "total", link: "/admin/orders" },
    { icon: "fa-clock", label: "Pending", value: stats?.pending || 0, cls: "pending", link: "/admin/orders?status=Pending" },
    { icon: "fa-cut", label: "Cutting", value: stats?.cutting || 0, cls: "stitching", link: "/admin/orders?status=Cutting" },
    { icon: "fa-spool", label: "Stitching", value: stats?.stitching || 0, cls: "ready", link: "/admin/orders?status=Stitching" },
    { icon: "fa-check-circle", label: "Ready", value: stats?.ready || 0, cls: "delivered", link: "/admin/orders?status=Ready" },
    { icon: "fa-indian-rupee-sign", label: "Revenue", value: `₹${(invoiceStats.revenue || 0).toLocaleString("en-IN")}`, cls: "invoices", link: "/admin/invoices" },
  ];

  // ✅ FIX: Bar chart now uses real data including Cutting
  const statusBar = [
    { name: "Pending", orders: stats?.pending || 0 },
    { name: "Cutting", orders: stats?.cutting || 0 },
    { name: "Stitching", orders: stats?.stitching || 0 },
    { name: "Ready", orders: stats?.ready || 0 },
    { name: "Delivered", orders: stats?.delivered || 0 },
  ];

  // ✅ FIX: Pie chart now includes Cutting
  const pieData = [
    { name: "Pending", value: stats?.pending || 0 },
    { name: "Cutting", value: stats?.cutting || 0 },
    { name: "Stitching", value: stats?.stitching || 0 },
    { name: "Ready", value: stats?.ready || 0 },
    { name: "Delivered", value: stats?.delivered || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {/* Welcome */}
      <div className="card" style={{ background: "linear-gradient(135deg, #6B2F0E, #A0522D)", color: "#fff", marginBottom: 24, border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>Admin Dashboard</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>ઘનશ્યામ Ladies Tailor — Management Panel</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/admin/orders/create" className="btn" style={{ background: "#fff", color: "var(--primary)", fontWeight: 600 }}>
              <i className="fa-solid fa-plus" /> Create Order
            </Link>
            <Link to="/admin/orders" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>
              <i className="fa-solid fa-list" /> All Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {statCards.map((s) => (
          <Link key={s.label} to={s.link} className={`stat-card ${s.cls}`} style={{ textDecoration: "none" }}>
            <div className="stat-icon"><i className={`fa-solid ${s.icon}`} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Invoice Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Invoices", value: invoiceStats.total, icon: "fa-file-invoice", color: "var(--accent)" },
          { label: "Paid", value: invoiceStats.paid, icon: "fa-check-circle", color: "var(--success)" },
          { label: "Payment Pending", value: invoiceStats.pending, icon: "fa-hourglass-half", color: "var(--warning)" },
        ].map((c) => (
          <div key={c.label} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`fa-solid ${c.icon}`} style={{ color: c.color, fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-two-col" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div className="chart-title">Orders by Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-gray)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Status Distribution</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <i className="fa-solid fa-chart-pie" /><p>No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0 }}>Recent Orders</div>
          <Link to="/admin/orders" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>View All →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state"><i className="fa-solid fa-inbox" /><p>No orders yet</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Cloth Type</th><th>Status</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o._id}>
                    <td><strong style={{ color: "var(--primary)" }}>{o.orderNumber}</strong></td>
                    <td>{o.userId?.name || "—"}</td>
                    <td>{o.clothType}</td>
                    <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td style={{ color: "var(--text-gray)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td><Link to={`/admin/orders/${o._id}`} className="btn btn-outline btn-sm">Manage</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
