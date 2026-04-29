import { Link, useLocation } from "react-router";
import { Bell, Activity } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="w-full bg-[#4f9d69] text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="w-8 h-8" />
          <span className="text-xl font-semibold">HEDI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/' ? 'text-[#bcffdb]' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/dashboard' ? 'text-[#bcffdb]' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/metrics"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/metrics' ? 'text-[#bcffdb]' : ''}`}
          >
            Metrics
          </Link>
          <Link
            to="/heart-rate"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/heart-rate' ? 'text-[#bcffdb]' : ''}`}
          >
            Heart Rate
          </Link>
          <Link
            to="/login"
            className={`hover:text-[#bcffdb] transition-colors ${location.pathname === '/login' ? 'text-[#bcffdb]' : ''}`}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
