import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const adminNavItems = [
  { to: "/admin", icon: "fa-gauge", label: "Dashboard", end: true },
  { to: "/admin/customers", icon: "fa-users", label: "Customers" },
  { to: "/admin/workers", icon: "fa-user-tie", label: "Workers" },
  { to: "/admin/orders", icon: "fa-list-check", label: "Orders" },
  { to: "/admin/appointments", icon: "fa-calendar-check", label: "Appointments" },
  { to: "/admin/invoices", icon: "fa-file-invoice-dollar", label: "Invoices" },
  { to: "/admin/messages", icon: "fa-envelope", label: "Messages" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch(e){}
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="layout-wrap">
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
          <div className="brand-name">ઘનશ્યામ Ladies Tailor</div>
          <div className="brand-tagline">Precision and Perfection in Every Stitch</div>
          <div className="brand-badge"><i className="fa fa-crown" /> Admin Panel</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Management</div>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon"><i className={`fa-solid ${item.icon}`} /></span>
              {item.label}
            </NavLink>
          ))}
          <div className="nav-section-label" style={{ marginTop: 16 }}>Actions</div>
          <NavLink
            to="/admin/orders/create"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><i className="fa-solid fa-plus-circle" /></span>
            Create Order
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || "A"}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "Admin"}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-navbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars" />
          </button>
          <span className="navbar-title">Admin Panel</span>
          <div className="navbar-right">
            <span style={{ fontSize: 13, color: "var(--text-gray)" }}>Welcome, {user?.name}</span>
            <div className="navbar-avatar">{user?.name?.[0]?.toUpperCase() || "A"}</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
