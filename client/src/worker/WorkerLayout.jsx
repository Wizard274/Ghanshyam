import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";

const WorkerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch(e){}
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "My Work", path: "/worker/dashboard", icon: "fa-solid fa-briefcase" },
    { name: "Profile", path: "/worker/profile", icon: "fa-solid fa-user" }
  ];

  return (
    <div className="layout-wrap">
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
          <div className="brand-name">ઘનશ્યામ Ladies Tailor</div>
          <div className="brand-tagline">Precision and Perfection in Every Stitch</div>
          <div className="brand-badge"><i className="fa fa-cut" /> Worker Panel</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Management</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname.startsWith(item.path) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon"><i className={item.icon}></i></span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || "W"}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "Worker"}</div>
              <div className="sidebar-user-role">Tailor / Employee</div>
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
          <span className="navbar-title">Worker Panel</span>
          <div className="navbar-right">
            <span style={{ fontSize: 13, color: "var(--text-gray)" }}>Welcome, {user?.name}</span>
            <div className="navbar-avatar">{user?.name?.[0]?.toUpperCase() || "W"}</div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default WorkerLayout;
