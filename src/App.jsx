import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HealthMetricsPage from "./pages/HealthMetricsPage";
import MetricDetailPage from "./pages/MetricDetailPage";
import OnboardingPage from "./pages/OnboardingPage";

function AppContent() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? "" : "flex"}>
        {!isAuthPage && <Sidebar />}
        <div className={isAuthPage ? "w-full" : "flex-1 mr-0 mb-0 ml-1 pt-0"}>
          <Routes>
           <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/metric/:metricName" element={<MetricDetailPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
