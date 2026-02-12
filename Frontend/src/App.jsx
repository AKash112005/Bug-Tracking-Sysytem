import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/admindashboard";
import DeveloperDashboard from "./pages/developerdashboard";
import TesterDashboard from "./pages/testerdashboard";
import ViewerDashboard from "./pages/viewerdashboard";
import Login from "./pages/login";
import Navbar from "./components/Navbar";
import { isAuthenticated, getRole } from "./utils/auth";

function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) return <Navigate to="/" />;
  if (role && getRole() !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const location = useLocation();

  // Hide navbar on login page
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {/* Navbar renders only when logged in AND not on login page */}
      {isAuthenticated() && !hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/developer"
          element={
            <ProtectedRoute role="developer">
              <DeveloperDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tester"
          element={
            <ProtectedRoute role="tester">
              <TesterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/viewer"
          element={
            <ProtectedRoute role="viewer">
              <ViewerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
