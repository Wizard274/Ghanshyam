import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const userNavItems = [
  { to: "/dashboard", icon: "fa-gauge", label: "Dashboard" },
  { to: "/place-order", icon: "fa-plus-circle", label: "Place Order" },
  { to: "/my-orders", icon: "fa-list-check", label: "My Orders" },
  { to: "/invoices", icon: "fa-file-invoice-dollar", label: "Invoices" },
  { to: "/profile", icon: "fa-user-circle", label: "Profile" },
  { to: "/contact", icon: "fa-envelope", label: "Contact" },
];

export default function UserLayout({ children }) {
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
      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
          <div className="brand-name">ઘનશ્યામ Ladies Tailor</div>
          <div className="brand-tagline">Precision and Perfection in Every Stitch</div>
          <div className="brand-badge"><i className="fa fa-scissors" /> Customer Panel</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {userNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon"><i className={`fa-solid ${item.icon}`} /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "Customer"}</div>
              <div className="sidebar-user-role">Customer</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="top-navbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars" />
          </button>
          <span className="navbar-title">ઘનશ્યામ Ladies Tailor</span>
          <div className="navbar-right">
            <div className="navbar-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
