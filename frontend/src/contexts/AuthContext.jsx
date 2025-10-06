import { createContext, useContext, useState, useEffect } from "react";

// Create Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial load, check if user token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // 🔹 Sign In
  async function signIn(email, password) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();

      localStorage.setItem("token", data.token);
      await fetchUserProfile(data.token);
    } catch (err) {
      console.error("Login failed:", err.message);
      throw err;
    }
  }

  // 🔹 Sign Up
  async function signUp(full_name, email, password, role = "student") {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password, role }),
      });

      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();

      localStorage.setItem("token", data.token);
      await fetchUserProfile(data.token);
    } catch (err) {
      console.error("Signup failed:", err.message);
      throw err;
    }
  }

  // 🔹 Fetch Current User Profile
  async function fetchUserProfile(token) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Invalid token or session expired");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user:", err.message);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Sign Out
  function signOut() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // Optional: Mock Sign-In for development (no backend needed)
  function mockSignIn(role = "student") {
    setUser({
      full_name: "Demo User",
      email: "demo@example.com",
      role,
      volunteer_points: 100,
    });
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, mockSignIn }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
