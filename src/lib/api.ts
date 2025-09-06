import axios from "axios"

const API_BASE_URL = "http://8.218.174.70:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/change-password')) {
      localStorage.removeItem("token")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.clear()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("/v1/admin/login", credentials)
      return response.data
    } catch (error: any) {
      console.error("Login API Error:", error.response?.data || error.message)
      throw error
    }
  },
  logout: async () => {
    try {
      const response = await api.get("/v1/admin/logout")
      return response.data
    } catch (error) {
      console.error("Logout API error:", error)
      throw error
    }
  },
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await api.post("/v1/admin/change-password", data)
    return response.data
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/v1/user/forget-password", { email })
    return response.data
  },
  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await api.post("/v1/user/verify-otp", data)
    return response.data
  },
  setNewPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await api.patch("/v1/user/set-new-password", data)
    return response.data
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/v1/admin/reset-password", { token, password })
    return response.data
  },
}

// Order API
export const orderApi = {
  getOrders: async (params: { page: number; limit: number; search?: string, sortBy?: string }) => {
    const response = await api.get("/v1/order/list", { params })
    return response.data
  },
  getOrder: async (id: string) => {
    const response = await api.get(`/v1/order/${id}`)
    return response.data
  },
  createOrder: async (data: any) => {
    const response = await api.post("/v1/order/create", data)
    return response.data
  },
  updateOrder: async (id: string, data: any) => {
    const response = await api.put(`/v1/order/edit/${id}`, data)
    return response.data
  },
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/v1/order/delete/${id}`)
    return response.data
  },
}

// Customer API
export const customerApi = {
  getCustomers: async (params?: { page: number; limit: number; search: string}) => {
    const response = await api.get("/v1/customer/list", { params })
    return response.data
  },
  getCustomer: async (id: string) => {
    const response = await api.get(`/v1/customer/${id}`)
    return response.data
  },
  createCustomer: async (data: any) => {
    const response = await api.post("/v1/admin/create-customer", data)
    return response.data
  },
  updateCustomer: async (id: string, data: any) => {
    const response = await api.put(`/v1/customer/edit/${id}`, data)
    return response.data
  },
  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/v1/customer/delete/${id}`)
    return response.data
  },
}

// Admin/Users API
export const adminApi = {
  getUsers: async (params?: { page: number; limit: number; search: string }) => {
    const response = await api.get(`/v1/users/list`, {params})
    return response.data
  },
  createUser: async (userData: any) => {
    const response = await api.post("/v1/admin/create-admin", userData)
    return response.data
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/v1/users/edit/${id}`, data)
    return response.data
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/v1/users/delete/${id}`)
    return response.data
  },
}

// Currency API
export const currencyApi = {
  getCurrencies: async () => {
    const response = await api.get("/v1/currency/list")
    return response.data
  },
  updateCurrency: async (id:string, data: { hkdToMop: number; hkdToCny: number }) => {
    const response = await api.put(`/v1/currency/edit/${id}`, data)
    return response.data
  },
}

// Cash API
export const cashApi = {
  getCashList: async (params?: { page: number; limit: number; search: string}) => {
    const response = await api.get("/v1/cash/list", { params })
    return response.data
  },
  createCash: async (data: any) => {
    const response = await api.post("/v1/cash/create", data)
    return response.data
  },
  updateCash: async (id: string, data: any) => {
    const response = await api.put(`/v1/cash/edit/${id}`, data)
    return response.data
  },
  deleteCash: async (id: string) => {
    const response = await api.delete(`/v1/cash/delete/${id}`)
    return response.data
  },
}

// MIS API
export const misApi = {
  generateReport: async (params: { type: string; fromDate: string; toDate: string; customerId?: string }) => {
    const response = await api.get("/v1/mis/generate-mis-report", { params })
    return response.data
  },
}

// Expected Payment API
export const expectedPaymentApi = {
  saveExpectedPayment: async (id: string, data: any) => {
    const response = await api.put(`/v1/invoice/edit/${id}`, data)
    return response.data
  },
}

// Invoice API
export const invoiceApi = {
  getInvoices: async (params?: { search:string; page: number; limit: number }) => {
    const response = await api.get("/v1/invoice/list", { params })
    return response.data
  },
  getInvoice: async (id: string) => {
    const response = await api.get(`/v1/invoice/${id}`)
    return response.data
  },
  createInvoice: async (data: any) => {
    const response = await api.post("/v1/invoice/create", data)
    return response.data
  },
  updateInvoice: async (id: string, data: any) => {
    const response = await api.put(`/v1/invoice/edit/${id}`, data)
    return response.data
  },
  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/v1/invoice/delete/${id}`)
    return response.data
  },
  getPaymentStatus: async (id: string) => {
    const response = await api.get(`/v1/invoice/${id}/payment-status`)
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  getFinancialSummary: async () => {
    const response = await api.get("/v1/dashboard")
    return response.data
  },
}
