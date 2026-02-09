import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/admindashboard";
import DeveloperDashboard from "./pages/developerdashboard";
import TesterDashboard from "./pages/testerdashboard";
import Login from "./pages/login";
import { isAuthenticated, getRole } from "./utils/auth";



function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) return <Navigate to="/" />;
  if (getRole() !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
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
    </Routes>
  );
}
