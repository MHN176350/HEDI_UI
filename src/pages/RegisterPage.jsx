import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Activity, Mail, Lock, User } from "lucide-react";
import { authService } from "../services/authService";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (response.status === "SUCCESS") {
        // Save the token returned by RegisterResponse[cite: 1]
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bee6ce] to-[#bcffdb] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#4f9d69] rounded-full flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-center text-[#4f9d69] mb-2">Join HEDI Today</h1>
        <p className="text-center text-gray-600 mb-6">Create your account to start tracking</p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#4f9d69] mb-2 text-sm">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f9d69]" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First"
                  className="w-full pl-9 pr-4 py-2 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[#4f9d69] mb-2 text-sm">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last"
                className="w-full px-4 py-2 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4f9d69] mb-2 text-sm">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f9d69]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-2 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4f9d69] mb-2 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f9d69]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full pl-9 pr-4 py-2 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4f9d69] mb-2 text-sm">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f9d69]" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full pl-9 pr-4 py-2 bg-[#bcffdb] border-2 border-transparent rounded-lg focus:outline-none focus:border-[#4f9d69] transition-colors"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-[#4f9d69] text-white rounded-lg hover:bg-[#68d89b] transition-colors font-medium">
            Create Account
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-[#4f9d69] hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}