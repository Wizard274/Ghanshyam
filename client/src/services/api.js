import axios from "axios";

const BASE_URL = "https://ghanshyam-t73d.onrender.com";
export const IMAGE_BASE_URL = `${BASE_URL}/uploads/`;

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === "/auth/login" || originalRequest.url === "/auth/refresh") {
        return Promise.reject(err);
      }
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return API(originalRequest);
        }
      } catch (e) {
        localStorage.clear();
        window.location.href = "/login";
      }
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
  refresh: () => API.post("/auth/refresh"),
  logout: () => API.post("/auth/logout"),
};

export const orderAPI = {
  create: (data) => API.post("/orders/create", data, { headers: { "Content-Type": "multipart/form-data" } }),
  getMyOrders: (params) => API.get("/orders/my-orders", { params }),
  getById: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get("/orders/all", { params }),
  getAllItems: (params) => API.get("/orders/items/all", { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  updateItemStatus: (orderId, itemId, data) => API.put(`/orders/${orderId}/items/${itemId}/status`, data),
  updateMeasurement: (id, data) => API.put(`/orders/${id}/measurement`, data),
  adminCreate: (data) => API.post("/orders/admin-create", data),
  delete: (id) => API.delete(`/orders/${id}`),
  getStats: () => API.get("/orders/stats"),
  generateChallan: (id, data) => API.post(`/orders/${id}/challan`, data),
  downloadChallan: (id) => API.get(`/orders/${id}/challan/pdf`, { responseType: "blob" }),
  assignWorker: (id, itemId, data) => API.put(`/orders/${id}/items/${itemId}/assign`, data),
};

export const paymentAPI = {
  createCheckoutSession: (data) => API.post("/payments/create-checkout-session", data),
  sendOtp: (data) => API.post("/payments/send-otp", data),
  verifyOtp: (data) => API.post("/payments/verify-otp", data),
  chooseCOD: (id) => API.post(`/payments/${id}/cod`),
};

export const invoiceAPI = {
  create: (data) => API.post("/invoices/create", data),
  getById: (id) => API.get(`/invoices/${id}`),
  getAll: (params) => API.get("/invoices/all", { params }),
  getMyInvoices: (params) => API.get("/invoices/my-invoices", { params }),
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
  getAllWorkers: (params) => API.get("/users/workers", { params }),
  createWorker: (data) => API.post("/users/workers", data),
  deleteWorker: (id) => API.delete(`/users/workers/${id}`),
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

export const workerAPI = {
  getAssignedItems: () => API.get("/worker/assigned-items"),
  updateItemStatus: (itemId, data) => API.put(`/worker/items/${itemId}/status`, data),
};

export default API;
