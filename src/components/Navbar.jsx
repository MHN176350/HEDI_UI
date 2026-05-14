import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Activity, LogOut, User, ChevronDown } from "lucide-react";
import Cookies from 'js-cookie';
import { authService } from "../services/authService";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // NEW STATE
  const [notifications, setNotifications] = useState([]);
  
  const userName = Cookies.get("userName") || "My Account";
  const userId = Cookies.get("userId");

  const { execute: fetchNotifications } = useApi(apiService.getNotifications);
  const { execute: markAsRead } = useApi(apiService.markNotificationsRead);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications(userId);
      if (res?.status === "SUCCESS") {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(userId);
      loadNotifications(); 
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const handleLogout = async () => {
    if (userId) {
      try { await authService.logout(userId); } catch (err) { }
    }
    Cookies.remove("token");
    Cookies.remove("userId");
    Cookies.remove("userName");
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="w-full bg-[#4f9d69] text-white px-4 sm:px-6 py-4 z-40 relative shadow-lg">
      <div className="max-w-full mx-auto flex items-center justify-between">
        
        {/* Left Side: Mobile Toggle & Branding */}
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-[#2d6a4f] rounded-lg transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Activity className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-semibold tracking-wide">HEDI</span>
          </Link>
        </div>

        {/* Right Side: Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-5">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false); // Close other menu if open
              }}
              className={`relative p-2 rounded-lg transition-colors focus:outline-none ${isNotificationsOpen ? 'bg-[#2d6a4f]' : 'hover:bg-[#2d6a4f]'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 border-2 border-[#4f9d69] rounded-full"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800 z-50 animate-slideDown">
                  
                  <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center backdrop-blur-xl">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-[#4f9d69] bg-[#bcffdb]/50 px-2 py-1 rounded-full uppercase tracking-wider">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">You're all caught up!</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 transition-colors cursor-pointer flex gap-3 ${notif.read ? 'hover:bg-gray-50 opacity-70' : notif.type === 'WARNING' || notif.type === 'ALERT' ? 'hover:bg-red-50/50 bg-red-50/20' : 'hover:bg-blue-50/50 bg-blue-50/10'}`}>
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 shadow-sm ${notif.read ? 'bg-gray-300' : notif.type === 'WARNING' || notif.type === 'ALERT' ? 'bg-red-500 shadow-red-200' : 'bg-blue-500 shadow-blue-200'}`}></div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {notif.type === 'WARNING' || notif.type === 'ALERT' ? 'Alert' : 'Update'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <div className="p-3 border-t border-gray-100 text-center bg-gray-50/80 backdrop-blur-xl">
                      <button onClick={handleMarkAsRead} className="text-xs font-bold text-[#4f9d69] hover:text-[#2d6a4f] transition-colors">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-[#bcffdb]/40 hidden sm:block"></div>

          <div className="relative">
            <button 
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotificationsOpen(false); 
              }}
              className={`flex items-center gap-2 font-medium p-1.5 rounded-xl transition-colors focus:outline-none ${isUserMenuOpen ? 'bg-[#2d6a4f]' : 'hover:bg-[#2d6a4f]'}`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="hidden sm:inline-block text-sm sm:text-base pl-1">{userName}</span>
              <ChevronDown className={`w-4 h-4 hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800 z-50 animate-slideDown">
                  
          
                  <div className="p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="font-bold text-gray-800 truncate">{userName}</p>
                  </div>
                  
    
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}