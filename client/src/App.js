import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import DashboardPage from "./pages/DashboardPage";
import AdminPanel from "./pages/AdminPanel";
import History from "./pages/History";
import "./index.css";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/home" />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/home" />}
      />
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/analyze"
        element={user ? <Analyze /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard-overview"
        element={user ? <DashboardPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={
          user?.role === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/dashboard-overview" />
          )
        }
      />
      <Route
        path="/history"
        element={user ? <History /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/register"} />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
