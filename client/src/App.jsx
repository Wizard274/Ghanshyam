import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import HomePage from "./pages/HomePage";
import UserLogin from "./user/UserLogin";
import UserRegister from "./user/UserRegister";
import VerifyOtp from "./user/VerifyOtp";
import ForgotPassword from "./user/ForgotPassword";
import ResetPassword from "./user/ResetPassword";

// User pages
import UserDashboard from "./user/UserDashboard";
import PlaceOrder from "./user/PlaceOrder";
import MyOrders from "./user/MyOrders";
import OrderDetails from "./user/OrderDetails";
import CustomerInvoices from "./user/CustomerInvoices";
import InvoiceDetails from "./user/InvoiceDetails";
import Profile from "./user/Profile";
import Contact from "./user/Contact";

// Admin pages
import AdminDashboard from "./admin/AdminDashboard";
import Customers from "./admin/Customers";
import AdminOrders from "./admin/AdminOrders";
import AdminOrderDetails from "./admin/AdminOrderDetails";
import AdminInvoices from "./admin/AdminInvoices";
import AdminInvoiceDetails from "./admin/AdminInvoiceDetails";
import AdminMeasurements from "./admin/AdminMeasurements";
import AdminMessages from "./admin/AdminMessages";
import AdminCreateOrder from "./admin/AdminCreateOrder";

// Layout
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";

const getUser = () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return token && user ? user : null;
  } catch { return null; }
};

const ProtectedRoute = ({ children, role }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
        <Route path="/place-order" element={<ProtectedRoute role="user"><UserLayout><PlaceOrder /></UserLayout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute role="user"><UserLayout><MyOrders /></UserLayout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute role="user"><UserLayout><OrderDetails /></UserLayout></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute role="user"><UserLayout><CustomerInvoices /></UserLayout></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute role="user"><UserLayout><InvoiceDetails /></UserLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="user"><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute role="user"><UserLayout><Contact /></UserLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute role="admin"><AdminLayout><Customers /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrderDetails /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/orders/create" element={<ProtectedRoute role="admin"><AdminLayout><AdminCreateOrder /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/invoices" element={<ProtectedRoute role="admin"><AdminLayout><AdminInvoices /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/invoices/:id" element={<ProtectedRoute role="admin"><AdminLayout><AdminInvoiceDetails /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/measurements" element={<ProtectedRoute role="admin"><AdminLayout><AdminMeasurements /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
