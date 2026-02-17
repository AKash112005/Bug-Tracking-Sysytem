import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import DashboardStats from "../components/DashboardStats";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminDashboard() {
  const user = getUser();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState({});
  const [filter, setFilter] = useState("all");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer",
  });

  useEffect(() => {
    fetchBugs();
    fetchDevelopers();
  }, []);

  const fetchBugs = async () => {
    const res = await api.get("/bugs");
    setBugs(res.data);
  };

  const fetchDevelopers = async () => {
    const res = await api.get("/users?role=developer");
    setDevelopers(res.data);
  };

  const createUser = async () => {
    const { name, email, password, role } = newUser;

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await api.post("/users", { name, email, password, role });
      toast.success("User created successfully");

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "developer",
      });

      fetchDevelopers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const assignBug = async (bugId) => {
    const developerId = selectedDev[bugId];

    if (!developerId) {
      toast.error("Select a developer");
      return;
    }

    try {
      await api.post("/bugs/assign", { bugId, developerId });
      toast.success("Bug assigned");
      fetchBugs();
    } catch {
      toast.error("Assign failed");
    }
  };

  const filteredBugs =
    filter === "all"
      ? bugs
      : bugs.filter((bug) => bug.status === filter);

  return (
    <div className="flex bg-slate-100 min-h-screen">

      {/* 🔵 Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🔵 Main Content */}
      <div className="flex-1 ml-64 p-10 pt-24">

        {/* Welcome Section */}
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-slate-500 mb-8">
          Manage bugs and users efficiently.
        </p>

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === "dashboard" && (
          <>
            <DashboardStats bugs={bugs} />
          </>
        )}

        {/* ================= USERS TAB ================= */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Create New User
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />

              <input
                className="border p-2 rounded"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />

              <input
                type="password"
                className="border p-2 rounded"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />

              <select
                className="border p-2 rounded"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="developer">Developer</option>
                <option value="tester">Tester</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <button
              onClick={createUser}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Create User
            </button>
          </div>
        )}

        {/* ================= BUGS TAB ================= */}
        {activeTab === "bugs" && (
          <>
            <div className="flex gap-3 my-8">
              {["all", "open", "assigned", "in-progress", "fixed"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded capitalize ${
                      filter === status
                        ? "bg-indigo-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            <div className="grid gap-6">
              {filteredBugs.map((bug) => (
                <div
                  key={bug._id}
                  className="bg-white p-6 rounded-xl shadow"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {bug.title}
                    </h2>
                    <StatusBadge status={bug.status} />
                  </div>

                  <p className="text-slate-600 mt-2">
                    {bug.description}
                  </p>

                  <div className="flex gap-4 mt-4">
                    <select
                      className="border rounded px-3 py-2"
                      onChange={(e) =>
                        setSelectedDev({
                          ...selectedDev,
                          [bug._id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Developer</option>
                      {developers.map((dev) => (
                        <option
                          key={dev._id}
                          value={dev._id}
                        >
                          {dev.email}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => assignBug(bug._id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= PROJECTS TAB ================= */}
        {activeTab === "projects" && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Project Information
            </h2>
            <p><strong>Project ID:</strong> BUG-TRACKER-001</p>
            <p><strong>Status:</strong> Active</p>
          </div>
        )}

      </div>
    </div>
  );
}
