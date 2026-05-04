import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockHeartRateData = [
  { time: "8:00", bpm: 68 },
  { time: "9:00", bpm: 72 },
  { time: "10:00", bpm: 75 },
  { time: "11:00", bpm: 70 },
  { time: "12:00", bpm: 73 },
  { time: "13:00", bpm: 78 },
  { time: "14:00", bpm: 72 },
  { time: "15:00", bpm: 74 },
];

export default function HeartRatePage() {
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Heart rate logged: ${heartRate} BPM`);
    setHeartRate("");
    setNotes("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#bee6ce] to-[#bcffdb]">

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-[#4f9d69] mb-8">Heart Rate Monitoring</h1>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#8dffcd] rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#4f9d69]" />
                </div>
                <h2 className="text-[#4f9d69]">Log Heart Rate</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#4f9d69] mb-2">
                    Beats Per Minute (BPM)
                  </label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="Enter your heart rate"
                    className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                    min="30"
                    max="220"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Normal resting heart rate: 60-100 BPM
                  </p>
                </div>

                <div>
                  <label className="block text-[#4f9d69] mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about your activity or how you're feeling..."
                    className="w-full px-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors resize-none"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#4f9d69] text-white rounded-lg hover:bg-[#68d89b] transition-colors"
                >
                  Log Heart Rate
                </button>
              </form>
            </div>

            {/* Current Reading */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#bee6ce] to-[#8dffcd] flex items-center justify-center">
                  <Heart className="w-24 h-24 text-[#4f9d69] animate-pulse" />
                </div>
              </div>
              <p className="text-6xl text-[#4f9d69] mb-2">72</p>
              <p className="text-xl text-gray-600 mb-4">BPM</p>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full">
                Normal Range
              </span>
            </div>
          </div>

          {/* Heart Rate Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-[#4f9d69] mb-4">Heart Rate Trends Today</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockHeartRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#bee6ce" />
                <XAxis dataKey="time" stroke="#4f9d69" />
                <YAxis stroke="#4f9d69" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="bpm" 
                  stroke="#4f9d69" 
                  strokeWidth={2}
                  name="Heart Rate (BPM)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
