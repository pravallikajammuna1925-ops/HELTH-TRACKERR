// LoginPage.jsx
import React, { useState } from "react";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple demo authentication (replace with backend later if needed)
    if (username === "admin" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
    } else {
      setError("Invalid credentials. Try admin / 1234");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Username</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
