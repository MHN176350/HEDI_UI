import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { Activity, Heart, Droplet, Thermometer, Wind, AlertCircle, TrendingUp, TrendingDown, Minus, Loader2, Scale } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

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

const getStatusBadge = (metricName, value, isHealthy) => {
  if (value === null) return null;
  
  if (metricName === "BMI") {
    if (value < 18.5) return { text: "Underweight", styles: "bg-blue-100 text-blue-700" };
    if (value <= 24.9) return { text: "Healthy", styles: "bg-green-100 text-green-700" };
    if (value <= 29.9) return { text: "Overweight", styles: "bg-orange-100 text-orange-700" };
    return { text: "Obese", styles: "bg-red-100 text-red-700" };
  }
  
  return { 
    text: isHealthy ? "Normal" : "Warning", 
    styles: isHealthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700" 
  };
};

export default function DashboardPage() {
  const userId = Cookies.get("userId");
  const userName = Cookies.get("userName") || "User";
  
  const [thresholds, setThresholds] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [mainMetric, setMainMetric] = useState(null);

  const { execute: fetchThresholds, loading: loadingThresholds } = useApi(apiService.getUserThresholds);
  const { execute: fetchRecords, loading: loadingRecords } = useApi(apiService.getUserRecords);

  useEffect(() => {
    if (userId) loadDashboardData();
   
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      const [threshRes, recordsRes] = await Promise.all([
        fetchThresholds(userId),
        fetchRecords(userId)
      ]);

      let activeThresholds = [];
      if (threshRes?.status === "SUCCESS") {
        activeThresholds = [...threshRes.data];
      }
   //WHO Certificateddd
      activeThresholds.push({ 
        id: 'bmi-permanent', 
        metricName: 'BMI', 
        minValue: 18.5, 
        maxValue: 24.9, 
        unit: '' 
      });

      setThresholds(activeThresholds);
      
      
      if (activeThresholds.length > 0) {
        setMainMetric(activeThresholds[0].metricName);
      }
      
      if (recordsRes?.status === "SUCCESS") {
        setAllRecords(recordsRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

 
  const processedData = useMemo(() => {
    const grouped = {};
    const stats = {};

    thresholds.forEach(t => {
      grouped[t.metricName] = [];
      stats[t.metricName] = { 
        threshold: t, 
        latest: null, 
        previous: null,
        isHealthy: true,
        trend: 'flat'
      };
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
        stats[key].isHealthy = latest.value >= t.minValue && latest.value <= t.maxValue;
        
        if (previous) {
          if (latest.value > previous.value) stats[key].trend = 'up';
          else if (latest.value < previous.value) stats[key].trend = 'down';
        }
      }
    });

    return { grouped, stats };
  }, [allRecords, thresholds]);

  const isLoading = loadingThresholds || loadingRecords;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-76px)] bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#4f9d69] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Compiling your health data...</p>
      </div>
    );
  }

  const subMetrics = thresholds.filter(t => t.metricName !== mainMetric);

  return (
    <div className="flex-1 p-6 md:p-10 min-h-[calc(100vh-76px)] bg-gradient-to-br from-[#f0fdf4] via-[#e6fbf0] to-[#bcffdb]/40">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-gray-500 font-medium mt-1">Select a metric below to view its detailed trends.</p>
        </div>

      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {thresholds.map((t) => {
            const stat = processedData.stats[t.metricName];
            const isMain = mainMetric === t.metricName;
            const Icon = getMetricIcon(t.metricName);
            const badge = getStatusBadge(t.metricName, stat.latest, stat.isHealthy);
            
            return (
              <div 
                key={t.id}
                onClick={() => setMainMetric(t.metricName)}
                className={`bg-white/90 backdrop-blur-xl rounded-3xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  isMain ? 'border-[#4f9d69] shadow-lg shadow-[#4f9d69]/20 scale-[1.02]' : 'border-transparent shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl transition-colors ${isMain ? 'bg-[#4f9d69] text-white' : 'bg-[#bcffdb]/50 text-[#4f9d69]'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {badge && (
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${badge.styles}`}>
                      {badge.text}
                    </span>
                  )}
                </div>
                
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{formatName(t.metricName)}</h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-black ${stat.latest === null ? 'text-gray-300' : 'text-gray-800'}`}>
                    {stat.latest !== null ? stat.latest : '--'}
                  </span>
                  <span className="text-sm font-bold text-gray-400">{t.unit}</span>
                </div>

                {stat.latest !== null && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    {stat.trend === 'up' && <TrendingUp className={`w-4 h-4 ${t.metricName === 'BMI' && !stat.isHealthy ? 'text-red-500' : 'text-orange-500'}`} />}
                    {stat.trend === 'down' && <TrendingDown className={`w-4 h-4 ${t.metricName === 'BMI' && stat.isHealthy ? 'text-[#4f9d69]' : 'text-blue-500'}`} />}
                    {stat.trend === 'flat' && <Minus className="w-4 h-4 text-gray-400" />}
                    <span>vs. previous entry</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
         
          {mainMetric && (
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{formatName(mainMetric)} History</h2>
                  <p className="text-sm text-gray-500">Detailed view of your primary focus</p>
                </div>
                <Link to={`/metric/${mainMetric}`} className="px-5 py-2 bg-[#bcffdb]/50 text-[#4f9d69] font-bold rounded-xl hover:bg-[#4f9d69] hover:text-white transition-colors text-sm">
                  {mainMetric === "BMI" ? "Calculate BMI" : "Log Data"}
                </Link>
              </div>

              <div className="h-[320px]">
                {processedData.grouped[mainMetric]?.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <Activity className="w-12 h-12 mb-3 opacity-20" />
                     <p className="text-sm font-medium">No records found for this metric.</p>
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData.grouped[mainMetric]} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} tickMargin={10} />
                      <YAxis stroke="#9ca3af" domain={['auto', 'auto']} tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                      
                      <ReferenceLine y={processedData.stats[mainMetric].threshold.max} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'top', value: 'MAX', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                      <ReferenceLine y={processedData.stats[mainMetric].threshold.min} stroke="#3b82f6" strokeDasharray="4 4" label={{ position: 'bottom', value: 'MIN', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                      
                      <Line type="monotone" dataKey="value" stroke="#4f9d69" strokeWidth={4} dot={{ fill: '#ffffff', stroke: '#4f9d69', strokeWidth: 3, r: 5 }} activeDot={{ r: 7, fill: '#4f9d69', stroke: '#ffffff', strokeWidth: 3 }} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

        
          <div className="lg:col-span-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <p className="text-sm text-gray-500">Your most recently logged metrics.</p>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[320px]">
              {allRecords.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium text-sm">No activity logged yet.</p>
                </div>
              ) : (
                [...allRecords].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).slice(0, 6).map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-[#f0fdf4] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        {(() => {
                          const Icon = getMetricIcon(rec.metricType);
                          return <Icon className="w-5 h-5 text-[#4f9d69]" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          {rec.metricType === "BMI" ? "BMI" : rec.metricType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                          {new Date(rec.recordedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-lg text-[#4f9d69]">{rec.metricValue}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

       
        {subMetrics.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6 px-2">Other Tracked Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {subMetrics.map(t => {
                const data = processedData.grouped[t.metricName];
                
                return (
                  <div key={t.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setMainMetric(t.metricName)}>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-gray-800 uppercase tracking-wider text-xs">{formatName(t.metricName)}</h4>
                      <div className="p-2 bg-gray-50 rounded-lg">
                         {(() => {
                            const Icon = getMetricIcon(t.metricName);
                            return <Icon className="w-4 h-4 text-gray-400" />;
                          })()}
                      </div>
                    </div>
                    
                    <div className="h-[120px]">
                      {data?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">No Data</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <ReferenceLine y={t.maxValue} stroke="#ef4444" strokeDasharray="2 2" opacity={0.3} />
                            <ReferenceLine y={t.minValue} stroke="#3b82f6" strokeDasharray="2 2" opacity={0.3} />
                            <Line type="monotone" dataKey="value" stroke="#4f9d69" strokeWidth={3} dot={false} activeDot={{ r: 4 }} name="Value" animationDuration={800} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}