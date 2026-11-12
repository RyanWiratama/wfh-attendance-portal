import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';
import {
  LoginPage,
  AttendancePage,
  AttendanceHistoryPage,
  EmployeesPage,
  AttendanceMonitoringPage,
  WorkSchedulePage,
} from '../pages';

// Public Route Guard (redirect to /attendance if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        Memuat sesi Portal...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/attendance" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Authenticated Routes (Both EMPLOYEE and ADMIN can access WFH Attendance & personal history) */}
        <Route element={<ProtectedRoute allowedRoles={[Role.EMPLOYEE, Role.ADMIN]} />}>
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/my-history" element={<AttendanceHistoryPage />} />
          {/* Alias for backward compatibility */}
          <Route path="/attendance/history" element={<Navigate to="/my-history" replace />} />
        </Route>

        {/* HR Admin Restricted Routes */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/monitoring" element={<AttendanceMonitoringPage />} />
          <Route path="/schedules" element={<WorkSchedulePage />} />

          {/* Aliases */}
          <Route path="/admin/employees" element={<Navigate to="/employees" replace />} />
          <Route path="/admin/attendances" element={<Navigate to="/monitoring" replace />} />
          <Route path="/admin/work-schedule" element={<Navigate to="/schedules" replace />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/attendance" replace />} />

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/attendance" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
