import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { authService } from "../services/authService";
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters!");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (response.status === "SUCCESS") {
        
        Cookies.set("token", response.data.token, { expires: 1 });
        Cookies.set("userId", response.data.userId, { expires: 1 });
        
        navigate("/onboarding");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-300";
    if (passwordStrength === 1) return "bg-red-400";
    if (passwordStrength === 2) return "bg-yellow-400";
    if (passwordStrength === 3) return "bg-blue-400";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
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
            <h1 className="text-2xl font-bold text-[#4f9d69]">Join HEDI Today</h1>
            <p className="text-gray-500 text-sm">Create your account to start tracking your health</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#4f9d69] font-medium mb-2 text-sm">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#4f9d69] font-medium mb-2 text-sm">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#4f9d69] font-medium mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#4f9d69] font-medium mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Strength: <span className={`font-semibold ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>{getPasswordStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[#4f9d69] font-medium mb-2 text-sm">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4f9d69]" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#f0fdf4] to-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] focus:bg-white transition-all"
                  required
                  disabled={loading}
                />
                {formData.password && formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#4f9d69] to-[#2d6a4f] text-white rounded-lg hover:from-[#3d7d54] hover:to-[#1f4d39] transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account? <Link to="/login" className="text-[#4f9d69] font-semibold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}