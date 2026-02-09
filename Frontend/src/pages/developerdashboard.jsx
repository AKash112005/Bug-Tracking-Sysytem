import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

export default function DeveloperDashboard() {
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    fetchAssignedBugs();
  }, []);

  const fetchAssignedBugs = async () => {
    const res = await api.get("/bugs/assigned");
    setBugs(res.data);
  };

  const updateStatus = async (bugId, status) => {
    try {
      await api.put("/bugs/status", { bugId, status });
      toast.success(`Status updated to ${status}`);
      fetchAssignedBugs();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-10">
        <h1 className="text-3xl font-bold text-green-600 mb-6">
          Developer Dashboard
        </h1>

        {bugs.length === 0 ? (
          <p className="text-slate-500">No assigned bugs.</p>
        ) : (
          <div className="grid gap-6">
            {bugs.map((bug) => (
              <div key={bug._id} className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{bug.title}</h2>
                  <StatusBadge status={bug.status} />
                </div>

                <p className="text-slate-600 mt-2">{bug.description}</p>

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
                      onClick={() => updateStatus(bug._id, "fixed")}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Mark Fixed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
