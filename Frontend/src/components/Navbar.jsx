import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully ✅");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-700 tracking-wide">
          Bug Tracker
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 transition duration-300 text-white px-5 py-2 rounded-lg shadow-md font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
