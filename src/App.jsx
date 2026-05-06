// import { BrowserRouter, RouterProvider } from "react-router";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { router } from "./routes";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HealthMetricsPage from "./pages/HealthMetricsPage";
import HeartRatePage from "./pages/HeartRatePage";

export default function App() {
  return (
    <div >
      <BrowserRouter>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 mr-0 mb-0 ml-1 pt-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/metrics" element={<HealthMetricsPage />} />
              <Route path="/heart-rate" element={<HeartRatePage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}
