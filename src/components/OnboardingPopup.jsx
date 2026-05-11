import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Activity, ArrowRight, Scale, Ruler, CalendarDays, Loader2, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

const formatName = (name) => name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export default function OnboardingOverlay({ onComplete }) {
  const userId = Cookies.get("userId");
  const [step, setStep] = useState(1);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [errorMsg, setErrorMsg] = useState(""); 
  const [availableMetrics, setAvailableMetrics] = useState([]);
  
  
  const [profile, setProfile] = useState({
    age: "",
    gender: "male",
    height: 170,
    weight: ""
  });

  const { execute: fetchMetrics, loading: loadingMetrics } = useApi(apiService.getMetrics);
  const { execute: saveThresholds } = useApi(apiService.saveThresholds);
  const { execute: updateProfile } = useApi(apiService.updateUserProfile);
  const { execute: saveRecord } = useApi(apiService.saveRecord);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch metrics dynamically on mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await fetchMetrics();
        const metricsList = Array.isArray(res) ? res : (res?.data || []);
        // Filter out BMI (permanently active in background)
        setAvailableMetrics(metricsList.filter(m => m.name !== 'BMI'));
      } catch (err) {
        console.error("Failed to fetch system metrics", err);
        setErrorMsg("Failed to load metrics from the server.");
      }
    };
    loadMetrics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => 
      prev.some(m => m.id === metric.id) ? prev.filter(m => m.id !== metric.id) : [...prev, metric]
    );
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    setErrorMsg("");

    try {
      await updateProfile(userId, {
        age: parseInt(profile.age),
        gender: profile.gender,
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight)
      });

      const heightInMeters = parseFloat(profile.height) / 100;
      const weightInKg = parseFloat(profile.weight);
      const initialBmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);

      await saveRecord(userId, {
        metricType: "BMI",
        metricValue: parseFloat(initialBmi)
      });

    
      if (selectedMetrics.length > 0) {
        const thresholdDataArray = selectedMetrics.map(m => {
          return {
            metricId: m.id,
            minValue: 0, 
            maxValue: 0
          };
        });
        await saveThresholds(userId, thresholdDataArray);
      }

      window.dispatchEvent(new Event("hediSetupComplete"));

      onComplete();
    } catch (error) {
      console.error("Setup Error:", error);
      setErrorMsg("Failed to save setup. Please check your connection and try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex bg-gray-100 h-1.5">
          <div className={`h-full bg-[#4f9d69] transition-all duration-700 ease-out ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar relative flex-1">
          
          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-[#e6fbf0] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Sparkles className="w-10 h-10 text-[#4f9d69]" />
              </div>
              <h1 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">Welcome to HEDI</h1>
              <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Your intelligent health assistant. Let's take 60 seconds to personalize your medical baselines so we can provide accurate, actionable insights.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[#4f9d69] text-white rounded-2xl font-bold text-lg hover:bg-[#3f7d54] hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Let's Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: PROFILE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Biometric Profile</h2>
                <p className="text-gray-500 text-sm">We use this to calculate your optimal health ranges.</p>
              </div>

              <div className="space-y-6 max-w-lg mx-auto">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">Biological Sex</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#4f9d69] has-[:checked]:bg-[#e6fbf0]">
                      <input type="radio" name="gender" value="male" checked={profile.gender === "male"} onChange={(e) => setProfile({...profile, gender: e.target.value})} className="hidden" />
                      <span className="font-bold text-gray-700">Male</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#4f9d69] has-[:checked]:bg-[#e6fbf0]">
                      <input type="radio" name="gender" value="female" checked={profile.gender === "female"} onChange={(e) => setProfile({...profile, gender: e.target.value})} className="hidden" />
                      <span className="font-bold text-gray-700">Female</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><CalendarDays className="w-4 h-4" /> Age</label>
                    <input type="number" placeholder="Years" value={profile.age} onChange={(e) => setProfile({...profile, age: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#4f9d69] outline-none font-bold text-gray-700" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><Scale className="w-4 h-4" /> Weight (kg)</label>
                    <input type="number" placeholder="kg" value={profile.weight} onChange={(e) => setProfile({...profile, weight: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#4f9d69] outline-none font-bold text-gray-700" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase"><Ruler className="w-4 h-4" /> Height</label>
                    <span className="font-bold text-[#4f9d69] text-xl">{profile.height} cm</span>
                  </div>
                  <input type="range" min="100" max="220" value={profile.height} onChange={(e) => setProfile({...profile, height: e.target.value})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4f9d69]" />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Back</button>
                <button 
                  onClick={() => { 
                    setErrorMsg(""); 
                    if(!profile.age || !profile.weight) {
                      setErrorMsg("Please fill in all required fields (Age and Weight).");
                      return; 
                    }
                    setStep(3); 
                  }} 
                  className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors flex justify-center items-center gap-2"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: METRICS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">What will you track?</h2>
                <p className="text-gray-500 text-sm">Select the metrics you'll log regularly.</p>
              </div>

              {loadingMetrics ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4f9d69] mb-3" />
                  <p className="text-sm font-medium">Loading available metrics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {availableMetrics.map((metric) => {
                    const isSelected = selectedMetrics.some(m => m.id === metric.id);

                    return (
                      <button 
                        key={metric.id} 
                        onClick={() => toggleMetric(metric)} 
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left bg-white ${isSelected ? 'shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}
                        style={{ borderColor: isSelected ? metric.themeColor : '#f3f4f6' }}
                      >
                        {/* Dynamic Image / Icon Container */}
                        <div 
                          className="p-1 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center transition-all duration-300"
                          style={{ 
                            backgroundColor: isSelected ? metric.themeColor : '#f3f4f6',
                            opacity: isSelected ? 1 : 0.6,
                            width: '40px',
                            height: '40px'
                          }}
                        >
                          {metric.imgUrl ? (
                            <img 
                              src={metric.imgUrl} 
                              alt={metric.name} 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Activity className="w-5 h-5 text-white" /> 
                          )}
                        </div>
                        
                        {/* Dynamic Text Color */}
                        <span 
                          className="font-bold text-sm flex-1 truncate transition-colors duration-300"
                          style={{ color: isSelected ? metric.themeColor : '#4b5563' }}
                        >
                          {formatName(metric.name)}
                        </span>
                        
                        {isSelected && (
                          <CheckCircle2 
                            className="w-5 h-5 flex-shrink-0 animate-in zoom-in" 
                            style={{ color: metric.themeColor }} 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} disabled={isProcessing} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Back</button>
                <button onClick={handleFinish} disabled={isProcessing || selectedMetrics.length === 0} className="flex-1 py-4 bg-[#4f9d69] text-white rounded-xl font-bold hover:bg-[#3f7d54] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg">
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</> : "Finish Setup"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}