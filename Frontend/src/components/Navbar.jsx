import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logout, getRole } from "../utils/auth";

const role = getRole();

const dashboardPath = role === "admin"? "/admin": role === "developer"? "/developer": role === "tester"? "/tester": "/viewer";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">
        Bug Tracker ({role})
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}
