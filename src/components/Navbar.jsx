import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Import Menu icon
import { Bell, Activity, LogOut, User, Menu } from "lucide-react";
import Cookies from 'js-cookie';
import { authService } from "../services/authService";

// Accept toggleSidebar as a prop
export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userName = Cookies.get("userName") || "My Account";

  const handleLogout = async () => {
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
    Cookies.remove("userName");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-[#4f9d69] text-white px-4 sm:px-6 py-4 sticky top-0 z-40 shadow-lg">
      <div className="max-w-full mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          {/* Hamburger button visible only on mobile */}
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-1 hover:bg-[#2d6a4f] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Activity className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-semibold tracking-wide">HEDI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 font-medium cursor-pointer hover:text-[#bcffdb] transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="hidden sm:inline-block text-sm sm:text-base">{userName}</span>
          </div>

          <div className="h-6 w-px bg-[#bcffdb]/40 hidden sm:block"></div>

          <div className="flex items-center gap-1 sm:gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-lg transition-colors focus:outline-none ${isNotificationsOpen ? 'bg-[#2d6a4f]' : 'hover:bg-[#2d6a4f]'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 border-2 border-[#4f9d69] rounded-full"></span>
              </button>

  
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-[#2d6a4f] p-2 sm:px-3 sm:py-2 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline-block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}