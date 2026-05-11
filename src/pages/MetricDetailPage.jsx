import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Activity, Loader2, Lock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";
import BmiCalculatorCard from "../components/BMICalculator";

const formatName = (name) => {
  if (name === "BMI") return "BMI Tracker";
  return name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function MetricDetailPage() {
  const { metricName } = useParams();
  const userId = Cookies.get("userId");
  
  const [metricValue, setMetricValue] = useState("");
  const [chartData, setChartData] = useState([]);
  const [thresholds, setThresholds] = useState({ min: 0, max: 0, unit: "", themeColor: "#4f9d69", imgUrl: null });
  const [lockMinutes, setLockMinutes] = useState(0);

  const { execute: fetchRecords, loading: loadingRecords } = useApi(apiService.getUserRecords);
  const { execute: fetchLatestRecord } = useApi(apiService.getLatestRecord);
  const { execute: saveRecord, loading: isSaving } = useApi(apiService.saveRecord);
  const { execute: fetchMetrics } = useApi(apiService.getMetrics);

  useEffect(() => {
    loadPageData();
  }, [metricName]);

  const calculateLockTime = (lastRecordTime) => {
    if (!lastRecordTime) {
      setLockMinutes(0);
      return;
    }
    const diffMs = Date.now() - new Date(lastRecordTime).getTime();
    const oneHourMs = 60 * 60 * 1000;
    if (diffMs < oneHourMs) {
      setLockMinutes(Math.ceil((oneHourMs - diffMs) / 60000));
    } else {
      setLockMinutes(0);
    }
  };

  const loadPageData = async () => {
    try {
      const metricsRes = await fetchMetrics();
      const metricsList = Array.isArray(metricsRes) ? metricsRes : (metricsRes?.data || []);
      const metricDef = metricsList.find(m => m.name === metricName) || {};

      setThresholds({ 
        min: metricDef.minLimit || 0, 
        max: metricDef.maxLimit || 100, 
        unit: metricDef.unit || "",
        themeColor: metricDef.themeColor || "#4f9d69",
        imgUrl: metricDef.imgUrl || null
      });

      const latestRes = await fetchLatestRecord(userId, metricName);
      if (latestRes?.data) calculateLockTime(latestRes.data.recordedAt);
      else setLockMinutes(0);

      const recordRes = await fetchRecords(userId);
      const filteredData = recordRes?.data
        ?.filter(r => r.metricType === metricName)
        .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
        .map(r => ({
          time: new Date(r.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          value: r.metricValue
        })) || [];
      setChartData(filteredData);
    } catch (err) {
      console.error("Failed to load metric data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        metricType: metricName,
        metricValue: parseFloat(metricValue),
        recordedAt: new Date().toISOString()
      };
      const res = await saveRecord(userId, payload);
      if (res?.status === "SUCCESS") {
        setMetricValue("");
        loadPageData(); 
      }
    } catch (err) {
      alert("Failed to save record");
    }
  };

  const currentReading = chartData.length > 0 ? chartData[chartData.length - 1].value : "--";
  const isHealthy = currentReading !== "--" && currentReading >= thresholds.min && currentReading <= thresholds.max;

  return (
    <div className="flex-1 p-6 md:p-10 min-h-[calc(100vh-76px)] bg-gradient-to-br from-[#f0fdf4] via-[#e6fbf0] to-[#bcffdb]/40">
      <div className="max-w-5xl mx-auto">
        
        {/* Dynamic Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-2xl shadow-md flex items-center justify-center border border-gray-100 p-1"
            style={{ backgroundColor: thresholds.themeColor }}
          >
            {thresholds.imgUrl ? (
              <img src={thresholds.imgUrl} alt={metricName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Activity className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{formatName(metricName)}</h1>
            <p className="text-gray-500 font-medium" style={{ color: thresholds.themeColor }}>Daily Monitoring Dashboard</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Input Area */}
          <div className="h-full flex flex-col">
            {lockMinutes > 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 h-full flex flex-col justify-center">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-orange-800">Input Locked</h3>
                  <p className="text-sm text-orange-600">To ensure data accuracy, please wait before logging another reading.</p>
                  <div className="inline-block px-4 py-2 bg-white rounded-full text-orange-600 font-bold text-sm shadow-sm mt-2">
                    Available in {lockMinutes} mins
                  </div>
                </div>
              </div>
            ) : metricName === "BMI" ? (
              <BmiCalculatorCard onLogged={loadPageData} />
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 h-full">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Log New Reading</h2>
                  <p className="text-sm text-gray-500">Record your current stats to update the charts.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-bold text-sm">
                      Measurement ({thresholds.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value)}
                      placeholder={`Healthy range: ${thresholds.min} - ${thresholds.max}`}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none transition-all text-lg shadow-inner"
                      style={{ focusBorderColor: thresholds.themeColor }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 text-white rounded-2xl hover:shadow-lg transition-all font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: thresholds.themeColor }}
                  >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Reading"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Current Reading Status Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className={`w-full h-3 absolute top-0 left-0 transition-colors duration-500 ${isHealthy ? 'bg-[#4f9d69]' : currentReading === '--' ? 'bg-gray-200' : 'bg-red-500'}`}></div>
            
            <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">Latest Reading</p>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className={`text-8xl font-black tracking-tighter transition-colors duration-500 ${isHealthy ? 'text-[#4f9d69]' : currentReading === '--' ? 'text-gray-300' : 'text-red-500'}`}>
                {currentReading}
              </span>
              <span className="text-2xl text-gray-400 font-bold">{thresholds.unit}</span>
            </div>
            
            {currentReading !== "--" && (
              <div className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors duration-500 ${isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isHealthy ? 'Within Healthy Range' : 'Outside Target Range'}
              </div>
            )}
          </div>
        </div>

        {/* History Chart Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Historical Trends</h2>
              <p className="text-sm text-gray-500">Your logged history over time.</p>
            </div>
          </div>

          {loadingRecords ? (
            <div className="h-[350px] w-full flex items-end justify-between gap-2 opacity-50 px-8 pb-8">
              {[40, 70, 45, 90, 65, 80, 50, 100, 60, 85].map((height, i) => (
                <div key={i} className="w-full bg-gray-200 rounded-t-md animate-pulse" style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          ) : chartData.length === 0 ? (
             <div className="flex flex-col justify-center items-center h-[350px] text-gray-400">
               <Activity className="w-16 h-16 mb-4 opacity-20" />
               <p className="font-medium text-lg">No data logged yet.</p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                
                <ReferenceLine y={thresholds.max} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'top', value: 'MAX', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine y={thresholds.min} stroke="#3b82f6" strokeDasharray="4 4" label={{ position: 'bottom', value: 'MIN', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={thresholds.themeColor} 
                  strokeWidth={4}
                  dot={{ fill: '#ffffff', stroke: thresholds.themeColor, strokeWidth: 3, r: 5 }}
                  activeDot={{ r: 8, fill: thresholds.themeColor, stroke: '#ffffff', strokeWidth: 3 }}
                  name={formatName(metricName)} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}