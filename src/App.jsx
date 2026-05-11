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

function AppContent() {
  const location = useLocation();
  const token = Cookies.get("token");
  const isPublicPage = ["/", "/login", "/register"].includes(location.pathname);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If it's a public page (Landing, Login), just render it normally
  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      </Routes>
    );
  }

  // --- APP SHELL LAYOUT FOR DASHBOARD ---
  // Locks to 100vh. Navbar takes top space, bottom area splits into Sidebar and scrollable content.
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
      {/* Navbar sits at the top (shrink-0 ensures it never gets squished) */}
      <div className="shrink-0 z-30 relative shadow-md">
        <Navbar toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      </div>

      {/* The remaining space is a flex row that hides outer overflow */}
      <div className="flex flex-1 overflow-hidden relative">
        
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          closeSidebar={() => setIsMobileSidebarOpen(false)} 
        />
        
        {/* Main Content Area: flex-1 takes remaining width, min-w-0 stops charts from breaking, overflow-y-auto lets it scroll! */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-[#f0fdf4] via-[#e6fbf0] to-[#bcffdb]/40">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/metric/:metricName" element={<MetricDetailPage />} />
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