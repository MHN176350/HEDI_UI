import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Activity, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login - in real app, authenticate with backend
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bee6ce] to-[#bcffdb] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#4f9d69] rounded-full flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-center text-[#4f9d69] mb-2">
          Welcome Back to HEDI
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Login to access your health dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#4f9d69] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4f9d69] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#4f9d69] text-white rounded-lg hover:bg-[#68d89b] transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#4f9d69] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
