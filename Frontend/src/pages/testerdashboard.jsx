import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";



export default function TesterDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const submitBug = async () => {
    if (!title || !description) {
      setMessage("All fields are required");
      return;
    }

    try {
      await api.post("/bugs", {
        title,
        description,
      });

      setMessage("✅ Bug reported successfully");
      setTitle("");
      setDescription("");
    } catch (err) {
      setMessage("❌ Failed to create bug");
    }
  };

  return (
    <>
      {/* NAVBAR AT TOP */}
          <Navbar />
    
      {/* PAGE CONTENT BELOW NAVBAR */}
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-600 text-center">
          Tester Dashboard
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Report a new bug
        </p>

        {message && (
          <p className="text-center mt-4 text-sm">{message}</p>
        )}

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Bug Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />

          <textarea
            placeholder="Bug Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={submitBug}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Submit Bug
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
