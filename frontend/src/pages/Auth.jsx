import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/auth/login", loginData);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("email", loginData.email);
      navigate("/chat");
    } catch (err) {
      setLoginError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/auth/register", registerData);
      setRegisterSuccess("Account created! Please login.");
      setTimeout(() => setIsFlipped(false), 1500);
    } catch (err) {
      setRegisterError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo + Name above card */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">CP</span>
            </div>
            <span className="text-gray-800 font-bold text-4xl">clearpath.ai</span>
          </div>

          {/* Flip card container */}
          <div
            className="relative w-full"
            style={{
              perspective: "1000px",
              height: "420px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transition: "transform 0.6s ease",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >

              {/* LOGIN SIDE (front) */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
                  <p className="text-gray-400 text-sm mb-6">Login to your account</p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-gray-600 text-sm mb-1 block">Email</label>
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm mb-1 block">Password</label>
                      <input
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      />
                    </div>
                    {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 text-sm"
                    >
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  <p className="text-center text-gray-400 text-sm mt-4">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </div>

              {/* REGISTER SIDE (back) */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Create account</h2>
                  <p className="text-gray-400 text-sm mb-6">Join ClearPath AI today</p>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="text-gray-600 text-sm mb-1 block">Email</label>
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm mb-1 block">Password</label>
                      <input
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      />
                    </div>
                    {registerError && <p className="text-red-500 text-xs">{registerError}</p>}
                    {registerSuccess && <p className="text-green-500 text-xs">{registerSuccess}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 text-sm"
                    >
                      {loading ? "Registering..." : "Register"}
                    </button>
                  </form>

                  <p className="text-center text-gray-400 text-sm mt-4">
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;