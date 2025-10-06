import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // ✅ import RegisterPage
import Dashboard from "./pages/Dashboard";
import FoodPage from "./pages/FoodPage";
import EwastePage from "./pages/EwastePage";
import VolunteersPage from "./pages/VolunteersPage";
import DonationsPage from "./pages/DonationsPage";
import ImpactPage from "./pages/ImpactPage";
import LeaderboardPage from "./pages/LeaderboardPage";

// ✅ Protected Route (JS Version)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ✅ Main App Routes
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}

        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" replace />}
          />

          {/* Register */}
          <Route
            path="/register"
            element={!user ? <RegisterPage /> : <Navigate to="/" replace />}
          />

          {/* Dashboard & Protected Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/food"
            element={
              <ProtectedRoute>
                <FoodPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ewaste"
            element={
              <ProtectedRoute>
                <EwastePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteers"
            element={
              <ProtectedRoute>
                <VolunteersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <DonationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/impact"
            element={
              <ProtectedRoute>
                <ImpactPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// ✅ Wrap everything with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
