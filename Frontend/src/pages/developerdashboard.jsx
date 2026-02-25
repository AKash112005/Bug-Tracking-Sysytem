import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import BugWorkflowTracker from "../components/BugWorkflowTracker";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import DeveloperSidebar from "../components/DeveloperSidebar";

export default function DeveloperDashboard() {
  const [activeBugs, setActiveBugs] = useState([]);
  const [completedBugs, setCompletedBugs] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
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
      toast.error("Failed to fetch bugs");
    }
  };

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    fetchAssignedBugs();
    const interval = setInterval(fetchAssignedBugs, 5000);
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

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <DeveloperSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedBugs={completedBugs}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-10 pt-24 ml-64">
        <div className="max-w-6xl">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Welcome, {user?.name} 👋
            </h1>
            <p className="text-slate-600">
              Track your assigned bugs and manage progress efficiently
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-3 font-semibold transition ${
                activeTab === "active"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500"
              }`}
            >
              Active Bugs ({activeBugs.length})
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 font-semibold transition ${
                activeTab === "history"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-slate-500"
              }`}
            >
              Completed ({completedBugs.length})
            </button>
          </div>

          {/* ACTIVE BUGS */}
          {activeTab === "active" && (
            <>
              {activeBugs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-slate-600 text-lg font-semibold">
                    No assigned bugs. Great work! 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {activeBugs.map((bug) => (
                    <div
                      key={bug._id}
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                    >
                      {/* Title */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">
                            {bug.title}
                          </h3>
                          <p className="text-slate-600 mt-1">
                            {bug.description}
                          </p>
                        </div>

                        <StatusBadge status={bug.status} />
                      </div>

                      {/* 🚆 Workflow Tracker */}
                      <BugWorkflowTracker status={bug.status} />

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-slate-500">Project</p>
                          <p className="font-semibold">
                            {bug.project?.projectName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Created</p>
                          <p className="font-semibold">
                            {formatDate(bug.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Created By</p>
                          <p className="font-semibold">
                            {bug.createdBy?.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 mt-6">
                        {bug.status !== "in-progress" && (
                          <button
                            onClick={() =>
                              updateStatus(bug._id, "in-progress")
                            }
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                          >
                            Start Progress
                          </button>
                        )}

                        {bug.status !== "fixed" && (
                          <button
                            onClick={() => updateStatus(bug._id, "fixed")}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Mark Fixed ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* HISTORY */}
          {activeTab === "history" && (
            <>
              {completedBugs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-slate-600 text-lg font-semibold">
                    No completed bugs yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {completedBugs.map((bug) => (
                    <div
                      key={bug._id}
                      className="bg-white rounded-xl shadow-md p-6"
                    >
                      <h3 className="text-lg font-bold text-slate-800">
                        {bug.title}
                      </h3>
                      <p className="text-slate-600 mt-1">
                        {bug.description}
                      </p>

                      {/* Workflow Tracker */}
                      <BugWorkflowTracker status={bug.status} />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-slate-500">Project</p>
                          <p className="font-semibold">
                            {bug.project?.projectName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Created</p>
                          <p className="font-semibold">
                            {formatDate(bug.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Fixed</p>
                          <p className="font-semibold">
                            {formatDate(bug.updatedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-semibold text-green-600">
                            Completed
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}