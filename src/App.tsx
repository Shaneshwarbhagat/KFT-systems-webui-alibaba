import { Routes, Route, Navigate } from "react-router-dom"
import { QueryProvider } from "./components/providers/query-provider"
import { AuthProvider } from "./components/providers/auth-provider"
import { ThemeProvider } from "./components/providers/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { ErrorBoundary } from "./components/error-boundary"

// Pages
import LoginPage from "./pages/auth/login"
// import ForgotPasswordPage from "./pages/auth/forgot-password"
import DashboardLayout from "./components/layout/dashboard-layout"
import DashboardPage from "./pages/dashboard/dashboard"
import InvoicesPage from "./pages/dashboard/invoices"
import OrdersPage from "./pages/dashboard/orders"
import CustomersPage from "./pages/dashboard/customers"
import CashPage from "./pages/dashboard/cash"
import AdminPage from "./pages/dashboard/admin"
import ExpectedPaymentsPage from "./pages/dashboard/expected-payments"
import ProtectedRoute from "./components/auth/protected-route"
import UserManagementPage from "./pages/dashboard/user-management"

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="kft-ui-theme">
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-roboto">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="user-management" element={<UserManagementPage />} />
                  <Route path="cash" element={<CashPage />} />
                  {/* <Route path="admin" element={<AdminPage />} /> */}
                  <Route path="expected-payments" element={<ExpectedPaymentsPage />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
