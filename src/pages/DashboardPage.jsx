import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { Activity, Heart, Droplet, Thermometer, Wind, AlertCircle, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

// Helpers
const formatName = (name) => name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const getMetricIcon = (name) => {
  if (name.includes("HEART")) return Heart;
  if (name.includes("SUGAR")) return Droplet;
  if (name.includes("TEMPERATURE")) return Thermometer;
  if (name.includes("SpO2")) return Wind;
  return Activity;
};

export default function DashboardPage() {
  const userId = Cookies.get("userId");
  
  const [thresholds, setThresholds] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [mainMetric, setMainMetric] = useState(null);

  const { execute: fetchThresholds, loading: loadingThresholds } = useApi(apiService.getUserThresholds);
  const { execute: fetchRecords, loading: loadingRecords } = useApi(apiService.getUserRecords);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      const [threshRes, recordsRes] = await Promise.all([
        fetchThresholds(userId),
        fetchRecords(userId)
      ]);

      if (threshRes?.status === "SUCCESS" && threshRes.data.length > 0) {
        setThresholds(threshRes.data);
        // Default the main metric to the first one they track
        setMainMetric(threshRes.data[0].metricName);
      }
      
      if (recordsRes?.status === "SUCCESS") {
        setAllRecords(recordsRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  // Memoize the data processing so it only recalculates when records change
  const processedData = useMemo(() => {
    const grouped = {};
    const stats = {};

    // Initialize groups based on thresholds
    thresholds.forEach(t => {
      grouped[t.metricName] = [];
      stats[t.metricName] = { 
        threshold: t, 
        latest: null, 
        previous: null,
        isHealthy: true,
        trend: 'flat' // 'up', 'down', 'flat'
      };
    });

    // Group and sort records
    allRecords.forEach(record => {
      if (grouped[record.metricType]) {
        grouped[record.metricType].push({
          time: new Date(record.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          rawTime: new Date(record.recordedAt).getTime(),
          value: record.metricValue
        });
      }
    });

    // Calculate stats for the cards
    Object.keys(grouped).forEach(key => {
      const data = grouped[key].sort((a, b) => a.rawTime - b.rawTime); // Oldest to newest
      grouped[key] = data; // Save sorted data for charts

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

  if (thresholds.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-76px)] bg-gray-50 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-orange-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Metrics Tracked</h2>
        <p className="text-gray-500 mb-6 max-w-md">You haven't set up any health metrics to track yet. Let's personalize your dashboard.</p>
        <Link to="/onboarding" className="px-8 py-3 bg-[#4f9d69] text-white rounded-full font-bold hover:bg-[#3a7d51] transition-colors shadow-lg">
          Setup Health Limits
        </Link>
      </div>
    );
  }

  // Identify sub-metrics (everything except the main one)
  const subMetrics = thresholds.filter(t => t.metricName !== mainMetric);

  return (
    <div className="flex-1 p-6 md:p-10 min-h-[calc(100vh-76px)] bg-gradient-to-br from-[#f0fdf4] via-[#e6fbf0] to-[#bcffdb]/40">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-8">Overview</h1>

        {/* --- STAT CARDS (Also act as selectors for the Main Metric) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {thresholds.map((t) => {
            const stat = processedData.stats[t.metricName];
            const isMain = mainMetric === t.metricName;
            const Icon = getMetricIcon(t.metricName);
            
            return (
              <div 
                key={t.id}
                onClick={() => setMainMetric(t.metricName)}
                className={`bg-white/90 backdrop-blur-xl rounded-3xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  isMain ? 'border-[#4f9d69] shadow-lg shadow-[#4f9d69]/20 scale-105' : 'border-transparent shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isMain ? 'bg-[#4f9d69] text-white' : 'bg-[#bcffdb]/50 text-[#4f9d69]'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {/* Status Badge */}
                  {stat.latest !== null && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${stat.isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {stat.isHealthy ? 'Normal' : 'Warning'}
                    </span>
                  )}
                </div>
                
                <h3 className="text-gray-500 font-medium text-sm mb-1">{formatName(t.metricName)}</h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-bold ${stat.latest === null ? 'text-gray-300' : 'text-gray-800'}`}>
                    {stat.latest !== null ? stat.latest : '--'}
                  </span>
                  <span className="text-sm font-bold text-gray-400">{t.unit}</span>
                </div>

                {/* Trend Indicator */}
                {stat.latest !== null && (
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-orange-500" />}
                    {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-[#4f9d69]" />}
                    {stat.trend === 'flat' && <Minus className="w-4 h-4 text-gray-400" />}
                    <span>vs. previous entry</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- MAIN METRIC GRAPH --- */}
        {mainMetric && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 mb-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{formatName(mainMetric)} History</h2>
                <p className="text-sm text-gray-500">Detailed view of your primary focus</p>
              </div>
              <Link to={`/metric/${mainMetric}`} className="px-5 py-2 bg-[#bcffdb]/50 text-[#4f9d69] font-bold rounded-full hover:bg-[#4f9d69] hover:text-white transition-colors text-sm">
                Log Data
              </Link>
            </div>

            <div className="h-[400px]">
              {processedData.grouped[mainMetric]?.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400">
                   <Activity className="w-12 h-12 mb-3 opacity-20" />
                   <p>No records found for this metric.</p>
                 </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.grouped[mainMetric]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" domain={['auto', 'auto']} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    
                    <ReferenceLine y={processedData.stats[mainMetric].threshold.max} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'top', value: 'MAX', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                    <ReferenceLine y={processedData.stats[mainMetric].threshold.min} stroke="#3b82f6" strokeDasharray="4 4" label={{ position: 'bottom', value: 'MIN', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                    
                    <Line type="monotone" dataKey="value" stroke="#4f9d69" strokeWidth={4} dot={{ fill: '#ffffff', stroke: '#4f9d69', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, fill: '#4f9d69', stroke: '#ffffff', strokeWidth: 3 }} name={formatName(mainMetric)} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* --- SUB METRIC GRAPHS --- */}
        {subMetrics.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Other Tracked Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {subMetrics.map(t => {
                const data = processedData.grouped[t.metricName];
                
                return (
                  <div key={t.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-800">{formatName(t.metricName)}</h4>
                      <Link to={`/metric/${t.metricName}`} className="text-[#4f9d69] hover:underline text-sm font-medium">Details</Link>
                    </div>
                    
                    <div className="h-[200px]">
                      {data?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                            <ReferenceLine y={t.maxValue} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                            <ReferenceLine y={t.minValue} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.5} />
                            <Line type="monotone" dataKey="value" stroke="#4f9d69" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Value" />
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