import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Loader2 } from "lucide-react";
import { authService } from "../services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.status === "SUCCESS") {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setLoading(true);
    try {
      const mockOAuthPayload = {
        id: "google-123456789",
        email: "user@example.com",
        firstName: "John",
        lastName: "Doe",
        provider: "google"
      };

      const response = await authService.oauthCallback(mockOAuthPayload);
      
      if (response.status === "SUCCESS") {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        setError(response.message || "OAuth login failed");
      }
    } catch (err) {
      setError("OAuth connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bee6ce] via-[#a8dfc5] to-[#bcffdb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4f9d69] to-[#2d6a4f] rounded-full flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#4f9d69]">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Login to access your health dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <span className="text-red-500 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#4f9d69] font-medium mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4f9d69] font-medium mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#4f9d69] to-[#2d6a4f] text-white rounded-lg hover:from-[#3d7d54] hover:to-[#1f4d39] transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Button */}
          <button 
            onClick={handleOAuthLogin}
            disabled={loading}
            className="w-full py-3 border-2 border-[#4f9d69] text-[#4f9d69] bg-white rounded-lg hover:bg-[#f0fdf4] transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-75"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          {/* Register Link */}
          <p className="text-center text-gray-600 text-sm">
            Don't have an account? <Link to="/register" className="text-[#4f9d69] font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}