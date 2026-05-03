import api from "./axios";

// ── AUTH ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
  updateProfile: (data) => api.put("/auth/me", data),
  changePassword: (data) => api.put("/auth/password", data),
};

// ── EXPENSES ──────────────────────────────────────
export const expenseAPI = {
  getAll: (params) => api.get("/expenses", { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  summary: () => api.get("/expenses/summary"),
};

// ── INCOME ────────────────────────────────────────
export const incomeAPI = {
  getAll: (params) => api.get("/income", { params }),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post("/income", data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
  summary: () => api.get("/income/summary"),
};

// ── SAVINGS ───────────────────────────────────────
export const savingAPI = {
  getAll: (params) => api.get("/savings", { params }),
  getById: (id) => api.get(`/savings/${id}`),
  create: (data) => api.post("/savings", data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
  total: () => api.get("/savings/total"),
};

// ── GOALS ─────────────────────────────────────────
export const goalAPI = {
  getAll: (params) => api.get("/goals", { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post("/goals", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getSavings: (id) => api.get(`/goals/${id}/savings`),
};

// ── ANALYTICS ─────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get("/analytics/summary"),
  monthly: (params) => api.get("/analytics/monthly", { params }),
  trend: (params) => api.get("/analytics/trend", { params }),
  goalsProgress: () => api.get("/analytics/goals-progress"),
  recent: (params) => api.get("/analytics/recent", { params }),
};
