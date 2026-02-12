import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function ViewerDashboard() {
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    const res = await api.get("/bugs");
    setBugs(res.data);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-10 pt-24">

        <h1 className="text-3xl font-bold text-slate-700 mb-6">
          Viewer Dashboard
        </h1>

        {bugs.length === 0 ? (
          <p className="text-slate-500">No bugs found.</p>
        ) : (
          <div className="grid gap-6">
            {bugs.map((bug) => (
              <div
                key={bug._id}
                className="bg-white p-6 rounded-xl shadow"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{bug.title}</h2>
                  <StatusBadge status={bug.status} />
                </div>

                <p className="text-slate-600 mt-2">{bug.description}</p>

                <p className="text-sm text-slate-400 mt-2">
                  Created by: {bug.createdBy?.email || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
