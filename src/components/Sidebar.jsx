import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, Heart, Droplet, ShieldAlert, Thermometer, Wind, Settings, X, HelpCircle, ChevronUp, ChevronDown, BookOpen, MessageSquare, UserCircle } from "lucide-react";
import Cookies from "js-cookie";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";
import SettingsPopup from "./SettingPopup";

const formatMetric = (name) => {
  const formattedName = name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  let Icon = Activity;
  if (name.includes("HEART")) Icon = Heart;
  else if (name.includes("SUGAR")) Icon = Droplet;
  else if (name.includes("PRESSURE")) Icon = Activity;
  else if (name.includes("TEMPERATURE")) Icon = Thermometer;
  else if (name.includes("SpO2")) Icon = Wind;
  return { label: formattedName, Icon };
};

export default function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const [trackedMetrics, setTrackedMetrics] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const userId = Cookies.get("userId");
  
  const { execute: fetchThresholds } = useApi(apiService.getUserThresholds);
  const token = Cookies.get("token");
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.role === 'ADMIN';
    } catch(e) { console.error("Invalid token"); }
  }
  const loadSidebar = () => {
    fetchThresholds(userId).then(res => {
      if (res?.status === "SUCCESS") setTrackedMetrics(res.data);
    }).catch(err => console.error("Failed to load sidebar metrics"));
  };

  useEffect(() => {
    if (userId) loadSidebar();
  
  }, [userId]);


  useEffect(() => {
    const handleSetupComplete = () => {
      console.log("Onboarding complete! Re-fetching sidebar data...");
      if (userId) loadSidebar();
    };

    window.addEventListener("hediSetupComplete", handleSetupComplete);

    return () => {
      window.removeEventListener("hediSetupComplete", handleSetupComplete);
    };
  
  }, [userId]);

  const handleSettingsSaved = () => {
    window.location.href = "/dashboard";
  };

  return (
    <>
  
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={closeSidebar}
        />
      )}


      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 p-4 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:h-full md:translate-x-0 md:z-10
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          

          <div className="flex items-center justify-between mb-6 px-2 pt-2 md:pt-0 shrink-0">
            <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest">Main Menu</h2>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-[#4f9d69] hover:bg-gray-50 rounded-lg transition-colors group"
                title="Configuration Settings"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={closeSidebar}
                className="md:hidden p-2 text-gray-400 hover:text-[#4f9d69] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 pb-4">
            <Link
              to="/dashboard"
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === "/dashboard" 
                  ? "bg-[#e6fbf0] text-[#4f9d69] font-bold" 
                  : "text-gray-500 font-medium hover:bg-gray-50 hover:text-[#4f9d69]"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-2 ${
                  location.pathname === "/admin" 
                    ? "bg-red-50 text-red-600 font-bold" 
                    : "text-gray-500 font-medium hover:bg-gray-50 hover:text-red-500"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="mt-8 mb-3 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Tracked Metrics
            </div>

            <div className="flex flex-col gap-1">
              <Link
                to="/metric/BMI"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === "/metric/BMI" 
                    ? "bg-[#e6fbf0] text-[#4f9d69] font-bold" 
                    : "text-gray-500 font-medium hover:bg-gray-50 hover:text-[#4f9d69]"
                }`}
              >
                <UserCircle className="w-5 h-5" />
                <span>BMI Tracker</span>
              </Link>

   
              {trackedMetrics.map((threshold) => {
                if (threshold.metricName === "BMI") return null; 

                const { label, Icon } = formatMetric(threshold.metricName);
                const path = `/metric/${threshold.metricName}`;
                const isActive = location.pathname === path;

                return (
                  <Link
                    key={threshold.id}
                    to={path}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-[#e6fbf0] text-[#4f9d69] font-bold" 
                        : "text-gray-500 font-medium hover:bg-gray-50 hover:text-[#4f9d69]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="shrink-0 border-t border-gray-100 pt-4 mt-2">
            <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="w-full flex items-center justify-between text-gray-500 hover:text-[#4f9d69] transition-colors px-2 py-1 rounded-lg focus:outline-none"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <HelpCircle className="w-5 h-5" />
                <span>Help & Support</span>
              </div>
              {isHelpOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isHelpOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="flex flex-col gap-1 px-2 pb-2">
                <a href="#guide" className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-[#4f9d69] hover:bg-gray-50 p-2.5 rounded-xl transition-colors">
                  <BookOpen className="w-4 h-4" />
                  <span>User Guide</span>
                </a>
                <a href="#feedback" className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-[#4f9d69] hover:bg-gray-50 p-2.5 rounded-xl transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Feedback</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isSettingsOpen && (
        <SettingsPopup 
          onClose={() => setIsSettingsOpen(false)} 
          onSaved={handleSettingsSaved} 
        />
      )}
    </>
  );
}