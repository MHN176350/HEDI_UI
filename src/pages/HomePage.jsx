import { Link } from "react-router-dom";
import { Activity, BarChart3, Bell, PlusCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden relative">
      
      {/* 
        CURVED BACKGROUND 
        We use an absolute div scaled extra wide to create that smooth SVG curve effect 
      */}
      <div className="absolute top-0 left-[50%] w-[150%] -translate-x-1/2 h-[750px] bg-[#bee6ce] rounded-b-[50%] -z-10"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-3xl font-bold text-[#4f9d69] tracking-tight">HEDI</Link>
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-[#4f9d69] font-bold hover:opacity-70 transition-opacity">Features</a>
              <a href="#how-it-works" className="text-[#4f9d69] font-bold opacity-70 hover:opacity-100 transition-opacity">How it Works</a>
              <a href="#about" className="text-[#4f9d69] font-bold opacity-70 hover:opacity-100 transition-opacity">About</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[#4f9d69] font-bold hover:opacity-70 transition-opacity">Log In</Link>
            <Link to="/register" className="px-6 py-2.5 bg-[#68d89b] text-white font-bold rounded-xl hover:bg-[#4f9d69] transition-colors shadow-md hover:shadow-lg">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mt-16">
          
          {/* Hero Text */}
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#4f9d69] leading-tight mb-6">
              Take Control of <br className="hidden lg:block"/>
              Your Health Journey.
            </h1>
            <p className="text-xl text-[#4f9d69]/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Track vital metrics, uncover actionable trends, and receive real-time alerts with your Personal Health Diary System.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#68d89b] text-white font-bold rounded-2xl hover:bg-[#4f9d69] transition-all shadow-lg hover:shadow-xl text-lg text-center">
                Get Started
              </Link>
              <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#4f9d69] text-[#4f9d69] font-bold rounded-2xl hover:bg-[#4f9d69]/10 transition-colors text-lg text-center">
                View Demo
              </a>
            </div>
          </div>

          {/* Hero Graphic (Recreating the SVG Card) */}
          <div className="flex-1 w-full max-w-lg z-10">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#4f9d69]/20 p-8 border border-white">
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-[#bcffdb] p-4 rounded-2xl">
                  <p className="text-[#4f9d69] font-bold text-sm mb-1">Heart Rate</p>
                  <p className="text-[#4f9d69] font-extrabold text-3xl">72 <span className="text-lg">bpm</span></p>
                </div>
                <div className="flex-1 bg-[#f8fdfa] border-2 border-[#bee6ce] p-4 rounded-2xl">
                  <p className="text-[#4f9d69]/70 font-bold text-sm mb-1">Blood Pressure</p>
                  <p className="text-[#4f9d69] font-extrabold text-3xl">120/80</p>
                </div>
              </div>

              <div className="bg-[#f8fdfa] border-2 border-[#bee6ce] rounded-2xl p-6 relative h-48 flex items-end">
                {/* Decorative Graph Line */}
                <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none" className="absolute bottom-6 left-0 right-0 px-6">
                  <path d="M0 100 L50 40 L100 70 L150 10 L200 60 L250 10 L300 40 L350 100" stroke="#68d89b" strokeWidth="4" fill="none" strokeLinejoin="round"/>
                  <circle cx="150" cy="10" r="6" fill="#4f9d69" stroke="#ffffff" strokeWidth="3"/>
                </svg>
                
                {/* Alert Badge */}
                <div className="absolute top-4 right-6 bg-[#4f9d69] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                  Alert: High
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#4f9d69] mb-4">Everything you need for a healthier you.</h2>
          <p className="text-lg text-[#4f9d69]/70">Built to seamlessly integrate into your daily routine.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#4f9d69]/10 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#bcffdb] rounded-full flex items-center justify-center mb-6">
              <PlusCircle className="w-7 h-7 text-[#4f9d69]" />
            </div>
            <h3 className="text-xl font-bold text-[#4f9d69] mb-3">Daily Tracking</h3>
            <p className="text-[#4f9d69]/70 leading-relaxed">
              Effortlessly log blood sugar, blood pressure, and other vital metrics in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#4f9d69]/10 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#bcffdb] rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-7 h-7 text-[#4f9d69]" />
            </div>
            <h3 className="text-xl font-bold text-[#4f9d69] mb-3">Actionable Analytics</h3>
            <p className="text-[#4f9d69]/70 leading-relaxed">
              Visualize your health data with beautiful charts and comprehensive reporting.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#4f9d69]/10 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#bcffdb] rounded-full flex items-center justify-center mb-6">
              <Bell className="w-7 h-7 text-[#4f9d69]" />
            </div>
            <h3 className="text-xl font-bold text-[#4f9d69] mb-3">Real-time Alerts</h3>
            <p className="text-[#4f9d69]/70 leading-relaxed">
              Set custom thresholds and receive instant notifications for critical health changes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="bg-[#bcffdb] rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
          <h2 className="text-4xl font-extrabold text-[#4f9d69] mb-4 relative z-10">Ready to start tracking?</h2>
          <p className="text-lg text-[#4f9d69]/80 mb-10 relative z-10">Join today and get better insights into your well-being.</p>
          <Link to="/register" className="inline-block px-10 py-4 bg-[#68d89b] text-white font-bold rounded-2xl hover:bg-[#4f9d69] transition-all shadow-xl hover:shadow-2xl text-lg relative z-10">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 mt-12 border-t-2 border-[#bee6ce]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#4f9d69] mb-2">HEDI</h2>
            <p className="text-[#4f9d69]/70 text-sm">© {new Date().getFullYear()} Personal Health Diary System. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <a href="#privacy" className="text-[#4f9d69] font-bold hover:underline">Privacy Policy</a>
            <a href="#terms" className="text-[#4f9d69] font-bold hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}