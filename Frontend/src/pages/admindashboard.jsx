import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import DashboardStats from "../components/DashboardStats";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import AdminSidebar from "../components/AdminSidebar";
import { Trash2, Edit2, Check, X, Lock, Plus, ChevronDown, ChevronUp } from "lucide-react";

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
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectValue, setEditProjectValue] = useState("");

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New bug reported: Login page issue", time: "2 mins ago", type: "bug" },
    { id: 2, message: "User Demo assigned 3 bugs", time: "15 mins ago", type: "assign" },
    { id: 3, message: "Project Hospital Management created", time: "1 hour ago", type: "project" },
    { id: 4, message: "Bug #45 marked as fixed", time: "2 hours ago", type: "fixed" },
    { id: 5, message: "New developer registered", time: "3 hours ago", type: "user" },
  ]);

  // Mock Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    bugAssignmentNotifications: true,
    dailyReport: false,
    themeMode: "light",
    maxBugsPerPage: 10,
  });

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

  // Team management state
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectTeams, setProjectTeams] = useState({});
  const [teamMemberForm, setTeamMemberForm] = useState({});
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = useState({});

  const TEAM_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Database Administrator",
    "UI Designer",
    "QA Lead",
    "DevOps Engineer",
    "Project Manager",
  ];

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

  /* ================= ASSIGN BUG (REMOVED - AUTO-ASSIGN) ================= */
  // Bug assignment is now automatic based on project teams

  /* ================= UPDATE PROJECT ================= */

  const updateBugProject = async (bugId, projectId) => {
    try {
      await api.post("/bugs/assign-project", {
        bugId,
        projectId,
      });
      toast.success("Project updated");
      setEditingProject(null);
      fetchBugs();
    } catch {
      toast.error("Update failed");
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

  /* ================= DELETE USER ================= */

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
      fetchDevelopers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= RESET USER PASSWORD ================= */

  const resetPassword = async (userId) => {
    const newPassword = prompt("Enter new password for this user:");
    if (!newPassword || newPassword.trim() === "") {
      toast.error("Password cannot be empty");
      return;
    }

    try {
      await api.put(`/users/${userId}/password`, { password: newPassword });
      toast.success("Password reset successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  /* ================= TEAM MANAGEMENT FUNCTIONS ================= */

  const toggleProjectTeam = async (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      try {
        const res = await api.get(`/projects/${projectId}/team`);
        setProjectTeams({ ...projectTeams, [projectId]: res.data });
        setExpandedProject(projectId);
      } catch (err) {
        toast.error("Failed to load team members");
      }
    }
  };

  const addTeamMember = async (projectId) => {
    const userId = teamMemberForm[projectId]?.userId;
    const role = selectedTeamMemberRole[projectId];

    if (!userId || !role) {
      toast.error("Please select both developer and role");
      return;
    }

    try {
      const res = await api.post(`/projects/${projectId}/team`, {
        userId,
        role,
      });

      setProjectTeams({
        ...projectTeams,
        [projectId]: res.data.team,
      });

      setTeamMemberForm({
        ...teamMemberForm,
        [projectId]: { userId: "", developerName: "" },
      });
      setSelectedTeamMemberRole({
        ...selectedTeamMemberRole,
        [projectId]: "",
      });

      toast.success("Team member added successfully");
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add team member");
    }
  };

  const removeTeamMember = async (projectId, userId) => {
    if (!window.confirm("Remove this team member from the project?")) return;

    try {
      const res = await api.delete(`/projects/${projectId}/team/${userId}`);
      setProjectTeams({
        ...projectTeams,
        [projectId]: res.data.team,
      });
      toast.success("Team member removed successfully");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to remove team member");
    }
  };

  const updateTeamMemberRole = async (projectId, userId, newRole) => {
    try {
      const res = await api.put(`/projects/${projectId}/team/${userId}`, {
        role: newRole,
      });
      setProjectTeams({
        ...projectTeams,
        [projectId]: res.data.team,
      });
      toast.success("Role updated successfully");
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const filteredBugs =
    filter === "all"
      ? bugs
      : bugs.filter((bug) => bug.status === filter);

  /* ================= RETURN ================= */

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 ml-64 p-10 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Welcome, {user?.name} !
            </h1>
            <p className="text-slate-600 text-sm mt-2">System Administration Dashboard</p>
          </div>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <DashboardStats bugs={bugs} />
        )}

        {/* ================= USERS ================= */}
        {activeTab === "users" && (
          <>
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
                <p className="text-slate-600 text-sm mt-1">Create a new user account</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
                <input
                  className="border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Email Address"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  className="border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <select
                  className="border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 shadow-lg"
              >
                Create User
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Existing Users</h2>
                <p className="text-slate-600 text-sm mt-1">{users.length} total users</p>
              </div>

              {users.map((u) => (
                <div
                  key={u._id}
                  className="border p-4 rounded mb-3 flex justify-between items-center hover:bg-slate-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    <span className="inline-block mt-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resetPassword(u._id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                      title="Reset Password"
                    >
                      <Lock size={16} />
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= PROJECTS ================= */}
        {activeTab === "projects" && (
          <>
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Create Project</h2>
                <p className="text-slate-600 text-sm mt-1">Add a new project to the system</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="border border-slate-300 p-3 rounded-lg col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 shadow-lg"
              >
                Create Project
              </button>
            </div>

            {/* Projects with Team Management */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Projects & Team Management</h2>
                <p className="text-slate-600 text-sm mt-1">{projects.length} total projects</p>
              </div>

              <div className="space-y-4">
                {projects.map((p) => (
                  <div key={p._id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    {/* Project Header - Clickable to expand */}
                    <div
                      onClick={() => toggleProjectTeam(p._id)}
                      className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{p.projectName}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          ID: {p.projectId} • Team: {p.team?.length || 0} members
                        </p>
                        {p.description && (
                          <p className="text-sm text-slate-500 mt-2">{p.description}</p>
                        )}
                      </div>
                      <button className="p-2 rounded-lg hover:bg-white transition text-slate-600">
                        {expandedProject === p._id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>

                    {/* Team Management Section - Expands when clicked */}
                    {expandedProject === p._id && (
                      <div className="border-t border-slate-200 p-4 bg-slate-50">
                        {/* Add Team Member Section */}
                        <div className="mb-6 p-4 bg-white rounded-lg border border-indigo-200">
                          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" />
                            Add Team Member
                          </h4>

                          <div className="grid grid-cols-3 gap-3">
                            <select
                              className="border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={teamMemberForm[p._id]?.userId || ""}
                              onChange={(e) => {
                                const selected = users.find(u => u._id === e.target.value);
                                setTeamMemberForm({
                                  ...teamMemberForm,
                                  [p._id]: {
                                    userId: e.target.value,
                                    developerName: selected?.name || "",
                                  },
                                });
                              }}
                            >
                              <option value="">Select Developer</option>
                              {users
                                .filter(u => !p.team?.some(t => t.userId._id === u._id))
                                .map((u) => (
                                  <option key={u._id} value={u._id}>
                                    {u.name} ({u.role})
                                  </option>
                                ))}
                            </select>

                            <select
                              className="border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={selectedTeamMemberRole[p._id] || ""}
                              onChange={(e) =>
                                setSelectedTeamMemberRole({
                                  ...selectedTeamMemberRole,
                                  [p._id]: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Role</option>
                              {TEAM_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => addTeamMember(p._id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                            >
                              Add Member
                            </button>
                          </div>
                        </div>

                        {/* Team Members List */}
                        <div>
                          <h4 className="font-bold text-slate-900 mb-3">Team Members ({p.team?.length || 0})</h4>

                          {p.team && p.team.length > 0 ? (
                            <div className="space-y-2">
                              {p.team.map((member) => (
                                <div
                                  key={member.userId._id}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition"
                                >
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900">{member.userId.name}</p>
                                    <p className="text-xs text-slate-500">{member.userId.email}</p>
                                  </div>

                                  <select
                                    className="mx-3 border border-slate-300 p-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={member.role}
                                    onChange={(e) =>
                                      updateTeamMemberRole(p._id, member.userId._id, e.target.value)
                                    }
                                  >
                                    {TEAM_ROLES.map((role) => (
                                      <option key={role} value={role}>
                                        {role}
                                      </option>
                                    ))}
                                  </select>

                                  <span className="text-xs text-slate-500 mr-3 whitespace-nowrap">
                                    Added: {new Date(member.addedDate).toLocaleDateString()}
                                  </span>

                                  <button
                                    onClick={() => removeTeamMember(p._id, member.userId._id)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                                    title="Remove Member"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-white rounded-lg border border-slate-200 text-center">
                              <p className="text-slate-500 text-sm">No team members assigned yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= BUG REPORTS ================= */}
        {activeTab === "bugs" && (
          <>
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === "all"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-300"
                }`}
              >
                All Bugs
              </button>
              <button
                onClick={() => setFilter("open")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === "open"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-300"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilter("assigned")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === "assigned"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-300"
                }`}
              >
                Assigned
              </button>
            </div>

            <div className="grid gap-6">
              {filteredBugs.filter(bug => bug.status !== "fixed").map((bug) => (
                <div
                  key={bug._id}
                  className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900">{bug.title}</h2>
                      <p className="text-slate-600 text-sm mt-1">{bug.description}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <StatusBadge status={bug.status} />
                      <button
                        onClick={() => deleteBug(bug._id)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Display Project (Auto-selected from Tester) */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                    <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Project</p>
                      {editingProject === bug._id ? (
                        <select
                          className="w-full border rounded px-2 py-1.5 mt-1 text-sm"
                          value={editProjectValue}
                          onChange={(e) => setEditProjectValue(e.target.value)}
                        >
                          <option value="">Select Project</option>
                          {projects.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.projectName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-indigo-600 mt-1">
                          {bug.project?.projectName || "Not assigned"}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingProject === bug._id ? (
                        <>
                          <button
                            onClick={() => updateBugProject(bug._id, editProjectValue)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingProject(null)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingProject(bug._id);
                            setEditProjectValue(bug.project?._id || "");
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                          title="Edit Project"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Display Assigned Developer */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Auto-Assigned To</p>
                    <p className="text-sm font-semibold text-green-700 mt-1">
                      {bug.assignedTo?.name || "Unassigned"} {bug.assignedToTeam && "(Team)"}
                    </p>
                  </div>
              </div>
            ))}
            </div>

            {/* Fixed Bugs Section */}
            {filteredBugs.filter(bug => bug.status === "fixed").length > 0 && (
              <div className="mt-10">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Fixed Bugs</h3>
                  <p className="text-slate-600 text-sm mt-1">Completed and closed issues</p>
                </div>

                <div className="grid gap-6">
                  {filteredBugs.filter(bug => bug.status === "fixed").map((bug) => (
                    <div
                      key={bug._id}
                      className="bg-green-50 p-6 rounded-xl shadow-lg border-2 border-green-200 hover:shadow-xl transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-slate-900">{bug.title}</h2>
                          <p className="text-slate-600 text-sm mt-1">{bug.description}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <StatusBadge status={bug.status} />
                          <button
                            onClick={() => deleteBug(bug._id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-100 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Display Project Info */}
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Project</p>
                            <p className="text-sm font-semibold text-green-700 mt-1">
                              {bug.project?.projectName || "Not assigned"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Assigned To</p>
                            <p className="text-sm font-semibold text-green-700 mt-1">
                              {bug.assignedTo?.name || "Unassigned"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= NOTIFICATIONS ================= */}
        {activeTab === "notifications" && (
          <>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
                <p className="text-slate-600 text-sm mt-1">System alerts and activities</p>
              </div>

              <div className="flex gap-3 mb-6">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                  All
                </button>
                <button className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:border-indigo-300 transition">
                  Unread
                </button>
                <button className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:border-indigo-300 transition">
                  Marked
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="border border-slate-200 p-4 rounded-lg hover:bg-slate-50 transition flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{notif.message}</p>
                      <p className="text-slate-500 text-xs mt-1">{notif.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                      notif.type === "bug" ? "bg-red-100 text-red-700" :
                      notif.type === "assign" ? "bg-blue-100 text-blue-700" :
                      notif.type === "project" ? "bg-purple-100 text-purple-700" :
                      notif.type === "fixed" ? "bg-green-100 text-green-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                    </span>
                  </div>
                ))}
              </div>

              <button className="mt-6 text-red-600 hover:text-red-700 font-semibold text-sm">
                Clear All Notifications
              </button>
            </div>
          </>
        )}

        {/* ================= SETTINGS ================= */}
        {activeTab === "settings" && (
          <>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
                <p className="text-slate-600 text-sm mt-1">Configure your dashboard and notification preferences</p>
              </div>

              <div className="space-y-6">
                {/* Notification Settings */}
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Email Notifications</p>
                        <p className="text-xs text-slate-500">Receive updates via email</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={settings.systemAlerts}
                        onChange={(e) => setSettings({...settings, systemAlerts: e.target.checked})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">System Alerts</p>
                        <p className="text-xs text-slate-500">Critical system notifications</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={settings.bugAssignmentNotifications}
                        onChange={(e) => setSettings({...settings, bugAssignmentNotifications: e.target.checked})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Bug Assignment Alerts</p>
                        <p className="text-xs text-slate-500">Notify when bugs are assigned</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={settings.dailyReport}
                        onChange={(e) => setSettings({...settings, dailyReport: e.target.checked})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Daily Report Summary</p>
                        <p className="text-xs text-slate-500">Get daily summary of activities</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Display Settings</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Theme Mode</label>
                      <select 
                        value={settings.themeMode}
                        onChange={(e) => setSettings({...settings, themeMode: e.target.value})}
                        className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Bugs Per Page</label>
                      <input 
                        type="number" 
                        value={settings.maxBugsPerPage}
                        onChange={(e) => setSettings({...settings, maxBugsPerPage: parseInt(e.target.value)})}
                        min="5"
                        max="50"
                        className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">System Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                      <p className="text-xs text-slate-500 font-semibold">Total Users</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
                    </div>
                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                      <p className="text-xs text-slate-500 font-semibold">Total Bugs</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{bugs.length}</p>
                    </div>
                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                      <p className="text-xs text-slate-500 font-semibold">Active Projects</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</p>
                    </div>
                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                      <p className="text-xs text-slate-500 font-semibold">Total Developers</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{developers.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => {
                toast.success("Settings saved successfully!");
              }} className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 shadow-lg">
                Save Settings
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
