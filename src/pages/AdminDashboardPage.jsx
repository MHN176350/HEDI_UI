import { useState, useEffect } from "react";
import { Users, Activity, Database, Plus, Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { apiService } from "../services/apiService";
import { useApi } from "../hooks/useApi";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalRecords: 0, totalMetrics: 0 });
  const [metrics, setMetrics] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMetric, setNewMetric] = useState({ name: "", unit: "", description: "", imgUrl: "", minLimit: 0, maxLimit: 100, themeColor: "#3b82f6" });

  // Inline Editing State
  const [editingCell, setEditingCell] = useState(null); 
  const [editValue, setEditValue] = useState("");

  const { execute: fetchStats } = useApi(apiService.getAdminStats);
  const { execute: fetchMetrics, loading: loadingMetrics } = useApi(apiService.getAllMetricsAdmin);
  const { execute: toggleMetric, loading: isToggling } = useApi(apiService.toggleMetricStatus);
  const { execute: addMetric, loading: isAdding } = useApi(apiService.addMetric);
  const { execute: updateMetric } = useApi(apiService.updateMetric); 

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, metricsRes] = await Promise.all([fetchStats(), fetchMetrics()]);
      if (statsRes?.status === "SUCCESS") setStats(statsRes.data);
      if (metricsRes?.status === "SUCCESS") setMetrics(metricsRes.data);
    } catch (err) {
      console.error("Failed to load admin data");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleMetric(id);
      loadData(); 
    } catch (err) {
      alert("Failed to toggle metric status");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMetric(newMetric);
      setShowAddModal(false);
      setNewMetric({ name: "", unit: "", description: "", imgUrl: "", minLimit: 0, maxLimit: 100, themeColor: "#3b82f6" });
      loadData();
    } catch (err) {
      alert("Failed to add metric");
    }
  };

  // --- INLINE EDITING LOGIC ---

  const startEdit = (metric, field, currentValue) => {
    setEditingCell({ id: metric.id, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (metric) => {
    if (!editingCell) return;
    try {
      const payload = {
        name: metric.name,
        unit: metric.unit,
        description: metric.description,
        imgUrl: metric.imgUrl,
        minLimit: metric.minLimit,
        maxLimit: metric.maxLimit,
        themeColor: metric.themeColor,
        [editingCell.field]: editingCell.field.includes('Limit') ? parseFloat(editValue) : editValue
      };

      setMetrics(metrics.map(m => m.id === metric.id ? { ...m, ...payload } : m));
      setEditingCell(null);

      await updateMetric(metric.id, payload);
      loadData(); 
    } catch(e) {
      alert("Failed to update metric");
      loadData(); 
    }
  };

  // Triggers when color is selected, then forcefully closes the picker
  const handleColorChange = async (metric, e) => {
    const newColor = e.target.value;
    try {
      const payload = { ...metric, themeColor: newColor };
      setMetrics(metrics.map(m => m.id === metric.id ? payload : m)); 
      
      // Force the native OS color picker to close immediately
      e.target.blur(); 
      
      await updateMetric(metric.id, payload);
    } catch(err) {
      loadData();
    }
  };

  const handleKeyDown = (e, metric) => {
    if (e.key === 'Enter') {
      handleSaveEdit(metric);
    } else if (e.key === 'Escape') {
      setEditingCell(null); 
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 min-h-[calc(100vh-76px)] bg-gray-50 relative">
      
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Add New Metric</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Metric Name</label>
                <input type="text" required placeholder="e.g., CHOLESTEROL" value={newMetric.name} onChange={e => setNewMetric({...newMetric, name: e.target.value})} className="w-full p-3 border rounded-xl focus:border-[#4f9d69] outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                  <input type="text" required placeholder="e.g., mg/dL" value={newMetric.unit} onChange={e => setNewMetric({...newMetric, unit: e.target.value})} className="w-full p-3 border rounded-xl focus:border-[#4f9d69] outline-none" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color</label>
                  <input type="color" value={newMetric.themeColor} onChange={e => setNewMetric({...newMetric, themeColor: e.target.value})} className="w-full h-12 p-1 border rounded-xl cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Limit (WHO)</label>
                  <input type="number" step="0.1" required value={newMetric.minLimit} onChange={e => setNewMetric({...newMetric, minLimit: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl focus:border-[#4f9d69] outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Limit (WHO)</label>
                  <input type="number" step="0.1" required value={newMetric.maxLimit} onChange={e => setNewMetric({...newMetric, maxLimit: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl focus:border-[#4f9d69] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL (Optional)</label>
                <input type="url" placeholder="https://..." value={newMetric.imgUrl} onChange={e => setNewMetric({...newMetric, imgUrl: e.target.value})} className="w-full p-3 border rounded-xl focus:border-[#4f9d69] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea required value={newMetric.description} onChange={e => setNewMetric({...newMetric, description: e.target.value})} className="w-full p-3 border rounded-xl resize-none focus:border-[#4f9d69] outline-none" rows="2"></textarea>
              </div>
              <button disabled={isAdding} type="submit" className="w-full py-4 bg-[#4f9d69] text-white rounded-xl font-bold hover:bg-[#3f7d54] flex justify-center items-center gap-2 shadow-lg transition-colors">
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Metric"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">System Administration</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Users className="w-8 h-8" /></div>
            <div>
              <p className="text-gray-400 font-bold text-xs uppercase">Total Users</p>
              <p className="text-3xl font-black text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-green-50 text-green-500 rounded-2xl"><Database className="w-8 h-8" /></div>
            <div>
              <p className="text-gray-400 font-bold text-xs uppercase">Health Records Logged</p>
              <p className="text-3xl font-black text-gray-800">{stats.totalRecords}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl"><Activity className="w-8 h-8" /></div>
            <div>
              <p className="text-gray-400 font-bold text-xs uppercase">Available Metrics</p>
              <p className="text-3xl font-black text-gray-800">{stats.totalMetrics}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Metric Configurations</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Click on any name, limit, or unit to edit instantly. Press Enter to save.</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-[#4f9d69] text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#3f7d54] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Metric
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Metric Name</th>
                  <th className="p-4 font-bold">WHO Limits (Min - Max)</th>
                  <th className="p-4 font-bold">Unit</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingMetrics ? (
                  <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" /></td></tr>
                ) : (
                  metrics.map(metric => (
                    <tr key={metric.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          
                          {/* INLINE EDIT: COLOR CIRCLE */}
                          <div 
                            className="relative w-4 h-4 rounded-full overflow-hidden shadow-inner cursor-pointer flex-shrink-0 hover:ring-2 ring-gray-200 transition-all" 
                            style={{ backgroundColor: metric.themeColor }}
                            title="Click to change color"
                          >
                            <input 
                              type="color" 
                              value={metric.themeColor} 
                              onChange={(e) => handleColorChange(metric, e)} 
                              className="absolute inset-[-10px] w-10 h-10 opacity-0 cursor-pointer" 
                            />
                          </div>

                          {/* INLINE EDIT: NAME */}
                          {editingCell?.id === metric.id && editingCell?.field === 'name' ? (
                            <input 
                              autoFocus 
                              value={editValue} 
                              onChange={e => setEditValue(e.target.value)} 
                              onKeyDown={e => handleKeyDown(e, metric)}
                              onBlur={() => handleSaveEdit(metric)} 
                              className="border-b-2 border-[#4f9d69] outline-none bg-transparent font-bold text-gray-800 w-full animate-in fade-in" 
                            />
                          ) : (
                            <span 
                              onClick={() => startEdit(metric, 'name', metric.name)} 
                              className="font-bold text-gray-800 cursor-text hover:text-[#4f9d69] transition-colors border-b border-transparent hover:border-dashed hover:border-gray-300 pb-0.5"
                              title="Click to edit"
                            >
                              {metric.name.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* INLINE EDIT: LIMITS */}
                      <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                        {/* MIN LIMIT */}
                        {editingCell?.id === metric.id && editingCell?.field === 'minLimit' ? (
                          <input type="number" step="0.1" autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => handleKeyDown(e, metric)} onBlur={() => handleSaveEdit(metric)} className="w-16 border-b-2 border-[#4f9d69] outline-none bg-transparent text-center" />
                        ) : (
                          <span onClick={() => startEdit(metric, 'minLimit', metric.minLimit)} className="cursor-text hover:text-[#4f9d69] px-1 border-b border-transparent hover:border-dashed hover:border-gray-300">{metric.minLimit}</span>
                        )}
                        <span className="text-gray-300">-</span>
                        {/* MAX LIMIT */}
                        {editingCell?.id === metric.id && editingCell?.field === 'maxLimit' ? (
                          <input type="number" step="0.1" autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => handleKeyDown(e, metric)} onBlur={() => handleSaveEdit(metric)} className="w-16 border-b-2 border-[#4f9d69] outline-none bg-transparent text-center" />
                        ) : (
                          <span onClick={() => startEdit(metric, 'maxLimit', metric.maxLimit)} className="cursor-text hover:text-[#4f9d69] px-1 border-b border-transparent hover:border-dashed hover:border-gray-300">{metric.maxLimit}</span>
                        )}
                      </td>

                      {/* INLINE EDIT: UNIT */}
                      <td className="p-4 text-sm font-bold text-gray-400">
                        {editingCell?.id === metric.id && editingCell?.field === 'unit' ? (
                            <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => handleKeyDown(e, metric)} onBlur={() => handleSaveEdit(metric)} className="w-16 border-b-2 border-[#4f9d69] outline-none bg-transparent" />
                          ) : (
                            <span onClick={() => startEdit(metric, 'unit', metric.unit)} className="cursor-text hover:text-[#4f9d69] px-1 border-b border-transparent hover:border-dashed hover:border-gray-300">
                              {metric.unit || '-'}
                            </span>
                        )}
                      </td>

                      {/* BUG FIX: USING metric.active instead of metric.isActive */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${metric.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {metric.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {metric.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleToggle(metric.id)}
                          disabled={metric.name === 'BMI' || isToggling}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg border-2 disabled:opacity-30 transition-colors ${metric.active ? 'border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50' : 'border-[#4f9d69]/30 text-[#4f9d69] hover:border-[#4f9d69] hover:bg-[#e6fbf0]'}`}
                        >
                          {metric.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}