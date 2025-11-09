import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url =
        mode === "login" ? `${API_BASE_URL}/login` : `${API_BASE_URL}/signup`;
      const res = await axios.post(url, { username, password });
      const { token, username: returnedUser } = res.data;

      // Store token locally
      localStorage.setItem("ct_token", token);
      localStorage.setItem("ct_user", returnedUser || username);

      // Pass token and username up to App.jsx
      onAuth({ token, username: returnedUser || username });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          to your Calorie Tracker
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-2 rounded-md mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 mt-4">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-gray-900 font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-gray-900 font-semibold hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
