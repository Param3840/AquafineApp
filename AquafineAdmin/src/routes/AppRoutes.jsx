import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Import Views
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import OrdersPage from "../pages/OrdersPage";
import UsersPage from "../pages/UsersPage";
import PaymentsPage from "../pages/PaymentsPage";
import SettingsPage from "../pages/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Boundary */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Administrative Boundaries wrapped in premium DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <OrdersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
