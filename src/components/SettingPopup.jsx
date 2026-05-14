import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Settings, Loader2, Save, Activity, Heart, Droplet, Thermometer, Wind, CheckCircle2, X } from "lucide-react";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

const formatName = (name) => name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

// We keep this as a fallback just in case an image fails to load
const getMetricIcon = (name) => {
  const upper = name.toUpperCase();
  if (upper.includes("HEART")) return Heart;
  if (upper.includes("SUGAR")) return Droplet;
  if (upper.includes("TEMPERATURE")) return Thermometer;
  if (upper.includes("SPO2")) return Wind;
  return Activity;
};

export default function SettingsPopup({ onClose, onSaved }) {
  const userId = Cookies.get("userId");
  
  const [localConfig, setLocalConfig] = useState({});
  const [metricsList, setMetricsList] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const { execute: fetchAllMetrics, loading: loadingMetrics } = useApi(apiService.getMetrics);
  const { execute: fetchUserThresholds, loading: loadingThresholds } = useApi(apiService.getUserThresholds);
  const { execute: updateSettings, loading: isSaving } = useApi(apiService.updateThresholdSettings);

  useEffect(() => {
    loadSettingsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadSettingsData = async () => {
    try {
      const [sysMetricsRes, userThreshRes] = await Promise.all([
        fetchAllMetrics(),
        fetchUserThresholds(userId)
      ]);

      if (sysMetricsRes?.status === "SUCCESS") {
        setMetricsList(sysMetricsRes.data);
        
        const configMap = {};
        sysMetricsRes.data.forEach(m => {
          if (m.name === "BMI") return; 
          configMap[m.id] = { metricId: m.id, isActive: false, min: 0, max: 0 };
        });

        if (userThreshRes?.status === "SUCCESS") {
          userThreshRes.data.forEach(t => {
            if (configMap[t.metricId]) {
              configMap[t.metricId].isActive = true;
              configMap[t.metricId].min = t.minValue;
              configMap[t.metricId].max = t.maxValue;
            }
          });
        }
        setLocalConfig(configMap);
      }
    } catch (err) {
      console.error("Failed to load settings data", err);
    }
  };

  const handleToggle = (metricId) => {
    setLocalConfig(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], isActive: !prev[metricId].isActive }
    }));
  };

  const handleSave = async () => {
    setSuccessMsg("");
    const payload = Object.values(localConfig).map(config => ({
      metricId: config.metricId,
      isActive: config.isActive,
      // Values are passed as 0 because the backend natively handles WHO limits now
      minValue: 0,
      maxValue: 0
    }));

    try {
      const res = await updateSettings(userId, payload);
      if (res?.status === "SUCCESS") {
        setSuccessMsg("Settings saved successfully!");
        setTimeout(() => {
          onClose(); 
          if (onSaved) onSaved(); 
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-[#4f9d69] p-6 text-white shrink-0 shadow-md z-10 relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Metric Settings</h1>
              {/* NEW: WHO Disclaimer */}
              <p className="text-[#bcffdb] text-sm font-medium mt-0.5 max-w-sm">
                Toggle tracking below. Our system automatically applies global World Health Organization (WHO) standards to evaluate your data.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors self-start">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
          
          {loadingMetrics || loadingThresholds ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-10 h-10 text-[#4f9d69] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading settings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metricsList.map(metric => {
                const config = localConfig[metric.id];
                if (!config) return null;

                const IconComponent = getMetricIcon(metric.name);
                const isActive = config.isActive;

                return (
                  <div 
                    key={metric.id} 
                    onClick={() => handleToggle(metric.id)}
                    className="p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white flex justify-between items-center"
                    // DYNAMIC BORDER & BACKGROUND
                    style={{ 
                      borderColor: isActive ? `${metric.themeColor}50` : '#f3f4f6', // 50 is hex for ~30% opacity
                      backgroundColor: isActive ? `${metric.themeColor}08` : '#ffffff', // 08 is hex for ~5% opacity (very soft tint)
                      boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-1.5 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center transition-all duration-300"
                        style={{ 
                          backgroundColor: isActive ? metric.themeColor : '#f3f4f6',
                          opacity: isActive ? 1 : 0.6
                        }}
                      >
                        {metric.imgUrl ? (
                          <img 
                            src={metric.imgUrl} 
                            alt={metric.name} 
                            className="w-8 h-8 object-cover rounded-lg"
                          />
                        ) : (
                          <Activity className="w-6 h-6 text-white m-1" /> 
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: isActive ? '#1f2937' : '#9ca3af' }}>
                          {formatName(metric.name)}
                        </h3>
                      </div>
                    </div>
                    
                    {/* DYNAMIC TOGGLE SWITCH */}
                    <div 
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
                      style={{ backgroundColor: isActive ? metric.themeColor : '#d1d5db' }}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            {successMsg && (
              <span className="flex items-center justify-center gap-2 text-[#4f9d69] font-bold bg-[#bcffdb]/50 px-4 py-2 rounded-full animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5" /> {successMsg}
              </span>
            )}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-8 py-3 bg-[#4f9d69] text-white rounded-xl hover:bg-[#3f7d54] shadow-lg transition-all font-bold flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}