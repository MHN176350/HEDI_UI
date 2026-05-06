import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, Heart, Droplet, Thermometer, Wind, Settings, X } from "lucide-react";
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
  const userId = Cookies.get("userId");
  
  const { execute: fetchThresholds } = useApi(apiService.getUserThresholds);

  useEffect(() => {
    if (userId) loadSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadSidebar = () => {
    fetchThresholds(userId).then(res => {
      if (res?.status === "SUCCESS") setTrackedMetrics(res.data);
    }).catch(err => console.error("Failed to load sidebar metrics"));
  };

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
       className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#bee6ce] to-[#a8dfc5] p-4 shadow-2xl transition-transform duration-300 ease-in-out 
        md:relative md:h-full md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] md:translate-x-0 md:z-10
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          <div className="flex items-center justify-between mb-6 px-2 pt-2 md:pt-0 shrink-0">
            <h2 className="text-[#4f9d69] font-bold text-lg tracking-wide">Menu</h2>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-[#bcffdb] rounded-lg transition-colors group"
                title="Configuration Settings"
              >
                <Settings className="w-5 h-5 text-[#4f9d69] group-hover:rotate-90 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={closeSidebar}
                className="md:hidden p-2 hover:bg-[#bcffdb] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#4f9d69]" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 pb-6">
            <Link
              to="/dashboard"
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === "/dashboard" 
                  ? "bg-[#4f9d69] text-white shadow-md" 
                  : "text-[#4f9d69] font-medium hover:bg-[#bcffdb]"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <div className="mt-6 mb-3 px-2 text-[11px] font-bold text-[#4f9d69]/70 uppercase tracking-widest">
              Tracked Metrics
            </div>

            <div className="flex flex-col gap-1">
              {trackedMetrics.map((threshold) => {
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
                        ? "bg-[#4f9d69] text-white shadow-md" 
                        : "text-[#4f9d69] font-medium hover:bg-[#bcffdb]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
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