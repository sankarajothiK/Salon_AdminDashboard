import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SalonProvider } from './contexts/SalonContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { SalonsPage } from './pages/Salons/SalonsPage';
import { SalonDetailPage } from './pages/SalonDetail/SalonDetailPage';
import { CustomersPage } from './pages/Customers/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetail/CustomerDetailPage';
import { AppointmentsPage } from './pages/Appointments/AppointmentsPage';
import { ServicesPage } from './pages/Services/ServicesPage';
import { StaffPage } from './pages/Staff/StaffPage';
import { BillingPage } from './pages/Billing/BillingPage';
import { ExpensesPage } from './pages/Expenses/ExpensesPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { ActivityPage } from './pages/Activity/ActivityPage';
import { AlertsPage } from './pages/Alerts/AlertsPage';
import { AccountDeletionsPage } from './pages/AccountDeletions/AccountDeletionsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SalonProvider>
          <RealtimeProvider>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Application Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="salons" element={<SalonsPage />} />
                <Route path="salons/:id" element={<SalonDetailPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="account-deletions" element={<AccountDeletionsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </RealtimeProvider>
        </SalonProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
