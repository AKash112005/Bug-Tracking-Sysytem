import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bug } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful");

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "developer") navigate("/developer");
      else if (res.data.role === "tester") navigate("/tester");
      else if (res.data.role === "viewer") navigate("/viewer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        {/* 🔥 Bug Logo + Title */}
        <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2 text-indigo-600">
          <Bug className="w-6 h-6" />
          Bug Tracker Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
}
