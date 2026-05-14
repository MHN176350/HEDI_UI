import { useState, useEffect } from "react";
import { Calculator, Save, Scale, Ruler, UserCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";
import { apiService } from "../services/apiService";

export default function BmiCalculatorCard({ onLogged }) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState(170);
  const [sex, setSex] = useState("male");
  
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  
  // NEW: State to handle elegant inline messages instead of alerts
  const [message, setMessage] = useState({ type: "", text: "" });

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCalculate = () => {
    setMessage({ type: "", text: "" }); // Clear any old messages
    
    if (!weight || weight <= 0) {
      setMessage({ type: "error", text: "Please enter a valid weight." });
      return;
    }
    
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    setBmiResult(bmi);

    if (bmi < 18.5) setBmiCategory({ label: "Underweight", color: "text-blue-500", bg: "bg-blue-50" });
    else if (bmi >= 18.5 && bmi <= 24.9) setBmiCategory({ label: "Healthy Weight", color: "text-[#4f9d69]", bg: "bg-[#bcffdb]/30" });
    else if (bmi >= 25 && bmi <= 29.9) setBmiCategory({ label: "Overweight", color: "text-orange-500", bg: "bg-orange-50" });
    else setBmiCategory({ label: "Obese", color: "text-red-500", bg: "bg-red-50" });
  };

  const handleLogIt = async () => {
    if (!bmiResult) return;
    
    setIsLogging(true);
    setMessage({ type: "", text: "" });
    const userId = Cookies.get("userId");

    try {
      await apiService.saveRecord(userId, {
        metricType: "BMI", 
        metricValue: bmiResult,
        recordedAt: new Date().toISOString()
      });
      setMessage({ type: "success", text: "BMI successfully logged!" });
      setWeight("");
      setHeight(170);
      setSex("male");
      setBmiResult(null);
      
      if (onLogged) onLogged();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to log BMI. Please try again." });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-2 bg-[#bcffdb]/50 rounded-xl">
          <Calculator className="w-6 h-6 text-[#4f9d69]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">BMI Calculator</h3>
          <p className="text-xs text-gray-500">Calculate and track your Body Mass Index</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-[#4f9d69] border border-green-100'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
            <UserCircle className="w-4 h-4" /> Biological Sex
          </label>
          <div className="flex gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#4f9d69] has-[:checked]:bg-[#bcffdb]/20">
              <input type="radio" name="sex" value="male" checked={sex === "male"} onChange={(e) => setSex(e.target.value)} className="hidden" />
              <span className="font-bold text-gray-700 text-sm">Male</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#4f9d69] has-[:checked]:bg-[#bcffdb]/20">
              <input type="radio" name="sex" value="female" checked={sex === "female"} onChange={(e) => setSex(e.target.value)} className="hidden" />
              <span className="font-bold text-gray-700 text-sm">Female</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Ruler className="w-4 h-4" /> Height
            </label>
            <span className="font-bold text-[#4f9d69] text-xl">{height} <span className="text-sm text-gray-500">cm</span></span>
          </div>
          <input 
            type="range" min="100" max="220" value={height} onChange={(e) => setHeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4f9d69]"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
            <Scale className="w-4 h-4" /> Weight (kg)
          </label>
          <input 
            type="number" 
            placeholder="Enter your weight" 
            value={weight} 
            onChange={(e) => {
              setWeight(e.target.value);
              setMessage({type: "", text: ""}); 
            }}
            className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all text-lg shadow-inner font-bold text-gray-700"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleCalculate} className="flex-1 py-3.5 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors shadow-md">
            Calculate
          </button>
          
          {bmiResult && (
            <button onClick={handleLogIt} disabled={isLogging} className="flex-1 py-3.5 bg-gradient-to-r from-[#4f9d69] to-[#3a7d51] text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {isLogging ? "Saving..." : "Log It"}
            </button>
          )}
        </div>

        {bmiResult && (
          <div className={`mt-2 p-4 rounded-2xl flex items-center justify-between border ${bmiCategory.bg} ${bmiCategory.color.replace('text', 'border')}/30 animate-in slide-in-from-top-2`}>
            <div>
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Your BMI</p>
              <p className={`text-3xl font-black ${bmiCategory.color}`}>{bmiResult}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Status</p>
              <p className={`font-bold ${bmiCategory.color}`}>{bmiCategory.label}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}