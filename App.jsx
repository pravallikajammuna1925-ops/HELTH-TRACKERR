// App.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Activity,
  Utensils,
  Droplet,
  Send,
  Award,
  Home,
  RotateCcw,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import LoginPage from "./LoginPage";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const defaultData = {
  date: new Date().toISOString().split("T")[0],
  steps_walked: 0,
  calories_consumed: 0,
  water_drank_ml: 0,
};

// --- Achievements milestones ---
const milestones = {
  steps: [1000, 5000, 10000],
  water: [1000, 2500],
  calories: [500, 1000, 2000],
};

const colorMap = {
  green: "#10B981",
  orange: "#F97316",
  blue: "#3B82F6",
};

// --- Reusable Card ---
const StatCard = ({ Icon, title, value, unit, color = "green" }) => {
  const primary = colorMap[color] || colorMap.green;
  return (
    <div
      className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border-t-4"
      style={{ borderColor: primary }}
    >
      <Icon className="w-8 h-8 mb-3" style={{ color: primary }} />
      <div className="text-4xl font-extrabold text-gray-800">
        {Number(value).toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title} <span className="text-xs text-gray-400">({unit})</span>
      </div>
    </div>
  );
};

const LogInput = ({ name, label, unit, Icon, value, onChange }) => (
  <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
    <Icon className="w-5 h-5 text-indigo-500" />
    <input
      type="number"
      min="0"
      name={name}
      placeholder={`Add ${label}`}
      value={value}
      onChange={onChange}
      className="w-full p-1 text-lg bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-500"
    />
    <span className="text-gray-500 text-sm font-medium">{unit}</span>
  </div>
);

const App = () => {
  const [data, setData] = useState(defaultData);
  const [logInput, setLogInput] = useState({ steps: "", calories: "", water: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [achievement, setAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("isLoggedIn"));
  const { width, height } = useWindowSize();

  const extractData = (result) =>
    result?.data || result?.updated_data || result;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/summary`);
      const json = await r.json();
      const payload = extractData(json);
      if (payload) {
        setData(payload);
        checkAchievements(payload);
      }
    } catch {
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, fetchData]);

  const handleInputChange = (e) =>
    setLogInput((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ✅ Achievement checker
  const checkAchievements = (newData) => {
    const achieved = JSON.parse(localStorage.getItem("achievements") || "[]");
    let newMilestone = null;

    Object.entries(milestones).forEach(([key, goals]) => {
      const currentValue =
        key === "steps"
          ? newData.steps_walked
          : key === "water"
          ? newData.water_drank_ml
          : newData.calories_consumed;

      goals.forEach((goal) => {
        const id = `${key}-${goal}`;
        if (currentValue >= goal && !achieved.includes(id)) {
          newMilestone = `🎯 ${key.toUpperCase()} milestone reached: ${goal}!`;
          achieved.push(id);
        }
      });
    });

    if (newMilestone) {
      localStorage.setItem("achievements", JSON.stringify(achieved));
      setAchievement(newMilestone);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setTimeout(() => setAchievement(null), 6000);
    }
  };

  // ✅ Reset everything
  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Reset all values and delete achievements?"
    );
    if (!confirmReset) return;

    try {
      await fetch(`${API_BASE_URL}/reset`, { method: "POST" });
      localStorage.removeItem("achievements");
      await fetchData();
    } catch {
      setError("Reset failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      steps_delta: Number(logInput.steps) || 0,
      calories_delta: Number(logInput.calories) || 0,
      water_ml_delta: Number(logInput.water) || 0,
    };
    if (!payload.steps_delta && !payload.calories_delta && !payload.water_ml_delta)
      return;

    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE_URL}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await r.json();
      const newData = extractData(json);
      if (newData) {
        setData(newData);
        checkAchievements(newData);
      }
      setLogInput({ steps: "", calories: "", water: "" });
    } catch {
      setError("Log failed.");
    }
    setSubmitting(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-black text-indigo-700">Daily Health Tracker</h1>

        <div className="flex justify-center gap-4 mt-4">
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === "home"
                ? "bg-indigo-600 text-white"
                : "text-indigo-600 border border-indigo-600"
            }`}
            onClick={() => setActiveTab("home")}
          >
            <Home className="w-4 h-4 inline mr-1" /> Home
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === "achievements"
                ? "bg-indigo-600 text-white"
                : "text-indigo-600 border border-indigo-600"
            }`}
            onClick={() => setActiveTab("achievements")}
          >
            <Award className="w-4 h-4 inline mr-1" /> Achievements
          </button>
          <button
            className="px-3 py-1 border border-red-500 text-red-500 rounded-md"
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              setIsLoggedIn(false);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {activeTab === "home" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              Icon={Activity}
              title="Steps Walked"
              unit="steps"
              value={data.steps_walked}
              color="green"
            />
            <StatCard
              Icon={Utensils}
              title="Calories Consumed"
              unit="kcal"
              value={data.calories_consumed}
              color="orange"
            />
            <StatCard
              Icon={Droplet}
              title="Water Drank"
              unit="ml"
              value={data.water_drank_ml}
              color="blue"
            />
          </div>

          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-indigo-700">Add Activity</h2>
              <button onClick={fetchData} className="text-gray-500">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <LogInput
                name="steps"
                label="Steps"
                unit="steps"
                Icon={Activity}
                value={logInput.steps}
                onChange={handleInputChange}
              />
              <LogInput
                name="calories"
                label="Calories"
                unit="kcal"
                Icon={Utensils}
                value={logInput.calories}
                onChange={handleInputChange}
              />
              <LogInput
                name="water"
                label="Water"
                unit="ml"
                Icon={Droplet}
                value={logInput.water}
                onChange={handleInputChange}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl mt-4"
              >
                {submitting ? "Saving…" : "Add Log Data"}
              </button>
            </form>

            {/* ✅ Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 mt-4 bg-red-500 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset All Data
            </button>
          </div>
        </>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-indigo-700 text-center mb-4">
            Your Achievements 🏆
          </h2>
          <ul className="space-y-3">
            {JSON.parse(localStorage.getItem("achievements") || "[]").length ===
            0 ? (
              <p className="text-center text-gray-500">No achievements yet!</p>
            ) : (
              JSON.parse(localStorage.getItem("achievements") || "[]").map(
                (a, i) => (
                  <li
                    key={i}
                    className="flex justify-between p-3 bg-gray-50 border rounded"
                  >
                    <span>{a}</span>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </li>
                )
              )
            )}
          </ul>
        </div>
      )}

      {achievement && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg">
          {achievement}
        </div>
      )}
      {showConfetti && <Confetti width={width} height={height} />}
    </div>
  );
};

export default App;
