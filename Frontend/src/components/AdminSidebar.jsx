import { LayoutDashboard, Users, Bug, Folder } from "lucide-react";

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "users", label: "Add Users", icon: <Users size={18} /> },
    { id: "bugs", label: "Bug Reports", icon: <Bug size={18} /> },
    { id: "projects", label: "Projects", icon: <Folder size={18} /> },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen p-6 fixed left-0 top-0 pt-24">
      <h2 className="text-lg font-bold text-indigo-600 mb-6">
        Admin Panel
      </h2>

      <div className="flex flex-col gap-3">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded text-left ${
              activeTab === item.id
                ? "bg-indigo-600 text-white"
                : "hover:bg-indigo-50"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
