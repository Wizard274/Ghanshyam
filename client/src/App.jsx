import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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
import PaymentSuccess from "./user/PaymentSuccess";
import PaymentCancel from "./user/PaymentCancel";

// Admin pages
import AdminDashboard from "./admin/AdminDashboard";
import Customers from "./admin/Customers";
import ManageWorkers from "./admin/ManageWorkers";
import AdminOrders from "./admin/AdminOrders";
import AdminOrderDetails from "./admin/AdminOrderDetails";
import AdminInvoices from "./admin/AdminInvoices";
import AdminInvoiceDetails from "./admin/AdminInvoiceDetails";
import AdminAppointments from "./admin/AdminAppointments";
import AdminMeasurements from "./admin/AdminMeasurements";
import AdminMessages from "./admin/AdminMessages";
import AdminCreateOrder from "./admin/AdminCreateOrder";

// Layout
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import WorkerLayout from "./worker/WorkerLayout";
import WorkerDashboard from "./worker/WorkerDashboard";
import WorkerProfile from "./worker/WorkerProfile";
import WorkerItemDetails from "./worker/WorkerItemDetails";

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
  if (role && user.role !== role) {
     if (user.role === "admin") return <Navigate to="/admin" replace />;
     if (user.role === "worker") return <Navigate to="/worker/dashboard" replace />;
     return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
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
          <Route path="/payment-success" element={<ProtectedRoute role="user"><UserLayout><PaymentSuccess /></UserLayout></ProtectedRoute>} />
          <Route path="/payment-cancel" element={<ProtectedRoute role="user"><UserLayout><PaymentCancel /></UserLayout></ProtectedRoute>} />

          {/* Worker */}
          <Route path="/worker/dashboard" element={<ProtectedRoute role="worker"><WorkerLayout><WorkerDashboard /></WorkerLayout></ProtectedRoute>} />
          <Route path="/worker/item/:id" element={<ProtectedRoute role="worker"><WorkerLayout><WorkerItemDetails /></WorkerLayout></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute role="worker"><WorkerLayout><WorkerProfile /></WorkerLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute role="admin"><AdminLayout><Customers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/workers" element={<ProtectedRoute role="admin"><AdminLayout><ManageWorkers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders/:id" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrderDetails /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders/create" element={<ProtectedRoute role="admin"><AdminLayout><AdminCreateOrder /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/invoices" element={<ProtectedRoute role="admin"><AdminLayout><AdminInvoices /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/invoices/:id" element={<ProtectedRoute role="admin"><AdminLayout><AdminInvoiceDetails /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminLayout><AdminAppointments /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/measurements" element={<ProtectedRoute role="admin"><AdminLayout><AdminMeasurements /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
