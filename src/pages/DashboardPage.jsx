import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { Activity, Heart, Droplet, Thermometer, Wind, TrendingUp, TrendingDown, Minus, Loader2, Scale, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";
import OnboardingPopup from "../components/OnboardingPopup"; 

const formatName = (name) => {
  if (name === "BMI") return "Body Mass Index";
  return name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const getMetricIcon = (name) => {
  if (name === "BMI") return Scale;
  if (name.includes("HEART")) return Heart;
  if (name.includes("SUGAR")) return Droplet;
  if (name.includes("TEMPERATURE")) return Thermometer;
  if (name.includes("SpO2")) return Wind;
  return Activity;
};

// NEW: Advanced tiered logic engine
const getHealthStatus = (value, min, max) => {
  if (value === null || value === undefined) return 'unknown';
  if (value >= min && value <= max) return 'normal';
  
  // Calculate percentage deviation from the nearest boundary
  let deviation = 0;
  if (value > max) {
    deviation = ((value - max) / max) * 100;
  } else if (value < min) {
    deviation = min === 0 ? 100 : ((min - value) / min) * 100;
  }

  return deviation <= 10 ? 'warning' : 'alert';
};

const getStatusBadge = (metricName, value, status) => {
  if (value === null) return null;
  if (metricName === "BMI") {
    if (value < 18.5) return { text: "Underweight (Warning)", styles: "bg-orange-100 text-orange-700" };
    if (value <= 24.9) return { text: "Healthy", styles: "bg-green-100 text-green-700" };
    if (value <= 29.9) return { text: "Overweight (Warning)", styles: "bg-orange-100 text-orange-700" };
    return { text: "Obese (Alert)", styles: "bg-red-100 text-red-700" };
  }
  
  if (status === 'normal') return { text: "Normal", styles: "bg-green-100 text-green-700" };
  if (status === 'warning') return { text: "Warning", styles: "bg-orange-100 text-orange-700" };
  return { text: "Alert", styles: "bg-red-100 text-red-700" };
};

const getInsightMessage = (metricName, stat) => {
  if (!stat || stat.latest === null) {
    return "Log your first reading today to unlock personalized health insights and track your progress!";
  }

  const name = formatName(metricName);

  if (stat.status === 'normal') {
    if (stat.trend === 'flat') {
      return `Outstanding! Your ${name} is perfectly stable and safely within your target limits.`;
    } else {
      return `Great job! Your ${name} is looking solid and stays within your optimal health range. Consistency is key!`;
    }
  } else if (stat.status === 'warning') {
    return `Notice: Your ${name} is slightly outside your target limits (within a 10% margin). Keep an eye on it and try to maintain a balanced routine today.`;
  } else {
    return `Medical Alert: Your ${name} has deviated significantly (>10%) from your healthy limits. Please take immediate action and consult a doctor if you feel unwell.`;
  }
};

export default function DashboardPage() {
  const userId = Cookies.get("userId");
  const userName = Cookies.get("userName") || "User";
  
  const [thresholds, setThresholds] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [mainMetric, setMainMetric] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState({}); 
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { execute: fetchThresholds, loading: loadingThresholds } = useApi(apiService.getUserThresholds);
  const { execute: fetchRecords, loading: loadingRecords } = useApi(apiService.getUserRecords);
  const { execute: fetchMetrics, loading: loadingMetrics } = useApi(apiService.getMetrics);

  useEffect(() => {
    if (userId) loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      const [threshRes, recordsRes, metricsRes] = await Promise.all([
        fetchThresholds(userId),
        fetchRecords(userId),
        fetchMetrics()
      ]);

      const metricsMap = {};
      const metricsList = Array.isArray(metricsRes) ? metricsRes : (metricsRes?.data || []);
      metricsList.forEach(m => { metricsMap[m.name] = m; });
      setSystemMetrics(metricsMap); 

      let activeThresholds = [];
      if (threshRes?.status === "SUCCESS") {
        activeThresholds = threshRes.data.map(t => {
          const def = metricsMap[t.metricName] || {};
          return {
            ...t,
            minValue: def.minLimit || 0,
            maxValue: def.maxLimit || 100,
            themeColor: def.themeColor || '#4f9d69',
            imgUrl: def.imgUrl
          };
        });
      }

      if (activeThresholds.length === 0) setShowOnboarding(true);

      const bmiDef = metricsMap['BMI'] || { minLimit: 18.5, maxLimit: 24.9, themeColor: '#22c55e' };
      activeThresholds.push({ 
        id: 'bmi-permanent', metricName: 'BMI', minValue: bmiDef.minLimit, maxValue: bmiDef.maxLimit, unit: '', themeColor: bmiDef.themeColor, imgUrl: bmiDef.imgUrl 
      });

      setThresholds(activeThresholds);
      
      if (activeThresholds.length > 0 && !mainMetric) {
        setMainMetric(activeThresholds[0].metricName);
      }
      
      if (recordsRes?.status === "SUCCESS") setAllRecords(recordsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  const processedData = useMemo(() => {
    const grouped = {};
    const stats = {};

    thresholds.forEach(t => {
      grouped[t.metricName] = [];
      stats[t.metricName] = { threshold: t, latest: null, previous: null, status: 'unknown', trend: 'flat' };
    });

    allRecords.forEach(record => {
      if (grouped[record.metricType]) {
        grouped[record.metricType].push({
          time: new Date(record.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          rawTime: new Date(record.recordedAt).getTime(),
          value: record.metricValue
        });
      }
    });

    Object.keys(grouped).forEach(key => {
      const data = grouped[key].sort((a, b) => a.rawTime - b.rawTime);
      grouped[key] = data;

      if (data.length > 0) {
        const latest = data[data.length - 1];
        const previous = data.length > 1 ? data[data.length - 2] : null;
        const t = stats[key].threshold;

        stats[key].latest = latest.value;
        // Check new status engine
        stats[key].status = getHealthStatus(latest.value, t.minValue, t.maxValue);
        
        if (previous) {
          if (latest.value > previous.value) stats[key].trend = 'up';
          else if (latest.value < previous.value) stats[key].trend = 'down';
        }
      }
    });

    return { grouped, stats };
  }, [allRecords, thresholds]);

  if ((loadingThresholds || loadingRecords || loadingMetrics) && !showOnboarding) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-76px)] bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#4f9d69] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Compiling your health data...</p>
      </div>
    );
  }

  const activeMainStat = processedData.stats[mainMetric];

  return (
    <div className="flex-1 p-6 md:p-10 min-h-[calc(100vh-76px)] bg-gradient-to-br from-[#f0fdf4] via-[#e6fbf0] to-[#bcffdb]/40 relative">
      
      {showOnboarding && <OnboardingPopup onComplete={() => { setShowOnboarding(false); loadDashboardData(); }} />}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-gray-500 font-medium mt-1">Select a metric below to view its detailed trends.</p>
        </div>

        {/* --- SELECTABLE STAT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {thresholds.map((t) => {
            const stat = processedData.stats[t.metricName];
            const isMain = mainMetric === t.metricName;
            const Icon = getMetricIcon(t.metricName);
            const badge = getStatusBadge(t.metricName, stat.latest, stat.status);
            
            return (
              <div 
                key={t.id} 
                onClick={() => setMainMetric(t.metricName)} 
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 cursor-pointer transition-all duration-300 border-2"
                style={{ borderColor: isMain ? t.themeColor : 'transparent', transform: isMain ? 'scale(1.02)' : 'none', boxShadow: isMain ? `0 10px 25px -5px ${t.themeColor}30` : '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="p-1 flex items-center justify-center rounded-2xl border border-gray-100 transition-colors"
                    style={{ backgroundColor: isMain ? t.themeColor : '#f3f4f6', width: '48px', height: '48px' }}
                  >
                    {t.imgUrl ? (
                      <img src={t.imgUrl} alt={t.metricName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isMain ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  {badge && <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${badge.styles}`}>{badge.text}</span>}
                </div>
                
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{formatName(t.metricName)}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-black ${stat.latest === null ? 'text-gray-300' : 'text-gray-800'}`}>{stat.latest !== null ? stat.latest : '--'}</span>
                  <span className="text-sm font-bold text-gray-400">{t.unit}</span>
                </div>

                {stat.latest !== null && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    {stat.trend === 'up' && <TrendingUp className={`w-4 h-4 ${t.metricName === 'BMI' && stat.status !== 'normal' ? 'text-red-500' : 'text-orange-500'}`} />}
                    {stat.trend === 'down' && <TrendingDown className={`w-4 h-4 ${t.metricName === 'BMI' && stat.status === 'normal' ? 'text-[#4f9d69]' : 'text-blue-500'}`} />}
                    {stat.trend === 'flat' && <Minus className="w-4 h-4 text-gray-400" />}
                    <span>vs. previous</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {mainMetric && activeMainStat && (
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 animate-in fade-in zoom-in-95 duration-300 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{formatName(mainMetric)} History</h2>
                </div>
                <Link 
                  to={`/metric/${mainMetric}`} 
                  className="px-5 py-2 font-bold rounded-xl text-white transition-colors text-sm"
                  style={{ backgroundColor: activeMainStat.threshold.themeColor }}
                >
                  {mainMetric === "BMI" ? "Calculate BMI" : "Log Data"}
                </Link>
              </div>

              <div className="h-[320px]">
                {processedData.grouped[mainMetric]?.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <Activity className="w-12 h-12 mb-3 opacity-20" />
                     <p className="text-sm font-medium">No records found.</p>
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData.grouped[mainMetric]} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 11}} axisLine={false} tickLine={false} tickMargin={10} />
                      <YAxis stroke="#9ca3af" domain={['auto', 'auto']} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                      
                      <ReferenceLine y={activeMainStat.threshold.maxValue} stroke="#ef4444" strokeDasharray="4 4" />
                      <ReferenceLine y={activeMainStat.threshold.minValue} stroke="#3b82f6" strokeDasharray="4 4" />
                      
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={activeMainStat.threshold.themeColor} 
                        strokeWidth={4} 
                        dot={{ fill: '#ffffff', stroke: activeMainStat.threshold.themeColor, strokeWidth: 3, r: 5 }} 
                        activeDot={{ r: 7 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* DYNAMIC HEALTH INSIGHT */}
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-100/60 flex items-start gap-4">
                <div className="p-2.5 bg-blue-100/80 text-blue-600 rounded-xl shrink-0 shadow-sm border border-white">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-blue-900 mb-1">Health Insight</h4>
                  <p className="text-sm text-blue-800/80 leading-relaxed font-medium">
                    {getInsightMessage(mainMetric, activeMainStat)}
                  </p>
                </div>
              </div>

            </div>
          )}

          <div className="lg:col-span-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[360px]">
              {allRecords.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium text-sm">No activity logged.</p>
                </div>
              ) : (
                [...allRecords].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).slice(0, 6).map((rec, idx) => {
                  const metricDef = systemMetrics[rec.metricType] || {};
                  let minLimit = metricDef.minLimit || 0;
                  let maxLimit = metricDef.maxLimit || 100;
                  let themeColor = metricDef.themeColor || '#9ca3af';
                  let unit = metricDef.unit || '';

                  if (rec.metricType === 'BMI') {
                    minLimit = 18.5; maxLimit = 24.9; themeColor = '#22c55e';
                  }

                  const status = getHealthStatus(rec.metricValue, minLimit, maxLimit);
                  const Icon = getMetricIcon(rec.metricType);
                  
                  let statusText = 'Normal';
                  let statusColor = 'text-green-500';
                  let valueColor = 'text-gray-800';

                  if (status === 'warning') {
                    statusText = 'Warning';
                    statusColor = 'text-orange-500';
                    valueColor = 'text-orange-600';
                  } else if (status === 'alert') {
                    statusText = 'Alert';
                    statusColor = 'text-red-500';
                    valueColor = 'text-red-600';
                  }

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-2.5 rounded-xl flex items-center justify-center border border-gray-50"
                          style={{ backgroundColor: `${themeColor}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: themeColor }} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {formatName(rec.metricType)}
                          </p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {new Date(rec.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className={`font-black text-lg ${valueColor}`}>
                            {rec.metricValue}
                          </span>
                          <span className="text-xs font-bold text-gray-400">{unit}</span>
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${statusColor}`}>
                          {statusText}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}