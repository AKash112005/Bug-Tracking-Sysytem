import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import DashboardStats from "../components/DashboardStats";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import AdminSidebar from "../components/AdminSidebar";
import { Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const user = getUser();

  const [activeTab, setActiveTab] = useState("dashboard");

  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedDev, setSelectedDev] = useState({});
  const [selectedProject, setSelectedProject] = useState({});
  const [filter, setFilter] = useState("all");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer",
  });

  const [newProject, setNewProject] = useState({
    projectId: "",
    projectName: "",
    description: "",
  });

  /* ================= FETCH FUNCTIONS ================= */

  const fetchBugs = async () => {
    const res = await api.get("/bugs");
    setBugs(res.data);
  };

  const fetchDevelopers = async () => {
    const res = await api.get("/users?role=developer");
    setDevelopers(res.data);
  };

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const fetchProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data);
  };

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    fetchBugs();
    fetchDevelopers();
    fetchUsers();
    fetchProjects();

    const interval = setInterval(() => {
      fetchBugs();
      fetchProjects();
    }, 5000); // refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  /* ================= USER CREATE ================= */

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("All fields required");
      return;
    }

    try {
      await api.post("/users", newUser);
      toast.success("User created");
      setNewUser({ name: "", email: "", password: "", role: "developer" });
      fetchUsers();
      fetchDevelopers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  /* ================= PROJECT CREATE ================= */

  const createProject = async () => {
    if (!newProject.projectId || !newProject.projectName) {
      toast.error("Project ID & Name required");
      return;
    }

    try {
      await api.post("/projects", newProject);
      toast.success("Project created");
      setNewProject({ projectId: "", projectName: "", description: "" });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  /* ================= ASSIGN BUG ================= */

  const assignBug = async (bugId) => {
    const developerId = selectedDev[bugId];
    const projectId = selectedProject[bugId];

    if (!developerId) {
      toast.error("Select developer");
      return;
    }

    try {
      await api.post("/bugs/assign", {
        bugId,
        developerId,
        projectId,
      });

      toast.success("Bug assigned");
      fetchBugs();
    } catch {
      toast.error("Assign failed");
    }
  };

  /* ================= DELETE BUG ================= */

  const deleteBug = async (bugId) => {
    if (!window.confirm("Delete this bug?")) return;

    try {
      await api.delete(`/bugs/${bugId}`);
      toast.success("Bug deleted");
      fetchBugs();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredBugs =
    filter === "all"
      ? bugs
      : bugs.filter((bug) => bug.status === filter);

  /* ================= RETURN ================= */

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 ml-64 p-10 pt-24">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          Welcome, {user?.name} 👋
        </h1>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <DashboardStats bugs={bugs} />
        )}

        {/* ================= USERS ================= */}
        {activeTab === "users" && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New User</h2>

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
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded"
              >
                Create User
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Existing Users</h2>

              {users.map((u) => (
                <div
                  key={u._id}
                  className="border p-3 rounded mb-2 flex justify-between"
                >
                  <span>
                    {u.name} ({u.role})
                  </span>
                  <span className="text-slate-500">{u.email}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= PROJECTS ================= */}
        {activeTab === "projects" && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Create Project</h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="border p-2 rounded"
                  placeholder="Project ID"
                  value={newProject.projectId}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      projectId: e.target.value,
                    })
                  }
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Project Name"
                  value={newProject.projectName}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      projectName: e.target.value,
                    })
                  }
                />
                <input
                  className="border p-2 rounded col-span-2"
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <button
                onClick={createProject}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded"
              >
                Create Project
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">
                Existing Projects
              </h2>

              {projects.map((p) => (
                <div key={p._id} className="border p-3 rounded mb-2">
                  <h3 className="font-semibold">{p.projectName}</h3>
                  <p className="text-sm text-slate-500">
                    ID: {p.projectId}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= BUG REPORTS ================= */}
        {activeTab === "bugs" && (
          <div className="grid gap-6">
            {filteredBugs.map((bug) => (
              <div
                key={bug._id}
                className="bg-white p-6 rounded-xl shadow relative"
              >
                <button
                  onClick={() => deleteBug(bug._id)}
                  className="absolute top-4 right-4 p-1 rounded-full text-red-500 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex justify-between">
                  <h2 className="text-xl font-semibold">{bug.title}</h2>
                  <StatusBadge status={bug.status} />
                </div>

                <p className="text-slate-600 mt-2">
                  {bug.description}
                </p>

                {/* Assign Developer */}
                <div className="flex gap-3 mt-4">
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
                      <option key={dev._id} value={dev._id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>

                  {/* Assign Project */}
                  <select
                    className="border rounded px-3 py-2"
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        [bug._id]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => assignBug(bug._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
