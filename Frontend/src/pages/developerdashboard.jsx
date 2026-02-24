import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import DeveloperSidebar from "../components/DeveloperSidebar";

export default function DeveloperDashboard() {
  const [activeBugs, setActiveBugs] = useState([]);
  const [completedBugs, setCompletedBugs] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const user = getUser();

  /* ================= FETCH BUGS ================= */
  const fetchAssignedBugs = async () => {
    try {
      const res = await api.get("/bugs/assigned");
      const allBugs = res.data || [];
      
      const active = allBugs.filter((bug) => bug.status !== "fixed");
      const completed = allBugs.filter((bug) => bug.status === "fixed");
      
      setActiveBugs(active);
      setCompletedBugs(completed);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch bugs");
    }
  };

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    fetchAssignedBugs();

    const interval = setInterval(() => {
      fetchAssignedBugs();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (bugId, status) => {
    try {
      await api.put("/bugs/status", { bugId, status });
      toast.success(`Updated to ${status}`);
      fetchAssignedBugs();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= GROUP BY PROJECT ================= */
  const groupedBugs = activeBugs.reduce((acc, bug) => {
    const projectName = bug.project?.projectName || "Unassigned Project";
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(bug);
    return acc;
  }, {});

  /* ================= GET PROJECTS ================= */
  const allProjects = Object.keys(groupedBugs);

  /* ================= FILTER BUGS ================= */
  const getFilteredBugs = (bugs) => {
    return bugs.filter((bug) => {
      const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bug.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProject === "all" || bug.project?.projectName === selectedProject;
      return matchesSearch && matchesProject;
    });
  };

  /* ================= GET PRIORITY COLOR ================= */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border border-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 border border-green-300";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300";
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  /* ================= GET STATUS COLOR ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "in-progress":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      case "fixed":
        return "bg-green-50 border-l-4 border-green-500";
      default:
        return "bg-slate-50 border-l-4 border-slate-500";
    }
  };

  return (
    <>
      <Navbar />
      <DeveloperSidebar activeTab={activeTab} setActiveTab={setActiveTab} completedBugs={completedBugs} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-10 pt-24 ml-64">
        
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Welcome, {user?.name} 👋
            </h1>
            <p className="text-slate-600">Keep track of your assigned bugs and complete your fixes</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "active"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              Active Bugs ({activeBugs.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "history"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              Completed ({completedBugs.length})
            </button>
          </div>

          {/* Active Bugs Tab */}
          {activeTab === "active" && (
            <>
              {activeBugs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-green-300">
                  <p className="text-slate-600 text-lg font-semibold">No assigned bugs. Great work! 🎉</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                      <p className="text-slate-600 text-sm font-semibold">Total Active</p>
                      <p className="text-3xl font-bold text-blue-600">{activeBugs.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                      <p className="text-slate-600 text-sm font-semibold">In Progress</p>
                      <p className="text-3xl font-bold text-yellow-600">{activeBugs.filter(b => b.status === "in-progress").length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                      <p className="text-slate-600 text-sm font-semibold">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{completedBugs.length}</p>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Search Bugs</label>
                        <input
                          type="text"
                          placeholder="Search by title or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Project</label>
                        <select
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        >
                          <option value="all">All Projects</option>
                          {allProjects.map((project) => (
                            <option key={project} value={project}>
                              {project}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Bugs List */}
                  <div className="space-y-8">
                    {Object.keys(groupedBugs).map((projectName) => {
                      if (selectedProject !== "all" && projectName !== selectedProject) return null;

                      const filteredProjectBugs = getFilteredBugs(groupedBugs[projectName]);
                      if (filteredProjectBugs.length === 0) return null;

                      return (
                        <div key={projectName}>
                          {/* Project Header */}
                          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5 rounded-lg mb-4 shadow-md">
                            <h2 className="text-lg font-bold mb-1">{projectName}</h2>
                            <p className="text-sm opacity-90">
                              📋 Project ID: {groupedBugs[projectName][0]?.project?.projectId || "N/A"} • {filteredProjectBugs.length} bugs
                            </p>
                          </div>

                          {/* Bugs Grid */}
                          <div className="grid gap-6 mb-8">
                            {filteredProjectBugs.map((bug) => (
                              <div
                                key={bug._id}
                                className={`rounded-lg shadow-md p-6 transition-all hover:shadow-lg border ${getStatusColor(bug.status)} bg-white`}
                              >
                                {/* Title and Status */}
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                                      {bug.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                      {bug.description}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2 md:justify-end">
                                    <StatusBadge status={bug.status} />
                                    {bug.priority && (
                                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(bug.priority)}`}>
                                        {bug.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Bug Details */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t border-b border-slate-200 my-4">
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Created</p>
                                    <p className="text-sm text-slate-700 font-medium">{formatDate(bug.createdAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Updated</p>
                                    <p className="text-sm text-slate-700 font-medium">{formatDate(bug.updatedAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Created By</p>
                                    <p className="text-sm text-slate-700 font-medium">{bug.createdBy?.email || "N/A"}</p>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 mt-4">
                                  {bug.status !== "in-progress" && (
                                    <button
                                      onClick={() => updateStatus(bug._id, "in-progress")}
                                      className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold text-sm shadow-sm"
                                    >
                                      Start Progress
                                    </button>
                                  )}

                                  {bug.status !== "fixed" && (
                                    <button
                                      onClick={() => updateStatus(bug._id, "fixed")}
                                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm shadow-sm"
                                    >
                                      Mark Fixed ✓
                                    </button>
                                  )}

                                  {bug.status === "fixed" && (
                                    <span className="px-5 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-sm border border-green-300">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div>
              {completedBugs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-green-300">
                  <p className="text-slate-600 text-lg font-semibold">No completed bugs yet. Start fixing bugs to build your history! 💪</p>
                </div>
              ) : (
                <>
                  {/* History Stats */}
                  <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-green-500">
                    <p className="text-slate-600 text-sm font-semibold">Bugs Fixed</p>
                    <p className="text-3xl font-bold text-green-600">{completedBugs.length}</p>
                  </div>

                  {/* Completed Bugs */}
                  <div className="grid gap-4">
                    {completedBugs.map((bug) => (
                      <div
                        key={bug._id}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition bg-gradient-to-r from-green-50 to-white"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800">{bug.title}</h3>
                            <p className="text-slate-600 text-sm mt-1">{bug.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <StatusBadge status={bug.status} />
                            {bug.priority && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(bug.priority)}`}>
                                {bug.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Project</p>
                            <p className="text-sm font-semibold text-slate-700">{bug.project?.projectName || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Created</p>
                            <p className="text-sm font-semibold text-slate-700">{formatDate(bug.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Fixed</p>
                            <p className="text-sm font-semibold text-slate-700">{formatDate(bug.updatedAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                            <p className="text-sm font-semibold text-green-600">✓ Completed</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
