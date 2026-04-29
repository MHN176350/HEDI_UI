import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Activity, Droplet, Thermometer, Weight, Calendar } from "lucide-react";

export default function HealthMetricsPage() {
  const [bloodPressureSys, setBloodPressureSys] = useState("");
  const [bloodPressureDia, setBloodPressureDia] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Health metrics saved successfully!");
    // Reset form
    setBloodPressureSys("");
    setBloodPressureDia("");
    setBloodSugar("");
    setTemperature("");
    setWeight("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#bee6ce] to-[#bcffdb]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[#4f9d69] mb-8">Health Metrics Input</h1>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <p className="text-gray-600 mb-6">
              Log your daily health metrics to track your wellness journey
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[#4f9d69] mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4f9d69] mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Blood Pressure (mmHg)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={bloodPressureSys}
                    onChange={(e) => setBloodPressureSys(e.target.value)}
                    placeholder="Systolic (e.g., 120)"
                    className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                    required
                  />
                  <input
                    type="number"
                    value={bloodPressureDia}
                    onChange={(e) => setBloodPressureDia(e.target.value)}
                    placeholder="Diastolic (e.g., 80)"
                    className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4f9d69] mb-2 flex items-center gap-2">
                  <Droplet className="w-5 h-5" />
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4f9d69] mb-2 flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Body Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g., 98.6"
                  className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4f9d69] mb-2 flex items-center gap-2">
                  <Weight className="w-5 h-5" />
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 150"
                  className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#4f9d69] text-white rounded-lg hover:bg-[#68d89b] transition-colors"
              >
                Save Health Metrics
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
