import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { BugPlay } from "lucide-react";



export default function TesterDashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [bugType, setBugType] = useState("Other");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setMessage("❌ Failed to load projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const submitBug = async () => {
    if (!selectedProject || !title || !description) {
      setMessage("All fields are required");
      return;
    }

    try {
      await api.post("/bugs", {
        title,
        description,
        projectId: selectedProject,
        severity,
        bugType,
      });

      setMessage("✅ Bug reported successfully");
      setSelectedProject("");
      setTitle("");
      setDescription("");
      setSeverity("medium");
      setBugType("Other");
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg mb-6">
          <h1 className="text-4xl font-bold text-white text-center flex items-center justify-center gap-3">
            <BugPlay className="w-8 h-8" />
            Tester Dashboard
          </h1>
        </div>

        <p className="text-center text-slate-600 mt-4 font-semibold">
          Report a new bug for a project
        </p>

        {message && (
          <p className="text-center mt-4 text-sm">{message}</p>
        )}

        {loading ? (
          <p className="text-center text-slate-500 mt-6">Loading projects...</p>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Project Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Project *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">-- Choose a project --</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Bug Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Bug Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Login button not responding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Bug Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Bug Description *
              </label>
              <textarea
                placeholder="Describe the bug in detail, steps to reproduce, expected vs actual behavior"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Bug Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Bug Type <span className="text-xs text-slate-500">(Auto-assigns to relevant role)</span>
              </label>
              <select
                value={bugType}
                onChange={(e) => setBugType(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="UI">🎨 UI Issue</option>
                <option value="Backend">⚙️ Backend Issue</option>
                <option value="Database">🗄️ Database Issue</option>
                <option value="DevOps">🔧 DevOps/Infrastructure</option>
                <option value="QA">✅ QA/Testing Issue</option>
                <option value="Other">❓ Other</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitBug}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Submit Bug Report
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
