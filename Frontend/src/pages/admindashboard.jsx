import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDev, setSelectedDev] = useState({});
  const [filter, setFilter] = useState("all");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer",
  });

  /* ---------------- FETCH FUNCTIONS ---------------- */

  const fetchBugs = async () => {
    const res = await api.get("/bugs");
    setBugs(res.data);
  };

  const fetchDevelopers = async () => {
    const res = await api.get("/users?role=developer");
    setDevelopers(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };
  const updateUserRole = async (userId, role) => {
  try {
    await api.put("/users/role", { userId, role });
    toast.success("Role updated");
    fetchUsers();
    fetchDevelopers();
  } catch {
    toast.error("Failed to update role");
  }
};


  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    fetchBugs();
    fetchDevelopers();
    fetchUsers();
  }, []);

  /* ---------------- ASSIGN BUG ---------------- */

  const assignBug = async (bugId) => {
    const developerId = selectedDev[bugId];

    if (!developerId) {
      toast.error("Please select a developer");
      return;
    }

    try {
      await api.post("/bugs/assign", { bugId, developerId });
      toast.success("Bug assigned successfully");
      fetchBugs();
    } catch {
      toast.error("Failed to assign bug");
    }
  };

  /* ---------------- CREATE USER ---------------- */

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

      fetchUsers();
      fetchDevelopers();
    } catch (err) {
      toast.error(err.response?.data?.message || "User creation failed");
    }
  };

  /* ---------------- FILTER BUGS ---------------- */

  const filteredBugs =
    filter === "all"
      ? bugs
      : bugs.filter((bug) => bug.status === filter);

  /* ---------------- UI ---------------- */

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-10">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">
          Admin Dashboard
        </h1>

        {/* ---------- CREATE USER ---------- */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="border p-2 rounded"
            />

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
              className="border p-2 rounded"
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

        {/* ---------- USERS LIST ---------- */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>

          {users.length === 0 ? (
            <p className="text-slate-500">No users found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUserRole(user._id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="tester">Tester</option>
                      <option value="viewer">Viewer</option>
                    </select>
                </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ---------- FILTERS ---------- */}
        <div className="flex gap-3 mb-8">
          {["all", "open", "assigned", "in-progress", "fixed"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded capitalize ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-white border text-slate-600"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* ---------- BUG LIST ---------- */}
        <div className="grid gap-6">
          {filteredBugs.length === 0 ? (
            <p className="text-slate-500">No bugs found.</p>
          ) : (
            filteredBugs.map((bug) => (
              <div
                key={bug._id}
                className="bg-white p-6 rounded-xl shadow"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{bug.title}</h2>
                  <StatusBadge status={bug.status} />
                </div>

                <p className="text-slate-600 mt-2">{bug.description}</p>

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
                      <option key={dev._id} value={dev._id}>
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
            ))
          )}
        </div>
      </div>
    </>
  );
}
