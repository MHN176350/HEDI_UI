import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Activity, LogOut } from "lucide-react";
import Cookies from 'js-cookie';
import { authService } from "../services/authService";
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
 const token = Cookies.get("token");
  const handleLogout = async () => {
    debugger;
    const userId = Cookies.get("userId");
    
    if (userId) {
      try {
        await authService.logout(userId);
      } catch (err) {
        console.error("Backend logout failed", err);
      }
    }
    
    Cookies.remove("token");
    Cookies.remove("userId");
    
    navigate("/login");
  };

  return (
    <nav className="w-full bg-[#4f9d69] text-white px-6 py-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Activity className="w-8 h-8" />
          <span className="text-xl font-semibold">HEDI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/' ? 'text-[#bcffdb] font-semibold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/dashboard' ? 'text-[#bcffdb] font-semibold' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/metrics"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/metrics' ? 'text-[#bcffdb] font-semibold' : ''}`}
          >
            Metrics
          </Link>
          <Link
            to="/heart-rate"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/heart-rate' ? 'text-[#bcffdb] font-semibold' : ''}`}
          >
            Heart Rate
          </Link>
          
          <div className="flex items-center gap-4 pl-4 border-l border-[#bcffdb]">
            <button className="relative p-2 hover:bg-[#2d6a4f] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-[#2d6a4f] px-3 py-2 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
