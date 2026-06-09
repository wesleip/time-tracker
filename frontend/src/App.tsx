import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { AdminRoute } from "./components/ui/AdminRoute";
import { Dashboard } from "./pages/Dashboard";
import { TimeLog } from "./pages/TimeLog";
import { Projects } from "./pages/Projects";
import { MonthlyReportPage } from "./pages/MonthlyReport";
import { WeeklyReportPage } from "./pages/WeeklyReport";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminTimeLogs } from "./pages/admin/AdminTimeLogs";
import { AdminProjects } from "./pages/admin/AdminProjects";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar"
            element={
              <ProtectedRoute>
                <TimeLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projetos"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorio"
            element={
              <ProtectedRoute>
                <MonthlyReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semana"
            element={
              <ProtectedRoute>
                <WeeklyReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="timelogs" element={<AdminTimeLogs />} />
            <Route path="projetos" element={<AdminProjects />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
