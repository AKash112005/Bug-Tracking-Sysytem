import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function ViewerDashboard() {
  const [bugs, setBugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filteredBugs, setFilteredBugs] = useState([]);

  useEffect(() => {
    fetchBugs();
  }, []);

  useEffect(() => {
    let filtered = bugs.filter((bug) =>
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting logic
    if (sortBy === "priority-high") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      filtered.sort((a, b) => (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999));
    } else if (sortBy === "status") {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredBugs(filtered);
  }, [bugs, searchTerm, sortBy]);

  const fetchBugs = async () => {
    const res = await api.get("/bugs");
    setBugs(res.data);
  };

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

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-10 pt-24">
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Viewer Dashboard
          </h1>
          <p className="text-slate-600 mb-8">Track and view all reported bugs</p>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm font-semibold">Total Bugs</p>
            <p className="text-3xl font-bold text-slate-800">{bugs.length}</p>
          </div>

          {/* Search & Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Bugs
                </label>
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                  <option value="latest">Latest First</option>
                  <option value="priority-high">Priority (High to Low)</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bugs List */}
          {filteredBugs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-slate-500 text-lg">
                {bugs.length === 0 ? "No bugs reported yet." : "No bugs match your search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBugs.map((bug) => (
                <div
                  key={bug._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-slate-200 hover:border-blue-300"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-800 mb-2">
                        {bug.title}
                      </h2>
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Created By</p>
                      <p className="text-sm text-slate-700 font-medium">{bug.createdBy?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Assigned To</p>
                      <p className="text-sm text-slate-700 font-medium">{bug.assignedTo?.email || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Created</p>
                      <p className="text-sm text-slate-700 font-medium">{formatDate(bug.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Updated</p>
                      <p className="text-sm text-slate-700 font-medium">{formatDate(bug.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Counter */}
          {filteredBugs.length > 0 && (
            <p className="text-slate-600 text-sm mt-6 text-center">
              Showing {filteredBugs.length} of {bugs.length} bugs
            </p>
          )}
        </div>
      </div>
    </>
  );
}
