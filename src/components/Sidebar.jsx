import { Link, useLocation } from "react-router";
import { Home, Activity, Heart, BarChart3, Bell } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/metrics", icon: Activity, label: "Health Metrics" },
    { path: "/heart-rate", icon: Heart, label: "Heart Rate" },
  ];

  return (
    <aside className="w-64 bg-[#bee6ce] min-h-screen p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-[#4f9d69] font-semibold">Menu</h2>
        <button className="relative p-2 hover:bg-[#bcffdb] rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-[#4f9d69]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#4f9d69] text-white"
                : "text-[#4f9d69] hover:bg-[#bcffdb]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
