import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";

export default function DeveloperDashboard() {
  const [bugs, setBugs] = useState([]);
  const user = getUser();

  /* ================= FETCH BUGS ================= */
  const fetchAssignedBugs = async () => {
    try {
      const res = await api.get("/bugs/assigned");
      const activeBugs = res.data.filter(
        (bug) => bug.status !== "fixed"
      );
      setBugs(activeBugs);
    } catch (err) {
      console.log(err);
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
  const groupedBugs = bugs.reduce((acc, bug) => {
    const projectName = bug.project?.projectName || "Unassigned Project";
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(bug);
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-10 pt-24">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Welcome, {user?.name} 👋
        </h1>

        {bugs.length === 0 ? (
          <p className="text-slate-500">No assigned bugs.</p>
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
                          className="px-4 py-2 bg-yellow-500 text-white rounded"
                        >
                          In Progress
                        </button>
                      )}

                      {bug.status !== "fixed" && (
                        <button
                          onClick={() =>
                            updateStatus(bug._id, "fixed")
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded"
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
      </div>
    </>
  );
}
