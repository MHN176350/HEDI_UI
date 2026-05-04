import Sidebar from "../components/Sidebar";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Heart, Droplet, TrendingUp } from "lucide-react";

const bloodPressureData = [
  { date: "Apr 22", systolic: 120, diastolic: 80 },
  { date: "Apr 23", systolic: 125, diastolic: 82 },
  { date: "Apr 24", systolic: 118, diastolic: 78 },
  { date: "Apr 25", systolic: 122, diastolic: 81 },
  { date: "Apr 26", systolic: 119, diastolic: 79 },
  { date: "Apr 27", systolic: 121, diastolic: 80 },
  { date: "Apr 28", systolic: 123, diastolic: 82 },
];

const bloodSugarData = [
  { date: "Apr 22", level: 95 },
  { date: "Apr 23", level: 102 },
  { date: "Apr 24", level: 88 },
  { date: "Apr 25", level: 98 },
  { date: "Apr 26", level: 92 },
  { date: "Apr 27", level: 96 },
  { date: "Apr 28", level: 100 },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#bee6ce] to-[#bcffdb]">

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[#4f9d69] mb-8">Health Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Heart Rate</span>
                <Heart className="w-5 h-5 text-[#4f9d69]" />
              </div>
              <p className="text-3xl text-[#4f9d69]">72 bpm</p>
              <p className="text-sm text-green-600 mt-1">Normal</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Blood Pressure</span>
                <Activity className="w-5 h-5 text-[#4f9d69]" />
              </div>
              <p className="text-3xl text-[#4f9d69]">120/80</p>
              <p className="text-sm text-green-600 mt-1">Optimal</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Blood Sugar</span>
                <Droplet className="w-5 h-5 text-[#4f9d69]" />
              </div>
              <p className="text-3xl text-[#4f9d69]">100 mg/dL</p>
              <p className="text-sm text-green-600 mt-1">Normal</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Weekly Trend</span>
                <TrendingUp className="w-5 h-5 text-[#4f9d69]" />
              </div>
              <p className="text-3xl text-[#4f9d69]">+5%</p>
              <p className="text-sm text-green-600 mt-1">Improving</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-[#4f9d69] mb-4">Blood Pressure Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bloodPressureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#bee6ce" />
                  <XAxis dataKey="date" stroke="#4f9d69" />
                  <YAxis stroke="#4f9d69" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="#4f9d69" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="#68d89b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-[#4f9d69] mb-4">Blood Sugar Levels</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bloodSugarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#bee6ce" />
                  <XAxis dataKey="date" stroke="#4f9d69" />
                  <YAxis stroke="#4f9d69" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="level" fill="#68d89b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
