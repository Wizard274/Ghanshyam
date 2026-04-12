import axios from "axios";

const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  verifyOtp: (data) => API.post("/auth/verify-otp", data),
  login: (data) => API.post("/auth/login", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  verifyResetOtp: (data) => API.post("/auth/verify-reset-otp", data),
  resetPassword: (data) => API.post("/auth/reset-password", data),
  resendOtp: (data) => API.post("/auth/resend-otp", data),
};

export const orderAPI = {
  create: (data) => API.post("/orders/create", data, { headers: { "Content-Type": "multipart/form-data" } }),
  getMyOrders: () => API.get("/orders/my-orders"),
  getById: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get("/orders/all", { params }),
  getAllItems: (params) => API.get("/orders/items/all", { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  updateItemStatus: (orderId, itemId, data) => API.put(`/orders/${orderId}/items/${itemId}/status`, data),
  updateMeasurement: (id, data) => API.put(`/orders/${id}/measurement`, data),
  adminCreate: (data) => API.post("/orders/admin-create", data),
  delete: (id) => API.delete(`/orders/${id}`),
  getStats: () => API.get("/orders/stats"),
};

export const invoiceAPI = {
  create: (data) => API.post("/invoices/create", data),
  getById: (id) => API.get(`/invoices/${id}`),
  getAll: (params) => API.get("/invoices/all", { params }),
  getMyInvoices: () => API.get("/invoices/my-invoices"),
  downloadPDF: (id) => API.get(`/invoices/pdf/${id}`, { responseType: "blob" }),
  updatePayment: (id, data) => API.put(`/invoices/${id}/payment`, data),
  update: (id, data) => API.put(`/invoices/${id}`, data),
};

export const userAPI = {
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/update", data),
  changePassword: (data) => API.put("/users/change-password", data),
  getAllCustomers: (params) => API.get("/users/customers", { params }),
  getCustomerById: (id) => API.get(`/users/customers/${id}`),
  createCustomer: (data) => API.post("/users/customers", data),
  deleteCustomer: (id) => API.delete(`/users/customers/${id}`),
};

export const contactAPI = {
  send: (data) => API.post("/contact/send", data),
  getAll: () => API.get("/contact/all"),
  markRead: (id) => API.put(`/contact/${id}/read`),
};

export const appointmentAPI = {
  getAvailableSlots: (date) => API.get(`/appointments/available-slots${date ? `?date=${date}` : ""}`),
  generateSlots: (data) => API.post("/appointments/generate-slots", data),
  getAdminSlots: (date) => API.get(`/appointments/admin-slots${date ? `?date=${date}` : ""}`),
  deleteSlot: (id) => API.delete(`/appointments/slots/${id}`),
  getAll: (params) => API.get("/appointments/all", { params }),
};

export default API;
