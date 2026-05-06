import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// 1. Swap Bell for Settings icon
import { Home, Activity, Heart, Droplet, Thermometer, Wind, Settings } from "lucide-react";
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

export default function Sidebar() {
  const location = useLocation();
  const [trackedMetrics, setTrackedMetrics] = useState([]);
  
  // 3. Add state for the popup
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const userId = Cookies.get("userId");
  
  const { execute: fetchThresholds } = useApi(apiService.getUserThresholds);

  useEffect(() => {
    if (userId) {
      loadSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadSidebar = () => {
    fetchThresholds(userId).then(res => {
      if (res?.status === "SUCCESS") {
        setTrackedMetrics(res.data);
      }
    }).catch(err => console.error("Failed to load sidebar metrics"));
  };

  const handleSettingsSaved = () => {
    // When settings save, the safest thing to do is route them back to the main 
    // dashboard and do a clean refresh so all charts/contexts reset properly.
    window.location.href = "/dashboard";
  };

  return (
    <>
      <aside className="w-64 bg-gradient-to-b from-[#bee6ce] to-[#a8dfc5] min-h-screen p-4 flex flex-col gap-2 shadow-lg">
        <div className="sticky top-16">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-[#4f9d69] font-bold text-lg">Menu</h2>
            
            {/* 4. Update the trigger button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="relative p-2 hover:bg-[#9cd4b8] rounded-lg transition-colors group"
              title="Configuration Settings"
            >
              <Settings className="w-5 h-5 text-[#4f9d69] group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === "/dashboard" ? "bg-[#4f9d69] text-white shadow-md" : "text-[#4f9d69] hover:bg-[#bcffdb]"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <div className="mt-4 mb-2 px-2 text-xs font-bold text-[#4f9d69]/70 uppercase tracking-wider">
            Your Tracked Metrics
          </div>

          {trackedMetrics.map((threshold) => {
            const { label, Icon } = formatMetric(threshold.metricName);
            const path = `/metric/${threshold.metricName}`;
            const isActive = location.pathname === path;

            return (
              <Link
                key={threshold.id}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? "bg-[#4f9d69] text-white shadow-md" : "text-[#4f9d69] hover:bg-[#bcffdb]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* 5. Render the Popup */}
      {isSettingsOpen && (
        <SettingsPopup 
          onClose={() => setIsSettingsOpen(false)} 
          onSaved={handleSettingsSaved} 
        />
      )}
    </>
  );
}