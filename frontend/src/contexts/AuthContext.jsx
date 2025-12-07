// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // always { ...userObj, token }
  const [loading, setLoading] = useState(true);

  // ============================
  // Load token + fetch current user
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    api
      .get("/auth/me")
      .then((res) => {
        const userData = res.data?.user ?? res.data;

        if (!userData?._id) {
          // backend failed or returned malformed user
          throw new Error("Invalid user data");
        }

        setUser({ ...userData, token });
      })
      .catch((err) => {
        console.error("Auth auto-load failed:", err);
        logout(); // force logout to prevent token mismatch
      })
      .finally(() => setLoading(false));
  }, []);

  // ============================
  // REGISTER
  // ============================
  const signUp = async (full_name, email, password, role) => {
    const res = await api.post("/auth/register", {
      full_name: full_name.trim(),
      email: email.trim(),
      password,
      role,
    });

    const token = res.data?.token;
    const userObj = res.data?.user ?? res.data;

    localStorage.setItem("token", token);
    setAuthToken(token);

    setUser({ ...userObj, token });

    return userObj;
  };

  // ============================
  // LOGIN
  // ============================
  const signIn = async (email, password) => {
    const res = await api.post("/auth/login", {
      email: email.trim(),
      password,
    });

    const token = res.data?.token;
    const userObj = res.data?.user ?? res.data;

    localStorage.setItem("token", token);
    setAuthToken(token);

    setUser({ ...userObj, token });

    return userObj;
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
