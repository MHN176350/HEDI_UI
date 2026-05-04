import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { Activity, Heart, TrendingUp, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bee6ce] to-[#bcffdb]">

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-4 text-[#4f9d69]">
            Welcome to HEDI
          </h1>
          <p className="text-xl text-[#4f9d69]/80 mb-8">
            Your Personal Health Diary System
          </p>
          <p className="text-lg text-[#4f9d69]/70 max-w-2xl mx-auto mb-8">
            Track, manage, and analyze your daily health metrics with actionable insights.
            Transform raw health data into readable trends, real-time alerts, and comprehensive reports.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-[#4f9d69] text-white rounded-lg hover:bg-[#68d89b] transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-[#4f9d69] rounded-lg hover:bg-[#bcffdb] transition-colors border-2 border-[#4f9d69]"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#8dffcd] rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-[#4f9d69]" />
            </div>
            <h3 className="text-[#4f9d69] mb-2">Track Metrics</h3>
            <p className="text-sm text-gray-600">
              Monitor blood sugar, blood pressure, and more
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#8dffcd] rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-[#4f9d69]" />
            </div>
            <h3 className="text-[#4f9d69] mb-2">Heart Rate</h3>
            <p className="text-sm text-gray-600">
              Real-time heart rate monitoring and alerts
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#8dffcd] rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#4f9d69]" />
            </div>
            <h3 className="text-[#4f9d69] mb-2">Trends & Insights</h3>
            <p className="text-sm text-gray-600">
              Visualize your health data with charts
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#8dffcd] rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#4f9d69]" />
            </div>
            <h3 className="text-[#4f9d69] mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600">
              Your health data is encrypted and protected
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
