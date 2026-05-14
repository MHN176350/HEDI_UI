import { useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MetricDetailPage from "./pages/MetricDetailPage";
import AdminPage from "./pages/AdminDashboardPage";

function AppContent() {
  const location = useLocation();
  const token = Cookies.get("token");
  const isPublicPage = ["/", "/login", "/register"].includes(location.pathname);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      </Routes>
    );
  }

 
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
  
      <div className="shrink-0 z-30 relative shadow-md">
        <Navbar toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      </div>

  
      <div className="flex flex-1 overflow-hidden relative">
        
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          closeSidebar={() => setIsMobileSidebarOpen(false)} 
        />
        
        <main className="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-[#f0fdf4] via-[#e6fbf0] to-[#bcffdb]/40">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/metric/:metricName" element={<MetricDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}