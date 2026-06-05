import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { MonthlyReportPage } from "./pages/MonthlyReport";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/relatorio" element={<MonthlyReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
