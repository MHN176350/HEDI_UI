import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, ArrowLeft, CheckCircle2, HeartPulse, Loader2, AlertCircle } from "lucide-react";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";
import Cookies from 'js-cookie';

const formatName = (name) => {
  return name.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const getMetricImage = (metricName) => {
  const images = {
    BLOOD_SUGAR: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=60",
    BLOOD_PRESSURE_SYSTOLIC: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&auto=format&fit=crop&q=60",
    BLOOD_PRESSURE_DIASTOLIC: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
    HEART_RATE: "https://images.unsplash.com/photo-1505503693641-1926193e8d57?w=500&auto=format&fit=crop&q=60",
    SpO2_LEVEL: "https://images.unsplash.com/photo-1584308666744-24d59b298b17?w=500&auto=format&fit=crop&q=60"
  };
  return images[metricName] || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=60";
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const userId = Cookies.get("userId");

  const { execute: fetchMetrics, loading: loadingMetrics } = useApi(apiService.getMetrics);
  const { execute: saveThresholds, loading: isSaving, error: saveError } = useApi(apiService.saveThresholds);

  useEffect(() => {
    // Load metrics on mount
    const loadData = async () => {
      try {
        const res = await fetchMetrics();
        if (res?.status === "SUCCESS") {
          setAvailableMetrics(res.data);
        }
      } catch (err) {
        console.error("Failed to load metrics", err);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => 
      prev.some(m => m.id === metric.id) 
        ? prev.filter(m => m.id !== metric.id)
        : [...prev, metric]
    );
  };

  const handleInputChange = (metricId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = selectedMetrics.map(metric => ({
      metricId: metric.id,
      minValue: parseFloat(formData[metric.id]?.min || 0),
      maxValue: parseFloat(formData[metric.id]?.max || 0)
    }));

    try {
      
      const res = await saveThresholds(userId, payload);
      
      if (res?.status === "SUCCESS") {
        navigate("/dashboard");
      }
    } catch (err) {
      console.log("Threshold save failed", err);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Dynamic Header with Progress Bar */}
        <div className="bg-[#4f9d69] p-6 text-white text-center shrink-0 shadow-md z-10 relative">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">HEDI Setup</h1>
          
          <div className="flex justify-center items-center gap-2 max-w-xs mx-auto">
            <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
          </div>
        </div>

        {/* Scrollable Body Section */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-center relative">
          
          {/* Global Save Error Banner */}
          {saveError && (
            <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-2 z-20">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-lg mx-auto py-8">
              <HeartPulse className="w-20 h-20 text-[#4f9d69] mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Health Diary</h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Before we take you to your dashboard, let's personalize your experience. You'll choose the health metrics you want to track and define your healthy baseline limits.
              </p>
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="px-10 py-4 bg-[#4f9d69] text-white font-bold rounded-full hover:bg-[#3f7d54] flex justify-center items-center gap-2 transition-all hover:gap-4 shadow-lg mx-auto w-full sm:w-auto"
              >
                Let's Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: SELECT METRICS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">What would you like to track?</h2>
                <p className="text-gray-500">Select the health metrics you want to monitor daily.</p>
              </div>
              
              {loadingMetrics ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-[#4f9d69] animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Loading available metrics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {availableMetrics.map((metric) => {
                    const isSelected = selectedMetrics.some(m => m.id === metric.id);
                    return (
                      <div 
                        key={metric.id}
                        onClick={() => toggleMetric(metric)}
                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-4 ${
                          isSelected ? 'border-[#4f9d69] shadow-md shadow-[#4f9d69]/20' : 'border-transparent shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className={`absolute top-3 right-3 z-10 transition-transform duration-300 ${isSelected ? 'scale-100' : 'scale-0'}`}>
                          <div className="bg-white rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-[#4f9d69]" fill="white" />
                          </div>
                        </div>

                        <div className="h-32 w-full overflow-hidden">
                          <img 
                            src={getMetricImage(metric.name)} 
                            alt={metric.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110 opacity-90' : 'group-hover:scale-105'}`}
                          />
                        </div>

                        <div className={`p-4 transition-colors duration-300 ${isSelected ? 'bg-[#bcffdb]/20' : 'bg-white'}`}>
                          <h3 className={`font-bold text-base mb-1 ${isSelected ? 'text-[#4f9d69]' : 'text-gray-800'}`}>
                            {formatName(metric.name)}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {metric.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedMetrics.length === 0 || loadingMetrics}
                  className="px-10 py-3 bg-[#4f9d69] text-white font-bold rounded-full hover:bg-[#3f7d54] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DEFINE THRESHOLDS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Your Health Limits</h2>
                <p className="text-gray-500">Define your healthy minimum and maximum limits for your chosen metrics.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-8">
                  {availableMetrics.filter(m => selectedMetrics.some(sm => sm.id === m.id)).map(metric => (
                    <div key={metric.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
                      
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 hidden sm:block shadow-sm border border-gray-200">
                         <img src={getMetricImage(metric.name)} alt="" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-gray-800 font-bold mb-1">
                          {formatName(metric.name)}
                        </label>
                        <p className="text-xs text-gray-500">{metric.description}</p>
                      </div>
                      
                      <div className="flex gap-2 shrink-0 sm:w-56 mt-2 sm:mt-0">
                        <div className="relative flex-1 group">
                          <span className="absolute -top-5 left-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider group-focus-within:text-[#4f9d69] transition-colors">Min</span>
                          <input
                            type="number"
                            step="0.1"
                            onChange={(e) => handleInputChange(metric.id, 'min', e.target.value)}
                            placeholder="0.0"
                            disabled={isSaving}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4f9d69] focus:ring-4 focus:ring-[#4f9d69]/10 font-mono transition-all text-sm disabled:opacity-50"
                            required
                          />
                        </div>
                        <div className="relative flex-1 group">
                          <span className="absolute -top-5 left-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider group-focus-within:text-[#4f9d69] transition-colors">Max</span>
                          <input
                            type="number"
                            step="0.1"
                            onChange={(e) => handleInputChange(metric.id, 'max', e.target.value)}
                            placeholder="0.0"
                            disabled={isSaving}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4f9d69] focus:ring-4 focus:ring-[#4f9d69]/10 font-mono transition-all text-sm disabled:opacity-50"
                            required
                          />
                        </div>
                        <div className="flex items-center pl-1 shrink-0 w-8">
                          <span className="text-gray-400 font-bold text-xs">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={isSaving}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5" /> Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-[#4f9d69] text-white font-bold rounded-full hover:bg-[#3f7d54] shadow-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-75"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Limits...
                      </>
                    ) : (
                      <>
                        Finish Setup <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}