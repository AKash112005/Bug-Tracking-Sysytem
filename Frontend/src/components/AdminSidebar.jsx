import { LayoutDashboard, Users, Bug, Folder, Bell, Settings } from "lucide-react";

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "users", label: "User Management", icon: <Users size={20} /> },
    { id: "bugs", label: "Bug Reports", icon: <Bug size={20} /> },
    { id: "projects", label: "Projects", icon: <Folder size={20} /> },
  ];

  return (
    <div className="w-64 bg-white min-h-screen p-6 fixed left-0 top-0 pt-24 shadow-2xl border-r-2 border-indigo-200">
      {/* Panel Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Admin
          </div>
        </div>
        <p className="text-xs text-slate-500">System Management</p>
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-transparent mt-3 rounded" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 mb-8">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition duration-200 border-2 ${
              activeTab === item.id
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-xl shadow-purple-500/60 scale-105 border-purple-400"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-2 border-slate-200 hover:border-indigo-300"
            }`}
          >
            <span className={activeTab === item.id ? "text-purple-100" : "text-slate-600"}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t-2 border-slate-200 my-6" />

      {/* Additional Options */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition duration-200 border-2 ${
            activeTab === "notifications"
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-xl shadow-purple-500/60 scale-105 border-purple-400"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-2 border-slate-200 hover:border-indigo-300"
          }`}
        >
          <span className={activeTab === "notifications" ? "text-purple-100" : "text-slate-600"}>
            <Bell size={18} />
          </span>
          <span>Notifications</span>
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition duration-200 border-2 ${
            activeTab === "settings"
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-xl shadow-purple-500/60 scale-105 border-purple-400"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-2 border-slate-200 hover:border-indigo-300"
          }`}
        >
          <span className={activeTab === "settings" ? "text-purple-100" : "text-slate-600"}>
            <Settings size={18} />
          </span>
          <span>Settings</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 right-6 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border-2 border-indigo-300">
        <p className="font-semibold text-slate-800">Quick Stats</p>
        <p className="mt-1 text-xs">Monitor your system in real-time</p>
      </div>
    </div>
  );
}
