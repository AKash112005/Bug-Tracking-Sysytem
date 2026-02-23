import { CheckCircle, Zap } from "lucide-react";

export default function DeveloperSidebar({ activeTab, setActiveTab, completedBugs }) {
  return (
    <div className="w-64 bg-white shadow-lg min-h-screen p-6 fixed left-0 top-0 pt-24 overflow-y-auto">
      <h2 className="text-lg font-bold text-green-600 mb-6">
        Developer Panel
      </h2>

      <div className="flex flex-col gap-3 mb-8">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-3 px-4 py-2 rounded text-left font-semibold transition ${
            activeTab === "active"
              ? "bg-green-600 text-white"
              : "bg-slate-50 text-slate-700 hover:bg-green-50"
          }`}
        >
          <Zap size={18} />
          Active Bugs
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-3 px-4 py-2 rounded text-left font-semibold transition ${
            activeTab === "history"
              ? "bg-green-600 text-white"
              : "bg-slate-50 text-slate-700 hover:bg-green-50"
          }`}
        >
          <CheckCircle size={18} />
          Bug History
        </button>
      </div>

      {/* Completed Bugs History */}
      {activeTab === "history" && (
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
            Completed Bugs
          </h3>

          {completedBugs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No completed bugs yet.</p>
          ) : (
            <div className="space-y-3">
              {completedBugs.map((bug) => (
                <div
                  key={bug._id}
                  className="bg-white p-3 rounded border border-green-200 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {bug.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {bug.project?.projectName || "N/A"}
                      </p>
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        ✓ Fixed
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              <span className="font-bold text-green-600">{completedBugs.length}</span> bugs completed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
