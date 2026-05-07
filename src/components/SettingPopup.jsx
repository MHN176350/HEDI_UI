import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Settings, Loader2, Save, Activity, CheckCircle2, X } from "lucide-react";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

const formatName = (name) => name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export default function SettingsPopup({ onClose, onSaved }) {
  const userId = Cookies.get("userId");
  
  const [localConfig, setLocalConfig] = useState({});
  const [metricsList, setMetricsList] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const { execute: fetchAllMetrics, loading: loadingMetrics } = useApi(apiService.getMetrics);
  const { execute: fetchUserThresholds, loading: loadingThresholds } = useApi(apiService.getUserThresholds);
  const { execute: updateSettings, loading: isSaving } = useApi(apiService.updateThresholdSettings);
  const getDefaultThresholds = (metricName) => {
  if (metricName.includes("HEART")) return { min: 60, max: 100 };
  if (metricName.includes("SUGAR")) return { min: 70, max: 100 }; 
  if (metricName.includes("SYSTOLIC")) return { min: 90, max: 120 };
  if (metricName.includes("DIASTOLIC")) return { min: 60, max: 80 };
  if (metricName.includes("TEMPERATURE")) return { min: 97.0, max: 99.0 };
  if (metricName.includes("SpO2")) return { min: 95, max: 100 };
  return { min: 0, max: 100 }; 
};
  useEffect(() => {
    loadSettingsData();
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
        const defaults = getDefaultThresholds(m.name);
        configMap[m.id] = { metricId: m.id, isActive: false, min: defaults.min, max: defaults.max };
        });
        if (userThreshRes?.status === "SUCCESS") {
          userThreshRes.data.forEach(t => {
            configMap[t.metricId] = {
              metricId: t.metricId,
              isActive: true,
              min: t.minValue,
              max: t.maxValue
            };
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

  const handleChange = (metricId, field, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSuccessMsg("");
    const payload = Object.values(localConfig).map(config => ({
      metricId: config.metricId,
      isActive: config.isActive,
      minValue: parseFloat(config.min) || 0,
      maxValue: parseFloat(config.max) || 0
    }));

    try {
      const res = await updateSettings(userId, payload);
      if (res?.status === "SUCCESS") {
        setSuccessMsg("Settings saved successfully!");
        setTimeout(() => {
          onClose(); // Close the modal
          if (onSaved) onSaved(); // Trigger parent refresh
        }, 1500);
      }
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-[#4f9d69] p-6 text-white shrink-0 shadow-md z-10 relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Metric Settings</h1>
              <p className="text-[#bcffdb] text-sm">Manage your tracked health limits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
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
            <div className="space-y-6">
              {metricsList.map(metric => {
                const config = localConfig[metric.id];
                if (!config) return null;

                return (
                  <div key={metric.id} className={`p-6 rounded-2xl border-2 transition-all duration-300 bg-white ${config.isActive ? 'border-[#4f9d69]/30 shadow-md' : 'border-gray-100 opacity-60'}`}>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <Activity className={`w-6 h-6 ${config.isActive ? 'text-[#4f9d69]' : 'text-gray-400'}`} />
                        <div>
                          <h3 className={`font-bold text-lg ${config.isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                            {formatName(metric.name)}
                          </h3>
                          <p className="text-xs text-gray-500">{metric.description}</p>
                        </div>
                      </div>
                      
                      {/* Custom Toggle Switch */}
                      <button 
                        onClick={() => handleToggle(metric.id)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${config.isActive ? 'bg-[#4f9d69]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-300 ${config.isActive ? 'translate-x-8' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${config.isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Min Limit ({metric.unit})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={config.min}
                          onChange={(e) => handleChange(metric.id, 'min', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-colors"
                          disabled={!config.isActive}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Max Limit ({metric.unit})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={config.max}
                          onChange={(e) => handleChange(metric.id, 'max', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-colors"
                          disabled={!config.isActive}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between">
          <div>
            {successMsg && (
              <span className="flex items-center gap-2 text-[#4f9d69] font-bold bg-[#bcffdb]/50 px-4 py-2 rounded-full animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5" /> {successMsg}
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-[#4f9d69] text-white rounded-xl hover:bg-[#3f7d54] shadow-lg transition-all font-bold flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}