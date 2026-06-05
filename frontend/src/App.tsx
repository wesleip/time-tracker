import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { MonthlyReportPage } from "./pages/MonthlyReport";
import { WeeklyReportPage } from "./pages/WeeklyReport";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
