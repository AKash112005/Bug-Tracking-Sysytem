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

  return (
    <>
      <Navbar />
      <DeveloperSidebar activeTab={activeTab} setActiveTab={setActiveTab} completedBugs={completedBugs} />

      <div className="min-h-screen bg-slate-100 p-10 pt-24 ml-64">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Welcome, {user?.name} 👋
        </h1>

        {/* Active Bugs Tab */}
        {activeTab === "active" && (
          <>
            {activeBugs.length === 0 ? (
              <p className="text-slate-500 mt-6">No assigned bugs. Great work! 🎉</p>
            ) : (
              Object.keys(groupedBugs).map((projectName) => (
                <div key={projectName} className="mb-10">
                  <div className="bg-indigo-600 text-white p-4 rounded-lg mb-4 shadow">
                    <h2 className="text-lg font-semibold">
                      {projectName}
                    </h2>
                    <p className="text-sm opacity-90">
                      Project ID:{" "}
                      {groupedBugs[projectName][0]?.project?.projectId || "N/A"}
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {groupedBugs[projectName].map((bug) => (
                      <div
                        key={bug._id}
                        className="bg-white p-6 rounded-xl shadow"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold">
                            {bug.title}
                          </h3>
                          <StatusBadge status={bug.status} />
                        </div>

                        <p className="text-slate-600 mt-2">
                          {bug.description}
                        </p>

                        <div className="flex gap-3 mt-4">
                          {bug.status !== "in-progress" && (
                            <button
                              onClick={() =>
                                updateStatus(bug._id, "in-progress")
                              }
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                            >
                              In Progress
                            </button>
                          )}

                          {bug.status !== "fixed" && (
                            <button
                              onClick={() =>
                                updateStatus(bug._id, "fixed")
                              }
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              Mark Fixed
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Bug Resolution History</h2>
            {completedBugs.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No completed bugs yet. Start fixing bugs to build your history! 💪</p>
            ) : (
              <div className="grid gap-4">
                {completedBugs.map((bug) => (
                  <div
                    key={bug._id}
                    className="bg-white p-6 rounded-xl shadow border-l-4 border-green-600 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {bug.title}
                      </h3>
                      <StatusBadge status={bug.status} />
                    </div>
                    <p className="text-slate-600 text-sm">{bug.description}</p>
                    <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                      <span className="font-semibold">{bug.project?.projectName || "N/A"}</span>
                      <span>✓ Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
